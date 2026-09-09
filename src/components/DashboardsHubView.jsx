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
      id: 'project',
      title: 'Target & Progress',
      subtitle: 'Metrik target dan progres penyelesaian',
      icon: Briefcase
    },
    {
      id: 'simple',
      title: 'Tugas Harian',
      subtitle: 'Daftar prioritas dan checklist aktif',
      icon: Layers
    },
    {
      id: 'ai-center',
      title: 'KeepWork AI',
      subtitle: 'Rekomendasi prioritas dan analisis cerdas',
      icon: Sparkles
    }
  ]);

  const activeTemplate = dashboardTemplates.find((t) => t.id === selectedDashboard) || dashboardTemplates[2];

  const getDashboardHeaderInfo = () => {
    if (selectedDashboard === 'simple') {
      return {
        title: 'Tugas & Prioritas Harian',
        subtitle: 'Fokus eksekusi tugas aktif dan subtask tanpa distraksi.'
      };
    }
    if (selectedDashboard === 'ai-center') {
      return {
        title: 'KeepWork AI Assistant',
        subtitle: 'Analisis produktivitas dan rekomendasi beban kerja.'
      };
    }
    if (selectedDashboard === 'project') {
      return {
        title: 'Target & Progres Kerja',
        subtitle: 'Metrik pencapaian target, velocity mingguan, dan kurva tugas.'
      };
    }
    return {
      title: activeTemplate.title,
      subtitle: activeTemplate.subtitle || 'Tampilan dashboard kustom'
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--flow-text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            {headerInfo.title}
          </h2>
          <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--flow-text-muted)' }}>
            {headerInfo.subtitle}
          </p>
        </div>

        <button
          type="button"
          className="flow-btn flow-btn-primary"
          onClick={() => setShowNewDashboardModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: '0.82rem', fontWeight: 600, borderRadius: 6 }}
        >
          <Plus size={14} />
          <span>Dashboard Baru</span>
        </button>
      </div>

      {/* Templates Segmented Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', marginBottom: 20, paddingBottom: 2 }}>
        {dashboardTemplates.map((tpl) => {
          const Icon = tpl.icon;
          const isSelected = selectedDashboard === tpl.id;

          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => setSelectedDashboard(tpl.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 12px',
                borderRadius: 6,
                border: isSelected ? '1px solid var(--flow-text-main)' : '1px solid var(--flow-border-subtle)',
                background: isSelected ? 'var(--flow-text-main)' : 'var(--flow-bg-surface)',
                color: isSelected ? 'var(--flow-bg-base)' : 'var(--flow-text-subtle)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.12s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={13} />
              <span>{tpl.title}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => setShowNewDashboardModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '6px 10px',
            borderRadius: 6,
            border: '1px dashed var(--flow-border-subtle)',
            background: 'transparent',
            color: 'var(--flow-text-muted)',
            fontSize: '0.76rem',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
          title="Tambah Tampilan Kustom"
        >
          <Plus size={12} />
          <span>Kustom</span>
        </button>
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
