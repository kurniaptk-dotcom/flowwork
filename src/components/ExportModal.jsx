import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  FileCode,
  Printer,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  FolderKanban,
  Check,
  RefreshCw,
  Layers
} from 'lucide-react';
import { createActivityLog } from '../utils/activityHelper';

export const ExportModal = ({
  isOpen,
  onClose,
  workspaceName = 'FlowWork',
  tasks = [],
  columns = [],
  members = [],
  spaces = [],
  activeSpaceId = 'all',
  initialTab = 'export',
  onExportJSON,
  onExportCSV,
  onPrintReport,
  onImportTasks,
  onRestoreWorkspace
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [importMode, setImportMode] = useState('csv'); // 'csv' | 'json'

  // CSV Import State
  const [csvFile, setCsvFile] = useState(null);
  const [parsedCsvTasks, setParsedCsvTasks] = useState([]);
  const [selectedTargetSpace, setSelectedTargetSpace] = useState(
    activeSpaceId !== 'all' ? activeSpaceId : (spaces[0]?.id || '')
  );
  const [csvError, setCsvError] = useState('');

  // JSON Restore State
  const [jsonFile, setJsonFile] = useState(null);
  const [parsedJsonBackup, setParsedJsonBackup] = useState(null);
  const [restoreMode, setRestoreMode] = useState('full'); // 'full' | 'merge'
  const [jsonError, setJsonError] = useState('');

  const csvInputRef = useRef(null);
  const jsonInputRef = useRef(null);

  // Sync tab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setCsvFile(null);
      setParsedCsvTasks([]);
      setCsvError('');
      setJsonFile(null);
      setParsedJsonBackup(null);
      setJsonError('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // CSV Parsing function
  const handleCsvFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setCsvError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (!text) throw new Error('File CSV kosong');

        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          throw new Error('File CSV harus memiliki minimal 1 baris header dan 1 baris data');
        }

        // CSV row tokenizer considering quotes
        const parseRow = (row) => {
          const res = [];
          let inQuotes = false;
          let current = '';
          for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
              if (inQuotes && row[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              res.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          res.push(current.trim());
          return res;
        };

        const headers = parseRow(lines[0]).map((h) => h.toLowerCase().replace(/['"]/g, ''));
        const newTasks = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseRow(lines[i]);
          if (!values.some((v) => v.trim() !== '')) continue;

          const row = {};
          headers.forEach((h, idx) => {
            row[h] = values[idx] || '';
          });

          // Match field names (ID or EN)
          const title =
            row['judul'] ||
            row['title'] ||
            row['nama tugas'] ||
            row['task'] ||
            values[1] ||
            values[0] ||
            `Tugas Impor #${i}`;

          let statusRaw = (row['status'] || values[2] || 'todo').toLowerCase().replace(/\s+/g, '_');
          let status = 'todo';
          if (statusRaw.includes('progress') || statusRaw.includes('jalan') || statusRaw.includes('proses')) {
            status = 'in_progress';
          } else if (statusRaw.includes('review') || statusRaw.includes('qa') || statusRaw.includes('uji')) {
            status = 'review';
          } else if (statusRaw.includes('done') || statusRaw.includes('selesai')) {
            status = 'done';
          } else if (statusRaw.includes('backlog')) {
            status = 'backlog';
          }

          let priority = (row['prioritas'] || row['priority'] || values[3] || 'normal').toLowerCase();
          if (!['urgent', 'high', 'normal', 'low'].includes(priority)) {
            priority = 'normal';
          }

          const assignee = row['pic'] || row['assignee'] || row['penanggung jawab'] || values[4] || '';
          const dueDateRaw = row['tenggat waktu'] || row['due date'] || row['deadline'] || values[6] || '';
          const dueDate = dueDateRaw.match(/^\d{4}-\d{2}-\d{2}$/) ? dueDateRaw : '';
          const tagsRaw = row['tag'] || row['tags'] || values[7] || '';
          const tags = tagsRaw
            ? tagsRaw.split(/[;,|]/).map((t) => t.trim()).filter(Boolean)
            : ['csv-import'];

          newTasks.push({
            id: `task-csv-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
            projectId: selectedTargetSpace || spaces[0]?.id || 'mobile-app',
            title,
            description: row['deskripsi'] || row['description'] || 'Diimpor via CSV',
            status,
            priority,
            assignee,
            dueDate,
            tags,
            subtasks: [],
            activityLog: [
              createActivityLog('Tugas diimpor dari file CSV')
            ]
          });
        }

        if (newTasks.length === 0) {
          throw new Error('Tidak ada baris tugas valid yang dapat dibaca dari file CSV');
        }

        setParsedCsvTasks(newTasks);
      } catch (err) {
        console.error(err);
        setCsvError(err.message || 'Gagal memproses file CSV');
        setParsedCsvTasks([]);
      }
    };
    reader.readAsText(file);
  };

  // JSON Restore parsing
  const handleJsonFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setJsonFile(file);
    setJsonError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (!text) throw new Error('File JSON kosong');
        const data = JSON.parse(text);

        if (!data || typeof data !== 'object') {
          throw new Error('Format JSON tidak valid');
        }

        if (!Array.isArray(data.tasks)) {
          throw new Error('File JSON cadangan harus menyertakan array "tasks"');
        }

        setParsedJsonBackup(data);
      } catch (err) {
        console.error(err);
        setJsonError(err.message || 'Gagal membaca file JSON cadangan');
        setParsedJsonBackup(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImportCsv = () => {
    if (!parsedCsvTasks.length) return;
    // Map project ID if selected
    const tasksWithProject = parsedCsvTasks.map((t) => ({
      ...t,
      projectId: selectedTargetSpace || t.projectId
    }));

    if (onImportTasks) {
      onImportTasks(tasksWithProject);
    }
    onClose();
  };

  const handleConfirmRestoreJson = () => {
    if (!parsedJsonBackup) return;
    if (onRestoreWorkspace) {
      onRestoreWorkspace(parsedJsonBackup, restoreMode);
    }
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 540, padding: 0, animation: 'fadeIn 0.15s ease' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--flow-border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: activeTab === 'export' ? 'var(--flow-primary-light)' : 'rgba(16, 185, 129, 0.12)',
                color: activeTab === 'export' ? 'var(--flow-primary)' : 'var(--flow-accent-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {activeTab === 'export' ? <Download size={18} /> : <Upload size={18} />}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
                Pusat Data & Laporan Workspace
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                {workspaceName} • {tasks.length} total tugas
              </p>
            </div>
          </div>

          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--flow-border-subtle)',
            background: 'var(--flow-bg-elevated)',
            padding: '4px 20px 0 20px',
            gap: 10
          }}
        >
          <button
            type="button"
            className="tab-btn"
            style={{
              padding: '8px 14px',
              fontSize: '0.84rem',
              fontWeight: 600,
              borderRadius: '8px 8px 0 0',
              borderBottom: activeTab === 'export' ? '2px solid var(--flow-primary)' : '2px solid transparent',
              background: activeTab === 'export' ? 'var(--flow-bg-surface)' : 'transparent',
              color: activeTab === 'export' ? 'var(--flow-primary)' : 'var(--flow-text-muted)',
              gap: 6
            }}
            onClick={() => setActiveTab('export')}
          >
            <Download size={14} />
            <span>Ekspor & Cetak</span>
          </button>

          <button
            type="button"
            className="tab-btn"
            style={{
              padding: '8px 14px',
              fontSize: '0.84rem',
              fontWeight: 600,
              borderRadius: '8px 8px 0 0',
              borderBottom: activeTab === 'import' ? '2px solid var(--flow-accent-emerald)' : '2px solid transparent',
              background: activeTab === 'import' ? 'var(--flow-bg-surface)' : 'transparent',
              color: activeTab === 'import' ? 'var(--flow-accent-emerald)' : 'var(--flow-text-muted)',
              gap: 6
            }}
            onClick={() => setActiveTab('import')}
          >
            <Upload size={14} />
            <span>Impor & Pulihkan</span>
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '70vh', overflowY: 'auto' }}>
          {/* TAB 1: EKSPOR */}
          {activeTab === 'export' && (
            <>
              {/* CSV / Excel */}
              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  border: '1px solid var(--flow-border-subtle)',
                  background: 'var(--flow-bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => {
                  onExportCSV();
                  onClose();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: 'var(--flow-accent-emerald)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
                      Lembar Kerja CSV / Excel (.csv)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                      Format tabel siap buka di Microsoft Excel, Google Sheets, atau Numbers.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="tab-btn"
                  style={{ fontSize: '0.78rem', padding: '6px 12px', flexShrink: 0, background: 'var(--flow-bg-surface)' }}
                >
                  Unduh CSV
                </button>
              </div>

              {/* Print / PDF Summary */}
              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  border: '1px solid var(--flow-border-subtle)',
                  background: 'var(--flow-bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => {
                  onPrintReport();
                  onClose();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: 'var(--flow-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Printer size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
                      Cetak / Simpan Ringkasan Progres (PDF)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                      Laporan tugas dan progres rapi siap cetak atau disimpan ke format PDF untuk dosen, klien, atau evaluasi pribadi.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="tab-btn"
                  style={{ fontSize: '0.78rem', padding: '6px 12px', flexShrink: 0, background: 'var(--flow-bg-surface)' }}
                >
                  Cetak PDF
                </button>
              </div>

              {/* JSON Full Backup */}
              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  border: '1px solid var(--flow-border-subtle)',
                  background: 'var(--flow-bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => {
                  onExportJSON();
                  onClose();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: 'var(--flow-accent-amber)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <FileCode size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
                      Cadangan Lengkap Workspace (.json)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                      Mencakup seluruh tugas, kolom board, anggota tim, saluran chat, dan proyek.
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="tab-btn"
                  style={{ fontSize: '0.78rem', padding: '6px 12px', flexShrink: 0, background: 'var(--flow-bg-surface)' }}
                >
                  Unduh JSON
                </button>
              </div>
            </>
          )}

          {/* TAB 2: IMPOR & PULIHKAN */}
          {activeTab === 'import' && (
            <>
              {/* Import Mode Selector Pills */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className={`tab-btn ${importMode === 'csv' ? 'active' : ''}`}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    padding: '8px',
                    borderRadius: 8
                  }}
                  onClick={() => setImportMode('csv')}
                >
                  <FileSpreadsheet size={15} />
                  <span>Impor Tugas CSV</span>
                </button>

                <button
                  type="button"
                  className={`tab-btn ${importMode === 'json' ? 'active' : ''}`}
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    padding: '8px',
                    borderRadius: 8
                  }}
                  onClick={() => setImportMode('json')}
                >
                  <RefreshCw size={15} />
                  <span>Pulihkan Backup JSON</span>
                </button>
              </div>

              {/* MODE A: CSV TASK IMPORT */}
              {importMode === 'csv' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    type="file"
                    ref={csvInputRef}
                    accept=".csv,text/csv"
                    style={{ display: 'none' }}
                    onChange={handleCsvFileChange}
                  />

                  {/* Dropzone */}
                  <div
                    style={{
                      border: '2px dashed var(--flow-border-subtle)',
                      borderRadius: 12,
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: 'var(--flow-bg-elevated)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                    onClick={() => csvInputRef.current?.click()}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: 'rgba(16, 185, 129, 0.12)',
                        color: 'var(--flow-accent-emerald)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 10px auto'
                      }}
                    >
                      <Upload size={22} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--flow-text-main)' }}>
                      {csvFile ? csvFile.name : 'Klik untuk memilih file CSV'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)', marginTop: 4 }}>
                      Mendukung ekspor tugas dari ClickUp, Jira, Trello, atau template FlowWork
                    </div>
                  </div>

                  {csvError && (
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'rgba(244, 63, 94, 0.12)',
                        color: 'var(--flow-accent-rose)',
                        fontSize: '0.76rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <AlertTriangle size={15} />
                      <span>{csvError}</span>
                    </div>
                  )}

                  {/* Parsed Preview */}
                  {parsedCsvTasks.length > 0 && (
                    <div
                      style={{
                        borderRadius: 10,
                        border: '1px solid var(--flow-border-subtle)',
                        background: 'var(--flow-bg-surface)',
                        padding: 12,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={16} color="var(--flow-accent-emerald)" />
                          <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--flow-text-main)' }}>
                            {parsedCsvTasks.length} Tugas Siap Diimpor
                          </span>
                        </div>

                        {/* Destination Space Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)' }}>Ke Proyek:</span>
                          <select
                            className="filter-select"
                            style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                            value={selectedTargetSpace}
                            onChange={(e) => setSelectedTargetSpace(e.target.value)}
                          >
                            {spaces.map((sp) => (
                              <option key={sp.id} value={sp.id}>
                                {sp.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Mini Preview Table */}
                      <div style={{ maxHeight: 150, overflowY: 'auto', border: '1px solid var(--flow-border-subtle)', borderRadius: 6 }}>
                        <table style={{ width: '100%', fontSize: '0.74rem', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: 'var(--flow-bg-elevated)', textAlign: 'left', borderBottom: '1px solid var(--flow-border-subtle)' }}>
                              <th style={{ padding: '6px 8px' }}>Judul</th>
                              <th style={{ padding: '6px 8px' }}>Status</th>
                              <th style={{ padding: '6px 8px' }}>Prioritas</th>
                              <th style={{ padding: '6px 8px' }}>PIC</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedCsvTasks.slice(0, 5).map((t, idx) => (
                              <tr key={idx} style={{ borderBottom: '1px solid var(--flow-border-subtle)' }}>
                                <td style={{ padding: '5px 8px', fontWeight: 600 }}>{t.title}</td>
                                <td style={{ padding: '5px 8px' }}>{t.status}</td>
                                <td style={{ padding: '5px 8px' }}>{t.priority}</td>
                                <td style={{ padding: '5px 8px' }}>{t.assignee || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {parsedCsvTasks.length > 5 && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--flow-text-muted)', textAlign: 'center' }}>
                          ...dan {parsedCsvTasks.length - 5} tugas lainnya
                        </div>
                      )}

                      <button
                        type="button"
                        className="flow-add-task-btn"
                        style={{ width: '100%', justifyContent: 'center', padding: '8px', fontSize: '0.84rem', marginTop: 4 }}
                        onClick={handleConfirmImportCsv}
                      >
                        <Check size={16} />
                        <span>Impor {parsedCsvTasks.length} Tugas Sekarang</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MODE B: JSON WORKSPACE RESTORE */}
              {importMode === 'json' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <input
                    type="file"
                    ref={jsonInputRef}
                    accept=".json,application/json"
                    style={{ display: 'none' }}
                    onChange={handleJsonFileChange}
                  />

                  {/* Dropzone */}
                  <div
                    style={{
                      border: '2px dashed var(--flow-border-subtle)',
                      borderRadius: 12,
                      padding: '24px 16px',
                      textAlign: 'center',
                      background: 'var(--flow-bg-elevated)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s ease'
                    }}
                    onClick={() => jsonInputRef.current?.click()}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: 'rgba(245, 158, 11, 0.12)',
                        color: 'var(--flow-accent-amber)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 10px auto'
                      }}
                    >
                      <RefreshCw size={22} />
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--flow-text-main)' }}>
                      {jsonFile ? jsonFile.name : 'Klik untuk memilih file Cadangan JSON'}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)', marginTop: 4 }}>
                      Pulihkan seluruh workspace atau gabungkan tugas dari backup sebelumnya
                    </div>
                  </div>

                  {jsonError && (
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'rgba(244, 63, 94, 0.12)',
                        color: 'var(--flow-accent-rose)',
                        fontSize: '0.76rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}
                    >
                      <AlertTriangle size={15} />
                      <span>{jsonError}</span>
                    </div>
                  )}

                  {parsedJsonBackup && (
                    <div
                      style={{
                        borderRadius: 10,
                        border: '1px solid var(--flow-border-subtle)',
                        background: 'var(--flow-bg-surface)',
                        padding: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CheckCircle2 size={17} color="var(--flow-accent-emerald)" />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--flow-text-main)' }}>
                            File Backup Terverifikasi: {parsedJsonBackup.workspace || 'FlowWork'}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)' }}>
                            {parsedJsonBackup.tasks?.length || 0} Tugas • {parsedJsonBackup.columns?.length || 0} Kolom • {parsedJsonBackup.members?.length || 0} Anggota
                          </div>
                        </div>
                      </div>

                      {/* Mode selection radio */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 10px', background: 'var(--flow-bg-elevated)', borderRadius: 8 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="restoreMode"
                            checked={restoreMode === 'full'}
                            onChange={() => setRestoreMode('full')}
                          />
                          <span>
                            <strong>Ganti Seluruh Data (Full Restore)</strong> - Mengganti tugas, kolom, dan anggota dengan file backup ini.
                          </span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name="restoreMode"
                            checked={restoreMode === 'merge'}
                            onChange={() => setRestoreMode('merge')}
                          />
                          <span>
                            <strong>Gabungkan Tugas Saja (Merge)</strong> - Hanya menambahkan tugas baru tanpa menghapus data yang ada.
                          </span>
                        </label>
                      </div>

                      <button
                        type="button"
                        className="flow-add-task-btn"
                        style={{
                          width: '100%',
                          justifyContent: 'center',
                          padding: '8px',
                          fontSize: '0.84rem',
                          background: restoreMode === 'full' ? 'var(--flow-accent-rose)' : 'var(--flow-primary)'
                        }}
                        onClick={handleConfirmRestoreJson}
                      >
                        <RefreshCw size={15} />
                        <span>
                          {restoreMode === 'full' ? 'Konfirmasi & Pulihkan Seluruh Workspace' : 'Gabungkan Tugas dari Backup'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--flow-border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--flow-bg-surface)'
          }}
        >
          <span style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)' }}>
            Data tersimpan aman di browser Anda
          </span>

          <button
            type="button"
            className="tab-btn"
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

