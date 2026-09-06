import React, { useState } from 'react';
import { AlertTriangle, X, ArrowRight, UserCheck } from 'lucide-react';

export const MemberDeleteModal = ({
  isOpen,
  onClose,
  member,
  allMembers = [],
  assignedTasksCount = 0,
  onConfirmDelete
}) => {
  if (!isOpen || !member) return null;

  const otherMembers = allMembers.filter((m) => m.id !== member.id);
  const [reassignTargetId, setReassignTargetId] = useState(otherMembers[0]?.id || '');

  const handleDelete = () => {
    onConfirmDelete(member.id, reassignTargetId);
    onClose();
  };

  const isOwner = member.isOwner || member.id === 'kurnia';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 460, borderRadius: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '18px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: isOwner ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isOwner ? 'var(--flow-accent-amber)' : 'var(--flow-accent-rose)'
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--flow-text-main)' }}>
                {isOwner ? 'Aksi Tidak Diizinkan' : 'Hapus Anggota Tim?'}
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--flow-text-muted)', margin: 0 }}>
                {isOwner ? 'Perlindungan Kepemilikan Workspace' : 'Konfirmasi penghapusan anggota dari tim'}
              </p>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ width: 32, height: 32 }}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isOwner ? (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: 10,
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                color: 'var(--flow-text-main)',
                fontSize: '0.86rem',
                lineHeight: 1.5
              }}
            >
              <strong>{member.name}</strong> adalah <strong>Pemilik Utama (Workspace Owner)</strong>. Akun pemilik tidak dapat dihapus untuk menjamin integritas data dan hak akses workspace.
            </div>
          ) : (
            <>
              <p style={{ fontSize: '0.86rem', color: 'var(--flow-text-subtle)', lineHeight: 1.5, margin: 0 }}>
                Apakah Anda yakin ingin menghapus <strong>{member.name}</strong> ({member.role}) dari workspace ini?
              </p>

              {assignedTasksCount > 0 ? (
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 10,
                    backgroundColor: 'var(--flow-bg-elevated)',
                    border: '1px solid var(--flow-border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.84rem', fontWeight: 600, color: 'var(--flow-accent-amber)' }}>
                    <span>⚠️ Anggota ini memiliki {assignedTasksCount} tugas aktif</span>
                  </div>
                  <div>
                    <label className="meta-field-label" style={{ fontSize: '0.74rem' }}>
                      Alihkan tugas kepada anggota lain:
                    </label>
                    <select
                      className="meta-field-input"
                      value={reassignTargetId}
                      onChange={(e) => setReassignTargetId(e.target.value)}
                    >
                      <option value="">Kosongkan (Jadikan Unassigned)</option>
                      {otherMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.82rem', color: 'var(--flow-text-muted)' }}>
                  Anggota ini tidak memiliki tugas aktif yang sedang berjalan.
                </div>
              )}
            </>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 14, borderTop: '1px solid var(--flow-border-subtle)' }}>
            <button
              type="button"
              className="tab-btn"
              onClick={onClose}
              style={{ padding: '8px 16px', fontSize: '0.84rem' }}
            >
              Batal
            </button>
            {!isOwner && (
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: '8px 20px',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  borderRadius: 8,
                  backgroundColor: 'var(--flow-accent-rose)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(244, 63, 94, 0.3)'
                }}
              >
                Hapus Anggota
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
