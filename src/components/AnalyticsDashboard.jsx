import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Search,
  X,
  Filter,
  Circle,
  CheckCircle,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  Zap,
  ArrowUpRight,
  Printer,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Activity,
  Flame,
  Check,
  CheckSquare,
  Square,
  ListTodo,
  Bot,
  UserCheck,
  BarChart2,
  ArrowRight,
  Plus,
  RefreshCw
} from 'lucide-react';
import { INITIAL_MEMBERS, INITIAL_PRIORITIES } from '../data/initialData';

export const AnalyticsDashboard = ({
  tasks = [],
  columns = [],
  members = INITIAL_MEMBERS,
  dashboardType = 'project',
  timeframe = 'active_sprint',
  onUpdateTaskStatus,
  onTaskClick,
  onOpenNewTask,
  onShowToast
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [aiRebalanced, setAiRebalanced] = useState(false);
  const [simpleFilter, setSimpleFilter] = useState('all'); // all, urgent, in_progress
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all'); // 'all' | 'todo' | 'in_progress' | 'review' | 'done'
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('all'); // 'all' | 'urgent_high' | 'urgent' | 'high' | 'normal' | 'low'
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('all'); // 'all' | memberId/name
  const [taskSearchQuery, setTaskSearchQuery] = useState('');
  const [showSubtasksOnly, setShowSubtasksOnly] = useState(false);
  const effectiveMembers = members && members.length > 0 ? members : INITIAL_MEMBERS;

  // Filter tasks based on selected timeframe
  const filteredTasks = tasks.filter((t) => {
    if (selectedTimeframe === 'urgent_only') return t.priority === 'urgent' || t.priority === 'high';
    return true;
  });

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'in_progress' || t.status === 'inprogress').length;
  const reviewTasks = filteredTasks.filter((t) => t.status === 'review').length;
  const todoTasks = filteredTasks.filter((t) => t.status === 'todo').length;
  const urgentTasks = filteredTasks.filter((t) => t.priority === 'urgent').length;
  const highTasks = filteredTasks.filter((t) => t.priority === 'high').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Subtasks statistics
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  const activeSubtaskList = [];

  filteredTasks.forEach((t) => {
    if (t.subtasks && t.subtasks.length > 0) {
      totalSubtasks += t.subtasks.length;
      t.subtasks.forEach((s) => {
        if (s.completed) {
          completedSubtasks += 1;
        } else {
          activeSubtaskList.push({
            taskId: t.id,
            taskTitle: t.title,
            subtaskTitle: s.title,
            priority: t.priority
          });
        }
      });
    }
  });

  // Handle Quick Task Toggle (Done <-> Todo)
  const handleToggleTaskStatus = (task, e) => {
    e?.stopPropagation();
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(task.id, newStatus);
    }
    if (newStatus === 'done') {
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.65 } });
      if (onShowToast) onShowToast(`Tugas "${task.title}" berhasil diselesaikan! 🎉`, 'success');
    } else {
      if (onShowToast) onShowToast(`Tugas "${task.title}" dipindahkan kembali ke Antrian`, 'info');
    }
  };

  // Handle Reset All Filters
  const handleResetFilters = () => {
    setSelectedStatusFilter('all');
    setSelectedPriorityFilter('all');
    setSelectedMemberFilter('all');
    setTaskSearchQuery('');
    setShowSubtasksOnly(false);
  };

  const isAnyFilterActive =
    selectedStatusFilter !== 'all' ||
    selectedPriorityFilter !== 'all' ||
    selectedMemberFilter !== 'all' ||
    taskSearchQuery.trim() !== '' ||
    showSubtasksOnly;

  // Interactive Task List Calculation
  const interactiveTasks = filteredTasks.filter((t) => {
    // Status Filter
    if (selectedStatusFilter === 'in_progress') {
      if (t.status !== 'in_progress' && t.status !== 'inprogress' && t.status !== 'review') return false;
    } else if (selectedStatusFilter !== 'all') {
      if (t.status !== selectedStatusFilter) return false;
    }

    // Priority Filter
    if (selectedPriorityFilter === 'urgent_high') {
      if (t.priority !== 'urgent' && t.priority !== 'high') return false;
    } else if (selectedPriorityFilter !== 'all') {
      if (t.priority !== selectedPriorityFilter) return false;
    }

    // Member Filter
    if (selectedMemberFilter !== 'all') {
      const matchMember =
        t.assignee === selectedMemberFilter ||
        t.assigneeId === selectedMemberFilter ||
        (effectiveMembers.find((m) => m.id === selectedMemberFilter)?.name === t.assignee);
      if (!matchMember) return false;
    }

    // Search Query
    if (taskSearchQuery.trim()) {
      const q = taskSearchQuery.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchTag = Array.isArray(t.tags) && t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }

    return true;
  });

  // Sprint Health Score Calculation
  let healthScore = 95;
  if (urgentTasks > 0) healthScore -= urgentTasks * 4;
  if (reviewTasks > 2) healthScore -= 5;
  if (completionRate < 30 && totalTasks > 4) healthScore -= 10;
  healthScore = Math.max(65, Math.min(98, healthScore));

  let healthStatus = 'Semangat Penuh — Lancar Jaya!';
  let healthBadgeColor = 'var(--flow-accent-emerald)';
  if (healthScore < 80) {
    healthStatus = 'Perlu Fokus — Agak Padat';
    healthBadgeColor = 'var(--flow-accent-amber)';
  }
  if (healthScore < 70) {
    healthStatus = 'Kritis — Butuh Aksi Segera!';
    healthBadgeColor = 'var(--flow-accent-rose)';
  }

  const handlePrint = () => {
    window.print();
  };

  const handleQuickCompleteTask = (taskId, title) => {
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, 'done');
    }
  };

  /* ==========================================================================
     VIEW 1: SIMPLE DASHBOARD (Task Management & Daily Execution Mode)
     ========================================================================== */
  const renderSimpleDashboard = () => {
    const priorityTasks = filteredTasks.filter((t) => {
      if (simpleFilter === 'urgent') return t.priority === 'urgent' || t.priority === 'high';
      if (simpleFilter === 'in_progress') return t.status === 'in_progress' || t.status === 'inprogress';
      return t.status !== 'done';
    });

    return (
      <div className="flow-analytics-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Simple Mode Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.08) 0%, rgba(99, 102, 241, 0.04) 100%)',
            border: '1px solid rgba(0, 102, 255, 0.18)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'rgba(0, 102, 255, 0.15)',
                color: '#0066ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Layers size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--flow-text-main)' }}>
                Mode Eksekusi Tugas — Fokus & Bersih
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                Tampilan praktis untuk mengecek progres to-do, subtask, dan prioritas tanpa distraksi grafik kompleks.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              className="tab-btn"
              style={{ fontSize: '0.78rem', padding: '5px 10px' }}
              onClick={handlePrint}
              title="Cetak Ringkasan"
            >
              <Printer size={13} />
              <span>Cetak Ringkasan</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Metric Cards */}
        <div className="flow-kpi-grid">
          <div className="flow-kpi-card" style={{ borderTop: '2px solid var(--flow-accent-rose)' }}>
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Prioritas Tinggi & Mendesak</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-accent-rose)', backgroundColor: 'rgba(244, 63, 94, 0.12)' }}>
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="flow-kpi-value" style={{ color: urgentTasks + highTasks > 0 ? 'var(--flow-accent-rose)' : 'inherit' }}>
              {urgentTasks + highTasks}
            </div>
            <div className="flow-kpi-footer">
              <span style={{ color: urgentTasks > 0 ? 'var(--flow-accent-rose)' : 'var(--flow-accent-emerald)', fontWeight: 600 }}>
                {urgentTasks} Urgent • {highTasks} High
              </span>
              <span style={{ color: 'var(--flow-text-muted)' }}>Butuh eksekusi segera</span>
            </div>
          </div>

          <div className="flow-kpi-card" style={{ borderTop: '2px solid var(--flow-accent-cyan)' }}>
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Sedang Dikerjakan</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-accent-cyan)', backgroundColor: 'rgba(6, 182, 212, 0.12)' }}>
                <Clock size={16} />
              </div>
            </div>
            <div className="flow-kpi-value">{inProgressTasks}</div>
            <div className="flow-kpi-footer">
              <span style={{ color: 'var(--flow-accent-cyan)', fontWeight: 600 }}>Sedang Dikerjakan</span>
              <span style={{ color: 'var(--flow-text-muted)' }}>+{reviewTasks} di Tahap Review</span>
            </div>
          </div>

          <div className="flow-kpi-card" style={{ borderTop: '2px solid var(--flow-primary)' }}>
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Antrian Tugas (To Do)</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-primary)', backgroundColor: 'var(--flow-primary-light)' }}>
                <ListTodo size={16} />
              </div>
            </div>
            <div className="flow-kpi-value">{todoTasks}</div>
            <div className="flow-kpi-footer">
              <span style={{ color: 'var(--flow-primary)', fontWeight: 600 }}>Siap Dikerjakan</span>
              <span style={{ color: 'var(--flow-text-muted)' }}>dari {totalTasks} total tugas</span>
            </div>
          </div>

          <div className="flow-kpi-card" style={{ borderTop: '2px solid var(--flow-accent-emerald)' }}>
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Selesai (Completed)</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-accent-emerald)', backgroundColor: 'rgba(16, 185, 129, 0.12)' }}>
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="flow-kpi-value">{completedTasks}</div>
            <div className="flow-kpi-footer">
              <span style={{ color: 'var(--flow-accent-emerald)', fontWeight: 600 }}>{completionRate}% Tercapai</span>
              <span style={{ color: 'var(--flow-text-muted)' }}>Target tercapai</span>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Focus Priority Action List & Subtask Checklist */}
        <div className="flow-charts-split">
          {/* Left Column: Focus Priority Tasks */}
          <div className="flow-chart-panel" style={{ flex: 1.2 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: 0 }}>
                  🎯 Fokus Tugas Prioritas Hari Ini
                </h4>
                <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                  Aksi cepat untuk menyelesaikan tugas aktif yang paling mendesak
                </span>
              </div>

              {/* Filter Chips */}
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className={`tab-btn ${simpleFilter === 'all' ? 'active' : ''}`}
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  onClick={() => setSimpleFilter('all')}
                >
                  Semua Aktif ({filteredTasks.filter((t) => t.status !== 'done').length})
                </button>
                <button
                  className={`tab-btn ${simpleFilter === 'urgent' ? 'active' : ''}`}
                  style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  onClick={() => setSimpleFilter('urgent')}
                >
                  Mendesak Saja ({urgentTasks + highTasks})
                </button>
              </div>
            </div>

            {/* Task Item Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {priorityTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--flow-text-muted)' }}>
                  <CheckCircle2 size={36} color="var(--flow-accent-emerald)" style={{ margin: '0 auto 8px', opacity: 0.8 }} />
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--flow-text-main)' }}>
                    Semua tugas prioritas telah beres! 🎉
                  </div>
                  <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
                    Kerja bagus! Tidak ada tugas mendesak yang tertunda.
                  </div>
                </div>
              ) : (
                priorityTasks.slice(0, 6).map((task) => {
                  const priorityObj = INITIAL_PRIORITIES[task.priority] || INITIAL_PRIORITIES.normal;
                  const isUrgent = task.priority === 'urgent';

                  return (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 10,
                        backgroundColor: isUrgent ? 'rgba(244, 63, 94, 0.04)' : 'var(--flow-bg-elevated)',
                        border: isUrgent ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid var(--flow-border-subtle)',
                        transition: 'all 0.15s ease',
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                        <button
                          type="button"
                          onClick={() => handleQuickCompleteTask(task.id, task.title)}
                          title="Tandai Selesai Langsung"
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 6,
                            border: '1.5px solid var(--flow-border-subtle)',
                            backgroundColor: 'var(--flow-bg-surface)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'transparent',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--flow-accent-emerald)';
                            e.currentTarget.style.color = 'var(--flow-accent-emerald)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--flow-border-subtle)';
                            e.currentTarget.style.color = 'transparent';
                          }}
                        >
                          <Check size={14} strokeWidth={3} />
                        </button>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div
                            onClick={() => onTaskClick && onTaskClick(task)}
                            style={{
                              fontSize: '0.84rem',
                              fontWeight: 600,
                              color: 'var(--flow-text-main)',
                              cursor: 'pointer',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title="Klik untuk membuka detail tugas"
                          >
                            {task.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                            <span
                              style={{
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                padding: '1px 6px',
                                borderRadius: 4,
                                backgroundColor: `${priorityObj.color}15`,
                                color: priorityObj.color
                              }}
                            >
                              {priorityObj.label}
                            </span>
                            {task.dueDate && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--flow-text-muted)' }}>
                                📅 {task.dueDate}
                              </span>
                            )}
                            {task.subtasks && task.subtasks.length > 0 && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--flow-text-muted)' }}>
                                ☑️ {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span
                          className="flow-badge flow-badge-cyan"
                          style={{ fontSize: '0.7rem', padding: '2px 8px', textTransform: 'capitalize' }}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Subtask Checklist & Priority Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 0.8 }}>
            {/* Active Subtasks Quick Checklist */}
            <div className="flow-chart-panel">
              <div style={{ marginBottom: 12 }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: 0 }}>
                  📋 Checklist Subtask Aktif
                </h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)' }}>
                  {activeSubtaskList.length} item checklist yang belum selesai
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
                {activeSubtaskList.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--flow-text-muted)', textAlign: 'center', padding: '16px 0' }}>
                    Semua checklist subtask telah lengkap! ✅
                  </div>
                ) : (
                  activeSubtaskList.slice(0, 5).map((sub, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        borderRadius: 8,
                        backgroundColor: 'var(--flow-bg-elevated)',
                        fontSize: '0.78rem'
                      }}
                    >
                      <Square size={14} color="var(--flow-text-muted)" style={{ flexShrink: 0 }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ color: 'var(--flow-text-main)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sub.subtaskTitle}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--flow-text-muted)' }}>
                          pada: {sub.taskTitle}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Simple Priority Distribution Bar */}
            <div className="flow-chart-panel">
              <div style={{ marginBottom: 10 }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: 0 }}>
                  📊 Proporsi Beban Prioritas
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(INITIAL_PRIORITIES).map(([key, p]) => {
                  const count = filteredTasks.filter((t) => t.priority === key).length;
                  const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

                  return (
                    <div key={key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 3 }}>
                        <span style={{ color: p.color, fontWeight: 600 }}>{p.label}</span>
                        <span style={{ color: 'var(--flow-text-muted)' }}>{count} ({pct}%)</span>
                      </div>
                      <div className="sidebar-progress-bar" style={{ height: 5, margin: 0, backgroundColor: 'var(--flow-bg-elevated)' }}>
                        <div className="sidebar-progress-fill" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ==========================================================================
     VIEW 2: AI KOLABORASI (Aktivitas Kolaborasi & Asisten AI)
     ========================================================================== */
  const renderAICenterDashboard = () => {
    return (
      <div className="flow-analytics-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* FlowPilot KeepWork AI Asisten Kolaborasi Intelligence Card */}
        <div
          style={{
            padding: '20px 22px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(255, 0, 128, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
            border: '1px solid rgba(255, 0, 128, 0.2)',
            boxShadow: 'var(--flow-shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 14,
                  background: 'var(--flow-pilot-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                  flexShrink: 0
                }}
              >
                <Sparkles size={28} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="flow-badge flow-badge-cyan" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                    <Bot size={12} style={{ marginRight: 4 }} /> Asisten Pribadi KeepWork AI
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                    Produktivitas Bareng: Optimal 🤝
                  </span>
                </div>

                <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--flow-text-main)', margin: '6px 0 4px' }}>
                  KeepWork AI Asisten Kolaborasi • Rekomendasi & Analisis Kapasitas Kolaborasi
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--flow-text-subtle)', margin: 0, maxWidth: 650, lineHeight: 1.45 }}>
                  {aiRebalanced
                    ? '✨ KeepWork AI telah menyesuaikan pembagian beban tugas. Tugas Revisi & Review dibagi merata kepada Alex Rivera dan Kurnia agar semua deadline terpenuhi.'
                    : 'KeepWork AI mendeteksi 4 anggota aktif dengan produktivitas tinggi. Saran: Sarah Chen telah menyelesaikan semua tugasnya dan siap bantu review tugas Dimas Pratama.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="flow-pilot-trigger"
                onClick={() => {
                  setAiRebalanced(true);
                  if (onShowToast) onShowToast('KeepWork AI: Pembagian tugas anggota telah diseimbangkan!', 'success');
                }}
                title="AI bantu seimbangkan beban tugas anggota"
              >
                <Sparkles size={14} />
                <span>{aiRebalanced ? 'Tugas Terbagi Rata' : 'Saran Bagi Tugas AI'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Team Collaboration Metrics */}
        <div className="flow-kpi-grid">
          <div className="flow-kpi-card">
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Kolaborator Aktif</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-primary)', backgroundColor: 'var(--flow-primary-light)' }}>
                <Users size={16} />
              </div>
            </div>
            <div className="flow-kpi-value">{effectiveMembers.length} Kolaborator</div>
            <div className="flow-kpi-footer">
              <span style={{ color: 'var(--flow-accent-emerald)', fontWeight: 600 }}>100% Aktif</span>
              <span style={{ color: 'var(--flow-text-muted)' }}>semua aktif berkolaborasi bareng</span>
            </div>
          </div>

          <div className="flow-kpi-card">
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Semangat Kolaborasi</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-accent-emerald)', backgroundColor: 'rgba(16, 185, 129, 0.12)' }}>
                <Zap size={16} />
              </div>
            </div>
            <div className="flow-kpi-value">18 Pts</div>
            <div className="flow-kpi-footer">
              <span style={{ color: 'var(--flow-accent-emerald)', fontWeight: 600 }}>+15% Produktivitas</span>
              <span style={{ color: 'var(--flow-text-muted)' }}>konsisten pekan ini</span>
            </div>
          </div>

          <div className="flow-kpi-card">
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Rata-rata Waktu Selesai</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-accent-cyan)', backgroundColor: 'rgba(6, 182, 212, 0.12)' }}>
                <Clock size={16} />
              </div>
            </div>
            <div className="flow-kpi-value">2.3 Hari</div>
            <div className="flow-kpi-footer">
              <span style={{ color: 'var(--flow-accent-cyan)', fontWeight: 600 }}>Diselesaikan Cepat</span>
              <span style={{ color: 'var(--flow-text-muted)' }}>dari mulai sampai selesai</span>
            </div>
          </div>

          <div className="flow-kpi-card">
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Ketepatan Target Tugas</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-accent-amber)', backgroundColor: 'rgba(245, 158, 11, 0.12)' }}>
                <Target size={16} />
              </div>
            </div>
            <div className="flow-kpi-value">92%</div>
            <div className="flow-kpi-footer">
              <span style={{ color: 'var(--flow-accent-emerald)', fontWeight: 600 }}>On Schedule</span>
              <span style={{ color: 'var(--flow-text-muted)' }}>hampir semua selesai tepat waktu</span>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Team Workload Radar & Live Collaboration Stream */}
        <div className="flow-charts-split">
          {/* Left Column: Team Capacity & Workload Radar */}
          <div className="flow-chart-panel" style={{ flex: 1 }}>
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: 0 }}>
                👥 Distribusi Tugas Anggota
              </h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                Pantau beban tugas masing-masing anggota agar tidak ada yang kewalahan
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {effectiveMembers.map((member, idx) => {
                const memberTasks = filteredTasks.filter(
                  (t) => t.assignee === member.id || t.assignee === member.name || t.assigneeId === member.id
                );
                const doneCount = memberTasks.filter((t) => t.status === 'done').length;
                const activeCount = memberTasks.length - doneCount;

                let statusBadge = 'Beban Optimal';
                let badgeStyle = { color: 'var(--flow-accent-emerald)', bg: 'rgba(16, 185, 129, 0.12)' };

                if (activeCount >= 3) {
                  statusBadge = 'Beban Tinggi';
                  badgeStyle = { color: 'var(--flow-accent-rose)', bg: 'rgba(244, 63, 94, 0.12)' };
                } else if (activeCount === 0) {
                  statusBadge = 'Kapasitas Tersedia';
                  badgeStyle = { color: 'var(--flow-accent-cyan)', bg: 'rgba(6, 182, 212, 0.12)' };
                }

                return (
                  <div
                    key={member.id || idx}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      backgroundColor: 'var(--flow-bg-elevated)',
                      border: '1px solid var(--flow-border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          className="flow-member-avatar-wrap"
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor: member.color || 'var(--flow-primary)',
                            fontSize: '0.76rem'
                          }}
                        >
                          {member.avatar || member.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--flow-text-main)' }}>
                            {member.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)' }}>
                            {member.role || 'Member'}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 999,
                          backgroundColor: badgeStyle.bg,
                          color: badgeStyle.color
                        }}
                      >
                        {statusBadge}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                      <span>{memberTasks.length} tugas ({doneCount} selesai, {activeCount} aktif)</span>
                      <span>{memberTasks.length > 0 ? Math.round((doneCount / memberTasks.length) * 100) : 0}% eksekusi</span>
                    </div>

                    <div className="sidebar-progress-bar" style={{ height: 5, margin: 0, backgroundColor: 'var(--flow-bg-surface)' }}>
                      <div
                        className="sidebar-progress-fill"
                        style={{
                          width: `${memberTasks.length > 0 ? Math.round((doneCount / memberTasks.length) * 100) : 0}%`,
                          backgroundColor: member.color || 'var(--flow-primary)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Collaboration Stream & Audit Log */}
          <div className="flow-chart-panel" style={{ flex: 1 }}>
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: 0 }}>
                ⚡ Aktivitas Anggota Terkini
              </h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                Catatan aktivitas dan progres kolaborasi tim terkini
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  backgroundColor: 'var(--flow-bg-elevated)',
                  border: '1px solid var(--flow-border-subtle)'
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(6, 182, 212, 0.15)', color: 'var(--flow-accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={14} />
                </div>
                <div style={{ fontSize: '0.8rem', flex: 1 }}>
                  <div style={{ color: 'var(--flow-text-main)', fontWeight: 600 }}>
                    Dimas Pratama memindahkan tugas ke tahap Revisi
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', marginTop: 2 }}>
                    Laporan Praktikum Basis Data — 15 menit lalu
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  backgroundColor: 'var(--flow-bg-elevated)',
                  border: '1px solid var(--flow-border-subtle)'
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--flow-accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={14} />
                </div>
                <div style={{ fontSize: '0.8rem', flex: 1 }}>
                  <div style={{ color: 'var(--flow-text-main)', fontWeight: 600 }}>
                    Sarah Chen menyelesaikan semua checklist tugas
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', marginTop: 2 }}>
                    Materi Presentasi & Laporan Akhir — 1 jam lalu
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  backgroundColor: 'var(--flow-bg-elevated)',
                  border: '1px solid var(--flow-border-subtle)'
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--flow-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Sparkles size={14} />
                </div>
                <div style={{ fontSize: '0.8rem', flex: 1 }}>
                  <div style={{ color: 'var(--flow-text-main)', fontWeight: 600 }}>
                    KeepWork AI: target pekan ini terpenuhi 67%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', marginTop: 2 }}>
                    Progres Tugas Pekan Ini — 2 jam lalu
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  backgroundColor: 'var(--flow-bg-elevated)',
                  border: '1px solid var(--flow-border-subtle)'
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--flow-accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserCheck size={14} />
                </div>
                <div style={{ fontSize: '0.8rem', flex: 1 }}>
                  <div style={{ color: 'var(--flow-text-main)', fontWeight: 600 }}>
                    Alex Rivera memperbarui jadwal penyelesaian tugas
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', marginTop: 2 }}>
                    Penyusunan Konten & Riset Bahan — 4 jam lalu
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ==========================================================================
     VIEW 3: PROJECT MANAGEMENT (Interactive Analytics & Focus Hub)
     ========================================================================== */
  const renderProjectManagementDashboard = () => {
    return (
      <div className="flow-analytics-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 1. Executive Sprint Pulse & Diagnostics Card */}
        <div className="flow-ai-health-card" style={{ background: 'var(--flow-bg-surface)', border: '1px solid var(--flow-border-subtle)', borderRadius: 14, padding: '20px 24px', boxShadow: 'var(--flow-shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div className="flow-health-score-circle" style={{ width: 62, height: 62, borderRadius: '50%', background: 'var(--flow-bg-elevated)', border: '2px solid var(--flow-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--flow-primary)', lineHeight: 1 }}>
                  {healthScore}
                </span>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, color: 'var(--flow-text-muted)', textTransform: 'uppercase', marginTop: 2 }}>
                  Skor / 100
                </span>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      padding: '2px 9px',
                      borderRadius: 999,
                      backgroundColor: `${healthBadgeColor}18`,
                      color: healthBadgeColor,
                      border: `1px solid ${healthBadgeColor}30`
                    }}
                  >
                    <Activity size={12} />
                    {healthStatus}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                    • Ringkasan Tugas Aktif
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--flow-text-main)', margin: '6px 0 4px', letterSpacing: '-0.01em' }}>
                  KeepWork Ringkasan Produktivitas & Progres Kamu
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--flow-text-subtle)', margin: 0, maxWidth: 650, lineHeight: 1.45 }}>
                  {completedTasks >= 2
                    ? `Aktivitas berjalan efisien dengan ${completedTasks} tugas selesai (${completionRate}%). Terdapat ${inProgressTasks} tugas sedang dikerjakan dan ${reviewTasks} tugas review.`
                    : `Sedang berjalan dengan ${todoTasks} tugas antrian dan ${urgentTasks} tugas mendesak. Klik pada kartu metrik di bawah untuk memfilter daftar tugas secara instan.`}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <select
                className="filter-select"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--flow-border-subtle)', background: 'var(--flow-bg-surface)', color: 'var(--flow-text-main)', cursor: 'pointer' }}
              >
                <option value="active_sprint">Target Pekan Ini</option>
                <option value="urgent_only">Mendesak Saja</option>
                <option value="all">Semua Waktu</option>
              </select>

              <button
                className="tab-btn"
                onClick={handlePrint}
                style={{ fontSize: '0.8rem', padding: '6px 12px', gap: 6, borderRadius: 8 }}
                title="Cetak ringkasan ke PDF"
              >
                <Printer size={14} />
                <span>Cetak</span>
              </button>
            </div>
          </div>

          {/* Interactive Multi-Segmented Progress Bar */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--flow-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontWeight: 700, color: 'var(--flow-text-main)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={14} color="var(--flow-accent-emerald)" />
                Progres Sprint: <span style={{ color: 'var(--flow-accent-emerald)' }}>{completionRate}% Selesai</span>
              </span>
              <span style={{ color: 'var(--flow-text-muted)', fontSize: '0.74rem' }}>
                💡 Klik segmen untuk memfilter: {completedTasks} Selesai • {inProgressTasks} Dikerjakan • {reviewTasks} Review • {todoTasks} Antrian
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                height: 10,
                borderRadius: 999,
                overflow: 'hidden',
                backgroundColor: 'var(--flow-bg-elevated)',
                cursor: 'pointer',
                border: '1px solid var(--flow-border-subtle)'
              }}
              title="Klik segmen warna untuk memfilter tugas"
            >
              <div
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`, backgroundColor: 'var(--flow-accent-emerald)', transition: 'width 0.3s' }}
                title={`Selesai: ${completedTasks} tugas`}
                onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'done' ? 'all' : 'done')}
              />
              <div
                style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%`, backgroundColor: 'var(--flow-accent-cyan)', transition: 'width 0.3s' }}
                title={`Sedang Dikerjakan: ${inProgressTasks} tugas`}
                onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'in_progress' ? 'all' : 'in_progress')}
              />
              <div
                style={{ width: `${totalTasks > 0 ? (reviewTasks / totalTasks) * 100 : 0}%`, backgroundColor: 'var(--flow-primary)', transition: 'width 0.3s' }}
                title={`Review: ${reviewTasks} tugas`}
                onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'review' ? 'all' : 'review')}
              />
              <div
                style={{ width: `${totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0}%`, backgroundColor: 'var(--flow-border-hover)', transition: 'width 0.3s' }}
                title={`Antrian To Do: ${todoTasks} tugas`}
                onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'todo' ? 'all' : 'todo')}
              />
            </div>
          </div>
        </div>

        {/* 2. Interactive KPI Metric Cards (Clickable Filter Triggers) */}
        <div className="flow-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {/* Card 1: Completed */}
          <div
            className="flow-kpi-card"
            onClick={() => {
              setSelectedStatusFilter(selectedStatusFilter === 'done' ? 'all' : 'done');
              setSelectedPriorityFilter('all');
              setSelectedMemberFilter('all');
              setShowSubtasksOnly(false);
            }}
            style={{
              cursor: 'pointer',
              borderTop: '3px solid var(--flow-accent-emerald)',
              boxShadow: selectedStatusFilter === 'done' ? '0 0 0 2px var(--flow-accent-emerald), var(--flow-shadow-md)' : 'var(--flow-shadow-sm)',
              background: selectedStatusFilter === 'done' ? 'rgba(16, 185, 129, 0.04)' : 'var(--flow-bg-surface)',
              transition: 'all 0.15s ease'
            }}
            title="Klik untuk memfilter tugas yang telah selesai"
          >
            <div className="flow-kpi-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="flow-kpi-title" style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--flow-text-muted)', textTransform: 'uppercase' }}>
                Tingkat Penyelesaian
              </span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-accent-emerald)', backgroundColor: 'rgba(16, 185, 129, 0.12)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="flow-kpi-value" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--flow-text-main)', letterSpacing: '-0.02em', margin: '2px 0' }}>
              {completionRate}%
            </div>
            <div className="flow-kpi-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', marginTop: 4 }}>
              <span style={{ color: 'var(--flow-accent-emerald)', fontWeight: 600 }}>
                {completedTasks} dari {totalTasks} selesai
              </span>
              <span style={{ color: selectedStatusFilter === 'done' ? 'var(--flow-accent-emerald)' : 'var(--flow-text-muted)', fontWeight: 600 }}>
                {selectedStatusFilter === 'done' ? '✓ Aktif' : 'Filter →'}
              </span>
            </div>
          </div>

          {/* Card 2: In Progress */}
          <div
            className="flow-kpi-card"
            onClick={() => {
              setSelectedStatusFilter(selectedStatusFilter === 'in_progress' ? 'all' : 'in_progress');
              setSelectedPriorityFilter('all');
              setSelectedMemberFilter('all');
              setShowSubtasksOnly(false);
            }}
            style={{
              cursor: 'pointer',
              borderTop: '3px solid var(--flow-accent-cyan)',
              boxShadow: selectedStatusFilter === 'in_progress' ? '0 0 0 2px var(--flow-accent-cyan), var(--flow-shadow-md)' : 'var(--flow-shadow-sm)',
              background: selectedStatusFilter === 'in_progress' ? 'rgba(6, 182, 212, 0.04)' : 'var(--flow-bg-surface)',
              transition: 'all 0.15s ease'
            }}
            title="Klik untuk memfilter tugas yang sedang aktif dikerjakan"
          >
            <div className="flow-kpi-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="flow-kpi-title" style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--flow-text-muted)', textTransform: 'uppercase' }}>
                Sedang Dikerjakan
              </span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-accent-cyan)', backgroundColor: 'rgba(6, 182, 212, 0.12)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={16} />
              </div>
            </div>
            <div className="flow-kpi-value" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--flow-text-main)', letterSpacing: '-0.02em', margin: '2px 0' }}>
              {inProgressTasks}
            </div>
            <div className="flow-kpi-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', marginTop: 4 }}>
              <span style={{ color: 'var(--flow-accent-cyan)', fontWeight: 600 }}>
                +{reviewTasks} di Tahap Review
              </span>
              <span style={{ color: selectedStatusFilter === 'in_progress' ? 'var(--flow-accent-cyan)' : 'var(--flow-text-muted)', fontWeight: 600 }}>
                {selectedStatusFilter === 'in_progress' ? '✓ Aktif' : 'Filter →'}
              </span>
            </div>
          </div>

          {/* Card 3: Urgent & High Risks */}
          <div
            className="flow-kpi-card"
            onClick={() => {
              setSelectedPriorityFilter(selectedPriorityFilter === 'urgent_high' ? 'all' : 'urgent_high');
              setSelectedStatusFilter('all');
              setSelectedMemberFilter('all');
              setShowSubtasksOnly(false);
            }}
            style={{
              cursor: 'pointer',
              borderTop: '3px solid var(--flow-accent-rose)',
              boxShadow: selectedPriorityFilter === 'urgent_high' ? '0 0 0 2px var(--flow-accent-rose), var(--flow-shadow-md)' : 'var(--flow-shadow-sm)',
              background: selectedPriorityFilter === 'urgent_high' ? 'rgba(244, 63, 94, 0.04)' : 'var(--flow-bg-surface)',
              transition: 'all 0.15s ease'
            }}
            title="Klik untuk memfilter tugas prioritas mendesak & tinggi"
          >
            <div className="flow-kpi-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="flow-kpi-title" style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--flow-text-muted)', textTransform: 'uppercase' }}>
                Prioritas Mendesak
              </span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-accent-rose)', backgroundColor: 'rgba(244, 63, 94, 0.12)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="flow-kpi-value" style={{ fontSize: '1.6rem', fontWeight: 800, color: urgentTasks > 0 ? 'var(--flow-accent-rose)' : 'inherit', letterSpacing: '-0.02em', margin: '2px 0' }}>
              {urgentTasks + highTasks}
            </div>
            <div className="flow-kpi-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', marginTop: 4 }}>
              <span style={{ color: urgentTasks > 0 ? 'var(--flow-accent-rose)' : 'var(--flow-accent-emerald)', fontWeight: 600 }}>
                {urgentTasks} Urgent • {highTasks} High
              </span>
              <span style={{ color: selectedPriorityFilter === 'urgent_high' ? 'var(--flow-accent-rose)' : 'var(--flow-text-muted)', fontWeight: 600 }}>
                {selectedPriorityFilter === 'urgent_high' ? '✓ Aktif' : 'Filter →'}
              </span>
            </div>
          </div>

          {/* Card 4: Subtasks Execution */}
          <div
            className="flow-kpi-card"
            onClick={() => {
              setShowSubtasksOnly(!showSubtasksOnly);
              setSelectedStatusFilter('all');
              setSelectedPriorityFilter('all');
              setSelectedMemberFilter('all');
            }}
            style={{
              cursor: 'pointer',
              borderTop: '3px solid var(--flow-primary)',
              boxShadow: showSubtasksOnly ? '0 0 0 2px var(--flow-primary), var(--flow-shadow-md)' : 'var(--flow-shadow-sm)',
              background: showSubtasksOnly ? 'var(--flow-primary-light)' : 'var(--flow-bg-surface)',
              transition: 'all 0.15s ease'
            }}
            title="Klik untuk membuka checklist subtask"
          >
            <div className="flow-kpi-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="flow-kpi-title" style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--flow-text-muted)', textTransform: 'uppercase' }}>
                Eksekusi Subtask
              </span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-primary)', backgroundColor: 'var(--flow-primary-light)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="flow-kpi-value" style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--flow-text-main)', letterSpacing: '-0.02em', margin: '2px 0' }}>
              {completedSubtasks} / {totalSubtasks}
            </div>
            <div className="flow-kpi-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', marginTop: 4 }}>
              <span style={{ color: 'var(--flow-primary)', fontWeight: 600 }}>
                {totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0}% Selesai
              </span>
              <span style={{ color: showSubtasksOnly ? 'var(--flow-primary)' : 'var(--flow-text-muted)', fontWeight: 600 }}>
                {showSubtasksOnly ? '✓ Checklist' : 'Detail →'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Interactive Task Explorer (Focus & Direct Action Table) */}
        <div style={{ background: 'var(--flow-bg-surface)', border: '1px solid var(--flow-border-subtle)', borderRadius: 14, padding: '20px', boxShadow: 'var(--flow-shadow-sm)' }}>
          {/* Header & Filter Controls Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ListTodo size={18} color="var(--flow-primary)" />
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--flow-text-main)' }}>
                {showSubtasksOnly ? 'Checklist Subtask Aktif' : 'Eksplorasi Tugas & Aksi Cepat'}
              </h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)', background: 'var(--flow-bg-elevated)', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
                {showSubtasksOnly ? activeSubtaskList.length : interactiveTasks.length} tugas
              </span>
            </div>

            {/* Filter Reset Button */}
            {isAnyFilterActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="tab-btn"
                style={{ fontSize: '0.74rem', padding: '4px 10px', gap: 4, color: 'var(--flow-accent-rose)', borderColor: 'rgba(244, 63, 94, 0.25)' }}
                title="Hapus semua filter aktif"
              >
                <X size={13} />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          {/* Search & Segmented Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
            {/* Quick Filter Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {[
                { id: 'all', label: 'Semua', count: totalTasks },
                { id: 'urgent_high', label: '🔴 Mendesak', count: urgentTasks + highTasks, isPriority: true },
                { id: 'in_progress', label: '⏳ Dikerjakan', count: inProgressTasks, isStatus: true },
                { id: 'todo', label: '📋 Antrian', count: todoTasks, isStatus: true },
                { id: 'done', label: '✅ Selesai', count: completedTasks, isStatus: true }
              ].map((chip) => {
                const isActive = chip.isPriority
                  ? selectedPriorityFilter === 'urgent_high'
                  : chip.isStatus
                  ? selectedStatusFilter === chip.id
                  : selectedStatusFilter === 'all' && selectedPriorityFilter === 'all' && !showSubtasksOnly;

                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      if (chip.isPriority) {
                        setSelectedPriorityFilter(selectedPriorityFilter === 'urgent_high' ? 'all' : 'urgent_high');
                        setSelectedStatusFilter('all');
                      } else if (chip.isStatus) {
                        setSelectedStatusFilter(selectedStatusFilter === chip.id ? 'all' : chip.id);
                        setSelectedPriorityFilter('all');
                      } else {
                        handleResetFilters();
                      }
                      setShowSubtasksOnly(false);
                    }}
                    style={{
                      border: isActive ? '1px solid var(--flow-primary)' : '1px solid var(--flow-border-subtle)',
                      background: isActive ? 'var(--flow-primary-light)' : 'var(--flow-bg-elevated)',
                      color: isActive ? 'var(--flow-primary)' : 'var(--flow-text-subtle)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.76rem',
                      padding: '5px 11px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {chip.label} ({chip.count})
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--flow-bg-elevated)', border: '1px solid var(--flow-border-subtle)', borderRadius: 8, padding: '5px 12px', width: 260 }}>
              <Search size={14} color="var(--flow-text-muted)" />
              <input
                type="text"
                placeholder="Cari tugas di board..."
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.78rem', color: 'var(--flow-text-main)', width: '100%' }}
              />
              {taskSearchQuery && (
                <button type="button" onClick={() => setTaskSearchQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
                  <X size={13} color="var(--flow-text-muted)" />
                </button>
              )}
            </div>
          </div>

          {/* Task List Items / Subtasks View */}
          {showSubtasksOnly ? (
            /* Subtask Checklist View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeSubtaskList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--flow-text-muted)' }}>
                  <CheckCircle2 size={32} color="var(--flow-accent-emerald)" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--flow-text-main)' }}>
                    Semua checklist subtask telah diselesaikan!
                  </div>
                </div>
              ) : (
                activeSubtaskList.map((sub, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: 'var(--flow-bg-elevated)',
                      border: '1px solid var(--flow-border-subtle)',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckSquare size={16} color="var(--flow-primary)" />
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--flow-text-main)' }}>
                          {sub.subtaskTitle}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                          Bagian dari tugas: <span style={{ color: 'var(--flow-primary)', fontWeight: 500 }}>{sub.taskTitle}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="tab-btn"
                      onClick={() => {
                        const targetTask = tasks.find((t) => t.id === sub.taskId);
                        if (targetTask && onTaskClick) onTaskClick(targetTask);
                      }}
                      style={{ fontSize: '0.74rem', padding: '3px 8px' }}
                    >
                      Buka Tugas →
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Regular Task Rows */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {interactiveTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--flow-text-muted)' }}>
                  <CheckCircle2 size={36} color="var(--flow-accent-emerald)" style={{ margin: '0 auto 8px', opacity: 0.8 }} />
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--flow-text-main)' }}>
                    Tidak ada tugas yang sesuai dengan filter
                  </div>
                  <p style={{ fontSize: '0.78rem', margin: '4px 0 12px' }}>
                    Coba sesuaikan kata kunci pencarian atau reset filter.
                  </p>
                  {isAnyFilterActive && (
                    <button type="button" onClick={handleResetFilters} className="flow-pill-btn active" style={{ padding: '4px 12px', fontSize: '0.74rem' }}>
                      Reset Filter
                    </button>
                  )}
                </div>
              ) : (
                interactiveTasks.slice(0, 8).map((task) => {
                  const isDone = task.status === 'done';
                  const priorityObj = INITIAL_PRIORITIES[task.priority] || INITIAL_PRIORITIES.normal;
                  const colObj = columns.find((c) => c.id === task.status);

                  return (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '11px 14px',
                        borderRadius: 10,
                        background: isDone ? 'rgba(16, 185, 129, 0.03)' : 'var(--flow-bg-elevated)',
                        border: isDone ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--flow-border-subtle)',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => onTaskClick && onTaskClick(task)}
                    >
                      {/* Left: Checkbox + Title */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1, paddingRight: 10 }}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleTaskStatus(task, e)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: 0,
                            color: isDone ? 'var(--flow-accent-emerald)' : 'var(--flow-text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            flexShrink: 0
                          }}
                          title={isDone ? 'Tandai belum selesai' : 'Tandai selesai sekarang'}
                        >
                          {isDone ? (
                            <CheckCircle2 size={19} color="var(--flow-accent-emerald)" fill="rgba(16, 185, 129, 0.15)" />
                          ) : (
                            <Circle size={19} color="var(--flow-border-hover)" />
                          )}
                        </button>

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '0.88rem',
                              fontWeight: 600,
                              color: isDone ? 'var(--flow-text-muted)' : 'var(--flow-text-main)',
                              textDecoration: isDone ? 'line-through' : 'none',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {task.title}
                          </div>
                          {task.description && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {task.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Badges & Details */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                        {/* Priority Badge */}
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 6,
                            color: priorityObj.color,
                            backgroundColor: `${priorityObj.color}15`,
                            border: `1px solid ${priorityObj.color}30`
                          }}
                        >
                          {priorityObj.label}
                        </span>

                        {/* Status Badge */}
                        {colObj && (
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: 6,
                              color: colObj.color || 'var(--flow-primary)',
                              backgroundColor: 'var(--flow-bg-surface)',
                              border: '1px solid var(--flow-border-subtle)'
                            }}
                          >
                            {colObj.title}
                          </span>
                        )}

                        {/* Subtasks Count */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <CheckSquare size={12} />
                            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                          </span>
                        )}

                        <ChevronRight size={15} color="var(--flow-text-muted)" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 4. Kurva Penyelesaian Tugas & Pipeline Breakdown */}
        <div className="flow-charts-split">
          {/* Kurva Penyelesaian Tugas */}
          <div className="flow-chart-panel" style={{ background: 'var(--flow-bg-surface)', border: '1px solid var(--flow-border-subtle)', borderRadius: 14, padding: '20px', boxShadow: 'var(--flow-shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--flow-text-main)', margin: 0 }}>
                  Target Progres Mingguan
                </h4>
                <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                  Target Ideal vs Sisa Beban Aktual Pekan Ini
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.74rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 12, height: 2, borderTop: '2px dashed var(--flow-text-muted)' }} />
                  <span style={{ color: 'var(--flow-text-muted)' }}>Target Ideal</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 12, height: 3, backgroundColor: 'var(--flow-primary)', borderRadius: 2 }} />
                  <span style={{ color: 'var(--flow-primary)', fontWeight: 600 }}>Sisa Aktual</span>
                </div>
              </div>
            </div>

            {/* Responsive SVG Burndown Chart */}
            <div style={{ width: '100%', height: 180 }}>
              <svg width="100%" height="100%" viewBox="0 0 500 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="burndownGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--flow-primary)" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="var(--flow-primary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="40" y1="30" x2="480" y2="30" stroke="var(--flow-border-subtle)" strokeDasharray="3 3" />
                <line x1="40" y1="75" x2="480" y2="75" stroke="var(--flow-border-subtle)" strokeDasharray="3 3" />
                <line x1="40" y1="120" x2="480" y2="120" stroke="var(--flow-border-subtle)" strokeDasharray="3 3" />
                <line x1="40" y1="145" x2="480" y2="145" stroke="var(--flow-border-subtle)" />

                {/* Ideal Guideline */}
                <line x1="60" y1="30" x2="460" y2="145" stroke="var(--flow-text-muted)" strokeWidth="1.5" strokeDasharray="4 4" />

                {/* Actual Area fill */}
                <path
                  d="M 60,30 L 160,50 L 260,85 L 360,115 L 460,135 L 460,145 L 60,145 Z"
                  fill="url(#burndownGrad)"
                />

                {/* Actual Curve line */}
                <path
                  d="M 60,30 L 160,50 L 260,85 L 360,115 L 460,135"
                  fill="none"
                  stroke="var(--flow-primary)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data dots */}
                <circle cx="60" cy="30" r="4" fill="var(--flow-primary)" />
                <circle cx="160" cy="50" r="4" fill="var(--flow-primary)" />
                <circle cx="260" cy="85" r="4" fill="var(--flow-primary)" />
                <circle cx="360" cy="115" r="4" fill="var(--flow-primary)" />
                <circle cx="460" cy="135" r="5" fill="var(--flow-accent-emerald)" stroke="#fff" strokeWidth="2" />

                {/* Day Labels */}
                <text x="60" y="165" fill="var(--flow-text-muted)" fontSize="11" textAnchor="middle">Senin</text>
                <text x="160" y="165" fill="var(--flow-text-muted)" fontSize="11" textAnchor="middle">Selasa</text>
                <text x="260" y="165" fill="var(--flow-text-muted)" fontSize="11" textAnchor="middle">Rabu</text>
                <text x="360" y="165" fill="var(--flow-text-muted)" fontSize="11" textAnchor="middle">Kamis</text>
                <text x="460" y="165" fill="var(--flow-text-muted)" fontSize="11" textAnchor="middle">Jumat</text>
              </svg>
            </div>
          </div>

          {/* Status Pipeline & Funnel Breakdown (Clickable to Filter) */}
          <div className="flow-chart-panel" style={{ background: 'var(--flow-bg-surface)', border: '1px solid var(--flow-border-subtle)', borderRadius: 14, padding: '20px', boxShadow: 'var(--flow-shadow-sm)' }}>
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--flow-text-main)', margin: 0 }}>
                Status Distribusi Tugas
              </h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                💡 Klik kolom di bawah untuk memfilter daftar tugas
              </span>
            </div>

            {/* Pipeline Legend Grid (Clickable Filter Cards) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {columns.map((col) => {
                const count = filteredTasks.filter((t) => t.status === col.id).length;
                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                const isColActive = selectedStatusFilter === col.id;

                return (
                  <div
                    key={col.id}
                    onClick={() => setSelectedStatusFilter(isColActive ? 'all' : col.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: 8,
                      backgroundColor: isColActive ? 'var(--flow-bg-surface)' : 'var(--flow-bg-elevated)',
                      border: isColActive ? `2px solid ${col.color || 'var(--flow-primary)'}` : '1px solid var(--flow-border-subtle)',
                      boxShadow: isColActive ? 'var(--flow-shadow-sm)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                    title={`Klik untuk memfilter tugas dengan status ${col.title}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.color || 'var(--flow-primary)' }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--flow-text-main)' }}>
                        {col.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isColActive ? (col.color || 'var(--flow-primary)') : 'var(--flow-text-subtle)' }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 5. Priority Matrix & Team Contribution (Clickable to Filter) */}
        <div className="flow-charts-split">
          {/* Priority Breakdown */}
          <div className="flow-chart-panel" style={{ background: 'var(--flow-bg-surface)', border: '1px solid var(--flow-border-subtle)', borderRadius: 14, padding: '20px', boxShadow: 'var(--flow-shadow-sm)' }}>
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--flow-text-main)', margin: 0 }}>
                Beban Berdasarkan Prioritas
              </h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                💡 Klik level prioritas untuk memfilter tugas
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(INITIAL_PRIORITIES).map(([key, p]) => {
                const count = filteredTasks.filter((t) => t.priority === key).length;
                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                const isPActive = selectedPriorityFilter === key;

                return (
                  <div
                    key={key}
                    onClick={() => setSelectedPriorityFilter(isPActive ? 'all' : key)}
                    style={{
                      cursor: 'pointer',
                      padding: '8px 10px',
                      borderRadius: 8,
                      background: isPActive ? 'var(--flow-bg-elevated)' : 'transparent',
                      border: isPActive ? `1px solid ${p.color}` : '1px solid transparent',
                      transition: 'all 0.12s ease'
                    }}
                    title={`Klik untuk memfilter tugas prioritas ${p.label}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 5 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: p.color, fontWeight: 700 }}>
                        {p.label}
                      </span>
                      <span style={{ color: 'var(--flow-text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>
                        {count} tugas ({pct}%)
                      </span>
                    </div>

                    <div className="sidebar-progress-bar" style={{ height: 6, margin: 0, backgroundColor: 'var(--flow-bg-elevated)', borderRadius: 999, overflow: 'hidden' }}>
                      <div className="sidebar-progress-fill" style={{ width: `${pct}%`, backgroundColor: p.color, height: '100%' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribusi Tugas & Pencapaian Anggota (Klik untuk Filter) */}
          <div className="flow-chart-panel" style={{ background: 'var(--flow-bg-surface)', border: '1px solid var(--flow-border-subtle)', borderRadius: 14, padding: '20px', boxShadow: 'var(--flow-shadow-sm)' }}>
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--flow-text-main)', margin: 0 }}>
                Distribusi Tugas Anggota
              </h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                💡 Klik anggota untuk melihat tugasnya
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {effectiveMembers.slice(0, 4).map((member) => {
                const memberTasks = filteredTasks.filter(
                  (t) => t.assignee === member.id || t.assignee === member.name || t.assigneeId === member.id
                );
                const doneCount = memberTasks.filter((t) => t.status === 'done').length;
                const memberPct = memberTasks.length > 0 ? Math.round((doneCount / memberTasks.length) * 100) : 0;
                const isMemberActive = selectedMemberFilter === member.id;

                return (
                  <div
                    key={member.id}
                    onClick={() => setSelectedMemberFilter(isMemberActive ? 'all' : member.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 10,
                      backgroundColor: isMemberActive ? 'var(--flow-bg-surface)' : 'var(--flow-bg-elevated)',
                      border: isMemberActive ? '2px solid var(--flow-primary)' : '1px solid var(--flow-border-subtle)',
                      boxShadow: isMemberActive ? 'var(--flow-shadow-sm)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease'
                    }}
                    title={`Klik untuk memfilter tugas yang ditugaskan ke ${member.name}`}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        className="flow-member-avatar-wrap"
                        style={{
                          width: 32,
                          height: 32,
                          fontSize: '0.76rem',
                          backgroundColor: member.color || 'var(--flow-primary)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 700
                        }}
                      >
                        {member.avatar || member.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--flow-text-main)' }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)' }}>
                          {member.role || 'Member'}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--flow-text-main)' }}>
                        {doneCount}/{memberTasks.length} selesai ({memberPct}%)
                      </div>
                      <div style={{ color: memberPct === 100 && memberTasks.length > 0 ? 'var(--flow-accent-emerald)' : 'var(--flow-text-muted)', fontSize: '0.72rem' }}>
                        {memberTasks.length - doneCount} tugas aktif
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ==========================================================================
     MAIN SWITCHER DISPATCHER
     ========================================================================== */
  if (dashboardType === 'simple') {
    return renderSimpleDashboard();
  }

  if (dashboardType === 'ai-center') {
    return renderAICenterDashboard();
  }

  return renderProjectManagementDashboard();
};

export default AnalyticsDashboard;
