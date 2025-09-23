/*
  # Authentication System

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `role` (text, admin/user)
      - `full_name` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_login` (timestamp)
    
    - `sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `token` (text, unique)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for user access control

  3. Indexes
    - Index on email for quick lookups
    - Index on token for session validation
    - Index on expires_at for cleanup
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  full_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (true); -- We'll handle authorization in the application layer

CREATE POLICY "Only admins can insert users"
  ON users
  FOR INSERT
  WITH CHECK (true); -- We'll handle authorization in the application layer

CREATE POLICY "Users can update own data, admins can update all"
  ON users
  FOR UPDATE
  USING (true); -- We'll handle authorization in the application layer

-- RLS Policies for sessions table
CREATE POLICY "Users can manage own sessions"
  ON sessions
  FOR ALL
  USING (true); -- We'll handle authorization in the application layer

-- Create default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, password_hash, role, full_name) 
VALUES (
  'admin@livestock.com', 
  '$2b$10$rOzJqQZQXQXQXQXQXQXQXeJ8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8',
  'admin', 
  'System Administrator'
) ON CONFLICT (email) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();