# Turf — Social Competitive Running App

## App Name: **Turf**

---

## Target Audience and Core Appeal

- A social competitive running app where people and groups fight to discover, capture, defend, weaken, and reclaim real-world territory by running through it.  
- The core appeal is not just “track a run,” but “go run with specific people in specific places because the game gives that run meaning.”  
- This is designed for runners who already overlap in the same places:
  - Cross-country teams  
  - Track teams  
  - Running clubs  
  - Friend groups  
  - People who run local loops, trails, parks, campuses, and neighborhoods repeatedly  

---

## Visual Design & UI

### Theme

- **Dark tactical + retro-futuristic** — a modern Tron-inspired aesthetic
- Dark backgrounds with glowing neon overlays for territories and UI elements
- Clean layout with detailed accents that feel lively without being overwhelming
- Not too minimalistic, not too loud — polished but with personality
- Color palette: deep dark base, with neon orange and warm amber as primary UI accents. Territory colors are functional: green spectrum for your territory (light→dark by defense), red/orange/yellow spectrum for enemy territory (by defense), white for neutral.

### Map & Fog of War

- Unexplored areas are covered in a **dark mystical fog** — a hybrid of swirling void and atmospheric haze
- Not literal clouds, more like a living darkness with subtle particle effects or ethereal wisps
- Explored areas emerge with full vivid map detail, making discovered territory feel alive in contrast
- Territory ownership shown through glowing color overlays matching team/group colors
- Neon boundary lines pulse subtly on contested zones

### Platform

- **Progressive Web App (PWA)**
- Works on all platforms via the browser with installable home screen access
- Simpler to build and deploy than native apps
- Must support background GPS tracking for run recording
- Service worker for offline capability and push notifications

---

## App Screens & Navigation

### Home Screen (Map-Centric)

- The **territory map** is the home screen
- Overlaid stats: held territories count, total points, active streaks, group status
- Users should be able to open the app, see the current state of the game, plan a route, and stay informed at a glance
- Quick-access buttons: Start Run, Group page, Skills, Profile
- Map shows: fog of war, owned cells (color-coded), contested zones, raid markers

### Key Screens

1. **Territory Map** (home) — full interactive map with overlays and quick stats
2. **Group/Clan Management** — roster, member skills/levels, group stats, raid voting, group news
   - **Layout order** (top to bottom):
     1. Group stats bar (zones held, total points, streak, rank)
     2. Members roster — each member shows name, equipped skill, contribution stats
     3. RAID VOTING — button opens a map overlay where you select 1-5 hexes to propose for a raid. If >50% of group members vote for the same set of hexes, the raid begins (24h vulnerability window)
     4. Group Management — invite players (share link/code), view join requests, leave group
     5. Activity feed — compact scrollable box at the bottom showing recent group events
3. **Skill Tree / Upgrades** — three skill categories (solo/double/group), upgrade paths, SP balance
4. **Leaderboard** — local and global rankings, each with group and individual sections
   - **Local leaderboard**: groups and individuals ranked within a geographic area
   - **Global leaderboard**: overall rankings across all players
   - **Group section**: ranks groups by total owned cells, streaks, captures
   - **Individual section**: ranks players by SP earned, cells captured, contribution stats
5. **Player Profile** — equipped skills with levels, run stats, contribution history
6. **Settings** — privacy zones, notification preferences, account management

### Screen Details

- **Group page** contains raid planning (since raids are group-only)
- **Player profile** prominently displays equipped skills (solo/double/group) with their levels
- **Group roster** shows each member's equipped skills and levels for strategic planning
- Run tracking happens as a map overlay (no separate screen — stay on the map)
- Run results appear as a summary after completing a run (cells captured, points earned, SP gained)

### Social Features

- **No in-app chat** — players use external tools (Discord, iMessage, etc.) for communication
- Group page shows activity feed / news for coordination
- Keeps the app focused and the database simple

---

## User Engagement Scenarios

The game should make users want to say:

- “We need to defend this loop tonight.”  
- “Let’s go scout the park solo.”  
- “We should mark that area for a raid before the Saturday long run.”  
- “If one person misses tomorrow, we lose our streak bonus.”  

