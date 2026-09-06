import React, { useState } from 'react';
import {
  CheckSquare,
  X,
  ArrowRightCircle,
  User,
  Flag,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const BulkActionBar = ({
  selectedTaskIds = [],
  onClearSelection,
  onSelectAll,
  totalTasksCount = 0,
  columns = [],
  members = [],
  onBatchUpdateStatus,
  onBatchUpdateAssignee,
  onBatchUpdatePriority,
  onBatchDelete
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showAssigneeMenu, setShowAssigneeMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!selectedTaskIds || selectedTaskIds.length === 0) return null;

  const count = selectedTaskIds.length;

  return (
    <>
      <div
        className="flow-bulk-action-bar"
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 800,
          background: 'var(--flow-bg-surface)',
          border: '1px solid var(--flow-border-subtle)',
          borderRadius: 14,
          boxShadow: 'var(--flow-shadow-lg), 0 10px 30px rgba(0,0,0,0.25)',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'slideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          backdropFilter: 'blur(16px)',
          maxWidth: '90vw',
          flexWrap: 'wrap'
        }}
      >
        {/* Count Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 6, borderRight: '1px solid var(--flow-border-subtle)' }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: 'var(--flow-primary)',
              color: '#ffffff',
              fontSize: '0.78rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {count}
          </div>
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--flow-text-main)', whiteSpace: 'nowrap' }}>
            Tugas Dipilih
          </span>
          {count < totalTasksCount && onSelectAll && (
            <button
              type="button"
              className="tab-btn"
              style={{ fontSize: '0.72rem', padding: '2px 6px', marginLeft: 4 }}
              onClick={onSelectAll}
            >
              Pilih Semua ({totalTasksCount})
            </button>
          )}
        </div>

        {/* Action: Ubah Status */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="tab-btn"
            style={{ fontSize: '0.8rem', padding: '6px 10px', gap: 6 }}
            onClick={() => {
              setShowStatusMenu(!showStatusMenu);
              setShowAssigneeMenu(false);
              setShowPriorityMenu(false);
            }}
          >
            <ArrowRightCircle size={14} color="var(--flow-primary)" />
            <span>Ubah Status</span>
            <ChevronDown size={12} />
          </button>

          {showStatusMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                left: 0,
                width: 170,
                background: 'var(--flow-bg-surface)',
                border: '1px solid var(--flow-border-subtle)',
                borderRadius: 10,
                boxShadow: 'var(--flow-shadow-lg)',
                padding: '4px',
                zIndex: 900
              }}
            >
              {columns.map((col) => (
                <div
                  key={col.id}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--flow-text-main)',
                    transition: 'background 0.15s ease'
                  }}
                  className="tab-btn"
                  onClick={() => {
                    onBatchUpdateStatus(col.id);
                    setShowStatusMenu(false);
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.color }} />
                  <span>{col.title}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action: Tugaskan (PIC) */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="tab-btn"
            style={{ fontSize: '0.8rem', padding: '6px 10px', gap: 6 }}
            onClick={() => {
              setShowAssigneeMenu(!showAssigneeMenu);
              setShowStatusMenu(false);
              setShowPriorityMenu(false);
            }}
          >
            <User size={14} color="var(--flow-accent-emerald)" />
            <span>Tugaskan PIC</span>
            <ChevronDown size={12} />
          </button>

          {showAssigneeMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                left: 0,
                width: 180,
                background: 'var(--flow-bg-surface)',
                border: '1px solid var(--flow-border-subtle)',
                borderRadius: 10,
                boxShadow: 'var(--flow-shadow-lg)',
                padding: '4px',
                zIndex: 900,
                maxHeight: 220,
                overflowY: 'auto'
              }}
            >
              <div
                className="tab-btn"
                style={{ width: '100%', padding: '6px 10px', fontSize: '0.78rem', cursor: 'pointer' }}
                onClick={() => {
                  onBatchUpdateAssignee('');
                  setShowAssigneeMenu(false);
                }}
              >
                <span>Hapus Penugasan</span>
              </div>
              {members.map((m) => (
                <div
                  key={m.id}
                  className="tab-btn"
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                  onClick={() => {
                    onBatchUpdateAssignee(m.id);
                    setShowAssigneeMenu(false);
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      backgroundColor: m.color,
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {m.avatar}
                  </div>
                  <span>{m.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action: Ubah Prioritas */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="tab-btn"
            style={{ fontSize: '0.8rem', padding: '6px 10px', gap: 6 }}
            onClick={() => {
              setShowPriorityMenu(!showPriorityMenu);
              setShowStatusMenu(false);
              setShowAssigneeMenu(false);
            }}
          >
            <Flag size={14} color="var(--flow-accent-amber)" />
            <span>Prioritas</span>
            <ChevronDown size={12} />
          </button>

          {showPriorityMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: 40,
                left: 0,
                width: 150,
                background: 'var(--flow-bg-surface)',
                border: '1px solid var(--flow-border-subtle)',
                borderRadius: 10,
                boxShadow: 'var(--flow-shadow-lg)',
                padding: '4px',
                zIndex: 900
              }}
            >
              {[
                { id: 'urgent', label: '🔴 Urgent' },
                { id: 'high', label: '🟠 High' },
                { id: 'normal', label: '🔵 Normal' },
                { id: 'low', label: '⚪ Low' }
              ].map((p) => (
                <div
                  key={p.id}
                  className="tab-btn"
                  style={{ width: '100%', padding: '6px 10px', fontSize: '0.78rem', cursor: 'pointer' }}
                  onClick={() => {
                    onBatchUpdatePriority(p.id);
                    setShowPriorityMenu(false);
                  }}
                >
                  <span>{p.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action: Hapus Massal */}
        <button
          type="button"
          className="tab-btn"
          style={{
            fontSize: '0.8rem',
            padding: '6px 12px',
            color: 'var(--flow-accent-rose)',
            borderColor: 'rgba(244, 63, 94, 0.3)',
            background: 'rgba(244, 63, 94, 0.08)',
            fontWeight: 600,
            gap: 6
          }}
          onClick={() => setShowDeleteConfirm(true)}
        >
          <Trash2 size={14} />
          <span>Hapus ({count})</span>
        </button>

        {/* Close / Deselect */}
        <button
          type="button"
          className="icon-btn"
          style={{ width: 28, height: 28, marginLeft: 4 }}
          onClick={onClearSelection}
          title="Batalkan Pilihan (Esc)"
        >
          <X size={15} />
        </button>
      </div>

      {/* Bulk Delete Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          onBatchDelete();
          setShowDeleteConfirm(false);
        }}
        title="Hapus Tugas Massal"
        message={`Apakah Anda yakin ingin menghapus ${count} tugas terpilih sekaligus? Tindakan ini tidak dapat dibatalkan.`}
        confirmText={`Ya, Hapus ${count} Tugas`}
      />
    </>
  );
};
