// Turf Runner API — Strava OAuth, session-based, RP system, solo skills

const LEVEL_COSTS = [5, 15, 30, 50, 80];

const SKILLS: Record<string, { icon: string }> = {
  'wide-scan': { icon: '🔭' },
  'strike-force': { icon: '💥' },
  'shield': { icon: '🛡️' },
  'trailblazer': { icon: '🏃' },
  'dice-roll': { icon: '🎲' },
};

const SKILL_COLS: Record<string, string> = {
  'wide-scan': 'wide_scan_level',
  'strike-force': 'strike_force_level',
  'shield': 'shield_level',
  'trailblazer': 'trailblazer_level',
  'dice-roll': 'ghost_run_level',  // reuses ghost_run_level column
};

// NPC metadata for territory display
const NPC_METADATA: Record<string, { name: string; color: string }> = {
  'npc-ironclad': { name: 'Ironclad Runners', color: '#6366f1' },
  'npc-phantom': { name: 'Phantom Stride', color: '#a855f7' },
  'npc-asphalt': { name: 'Asphalt Kings', color: '#ec4899' },
  'npc-nightowl': { name: 'Night Owls', color: '#14b8a6' },
  'npc-trailblaze': { name: 'Trailblazers', color: '#f97316' },
  'npc-concrete': { name: 'Concrete Crew', color: '#64748b' },
  'npc-summit': { name: 'Summit Chasers', color: '#eab308' },
  'npc-stealth': { name: 'Stealth Pack', color: '#06b6d4' },
};

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

function jsonWithCookie(data: unknown, cookie: string): Response {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie,
    },
  });
}

function entityId(user: Record<string, unknown>): string {
  return (user.group_id as string) || (user.id as string);
}

function isLocal(request: Request): boolean {
  const url = new URL(request.url);
  return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
}

function getSessionToken(request: Request): string | null {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(/turf_session=([^;]+)/);
  return match ? match[1] : null;
}

async function getAuthUser(request: Request, env: Env): Promise<Record<string, unknown> | null> {
  const token = getSessionToken(request);
  if (!token) return null;
  const user = await env.DB.prepare(
    'SELECT * FROM users WHERE session_token = ? AND session_expires > datetime(\'now\')'
  ).bind(token).first() as Record<string, unknown> | null;
  return user;
}

// Refresh Strava access token if expired
async function refreshStravaToken(env: Env, userId: string, user: Record<string, unknown>): Promise<string | null> {
  const expiresAt = user.strava_token_expires as number | null;
  const accessToken = user.strava_access_token as string | null;
  if (!accessToken) return null;

  // Token still valid (with 60s buffer)
  if (expiresAt && Date.now() / 1000 < expiresAt - 60) return accessToken;

  const refreshToken = user.strava_refresh_token as string | null;
  if (!refreshToken) return null;

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) return null;

  const data = await res.json() as { access_token: string; refresh_token: string; expires_at: number };
  await env.DB.prepare(
    'UPDATE users SET strava_access_token = ?, strava_refresh_token = ?, strava_token_expires = ? WHERE id = ?'
  ).bind(data.access_token, data.refresh_token, data.expires_at, userId).run();

  return data.access_token;
}

const VALID_ACTIVITY_TYPES = ['Run', 'TrailRun', 'Walk', 'Hike'];
const MIN_DISTANCE_METERS = 804.67; // 0.5 miles

