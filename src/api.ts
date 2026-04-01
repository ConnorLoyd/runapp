// API route handlers for Turf game backend
// Current user hardcoded to usr-alex (no auth until Strava integration)

const CURRENT_USER_ID = 'usr-alex';

// SP costs to reach each level: index 0 = cost for Lv1, index 4 = cost for Lv5
const LEVEL_COSTS = [5, 15, 30, 50, 80];

// Skill metadata
const SKILL_META: Record<string, { category: string; icon: string }> = {
  'wide-scan': { category: 'solo', icon: '🔭' },
  'strike-force': { category: 'solo', icon: '💥' },
  'shield': { category: 'solo', icon: '🛡️' },
  'trailblazer': { category: 'solo', icon: '🏃' },
  'ghost-run': { category: 'solo', icon: '👻' },
  'recon-sweep': { category: 'double', icon: '📡' },
  'combined-arms': { category: 'double', icon: '⚔️' },
  'fortify-pair': { category: 'double', icon: '🏰' },
  'sync-bonus': { category: 'double', icon: '🔗' },
  'lockdown': { category: 'double', icon: '🔒' },
  'war-march': { category: 'group', icon: '🚩' },
  'iron-curtain': { category: 'group', icon: '🧱' },
  'rally-cry': { category: 'group', icon: '📢' },
  'bounty-hunt': { category: 'group', icon: '💰' },
  'siege-engine': { category: 'group', icon: '🏗️' },
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  try {
    if (path === '/api/me' && method === 'GET') return await getMe(env);
    if (path === '/api/territory' && method === 'GET') return await getTerritory(env);
    if (path === '/api/group' && method === 'GET') return await getGroup(env);
    if (path === '/api/runs' && method === 'GET') return await getRuns(env);
    if (path === '/api/runs' && method === 'POST') return await submitRun(env, await request.json() as RunSubmission);
    if (path === '/api/skills/equip' && method === 'POST') return await equipSkill(env, await request.json() as SkillEquipReq);
    if (path === '/api/skills/levelup' && method === 'POST') return await levelUpSkill(env, await request.json() as SkillLevelUpReq);
    if (path === '/api/seed-territory' && method === 'POST') return await seedTerritory(env, await request.json() as SeedTerritoryReq);
    return json({ error: 'Not found' }, 404);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    console.error('API Error:', e);
    return json({ error: msg }, 500);
  }
}

// ==================== Types ====================

interface RunSubmission {
  cells: string[];
  runType: 'solo' | 'double' | 'group';
  distanceMiles?: number;
  revealedCells?: string[];  // Client-computed fog reveal (from h3 kRing based on skill)
}

interface SkillEquipReq {
  skillId: string;
  category: 'solo' | 'double' | 'group';
}

interface SkillLevelUpReq {
  skillId: string;
  category: 'solo' | 'double' | 'group';
}

interface SeedTerritoryReq {
  territory: Array<{ cellId: string; groupId: string; points: number }>;
  explored: Array<{ cellId: string; groupId: string }>;
}

// ==================== GET /api/me ====================

async function getMe(env: Env): Promise<Response> {
  const db = env.DB;

  const user = await db.prepare(
    'SELECT * FROM users WHERE id = ?'
  ).bind(CURRENT_USER_ID).first();

  if (!user) return json({ error: 'User not found' }, 404);

  const skills = await db.prepare(
    'SELECT skill_id, skill_category, level FROM user_skills WHERE user_id = ?'
  ).bind(CURRENT_USER_ID).all();

  let group = null;
  if (user.group_id) {
    group = await db.prepare(
      'SELECT id, name, tag, member_count, total_zones, total_points, streak_days, streak_last_date, invite_code FROM groups WHERE id = ?'
    ).bind(user.group_id).first();
  }

  return json({
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      avatarInitials: user.avatar_initials,
      skillPoints: user.skill_points,
      totalSpEarned: user.total_sp_earned,
      totalCellsCaptured: user.total_cells_captured,
      totalRuns: user.total_runs,
      totalDistanceMiles: user.total_distance_miles,
      groupId: user.group_id,
      soloSkill: user.solo_skill,
      soloSkillLevel: user.solo_skill_level,
      doubleSkill: user.double_skill,
      doubleSkillLevel: user.double_skill_level,
      groupSkill: user.group_skill,
      groupSkillLevel: user.group_skill_level,
      homeLat: user.home_lat,
      homeLng: user.home_lng,
      homeName: user.home_name,
    },
    skills: skills.results.map((s: Record<string, unknown>) => ({
      skillId: s.skill_id,
      category: s.skill_category,
      level: s.level,
    })),
    group: group ? {
      id: group.id,
      name: group.name,
      tag: group.tag,
      memberCount: group.member_count,
      totalZones: group.total_zones,
      totalPoints: group.total_points,
      streakDays: group.streak_days,
      inviteCode: group.invite_code,
    } : null,
  });
}

