-- Migration 0008: Switch to Strava OAuth (remove username/password auth)

-- Add Strava token columns for OAuth
ALTER TABLE users ADD COLUMN strava_access_token TEXT;
ALTER TABLE users ADD COLUMN strava_refresh_token TEXT;
ALTER TABLE users ADD COLUMN strava_token_expires INTEGER;
