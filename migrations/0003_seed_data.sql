-- Migration number: 0003  Seed data for testing

-- Disable FK checks for seeding circular references
PRAGMA foreign_keys = OFF;

-- ========== USERS (insert first, without group) ==========
INSERT INTO users (id, username, display_name, avatar_initials, skill_points, total_sp_earned, total_cells_captured, total_runs, total_distance_miles, group_id, solo_skill, solo_skill_level, double_skill, double_skill_level, group_skill, group_skill_level)
VALUES
    ('usr-alex', 'alex', 'Alex', 'A', 142, 280, 38, 47, 156.2, 'grp-shadow', 'wide-scan', 3, 'recon-sweep', 2, 'war-march', 4),
    ('usr-jordan', 'jordan', 'Jordan', 'J', 89, 195, 29, 35, 112.8, 'grp-shadow', 'strike-force', 2, 'combined-arms', 1, 'war-march', 4),
    ('usr-sam', 'sam', 'Sam', 'S', 67, 145, 24, 28, 98.4, 'grp-shadow', 'shield', 2, 'fortify-pair', 0, 'iron-curtain', 1),
    ('usr-morgan', 'morgan', 'Morgan', 'M', 45, 110, 21, 22, 78.1, 'grp-shadow', 'wide-scan', 4, 'recon-sweep', 1, 'rally-cry', 0),
    ('usr-riley', 'riley', 'Riley', 'R', 22, 42, 12, 11, 34.5, 'grp-shadow', 'trailblazer', 1, NULL, 0, NULL, 0),
    ('usr-kai', 'kai', 'Kai', 'K', 98, 210, 32, 40, 134.0, 'grp-pavement', 'strike-force', 3, 'combined-arms', 2, 'war-march', 2),
    ('usr-elara', 'elara', 'Elara', 'E', 55, 130, 18, 26, 88.3, 'grp-pavement', 'ghost-run', 2, 'lockdown', 1, 'siege-engine', 1),
    ('usr-finn', 'finn', 'Finn', 'F', 38, 85, 14, 18, 62.7, 'grp-pavement', 'shield', 1, NULL, 0, 'iron-curtain', 1),
    ('usr-mira', 'mira', 'Mira', 'M', 28, 60, 10, 13, 44.2, 'grp-pavement', 'wide-scan', 1, NULL, 0, NULL, 0),
    ('usr-nova', 'nova', 'Nova', 'N', 72, 160, 25, 30, 105.0, 'grp-night', 'ghost-run', 3, 'sync-bonus', 1, 'bounty-hunt', 1),
    ('usr-zara', 'zara', 'Zara', 'Z', 44, 92, 16, 20, 68.5, 'grp-night', 'trailblazer', 2, NULL, 0, 'rally-cry', 1),
    ('usr-dash', 'dash', 'Dash', 'D', 31, 65, 11, 15, 48.9, 'grp-night', 'strike-force', 1, NULL, 0, NULL, 0),
    ('usr-taylor', 'taylor', 'Taylor', 'T', 35, 80, 15, 18, 56.3, NULL, 'wide-scan', 2, NULL, 0, NULL, 0);

-- ========== GROUPS ==========
INSERT INTO groups (id, name, tag, leader_id, invite_code, member_count, total_zones, total_points, streak_days, streak_last_date)
VALUES
    ('grp-shadow', 'Shadow Runners', 'SR', 'usr-alex', 'SHADOW-7X2K', 5, 7, 142, 5, date('now')),
    ('grp-pavement', 'Pavement Rippers', 'PR', 'usr-kai', 'PAVE-3R9M', 4, 6, 118, 3, date('now', '-1 day')),
    ('grp-night', 'Night Runners', 'NR', 'usr-nova', 'NIGHT-5Q1J', 3, 4, 86, 2, date('now'));

-- ========== USER SKILLS ==========
INSERT INTO user_skills (user_id, skill_id, skill_category, level) VALUES
    ('usr-alex', 'wide-scan', 'solo', 3),
    ('usr-alex', 'strike-force', 'solo', 2),
    ('usr-alex', 'shield', 'solo', 1),
    ('usr-alex', 'recon-sweep', 'double', 2),
    ('usr-alex', 'war-march', 'group', 4),
    ('usr-jordan', 'strike-force', 'solo', 2),
    ('usr-jordan', 'combined-arms', 'double', 1),
    ('usr-jordan', 'war-march', 'group', 4),
    ('usr-sam', 'shield', 'solo', 2),
    ('usr-sam', 'iron-curtain', 'group', 1),
    ('usr-morgan', 'wide-scan', 'solo', 4),
    ('usr-morgan', 'recon-sweep', 'double', 1),
    ('usr-riley', 'trailblazer', 'solo', 1);

-- ========== JOIN REQUESTS ==========
INSERT INTO join_requests (id, group_id, user_id, status)
VALUES
    ('jr-1', 'grp-shadow', 'usr-taylor', 'pending');

-- ========== ACTIVITY LOG ==========
INSERT INTO activity_log (group_id, user_id, event_type, message, created_at)
VALUES
    ('grp-shadow', 'usr-alex', 'capture', 'Alex captured 3 cells near Riverside Loop', datetime('now', '-2 hours')),
    ('grp-shadow', 'usr-jordan', 'defend', 'Jordan and Sam defended Campus North', datetime('now', '-5 hours')),
    ('grp-shadow', NULL, 'streak', 'Group streak extended to 5 days — bonus active!', datetime('now', '-6 hours')),
    ('grp-shadow', 'usr-morgan', 'capture', 'Morgan scouted 12 new cells in the park', datetime('now', '-1 day')),
    ('grp-shadow', 'usr-riley', 'member_joined', 'Riley joined the group', datetime('now', '-2 days'));

-- Re-enable FK checks
PRAGMA foreign_keys = ON;
