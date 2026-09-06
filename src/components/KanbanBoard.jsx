import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { KanbanColumn } from './KanbanColumn';
import { Plus } from 'lucide-react';
import { createActivityLog } from '../utils/activityHelper';

export const KanbanBoard = ({
  columns,
  tasks,
  setTasks,
  selectedTaskIds = [],
  onToggleSelectTask,
  onTaskClick,
  onQuickAddTask,
  onToggleSubtaskInline,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  onMoveColumn,
  onDeleteTask,
  onUpdateTaskStatus,
  onTaskMoveSuccess,
  searchQuery = '',
  members
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
  };

  const handleDropOnColumn = (targetColumnId) => {
    if (!draggedTaskId) return;

    const taskToMove = tasks.find((t) => t.id === draggedTaskId);
    if (!taskToMove || taskToMove.status === targetColumnId) {
      setDraggedTaskId(null);
      return;
    }

    // Trigger celebratory confetti if moved to "done"
    if (targetColumnId === 'done') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 }
      });
    }

    const colObj = columns.find((c) => c.id === targetColumnId);
    const updatedTasks = tasks.map((task) => {
      if (task.id === draggedTaskId) {
        return {
          ...task,
          status: targetColumnId,
          activityLog: [
            createActivityLog(`Status diubah ke "${colObj ? colObj.title : targetColumnId}"`),
            ...(task.activityLog || [])
          ]
        };
      }
      return task;
    });

    setTasks(updatedTasks);
    if (onTaskMoveSuccess) {
      onTaskMoveSuccess(taskToMove.title, colObj ? colObj.title : targetColumnId);
    }
    setDraggedTaskId(null);
  };

  const handleCreateColumn = (e) => {
    e?.preventDefault();
    if (!newColTitle.trim()) return;
    const colId = newColTitle.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now().toString().slice(-4);
    const colors = ['#06b6d4', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddColumn({
      id: colId,
      title: newColTitle.trim(),
      color: randomColor,
      badge: newColTitle.trim().slice(0, 5)
    });
    setNewColTitle('');
    setIsAddingCol(false);
  };

  return (
    <div className="board-container">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);
        return (
          <KanbanColumn
            key={column.id}
            column={column}
            columns={columns}
            tasks={columnTasks}
            selectedTaskIds={selectedTaskIds}
            onToggleSelectTask={onToggleSelectTask}
            onTaskClick={onTaskClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDropOnColumn}
            draggedTaskId={draggedTaskId}
            onQuickAddTask={onQuickAddTask}
            onToggleSubtaskInline={onToggleSubtaskInline}
            onUpdateColumn={onUpdateColumn}
            onDeleteColumn={onDeleteColumn}
            onMoveColumn={onMoveColumn}
            onDeleteTask={onDeleteTask}
            onUpdateTaskStatus={onUpdateTaskStatus}
            searchQuery={searchQuery}
            members={members}
          />
        );
      })}

      {/* Add New Column Button */}
      <div style={{ minWidth: 260 }}>
        {isAddingCol ? (
          <form
            onSubmit={handleCreateColumn}
            style={{
              background: 'var(--bg-surface)',
              padding: 12,
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-focus)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8
            }}
          >
            <input
              type="text"
              className="meta-field-input"
              placeholder="Nama kolom baru..."
              value={newColTitle}
              onChange={(e) => setNewColTitle(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
              <button
                type="button"
                className="icon-btn"
                style={{ width: 28, height: 28 }}
                onClick={() => setIsAddingCol(false)}
              >
                ✕
              </button>
              <button
                type="submit"
                className="primary-btn"
                style={{ padding: '4px 12px', fontSize: '0.8rem' }}
              >
                Simpan
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingCol(true)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface)',
              border: '1px dashed var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Tambah Kolom Baru</span>
          </button>
        )}
      </div>
    </div>
  );
};