// ==================== GET /api/territory ====================

async function getTerritory(env: Env): Promise<Response> {
  const db = env.DB;

  // Get user's group
  const user = await db.prepare('SELECT group_id FROM users WHERE id = ?').bind(CURRENT_USER_ID).first();
  if (!user) return json({ error: 'User not found' }, 404);

  const groupId = user.group_id as string | null;

  // Get explored cells (fog of war is always per-user)
  const exploredRows = await db.prepare(
    'SELECT DISTINCT cell_id FROM explored_cells WHERE user_id = ?'
  ).bind(CURRENT_USER_ID).all();

  const explored = exploredRows.results.map((r: Record<string, unknown>) => r.cell_id as string);

  // Get cell_points for all explored cells
  const cells: Record<string, Record<string, number>> = {};

  if (explored.length > 0) {
    // Query in batches of 50 to stay within D1's SQL variable limit
    for (let i = 0; i < explored.length; i += 50) {
      const batch = explored.slice(i, i + 50);
      const placeholders = batch.map(() => '?').join(',');
      const rows = await db.prepare(
        `SELECT cell_id, group_id, points FROM cell_points WHERE cell_id IN (${placeholders})`
      ).bind(...batch).all();

      for (const row of rows.results as Array<Record<string, unknown>>) {
        const cid = row.cell_id as string;
        const gid = row.group_id as string;
        if (!cells[cid]) cells[cid] = {};
        cells[cid][gid] = row.points as number;
      }
    }
  }

  // Get group info for all groups that appear in cell_points
  const groupIds = new Set<string>();
  for (const cellGroups of Object.values(cells)) {
    for (const gid of Object.keys(cellGroups)) {
      groupIds.add(gid);
    }
  }

  const groups: Record<string, { name: string; tag: string; memberCount: number }> = {};
  if (groupIds.size > 0) {
    const gidArr = Array.from(groupIds);
    const placeholders = gidArr.map(() => '?').join(',');
    const gRows = await db.prepare(
      `SELECT id, name, tag, member_count FROM groups WHERE id IN (${placeholders})`
    ).bind(...gidArr).all();

    for (const g of gRows.results as Array<Record<string, unknown>>) {
      groups[g.id as string] = {
        name: g.name as string,
        tag: g.tag as string,
        memberCount: g.member_count as number,
      };
    }
  }

  return json({ explored, cells, groups, userGroupId: groupId });
}

// ==================== GET /api/group ====================

