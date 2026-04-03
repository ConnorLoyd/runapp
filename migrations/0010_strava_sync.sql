-- Migration 0010: Add strava_connected_at for activity date filtering
-- Only activities after this timestamp are eligible for auto-import

ALTER TABLE users ADD COLUMN strava_connected_at TEXT;

-- Backfill existing Strava-linked users with their account creation date
UPDATE users SET strava_connected_at = created_at WHERE strava_id IS NOT NULL AND strava_connected_at IS NULL;
