import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  Shield,
  Briefcase,
  Building,
  Edit2,
  Trash2,
  MessageSquare,
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  Sliders,
  ChevronRight,
  ExternalLink,
  Zap,
  Award
} from 'lucide-react';
import { MemberEditModal } from './MemberEditModal';
import { MemberDeleteModal } from './MemberDeleteModal';

export const TeamsHubView = ({
  tasks = [],
  members = [],
  onOpenInviteModal,
  onUpdateMember,
  onDeleteMember,
  onSelectMember,
  onOpenChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [workloadFilter, setWorkloadFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [editingMember, setEditingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);

  // Departments list extracted from members
  const departments = useMemo(() => {
    const set = new Set();
    members.forEach((m) => {
      if (m.department) set.add(m.department);
    });
    return Array.from(set);
  }, [members]);

  // Member stats calculator helper
  const getMemberStats = (member) => {
    const memberTasks = tasks.filter(
      (t) => t.assignee === member.name || t.assigneeId === member.id || t.assignee === member.id
    );
    const activeTasks = memberTasks.filter((t) => t.status !== 'done');
    const doneTasks = memberTasks.filter((t) => t.status === 'done');
    const urgentTasks = activeTasks.filter((t) => t.priority === 'urgent');

    const capacity = member.capacity || 5;
    const loadPercent = Math.round((activeTasks.length / capacity) * 100);

    let loadStatus = 'optimal'; // 'light' | 'optimal' | 'heavy'
    let loadColor = 'var(--flow-accent-emerald)';

    if (loadPercent > 80) {
      loadStatus = 'heavy';
      loadColor = 'var(--flow-accent-rose)';
    } else if (loadPercent < 40) {
      loadStatus = 'light';
      loadColor = 'var(--flow-accent-cyan)';
    }

    return {
      memberTasks,
      activeTasks,
      doneTasks,
      urgentTasks,
      capacity,
      loadPercent,
      loadStatus,
      loadColor
    };
  };

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        member.name.toLowerCase().includes(q) ||
        member.email?.toLowerCase().includes(q) ||
        member.role?.toLowerCase().includes(q) ||
        member.department?.toLowerCase().includes(q);

      // Department filter
      const matchesDept =
        departmentFilter === 'all' || member.department === departmentFilter;

      // Workload filter
      const stats = getMemberStats(member);
      let matchesWorkload = true;
      if (workloadFilter === 'heavy') matchesWorkload = stats.loadPercent > 80;
      else if (workloadFilter === 'optimal') matchesWorkload = stats.loadPercent >= 40 && stats.loadPercent <= 80;
      else if (workloadFilter === 'light') matchesWorkload = stats.loadPercent < 40;

      return matchesSearch && matchesDept && matchesWorkload;
    });
  }, [members, tasks, searchQuery, departmentFilter, workloadFilter]);

  // Overall Team Metrics
  const teamMetrics = useMemo(() => {
    const totalMembers = members.length;
    const activeMembersCount = members.filter((m) => m.status === 'active').length;
    const totalAssignedTasks = tasks.filter((t) => t.assignee).length;
    const totalCapacity = members.reduce((acc, m) => acc + (m.capacity || 5), 0);
    const avgLoadPercent = totalCapacity > 0 ? Math.round((totalAssignedTasks / totalCapacity) * 100) : 0;
    const overloadedCount = members.filter((m) => getMemberStats(m).loadPercent > 80).length;

    return {
      totalMembers,
      activeMembersCount,
      totalAssignedTasks,
      avgLoadPercent,
      overloadedCount
    };
  }, [members, tasks]);

  return (
    <div className="flow-team-wrapper">
      {/* 1. Header Toolbar */}
      <div className="flow-team-toolbar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="flow-team-title">Rekan Kolaborasi & Pembagian Tugas</h1>
            <span className="flow-team-count-tag">
              {teamMetrics.totalMembers} Kolaborator
            </span>
          </div>
          <p className="flow-team-subtext">
            Kelola kolaborator tugas, pantau keterlibatan tugas bersama, dan bagi beban kerja secara seimbang.
          </p>
        </div>

        <div className="flow-team-actions">
          {onOpenChat && (
            <button
              className="tab-btn"
              style={{ padding: '7px 14px', fontSize: '0.84rem' }}
              onClick={() => onOpenChat('general')}
            >
              <MessageSquare size={14} />
              <span>Diskusi Grup (#general)</span>
            </button>
          )}

          <button
            type="button"
            className="flow-cal-add-btn"
            onClick={onOpenInviteModal}
          >
            <UserPlus size={15} />
            <span>Tambah Kolaborator</span>
          </button>
        </div>
      </div>

      {/* 2. Team Workload Metrics Snapshot */}
      <div className="flow-team-metrics-grid">
        <div className="flow-team-metric-card">
          <div className="flow-metric-icon-wrap" style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', color: 'var(--flow-primary)' }}>
            <Users size={18} />
          </div>
          <div>
            <span className="flow-team-metric-val">{teamMetrics.totalMembers} Kolaborator</span>
            <span className="flow-team-metric-label">{teamMetrics.activeMembersCount} Aktif Kolaborasi</span>
          </div>
        </div>

        <div className="flow-team-metric-card">
          <div className="flow-metric-icon-wrap" style={{ backgroundColor: 'rgba(6, 182, 212, 0.12)', color: 'var(--flow-accent-cyan)' }}>
            <Briefcase size={18} />
          </div>
          <div>
            <span className="flow-team-metric-val">{teamMetrics.totalAssignedTasks} Tugas</span>
            <span className="flow-team-metric-label">Terdistribusi di Tugas Aktif</span>
          </div>
        </div>

        <div className="flow-team-metric-card">
          <div className="flow-metric-icon-wrap" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--flow-accent-emerald)' }}>
            <Zap size={18} />
          </div>
          <div>
            <span className="flow-team-metric-val">{teamMetrics.avgLoadPercent}% Kapasitas</span>
            <span className="flow-team-metric-label">Rata-Rata Utilisasi Tugas</span>
          </div>
        </div>

        <div className="flow-team-metric-card">
          <div className="flow-metric-icon-wrap" style={{ backgroundColor: teamMetrics.overloadedCount > 0 ? 'rgba(244, 63, 94, 0.12)' : 'rgba(245, 158, 11, 0.12)', color: teamMetrics.overloadedCount > 0 ? 'var(--flow-accent-rose)' : 'var(--flow-accent-amber)' }}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <span className="flow-team-metric-val">{teamMetrics.overloadedCount} Perlu Rebalancing</span>
            <span className="flow-team-metric-label">Beban Kerja &gt; 80%</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filtering Controls */}
      <div className="flow-team-filters-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          {/* Search Box */}
          <div className="flow-team-search-box">
            <Search size={14} color="var(--flow-text-muted)" />
            <input
              type="text"
              placeholder="Cari kolaborator berdasarkan nama, email, atau peran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flow-team-search-input"
            />
            {searchQuery && (
              <button
                className="icon-btn"
                style={{ width: 20, height: 20 }}
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="flow-cal-filter-wrap">
            <Building size={13} color="var(--flow-text-muted)" />
            <select
              className="flow-cal-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="all">Semua Kategori</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Workload Filter */}
          <div className="flow-cal-filter-wrap">
            <Sliders size={13} color="var(--flow-text-muted)" />
            <select
              className="flow-cal-select"
              value={workloadFilter}
              onChange={(e) => setWorkloadFilter(e.target.value)}
            >
              <option value="all">Semua Beban Kerja</option>
              <option value="light">Senggang (&lt; 40%)</option>
              <option value="optimal">Optimal (40% - 80%)</option>
              <option value="heavy">Padat / Overload (&gt; 80%)</option>
            </select>
          </div>
        </div>

        {/* View Mode Switcher (Grid vs Table) */}
        <div className="flow-cal-modes">
          <button
            className={`flow-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Tampilan Kartu"
          >
            <LayoutGrid size={14} />
            <span>Kartu</span>
          </button>
          <button
            className={`flow-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Tampilan Tabel Direktori"
          >
            <ListIcon size={14} />
            <span>Tabel</span>
          </button>
        </div>
      </div>

      {/* 4. Grid View */}
      {viewMode === 'grid' && (
        <div className="flow-team-grid">
          {filteredMembers.map((member) => {
            const stats = getMemberStats(member);
            const isOwner = member.isOwner || member.id === 'kurnia';

            return (
              <div key={member.id} className="flow-member-card">
                {/* Card Header: Avatar, Name, Status, Badges */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="flow-member-avatar-wrap" style={{ backgroundColor: member.color || 'var(--flow-primary)' }}>
                      <span>{member.avatar || member.name.charAt(0)}</span>
                      <span
                        className="flow-member-status-dot"
                        style={{
                          backgroundColor:
                            member.status === 'active'
                              ? 'var(--flow-accent-emerald)'
                              : member.status === 'away'
                              ? 'var(--flow-accent-amber)'
                              : 'var(--flow-text-muted)'
                        }}
                        title={member.status === 'active' ? 'Active / Online' : 'Away / Cuti'}
                      />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <h3 className="flow-member-name">{member.name}</h3>
                        {isOwner && <span className="flow-owner-badge">Saya</span>}
                      </div>
                      <span className="flow-member-role">{member.role || 'Kolaborator'}</span>
                    </div>
                  </div>

                  <span className="flow-dept-tag">
                    {member.department || 'General'}
                  </span>
                </div>

                {/* Email line */}
                <div className="flow-member-email-row">
                  <Mail size={12} color="var(--flow-text-muted)" />
                  <span>{member.email || `${member.id}@flowwork.id`}</span>
                </div>

                {/* Workload Capacity Section */}
                <div className="flow-member-workload-box">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)', fontWeight: 600 }}>
                      Kapasitas Beban Kerja
                    </span>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: stats.loadColor
                      }}
                    >
                      {stats.activeTasks.length} / {stats.capacity} Tugas ({stats.loadPercent}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="flow-workload-track">
                    <div
                      className="flow-workload-fill"
                      style={{
                        width: `${Math.min(stats.loadPercent, 100)}%`,
                        backgroundColor: stats.loadColor
                      }}
                    />
                  </div>

                  {/* Tasks Breakdown */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, fontSize: '0.72rem', color: 'var(--flow-text-muted)' }}>
                    <span>{stats.doneTasks.length} tugas tuntas</span>
                    {stats.urgentTasks.length > 0 && (
                      <span style={{ color: 'var(--flow-accent-rose)', fontWeight: 600 }}>
                        ● {stats.urgentTasks.length} Urgent
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons (CRUD & Detail) */}
                <div className="flow-member-card-footer">
                  <button
                    type="button"
                    className="flow-member-btn-primary"
                    onClick={() => onSelectMember(member)}
                  >
                    <span>Detail & Tugas</span>
                    <ChevronRight size={13} />
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {onOpenChat && (
                      <button
                        type="button"
                        className="flow-member-action-btn"
                        onClick={() => onOpenChat('general')}
                        title="Kirim pesan langsung"
                      >
                        <MessageSquare size={14} />
                      </button>
                    )}

                    <button
                      type="button"
                      className="flow-member-action-btn"
                      onClick={() => setEditingMember(member)}
                      title="Edit profil anggota"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      type="button"
                      className={`flow-member-action-btn ${isOwner ? 'disabled' : 'danger'}`}
                      onClick={() => {
                        if (!isOwner) setDeletingMember(member);
                      }}
                      title={isOwner ? 'Owner tidak dapat dihapus' : 'Hapus anggota dari workspace'}
                      disabled={isOwner}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Table Directory View */}
      {viewMode === 'table' && (
        <div className="flow-team-table-wrapper">
          <table className="flow-team-table">
            <thead>
              <tr>
                <th style={{ width: '32%' }}>Anggota Tim</th>
                <th style={{ width: '20%' }}>Jabatan & Departemen</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '22%' }}>Beban Kerja (Kapasitas)</th>
                <th style={{ width: '14%', textAlign: 'right' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const stats = getMemberStats(member);
                const isOwner = member.isOwner || member.id === 'kurnia';

                return (
                  <tr key={member.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          className="flow-member-avatar-wrap"
                          style={{
                            width: 34,
                            height: 34,
                            fontSize: '0.76rem',
                            backgroundColor: member.color || 'var(--flow-primary)'
                          }}
                        >
                          <span>{member.avatar || member.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontWeight: 700, color: 'var(--flow-text-main)' }}>
                              {member.name}
                            </span>
                            {isOwner && <span className="flow-owner-badge">Owner</span>}
                          </div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--flow-text-muted)' }}>
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--flow-text-main)' }}>
                          {member.role || 'Member'}
                        </div>
                        <span className="flow-dept-tag" style={{ marginTop: 2, display: 'inline-block' }}>
                          {member.department || 'General'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color:
                            member.status === 'active'
                              ? 'var(--flow-accent-emerald)'
                              : member.status === 'away'
                              ? 'var(--flow-accent-amber)'
                              : 'var(--flow-text-muted)'
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            backgroundColor:
                              member.status === 'active'
                                ? 'var(--flow-accent-emerald)'
                                : member.status === 'away'
                                ? 'var(--flow-accent-amber)'
                                : 'var(--flow-text-muted)'
                          }}
                        />
                        {member.status === 'active' ? 'Online' : member.status === 'away' ? 'Away' : 'Cuti'}
                      </span>
                    </td>

                    <td>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: 4 }}>
                          <span style={{ color: 'var(--flow-text-subtle)' }}>
                            {stats.activeTasks.length} / {stats.capacity} tugas
                          </span>
                          <span style={{ fontWeight: 700, color: stats.loadColor }}>
                            {stats.loadPercent}%
                          </span>
                        </div>
                        <div className="flow-workload-track" style={{ height: 6 }}>
                          <div
                            className="flow-workload-fill"
                            style={{
                              width: `${Math.min(stats.loadPercent, 100)}%`,
                              backgroundColor: stats.loadColor
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          className="flow-member-action-btn"
                          onClick={() => onSelectMember(member)}
                          title="Lihat Detail Profil & Beban Kerja"
                        >
                          <ExternalLink size={14} />
                        </button>

                        <button
                          type="button"
                          className="flow-member-action-btn"
                          onClick={() => setEditingMember(member)}
                          title="Edit Anggota"
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          className={`flow-member-action-btn ${isOwner ? 'disabled' : 'danger'}`}
                          onClick={() => {
                            if (!isOwner) setDeletingMember(member);
                          }}
                          disabled={isOwner}
                          title={isOwner ? 'Owner tidak dapat dihapus' : 'Hapus Anggota'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty Search / Filter State */}
      {filteredMembers.length === 0 && (
        <div className="flow-agenda-empty" style={{ padding: '60px 20px' }}>
          <Users size={40} color="var(--flow-text-muted)" />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--flow-text-main)', marginTop: 10 }}>
            Tidak Ditemukan Kolaborator
          </h3>
          <p style={{ fontSize: '0.84rem', color: 'var(--flow-text-muted)' }}>
            Coba sesuaikan kata kunci pencarian atau filter kategori Anda.
          </p>
          <button
            type="button"
            className="tab-btn"
            onClick={() => {
              setSearchQuery('');
              setDepartmentFilter('all');
              setWorkloadFilter('all');
            }}
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <MemberEditModal
          isOpen={Boolean(editingMember)}
          onClose={() => setEditingMember(null)}
          member={editingMember}
          onSaveMember={(updated) => {
            if (onUpdateMember) onUpdateMember(updated);
            setEditingMember(null);
          }}
        />
      )}

      {/* Delete Member Modal with Task Reassignment */}
      {deletingMember && (
        <MemberDeleteModal
          isOpen={Boolean(deletingMember)}
          onClose={() => setDeletingMember(null)}
          member={deletingMember}
          allMembers={members}
          assignedTasksCount={
            tasks.filter(
              (t) =>
                t.assignee === deletingMember.name ||
                t.assigneeId === deletingMember.id ||
                t.assignee === deletingMember.id
            ).length
          }
          onConfirmDelete={(memberId, reassignToId) => {
            if (onDeleteMember) onDeleteMember(memberId, reassignToId);
            setDeletingMember(null);
          }}
        />
      )}
    </div>
  );
};
