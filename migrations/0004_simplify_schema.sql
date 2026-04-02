-- Migration number: 0004  Simplify schema to match MVP idea.md

-- Drop all old tables (children before parents; groups before users due to groups.leader_id FK)
DROP TABLE IF EXISTS activity_log;
DROP TABLE IF EXISTS raid_votes;
DROP TABLE IF EXISTS raid_cells;
DROP TABLE IF EXISTS raids;
DROP TABLE IF EXISTS run_cells;
DROP TABLE IF EXISTS runs;
DROP TABLE IF EXISTS explored_cells;
DROP TABLE IF EXISTS cell_points_solo;
DROP TABLE IF EXISTS cell_points;
DROP TABLE IF EXISTS join_requests;
DROP TABLE IF EXISTS user_skills;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS comments;

-- ========== USERS ==========
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    strava_id TEXT UNIQUE,
    display_name TEXT NOT NULL,
    group_id TEXT,
    color TEXT NOT NULL DEFAULT '#4ade80',
    rp_lifetime INTEGER NOT NULL DEFAULT 0,
    rp_spent INTEGER NOT NULL DEFAULT 0,
    equipped_skill TEXT,
    wide_scan_level INTEGER NOT NULL DEFAULT 0,
    strike_force_level INTEGER NOT NULL DEFAULT 0,
    shield_level INTEGER NOT NULL DEFAULT 0,
    trailblazer_level INTEGER NOT NULL DEFAULT 0,
    ghost_run_level INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ========== GROUPS ==========
CREATE TABLE groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    owner_id TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    invite_code TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- ========== TERRITORY ==========
CREATE TABLE territory (
    h3_index TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    rp INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (h3_index, entity_id)
);

-- ========== DISCOVERED CELLS ==========
CREATE TABLE discovered_cells (
    h3_index TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    PRIMARY KEY (h3_index, entity_id)
);

-- ========== RUNS ==========
CREATE TABLE runs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    strava_activity_id TEXT UNIQUE,
    cells_count INTEGER NOT NULL DEFAULT 0,
    rp_earned INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========== INDEXES ==========
CREATE INDEX idx_territory_h3 ON territory(h3_index);
CREATE INDEX idx_territory_entity ON territory(entity_id);
CREATE INDEX idx_discovered_entity ON discovered_cells(entity_id);
CREATE INDEX idx_runs_user ON runs(user_id);
CREATE INDEX idx_users_group ON users(group_id);
CREATE INDEX idx_users_strava ON users(strava_id);
