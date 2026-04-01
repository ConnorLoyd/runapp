export function getScripts(): string {
  return `
(function() {
  // ========== API Helpers ==========
  var currentUser = null;
  var currentGroup = null;
  var territoryState = null;
  var H3_RES = 9;
  var DEFAULT_ZOOM = 15;

  function apiGet(url) {
    return fetch(url).then(function(r) { return r.json(); });
  }

  function apiPost(url, body) {
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function(r) { return r.json(); });
  }

  // ========== Page Navigation ==========
  var allNavItems = document.querySelectorAll('.nav-item, .quick-btn[data-page], .header-btn[data-page]');
  var pages = document.querySelectorAll('.page');
  var bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');

  function navigateTo(pageId) {
    pages.forEach(function(p) { p.classList.remove('active'); });
    bottomNavItems.forEach(function(n) { n.classList.remove('active'); });
    var page = document.getElementById(pageId);
    var nav = document.querySelector('.bottom-nav [data-page="' + pageId + '"]');
    if (page) page.classList.add('active');
    if (nav) nav.classList.add('active');
    document.querySelector('.page-container').scrollTop = 0;
  }

  allNavItems.forEach(function(item) {
    item.addEventListener('click', function() {
      var pageId = item.getAttribute('data-page');
      if (pageId) navigateTo(pageId);
    });
  });

  // ========== Skill Tabs ==========
  document.querySelectorAll('.skill-tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = tab.getAttribute('data-skill-tab');
      document.querySelectorAll('.skill-tab').forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      document.querySelectorAll('.skill-panel').forEach(function(p) { p.classList.remove('active'); });
      var panel = document.getElementById('skills-' + target);
      if (panel) panel.classList.add('active');
    });
  });

  // ========== Leaderboard Toggles ==========
  var lbScope = 'local';
  var lbType = 'groups';

  function updateLeaderboard() {
    document.querySelectorAll('.lb-panel').forEach(function(p) { p.classList.remove('active'); });
    var panel = document.getElementById('lb-' + lbScope + '-' + lbType);
    if (panel) panel.classList.add('active');
  }

  document.querySelectorAll('#lb-scope-toggle .lb-scope-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#lb-scope-toggle .lb-scope-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      lbScope = btn.getAttribute('data-scope');
      updateLeaderboard();
    });
  });

  document.querySelectorAll('#lb-type-toggle .lb-type-pill').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('#lb-type-toggle .lb-type-pill').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      lbType = btn.getAttribute('data-type');
      updateLeaderboard();
    });
  });

  // ========== Skill Card — Equip on Click ==========
  var LEVEL_COSTS = [5, 15, 30, 50, 80];

  document.querySelectorAll('.skill-card').forEach(function(card) {
    card.addEventListener('click', function(e) {
      if (e.target.closest('.skill-lvl-btn')) return;
      var panel = card.closest('.skill-panel');
      if (!panel) return;
      var skillId = card.getAttribute('data-skill');
      var type = card.getAttribute('data-type');
      if (!skillId || !type) return;

      panel.querySelectorAll('.skill-card').forEach(function(c) {
        c.classList.remove('equipped');
        var badge = c.querySelector('.equipped-badge');
        if (badge) badge.remove();
      });
      card.classList.add('equipped');
      var nameEl = card.querySelector('.skill-name');
      if (nameEl && !card.querySelector('.equipped-badge')) {
        var badge = document.createElement('span');
        badge.className = 'equipped-badge';
        badge.textContent = 'Equipped';
        card.querySelector('.skill-top').appendChild(badge);
      }

      apiPost('/api/skills/equip', { skillId: skillId, category: type }).then(function(res) {
        if (res.error) { console.error('Equip failed:', res.error); return; }
        if (currentUser) {
          if (type === 'solo') { currentUser.user.soloSkill = skillId; currentUser.user.soloSkillLevel = res.level; }
          if (type === 'double') { currentUser.user.doubleSkill = skillId; currentUser.user.doubleSkillLevel = res.level; }
          if (type === 'group') { currentUser.user.groupSkill = skillId; currentUser.user.groupSkillLevel = res.level; }
        }
        updateProfileSkills();
      }).catch(function(err) { console.error('Equip error:', err); });
    });
  });

  // ========== Skill Level Up ==========
  document.querySelectorAll('.skill-lvl-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var card = btn.closest('.skill-card');
      if (!card) return;
      var skillId = card.getAttribute('data-skill');
      var type = card.getAttribute('data-type');
      if (!skillId || !type) return;

      btn.disabled = true;
      btn.textContent = '...';

      apiPost('/api/skills/levelup', { skillId: skillId, category: type }).then(function(res) {
        if (res.error) {
          console.error('Level up failed:', res.error);
          btn.disabled = false;
          btn.textContent = res.error === 'Not enough SP' ? 'Need SP' : 'Error';
          setTimeout(function() { restoreLevelBtn(btn, card); }, 1500);
          return;
        }

        var spEl = document.getElementById('sp-amount');
        if (spEl) spEl.textContent = Math.floor(res.spRemaining);
        if (currentUser) currentUser.user.skillPoints = res.spRemaining;

        var levelBar = card.querySelector('.skill-level-bar');
        if (levelBar) {
          var pips = levelBar.querySelectorAll('.skill-level-pip');
          var filledCount = 0;
          pips.forEach(function(pip) { if (pip.classList.contains('filled')) filledCount++; });
          if (filledCount < pips.length) {
            pips[filledCount].classList.add('filled');
            if (type === 'double' || type === 'group') pips[filledCount].classList.add('amber');
          }
          var levelLabel = levelBar.querySelector('.skill-level-label');
          if (levelLabel) levelLabel.textContent = 'Lv ' + res.newLevel;
        }

        card.setAttribute('data-level', res.newLevel);
        if (res.nextCost === null) {
          btn.textContent = 'MAX';
          btn.disabled = true;
        } else {
          btn.textContent = '\u2B06 ' + res.nextCost + ' SP';
          btn.setAttribute('data-cost', res.nextCost);
          btn.disabled = false;
        }
        updateProfileSkills();
      }).catch(function(err) {
        console.error('Level up error:', err);
        btn.disabled = false;
        restoreLevelBtn(btn, card);
      });
    });
  });

  function restoreLevelBtn(btn, card) {
    var level = parseInt(card.getAttribute('data-level') || '0', 10);
    if (level >= 5) { btn.textContent = 'MAX'; btn.disabled = true; }
    else { var cost = LEVEL_COSTS[level] || 5; btn.textContent = '\u2B06 ' + cost + ' SP'; btn.setAttribute('data-cost', cost); }
  }

  // ========== Collapsible Sections ==========
  document.querySelectorAll('.section-header.collapsible').forEach(function(header) {
    header.addEventListener('click', function() {
      var targetId = header.getAttribute('data-collapse');
      var body = document.getElementById(targetId);
      if (!body) return;
      if (header.classList.contains('collapsed')) {
        header.classList.remove('collapsed');
        body.style.display = 'block';
      } else {
        header.classList.add('collapsed');
        body.style.display = 'none';
      }
    });
  });

  // ========== Modal Helpers ==========
  function openModal(id) { var m = document.getElementById(id); if (m) m.style.display = 'flex'; }
  function closeModal(id) { var m = document.getElementById(id); if (m) m.style.display = 'none'; }

  document.querySelectorAll('[data-close]').forEach(function(btn) {
    btn.addEventListener('click', function() { closeModal(btn.getAttribute('data-close')); });
  });
  document.querySelectorAll('.group-modal').forEach(function(modal) {
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.style.display = 'none'; });
  });

  // ========== Management Buttons ==========
  var inviteBtn = document.getElementById('mgmt-invite-btn');
  if (inviteBtn) inviteBtn.addEventListener('click', function() { openModal('invite-modal'); });
  var requestsBtn = document.getElementById('mgmt-requests-btn');
  if (requestsBtn) requestsBtn.addEventListener('click', function() { openModal('requests-modal'); });
  var leaveBtn = document.getElementById('mgmt-leave-btn');
  if (leaveBtn) leaveBtn.addEventListener('click', function() { openModal('leave-modal'); });

  var copyBtn = document.getElementById('invite-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      var code = document.getElementById('invite-code-value');
      if (code && navigator.clipboard) {
        navigator.clipboard.writeText(code.textContent).then(function() {
          copyBtn.textContent = 'Copied!';
          setTimeout(function() { copyBtn.textContent = 'Copy Code'; }, 1500);
        });
      }
    });
  }

  var shareBtn = document.getElementById('invite-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function() {
      if (navigator.share) {
        navigator.share({ title: 'Join on Turf', text: 'Use invite code to join!', url: window.location.origin });
      } else {
        shareBtn.textContent = 'Link copied!';
        if (navigator.clipboard) navigator.clipboard.writeText(window.location.origin);
        setTimeout(function() { shareBtn.textContent = 'Share Invite Link'; }, 1500);
      }
    });
  }

  document.querySelectorAll('.jr-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = btn.closest('.join-request-item');
      if (!item) return;
      var name = item.querySelector('.jr-name');
      if (btn.classList.contains('accept')) {
        item.innerHTML = '<div style="padding:8px 0;color:var(--green);font-size:12px;font-weight:600">' + (name ? name.textContent : 'Player') + ' accepted</div>';
      } else {
        item.innerHTML = '<div style="padding:8px 0;color:var(--text-muted);font-size:12px">' + (name ? name.textContent : 'Player') + ' denied</div>';
      }
    });
  });

  var leaveConfirmBtn = document.getElementById('leave-confirm-btn');
  if (leaveConfirmBtn) {
    leaveConfirmBtn.addEventListener('click', function() {
      leaveConfirmBtn.textContent = 'Leaving...';
      leaveConfirmBtn.disabled = true;
      setTimeout(function() { closeModal('leave-modal'); leaveConfirmBtn.textContent = 'Leave Group'; leaveConfirmBtn.disabled = false; }, 1200);
    });
  }

  // ========== Raid Map Overlay ==========
  var raidMap = null;
  var raidHexLayer = null;
  var raidSelectedCells = [];
  var raidMaxCells = 5;
  var raidOverlay = null;

  function openRaidMap() {
    raidOverlay = document.getElementById('raid-map-overlay');
    if (!raidOverlay) return;
    raidOverlay.style.display = 'flex';
    raidSelectedCells = [];
    updateRaidCount();
    if (!raidMap) {
      raidMap = L.map('raid-map', { zoomControl: false, attributionControl: false, minZoom: 13, maxZoom: 18 });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(raidMap);
      raidHexLayer = L.layerGroup().addTo(raidMap);
    }
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem('turfHomeLocation')); } catch(e) {}
    var lat = (saved && saved.lat) ? saved.lat : (userLat || 39.8);
    var lng = (saved && saved.lng) ? saved.lng : (userLng || -98.5);
    raidMap.setView([lat, lng], 15);
    setTimeout(function() { raidMap.invalidateSize(); renderRaidHexes(); }, 100);
    raidMap.on('moveend', renderRaidHexes);
    raidMap.on('zoomend', renderRaidHexes);
  }

  function closeRaidMap() {
    if (raidOverlay) raidOverlay.style.display = 'none';
    if (raidMap) { raidMap.off('moveend', renderRaidHexes); raidMap.off('zoomend', renderRaidHexes); }
    raidSelectedCells = [];
  }

  function updateRaidCount() {
    var countEl = document.getElementById('raid-hex-count');
    var confirmBtn = document.getElementById('raid-confirm-btn');
    if (countEl) countEl.textContent = raidSelectedCells.length;
    if (confirmBtn) confirmBtn.disabled = raidSelectedCells.length === 0;
  }

  function toggleRaidCell(cell) {
    var idx = raidSelectedCells.indexOf(cell);
    if (idx >= 0) raidSelectedCells.splice(idx, 1);
    else if (raidSelectedCells.length < raidMaxCells) raidSelectedCells.push(cell);
    updateRaidCount();
    renderRaidHexes();
  }

  function renderRaidHexes() {
    if (!raidMap || !raidHexLayer || typeof h3 === 'undefined') return;
    raidHexLayer.clearLayers();
    var center = raidMap.getCenter();
    var zoom = raidMap.getZoom();
    var renderK = zoom >= 16 ? 6 : zoom >= 15 ? 8 : zoom >= 14 ? 12 : 16;
    var viewCell = h3.geoToH3(center.lat, center.lng, H3_RES);
    var visibleCells = h3.kRing(viewCell, renderK);
    var bounds = raidMap.getBounds();

    visibleCells.forEach(function(cell) {
      var cellCenter = h3.h3ToGeo(cell);
      if (cellCenter[0] < bounds.getSouth() - 0.005 || cellCenter[0] > bounds.getNorth() + 0.005 ||
          cellCenter[1] < bounds.getWest() - 0.005 || cellCenter[1] > bounds.getEast() + 0.005) return;
      var data = getCellData(cell);
      if (!data) return;
      var boundary = h3.h3ToGeoBoundary(cell);
      var isSelected = raidSelectedCells.indexOf(cell) >= 0;

      if (data.owner === 'enemy') {
        var poly = L.polygon(boundary, {
          color: isSelected ? '#ef4444' : '#ff6a00', fillColor: isSelected ? '#ef4444' : '#ff6a00',
          fillOpacity: isSelected ? 0.5 : 0.15, weight: isSelected ? 2.5 : 1, opacity: isSelected ? 1 : 0.5
        }).addTo(raidHexLayer);
        poly.on('click', function() { toggleRaidCell(cell); });
        if (zoom >= 15) {
          var labelHtml = '<div style="text-align:center;text-shadow:0 0 4px #000;pointer-events:none">'
            + '<div style="font-size:13px;font-weight:700;color:' + (isSelected ? '#ef4444' : '#ff6a00') + '">\uD83D\uDEE1\uFE0F ' + data.defense + '</div>'
            + (isSelected ? '<div style="font-size:10px;color:#ef4444;font-weight:700">TARGET</div>' : '') + '</div>';
          L.marker(cellCenter, { icon: L.divIcon({ className: '', html: labelHtml, iconSize: [60, 36], iconAnchor: [30, 18] }), interactive: false }).addTo(raidHexLayer);
        }
      } else if (data.owner === 'you') {
        L.polygon(boundary, { color: '#4ade80', fillColor: '#4ade80', fillOpacity: 0.15, weight: 0.8, opacity: 0.4 }).addTo(raidHexLayer);
      } else {
        L.polygon(boundary, { color: '#ffffff', fillColor: 'transparent', fillOpacity: 0, weight: 0.3, opacity: 0.08 }).addTo(raidHexLayer);
      }
    });
  }

  var proposeBtn = document.getElementById('propose-raid-btn');
  if (proposeBtn) proposeBtn.addEventListener('click', function() { openRaidMap(); });
  var raidCancelBtn = document.getElementById('raid-cancel-btn');
  if (raidCancelBtn) raidCancelBtn.addEventListener('click', function() { closeRaidMap(); });
  var raidConfirmBtn = document.getElementById('raid-confirm-btn');
  if (raidConfirmBtn) {
    raidConfirmBtn.addEventListener('click', function() {
      if (raidSelectedCells.length === 0) return;
      raidConfirmBtn.textContent = 'Raid Proposed!';
      raidConfirmBtn.disabled = true;
      setTimeout(function() { closeRaidMap(); raidConfirmBtn.textContent = 'Propose Raid'; }, 1200);
    });
  }

  // ========== ADD RUN MAP OVERLAY ==========
  var runMap = null;
  var runHexLayer = null;
  var runSelectedCells = [];
  var runOverlay = null;
  var runType = 'solo';

  function openRunMap() {
    runOverlay = document.getElementById('run-map-overlay');
    if (!runOverlay) return;
    runOverlay.style.display = 'flex';
    runSelectedCells = [];
    runType = 'solo';
    updateRunInfo();
    document.querySelectorAll('.run-type-btn').forEach(function(b) { b.classList.remove('active'); });
    var defaultBtn = document.querySelector('.run-type-btn[data-run-type="solo"]');
    if (defaultBtn) defaultBtn.classList.add('active');

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
      else if (data && data.owner === 'enemy') { baseColor = '#ff6a00'; baseOpacity = 0.15; }

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

  // Run type buttons
  document.querySelectorAll('.run-type-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.run-type-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      runType = btn.getAttribute('data-run-type') || 'solo';
    });
  });

  // Add Runs button
  var addRunBtn = document.querySelector('.quick-btn.primary');
  if (addRunBtn) {
    addRunBtn.addEventListener('click', function(e) { e.stopPropagation(); openRunMap(); });
  }

  var runCancelBtn = document.getElementById('run-cancel-btn');
  if (runCancelBtn) runCancelBtn.addEventListener('click', function() { closeRunMap(); });

  var runSubmitBtn = document.getElementById('run-submit-btn');
  if (runSubmitBtn) {
    runSubmitBtn.addEventListener('click', function() {
      if (runSelectedCells.length === 0) return;
      runSubmitBtn.textContent = 'Submitting...';
      runSubmitBtn.disabled = true;

      // Compute fog reveal cells based on active skill (Wide Scan / Recon Sweep)
      var revealedCells = [];
      if (typeof h3 !== 'undefined' && currentUser) {
        var u = currentUser.user;
        var skill = null;
        var skillLevel = 0;
        if (runType === 'solo') { skill = u.soloSkill; skillLevel = u.soloSkillLevel; }
        else if (runType === 'double') { skill = u.doubleSkill; skillLevel = u.doubleSkillLevel; }
        else if (runType === 'group') { skill = u.groupSkill; skillLevel = u.groupSkillLevel; }

        var revealRings = 0;
        if (skill === 'wide-scan' && skillLevel > 0) {
          // Lv1: 1 ring, Lv2: 1 ring + 25% 2nd, Lv3: 2 rings, Lv4: 2 + 25% 3rd, Lv5: 3 rings
          revealRings = [0, 1, 1, 2, 2, 3][skillLevel] || 0;
          var extraChance = [0, 0, 0.25, 0, 0.25, 0][skillLevel] || 0;
          if (extraChance > 0 && Math.random() < extraChance) revealRings++;
        } else if (skill === 'recon-sweep' && skillLevel > 0) {
          // Lv1: 1 ring, Lv2: 1 ring + overlap, Lv3: 2 rings, Lv4: 2 + overlap, Lv5: 2 rings (4 combined)
          revealRings = [0, 1, 1, 2, 2, 2][skillLevel] || 0;
        }

        if (revealRings > 0) {
          var revealSet = {};
          runSelectedCells.forEach(function(cell) {
            var ring = h3.kRing(cell, revealRings);
            ring.forEach(function(c) { revealSet[c] = true; });
          });
          revealedCells = Object.keys(revealSet);
        }
      }

      // Always reveal the cells ran through + any skill-based reveals
      var allRevealed = runSelectedCells.slice();
      revealedCells.forEach(function(c) { if (allRevealed.indexOf(c) < 0) allRevealed.push(c); });

      apiPost('/api/runs', { cells: runSelectedCells, runType: runType, revealedCells: allRevealed }).then(function(res) {
        closeRunMap();
        runSubmitBtn.textContent = 'Submit Run';
        runSubmitBtn.disabled = false;
        if (res.error) { alert('Run failed: ' + res.error); return; }

        showRunResult(res);
        loadTerritory().then(function() { if (turfMap) renderHexGrid(); });
        loadUserData();
      }).catch(function(err) {
        console.error('Run submit error:', err);
        runSubmitBtn.textContent = 'Submit Run';
        runSubmitBtn.disabled = false;
        closeRunMap();
      });
    });
  }

  function showRunResult(res) {
    var body = document.getElementById('run-result-body');
    if (!body) return;
    var skillInfo = '';
    if (res.activeSkill) {
      skillInfo = '<div class="run-result-skill"><span class="rr-skill-icon">\u26A1</span><span>'
        + res.activeSkill.replace(/-/g, ' ') + ' Lv' + res.activeSkillLevel + ' active (' + res.runType + ')</span></div>';
    }
    body.innerHTML = '<div class="run-result-grid">'
      + '<div class="run-result-stat"><div class="rr-value">' + res.cellsTraversed + '</div><div class="rr-label">Cells</div></div>'
      + '<div class="run-result-stat"><div class="rr-value green">' + res.cellsCaptured + '</div><div class="rr-label">Captured</div></div>'
      + '<div class="run-result-stat"><div class="rr-value">' + res.pointsEarned.toFixed(1) + '</div><div class="rr-label">Points</div></div>'
      + '<div class="run-result-stat"><div class="rr-value green">+' + res.spEarned.toFixed(1) + '</div><div class="rr-label">SP Earned</div></div>'
      + '</div><div style="text-align:center;font-size:12px;color:var(--text-muted);margin-top:4px">'
      + res.distanceMiles.toFixed(1) + ' mi \u00B7 ' + res.runType + ' run</div>' + skillInfo;
    openModal('run-result-modal');
  }

  // ========== PWA Install ==========
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function() {});
  }

  // ========== TERRITORY MAP ==========
  var turfMap = null;
  var hexLayer = null;
  var fogLayer = null;
  var userLat = null;
  var userLng = null;

  function getHexStyle(cellData) {
    if (!cellData) return null;
    if (cellData.owner === 'you') {
      if (cellData.defense >= 20) return { color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.4, weight: 1.5, opacity: 0.9 };
      if (cellData.defense >= 10) return { color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.3, weight: 1.5, opacity: 0.8 };
      return { color: '#4ade80', fillColor: '#4ade80', fillOpacity: 0.2, weight: 1.5, opacity: 0.7 };
    }
    if (cellData.owner === 'enemy') {
      if (cellData.defense >= 20) return { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.35, weight: 1.5, opacity: 0.9 };
      if (cellData.defense >= 10) return { color: '#ff6a00', fillColor: '#ff6a00', fillOpacity: 0.25, weight: 1.5, opacity: 0.8 };
      return { color: '#ffb830', fillColor: '#ffb830', fillOpacity: 0.2, weight: 1.5, opacity: 0.7 };
    }
    return { color: '#ffffff', fillColor: '#ffffff', fillOpacity: 0.06, weight: 0.5, opacity: 0.2 };
  }

  function getCellData(cell) {
    if (!territoryState) return null;
    if (!territoryState.explored.has(cell)) return null;

    var cellPoints = territoryState.cells[cell];
    if (!cellPoints) {
      return { owner: 'neutral', ownerType: null, ownerName: null, ownerInitials: null, defense: 0, threat: 0 };
    }

    var userGroupId = currentUser ? currentUser.user.groupId : null;
    var maxGroupId = null;
    var maxPoints = 0;
    for (var gid in cellPoints) {
      if (cellPoints.hasOwnProperty(gid) && cellPoints[gid] > maxPoints) { maxGroupId = gid; maxPoints = cellPoints[gid]; }
    }
    if (!maxGroupId || maxPoints === 0) {
      return { owner: 'neutral', ownerType: null, ownerName: null, ownerInitials: null, defense: 0, threat: 0 };
    }

    var isYours = maxGroupId === userGroupId;
    var threat = 0;
    if (isYours) {
      for (var gid2 in cellPoints) { if (gid2 !== userGroupId && cellPoints[gid2] > threat) threat = cellPoints[gid2]; }
    } else {
      threat = (userGroupId && cellPoints[userGroupId]) ? cellPoints[userGroupId] : 0;
    }

    var groupInfo = territoryState.groups[maxGroupId] || {};
    return {
      owner: isYours ? 'you' : 'enemy',
      ownerType: 'group',
      ownerName: groupInfo.name || maxGroupId,
      ownerInitials: groupInfo.tag || (groupInfo.name || maxGroupId).substring(0, 2).toUpperCase(),
      defense: Math.round(maxPoints),
      threat: Math.round(threat)
    };
  }

  function initMap() {
    if (typeof L === 'undefined' || typeof h3 === 'undefined') return;
    turfMap = L.map('map', { zoomControl: false, attributionControl: false, minZoom: 13, maxZoom: 18 });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(turfMap);
    hexLayer = L.layerGroup().addTo(turfMap);
    fogLayer = L.layerGroup().addTo(turfMap);

    var saved = null;
    try { saved = JSON.parse(localStorage.getItem('turfHomeLocation')); } catch(e) {}
    if (saved && saved.lat && saved.lng) {
      loadMapAt(saved.lat, saved.lng);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(pos) {
          userLat = pos.coords.latitude; userLng = pos.coords.longitude;
          addUserMarker(userLat, userLng);
        }, function() {}, { timeout: 5000, enableHighAccuracy: false });
      }
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(pos) {
        userLat = pos.coords.latitude; userLng = pos.coords.longitude;
        localStorage.setItem('turfHomeLocation', JSON.stringify({ lat: userLat, lng: userLng, name: 'My Location' }));
        loadMapAt(userLat, userLng);
        addUserMarker(userLat, userLng);
      }, function() { showHomeCityPrompt(); }, { timeout: 8000, enableHighAccuracy: false });
    } else {
      showHomeCityPrompt();
    }
    turfMap.on('moveend', renderHexGrid);
    turfMap.on('zoomend', renderHexGrid);
  }

  function loadMapAt(lat, lng) {
    turfMap.setView([lat, lng], DEFAULT_ZOOM);
    loadTerritory().then(function() {
      if (territoryState && territoryState.explored.size === 0) {
        seedTerritoryData(lat, lng);
      } else {
        renderHexGrid();
        updateMapOverlayStats();
      }
    });
  }

  function showHomeCityPrompt() {
    turfMap.setView([39.8283, -98.5795], 4);
    var overlay = document.getElementById('home-city-overlay');
    if (overlay) overlay.style.display = 'flex';
    var input = document.getElementById('home-city-input');
    var btn = document.getElementById('home-city-btn');
    var error = document.getElementById('home-city-error');
    if (input) {
      input.addEventListener('keydown', function(e) { if (e.key === 'Enter') geocodeAndSetHome(); });
      setTimeout(function() { input.focus(); }, 300);
    }
    if (btn) btn.addEventListener('click', geocodeAndSetHome);

    function geocodeAndSetHome() {
      var query = input ? input.value.trim() : '';
      if (!query) { if (error) error.textContent = 'Please enter a city or location'; return; }
      if (error) error.textContent = '';
      if (btn) { btn.textContent = 'Finding...'; btn.disabled = true; }
      fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(query), {
        headers: { 'Accept': 'application/json' }
      }).then(function(r) { return r.json(); }).then(function(data) {
        if (data && data.length > 0) {
          var lat = parseFloat(data[0].lat);
          var lng = parseFloat(data[0].lon);
          var name = data[0].display_name.split(',')[0];
          localStorage.setItem('turfHomeLocation', JSON.stringify({ lat: lat, lng: lng, name: name }));
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

  function addUserMarker(lat, lng) {
    var markerHtml = '<div class="user-marker"><div class="user-marker-ring"></div></div>';
    var icon = L.divIcon({ className: '', html: markerHtml, iconSize: [16, 16], iconAnchor: [8, 8] });
    L.marker([lat, lng], { icon: icon, interactive: false }).addTo(turfMap);
  }

  // ========== Territory Data from API ==========
  function loadTerritory() {
    return apiGet('/api/territory').then(function(data) {
      if (data.error) { console.error('Territory error:', data.error); return; }
      territoryState = {
        explored: new Set(data.explored || []),
        cells: data.cells || {},
        groups: data.groups || {},
        userGroupId: data.userGroupId
      };
    }).catch(function(err) {
      console.error('Territory load error:', err);
      territoryState = { explored: new Set(), cells: {}, groups: {}, userGroupId: null };
    });
  }

  function seedTerritoryData(lat, lng) {
    if (typeof h3 === 'undefined') return;
    var centerCell = h3.geoToH3(lat, lng, H3_RES);
    var allExplored = h3.kRing(centerCell, 5);
    var territory = [];
    var explored = [];

    allExplored.forEach(function(c) { explored.push({ cellId: c, groupId: 'grp-shadow' }); });

    var ownedCells = h3.kRing(centerCell, 1);
    var yourPts = [25, 18, 14, 8, 22, 5, 12];
    var threatPts = [4, 8, 2, 6, 0, 3, 1];
    ownedCells.forEach(function(c, i) {
      territory.push({ cellId: c, groupId: 'grp-shadow', points: yourPts[i] || 10 });
      if (threatPts[i] > 0) territory.push({ cellId: c, groupId: 'grp-pavement', points: threatPts[i] });
    });

    var ring3 = h3.kRing(centerCell, 3);
    var enemyCells = ring3.filter(function(c) { return ownedCells.indexOf(c) < 0; }).slice(0, 9);
    var eGroups = ['grp-pavement','grp-pavement','grp-pavement','grp-night','grp-night','grp-night','grp-pavement','grp-night','grp-pavement'];
    var ePts = [28, 15, 7, 21, 3, 11, 16, 9, 13];
    var aAtk = [4, 8, 5, 2, 3, 0, 6, 1, 3];
    enemyCells.forEach(function(c, i) {
      territory.push({ cellId: c, groupId: eGroups[i] || 'grp-pavement', points: ePts[i] || 10 });
      explored.push({ cellId: c, groupId: eGroups[i] || 'grp-pavement' });
      if (aAtk[i] > 0) territory.push({ cellId: c, groupId: 'grp-shadow', points: aAtk[i] });
    });

    apiPost('/api/seed-territory', { territory: territory, explored: explored }).then(function() {
      return loadTerritory();
    }).then(function() {
      renderHexGrid();
      updateMapOverlayStats();
    }).catch(function(err) { console.error('Seed error:', err); });
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
    var renderK = zoom >= 16 ? 8 : zoom >= 15 ? 12 : zoom >= 14 ? 16 : 20;
    var showLabels = zoom >= 15;
    var viewCell = h3.geoToH3(center.lat, center.lng, H3_RES);
    var visibleCells = h3.kRing(viewCell, renderK);
    var bounds = turfMap.getBounds();

    visibleCells.forEach(function(cell) {
      var cellCenter = h3.h3ToGeo(cell);
      if (cellCenter[0] < bounds.getSouth() - 0.005 || cellCenter[0] > bounds.getNorth() + 0.005 ||
          cellCenter[1] < bounds.getWest() - 0.005 || cellCenter[1] > bounds.getEast() + 0.005) return;

      var isExplored = territoryState && territoryState.explored && territoryState.explored.has(cell);

      // Unexplored cells get fog overlay
      if (!isExplored) {
        var fogBoundary = h3.h3ToGeoBoundary(cell);
        L.polygon(fogBoundary, { color: 'transparent', fillColor: '#08080c', fillOpacity: 0.85, weight: 0, interactive: false }).addTo(fogLayer);
        return;
      }

      var data = getCellData(cell);
      var boundary = h3.h3ToGeoBoundary(cell);

      // Grid line for all explored cells
      L.polygon(boundary, { color: '#ffffff', fillColor: 'transparent', fillOpacity: 0, weight: 0.3, opacity: 0.08, interactive: false }).addTo(hexLayer);

      if (!data) return;
      var style = getHexStyle(data);
      if (!style) return;

      if (data.owner !== 'neutral') {
        if (data.defense >= 15) {
          L.polygon(boundary, { color: style.color, fillColor: 'transparent', fillOpacity: 0, weight: 4, opacity: 0.15 + (data.defense >= 20 ? 0.1 : 0), interactive: false }).addTo(hexLayer);
        }
        L.polygon(boundary, { color: style.color, fillColor: style.fillColor, fillOpacity: style.fillOpacity, weight: style.weight, opacity: style.opacity, interactive: false }).addTo(hexLayer);

        if (showLabels) {
          var labelCenter = h3.h3ToGeo(cell);
          var defColor = style.color;
          var threatColor = data.owner === 'enemy' ? '#4ade80' : '#ef4444';
          var ownerIcon = data.ownerType === 'group' ? '\uD83D\uDC65' : '\uD83C\uDFC3';
          var labelHtml = '<div class="hex-label">'
            + '<div class="hex-owner-badge" data-owner-type="' + data.ownerType + '" data-owner-name="' + (data.ownerName || '') + '" data-owner-init="' + (data.ownerInitials || '') + '" data-owner-def="' + data.defense + '">'
            + '<span class="hex-owner-icon">' + ownerIcon + '</span><span class="hex-owner-init">' + (data.ownerInitials || '') + '</span></div>'
            + '<div class="hex-def" style="color:' + defColor + '">\uD83D\uDEE1\uFE0F ' + data.defense + '</div>';
          if (data.threat > 0) labelHtml += '<div class="hex-atk" style="color:' + threatColor + '">\u2694\uFE0F ' + data.threat + '</div>';
          labelHtml += '</div>';
          L.marker(labelCenter, { icon: L.divIcon({ className: '', html: labelHtml, iconSize: [68, 58], iconAnchor: [34, 29] }), interactive: false }).addTo(hexLayer);
        }
      } else {
        L.polygon(boundary, { color: style.color, fillColor: style.fillColor, fillOpacity: style.fillOpacity, weight: style.weight, opacity: style.opacity, interactive: false }).addTo(hexLayer);
      }
    });
  }

  var origNavigateTo = navigateTo;
  navigateTo = function(pageId) {
    origNavigateTo(pageId);
    if (pageId === 'page-map' && turfMap) setTimeout(function() { turfMap.invalidateSize(); }, 100);
  };

  // ========== Hex Owner Click Popup ==========
  document.addEventListener('click', function(e) {
    var badge = e.target.closest('.hex-owner-badge');
    if (!badge) { var existing = document.getElementById('hex-owner-popup'); if (existing) existing.remove(); return; }
    e.stopPropagation();
    var type = badge.getAttribute('data-owner-type');
    var name = badge.getAttribute('data-owner-name');
    var def = badge.getAttribute('data-owner-def');

    var existing = document.getElementById('hex-owner-popup');
    if (existing) existing.remove();

    var popup = document.createElement('div');
    popup.id = 'hex-owner-popup';
    popup.className = 'hex-owner-popup';
    var icon = type === 'group' ? '\u2691' : '\uD83D\uDC64';
    var typeLabel = type === 'group' ? 'Group' : 'Player';
    popup.innerHTML = '<div class="hop-header"><span class="hop-icon">' + icon + '</span><div><div class="hop-name">' + name + '</div><div class="hop-type">' + typeLabel + '</div></div></div>'
      + '<div class="hop-stats"><div class="hop-stat"><span class="hop-num">' + def + '</span><span class="hop-lbl">Defense</span></div></div>';

    document.querySelector('.map-container').appendChild(popup);
    var rect = badge.getBoundingClientRect();
    var mapRect = document.querySelector('.map-container').getBoundingClientRect();
    popup.style.left = Math.min(rect.left - mapRect.left, mapRect.width - 180) + 'px';
    popup.style.top = Math.max(rect.top - mapRect.top - popup.offsetHeight - 8, 8) + 'px';
  });

  // ========== User Data & UI Updates ==========
  function loadUserData() {
    return apiGet('/api/me').then(function(data) {
      if (data.error) { console.error('User load error:', data.error); return; }
      currentUser = data;
      updateUI();
    }).catch(function(err) { console.error('User load error:', err); });
  }

  var SKILL_ICONS = {
    'wide-scan':'\uD83D\uDD2D','strike-force':'\uD83D\uDCA5','shield':'\uD83D\uDEE1\uFE0F','trailblazer':'\uD83C\uDFC3','ghost-run':'\uD83D\uDC7B',
    'recon-sweep':'\uD83D\uDCE1','combined-arms':'\u2694\uFE0F','fortify-pair':'\uD83C\uDFF0','sync-bonus':'\uD83D\uDD17','lockdown':'\uD83D\uDD12',
    'war-march':'\uD83D\uDEA9','iron-curtain':'\uD83E\uDDF1','rally-cry':'\uD83D\uDCE2','bounty-hunt':'\uD83D\uDCB0','siege-engine':'\uD83C\uDFD7\uFE0F'
  };

  function updateUI() {
    if (!currentUser) return;
    var u = currentUser.user;

    var spEl = document.getElementById('sp-amount');
    if (spEl) spEl.textContent = Math.floor(u.skillPoints);

    var profileName = document.querySelector('.profile-name');
    if (profileName) profileName.textContent = u.displayName;

    var profileGroup = document.querySelector('.profile-group');
    if (profileGroup && currentUser.group) profileGroup.textContent = currentUser.group.name;

    var statNums = document.querySelectorAll('.profile-stats-grid .p-num');
    if (statNums.length >= 4) {
      statNums[0].textContent = u.totalRuns;
      statNums[1].textContent = Math.floor(u.totalSpEarned);
      statNums[2].textContent = u.totalDistanceMiles.toFixed(1) + ' mi';
      statNums[3].textContent = u.totalCellsCaptured;
    }

    updateProfileSkills();
    updateMapOverlayStats();

    if (currentUser.skills) {
      currentUser.skills.forEach(function(s) {
        var card = document.querySelector('.skill-card[data-skill="' + s.skillId + '"]');
        if (!card) return;
        card.setAttribute('data-level', s.level);
        var btn = card.querySelector('.skill-lvl-btn');
        if (btn) {
          if (s.level >= 5) { btn.textContent = 'MAX'; btn.disabled = true; }
          else { var cost = LEVEL_COSTS[s.level]; btn.textContent = '\u2B06 ' + cost + ' SP'; btn.setAttribute('data-cost', cost); }
        }
        var pips = card.querySelectorAll('.skill-level-pip');
        pips.forEach(function(pip, idx) {
          if (idx < s.level) { pip.classList.add('filled'); var t = card.getAttribute('data-type'); if (t === 'double' || t === 'group') pip.classList.add('amber'); }
          else { pip.classList.remove('filled'); pip.classList.remove('amber'); }
        });
        var levelLabel = card.querySelector('.skill-level-label');
        if (levelLabel) levelLabel.textContent = 'Lv ' + s.level;
      });
    }

    ['solo', 'double', 'group'].forEach(function(cat) {
      var equippedSkill = u[cat === 'solo' ? 'soloSkill' : cat === 'double' ? 'doubleSkill' : 'groupSkill'];
      var panel = document.getElementById('skills-' + cat);
      if (!panel) return;
      panel.querySelectorAll('.skill-card').forEach(function(c) {
        c.classList.remove('equipped');
        var badge = c.querySelector('.equipped-badge');
        if (badge) badge.remove();
      });
      if (equippedSkill) {
        var eqCard = panel.querySelector('.skill-card[data-skill="' + equippedSkill + '"]');
        if (eqCard) {
          eqCard.classList.add('equipped');
          var top = eqCard.querySelector('.skill-top');
          if (top && !eqCard.querySelector('.equipped-badge')) {
            var badge = document.createElement('span');
            badge.className = 'equipped-badge';
            badge.textContent = 'Equipped';
            top.appendChild(badge);
          }
        }
      }
    });
  }

  function updateProfileSkills() {
    if (!currentUser) return;
    var u = currentUser.user;
    var eqSkills = document.querySelectorAll('.equipped-skill');
    if (eqSkills.length >= 3) {
      updateEqSlot(eqSkills[0], u.soloSkill, u.soloSkillLevel);
      updateEqSlot(eqSkills[1], u.doubleSkill, u.doubleSkillLevel);
      updateEqSlot(eqSkills[2], u.groupSkill, u.groupSkillLevel);
    }
  }

  function updateEqSlot(el, skillId, level) {
    var iconEl = el.querySelector('.eq-icon');
    var nameEl = el.querySelector('.eq-name');
    var lvlEl = el.querySelector('.eq-level');
    if (iconEl) iconEl.textContent = (skillId && SKILL_ICONS[skillId]) ? SKILL_ICONS[skillId] : '\u2014';
    if (nameEl) nameEl.textContent = skillId ? skillId.replace(/-/g, ' ').replace(/\\b\\w/g, function(c) { return c.toUpperCase(); }) : 'None';
    if (lvlEl) lvlEl.textContent = skillId ? 'Level ' + level : '\u2014';
  }

  function updateMapOverlayStats() {
    if (!currentUser || !territoryState) return;
    var stats = document.querySelectorAll('.map-overlay-stats .map-stat .value');
    if (stats.length >= 3) {
      var ownedCount = 0;
      var totalPts = 0;
      var userGroupId = currentUser.user.groupId;
      for (var cid in territoryState.cells) {
        var cp = territoryState.cells[cid];
        var maxGid = null; var maxPts = 0;
        for (var gid in cp) { if (cp[gid] > maxPts) { maxGid = gid; maxPts = cp[gid]; } }
        if (maxGid === userGroupId) { ownedCount++; totalPts += maxPts; }
      }
      stats[0].textContent = ownedCount;
      stats[1].textContent = totalPts > 999 ? (totalPts / 1000).toFixed(1) + 'K' : Math.round(totalPts);
      if (currentUser.group) stats[2].textContent = currentUser.group.streakDays + 'd';
    }
  }

  // ========== Initialize ==========
  loadUserData();
  initMap();
})();
`;
}