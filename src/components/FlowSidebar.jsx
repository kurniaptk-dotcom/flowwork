import React, { useState } from 'react';
import {
  Home,
  FolderKanban,
  Calendar,
  Sparkles,
  Users,
  BarChart3,
  LayoutDashboard,
  UserPlus,
  Rocket,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Hash,
  StickyNote,
  ChevronDown,
  Check,
  Building,
  Edit2,
  X
} from 'lucide-react';
import { SmartScratchpad } from './SmartScratchpad';


export const FlowSidebar = ({
  activeModule,
  setActiveModule,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen = false,
  onCloseMobile,
  workspaceName = "Kuliah & Studi",
  setWorkspaceName,
  spaces = [],
  activeSpaceId,
  setActiveSpaceId,
  onAddSpace,
  onOpenEditSpace,
  channels = ['general', 'welcome', 'announcements'],
  onOpenChannel,
  onAddChannel,
  onOpenInviteModal,
  onOpenUpgradeModal,
  currentPlan = 'free',
  notes,
  setNotes,
  onConvertNoteToTask,
  onAddToast
}) => {
  const [isAddingSpace, setIsAddingSpace] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [isAddingChannel, setIsAddingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  const navItems = [
    { id: 'dashboards', label: 'Dashboard & Ringkasan', icon: LayoutDashboard },
    { id: 'spaces', label: 'Proyek & Tugas', icon: FolderKanban },
    { id: 'home', label: 'Aktivitas & Inbox', icon: Home },
    { id: 'planner', label: 'Jadwal & Kalender', icon: Calendar },
    { id: 'brain', label: 'KeepWork AI', icon: Sparkles, badge: 'AI' },
    { id: 'teams', label: 'Teman Kolaborasi', icon: Users }
  ];

  const handleNavClick = (moduleId) => {
    setActiveModule(moduleId);
    if (onCloseMobile) onCloseMobile();
  };

  const handleSpaceClick = (spaceId) => {
    setActiveSpaceId(spaceId);
    setActiveModule('spaces');
    if (onCloseMobile) onCloseMobile();
  };

  const handleChannelClick = (ch) => {
    if (onOpenChannel) onOpenChannel(ch);
    if (onCloseMobile) onCloseMobile();
  };

  const handleCreateSpace = (e) => {
    e?.preventDefault();
    if (!newSpaceName.trim()) return;
    const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    onAddSpace({
      id: 'space-' + Date.now(),
      name: newSpaceName.trim(),
      color: randomColor
    });
    setNewSpaceName('');
    setIsAddingSpace(false);
  };

  const handleCreateChannel = (e) => {
    e?.preventDefault();
    if (!newChannelName.trim()) return;
    const clean = newChannelName.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    if (onAddChannel) {
      onAddChannel(clean);
    }
    setNewChannelName('');
    setIsAddingChannel(false);
  };

  return (
    <aside className={`flow-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* 1. Header & Brand */}
      <div className="flow-sidebar-header">
        <div className="flow-brand-badge" onClick={() => handleNavClick('dashboards')}>
          <div className="flow-logo-mark">K</div>
          {(!isCollapsed || isMobileOpen) && (
            <div>
              <div className="flow-brand-title">KeepWork</div>
              <div className="flow-brand-subtitle">Productivity OS</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Mobile Close Button */}
          {isMobileOpen && (
            <button
              type="button"
              className="icon-btn mobile-close-btn"
              onClick={onCloseMobile}
              title="Tutup Menu"
              style={{ width: 28, height: 28 }}
            >
              <X size={16} />
            </button>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            className="icon-btn desktop-collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{ width: 28, height: 28 }}
          >
            {isCollapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
          </button>
        </div>
      </div>

      {/* 2. Navigation Body */}
      <div className="flow-sidebar-body">
        {/* Core Navigation Items */}
        <div className="flow-nav-group">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;

            return (
              <div
                key={item.id}
                className={`flow-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon size={16} />
                  {(!isCollapsed || isMobileOpen) && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 4,
                      background: 'var(--flow-pilot-gradient)',
                      color: '#ffffff'
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Projects / Workstreams Section */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="flow-nav-group">
            <div className="flow-nav-heading">
              <span>Daftar Proyek ({spaces.length})</span>
              <button
                className="icon-btn"
                style={{ width: 18, height: 18, border: 'none', background: 'transparent' }}
                onClick={() => setIsAddingSpace(!isAddingSpace)}
                title="Buat Proyek Baru"
              >
                <Plus size={13} />
              </button>
            </div>

            {isAddingSpace && (
              <form onSubmit={handleCreateSpace} style={{ padding: '4px 6px', marginBottom: 6 }}>
                <input
                  type="text"
                  placeholder="Nama project baru..."
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  autoFocus
                  className="meta-field-input"
                  style={{ fontSize: '0.78rem', padding: '4px 8px', marginBottom: 4, width: '100%' }}
                />
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddingSpace(false)}
                    className="tab-btn"
                    style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="clickup-create-btn"
                    style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                  >
                    Simpan
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {spaces.map((sp) => {
                const isCurrent = activeSpaceId === sp.id && activeModule === 'spaces';
                return (
                  <div
                    key={sp.id}
                    className={`flow-nav-item ${isCurrent ? 'active' : ''}`}
                    onClick={() => handleSpaceClick(sp.id)}
                    style={{ justifyContent: 'space-between' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: sp.color || 'var(--flow-primary)',
                          flexShrink: 0
                        }}
                      />
                      <span style={{ fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sp.name.replace(/^[\uD800-\uDBFF\uDC00-\uDFFF\s]+/, '')}
                      </span>
                    </div>

                    {sp.id !== 'all' && onOpenEditSpace && (
                      <button
                        type="button"
                        className="icon-btn"
                        style={{
                          width: 20,
                          height: 20,
                          padding: 0,
                          border: 'none',
                          background: 'transparent',
                          opacity: 0.6,
                          flexShrink: 0
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditSpace(sp);
                        }}
                        title="Edit Proyek"
                      >
                        <Edit2 size={11} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Team Channels Section */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="flow-nav-group">
            <div className="flow-nav-heading">
              <span>Kanal Diskusi ({channels.length})</span>
              <button
                className="icon-btn"
                style={{ width: 18, height: 18, border: 'none', background: 'transparent' }}
                onClick={() => setIsAddingChannel(!isAddingChannel)}
                title="Tambah Kanal"
              >
                <Plus size={13} />
              </button>
            </div>

            {isAddingChannel && (
              <form onSubmit={handleCreateChannel} style={{ padding: '4px 6px', marginBottom: 6 }}>
                <input
                  type="text"
                  placeholder="channel-name..."
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  autoFocus
                  className="meta-field-input"
                  style={{ fontSize: '0.78rem', padding: '4px 8px', marginBottom: 4, width: '100%' }}
                />
                <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddingChannel(false)}
                    className="tab-btn"
                    style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="clickup-create-btn"
                    style={{ padding: '2px 8px', fontSize: '0.72rem' }}
                  >
                    Tambah
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {channels.map((ch) => (
                <div
                  key={ch}
                  className="flow-nav-item"
                  onClick={() => handleChannelClick(ch)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Hash size={13} color="var(--flow-text-muted)" />
                    <span style={{ fontSize: '0.82rem' }}>{ch}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Footer */}
      <div className="flow-sidebar-footer">
        {/* Smart Scratchpad */}
        <SmartScratchpad
          isCollapsed={isCollapsed && !isMobileOpen}
          onConvertToTask={onConvertNoteToTask}
          onAddToast={onAddToast}
        />

        {/* Plan Upgrade Pill */}
        <div className="flow-tier-pill" onClick={onOpenUpgradeModal} title="Kelola Paket Pengguna">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Rocket size={15} color="var(--flow-primary)" />
            {(!isCollapsed || isMobileOpen) && (
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--flow-text-main)', textTransform: 'capitalize' }}>
                  {currentPlan === 'free' ? 'Paket Gratis' : currentPlan === 'student' ? 'Pelajar Pro' : currentPlan === 'freelancer' ? 'Freelancer Pro' : currentPlan === 'lifetime' ? 'Lifetime Pass' : `${currentPlan} Plan`}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--flow-text-muted)' }}>
                  {currentPlan === 'free' ? 'Tingkatkan ke Pro' : 'Paket Aktif'}
                </div>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <span
              style={{
                fontSize: '0.66rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--flow-primary)'
              }}
            >
              {currentPlan === 'free' ? 'Upgrade' : 'Aktif'}
            </span>
          )}
        </div>

        {/* Invite Collaborator Button */}
        {!isCollapsed && (
          <button
            className="tab-btn"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '6px' }}
            onClick={onOpenInviteModal}
          >
            <UserPlus size={14} />
            <span>Undang Kolaborator</span>
          </button>
        )}
      </div>
    </aside>
  );
};
