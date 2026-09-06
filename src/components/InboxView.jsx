import React, { useState } from 'react';
import {
  Inbox,
  Filter,
  CheckCheck,
  UserPlus,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';

export const InboxView = ({ tasks = [], onTaskClick, onOpenInviteModal }) => {
  const [activeTab, setActiveTab] = useState('primary'); // 'primary' | 'other' | 'later' | 'cleared'
  const [clearedIds, setClearedIds] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'urgent' | 'subtask'

  // Notifications pool
  const allNotifications = [
    {
      id: 'notif-1',
      tab: 'primary',
      taskId: 'task-102',
      title: 'Dimas Pratama memindahkan tugas ke Review & QA',
      subtitle: 'Implementasi Autentikasi JWT & Role-Based Access Control (RBAC)',
      time: '15m lalu',
      type: 'status',
      icon: CheckCircle2,
      iconColor: '#8b5cf6'
    },
    {
      id: 'notif-2',
      tab: 'primary',
      taskId: 'task-101',
      title: 'Sarah Chen menyelesaikan 2 subtask',
      subtitle: 'Desain UI Onboarding & Halaman Registrasi Interaktif',
      time: '1j lalu',
      type: 'subtask',
      icon: CheckCheck,
      iconColor: '#10b981'
    },
    {
      id: 'notif-3',
      tab: 'primary',
      taskId: 'task-107',
      title: 'Perhatian: Tugas prioritas Urgent perlu ditinjau',
      subtitle: 'Audit Keamanan & Pencegahan Kerentanan XSS / CSRF',
      time: '3j lalu',
      type: 'urgent',
      icon: AlertTriangle,
      iconColor: '#ef4444'
    },
    {
      id: 'notif-4',
      tab: 'other',
      taskId: 'task-105',
      title: 'Sistem Design System diperbarui',
      subtitle: 'Token warna CSS dan komponen modal baru berhasil digabungkan.',
      time: '5j lalu',
      type: 'system',
      icon: Layers,
      iconColor: '#0066ff'
    },
    {
      id: 'notif-5',
      tab: 'other',
      taskId: null,
      title: 'Integrasi Google Calendar terverifikasi',
      subtitle: 'Sinkronisasi dua arah dengan kalender kerja aktif.',
      time: '1 hari lalu',
      type: 'integration',
      icon: Calendar,
      iconColor: '#10b981'
    },
    {
      id: 'notif-6',
      tab: 'later',
      taskId: 'task-106',
      title: 'Pengingat Deadline: Review Proposal & Tugas Kuliah',
      subtitle: 'Dijadwalkan untuk peninjauan akhir minggu ini.',
      time: 'Besok, 09:00',
      type: 'reminder',
      icon: Clock,
      iconColor: '#f59e0b'
    }
  ];

  const handleClearAll = () => {
    const currentTabIds = allNotifications.filter(n => n.tab === activeTab).map(n => n.id);
    setClearedIds(prev => [...new Set([...prev, ...currentTabIds])]);
  };

  const currentTabNotifications = allNotifications.filter(n => {
    if (activeTab === 'cleared') {
      return clearedIds.includes(n.id);
    }
    return n.tab === activeTab && !clearedIds.includes(n.id);
  });

  const filteredNotifications = currentTabNotifications.filter(n => {
    if (filterType === 'urgent') return n.type === 'urgent';
    if (filterType === 'subtask') return n.type === 'subtask';
    return true;
  });

  return (
    <div className="clickup-inbox-container">
      {/* Sub-tabs bar */}
      <div className="inbox-subtabs-bar">
        <div className="inbox-tabs">
          <div
            className={`inbox-tab-item ${activeTab === 'primary' ? 'active' : ''}`}
            onClick={() => setActiveTab('primary')}
          >
            <Inbox size={15} />
            <span>Primary</span>
          </div>

          <div
            className={`inbox-tab-item ${activeTab === 'other' ? 'active' : ''}`}
            onClick={() => setActiveTab('other')}
          >
            <span>Other</span>
          </div>

          <div
            className={`inbox-tab-item ${activeTab === 'later' ? 'active' : ''}`}
            onClick={() => setActiveTab('later')}
          >
            <Clock size={14} />
            <span>Later</span>
          </div>

          <div
            className={`inbox-tab-item ${activeTab === 'cleared' ? 'active' : ''}`}
            onClick={() => setActiveTab('cleared')}
          >
            <CheckCheck size={14} />
            <span>Cleared ({clearedIds.length})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Filter size={13} color="var(--flow-text-muted)" />
            <select
              className="filter-select"
              style={{ fontSize: '0.78rem', padding: '3px 8px' }}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Semua Tipe</option>
              <option value="urgent">🔴 Urgent Saja</option>
              <option value="subtask">✓ Subtasks Saja</option>
            </select>
          </div>

          {activeTab !== 'cleared' && currentTabNotifications.length > 0 && (
            <button
              className="tab-btn"
              onClick={handleClearAll}
              style={{ fontSize: '0.8rem', padding: '4px 10px' }}
            >
              <CheckCheck size={13} />
              <span>Bersihkan Semua</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="inbox-content-area">
        {filteredNotifications.length > 0 ? (
          <div style={{ width: '100%', maxWidth: 780, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredNotifications.map((notif) => {
              const Icon = notif.icon;
              const relatedTask = notif.taskId ? tasks.find((t) => t.id === notif.taskId) : null;

              return (
                <div
                  key={notif.id}
                  style={{
                    background: 'var(--flow-bg-surface)',
                    border: '1px solid var(--flow-border-subtle)',
                    borderRadius: 12,
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: relatedTask ? 'pointer' : 'default',
                    boxShadow: 'var(--flow-shadow-sm)',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => {
                    if (relatedTask && onTaskClick) {
                      onTaskClick(relatedTask);
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        backgroundColor: `${notif.iconColor}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={18} color={notif.iconColor} />
                    </div>

                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--flow-text-main)' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--flow-text-muted)', marginTop: 2 }}>
                        {notif.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--flow-text-muted)' }}>
                      {notif.time}
                    </span>
                    {!clearedIds.includes(notif.id) && (
                      <button
                        className="icon-btn"
                        style={{ width: 28, height: 28 }}
                        title="Tandai Selesai / Arsipkan"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClearedIds((prev) => [...prev, notif.id]);
                        }}
                      >
                        <CheckCheck size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div style={{ textAlign: 'center', maxWidth: 420, padding: '40px 20px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'var(--flow-primary-light)',
                color: 'var(--flow-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px auto'
              }}
            >
              {activeTab === 'cleared' ? <CheckCheck size={28} /> : <UserPlus size={28} />}
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--flow-text-main)', marginBottom: 8 }}>
              {activeTab === 'cleared'
                ? 'Semua notifikasi telah dibersihkan'
                : 'Kotak Masuk Bersih'}
            </h3>
            <p style={{ fontSize: '0.86rem', color: 'var(--flow-text-muted)', marginBottom: 20 }}>
              {activeTab === 'cleared'
                ? 'Kotak masuk Anda rapi dan siap untuk sprint berikutnya.'
                : 'Tidak ada notifikasi yang tertunda. Kolaborasi dan pantau progres tim dengan mengundang rekan kerja.'}
            </p>

            <button
              className="flow-add-task-btn"
              style={{ margin: '0 auto', padding: '8px 20px', fontSize: '0.86rem' }}
              onClick={() => {
                if (onOpenInviteModal) {
                  onOpenInviteModal();
                }
              }}
            >
              + Undang Rekan Tim
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
