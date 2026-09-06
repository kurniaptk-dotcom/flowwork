import React, { useState, useRef, useEffect } from 'react';
import {
  CheckSquare,
  Calendar,
  AlertTriangle,
  Flame,
  Clock,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRightCircle
} from 'lucide-react';
import { INITIAL_TAGS, INITIAL_MEMBERS } from '../data/initialData';
import { ConfirmModal } from './ConfirmModal';
import { HighlightText } from './HighlightText';

export const TaskCard = React.memo(({
  task,
  columns = [],
  onClick,
  onDragStart,
  onDragEnd,
  isDragging,
  isSelected,
  onToggleSelect,
  onToggleSubtaskInline,
  onDeleteTask,
  onUpdateTaskStatus,
  searchQuery = '',
  members = INITIAL_MEMBERS
}) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showCardMenu, setShowCardMenu] = useState(false);
  const [showStatusSubmenu, setShowStatusSubmenu] = useState(false);
  const [showCardDeleteConfirm, setShowCardDeleteConfirm] = useState(false);
  const menuRef = useRef(null);

  const completedSubtasks = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const allSubtasksDone = totalSubtasks > 0 && completedSubtasks === totalSubtasks;

  const memberList = members && members.length > 0 ? members : INITIAL_MEMBERS;
  const assignee = memberList.find((m) => m.id === task.assignee || m.name === task.assignee);

  // Close card menu on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowCardMenu(false);
        setShowStatusSubmenu(false);
      }
    };
    if (showCardMenu) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showCardMenu]);

  // Due Date calculation
  const getDueStatus = (dueDateStr) => {
    if (!dueDateStr) return null;
    const due = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: `${Math.abs(diffDays)}h lalu`, status: 'overdue' };
    if (diffDays === 0) return { label: 'Hari ini', status: 'today' };
    if (diffDays === 1) return { label: 'Besok', status: 'upcoming' };
    return {
      label: due.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      status: 'upcoming'
    };
  };

  const dueStatus = getDueStatus(task.dueDate);

  // Priority icon helper
  const renderPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle size={14} color="#ef4444" />;
      case 'high':
        return <Flame size={14} color="#f97316" />;
      case 'normal':
        return <Clock size={14} color="#3b82f6" />;
      case 'low':
        return <ArrowDown size={14} color="#64748b" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`task-card ${isDragging ? 'is-dragging' : ''} ${isSelected ? 'is-selected' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{
        position: 'relative',
        borderColor: isSelected ? 'var(--flow-primary)' : undefined,
        backgroundColor: isSelected ? 'var(--flow-primary-light)' : undefined,
        boxShadow: isSelected ? '0 0 0 1.5px var(--flow-primary)' : undefined
      }}
    >
      {/* Top row: Checkbox, Tags & 3-dots Quick Action Menu */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
          {/* Multi-Select Checkbox */}
          {onToggleSelect && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(task.id);
              }}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0
              }}
              title={isSelected ? 'Batalkan pilihan' : 'Pilih tugas (Multi-select)'}
            >
              <input
                type="checkbox"
                checked={Boolean(isSelected)}
                onChange={() => {}}
                style={{ cursor: 'pointer', accentColor: 'var(--flow-primary)', width: 14, height: 14 }}
              />
            </div>
          )}

          {/* Tags */}
          <div className="card-tags" style={{ marginBottom: 0 }}>
            {task.tags && task.tags.length > 0 ? (
              task.tags.map((tagId) => {
                const tag = INITIAL_TAGS.find((t) => t.id === tagId);
                if (!tag) return null;
                return (
                  <span
                    key={tag.id}
                    className="tag-badge"
                    style={{ backgroundColor: tag.bg, color: tag.color }}
                  >
                    {tag.label}
                  </span>
                );
              })
            ) : (
              <span style={{ fontSize: '0.66rem', color: 'var(--flow-text-muted)' }}>
                {task.projectId ? `#${task.projectId}` : ''}
              </span>
            )}
          </div>
        </div>

        {/* Quick 3-dots Menu Button */}
        <div style={{ position: 'relative' }} ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="icon-btn task-menu-trigger"
            style={{ width: 22, height: 22, borderRadius: 4, padding: 0, opacity: showCardMenu ? 1 : 0.6 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowCardMenu(!showCardMenu);
              setShowStatusSubmenu(false);
            }}
            title="Aksi Cepat Tugas"
          >
            <MoreVertical size={13} />
          </button>

          {/* Quick Actions Dropdown */}
          {showCardMenu && (
            <div
              style={{
                position: 'absolute',
                top: 24,
                right: 0,
                width: 170,
                background: 'var(--flow-bg-surface)',
                border: '1px solid var(--flow-border-subtle)',
                borderRadius: 8,
                boxShadow: 'var(--flow-shadow-lg)',
                zIndex: 80,
                padding: '4px 2px',
                animation: 'fadeIn 0.1s ease'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="tab-btn"
                style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.78rem', padding: '6px 8px', border: 'none' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCardMenu(false);
                  onClick();
                }}
              >
                <Edit2 size={12} />
                <span>Edit Tugas</span>
              </button>

              {columns.length > 0 && onUpdateTaskStatus && (
                <>
                  <button
                    type="button"
                    className="tab-btn"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.78rem', padding: '6px 8px', border: 'none' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowStatusSubmenu(!showStatusSubmenu);
                    }}
                  >
                    <ArrowRightCircle size={12} />
                    <span>Ubah Status</span>
                  </button>

                  {showStatusSubmenu && (
                    <div style={{ padding: '2px 4px', borderTop: '1px solid var(--flow-border-subtle)', borderBottom: '1px solid var(--flow-border-subtle)', margin: '2px 0' }}>
                      {columns.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '4px 6px',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: '0.74rem',
                            fontWeight: task.status === c.id ? 700 : 500,
                            color: task.status === c.id ? 'var(--flow-primary)' : 'var(--flow-text-main)',
                            background: task.status === c.id ? 'var(--flow-primary-light)' : 'transparent'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateTaskStatus(task.id, c.id);
                            setShowCardMenu(false);
                            setShowStatusSubmenu(false);
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: c.color }} />
                          <span>{c.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {onDeleteTask && (
                <div style={{ borderTop: '1px solid var(--flow-border-subtle)', marginTop: 2, paddingTop: 2 }}>
                  <button
                    type="button"
                    className="tab-btn"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.78rem', padding: '6px 8px', border: 'none', color: 'var(--flow-accent-rose)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCardMenu(false);
                      setShowCardDeleteConfirm(true);
                    }}
                  >
                    <Trash2 size={12} />
                    <span>Hapus Tugas</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4 className="card-title">
        <HighlightText text={task.title} highlight={searchQuery} />
      </h4>

      {/* Quick Subtask List Expandable */}
      {showSubtasks && task.subtasks && task.subtasks.length > 0 && (
        <div
          className="inline-subtasks-preview"
          onClick={(e) => e.stopPropagation()}
        >
          {task.subtasks.map((st) => (
            <div
              key={st.id}
              className={`inline-subtask-row ${st.completed ? 'completed' : ''}`}
              onClick={() => onToggleSubtaskInline(task.id, st.id)}
            >
              <span className={`inline-checkbox ${st.completed ? 'checked' : ''}`}>
                {st.completed ? '✓' : ''}
              </span>
              <span className="inline-subtask-text">{st.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Card Metadata Footer */}
      <div className="card-meta">
        <div className="card-meta-left">
          {/* Subtasks Count (Clickable to preview/toggle inline) */}
          {totalSubtasks > 0 && (
            <button
              type="button"
              className={`subtask-badge ${allSubtasksDone ? 'all-done' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowSubtasks(!showSubtasks);
              }}
              title="Klik untuk lihat/centang checklist cepat"
              style={{ cursor: 'pointer', background: 'none', border: 'none' }}
            >
              <CheckSquare size={13} />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
              {showSubtasks ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            </button>
          )}

          {/* Due Date */}
          {dueStatus && (
            <div className={`due-badge ${dueStatus.status}`} title={`Tenggat: ${task.dueDate}`}>
              <Calendar size={13} />
              <span>{dueStatus.label}</span>
            </div>
          )}
        </div>

        <div className="card-meta-right">
          {/* Priority Icon */}
          <div className="priority-flag" title={`Prioritas: ${task.priority}`}>
            {renderPriorityIcon(task.priority)}
          </div>

          {/* Assignee Avatar */}
          {assignee && (
            <div
              className="avatar"
              style={{ backgroundColor: assignee.color }}
              title={`${assignee.name} (${assignee.role})`}
            >
              {assignee.avatar}
            </div>
          )}
        </div>
      </div>

      {/* Task Card Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showCardDeleteConfirm}
        onClose={() => setShowCardDeleteConfirm(false)}
        onConfirm={() => {
          if (onDeleteTask) onDeleteTask(task.id);
        }}
        title="Hapus Tugas"
        message={`Apakah Anda yakin ingin menghapus tugas "${task.title}"?`}
        confirmText="Ya, Hapus"
      />
    </div>
  );
});
