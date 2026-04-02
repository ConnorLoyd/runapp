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
- Color palette: deep dark base, with neon orange and warm amber as primary UI accents. Territory colors are owner-chosen (groups and solo players pick their color). Your own territory is outlined in neon orange.

### Map & Fog of War

- **Fog of war** shows a slightly greyed-out real map with territory colors visible, but **no detail data** (no owner names, no point counts, no labels)
- You can see territory exists and what color it is, but not who owns it or the specifics
- Explored (discovered) areas reveal full detail: owner info, point data, hex labels
- Territory ownership shown through the owner's chosen color filling the hex cell
- Your own cells are outlined with a **neon orange border** to stand out

### Unauthenticated View

- Users can open the app **without signing in** and see the map
- Without auth, they see only the fog of war view: territory colors on a muted map, no detail data
- No profile, groups, skills, or leaderboard access until signed in via Strava

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
- Overlaid stats: held territories count, total points, group status
- Users should be able to open the app, see the current state of the game, plan a route, and stay informed at a glance
- Quick-access buttons: Group page, Skills, Profile
- Map shows: fog of war, owned cells (color-coded), contested zones

### Key Screens

1. **Territory Map** (home) — full interactive map with overlays and quick stats
2. **Group Management** — roster, member skills, group stats, invite/leave
   - **Layout order** (top to bottom):
     1. Group stats bar (zones held, total points, rank)
     2. Members roster — each member shows name, equipped skill, contribution stats
     3. Group Management — invite players (share link/code), view join requests, leave group
3. **Skills** — single skill category (solo), upgrade paths, SP balance
4. **Leaderboard** — single leaderboard ranking groups and individuals by total cells owned
5. **Player Profile** — equipped skill with level, run stats, contribution history
6. **Settings** — account management

### Screen Details

- **Player profile** prominently displays equipped skill with its level
- **Group roster** shows each member's equipped skill and level
- Run results appear as a summary after a run is imported (cells captured, points earned, SP gained)

### Social Features

- **No in-app chat** — players use external tools (Discord, iMessage, etc.) for communication
- Keeps the app focused and the database simple

---

## User Engagement Scenarios

The game should make users want to say:

- "Let's go scout the park."  
- "We need someone to run that loop today — they're gaining on us."  
- "I found a bunch of unclaimed territory near the river."  
- "Our group owns this whole neighborhood."  

---

## Game Mechanics and Run Types

- A real-world territory control game for runners  
- Territory is shaped by running through it — every run counts  

### Run Types

- **Solo only** at launch — all runs are individual
- If a player is in a group, their solo runs contribute points to the group's territory
- Multiple group members running independently still strengthen the group collectively

### Run Recording & Import

- Runs are recorded on the runner's personal device (Garmin, Apple Watch, phone, etc.)
- Runs are **uploaded/synced** via:
  - **Strava integration** (primary) — link Strava account, runs auto-import
  - Manual upload as a fallback option
- The app processes the GPS route to calculate which H3 cells were traversed
- No real-time GPS streaming — results are processed after the run
- This keeps the system simple and lets runners use whatever device/app they prefer

---

## Core Gameplay Loops

Core loop:

- Discovering territory (fog of war)  
- Capturing territory (running through unclaimed cells)  
- Defending territory (running through your cells to build points)  
- Weakening enemy territory (running through their cells)  

---

## Unique Game Features and Strategy

- Fog of war map (must run to reveal areas)  
- Group-shared map knowledge  
- Solo skills with specialized powers  
- Zones have **phases**, not instant ownership  

---

## Gameplay Mechanics and Territory Dynamics

- Enter unknown territory → reveal it  
- Discovered territory can be captured, weakened, or defended  
- Rival groups/players can weaken your zones by running through them  
- Local rivalries form over time  

### Zone Capture Rules

- **Pass-through capture**: running through an H3 cell contributes **1 RP** (Run Point) to that cell for your entity
- This encourages covering ground and exploring new territory
- A run counts **once per cell per runner per run** (anti-farming)
- RP contributed to cells is also added to your personal RP balance (spendable on skills)

### Zone Ownership

- **Instant flip**: whichever entity has the most total RP in a cell owns it
- Ownership changes immediately when a rival surpasses the current leader's RP total
- Creates a fast-paced, dynamic map that rewards activity

