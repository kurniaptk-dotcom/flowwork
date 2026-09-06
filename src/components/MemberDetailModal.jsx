import React, { useState } from 'react';
import { X, Mail, Shield, CheckCircle2, Clock, AlertCircle, MessageSquare, Briefcase, Building, CheckSquare, ChevronRight, Plus } from 'lucide-react';
import { createActivityLog } from '../utils/activityHelper';

export default function MemberDetailModal({
  isOpen,
  onClose,
  member,
  tasks = [],
  onSelectTask,
  onStartChat,
  onEditMember,
  onAssignTask
}) {
  const [isAssigningTask, setIsAssigningTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('normal');
  const [taskDueDate, setTaskDueDate] = useState('');

  if (!isOpen || !member) return null;

  // Filter tasks assigned to this member (by name or id)
  const memberTasks = tasks.filter(
    (t) => t.assignee === member.name || t.assigneeId === member.id || t.assignee === member.id
  );
  const completedTasks = memberTasks.filter((t) => t.status === 'done');
  const inProgressTasks = memberTasks.filter((t) => t.status === 'in_progress' || t.status === 'inprogress');
  const todoTasks = memberTasks.filter((t) => t.status === 'todo' || t.status === 'backlog');

  const completionRate =
    memberTasks.length > 0
      ? Math.round((completedTasks.length / memberTasks.length) * 100)
      : 0;

  const capacity = member.capacity || 5;
  const loadPercent = Math.round((memberTasks.filter(t => t.status !== 'done').length / capacity) * 100);

  let loadStatusLabel = 'Optimal';
  let loadStatusColor = 'var(--flow-accent-emerald)';
  if (loadPercent > 80) {
    loadStatusLabel = 'Heavy / Overloaded';
    loadStatusColor = 'var(--flow-accent-rose)';
  } else if (loadPercent < 40) {
    loadStatusLabel = 'Light / Available';
    loadStatusColor = 'var(--flow-accent-cyan)';
  }

  const handleQuickAssign = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask = {
      id: 'task-' + Date.now(),
      title: taskTitle.trim(),
      description: `Tugas didelegasikan secara langsung kepada ${member.name} dari Team Workload Hub.`,
      status: 'todo',
      priority: taskPriority,
      dueDate: taskDueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      assignee: member.name,
      assigneeId: member.id,
      spaceId: 'space-all',
      subtasks: [],
      activityLog: [
        createActivityLog(`Menugaskan tugas kepada ${member.name}`)
      ],
      activity: [
        {
          id: 'act-' + Date.now(),
          user: 'Kurnia',
          action: `Menugaskan tugas kepada ${member.name}`,
          createdAt: Date.now(),
          timestamp: 'Baru saja'
        }
      ]
    };

    if (onAssignTask) {
      onAssignTask(newTask);
    }

    setTaskTitle('');
    setTaskPriority('normal');
    setTaskDueDate('');
    setIsAssigningTask(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{
          maxWidth: 620,
          borderRadius: 16,
          overflow: 'hidden',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '88vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div
          style={{
            height: 100,
            background: 'var(--flow-pilot-gradient)',
            position: 'relative',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          {/* Avatar floating */}
          <div
            style={{
              position: 'absolute',
              bottom: -28,
              left: 24,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 12
            }}
          >
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 14,
                backgroundColor: member.color || 'var(--flow-primary)',
                border: '4px solid var(--flow-bg-surface)',
                boxShadow: 'var(--flow-shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.25rem',
                fontWeight: 800
              }}
            >
              {member.avatar || member.name.charAt(0)}
            </div>
            <div style={{ marginBottom: 4 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 999,
                  backgroundColor: 'var(--flow-bg-surface)',
                  border: '1px solid var(--flow-border-subtle)',
                  color:
                    member.status === 'active'
                      ? 'var(--flow-accent-emerald)'
                      : member.status === 'away'
                      ? 'var(--flow-accent-amber)'
                      : 'var(--flow-text-muted)',
                  boxShadow: 'var(--flow-shadow-sm)'
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor:
                      member.status === 'active'
                        ? 'var(--flow-accent-emerald)'
                        : member.status === 'away'
                        ? 'var(--flow-accent-amber)'
                        : 'var(--flow-text-muted)'
                  }}
                />
                {member.status === 'active' ? 'Active Now' : member.status === 'away' ? 'Away' : 'On Leave'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: 'rgba(0,0,0,0.25)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 'auto',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Member Bio & Quick Actions */}
        <div style={{ paddingTop: 38, paddingLeft: 24, paddingRight: 24, paddingBottom: 16, borderBottom: '1px solid var(--flow-border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--flow-text-main)', margin: 0 }}>
                  {member.name}
                </h2>
                {member.isOwner && <span className="flow-owner-badge">Owner</span>}
                <span className="flow-dept-tag">{member.department || 'General'}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: '0.8rem', color: 'var(--flow-text-muted)' }}>
                <span style={{ fontWeight: 600, color: 'var(--flow-text-subtle)' }}>{member.role || 'Member'}</span>
                <span>•</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Mail size={12} />
                  {member.email}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {onStartChat && (
                <button
                  type="button"
                  className="flow-cal-add-btn"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  onClick={() => {
                    onClose();
                    onStartChat(member);
                  }}
                >
                  <MessageSquare size={13} />
                  <span>Kirim Pesan</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 18 }}>
            <div style={{ backgroundColor: 'var(--flow-bg-elevated)', border: '1px solid var(--flow-border-subtle)', borderRadius: 10, padding: '10px 12px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', display: 'block', marginBottom: 2 }}>
                Tugas Ditugaskan
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--flow-text-main)' }}>
                {memberTasks.length} Tugas
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--flow-bg-elevated)', border: '1px solid var(--flow-border-subtle)', borderRadius: 10, padding: '10px 12px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', display: 'block', marginBottom: 2 }}>
                Tingkat Selesai
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--flow-accent-emerald)' }}>
                {completionRate}%
              </span>
            </div>

            <div style={{ backgroundColor: 'var(--flow-bg-elevated)', border: '1px solid var(--flow-border-subtle)', borderRadius: 10, padding: '10px 12px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', display: 'block', marginBottom: 2 }}>
                Kapasitas Beban Kerja
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: loadStatusColor }}>
                {loadStatusLabel.split(' ')[0]} ({loadPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Tasks List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--flow-text-muted)', margin: 0 }}>
              Daftar Tugas Aktif ({memberTasks.length})
            </h4>

            <button
              type="button"
              className="tab-btn"
              style={{
                fontSize: '0.78rem',
                padding: '4px 10px',
                color: 'var(--flow-primary)',
                borderColor: 'var(--flow-primary-light)',
                backgroundColor: isAssigningTask ? 'var(--flow-primary-light)' : 'transparent'
              }}
              onClick={() => setIsAssigningTask(!isAssigningTask)}
            >
              <Plus size={13} />
              <span>{isAssigningTask ? 'Tutup Form' : '+ Tugaskan Tugas'}</span>
            </button>
          </div>

          {/* Inline Quick Task Assignment Form */}
          {isAssigningTask && (
            <form
              onSubmit={handleQuickAssign}
              style={{
                backgroundColor: 'var(--flow-bg-elevated)',
                border: '1px solid var(--flow-border-subtle)',
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
                animation: 'fadeIn 0.15s ease'
              }}
            >
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--flow-text-main)', marginBottom: 8 }}>
                Delegasikan Tugas Baru ke {member.name}
              </div>

              <input
                type="text"
                placeholder="Judul tugas baru..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                autoFocus
                className="meta-field-input"
                style={{
                  width: '100%',
                  fontSize: '0.84rem',
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--flow-border-subtle)',
                  backgroundColor: 'var(--flow-bg-surface)',
                  color: 'var(--flow-text-main)',
                  marginBottom: 10
                }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--flow-text-muted)', marginBottom: 4 }}>
                    Prioritas
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="filter-select"
                    style={{ width: '100%', fontSize: '0.8rem', padding: '6px 8px' }}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">Tinggi (High)</option>
                    <option value="urgent">Mendesak (Urgent)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, color: 'var(--flow-text-muted)', marginBottom: 4 }}>
                    Tenggat Waktu
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="meta-field-input"
                    style={{ width: '100%', fontSize: '0.8rem', padding: '6px 8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  className="tab-btn"
                  style={{ fontSize: '0.76rem', padding: '4px 10px' }}
                  onClick={() => setIsAssigningTask(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flow-add-task-btn"
                  style={{ fontSize: '0.76rem', padding: '4px 12px' }}
                  disabled={!taskTitle.trim()}
                >
                  Tugaskan Sekarang
                </button>
              </div>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {memberTasks.map((t) => {
              const isDone = t.status === 'done';

              return (
                <div
                  key={t.id}
                  className="flow-agenda-item"
                  style={{ padding: '10px 14px' }}
                  onClick={() => {
                    onClose();
                    if (onSelectTask) onSelectTask(t);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                    {isDone ? (
                      <CheckCircle2 size={16} color="var(--flow-accent-emerald)" />
                    ) : (
                      <Clock size={16} color="var(--flow-accent-cyan)" />
                    )}
                    <span
                      style={{
                        fontSize: '0.86rem',
                        fontWeight: 600,
                        color: 'var(--flow-text-main)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        opacity: isDone ? 0.6 : 1
                      }}
                    >
                      {t.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '2px 7px',
                        borderRadius: 4,
                        backgroundColor: isDone ? 'rgba(16, 185, 129, 0.12)' : 'var(--flow-bg-elevated)',
                        color: isDone ? 'var(--flow-accent-emerald)' : 'var(--flow-text-subtle)'
                      }}
                    >
                      {t.status}
                    </span>
                    <ChevronRight size={14} color="var(--flow-text-muted)" />
                  </div>
                </div>
              );
            })}

            {memberTasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--flow-text-muted)', fontSize: '0.84rem' }}>
                Belum ada tugas yang ditugaskan kepada anggota ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