---

## Game Mechanics and Run Types

- A real-world territory control game for runners  
- Territory is shaped by **social structure and run type**, not just GPS movement  

### Run Types

- Solo  
- Double (2 runners from the same group)  
- Group (3+ runners from the same group)  

### Run Detection

- Doubles and groups can **only** form between members of the same group/clan
- A solo player without a group cannot pair with someone from another group
- **Auto-detection**: the app intelligently determines if a run was solo, double, or group based on GPS/timing data
- If runs are imported via **Strava integration**, use Strava's group activity data to detect co-runners
- No manual linking required — the system figures it out and applies skills accordingly

### Run Recording & Import

- Runs are recorded on the runner's personal device (Garmin, Apple Watch, phone, etc.)
- Runs are **uploaded/synced** via:
  - **Strava integration** (primary) — link Strava account, runs auto-import
  - Auto-detect group runs from Strava's group activity data
  - Manual upload as a fallback option
- The app processes the GPS route to calculate which H3 cells were traversed
- No real-time GPS streaming — results are processed after the run
- This keeps the system simple and lets runners use whatever device/app they prefer

---

## Core Gameplay Loops

Each run type has its own strategic value, point system, and progression.

Core loop:

- Discovering territory  
- Capturing territory  
- Defending territory  
- Weakening enemy territory  
- Organizing raids and retakes  
- Rewarding repeated runs with the same people  

---

## Unique Game Features and Strategy

- Fog of war map (must run to reveal areas)  
- Group-shared map knowledge  
- Solo classes with specialized powers  
- Different impact for solo, double, and group runs  
- Zones have **phases**, not instant ownership  
- Repeated runs strengthen territory (streak bonuses)  
- Pre-marked raids create time-based battles  

---

## Gameplay Mechanics and Territory Dynamics

- Enter unknown territory → reveal it  
- Discovered territory can be captured, weakened, or defended  
- Different run types affect zones differently  
- Territories strengthen through repeated visits  
- Rival groups can weaken or mark zones  
- Owners must return to defend  
- Local rivalries form over time  

### Zone Capture Rules

- **Pass-through capture**: simply running through an H3 cell earns **1 point** for your group in that cell
- This encourages covering ground and exploring new territory
- A run counts **once per cell per runner per run** (anti-farming)
- Solo, double, and group runs may have different point multipliers (see Run Types)

### Zone Ownership

- **Instant flip**: whichever group has the most total points in a cell owns it
- Ownership changes immediately when a rival group surpasses the current leader's point total
- Creates a fast-paced, dynamic map that rewards activity

### Territory Decay

- **No passive decay** — territory points do not decrease over time on their own
- Territory is only weakened by **enemy runners passing through** (which adds their points and shifts the balance)
- This means once you earn a zone, you keep it until someone actively takes it
- Encourages offensive play and discourages passive sitting

### Run Validation

- **Minimum distance**: a run must be at least **0.5 miles** total to count for gameplay
- Prevents gaming with tiny movements (walking to the mailbox, driving)
- Inclusive of all running paces — no speed requirement
- GPS track is recorded and distance calculated from the route

---

## Fog of War and Discovery

- The map is not fully visible by default  
- Players must physically run through areas to reveal them  
- Creates exploration, mystery, and local knowledge advantages  
- Visual: dark mystical fog/void dissolves to reveal vivid terrain as you run through it  

---

## Collaborative Discovery

- **Full fog sharing**: when one player explores a cell, all group members see it on their map
- Solo exploration benefits the entire group immediately
- Encourages:
  - Solo scouting runs to reveal new territory for the team
  - Recruiting explorers to expand map awareness
  - Strategic exploration to find uncontested areas

---

## Zone States / Phases

Simplified to 3 phases:

- **Hidden** — covered by fog of war, not yet explored by any group member
- **Unclaimed** — visible on the map, no group has contributed points yet
- **Owned** — at least one group has points in the cell; highest total owns it
  - Streak level (days consecutively defended) shown as a visual glow/tier on the map
  - Higher streak = brighter/stronger glow, indicating a well-held zone
  - Contested zones (close point totals) could pulse or shimmer to indicate vulnerability

