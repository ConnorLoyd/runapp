export function getScripts(): string {
  return `
(function() {
  var currentUser = null;
  var territoryState = null;
  var H3_RES = 8;
  var DEFAULT_ZOOM = 15;
  var LEVEL_COSTS = [5, 15, 30, 50, 80];
  var SKILL_ICONS = {
    'wide-scan': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19.07 4.93A10 10 0 0 0 6.99 3.34"/><path d="M4 6h.01"/><path d="M2.29 9.62A10 10 0 1 0 21.31 8.35"/><path d="M16.24 7.76A6 6 0 1 0 8.23 16.67"/><path d="M12 18H12.01"/><path d="M17.99 11.66A6 6 0 0 1 15.77 16.67"/><circle cx="12" cy="12" r="2"/><path d="m13.41 10.59 5.66-5.66"/></svg>',
    'strike-force': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/><polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5"/><line x1="5" x2="9" y1="14" y2="18"/><line x1="7" x2="4" y1="17" y2="20"/><line x1="3" x2="5" y1="19" y2="21"/></svg>',
    'shield': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>',
    'trailblazer': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    'dice-roll': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg>'
  };
  var SKILL_NAMES = {
    'wide-scan': 'Wide Scan', 'strike-force': 'Strike Force', 'shield': 'Shield',
    'trailblazer': 'Trailblazer', 'dice-roll': 'Dice Roll'
  };
  var SKILL_DESCS = {
    'wide-scan': 'Reveals adjacent cells as you run, expanding fog reveal.',
    'strike-force': 'Places more RP on enemy cells (territory strength, not earned RP).',
    'shield': 'Places more RP on your own cells (territory strength, not earned RP).',
    'trailblazer': 'Earn more spendable RP in unclaimed cells (doesn\\u2019t boost territory).',
    'dice-roll': 'Chance to flip enemy cells outright. Lower chance with bigger RP gaps.'
  };
  var SKILL_STATS = {
    'wide-scan': {
      label: 'Reveal Range',
      values: ['None', '1 ring', '1 ring', '2 rings', '2 rings', '3 rings'],
      bonus:  ['',     '',       '',       '',         '',         ''],
      unit: ''
    },
    'strike-force': {
      label: 'Bonus RP on Enemy Cells',
      values: ['None', 'None', '+1/cell', '+1/cell', '+1/cell', '+2/cell'],
      bonus:  ['',   '',   '',   '',   '',   ''],
      unit: ''
    },
    'shield': {
      label: 'Bonus RP on Friendly Cells',
      values: ['None', 'None', '+1/cell', '+1/cell', '+1/cell', '+2/cell'],
      bonus:  ['',   '',   '',   '',   '',   ''],
      unit: ''
    },
    'trailblazer': {
      label: 'Bonus RP on Unclaimed Cells',
      values: ['None', 'None', '+1/cell', '+1/cell', '+1/cell', '+2/cell'],
      bonus:  ['',   '',   '',   '',   '',   ''],
      unit: ''
    },
    'dice-roll': {
      label: 'Flip Chance Factor',
      values: ['Off', '0.3', '0.4', '0.5', '0.65', '0.8'],
      bonus:  ['', 'Chance decreases with RP gap', 'Chance decreases with RP gap', 'Chance decreases with RP gap', 'Chance decreases with RP gap', 'Chance decreases with RP gap'],
      unit: ''
    }
  };

  // ========== API ==========
  function apiGet(url) {
    return fetch(url, { credentials: 'same-origin' }).then(function(r) {
      if (r.status === 401) return { error: 'Not authenticated', status: 401 };
      return r.json();
    });
  }
  function apiPost(url, body) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), credentials: 'same-origin' })
      .then(function(r) { return r.json(); });
  }

  // ========== Polyline Decoder (Google Encoded Polyline Algorithm) ==========
  function decodePolyline(encoded) {
    var points = [];
    var index = 0, lat = 0, lng = 0;
    while (index < encoded.length) {
      var b, shift = 0, result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lat += ((result & 1) ? ~(result >> 1) : (result >> 1));
      shift = 0; result = 0;
      do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
      lng += ((result & 1) ? ~(result >> 1) : (result >> 1));
      points.push([lat * 1e-5, lng * 1e-5]);
    }
    return points;
  }

  function polylineToH3Cells(polyline) {
    if (!polyline || typeof h3 === 'undefined') return [];
    var points = decodePolyline(polyline);
    var cellSet = {};
    for (var i = 0; i < points.length; i++) {
      var cell = h3.geoToH3(points[i][0], points[i][1], H3_RES);
      cellSet[cell] = true;
    }
    // Also interpolate between consecutive points to avoid gaps in sparse polylines
    for (var i = 0; i < points.length - 1; i++) {
      var p1 = points[i], p2 = points[i + 1];
      var dist = Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
      // ~0.0016 degrees is roughly 174m (one H3 res9 edge), interpolate if gap is larger
      if (dist > 0.001) {
        var steps = Math.ceil(dist / 0.0008);
        for (var s = 1; s < steps; s++) {
          var frac = s / steps;
          var lat = p1[0] + (p2[0] - p1[0]) * frac;
          var lng = p1[1] + (p2[1] - p1[1]) * frac;
          var cell = h3.geoToH3(lat, lng, H3_RES);
          cellSet[cell] = true;
        }
      }
    }
    return Object.keys(cellSet);
  }

  // ========== Strava Sync ==========
  var syncInProgress = false;

  function showSyncToast(message, type) {
    var existing = document.getElementById('sync-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'sync-toast';
    toast.className = 'sync-toast ' + (type || 'info');
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add('visible'); }, 10);
    setTimeout(function() {
      toast.classList.remove('visible');
      setTimeout(function() { toast.remove(); }, 300);
    }, 4000);
  }

  function computeRevealCells(cells) {
    if (typeof h3 === 'undefined' || !currentUser) return cells.slice();
    var u = currentUser.user;
    var revealRings = 0;
    if (u.equippedSkill === 'wide-scan') {
      var lvl = u.skills['wide-scan'] || 0;
      revealRings = [0, 1, 1, 2, 2, 3][lvl] || 0;
    }
    var allRevealed = {};
    for (var i = 0; i < cells.length; i++) {
      allRevealed[cells[i]] = true;
      if (revealRings > 0) {
        var ring = h3.kRing(cells[i], revealRings);
        for (var j = 0; j < ring.length; j++) allRevealed[ring[j]] = true;
      }
    }
    return Object.keys(allRevealed);
  }

  function processStravaActivity(activity) {
    if (!activity.polyline) return Promise.resolve(null);
    var cells = polylineToH3Cells(activity.polyline);
    if (cells.length === 0) return Promise.resolve(null);
    var revealedCells = computeRevealCells(cells);
    return apiPost('/api/runs', {
      cells: cells,
      revealedCells: revealedCells,
      stravaActivityId: activity.id,
    }).then(function(res) {
      if (res.duplicate) return null;
      if (res.error) { console.error('Import failed:', activity.name, res.error); return null; }
      return res;
    });
  }

  function syncStravaActivities() {
    if (syncInProgress || !currentUser || !currentUser.user.stravaLinked) return Promise.resolve();
    syncInProgress = true;
    return apiGet('/api/strava/sync').then(function(data) {
      if (!data.activities || data.activities.length === 0) {
        syncInProgress = false;
        return;
      }
      var skillName = currentUser && currentUser.user.equippedSkill ? SKILL_NAMES[currentUser.user.equippedSkill] : null;
      var skillMsg = skillName ? ' (' + skillName + ' active)' : '';
      showSyncToast('Importing ' + data.activities.length + ' run' + (data.activities.length > 1 ? 's' : '') + ' from Strava...' + skillMsg, 'info');
      var imported = 0;
      var chain = Promise.resolve();
      data.activities.forEach(function(activity) {
        chain = chain.then(function() {
          return processStravaActivity(activity).then(function(res) {
            if (res) imported++;
          });
        });
      });
      return chain.then(function() {
        syncInProgress = false;
        if (imported > 0) {
          showSyncToast('Imported ' + imported + ' run' + (imported > 1 ? 's' : '') + ' from Strava!', 'success');
          loadTerritory().then(function() { if (turfMap) renderHexGrid(); updateMapOverlayStats(); });
          loadUserData();
        }
      });
    }).catch(function(err) {
      syncInProgress = false;
      console.error('Strava sync error:', err);
    });
  }

  // ========== Navigation ==========
  var pages = document.querySelectorAll('.page');
  var bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
  var allNavItems = document.querySelectorAll('.nav-item, .header-btn[data-page]');

  function navigateTo(pageId) {
    pages.forEach(function(p) { p.classList.remove('active'); });
    bottomNavItems.forEach(function(n) { n.classList.remove('active'); });
    var page = document.getElementById(pageId);
    var nav = document.querySelector('.bottom-nav [data-page="' + pageId + '"]');
    if (page) page.classList.add('active');
    if (nav) nav.classList.add('active');
    document.querySelector('.page-container').scrollTop = 0;
    if (pageId === 'page-map' && turfMap) setTimeout(function() { turfMap.invalidateSize(); loadTerritory().then(function() { renderHexGrid(); updateMapOverlayStats(); }); }, 100);
    if (pageId === 'page-group') loadGroupData();
    if (pageId === 'page-leaderboard') loadLeaderboard();
    if (pageId === 'page-profile') loadRuns();
  }

  allNavItems.forEach(function(item) {
    item.addEventListener('click', function() {
      var pageId = item.getAttribute('data-page');
      if (pageId) navigateTo(pageId);
    });
  });

  // ========== Modals ==========
  function openModal(id) { var m = document.getElementById(id); if (m) m.style.display = 'flex'; }
  function closeModal(id) { var m = document.getElementById(id); if (m) m.style.display = 'none'; }
  document.querySelectorAll('[data-close]').forEach(function(btn) {
    btn.addEventListener('click', function() { closeModal(btn.getAttribute('data-close')); });
  });
  document.querySelectorAll('.modal-overlay').forEach(function(modal) {
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.style.display = 'none'; });
  });

  // ========== Skills Page ==========
  function renderSkills() {
    var list = document.getElementById('skill-list');
    if (!list || !currentUser) return;
    var u = currentUser.user;
    var skills = ['wide-scan', 'strike-force', 'shield', 'trailblazer', 'dice-roll'];
    var html = '';
    skills.forEach(function(id) {
      var level = u.skills[id] || 0;
      var isEquipped = u.equippedSkill === id;
      var segs = '';
      for (var i = 0; i < 5; i++) {
        segs += '<div class="skill-level-seg' + (i < level ? ' filled' : '') + '"></div>';
      }
      var costHtml = '';
      if (level >= 5) costHtml = '<span class="skill-max">MAX</span>';
      else costHtml = '<button class="skill-upgrade-btn" data-skill="' + id + '" data-cost="' + LEVEL_COSTS[level] + '">Upgrade · ' + LEVEL_COSTS[level] + ' RP</button>';

      // Build description with integrated stat value
      var stats = SKILL_STATS[id];
      var currentVal = stats.values[level] || '—';
      var v = '<span class="skill-val">';
      var ve = '</span>';
      var descHtml;
      if (id === 'wide-scan') {
        descHtml = currentVal !== 'None' ? 'Reveals fog in a ' + v + currentVal + ve + ' radius around your path' : 'Expands fog reveal beyond cells you pass through';
      } else if (id === 'strike-force') {
        descHtml = currentVal !== 'None' ? 'Adds ' + v + currentVal + ve + ' bonus RP to enemy cells you run through' : 'Places bonus RP on enemy cells you run through';
      } else if (id === 'shield') {
        descHtml = currentVal !== 'None' ? 'Adds ' + v + currentVal + ve + ' bonus RP to your cells you run through' : 'Places bonus RP on your own cells you run through';
      } else if (id === 'trailblazer') {
        descHtml = currentVal !== 'None' ? 'Earns ' + v + currentVal + ve + ' bonus spendable RP in unclaimed cells' : 'Earns bonus RP when running through unclaimed cells';
      } else if (id === 'dice-roll') {
        descHtml = currentVal !== 'Off' ? v + currentVal + ve + ' chance factor to flip enemy cells. Lower odds with bigger RP gaps' : 'Chance to flip enemy cells outright when running through them';
      } else {
        descHtml = SKILL_DESCS[id];
      }

      html += '<div class="skill-card' + (isEquipped ? ' equipped' : '') + '" data-skill="' + id + '">'
        + '<div class="skill-top">'
        + '<div class="skill-icon">' + (SKILL_ICONS[id] || '') + '</div>'
        + '<div class="skill-info"><div class="skill-name">' + SKILL_NAMES[id] + '</div>'
        + '<div class="skill-desc">' + descHtml + '</div></div>'
        + (isEquipped ? '<span class="equipped-badge">Equipped</span>' : '')
        + '</div>'
        + '<div class="skill-bottom">'
        + '<div class="skill-level-bar">' + segs + '<span class="skill-level-label">Lv ' + level + '</span></div>'
        + '<div class="skill-actions">' + costHtml + '</div>'
        + '</div></div>';
    });
    list.innerHTML = html;

    // Equip on card click
    list.querySelectorAll('.skill-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        if (e.target.closest('.skill-upgrade-btn')) return;
        var skillId = card.getAttribute('data-skill');
        apiPost('/api/skills/equip', { skillId: skillId }).then(function(res) {
          if (res.error) return;
          currentUser.user.equippedSkill = skillId;
          renderSkills();
          updateProfile();
        });
      });
    });

    // Upgrade on button click
    list.querySelectorAll('.skill-upgrade-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var skillId = btn.getAttribute('data-skill');
        btn.disabled = true;
        btn.textContent = '...';
        apiPost('/api/skills/upgrade', { skillId: skillId }).then(function(res) {
          if (res.error) {
            btn.textContent = res.error === 'Not enough RP' ? 'Need RP' : 'Error';
            btn.disabled = false;
            setTimeout(function() { renderSkills(); }, 1200);
            return;
          }
          currentUser.user.skills[skillId] = res.newLevel;
          currentUser.user.rpAvailable = res.rpAvailable;
          currentUser.user.rpSpent = (currentUser.user.rpLifetime || 0) - res.rpAvailable;
          var rpEl = document.getElementById('rp-available');
          if (rpEl) rpEl.textContent = Math.floor(res.rpAvailable);
          renderSkills();
          updateProfile();
        });
      });
    });
  }

  // ========== Group Page ==========
  function loadGroupData() {
    apiGet('/api/group').then(function(data) {
      var noGroup = document.getElementById('no-group');
      var hasGroup = document.getElementById('has-group');
      if (!data.group) {
        if (noGroup) noGroup.style.display = 'block';
        if (hasGroup) hasGroup.style.display = 'none';
        return;
      }
      if (noGroup) noGroup.style.display = 'none';
      if (hasGroup) hasGroup.style.display = 'block';
      var g = data.group;
      var dot = document.getElementById('group-color-dot');
      if (dot) dot.style.background = g.color;
      var nameEl = document.getElementById('group-name');
      if (nameEl) nameEl.textContent = g.name;
      var metaEl = document.getElementById('group-meta');
      if (metaEl) metaEl.textContent = data.members.length + ' of 15 members';
      var cellsEl = document.getElementById('group-cells');
      if (cellsEl) cellsEl.textContent = g.cellsOwned;
      var membCountEl = document.getElementById('group-members-count');
      if (membCountEl) membCountEl.textContent = data.members.length;
      var codeEl = document.getElementById('invite-code-value');
      if (codeEl) codeEl.textContent = g.inviteCode;
      var grpColorPicker = document.getElementById('group-color-picker');
      if (grpColorPicker) grpColorPicker.value = g.color;

      // Show delete button only for owner
      var deleteBtn = document.getElementById('mgmt-delete-btn');
      if (deleteBtn) deleteBtn.style.display = (currentUser && currentUser.user.id === g.ownerId) ? '' : 'none';

      // Render members
      var memberList = document.getElementById('member-list');
      if (memberList) {
        var html = '';
        data.members.forEach(function(m) {
          var skillName = m.equippedSkill ? SKILL_NAMES[m.equippedSkill] || m.equippedSkill : 'None';
          var skillIcon = m.equippedSkill ? (SKILL_ICONS[m.equippedSkill] || '') : '';
          var skillDetailHtml = skillIcon ? '<span class="member-skill-icon">' + skillIcon + '</span> ' + skillName : skillName;
          html += '<div class="member-row">'
            + '<div class="member-avatar" style="border-color:' + m.color + '">' + (m.displayName || '?').charAt(0) + '</div>'
            + '<div class="member-info">'
            + '<div class="member-name">' + m.displayName + (m.id === g.ownerId ? ' <span class="member-role">Owner</span>' : '') + '</div>'
            + '<div class="member-detail">' + skillDetailHtml + '</div>'
            + '</div>'
            + '<div class="member-rp">' + m.rpLifetime + ' RP</div>'
            + '</div>';
        });
        memberList.innerHTML = html;
      }
    });
  }

  // Group management buttons
  var inviteBtn = document.getElementById('mgmt-invite-btn');
  if (inviteBtn) inviteBtn.addEventListener('click', function() { openModal('invite-modal'); });
  var leaveBtn = document.getElementById('mgmt-leave-btn');
  if (leaveBtn) leaveBtn.addEventListener('click', function() { openModal('leave-modal'); });

  var copyBtn = document.getElementById('invite-copy-btn');
  if (copyBtn) copyBtn.addEventListener('click', function() {
    var code = document.getElementById('invite-code-value');
    if (code && navigator.clipboard) {
      navigator.clipboard.writeText(code.textContent).then(function() {
        copyBtn.textContent = 'Copied!';
        setTimeout(function() { copyBtn.textContent = 'Copy Code'; }, 1500);
      });
    }
  });

  var leaveConfirmBtn = document.getElementById('leave-confirm-btn');
  if (leaveConfirmBtn) leaveConfirmBtn.addEventListener('click', function() {
    leaveConfirmBtn.disabled = true;
    leaveConfirmBtn.textContent = 'Leaving...';
    apiPost('/api/group/leave', {}).then(function(res) {
      closeModal('leave-modal');
      leaveConfirmBtn.disabled = false;
      leaveConfirmBtn.textContent = 'Leave Group';
      loadUserData().then(function() { loadGroupData(); renderSkills(); loadTerritory().then(function() { renderHexGrid(); updateMapOverlayStats(); }); });
    });
  });

  // Delete group (owner only)
  var deleteGroupBtn = document.getElementById('mgmt-delete-btn');
  if (deleteGroupBtn) deleteGroupBtn.addEventListener('click', function() { openModal('delete-group-modal'); });
  var deleteGroupConfirm = document.getElementById('delete-group-confirm-btn');
  if (deleteGroupConfirm) deleteGroupConfirm.addEventListener('click', function() {
    deleteGroupConfirm.disabled = true;
    deleteGroupConfirm.textContent = 'Deleting...';
    apiPost('/api/group/delete', {}).then(function(res) {
      closeModal('delete-group-modal');
      deleteGroupConfirm.disabled = false;
      deleteGroupConfirm.textContent = 'Delete Forever';
      if (res.error) { alert(res.error); return; }
      loadUserData().then(function() { loadGroupData(); renderSkills(); loadTerritory().then(function() { renderHexGrid(); }); });
    });
  });

  // Create group
  var createGroupBtn = document.getElementById('create-group-btn');
  if (createGroupBtn) createGroupBtn.addEventListener('click', function() { openModal('create-group-modal'); });
  var createGroupConfirm = document.getElementById('create-group-confirm');
  if (createGroupConfirm) createGroupConfirm.addEventListener('click', function() {
    var nameInput = document.getElementById('new-group-name');
    var errorEl = document.getElementById('create-group-error');
    var name = nameInput ? nameInput.value.trim() : '';
    if (!name) { if (errorEl) errorEl.textContent = 'Enter a name'; return; }
    createGroupConfirm.disabled = true;
    apiPost('/api/group/create', { name: name }).then(function(res) {
      createGroupConfirm.disabled = false;
      if (res.error) { if (errorEl) errorEl.textContent = res.error; return; }
      closeModal('create-group-modal');
      loadUserData().then(function() { loadGroupData(); loadTerritory().then(function() { renderHexGrid(); updateMapOverlayStats(); }); });
    });
  });

  // Join group
  var joinGroupBtn = document.getElementById('join-group-btn');
  if (joinGroupBtn) joinGroupBtn.addEventListener('click', function() { openModal('join-group-modal'); });
  var joinGroupConfirm = document.getElementById('join-group-confirm');
  if (joinGroupConfirm) joinGroupConfirm.addEventListener('click', function() {
    var codeInput = document.getElementById('join-invite-code');
    var errorEl = document.getElementById('join-group-error');
    var code = codeInput ? codeInput.value.trim() : '';
    if (!code) { if (errorEl) errorEl.textContent = 'Enter a code'; return; }
    joinGroupConfirm.disabled = true;
    apiPost('/api/group/join', { inviteCode: code }).then(function(res) {
      joinGroupConfirm.disabled = false;
      if (res.error) { if (errorEl) errorEl.textContent = res.error; return; }
      closeModal('join-group-modal');
      loadUserData().then(function() { loadGroupData(); loadTerritory().then(function() { renderHexGrid(); updateMapOverlayStats(); }); });
    });
  });

  // ========== Leaderboard ==========
  function loadLeaderboard() {
    apiGet('/api/leaderboard').then(function(data) {
      var list = document.getElementById('lb-list');
      if (!list || !data.leaderboard) return;
      var userEntityId = currentUser ? (currentUser.user.groupId || currentUser.user.id) : null;
      var html = '';
      data.leaderboard.forEach(function(entry, idx) {
        var isYou = entry.entityId === userEntityId;
        html += '<div class="lb-row' + (isYou ? ' highlight' : '') + '">'
          + '<div class="lb-rank">' + (idx + 1) + '</div>'
          + '<div class="lb-color" style="background:' + entry.color + '"></div>'
          + '<div class="lb-info"><div class="lb-name">' + entry.name + '</div>'
          + '<div class="lb-type">' + entry.type + '</div></div>'
          + '<div class="lb-score">' + entry.cellsOwned + ' <span class="lb-unit">cells</span></div>'
          + '</div>';
      });
      if (!data.leaderboard.length) html = '<div class="empty-state"><p>No territory claimed yet.</p></div>';
      list.innerHTML = html;
    });
  }

  // ========== Profile ==========
  function updateProfile() {
    if (!currentUser) return;
    var u = currentUser.user;
    var nameEl = document.getElementById('profile-name');
    if (nameEl) nameEl.textContent = u.displayName;
    var groupEl = document.getElementById('profile-group');
    if (groupEl) groupEl.textContent = currentUser.group ? currentUser.group.name : 'Solo Player';
    var eqIcon = document.getElementById('eq-icon');
    var eqName = document.getElementById('eq-name');
    var eqLevel = document.getElementById('eq-level');
    if (eqIcon) eqIcon.innerHTML = u.equippedSkill ? (SKILL_ICONS[u.equippedSkill] || '') : '';
    if (eqName) eqName.textContent = u.equippedSkill ? (SKILL_NAMES[u.equippedSkill] || u.equippedSkill) : 'None';
    if (eqLevel) eqLevel.textContent = u.equippedSkill ? 'Level ' + (u.skills[u.equippedSkill] || 0) : '';
    var profileAvatar = document.getElementById('profile-avatar');
    if (profileAvatar) profileAvatar.textContent = (u.displayName || '?').charAt(0);
    var lifetimeEl = document.getElementById('stat-lifetime-rp');
    if (lifetimeEl) lifetimeEl.textContent = u.rpLifetime;
    var availableEl = document.getElementById('stat-available-rp');
    if (availableEl) availableEl.textContent = Math.floor(u.rpAvailable);
    var soloColorSection = document.getElementById('solo-color-section');
    if (soloColorSection) soloColorSection.style.display = currentUser.group ? 'none' : 'block';
    var colorDescEl = document.getElementById('profile-color-desc');
    if (colorDescEl) colorDescEl.textContent = u.color;
    var colorPicker = document.getElementById('user-color-picker');
    if (colorPicker) colorPicker.value = u.color;
  }

  function loadRuns() {
    apiGet('/api/runs').then(function(data) {
      var container = document.getElementById('run-history');
      if (!container || !data.runs) return;
      var runsEl = document.getElementById('stat-total-runs');
      if (runsEl) runsEl.textContent = data.runs.length;
      var html = '';
      data.runs.forEach(function(r) {
        var date = new Date(r.createdAt + 'Z');
        var ago = timeAgo(date);
        html += '<div class="run-entry">'
          + '<div class="run-info"><div class="run-detail">' + r.cellsCount + ' cells · ' + ago + '</div></div>'
          + '<div class="run-rp">+' + r.rpEarned + ' RP</div>'
          + '</div>';
      });
      if (!data.runs.length) html = '<div class="empty-state"><p>No runs yet. Go claim some turf!</p></div>';
      container.innerHTML = html;
    });
  }

  function timeAgo(date) {
    var diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
  }

  // ========== Add Run Overlay ==========
  var runMap = null;
  var runHexLayer = null;
  var runSelectedCells = [];
  var runOverlay = null;
  var userLat = null;
  var userLng = null;

  function openRunMap() {
    runOverlay = document.getElementById('run-map-overlay');
    if (!runOverlay) return;
    runOverlay.style.display = 'flex';
    runSelectedCells = [];
    updateRunInfo();
    if (!runMap) {
      runMap = L.map('run-map', { zoomControl: false, attributionControl: false, minZoom: 13, maxZoom: 18 });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(runMap);
      runHexLayer = L.layerGroup().addTo(runMap);
    }
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem('turfHomeLocation')); } catch(e) {}
    var lat = (saved && saved.lat) ? saved.lat : (userLat || 39.8);
    var lng = (saved && saved.lng) ? saved.lng : (userLng || -98.5);
    runMap.setView([lat, lng], 15);
    setTimeout(function() { runMap.invalidateSize(); renderRunHexes(); }, 100);
    runMap.on('moveend', renderRunHexes);
    runMap.on('zoomend', renderRunHexes);
  }

  function closeRunMap() {
    if (runOverlay) runOverlay.style.display = 'none';
    if (runMap) { runMap.off('moveend', renderRunHexes); runMap.off('zoomend', renderRunHexes); }
    runSelectedCells = [];
  }

  function updateRunInfo() {
    var countEl = document.getElementById('run-hex-count');
    var distEl = document.getElementById('run-distance');
    var submitBtn = document.getElementById('run-submit-btn');
    if (countEl) countEl.textContent = runSelectedCells.length;
    if (distEl) distEl.textContent = (runSelectedCells.length * 0.11).toFixed(1);
    if (submitBtn) submitBtn.disabled = runSelectedCells.length === 0;
  }

  function toggleRunCell(cell) {
    var idx = runSelectedCells.indexOf(cell);
    if (idx >= 0) runSelectedCells.splice(idx, 1);
    else runSelectedCells.push(cell);
    updateRunInfo();
    renderRunHexes();
  }

  function renderRunHexes() {
    if (!runMap || !runHexLayer || typeof h3 === 'undefined') return;
    runHexLayer.clearLayers();
    var center = runMap.getCenter();
    var zoom = runMap.getZoom();
    var renderK = zoom >= 16 ? 6 : zoom >= 15 ? 8 : zoom >= 14 ? 12 : 16;
    var viewCell = h3.geoToH3(center.lat, center.lng, H3_RES);
    var visibleCells = h3.kRing(viewCell, renderK);
    var bounds = runMap.getBounds();

    visibleCells.forEach(function(cell) {
      var cellCenter = h3.h3ToGeo(cell);
      if (cellCenter[0] < bounds.getSouth() - 0.005 || cellCenter[0] > bounds.getNorth() + 0.005 ||
          cellCenter[1] < bounds.getWest() - 0.005 || cellCenter[1] > bounds.getEast() + 0.005) return;
      var boundary = h3.h3ToGeoBoundary(cell);
      var isSelected = runSelectedCells.indexOf(cell) >= 0;
      var data = getCellData(cell);
      var baseColor = '#ffffff';
      var baseOpacity = 0.06;
      if (data && data.owner === 'you') { baseColor = '#4ade80'; baseOpacity = 0.15; }
      else if (data && data.owner === 'enemy') { baseColor = data.ownerColor || '#ff6a00'; baseOpacity = 0.15; }
      var poly = L.polygon(boundary, {
        color: isSelected ? '#ff6a00' : baseColor, fillColor: isSelected ? '#ff6a00' : baseColor,
        fillOpacity: isSelected ? 0.45 : baseOpacity, weight: isSelected ? 2.5 : 0.5, opacity: isSelected ? 1 : 0.3
      }).addTo(runHexLayer);
      poly.on('click', function() { toggleRunCell(cell); });
      if (isSelected && zoom >= 15) {
        var order = runSelectedCells.indexOf(cell) + 1;
        var labelHtml = '<div style="text-align:center;pointer-events:none;text-shadow:0 0 4px #000">'
          + '<div style="font-size:14px;font-weight:800;color:#ff6a00">' + order + '</div></div>';
        L.marker(cellCenter, { icon: L.divIcon({ className: '', html: labelHtml, iconSize: [30, 20], iconAnchor: [15, 10] }), interactive: false }).addTo(runHexLayer);
      }
    });
  }

  // Add Run button
  var addRunBtn = document.getElementById('add-run-btn');
  if (addRunBtn) addRunBtn.addEventListener('click', function(e) { e.stopPropagation(); openRunMap(); });
  var runCancelBtn = document.getElementById('run-cancel-btn');
  if (runCancelBtn) runCancelBtn.addEventListener('click', function() { closeRunMap(); });

  var runSubmitBtn = document.getElementById('run-submit-btn');
  if (runSubmitBtn) {
    runSubmitBtn.addEventListener('click', function() {
      if (runSelectedCells.length === 0) return;
      runSubmitBtn.textContent = 'Submitting...';
      runSubmitBtn.disabled = true;

      var allRevealed = computeRevealCells(runSelectedCells);

      apiPost('/api/runs', { cells: runSelectedCells, revealedCells: allRevealed }).then(function(res) {
        closeRunMap();
        runSubmitBtn.textContent = 'Submit Run';
        runSubmitBtn.disabled = false;
        if (res.error) { alert('Run failed: ' + res.error); return; }
        showRunResult(res);
        loadTerritory().then(function() { if (turfMap) renderHexGrid(); });
        loadUserData();
      }).catch(function(err) {
        console.error('Run error:', err);
        runSubmitBtn.textContent = 'Submit Run';
        runSubmitBtn.disabled = false;
        closeRunMap();
      });
    });
  }

  function showRunResult(res) {
    var body = document.getElementById('run-result-body');
    if (!body) return;
    var baseRp = res.cellsCount;
    var mapRp = res.mapRpPlaced || baseRp;
    var earnedRp = res.rpEarned;
    var mapBonus = mapRp - baseRp;
    var earnBonus = earnedRp - baseRp;

    // Summary row
    var html = '<div class="run-result-grid">'
      + '<div class="run-result-stat"><div class="rr-value">' + res.cellsCount + '</div><div class="rr-label">Cells</div></div>'
      + '<div class="run-result-stat"><div class="rr-value green">' + res.cellsCaptured + '</div><div class="rr-label">Captured</div></div>'
      + '<div class="run-result-stat"><div class="rr-value amber">+' + earnedRp + '</div><div class="rr-label">RP Earned</div></div>'
      + '</div>';

    // Breakdown section
    html += '<div class="run-breakdown">';
    html += '<div class="run-breakdown-title">Breakdown</div>';
    html += '<div class="run-breakdown-row"><span>Base RP</span><span>' + baseRp + ' RP</span></div>';
    html += '<div class="run-breakdown-sub">earned + placed on map for each cell</div>';
    if (mapBonus > 0) {
      var mIcon = SKILL_ICONS[res.skillApplied] || '';
      var mName = SKILL_NAMES[res.skillApplied] || res.skillApplied;
      html += '<div class="run-breakdown-row bonus"><span>' + mIcon + ' ' + mName + ' (Map)</span><span>+' + mapBonus + ' RP</span></div>';
      html += '<div class="run-breakdown-sub">bonus RP placed on map cells</div>';
    }
    if (earnBonus > 0) {
      var eIcon = SKILL_ICONS[res.skillApplied] || '';
      var eName = SKILL_NAMES[res.skillApplied] || res.skillApplied;
      html += '<div class="run-breakdown-row bonus"><span>' + eIcon + ' ' + eName + ' (Earned)</span><span>+' + earnBonus + ' RP</span></div>';
      html += '<div class="run-breakdown-sub">bonus spendable RP earned</div>';
    }
    if (res.diceRollFlips) {
      html += '<div class="run-breakdown-row dice"><span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/></svg> Dice Roll</span><span>' + res.diceRollFlips + ' cell' + (res.diceRollFlips > 1 ? 's' : '') + ' flipped</span></div>';
    }
    if (res.cellsCaptured > 0 && !res.diceRollFlips) {
      html += '<div class="run-breakdown-row capture"><span><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" x2="19" y1="19" y2="13"/><line x1="16" x2="20" y1="16" y2="20"/><line x1="19" x2="21" y1="21" y2="19"/></svg> Cells Captured</span><span>' + res.cellsCaptured + '</span></div>';
    }
    html += '<div class="run-breakdown-divider"></div>';
    html += '<div class="run-breakdown-row total"><span>Total Map RP</span><span>' + mapRp + '</span></div>';
    html += '<div class="run-breakdown-row total"><span>Total Earned RP</span><span>' + earnedRp + '</span></div>';
    html += '</div>';

    body.innerHTML = html;
    openModal('run-result-modal');
  }

  // ========== PWA ==========
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function() {});
  }

  // ========== Territory Map ==========
  var turfMap = null;
  var hexLayer = null;
  var fogLayer = null;

  function getCellData(cell) {
    if (!territoryState) return null;
    if (!territoryState.explored.has(cell)) return null;
    var cp = territoryState.cells[cell];
    if (!cp) return { owner: 'neutral', ownerColor: null, ownerName: null, ownerInitials: null, defense: 0, threat: 0 };
    var userEid = territoryState.userEntityId;
    var maxEid = null; var maxRp = 0;
    for (var eid in cp) { if (cp[eid] > maxRp) { maxEid = eid; maxRp = cp[eid]; } }
    if (!maxEid || maxRp === 0) return { owner: 'neutral', ownerColor: null, ownerName: null, ownerInitials: null, defense: 0, threat: 0 };
    var isYours = maxEid === userEid;
    var threat = 0;
    if (isYours) { for (var e in cp) { if (e !== userEid && cp[e] > threat) threat = cp[e]; } }
    else { threat = (userEid && cp[userEid]) ? cp[userEid] : 0; }
    var info = territoryState.entities[maxEid] || {};
    return {
      owner: isYours ? 'you' : 'enemy',
      ownerColor: info.color || '#ff6a00',
      ownerName: info.name || maxEid,
      ownerInitials: (info.name || maxEid).substring(0, 2).toUpperCase(),
      defense: Math.round(maxRp),
      threat: Math.round(threat)
    };
  }

  function initMap() {
    if (typeof L === 'undefined' || typeof h3 === 'undefined') return;
    turfMap = L.map('map', { zoomControl: false, attributionControl: false, minZoom: 10, maxZoom: 18 });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(turfMap);
    // Custom pane for territory fills — screen blend colorizes dark background, roads stay bright
    turfMap.createPane('hexPane');
    turfMap.getPane('hexPane').style.mixBlendMode = 'screen';
    turfMap.getPane('hexPane').style.zIndex = '450';
    fogLayer = L.layerGroup().addTo(turfMap);
    hexLayer = L.layerGroup().addTo(turfMap);

    // Always try GPS first — go to user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(pos) {
        userLat = pos.coords.latitude; userLng = pos.coords.longitude;
        loadMapAt(userLat, userLng);
        addUserMarker(userLat, userLng);
      }, function() {
        // GPS failed — try saved home location, or prompt
        var saved = null;
        try { saved = JSON.parse(localStorage.getItem('turfHomeLocation')); } catch(e) {}
        if (saved && saved.lat && saved.lng) {
          loadMapAt(saved.lat, saved.lng);
        } else {
          showHomeCityPrompt();
        }
      }, { timeout: 8000, enableHighAccuracy: true });
    } else {
      var saved = null;
      try { saved = JSON.parse(localStorage.getItem('turfHomeLocation')); } catch(e) {}
      if (saved && saved.lat && saved.lng) {
        loadMapAt(saved.lat, saved.lng);
      } else {
        showHomeCityPrompt();
      }
    }
    turfMap.on('moveend', renderHexGrid);
    turfMap.on('zoomend', renderHexGrid);
  }

  function checkAndSeedTerritory() {
    if (!turfMap || !territoryState || !isAuthenticated || typeof h3 === 'undefined') return;
    var center = turfMap.getCenter();
    var centerCell = h3.geoToH3(center.lat, center.lng, H3_RES);
    var nearbyCells = h3.kRing(centerCell, 8);
    var hasNearbyTerritory = nearbyCells.some(function(c) { return territoryState.cells[c]; });
    if (!hasNearbyTerritory) seedTerritoryData(center.lat, center.lng);
  }

  function loadMapAt(lat, lng) {
    turfMap.setView([lat, lng], DEFAULT_ZOOM);
    hideMapLoading();
    loadTerritory().then(function() {
      renderHexGrid(); updateMapOverlayStats();
      checkAndSeedTerritory();
    });
  }

  function showHomeCityPrompt() {
    turfMap.setView([39.8283, -98.5795], 4);
    hideMapLoading();
    var overlay = document.getElementById('home-city-overlay');
    if (overlay) overlay.style.display = 'flex';
    var input = document.getElementById('home-city-input');
    var btn = document.getElementById('home-city-btn');
    var error = document.getElementById('home-city-error');
    if (input) {
      input.addEventListener('keydown', function(e) { if (e.key === 'Enter') geocode(); });
      setTimeout(function() { input.focus(); }, 300);
    }
    if (btn) btn.addEventListener('click', geocode);
    function geocode() {
      var query = input ? input.value.trim() : '';
      if (!query) { if (error) error.textContent = 'Please enter a location'; return; }
      if (error) error.textContent = '';
      if (btn) { btn.textContent = 'Finding...'; btn.disabled = true; }
      fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(query), {
        headers: { 'Accept': 'application/json' }
      }).then(function(r) { return r.json(); }).then(function(data) {
        if (data && data.length > 0) {
          var lat = parseFloat(data[0].lat);
          var lng = parseFloat(data[0].lon);
          localStorage.setItem('turfHomeLocation', JSON.stringify({ lat: lat, lng: lng, name: data[0].display_name.split(',')[0] }));
          if (overlay) overlay.style.display = 'none';
          loadMapAt(lat, lng);
          addUserMarker(lat, lng);
        } else {
          if (error) error.textContent = 'Location not found.';
          if (btn) { btn.textContent = 'Set Home'; btn.disabled = false; }
        }
      }).catch(function() {
        if (error) error.textContent = 'Network error.';
        if (btn) { btn.textContent = 'Set Home'; btn.disabled = false; }
      });
    }
  }

  var userMarkerRef = null;
  function addUserMarker(lat, lng) {
    if (userMarkerRef && turfMap) turfMap.removeLayer(userMarkerRef);
    var html = '<div class="user-marker"><div class="user-marker-ring"></div></div>';
    userMarkerRef = L.marker([lat, lng], { icon: L.divIcon({ className: '', html: html, iconSize: [16, 16], iconAnchor: [8, 8] }), interactive: false }).addTo(turfMap);
  }

  function hideMapLoading() {
    var el = document.getElementById('map-loading');
    if (el) { el.classList.add('hidden'); setTimeout(function() { el.style.display = 'none'; }, 300); }
  }

  // ========== Territory Data ==========
  function loadTerritory() {
    return apiGet('/api/territory').then(function(data) {
      if (data.error) { console.error('Territory error:', data.error); return; }
      territoryState = {
        explored: new Set(data.discovered || []),
        cells: data.cells || {},
        entities: data.entities || {},
        userEntityId: data.userEntityId
      };
    }).catch(function(err) {
      console.error('Territory load error:', err);
      territoryState = { explored: new Set(), cells: {}, entities: {}, userEntityId: null };
    });
  }

  function seedTerritoryData(lat, lng) {
    if (typeof h3 === 'undefined') return;
    var centerCell = h3.geoToH3(lat, lng, H3_RES);
    var territory = [];

    // NPC groups to seed territory with
    var npcGroups = ['npc-ironclad', 'npc-phantom', 'npc-asphalt', 'npc-nightowl', 'npc-trailblaze', 'npc-concrete', 'npc-summit', 'npc-stealth'];

    // Simple hash from lat/lng for deterministic NPC selection
    function seedHash(n) { n = ((n >> 16) ^ n) * 0x45d9f3b; n = ((n >> 16) ^ n) * 0x45d9f3b; return ((n >> 16) ^ n) & 0x7fffffff; }
    var areaHash = seedHash(Math.floor(lat * 1000) + Math.floor(lng * 1000) * 9973);

    // Pick 3-5 NPC groups for this area
    var activeNpcs = [];
    for (var gi = 0; gi < 5; gi++) {
      var pick = npcGroups[(areaHash + gi * 3) % npcGroups.length];
      if (activeNpcs.indexOf(pick) < 0) activeNpcs.push(pick);
    }
    if (activeNpcs.length < 3) activeNpcs = npcGroups.slice(0, 3);

    // Get a large ring of cells around the user's location
    var allCells = h3.kRing(centerCell, 12);

    // Create NPC cluster centers — offset from user, scattered around
    var clusterCenters = [];
    activeNpcs.forEach(function(npcId, idx) {
      // Each NPC gets 2-3 cluster centers at varying distances
      var numClusters = 2 + (seedHash(areaHash + idx * 17) % 2);
      for (var cl = 0; cl < numClusters; cl++) {
        // Pick a cell in outer rings (distance 4-11 from center)
        var angle = ((idx * 2.1) + (cl * 1.4)) % 6.28;
        var dist = 4 + ((seedHash(areaHash + idx * 7 + cl * 13) % 8));
        // Approximate offset using lat/lng
        var offsetLat = lat + (Math.cos(angle) * dist * 0.0012);
        var offsetLng = lng + (Math.sin(angle) * dist * 0.0015);
        var clusterCenter = h3.geoToH3(offsetLat, offsetLng, H3_RES);
        clusterCenters.push({ npcId: npcId, center: clusterCenter, size: 1 + (seedHash(areaHash + idx + cl * 5) % 3) });
      }
    });

    // Generate territory from cluster centers
    var cellClaims = {};
    clusterCenters.forEach(function(cc) {
      var clusterCells = h3.kRing(cc.center, cc.size);
      clusterCells.forEach(function(c) {
        // Only claim cells within our overall area
        if (allCells.indexOf(c) < 0) return;
        // RP varies by position — inner cells stronger
        var d = h3.h3Distance(cc.center, c);
        if (d === null) d = cc.size;
        var baseRp = 8 + (seedHash(parseInt(c.slice(-6), 16)) % 20);
        var rp = Math.max(3, Math.round(baseRp * (1 - d * 0.2)));
        if (!cellClaims[c]) cellClaims[c] = { entityId: cc.npcId, rp: rp };
        else if (rp > cellClaims[c].rp) cellClaims[c] = { entityId: cc.npcId, rp: rp };
      });
    });

    // Convert to territory array
    for (var cell in cellClaims) {
      territory.push({ h3Index: cell, entityId: cellClaims[cell].entityId, rp: cellClaims[cell].rp });
    }

    if (territory.length === 0) return;

    apiPost('/api/seed-territory', { territory: territory }).then(function() {
      return loadTerritory();
    }).then(function() { renderHexGrid(); updateMapOverlayStats(); }).catch(function(err) { console.error('Seed error:', err); });
  }

  // ========== Hex Grid Rendering ==========
  var renderTimeout = null;
  function renderHexGrid() {
    if (renderTimeout) clearTimeout(renderTimeout);
    renderTimeout = setTimeout(doRenderHexGrid, 50);
  }

  function doRenderHexGrid() {
    if (!turfMap || !territoryState || typeof h3 === 'undefined') return;
    hexLayer.clearLayers();
    fogLayer.clearLayers();

    var center = turfMap.getCenter();
    var zoom = turfMap.getZoom();
    var bounds = turfMap.getBounds();
    var userEid = territoryState.userEntityId;
    var userInfo = userEid ? (territoryState.entities[userEid] || {}) : {};
    var myColor = userInfo.color || '#ff6a00';

    // At low zoom (< 12), use sparse rendering — only cells with territory data
    if (zoom < 12) {
      renderSparseTerritory(bounds, zoom, userEid, myColor);
      return;
    }

    // kRing sizes adjusted for H3 res 8 (larger cells)
    var renderK = zoom >= 16 ? 8 : zoom >= 15 ? 10 : zoom >= 14 ? 14 : zoom >= 13 ? 18 : 22;
    var showFullLabels = zoom >= 14;
    var showCompactLabels = zoom === 13;
    var viewCell = h3.geoToH3(center.lat, center.lng, H3_RES);
    var visibleCells = h3.kRing(viewCell, renderK);

    visibleCells.forEach(function(cell) {
      var cellCenter = h3.h3ToGeo(cell);
      if (cellCenter[0] < bounds.getSouth() - 0.01 || cellCenter[0] > bounds.getNorth() + 0.01 ||
          cellCenter[1] < bounds.getWest() - 0.01 || cellCenter[1] > bounds.getEast() + 0.01) return;

      var isExplored = territoryState.explored.has(cell);
      var boundary = h3.h3ToGeoBoundary(cell);

      // Get territory data for this cell
      var cp = territoryState.cells[cell];
      var maxEid = null; var maxRp = 0;
      if (cp) { for (var eid in cp) { if (cp[eid] > maxRp) { maxEid = eid; maxRp = cp[eid]; } } }

      if (!isExplored) {
        // Fog of war
        if (maxEid && maxRp > 0) {
          var fogInfo = territoryState.entities[maxEid] || {};
          var fogColor = fogInfo.color || '#888';
          L.polygon(boundary, { color: fogColor, fillColor: fogColor, fillOpacity: 0.06, weight: 0.5, opacity: 0.15, interactive: false }).addTo(fogLayer);
          L.polygon(boundary, { color: 'transparent', fillColor: '#05050a', fillOpacity: 0.05, weight: 0, interactive: false }).addTo(fogLayer);
        } else {
          L.polygon(boundary, { color: 'transparent', fillColor: '#05050a', fillOpacity: 0.08, weight: 0, interactive: false }).addTo(fogLayer);
        }
        return;
      }

      // Explored cells with no territory — skip (clean map)
      if (!maxEid || maxRp === 0) return;

      var isYours = maxEid === userEid;
      var info = territoryState.entities[maxEid] || {};
      var ownerColor = info.color || '#ff6a00';

      if (isYours) {
        // Your cells: screen-blended fill colorizes dark map background
        var poly = L.polygon(boundary, {
          pane: 'hexPane', color: myColor, fillColor: myColor, fillOpacity: 0.35,
          weight: 0.5, opacity: 0.15, interactive: true
        }).addTo(hexLayer);
      } else {
        // Enemy cells: lighter screen-blended tint
        var poly = L.polygon(boundary, {
          pane: 'hexPane', color: ownerColor, fillColor: ownerColor, fillOpacity: 0.2,
          weight: 0.5, opacity: 0.1, interactive: true
        }).addTo(hexLayer);
      }

      // Click to show cell info
      (function(cellId, eId, rp, yours) {
        poly.on('click', function() { showCellInfo(cellId, eId, rp, yours); });
      })(cell, maxEid, maxRp, isYours);

      // Labels — only show on cells where user has RP
      if (showFullLabels || showCompactLabels) {
        // Check if user has RP in this cell
        var userRpInCell = (userEid && cp[userEid]) ? cp[userEid] : 0;
        if (userRpInCell === 0 && !isYours) {
          // User has no RP here and doesn't own it — skip label
        } else {
          var userColor = userInfo.color || '#4ade80';
          var ownerRpVal = maxRp;
          var challengerRp = 0;
          var challengerEid = null;
          if (isYours) {
            ownerRpVal = cp[userEid] || 0;
            for (var e in cp) { if (e !== userEid && cp[e] > challengerRp) { challengerRp = cp[e]; challengerEid = e; } }
          } else {
            ownerRpVal = maxRp;
            challengerRp = userRpInCell;
          }

          // Colors: defense = owning entity color, attack = attacker entity color
          var defenseColor = ownerColor;
          var attackColor;
          if (isYours) {
            // Your cell: attacker = highest enemy, use their entity color
            var chalInfo = challengerEid ? (territoryState.entities[challengerEid] || {}) : {};
            attackColor = chalInfo.color || '#ef4444';
          } else {
            // Enemy cell: your attack color = your entity color
            attackColor = userColor;
          }

          var total = ownerRpVal + challengerRp;
          var chalPct = total > 0 ? Math.round((challengerRp / total) * 100) : 0;
          var barHtml = '<div class="hex-bar"><div class="hex-bar-fill" style="width:' + chalPct + '%;background:' + attackColor + '"></div><div class="hex-bar-fill" style="width:' + (100 - chalPct) + '%;background:' + defenseColor + '"></div></div>';
          var hasContest = challengerRp > 0;

          if (showFullLabels) {
            var labelHtml = '<div class="hex-label hex-label-pill">'
              + (isYours ? '<div class="hex-own-badge"><svg viewBox="0 0 24 24" width="11" height="11" fill="#ffb830" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>' : '')
              + '<div class="hex-rp-main" style="color:' + defenseColor + '">' + Math.round(ownerRpVal) + '</div>';
            if (hasContest) {
              labelHtml += barHtml;
              labelHtml += '<div class="hex-rp-sub" style="color:' + attackColor + '">' + Math.round(challengerRp) + '</div>';
            }
            labelHtml += '</div>';
            L.marker(cellCenter, { icon: L.divIcon({ className: '', html: labelHtml, iconSize: [56, 52], iconAnchor: [28, 26] }), interactive: false }).addTo(hexLayer);
          } else if (hasContest) {
            // Compact labels (zoom 13): star + bar only, only if contested
            var labelHtml = '<div class="hex-label hex-label-compact hex-label-pill">';
            if (isYours) {
              labelHtml += '<div class="hex-own-badge"><svg viewBox="0 0 24 24" width="9" height="9" fill="#ffb830" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>';
            }
            labelHtml += barHtml + '</div>';
            L.marker(cellCenter, { icon: L.divIcon({ className: '', html: labelHtml, iconSize: [36, 22], iconAnchor: [18, 11] }), interactive: false }).addTo(hexLayer);
          }
        }
      }
    });
  }

  // Sparse rendering for low zoom levels (< 12) — only cells with territory data
  function renderSparseTerritory(bounds, zoom, userEid, myColor) {
    var pad = 0.03;
    var south = bounds.getSouth() - pad, north = bounds.getNorth() + pad;
    var west = bounds.getWest() - pad, east = bounds.getEast() + pad;

    var useCircles = zoom <= 10;
    var circleRadius = zoom <= 10 ? 4 : 5;

    for (var cell in territoryState.cells) {
      var cellCenter = h3.h3ToGeo(cell);
      if (cellCenter[0] < south || cellCenter[0] > north || cellCenter[1] < west || cellCenter[1] > east) continue;

      var cp = territoryState.cells[cell];
      var maxEid = null; var maxRp = 0;
      for (var eid in cp) { if (cp[eid] > maxRp) { maxEid = eid; maxRp = cp[eid]; } }
      if (!maxEid || maxRp === 0) continue;

      var isYours = maxEid === userEid;
      var info = territoryState.entities[maxEid] || {};
      var ownerColor = info.color || '#ff6a00';
      var displayColor = isYours ? myColor : ownerColor;

      if (useCircles) {
        L.circleMarker([cellCenter[0], cellCenter[1]], {
          pane: 'hexPane',
          radius: isYours ? circleRadius + 1 : circleRadius,
          color: displayColor, fillColor: displayColor,
          fillOpacity: isYours ? 0.55 : 0.3,
          weight: isYours ? 1.5 : 0.5,
          opacity: isYours ? 0.7 : 0.35,
          interactive: false
        }).addTo(hexLayer);
      } else {
        // Zoom 11: simplified polygons
        var boundary = h3.h3ToGeoBoundary(cell);
        L.polygon(boundary, {
          pane: 'hexPane',
          color: displayColor, fillColor: displayColor,
          fillOpacity: isYours ? 0.25 : 0.12,
          weight: isYours ? 1.2 : 0.6,
          opacity: isYours ? 0.5 : 0.3,
          interactive: false
        }).addTo(hexLayer);
      }
    }
  }

  function updateMapOverlayStats() {
    if (!currentUser || !territoryState) return;
    var ownedCount = 0;
    var userEid = territoryState.userEntityId;
    for (var cid in territoryState.cells) {
      var cp = territoryState.cells[cid];
      var maxEid = null; var maxRp = 0;
      for (var eid in cp) { if (cp[eid] > maxRp) { maxEid = eid; maxRp = cp[eid]; } }
      if (maxEid === userEid) ownedCount++;
    }
    var heldEl = document.getElementById('stat-held');
    if (heldEl) heldEl.textContent = ownedCount;
    var rpEl = document.getElementById('stat-rp');
    if (rpEl) rpEl.textContent = currentUser.user.rpLifetime;
  }

  // ========== User Data ==========
  var isAuthenticated = false;
  function loadUserData() {
    return apiGet('/api/me').then(function(data) {
      if (data.status === 401 || data.error === 'Not authenticated') {
        currentUser = null;
        return;
      }
      currentUser = data;
      updateProfile();
      renderSkills();
      updateMapOverlayStats();
      var rpEl = document.getElementById('rp-available');
      if (rpEl) rpEl.textContent = Math.floor(data.user.rpAvailable);
      var stravaEl = document.getElementById('settings-strava');
      if (stravaEl) stravaEl.textContent = data.user.stravaLinked ? 'Linked' : 'Not linked';
      // Update header avatar
      var avatarEl = document.getElementById('header-avatar-initial');
      if (avatarEl) avatarEl.textContent = (data.user.displayName || '?').charAt(0).toUpperCase();
      var ddName = document.getElementById('dropdown-display-name');
      if (ddName) ddName.textContent = data.user.displayName;
      var ddUser = document.getElementById('dropdown-username');
      if (ddUser) ddUser.textContent = data.user.displayName;
    }).catch(function(err) { console.error('User load error:', err); });
  }

  // ========== Auth Flow ==========
  var originalHeaderHtml = document.getElementById('app-header') ? document.getElementById('app-header').innerHTML : '';
  function showAuthScreen() {
    isAuthenticated = false;
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('app-header').style.display = 'none';
    document.getElementById('page-container').style.display = 'none';
    document.getElementById('bottom-nav').style.display = 'none';
  }

  function showApp() {
    isAuthenticated = true;
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-header').style.display = '';
    document.getElementById('page-container').style.display = '';
    document.getElementById('bottom-nav').style.display = '';
    // Restore original header (in case we were in unauth mode)
    var header = document.getElementById('app-header');
    if (header) header.innerHTML = originalHeaderHtml;
    // Re-bind dropdown events after restoring HTML
    bindProfileDropdown();
    // Restore stats
    var statsOverlay = document.querySelector('.map-overlay-stats');
    if (statsOverlay) statsOverlay.style.display = '';
  }

  function showUnauthMap() {
    isAuthenticated = false;
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('app-header').style.display = '';
    document.getElementById('page-container').style.display = '';
    document.getElementById('bottom-nav').style.display = 'none';
    // Only show map page
    pages.forEach(function(p) { p.classList.remove('active'); });
    var mapPage = document.getElementById('page-map');
    if (mapPage) mapPage.classList.add('active');
    // Hide stats for unauth
    var statsOverlay = document.querySelector('.map-overlay-stats');
    if (statsOverlay) statsOverlay.style.display = 'none';
    // Show a login button instead
    var header = document.getElementById('app-header');
    if (header) header.innerHTML = '<div class="logo">TURF RUNNER</div><div class="header-actions"><a href="/api/auth/strava" class="header-btn auth-login-link" id="header-login-btn">Login with Strava</a></div>';
  }

  // Explore without account (guest mode)
  var exploreBtn = document.getElementById('auth-explore-btn');
  if (exploreBtn) exploreBtn.addEventListener('click', function() {
    showUnauthMap();
    if (!turfMap) initMap();
    else loadTerritory().then(function() { renderHexGrid(); });
  });

  // Logout (settings page)
  var logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', doLogout);

  // Logout (dropdown)
  var dropdownLogoutBtn = document.getElementById('dropdown-logout-btn');
  if (dropdownLogoutBtn) dropdownLogoutBtn.addEventListener('click', doLogout);

  function doLogout() {
    apiPost('/api/auth/logout', {}).then(function() {
      currentUser = null;
      isAuthenticated = false;
      showAuthScreen();
    });
  }

  // Profile dropdown toggle
  function bindProfileDropdown() {
    var profileIconBtn = document.getElementById('profile-icon-btn');
    var profileDropdown = document.getElementById('profile-dropdown');
    if (profileIconBtn && profileDropdown) {
      profileIconBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var isOpen = profileDropdown.style.display !== 'none';
        profileDropdown.style.display = isOpen ? 'none' : 'block';
      });
      // Dropdown nav items
      profileDropdown.querySelectorAll('[data-page]').forEach(function(item) {
        item.addEventListener('click', function() {
          profileDropdown.style.display = 'none';
          var pageId = item.getAttribute('data-page');
          if (pageId) navigateTo(pageId);
        });
      });
      // Dropdown logout
      var ddLogout = document.getElementById('dropdown-logout-btn');
      if (ddLogout) ddLogout.addEventListener('click', doLogout);
    }
    // Update avatar
    if (currentUser) {
      var avatarEl = document.getElementById('header-avatar-initial');
      if (avatarEl) avatarEl.textContent = (currentUser.user.displayName || '?').charAt(0).toUpperCase();
      var ddName = document.getElementById('dropdown-display-name');
      if (ddName) ddName.textContent = currentUser.user.displayName;
      var ddUser = document.getElementById('dropdown-username');
      if (ddUser) ddUser.textContent = currentUser.user.displayName;
    }
  }
  document.addEventListener('click', function(e) {
    var dd = document.getElementById('profile-dropdown');
    if (dd && !e.target.closest('.profile-dropdown-wrap')) dd.style.display = 'none';
  });
  bindProfileDropdown();

  // ========== Init ==========
  loadUserData().then(function() {
    if (currentUser) {
      showApp();
      initMap();
      // Auto-sync Strava activities after initial load
      syncStravaActivities();
    } else {
      showAuthScreen();
    }
  });

  // ========== Cell Info Popup ==========
  function showCellInfo(cellId, entityId, rp, isYours) {
    if (!turfMap || typeof h3 === 'undefined') return;
    var info = territoryState.entities[entityId] || {};
    var ownerName = info.name || entityId;
    var ownerColor = info.color || '#888';
    var cellCenter = h3.h3ToGeo(cellId);

    var cp = territoryState.cells[cellId] || {};
    var userEid = territoryState.userEntityId;
    var userInfo = userEid ? (territoryState.entities[userEid] || {}) : {};
    var userColor = userInfo.color || '#4ade80';
    var ownerRpVal = 0;
    var yourRpVal = 0;
    var challengerName = '';
    var attackColor = '';
    var defenseColor = ownerColor;

    if (isYours) {
      ownerRpVal = cp[userEid] || 0;
      var topE = null; var topR = 0;
      for (var e in cp) { if (e !== userEid && cp[e] > topR) { topR = cp[e]; topE = e; } }
      yourRpVal = topR;
      if (topE) {
        var ci = territoryState.entities[topE] || {};
        challengerName = ci.name || topE;
        attackColor = ci.color || '#ef4444';
      }
    } else {
      ownerRpVal = rp;
      yourRpVal = (userEid && cp[userEid]) ? cp[userEid] : 0;
      challengerName = userInfo.name || 'You';
      attackColor = userColor;
    }

    var gap = ownerRpVal - yourRpVal;
    var total = ownerRpVal + yourRpVal;
    var chalPct = total > 0 ? Math.round((yourRpVal / total) * 100) : 0;

    // Progress bar — attacker fills left→right, owner defense holds right side
    var barHtml = '<div style="display:flex;height:6px;border-radius:3px;overflow:hidden;background:#1a1a2e;margin:8px 0;">'
      + (yourRpVal > 0 ? '<div style="width:' + chalPct + '%;background:' + attackColor + ';transition:width 0.3s;"></div>' : '')
      + '<div style="width:' + (100 - chalPct) + '%;background:' + defenseColor + ';transition:width 0.3s;"></div>'
      + '</div>';

    // Gap message
    var gapHtml = '';
    if (yourRpVal > 0) {
      if (isYours) {
        gapHtml = gap > 0
          ? '<div style="font-size:12px;color:' + defenseColor + ';margin-top:4px;">Leading by ' + Math.round(gap) + ' RP</div>'
          : '<div style="font-size:12px;color:' + attackColor + ';margin-top:4px;">Losing by ' + Math.round(Math.abs(gap)) + ' RP!</div>';
      } else {
        gapHtml = gap > 0
          ? '<div style="font-size:12px;color:#8a8a96;margin-top:4px;">Need ' + Math.round(gap) + ' more RP to capture</div>'
          : '<div style="font-size:12px;color:' + attackColor + ';margin-top:4px;">Ready to capture!</div>';
      }
    }

    // Comparison layout — matches bar: attacker left, defender right
    var vsHtml = '';
    if (yourRpVal > 0) {
      var leftLabel = isYours ? challengerName : (userInfo.name || 'Your Attack');
      var leftColor = attackColor;
      var leftRp = yourRpVal;
      var rightLabel = isYours ? (userInfo.name || 'Your Defense') : ownerName;
      var rightColor = defenseColor;
      var rightRp = ownerRpVal;
      vsHtml = '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">'
        + '<div style="text-align:left;"><div style="font-size:11px;color:#8a8a96;">' + leftLabel + '</div>'
        + '<div style="font-size:20px;font-weight:800;color:' + leftColor + ';">' + Math.round(leftRp) + '</div></div>'
        + '<div style="font-size:12px;color:#555;font-weight:700;">vs</div>'
        + '<div style="text-align:right;"><div style="font-size:11px;color:#8a8a96;">' + rightLabel + '</div>'
        + '<div style="font-size:20px;font-weight:800;color:' + rightColor + ';">' + Math.round(rightRp) + '</div></div>'
        + '</div>';
    } else {
      vsHtml = '<div style="text-align:center;margin-top:6px;">'
        + '<div style="font-size:24px;font-weight:800;color:' + defenseColor + ';">' + Math.round(ownerRpVal) + ' <span style="font-size:12px;color:#8a8a96;">RP</span></div>'
        + '</div>';
    }

    var content = '<div style="min-width:150px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">'
      + '<div style="text-align:center;margin-bottom:4px;">'
      + '<div style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + ownerColor + ';margin-right:6px;vertical-align:middle;"></div>'
      + '<span style="font-weight:700;font-size:13px;color:#e8e8ec;">' + ownerName + (isYours ? ' (You)' : '') + '</span>'
      + '</div>'
      + vsHtml + barHtml + gapHtml
      + '</div>';

    L.popup({ className: 'turf-popup', closeButton: true, autoPan: true, offset: [0, -5] })
      .setLatLng(cellCenter)
      .setContent(content)
      .openOn(turfMap);
  }

  // ========== Recenter Button ==========
  var userMarker = null;
  var recenterBtn = document.getElementById('map-recenter-btn');
  if (recenterBtn) {
    recenterBtn.addEventListener('click', function() {
      if (navigator.geolocation) {
        var origHtml = recenterBtn.innerHTML;
        recenterBtn.innerHTML = '<div class="spinner"></div>';
        navigator.geolocation.getCurrentPosition(function(pos) {
          userLat = pos.coords.latitude; userLng = pos.coords.longitude;
          if (turfMap) turfMap.setView([userLat, userLng], DEFAULT_ZOOM);
          addUserMarker(userLat, userLng);
          recenterBtn.innerHTML = origHtml;
        }, function() {
          recenterBtn.innerHTML = origHtml;
          if (userLat && userLng && turfMap) turfMap.setView([userLat, userLng], DEFAULT_ZOOM);
        }, { timeout: 8000, enableHighAccuracy: true });
      } else if (userLat && userLng && turfMap) {
        turfMap.setView([userLat, userLng], DEFAULT_ZOOM);
      }
    });
  }

  // ========== Map Search with Autocomplete ==========
  var searchBtn = document.getElementById('map-search-btn');
  var searchBar = document.getElementById('map-search-bar');
  var searchInput = document.getElementById('map-search-input');
  var searchGo = document.getElementById('map-search-go');
  var searchClose = document.getElementById('map-search-close');
  var suggestionsEl = document.getElementById('map-search-suggestions');
  var searchDebounce = null;

  if (searchBtn) searchBtn.addEventListener('click', function() {
    if (searchBar) { searchBar.style.display = 'flex'; if (searchInput) { searchInput.value = ''; searchInput.focus(); } }
  });
  if (searchClose) searchClose.addEventListener('click', function() {
    if (searchBar) searchBar.style.display = 'none';
    if (suggestionsEl) suggestionsEl.style.display = 'none';
  });

  function fetchSuggestions(query) {
    if (!query || query.length < 2) { if (suggestionsEl) suggestionsEl.style.display = 'none'; return; }
    fetch('https://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + encodeURIComponent(query), {
      headers: { 'Accept': 'application/json' }
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (!data || !data.length) { if (suggestionsEl) suggestionsEl.style.display = 'none'; return; }
      var html = '';
      data.forEach(function(item) {
        var parts = item.display_name.split(',');
        var main = parts[0].trim();
        var sub = parts.slice(1, 3).join(',').trim();
        html += '<div class="map-search-suggestion" data-lat="' + item.lat + '" data-lng="' + item.lon + '">'
          + '<div>' + main + '</div>'
          + (sub ? '<div class="map-search-suggestion-sub">' + sub + '</div>' : '')
          + '</div>';
      });
      if (suggestionsEl) {
        suggestionsEl.innerHTML = html;
        suggestionsEl.style.display = 'block';
        suggestionsEl.querySelectorAll('.map-search-suggestion').forEach(function(el) {
          el.addEventListener('click', function() {
            var lat = parseFloat(el.getAttribute('data-lat'));
            var lng = parseFloat(el.getAttribute('data-lng'));
            if (turfMap) turfMap.setView([lat, lng], DEFAULT_ZOOM);
            if (searchBar) searchBar.style.display = 'none';
            if (suggestionsEl) suggestionsEl.style.display = 'none';
          });
        });
      }
    }).catch(function() {});
  }

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      if (searchDebounce) clearTimeout(searchDebounce);
      searchDebounce = setTimeout(function() { fetchSuggestions(searchInput.value.trim()); }, 300);
    });
  }

  function doMapSearch() {
    var query = searchInput ? searchInput.value.trim() : '';
    if (!query) return;
    if (suggestionsEl) suggestionsEl.style.display = 'none';
    if (searchGo) { searchGo.textContent = '...'; searchGo.disabled = true; }
    fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(query), {
      headers: { 'Accept': 'application/json' }
    }).then(function(r) { return r.json(); }).then(function(data) {
      if (searchGo) { searchGo.textContent = 'Go'; searchGo.disabled = false; }
      if (data && data.length > 0) {
        var lat = parseFloat(data[0].lat);
        var lng = parseFloat(data[0].lon);
        if (turfMap) turfMap.setView([lat, lng], DEFAULT_ZOOM);
        if (searchBar) searchBar.style.display = 'none';
      } else {
        if (searchInput) searchInput.placeholder = 'Not found, try again...';
      }
    }).catch(function() {
      if (searchGo) { searchGo.textContent = 'Go'; searchGo.disabled = false; }
    });
  }

  if (searchGo) searchGo.addEventListener('click', doMapSearch);
  if (searchInput) searchInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') doMapSearch(); });

  // ========== Color Pickers ==========
  var userColorPicker = document.getElementById('user-color-picker');
  if (userColorPicker) {
    userColorPicker.addEventListener('input', function() {
      var desc = document.getElementById('profile-color-desc');
      if (desc) desc.textContent = userColorPicker.value;
    });
    userColorPicker.addEventListener('change', function() {
      apiPost('/api/user/color', { color: userColorPicker.value }).then(function(res) {
        if (res.color) {
          currentUser.user.color = res.color;
          loadTerritory().then(function() { renderHexGrid(); });
        }
      });
    });
  }

  var groupColorPicker = document.getElementById('group-color-picker');
  if (groupColorPicker) {
    groupColorPicker.addEventListener('change', function() {
      apiPost('/api/group/color', { color: groupColorPicker.value }).then(function(res) {
        if (res.error) { alert(res.error); return; }
        loadGroupData();
        loadTerritory().then(function() { renderHexGrid(); });
      });
    });
  }

  // ========== Strava Disconnect ==========
  var stravaDisconnectBtn = document.getElementById('strava-disconnect-btn');
  if (stravaDisconnectBtn) stravaDisconnectBtn.addEventListener('click', function() {
    if (!confirm('Disconnect Strava? Your game progress (RP, territory, skills) will be kept, but you will be logged out and Strava data removed.')) return;
    apiPost('/api/auth/strava/disconnect', {}).then(function(res) {
      if (res.success) {
        currentUser = null;
        isAuthenticated = false;
        showAuthScreen();
      }
    });
  });

  // ========== Dev Tools (localhost only) ==========
  var isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalhost) {
    var devPanel = document.getElementById('dev-panel');
    if (devPanel) devPanel.style.display = 'block';

    var devToggle = document.getElementById('dev-toggle-btn');
    var devDrawer = document.getElementById('dev-drawer');
    var devClose = document.getElementById('dev-drawer-close');
    var devLog = document.getElementById('dev-log');

    function devLogMsg(msg) { if (devLog) { devLog.textContent = msg; setTimeout(function() { devLog.textContent = ''; }, 3000); } }

    if (devToggle) devToggle.addEventListener('click', function() {
      devDrawer.style.display = devDrawer.style.display === 'none' ? 'block' : 'none';
    });
    if (devClose) devClose.addEventListener('click', function() { devDrawer.style.display = 'none'; });

    // Give RP
    var devGiveRpBtn = document.getElementById('dev-give-rp-btn');
    if (devGiveRpBtn) devGiveRpBtn.addEventListener('click', function() {
      var amount = parseInt(document.getElementById('dev-rp-amount').value) || 100;
      devGiveRpBtn.textContent = '...';
      apiPost('/api/dev/give-rp', { amount: amount }).then(function(res) {
        devGiveRpBtn.textContent = 'Give RP';
        if (res.error) { devLogMsg('Error: ' + res.error); return; }
        devLogMsg('Gave ' + amount + ' RP');
        loadUserData();
      });
    });

    // Seed territory
    var devSeedBtn = document.getElementById('dev-seed-btn');
    if (devSeedBtn) devSeedBtn.addEventListener('click', function() {
      var lat = userLat || 39.8;
      var lng = userLng || -98.5;
      devSeedBtn.textContent = 'Seeding...';
      seedTerritoryData(lat, lng);
      setTimeout(function() { devSeedBtn.textContent = 'Seed Territory at GPS'; devLogMsg('Territory seeded'); }, 1500);
    });

    // Reset DB
    var devResetBtn = document.getElementById('dev-reset-btn');
    if (devResetBtn) devResetBtn.addEventListener('click', function() {
      if (!confirm('Reset all territory, discoveries, and runs?')) return;
      devResetBtn.textContent = 'Resetting...';
      apiPost('/api/dev/reset-db', {}).then(function(res) {
        devResetBtn.textContent = 'Reset Territory + Runs';
        if (res.error) { devLogMsg('Error: ' + res.error); return; }
        devLogMsg('Database reset');
        loadTerritory().then(function() { renderHexGrid(); updateMapOverlayStats(); });
        loadUserData();
      });
    });

    // Strava Activity Browser (dev only - shows ALL past activities, bypasses date filter)
    var devStravaLoadBtn = document.getElementById('dev-strava-load-btn');
    if (devStravaLoadBtn) devStravaLoadBtn.addEventListener('click', function() {
      var listEl = document.getElementById('dev-strava-list');
      if (!listEl) return;
      devStravaLoadBtn.textContent = 'Loading...';
      apiGet('/api/dev/strava/activities').then(function(data) {
        devStravaLoadBtn.textContent = 'Load Activities';
        if (data.error) { devLogMsg('Error: ' + data.error); listEl.innerHTML = '<div class="dev-strava-empty">Error: ' + data.error + '</div>'; return; }
        if (!data.activities || data.activities.length === 0) { listEl.innerHTML = '<div class="dev-strava-empty">No activities found</div>'; return; }
        listEl.innerHTML = '';
        data.activities.forEach(function(a) {
          var el = document.createElement('div');
          el.className = 'dev-strava-item';
          var distMi = (a.distance / 1609.34).toFixed(1);
          var dateStr = new Date(a.startDate).toLocaleDateString();
          var cellEst = a.polyline ? polylineToH3Cells(a.polyline).length : 0;
          el.innerHTML = '<div class="dev-strava-info">'
            + '<div class="dev-strava-name">' + a.name + '</div>'
            + '<div class="dev-strava-meta">' + a.type + ' \\u00B7 ' + distMi + ' mi \\u00B7 ' + dateStr + ' \\u00B7 ~' + cellEst + ' cells</div>'
            + '</div>'
            + (a.imported
              ? '<span class="dev-strava-badge imported">Imported</span>'
              : '<button class="dev-btn small dev-strava-import-btn">Import</button>');
          if (!a.imported) {
            var btn = el.querySelector('.dev-strava-import-btn');
            btn.addEventListener('click', function() {
              btn.textContent = '...';
              btn.disabled = true;
              processStravaActivity(a).then(function(res) {
                if (res) {
                  btn.textContent = '\\u2713';
                  btn.className = 'dev-strava-badge imported';
                  devLogMsg('Imported: ' + a.name + ' (' + res.cellsCount + ' cells, +' + res.rpEarned + ' RP)');
                  loadTerritory().then(function() { renderHexGrid(); updateMapOverlayStats(); });
                  loadUserData();
                } else {
                  btn.textContent = 'Skip';
                  btn.disabled = true;
                }
              });
            });
          }
          listEl.appendChild(el);
        });
      });
    });
  }
})();
`;
}
