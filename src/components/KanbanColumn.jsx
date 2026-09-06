import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  X,
  MoreHorizontal,
  Edit2,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Palette,
  Check
} from 'lucide-react';
import { TaskCard } from './TaskCard';
import { ConfirmModal } from './ConfirmModal';

const PRESET_COL_COLORS = [
  '#64748b', // Slate
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899'  // Pink
];

export const KanbanColumn = React.memo(({
  column,
  columns = [],
  tasks,
  selectedTaskIds = [],
  onToggleSelectTask,
  onTaskClick,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedTaskId,
  onQuickAddTask,
  onToggleSubtaskInline,
  onUpdateColumn,
  onDeleteColumn,
  onMoveColumn,
  onDeleteTask,
  onUpdateTaskStatus,
  searchQuery = '',
  members
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Column Menu & Editing State
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState(column.title);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showColDeleteConfirm, setShowColDeleteConfirm] = useState(false);
  const menuRef = useRef(null);

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
        setShowColorPicker(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showMenu]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDropInternal = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(column.id);
  };

  const handleQuickAddSubmit = (e) => {
    e?.preventDefault();
    if (!newTitle.trim()) return;
    onQuickAddTask(column.id, newTitle.trim());
    setNewTitle('');
    setIsAdding(false);
  };

  const handleSaveTitle = (e) => {
    e?.preventDefault();
    if (!editTitleValue.trim()) {
      setIsEditingTitle(false);
      setEditTitleValue(column.title);
      return;
    }
    if (onUpdateColumn) {
      onUpdateColumn(column.id, {
        title: editTitleValue.trim(),
        badge: editTitleValue.trim().slice(0, 8)
      });
    }
    setIsEditingTitle(false);
  };

  const handleSelectColor = (hex) => {
    if (onUpdateColumn) {
      onUpdateColumn(column.id, { color: hex });
    }
    setShowColorPicker(false);
    setShowMenu(false);
  };

  const colIndex = columns.findIndex((c) => c.id === column.id);
  const canMoveLeft = colIndex > 0;
  const canMoveRight = colIndex < columns.length - 1;

  return (
    <div
      className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDropInternal}
    >
      {/* Column Header */}
      <div
        className="column-header"
        style={{
          borderTop: 'none',
          padding: '12px 14px 10px 14px',
          borderBottom: '1px solid var(--flow-border-subtle)',
          position: 'relative'
        }}
      >
        <div
          className="column-title-wrap"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}
        >
          {/* Left: Indicator & Title / Inline Edit */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, marginRight: 6 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                backgroundColor: column.color || 'var(--flow-primary)',
                flexShrink: 0
              }}
            />

            {isEditingTitle ? (
              <form onSubmit={handleSaveTitle} style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
                <input
                  type="text"
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  autoFocus
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsEditingTitle(false);
                      setEditTitleValue(column.title);
                    }
                  }}
                  className="meta-field-input"
                  style={{
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    width: '100%',
                    height: 26
                  }}
                />
              </form>
            ) : (
              <h3
                className="column-title"
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  margin: 0,
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                onDoubleClick={() => {
                  setEditTitleValue(column.title);
                  setIsEditingTitle(true);
                }}
                title="Klik dua kali untuk ganti nama kolom"
              >
                {column.title}
              </h3>
            )}
          </div>

          {/* Right: Count & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span
              className="column-count"
              style={{
                fontSize: '0.74rem',
                background: 'var(--flow-bg-elevated)',
                borderRadius: 6,
                padding: '2px 7px',
                color: 'var(--flow-text-muted)',
                fontWeight: 600
              }}
            >
              {tasks.length}
            </span>

            {/* Column Options Menu Button */}
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 26, height: 26, borderRadius: 4 }}
                onClick={() => {
                  setShowMenu(!showMenu);
                  setShowColorPicker(false);
                }}
                title="Opsi Kolom (Edit / Hapus / Warna)"
              >
                <MoreHorizontal size={14} />
              </button>

              {/* Column Popover Menu */}
              {showMenu && (
                <div
                  style={{
                    position: 'absolute',
                    top: 30,
                    right: 0,
                    width: 190,
                    background: 'var(--flow-bg-surface)',
                    border: '1px solid var(--flow-border-subtle)',
                    borderRadius: 10,
                    boxShadow: 'var(--flow-shadow-lg)',
                    zIndex: 90,
                    padding: '6px 4px',
                    animation: 'fadeIn 0.1s ease'
                  }}
                >
                  <button
                    type="button"
                    className="tab-btn"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      fontSize: '0.78rem',
                      padding: '6px 8px',
                      border: 'none'
                    }}
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditingTitle(true);
                    }}
                  >
                    <Edit2 size={13} />
                    <span>Ganti Nama Kolom</span>
                  </button>

                  <button
                    type="button"
                    className="tab-btn"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      fontSize: '0.78rem',
                      padding: '6px 8px',
                      border: 'none'
                    }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  >
                    <Palette size={13} />
                    <span>Ubah Warna Label</span>
                  </button>

                  {/* Color Picker Submenu */}
                  {showColorPicker && (
                    <div
                      style={{
                        padding: '6px 8px',
                        display: 'flex',
                        gap: 6,
                        flexWrap: 'wrap',
                        borderTop: '1px solid var(--flow-border-subtle)',
                        borderBottom: '1px solid var(--flow-border-subtle)',
                        margin: '4px 0'
                      }}
                    >
                      {PRESET_COL_COLORS.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => handleSelectColor(hex)}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: hex,
                            border: column.color === hex ? '2px solid #fff' : 'none',
                            boxShadow: column.color === hex ? '0 0 0 2px var(--flow-primary)' : 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff'
                          }}
                        >
                          {column.color === hex && <Check size={10} strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  )}

                  {onMoveColumn && canMoveLeft && (
                    <button
                      type="button"
                      className="tab-btn"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        fontSize: '0.78rem',
                        padding: '6px 8px',
                        border: 'none'
                      }}
                      onClick={() => {
                        onMoveColumn(column.id, 'left');
                        setShowMenu(false);
                      }}
                    >
                      <ArrowLeft size={13} />
                      <span>Geser ke Kiri</span>
                    </button>
                  )}

                  {onMoveColumn && canMoveRight && (
                    <button
                      type="button"
                      className="tab-btn"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        fontSize: '0.78rem',
                        padding: '6px 8px',
                        border: 'none'
                      }}
                      onClick={() => {
                        onMoveColumn(column.id, 'right');
                        setShowMenu(false);
                      }}
                    >
                      <ArrowRight size={13} />
                      <span>Geser ke Kanan</span>
                    </button>
                  )}

                  <button
                    type="button"
                    className="tab-btn"
                    style={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      fontSize: '0.78rem',
                      padding: '6px 8px',
                      border: 'none'
                    }}
                    onClick={() => {
                      setIsAdding(true);
                      setShowMenu(false);
                    }}
                  >
                    <Plus size={13} />
                    <span>Tambah Kartu</span>
                  </button>

                  {onDeleteColumn && (
                    <div style={{ borderTop: '1px solid var(--flow-border-subtle)', marginTop: 4, paddingTop: 4 }}>
                      <button
                        type="button"
                        className="tab-btn"
                        style={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          fontSize: '0.78rem',
                          padding: '6px 8px',
                          border: 'none',
                          color: 'var(--flow-accent-rose)'
                        }}
                        onClick={() => {
                          setShowMenu(false);
                          setShowColDeleteConfirm(true);
                        }}
                      >
                        <Trash2 size={13} />
                        <span>Hapus Kolom</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="column-cards-list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columns={columns}
            onClick={() => onTaskClick(task)}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            isDragging={draggedTaskId === task.id}
            isSelected={selectedTaskIds.includes(task.id)}
            onToggleSelect={onToggleSelectTask}
            onToggleSubtaskInline={onToggleSubtaskInline}
            onDeleteTask={onDeleteTask}
            onUpdateTaskStatus={onUpdateTaskStatus}
            searchQuery={searchQuery}
            members={members}
          />
        ))}

        {tasks.length === 0 && !isAdding && (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              color: 'var(--flow-text-muted)',
              fontSize: '0.82rem',
              border: '1px dashed var(--flow-border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            Tarik kartu ke sini atau klik tambah
          </div>
        )}
      </div>

      {/* Quick Add Card Form */}
      {isAdding ? (
        <form className="quick-add-form" onSubmit={handleQuickAddSubmit}>
          <textarea
            className="quick-add-input"
            placeholder="Masukkan judul kartu tugas..."
            autoFocus
            rows={2}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleQuickAddSubmit();
              } else if (e.key === 'Escape') {
                setIsAdding(false);
              }
            }}
          />
          <div className="quick-add-actions">
            <button
              type="button"
              className="icon-btn"
              style={{ width: 28, height: 28 }}
              onClick={() => setIsAdding(false)}
            >
              <X size={15} />
            </button>
            <button
              type="submit"
              className="primary-btn"
              style={{ padding: '5px 12px', fontSize: '0.8rem' }}
            >
              Tambah
            </button>
          </div>
        </form>
      ) : (
        <button className="add-card-btn" onClick={() => setIsAdding(true)}>
          <Plus size={15} />
          <span>Tambah Kartu</span>
        </button>
      )}

      {/* Column Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showColDeleteConfirm}
        onClose={() => setShowColDeleteConfirm(false)}
        onConfirm={() => {
          if (onDeleteColumn) onDeleteColumn(column.id);
        }}
        title="Hapus Kolom"
        message={`Hapus kolom "${column.title}"? Seluruh tugas di dalamnya akan dialihkan secara aman ke kolom lain.`}
        confirmText="Ya, Hapus Kolom"
      />
    </div>
  );
});