async function getGroup(env: Env): Promise<Response> {
  const db = env.DB;

  const user = await db.prepare('SELECT group_id FROM users WHERE id = ?').bind(CURRENT_USER_ID).first();
  if (!user || !user.group_id) return json({ error: 'Not in a group' }, 404);

  const groupId = user.group_id as string;

  const [group, members, activity, raids, joinRequests] = await Promise.all([
    db.prepare('SELECT * FROM groups WHERE id = ?').bind(groupId).first(),
    db.prepare(
      `SELECT id, display_name, avatar_initials, total_cells_captured, total_runs, total_sp_earned,
              solo_skill, solo_skill_level, double_skill, double_skill_level, group_skill, group_skill_level
       FROM users WHERE group_id = ? ORDER BY total_cells_captured DESC`
    ).bind(groupId).all(),
    db.prepare(
      'SELECT * FROM activity_log WHERE group_id = ? ORDER BY created_at DESC LIMIT 20'
    ).bind(groupId).all(),
    db.prepare(
      "SELECT * FROM raids WHERE group_id = ? AND status IN ('proposed', 'active') ORDER BY created_at DESC LIMIT 5"
    ).bind(groupId).all(),
    db.prepare(
      "SELECT jr.*, u.display_name, u.avatar_initials, u.total_runs, u.total_sp_earned FROM join_requests jr LEFT JOIN users u ON jr.user_id = u.id WHERE jr.group_id = ? AND jr.status = 'pending'"
    ).bind(groupId).all(),
  ]);

  if (!group) return json({ error: 'Group not found' }, 404);

  // Count zones owned
  const zonesResult = await db.prepare(`
    SELECT COUNT(*) as cnt FROM cell_points cp1
    WHERE cp1.group_id = ?
    AND NOT EXISTS (
      SELECT 1 FROM cell_points cp2
      WHERE cp2.cell_id = cp1.cell_id
      AND cp2.group_id != cp1.group_id
      AND cp2.points > cp1.points
    )
  `).bind(groupId).first();

  return json({
    group: {
      id: group.id,
      name: group.name,
      tag: group.tag,
      leaderId: group.leader_id,
      inviteCode: group.invite_code,
      memberCount: group.member_count,
      totalZones: (zonesResult as Record<string, unknown>)?.cnt ?? group.total_zones,
      totalPoints: group.total_points,
      streakDays: group.streak_days,
      maxMembers: group.max_members,
    },
    members: (members.results as Array<Record<string, unknown>>).map(m => ({
      id: m.id,
      displayName: m.display_name,
      avatarInitials: m.avatar_initials,
      totalCellsCaptured: m.total_cells_captured,
      totalRuns: m.total_runs,
      totalSpEarned: m.total_sp_earned,
      soloSkill: m.solo_skill,
      soloSkillLevel: m.solo_skill_level,
      doubleSkill: m.double_skill,
      doubleSkillLevel: m.double_skill_level,
      groupSkill: m.group_skill,
      groupSkillLevel: m.group_skill_level,
    })),
    activity: (activity.results as Array<Record<string, unknown>>).map(a => ({
      eventType: a.event_type,
      message: a.message,
      createdAt: a.created_at,
      userId: a.user_id,
    })),
    raids: raids.results,
    joinRequests: (joinRequests.results as Array<Record<string, unknown>>).map(jr => ({
      id: jr.id,
      userId: jr.user_id,
      displayName: jr.display_name,
      avatarInitials: jr.avatar_initials,
      totalRuns: jr.total_runs,
      totalSpEarned: jr.total_sp_earned,
    })),
  });
}

// ==================== GET /api/runs ====================

async function getRuns(env: Env): Promise<Response> {
  const db = env.DB;

  const runs = await db.prepare(
    'SELECT * FROM runs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
  ).bind(CURRENT_USER_ID).all();

  return json({
    runs: (runs.results as Array<Record<string, unknown>>).map(r => ({
      id: r.id,
      runType: r.run_type,
      distanceMiles: r.distance_miles,
      cellsTraversed: r.cells_traversed,
      cellsCaptured: r.cells_captured,
      pointsEarned: r.points_earned,
      spEarned: r.sp_earned,
      activeSkill: r.active_skill,
      activeSkillLevel: r.active_skill_level,
      createdAt: r.created_at,
    })),
  });
}

// ==================== POST /api/runs ====================

