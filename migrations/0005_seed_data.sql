-- Migration number: 0005  Seed data for simplified schema

PRAGMA foreign_keys = OFF;

-- ========== USERS ==========
INSERT INTO users (id, strava_id, display_name, group_id, color, rp_lifetime, rp_spent, equipped_skill, wide_scan_level, strike_force_level, shield_level, trailblazer_level, ghost_run_level)
VALUES
    ('usr-alex', 'strava-alex', 'Alex', 'grp-shadow', '#4ade80', 280, 50, 'wide-scan', 3, 1, 0, 0, 0),
    ('usr-jordan', 'strava-jordan', 'Jordan', 'grp-shadow', '#22d3ee', 195, 20, 'strike-force', 0, 2, 0, 0, 0),
    ('usr-sam', 'strava-sam', 'Sam', 'grp-shadow', '#a78bfa', 145, 5, 'shield', 0, 0, 2, 0, 0),
    ('usr-morgan', 'strava-morgan', 'Morgan', 'grp-shadow', '#f472b6', 110, 15, 'wide-scan', 4, 0, 0, 0, 0),
    ('usr-riley', 'strava-riley', 'Riley', 'grp-shadow', '#fbbf24', 42, 0, 'trailblazer', 0, 0, 0, 1, 0),
    ('usr-kai', 'strava-kai', 'Kai', 'grp-pavement', '#ef4444', 210, 30, 'strike-force', 0, 3, 0, 0, 0),
    ('usr-elara', 'strava-elara', 'Elara', 'grp-pavement', '#fb923c', 130, 20, 'ghost-run', 0, 0, 0, 0, 2),
    ('usr-finn', 'strava-finn', 'Finn', 'grp-pavement', '#34d399', 85, 5, 'shield', 0, 0, 1, 0, 0),
    ('usr-mira', 'strava-mira', 'Mira', 'grp-pavement', '#818cf8', 60, 0, 'wide-scan', 1, 0, 0, 0, 0),
    ('usr-nova', 'strava-nova', 'Nova', 'grp-night', '#c084fc', 160, 30, 'ghost-run', 0, 0, 0, 0, 3),
    ('usr-zara', 'strava-zara', 'Zara', 'grp-night', '#f97316', 92, 5, 'trailblazer', 0, 0, 0, 2, 0),
    ('usr-dash', 'strava-dash', 'Dash', 'grp-night', '#38bdf8', 65, 5, 'strike-force', 0, 1, 0, 0, 0),
    ('usr-taylor', 'strava-taylor', 'Taylor', NULL, '#e879f9', 80, 20, 'wide-scan', 2, 0, 0, 0, 0);

-- ========== GROUPS ==========
INSERT INTO groups (id, name, owner_id, color, invite_code)
VALUES
    ('grp-shadow', 'Shadow Runners', 'usr-alex', '#4ade80', 'SHADOW-7X2K'),
    ('grp-pavement', 'Pavement Rippers', 'usr-kai', '#ef4444', 'PAVE-3R9M'),
    ('grp-night', 'Night Runners', 'usr-nova', '#c084fc', 'NIGHT-5Q1J');

-- ========== SAMPLE RUNS ==========
INSERT INTO runs (id, user_id, cells_count, rp_earned, created_at)
VALUES
    ('run-1', 'usr-alex', 12, 12, datetime('now', '-2 hours')),
    ('run-2', 'usr-alex', 8, 8, datetime('now', '-1 day')),
    ('run-3', 'usr-jordan', 15, 15, datetime('now', '-5 hours')),
    ('run-4', 'usr-alex', 6, 9, datetime('now', '-2 days'));

PRAGMA foreign_keys = ON;
