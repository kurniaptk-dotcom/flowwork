import React, { useState, useEffect } from 'react';
import { X, Trash2, FolderKanban, Check } from 'lucide-react';

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#64748b'  // Slate
];

const PRESET_ICONS = ['🚀', '🎨', '📈', '💻', '⚡', '📦', '🎯', '⚙️', '📱', '✨', '🌐'];

export const EditSpaceModal = ({
  isOpen,
  onClose,
  space,
  onSave,
  onDelete
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(space && space.id && space.id !== 'all');

  const [name, setName] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('🚀');

  useEffect(() => {
    if (space) {
      // Extract emoji if present in name
      const emojiMatch = space.name?.match(/^([\uD800-\uDBFF\uDC00-\uDFFF]|[\u2600-\u27BF])\s*/);
      const cleanName = space.name?.replace(/^([\uD800-\uDBFF\uDC00-\uDFFF]|[\u2600-\u27BF])\s*/, '') || space.name || '';
      setName(cleanName);
      setColor(space.color || '#6366f1');
      if (emojiMatch) {
        setIcon(emojiMatch[1]);
      }
    } else {
      setName('');
      setColor('#6366f1');
      setIcon('🚀');
    }
  }, [space, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const fullName = `${icon} ${name.trim()}`;
    onSave({
      id: space?.id || `space-${Date.now()}`,
      name: fullName,
      color
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440, padding: 0 }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: color,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16
              }}
            >
              {icon}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
                {isEditing ? 'Pengaturan Proyek' : 'Buat Proyek Baru'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                {isEditing ? 'Ubah identitas dan warna proyek' : 'Tambahkan workspace proyek baru'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isEditing && onDelete && (
              <button
                type="button"
                className="icon-btn"
                style={{ width: 30, height: 30, color: 'var(--flow-accent-rose)' }}
                onClick={() => {
                  onDelete(space.id);
                  onClose();
                }}
                title="Hapus Proyek"
              >
                <Trash2 size={15} />
              </button>
            )}
            <button
              type="button"
              className="icon-btn"
              style={{ width: 30, height: 30 }}
              onClick={onClose}
              title="Tutup"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} style={{ padding: 20 }}>
          {/* Icon Selector */}
          <div style={{ marginBottom: 16 }}>
            <label className="meta-field-label" style={{ marginBottom: 6 }}>
              Ikon Proyek
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PRESET_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    border: icon === ic ? '2px solid var(--flow-primary)' : '1px solid var(--flow-border-subtle)',
                    background: icon === ic ? 'var(--flow-primary-light)' : 'var(--flow-bg-elevated)',
                    cursor: 'pointer',
                    fontSize: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Project Name */}
          <div style={{ marginBottom: 16 }}>
            <label className="meta-field-label" style={{ marginBottom: 6 }}>
              Nama Proyek *
            </label>
            <input
              type="text"
              className="meta-field-input"
              style={{
                width: '100%',
                fontSize: '0.9rem',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--flow-border-subtle)',
                backgroundColor: 'var(--flow-bg-elevated)',
                color: 'var(--flow-text-main)'
              }}
              placeholder="Contoh: Website Redesign 2026..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </div>

          {/* Color Picker */}
          <div style={{ marginBottom: 20 }}>
            <label className="meta-field-label" style={{ marginBottom: 6 }}>
              Warna Tema Proyek
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: color === c ? '2px solid #fff' : 'none',
                    boxShadow: color === c ? '0 0 0 2px var(--flow-primary)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  {color === c && <Check size={14} strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: isEditing && onDelete ? 'space-between' : 'flex-end', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid var(--flow-border-subtle)' }}>
            {isEditing && onDelete && (
              <button
                type="button"
                className="tab-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 12px',
                  fontSize: '0.82rem',
                  color: 'var(--flow-accent-rose)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  background: 'rgba(244, 63, 94, 0.08)'
                }}
                onClick={() => {
                  onDelete(space.id);
                  onClose();
                }}
                title="Hapus proyek ini"
              >
                <Trash2 size={13} />
                <span>Hapus Proyek</span>
              </button>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="tab-btn"
                style={{ padding: '7px 14px', fontSize: '0.82rem' }}
                onClick={onClose}
              >
                Batal
              </button>
              <button
                type="submit"
                className="flow-add-task-btn"
                style={{ padding: '7px 18px', fontSize: '0.82rem' }}
                disabled={!name.trim()}
              >
                {isEditing ? 'Simpan Perubahan' : 'Buat Proyek'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