async function submitRun(env: Env, body: RunSubmission): Promise<Response> {
  const db = env.DB;

  // Validate
  if (!body.cells || !Array.isArray(body.cells) || body.cells.length === 0) {
    return json({ error: 'No cells selected' }, 400);
  }
  if (!['solo', 'double', 'group'].includes(body.runType)) {
    return json({ error: 'Invalid run type' }, 400);
  }

  // Deduplicate cells (anti-farming: once per cell per run)
  const cells = [...new Set(body.cells)];

  // Auto-calculate distance if not provided (~0.11 miles per H3 res 9 cell)
  const distanceMiles = body.distanceMiles || Math.max(0.5, cells.length * 0.11);
  if (distanceMiles < 0.5) return json({ error: 'Minimum 0.5 miles required' }, 400);

  // Get user
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(CURRENT_USER_ID).first() as Record<string, unknown> | null;
  if (!user) return json({ error: 'User not found' }, 404);

  const groupId = user.group_id as string | null;
  const runType = body.runType;

  // Get active skill for this run type
  let activeSkill: string | null = null;
  let activeSkillLevel = 0;
  if (runType === 'solo') {
    activeSkill = user.solo_skill as string | null;
    activeSkillLevel = user.solo_skill_level as number;
  } else if (runType === 'double') {
    activeSkill = user.double_skill as string | null;
    activeSkillLevel = user.double_skill_level as number;
  } else if (runType === 'group') {
    activeSkill = user.group_skill as string | null;
    activeSkillLevel = user.group_skill_level as number;
  }

  // Fetch existing cell_points for all run cells to determine current ownership
  const existingPoints: Record<string, Record<string, number>> = {};
  if (cells.length > 0) {
    for (let i = 0; i < cells.length; i += 50) {
      const batch = cells.slice(i, i + 50);
      const placeholders = batch.map(() => '?').join(',');
      const rows = await db.prepare(
        `SELECT cell_id, group_id, points FROM cell_points WHERE cell_id IN (${placeholders})`
      ).bind(...batch).all();

      for (const row of rows.results as Array<Record<string, unknown>>) {
        const cid = row.cell_id as string;
        const gid = row.group_id as string;
        if (!existingPoints[cid]) existingPoints[cid] = {};
        existingPoints[cid][gid] = row.points as number;
      }
    }
  }

  // Calculate skill bonuses
  let basePointsPerCell = 1;
  let attackMultiplier = 1;
  let defenseBonus = 0;
  let spMultiplier = 1;
  let captureBonus = 0;

  if (activeSkill && activeSkillLevel > 0) {
    switch (activeSkill) {
      case 'strike-force':
        attackMultiplier = [1, 1.5, 1.75, 2, 2.5, 3][activeSkillLevel] ?? 1;
        break;
      case 'shield':
        defenseBonus = [0, 0.5, 1, 1.5, 2, 2.5][activeSkillLevel] ?? 0;
        break;
      case 'war-march':
        basePointsPerCell += [0, 0.5, 0.75, 1, 1.5, 2][activeSkillLevel] ?? 0;
        break;
      case 'combined-arms':
        attackMultiplier = [1, 1.25, 1.4, 1.6, 1.8, 2][activeSkillLevel] ?? 1;
        break;
      case 'lockdown':
        captureBonus = [0, 2, 3, 4, 5, 6][activeSkillLevel] ?? 0;
        break;
      case 'bounty-hunt':
        spMultiplier = [1, 1.15, 1.22, 1.3, 1.4, 1.5][activeSkillLevel] ?? 1;
        break;
      case 'sync-bonus':
        spMultiplier = [1, 1.1, 1.15, 1.2, 1.25, 1.3][activeSkillLevel] ?? 1;
        break;
    }
  }

  // Process each cell
  const runId = 'run-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
  let totalPointsEarned = 0;
  let cellsCaptured = 0;
  let trailblazerSpBonus = 0;
  const statements: D1PreparedStatement[] = [];

  // Insert run record FIRST so run_cells FK is satisfied
  statements.push(
    db.prepare(
      `INSERT INTO runs (id, user_id, group_id, run_type, distance_miles, cells_traversed, cells_captured, points_earned, sp_earned, active_skill, active_skill_level)
       VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?)`
    ).bind(runId, CURRENT_USER_ID, groupId, runType, distanceMiles, cells.length, activeSkill, activeSkillLevel)
  );

  for (const cellId of cells) {
    const cellGroups = existingPoints[cellId] || {};
    let currentOwnerGroupId: string | null = null;
    let currentOwnerPoints = 0;

    for (const [gid, pts] of Object.entries(cellGroups)) {
      if (pts > currentOwnerPoints) {
        currentOwnerGroupId = gid;
        currentOwnerPoints = pts;
      }
    }

    const isEnemy = currentOwnerGroupId !== null && currentOwnerGroupId !== groupId;
    const isFriendly = currentOwnerGroupId === groupId;
    const isUnclaimed = currentOwnerGroupId === null;

    let cellPoints = basePointsPerCell;
    if (isEnemy) cellPoints *= attackMultiplier;
    if (isFriendly) cellPoints += defenseBonus;

    // Trailblazer bonus SP
    if (activeSkill === 'trailblazer' && activeSkillLevel > 0 && (isUnclaimed || !existingPoints[cellId])) {
      trailblazerSpBonus += [0, 1, 1.5, 2, 2.5, 3][activeSkillLevel] ?? 0;
    }

    totalPointsEarned += cellPoints;

    // Upsert cell points
    if (groupId) {
      statements.push(
        db.prepare(
          'INSERT INTO cell_points (cell_id, group_id, points) VALUES (?, ?, ?) ON CONFLICT(cell_id, group_id) DO UPDATE SET points = points + ?'
        ).bind(cellId, groupId, cellPoints, cellPoints)
      );
    } else {
      statements.push(
        db.prepare(
          'INSERT INTO cell_points_solo (cell_id, user_id, points) VALUES (?, ?, ?) ON CONFLICT(cell_id, user_id) DO UPDATE SET points = points + ?'
        ).bind(cellId, CURRENT_USER_ID, cellPoints, cellPoints)
      );
    }

    // Mark as explored (fog of war is always per-user)
    statements.push(
      db.prepare('INSERT OR IGNORE INTO explored_cells (cell_id, user_id) VALUES (?, ?)').bind(cellId, CURRENT_USER_ID)
    );

    // Check if ownership flipped (capture)
    let wasCaptured = 0;
    if (groupId) {
      const myNewPoints = (cellGroups[groupId] || 0) + cellPoints;
      if (!isFriendly && myNewPoints > currentOwnerPoints) {
        wasCaptured = 1;
        cellsCaptured++;
        if (captureBonus > 0) {
          statements.push(
            db.prepare('UPDATE cell_points SET points = points + ? WHERE cell_id = ? AND group_id = ?')
              .bind(captureBonus, cellId, groupId)
          );
        }
      }
    }

    // Run cell record
    statements.push(
      db.prepare(
        'INSERT INTO run_cells (run_id, cell_id, points_contributed, was_capture) VALUES (?, ?, ?, ?)'
      ).bind(runId, cellId, cellPoints, wasCaptured)
    );
  }

  // Insert fog-revealed cells from skill (Wide Scan / Recon Sweep)
  if (body.revealedCells && Array.isArray(body.revealedCells)) {
    const uniqueRevealed = [...new Set(body.revealedCells)];
    for (const rc of uniqueRevealed) {
      statements.push(
        db.prepare('INSERT OR IGNORE INTO explored_cells (cell_id, user_id) VALUES (?, ?)').bind(rc, CURRENT_USER_ID)
      );
    }
  }

  // Calculate SP earned
  let spEarned = 0.25 + totalPointsEarned + (cellsCaptured * 3) + trailblazerSpBonus;
  spEarned *= spMultiplier;
  spEarned = Math.round(spEarned * 100) / 100;

  // Update run record with final computed values
  statements.push(
    db.prepare(
      `UPDATE runs SET cells_captured = ?, points_earned = ?, sp_earned = ? WHERE id = ?`
    ).bind(cellsCaptured, totalPointsEarned, spEarned, runId)
  );

  // Update user stats
  statements.push(
    db.prepare(
      `UPDATE users SET skill_points = skill_points + ?, total_sp_earned = total_sp_earned + ?,
       total_cells_captured = total_cells_captured + ?, total_runs = total_runs + 1,
       total_distance_miles = total_distance_miles + ?, updated_at = datetime('now') WHERE id = ?`
    ).bind(spEarned, spEarned, cellsCaptured, distanceMiles, CURRENT_USER_ID)
  );

  // Activity log
  if (groupId) {
    const msg = `${user.display_name} completed a ${runType} run through ${cells.length} cells` +
      (cellsCaptured > 0 ? `, capturing ${cellsCaptured}` : '');
    statements.push(
      db.prepare(
        'INSERT INTO activity_log (group_id, user_id, event_type, message) VALUES (?, ?, ?, ?)'
      ).bind(groupId, CURRENT_USER_ID, cellsCaptured > 0 ? 'capture' : 'run_completed', msg)
    );
  }

  // Execute in batches of 40 to stay within D1 limits
  for (let i = 0; i < statements.length; i += 40) {
    await db.batch(statements.slice(i, i + 40));
  }

  // Update group total_zones (separate query after batch)
  if (groupId) {
    const zonesResult = await db.prepare(`
      SELECT COUNT(*) as cnt FROM cell_points cp1
      WHERE cp1.group_id = ?
      AND NOT EXISTS (
        SELECT 1 FROM cell_points cp2
        WHERE cp2.cell_id = cp1.cell_id AND cp2.group_id != cp1.group_id AND cp2.points > cp1.points
      )
    `).bind(groupId).first() as Record<string, unknown> | null;

    await db.prepare(
      'UPDATE groups SET total_zones = ?, total_points = total_points + ? WHERE id = ?'
    ).bind(zonesResult?.cnt ?? 0, Math.round(totalPointsEarned), groupId).run();
  }

  return json({
    runId,
    cellsTraversed: cells.length,
    cellsCaptured,
    pointsEarned: Math.round(totalPointsEarned * 100) / 100,
    spEarned,
    runType,
    distanceMiles: Math.round(distanceMiles * 100) / 100,
    activeSkill,
    activeSkillLevel,
  });
}

