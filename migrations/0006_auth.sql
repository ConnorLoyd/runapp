-- Migration number: 0006  Add authentication fields

-- Add username, password_hash, and session token to users
ALTER TABLE users ADD COLUMN username TEXT;
ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN session_token TEXT;
ALTER TABLE users ADD COLUMN session_expires TEXT;

-- Create unique indexes separately (ALTER TABLE ADD COLUMN doesn't support UNIQUE in SQLite)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_session_token ON users(session_token);
