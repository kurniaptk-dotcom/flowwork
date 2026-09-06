import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Calendar,
  Tag,
  User,
  Flag,
  CheckSquare,
  Plus,
  Clock,
  MessageSquare,
  Sparkles,
  Bookmark
} from 'lucide-react';
import {
  INITIAL_PRIORITIES,
  INITIAL_TAGS,
  INITIAL_MEMBERS
} from '../data/initialData';
import { TaskTemplateModal } from './TaskTemplateModal';
import { ConfirmModal } from './ConfirmModal';
import { createActivityLog, formatActivityTime } from '../utils/activityHelper';

export const TaskModal = ({
  isOpen,
  onClose,
  task,
  onSaveTask,
  onDeleteTask,
  columns,
  spaces,
  defaultDate,
  defaultProjectId,
  members = INITIAL_MEMBERS,
  allTasks = [],
  onAddToast
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(task && task.id);

  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'todo');
  const [priority, setPriority] = useState(task?.priority || 'normal');
  const [dueDate, setDueDate] = useState(task?.dueDate || defaultDate || '');
  const [projectId, setProjectId] = useState(task?.projectId || defaultProjectId || 'mobile-app');
  const [assignee, setAssignee] = useState(task?.assignee || '');
  const [estimatedHours, setEstimatedHours] = useState(task?.estimatedHours || '');
  const [tags, setTags] = useState(task?.tags || []);
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [activityLog, setActivityLog] = useState(task?.activityLog || []);
  const [commentText, setCommentText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Custom Templates & Blueprint states
  const [customTemplates, setCustomTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('flowwork_custom_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSavingAsTemplate, setIsSavingAsTemplate] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState('');

  const handleSelectTemplate = (tpl) => {
    if (tpl.title) setTitle(tpl.title);
    if (tpl.description) setDescription(tpl.description);
    if (tpl.priority) setPriority(tpl.priority);
    if (tpl.tags && tpl.tags.length > 0) setTags(tpl.tags);
    if (tpl.subtasks && tpl.subtasks.length > 0) {
      setSubtasks(
        tpl.subtasks.map((s) => ({
          id: s.id || `st-${Date.now()}-${Math.random()}`,
          text: s.text,
          completed: false
        }))
      );
    }
    if (onAddToast) {
      onAddToast('Format templat berhasil diterapkan!', 'success');
    }
  };

  const handleSaveAsCustomTemplate = () => {
    if (!templateNameInput.trim()) return;
    const newTpl = {
      id: 'custom-tpl-' + Date.now(),
      name: templateNameInput.trim(),
      title: title || templateNameInput.trim(),
      description: description || '',
      priority,
      tags,
      subtasks: subtasks.map((s) => ({ text: s.text })),
      createdAt: new Date().toISOString()
    };
    const updated = [newTpl, ...customTemplates];
    setCustomTemplates(updated);
    try {
      localStorage.setItem('flowwork_custom_templates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setTemplateNameInput('');
    setIsSavingAsTemplate(false);
    if (onAddToast) {
      onAddToast(`Templat "${newTpl.name}" berhasil disimpan ke Pustaka Saya!`, 'success');
    }
  };

  const handleDeleteCustomTemplate = (tplId) => {
    const updated = customTemplates.filter((t) => t.id !== tplId);
    setCustomTemplates(updated);
    try {
      localStorage.setItem('flowwork_custom_templates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    if (onAddToast) {
      onAddToast('Templat kustom berhasil dihapus', 'info');
    }
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newEntry = createActivityLog(`Kurnia (You): "${commentText.trim()}"`);
    setActivityLog([newEntry, ...activityLog]);
    setCommentText('');
  };

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'normal');
      setDueDate(task.dueDate || '');
      setProjectId(task.projectId || 'mobile-app');
      setAssignee(task.assignee || '');
      setEstimatedHours(task.estimatedHours !== undefined ? task.estimatedHours : '');
      setTags(task.tags || []);
      setSubtasks(task.subtasks || []);
      setActivityLog(task.activityLog || []);
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('normal');
      setDueDate(defaultDate || '');
      setProjectId(defaultProjectId && defaultProjectId !== 'all' ? defaultProjectId : 'mobile-app');
      setAssignee('');
      setEstimatedHours('');
      setTags([]);
      setSubtasks([]);
      setActivityLog([]);
    }
  }, [task, defaultDate, defaultProjectId]);

  const handleTagToggle = (tagId) => {
    if (tags.includes(tagId)) {
      setTags(tags.filter((t) => t !== tagId));
    } else {
      setTags([...tags, tagId]);
    }
  };

  const handleAddSubtask = (e) => {
    e?.preventDefault();
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: `st-${Date.now()}`, text: newSubtaskText.trim(), completed: false }
    ]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (stId) => {
    setSubtasks(
      subtasks.map((st) =>
        st.id === stId ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const handleDeleteSubtask = (stId) => {
    setSubtasks(subtasks.filter((st) => st.id !== stId));
  };

  const completedSubtasksCount = subtasks.filter((st) => st.completed).length;
  const progressRatio =
    subtasks.length > 0 ? Math.round((completedSubtasksCount / subtasks.length) * 100) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updatedTask = {
      ...(task || {}),
      id: task?.id || `task-${Date.now()}`,
      projectId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate,
      assignee,
      estimatedHours: estimatedHours !== '' ? Number(estimatedHours) : (task?.estimatedHours || 0),
      tags,
      subtasks,
      activityLog
    };

    onSaveTask(updatedTask);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.1rem' }}>📋</span>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              {isEditing ? 'Detail & Edit Tugas' : 'Buat Tugas Baru'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isEditing && (
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowDeleteConfirm(true)}
                title="Hapus Tugas"
              >
                <Trash2 size={16} color="var(--flow-accent-rose)" />
              </button>
            )}
            <button className="icon-btn" onClick={onClose} title="Tutup (Esc)">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Template & Blueprint Toolbar */}
        <div
          style={{
            padding: '10px 24px',
            backgroundColor: 'var(--flow-bg-elevated)',
            borderBottom: '1px solid var(--flow-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="tab-btn"
              style={{
                fontSize: '0.78rem',
                padding: '5px 12px',
                color: 'var(--flow-primary)',
                borderColor: 'var(--flow-primary)',
                backgroundColor: 'var(--flow-primary-light)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
              onClick={() => setIsTemplateModalOpen(true)}
              title="Buka pustaka format tugas & riwayat kerja"
            >
              <Sparkles size={14} color="var(--flow-primary)" />
              <span>⚡ Gunakan Templat / Riwayat Kerja</span>
            </button>
          </div>

          <button
            type="button"
            className="tab-btn"
            style={{
              fontSize: '0.76rem',
              padding: '5px 12px',
              color: isSavingAsTemplate ? 'var(--flow-primary)' : 'var(--flow-text-subtle)',
              borderColor: isSavingAsTemplate ? 'var(--flow-primary)' : 'var(--flow-border-subtle)',
              backgroundColor: isSavingAsTemplate ? 'var(--flow-primary-light)' : 'transparent'
            }}
            onClick={() => setIsSavingAsTemplate(!isSavingAsTemplate)}
            title="Simpan struktur tugas ini ke templat kustom saya"
          >
            <Bookmark size={13} />
            <span>{isSavingAsTemplate ? 'Batal Simpan' : '💾 Simpan Sebagai Templat'}</span>
          </button>
        </div>

        {/* Save as Template Inline Drawer */}
        {isSavingAsTemplate && (
          <div
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--flow-primary-light)',
              borderBottom: '1px solid var(--flow-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              animation: 'fadeIn 0.15s ease'
            }}
          >
            <input
              type="text"
              placeholder="Beri nama templat (contoh: SOP Briefing Klien / Format Makalah)..."
              value={templateNameInput}
              onChange={(e) => setTemplateNameInput(e.target.value)}
              className="meta-field-input"
              style={{
                flex: 1,
                fontSize: '0.82rem',
                padding: '6px 12px',
                backgroundColor: 'var(--flow-bg-surface)',
                border: '1px solid var(--flow-border-subtle)'
              }}
              autoFocus
            />
            <button
              type="button"
              className="flow-add-task-btn"
              style={{ fontSize: '0.76rem', padding: '6px 14px' }}
              onClick={handleSaveAsCustomTemplate}
              disabled={!templateNameInput.trim()}
            >
              Simpan ke Pustaka
            </button>
          </div>
        )}

        {/* Task Template & History Modal */}
        <TaskTemplateModal
          isOpen={isTemplateModalOpen}
          onClose={() => setIsTemplateModalOpen(false)}
          onSelectTemplate={handleSelectTemplate}
          recentTasks={allTasks}
          customTemplates={customTemplates}
          onDeleteCustomTemplate={handleDeleteCustomTemplate}
        />

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            {/* Title Input */}
          <div>
            <input
              type="text"
              className="meta-field-input"
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                padding: '10px 14px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)'
              }}
              placeholder="Judul tugas..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Metadata Grid */}
          <div className="modal-row-grid">
            {/* Space / Project */}
            <div>
              <label className="meta-field-label">Project / Space</label>
              <select
                className="meta-field-input"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                {spaces
                  ?.filter((s) => s.id !== 'all')
                  .map((sp) => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="meta-field-label">Status</label>
              <select
                className="meta-field-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="meta-field-label">
                <Flag size={12} />
                Prioritas
              </label>
              <select
                className="meta-field-input"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{
                  color: INITIAL_PRIORITIES[priority]?.color,
                  fontWeight: 600
                }}
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="normal">🔵 Normal</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="meta-field-label">
                <Calendar size={12} />
                Tenggat Waktu
              </label>
              <input
                type="date"
                className="meta-field-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Assignee */}
            <div>
              <label className="meta-field-label">
                <User size={12} />
                Penanggung Jawab (PIC)
              </label>
              <select
                className="meta-field-input"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              >
                <option value="">Belum Ditugaskan</option>
                {(members && members.length > 0 ? members : INITIAL_MEMBERS).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role || 'Member'})
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Hours */}
            <div>
              <label className="meta-field-label">
                <Clock size={12} />
                Estimasi Jam Kerja
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="meta-field-input"
                placeholder="cth: 4 (jam)"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="meta-field-label">
              <Tag size={12} />
              Label & Kategori
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
              {INITIAL_TAGS.map((tag) => {
                const isSelected = tags.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className="tag-badge"
                    style={{
                      backgroundColor: isSelected ? tag.color : 'var(--bg-surface-elevated)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      border: `1px solid ${isSelected ? tag.color : 'var(--border-subtle)'}`,
                      padding: '5px 10px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="meta-field-label">Deskripsi & Catatan Tugas</label>
            <textarea
              className="meta-field-input"
              style={{ minHeight: 90, resize: 'vertical', lineHeight: 1.5 }}
              placeholder="Jelaskan detail spesifikasi, acuan link, atau catatan penting..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Checklist / Subtasks Section */}
          <div className="subtasks-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="meta-field-label" style={{ marginBottom: 0 }}>
                <CheckSquare size={13} />
                Subtasks & Checklist ({completedSubtasksCount}/{subtasks.length})
              </label>
              {subtasks.length > 0 && (
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-success)' }}>
                  {progressRatio}% Selesai
                </span>
              )}
            </div>

            {/* Subtask Progress Bar */}
            {subtasks.length > 0 && (
              <div className="sidebar-progress-bar" style={{ height: 5, margin: '2px 0 8px 0' }}>
                <div
                  className="sidebar-progress-fill"
                  style={{
                    width: `${progressRatio}%`,
                    background: progressRatio === 100 ? 'var(--color-success)' : 'var(--accent-gradient)'
                  }}
                />
              </div>
            )}

            {/* Subtask List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {subtasks.map((st) => (
                <div
                  key={st.id}
                  className={`subtask-item ${st.completed ? 'completed' : ''}`}
                >
                  <div
                    className={`custom-checkbox ${st.completed ? 'checked' : ''}`}
                    onClick={() => handleToggleSubtask(st.id)}
                  >
                    {st.completed && <span style={{ fontSize: 12 }}>✓</span>}
                  </div>
                  <span style={{ flex: 1, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    {st.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(st.id)}
                    className="icon-btn"
                    style={{ width: 24, height: 24 }}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <input
                type="text"
                className="meta-field-input"
                placeholder="+ Tambah subtask item (tekan Enter)..."
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button
                type="button"
                className="primary-btn"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                onClick={handleAddSubtask}
              >
                <Plus size={14} />
                Tambah
              </button>
            </div>
          </div>

          {/* Activity Log & Comments */}
          <div>
            <label className="meta-field-label">
              <MessageSquare size={12} />
              Aktivitas & Komentar ({activityLog?.length || 0})
            </label>
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                fontSize: '0.82rem'
              }}
            >
              {activityLog && activityLog.length > 0 ? (
                activityLog.slice(0, 8).map((act) => (
                  <div
                    key={act.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: 8,
                      color: 'var(--text-secondary)',
                      paddingBottom: 4,
                      borderBottom: '1px solid var(--border-subtle)'
                    }}
                  >
                    <span style={{ wordBreak: 'break-word' }}>{act.text}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {formatActivityTime(act)}
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.78rem' }}>
                  Belum ada aktivitas atau komentar.
                </div>
              )}

              {/* Add Comment Input */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  type="text"
                  className="meta-field-input"
                  placeholder="Tulis komentar atau update progres tugas..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                />
                <button
                  type="button"
                  className="clickup-create-btn"
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  onClick={handleAddComment}
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Pinned Footer Submit Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 10,
            padding: '14px 24px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            flexShrink: 0
          }}
        >
          <div>
            {isEditing && (
              <button
                type="button"
                className="tab-btn"
                style={{
                  color: 'var(--flow-accent-rose)',
                  borderColor: 'rgba(244, 63, 94, 0.3)',
                  background: 'rgba(244, 63, 94, 0.08)',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={14} />
                <span>Hapus Tugas</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="tab-btn"
              onClick={onClose}
              style={{ background: 'var(--bg-surface-elevated)' }}
            >
              Batal
            </button>
            <button type="submit" className="primary-btn">
              {isEditing ? 'Simpan Perubahan' : 'Buat Tugas'}
            </button>
          </div>
        </div>
      </form>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onDeleteTask(task?.id);
          onClose();
        }}
        title="Hapus Tugas"
        message={`Apakah Anda yakin ingin menghapus tugas "${title || task?.title}" secara permanen?`}
        confirmText="Ya, Hapus"
      />
    </div>
  );
};
