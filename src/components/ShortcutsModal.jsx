import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

export const ShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Aksi Cepat & Navigasi',
      items: [
        { keys: ['N'], desc: 'Buat Tugas Baru' },
        { keys: ['Ctrl', 'K'], alt: ['⌘', 'K'], desc: 'Buka Command Palette & Pencarian Cepat' },
        { keys: ['?'], desc: 'Buka Panduan Pintasan Keyboard' },
        { keys: ['Esc'], desc: 'Tutup Modal / Batalkan Pilihan' }
      ]
    },
    {
      title: 'Papan Kerja (Kanban & List)',
      items: [
        { keys: ['Double Click'], desc: 'Ganti nama kolom inline di header' },
        { keys: ['Drag & Drop'], desc: 'Geser kartu tugas antar status' },
        { keys: ['Checkbox'], desc: 'Pilih beberapa tugas sekaligus (Bulk Actions)' },
        { keys: ['Enter'], desc: 'Simpan input tugas cepat / quick add' }
      ]
    },
    {
      title: 'Tampilan & Tema',
      items: [
        { keys: ['Ctrl', 'B'], desc: 'Buka / Lipat Sidebar Menu' },
        { keys: ['1 - 5'], desc: 'Beralih tab (Board, List, Calendar, Focus, Analytics)' }
      ]
    }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 500, padding: 0, animation: 'fadeIn 0.15s ease' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'var(--flow-primary-light)',
                color: 'var(--flow-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Keyboard size={17} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
                Pintasan Keyboard (Shortcuts)
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                Bekerja 3x lebih cepat dengan navigasi keyboard
              </p>
            </div>
          </div>

          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {shortcutGroups.map((grp) => (
            <div key={grp.title}>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: 'var(--flow-text-muted)',
                  marginBottom: 8,
                  letterSpacing: '0.04em'
                }}
              >
                {grp.title}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  borderRadius: 10,
                  background: 'var(--flow-bg-elevated)',
                  padding: '8px 12px',
                  border: '1px solid var(--flow-border-subtle)'
                }}
              >
                {grp.items.map((it, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 0',
                      borderBottom: idx < grp.items.length - 1 ? '1px solid var(--flow-border-subtle)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', color: 'var(--flow-text-main)' }}>
                      {it.desc}
                    </span>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {it.keys.map((k, ki) => (
                        <kbd
                          key={ki}
                          style={{
                            padding: '2px 7px',
                            borderRadius: 4,
                            background: 'var(--flow-bg-surface)',
                            border: '1px solid var(--flow-border-subtle)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--flow-text-main)'
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
          <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
            Tekan <kbd style={{ padding: '1px 4px', borderRadius: 3, border: '1px solid var(--flow-border-subtle)' }}>?</kbd> kapan saja untuk membuka
          </span>
          <button
            type="button"
            className="tab-btn"
            style={{ padding: '6px 14px', fontSize: '0.82rem' }}
            onClick={onClose}
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
};