// ==================== POST /api/skills/equip ====================

async function equipSkill(env: Env, body: SkillEquipReq): Promise<Response> {
  const db = env.DB;
  const { skillId, category } = body;

  if (!skillId || !category) return json({ error: 'Missing skillId or category' }, 400);
  if (!SKILL_META[skillId]) return json({ error: 'Unknown skill' }, 400);
  if (SKILL_META[skillId].category !== category) return json({ error: 'Skill category mismatch' }, 400);

  // Get skill level (0 if not invested)
  const skill = await db.prepare(
    'SELECT level FROM user_skills WHERE user_id = ? AND skill_id = ?'
  ).bind(CURRENT_USER_ID, skillId).first() as Record<string, unknown> | null;

  const level = (skill?.level as number) ?? 0;

  // Update the equipped skill slot
  const colSkill = category === 'solo' ? 'solo_skill' : category === 'double' ? 'double_skill' : 'group_skill';
  const colLevel = category === 'solo' ? 'solo_skill_level' : category === 'double' ? 'double_skill_level' : 'group_skill_level';

  await db.prepare(
    `UPDATE users SET ${colSkill} = ?, ${colLevel} = ?, updated_at = datetime('now') WHERE id = ?`
  ).bind(skillId, level, CURRENT_USER_ID).run();

  return json({ skillId, category, level });
}