### Territory Color System

Territory hex colors are based on **defense points** and ownership status:

**Enemy Territory** (owned by another group):
- **High defense** (20+ points) — Red (`#ef4444`) — heavily fortified, hard to flip
- **Medium defense** (10–19 points) — Orange (`#ff6a00`) — moderately defended
- **Low defense** (1–9 points) — Yellow/Amber (`#ffb830`) — weakly held, ripe for attack

**Neutral / Unclaimed Territory**:
- White/light (`#ffffff` at low opacity) — no group has claim, whoever runs through it first starts accumulating points

**Your Group's Territory** (you own it):
- **Low defense** (1–9 points) — Light green (`#4ade80` at ~20% opacity) — freshly captured, vulnerable
- **Medium defense** (10–19 points) — Medium green (`#22c55e` at ~30% opacity) — established territory
- **High defense** (20+ points) — Dark/vivid green (`#16a34a` at ~40% opacity) — well-fortified stronghold

### Hex Cell Labels

Each explored hex cell displays (at close zoom):

**Defense & Attack Points**:
- **Defense points** (🛡️): shown large and prominent — the owning group's total points in the cell
- **Attack points** (⚔️): shown smaller underneath
  - On **enemy hexes**: your group's attack contribution displayed in **green** (offensive context — you're chipping away at it)
  - On **your hexes**: the next highest group's points displayed in **red** (defensive context — shows how close they are to flipping it)
- Labels fade out at wider zoom levels to keep the map clean

**Owner Indicator**:
- Each owned hex shows who controls it:
  - **Solo player**: avatar/initials — clickable to view that player's profile (name, stats)
  - **Group/clan**: group icon + initials — clickable to view the group (name, members, stats)
- Clicking an owner indicator opens a compact info card with icon, name, and key stats
- Neutral cells show no owner indicator

---

## Fair Play System

- A run counts **once per zone per runner per run**  
- Prevents farming by running back and forth  
- Minimum **0.5 mile** total run distance required for a run to count

Ownership model:

- Running through a zone adds 1 point to your group in that cell
- Ownership = whichever group has the highest total points (instant flip)
- No passive decay — only weakened by enemy activity  

---

## Player Archetypes & Run Type Scoring

### All Runs

- Every runner earns **1 point per cell** passed through per run
- Points contribute to group ownership in that cell
- The same points earned through attacking/defending also serve as **Skill Points (SP)** for upgrading skills

### Solo (No Group)

- 1 point per cell + **solo-exclusive skills** active
- Best for: scouting, exploration, weakening zones, precision actions
- Solo skills cater to individual strategic play
- **Groupless players can play solo** — points accumulate as personal territory
- All solo features work without a group; you just can't double/group run

### Double (2 players from same group)

- 1 point per cell per runner + **double-exclusive skills** active
- Each runner selects their own double skill
- Double skills focus on: improved attack/defense, larger scout radius, synergy bonuses

### Group (3+ players)

- 1 point per cell per runner + **group-exclusive skills** active
- Group skills are unique to group runs and are **more powerful** than solo/double skills
- Best for: capturing, fortifying, holding territory, overwhelming rivals

---

## Skill System

Rebranded from "classes" to **skills**. Three separate skill categories — one for each run type.

### How Skills Work

- Every player has **three skill slots**: one for Solo, one for Double, one for Group
- **Only 1 skill equipped per slot** at a time
- The active skill depends on what type of run you're on
- Players can upgrade any skill they want using Skill Points (SP)
- Upgraded skills become more effective (wider radius, more points, stronger effects)

### Skill Points (SP) Earning

- **Base**: 0.25 SP per completed run
- **Territory contributions**: the same points you contribute to cells (attack/defense) are awarded as SP
  - Example: run through 4 cells = 4 SP earned
- **Capture bonus**: flipping a cell to your group's ownership for the first time awards **3 bonus SP**
- SP is a unified currency for upgrading any skill in any category

### Solo Skills

