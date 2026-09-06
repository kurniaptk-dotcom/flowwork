import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Flame,
  Clock,
  ArrowDown,
  Trash2
} from 'lucide-react';
import { INITIAL_TAGS, INITIAL_MEMBERS, INITIAL_PRIORITIES } from '../data/initialData';
import { ConfirmModal } from './ConfirmModal';
import { createActivityLog } from '../utils/activityHelper';
import { HighlightText } from './HighlightText';

export const ListView = ({
  columns,
  tasks = [],
  setTasks,
  selectedTaskIds = [],
  onToggleSelectTask,
  onTaskClick,
  onQuickAddTask,
  onDeleteTask,
  onResetFilters,
  hasActiveFilters = false,
  onOpenNewTask,
  searchQuery = '',
  members = INITIAL_MEMBERS
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [quickTitleByCol, setQuickTitleByCol] = useState({});
  const [taskToDelete, setTaskToDelete] = useState(null);

  const toggleGroup = (colId) => {
    setCollapsedGroups((prev) => ({ ...prev, [colId]: !prev[colId] }));
  };

  // tasks is already filtered and sorted centrally from App.jsx
  const displayTasks = tasks;

  const handleStatusChange = (taskId, newStatus) => {
    const colObj = columns.find((c) => c.id === newStatus);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              activityLog: [
                createActivityLog(`Status diubah ke "${colObj ? colObj.title : newStatus}" via List View`),
                ...(t.activityLog || [])
              ]
            }
          : t
      )
    );
  };

  const handlePriorityChange = (taskId, newPriority) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t))
    );
  };

  const handleDeleteTask = (task, e) => {
    e.stopPropagation();
    setTaskToDelete(task);
  };

  const handleQuickAdd = (colId) => {
    const title = quickTitleByCol[colId];
    if (!title || !title.trim()) return;
    onQuickAddTask(colId, title.trim());
    setQuickTitleByCol((prev) => ({ ...prev, [colId]: '' }));
  };

  if (displayTasks.length === 0) {
    return (
      <div className="flow-area-empty-state">
        <div className="flow-area-empty-icon">
          <CheckSquare size={26} />
        </div>
        <h3 style={{ margin: '4px 0 0 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
          {hasActiveFilters ? 'Tidak ada tugas yang cocok dengan filter' : 'Belum ada tugas di ruang kerja ini'}
        </h3>
        <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--flow-text-muted)', maxWidth: 420 }}>
          {hasActiveFilters
            ? 'Coba bersihkan kata kunci pencarian atau sesuaikan opsi prioritas dan anggota tim.'
            : 'Mulai dengan menambahkan tugas baru ke ruang kerja ini.'}
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {hasActiveFilters && onResetFilters && (
            <button type="button" className="flow-reset-filter-btn" onClick={onResetFilters}>
              Reset Semua Filter
            </button>
          )}
          {onOpenNewTask && (
            <button type="button" className="flow-add-task-btn" onClick={onOpenNewTask}>
              <Plus size={14} /> + Tugas Baru
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="list-view-container">
      {columns.map((column) => {
        const groupTasks = displayTasks.filter((t) => t.status === column.id);
        const isCollapsed = collapsedGroups[column.id];

        return (
          <div key={column.id} className="list-group">
            {/* Group Header */}
            <div className="list-group-header" onClick={() => toggleGroup(column.id)}>
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
              <span
                className="column-pill"
                style={{ backgroundColor: column.color, fontSize: '0.78rem' }}
              >
                {column.badge}
              </span>
              <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                {column.title}
              </span>
              <span className="column-count">{groupTasks.length}</span>
            </div>

            {/* Group Table */}
            {!isCollapsed && (
              <div className="list-table-wrapper">
                <table className="list-table">
                  <thead>
                    <tr>
                      <th style={{ width: '38%' }}>Task Name</th>
                      <th style={{ width: '16%' }}>Status</th>
                      <th style={{ width: '13%' }}>Priority</th>
                      <th style={{ width: '13%' }}>Due Date</th>
                      <th style={{ width: '10%' }}>Assignee</th>
                      <th style={{ width: '10%' }}>Subtasks</th>
                      <th style={{ width: '5%', textAlign: 'right' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupTasks.length === 0 && (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            padding: '16px',
                            fontStyle: 'italic',
                            fontSize: '0.82rem'
                          }}
                        >
                          Belum ada tugas di status ini
                        </td>
                      </tr>
                    )}

                    {groupTasks.map((task) => {
                      const memberList = members && members.length > 0 ? members : INITIAL_MEMBERS;
                      const assignee = memberList.find((m) => m.id === task.assignee || m.name === task.assignee);
                      const completedSub = task.subtasks?.filter((s) => s.completed).length || 0;
                      const totalSub = task.subtasks?.length || 0;

                      const isSelected = selectedTaskIds.includes(task.id);
                      return (
                        <tr
                          key={task.id}
                          style={{
                            backgroundColor: isSelected ? 'var(--flow-primary-light)' : undefined,
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {onToggleSelectTask && (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => onToggleSelectTask(task.id)}
                                  style={{ cursor: 'pointer', accentColor: 'var(--flow-primary)', width: 14, height: 14 }}
                                />
                              )}
                              <div className="list-task-name" onClick={() => onTaskClick(task)} style={{ flex: 1 }}>
                                <span>
                                  <HighlightText text={task.title} highlight={searchQuery} />
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Inline Status Dropdown */}
                          <td>
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              className="filter-select"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {columns.map((col) => (
                                <option key={col.id} value={col.id}>
                                  {col.title}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Inline Priority Dropdown */}
                          <td>
                            <select
                              value={task.priority}
                              onChange={(e) => handlePriorityChange(task.id, e.target.value)}
                              className="filter-select"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                color: INITIAL_PRIORITIES[task.priority]?.color || 'inherit',
                                fontWeight: 600
                              }}
                            >
                              <option value="urgent">🔴 Urgent</option>
                              <option value="high">🟠 High</option>
                              <option value="normal">🔵 Normal</option>
                              <option value="low">⚪ Low</option>
                            </select>
                          </td>

                          {/* Due Date */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                              <Calendar size={13} color="var(--text-muted)" />
                              <span>{task.dueDate || '-'}</span>
                            </div>
                          </td>

                          {/* Assignee */}
                          <td>
                            {assignee ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div
                                  className="avatar"
                                  style={{ width: 22, height: 22, backgroundColor: assignee.color }}
                                >
                                  {assignee.avatar}
                                </div>
                                <span style={{ fontSize: '0.82rem' }}>{assignee.name.split(' ')[0]}</span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>-</span>
                            )}
                          </td>

                          {/* Subtasks */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem' }}>
                              <CheckSquare size={13} color="var(--text-muted)" />
                              <span>
                                {completedSub}/{totalSub}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className="icon-btn"
                              style={{ width: 28, height: 28, marginLeft: 'auto', color: 'var(--flow-accent-rose)' }}
                              onClick={(e) => handleDeleteTask(task, e)}
                              title="Hapus Tugas"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Inline Add Row for this status */}
                    <tr>
                      <td colSpan="7" style={{ padding: '10px 18px', background: 'var(--bg-surface)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Plus size={14} color="var(--text-muted)" />
                          <input
                            type="text"
                            placeholder={`+ Tambah tugas baru ke ${column.title} (tekan Enter)...`}
                            value={quickTitleByCol[column.id] || ''}
                            onChange={(e) =>
                              setQuickTitleByCol({ ...quickTitleByCol, [column.id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleQuickAdd(column.id);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-primary)',
                              fontSize: '0.84rem',
                              outline: 'none',
                              width: '100%'
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            if (onDeleteTask) {
              onDeleteTask(taskToDelete.id);
            } else {
              setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
            }
            setTaskToDelete(null);
          }
        }}
        title="Hapus Tugas"
        message={`Apakah Anda yakin ingin menghapus tugas "${taskToDelete?.title}"?`}
        confirmText="Ya, Hapus"
      />
    </div>
  );
};
