export function getScripts(): string {
  return `
(function() {
  var currentUser = null;
  var territoryState = null;
  var H3_RES = 9;
  var DEFAULT_ZOOM = 15;
  var LEVEL_COSTS = [5, 15, 30, 50, 80];
  var SKILL_ICONS = {
    'wide-scan': '\\u{1F52D}', 'strike-force': '\\u{1F4A5}', 'shield': '\\u{1F6E1}\\uFE0F',
    'trailblazer': '\\u{1F3C3}', 'ghost-run': '\\u{1F47B}'
  };
  var SKILL_NAMES = {
    'wide-scan': 'Wide Scan', 'strike-force': 'Strike Force', 'shield': 'Shield',
    'trailblazer': 'Trailblazer', 'ghost-run': 'Ghost Run'
  };
  var SKILL_DESCS = {
    'wide-scan': 'Reveals adjacent cells as you run, expanding fog reveal.',
    'strike-force': 'Your RP counts for more in enemy-owned cells.',
    'shield': 'Bonus RP in friendly-owned cells, reinforcing territory.',
    'trailblazer': 'Earn bonus RP in unclaimed or newly discovered cells.',
    'ghost-run': 'Enemy players don\\u2019t see your activity in their territory.'
  };
  var SKILL_STATS = {
    'wide-scan': {
      label: 'Reveal Range',
      values: ['None', '1 ring', '1 ring', '2 rings', '2 rings', '3 rings'],
      bonus:  ['',     '',       '',       '25% chance +1', '', '25% chance +1'],
      unit: ''
    },
    'strike-force': {
      label: 'Enemy Cell Multiplier',
      values: ['1x', '1.5x', '1.75x', '2x', '2.5x', '3x'],
      bonus:  ['',   '',     '',       '',   '',     ''],
      unit: ' RP/cell'
    },
    'shield': {
      label: 'Friendly Cell Bonus',
      values: ['+0', '+0.5', '+1', '+1.5', '+2', '+2.5'],
      bonus:  ['',   '',     '',   '',     '',   ''],
      unit: ' RP/cell'
    },
    'trailblazer': {
      label: 'Unclaimed Cell Bonus',
      values: ['+0', '+1', '+1.5', '+2', '+2.5', '+3'],
      bonus:  ['',   '',   '',     '',   '',     ''],
      unit: ' RP/cell'
    },
    'ghost-run': {
      label: 'Stealth',
      values: ['Off', 'Active', 'Active', 'Active', 'Active', 'Active'],
      bonus:  ['', 'Runs hidden from enemies', 'Runs hidden from enemies', 'Runs hidden from enemies', 'Runs hidden from enemies', 'Runs hidden from enemies'],
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
    var skills = ['wide-scan', 'strike-force', 'shield', 'trailblazer', 'ghost-run'];
    var html = '';
    skills.forEach(function(id) {
      var level = u.skills[id] || 0;
      var isEquipped = u.equippedSkill === id;
      var pips = '';
      for (var i = 0; i < 5; i++) {
        pips += '<div class="skill-level-pip' + (i < level ? ' filled' : '') + '"></div>';
      }
      var costHtml = '';
      if (level >= 5) costHtml = '<span class="skill-max">MAX</span>';
      else costHtml = '<button class="skill-upgrade-btn" data-skill="' + id + '" data-cost="' + LEVEL_COSTS[level] + '">\\u2B06 ' + LEVEL_COSTS[level] + ' RP</button>';

      // Current stat line
      var stats = SKILL_STATS[id];
      var currentVal = stats.values[level] || '—';
      var currentBonus = stats.bonus[level] || '';
      var statHtml = '<div class="skill-stat-current"><span class="stat-label">' + stats.label + ':</span> <span class="stat-value">' + currentVal + stats.unit + '</span>';
      if (currentBonus) statHtml += ' <span class="stat-bonus">(' + currentBonus + ')</span>';
      statHtml += '</div>';

      // Next level preview
      var nextHtml = '';
      if (level < 5) {
        var nextVal = stats.values[level + 1] || '—';
        var nextBonus = stats.bonus[level + 1] || '';
        nextHtml = '<div class="skill-stat-next"><span class="stat-next-label">Next (Lv ' + (level + 1) + '):</span> <span class="stat-next-value">' + nextVal + stats.unit + '</span>';
        if (nextBonus) nextHtml += ' <span class="stat-bonus">(' + nextBonus + ')</span>';
        nextHtml += '</div>';
      }

      html += '<div class="skill-card' + (isEquipped ? ' equipped' : '') + '" data-skill="' + id + '">'
        + '<div class="skill-top">'
        + '<div class="skill-icon">' + (SKILL_ICONS[id] || '') + '</div>'
        + '<div class="skill-info"><div class="skill-name">' + SKILL_NAMES[id] + '</div>'
        + '<div class="skill-desc">' + SKILL_DESCS[id] + '</div></div>'
        + (isEquipped ? '<span class="equipped-badge">Equipped</span>' : '')
        + '</div>'
        + '<div class="skill-stats">' + statHtml + nextHtml + '</div>'
        + '<div class="skill-bottom">'
        + '<div class="skill-level-bar">' + pips + '<span class="skill-level-label">Lv ' + level + '</span></div>'
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
          html += '<div class="member-row">'
            + '<div class="member-avatar" style="border-color:' + m.color + '">' + (m.displayName || '?').charAt(0) + '</div>'
            + '<div class="member-info">'
            + '<div class="member-name">' + m.displayName + (m.id === g.ownerId ? ' <span class="member-role">Owner</span>' : '') + '</div>'
            + '<div class="member-detail">' + skillIcon + ' ' + skillName + '</div>'
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
    if (eqIcon) eqIcon.textContent = u.equippedSkill ? (SKILL_ICONS[u.equippedSkill] || '') : '\\u2014';
    if (eqName) eqName.textContent = u.equippedSkill ? (SKILL_NAMES[u.equippedSkill] || u.equippedSkill) : 'None';
    if (eqLevel) eqLevel.textContent = u.equippedSkill ? 'Level ' + (u.skills[u.equippedSkill] || 0) : '';
    var lifetimeEl = document.getElementById('stat-lifetime-rp');
    if (lifetimeEl) lifetimeEl.textContent = u.rpLifetime;
    var availableEl = document.getElementById('stat-available-rp');
    if (availableEl) availableEl.textContent = Math.floor(u.rpAvailable);
    var colorEl = document.getElementById('settings-color');
    if (colorEl) colorEl.textContent = u.color;
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

      // Compute fog reveal from Wide Scan
      var revealedCells = [];
      if (typeof h3 !== 'undefined' && currentUser) {
        var u = currentUser.user;
        var revealRings = 0;
        if (u.equippedSkill === 'wide-scan') {
          var lvl = u.skills['wide-scan'] || 0;
          revealRings = [0, 1, 1, 2, 2, 3][lvl] || 0;
          var extra = [0, 0, 0.25, 0, 0.25, 0][lvl] || 0;
          if (extra > 0 && Math.random() < extra) revealRings++;
        }
        if (revealRings > 0) {
          var revealSet = {};
          runSelectedCells.forEach(function(cell) {
            h3.kRing(cell, revealRings).forEach(function(c) { revealSet[c] = true; });
          });
          revealedCells = Object.keys(revealSet);
        }
      }

      var allRevealed = runSelectedCells.slice();
      revealedCells.forEach(function(c) { if (allRevealed.indexOf(c) < 0) allRevealed.push(c); });

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
    body.innerHTML = '<div class="run-result-grid">'
      + '<div class="run-result-stat"><div class="rr-value">' + res.cellsCount + '</div><div class="rr-label">Cells</div></div>'
      + '<div class="run-result-stat"><div class="rr-value green">' + res.cellsCaptured + '</div><div class="rr-label">Captured</div></div>'
      + '<div class="run-result-stat"><div class="rr-value amber">+' + res.rpEarned + '</div><div class="rr-label">RP Earned</div></div>'
      + '</div>';
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
    turfMap = L.map('map', { zoomControl: false, attributionControl: false, minZoom: 13, maxZoom: 18 });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(turfMap);
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
    var renderK = zoom >= 16 ? 12 : zoom >= 15 ? 16 : zoom >= 14 ? 24 : 32;
    var showLabels = zoom >= 15;
    var viewCell = h3.geoToH3(center.lat, center.lng, H3_RES);
    var visibleCells = h3.kRing(viewCell, renderK);
    var bounds = turfMap.getBounds();

    visibleCells.forEach(function(cell) {
      var cellCenter = h3.h3ToGeo(cell);
      if (cellCenter[0] < bounds.getSouth() - 0.005 || cellCenter[0] > bounds.getNorth() + 0.005 ||
          cellCenter[1] < bounds.getWest() - 0.005 || cellCenter[1] > bounds.getEast() + 0.005) return;

      var isExplored = territoryState.explored.has(cell);
      var boundary = h3.h3ToGeoBoundary(cell);

      // All cells get a subtle grid line
      L.polygon(boundary, { color: '#ffffff', fillColor: 'transparent', fillOpacity: 0, weight: 0.3, opacity: 0.06, interactive: false }).addTo(hexLayer);

      // Get territory data for this cell (works for both explored and fog)
      var cp = territoryState.cells[cell];
      var maxEid = null; var maxRp = 0;
      if (cp) { for (var eid in cp) { if (cp[eid] > maxRp) { maxEid = eid; maxRp = cp[eid]; } } }

      if (!isExplored) {
        // Fog of war: territory colors visible but darkened under fog
        if (maxEid && maxRp > 0) {
          var fogInfo = territoryState.entities[maxEid] || {};
          var fogColor = fogInfo.color || '#888';
          // Territory color layer — tint visible, map roads show through
          L.polygon(boundary, { color: fogColor, fillColor: fogColor, fillOpacity: 0.2, weight: 0.8, opacity: 0.35, interactive: false }).addTo(fogLayer);
          // Light dark overlay to mute slightly
          L.polygon(boundary, { color: 'transparent', fillColor: '#05050a', fillOpacity: 0.25, weight: 0, interactive: false }).addTo(fogLayer);
        } else {
          // Unclaimed fog — light dark overlay, roads still visible
          L.polygon(boundary, { color: 'transparent', fillColor: '#05050a', fillOpacity: 0.3, weight: 0, interactive: false }).addTo(fogLayer);
        }
        return;
      }

      // Explored cells: show grid outline
      L.polygon(boundary, { color: '#ffffff', fillColor: 'transparent', fillOpacity: 0, weight: 0.3, opacity: 0.1, interactive: false }).addTo(hexLayer);

      // Explored cells with territory
      if (!maxEid || maxRp === 0) return;

      var userEid = territoryState.userEntityId;
      var isYours = maxEid === userEid;
      var info = territoryState.entities[maxEid] || {};
      var ownerColor = info.color || '#ff6a00';
      var userInfo = userEid ? (territoryState.entities[userEid] || {}) : {};
      var myColor = userInfo.color || '#ff6a00';

      if (isYours) {
        // Glow layer — wide translucent border behind the cell
        L.polygon(boundary, {
          color: myColor, fillColor: 'transparent', fillOpacity: 0,
          weight: 8, opacity: 0.25, interactive: false
        }).addTo(hexLayer);
        // Main cell — brighter fill + solid border
        var poly = L.polygon(boundary, {
          color: myColor, fillColor: myColor, fillOpacity: 0.4,
          weight: 2, opacity: 0.9, interactive: true
        }).addTo(hexLayer);
        // Ownership badge — small shield icon only when zoomed in
        // (integrated into label below)
      } else {
        // Enemy cells — muted, no glow
        var poly = L.polygon(boundary, {
          color: ownerColor, fillColor: ownerColor, fillOpacity: 0.2,
          weight: 1.5, opacity: 0.6, interactive: true
        }).addTo(hexLayer);
      }

      // Click to show cell info
      (function(cellId, eId, rp, yours) {
        poly.on('click', function() { showCellInfo(cellId, eId, rp, yours); });
      })(cell, maxEid, maxRp, isYours);

      if (showLabels) {
        var userEid = territoryState.userEntityId;
        var userInfo = userEid ? (territoryState.entities[userEid] || {}) : {};
        var userColor = userInfo.color || '#4ade80';
        var ownerRpVal = maxRp;
        var challengerRp = 0;
        var challengerEid = null;
        if (isYours) {
          ownerRpVal = cp[userEid] || 0;
          for (var e in cp) { if (e !== userEid && cp[e] > challengerRp) { challengerRp = cp[e]; challengerEid = e; } }
        } else {
          ownerRpVal = maxRp;
          challengerRp = (userEid && cp[userEid]) ? cp[userEid] : 0;
        }

        // Colors: defense = owner entity color, attack = attacker entity color
        var defenseColor = ownerColor;
        var attackColor;
        if (isYours) {
          // Your cell: attacker color = attacker's entity color
          var chalInfo = challengerEid ? (territoryState.entities[challengerEid] || {}) : {};
          attackColor = chalInfo.color || '#ef4444';
        } else {
          // Enemy cell: your attack color = your entity color
          attackColor = userColor;
        }

        var total = ownerRpVal + challengerRp;
        var chalPct = total > 0 ? Math.round((challengerRp / total) * 100) : 0;
        var barHtml = '<div class="hex-bar"><div class="hex-bar-fill" style="width:' + chalPct + '%;background:' + attackColor + '"></div><div class="hex-bar-fill" style="width:' + (100 - chalPct) + '%;background:' + defenseColor + '"></div></div>';

        var labelHtml = '<div class="hex-label">'
          + (isYours ? '<div class="hex-own-badge">\\u2B50</div>' : '')
          + '<div class="hex-rp-main" style="color:' + defenseColor + '">' + Math.round(ownerRpVal) + '</div>';
        if (challengerRp > 0) {
          labelHtml += barHtml;
          labelHtml += '<div class="hex-rp-sub" style="color:' + attackColor + '">' + Math.round(challengerRp) + '</div>';
        }
        labelHtml += '</div>';
        L.marker(cellCenter, { icon: L.divIcon({ className: '', html: labelHtml, iconSize: [52, 50], iconAnchor: [26, 25] }), interactive: false }).addTo(hexLayer);
      }
    });
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
      var usernameEl = document.getElementById('settings-username');
      if (usernameEl) usernameEl.textContent = '@' + data.user.username;
      var stravaEl = document.getElementById('settings-strava');
      if (stravaEl) stravaEl.textContent = data.user.stravaLinked ? 'Linked' : 'Not linked (coming soon)';
      // Update header avatar
      var avatarEl = document.getElementById('header-avatar-initial');
      if (avatarEl) avatarEl.textContent = (data.user.displayName || '?').charAt(0).toUpperCase();
      var ddName = document.getElementById('dropdown-display-name');
      if (ddName) ddName.textContent = data.user.displayName;
      var ddUser = document.getElementById('dropdown-username');
      if (ddUser) ddUser.textContent = '@' + data.user.username;
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
    // Restore stats + add-run
    var statsOverlay = document.querySelector('.map-overlay-stats');
    if (statsOverlay) statsOverlay.style.display = '';
    var quickActions = document.querySelector('.map-quick-actions');
    if (quickActions) quickActions.style.display = '';
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
    // Hide stats + add-run for unauth
    var statsOverlay = document.querySelector('.map-overlay-stats');
    if (statsOverlay) statsOverlay.style.display = 'none';
    var quickActions = document.querySelector('.map-quick-actions');
    if (quickActions) quickActions.style.display = 'none';
    // Show a login button instead
    var header = document.getElementById('app-header');
    if (header) header.innerHTML = '<div class="logo">TURF</div><div class="header-actions"><button class="header-btn auth-login-link" id="header-login-btn">Login</button></div>';
    var headerLogin = document.getElementById('header-login-btn');
    if (headerLogin) headerLogin.addEventListener('click', function() { showAuthScreen(); });
  }

  // Auth form handlers
  var showRegisterLink = document.getElementById('show-register');
  var showLoginLink = document.getElementById('show-login');
  var loginForm = document.getElementById('auth-login');
  var registerForm = document.getElementById('auth-register');

  if (showRegisterLink) showRegisterLink.addEventListener('click', function(e) {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = '';
  });
  if (showLoginLink) showLoginLink.addEventListener('click', function(e) {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = '';
  });

  // Login handler
  var loginBtn = document.getElementById('login-btn');
  if (loginBtn) loginBtn.addEventListener('click', function() {
    var username = document.getElementById('login-username').value.trim();
    var password = document.getElementById('login-password').value;
    var errorEl = document.getElementById('login-error');
    if (!username || !password) { errorEl.textContent = 'Enter username and password'; return; }
    loginBtn.disabled = true; loginBtn.textContent = 'Logging in...'; errorEl.textContent = '';
    apiPost('/api/auth/login', { username: username, password: password }).then(function(res) {
      loginBtn.disabled = false; loginBtn.textContent = 'Login';
      if (res.error) { errorEl.textContent = res.error; return; }
      loadUserData().then(function() {
        showApp();
        if (!turfMap) initMap(); else { turfMap.invalidateSize(); loadTerritory().then(function() { renderHexGrid(); checkAndSeedTerritory(); }); }
      });
    }).catch(function() { loginBtn.disabled = false; loginBtn.textContent = 'Login'; errorEl.textContent = 'Network error'; });
  });

  // Register handler
  var registerBtn = document.getElementById('register-btn');
  if (registerBtn) registerBtn.addEventListener('click', function() {
    var username = document.getElementById('register-username').value.trim();
    var displayName = document.getElementById('register-display').value.trim();
    var password = document.getElementById('register-password').value;
    var errorEl = document.getElementById('register-error');
    if (!username || !password) { errorEl.textContent = 'Username and password required'; return; }
    registerBtn.disabled = true; registerBtn.textContent = 'Creating...'; errorEl.textContent = '';
    apiPost('/api/auth/register', { username: username, password: password, displayName: displayName || undefined }).then(function(res) {
      registerBtn.disabled = false; registerBtn.textContent = 'Create Account';
      if (res.error) { errorEl.textContent = res.error; return; }
      loadUserData().then(function() {
        showApp();
        if (!turfMap) initMap(); else { turfMap.invalidateSize(); loadTerritory().then(function() { renderHexGrid(); checkAndSeedTerritory(); }); }
      });
    }).catch(function() { registerBtn.disabled = false; registerBtn.textContent = 'Create Account'; errorEl.textContent = 'Network error'; });
  });

  // Enter key handlers for auth inputs
  ['login-username', 'login-password'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('keydown', function(e) { if (e.key === 'Enter') loginBtn.click(); });
  });
  ['register-username', 'register-display', 'register-password'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('keydown', function(e) { if (e.key === 'Enter') registerBtn.click(); });
  });

  // Explore without account
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
      if (ddUser) ddUser.textContent = '@' + currentUser.user.username;
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
      var desc = document.getElementById('settings-color');
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
  }
})();
`;
}
