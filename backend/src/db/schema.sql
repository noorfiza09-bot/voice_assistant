-- VoiceTask database schema
-- Run with: psql -d voicetask -f src/db/schema.sql
-- (or let `npm run db:setup` do it for you)

CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tasks (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  notes       TEXT,
  due_at      TIMESTAMPTZ,
  priority    TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  list_name   TEXT NOT NULL DEFAULT 'tasks' CHECK (list_name IN ('my_day', 'important', 'planned', 'tasks')),
  completed   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks (due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_list_name ON tasks (list_name);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks (user_id);
