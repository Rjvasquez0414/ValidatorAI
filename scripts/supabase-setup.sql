-- =====================================================
-- MVP VALIDATOR & SCALER - SUPABASE DATABASE SETUP
-- =====================================================
-- Ejecuta este script en Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Pega y ejecuta
-- =====================================================

-- 1. TABLA PROFILES (extiende auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'VIEWER' CHECK (role IN ('ADMIN', 'ANALYST', 'VIEWER')),
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Pending')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil automaticamente cuando un usuario se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, avatar_url, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'ADMIN'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.email),
    'Active'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger si existe y crear nuevo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. TABLA PROJECTS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SCALED', 'PAUSED', 'KILLED')),
  start_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- 3. TABLA METRICS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL,
  revenue DECIMAL(12, 2) DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  burn_rate DECIMAL(12, 2) DEFAULT 0,
  cac DECIMAL(10, 2) DEFAULT 0,
  churn_rate DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, month)
);

CREATE INDEX IF NOT EXISTS idx_metrics_project ON public.metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_metrics_month ON public.metrics(month);

-- 4. TABLA AI_ANALYSES
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  recommendation TEXT NOT NULL CHECK (recommendation IN ('SCALE', 'PIVOT', 'KILL', 'MONITOR')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  reasoning TEXT,
  key_strength TEXT,
  key_risk TEXT,
  strategic_actions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_analyses_project ON public.ai_analyses(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created ON public.ai_analyses(project_id, created_at DESC);

-- 5. TABLA INVITATIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'VIEWER' CHECK (role IN ('ADMIN', 'ANALYST', 'VIEWER')),
  invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- PROJECTS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Projects are viewable by authenticated users" ON public.projects;
CREATE POLICY "Projects are viewable by authenticated users"
  ON public.projects FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
CREATE POLICY "Authenticated users can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete projects" ON public.projects;
CREATE POLICY "Authenticated users can delete projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (true);

-- METRICS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Metrics are viewable by authenticated users" ON public.metrics;
CREATE POLICY "Metrics are viewable by authenticated users"
  ON public.metrics FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert metrics" ON public.metrics;
CREATE POLICY "Authenticated users can insert metrics"
  ON public.metrics FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update metrics" ON public.metrics;
CREATE POLICY "Authenticated users can update metrics"
  ON public.metrics FOR UPDATE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete metrics" ON public.metrics;
CREATE POLICY "Authenticated users can delete metrics"
  ON public.metrics FOR DELETE
  TO authenticated
  USING (true);

-- AI_ANALYSES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "AI analyses are viewable by authenticated" ON public.ai_analyses;
CREATE POLICY "AI analyses are viewable by authenticated"
  ON public.ai_analyses FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert analyses" ON public.ai_analyses;
CREATE POLICY "Authenticated users can insert analyses"
  ON public.ai_analyses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- INVITATIONS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Invitations are viewable by authenticated" ON public.invitations;
CREATE POLICY "Invitations are viewable by authenticated"
  ON public.invitations FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can create invitations" ON public.invitations;
CREATE POLICY "Authenticated users can create invitations"
  ON public.invitations FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update invitations" ON public.invitations;
CREATE POLICY "Authenticated users can update invitations"
  ON public.invitations FOR UPDATE
  TO authenticated
  USING (true);

-- =====================================================
-- SETUP COMPLETADO!
-- =====================================================
-- Ahora ve a Authentication > Providers y habilita:
-- 1. Email (ya deberia estar habilitado)
-- 2. Google (necesitaras Client ID y Secret de Google Cloud)
-- =====================================================