### Territory Decay

- **No passive decay** — RP does not decrease over time
- Territory is only lost when an enemy accumulates more RP in that cell
- Encourages offensive play and discourages passive sitting

### Run Validation

- **Minimum distance**: a run must be at least **0.5 miles** total to count for gameplay
- Prevents gaming with tiny movements (walking to the mailbox, driving)
- Inclusive of all running paces — no speed requirement
- GPS track is recorded and distance calculated from the route

---

## Fog of War and Discovery

- The entire map is visible but **greyed out / muted** in undiscovered areas
- Territory colors are visible everywhere (you can see the competitive landscape)
- **Discovered areas** reveal full detail: owner names, point breakdowns, hex labels
- **Undiscovered areas** show only territory colors on a muted map — no data overlay
- Players must physically run through areas to unlock full detail
- Creates a "I can see something is there but I need to go find out" feeling

---

## Collaborative Discovery

- **Full fog sharing**: when one group member explores a cell, all group members see it on their map
- Solo exploration benefits the entire group immediately
- If a player is **not** in a group, their fog of war is personal
- If a player **joins** a group, they see the group's fog of war (their personal discoveries remain for if they leave)
- If a player **leaves** a group, they lose visibility of the group's discoveries but retain their own personal discoveries from solo play
- The group keeps all discoveries even when members leave

---

## Zone States / Phases

Simplified to 3 phases:

- **Hidden** — covered by fog of war, not yet explored by this player/group
- **Unclaimed** — visible on the map, no one has contributed points yet
- **Owned** — at least one player/group has points in the cell; highest total owns it
  - Contested zones (close point totals) could pulse or shimmer to indicate vulnerability

### Territory Color System

Territory hex colors are **owner-based**:

- **Groups** choose a group color when created — all territory owned by the group shows that color
- **Solo players** (no group) choose a personal color in their profile
- **Your territory** (cells you/your group own) is additionally outlined with a **neon orange border**
- **Neutral / Unclaimed Territory**: no fill color — just the base map

### Hex Cell Labels (Discovered Areas Only)

In areas you've explored (discovered), each hex cell displays (at close zoom):

