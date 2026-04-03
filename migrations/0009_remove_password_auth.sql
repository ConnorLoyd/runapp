-- Migration 0009: Remove old username/password auth data

-- Delete all existing data from old username/password system
DELETE FROM runs;
DELETE FROM discovered_cells;
DELETE FROM territory;

-- Remove group references from users before deleting groups
UPDATE users SET group_id = NULL;
DELETE FROM groups;
DELETE FROM users;

-- Drop indexes that reference columns being removed
DROP INDEX IF EXISTS idx_users_username;

-- Drop obsolete auth columns (no longer needed with Strava OAuth)
ALTER TABLE users DROP COLUMN username;
ALTER TABLE users DROP COLUMN password_hash;
