import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Search,
  Sparkles,
  Bell,
  Video,
  Moon,
  Sun,
  Clock,
  X,
  Check,
  Building,
  User,
  LogOut,
  Settings,
  Plus,
  Calendar,
  Layers,
  Download,
  HelpCircle,
  Upload,
  Menu
} from 'lucide-react';

export const FlowHeader = ({
  workspaceName = "Kuliah & Studi",
  workspaces = [],
  activeWorkspaceId = 'ws-1',
  onSwitchWorkspace,
  onCreateWorkspace,
  onToggleMobileSidebar,
  setWorkspaceName,
  searchQuery,
  setSearchQuery,
  onOpenFlowPilot,
  onOpenNewTask,
  theme,
  toggleTheme,
  pomodoroMinutes,
  pomodoroSeconds,
  isTimerRunning,
  onOpenPomodoro,
  onNotificationClick,
  onOpenInviteModal,
  onOpenCommandPalette,
  onExportData,
  onOpenExportModal,
  onOpenImportModal,
  onOpenShortcuts,
  onShowToast,
  currentUser,
  onLogout
}) => {
  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWsInput, setNewWsInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [unreadNotifications, setUnreadNotifications] = useState([
    {
      id: 'n-1',
      taskId: 'task-102',
      title: 'Dimas memindahkan tugas ke Review & QA',
      subtitle: 'Implementasi Autentikasi JWT • 15m lalu'
    },
    {
      id: 'n-2',
      taskId: 'task-101',
      title: 'Sarah Chen menyelesaikan subtask',
      subtitle: 'Desain UI Onboarding • 1j lalu'
    }
  ]);

  const defaultWorkspaces = [
    { id: 'ws-1', name: 'Kuliah & Studi', icon: '🎓', description: 'Mata kuliah, skripsi, dan kegiatan kampus' },
    { id: 'ws-2', name: 'Pekerjaan & Freelance', icon: '💼', description: 'Proyek klien, desain, coding, dan portofolio' },
    { id: 'ws-3', name: 'Personal & Rutinitas', icon: '🏠', description: 'Target kebugaran, budgeting, dan pengembangan diri' }
  ];
  const displayWorkspaces = workspaces && workspaces.length > 0 ? workspaces : defaultWorkspaces;
  const activeWsObj = displayWorkspaces.find((w) => w.id === activeWorkspaceId || w.name === workspaceName);

  return (
    <>
      <header className="flow-header">
        {/* Left: Mobile Hamburger + Workspace Selector */}
        <div className="header-left-group" style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', minWidth: 0 }}>
          {isMobile && onToggleMobileSidebar && (
            <button
              type="button"
              className="icon-btn mobile-hamburger-btn"
              onClick={onToggleMobileSidebar}
              title="Buka Menu Navigasi"
              style={{ width: 32, height: 32, flexShrink: 0 }}
            >
              <Menu size={18} />
            </button>
          )}

          <div
            className="tab-btn header-workspace-btn"
            style={{ padding: '5px 8px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--flow-text-main)', border: '1px solid var(--flow-border-subtle)', minWidth: 0 }}
            onClick={() => {
              setShowWorkspaceMenu(!showWorkspaceMenu);
              setShowNotificationMenu(false);
              setShowProfileMenu(false);
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                backgroundColor: activeWsObj?.color || 'var(--flow-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                flexShrink: 0
              }}
            >
              {activeWsObj?.icon || (workspaceName ? workspaceName.charAt(0).toUpperCase() : '🎓')}
            </div>
            <span className="header-workspace-title">{workspaceName}</span>
            <ChevronDown size={13} color="var(--flow-text-muted)" style={{ flexShrink: 0 }} />
          </div>

          {/* Calendar Sync Status Indicator (Desktop only) */}
          <div
            className="desktop-only-tool"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '0.78rem',
              color: 'var(--flow-text-muted)',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: 6
            }}
            onClick={() => setShowCalendarModal(true)}
            title="Google & Outlook Calendar 2-way sync aktif"
          >
            <Calendar size={14} color="var(--flow-accent-cyan)" />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--flow-accent-emerald)' }}>SYNC</span>
          </div>

          {/* Workspace Switcher Popover */}
          {showWorkspaceMenu && (
            <div
              style={{
                position: 'absolute',
                top: 44,
                left: 0,
                width: 290,
                background: 'var(--flow-bg-surface)',
                border: '1px solid var(--flow-border-subtle)',
                borderRadius: 12,
                boxShadow: 'var(--flow-shadow-lg)',
                zIndex: 100,
                padding: 10,
                animation: 'fadeIn 0.12s ease'
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--flow-text-muted)', padding: '4px 8px' }}>
                Pilih Ruang Kerja
              </div>
              {displayWorkspaces.map((ws) => {
                const isActive = ws.id === activeWorkspaceId || ws.name === workspaceName;
                return (
                  <div
                    key={ws.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      background: isActive ? 'var(--flow-primary-light)' : 'transparent',
                      color: isActive ? 'var(--flow-primary)' : 'var(--flow-text-main)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.84rem',
                      marginBottom: 2
                    }}
                    onClick={() => {
                      if (onSwitchWorkspace) {
                        onSwitchWorkspace(ws.id);
                      } else if (setWorkspaceName) {
                        setWorkspaceName(ws.name);
                        if (onShowToast) onShowToast(`Beralih ke workspace "${ws.name}"`, 'info');
                      }
                      setShowWorkspaceMenu(false);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                      <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>{ws.icon || '🏢'}</span>
                      <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ws.name}</div>
                        {ws.description && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ws.description}
                          </div>
                        )}
                      </div>
                    </div>
                    {isActive && <Check size={15} color="var(--flow-primary)" style={{ flexShrink: 0, marginLeft: 6 }} />}
                  </div>
                );
              })}

              <div style={{ borderTop: '1px solid var(--flow-border-subtle)', marginTop: 6, paddingTop: 6 }}>
                {isCreatingWorkspace ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newWsInput.trim()) return;
                      const name = newWsInput.trim();
                      if (onCreateWorkspace) {
                        onCreateWorkspace(name);
                      } else if (setWorkspaceName) {
                        setWorkspaceName(name);
                        if (onShowToast) onShowToast(`Workspace "${name}" berhasil dibuat`, 'success');
                      }
                      setNewWsInput('');
                      setIsCreatingWorkspace(false);
                      setShowWorkspaceMenu(false);
                    }}
                    style={{ padding: '4px' }}
                  >
                    <input
                      type="text"
                      placeholder="Nama ruang kerja baru..."
                      value={newWsInput}
                      onChange={(e) => setNewWsInput(e.target.value)}
                      autoFocus
                      className="meta-field-input"
                      style={{ fontSize: '0.8rem', padding: '6px 8px', marginBottom: 6, width: '100%' }}
                    />
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setIsCreatingWorkspace(false)}
                        className="tab-btn"
                        style={{ padding: '3px 8px', fontSize: '0.74rem' }}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="clickup-create-btn"
                        style={{ padding: '3px 10px', fontSize: '0.74rem' }}
                      >
                        Buat
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    className="tab-btn"
                    style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.82rem', padding: '6px 8px' }}
                    onClick={() => setIsCreatingWorkspace(true)}
                  >
                    <Plus size={14} />
                    <span>+ Tambah Ruang Kerja Baru</span>
                  </button>
                )}

                <button
                  className="tab-btn"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.82rem', padding: '6px 8px', marginTop: 4 }}
                  onClick={() => {
                    setShowWorkspaceMenu(false);
                    if (onOpenExportModal) onOpenExportModal();
                    else if (onExportData) onExportData();
                  }}
                >
                  <Download size={14} />
                  <span>Ekspor Data & Laporan</span>
                </button>

                <button
                  className="tab-btn"
                  style={{ width: '100%', justifyContent: 'flex-start', fontSize: '0.82rem', padding: '6px 8px', marginTop: 4 }}
                  onClick={() => {
                    setShowWorkspaceMenu(false);
                    if (onOpenImportModal) onOpenImportModal();
                  }}
                >
                  <Upload size={14} />
                  <span>Impor Data & Pulihkan</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center: Command Bar + FlowPilot AI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="flow-command-bar" style={{ cursor: 'text' }}>
            <Search size={14} color="var(--flow-text-muted)" />
            <input
              type="text"
              className="flow-command-input"
              placeholder="Cari tugas di board... (Ctrl + K)"
              value={searchQuery}
              onChange={(e) => {
                if (setSearchQuery) setSearchQuery(e.target.value);
              }}
              style={{ cursor: 'text', flex: 1 }}
            />
            {searchQuery ? (
              <button
                type="button"
                className="icon-btn"
                style={{ width: 20, height: 20, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (setSearchQuery) setSearchQuery('');
                }}
                title="Hapus pencarian"
              >
                <X size={12} />
              </button>
            ) : null}
            <span
              className="flow-kbd-badge"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenCommandPalette) onOpenCommandPalette();
              }}
              title="Buka Command Palette (Ctrl + K / ⌘K)"
            >
              ⌘K
            </span>
          </div>

          <button className="flow-pilot-trigger" onClick={onOpenFlowPilot}>
            <Sparkles size={13} />
            <span>FlowPilot AI</span>
          </button>
        </div>

        {/* Right: Quick Tools */}
        <div className="header-right-tools" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* New Task Trigger Button */}
          {onOpenNewTask && (
            <button
              type="button"
              className="flow-add-task-btn"
              onClick={onOpenNewTask}
              title="Buat Tugas Baru (Shortcut: N)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '5px 10px',
                borderRadius: 6,
                background: 'var(--flow-primary)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.15s ease'
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              <span className="btn-label-desktop">Tugas Baru</span>
            </button>
          )}

          {/* Pomodoro Focus Timer */}
          <button
            className="tab-btn desktop-only-tool"
            style={{
              padding: '4px 10px',
              fontSize: '0.82rem',
              background: isTimerRunning ? 'rgba(239, 68, 68, 0.12)' : 'var(--flow-bg-elevated)',
              color: isTimerRunning ? 'var(--flow-accent-rose)' : 'var(--flow-text-subtle)',
              border: '1px solid var(--flow-border-subtle)'
            }}
            onClick={onOpenPomodoro}
            title="Focus Session Timer"
          >
            <Clock size={14} />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              {String(pomodoroMinutes).padStart(2, '0')}:{String(pomodoroSeconds).padStart(2, '0')}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            className="icon-btn header-theme-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            style={{ width: 32, height: 32 }}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* FlowRecord Screen Recording */}
          <button
            className="icon-btn desktop-only-tool"
            style={{
              width: 32,
              height: 32,
              backgroundColor: isRecording ? 'var(--flow-accent-rose)' : undefined,
              color: isRecording ? '#fff' : undefined
            }}
            title={isRecording ? "FlowRecord active (recording screen)" : "Start FlowRecord video clip"}
            onClick={() => setShowRecordModal(true)}
          >
            <Video size={15} />
          </button>

          {/* Export & Print Report */}
          {(onOpenExportModal || onExportData) && (
            <button
              className="icon-btn desktop-only-tool"
              style={{ width: 32, height: 32 }}
              onClick={() => {
                if (onOpenExportModal) onOpenExportModal();
                else if (onExportData) onExportData();
              }}
              title="Ekspor CSV, PDF & Laporan Progres"
            >
              <Download size={15} />
            </button>
          )}

          {/* Import / Restore */}
          {onOpenImportModal && (
            <button
              className="icon-btn desktop-only-tool"
              style={{ width: 32, height: 32 }}
              onClick={onOpenImportModal}
              title="Impor CSV & Pulihkan Backup"
            >
              <Upload size={15} />
            </button>
          )}

          {/* Keyboard Shortcuts Guide */}
          {onOpenShortcuts && (
            <button
              className="icon-btn desktop-only-tool"
              style={{ width: 32, height: 32 }}
              onClick={onOpenShortcuts}
              title="Pintasan Keyboard (Tekan ?)"
            >
              <HelpCircle size={15} />
            </button>
          )}

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              className="icon-btn"
              style={{ width: 32, height: 32, position: 'relative' }}
              onClick={() => {
                setShowNotificationMenu(!showNotificationMenu);
                setShowWorkspaceMenu(false);
                setShowProfileMenu(false);
              }}
              title="Notifications"
            >
              <Bell size={15} />
              {unreadNotifications.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: 'var(--flow-accent-rose)'
                  }}
                />
              )}
            </button>

            {/* Notification Popover */}
            {showNotificationMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 44,
                  right: 0,
                  width: 320,
                  background: 'var(--flow-bg-surface)',
                  border: '1px solid var(--flow-border-subtle)',
                  borderRadius: 12,
                  boxShadow: 'var(--flow-shadow-lg)',
                  zIndex: 100,
                  padding: 12,
                  animation: 'fadeIn 0.12s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--flow-border-subtle)' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--flow-text-main)' }}>
                    Notifikasi Terkini ({unreadNotifications.length})
                  </span>
                  {unreadNotifications.length > 0 && (
                    <span
                      style={{ fontSize: '0.72rem', color: 'var(--flow-primary)', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => {
                        setUnreadNotifications([]);
                        if (onShowToast) onShowToast('Semua notifikasi ditandai telah dibaca', 'success');
                      }}
                    >
                      Tandai Dibaca
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 250, overflowY: 'auto' }}>
                  {unreadNotifications.length === 0 ? (
                    <div style={{ padding: '16px 10px', textAlign: 'center', color: 'var(--flow-text-muted)', fontSize: '0.8rem' }}>
                      ✓ Tidak ada notifikasi baru
                    </div>
                  ) : (
                    unreadNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        style={{ padding: '8px 10px', borderRadius: 6, background: 'var(--flow-bg-elevated)', cursor: 'pointer', fontSize: '0.82rem' }}
                        onClick={() => {
                          setShowNotificationMenu(false);
                          setUnreadNotifications((prev) => prev.filter((n) => n.id !== notif.id));
                          if (onNotificationClick) onNotificationClick(notif.taskId);
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--flow-text-main)' }}>
                          {notif.title}
                        </div>
                        <div style={{ color: 'var(--flow-text-muted)', fontSize: '0.74rem', marginTop: 2 }}>
                          {notif.subtitle}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: 'var(--flow-primary)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(99, 102, 241, 0.3)'
              }}
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowWorkspaceMenu(false);
                setShowNotificationMenu(false);
              }}
            >
              {currentUser?.avatar || (currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'K')}
            </div>

            {showProfileMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: 44,
                  right: 0,
                  width: 220,
                  background: 'var(--flow-bg-surface)',
                  border: '1px solid var(--flow-border-subtle)',
                  borderRadius: 12,
                  boxShadow: 'var(--flow-shadow-lg)',
                  zIndex: 100,
                  padding: 10,
                  animation: 'fadeIn 0.12s ease'
                }}
              >
                <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--flow-border-subtle)', marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--flow-text-main)' }}>
                    {currentUser?.name || 'Kurnia'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--flow-text-muted)' }}>
                    {currentUser?.email || 'kurnia@flowwork.id'} • {currentUser?.role || 'Akun Personal'}
                  </div>
                </div>

                <div
                  className="flow-nav-item"
                  onClick={() => {
                    if (onOpenInviteModal) onOpenInviteModal();
                    setShowProfileMenu(false);
                  }}
                >
                  <User size={14} />
                  <span>Ajak Teman Kolaborasi</span>
                </div>

                <div
                  className="flow-nav-item"
                  onClick={() => {
                    toggleTheme();
                    setShowProfileMenu(false);
                  }}
                >
                  <Settings size={14} />
                  <span>Mode: {theme === 'dark' ? 'Dark' : 'Light'}</span>
                </div>

                <div
                  className="flow-nav-item"
                  style={{ color: 'var(--flow-accent-rose)' }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    if (onLogout) {
                      onLogout();
                    } else if (onShowToast) {
                      onShowToast('Sesi kerja tetap aman.', 'info');
                    }
                  }}
                >
                  <LogOut size={14} />
                  <span>Keluar Akun (Logout)</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* FlowRecord Screen Recording Modal */}
      {showRecordModal && (
        <div className="modal-backdrop" onClick={() => setShowRecordModal(false)}>
          <div className="modal-card" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>FlowRecord • Screen & Video Clips</span>
              <button className="icon-btn" onClick={() => setShowRecordModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ textAlign: 'center', padding: '24px 20px' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--flow-primary-light)',
                  color: 'var(--flow-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}
              >
                <Video size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6, color: 'var(--flow-text-main)' }}>
                Rekam Layar / Quick Meeting
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--flow-text-subtle)', marginBottom: 20 }}>
                Bagikan walkthrough visual tugas atau mulai sinkronisasi cepat dengan tim di {workspaceName}.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="tab-btn" onClick={() => setShowRecordModal(false)}>
                  Batal
                </button>
                <button
                  className="clickup-create-btn"
                  onClick={() => {
                    setIsRecording(true);
                    setShowRecordModal(false);
                    if (onShowToast) onShowToast('Perekaman FlowRecord dimulai! Indikator aktif di header.', 'success');
                    setTimeout(() => setIsRecording(false), 8000);
                  }}
                >
                  Mulai Rekam Layar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar 2-Way Sync Modal */}
      {showCalendarModal && (
        <div className="modal-backdrop" onClick={() => setShowCalendarModal(false)}>
          <div className="modal-card" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>Sinkronisasi Kalender FlowWork</span>
              <button className="icon-btn" onClick={() => setShowCalendarModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--flow-bg-elevated)', borderRadius: 8, border: '1px solid var(--flow-border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Calendar size={18} color="var(--flow-primary)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--flow-text-main)' }}>Google Calendar</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>kurnia@flowwork.id • 2-way sync aktif</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--flow-accent-emerald)', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: 4 }}>Aktif</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--flow-bg-elevated)', borderRadius: 8, border: '1px solid var(--flow-border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Layers size={18} color="var(--flow-accent-cyan)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--flow-text-main)' }}>Microsoft Outlook</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>Sinkronisasi tugas & tenggat waktu</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--flow-accent-emerald)', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: 4 }}>Aktif</span>
                </div>
              </div>

              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button className="tab-btn" onClick={() => setShowCalendarModal(false)}>
                  Tutup
                </button>
                <button
                  className="clickup-create-btn"
                  onClick={() => {
                    setShowCalendarModal(false);
                    if (onShowToast) onShowToast('Sinkronisasi kalender berhasil diperbarui!', 'success');
                  }}
                >
                  Sinkronkan Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