// ==================== POST /api/skills/levelup ====================

async function levelUpSkill(env: Env, body: SkillLevelUpReq): Promise<Response> {
  const db = env.DB;
  const { skillId, category } = body;

  if (!skillId || !category) return json({ error: 'Missing skillId or category' }, 400);
  if (!SKILL_META[skillId]) return json({ error: 'Unknown skill' }, 400);

  // Get user SP
  const user = await db.prepare(
    'SELECT skill_points, solo_skill, solo_skill_level, double_skill, double_skill_level, group_skill, group_skill_level FROM users WHERE id = ?'
  ).bind(CURRENT_USER_ID).first() as Record<string, unknown> | null;
  if (!user) return json({ error: 'User not found' }, 404);

  // Current level
  const skill = await db.prepare(
    'SELECT level FROM user_skills WHERE user_id = ? AND skill_id = ?'
  ).bind(CURRENT_USER_ID, skillId).first() as Record<string, unknown> | null;

  const currentLevel = (skill?.level as number) ?? 0;
  if (currentLevel >= 5) return json({ error: 'Skill already at max level' }, 400);

  const cost = LEVEL_COSTS[currentLevel];
  if (!cost) return json({ error: 'Invalid level' }, 400);

  const sp = user.skill_points as number;
  if (sp < cost) return json({ error: 'Not enough SP', required: cost, available: sp }, 400);

  const newLevel = currentLevel + 1;
  const statements: D1PreparedStatement[] = [];

  // Deduct SP
  statements.push(
    db.prepare(
      "UPDATE users SET skill_points = skill_points - ?, updated_at = datetime('now') WHERE id = ?"
    ).bind(cost, CURRENT_USER_ID)
  );

  // Upsert skill level
  statements.push(
    db.prepare(
      'INSERT INTO user_skills (user_id, skill_id, skill_category, level) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, skill_id) DO UPDATE SET level = ?'
    ).bind(CURRENT_USER_ID, skillId, category, newLevel, newLevel)
  );

  // If this skill is currently equipped, update the level in users table too
  const colSkill = category === 'solo' ? 'solo_skill' : category === 'double' ? 'double_skill' : 'group_skill';
  const colLevel = category === 'solo' ? 'solo_skill_level' : category === 'double' ? 'double_skill_level' : 'group_skill_level';
  const equippedSkill = user[colSkill] as string | null;

  if (equippedSkill === skillId) {
    statements.push(
      db.prepare(
        `UPDATE users SET ${colLevel} = ?, updated_at = datetime('now') WHERE id = ?`
      ).bind(newLevel, CURRENT_USER_ID)
    );
  }

  await db.batch(statements);

  return json({
    skillId,
    newLevel,
    spRemaining: sp - cost,
    cost,
    nextCost: newLevel < 5 ? LEVEL_COSTS[newLevel] : null,
  });
}

