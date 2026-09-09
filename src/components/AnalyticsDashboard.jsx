import React, { useState } from 'react';
import {
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

  // Sprint Health Score Calculation
  let healthScore = 95;
  if (urgentTasks > 0) healthScore -= urgentTasks * 4;
  if (reviewTasks > 2) healthScore -= 5;
  if (completionRate < 30 && totalTasks > 4) healthScore -= 10;
  healthScore = Math.max(65, Math.min(98, healthScore));

  let healthStatus = 'Sangat Sehat • On Track';
  let healthBadgeColor = 'var(--flow-accent-emerald)';
  if (healthScore < 80) {
    healthStatus = 'Perlu Perhatian • Moderat';
    healthBadgeColor = 'var(--flow-accent-amber)';
  }
  if (healthScore < 70) {
    healthStatus = 'Kritis • Risiko Bottleneck';
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
                Simple Dashboard Active • Mode Eksekusi Tugas
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
                  {activeSubtaskList.length} item checklist tersisa di sprint
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
     VIEW 2: AI TEAM CENTER (Team Activity, Workload & AI Copilot Intelligence)
     ========================================================================== */
  const renderAICenterDashboard = () => {
    return (
      <div className="flow-analytics-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* FlowPilot AI Team Center Intelligence Card */}
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
                    <Bot size={12} style={{ marginRight: 4 }} /> KeepWork AI Team Intelligence
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                    Kesehatan Kolaborasi: 94/100 (Optimal)
                  </span>
                </div>

                <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--flow-text-main)', margin: '6px 0 4px' }}>
                  AI Team Center • Rekomendasi & Analisis Kapasitas Kolaborasi
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--flow-text-subtle)', margin: 0, maxWidth: 650, lineHeight: 1.45 }}>
                  {aiRebalanced
                    ? '✨ Beban kerja tim telah diselaraskan secara otomatis oleh KeepWork AI. Kapasitas tugas Review & QA dialokasikan secara proporsional kepada Alex Rivera dan Kurnia untuk menjamin rilis tepat waktu.'
                    : 'KeepWork AI mendeteksi 4 kolaborator aktif dengan velocity stabil. Rekomendasi AI: Sarah Chen telah menyelesaikan 100% tugasnya; siap menerima limpahan review dari Dimas Pratama guna mempercepat pengujian akhir.'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="flow-pilot-trigger"
                onClick={() => {
                  setAiRebalanced(true);
                  if (onShowToast) onShowToast('KeepWork AI: Beban kerja tim telah berhasil dioptimalkan!', 'success');
                }}
                title="Otomatis seimbangkan alokasi tugas tim"
              >
                <Sparkles size={14} />
                <span>{aiRebalanced ? 'Beban Terseimbang' : 'Auto-Balance Tim'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Team Collaboration Metrics */}
        <div className="flow-kpi-grid">
          <div className="flow-kpi-card">
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Kontributor Aktif</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-primary)', backgroundColor: 'var(--flow-primary-light)' }}>
                <Users size={16} />
              </div>
            </div>
            <div className="flow-kpi-value">{effectiveMembers.length} Kolaborator</div>
            <div className="flow-kpi-footer">
              <span style={{ color: 'var(--flow-accent-emerald)', fontWeight: 600 }}>100% Aktif</span>
              <span style={{ color: 'var(--flow-text-muted)' }}>semua berkontribusi di sprint</span>
            </div>
          </div>

          <div className="flow-kpi-card">
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Velocity Kolaborasi</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-accent-emerald)', backgroundColor: 'rgba(16, 185, 129, 0.12)' }}>
                <Zap size={16} />
              </div>
            </div>
            <div className="flow-kpi-value">18 Pts</div>
            <div className="flow-kpi-footer">
              <span style={{ color: 'var(--flow-accent-emerald)', fontWeight: 600 }}>+15% Produktivitas</span>
              <span style={{ color: 'var(--flow-text-muted)' }}>konsisten di sprint Q3</span>
            </div>
          </div>

          <div className="flow-kpi-card">
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Waktu Siklus Rata-rata</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-accent-cyan)', backgroundColor: 'rgba(6, 182, 212, 0.12)' }}>
                <Clock size={16} />
              </div>
            </div>
            <div className="flow-kpi-value">2.3 Hari</div>
            <div className="flow-kpi-footer">
              <span style={{ color: 'var(--flow-accent-cyan)', fontWeight: 600 }}>Lead Time Cepat</span>
              <span style={{ color: 'var(--flow-text-muted)' }}>dari To Do ke Selesai</span>
            </div>
          </div>

          <div className="flow-kpi-card">
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Akurasi Estimasi Waktu</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-accent-amber)', backgroundColor: 'rgba(245, 158, 11, 0.12)' }}>
                <Target size={16} />
              </div>
            </div>
            <div className="flow-kpi-value">92%</div>
            <div className="flow-kpi-footer">
              <span style={{ color: 'var(--flow-accent-emerald)', fontWeight: 600 }}>On Schedule</span>
              <span style={{ color: 'var(--flow-text-muted)' }}>deviasi jam kerja minimal</span>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Team Workload Radar & Live Collaboration Stream */}
        <div className="flow-charts-split">
          {/* Left Column: Team Capacity & Workload Radar */}
          <div className="flow-chart-panel" style={{ flex: 1 }}>
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: 0 }}>
                👥 Radar Beban Kerja & Kapasitas Tim
              </h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                Monitoring kapasitas real-time per anggota tim untuk menghindari kejenuhan (burnout)
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
                ⚡ Aktivitas Kolaborasi Tim Terkini
              </h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                Log interaktif pergerakan tiket dan pencapaian tim real-time
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
                    Dimas Pratama memindahkan tugas ke Review & QA
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', marginTop: 2 }}>
                    Implementasi Autentikasi JWT • 15 menit lalu
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
                    Sarah Chen menyelesaikan checklist subtask
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', marginTop: 2 }}>
                    Desain UI Onboarding Pengguna • 1 jam lalu
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
                    KeepWork AI mendeteksi target pekan ini terpenuhi 67%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', marginTop: 2 }}>
                    Target Tugas On Track • 2 jam lalu
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
                    Alex Rivera memperbarui estimasi tugas
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', marginTop: 2 }}>
                    Setup Database PostgreSQL & Redis • 4 jam lalu
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
     VIEW 3: PROJECT MANAGEMENT (Executive Analytics & Sprint Burndown)
     ========================================================================== */
  const renderProjectManagementDashboard = () => {
    return (
      <div className="flow-analytics-wrapper">
        {/* 1. Executive Sprint Pulse & AI Health Card */}
        <div className="flow-ai-health-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div className="flow-health-score-circle">
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--flow-primary)' }}>
                  {healthScore}
                </span>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--flow-text-muted)', textTransform: 'uppercase' }}>
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
                      padding: '2px 8px',
                      borderRadius: 999,
                      backgroundColor: `${healthBadgeColor}18`,
                      color: healthBadgeColor
                    }}
                  >
                    <Activity size={12} />
                    {healthStatus}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                    Target Pekan Ini
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: '6px 0 4px' }}>
                  KeepWork AI Produktivitas Diagnostics
                </h3>
                <p style={{ fontSize: '0.84rem', color: 'var(--flow-text-subtle)', margin: 0, maxWidth: 620, lineHeight: 1.45 }}>
                  {completedTasks >= 2
                    ? `Aktivitas berjalan efisien dengan ${completedTasks} tugas terselesaikan. Ritme produktivitas stabil. Terdapat ${reviewTasks} tugas dalam tahap review untuk finalisasi.`
                    : `Pekan baru dimulai dengan ${todoTasks} tugas aktif. Fokuskan prioritas utama (${urgentTasks} mendesak) untuk menghindari penumpukan menjelang deadline.`}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select
                className="filter-select"
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                style={{ fontSize: '0.8rem', padding: '6px 10px' }}
              >
                <option value="active_sprint">Target Pekan Ini</option>
                <option value="urgent_only">Prioritas Mendesak & Tinggi Saja</option>
                <option value="all">Semua Data Tugas</option>
              </select>

              <button
                className="tab-btn"
                onClick={handlePrint}
                style={{ fontSize: '0.8rem', padding: '6px 12px', gap: 6 }}
                title="Cetak atau simpan laporan ke PDF"
              >
                <Printer size={14} />
                <span>Cetak Laporan</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Primary KPI Metric Cards */}
        <div className="flow-kpi-grid">
          <div className="flow-kpi-card">
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Tingkat Penyelesaian</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-accent-emerald)', backgroundColor: 'rgba(16, 185, 129, 0.12)' }}>
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="flow-kpi-value">{completionRate}%</div>
            <div className="flow-kpi-footer">
              <span style={{ color: 'var(--flow-accent-emerald)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                <ArrowUpRight size={13} /> +14%
              </span>
              <span style={{ color: 'var(--flow-text-muted)' }}>{completedTasks} dari {totalTasks} tugas selesai</span>
            </div>
          </div>

          <div className="flow-kpi-card">
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Tugas Dalam Pengerjaan</span>
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

          <div className="flow-kpi-card">
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Risiko Urgent & Blocked</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-accent-rose)', backgroundColor: 'rgba(244, 63, 94, 0.12)' }}>
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="flow-kpi-value" style={{ color: urgentTasks > 0 ? 'var(--flow-accent-rose)' : 'inherit' }}>
              {urgentTasks}
            </div>
            <div className="flow-kpi-footer">
              <span style={{ color: urgentTasks > 0 ? 'var(--flow-accent-rose)' : 'var(--flow-accent-emerald)', fontWeight: 600 }}>
                {urgentTasks === 0 ? 'Terkontrol' : 'Perlu Eskalasi'}
              </span>
              <span style={{ color: 'var(--flow-text-muted)' }}>
                {urgentTasks === 0 ? 'Tidak ada bottleneck' : 'Prioritas tinggi'}
              </span>
            </div>
          </div>

          <div className="flow-kpi-card">
            <div className="flow-kpi-header">
              <span className="flow-kpi-title">Eksekusi Subtask</span>
              <div className="flow-kpi-icon-wrap" style={{ color: 'var(--flow-primary)', backgroundColor: 'var(--flow-primary-light)' }}>
                <CheckCircle2 size={16} />
              </div>
            </div>
            <div className="flow-kpi-value">
              {completedSubtasks}/{totalSubtasks}
            </div>
            <div className="flow-kpi-footer">
              <span style={{ color: 'var(--flow-primary)', fontWeight: 600 }}>
                {totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0}%
              </span>
              <span style={{ color: 'var(--flow-text-muted)' }}>subtask checklist terverifikasi</span>
            </div>
          </div>
        </div>

        {/* 3. Sprint Burndown Curve & Pipeline Matrix */}
        <div className="flow-charts-split">
          {/* Sprint Burndown Curve */}
          <div className="flow-chart-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: 0 }}>
                  Target Burndown Mingguan
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

          {/* Status Pipeline & Funnel Breakdown */}
          <div className="flow-chart-panel">
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: 0 }}>
                Status Distribusi Tugas
              </h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                Alur penyelesaian tiket antar kolom status
              </span>
            </div>

            {/* Multi-segmented progress bar */}
            <div
              style={{
                display: 'flex',
                height: 18,
                borderRadius: 999,
                overflow: 'hidden',
                backgroundColor: 'var(--flow-bg-elevated)',
                marginBottom: 16
              }}
            >
              {columns.map((col) => {
                const count = filteredTasks.filter((t) => t.status === col.id).length;
                const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={col.id}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: col.color || 'var(--flow-primary)',
                      transition: 'width 0.4s ease'
                    }}
                    title={`${col.title}: ${count} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>

            {/* Pipeline Legend Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {columns.map((col) => {
                const count = filteredTasks.filter((t) => t.status === col.id).length;
                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

                return (
                  <div
                    key={col.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 8,
                      backgroundColor: 'var(--flow-bg-elevated)',
                      border: '1px solid var(--flow-border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.color || 'var(--flow-primary)' }} />
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--flow-text-main)' }}>
                        {col.title}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--flow-text-subtle)' }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Priority Matrix & Team Contribution Leaderboard */}
        <div className="flow-charts-split" style={{ marginTop: 20 }}>
          {/* Priority Breakdown */}
          <div className="flow-chart-panel">
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: 0 }}>
                Beban Berdasarkan Prioritas
              </h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                Identifikasi alokasi fokus terhadap tiket kritis
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Object.entries(INITIAL_PRIORITIES).map(([key, p]) => {
                const count = filteredTasks.filter((t) => t.priority === key).length;
                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 5 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: p.color, fontWeight: 600 }}>
                        {p.label}
                      </span>
                      <span style={{ color: 'var(--flow-text-muted)', fontSize: '0.78rem' }}>
                        {count} tugas ({pct}%)
                      </span>
                    </div>
                    <div className="sidebar-progress-bar" style={{ height: 6, margin: 0, backgroundColor: 'var(--flow-bg-elevated)' }}>
                      <div className="sidebar-progress-fill" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Team Workload & Contribution */}
          <div className="flow-chart-panel">
            <div style={{ marginBottom: 14 }}>
              <h4 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: 0 }}>
                Alokasi & Kontribusi Anggota Tim
              </h4>
              <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                Produktivitas per kolaborator di sprint ini
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {effectiveMembers.slice(0, 4).map((member) => {
                const memberTasks = filteredTasks.filter(
                  (t) => t.assignee === member.id || t.assignee === member.name || t.assigneeId === member.id
                );
                const doneCount = memberTasks.filter((t) => t.status === 'done').length;
                const memberPct = memberTasks.length > 0 ? Math.round((doneCount / memberTasks.length) * 100) : 0;

                return (
                  <div
                    key={member.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 10,
                      backgroundColor: 'var(--flow-bg-elevated)',
                      border: '1px solid var(--flow-border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        className="flow-member-avatar-wrap"
                        style={{
                          width: 32,
                          height: 32,
                          fontSize: '0.76rem',
                          backgroundColor: member.color || 'var(--flow-primary)'
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