- **Wide Scan** — Reveals adjacent H3 cells as you run, expanding fog reveal beyond just the cells you pass through
  - Lv1: 1 ring of adjacent cells revealed | Lv2: 1 ring + 25% chance of 2nd ring | Lv3: 2 rings | Lv4: 2 rings + 25% chance of 3rd | Lv5: 3 rings

- **Strike Force** — Your points count for more in enemy-owned cells (attack bonus, doesn't boost friendly territory)
  - Lv1: 1.5x in enemy cells | Lv2: 1.75x | Lv3: 2x | Lv4: 2.5x | Lv5: 3x

- **Shield** — Your solo runs in friendly-owned cells add bonus defense points, reinforcing territory
  - Lv1: +0.5 defense per cell | Lv2: +1 | Lv3: +1.5 | Lv4: +2 | Lv5: +2.5

- **Trailblazer** — Earn bonus SP when running through unclaimed or newly discovered cells
  - Lv1: +1 SP per new cell | Lv2: +1.5 | Lv3: +2 | Lv4: +2.5 | Lv5: +3

- **Ghost Run** — Enemy groups don't receive notifications when you enter their territory
  - Lv1: 50% stealth chance | Lv2: 65% | Lv3: 80% | Lv4: 90% | Lv5: 100% stealth + no activity log entry

### Double Skills

- **Recon Sweep** — Both runners reveal adjacent cells with expanded fog reveal, stacking for massive area coverage
  - Lv1: 1 ring each | Lv2: 1 ring each + overlap bonus | Lv3: 2 rings each | Lv4: 2 rings + overlap bonus | Lv5: 2 rings each (4 rings combined coverage)

- **Combined Arms** — Both runners earn bonus attack points in enemy territory
  - Lv1: 1.25x each | Lv2: 1.4x | Lv3: 1.6x | Lv4: 1.8x | Lv5: 2x each (4x combined vs 2x solo)

- **Fortify Pair** — Friendly cells gain a temporary defense shield lasting after the run ends
  - Lv1: +1 defense for 12h | Lv2: +1.5 for 18h | Lv3: +2 for 24h | Lv4: +2.5 for 36h | Lv5: +3 for 48h

- **Sync Bonus** — Both runners earn bonus SP, rewarding paired running
  - Lv1: +10% SP | Lv2: +15% | Lv3: +20% | Lv4: +25% | Lv5: +30% SP

- **Lockdown** — When a cell is captured by the pair, it gets bonus points automatically
  - Lv1: +2 bonus points on capture | Lv2: +3 | Lv3: +4 | Lv4: +5 | Lv5: +6

### Group Skills

- **War March** — All group members earn bonus points per cell (most powerful raw point boost in the game)
  - Lv1: +0.5 per cell per runner | Lv2: +0.75 | Lv3: +1 | Lv4: +1.5 | Lv5: +2 per cell per runner

- **Iron Curtain** — Cells you pass through become significantly harder to flip for a duration
  - Lv1: +2 defense for 24h | Lv2: +2.5 for 36h | Lv3: +3 for 48h | Lv4: +4 for 60h | Lv5: +5 for 72h

- **Rally Cry** — Streak bonus growth is amplified for the group
  - Lv1: +25% streak points | Lv2: +35% | Lv3: +50% | Lv4: +60% | Lv5: +75%

- **Bounty Hunt** — All group members earn bonus SP (best SP farming method in the game)
  - Lv1: +15% SP | Lv2: +22% | Lv3: +30% | Lv4: +40% | Lv5: +50% SP

- **Siege Engine** — During raids, your group's attack multiplier is amplified (only active during raid windows)
  - Lv1: 1.5x raid points | Lv2: 1.75x | Lv3: 2x | Lv4: 2.5x | Lv5: 3x raid points

### Skill Upgrades

- Each skill has **5 upgrade levels**
- Upgrades increase the skill's effectiveness (see individual skill descriptions above)
- SP can be spent on any skill regardless of category
- Cost per level: Lv1 = 5 SP | Lv2 = 15 SP | Lv3 = 30 SP | Lv4 = 50 SP | Lv5 = 80 SP
- Total to max one skill: 180 SP
- Total to max all 15 skills: 2,700 SP

---

## Points and Progression

### Territory Points

- 1 point per cell per runner per run
- Ownership = highest total points in a cell (instant flip)

### Skill Points (SP)

- 0.25 SP base per completed run
- SP earned = territory points contributed on that run
- +3 SP bonus for each cell captured (flipped to your group)
- SP spent to upgrade skills across all three categories

### Progression

- Players level up by:
  - Taking land (capturing cells)
  - Contributing to territory (running through owned cells)
  - Participating consistently (streak bonuses)
- Separate stats tracked for solo, double, and group contributions

---

## Repeat-Run Streak Mechanic

- **Group streak**: any member of the group running through owned cells on consecutive days maintains the streak
- Not everyone needs to show up — as long as at least one member runs the territory each day, the streak continues
- Streak increases bonus points earned in those cells

Example point multiplier:

- Day 1 = 1 point  
- Day 2 = 2 points  
- Day 3 = 4 points  
- Day 4 = 6 points  
- Day 5 = 8 points  
- Day 6 = 10 points  
- Day 7 = 13 points  

Encourages:

- Consistency  
- Social accountability (“someone needs to run our zone today”)  
- Habit formation  
- Strategic delegation within the group  

---

## Raids

- **Raid Voting**: any group member can propose a raid by selecting 1–5 enemy H3 cells on the map
- Proposed raid targets are shown to all group members for voting
- If **>50% of group members** vote to approve, the raid is activated
- Marked cells become **vulnerable for 24 hours**
- During the vulnerability window, attacker points in those cells are amplified
- **Defenders are notified** when their territory is marked for a raid
- This gives both sides time to prepare and creates real-time territorial battles
- **Raid limit**: 1 raid per group per week (prevents spam, makes raids feel significant)

### Raid Flow

1. Member taps "Propose Raid" on the Group page
2. Map overlay opens — member selects 1–5 enemy hexes
3. Proposal is submitted to the group
4. Group members see the proposal and can vote yes/no
5. Once >50% vote yes, the raid begins (24h window opens)
6. If rejected or timed out (48h), the proposal is discarded

Effects:

- Encourages planning and coordination  
- Creates anticipation ("they've marked our park for 6pm Saturday")  
- Enables defense/retake battles with actual stakes  
- Gives runs clear military-style objectives  
- Defenders can rally group members to run the zone during the window  

---

## Desired Player Experience

The game should feel:

- Local  
- Competitive  
- Strategic  
- Social  
- Slightly secretive  
- Motivating  
- Route-driven  
- Rivalry-driven  

---

## Core Identity

- Your town feels alive with hidden running fronts  
- Every route has meaning  
- Groups have “home turf”  
- Solo runs support group success  
- Group runs feel like events  

---

## Runner Behavior Alignment

This works because runners already:

- Repeat routes  
- Form habits  
- Run with the same people  
- Care about local identity  
- Compare performance socially  

---

## Core Mechanics to Preserve

- Fog of war unlocked by running  
- Shared map knowledge  
- Solo / double / group runs with distinct skill trees  
- Skill system (3 slots: solo, double, group) with SP upgrades  
- 1 point per cell per runner, instant ownership flip  
- 3-phase zones (Hidden → Unclaimed → Owned)  
- Anti-farming rules (once per cell per runner per run)  
- Raid system  
- Streak bonuses  
- 0.5 mile minimum run distance  

---

## Resolved Design Decisions

### Territory Design

- Zones defined using **H3 hexagonal grid cells** (Uber's hierarchical spatial index)
- H3 provides uniform hexagonal tiling at multiple resolutions
- Likely resolution: **H3 res 9** (~174m edge length, ~0.1 km² area) — tunable
- Benefits: predictable, scalable, no curation needed, game-like hex aesthetic fits the Tron theme
- Ownership tracked per H3 cell with team/group point totals

### Map Data

- H3 cells generated dynamically based on player location  
- Ownership stored as point totals per cell per group  
- Runnable areas determined by GPS tracking (any area a player runs through counts)  

### Ownership Rules

- Instant flip: highest point total in a cell owns it
- No passive decay — only weakened by enemy runs  
- Streak bonuses amplify points for repeated group visits  
- Raid mechanics create time-limited vulnerability windows  

### Group Systems

- **Fixed teams/clans**: one persistent group per player with a name, roster, and shared map
- Max group size: **15 members**
- Fog sharing: **full share** — one member explores, all members see it
- Streak: **group streak** — any member running through keeps it alive
- **Leaving a group**: contributed points stay with the old group (prevents sabotage). Player starts fresh with a new group.

### Safety / Privacy

- **Manual privacy zone**: players set a radius around their home location
- Runs within the privacy zone do not register for gameplay (no cell contributions)
- Protects home locations from being inferred by rivals
- Other players cannot see activity within anyone's privacy zone
- Additional standard safety: age verification, block/report system

### Notifications

- Keep notifications simple and derived from existing data (no complex real-time tracking system)
- **Run results**: summary of your run (cells captured, points earned, SP gained)
- **Group news**: member joined/left, territory captured/lost, streaks broken
- **Raid alerts**: when your territory is marked for a raid
- No complex notification system at launch — expand later based on need

---

## Technical Stack

### Authentication

- **Strava OAuth only** — users sign up and log in via their Strava account
- No email/password or other providers
- Strava login also handles run import permissions in one step

### Map

- **Leaflet + OpenStreetMap** — completely free, no API costs
- Custom dark theme tiles (e.g., CartoDB Dark Matter or Stamen Toner) to match the Tron aesthetic
- H3 hex grid overlaid using leaflet plugins or custom Canvas/SVG rendering
- Good PWA compatibility

### Backend

- **Cloudflare Workers + D1** (SQLite at the edge)
- Already set up in the project
- Lightweight, serverless, free tier generous for this use case
- D1 free tier: 5GB storage, 5M reads/day, 100K writes/day

### Raids

- **1–5 H3 cells** can be targeted per raid
- 1 raid per group per week
- 24-hour vulnerability window

---

## Database Schema (Cloudflare D1 / SQLite)

Design principles: sparse storage (only store active data), minimal columns, JSON for variable-length data, integers over text where possible. Optimized for D1 free tier (5GB storage).

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `strava_id` | TEXT UNIQUE | Strava user ID |
| `display_name` | TEXT | |
| `group_id` | TEXT nullable | FK → groups.id |
| `skill_points` | INTEGER | Current SP balance |
| `solo_skill` | TEXT nullable | Equipped solo skill name |
| `solo_skill_level` | INTEGER DEFAULT 0 | Level 0–5 |
| `double_skill` | TEXT nullable | Equipped double skill name |
| `double_skill_level` | INTEGER DEFAULT 0 | Level 0–5 |
| `group_skill` | TEXT nullable | Equipped group skill name |
| `group_skill_level` | INTEGER DEFAULT 0 | Level 0–5 |
| `privacy_radius_m` | INTEGER DEFAULT 200 | Privacy zone radius in meters |
| `privacy_lat` | REAL nullable | Privacy zone center latitude |
| `privacy_lng` | REAL nullable | Privacy zone center longitude |
| `created_at` | TEXT | ISO 8601 timestamp |

### `skill_levels`

Tracks upgrade levels for all skills a user has invested in (not just equipped ones).

| Column | Type | Notes |
|---|---|---|
| `user_id` | TEXT | FK → users.id |
| `skill_name` | TEXT | e.g., "wide_scan", "war_march" |
| `level` | INTEGER | 1–5 |
| PRIMARY KEY | | (user_id, skill_name) |

### `groups`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `name` | TEXT UNIQUE | Group display name |
| `owner_id` | TEXT | FK → users.id (group creator) |
| `created_at` | TEXT | ISO 8601 |

Membership tracked via `users.group_id`. Max 15 enforced in app logic.

### `cells`

Sparse territory storage. Only rows for cells that have been interacted with.

| Column | Type | Notes |
|---|---|---|
| `h3_index` | TEXT | H3 cell index string |
| `group_id` | TEXT | FK → groups.id (or user ID for solo) |
| `points` | INTEGER | Total accumulated points |
| `streak_days` | INTEGER DEFAULT 0 | Consecutive days defended |
| `streak_last_date` | TEXT nullable | Last date streak was maintained (YYYY-MM-DD) |
| PRIMARY KEY | | (h3_index, group_id) |

One row per cell per group. Ownership = `SELECT group_id FROM cells WHERE h3_index = ? ORDER BY points DESC LIMIT 1`.

### `discovered_cells`

Tracks fog of war reveals per group (shared discovery).

| Column | Type | Notes |
|---|---|---|
| `h3_index` | TEXT | H3 cell index |
| `group_id` | TEXT | FK → groups.id (or user ID for solo) |
| `discovered_at` | TEXT | ISO 8601 |
| PRIMARY KEY | | (h3_index, group_id) |

### `runs`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `user_id` | TEXT | FK → users.id |
| `strava_activity_id` | TEXT nullable | Strava activity ID |
| `run_type` | TEXT | "solo", "double", "group" |
| `distance_m` | REAL | Total distance in meters |
| `duration_s` | INTEGER | Duration in seconds |
| `cells_traversed` | TEXT | JSON array of H3 index strings |
| `cells_captured` | INTEGER | Count of cells flipped to user's group |
| `points_earned` | INTEGER | Territory points contributed |
| `sp_earned` | REAL | Skill points earned this run |
| `created_at` | TEXT | ISO 8601 |

**Storage estimate**: ~200 bytes per run row. 10K runs = ~2MB. Very efficient.

### `raids`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `attacker_group_id` | TEXT | FK → groups.id |
| `target_cells` | TEXT | JSON array of H3 indexes (1–5 cells) |
| `starts_at` | TEXT | ISO 8601 — when vulnerability begins |
| `ends_at` | TEXT | ISO 8601 — starts_at + 24 hours |
| `status` | TEXT | "scheduled", "active", "completed" |
| `created_at` | TEXT | ISO 8601 |

### Indexes

```sql
CREATE INDEX idx_cells_h3 ON cells(h3_index);
CREATE INDEX idx_cells_group ON cells(group_id);
CREATE INDEX idx_discovered_group ON discovered_cells(group_id);
CREATE INDEX idx_runs_user ON runs(user_id);
CREATE INDEX idx_runs_created ON runs(created_at);
CREATE INDEX idx_raids_status ON raids(status);
CREATE INDEX idx_raids_target_group ON raids(attacker_group_id);
CREATE INDEX idx_users_group ON users(group_id);
CREATE INDEX idx_users_strava ON users(strava_id);
```

### Storage Estimates (D1 Free Tier: 5GB)

- **Users**: ~300 bytes/row. 10K users = ~3MB
- **Cells**: ~100 bytes/row. 100K active cells = ~10MB
- **Discovered cells**: ~80 bytes/row. 500K discoveries = ~40MB
- **Runs**: ~200 bytes/row. 100K runs = ~20MB
- **Skill levels**: ~50 bytes/row. 50K entries = ~2.5MB
- **Raids**: ~200 bytes/row. 5K raids = ~1MB
- **Total estimate for moderate scale**: ~75MB (1.5% of 5GB free tier)

---

## Monetization

- **Completely free** at launch — no monetization
- Focus on building the player base and game loop first
- Potential future options: cosmetics (neon colors, map themes, group badges)

---

## Summary

- **Turf** is a social running strategy game where players fight over real-world territory  
- PWA built for all platforms, runs imported via Strava  
- Dark tactical Tron-inspired UI with mystical fog of war  
- Map divided into H3 hex cells — 1 point per cell per runner per run  
- Instant ownership flip to highest point holder  
- Solo, double, and group runs with distinct skill trees  
- Skills upgraded with SP earned from running and capturing  
- Fixed groups/clans (max 15), full fog sharing  
- Group streaks maintain territory strength  
- Pre-scheduled raids with vulnerability windows  
- No passive decay — territory only lost to active enemies  
- Local + global leaderboards with group and individual sections  
- Free at launch, no monetization  

---

## Positioning Line

- **Turf — A social running game where you and your people fight for the places you actually run.**  

Or:

- **Run to explore. Run to conquer. Run to hold your ground.**