# Turf Runner — Future Ideas

Features deferred from the MVP to keep the initial build simple. These are fully designed and ready to implement when the time comes.

---

## Double & Group Run Types

At launch, all runs are solo. These run types add complexity via auto-detection, pairing logic, and separate scoring.

### Double Runs (2 runners from the same group)

- Auto-detected from GPS/timing or Strava group activity data
- Both runners earn 1 point per cell + double-exclusive skills active
- Each runner selects their own double skill

### Group Runs (3+ runners from the same group)

- Auto-detected the same way
- Each runner earns 1 point per cell + group-exclusive skills active
- Group skills are more powerful than solo/double skills

### Run Detection

- Doubles and groups can **only** form between members of the same group/clan
- A solo player without a group cannot pair with someone from another group
- Auto-detection: the app determines if a run was solo, double, or group based on GPS/timing data
- If runs are imported via Strava, use Strava's group activity data to detect co-runners
- No manual linking required

---

## Double Skills

Five skills exclusive to double runs (2 players from the same group):

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

---

## Group Skills

Five skills exclusive to group runs (3+ runners from the same group):

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

---

## Raid System

Group-coordinated attacks on enemy territory with voting, scheduling, and vulnerability windows.

### Raid Mechanics

- **Raid Voting**: any group member can propose a raid by selecting 1–5 enemy H3 cells on the map
- Proposed raid targets are shown to all group members for voting
- If **>50% of group members** vote to approve, the raid is activated
- Marked cells become **vulnerable for 24 hours**
- During the vulnerability window, attacker points in those cells are amplified
- **Defenders are notified** when their territory is marked for a raid
- **Raid limit**: 1 raid per group per week

### Raid Flow

1. Member taps "Propose Raid" on the Group page
2. Map overlay opens — member selects 1–5 enemy hexes
3. Proposal is submitted to the group
4. Group members see the proposal and can vote yes/no
5. Once >50% vote yes, the raid begins (24h window opens)
6. If rejected or timed out (48h), the proposal is discarded

### Raid Effects

- Encourages planning and coordination
- Creates anticipation ("they've marked our park for 6pm Saturday")
- Enables defense/retake battles with actual stakes
- Gives runs clear military-style objectives
- Defenders can rally group members to run the zone during the window

### Raid Database Table

```sql
CREATE TABLE raids (
  id TEXT PRIMARY KEY,
  attacker_group_id TEXT,
  target_cells TEXT,        -- JSON array of H3 indexes (1–5 cells)
  starts_at TEXT,           -- ISO 8601
  ends_at TEXT,             -- starts_at + 24 hours
  status TEXT,              -- "scheduled", "active", "completed"
  created_at TEXT
);
```

---

## Repeat-Run Streak System

Consecutive-day runs in owned territory build up streak multipliers.

### Mechanics

- **Group streak**: any member running through owned cells on consecutive days maintains the streak
- Not everyone needs to show up — at least one member per day keeps it alive
- Streak increases bonus points earned in those cells

### Point Multiplier

- Day 1 = 1 point
- Day 2 = 2 points
- Day 3 = 4 points
- Day 4 = 6 points
- Day 5 = 8 points
- Day 6 = 10 points
- Day 7 = 13 points

### Why Streaks Work

- Consistency and social accountability
- Habit formation
- Strategic delegation within the group
- "Someone needs to run our zone today"

### Database Columns (on territory/cells table)

- `streak_days INTEGER DEFAULT 0`
- `streak_last_date TEXT` — YYYY-MM-DD

---

## Privacy Zones

Manual privacy zone where runs do not register for gameplay.

- Players set a radius around their home location
- Runs within the privacy zone do not contribute cell points
- Protects home locations from being inferred by rivals
- Other players cannot see activity within anyone's privacy zone

### Database Columns (on users table)

- `privacy_radius_m INTEGER DEFAULT 200`
- `privacy_lat REAL`
- `privacy_lng REAL`

---

## Notifications

Push notifications derived from existing game data.

- **Run results**: summary (cells captured, points earned, SP gained)
- **Group news**: member joined/left, territory captured/lost, streaks broken
- **Raid alerts**: when your territory is marked for a raid
- Expand based on need after launch

---

## Advanced Leaderboards

Local and global rankings with detailed sections.

- **Local leaderboard**: groups and individuals ranked within a geographic area
- **Global leaderboard**: overall rankings across all players
- **Group section**: ranks groups by total owned cells, streaks, captures
- **Individual section**: ranks players by SP earned, cells captured, contribution stats

---

## Monetization Ideas

- Cosmetics: neon colors, map themes, group badges
- Premium features TBD based on what players value

---

## Advanced Engagement Scenarios

With all features active, the game should make users want to say:

- "We need to defend this loop tonight."
- "If one person misses tomorrow, we lose our streak bonus."
- "We should mark that area for a raid before the Saturday long run."
