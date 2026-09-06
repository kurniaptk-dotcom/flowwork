import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Hapus',
  message = 'Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.',
  confirmText = 'Hapus',
  confirmVariant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 420, padding: 24, animation: 'fadeIn 0.15s ease' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.14)',
                color: 'var(--flow-accent-rose)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>

        <p style={{ margin: '0 0 22px 0', fontSize: '0.86rem', color: 'var(--flow-text-subtle)', lineHeight: 1.5 }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            type="button"
            className="tab-btn"
            style={{ padding: '7px 16px', fontSize: '0.84rem' }}
            onClick={onClose}
          >
            Batal
          </button>
          <button
            type="button"
            className="primary-btn"
            style={{
              padding: '7px 18px',
              fontSize: '0.84rem',
              backgroundColor: 'var(--flow-accent-rose)',
              borderColor: 'var(--flow-accent-rose)',
              color: '#ffffff',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.35)'
            }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
