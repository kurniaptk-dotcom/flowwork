import React, { useState } from 'react';
import {
  X,
  Sparkles,
  History,
  Bookmark,
  Layers,
  Search,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Clock,
  Briefcase,
  PenTool,
  Code
} from 'lucide-react';
import { STARTER_TEMPLATES } from '../data/templateData';

export const TaskTemplateModal = ({
  isOpen,
  onClose,
  onSelectTemplate,
  recentTasks = [],
  customTemplates = [],
  onDeleteCustomTemplate
}) => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'custom' | 'starter'
  const [searchQuery, setSearchQuery] = useState('');
  const [starterCategory, setStarterCategory] = useState('all');

  if (!isOpen) return null;

  const q = searchQuery.toLowerCase().trim();

  // 1. Filtered Recent Tasks
  const filteredRecentTasks = recentTasks.filter((t) => {
    if (!q) return true;
    return (
      (t.title || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  });

  // 2. Filtered Custom Templates
  const filteredCustomTemplates = customTemplates.filter((t) => {
    if (!q) return true;
    return (
      (t.name || '').toLowerCase().includes(q) ||
      (t.title || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  });

  // 3. Filtered Starter Presets
  const filteredStarters = STARTER_TEMPLATES.filter((t) => {
    const matchesCategory =
      starterCategory === 'all' || t.category === starterCategory;
    const matchesQuery =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const categories = [
    { id: 'all', label: 'Semua Bidang' },
    { id: 'Bisnis & Operasional', label: '💼 Bisnis & Operasional' },
    { id: 'Kreatif & Konten', label: '✍️ Kreatif & Konten' },
    { id: 'Proyek & Produk', label: '🚀 Proyek & Teknis' }
  ];

  return (
    <div className="flow-modal-backdrop" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        className="flow-template-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flow-template-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: 'var(--flow-primary-light)',
                color: 'var(--flow-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--flow-text-main)', margin: 0 }}>
                Pustaka Templat & Riwayat Kerja
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--flow-text-muted)', margin: '2px 0 0' }}>
                Pilih dari tugas yang pernah dibuat sebelumnya, templat kustom, atau blueprint lintas industri.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn" style={{ width: 30, height: 30 }}>
            <X size={16} />
          </button>
        </div>

        {/* Toolbar: Search + Tabs */}
        <div className="flow-template-toolbar">
          <div className="flow-template-tabs">
            <button
              className={`flow-template-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={14} />
              <span>Riwayat Tugas ({recentTasks.length})</span>
            </button>

            <button
              className={`flow-template-tab ${activeTab === 'custom' ? 'active' : ''}`}
              onClick={() => setActiveTab('custom')}
            >
              <Bookmark size={14} />
              <span>Templat Saya ({customTemplates.length})</span>
            </button>

            <button
              className={`flow-template-tab ${activeTab === 'starter' ? 'active' : ''}`}
              onClick={() => setActiveTab('starter')}
            >
              <Layers size={14} />
              <span>Preset Lintas Bidang</span>
            </button>
          </div>

          <div className="flow-template-search">
            <Search size={14} color="var(--flow-text-muted)" />
            <input
              type="text"
              placeholder="Cari format atau riwayat tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flow-template-search-input"
            />
          </div>
        </div>

        {/* Category Pills (Visible when in Starter Presets) */}
        {activeTab === 'starter' && (
          <div className="flow-template-cat-pills">
            {categories.map((c) => (
              <button
                key={c.id}
                className={`flow-pill-btn ${starterCategory === c.id ? 'active' : ''}`}
                onClick={() => setStarterCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* Modal Body List */}
        <div className="flow-template-body">
          {/* TAB 1: Riwayat Tugas Terakhir */}
          {activeTab === 'history' && (
            <div className="flow-template-list">
              {filteredRecentTasks.length > 0 ? (
                filteredRecentTasks.map((t) => {
                  const subtasksCount = t.subtasks ? t.subtasks.length : 0;
                  return (
                    <div key={t.id} className="flow-template-card-item">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span className="flow-badge flow-badge-cyan" style={{ fontSize: '0.64rem' }}>
                            {t.status}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)' }}>
                            Prioritas: {t.priority || 'Normal'}
                          </span>
                          {subtasksCount > 0 && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--flow-primary)', fontWeight: 600 }}>
                              ✓ {subtasksCount} subtask
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: '0 0 4px' }}>
                          {t.title}
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--flow-text-subtle)', margin: 0, lineHeight: 1.4 }}>
                          {t.description || 'Tidak ada deskripsi rinci.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="flow-template-use-btn"
                        onClick={() => {
                          onSelectTemplate({
                            title: t.title,
                            description: t.description,
                            priority: t.priority,
                            tags: t.tags || [],
                            subtasks: (t.subtasks || []).map((s) => ({
                              id: `st-${Date.now()}-${Math.random()}`,
                              text: s.text,
                              completed: false
                            }))
                          });
                          onClose();
                        }}
                      >
                        <span>Gunakan Format Ini</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="flow-empty-box">
                  <Clock size={32} style={{ opacity: 0.5, margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600 }}>Belum ada riwayat tugas yang cocok</div>
                  <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
                    Tugas yang pernah dibuat sebelumnya di workspace akan otomatis muncul di sini.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Templat Kustom Saya */}
          {activeTab === 'custom' && (
            <div className="flow-template-list">
              {filteredCustomTemplates.length > 0 ? (
                filteredCustomTemplates.map((tpl) => {
                  const subCount = tpl.subtasks ? tpl.subtasks.length : 0;
                  return (
                    <div key={tpl.id} className="flow-template-card-item">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span className="flow-badge flow-badge-emerald" style={{ fontSize: '0.64rem' }}>
                            Templat Kustom
                          </span>
                          {subCount > 0 && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)' }}>
                              {subCount} subtasks terkonfigurasi
                            </span>
                          )}
                        </div>

                        <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: '0 0 4px' }}>
                          {tpl.name}
                        </h4>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--flow-primary)', marginBottom: 2 }}>
                          Format: "{tpl.title}"
                        </div>
                        <p style={{ fontSize: '0.78rem', color: 'var(--flow-text-subtle)', margin: 0 }}>
                          {tpl.description}
                        </p>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          type="button"
                          className="icon-btn"
                          style={{ color: 'var(--flow-accent-rose)' }}
                          title="Hapus templat ini"
                          onClick={() => onDeleteCustomTemplate && onDeleteCustomTemplate(tpl.id)}
                        >
                          <Trash2 size={15} />
                        </button>

                        <button
                          type="button"
                          className="flow-template-use-btn"
                          onClick={() => {
                            onSelectTemplate({
                              title: tpl.title,
                              description: tpl.description,
                              priority: tpl.priority,
                              tags: tpl.tags || [],
                              subtasks: (tpl.subtasks || []).map((s) => ({
                                id: `st-${Date.now()}-${Math.random()}`,
                                text: s.text,
                                completed: false
                              }))
                            });
                            onClose();
                          }}
                        >
                          <span>Terapkan Templat</span>
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flow-empty-box">
                  <Bookmark size={32} style={{ opacity: 0.5, margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600 }}>Belum ada templat kustom tersimpan</div>
                  <div style={{ fontSize: '0.78rem', marginTop: 4, maxWidth: 360, margin: '4px auto 0' }}>
                    Anda bisa menyusun tugas apa pun di formulir, lalu klik tombol <b>"💾 Simpan Sebagai Templat"</b> di bagian bawah untuk menyimpannya ke daftar ini.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Preset Lintas Bidang */}
          {activeTab === 'starter' && (
            <div className="flow-template-grid-starters">
              {filteredStarters.map((tpl) => (
                <div key={tpl.id} className="flow-starter-card">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span className="flow-badge flow-badge-cyan" style={{ fontSize: '0.64rem' }}>
                        {tpl.category}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--flow-text-muted)' }}>
                        ✓ {tpl.subtasks.length} Subtasks
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: '0 0 6px' }}>
                      {tpl.name}
                    </h4>
                    <p style={{ fontSize: '0.76rem', color: 'var(--flow-text-subtle)', lineHeight: 1.4, margin: '0 0 12px' }}>
                      {tpl.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="flow-template-use-btn"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      onSelectTemplate({
                        title: tpl.title,
                        description: tpl.description,
                        priority: tpl.priority,
                        tags: tpl.tags,
                        subtasks: tpl.subtasks.map((s) => ({
                          id: `st-${Date.now()}-${Math.random()}`,
                          text: s.text,
                          completed: false
                        }))
                      });
                      onClose();
                    }}
                  >
                    <span>Gunakan Templat Ini</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskTemplateModal;
