import React, { useState, useEffect } from 'react';
import { X, Building, Check, Trash2, Palette, Smile, FileText } from 'lucide-react';

const PRESET_COLORS = [
  '#3b82f6', // Blue (Kuliah)
  '#00a884', // Emerald / Teal (Freelance)
  '#ec4899', // Pink (Personal)
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#64748b'  // Slate
];

const PRESET_ICONS = [
  '🎓', '💼', '🏠', '🚀', '💻', '🎨', '📚', '⚡',
  '🌟', '🎯', '💡', '🌐', '☕', '🧪', '🛠️', '📊',
  '🎧', '🎬', '📝', '🏆'
];

export const EditWorkspaceModal = ({
  isOpen,
  onClose,
  workspace,
  onSave,
  onDelete,
  canDelete = true
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(workspace && workspace.id);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏢');
  const [color, setColor] = useState('#3b82f6');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || '');
      setIcon(workspace.icon || '🏢');
      setColor(workspace.color || '#3b82f6');
      setDescription(workspace.description || '');
    } else {
      setName('');
      setIcon('🚀');
      setColor('#6366f1');
      setDescription('');
    }
  }, [workspace, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: workspace?.id || `ws-${Date.now()}`,
      name: name.trim(),
      icon,
      color,
      description: description.trim()
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 480,
          padding: 0,
          borderRadius: 16,
          overflow: 'hidden',
          background: 'var(--flow-bg-surface)',
          border: '1px solid var(--flow-border-subtle)',
          boxShadow: 'var(--flow-shadow-lg)',
          animation: 'fadeIn 0.15s ease'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--flow-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--flow-bg-card)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: color + '20',
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                border: `1px solid ${color}40`,
                flexShrink: 0
              }}
            >
              {icon}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
                {isEditing ? 'Edit Ruang Kerja' : 'Tambah Ruang Kerja Baru'}
              </h3>
              <div style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)', marginTop: 2 }}>
                {isEditing ? `ID: ${workspace.id}` : 'Atur identitas ruang kerja Anda'}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={onClose}
            aria-label="Tutup modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '68vh', overflowY: 'auto' }}>
            {/* 1. Nama Ruang Kerja */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--flow-text-subtle)',
                  marginBottom: 6
                }}
              >
                Nama Ruang Kerja <span style={{ color: 'var(--flow-accent-rose)' }}>*</span>
              </label>
              <input
                type="text"
                className="meta-field-input"
                placeholder="Contoh: Kuliah & Studi, Startup, Side Hustle..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
                style={{ width: '100%', fontSize: '0.88rem', padding: '9px 12px', borderRadius: 8 }}
              />
            </div>

            {/* 2. Pilih Ikon Emoji */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--flow-text-subtle)',
                  marginBottom: 8
                }}
              >
                <Smile size={14} />
                <span>Pilih Ikon Emoji</span>
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(10, 1fr)',
                  gap: 6,
                  padding: 8,
                  background: 'var(--flow-bg-base)',
                  borderRadius: 10,
                  border: '1px solid var(--flow-border-subtle)'
                }}
              >
                {PRESET_ICONS.map((em) => {
                  const isSelected = icon === em;
                  return (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setIcon(em)}
                      style={{
                        height: 34,
                        fontSize: '1.15rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isSelected ? color + '26' : 'transparent',
                        border: isSelected ? `2px solid ${color}` : '1px solid transparent',
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease, background 0.1s ease'
                      }}
                      title={em}
                    >
                      {em}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Warna Tema Ruang Kerja */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--flow-text-subtle)',
                  marginBottom: 8
                }}
              >
                <Palette size={14} />
                <span>Warna Tema Ruang Kerja</span>
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PRESET_COLORS.map((c) => {
                  const isSelected = color === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: isSelected ? '3px solid #ffffff' : '2px solid transparent',
                        boxShadow: isSelected ? `0 0 0 2px ${c}` : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        transition: 'transform 0.12s ease'
                      }}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Deskripsi Singkat */}
            <div>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--flow-text-subtle)',
                  marginBottom: 6
                }}
              >
                <FileText size={14} />
                <span>Deskripsi Singkat</span>
              </label>
              <textarea
                className="meta-field-input"
                placeholder="Deskripsi tujuan ruang kerja ini..."
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  fontSize: '0.84rem',
                  padding: '8px 12px',
                  borderRadius: 8,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* 5. Zona Bahaya: Hapus Ruang Kerja (jika mode edit) */}
            {isEditing && (
              <div
                style={{
                  marginTop: 6,
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12
                }}
              >
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--flow-accent-rose)' }}>
                    Hapus Ruang Kerja Ini
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', marginTop: 2 }}>
                    {canDelete
                      ? 'Menghapus ruang kerja ini dan seluruh tugas di dalamnya.'
                      : 'Ruang kerja terakhir tidak dapat dihapus.'}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canDelete}
                  onClick={() => {
                    if (canDelete && onDelete) {
                      onDelete(workspace);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '6px 12px',
                    borderRadius: 7,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    background: canDelete ? 'rgba(239, 68, 68, 0.12)' : 'rgba(100, 116, 139, 0.1)',
                    color: canDelete ? 'var(--flow-accent-rose)' : 'var(--flow-text-muted)',
                    border: canDelete ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent',
                    cursor: canDelete ? 'pointer' : 'not-allowed',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Trash2 size={13} />
                  <span>Hapus</span>
                </button>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '14px 22px',
              borderTop: '1px solid var(--flow-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: 10,
              background: 'var(--flow-bg-card)'
            }}
          >
            <button
              type="button"
              className="tab-btn"
              onClick={onClose}
              style={{ padding: '7px 14px', fontSize: '0.84rem' }}
            >
              Batal
            </button>
            <button
              type="submit"
              className="clickup-create-btn"
              style={{
                padding: '7px 18px',
                fontSize: '0.84rem',
                backgroundColor: color,
                borderColor: color
              }}
            >
              {isEditing ? 'Simpan Perubahan' : 'Buat Ruang Kerja'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
