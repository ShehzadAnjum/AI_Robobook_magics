-- Authentication & User Features Schema
-- Run this script in Vercel Postgres (Neon) dashboard or via CLI
-- Extends existing schema (sessions, messages, analytics_events)

-- ============================================================================
-- better-auth Tables (Core Authentication)
-- ============================================================================

-- Users table: core user accounts
CREATE TABLE IF NOT EXISTS auth_user (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT auth_user_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Sessions table: authentication sessions
CREATE TABLE IF NOT EXISTS auth_session (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT auth_session_expires_check CHECK (expires_at > created_at)
);

-- OAuth accounts table: linked social accounts (Google, GitHub)
CREATE TABLE IF NOT EXISTS auth_account (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'github')),
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT auth_account_unique UNIQUE (provider, provider_account_id)
);

-- Verification tokens table: email verification & password reset
CREATE TABLE IF NOT EXISTS auth_verification (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('email_verification', 'password_reset')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Custom Application Tables (User Features)
-- ============================================================================

-- User progress table: chapter completion tracking
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED')),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_progress_unique UNIQUE (user_id, chapter_id),
  CONSTRAINT user_progress_completed_check CHECK (
    (status = 'COMPLETED' AND completed_at IS NOT NULL) OR
    (status != 'COMPLETED' AND completed_at IS NULL)
  )
);

-- User bookmarks table: saved chapters with notes
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES auth_user(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_bookmarks_unique UNIQUE (user_id, chapter_id),
  CONSTRAINT user_bookmarks_notes_length CHECK (LENGTH(notes) <= 1000)
);

-- Security events table: audit log for authentication actions
CREATE TABLE IF NOT EXISTS security_events (
  id SERIAL PRIMARY KEY,
  user_id TEXT REFERENCES auth_user(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'SIGNIN', 'SIGNIN_FAILED', 'SIGNUP', 'PASSWORD_RESET_REQUESTED',
    'PASSWORD_RESET_COMPLETED', 'PASSWORD_CHANGED', 'EMAIL_VERIFIED',
    'ACCOUNT_DELETED', 'ACCOUNT_RESTORED', 'OAUTH_LINKED', 'OAUTH_UNLINKED',
    'SUSPICIOUS_ACTIVITY'
  )),
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  failure_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- auth_user indexes
CREATE INDEX IF NOT EXISTS idx_auth_user_email ON auth_user(email);
CREATE INDEX IF NOT EXISTS idx_auth_user_created_at ON auth_user(created_at DESC);

-- auth_session indexes
CREATE INDEX IF NOT EXISTS idx_auth_session_user_id ON auth_session(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_session_token ON auth_session(token);
CREATE INDEX IF NOT EXISTS idx_auth_session_expires_at ON auth_session(expires_at);

-- auth_account indexes
CREATE INDEX IF NOT EXISTS idx_auth_account_user_id ON auth_account(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_account_provider ON auth_account(provider);

-- auth_verification indexes
CREATE INDEX IF NOT EXISTS idx_auth_verification_user_id ON auth_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_verification_token ON auth_verification(token);
CREATE INDEX IF NOT EXISTS idx_auth_verification_type ON auth_verification(type);
CREATE INDEX IF NOT EXISTS idx_auth_verification_expires_at ON auth_verification(expires_at);

-- user_progress indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_chapter_id ON user_progress(chapter_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed_at ON user_progress(completed_at DESC);

-- user_bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_chapter_id ON user_bookmarks(chapter_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_created_at ON user_bookmarks(created_at DESC);

-- security_events indexes
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_success ON security_events(success);

-- ============================================================================
-- Functions & Triggers
-- ============================================================================

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_auth_user_updated_at
  BEFORE UPDATE ON auth_user
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auth_session_updated_at
  BEFORE UPDATE ON auth_session
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_bookmarks_updated_at
  BEFORE UPDATE ON user_bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Data Retention Policies (Optional - enable if needed)
-- ============================================================================

-- Comment: Security events older than 90 days can be archived/deleted
-- CREATE INDEX IF NOT EXISTS idx_security_events_retention
--   ON security_events(created_at)
--   WHERE created_at < NOW() - INTERVAL '90 days';

-- ============================================================================
-- Verification Queries (Run after schema creation)
-- ============================================================================

-- Verify all tables created
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name LIKE 'auth_%' OR table_name LIKE 'user_%' OR table_name = 'security_events'
-- ORDER BY table_name;

-- Verify all indexes created
-- SELECT indexname FROM pg_indexes
-- WHERE tablename LIKE 'auth_%' OR tablename LIKE 'user_%' OR tablename = 'security_events'
-- ORDER BY indexname;

-- ============================================================================
-- Notes
-- ============================================================================

-- 1. Run this schema AFTER existing schema.sql (sessions, messages, analytics_events)
-- 2. Foreign key cascades ensure GDPR compliance (user deletion removes all data)
-- 3. Security events use ON DELETE SET NULL to preserve audit trail
-- 4. All timestamps use TIMESTAMP WITH TIME ZONE for accurate timezone handling
-- 5. Check constraints enforce data integrity at database level
-- 6. Indexes optimized for common query patterns (auth, progress, bookmarks)
