import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id') &&
  supabaseUrl.startsWith('https://')
);

// Fallback dummy client if credentials are missing during local dev
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

/**
 * Format Supabase User into FlowWork standard user session object
 */
export function formatSupabaseUser(user, session) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  const name = meta.name || user.email?.split('@')[0] || 'Pengguna';
  const role = meta.role || meta.category || 'Mahasiswa / Pelajar';
  const category = meta.category || 'Mahasiswa / Pelajar';
  const avatar = meta.avatar || name.slice(0, 2).toUpperCase();
  const avatarColor = meta.avatarColor || '#6366f1';

  return {
    id: user.id,
    name: name,
    email: user.email,
    role: role,
    category: category,
    avatar: avatar,
    avatarColor: avatarColor,
    isCloud: true,
    token: session?.access_token || 'cloud_' + Date.now(),
    loginAt: new Date().toISOString()
  };
}

/**
 * Sign up a new user with email, password, and metadata
 */
export async function cloudSignUp(email, password, metaData = {}) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password: password,
    options: {
      data: {
        name: metaData.name || '',
        category: metaData.category || 'Mahasiswa / Pelajar',
        role: metaData.category || 'Mahasiswa / Pelajar',
        avatar: metaData.avatar || '',
        avatarColor: metaData.avatarColor || '#6366f1'
      }
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in user with email and password
 */
export async function cloudSignIn(email, password) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password: password
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in with Google OAuth
 */
export async function cloudSignInWithGoogle() {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
    }
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out current session
 */
export async function cloudSignOut() {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Error during cloud signOut:', err);
  }
}

/**
 * Send password reset email
 */
export async function cloudResetPassword(email) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
  const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
  });

  if (error) throw error;
  return data;
}

/**
 * Update user password
 */
export async function cloudUpdatePassword(newPassword) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
  return data;
}

/**
 * Update user profile metadata
 */
export async function cloudUpdateProfile(updates) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
  const { data, error } = await supabase.auth.updateUser({
    data: updates
  });

  if (error) throw error;
  return data;
}

/**
 * Fetch user's tasks from Supabase cloud for a specific workspace
 */
export async function cloudFetchTasks(workspaceId = 'ws-1') {
  if (!supabase) return [];
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Notice fetching cloud tasks:', error.message || error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      projectId: row.workspace_id,
      title: row.title,
      description: row.description || '',
      status: row.status || 'todo',
      priority: row.priority || 'medium',
      dueDate: row.due_date || '',
      tags: Array.isArray(row.tags) ? row.tags : [],
      assignee: row.assignee || '',
      subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
      createdAt: row.created_at
    }));
  } catch (err) {
    console.warn('cloudFetchTasks exception:', err);
    return [];
  }
}

/**
 * Upsert a single task to Supabase cloud
 */
export async function cloudUpsertTask(task, workspaceId = 'ws-1') {
  if (!supabase || !task) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const payload = {
      id: task.id,
      user_id: user.id,
      workspace_id: workspaceId || task.projectId || 'ws-1',
      title: task.title,
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      due_date: task.dueDate || null,
      tags: task.tags || [],
      assignee: task.assignee || '',
      subtasks: task.subtasks || [],
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('tasks')
      .upsert(payload, { onConflict: 'id' })
      .select();

    if (error) {
      console.warn('Notice upserting cloud task:', error.message || error);
      return null;
    }
    return data?.[0] || null;
  } catch (err) {
    console.warn('cloudUpsertTask exception:', err);
    return null;
  }
}

/**
 * Delete a task from Supabase cloud
 */
export async function cloudDeleteTask(taskId) {
  if (!supabase || !taskId) return false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) {
      console.warn('Notice deleting cloud task:', error.message || error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('cloudDeleteTask exception:', err);
    return false;
  }
}

/**
 * Batch sync tasks to Supabase cloud (used during initial seed, import, or bulk actions)
 */
export async function cloudSyncBatchTasks(tasks = [], workspaceId = 'ws-1') {
  if (!supabase || !tasks.length) return [];
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const payloads = tasks.map((task) => ({
      id: task.id,
      user_id: user.id,
      workspace_id: workspaceId || task.projectId || 'ws-1',
      title: task.title,
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      due_date: task.dueDate || null,
      tags: task.tags || [],
      assignee: task.assignee || '',
      subtasks: task.subtasks || [],
      updated_at: new Date().toISOString()
    }));

    const { data, error } = await supabase
      .from('tasks')
      .upsert(payloads, { onConflict: 'id' });

    if (error) {
      console.warn('Notice batch syncing cloud tasks:', error.message || error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn('cloudSyncBatchTasks exception:', err);
    return [];
  }
}

/**
 * Subscribe to real-time changes in the tasks table
 */
export function cloudSubscribeTasks(workspaceId, onPayload) {
  if (!supabase) return null;
  try {
    const channel = supabase
      .channel(`realtime:tasks:${workspaceId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `workspace_id=eq.${workspaceId}` },
        (payload) => {
          if (typeof onPayload === 'function') onPayload(payload);
        }
      )
      .subscribe();

    return channel;
  } catch (err) {
    console.warn('cloudSubscribeTasks exception:', err);
    return null;
  }
}

/**
 * Delete all tasks associated with a workspace from Supabase cloud
 */
export async function cloudDeleteWorkspaceTasks(workspaceId) {
  if (!supabase || !workspaceId) return false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id);

    if (error) {
      console.warn('Notice deleting workspace cloud tasks:', error.message || error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('cloudDeleteWorkspaceTasks exception:', err);
    return false;
  }
}