export async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  try {
    // Strava OAuth endpoints (no auth required)
    if (method === 'GET' && path === '/api/auth/strava') return stravaRedirect(request, env);
    if (method === 'GET' && path === '/api/auth/strava/callback') return await stravaCallback(request, env);
    if (method === 'POST' && path === '/api/auth/logout') return await logout(request, env);

    // Strava deauthorization webhook (called by Strava when user revokes access)
    if (method === 'POST' && path === '/api/webhooks/strava') return await stravaDeauthorize(env, await request.json());
    // Strava webhook verification (GET for subscription validation)
    if (method === 'GET' && path === '/api/webhooks/strava') return stravaWebhookVerify(request);

    // Territory is accessible to everyone (unauth gets fog-only)
    if (method === 'GET' && path === '/api/territory') return await getTerritory(request, env);
    if (method === 'GET' && path === '/api/leaderboard') return await getLeaderboard(env);

    // Auth-required endpoints
    const user = await getAuthUser(request, env);
    if (!user) return json({ error: 'Not authenticated' }, 401);
    const userId = user.id as string;

    if (method === 'GET') {
      if (path === '/api/me') return await getMe(env, user);
      if (path === '/api/group') return await getGroup(env, userId);
      if (path === '/api/runs') return await getRuns(env, userId);
      if (path === '/api/strava/sync') return await stravaSync(env, userId, user);
    }
    if (method === 'POST') {
      if (path === '/api/runs') return await submitRun(env, userId, user, await request.json());
      if (path === '/api/skills/equip') return await equipSkill(env, userId, await request.json());
      if (path === '/api/skills/upgrade') return await upgradeSkill(env, userId, user, await request.json());
      if (path === '/api/group/create') return await createGroup(env, userId, await request.json());
      if (path === '/api/group/join') return await joinGroup(env, userId, await request.json());
      if (path === '/api/group/leave') return await leaveGroup(env, userId);
      if (path === '/api/group/delete') return await deleteGroup(env, userId);
      if (path === '/api/user/color') return await updateUserColor(env, userId, await request.json());
      if (path === '/api/group/color') return await updateGroupColor(env, userId, await request.json());
      if (path === '/api/seed-territory') return await seedTerritory(env, userId, user, await request.json());
      if (path === '/api/auth/strava/disconnect') return await stravaDisconnect(env, userId, user);
    }

    // Dev-only endpoints
    if (isLocal(request)) {
      if (method === 'GET' && path === '/api/dev/strava/activities') return await devStravaActivities(env, userId, user);
      if (method === 'POST' && path === '/api/dev/give-rp') return await devGiveRp(env, userId, await request.json());
      if (method === 'POST' && path === '/api/dev/reset-db') return await devResetDb(env);
    }

    return json({ error: 'Not found' }, 404);
  } catch (e: unknown) {
    console.error('API Error:', e);
    return json({ error: e instanceof Error ? e.message : 'Internal server error' }, 500);
  }
}

// ==================== Auth (Strava OAuth) ====================

function stravaRedirect(request: Request, env: Env): Response {
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/strava/callback`;
  const scope = 'read,activity:read';
  const stravaUrl = `https://www.strava.com/oauth/authorize?client_id=${env.STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&approval_prompt=auto`;
  return Response.redirect(stravaUrl, 302);
}