**Defense & Attack RP**:
- **Defense RP** (🛡️): shown large and prominent — the owning entity's total RP in the cell
- **Attack RP** (⚔️): shown smaller underneath
  - On **enemy hexes**: your contributed RP displayed in **green** (you're chipping away at it)
  - On **your hexes**: the next highest entity's RP displayed in **red** (how close they are to flipping)
- Labels fade out at wider zoom levels to keep the map clean

**Owner Indicator**:
- Each owned hex shows who controls it:
  - **Solo player**: avatar/initials — clickable to view profile
  - **Group**: group icon + initials — clickable to view group info
- Clicking an owner indicator opens a compact info card
- Neutral cells show no owner indicator
- **None of this data is visible in undiscovered (fog) areas** — only territory colors show

---

## Fair Play System

- A run counts **once per cell per runner per run**
- Prevents farming by running back and forth
- Minimum **0.5 mile** total run distance required for a run to count

Ownership model:

- Running through a cell adds 1 RP to your entity in that cell
- Ownership = whichever entity has the most RP (instant flip)
- No passive decay — only lost when outcompeted

---

## RP (Run Points) System

Single unified currency for everything:

- **1 RP per cell** traversed during a run (skills can multiply this)
- RP goes to the cell (territory control) AND adds to your **Lifetime RP**
- **Lifetime RP** = total RP earned from all runs (only goes up, shown on profile, equals your total map investment)
- **Available RP** = Lifetime RP minus RP spent on skills (your spendable balance)
- Spending RP on skill upgrades reduces Available RP but **never** reduces your map presence or Lifetime RP
- Whether you're attacking (enemy cell) or defending (your cell), the RP mechanics are the same

### Example

- Run through 20 cells → 20 RP earned (Lifetime: 20, Available: 20)
- Spend 5 RP on a skill upgrade → (Lifetime: 20, Available: 15)
- Run through 15 more cells → (Lifetime: 35, Available: 30)
- Your 35 RP on the map stays exactly where you put it

---

## Skill System

### How Skills Work

- Every player has **one skill slot**
- **Only 1 skill equipped** at a time — the active skill applies on every run
- Players can upgrade any skill using RP from their personal balance
- Upgraded skills become more effective (wider radius, more RP, stronger effects)

### Skills

- **Wide Scan** — Reveals adjacent H3 cells as you run, expanding fog reveal beyond just the cells you pass through
  - Lv1: 1 ring | Lv2: 1 ring + 25% chance of 2nd ring | Lv3: 2 rings | Lv4: 2 rings + 25% chance of 3rd | Lv5: 3 rings

- **Strike Force** — Your RP counts for more in enemy-owned cells (attack bonus, doesn't boost friendly territory)
  - Lv1: 1.5x RP in enemy cells | Lv2: 1.75x | Lv3: 2x | Lv4: 2.5x | Lv5: 3x

- **Shield** — Your runs in friendly-owned cells add bonus RP, reinforcing territory
  - Lv1: +0.5 bonus RP per cell | Lv2: +1 | Lv3: +1.5 | Lv4: +2 | Lv5: +2.5

- **Trailblazer** — Earn bonus RP when running through unclaimed or newly discovered cells
  - Lv1: +1 bonus RP per new cell | Lv2: +1.5 | Lv3: +2 | Lv4: +2.5 | Lv5: +3

- **Ghost Run** — Enemy players/groups don't see your activity in their territory
  - Lv1: 50% stealth chance | Lv2: 65% | Lv3: 80% | Lv4: 90% | Lv5: 100% stealth

### Skill Upgrades

- Each skill has **5 upgrade levels**
- Cost per level: Lv1 = 5 RP | Lv2 = 15 RP | Lv3 = 30 RP | Lv4 = 50 RP | Lv5 = 80 RP
- Total to max one skill: 180 RP
- Total to max all 5 skills: 900 RP

---

## Progression

- Players progress by:
  - Taking land (capturing cells)
  - Contributing RP to territory (running through cells)
  - Upgrading skills with earned RP

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
- Groups have "home turf"
- Solo runs support group success

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

- Fog of war unlocked by running (muted map with colors visible, detail on discovery)
- Shared map knowledge (group fog sharing)
- Solo runs with skill system
- 1 RP per cell per runner, instant ownership flip
- 3-phase zones (Hidden → Unclaimed → Owned)
- Anti-farming rules (once per cell per runner per run)
- 0.5 mile minimum run distance
- Simple group system (invite/leave, shared RP contributions and fog)
- Single currency: RP for territory control and skill upgrades

---

## Resolved Design Decisions

### Territory Design

- Zones defined using **H3 hexagonal grid cells** (Uber's hierarchical spatial index)
- H3 provides uniform hexagonal tiling at multiple resolutions
- Likely resolution: **H3 res 9** (~174m edge length, ~0.1 km² area) — tunable
- Benefits: predictable, scalable, no curation needed, game-like hex aesthetic fits the Tron theme
- Ownership tracked per H3 cell with entity (player or group) RP totals

### Map Data

- H3 cells generated dynamically based on player location
- Ownership stored as RP totals per cell per entity
- Runnable areas determined by GPS tracking (any area a player runs through counts)

### Ownership Rules

- Instant flip: highest point total in a cell owns it
- No passive decay — only weakened by enemy runs

### Group Systems

- **Simple groups**: one persistent group per player with a name, roster, and shared fog of war
- Max group size: **15 members**
- Fog sharing: **full share** — one member explores, all group members see it revealed
- Solo players have personal fog of war and personal territory
- Players in a group contribute points to the group and see the group's fog
- **Leaving a group**: contributed points stay with the old group (prevents sabotage). Player starts fresh. Player retains only personal discoveries from before joining.

### Safety

- Standard safety: age verification, block/report system

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

---

## Database Schema (Cloudflare D1 / SQLite)

Design principles: sparse storage (only store active data), minimal columns, integers over text where possible. Optimized for D1 free tier (5GB storage). 5 lean tables.

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `strava_id` | TEXT UNIQUE | Strava user ID |
| `display_name` | TEXT | |
| `group_id` | TEXT nullable | FK → groups.id |
| `color` | TEXT DEFAULT '#4ade80' | Chosen territory color (used when solo) |
| `rp_lifetime` | INTEGER DEFAULT 0 | Total RP earned (never decreases) |
| `rp_spent` | INTEGER DEFAULT 0 | Total RP spent on skill upgrades |
| `equipped_skill` | TEXT nullable | Equipped skill name |
| `wide_scan_level` | INTEGER DEFAULT 0 | Level 0–5 |
| `strike_force_level` | INTEGER DEFAULT 0 | Level 0–5 |
| `shield_level` | INTEGER DEFAULT 0 | Level 0–5 |
| `trailblazer_level` | INTEGER DEFAULT 0 | Level 0–5 |
| `ghost_run_level` | INTEGER DEFAULT 0 | Level 0–5 |
| `created_at` | TEXT | ISO 8601 timestamp |

### `groups`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `name` | TEXT UNIQUE | Group display name |
| `owner_id` | TEXT | FK → users.id (group creator) |
| `color` | TEXT DEFAULT '#3b82f6' | Chosen territory color |
| `created_at` | TEXT | ISO 8601 |

Membership tracked via `users.group_id`. Max 15 enforced in app logic.

### `territory`

Sparse territory storage. Only rows for cells that have been interacted with.

| Column | Type | Notes |
|---|---|---|
| `h3_index` | TEXT | H3 cell index string |
| `entity_id` | TEXT | group_id or user_id (for solo players) |
| `rp` | INTEGER DEFAULT 0 | Total accumulated RP |
| PRIMARY KEY | | (h3_index, entity_id) |

One row per cell per entity. Ownership = `SELECT entity_id FROM territory WHERE h3_index = ? ORDER BY rp DESC LIMIT 1`.

### `discovered_cells`

Tracks fog of war reveals per entity (group or solo player).

| Column | Type | Notes |
|---|---|---|
| `h3_index` | TEXT | H3 cell index |
| `entity_id` | TEXT | group_id or user_id |
| PRIMARY KEY | | (h3_index, entity_id) |

Insert with `INSERT OR IGNORE` — atomic, no read-modify-write needed.

### `runs`

Lightweight run history for dedup and stats.

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT PK | UUID |
| `user_id` | TEXT | FK → users.id |
| `strava_activity_id` | TEXT UNIQUE | Strava activity ID (prevents double-counting) |
| `cells_count` | INTEGER | Number of H3 cells traversed |
| `rp_earned` | INTEGER DEFAULT 0 | RP earned this run |
| `created_at` | TEXT | ISO 8601 |

### Indexes

```sql
CREATE INDEX idx_territory_h3 ON territory(h3_index);
CREATE INDEX idx_territory_entity ON territory(entity_id);
CREATE INDEX idx_discovered_entity ON discovered_cells(entity_id);
CREATE INDEX idx_runs_user ON runs(user_id);
CREATE INDEX idx_users_group ON users(group_id);
CREATE INDEX idx_users_strava ON users(strava_id);
```

### Storage Estimates (D1 Free Tier: 5GB)

- **Users**: ~200 bytes/row. 10K users = ~2MB
- **Territory**: ~60 bytes/row. 100K active cells = ~6MB
- **Discovered cells**: ~40 bytes/row. 500K discoveries = ~20MB
- **Runs**: ~120 bytes/row. 100K runs = ~12MB
- **Groups**: ~100 bytes/row. 1K groups = ~100KB
- **Total estimate for moderate scale**: ~40MB (<1% of 5GB free tier)

---

## Monetization

- **Completely free** at launch — no monetization
- Focus on building the player base and game loop first

---

## Summary

- **Turf** is a social running strategy game where players fight over real-world territory
- PWA built for all platforms, runs imported via Strava
- Dark tactical Tron-inspired UI with mystical fog of war
- Map divided into H3 hex cells — 1 RP per cell per runner per run
- Instant ownership flip to highest RP holder
- Solo runs only at launch, with 5 upgradeable skills (RP as single currency)
- Simple groups: invite/leave, shared fog of war, pooled territory RP
- No passive decay — territory only lost to active enemies
- Single leaderboard ranking groups and individuals by cells owned
- Free at launch, no monetization

---

## Positioning Line

- **Turf — A social running game where you and your people fight for the places you actually run.**

Or:

- **Run to explore. Run to conquer. Run to hold your ground.**