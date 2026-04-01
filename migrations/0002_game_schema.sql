-- Migration number: 0002  Game schema for Turf

-- Drop the sample comments table
DROP TABLE IF EXISTS comments;

-- ========== USERS ==========
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                    -- UUID
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    avatar_initials TEXT NOT NULL DEFAULT '',
    skill_points REAL NOT NULL DEFAULT 0,   -- SP balance (can be fractional from 0.25 base)
    total_sp_earned REAL NOT NULL DEFAULT 0,
    total_cells_captured INTEGER NOT NULL DEFAULT 0,
    total_runs INTEGER NOT NULL DEFAULT 0,
    total_distance_miles REAL NOT NULL DEFAULT 0,
    group_id TEXT,                           -- FK to groups (nullable = no group)
    -- Equipped skills (one per slot)
    solo_skill TEXT DEFAULT NULL,            -- e.g. 'wide-scan'
    solo_skill_level INTEGER NOT NULL DEFAULT 0,
    double_skill TEXT DEFAULT NULL,
    double_skill_level INTEGER NOT NULL DEFAULT 0,
    group_skill TEXT DEFAULT NULL,
    group_skill_level INTEGER NOT NULL DEFAULT 0,
    -- Location
    home_lat REAL,
    home_lng REAL,
    home_name TEXT,
    privacy_zone_radius_m INTEGER NOT NULL DEFAULT 200,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ========== SKILL LEVELS ==========
-- Tracks the level of every skill a user has invested in
CREATE TABLE IF NOT EXISTS user_skills (
    user_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,                 -- e.g. 'wide-scan', 'strike-force'
    skill_category TEXT NOT NULL,           -- 'solo', 'double', 'group'
    level INTEGER NOT NULL DEFAULT 0,       -- 0-5
    PRIMARY KEY (user_id, skill_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========== GROUPS ==========
CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,                    -- UUID
    name TEXT NOT NULL,
    tag TEXT,                               -- Short tag/abbreviation
    leader_id TEXT NOT NULL,                -- FK to users
    invite_code TEXT NOT NULL UNIQUE,       -- e.g. 'SHADOW-7X2K'
    member_count INTEGER NOT NULL DEFAULT 1,
    total_zones INTEGER NOT NULL DEFAULT 0,
    total_points INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 0,
    streak_last_date TEXT,                  -- ISO date of last streak contribution
    max_members INTEGER NOT NULL DEFAULT 15,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (leader_id) REFERENCES users(id)
);

-- ========== JOIN REQUESTS ==========
CREATE TABLE IF NOT EXISTS join_requests (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'denied'
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========== TERRITORY (H3 CELL POINTS) ==========
-- Each row = one group's points in one H3 cell
CREATE TABLE IF NOT EXISTS cell_points (
    cell_id TEXT NOT NULL,                  -- H3 cell index (resolution 9)
    group_id TEXT NOT NULL,                 -- FK to groups (or user_id for solo ungrouped)
    points REAL NOT NULL DEFAULT 0,         -- Total accumulated points
    PRIMARY KEY (cell_id, group_id),
    FOREIGN KEY (group_id) REFERENCES groups(id)
);

-- For solo players without a group
CREATE TABLE IF NOT EXISTS cell_points_solo (
    cell_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    points REAL NOT NULL DEFAULT 0,
    PRIMARY KEY (cell_id, user_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========== FOG OF WAR (EXPLORED CELLS) ==========
-- Tracks which cells a group (or solo user) has explored
CREATE TABLE IF NOT EXISTS explored_cells (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cell_id TEXT NOT NULL,
    group_id TEXT,                          -- NULL for solo ungrouped players
    user_id TEXT,                           -- For solo (ungrouped) players
    explored_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(cell_id, group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_explored_group ON explored_cells(group_id);
CREATE INDEX IF NOT EXISTS idx_explored_user ON explored_cells(user_id);

-- ========== RUNS ==========
CREATE TABLE IF NOT EXISTS runs (
    id TEXT PRIMARY KEY,                    -- UUID
    user_id TEXT NOT NULL,
    group_id TEXT,                          -- Group at time of run (nullable)
    run_type TEXT NOT NULL DEFAULT 'solo',  -- 'solo', 'double', 'group'
    distance_miles REAL NOT NULL DEFAULT 0,
    cells_traversed INTEGER NOT NULL DEFAULT 0,
    cells_captured INTEGER NOT NULL DEFAULT 0,  -- Cells flipped to your ownership
    points_earned REAL NOT NULL DEFAULT 0,
    sp_earned REAL NOT NULL DEFAULT 0,
    -- The skill that was active during this run
    active_skill TEXT,
    active_skill_level INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========== RUN CELLS ==========
-- Which cells were part of a run (anti-farming: 1 per cell per run)
CREATE TABLE IF NOT EXISTS run_cells (
    run_id TEXT NOT NULL,
    cell_id TEXT NOT NULL,
    points_contributed REAL NOT NULL DEFAULT 1, -- Points added to this cell
    was_capture INTEGER NOT NULL DEFAULT 0,     -- 1 if this run flipped ownership
    PRIMARY KEY (run_id, cell_id),
    FOREIGN KEY (run_id) REFERENCES runs(id)
);

-- ========== RAIDS ==========
CREATE TABLE IF NOT EXISTS raids (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,                 -- Attacking group
    status TEXT NOT NULL DEFAULT 'proposed', -- 'proposed', 'active', 'completed', 'rejected', 'expired'
    proposer_id TEXT NOT NULL,
    votes_yes INTEGER NOT NULL DEFAULT 0,
    votes_no INTEGER NOT NULL DEFAULT 0,
    total_voters INTEGER NOT NULL DEFAULT 0, -- Group size at time of proposal
    activated_at TEXT,                       -- When >50% voted yes
    expires_at TEXT,                         -- 24h after activation
    proposal_expires_at TEXT,               -- 48h after proposal (auto-reject)
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (proposer_id) REFERENCES users(id)
);

-- ========== RAID TARGET CELLS ==========
CREATE TABLE IF NOT EXISTS raid_cells (
    raid_id TEXT NOT NULL,
    cell_id TEXT NOT NULL,
    PRIMARY KEY (raid_id, cell_id),
    FOREIGN KEY (raid_id) REFERENCES raids(id)
);

-- ========== RAID VOTES ==========
CREATE TABLE IF NOT EXISTS raid_votes (
    raid_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    vote TEXT NOT NULL,                     -- 'yes' or 'no'
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (raid_id, user_id),
    FOREIGN KEY (raid_id) REFERENCES raids(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ========== GROUP ACTIVITY LOG ==========
CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id TEXT,
    user_id TEXT,
    event_type TEXT NOT NULL,               -- 'capture', 'defend', 'raid_proposed', 'raid_active', 'member_joined', 'member_left', 'streak', 'run_completed'
    message TEXT NOT NULL,
    metadata TEXT,                           -- JSON blob for extra data
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_activity_group ON activity_log(group_id, created_at);

-- ========== INDEXES FOR PERFORMANCE ==========
CREATE INDEX IF NOT EXISTS idx_cell_points_cell ON cell_points(cell_id);
CREATE INDEX IF NOT EXISTS idx_cell_points_group ON cell_points(group_id);
CREATE INDEX IF NOT EXISTS idx_runs_user ON runs(user_id);
CREATE INDEX IF NOT EXISTS idx_runs_group ON runs(group_id);
CREATE INDEX IF NOT EXISTS idx_users_group ON users(group_id);
