import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Home,
  FolderKanban,
  Calendar,
  Sparkles,
  Users,
  BarChart3,
  Plus,
  UserPlus,
  Moon,
  Sun,
  Timer,
  Download,
  MessageSquare,
  ArrowRight,
  X,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export const CommandPaletteModal = ({
  isOpen,
  onClose,
  tasks = [],
  members = [],
  activeModule,
  setActiveModule,
  theme,
  toggleTheme,
  onOpenTaskModal,
  onOpenInviteModal,
  onOpenPomodoro,
  onOpenChannel,
  onTaskClick,
  onExportData,
  onShowToast
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Navigation items
  const navCommands = [
    {
      id: 'nav-dashboards',
      category: 'Navigasi',
      title: 'Buka Dashboard & Analytics',
      subtitle: 'Grafik analitik kemajuan sprint, kesehatan rilis, dan produktivitas tim',
      icon: BarChart3,
      action: () => {
        setActiveModule('dashboards');
        onClose();
      }
    },
    {
      id: 'nav-spaces',
      category: 'Navigasi',
      title: 'Buka Projects & Tasks (Kanban / List)',
      subtitle: 'Kelola papan sprint, kolom, dan alur kerja proyek',
      icon: FolderKanban,
      action: () => {
        setActiveModule('spaces');
        onClose();
      }
    },
    {
      id: 'nav-home',
      category: 'Navigasi',
      title: 'Buka Inbox & Activity',
      subtitle: 'Lihat pemberitahuan dan aktivitas tugas terbaru',
      icon: Home,
      action: () => {
        setActiveModule('home');
        onClose();
      }
    },
    {
      id: 'nav-planner',
      category: 'Navigasi',
      title: 'Buka Schedule Planner & Kalender',
      subtitle: 'Tinjauan tenggat waktu, mode Pekan, Bulan, dan Agenda',
      icon: Calendar,
      action: () => {
        setActiveModule('planner');
        onClose();
      }
    },
    {
      id: 'nav-brain',
      category: 'Navigasi',
      title: 'Buka KeepWork AI Intelligence',
      subtitle: 'Asisten cerdas analisis beban kerja dan ringkasan sprint',
      icon: Sparkles,
      badge: 'AI',
      action: () => {
        setActiveModule('brain');
        onClose();
      }
    },
    {
      id: 'nav-teams',
      category: 'Navigasi',
      title: 'Buka Manajemen Tim & Workload Hub',
      subtitle: 'Pantau kapasitas alokasi kerja tim dan direktori kolaborator',
      icon: Users,
      action: () => {
        setActiveModule('teams');
        onClose();
      }
    }
  ];

  // 2. Quick Actions
  const actionCommands = [
    {
      id: 'act-new-task',
      category: 'Aksi Cepat',
      title: 'Buat Tugas Baru',
      subtitle: 'Tambah tugas ke kolom To Do dengan prioritas & tanggal',
      icon: Plus,
      action: () => {
        onClose();
        if (onOpenTaskModal) onOpenTaskModal();
      }
    },
    {
      id: 'act-invite',
      category: 'Aksi Cepat',
      title: 'Tambah Anggota Tim Baru',
      subtitle: 'Undang kolaborator, atur departemen dan kapasitas kerja',
      icon: UserPlus,
      action: () => {
        onClose();
        if (onOpenInviteModal) onOpenInviteModal();
      }
    },
    {
      id: 'act-theme',
      category: 'Aksi Cepat',
      title: theme === 'dark' ? 'Ganti ke Tema Terang (Light Mode)' : 'Ganti ke Tema Gelap (Dark Mode)',
      subtitle: 'Sesuaikan kontras dan palet visual aplikasi',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => {
        toggleTheme();
        onClose();
      }
    },
    {
      id: 'act-pomodoro',
      category: 'Aksi Cepat',
      title: 'Buka Pengatur Waktu Fokus Pomodoro',
      subtitle: 'Mulai sesi kerja 25 menit produktif tanpa distraksi',
      icon: Timer,
      action: () => {
        onClose();
        if (onOpenPomodoro) onOpenPomodoro();
      }
    },
    {
      id: 'act-chat',
      category: 'Aksi Cepat',
      title: 'Buka Obrolan Tim (#general)',
      subtitle: 'Kirim pesan instan dan koordinasi tim secara langsung',
      icon: MessageSquare,
      action: () => {
        onClose();
        if (onOpenChannel) onOpenChannel('general');
      }
    },
    {
      id: 'act-export',
      category: 'Aksi Cepat',
      title: 'Cadangkan / Ekspor Data Workspace (JSON)',
      subtitle: 'Unduh seluruh data tugas, kolom, dan anggota tim ke file JSON',
      icon: Download,
      action: () => {
        onClose();
        if (onExportData) onExportData();
      }
    }
  ];

  // 3. Matching Tasks
  const q = query.trim().toLowerCase();
  const matchingTasks = tasks
    .filter((t) => {
      if (!q) return false;
      const titleMatch = (t.title || '').toLowerCase().includes(q);
      const descMatch = (t.description || '').toLowerCase().includes(q);
      const assigneeMatch = (t.assignee || '').toLowerCase().includes(q);
      return titleMatch || descMatch || assigneeMatch;
    })
    .slice(0, 5)
    .map((t) => ({
      id: 'task-' + t.id,
      category: 'Tugas Proyek',
      title: t.title,
      subtitle: `${t.status} • ${t.assignee || 'Unassigned'} • Tenggat: ${t.dueDate || 'Tidak ada'}`,
      icon: t.status === 'done' ? CheckCircle2 : Clock,
      taskObj: t,
      action: () => {
        onClose();
        if (onTaskClick) onTaskClick(t);
      }
    }));

  // Filter commands by query
  const filteredNav = navCommands.filter(
    (c) => !q || c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q)
  );

  const filteredActions = actionCommands.filter(
    (c) => !q || c.title.toLowerCase().includes(q) || c.subtitle.toLowerCase().includes(q)
  );

  // Combine flat list for keyboard indexing
  const allItems = [...filteredNav, ...filteredActions, ...matchingTasks];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="flow-palette-backdrop" onClick={onClose}>
      <div
        className="flow-palette-container"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Box */}
        <div className="flow-palette-header">
          <Search size={18} color="var(--flow-primary)" />
          <input
            ref={inputRef}
            type="text"
            className="flow-palette-input"
            placeholder="Ketik perintah atau cari tugas... (Gunakan ↑ ↓ Enter)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          {query ? (
            <button className="icon-btn" onClick={() => setQuery('')} style={{ width: 24, height: 24 }}>
              <X size={14} />
            </button>
          ) : (
            <span className="flow-kbd-badge" style={{ fontSize: '0.68rem' }}>ESC</span>
          )}
        </div>

        {/* Results List */}
        <div className="flow-palette-body" ref={listRef}>
          {allItems.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--flow-text-muted)' }}>
              <AlertCircle size={28} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--flow-text-main)' }}>
                Tidak ada hasil untuk "{query}"
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: 4 }}>
                Coba gunakan kata kunci lain seperti "tugas", "tim", "tema", atau "inbox"
              </div>
            </div>
          ) : (
            <>
              {/* Group: Navigation */}
              {filteredNav.length > 0 && (
                <div className="flow-palette-group">
                  <div className="flow-palette-group-title">Navigasi Halaman</div>
                  {filteredNav.map((item) => {
                    const itemGlobalIndex = allItems.indexOf(item);
                    const isSelected = itemGlobalIndex === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        className={`flow-palette-item ${isSelected ? 'selected' : ''}`}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                      >
                        <div className="flow-palette-item-icon">
                          <Icon size={16} />
                        </div>
                        <div className="flow-palette-item-content">
                          <div className="flow-palette-item-title">
                            {item.title}
                            {item.badge && (
                              <span className="flow-badge flow-badge-cyan" style={{ fontSize: '0.62rem', marginLeft: 6 }}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <div className="flow-palette-item-sub">{item.subtitle}</div>
                        </div>
                        <ArrowRight size={14} className="flow-palette-arrow" />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Group: Actions */}
              {filteredActions.length > 0 && (
                <div className="flow-palette-group">
                  <div className="flow-palette-group-title">Tindakan & Aksi Cepat</div>
                  {filteredActions.map((item) => {
                    const itemGlobalIndex = allItems.indexOf(item);
                    const isSelected = itemGlobalIndex === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        className={`flow-palette-item ${isSelected ? 'selected' : ''}`}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                      >
                        <div className="flow-palette-item-icon" style={{ color: 'var(--flow-accent-cyan)' }}>
                          <Icon size={16} />
                        </div>
                        <div className="flow-palette-item-content">
                          <div className="flow-palette-item-title">{item.title}</div>
                          <div className="flow-palette-item-sub">{item.subtitle}</div>
                        </div>
                        <ArrowRight size={14} className="flow-palette-arrow" />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Group: Matching Tasks */}
              {matchingTasks.length > 0 && (
                <div className="flow-palette-group">
                  <div className="flow-palette-group-title">Tugas yang Cocok</div>
                  {matchingTasks.map((item) => {
                    const itemGlobalIndex = allItems.indexOf(item);
                    const isSelected = itemGlobalIndex === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        className={`flow-palette-item ${isSelected ? 'selected' : ''}`}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                      >
                        <div className="flow-palette-item-icon" style={{ color: 'var(--flow-accent-emerald)' }}>
                          <Icon size={16} />
                        </div>
                        <div className="flow-palette-item-content">
                          <div className="flow-palette-item-title">{item.title}</div>
                          <div className="flow-palette-item-sub">{item.subtitle}</div>
                        </div>
                        <span
                          className={`flow-badge ${
                            item.taskObj.priority === 'urgent'
                              ? 'flow-badge-rose'
                              : item.taskObj.priority === 'high'
                              ? 'flow-badge-amber'
                              : 'flow-badge-cyan'
                          }`}
                          style={{ fontSize: '0.66rem', textTransform: 'capitalize' }}
                        >
                          {item.taskObj.priority || 'Normal'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flow-palette-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span><kbd className="flow-kbd-badge">↑</kbd> <kbd className="flow-kbd-badge">↓</kbd> Navigasi</span>
            <span><kbd className="flow-kbd-badge">↵</kbd> Pilih Perintah</span>
            <span><kbd className="flow-kbd-badge">esc</kbd> Tutup</span>
          </div>
          <span style={{ color: 'var(--flow-text-muted)' }}>FlowWork Command OS</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPaletteModal;