async function stravaCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error || !code) {
    return new Response('<html><body><script>window.location="/";</script></body></html>', {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  // Exchange code for token
  const tokenRes = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.STRAVA_CLIENT_ID,
      client_secret: env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    return new Response('<html><body><script>window.location="/";</script></body></html>', {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  const tokenData = await tokenRes.json() as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    athlete: { id: number; firstname: string; lastname: string };
  };

  const stravaId = String(tokenData.athlete.id);
  const displayName = [tokenData.athlete.firstname, tokenData.athlete.lastname].filter(Boolean).join(' ') || 'Runner';
  const db = env.DB;

  // Find or create user by strava_id
  let user = await db.prepare('SELECT id FROM users WHERE strava_id = ?').bind(stravaId).first() as Record<string, unknown> | null;

  const sessionToken = crypto.randomUUID();
  const sessionExpires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  if (user) {
    // Existing user — update tokens and session (don't change strava_connected_at)
    await db.prepare(
      'UPDATE users SET display_name = ?, strava_access_token = ?, strava_refresh_token = ?, strava_token_expires = ?, session_token = ?, session_expires = ? WHERE id = ?'
    ).bind(displayName, tokenData.access_token, tokenData.refresh_token, tokenData.expires_at, sessionToken, sessionExpires, user.id).run();
  } else {
    // New user — create account with strava_connected_at = now
    // Only activities after this timestamp will be eligible for import
    const userId = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    await db.prepare(
      'INSERT INTO users (id, strava_id, display_name, strava_access_token, strava_refresh_token, strava_token_expires, session_token, session_expires, strava_connected_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(userId, stravaId, displayName, tokenData.access_token, tokenData.refresh_token, tokenData.expires_at, sessionToken, sessionExpires, new Date().toISOString()).run();
  }

  const cookie = `turf_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`;
  return new Response('<html><body><script>window.location="/";</script></body></html>', {
    headers: {
      'Content-Type': 'text/html',
      'Set-Cookie': cookie,
    },
  });
}

async function logout(request: Request, env: Env): Promise<Response> {
  const user = await getAuthUser(request, env);
  if (user) {
    await env.DB.prepare('UPDATE users SET session_token = NULL, session_expires = NULL WHERE id = ?')
      .bind(user.id).run();
  }
  const cookie = 'turf_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
  return jsonWithCookie({ success: true }, cookie);
}

// ==================== Strava Deauthorization ====================

// Webhook: Strava calls this when a user revokes access from Strava's side
async function stravaDeauthorize(env: Env, body: unknown): Promise<Response> {
  const { object_type, aspect_type, owner_id } = body as {
    object_type?: string; aspect_type?: string; owner_id?: number;
  };

  // Strava sends deauthorization as: object_type=athlete, aspect_type=update, authorized=false
  if (object_type === 'athlete' && owner_id) {
    const stravaId = String(owner_id);
    await cleanupStravaData(env, stravaId);
  }
  // Activity events (create/update/delete) — logged but processed on next client sync
  if (object_type === 'activity') {
    console.log(`Strava webhook: activity ${aspect_type} for owner ${owner_id}`);
  }
  return json({ success: true });
}

// GET webhook verification: Strava validates the subscription endpoint
function stravaWebhookVerify(request: Request): Response {
  const url = new URL(request.url);
  const challenge = url.searchParams.get('hub.challenge');
  if (challenge) return json({ 'hub.challenge': challenge });
  return json({ error: 'Missing challenge' }, 400);
}

// User-initiated disconnect from Settings page
async function stravaDisconnect(env: Env, userId: string, user: Record<string, unknown>): Promise<Response> {
  // Revoke token on Strava's side
  const accessToken = user.strava_access_token as string | null;
  if (accessToken) {
    await fetch('https://www.strava.com/oauth/deauthorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `access_token=${accessToken}`,
    }).catch(() => {}); // Best-effort, don't fail if Strava is unreachable
  }

  // Clean up Strava data locally
  const stravaId = user.strava_id as string | null;
  if (stravaId) {
    await cleanupStravaData(env, stravaId);
  }

  const cookie = 'turf_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
  return jsonWithCookie({ success: true, disconnected: true }, cookie);
}

// Shared cleanup: remove all Strava-sourced data, keep game data
async function cleanupStravaData(env: Env, stravaId: string): Promise<void> {
  const db = env.DB;
  const user = await db.prepare('SELECT id FROM users WHERE strava_id = ?').bind(stravaId).first();
  if (!user) return;

  await db.batch([
    // Clear Strava data and session from user record
    db.prepare(
      'UPDATE users SET strava_id = NULL, strava_access_token = NULL, strava_refresh_token = NULL, strava_token_expires = NULL, display_name = \'Runner\', session_token = NULL, session_expires = NULL WHERE id = ?'
    ).bind(user.id),
    // Clear strava_activity_id references from runs (keep the run records for game history)
    db.prepare(
      'UPDATE runs SET strava_activity_id = NULL WHERE user_id = ?'
    ).bind(user.id),
  ]);
}

// ==================== GET /api/me ====================

async function getMe(env: Env, user: Record<string, unknown>): Promise<Response> {
  let group = null;
  if (user.group_id) {
    group = await env.DB.prepare('SELECT * FROM groups WHERE id = ?').bind(user.group_id).first();
  }

  return json({
    user: {
      id: user.id,
      displayName: user.display_name,
      stravaId: user.strava_id,
      color: user.color,
      groupId: user.group_id,
      rpLifetime: user.rp_lifetime,
      rpAvailable: (user.rp_lifetime as number) - (user.rp_spent as number),
      rpSpent: user.rp_spent,
      equippedSkill: user.equipped_skill,
      stravaLinked: !!user.strava_id,
      skills: {
        'wide-scan': user.wide_scan_level,
        'strike-force': user.strike_force_level,
        'shield': user.shield_level,
        'trailblazer': user.trailblazer_level,
        'dice-roll': user.ghost_run_level,
      },
    },
    group: group ? {
      id: group.id,
      name: group.name,
      color: group.color,
      inviteCode: group.invite_code,
      ownerId: group.owner_id,
    } : null,
  });
}

// ==================== GET /api/territory ====================

async function getTerritory(request: Request, env: Env): Promise<Response> {
  const db = env.DB;
  const user = await getAuthUser(request, env);

  // ALL territory data (for fog of war colors too)
  const cells: Record<string, Record<string, number>> = {};
  const allTerritoryRows = await db.prepare('SELECT h3_index, entity_id, rp FROM territory').all();
  for (const row of allTerritoryRows.results as Array<Record<string, unknown>>) {
    const h = row.h3_index as string;
    if (!cells[h]) cells[h] = {};
    cells[h][row.entity_id as string] = row.rp as number;
  }

  // Entity metadata
  const eids = new Set<string>();
  for (const ce of Object.values(cells)) for (const e of Object.keys(ce)) eids.add(e);

  const entities: Record<string, { name: string; color: string; type: string }> = {};
  if (eids.size > 0) {
    const arr = Array.from(eids);
    const ph = arr.map(() => '?').join(',');
    const gRows = await db.prepare(`SELECT id, name, color FROM groups WHERE id IN (${ph})`).bind(...arr).all();
    for (const g of gRows.results as Array<Record<string, unknown>>) {
      entities[g.id as string] = { name: g.name as string, color: g.color as string, type: 'group' };
    }
    const remaining = arr.filter(id => !entities[id]);
    if (remaining.length > 0) {
      const ph2 = remaining.map(() => '?').join(',');
      const uRows = await db.prepare(`SELECT id, display_name, color FROM users WHERE id IN (${ph2})`).bind(...remaining).all();
      for (const u of uRows.results as Array<Record<string, unknown>>) {
        entities[u.id as string] = { name: u.display_name as string, color: u.color as string, type: 'player' };
      }
    }
    // Resolve NPC entities (not in groups or users tables)
    for (const id of arr) {
      if (!entities[id] && NPC_METADATA[id]) {
        entities[id] = { name: NPC_METADATA[id].name, color: NPC_METADATA[id].color, type: 'npc' };
      }
    }
  }

  // Unauth users: fog-only (no discovered data, no user entity)
  if (!user) {
    return json({ discovered: [], cells, entities, userEntityId: null });
  }

  const userId = user.id as string;
  const eid = entityId(user);

  const discoveredRows = await db.prepare(
    'SELECT DISTINCT h3_index FROM discovered_cells WHERE entity_id = ? OR entity_id = ?'
  ).bind(eid, userId).all();
  const discovered = discoveredRows.results.map((r: Record<string, unknown>) => r.h3_index as string);

  return json({ discovered, cells, entities, userEntityId: eid });
}

// ==================== GET /api/group ====================

async function getGroup(env: Env, userId: string): Promise<Response> {
  const db = env.DB;
  const user = await db.prepare('SELECT group_id FROM users WHERE id = ?').bind(userId).first();
  if (!user || !user.group_id) return json({ group: null, members: [] });

  const groupId = user.group_id as string;
  const [group, members] = await Promise.all([
    db.prepare('SELECT * FROM groups WHERE id = ?').bind(groupId).first(),
    db.prepare(
      'SELECT id, display_name, color, rp_lifetime, equipped_skill FROM users WHERE group_id = ? ORDER BY rp_lifetime DESC'
    ).bind(groupId).all(),
  ]);
  if (!group) return json({ error: 'Group not found' }, 404);

  const zonesResult = await db.prepare(`
    SELECT COUNT(*) as cnt FROM territory t1
    WHERE t1.entity_id = ?
    AND NOT EXISTS (SELECT 1 FROM territory t2 WHERE t2.h3_index = t1.h3_index AND t2.entity_id != t1.entity_id AND t2.rp > t1.rp)
  `).bind(groupId).first() as Record<string, unknown>;

  return json({
    group: {
      id: group.id,
      name: group.name,
      color: group.color,
      ownerId: group.owner_id,
      inviteCode: group.invite_code,
      cellsOwned: (zonesResult?.cnt as number) ?? 0,
    },
    members: (members.results as Array<Record<string, unknown>>).map(m => ({
      id: m.id,
      displayName: m.display_name,
      color: m.color,
      rpLifetime: m.rp_lifetime,
      equippedSkill: m.equipped_skill,
    })),
  });
}

// ==================== GET /api/runs ====================

async function getRuns(env: Env, userId: string): Promise<Response> {
  const runs = await env.DB.prepare(
    'SELECT * FROM runs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
  ).bind(userId).all();

  return json({
    runs: (runs.results as Array<Record<string, unknown>>).map(r => ({
      id: r.id,
      cellsCount: r.cells_count,
      rpEarned: r.rp_earned,
      createdAt: r.created_at,
    })),
  });
}

// ==================== GET /api/leaderboard ====================

async function getLeaderboard(env: Env): Promise<Response> {
  const db = env.DB;
  // Exclude NPC entities from leaderboard — they exist for gameplay, not competition
  const rows = await db.prepare(`
    SELECT t1.entity_id, COUNT(*) as cells_owned
    FROM territory t1
    WHERE t1.entity_id NOT LIKE 'npc-%'
    AND NOT EXISTS (
      SELECT 1 FROM territory t2
      WHERE t2.h3_index = t1.h3_index AND t2.entity_id != t1.entity_id AND t2.rp > t1.rp
    )
    GROUP BY t1.entity_id
    ORDER BY cells_owned DESC
    LIMIT 20
  `).all();

  const entries: Array<{ entityId: string; name: string; color: string; type: string; cellsOwned: number }> = [];
  for (const row of rows.results as Array<Record<string, unknown>>) {
    const eid = row.entity_id as string;
    const cellsOwned = row.cells_owned as number;
    const group = await db.prepare('SELECT name, color FROM groups WHERE id = ?').bind(eid).first();
    if (group) {
      entries.push({ entityId: eid, name: group.name as string, color: group.color as string, type: 'group', cellsOwned });
    } else {
      const u = await db.prepare('SELECT display_name, color FROM users WHERE id = ?').bind(eid).first();
      if (u) entries.push({ entityId: eid, name: u.display_name as string, color: u.color as string, type: 'player', cellsOwned });
    }
  }
  return json({ leaderboard: entries });
}

// ==================== POST /api/runs ====================

async function submitRun(env: Env, userId: string, user: Record<string, unknown>, body: unknown): Promise<Response> {
  const db = env.DB;
  const { cells, revealedCells, stravaActivityId } = body as { cells: string[]; revealedCells?: string[]; stravaActivityId?: string };

  if (!cells || !Array.isArray(cells) || cells.length === 0) return json({ error: 'No cells provided' }, 400);

  // Dedup by Strava activity ID
  if (stravaActivityId) {
    const existing = await db.prepare('SELECT id FROM runs WHERE strava_activity_id = ?').bind(stravaActivityId).first();
    if (existing) return json({ error: 'Activity already imported', duplicate: true }, 409);
  }

  const uniqueCells = [...new Set(cells)];
  const eid = entityId(user);
  const skill = user.equipped_skill as string | null;
  const skillLevel = (skill && SKILL_COLS[skill]) ? (user[SKILL_COLS[skill]] as number) ?? 0 : 0;

  const existingRp: Record<string, Record<string, number>> = {};
  for (let i = 0; i < uniqueCells.length; i += 50) {
    const batch = uniqueCells.slice(i, i + 50);
    const ph = batch.map(() => '?').join(',');
    const rows = await db.prepare(`SELECT h3_index, entity_id, rp FROM territory WHERE h3_index IN (${ph})`).bind(...batch).all();
    for (const row of rows.results as Array<Record<string, unknown>>) {
      const h = row.h3_index as string;
      if (!existingRp[h]) existingRp[h] = {};
      existingRp[h][row.entity_id as string] = row.rp as number;
    }
  }

  const statements: D1PreparedStatement[] = [];
  const runId = 'run-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
  let totalMapRp = 0;
  let totalPlayerRp = 0;
  let cellsCaptured = 0;
  let diceRollFlips = 0;

  // Dice Roll level factors: chance = levelFactor / (1 + gap * 0.15)
  const DICE_ROLL_FACTORS = [0, 0.3, 0.4, 0.5, 0.65, 0.8];

  for (const cellId of uniqueCells) {
    const ce = existingRp[cellId] || {};
    let ownerId: string | null = null;
    let ownerRp = 0;
    for (const [e, rp] of Object.entries(ce)) { if (rp > ownerRp) { ownerId = e; ownerRp = rp; } }

    const isEnemy = ownerId !== null && ownerId !== eid;
    const isFriendly = ownerId === eid;
    const isUnclaimed = ownerId === null;

    let mapRp = 1;     // RP placed on the territory cell
    let playerRp = 1;  // RP earned by the player (spendable)

    if (skill && skillLevel > 0) {
      // Strike Force & Shield: boost MAP RP only (territory strength)
      if (skill === 'strike-force' && isEnemy) mapRp *= [1, 1, 2, 2, 2, 3][skillLevel] ?? 1;
      if (skill === 'shield' && isFriendly) mapRp *= [1, 1, 2, 2, 2, 3][skillLevel] ?? 1;
      // Trailblazer: boost PLAYER RP only (spendable currency)
      if (skill === 'trailblazer' && isUnclaimed) playerRp *= [1, 1, 2, 2, 2, 3][skillLevel] ?? 1;
      // Dice Roll: chance to flip enemy cells
      if (skill === 'dice-roll' && isEnemy) {
        const myCurrentRp = (ce[eid] || 0) + mapRp;
        const gap = ownerRp - myCurrentRp;
        if (gap > 0) {
          const chance = DICE_ROLL_FACTORS[skillLevel] / (1 + gap * 0.15);
          if (Math.random() < chance) {
            mapRp += gap + 1; // Add enough to take cell by 1
            diceRollFlips++;
          }
        }
      }
    }

    totalMapRp += mapRp;
    totalPlayerRp += playerRp;

    statements.push(
      db.prepare('INSERT INTO territory (h3_index, entity_id, rp) VALUES (?, ?, ?) ON CONFLICT(h3_index, entity_id) DO UPDATE SET rp = rp + ?')
        .bind(cellId, eid, mapRp, mapRp)
    );

    const myNewRp = (ce[eid] || 0) + mapRp;
    if (!isFriendly && myNewRp > ownerRp) cellsCaptured++;

    statements.push(
      db.prepare('INSERT OR IGNORE INTO discovered_cells (h3_index, entity_id) VALUES (?, ?)').bind(cellId, eid)
    );
  }

  if (revealedCells && Array.isArray(revealedCells)) {
    for (const rc of [...new Set(revealedCells)]) {
      statements.push(db.prepare('INSERT OR IGNORE INTO discovered_cells (h3_index, entity_id) VALUES (?, ?)').bind(rc, eid));
    }
  }

  const rpEarned = Math.round(totalPlayerRp);
  statements.push(db.prepare('INSERT INTO runs (id, user_id, strava_activity_id, cells_count, rp_earned) VALUES (?, ?, ?, ?, ?)').bind(runId, userId, stravaActivityId || null, uniqueCells.length, rpEarned));
  statements.push(db.prepare('UPDATE users SET rp_lifetime = rp_lifetime + ? WHERE id = ?').bind(rpEarned, userId));

  for (let i = 0; i < statements.length; i += 40) { await db.batch(statements.slice(i, i + 40)); }

  return json({
    runId, cellsCount: uniqueCells.length, cellsCaptured, rpEarned,
    mapRpPlaced: Math.round(totalMapRp),
    skillApplied: skill, skillLevel,
    diceRollFlips: diceRollFlips > 0 ? diceRollFlips : undefined,
  });
}

// ==================== POST /api/skills/equip ====================

async function equipSkill(env: Env, userId: string, body: unknown): Promise<Response> {
  const { skillId } = body as { skillId: string };
  if (!skillId || !SKILLS[skillId]) return json({ error: 'Unknown skill' }, 400);
  await env.DB.prepare('UPDATE users SET equipped_skill = ? WHERE id = ?').bind(skillId, userId).run();
  return json({ skillId });
}

// ==================== POST /api/skills/upgrade ====================

async function upgradeSkill(env: Env, userId: string, user: Record<string, unknown>, body: unknown): Promise<Response> {
  const db = env.DB;
  const { skillId } = body as { skillId: string };
  if (!skillId || !SKILLS[skillId]) return json({ error: 'Unknown skill' }, 400);

  const col = SKILL_COLS[skillId];
  const currentLevel = (user[col] as number) ?? 0;
  if (currentLevel >= 5) return json({ error: 'Already at max level' }, 400);

  const cost = LEVEL_COSTS[currentLevel];
  const rpAvailable = (user.rp_lifetime as number) - (user.rp_spent as number);
  if (rpAvailable < cost) return json({ error: 'Not enough RP', required: cost, available: rpAvailable }, 400);

  const newLevel = currentLevel + 1;
  await db.prepare(`UPDATE users SET ${col} = ?, rp_spent = rp_spent + ? WHERE id = ?`).bind(newLevel, cost, userId).run();

  return json({ skillId, newLevel, rpAvailable: rpAvailable - cost, cost, nextCost: newLevel < 5 ? LEVEL_COSTS[newLevel] : null });
}

// ==================== Group Management ====================

async function createGroup(env: Env, userId: string, body: unknown): Promise<Response> {
  const db = env.DB;
  const { name, color } = body as { name: string; color?: string };
  if (!name || name.trim().length < 2) return json({ error: 'Group name too short' }, 400);

  const user = await db.prepare('SELECT group_id FROM users WHERE id = ?').bind(userId).first();
  if (!user) return json({ error: 'User not found' }, 404);
  if (user.group_id) return json({ error: 'Already in a group' }, 400);

  const groupId = 'grp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
  const inviteCode = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X') + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

  await db.batch([
    db.prepare('INSERT INTO groups (id, name, owner_id, color, invite_code) VALUES (?, ?, ?, ?, ?)').bind(groupId, name.trim(), userId, color || '#3b82f6', inviteCode),
    db.prepare('UPDATE users SET group_id = ? WHERE id = ?').bind(groupId, userId),
  ]);
  return json({ groupId, name: name.trim(), inviteCode });
}

async function joinGroup(env: Env, userId: string, body: unknown): Promise<Response> {
  const db = env.DB;
  const { inviteCode } = body as { inviteCode: string };
  if (!inviteCode) return json({ error: 'Invite code required' }, 400);

  const user = await db.prepare('SELECT group_id FROM users WHERE id = ?').bind(userId).first();
  if (!user) return json({ error: 'User not found' }, 404);
  if (user.group_id) return json({ error: 'Already in a group' }, 400);

  const group = await db.prepare('SELECT * FROM groups WHERE invite_code = ?').bind(inviteCode.trim().toUpperCase()).first();
  if (!group) return json({ error: 'Invalid invite code' }, 404);

  const memberCount = await db.prepare('SELECT COUNT(*) as cnt FROM users WHERE group_id = ?').bind(group.id).first() as Record<string, unknown>;
  if ((memberCount?.cnt as number) >= 15) return json({ error: 'Group is full' }, 400);

  await db.prepare('UPDATE users SET group_id = ? WHERE id = ?').bind(group.id, userId).run();
  return json({ groupId: group.id, name: group.name });
}

async function leaveGroup(env: Env, userId: string): Promise<Response> {
  const db = env.DB;
  const user = await db.prepare('SELECT group_id FROM users WHERE id = ?').bind(userId).first();
  if (!user || !user.group_id) return json({ error: 'Not in a group' }, 400);

  const groupId = user.group_id as string;
  await db.prepare('UPDATE users SET group_id = NULL WHERE id = ?').bind(userId).run();

  // Check if any members remain
  const remaining = await db.prepare('SELECT COUNT(*) as cnt FROM users WHERE group_id = ?').bind(groupId).first() as Record<string, unknown>;
  if ((remaining?.cnt as number) === 0) {
    // Last member left — delete group and all its territory/discoveries
    await db.batch([
      db.prepare('DELETE FROM territory WHERE entity_id = ?').bind(groupId),
      db.prepare('DELETE FROM discovered_cells WHERE entity_id = ?').bind(groupId),
      db.prepare('DELETE FROM groups WHERE id = ?').bind(groupId),
    ]);
    return json({ success: true, groupDeleted: true });
  }
  return json({ success: true });
}

async function deleteGroup(env: Env, userId: string): Promise<Response> {
  const db = env.DB;
  const user = await db.prepare('SELECT group_id FROM users WHERE id = ?').bind(userId).first();
  if (!user || !user.group_id) return json({ error: 'Not in a group' }, 400);

  const groupId = user.group_id as string;
  const group = await db.prepare('SELECT owner_id FROM groups WHERE id = ?').bind(groupId).first();
  if (!group || group.owner_id !== userId) return json({ error: 'Only the owner can delete the group' }, 403);

  // Remove all members from the group
  await db.prepare('UPDATE users SET group_id = NULL WHERE group_id = ?').bind(groupId).run();
  // Delete group territory, discoveries, and the group itself
  await db.batch([
    db.prepare('DELETE FROM territory WHERE entity_id = ?').bind(groupId),
    db.prepare('DELETE FROM discovered_cells WHERE entity_id = ?').bind(groupId),
    db.prepare('DELETE FROM groups WHERE id = ?').bind(groupId),
  ]);
  return json({ success: true, groupDeleted: true });
}

// ==================== Color Updates ====================

async function updateUserColor(env: Env, userId: string, body: unknown): Promise<Response> {
  const { color } = body as { color: string };
  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return json({ error: 'Invalid color' }, 400);
  await env.DB.prepare('UPDATE users SET color = ? WHERE id = ?').bind(color, userId).run();
  return json({ color });
}

async function updateGroupColor(env: Env, userId: string, body: unknown): Promise<Response> {
  const db = env.DB;
  const { color } = body as { color: string };
  if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return json({ error: 'Invalid color' }, 400);

  const user = await db.prepare('SELECT group_id FROM users WHERE id = ?').bind(userId).first();
  if (!user || !user.group_id) return json({ error: 'Not in a group' }, 400);

  const group = await db.prepare('SELECT owner_id FROM groups WHERE id = ?').bind(user.group_id).first();
  if (!group || group.owner_id !== userId) return json({ error: 'Only the group owner can change the color' }, 403);

  await db.prepare('UPDATE groups SET color = ? WHERE id = ?').bind(color, user.group_id).run();
  return json({ color });
}

// ==================== Seed Territory ====================

async function seedTerritory(env: Env, userId: string, user: Record<string, unknown>, body: unknown): Promise<Response> {
  const db = env.DB;
  const { territory } = body as {
    territory: Array<{ h3Index: string; entityId: string; rp: number }>;
  };

  if (!territory || !Array.isArray(territory) || territory.length === 0) return json({ error: 'Missing territory data' }, 400);

  // Only allow seeding NPC groups (prevent players from seeding arbitrary entities)
  const validNpcPrefix = 'npc-';
  const filtered = territory.filter(t => t.entityId && t.entityId.startsWith(validNpcPrefix));
  if (filtered.length === 0) return json({ error: 'No valid NPC territory' }, 400);

  // Check which cells already have territory
  const allCells = [...new Set(filtered.map(t => t.h3Index))];
  const existingCells = new Set<string>();
  for (let i = 0; i < allCells.length; i += 50) {
    const batch = allCells.slice(i, i + 50);
    const ph = batch.map(() => '?').join(',');
    const rows = await db.prepare(`SELECT DISTINCT h3_index FROM territory WHERE h3_index IN (${ph})`).bind(...batch).all();
    for (const row of rows.results as Array<Record<string, unknown>>) {
      existingCells.add(row.h3_index as string);
    }
  }

  // Only insert on unclaimed cells
  const toInsert = filtered.filter(t => !existingCells.has(t.h3Index));
  if (toInsert.length === 0) return json({ message: 'Area already populated', seeded: false });

  const statements: D1PreparedStatement[] = [];
  for (const t of toInsert) {
    statements.push(db.prepare('INSERT OR IGNORE INTO territory (h3_index, entity_id, rp) VALUES (?, ?, ?)').bind(t.h3Index, t.entityId, t.rp));
  }
  for (let i = 0; i < statements.length; i += 40) { await db.batch(statements.slice(i, i + 40)); }

  return json({ message: 'Territory seeded', seeded: true, cellsSeeded: toInsert.length });
}

// ==================== Dev-only Endpoints ====================

async function devGiveRp(env: Env, userId: string, body: unknown): Promise<Response> {
  const { amount } = body as { amount: number };
  if (!amount || amount <= 0 || amount > 10000) return json({ error: 'Invalid amount (1-10000)' }, 400);
  await env.DB.prepare('UPDATE users SET rp_lifetime = rp_lifetime + ? WHERE id = ?').bind(amount, userId).run();
  return json({ success: true, amount });
}

async function devResetDb(env: Env): Promise<Response> {
  const db = env.DB;
  await db.batch([
    db.prepare('DELETE FROM runs'),
    db.prepare('DELETE FROM discovered_cells'),
    db.prepare('DELETE FROM territory'),
  ]);
  return json({ success: true, message: 'Territory, discoveries, and runs cleared' });
}

// Dev endpoint: list ALL past Strava activities (bypasses date filter)
async function devStravaActivities(env: Env, userId: string, user: Record<string, unknown>): Promise<Response> {
  const token = await refreshStravaToken(env, userId, user);
  if (!token) return json({ error: 'Strava not connected', activities: [] });

  const activitiesRes = await fetch(
    'https://www.strava.com/api/v3/athlete/activities?per_page=100',
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  if (!activitiesRes.ok) return json({ error: 'Failed to fetch Strava activities' }, 502);

  const activities = await activitiesRes.json() as Array<{
    id: number; name: string; type: string; distance: number;
    start_date: string; map: { summary_polyline: string | null };
  }>;

  // Filter to valid types and minimum distance
  const valid = activities.filter(a =>
    VALID_ACTIVITY_TYPES.includes(a.type) && a.distance >= MIN_DISTANCE_METERS
  );

  // Check which are already imported
  const importedIds = new Set<string>();
  if (valid.length > 0) {
    const ids = valid.map(a => String(a.id));
    for (let i = 0; i < ids.length; i += 50) {
      const batch = ids.slice(i, i + 50);
      const ph = batch.map(() => '?').join(',');
      const rows = await env.DB.prepare(
        `SELECT strava_activity_id FROM runs WHERE strava_activity_id IN (${ph})`
      ).bind(...batch).all();
      for (const r of rows.results as Array<Record<string, unknown>>) {
        importedIds.add(r.strava_activity_id as string);
      }
    }
  }

  return json({
    activities: valid.map(a => ({
      id: String(a.id),
      name: a.name,
      type: a.type,
      distance: a.distance,
      startDate: a.start_date,
      polyline: a.map?.summary_polyline || null,
      imported: importedIds.has(String(a.id)),
    })),
  });
}

// ==================== Strava Sync ====================

// Returns new (unimported) activities since strava_connected_at with polylines for client-side H3 processing
async function stravaSync(env: Env, userId: string, user: Record<string, unknown>): Promise<Response> {
  if (!user.strava_id) return json({ activities: [] });

  const token = await refreshStravaToken(env, userId, user);
  if (!token) return json({ activities: [], error: 'Token refresh failed' });

  const connectedAt = user.strava_connected_at as string | null;
  const afterEpoch = connectedAt ? Math.floor(new Date(connectedAt).getTime() / 1000) : Math.floor(Date.now() / 1000);

  const activitiesRes = await fetch(
    `https://www.strava.com/api/v3/athlete/activities?after=${afterEpoch}&per_page=30`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );

  if (!activitiesRes.ok) {
    console.error('Strava API error:', activitiesRes.status);
    return json({ activities: [], error: 'Strava API error' });
  }

  const activities = await activitiesRes.json() as Array<{
    id: number; name: string; type: string; distance: number;
    start_date: string; map: { summary_polyline: string | null };
  }>;

  // Filter to valid types and minimum distance
  const valid = activities.filter(a =>
    VALID_ACTIVITY_TYPES.includes(a.type) && a.distance >= MIN_DISTANCE_METERS
  );

  // Check which are already imported
  const importedIds = new Set<string>();
  if (valid.length > 0) {
    const ids = valid.map(a => String(a.id));
    for (let i = 0; i < ids.length; i += 50) {
      const batch = ids.slice(i, i + 50);
      const ph = batch.map(() => '?').join(',');
      const rows = await env.DB.prepare(
        `SELECT strava_activity_id FROM runs WHERE strava_activity_id IN (${ph})`
      ).bind(...batch).all();
      for (const r of rows.results as Array<Record<string, unknown>>) {
        importedIds.add(r.strava_activity_id as string);
      }
    }
  }

  const pending = valid.filter(a => !importedIds.has(String(a.id)));

  return json({
    activities: pending.map(a => ({
      id: String(a.id),
      name: a.name,
      type: a.type,
      distance: a.distance,
      startDate: a.start_date,
      polyline: a.map?.summary_polyline || null,
    })),
  });
}