// ==================== POST /api/seed-territory ====================

async function seedTerritory(env: Env, body: SeedTerritoryReq): Promise<Response> {
  const db = env.DB;

  if (!body.territory || !body.explored) {
    return json({ error: 'Missing territory or explored data' }, 400);
  }

  // Check if territory already exists (don't re-seed)
  const existing = await db.prepare('SELECT COUNT(*) as cnt FROM cell_points').first() as Record<string, unknown>;
  if ((existing?.cnt as number) > 0) {
    return json({ message: 'Territory already seeded', seeded: false });
  }

  const statements: D1PreparedStatement[] = [];

  // Insert territory points
  for (const t of body.territory) {
    statements.push(
      db.prepare(
        'INSERT OR IGNORE INTO cell_points (cell_id, group_id, points) VALUES (?, ?, ?)'
      ).bind(t.cellId, t.groupId, t.points)
    );
  }

  // Insert explored cells (fog of war is per-user)
  for (const e of body.explored) {
    statements.push(
      db.prepare(
        'INSERT OR IGNORE INTO explored_cells (cell_id, user_id) VALUES (?, ?)'
      ).bind(e.cellId, CURRENT_USER_ID)
    );
  }

  // Execute in batches of 40 (D1 safety)
  for (let i = 0; i < statements.length; i += 40) {
    await db.batch(statements.slice(i, i + 40));
  }

  // Update group zone counts
  const groups = ['grp-shadow', 'grp-pavement', 'grp-night'];
  for (const gid of groups) {
    const zonesResult = await db.prepare(`
      SELECT COUNT(*) as cnt FROM cell_points cp1
      WHERE cp1.group_id = ?
      AND NOT EXISTS (
        SELECT 1 FROM cell_points cp2
        WHERE cp2.cell_id = cp1.cell_id AND cp2.group_id != cp1.group_id AND cp2.points > cp1.points
      )
    `).bind(gid).first() as Record<string, unknown> | null;

    await db.prepare('UPDATE groups SET total_zones = ? WHERE id = ?')
      .bind(zonesResult?.cnt ?? 0, gid).run();
  }

  return json({ message: 'Territory seeded', seeded: true });
}
