-- =========================================================
-- FLOWWORK OS - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- =========================================================
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda
-- (https://supabase.com/dashboard/project/_/sql)

-- 1. Tabel Profil Pengguna (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'Mahasiswa / Pelajar',
  category TEXT DEFAULT 'Mahasiswa / Pelajar',
  avatar TEXT,
  avatar_color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pengguna dapat melihat profilnya sendiri"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Pengguna dapat memperbarui profilnya sendiri"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Pengguna dapat menyisipkan profilnya sendiri"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Trigger Otomatis Pembuatan Profil saat User Mendaftar di Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, category, avatar, avatar_color)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'Mahasiswa / Pelajar'),
    COALESCE(new.raw_user_meta_data->>'category', 'Mahasiswa / Pelajar'),
    COALESCE(new.raw_user_meta_data->>'avatar', upper(substring(COALESCE(new.raw_user_meta_data->>'name', new.email) from 1 for 2))),
    COALESCE(new.raw_user_meta_data->>'avatarColor', '#6366f1')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Tabel Tugas Cloud (Cloud Tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  workspace_id TEXT NOT NULL DEFAULT 'ws-1',
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  due_date TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  assignee TEXT,
  subtasks JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pengguna dapat mengelola tugas miliknya sendiri"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
