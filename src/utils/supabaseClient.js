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
