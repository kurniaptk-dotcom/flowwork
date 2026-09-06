import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  LayoutGrid,
  ListFilter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Flame,
  User,
  FolderKanban,
  CheckSquare,
  Sparkles,
  ArrowRight,
  Filter,
  X
} from 'lucide-react';
import { INITIAL_PRIORITIES, INITIAL_TAGS } from '../data/initialData';
import { createActivityLog } from '../utils/activityHelper';

export const CalendarView = ({
  tasks = [],
  setTasks,
  onTaskClick,
  onOpenNewTaskWithDate,
  members = [],
  spaces = [],
  columns = [],
  onAddToast
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'week' | 'agenda'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'done'
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [inlineQuickTitle, setInlineQuickTitle] = useState({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const dayNamesShort = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const dayNamesFull = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // Current today string YYYY-MM-DD
  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];

  // Filter tasks based on statusFilter
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      if (statusFilter === 'pending') return task.status !== 'done';
      if (statusFilter === 'done') return task.status === 'done';
      return true;
    });
  }, [tasks, statusFilter]);

  // Productivity Metrics
  const metrics = useMemo(() => {
    const totalScheduled = tasks.filter((t) => t.dueDate).length;
    const completedScheduled = tasks.filter((t) => t.dueDate && t.status === 'done').length;
    const urgentCount = tasks.filter((t) => t.dueDate && t.priority === 'urgent' && t.status !== 'done').length;

    // Check tasks due this week
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const dueThisWeek = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= startOfWeek && d <= endOfWeek;
    }).length;

    return {
      totalScheduled,
      completedScheduled,
      urgentCount,
      dueThisWeek,
      completionRate: totalScheduled > 0 ? Math.round((completedScheduled / totalScheduled) * 100) : 0
    };
  }, [tasks]);

  // Month Grid Calculation
  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // 0 = Mon, 6 = Sun

    const totalDays = lastDay.getDate();
    const cells = [];

    // Previous month trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      cells.push({
        date: new Date(year, month, d),
        isCurrentMonth: true
      });
    }

    // Next month fill
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remaining = totalSlots - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return cells;
  }, [year, month]);

  // Week View Days Calculation (7 days of selected week)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const monday = new Date(curr.setDate(diff));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay);
    }
    return days;
  }, [currentDate]);

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCurrentDate(prevWeek);
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCurrentDate(nextWeek);
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Drag and Drop rescheduling
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnDate = (targetDateStr) => {
    if (!draggedTaskId || !setTasks) return;
    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task || task.dueDate === targetDateStr) {
      setDraggedTaskId(null);
      return;
    }

    const formattedDate = new Date(targetDateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggedTaskId
          ? {
              ...t,
              dueDate: targetDateStr,
              activityLog: [
                createActivityLog(`Tenggat waktu dijadwalkan ulang ke ${formattedDate} via Kalender`),
                ...(t.activityLog || [])
              ]
            }
          : t
      )
    );

    setDraggedTaskId(null);
    if (onAddToast) {
      onAddToast(`"${task.title}" dijadwalkan ulang ke ${formattedDate}`, 'success');
    }
  };

  // Inline Quick Add for Week View
  const handleInlineQuickAdd = (dateStr) => {
    const text = inlineQuickTitle[dateStr];
    if (!text || !text.trim() || !setTasks) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: text.trim(),
      description: 'Dibuat langsung melalui Schedule Planner',
      status: 'todo',
      priority: 'normal',
      dueDate: dateStr,
      tags: ['Schedule'],
      assignee: 'Kurnia',
      assigneeId: 'm1',
      subtasks: [],
      activityLog: [
        createActivityLog('Tugas dijadwalkan via Kalender')
      ]
    };

    setTasks((prev) => [newTask, ...prev]);
    setInlineQuickTitle((prev) => ({ ...prev, [dateStr]: '' }));
    if (onAddToast) {
      onAddToast(`Tugas berhasil dijadwalkan pada ${dateStr}`, 'success');
    }
  };

  // Toggle task done directly
  const handleToggleTaskDone = (e, taskId) => {
    e.stopPropagation();
    if (!setTasks) return;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'done' ? 'in-progress' : 'done';
          return {
            ...t,
            status: nextStatus,
            activityLog: [
              createActivityLog(`Status diubah ke ${nextStatus === 'done' ? 'Selesai' : 'In Progress'} via Kalender`),
              ...(t.activityLog || [])
            ]
          };
        }
        return t;
      })
    );
  };

  // Agenda Groups Calculation
  const agendaGroups = useMemo(() => {
    const overdue = [];
    const today = [];
    const tomorrow = [];
    const thisWeek = [];
    const upcoming = [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const tmr = new Date(now);
    tmr.setDate(tmr.getDate() + 1);

    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    filteredTasks.forEach((t) => {
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);

      if (d < now && t.status !== 'done') {
        overdue.push(t);
      } else if (d.getTime() === now.getTime()) {
        today.push(t);
      } else if (d.getTime() === tmr.getTime()) {
        tomorrow.push(t);
      } else if (d > tmr && d <= endOfWeek) {
        thisWeek.push(t);
      } else if (d > endOfWeek) {
        upcoming.push(t);
      }
    });

    return [
      { id: 'overdue', label: 'Terlewat / Overdue', items: overdue, color: 'var(--flow-accent-rose)', icon: AlertCircle },
      { id: 'today', label: 'Hari Ini', items: today, color: 'var(--flow-primary)', icon: Sparkles },
      { id: 'tomorrow', label: 'Besok', items: tomorrow, color: 'var(--flow-accent-cyan)', icon: Clock },
      { id: 'thisWeek', label: 'Minggu Ini', items: thisWeek, color: 'var(--flow-accent-amber)', icon: CalendarIcon },
      { id: 'upcoming', label: 'Mendatang', items: upcoming, color: 'var(--flow-text-muted)', icon: ArrowRight }
    ].filter((g) => g.items.length > 0);
  }, [filteredTasks]);

  return (
    <div className="flow-calendar-wrapper">
      {/* 1. Header Toolbar */}
      <div className="flow-calendar-toolbar">
        {/* Left: Month / Period Title & Jump to Today */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 className="flow-cal-title">
              {monthNames[month]} {year}
            </h2>
            {viewMode === 'week' && (
              <span className="flow-cal-subtext">
                (Pekan {Math.ceil(currentDate.getDate() / 7)})
              </span>
            )}
          </div>

          <button
            type="button"
            className="flow-cal-btn-today"
            onClick={handleToday}
            title="Kembali ke hari ini"
          >
            Hari Ini
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="icon-btn" onClick={handlePrev} title="Sebelumnya">
              <ChevronLeft size={16} />
            </button>
            <button className="icon-btn" onClick={handleNext} title="Berikutnya">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Right: View Mode Selector & Quick Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Status Filter */}
          <div className="flow-cal-filter-wrap">
            <Filter size={13} color="var(--flow-text-muted)" />
            <select
              className="flow-cal-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="pending">Belum Selesai</option>
              <option value="done">Selesai</option>
            </select>
          </div>

          {/* View Modes (Month / Week / Agenda) */}
          <div className="flow-cal-modes">
            <button
              className={`flow-mode-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
            >
              <LayoutGrid size={14} />
              <span>Bulan</span>
            </button>
            <button
              className={`flow-mode-btn ${viewMode === 'week' ? 'active' : ''}`}
              onClick={() => setViewMode('week')}
            >
              <CalendarIcon size={14} />
              <span>Minggu</span>
            </button>
            <button
              className={`flow-mode-btn ${viewMode === 'agenda' ? 'active' : ''}`}
              onClick={() => setViewMode('agenda')}
            >
              <ListFilter size={14} />
              <span>Agenda</span>
            </button>
          </div>

          {/* New Schedule Button */}
          <button
            className="flow-cal-add-btn"
            onClick={() => onOpenNewTaskWithDate(todayStr)}
          >
            <Plus size={15} />
            <span>Jadwalkan Tugas</span>
          </button>
        </div>
      </div>

      {/* 2. Productivity Snapshot Bar */}
      <div className="flow-cal-metrics-bar">
        <div className="flow-metric-item">
          <span className="flow-metric-label">Total Terjadwal</span>
          <span className="flow-metric-val">{metrics.totalScheduled} Tugas</span>
        </div>
        <div className="flow-metric-divider" />
        <div className="flow-metric-item">
          <span className="flow-metric-label">Tenggat Pekan Ini</span>
          <span className="flow-metric-val" style={{ color: 'var(--flow-accent-cyan)' }}>
            {metrics.dueThisWeek} Tugas
          </span>
        </div>
        <div className="flow-metric-divider" />
        <div className="flow-metric-item">
          <span className="flow-metric-label">Tuntas Sesuai Jadwal</span>
          <span className="flow-metric-val" style={{ color: 'var(--flow-accent-emerald)' }}>
            {metrics.completedScheduled} ({metrics.completionRate}%)
          </span>
        </div>
        {metrics.urgentCount > 0 && (
          <>
            <div className="flow-metric-divider" />
            <div className="flow-metric-item">
              <span className="flow-metric-label">Prioritas Urgent</span>
              <span className="flow-metric-val" style={{ color: 'var(--flow-accent-rose)' }}>
                {metrics.urgentCount} Tugas
              </span>
            </div>
          </>
        )}
      </div>

      {/* 3. Dynamic Calendar Body */}
      {viewMode === 'month' && (
        <div className="flow-cal-month-container">
          {/* Day Names Header */}
          <div className="flow-cal-grid-header">
            {dayNamesFull.map((name, i) => {
              const isWeekend = i === 5 || i === 6;
              return (
                <div key={name} className={`flow-cal-day-header ${isWeekend ? 'weekend' : ''}`}>
                  <span>{name}</span>
                </div>
              );
            })}
          </div>

          {/* Month Cells Grid */}
          <div className="flow-cal-grid-body">
            {calendarCells.map((cell, idx) => {
              const dateStr = cell.date.toISOString().split('T')[0];
              const isToday = dateStr === todayStr;
              const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;
              const dayTasks = filteredTasks.filter((t) => t.dueDate === dateStr);

              return (
                <div
                  key={idx}
                  className={`flow-cal-cell ${!cell.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''} ${isWeekend ? 'is-weekend' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDropOnDate(dateStr)}
                  onClick={() => {
                    if (dayTasks.length > 0) {
                      setSelectedDayDetail({ dateStr, tasks: dayTasks });
                    } else {
                      onOpenNewTaskWithDate(dateStr);
                    }
                  }}
                >
                  <div className="flow-cal-cell-top">
                    <span className={`flow-cal-date-num ${isToday ? 'today-pill' : ''}`}>
                      {cell.date.getDate()}
                    </span>

                    <button
                      type="button"
                      className="flow-cal-quick-add"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenNewTaskWithDate(dateStr);
                      }}
                      title="Tambah tugas di tanggal ini"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Tasks in Date */}
                  <div className="flow-cal-task-list">
                    {dayTasks.slice(0, 3).map((task) => {
                      const priorityColor =
                        INITIAL_PRIORITIES[task.priority]?.color || 'var(--flow-primary)';
                      const isDone = task.status === 'done';

                      return (
                        <div
                          key={task.id}
                          className={`flow-cal-task-chip ${isDone ? 'done' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskClick(task);
                          }}
                          style={{ borderLeftColor: priorityColor }}
                          title={`${task.title} • Klik untuk detail`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
                            <button
                              type="button"
                              className="flow-chip-check-btn"
                              onClick={(e) => handleToggleTaskDone(e, task.id)}
                              title={isDone ? 'Tandai belum selesai' : 'Tandai selesai'}
                            >
                              {isDone ? (
                                <CheckCircle2 size={11} color="var(--flow-accent-emerald)" />
                              ) : (
                                <span className="flow-chip-circle" />
                              )}
                            </button>
                            <span className="flow-chip-text">{task.title}</span>
                          </div>

                          {task.assignee && (
                            <span className="flow-chip-avatar">
                              {task.assignee.charAt(0)}
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <button
                        type="button"
                        className="flow-cal-more-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDayDetail({ dateStr, tasks: dayTasks });
                        }}
                      >
                        +{dayTasks.length - 3} lainnya
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Week View (Sprint Board Style) */}
      {viewMode === 'week' && (
        <div className="flow-cal-week-container">
          {weekDays.map((d) => {
            const dateStr = d.toISOString().split('T')[0];
            const isToday = dateStr === todayStr;
            const dayTasks = filteredTasks.filter((t) => t.dueDate === dateStr);

            return (
              <div
                key={dateStr}
                className={`flow-week-col ${isToday ? 'is-today' : ''}`}
                onDragOver={handleDragOver}
                onDrop={() => handleDropOnDate(dateStr)}
              >
                <div className="flow-week-col-header">
                  <div>
                    <span className="flow-week-day-name">
                      {d.toLocaleDateString('id-ID', { weekday: 'short' })}
                    </span>
                    <h4 className="flow-week-date-num">
                      {d.getDate()} {d.toLocaleDateString('id-ID', { month: 'short' })}
                    </h4>
                  </div>
                  {isToday && <span className="flow-week-today-tag">Hari Ini</span>}
                </div>

                <div className="flow-week-cards-list">
                  {dayTasks.map((task) => {
                    const isDone = task.status === 'done';
                    const priorityColor =
                      INITIAL_PRIORITIES[task.priority]?.color || 'var(--flow-primary)';

                    return (
                      <div
                        key={task.id}
                        className={`flow-week-task-card ${isDone ? 'done' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onTaskClick(task)}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                          <span
                            className="flow-week-priority-badge"
                            style={{ backgroundColor: `${priorityColor}15`, color: priorityColor }}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                          <button
                            type="button"
                            className="icon-btn"
                            style={{ width: 22, height: 22 }}
                            onClick={(e) => handleToggleTaskDone(e, task.id)}
                          >
                            {isDone ? (
                              <CheckCircle2 size={14} color="var(--flow-accent-emerald)" />
                            ) : (
                              <Clock size={14} color="var(--flow-text-muted)" />
                            )}
                          </button>
                        </div>

                        <h5 className="flow-week-card-title">{task.title}</h5>

                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="flow-week-subtasks-bar">
                            <CheckSquare size={11} color="var(--flow-text-muted)" />
                            <span style={{ fontSize: '0.7rem', color: 'var(--flow-text-muted)' }}>
                              {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                            </span>
                          </div>
                        )}

                        <div className="flow-week-card-footer">
                          {task.assignee ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                              <span className="flow-chip-avatar" style={{ width: 18, height: 18, fontSize: '0.65rem' }}>
                                {task.assignee.charAt(0)}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'var(--flow-text-subtle)' }}>
                                {task.assignee.split(' ')[0]}
                              </span>
                            </div>
                          ) : (
                            <span />
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {dayTasks.length === 0 && (
                    <div className="flow-week-empty-slot">
                      <span>Tidak ada tugas</span>
                    </div>
                  )}
                </div>

                {/* Inline Quick Add at bottom */}
                <div className="flow-week-quick-input-wrap">
                  <input
                    type="text"
                    className="flow-week-quick-input"
                    placeholder="+ Tambah tugas..."
                    value={inlineQuickTitle[dateStr] || ''}
                    onChange={(e) =>
                      setInlineQuickTitle({ ...inlineQuickTitle, [dateStr]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleInlineQuickAdd(dateStr);
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Agenda View (Timeline Deadlines) */}
      {viewMode === 'agenda' && (
        <div className="flow-agenda-container">
          {agendaGroups.map((group) => {
            const GroupIcon = group.icon;

            return (
              <div key={group.id} className="flow-agenda-group">
                <div className="flow-agenda-group-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        backgroundColor: `${group.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: group.color
                      }}
                    >
                      <GroupIcon size={14} />
                    </div>
                    <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
                      {group.label}
                    </h3>
                  </div>
                  <span className="flow-agenda-count-badge">{group.items.length} Tugas</span>
                </div>

                <div className="flow-agenda-items-list">
                  {group.items.map((task) => {
                    const isDone = task.status === 'done';
                    const priorityColor =
                      INITIAL_PRIORITIES[task.priority]?.color || 'var(--flow-primary)';

                    return (
                      <div
                        key={task.id}
                        className={`flow-agenda-item ${isDone ? 'done' : ''}`}
                        onClick={() => onTaskClick(task)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <button
                            type="button"
                            className="flow-agenda-checkbox"
                            onClick={(e) => handleToggleTaskDone(e, task.id)}
                          >
                            {isDone ? (
                              <CheckCircle2 size={16} color="var(--flow-accent-emerald)" />
                            ) : (
                              <span className="flow-agenda-circle" />
                            )}
                          </button>

                          <div>
                            <h4 className="flow-agenda-task-title">{task.title}</h4>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                              <span
                                className="flow-agenda-priority"
                                style={{ color: priorityColor }}
                              >
                                ● {task.priority.toUpperCase()}
                              </span>
                              <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                                {new Date(task.dueDate).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {task.assignee && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span className="flow-chip-avatar" style={{ width: 22, height: 22, fontSize: '0.72rem' }}>
                                {task.assignee.charAt(0)}
                              </span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--flow-text-subtle)' }}>
                                {task.assignee}
                              </span>
                            </div>
                          )}

                          <span
                            className="flow-agenda-status-pill"
                            style={{
                              backgroundColor: isDone ? 'rgba(16, 185, 129, 0.12)' : 'var(--flow-bg-elevated)',
                              color: isDone ? 'var(--flow-accent-emerald)' : 'var(--flow-text-subtle)'
                            }}
                          >
                            {isDone ? 'Selesai' : task.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {agendaGroups.length === 0 && (
            <div className="flow-agenda-empty">
              <CheckCircle2 size={36} color="var(--flow-accent-emerald)" />
              <h3>Semua Jadwal Terpenuhi!</h3>
              <p>Tidak ada tugas tertunda pada filter kalender yang dipilih.</p>
            </div>
          )}
        </div>
      )}

      {/* 6. Day Tasks Popover / Detail Modal */}
      {selectedDayDetail && (
        <div className="modal-overlay" onClick={() => setSelectedDayDetail(null)}>
          <div
            className="modal-container"
            style={{ maxWidth: 500, padding: '20px 24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--flow-text-main)' }}>
                  Agenda:{' '}
                  {new Date(selectedDayDetail.dateStr).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--flow-text-muted)' }}>
                  {selectedDayDetail.tasks.length} tugas terjadwal
                </span>
              </div>
              <button
                className="icon-btn"
                onClick={() => setSelectedDayDetail(null)}
                style={{ width: 30, height: 30 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320, overflowY: 'auto' }}>
              {selectedDayDetail.tasks.map((t) => (
                <div
                  key={t.id}
                  className="flow-agenda-item"
                  style={{ padding: '10px 14px' }}
                  onClick={() => {
                    setSelectedDayDetail(null);
                    onTaskClick(t);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      type="button"
                      className="flow-agenda-checkbox"
                      onClick={(e) => handleToggleTaskDone(e, t.id)}
                    >
                      {t.status === 'done' ? (
                        <CheckCircle2 size={16} color="var(--flow-accent-emerald)" />
                      ) : (
                        <span className="flow-agenda-circle" />
                      )}
                    </button>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--flow-text-main)' }}>
                      {t.title}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: INITIAL_PRIORITIES[t.priority]?.color || 'var(--flow-primary)'
                    }}
                  >
                    {t.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                className="primary-btn"
                style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                onClick={() => {
                  const d = selectedDayDetail.dateStr;
                  setSelectedDayDetail(null);
                  onOpenNewTaskWithDate(d);
                }}
              >
                + Tambah Tugas di Tanggal Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
