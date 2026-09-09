import React, { useState } from 'react';
import {
  LayoutDashboard,
  Plus,
  Search,
  ArrowUpDown,
  Sparkles,
  Briefcase,
  Layers,
  ChevronDown,
  X,
  Check
} from 'lucide-react';
import { AnalyticsDashboard } from './AnalyticsDashboard';

export const DashboardsHubView = ({
  tasks = [],
  columns = [],
  members = [],
  onUpdateTaskStatus,
  onTaskClick,
  onOpenNewTask,
  onShowToast
}) => {
  const [selectedDashboard, setSelectedDashboard] = useState('project');
  const [showNewDashboardModal, setShowNewDashboardModal] = useState(false);
  const [customDashboardName, setCustomDashboardName] = useState('');
  const [dashboardTemplates, setDashboardTemplates] = useState([
    {
      id: 'simple',
      title: 'Simple Dashboard',
      subtitle: 'Fokus & prioritas tugas harian',
      icon: Layers,
      color: '#0066ff',
      badge: 'Fokus Harian'
    },
    {
      id: 'ai-center',
      title: 'AI Productivity Hub',
      subtitle: 'Asisten KeepWork AI & ringkasan cerdas',
      icon: Sparkles,
      color: '#ff007f',
      badge: 'KeepWork AI'
    },
    {
      id: 'project',
      title: 'Target & Progress',
      subtitle: 'Pantau target, kurva selesai, & progres',
      icon: Briefcase,
      color: '#00a884',
      badge: 'Progres'
    }
  ]);

  const activeTemplate = dashboardTemplates.find((t) => t.id === selectedDashboard) || dashboardTemplates[2];

  const getDashboardHeaderInfo = () => {
    if (selectedDashboard === 'simple') {
      return {
        title: 'Simple Task & Priority Hub',
        subtitle: 'Fokus eksekusi tugas harian, checklist prioritas mendesak, dan mitigasi to-do tanpa distraksi.'
      };
    }
    if (selectedDashboard === 'ai-center') {
      return {
        title: 'KeepWork AI & Productivity Intelligence',
        subtitle: 'Pusat asisten cerdas untuk brainstorming, rekomendasi prioritas tugas, dan mitigasi waktu luang.'
      };
    }
    if (selectedDashboard === 'project') {
      return {
        title: 'Target, Metrik & Progress Tracker',
        subtitle: 'Diagnosis pencapaian target, kurva penyelesaian tugas, kemajuan mingguan, dan estimasi selesai.'
      };
    }
    return {
      title: activeTemplate.title,
      subtitle: activeTemplate.subtitle || 'Custom workspace dashboard metrics'
    };
  };

  const headerInfo = getDashboardHeaderInfo();

  const handleCreateDashboard = (e) => {
    e?.preventDefault();
    if (!customDashboardName.trim()) return;

    const newDash = {
      id: 'dash-' + Date.now(),
      title: customDashboardName.trim(),
      subtitle: 'Custom workspace dashboard metrics',
      icon: LayoutDashboard,
      color: '#8b5cf6',
      badge: 'Kustom'
    };

    setDashboardTemplates([...dashboardTemplates, newDash]);
    setSelectedDashboard(newDash.id);
    setCustomDashboardName('');
    setShowNewDashboardModal(false);
  };

  return (
    <div className="dashboard-hub-content" style={{ flex: 1, overflowY: 'auto' }}>
      {/* Top Header */}
      <div className="dashboard-top-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--flow-text-main)', margin: 0 }}>
              {headerInfo.title}
            </h2>
            {activeTemplate.badge && (
              <span
                className="flow-badge"
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  backgroundColor: `${activeTemplate.color}15`,
                  color: activeTemplate.color,
                  border: `1px solid ${activeTemplate.color}35`
                }}
              >
                {activeTemplate.badge}
              </span>
            )}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--flow-text-muted)' }}>
            {headerInfo.subtitle}
          </p>
        </div>

        <button
          type="button"
          className="flow-add-task-btn"
          onClick={() => setShowNewDashboardModal(true)}
          title="Buat Templat Dashboard Baru"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Dashboard Baru</span>
        </button>
      </div>

      {/* Templates Carousel */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--flow-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            PILIHAN TEMPLAT & TAMPILAN
          </div>
          <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
            Pilih templat untuk mengubah sudut pandang metrik kerja
          </span>
        </div>

        <div className="dashboards-carousel">
          {dashboardTemplates.map((tpl) => {
            const Icon = tpl.icon;
            const isSelected = selectedDashboard === tpl.id;

            return (
              <div
                key={tpl.id}
                className="dashboard-template-card"
                style={{
                  borderColor: isSelected ? tpl.color : 'var(--flow-border-subtle)',
                  backgroundColor: isSelected ? `${tpl.color}0c` : 'var(--flow-bg-surface)',
                  boxShadow: isSelected ? `0 0 0 2px ${tpl.color}35, var(--flow-shadow-sm)` : 'var(--flow-shadow-sm)',
                  cursor: 'pointer',
                  borderRadius: 12,
                  transition: 'all 0.18s ease'
                }}
                onClick={() => setSelectedDashboard(tpl.id)}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    backgroundColor: `${tpl.color}18`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tpl.color,
                    flexShrink: 0
                  }}
                >
                  <Icon size={20} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.92rem', color: isSelected ? tpl.color : 'var(--flow-text-main)' }}>
                      {tpl.title}
                    </span>
                    {tpl.badge && (
                      <span
                        className="flow-badge"
                        style={{
                          fontSize: '0.64rem',
                          padding: '1px 6px',
                          backgroundColor: `${tpl.color}15`,
                          color: tpl.color
                        }}
                      >
                        {tpl.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--flow-text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tpl.subtitle}
                  </div>
                </div>

                {isSelected && (
                  <div style={{ color: tpl.color, display: 'flex', alignItems: 'center' }}>
                    <Check size={16} strokeWidth={2.8} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Embedded Rich Dashboard Visuals */}
      <AnalyticsDashboard
        tasks={tasks}
        columns={columns}
        members={members}
        dashboardType={selectedDashboard}
        onUpdateTaskStatus={onUpdateTaskStatus}
        onTaskClick={onTaskClick}
        onOpenNewTask={onOpenNewTask}
        onShowToast={onShowToast}
      />

      {/* New Dashboard Modal */}
      {showNewDashboardModal && (
        <div className="modal-backdrop" onClick={() => setShowNewDashboardModal(false)}>
          <div className="modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 700, fontSize: '0.94rem' }}>Buat Custom Dashboard Baru</span>
              <button className="icon-btn" onClick={() => setShowNewDashboardModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateDashboard} style={{ padding: '20px' }}>
              <label className="meta-field-label" style={{ marginBottom: 6, display: 'block' }}>
                Nama Dashboard
              </label>
              <input
                type="text"
                placeholder="Contoh: Q3 Executive Burndown..."
                value={customDashboardName}
                onChange={(e) => setCustomDashboardName(e.target.value)}
                autoFocus
                className="meta-field-input"
                style={{ width: '100%', marginBottom: 16 }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowNewDashboardModal(false)}
                  className="tab-btn"
                >
                  Batal
                </button>
                <button type="submit" className="flow-add-task-btn">
                  Buat Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
