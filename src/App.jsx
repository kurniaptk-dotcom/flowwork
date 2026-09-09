import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_TASKS,
  INITIAL_COLUMNS,
  INITIAL_NOTES,
  INITIAL_SPACES,
  INITIAL_TAGS,
  INITIAL_MEMBERS,
  INITIAL_PRIORITIES,
  INITIAL_HABITS,
  INITIAL_SECOND_BRAIN_NOTES
} from './data/initialData';
import {
  INITIAL_WORKSPACES,
  getWorkspaceInitialData
} from './data/workspacePresets';
import { FlowSidebar } from './components/FlowSidebar';
import { FlowHeader } from './components/FlowHeader';
import { FlowMobileBottomNav } from './components/FlowMobileBottomNav';
import { InboxView } from './components/InboxView';
import { FlowPilotView } from './components/FlowPilotView';
import { TeamsHubView } from './components/TeamsHubView';
import { DashboardsHubView } from './components/DashboardsHubView';
import { HabitTrackerView } from './components/HabitTrackerView';
import { SecondBrainView } from './components/SecondBrainView';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { CalendarView } from './components/CalendarView';
import { TaskModal } from './components/TaskModal';
import { PomodoroTimer } from './components/PomodoroTimer';
import { Toast } from './components/Toast';
import { InviteModal } from './components/InviteModal';
import { ChannelChatModal } from './components/ChannelChatModal';
import UpgradePlanModal from './components/UpgradePlanModal';
import MemberDetailModal from './components/MemberDetailModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { EditSpaceModal } from './components/EditSpaceModal';
import { EditWorkspaceModal } from './components/EditWorkspaceModal';
import { BulkActionBar } from './components/BulkActionBar';
import { ExportModal } from './components/ExportModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { AuthPage } from './components/AuthPage';
import { ProfileModal } from './components/ProfileModal';
import { getInitialModule, updateUrlForModule, ROUTE_TO_MODULE, MODULE_TITLES } from './utils/routeHelper';
import {
  supabase,
  isSupabaseConfigured,
  formatSupabaseUser,
  cloudSignOut,
  cloudUpdateProfile,
  cloudFetchTasks,
  cloudUpsertTask,
  cloudDeleteTask,
  cloudSyncBatchTasks,
  cloudSubscribeTasks,
  cloudDeleteWorkspaceTasks
} from './utils/supabaseClient';
import { createActivityLog } from './utils/activityHelper';
import {
  KanbanSquare,
  ListTodo,
  Timer,
  BarChart3,
  Calendar,
  Filter,
  ArrowUpDown,
  Tag,
  User,
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import './styles/theme.css';
import './styles/app.css';
import './styles/clickup-theme.css';
import './styles/flowwork-theme.css';

// Helper to retrieve active user session (from sessionStorage or localStorage)
const getInitialUser = () => {
  try {
    const sessionSaved = sessionStorage.getItem('keepwork_auth_user') || sessionStorage.getItem('flowwork_auth_user');
    if (sessionSaved) return JSON.parse(sessionSaved);
    const localSaved = localStorage.getItem('keepwork_auth_user') || localStorage.getItem('flowwork_auth_user');
    if (localSaved) return JSON.parse(localSaved);
    return null;
  } catch {
    return null;
  }
};

// Helper to retrieve isolated workspace data per user or fallback to defaults
const loadWorkspaceData = (wsId, userId) => {
  try {
    const uPrefix = userId ? `u_${userId}` : 'u_guest';
    const userSpecificKey = `keepwork_${uPrefix}_data_${wsId}`;
    const userSaved = localStorage.getItem(userSpecificKey) || localStorage.getItem(`flowwork_${uPrefix}_data_${wsId}`);
    if (userSaved) {
      const parsed = JSON.parse(userSaved);
      return {
        tasks: parsed.tasks || [],
        columns: parsed.columns || INITIAL_COLUMNS,
        spaces: parsed.spaces || INITIAL_SPACES,
        notes: parsed.notes || INITIAL_NOTES,
        channels: parsed.channels || ['diskusi-umum', 'tugas-kelompok', 'catatan-kuliah']
      };
    }

    // Seamless fallback for default Kurnia / demo account
    if (!userId || userId === 'kurnia') {
      const legacySaved = localStorage.getItem(`flowwork_data_${wsId}`);
      if (legacySaved) {
        const parsed = JSON.parse(legacySaved);
        const isLegacyCorporate =
          parsed.tasks &&
          parsed.tasks.some(
            (t) =>
              t.title &&
              (t.title.includes('RBAC') || t.title.includes('JWT') || t.title.includes('FinTech'))
          );
        if (!isLegacyCorporate) {
          return {
            tasks: parsed.tasks || [],
            columns: parsed.columns || INITIAL_COLUMNS,
            spaces: parsed.spaces || INITIAL_SPACES,
            notes: parsed.notes || INITIAL_NOTES,
            channels: parsed.channels || ['diskusi-umum', 'tugas-kelompok', 'catatan-kuliah']
          };
        }
      }
    }
  } catch (e) {
    console.error('Error loading workspace data', e);
  }
  return getWorkspaceInitialData(wsId);
};

export function App() {
  // User Authentication & Session State (Early init for data isolation)
  const [currentUser, setCurrentUser] = useState(getInitialUser);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Workspaces Management
  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const saved = localStorage.getItem('keepwork_workspaces') || localStorage.getItem('flowwork_workspaces');
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasLegacy = parsed.some(
          (w) => w.name === "Kurnia's Workspace" || w.name === 'Product Engineering Q3'
        );
        if (!hasLegacy && parsed.length > 0) {
          return parsed;
        }
      }
      return INITIAL_WORKSPACES;
    } catch {
      return INITIAL_WORKSPACES;
    }
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    try {
      return localStorage.getItem('keepwork_active_workspace_id') || localStorage.getItem('flowwork_active_workspace_id') || 'ws-1';
    } catch {
      return 'ws-1';
    }
  });

  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0] || INITIAL_WORKSPACES[0];
  const workspaceName = activeWorkspace?.name || 'Kuliah & Studi';

  const handleRenameWorkspace = (newName) => {
    setWorkspaces((prev) =>
      prev.map((w) => (w.id === activeWorkspaceId ? { ...w, name: newName } : w))
    );
  };
  const setWorkspaceName = handleRenameWorkspace;

  // Isolated Workspace Data States (bound to user and active workspace)
  const [tasks, setTasks] = useState(() => {
    let initialWs = 'ws-1';
    try {
      initialWs = localStorage.getItem('flowwork_active_workspace_id') || 'ws-1';
    } catch {}
    return loadWorkspaceData(initialWs, getInitialUser()?.id).tasks;
  });

  const [columns, setColumns] = useState(() => {
    let initialWs = 'ws-1';
    try {
      initialWs = localStorage.getItem('flowwork_active_workspace_id') || 'ws-1';
    } catch {}
    return loadWorkspaceData(initialWs, getInitialUser()?.id).columns;
  });

  const [spaces, setSpaces] = useState(() => {
    let initialWs = 'ws-1';
    try {
      initialWs = localStorage.getItem('flowwork_active_workspace_id') || 'ws-1';
    } catch {}
    return loadWorkspaceData(initialWs, getInitialUser()?.id).spaces;
  });

  const [notes, setNotes] = useState(() => {
    let initialWs = 'ws-1';
    try {
      initialWs = localStorage.getItem('flowwork_active_workspace_id') || 'ws-1';
    } catch {}
    return loadWorkspaceData(initialWs, getInitialUser()?.id).notes;
  });

  const [channels, setChannels] = useState(() => {
    let initialWs = 'ws-1';
    try {
      initialWs = localStorage.getItem('flowwork_active_workspace_id') || 'ws-1';
    } catch {}
    return loadWorkspaceData(initialWs, getInitialUser()?.id).channels;
  });

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('flowwork_theme') || 'light';
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', saved);
        document.body.setAttribute('data-theme', saved);
      }
      return saved;
    } catch {
      return 'light';
    }
  });

  const [members, setMembers] = useState(() => {
    try {
      const saved = localStorage.getItem('flowwork_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.some((m) => m.id === 'kurnia' || m.isOwner)) {
          return [
            {
              id: 'kurnia',
              name: 'Kurnia',
              role: 'Workspace Owner & Lead',
              avatar: 'K',
              color: '#00a884',
              email: 'kurnia@keepwork.id',
              department: 'Executive',
              status: 'active',
              isOwner: true,
              capacity: 6
            },
            ...parsed
          ];
        }
        return parsed;
      }
      return INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [currentPlan, setCurrentPlan] = useState(() => {
    try {
      return localStorage.getItem('flowwork_current_plan') || 'free';
    } catch {
      return 'free';
    }
  });

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [channelChat, setChannelChat] = useState({ isOpen: false, channelName: '' });
  const [cloudSyncStatus, setCloudSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'offline'

  // FlowWork Shell modules: 'dashboards' | 'spaces' | 'home' | 'planner' | 'brain' | 'teams' | 'habits' | 'second-brain'
  const [activeModule, setActiveModule] = useState(getInitialModule);

  // Modern HTML5 History Navigation (without '#')
  const handleNavigateModule = (mod, replace = false) => {
    setActiveModule(mod);
    updateUrlForModule(mod, replace);
  };

  // Sync browser Back/Forward (PopState) and tab title
  useEffect(() => {
    const handlePopState = (e) => {
      const rawPath = window.location.pathname.toLowerCase();
      const path = rawPath.length > 1 ? rawPath.replace(/\/$/, '') : rawPath;
      const targetMod = ROUTE_TO_MODULE[path] || (e.state && e.state.module) || 'dashboards';
      setActiveModule(targetMod);
      const title = MODULE_TITLES[targetMod] || 'KeepWork — OS Produktivitas';
      document.title = title;
    };

    window.addEventListener('popstate', handlePopState);
    updateUrlForModule(activeModule, true);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Spaces tab views: 'board' | 'list' | 'calendar' | 'pomodoro' | 'analytics'
  const [spaceSubView, setSpaceSubView] = useState('board');
  const [activeSpaceId, setActiveSpaceId] = useState('all');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default');

  // Task Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [modalDefaultDate, setModalDefaultDate] = useState('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Project / Space Modal states
  const [isEditSpaceModalOpen, setIsEditSpaceModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [deleteSpaceConfirm, setDeleteSpaceConfirm] = useState({ isOpen: false, space: null });

  // Workspace Modal states (Edit & Delete)
  const [isEditWorkspaceModalOpen, setIsEditWorkspaceModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [deleteWorkspaceConfirm, setDeleteWorkspaceConfirm] = useState({ isOpen: false, workspace: null });

  // Bulk / Multi-select Task Actions state
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  // Quick Filter Chips state ('all' | 'my-tasks' | 'overdue' | 'high-priority' | 'this-week')
  const [quickFilter, setQuickFilter] = useState('all');

  // Data Transfer Modal (Export & Import) & Shortcuts Modals state
  const [dataModalConfig, setDataModalConfig] = useState({ isOpen: false, tab: 'export' });
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const handleOpenExportModal = () => setDataModalConfig({ isOpen: true, tab: 'export' });
  const handleOpenImportModal = () => setDataModalConfig({ isOpen: true, tab: 'import' });

  // Habit Tracker State (Personal Productivity - Isolated per user)
  const [habits, setHabits] = useState(() => {
    try {
      const uPrefix = currentUser?.id ? `u_${currentUser.id}` : 'u_guest';
      const saved =
        localStorage.getItem(`keepwork_${uPrefix}_habits`) ||
        localStorage.getItem(`flowwork_${uPrefix}_habits`) ||
        localStorage.getItem('keepwork_habits');
      if (saved) return JSON.parse(saved);
      return INITIAL_HABITS;
    } catch {
      return INITIAL_HABITS;
    }
  });

  // Second Brain Knowledge Hub State (P.A.R.A - Isolated per user)
  const [secondBrainNotes, setSecondBrainNotes] = useState(() => {
    try {
      const uPrefix = currentUser?.id ? `u_${currentUser.id}` : 'u_guest';
      const saved =
        localStorage.getItem(`keepwork_${uPrefix}_second_brain`) ||
        localStorage.getItem(`flowwork_${uPrefix}_second_brain`) ||
        localStorage.getItem('keepwork_second_brain');
      if (saved) return JSON.parse(saved);
      return INITIAL_SECOND_BRAIN_NOTES;
    } catch {
      return INITIAL_SECOND_BRAIN_NOTES;
    }
  });

  const handleUpdateHabits = (newHabits) => {
    setHabits(newHabits);
    try {
      const uPrefix = currentUser?.id ? `u_${currentUser.id}` : 'u_guest';
      localStorage.setItem(`keepwork_${uPrefix}_habits`, JSON.stringify(newHabits));
    } catch (e) {
      console.error('Error saving habits', e);
    }
  };

  const handleUpdateSecondBrainNotes = (newNotes) => {
    setSecondBrainNotes(newNotes);
    try {
      const uPrefix = currentUser?.id ? `u_${currentUser.id}` : 'u_guest';
      localStorage.setItem(`keepwork_${uPrefix}_second_brain`, JSON.stringify(newNotes));
    } catch (e) {
      console.error('Error saving second brain notes', e);
    }
  };

  const handleConvertNoteToTask = (payload) => {
    const targetSpaceId = activeSpaceId !== 'all' ? activeSpaceId : (spaces[0]?.id || 'skripsi');
    const newTask = {
      id: 'task-' + Date.now(),
      projectId: targetSpaceId,
      title: payload.title,
      description: payload.description || '',
      status: 'todo',
      priority: payload.priority || 'normal',
      dueDate: new Date().toISOString().split('T')[0],
      tags: payload.tags || ['#second-brain'],
      assignee: currentUser?.id || 'kurnia',
      estimatedHours: 2,
      loggedMinutes: 0,
      subtasks: [],
      activityLog: [
        {
          id: 'act-' + Date.now(),
          text: `Dikonversi dari Second Brain Knowledge Hub`,
          timestamp: 'Baru saja'
        }
      ]
    };
    setTasks((prev) => [newTask, ...prev]);
    if (isSupabaseConfigured && currentUser?.isCloud) {
      cloudInsertTask(newTask, activeWorkspaceId).catch(() => {});
    }
  };

  // Unified Global Keyboard Shortcuts (Ctrl + K, ?, N, Esc)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName;
      const isInputActive =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) ||
        document.activeElement?.isContentEditable;

      // Escape handles closing active modals / popups / selections
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (dataModalConfig.isOpen) {
          setDataModalConfig({ isOpen: false, tab: 'export' });
          return;
        }
        if (deleteSpaceConfirm.isOpen) {
          setDeleteSpaceConfirm({ isOpen: false, space: null });
          return;
        }
        if (isEditSpaceModalOpen) {
          setIsEditSpaceModalOpen(false);
          return;
        }
        if (isInviteModalOpen) {
          setIsInviteModalOpen(false);
          return;
        }
        if (isUpgradeModalOpen) {
          setIsUpgradeModalOpen(false);
          return;
        }
        if (channelChat.isOpen) {
          setChannelChat({ isOpen: false, channelName: '' });
          return;
        }
        if (isModalOpen) {
          setIsModalOpen(false);
          return;
        }
        if (selectedTaskIds.length > 0) {
          setSelectedTaskIds([]);
          return;
        }
        return;
      }

      // If user is currently typing in an input/textarea, do not trigger single-key navigation shortcuts
      if (isInputActive) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setCurrentTask(null);
        setModalDefaultDate('');
        setIsModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCommandPaletteOpen,
    isShortcutsModalOpen,
    dataModalConfig.isOpen,
    deleteSpaceConfirm.isOpen,
    isEditSpaceModalOpen,
    isInviteModalOpen,
    isUpgradeModalOpen,
    channelChat.isOpen,
    isModalOpen,
    selectedTaskIds.length
  ]);

  // Workspace JSON Export
  const handleExportWorkspaceData = () => {
    try {
      const exportPayload = {
        workspace: workspaceName,
        exportedAt: new Date().toISOString(),
        version: '2.0',
        tasks,
        columns,
        members,
        spaces,
        notes,
        channels
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `keepwork-${workspaceName.toLowerCase().replace(/\s+/g, '-')}-backup.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast('Data workspace berhasil diekspor (JSON)', 'success');
    } catch (e) {
      console.error(e);
      addToast('Gagal mengekspor data workspace', 'error');
    }
  };

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', options = {}) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const duration = options?.duration || 3500;
    const action = options?.action || null;
    setToasts((prev) => [...prev, { id, message, type, action }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Multi-Tab Session Synchronization & Supabase Real-Time Listener
  useEffect(() => {
    // 1. Supabase Session Detection
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user && !currentUser) {
          const u = formatSupabaseUser(session.user, session);
          handleLoginSuccess(u, true);
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const u = formatSupabaseUser(session.user, session);
          setCurrentUser(u);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }

    // 2. Local storage cross-tab sync
    const handleStorageChange = (e) => {
      if (e.key === 'flowwork_auth_user') {
        if (!e.newValue) {
          setCurrentUser(null);
          addToast('Sesi Anda telah keluar dari tab lain.', 'info');
        } else {
          try {
            const newUser = JSON.parse(e.newValue);
            setCurrentUser(newUser);
          } catch {}
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 3. Supabase Cloud Tasks Synchronization & Real-time Subscription
  useEffect(() => {
    if (!isSupabaseConfigured || !currentUser?.isCloud) {
      setCloudSyncStatus('offline');
      return;
    }

    let isMounted = true;
    setCloudSyncStatus('syncing');

    cloudFetchTasks(activeWorkspaceId)
      .then((cloudTasks) => {
        if (!isMounted) return;
        if (cloudTasks && cloudTasks.length > 0) {
          setTasks(cloudTasks);
          setCloudSyncStatus('synced');
        } else {
          // If cloud has 0 tasks, seed initial tasks from local data to cloud
          const uPrefix = `u_${currentUser.id}`;
          const localSaved = localStorage.getItem(`flowwork_${uPrefix}_data_${activeWorkspaceId}`);
          const parsed = localSaved ? JSON.parse(localSaved)?.tasks : null;
          const initialTasksToSeed = parsed && parsed.length > 0 ? parsed : tasks;
          if (initialTasksToSeed && initialTasksToSeed.length > 0) {
            cloudSyncBatchTasks(initialTasksToSeed, activeWorkspaceId)
              .then(() => {
                if (isMounted) setCloudSyncStatus('synced');
              })
              .catch(() => {
                if (isMounted) setCloudSyncStatus('offline');
              });
          } else {
            setCloudSyncStatus('synced');
          }
        }
      })
      .catch((err) => {
        console.warn('Notice fetching cloud tasks on mount:', err);
        if (isMounted) setCloudSyncStatus('offline');
      });

    // Subscribe to real-time changes in the active workspace
    const channel = cloudSubscribeTasks(activeWorkspaceId, (payload) => {
      if (!isMounted) return;
      if (payload.eventType === 'INSERT' && payload.new) {
        const newTask = {
          id: payload.new.id,
          projectId: payload.new.workspace_id,
          title: payload.new.title,
          description: payload.new.description || '',
          status: payload.new.status || 'todo',
          priority: payload.new.priority || 'medium',
          dueDate: payload.new.due_date || '',
          tags: Array.isArray(payload.new.tags) ? payload.new.tags : [],
          assignee: payload.new.assignee || '',
          subtasks: Array.isArray(payload.new.subtasks) ? payload.new.subtasks : []
        };
        setTasks((prev) => (prev.some((t) => t.id === newTask.id) ? prev : [newTask, ...prev]));
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === payload.new.id
              ? {
                  ...t,
                  title: payload.new.title,
                  description: payload.new.description || '',
                  status: payload.new.status || 'todo',
                  priority: payload.new.priority || 'medium',
                  dueDate: payload.new.due_date || '',
                  tags: Array.isArray(payload.new.tags) ? payload.new.tags : [],
                  assignee: payload.new.assignee || '',
                  subtasks: Array.isArray(payload.new.subtasks) ? payload.new.subtasks : []
                }
              : t
          )
        );
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
      }
    });

    return () => {
      isMounted = false;
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [activeWorkspaceId, currentUser?.id]);

  const handleLoginSuccess = (user, rememberMe = true) => {
    setCurrentUser(user);
    try {
      if (rememberMe) {
        localStorage.setItem('keepwork_auth_user', JSON.stringify(user));
        sessionStorage.removeItem('keepwork_auth_user');
        localStorage.setItem('flowwork_auth_user', JSON.stringify(user));
        sessionStorage.removeItem('flowwork_auth_user');
      } else {
        sessionStorage.setItem('keepwork_auth_user', JSON.stringify(user));
        localStorage.removeItem('keepwork_auth_user');
        sessionStorage.setItem('flowwork_auth_user', JSON.stringify(user));
        localStorage.removeItem('flowwork_auth_user');
      }
    } catch {}

    // Load isolated workspace data for this user
    const userWsData = loadWorkspaceData(activeWorkspaceId, user.id);
    setTasks(userWsData.tasks);
    setColumns(userWsData.columns);
    setSpaces(userWsData.spaces);
    setNotes(userWsData.notes);
    setChannels(userWsData.channels);

    // Load isolated habits & second brain notes
    try {
      const uPref = user.id ? `u_${user.id}` : 'u_guest';
      const userHabits = localStorage.getItem(`keepwork_${uPref}_habits`);
      if (userHabits) setHabits(JSON.parse(userHabits));
      const userNotes = localStorage.getItem(`keepwork_${uPref}_second_brain`);
      if (userNotes) setSecondBrainNotes(JSON.parse(userNotes));
    } catch {}

    // If cloud user, trigger cloud fetch & initial seed
    if (isSupabaseConfigured && user.isCloud) {
      setCloudSyncStatus('syncing');
      cloudFetchTasks(activeWorkspaceId)
        .then((cloudTasks) => {
          if (cloudTasks && cloudTasks.length > 0) {
            setTasks(cloudTasks);
            setCloudSyncStatus('synced');
          } else if (userWsData.tasks && userWsData.tasks.length > 0) {
            cloudSyncBatchTasks(userWsData.tasks, activeWorkspaceId)
              .then(() => setCloudSyncStatus('synced'))
              .catch(() => setCloudSyncStatus('offline'));
          } else {
            setCloudSyncStatus('synced');
          }
        })
        .catch(() => setCloudSyncStatus('offline'));
    }

    // Sync member card if exists
    setMembers((prev) =>
      prev.map((m) =>
        m.id === 'kurnia' || m.email === user.email
          ? {
              ...m,
              name: user.name,
              avatar: user.avatar,
              color: user.avatarColor || m.color,
              role: user.role
            }
          : m
      )
    );

    addToast(`Selamat datang di KeepWork, ${user.name}! 👋`, 'success');
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('keepwork_auth_user');
      sessionStorage.removeItem('keepwork_auth_user');
      localStorage.removeItem('flowwork_auth_user');
      sessionStorage.removeItem('flowwork_auth_user');
      if (isSupabaseConfigured) {
        await cloudSignOut();
      }
    } catch {}
    addToast('Anda telah keluar dari akun.', 'info');
  };

  const handleUpdateUserProfile = (updatedUser) => {
    setCurrentUser(updatedUser);
    try {
      if (localStorage.getItem('flowwork_auth_user')) {
        localStorage.setItem('flowwork_auth_user', JSON.stringify(updatedUser));
      }
      if (sessionStorage.getItem('flowwork_auth_user')) {
        sessionStorage.setItem('flowwork_auth_user', JSON.stringify(updatedUser));
      }

      // Sync to Supabase cloud if connected
      if (isSupabaseConfigured) {
        cloudUpdateProfile({
          name: updatedUser.name,
          role: updatedUser.role,
          category: updatedUser.category,
          avatar: updatedUser.avatar,
          avatarColor: updatedUser.avatarColor
        }).catch((err) => console.warn('Cloud profile sync notice:', err));
      }

      // Sync registered accounts list
      const savedAccounts = JSON.parse(localStorage.getItem('flowwork_registered_accounts') || '[]');
      const idx = savedAccounts.findIndex(
        (acc) =>
          acc.id === updatedUser.id ||
          acc.email.toLowerCase() === updatedUser.email?.toLowerCase()
      );
      if (idx !== -1) {
        savedAccounts[idx] = {
          ...savedAccounts[idx],
          name: updatedUser.name,
          role: updatedUser.role,
          category: updatedUser.category,
          avatar: updatedUser.avatar,
          avatarColor: updatedUser.avatarColor
        };
        localStorage.setItem('flowwork_registered_accounts', JSON.stringify(savedAccounts));
      }

      // Sync workspace owner card in members list
      setMembers((prev) =>
        prev.map((m) =>
          m.id === 'kurnia' || m.isOwner || m.email === updatedUser.email
            ? {
                ...m,
                name: updatedUser.name,
                avatar: updatedUser.avatar,
                color: updatedUser.avatarColor || m.color,
                role: updatedUser.role
              }
            : m
        )
      );
    } catch (e) {
      console.error('Error updating user profile', e);
    }
  };

  // Multi-Workspace Isolation Handlers
  const handleSwitchWorkspace = (targetWsId) => {
    if (targetWsId === activeWorkspaceId) return;

    // 1. Immediately flush current workspace state to its storage key
    try {
      const currentPayload = { tasks, columns, spaces, notes, channels };
      const uPrefix = currentUser?.id ? `u_${currentUser.id}` : 'u_guest';
      localStorage.setItem(
        `flowwork_${uPrefix}_data_${activeWorkspaceId}`,
        JSON.stringify(currentPayload)
      );
      if (!currentUser || currentUser.id === 'kurnia') {
        localStorage.setItem(`flowwork_data_${activeWorkspaceId}`, JSON.stringify(currentPayload));
        if (activeWorkspaceId === 'ws-1') {
          localStorage.setItem('flowwork_tasks', JSON.stringify(tasks));
          localStorage.setItem('flowwork_columns', JSON.stringify(columns));
          localStorage.setItem('flowwork_spaces', JSON.stringify(spaces));
          localStorage.setItem('flowwork_notes', JSON.stringify(notes));
          localStorage.setItem('flowwork_channels', JSON.stringify(channels));
        }
      }
    } catch (e) {
      console.error('Failed to flush current workspace data:', e);
    }

    // 2. Load target workspace data
    const targetData = loadWorkspaceData(targetWsId, currentUser?.id);

    // 3. Update active workspace ID
    setActiveWorkspaceId(targetWsId);
    try {
      localStorage.setItem('flowwork_active_workspace_id', targetWsId);
    } catch (e) {
      console.error(e);
    }

    // 4. Update state variables cleanly
    setTasks(targetData.tasks);
    setColumns(targetData.columns);
    setSpaces(targetData.spaces);
    setNotes(targetData.notes);
    setChannels(targetData.channels);

    // If cloud session, load cloud tasks for this targeted workspace
    if (isSupabaseConfigured && currentUser?.isCloud) {
      setCloudSyncStatus('syncing');
      cloudFetchTasks(targetWsId)
        .then((cloudTasks) => {
          if (cloudTasks && cloudTasks.length > 0) {
            setTasks(cloudTasks);
            setCloudSyncStatus('synced');
          } else if (targetData.tasks && targetData.tasks.length > 0) {
            cloudSyncBatchTasks(targetData.tasks, targetWsId)
              .then(() => setCloudSyncStatus('synced'))
              .catch(() => setCloudSyncStatus('offline'));
          } else {
            setCloudSyncStatus('synced');
          }
        })
        .catch(() => setCloudSyncStatus('offline'));
    }

    // 5. Cleanly reset filters and selections
    setActiveSpaceId('all');
    setSelectedTaskIds([]);
    setSearchQuery('');
    setPriorityFilter('all');
    setTagFilter('all');
    setAssigneeFilter('all');

    const targetWs = workspaces.find((w) => w.id === targetWsId);
    addToast(`Beralih ke workspace "${targetWs?.name || targetWsId}" 🚀`, 'success');
  };

  const handleCreateWorkspace = (newWsName) => {
    if (!newWsName || !newWsName.trim()) return;
    const cleanName = newWsName.trim();
    const newId = 'ws-' + Date.now();
    const newWorkspace = {
      id: newId,
      name: cleanName,
      role: 'Owner',
      icon: '🚀',
      color: '#00a884',
      description: 'Workspace kustom baru'
    };

    const updatedWorkspaces = [...workspaces, newWorkspace];
    setWorkspaces(updatedWorkspaces);
    try {
      localStorage.setItem('flowwork_workspaces', JSON.stringify(updatedWorkspaces));
    } catch (e) {
      console.error(e);
    }

    // Flush current workspace state before switching
    try {
      const currentPayload = { tasks, columns, spaces, notes, channels };
      localStorage.setItem(`flowwork_data_${activeWorkspaceId}`, JSON.stringify(currentPayload));
    } catch (e) {
      console.error(e);
    }

    // Seed new workspace initial clean data
    const cleanData = getWorkspaceInitialData(newId);
    try {
      localStorage.setItem(`flowwork_data_${newId}`, JSON.stringify(cleanData));
      localStorage.setItem('flowwork_active_workspace_id', newId);
    } catch (e) {
      console.error(e);
    }

    setActiveWorkspaceId(newId);
    setTasks(cleanData.tasks);
    setColumns(cleanData.columns);
    setSpaces(cleanData.spaces);
    setNotes(cleanData.notes);
    setChannels(cleanData.channels);

    setActiveSpaceId('all');
    setSelectedTaskIds([]);
    setSearchQuery('');
    setPriorityFilter('all');
    setTagFilter('all');
    setAssigneeFilter('all');

    addToast(`Workspace "${cleanName}" berhasil dibuat & aktif! 🎉`, 'success');
  };

  const handleOpenEditWorkspace = (ws = null) => {
    // If ws is null, it means we are editing the currently active workspace, or creating new
    setEditingWorkspace(ws || activeWorkspace);
    setIsEditWorkspaceModalOpen(true);
  };

  const handleSaveWorkspace = (wsData) => {
    const exists = workspaces.some((w) => w.id === wsData.id);
    if (exists) {
      setWorkspaces((prev) =>
        prev.map((w) =>
          w.id === wsData.id
            ? {
                ...w,
                name: wsData.name,
                icon: wsData.icon || w.icon,
                color: wsData.color || w.color,
                description: wsData.description !== undefined ? wsData.description : w.description
              }
            : w
        )
      );
      addToast(`Ruang kerja "${wsData.name}" berhasil diperbarui! ✨`, 'success');
    } else {
      // Create new workspace
      const newWs = {
        id: wsData.id || `ws-${Date.now()}`,
        name: wsData.name,
        role: 'Owner',
        icon: wsData.icon || '🚀',
        color: wsData.color || '#00a884',
        description: wsData.description || 'Workspace kustom baru'
      };
      const updated = [...workspaces, newWs];
      setWorkspaces(updated);
      handleSwitchWorkspace(newWs.id);
      addToast(`Ruang kerja "${newWs.name}" berhasil dibuat & aktif! 🎉`, 'success');
    }
  };

  const handleRequestDeleteWorkspace = (ws) => {
    if (workspaces.length <= 1) {
      addToast('Minimal harus ada 1 ruang kerja! Tidak dapat menghapus ruang kerja terakhir.', 'warning');
      return;
    }
    const targetWs = ws || activeWorkspace;
    setDeleteWorkspaceConfirm({ isOpen: true, workspace: targetWs });
  };

  const handleConfirmDeleteWorkspace = () => {
    const targetWs = deleteWorkspaceConfirm.workspace;
    if (!targetWs) return;

    const targetId = targetWs.id;
    const remaining = workspaces.filter((w) => w.id !== targetId);

    if (remaining.length === 0) {
      addToast('Tidak dapat menghapus seluruh ruang kerja!', 'warning');
      setDeleteWorkspaceConfirm({ isOpen: false, workspace: null });
      return;
    }

    // If currently on the deleted workspace, switch to the first remaining one
    if (targetId === activeWorkspaceId) {
      const nextWs = remaining[0];
      handleSwitchWorkspace(nextWs.id);
    }

    setWorkspaces(remaining);

    // Clean up local cache
    try {
      const uPrefix = currentUser?.id ? `u_${currentUser.id}` : 'u_guest';
      localStorage.removeItem(`flowwork_${uPrefix}_data_${targetId}`);
      localStorage.removeItem(`flowwork_data_${targetId}`);
    } catch (e) {
      console.error(e);
    }

    // Clean up Supabase cloud tasks
    if (isSupabaseConfigured && currentUser?.isCloud) {
      cloudDeleteWorkspaceTasks(targetId);
    }

    setDeleteWorkspaceConfirm({ isOpen: false, workspace: null });
    addToast(`Ruang kerja "${targetWs.name}" berhasil dihapus.`, 'info');
  };

  // Bulk Selection Handlers
  const handleToggleSelectTask = (taskId) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleClearSelection = () => {
    setSelectedTaskIds([]);
  };

  const handleSelectAllTasks = () => {
    const allIds = filteredAndSortedTasks.map((t) => t.id);
    setSelectedTaskIds(allIds);
    addToast(`${allIds.length} tugas dipilih`, 'info');
  };

  // Bulk Batch Operations
  const handleBatchUpdateStatus = (newStatus) => {
    if (!selectedTaskIds.length) return;
    const colObj = columns.find((c) => c.id === newStatus);
    const colTitle = colObj ? colObj.title : newStatus;
    const count = selectedTaskIds.length;
    setTasks((prev) =>
      prev.map((t) =>
        selectedTaskIds.includes(t.id)
          ? {
              ...t,
              status: newStatus,
              activityLog: [
                createActivityLog(`Status diubah ke "${colTitle}" via Aksi Massal (Bulk)`),
                ...(t.activityLog || [])
              ]
            }
          : t
      )
    );

    if (isSupabaseConfigured && currentUser?.isCloud) {
      setCloudSyncStatus('syncing');
      const updatedBatch = tasks
        .filter((t) => selectedTaskIds.includes(t.id))
        .map((t) => ({ ...t, status: newStatus }));
      cloudSyncBatchTasks(updatedBatch, activeWorkspaceId)
        .then(() => setCloudSyncStatus('synced'))
        .catch(() => setCloudSyncStatus('offline'));
    }

    addToast(`${count} tugas dipindahkan ke "${colTitle}"`, 'success');
    setSelectedTaskIds([]);
  };

  const handleBatchUpdateAssignee = (assigneeId) => {
    if (!selectedTaskIds.length) return;
    const memberObj = members.find((m) => m.id === assigneeId);
    const memberName = memberObj ? memberObj.name : '';
    const count = selectedTaskIds.length;
    setTasks((prev) =>
      prev.map((t) =>
        selectedTaskIds.includes(t.id)
          ? {
              ...t,
              assignee: memberName,
              assigneeId: assigneeId,
              activityLog: [
                createActivityLog(
                  memberName
                    ? `Ditugaskan ke ${memberName} via Aksi Massal (Bulk)`
                    : 'Penugasan dibatalkan via Aksi Massal (Bulk)'
                ),
                ...(t.activityLog || [])
              ]
            }
          : t
      )
    );
    addToast(
      memberName
        ? `${count} tugas ditugaskan ke ${memberName}`
        : `${count} tugas dibatalkan penugasannya`,
      'success'
    );
    setSelectedTaskIds([]);
  };

  const handleBatchUpdatePriority = (priority) => {
    if (!selectedTaskIds.length) return;
    const count = selectedTaskIds.length;
    setTasks((prev) =>
      prev.map((t) =>
        selectedTaskIds.includes(t.id)
          ? {
              ...t,
              priority: priority,
              activityLog: [
                createActivityLog(`Prioritas diubah ke ${priority.toUpperCase()} via Aksi Massal (Bulk)`),
                ...(t.activityLog || [])
              ]
            }
          : t
      )
    );
    addToast(`Prioritas ${count} tugas diubah ke ${priority.toUpperCase()}`, 'success');
    setSelectedTaskIds([]);
  };

  const handleBatchDelete = () => {
    if (!selectedTaskIds.length) return;
    const deletedTasks = tasks.filter((t) => selectedTaskIds.includes(t.id));
    const count = deletedTasks.length;
    setTasks((prev) => prev.filter((t) => !selectedTaskIds.includes(t.id)));
    setSelectedTaskIds([]);

    if (isSupabaseConfigured && currentUser?.isCloud) {
      setCloudSyncStatus('syncing');
      Promise.all(deletedTasks.map((t) => cloudDeleteTask(t.id)))
        .then(() => setCloudSyncStatus('synced'))
        .catch(() => setCloudSyncStatus('offline'));
    }

    addToast(`${count} tugas berhasil dihapus secara massal`, 'info', {
      duration: 6500,
      action: {
        label: 'Urungkan',
        onClick: () => {
          setTasks((prev) => [...deletedTasks, ...prev]);
          if (isSupabaseConfigured && currentUser?.isCloud) {
            cloudSyncBatchTasks(deletedTasks, activeWorkspaceId);
          }
          addToast(`${count} tugas berhasil dipulihkan! ↩️`, 'success');
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate?.([35, 25, 35]);
          }
        }
      }
    });
  };

  // CSV Export Function
  const handleExportCSV = () => {
    try {
      const headers = ['ID', 'Judul', 'Status', 'Prioritas', 'PIC', 'Proyek', 'Tenggat Waktu', 'Tag', 'Jumlah Subtask'];
      const rows = tasks.map((t) => {
        const colObj = columns.find((c) => c.id === t.status);
        const spaceObj = spaces.find((s) => s.id === t.projectId);
        return [
          `"${t.id}"`,
          `"${(t.title || '').replace(/"/g, '""')}"`,
          `"${colObj ? colObj.title : t.status}"`,
          `"${(t.priority || 'normal').toUpperCase()}"`,
          `"${t.assignee || 'Belum Ditugaskan'}"`,
          `"${spaceObj ? spaceObj.name : t.projectId || ''}"`,
          `"${t.dueDate || '-'}"`,
          `"${(t.tags || []).join('; ')}"`,
          `"${(t.subtasks || []).length}"`
        ].join(',');
      });

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', `flowwork-${workspaceName.toLowerCase().replace(/\s+/g, '-')}-tasks.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      addToast('File CSV tugas berhasil diekspor! 📊', 'success');
    } catch (e) {
      console.error(e);
      addToast('Gagal mengekspor CSV', 'error');
    }
  };

  // Print Laporan Progres Belajar & Proyek
  const handlePrintSprintReport = () => {
    try {
      const printWindow = window.open('', '_blank');
      const todayStr = new Date().toISOString().split('T')[0];
      const total = tasks.length;
      const done = tasks.filter((t) => t.status === 'done').length;
      const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
      const review = tasks.filter((t) => t.status === 'review').length;
      const overdue = tasks.filter((t) => t.dueDate && t.dueDate < todayStr && t.status !== 'done').length;
      const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

      if (!printWindow) {
        window.print();
        return;
      }

      const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Progres Belajar & Proyek - ${workspaceName}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; color: #1e293b; line-height: 1.5; }
            h1 { font-size: 22px; margin-bottom: 4px; color: #0f172a; }
            .meta { font-size: 13px; color: #64748b; margin-bottom: 24px; }
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 26px; }
            .stat-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; background: #f8fafc; }
            .stat-val { font-size: 24px; font-weight: 800; color: #6366f1; }
            .stat-lbl { font-size: 11px; color: #64748b; margin-top: 4px; text-transform: uppercase; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th { background: #f1f5f9; text-align: left; padding: 10px; border-bottom: 2px solid #cbd5e1; font-weight: 700; color: #334155; }
            td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background: #fafafa; }
            .badge { display: inline-block; padding: 2px 7px; border-radius: 10px; font-size: 11px; font-weight: 600; }
            .badge-done { background: #dcfce7; color: #166534; }
            .badge-prog { background: #e0e7ff; color: #3730a3; }
            .badge-urgent { background: #fee2e2; color: #991b1b; }
            @media print {
              body { padding: 10px; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h1>Laporan Ringkasan Tugas & Progres</h1>
              <div class="meta">Ruang Kerja: <strong>${workspaceName}</strong> • Tanggal: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</div>
            </div>
            <button onclick="window.print()" style="padding: 7px 14px; background: #6366f1; color: #fff; border: none; border-radius: 6px; font-weight: 600; cursor: pointer;">Cetak Laporan</button>
          </div>

          <div class="stats-grid">
            <div class="stat-card"><div class="stat-val">${total}</div><div class="stat-lbl">Total Tugas</div></div>
            <div class="stat-card"><div class="stat-val" style="color: #10b981;">${done} (${completionRate}%)</div><div class="stat-lbl">Selesai</div></div>
            <div class="stat-card"><div class="stat-val" style="color: #f59e0b;">${inProgress + review}</div><div class="stat-lbl">In Progress / Review</div></div>
            <div class="stat-card"><div class="stat-val" style="color: #ef4444;">${overdue}</div><div class="stat-lbl">Overdue</div></div>
          </div>

          <h3 style="font-size: 15px; margin-bottom: 8px; color: #0f172a;">Rincian Tugas Aktif</h3>
          <table>
            <thead>
              <tr>
                <th>Judul Tugas</th>
                <th>Status</th>
                <th>Prioritas</th>
                <th>PIC</th>
                <th>Tenggat Waktu</th>
              </tr>
            </thead>
            <tbody>
              ${tasks.map((t) => {
                const col = columns.find((c) => c.id === t.status);
                return `
                  <tr>
                    <td><strong>${t.title}</strong></td>
                    <td><span class="badge ${t.status === 'done' ? 'badge-done' : 'badge-prog'}">${col ? col.title : t.status}</span></td>
                    <td><span class="badge ${t.priority === 'urgent' ? 'badge-urgent' : ''}">${(t.priority || 'normal').toUpperCase()}</span></td>
                    <td>${t.assignee || '—'}</td>
                    <td>${t.dueDate || '—'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(reportHtml);
      printWindow.document.close();
      addToast('Laporan sprint siap dicetak! 🖨️', 'success');
    } catch (e) {
      console.error(e);
      window.print();
    }
  };

  // CSV Tasks Import Handler
  const handleImportTasks = (newTasks) => {
    if (!newTasks || !newTasks.length) return;
    setTasks((prev) => [...newTasks, ...prev]);
    addToast(`${newTasks.length} tugas berhasil diimpor ke workspace! 📥`, 'success');
    triggerCelebration('import');
  };

  // JSON Full / Merge Workspace Restore Handler
  const handleRestoreWorkspace = (backupData, mode = 'full') => {
    try {
      if (!backupData || !Array.isArray(backupData.tasks)) {
        addToast('File cadangan tidak valid (harus memiliki daftar tugas)', 'error');
        return;
      }

      if (mode === 'full') {
        if (backupData.tasks) setTasks(backupData.tasks);
        if (backupData.columns) setColumns(backupData.columns);
        if (backupData.spaces) setSpaces(backupData.spaces);
        if (backupData.members) setMembers(backupData.members);
        if (backupData.notes) setNotes(backupData.notes);
        if (backupData.channels) setChannels(backupData.channels);
        if (backupData.workspaceName) setWorkspaceName(backupData.workspaceName);

        addToast(`Workspace "${backupData.workspace || workspaceName}" berhasil dipulihkan secara penuh! 🚀`, 'success');
      } else {
        const existingIds = new Set(tasks.map((t) => t.id));
        const tasksToMerge = backupData.tasks.filter((t) => !existingIds.has(t.id));
        setTasks((prev) => [...tasksToMerge, ...prev]);
        addToast(`${tasksToMerge.length} tugas baru dari cadangan berhasil digabungkan! 📥`, 'success');
      }

      triggerCelebration('restore');
    } catch (err) {
      console.error(err);
      addToast('Gagal memulihkan cadangan workspace', 'error');
    }
  };

  // Pomodoro timer states
  const [timerMode, setTimerMode] = useState('focus');
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [completedSessions, setCompletedSessions] = useState(0);

  // Debounced Sync LocalStorage (Isolated per user and workspace)
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        const payload = { tasks, columns, spaces, notes, channels };
        const uPrefix = currentUser?.id ? `u_${currentUser.id}` : 'u_guest';
        localStorage.setItem(
          `flowwork_${uPrefix}_data_${activeWorkspaceId}`,
          JSON.stringify(payload)
        );
        if (!currentUser || currentUser.id === 'kurnia') {
          localStorage.setItem(`flowwork_data_${activeWorkspaceId}`, JSON.stringify(payload));
          if (activeWorkspaceId === 'ws-1') {
            localStorage.setItem('flowwork_tasks', JSON.stringify(tasks));
            localStorage.setItem('flowwork_columns', JSON.stringify(columns));
            localStorage.setItem('flowwork_spaces', JSON.stringify(spaces));
            localStorage.setItem('flowwork_notes', JSON.stringify(notes));
            localStorage.setItem('flowwork_channels', JSON.stringify(channels));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [tasks, columns, spaces, notes, channels, activeWorkspaceId, currentUser?.id]);

  useEffect(() => {
    try {
      localStorage.setItem('flowwork_workspaces', JSON.stringify(workspaces));
    } catch (e) {
      console.error(e);
    }
  }, [workspaces]);

  useEffect(() => {
    try {
      localStorage.setItem('flowwork_active_workspace_id', activeWorkspaceId);
    } catch (e) {
      console.error(e);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem('flowwork_members', JSON.stringify(members));
      } catch (e) {
        console.error(e);
      }
    }, 350);
    return () => clearTimeout(handler);
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem('flowwork_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('flowwork_current_plan', currentPlan);
    } catch (e) {
      console.error(e);
    }
  }, [currentPlan]);

  // Visual Celebration Fanfare & Haptic Micro-Interactions (Without Web Audio API)
  const triggerCelebration = (type = 'standard') => {
    try {
      if (type === 'focus') {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#06b6d4', '#f59e0b', '#ec4899']
        });
      } else if (type === 'task-done') {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#10b981', '#06b6d4', '#6366f1']
        });
      } else if (type === 'import' || type === 'restore') {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10b981', '#6366f1', '#f59e0b']
        });
      } else {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }

      // Gentle tactile haptic pulse on mobile/touch screens
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 30, 40]);
      }
    } catch {
      // ignore
    }
  };

  // Pomodoro Ticker
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          triggerCelebration('focus');
          setIsRunning(false);
          setCompletedSessions((prev) => prev + 1);
          addToast('🎉 Sesi Pomodoro selesai! Waktunya istirahat.', 'success');

          if (selectedTaskId && timerMode === 'focus') {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === selectedTaskId
                  ? {
                      ...t,
                      loggedMinutes: (t.loggedMinutes || 0) + 25,
                      activityLog: [
                        createActivityLog('Menyelesaikan 1 sesi fokus Pomodoro (25 menit)'),
                        ...(t.activityLog || [])
                      ]
                    }
                  : t
              )
            );
          }

          if (timerMode === 'focus') {
            setTimerMode('shortBreak');
            setMinutes(5);
          } else {
            setTimerMode('focus');
            setMinutes(25);
          }
          setSeconds(0);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, minutes, seconds, timerMode, selectedTaskId]);

  // Task Actions
  const handleOpenNewTask = () => {
    setCurrentTask(null);
    setModalDefaultDate('');
    setIsModalOpen(true);
  };

  const handleOpenNewTaskWithDate = (dateStr) => {
    setCurrentTask(null);
    setModalDefaultDate(dateStr);
    setIsModalOpen(true);
  };

  const handleTaskClick = (task) => {
    setCurrentTask(task);
    setModalDefaultDate('');
    setIsModalOpen(true);
  };

  const handleSaveTask = (savedTask) => {
    const exists = tasks.some((t) => t.id === savedTask.id);
    if (exists) {
      setTasks(tasks.map((t) => (t.id === savedTask.id ? savedTask : t)));
      addToast(`Tugas "${savedTask.title}" diperbarui`, 'success');
    } else {
      setTasks([savedTask, ...tasks]);
      addToast(`Tugas baru berhasil dibuat`, 'success');
    }
    if (savedTask.status === 'done') {
      triggerCelebration('task-done');
    }

    // Cloud Task Sync
    if (isSupabaseConfigured && currentUser?.isCloud) {
      setCloudSyncStatus('syncing');
      cloudUpsertTask(savedTask, activeWorkspaceId)
        .then(() => setCloudSyncStatus('synced'))
        .catch(() => setCloudSyncStatus('offline'));
    }
  };

  const handleDeleteTask = (taskId) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    if (isSupabaseConfigured && currentUser?.isCloud) {
      setCloudSyncStatus('syncing');
      cloudDeleteTask(taskId)
        .then(() => setCloudSyncStatus('synced'))
        .catch(() => setCloudSyncStatus('offline'));
    }

    addToast(`Tugas "${target.title}" telah dihapus`, 'info', {
      duration: 6500,
      action: {
        label: 'Urungkan',
        onClick: () => {
          setTasks((prev) => [target, ...prev]);
          if (isSupabaseConfigured && currentUser?.isCloud) {
            cloudUpsertTask(target, activeWorkspaceId);
          }
          addToast(`Tugas "${target.title}" berhasil dipulihkan! ↩️`, 'success');
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate?.([30, 20, 30]);
          }
        }
      }
    });
  };

  const handleQuickAddTask = (columnId, title) => {
    const newTask = {
      id: `task-${Date.now()}`,
      projectId: activeSpaceId !== 'all' ? activeSpaceId : 'mobile-app',
      title,
      description: '',
      status: columnId,
      priority: 'normal',
      dueDate: new Date().toISOString().split('T')[0],
      tags: [],
      subtasks: [],
      activityLog: [
        createActivityLog('Tugas ditambahkan lewat quick card')
      ]
    };
    setTasks((prev) => [...prev, newTask]);
    addToast(`Kartu "${title}" ditambahkan`, 'success');

    if (isSupabaseConfigured && currentUser?.isCloud) {
      setCloudSyncStatus('syncing');
      cloudUpsertTask(newTask, activeWorkspaceId)
        .then(() => setCloudSyncStatus('synced'))
        .catch(() => setCloudSyncStatus('offline'));
    }
  };

  const handleToggleSubtaskInline = (taskId, subtaskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubtasks = (t.subtasks || []).map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const newlyCompleted = updatedSubtasks.find((st) => st.id === subtaskId)?.completed;
        if (newlyCompleted) {
          if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(35);
          addToast('Subtask diselesaikan ✓', 'success');
        }
        const updatedTask = {
          ...t,
          subtasks: updatedSubtasks
        };

        if (isSupabaseConfigured && currentUser?.isCloud) {
          cloudUpsertTask(updatedTask, activeWorkspaceId);
        }

        return updatedTask;
      })
    );
  };

  // Column CRUD Handlers
  const handleAddColumn = (newCol) => {
    setColumns((prev) => [...prev, newCol]);
    addToast(`Kolom baru "${newCol.title}" ditambahkan`, 'success');
  };

  const handleUpdateColumn = (columnId, newAttrs) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, ...newAttrs } : col))
    );
    addToast(`Kolom "${newAttrs.title || 'kolom'}" berhasil diperbarui`, 'success');
  };

  const handleDeleteColumn = (columnId) => {
    if (columns.length <= 1) {
      addToast('Minimal harus ada 1 kolom di board!', 'warning');
      return;
    }
    const colToDelete = columns.find((c) => c.id === columnId);
    const targetCol = columns.find((c) => c.id !== columnId);
    // Move all tasks in this column to targetCol
    setTasks((prev) =>
      prev.map((t) => (t.status === columnId ? { ...t, status: targetCol.id } : t))
    );
    setColumns((prev) => prev.filter((c) => c.id !== columnId));
    addToast(`Kolom "${colToDelete?.title}" dihapus. Tugas dialihkan ke "${targetCol.title}"`, 'info');
  };

  const handleMoveColumn = (columnId, direction) => {
    const index = columns.findIndex((c) => c.id === columnId);
    if (index === -1) return;
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= columns.length) return;
    const newCols = [...columns];
    const temp = newCols[index];
    newCols[index] = newCols[newIndex];
    newCols[newIndex] = temp;
    setColumns(newCols);
  };

  // Project / Space CRUD Handlers
  const handleOpenEditSpace = (space = null) => {
    setEditingSpace(space);
    setIsEditSpaceModalOpen(true);
  };

  const handleAddSpace = (newSpace) => {
    setSpaces((prev) => [...prev, newSpace]);
    addToast(`Proyek "${newSpace.name}" berhasil dibuat`, 'success');
  };

  const handleSaveSpace = (spaceData) => {
    const exists = spaces.some((s) => s.id === spaceData.id);
    if (exists) {
      setSpaces((prev) => prev.map((s) => (s.id === spaceData.id ? { ...s, ...spaceData } : s)));
      addToast(`Proyek "${spaceData.name}" berhasil diperbarui`, 'success');
    } else {
      setSpaces((prev) => [...prev, spaceData]);
      addToast(`Proyek "${spaceData.name}" berhasil dibuat`, 'success');
    }
  };

  const handleRequestDeleteSpace = (spaceId) => {
    if (spaceId === 'all') {
      addToast('Proyek utama "Semua Proyek" tidak dapat dihapus', 'warning');
      return;
    }
    const targetSpace = spaces.find((s) => s.id === spaceId);
    if (!targetSpace) return;
    setDeleteSpaceConfirm({
      isOpen: true,
      space: targetSpace
    });
  };

  const handleConfirmDeleteSpace = () => {
    const targetSpace = deleteSpaceConfirm.space;
    if (!targetSpace) return;

    setSpaces((prev) => prev.filter((s) => s.id !== targetSpace.id));
    setTasks((prev) => prev.filter((t) => t.projectId !== targetSpace.id));
    if (activeSpaceId === targetSpace.id) {
      setActiveSpaceId('all');
    }
    addToast(`Proyek "${targetSpace.name}" dan seluruh tugasnya telah dihapus`, 'info');
    setDeleteSpaceConfirm({ isOpen: false, space: null });
    setIsEditSpaceModalOpen(false);
  };

  const handleInviteMember = (newMember) => {
    setMembers((prev) => [...prev, newMember]);
    addToast(`Anggota tim "${newMember.name}" (${newMember.role}) berhasil diundang!`, 'success');
  };

  const handleUpdateMember = (updatedMember) => {
    setMembers((prev) => prev.map((m) => (m.id === updatedMember.id ? updatedMember : m)));
    addToast(`Data profil "${updatedMember.name}" berhasil diperbarui`, 'success');
  };

  const handleDeleteMember = (memberId, reassignToId = '') => {
    const memberToDelete = members.find((m) => m.id === memberId);
    if (!memberToDelete) return;
    if (memberToDelete.id === 'kurnia' || memberToDelete.isOwner) {
      addToast('Owner workspace tidak dapat dihapus!', 'warning');
      return;
    }

    if (reassignToId) {
      const target = members.find((m) => m.id === reassignToId);
      setTasks((prev) =>
        prev.map((t) =>
          t.assignee === memberToDelete.name || t.assigneeId === memberToDelete.id || t.assignee === memberToDelete.id
            ? { ...t, assignee: target ? target.name : '', assigneeId: target ? target.id : '' }
            : t
        )
      );
    } else {
      setTasks((prev) =>
        prev.map((t) =>
          t.assignee === memberToDelete.name || t.assigneeId === memberToDelete.id || t.assignee === memberToDelete.id
            ? { ...t, assignee: '', assigneeId: '' }
            : t
        )
      );
    }

    setMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (selectedMemberForDetail && selectedMemberForDetail.id === memberId) {
      setSelectedMemberForDetail(null);
    }
    addToast(`Anggota "${memberToDelete.name}" berhasil dihapus dari tim`, 'info');
  };

  const handleAddChannel = (newChannel) => {
    if (!channels.includes(newChannel)) {
      setChannels((prev) => [...prev, newChannel]);
      addToast(`Channel #${newChannel} berhasil dibuat!`, 'success');
      setChannelChat({ isOpen: true, channelName: newChannel });
    }
  };

  const handleSelectPlan = (planId) => {
    setCurrentPlan(planId);
    setIsUpgradeModalOpen(false);
    addToast(`Workspace berhasil di-upgrade ke paket ${planId.toUpperCase()}! 🚀`, 'success');
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
  };

  // Filtered & Sorted Tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    if (activeSpaceId !== 'all') {
      result = result.filter((t) => t.projectId === activeSpaceId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    if (tagFilter !== 'all') {
      result = result.filter((t) => t.tags?.includes(tagFilter));
    }

    if (assigneeFilter !== 'all') {
      result = result.filter((t) => t.assignee === assigneeFilter || t.assigneeId === assigneeFilter);
    }

    // Quick Preset Filter
    if (quickFilter === 'my-tasks') {
      result = result.filter(
        (t) =>
          t.assignee === 'kurnia' ||
          t.assigneeId === 'kurnia' ||
          t.assignee?.toLowerCase().includes('kurnia')
      );
    } else if (quickFilter === 'overdue') {
      const today = new Date().toISOString().split('T')[0];
      result = result.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'done');
    } else if (quickFilter === 'high-priority') {
      result = result.filter((t) => t.priority === 'urgent' || t.priority === 'high');
    } else if (quickFilter === 'this-week') {
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      result = result.filter((t) => t.dueDate && t.dueDate >= today && t.dueDate <= nextWeekStr);
    }

    if (sortBy === 'due-asc') {
      result.sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
    } else if (sortBy === 'due-desc') {
      result.sort((a, b) => (b.dueDate || '').localeCompare(a.dueDate || ''));
    } else if (sortBy === 'priority') {
      const pOrder = { urgent: 1, high: 2, normal: 3, low: 4 };
      result.sort((a, b) => (pOrder[a.priority] || 9) - (pOrder[b.priority] || 9));
    } else if (sortBy === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [tasks, activeSpaceId, searchQuery, priorityFilter, tagFilter, assigneeFilter, sortBy, quickFilter]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      searchQuery.trim() ||
      priorityFilter !== 'all' ||
      tagFilter !== 'all' ||
      assigneeFilter !== 'all' ||
      quickFilter !== 'all'
    );
  }, [searchQuery, priorityFilter, tagFilter, assigneeFilter, quickFilter]);

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setTagFilter('all');
    setAssigneeFilter('all');
    setQuickFilter('all');
    setSortBy('default');
    addToast('Semua filter berhasil dibersihkan', 'info');
  };

  const activeSpaceObj = useMemo(() => {
    return (
      spaces.find((s) => s.id === activeSpaceId) || {
        id: 'all',
        name: 'Semua Proyek (All Spaces)',
        color: '#6366f1'
      }
    );
  }, [spaces, activeSpaceId]);

  const activeSpaceTasksCount = useMemo(() => {
    return tasks.filter((t) => activeSpaceId === 'all' || t.projectId === activeSpaceId).length;
  }, [tasks, activeSpaceId]);

  const quickFilterCounts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    const base = tasks.filter((t) => activeSpaceId === 'all' || t.projectId === activeSpaceId);

    return {
      all: base.length,
      myTasks: base.filter(
        (t) =>
          t.assignee === 'kurnia' ||
          t.assigneeId === 'kurnia' ||
          t.assignee?.toLowerCase().includes('kurnia')
      ).length,
      overdue: base.filter((t) => t.dueDate && t.dueDate < today && t.status !== 'done').length,
      highPriority: base.filter((t) => t.priority === 'urgent' || t.priority === 'high').length,
      thisWeek: base.filter((t) => t.dueDate && t.dueDate >= today && t.dueDate <= nextWeekStr).length
    };
  }, [tasks, activeSpaceId]);

  const handleUpdateTaskStatus = (taskId, newStatus) => {
    const colObj = columns.find((c) => c.id === newStatus);
    const targetTask = tasks.find((t) => t.id === taskId);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: newStatus,
              activityLog: [
                createActivityLog(`Status diubah ke "${colObj ? colObj.title : newStatus}" via aksi cepat`),
                ...(t.activityLog || [])
              ]
            }
          : t
      )
    );

    if (isSupabaseConfigured && currentUser?.isCloud && targetTask) {
      setCloudSyncStatus('syncing');
      cloudUpsertTask({ ...targetTask, status: newStatus }, activeWorkspaceId)
        .then(() => setCloudSyncStatus('synced'))
        .catch(() => setCloudSyncStatus('offline'));
    }

    addToast(`Status tugas diubah ke "${colObj ? colObj.title : newStatus}"`, 'success');
    if (newStatus === 'done') {
      triggerCelebration('task-done');
    }
  };

  // If user is not authenticated, render the dedicated modern AuthPage
  if (!currentUser) {
    return (
      <div data-theme={theme}>
        <AuthPage onLoginSuccess={handleLoginSuccess} />
        <Toast toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  return (
    <div className="flow-app-shell" data-theme={theme}>
      {/* Mobile Drawer Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="flow-mobile-backdrop"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Tutup menu navigasi"
        />
      )}

      {/* 1. Unified FlowWork Modern Sidebar */}
      <FlowSidebar
        activeModule={activeModule}
        setActiveModule={(mod) => {
          handleNavigateModule(mod);
          setIsMobileSidebarOpen(false);
        }}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        workspaceName={workspaceName}
        setWorkspaceName={setWorkspaceName}
        spaces={spaces}
        activeSpaceId={activeSpaceId}
        setActiveSpaceId={setActiveSpaceId}
        onAddSpace={handleAddSpace}
        onOpenEditSpace={handleOpenEditSpace}
        channels={channels}
        onOpenChannel={(ch) => setChannelChat({ isOpen: true, channelName: ch })}
        onAddChannel={handleAddChannel}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        onOpenUpgradeModal={() => setIsUpgradeModalOpen(true)}
        currentPlan={currentPlan}
        notes={notes}
        setNotes={setNotes}
        onConvertNoteToTask={(noteData) => {
          const newTask = {
            id: `task-${Date.now()}`,
            projectId: activeSpaceId !== 'all' ? activeSpaceId : (spaces[0]?.id || 'mobile-app'),
            title: noteData.title || 'Catatan Baru',
            description: noteData.description || '',
            status: 'todo',
            priority: noteData.priority || 'normal',
            dueDate: new Date().toISOString().split('T')[0],
            tags: ['from-scratchpad'],
            subtasks: [],
            activityLog: [
              createActivityLog('Dikonversi dari Smart Scratchpad')
            ]
          };
          setTasks((prev) => [newTask, ...prev]);
        }}
        onAddToast={addToast}
      />

      {/* 2. Main Executive Workspace Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', minWidth: 0 }}>
        {/* Top Command Center Header Bar */}
        <FlowHeader
          workspaceName={workspaceName}
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          onSwitchWorkspace={handleSwitchWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
          setWorkspaceName={setWorkspaceName}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenFlowPilot={() => handleNavigateModule('brain')}
          onOpenNewTask={handleOpenNewTask}
          theme={theme}
          toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          pomodoroMinutes={minutes}
          pomodoroSeconds={seconds}
          isTimerRunning={isRunning}
          onOpenPomodoro={() => {
            handleNavigateModule('spaces');
            setSpaceSubView('pomodoro');
          }}
          onOpenInviteModal={() => setIsInviteModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onExportData={handleExportWorkspaceData}
          onOpenExportModal={handleOpenExportModal}
          onOpenImportModal={handleOpenImportModal}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          onShowToast={addToast}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onNotificationClick={(taskId) => {
            const t = tasks.find((x) => x.id === taskId);
            if (t) handleTaskClick(t);
          }}
          cloudSyncStatus={cloudSyncStatus}
          onOpenEditWorkspace={handleOpenEditWorkspace}
          onOpenDeleteWorkspace={handleRequestDeleteWorkspace}
        />

        {/* Dynamic Module Content */}
        {activeModule === 'home' && (
          <InboxView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onOpenInviteModal={() => setIsInviteModalOpen(true)}
          />
        )}

        {activeModule === 'brain' && (
          <FlowPilotView
            tasks={tasks}
            onAddTask={(task) => {
              setTasks((prev) => [task, ...prev]);
            }}
            onAddToast={addToast}
          />
        )}

        {activeModule === 'planner' && (
          <CalendarView
            tasks={filteredAndSortedTasks}
            setTasks={setTasks}
            onTaskClick={handleTaskClick}
            onOpenNewTaskWithDate={handleOpenNewTaskWithDate}
            members={members}
            spaces={spaces}
            columns={columns}
            onAddToast={addToast}
          />
        )}

        {activeModule === 'teams' && (
          <TeamsHubView
            tasks={tasks}
            members={members}
            onOpenInviteModal={() => setIsInviteModalOpen(true)}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            onSelectMember={(m) => setSelectedMemberForDetail(m)}
            onOpenChat={(ch) => setChannelChat({ isOpen: true, channelName: ch })}
          />
        )}

        {activeModule === 'dashboards' && (
          <DashboardsHubView
            tasks={tasks}
            columns={columns}
            members={members}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onTaskClick={handleTaskClick}
            onOpenNewTask={handleOpenNewTask}
            onShowToast={addToast}
          />
        )}

        {activeModule === 'habits' && (
          <HabitTrackerView
            habits={habits}
            onUpdateHabits={handleUpdateHabits}
            onAddToast={addToast}
            currentUser={currentUser}
          />
        )}

        {activeModule === 'second-brain' && (
          <SecondBrainView
            notes={secondBrainNotes}
            onUpdateNotes={handleUpdateSecondBrainNotes}
            onConvertToTask={handleConvertNoteToTask}
            onAddToast={addToast}
            onOpenFlowPilot={() => handleNavigateModule('brain')}
          />
        )}

        {activeModule === 'spaces' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Active Project Control Header Bar */}
            <div className="project-control-bar">
              <div className="project-control-title">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: activeSpaceObj.color || 'var(--flow-primary)'
                  }}
                />
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--flow-text-main)' }}>
                  {activeSpaceObj.name}
                </h2>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: 'var(--flow-bg-elevated)',
                    color: 'var(--flow-text-muted)',
                    fontWeight: 600
                  }}
                >
                  {activeSpaceTasksCount} Tugas
                </span>
              </div>

              <div className="project-control-actions">
                {activeSpaceId !== 'all' ? (
                  <>
                    <button
                      type="button"
                      className="tab-btn"
                      style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                      onClick={() => handleOpenEditSpace(activeSpaceObj)}
                      title="Edit nama dan warna proyek"
                    >
                      <Edit2 size={13} />
                      <span>Edit Proyek</span>
                    </button>
                    <button
                      type="button"
                      className="tab-btn"
                      style={{ fontSize: '0.78rem', padding: '5px 10px', color: 'var(--flow-accent-rose)' }}
                      onClick={() => handleRequestDeleteSpace(activeSpaceId)}
                      title="Hapus proyek ini"
                    >
                      <Trash2 size={13} />
                      <span>Hapus Proyek</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="tab-btn"
                    style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                    onClick={() => handleOpenEditSpace(null)}
                    title="Tambah proyek baru"
                  >
                    <Plus size={13} />
                    <span>Buat Proyek Baru</span>
                  </button>
                )}

                <button
                  type="button"
                  className="tab-btn"
                  style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                  onClick={handleOpenExportModal}
                  title="Ekspor CSV atau Cetak Laporan Progres"
                >
                  <Download size={13} />
                  <span>Ekspor</span>
                </button>

                <button
                  type="button"
                  className="tab-btn"
                  style={{ fontSize: '0.78rem', padding: '5px 10px' }}
                  onClick={handleOpenImportModal}
                  title="Impor Tugas CSV atau Pulihkan Cadangan JSON"
                >
                  <Upload size={13} />
                  <span>Impor</span>
                </button>

                <button
                  type="button"
                  className="flow-add-task-btn"
                  style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                  onClick={handleOpenNewTask}
                  title="Buat tugas baru di proyek ini"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  <span>Tugas Baru</span>
                </button>
              </div>
            </div>

            {/* Quick Filter Chips (Preset 1-Klik) */}
            <div
              className="quick-filter-container"
              style={{
                padding: '6px 18px',
                background: 'var(--flow-bg-base)',
                borderBottom: '1px solid var(--flow-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                overflowX: 'auto'
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--flow-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                Filter Cepat:
              </span>
              <button
                type="button"
                className={`quick-filter-chip ${quickFilter === 'all' ? 'active' : ''}`}
                onClick={() => setQuickFilter('all')}
              >
                Semua
                <span className="chip-badge">{quickFilterCounts.all}</span>
              </button>
              <button
                type="button"
                className={`quick-filter-chip ${quickFilter === 'my-tasks' ? 'active' : ''}`}
                onClick={() => setQuickFilter('my-tasks')}
              >
                👤 Tugas Saya
                <span className="chip-badge">{quickFilterCounts.myTasks}</span>
              </button>
              <button
                type="button"
                className={`quick-filter-chip ${quickFilter === 'overdue' ? 'active' : ''}`}
                onClick={() => setQuickFilter('overdue')}
                style={quickFilterCounts.overdue > 0 && quickFilter !== 'overdue' ? { color: 'var(--flow-accent-rose)', borderColor: 'rgba(244, 63, 94, 0.4)' } : {}}
              >
                ⚠️ Overdue
                {quickFilterCounts.overdue > 0 && (
                  <span className="chip-badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--flow-accent-rose)' }}>
                    {quickFilterCounts.overdue}
                  </span>
                )}
              </button>
              <button
                type="button"
                className={`quick-filter-chip ${quickFilter === 'high-priority' ? 'active' : ''}`}
                onClick={() => setQuickFilter('high-priority')}
              >
                🔥 Prioritas Tinggi
                <span className="chip-badge">{quickFilterCounts.highPriority}</span>
              </button>
              <button
                type="button"
                className={`quick-filter-chip ${quickFilter === 'this-week' ? 'active' : ''}`}
                onClick={() => setQuickFilter('this-week')}
              >
                📅 Minggu Ini
                <span className="chip-badge">{quickFilterCounts.thisWeek}</span>
              </button>
            </div>

            {/* View Tabs & Advanced Filters */}
            <div className="view-tabs-bar">
              <div className="tabs-group">
                <button
                  className={`tab-btn ${spaceSubView === 'board' ? 'active' : ''}`}
                  onClick={() => setSpaceSubView('board')}
                >
                  <KanbanSquare size={15} />
                  <span>Board</span>
                </button>
                <button
                  className={`tab-btn ${spaceSubView === 'list' ? 'active' : ''}`}
                  onClick={() => setSpaceSubView('list')}
                >
                  <ListTodo size={15} />
                  <span>List / Table</span>
                </button>
                <button
                  className={`tab-btn ${spaceSubView === 'calendar' ? 'active' : ''}`}
                  onClick={() => setSpaceSubView('calendar')}
                >
                  <Calendar size={15} />
                  <span>Calendar</span>
                </button>
                <button
                  className={`tab-btn ${spaceSubView === 'pomodoro' ? 'active' : ''}`}
                  onClick={() => setSpaceSubView('pomodoro')}
                >
                  <Timer size={15} />
                  <span>Focus Timer</span>
                </button>
                <button
                  className={`tab-btn ${spaceSubView === 'analytics' ? 'active' : ''}`}
                  onClick={() => setSpaceSubView('analytics')}
                >
                  <BarChart3 size={15} />
                  <span>Analytics</span>
                </button>
              </div>

              {/* Advanced Filter Suite */}
              <div className="view-filters-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Tag size={13} color="var(--cu-text-muted)" />
                  <select
                    className="filter-select"
                    value={tagFilter}
                    onChange={(e) => setTagFilter(e.target.value)}
                  >
                    <option value="all">Semua Tag</option>
                    {INITIAL_TAGS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={13} color="var(--cu-text-muted)" />
                  <select
                    className="filter-select"
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                  >
                    <option value="all">Semua Anggota</option>
                    {(members && members.length > 0 ? members : INITIAL_MEMBERS).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name.split(' ')[0]}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Filter size={13} color="var(--cu-text-muted)" />
                  <select
                    className="filter-select"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="all">Semua Prioritas</option>
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟠 High</option>
                    <option value="normal">🔵 Normal</option>
                    <option value="low">⚪ Low</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ArrowUpDown size={13} color="var(--cu-text-muted)" />
                  <select
                    className="filter-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="default">Urutkan: Bawaan</option>
                    <option value="due-asc">Deadline Terdekat</option>
                    <option value="due-desc">Deadline Terjauh</option>
                    <option value="priority">Prioritas Tertinggi</option>
                    <option value="title-asc">Nama Tugas (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Empty Filter Banner if filters are active and no tasks match */}
            {hasActiveFilters && filteredAndSortedTasks.length === 0 && (
              <div className="flow-empty-filter-banner">
                <div className="flow-empty-filter-info">
                  <Filter size={16} color="var(--flow-primary)" />
                  <span>
                    Tidak ada tugas yang cocok dengan filter aktif
                    {searchQuery ? ` ("${searchQuery}")` : ''}
                  </span>
                </div>
                <div className="flow-empty-filter-actions">
                  <button type="button" className="flow-reset-filter-btn" onClick={handleResetAllFilters}>
                    Reset Semua Filter
                  </button>
                  <button
                    type="button"
                    className="flow-add-task-btn"
                    style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                    onClick={handleOpenNewTask}
                  >
                    <Plus size={13} /> + Tugas Baru
                  </button>
                </div>
              </div>
            )}

            {/* Sub-view Content */}
            {spaceSubView === 'board' && (
              <KanbanBoard
                columns={columns}
                tasks={filteredAndSortedTasks}
                setTasks={setTasks}
                onTaskClick={handleTaskClick}
                onQuickAddTask={handleQuickAddTask}
                onToggleSubtaskInline={handleToggleSubtaskInline}
                onAddColumn={handleAddColumn}
                onUpdateColumn={handleUpdateColumn}
                onDeleteColumn={handleDeleteColumn}
                onMoveColumn={handleMoveColumn}
                onDeleteTask={handleDeleteTask}
                onUpdateTaskStatus={(taskId, newStatus) => {
                  const colObj = columns.find((c) => c.id === newStatus);
                  setTasks((prev) =>
                    prev.map((t) =>
                      t.id === taskId
                        ? {
                            ...t,
                            status: newStatus,
                            activityLog: [
                              createActivityLog(`Status diubah ke "${colObj ? colObj.title : newStatus}" via aksi cepat`),
                              ...(t.activityLog || [])
                            ]
                          }
                        : t
                    )
                  );
                  addToast(`Status tugas diubah ke "${colObj ? colObj.title : newStatus}"`, 'success');
                  if (newStatus === 'done') {
                    triggerCelebration('task-done');
                  }
                }}
                onTaskMoveSuccess={(title, colName) => {
                  addToast(`"${title}" dipindahkan ke ${colName}`, 'info');
                  if (colName && (colName.toLowerCase().includes('selesai') || colName.toLowerCase().includes('done'))) {
                    triggerCelebration('task-done');
                  }
                }}
                members={members}
                selectedTaskIds={selectedTaskIds}
                onToggleSelectTask={handleToggleSelectTask}
                searchQuery={searchQuery}
              />
            )}

            {spaceSubView === 'list' && (
              <ListView
                columns={columns}
                tasks={filteredAndSortedTasks}
                setTasks={setTasks}
                onTaskClick={handleTaskClick}
                onQuickAddTask={handleQuickAddTask}
                onDeleteTask={handleDeleteTask}
                onResetFilters={handleResetAllFilters}
                hasActiveFilters={hasActiveFilters}
                onOpenNewTask={handleOpenNewTask}
                members={members}
                selectedTaskIds={selectedTaskIds}
                onToggleSelectTask={handleToggleSelectTask}
                searchQuery={searchQuery}
              />
            )}

            {spaceSubView === 'calendar' && (
              <CalendarView
                tasks={filteredAndSortedTasks}
                setTasks={setTasks}
                onTaskClick={handleTaskClick}
                onOpenNewTaskWithDate={handleOpenNewTaskWithDate}
                members={members}
                spaces={spaces}
                columns={columns}
                onAddToast={addToast}
              />
            )}

            {spaceSubView === 'pomodoro' && (
              <PomodoroTimer
                minutes={minutes}
                seconds={seconds}
                isRunning={isRunning}
                timerMode={timerMode}
                setTimerMode={(m) => {
                  setTimerMode(m);
                  setIsRunning(false);
                  if (m === 'focus') setMinutes(25);
                  else if (m === 'shortBreak') setMinutes(5);
                  else if (m === 'longBreak') setMinutes(15);
                  setSeconds(0);
                }}
                toggleTimer={() => setIsRunning(!isRunning)}
                resetTimer={() => {
                  setIsRunning(false);
                  if (timerMode === 'focus') setMinutes(25);
                  else if (timerMode === 'shortBreak') setMinutes(5);
                  else if (timerMode === 'longBreak') setMinutes(15);
                  setSeconds(0);
                }}
                tasks={filteredAndSortedTasks}
                selectedTaskId={selectedTaskId}
                setSelectedTaskId={setSelectedTaskId}
                completedSessions={completedSessions}
              />
            )}

            {spaceSubView === 'analytics' && (
              <DashboardsHubView
                tasks={filteredAndSortedTasks}
                columns={columns}
                members={members}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onTaskClick={handleTaskClick}
                onOpenNewTask={handleOpenNewTask}
                onShowToast={addToast}
              />
            )}
          </div>
        )}
      </div>

      {/* Task Modal (Create & Edit) */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={currentTask}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
        columns={columns}
        spaces={spaces}
        defaultDate={modalDefaultDate}
        defaultProjectId={activeSpaceId}
        members={members}
        allTasks={tasks}
        onAddToast={addToast}
      />

      {/* Edit & Create Space Modal */}
      <EditSpaceModal
        isOpen={isEditSpaceModalOpen}
        onClose={() => setIsEditSpaceModalOpen(false)}
        space={editingSpace}
        onSave={handleSaveSpace}
        onDelete={handleRequestDeleteSpace}
      />

      {/* Confirm Delete Space Modal */}
      <ConfirmModal
        isOpen={deleteSpaceConfirm.isOpen}
        onClose={() => setDeleteSpaceConfirm({ isOpen: false, space: null })}
        onConfirm={handleConfirmDeleteSpace}
        title="Hapus Proyek?"
        message={`Apakah Anda yakin ingin menghapus proyek "${deleteSpaceConfirm.space?.name}"? Seluruh tugas di dalamnya juga akan dihapus secara permanen.`}
        confirmText="Hapus Proyek"
        confirmVariant="danger"
      />

      {/* Invite Team Member Modal */}
      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteMember={handleInviteMember}
      />

      {/* Interactive Channel Chat Modal */}
      <ChannelChatModal
        channelName={channelChat.channelName}
        isOpen={channelChat.isOpen}
        onClose={() => setChannelChat({ isOpen: false, channelName: '' })}
      />

      {/* Upgrade Workspace Plan Modal */}
      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlan={currentPlan}
        onSelectPlan={handleSelectPlan}
      />

      {/* Team Member Workload & Profile Detail Modal */}
      <MemberDetailModal
        isOpen={Boolean(selectedMemberForDetail)}
        onClose={() => setSelectedMemberForDetail(null)}
        member={selectedMemberForDetail}
        tasks={tasks}
        onSelectTask={handleTaskClick}
        onStartChat={() => setChannelChat({ isOpen: true, channelName: 'general' })}
        onAssignTask={(task) => {
          setTasks((prev) => [task, ...prev]);
          addToast(`Tugas "${task.title}" berhasil ditugaskan ke ${selectedMemberForDetail?.name || 'anggota tim'}`, 'success');
        }}
      />

      {/* Global Command Palette (Ctrl + K / Cmd + K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        members={members}
        activeModule={activeModule}
        setActiveModule={handleNavigateModule}
        theme={theme}
        toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onOpenTaskModal={() => {
          setCurrentTask(null);
          setModalDefaultDate('');
          setIsModalOpen(true);
        }}
        onOpenInviteModal={() => setIsInviteModalOpen(true)}
        onOpenPomodoro={() => {
          handleNavigateModule('spaces');
          setSpaceSubView('pomodoro');
        }}
        onOpenChannel={(ch) => setChannelChat({ isOpen: true, channelName: ch })}
        onTaskClick={handleTaskClick}
        onExportData={handleOpenExportModal}
        onShowToast={addToast}
      />

      {/* Floating Multi-Select Bulk Action Bar */}
      <BulkActionBar
        selectedTaskIds={selectedTaskIds}
        onClearSelection={handleClearSelection}
        onSelectAll={handleSelectAllTasks}
        totalTasksCount={filteredAndSortedTasks.length}
        columns={columns}
        members={members}
        onBatchUpdateStatus={handleBatchUpdateStatus}
        onBatchUpdateAssignee={handleBatchUpdateAssignee}
        onBatchUpdatePriority={handleBatchUpdatePriority}
        onBatchDelete={handleBatchDelete}
      />

      {/* Data Center: Export & Import / Restore Modal */}
      <ExportModal
        isOpen={dataModalConfig.isOpen}
        onClose={() => setDataModalConfig((prev) => ({ ...prev, isOpen: false }))}
        initialTab={dataModalConfig.tab}
        workspaceName={workspaceName}
        tasks={tasks}
        columns={columns}
        members={members}
        spaces={spaces}
        activeSpaceId={activeSpaceId}
        onExportJSON={handleExportWorkspaceData}
        onExportCSV={handleExportCSV}
        onPrintReport={handlePrintSprintReport}
        onImportTasks={handleImportTasks}
        onRestoreWorkspace={handleRestoreWorkspace}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* User Profile & Account Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUserProfile}
        onShowToast={addToast}
      />

      {/* Edit / Create Workspace Modal */}
      <EditWorkspaceModal
        isOpen={isEditWorkspaceModalOpen}
        onClose={() => {
          setIsEditWorkspaceModalOpen(false);
          setEditingWorkspace(null);
        }}
        workspace={editingWorkspace}
        onSave={handleSaveWorkspace}
        onDelete={(ws) => {
          setIsEditWorkspaceModalOpen(false);
          handleRequestDeleteWorkspace(ws);
        }}
        canDelete={workspaces.length > 1}
      />

      {/* Confirm Delete Workspace Modal */}
      <ConfirmModal
        isOpen={deleteWorkspaceConfirm.isOpen}
        onClose={() => setDeleteWorkspaceConfirm({ isOpen: false, workspace: null })}
        onConfirm={handleConfirmDeleteWorkspace}
        title={`Hapus Ruang Kerja "${deleteWorkspaceConfirm.workspace?.name || ''}"?`}
        message={`Apakah Anda yakin ingin menghapus ruang kerja "${deleteWorkspaceConfirm.workspace?.name || ''}"? Seluruh daftar tugas dan proyek di ruang kerja ini akan dihapus. Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus Ruang Kerja"
        confirmVariant="danger"
      />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Modern Mobile Bottom Navigation Bar */}
      <FlowMobileBottomNav
        activeModule={activeModule}
        setActiveModule={(mod) => {
          handleNavigateModule(mod);
          setIsMobileSidebarOpen(false);
        }}
        onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
      />
    </div>
  );
}
