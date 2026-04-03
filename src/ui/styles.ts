export function getStyles(): string {
  return `
/* ========== Reset & Base ========== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-primary: #08080c;
  --bg-secondary: #0e0e14;
  --bg-card: #141418;
  --bg-card-hover: #1c1c22;
  --accent: #ff6a00;
  --accent-dim: #ff6a0040;
  --amber: #ffb830;
  --green: #4ade80;
  --green-dim: #4ade8040;
  --danger: #ef4444;
  --text-primary: #e8e8ec;
  --text-secondary: #8a8a96;
  --text-muted: #4a4a56;
  --border: #222230;
  --radius: 12px;
  --radius-sm: 8px;
  --nav-height: 64px;
  --header-height: 52px;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

html, body {
  height: 100%; width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary); color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  overflow: hidden; user-select: none; -webkit-user-select: none;
}

/* ========== App Shell ========== */
#app { display: flex; flex-direction: column; height: 100%; width: 100%; position: relative; }

/* ========== Header ========== */
.app-header {
  height: var(--header-height); display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px; background: var(--bg-secondary); border-bottom: 1px solid var(--border);
  flex-shrink: 0; z-index: 1000; position: relative;
}
.logo {
  font-size: 20px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;
  background: linear-gradient(135deg, var(--accent), var(--amber));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.header-btn {
  width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--border);
  background: var(--bg-card); color: var(--text-secondary); display: flex; align-items: center;
  justify-content: center; cursor: pointer; font-size: 14px;
}

/* ========== Content ========== */
.page-container {
  flex: 1; overflow-y: auto; overflow-x: hidden; -webkit-overflow-scrolling: touch;
  padding-bottom: calc(var(--nav-height) + var(--safe-bottom));
}
.page { display: none; min-height: 100%; animation: fadeIn 0.2s ease; }
.page.active { display: block; }
.page-padded { padding: 16px; }
#page-map { height: 100%; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

/* ========== Bottom Nav ========== */
.bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0;
  height: calc(var(--nav-height) + var(--safe-bottom)); padding-bottom: var(--safe-bottom);
  background: var(--bg-secondary); border-top: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-around; z-index: 100;
}
.nav-item {
  display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 10px;
  border: none; background: none; color: var(--text-muted); cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.nav-item.active { color: var(--accent); }
.nav-item .nav-icon { font-size: 20px; line-height: 1; }
.nav-item .nav-label { font-size: 9px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
.nav-item.active::after {
  content: ''; position: absolute; top: -1px; left: 50%; transform: translateX(-50%);
  width: 20px; height: 2px; background: var(--accent); border-radius: 1px; box-shadow: 0 0 6px var(--accent);
}

/* ========== MAP ========== */
.map-container { width: 100%; height: 100%; position: relative; }
#map { width: 100%; height: 100%; background: var(--bg-primary); }

.map-loading {
  position: absolute; inset: 0; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 12px;
  background: var(--bg-primary); z-index: 450; transition: opacity 0.3s ease;
}
.map-loading.hidden { opacity: 0; pointer-events: none; }
.map-loading-spinner {
  width: 32px; height: 32px; border: 3px solid var(--border);
  border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite;
}
.map-loading-text { font-size: 13px; color: var(--text-secondary); font-weight: 600; letter-spacing: 0.5px; }

.home-city-overlay {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  background: rgba(8,8,12,0.92); z-index: 500; padding: 24px;
}
.home-city-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 28px 24px; text-align: center; max-width: 340px; width: 100%;
}
.home-city-icon { font-size: 36px; margin-bottom: 12px; }
.home-city-title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
.home-city-sub { font-size: 13px; color: var(--text-secondary); margin-bottom: 16px; }
.home-city-input-wrap { display: flex; gap: 8px; }
.home-city-input {
  flex: 1; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border);
  background: var(--bg-primary); color: var(--text-primary); font-size: 14px; outline: none;
}
.home-city-input:focus { border-color: var(--accent); }
.home-city-btn {
  padding: 10px 16px; border-radius: var(--radius-sm); border: none;
  background: var(--accent); color: #fff; font-weight: 700; font-size: 13px; cursor: pointer;
}
.home-city-error { color: var(--danger); font-size: 12px; margin-top: 8px; }

.map-overlay-stats {
  position: absolute; top: 12px; left: 12px; display: flex; gap: 8px; z-index: 400;
}
.map-stat {
  background: rgba(8,8,12,0.85); border: 1px solid var(--border); border-radius: var(--radius-sm);
  padding: 6px 12px; display: flex; flex-direction: column; align-items: center; min-width: 56px;
  backdrop-filter: blur(8px);
}
.map-stat .label { font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.map-stat .value { font-size: 16px; font-weight: 800; }
.map-stat .value.amber { color: var(--amber); }

.map-quick-actions { position: absolute; bottom: 20px; right: 16px; z-index: 400; }
.quick-btn {
  display: flex; align-items: center; gap: 6px; padding: 10px 18px;
  border-radius: 50px; border: none; font-weight: 700; font-size: 13px; cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}
.quick-btn.primary { background: var(--accent); color: #fff; }

/* Map controls */
.map-controls {
  position: absolute; top: 12px; right: 12px; z-index: 450;
  display: flex; flex-direction: column; gap: 8px;
}
.map-ctrl-btn {
  width: 42px; height: 42px; border-radius: 50%; border: 1px solid var(--border);
  background: rgba(14,14,20,0.9); color: var(--text-primary); display: flex; align-items: center;
  justify-content: center; cursor: pointer; font-size: 18px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4); backdrop-filter: blur(8px);
}
.map-ctrl-btn:active { background: var(--bg-card); }
.map-ctrl-btn .spinner {
  width: 18px; height: 18px; border: 2px solid var(--text-muted); border-top-color: var(--accent);
  border-radius: 50%; animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Map search bar */
.map-search-bar {
  position: absolute; top: 12px; left: 12px; right: 62px; z-index: 450;
  display: flex; gap: 6px; align-items: center;
  background: rgba(14,14,20,0.92); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 6px 10px; backdrop-filter: blur(8px);
}
.map-search-input {
  flex: 1; padding: 8px 10px; border-radius: var(--radius-sm); border: 1px solid var(--border);
  background: var(--bg-primary); color: var(--text-primary); font-size: 14px; outline: none;
}
.map-search-input:focus { border-color: var(--accent); }
.map-search-go {
  padding: 8px 14px; border-radius: var(--radius-sm); border: none;
  background: var(--accent); color: #fff; font-weight: 700; font-size: 13px; cursor: pointer;
}
.map-search-close {
  width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--border);
  background: var(--bg-card); color: var(--text-secondary); cursor: pointer; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
}

/* Search suggestions */
.map-search-suggestions {
  position: absolute; top: 100%; left: 0; right: 0; margin-top: 4px;
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm);
  max-height: 200px; overflow-y: auto; z-index: 460;
}
.map-search-suggestion {
  padding: 10px 12px; cursor: pointer; font-size: 13px; color: var(--text-primary);
  border-bottom: 1px solid var(--border);
}
.map-search-suggestion:last-child { border-bottom: none; }
.map-search-suggestion:hover, .map-search-suggestion:active { background: var(--bg-card-hover); }
.map-search-suggestion-sub { font-size: 11px; color: var(--text-secondary); margin-top: 2px; }

/* User marker */
.user-marker { width: 16px; height: 16px; position: relative; }
.user-marker-ring {
  position: absolute; inset: 0; border-radius: 50%; border: 3px solid var(--accent);
  background: rgba(255,106,0,0.3); box-shadow: 0 0 12px var(--accent);
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: 0.6; } }

/* Hex labels */
.hex-label { text-align: center; text-shadow: 0 1px 3px #000, 0 0 6px rgba(0,0,0,0.9); pointer-events: none; line-height: 1.2; }
.hex-rp-main { font-size: 16px; font-weight: 800; }
.hex-bar { display: flex; height: 3px; border-radius: 2px; overflow: hidden; margin: 2px 4px; background: rgba(255,255,255,0.08); }
.hex-bar-fill { height: 100%; min-width: 2px; }
.hex-rp-sub { font-size: 11px; font-weight: 700; opacity: 0.9; }
.hex-own-badge { font-size: 10px; line-height: 1; text-align: center; text-shadow: 0 1px 3px #000; pointer-events: none; }

/* ========== GROUP PAGE ========== */
.empty-state { text-align: center; padding: 48px 16px; color: var(--text-secondary); }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.empty-state h3 { color: var(--text-primary); margin-bottom: 8px; }
.empty-state p { font-size: 14px; margin-bottom: 20px; }
.empty-actions { display: flex; gap: 12px; justify-content: center; }

.group-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.group-color-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
.group-name { font-size: 20px; font-weight: 800; }
.group-meta { font-size: 12px; color: var(--text-secondary); }

.group-stats-row { display: flex; gap: 10px; margin-bottom: 16px; }
.group-stat-card {
  flex: 1; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm);
  padding: 12px; text-align: center;
}
.stat-value { font-size: 22px; font-weight: 800; }
.stat-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }

.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.section-title { font-size: 13px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }

.member-list { display: flex; flex-direction: column; gap: 6px; }
.member-row {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  background: var(--bg-card); border-radius: var(--radius-sm); border: 1px solid var(--border);
}
.member-avatar {
  width: 36px; height: 36px; border-radius: 50%; background: var(--bg-primary);
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 14px; border: 2px solid var(--border); flex-shrink: 0;
}
.member-info { flex: 1; min-width: 0; }
.member-name { font-size: 14px; font-weight: 600; }
.member-role { font-size: 10px; color: var(--accent); font-weight: 700; }
.member-detail { font-size: 12px; color: var(--text-secondary); }
.member-rp { font-size: 13px; font-weight: 700; color: var(--amber); white-space: nowrap; }

.group-mgmt { display: flex; flex-direction: column; gap: 6px; }
.mgmt-btn {
  display: flex; align-items: center; gap: 10px; padding: 12px;
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm);
  color: var(--text-primary); cursor: pointer; width: 100%; text-align: left;
}
.mgmt-icon { font-size: 18px; }
.mgmt-text { flex: 1; }
.mgmt-name { font-size: 14px; font-weight: 600; }
.mgmt-desc { font-size: 11px; color: var(--text-secondary); }
.mgmt-arrow { color: var(--text-muted); font-size: 18px; }
.mgmt-danger .mgmt-name { color: var(--danger); }

/* ========== MODALS ========== */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(8,8,12,0.85); display: flex;
  align-items: center; justify-content: center; z-index: 1000; padding: 24px;
}
.modal-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
  width: 100%; max-width: 360px; overflow: hidden;
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between; padding: 14px 16px;
  border-bottom: 1px solid var(--border); font-weight: 700; font-size: 15px;
}
.modal-close {
  width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border);
  background: var(--bg-primary); color: var(--text-secondary); cursor: pointer; font-size: 16px;
  display: flex; align-items: center; justify-content: center;
}
.modal-body { padding: 16px; }

.invite-code-box { text-align: center; }
.invite-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; }
.invite-code { font-size: 24px; font-weight: 800; letter-spacing: 2px; margin-bottom: 12px; color: var(--accent); }

.leave-warning { font-size: 14px; color: var(--text-secondary); margin-bottom: 16px; }
.leave-actions { display: flex; gap: 10px; }

.error-text { color: var(--danger); font-size: 12px; margin-top: 8px; }

/* Buttons */
.btn-primary {
  padding: 10px 20px; border-radius: var(--radius-sm); border: none;
  background: var(--accent); color: #fff; font-weight: 700; font-size: 14px; cursor: pointer;
}
.btn-secondary {
  padding: 10px 20px; border-radius: var(--radius-sm); border: 1px solid var(--border);
  background: var(--bg-card); color: var(--text-primary); font-weight: 600; font-size: 14px; cursor: pointer;
}
.btn-danger {
  padding: 10px 20px; border-radius: var(--radius-sm); border: none;
  background: var(--danger); color: #fff; font-weight: 700; font-size: 14px; cursor: pointer; flex: 1;
}
.input {
  width: 100%; padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border);
  background: var(--bg-primary); color: var(--text-primary); font-size: 14px; outline: none;
}
.input:focus { border-color: var(--accent); }

/* ========== SKILLS PAGE ========== */
.rp-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-sm); margin-bottom: 16px;
}
.rp-label { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
.rp-value { font-size: 20px; font-weight: 800; color: var(--amber); }

.skill-list { display: flex; flex-direction: column; gap: 10px; }
.skill-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 14px; cursor: pointer; transition: border-color 0.2s;
}
.skill-card:active { border-color: var(--accent); }
.skill-card.equipped { border-color: var(--accent); box-shadow: 0 0 12px var(--accent-dim); }
.skill-top { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
.skill-icon { font-size: 24px; flex-shrink: 0; }
.skill-info { flex: 1; min-width: 0; }
.skill-name { font-size: 15px; font-weight: 700; }
.skill-desc { font-size: 12px; color: var(--text-secondary); margin-top: 2px; line-height: 1.4; }
.equipped-badge {
  font-size: 10px; font-weight: 700; color: var(--accent); background: var(--accent-dim);
  padding: 2px 8px; border-radius: 50px; white-space: nowrap;
}
.skill-bottom { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.skill-stats { margin: 6px 0 8px; padding: 6px 8px; background: rgba(255,255,255,0.03); border-radius: 6px; }
.skill-stat-current { font-size: 12px; color: var(--text-primary); display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.stat-label { color: var(--text-secondary); }
.stat-value { font-weight: 700; color: var(--accent); }
.stat-bonus { font-size: 11px; color: var(--text-muted); }
.skill-stat-next { font-size: 11px; color: var(--text-secondary); margin-top: 3px; display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.stat-next-label { color: var(--text-muted); }
.stat-next-value { font-weight: 600; color: var(--green); }
.skill-level-bar { display: flex; align-items: center; gap: 4px; }
.skill-level-pip {
  width: 10px; height: 10px; border-radius: 50%; background: var(--bg-primary);
  border: 1.5px solid var(--text-muted);
}
.skill-level-pip.filled { background: var(--accent); border-color: var(--accent); }
.skill-level-label { font-size: 11px; color: var(--text-secondary); margin-left: 6px; font-weight: 600; }
.skill-actions { display: flex; align-items: center; }
.skill-upgrade-btn {
  padding: 5px 12px; border-radius: 50px; border: 1px solid var(--accent-dim);
  background: transparent; color: var(--accent); font-size: 12px; font-weight: 700; cursor: pointer;
}
.skill-upgrade-btn:disabled { opacity: 0.4; cursor: default; }
.skill-max { font-size: 11px; color: var(--green); font-weight: 700; }

/* ========== LEADERBOARD ========== */
.lb-list { display: flex; flex-direction: column; gap: 6px; }
.lb-row {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm);
}
.lb-row.highlight { border-color: var(--accent); box-shadow: 0 0 8px var(--accent-dim); }
.lb-rank { font-size: 16px; font-weight: 800; color: var(--text-muted); width: 28px; text-align: center; }
.lb-color { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.lb-info { flex: 1; min-width: 0; }
.lb-name { font-size: 14px; font-weight: 600; }
.lb-type { font-size: 11px; color: var(--text-muted); text-transform: capitalize; }
.lb-score { font-size: 16px; font-weight: 800; text-align: right; }
.lb-unit { font-size: 10px; color: var(--text-muted); font-weight: 600; }

/* ========== PROFILE ========== */
.profile-card { text-align: center; padding: 20px 0; }
.profile-avatar { font-size: 48px; margin-bottom: 8px; }
.profile-name { font-size: 22px; font-weight: 800; }
.profile-group { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }

.equipped-skill-card {
  display: flex; align-items: center; gap: 10px; padding: 12px;
  background: var(--bg-card); border: 1px solid var(--accent-dim); border-radius: var(--radius-sm);
}
.eq-icon { font-size: 24px; }
.eq-name { font-size: 15px; font-weight: 700; flex: 1; }
.eq-level { font-size: 13px; color: var(--accent); font-weight: 600; }

.profile-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.p-stat {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm);
  padding: 12px 8px; text-align: center;
}
.p-num { font-size: 20px; font-weight: 800; }
.p-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-top: 2px; }

.run-history { display: flex; flex-direction: column; gap: 6px; }
.run-entry {
  display: flex; align-items: center; gap: 10px; padding: 10px 12px;
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm);
}
.run-info { flex: 1; }
.run-detail { font-size: 13px; color: var(--text-secondary); }
.run-rp { font-size: 14px; font-weight: 700; color: var(--green); white-space: nowrap; }

/* ========== SETTINGS ========== */
.settings-group { display: flex; flex-direction: column; gap: 4px; }
.settings-item {
  display: flex; align-items: center; padding: 12px;
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm);
}
.settings-left { display: flex; align-items: center; gap: 10px; flex: 1; }
.settings-icon { font-size: 18px; }
.settings-name { font-size: 14px; font-weight: 600; }
.settings-desc { font-size: 11px; color: var(--text-secondary); }
.color-picker {
  width: 36px; height: 36px; border: 2px solid var(--border); border-radius: var(--radius-sm);
  background: transparent; cursor: pointer; padding: 0; -webkit-appearance: none; appearance: none;
}
.color-picker::-webkit-color-swatch-wrapper { padding: 2px; }
.color-picker::-webkit-color-swatch { border: none; border-radius: 4px; }

/* ========== CELL INFO POPUP ========== */
.cell-info-popup {
  position: fixed; bottom: calc(var(--nav-height) + var(--safe-bottom) + 12px);
  left: 12px; right: 12px; z-index: 500;
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 14px 16px; display: flex; align-items: center; gap: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5); animation: slideUp 0.2s ease;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.cell-info-color { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
.cell-info-details { flex: 1; min-width: 0; }
.cell-info-owner { font-size: 14px; font-weight: 700; }
.cell-info-meta { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.cell-info-rp { font-size: 18px; font-weight: 800; color: var(--amber); }
.cell-info-close {
  width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--border);
  background: var(--bg-primary); color: var(--text-secondary); cursor: pointer; font-size: 14px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}

/* ========== ADD RUN OVERLAY ========== */
.run-overlay {
  position: fixed; inset: 0; background: var(--bg-primary); z-index: 900;
  display: flex; flex-direction: column;
}
.run-overlay-header {
  padding: 14px 16px; background: var(--bg-secondary); border-bottom: 1px solid var(--border);
  text-align: center;
}
.run-overlay-title { font-size: 16px; font-weight: 800; }
.run-overlay-sub { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.run-map-container { flex: 1; }
.run-overlay-footer {
  padding: 12px 16px; background: var(--bg-secondary); border-top: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 10px;
  padding-bottom: calc(12px + var(--safe-bottom));
}
.run-selection-info { text-align: center; font-size: 14px; font-weight: 600; }
.run-overlay-actions { display: flex; gap: 10px; }
.run-action-btn {
  flex: 1; padding: 12px; border-radius: var(--radius-sm); border: none;
  font-weight: 700; font-size: 14px; cursor: pointer;
}
.run-action-btn.cancel { background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border); }
.run-action-btn.confirm { background: var(--accent); color: #fff; }
.run-action-btn:disabled { opacity: 0.4; cursor: default; }

/* Run result */
.run-result-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; }
.run-result-stat { padding: 10px; }
.rr-value { font-size: 24px; font-weight: 800; }
.rr-value.green { color: var(--green); }
.rr-value.amber { color: var(--amber); }
.rr-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; margin-top: 2px; }

/* ========== Leaflet Overrides ========== */
.leaflet-container { background: var(--bg-primary) !important; }
.leaflet-control-attribution { display: none !important; }
.turf-popup .leaflet-popup-content-wrapper {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0,0,0,0.6); color: var(--text-primary);
}
.turf-popup .leaflet-popup-tip { background: var(--bg-card); border: 1px solid var(--border); }
.turf-popup .leaflet-popup-close-button {
  color: var(--text-muted) !important; font-size: 18px !important;
  top: 6px !important; right: 8px !important;
}
.turf-popup .leaflet-popup-close-button:hover { color: var(--text-primary) !important; }

/* ========== AUTH SCREEN ========== */
.auth-screen {
  position: fixed; inset: 0; z-index: 1000;
  background: var(--bg-primary);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.auth-card {
  width: 100%; max-width: 360px;
  text-align: center;
}
.auth-logo {
  font-size: 48px; font-weight: 900; letter-spacing: 6px;
  background: linear-gradient(135deg, var(--accent), var(--amber));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 4px;
}
.auth-tagline {
  font-size: 14px; color: var(--text-secondary);
  margin-bottom: 32px;
}
.auth-form { display: flex; flex-direction: column; gap: 12px; }
.auth-input {
  width: 100%; padding: 14px 16px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text-primary);
  font-size: 15px; outline: none;
  transition: border-color 0.2s;
}
.auth-input:focus { border-color: var(--accent); }
.auth-input::placeholder { color: var(--text-muted); }
.auth-btn {
  width: 100%; padding: 14px; border: none; border-radius: var(--radius-sm);
  font-size: 15px; font-weight: 700; cursor: pointer;
  transition: opacity 0.2s;
}
.auth-btn:disabled { opacity: 0.5; cursor: default; }
.auth-btn.primary { background: var(--accent); color: #fff; }
.auth-btn.primary:hover:not(:disabled) { opacity: 0.9; }
.auth-btn.strava-btn {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  text-decoration: none; text-align: center;
  background: #FC4C02; color: #fff;
}
.auth-btn.strava-btn:hover { opacity: 0.9; }
.strava-icon { flex-shrink: 0; }
.auth-btn.secondary {
  background: transparent; color: var(--text-secondary);
  border: 1px solid var(--border);
}
.auth-btn.secondary:hover { color: var(--text-primary); border-color: var(--text-muted); }
.auth-error { color: var(--danger); font-size: 13px; min-height: 18px; }
.auth-switch {
  font-size: 13px; color: var(--text-secondary); margin-top: 4px;
}
.auth-switch a { color: var(--accent); text-decoration: none; font-weight: 600; }
.auth-switch a:hover { text-decoration: underline; }
.auth-explore { margin-top: 24px; }
.auth-privacy { margin-top: 16px; text-align: center; font-size: 12px; }
.auth-privacy a { color: var(--text-muted); text-decoration: none; }
.auth-privacy a:hover { color: var(--text-secondary); text-decoration: underline; }
.auth-login-link {
  background: #FC4C02 !important; color: #fff !important;
  padding: 6px 14px !important; border-radius: var(--radius-sm) !important;
  font-weight: 700 !important; font-size: 13px !important;
  width: auto !important; height: auto !important;
  white-space: nowrap; text-decoration: none;
}
.settings-item-btn { cursor: pointer; }
.settings-item-btn:hover { background: var(--bg-card-hover); }
.settings-danger { color: var(--danger); }
.strava-attribution {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  margin-top: 24px; padding: 12px; font-size: 12px; color: var(--text-muted);
}

/* ========== PROFILE DROPDOWN ========== */
.profile-dropdown-wrap { position: relative; }
.profile-icon-btn {
  width: 34px !important; height: 34px !important; border-radius: 50% !important;
  background: var(--accent) !important; color: #fff !important;
  font-weight: 800 !important; font-size: 15px !important;
  display: flex !important; align-items: center !important; justify-content: center !important;
  padding: 0 !important; border: none !important; cursor: pointer;
}
.profile-dropdown {
  position: absolute; top: calc(100% + 8px); right: 0;
  min-width: 200px; background: var(--bg-card);
  border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5); z-index: 1001;
  overflow: hidden;
}
.profile-dropdown-name {
  padding: 12px 14px 2px; font-weight: 700; font-size: 14px; color: var(--text-primary);
}
.profile-dropdown-username {
  padding: 0 14px 8px; font-size: 12px; color: var(--text-secondary);
}
.profile-dropdown-divider {
  height: 1px; background: var(--border); margin: 0;
}
.profile-dropdown-item {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 10px 14px; background: none; border: none;
  color: var(--text-primary); font-size: 13px; cursor: pointer;
  text-align: left;
}
.profile-dropdown-item:hover { background: var(--bg-card-hover); }
.profile-dropdown-item span { width: 18px; text-align: center; }
.profile-dropdown-danger { color: var(--danger); }
.profile-dropdown-danger:hover { background: rgba(239,68,68,0.1); }

/* ========== DEV TOOLS ========== */
.dev-panel { position: fixed; bottom: calc(var(--nav-height) + var(--safe-bottom) + 12px); left: 12px; z-index: 900; }
.dev-toggle {
  width: 40px; height: 40px; border-radius: 50%;
  background: #1e1e2e; border: 1px solid var(--border);
  color: #fff; font-size: 18px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}
.dev-toggle:hover { background: var(--bg-card-hover); }
.dev-drawer {
  position: absolute; bottom: 48px; left: 0;
  width: 260px; background: var(--bg-card);
  border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
  padding: 0; overflow: hidden;
}
.dev-drawer-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 14px; background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  font-weight: 700; font-size: 13px; color: var(--amber);
}
.dev-drawer-close {
  background: none; border: none; color: var(--text-muted);
  font-size: 18px; cursor: pointer;
}
.dev-section { padding: 10px 14px; border-bottom: 1px solid var(--border); }
.dev-section:last-of-type { border-bottom: none; }
.dev-section-title { font-size: 10px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; letter-spacing: 1px; }
.dev-row { display: flex; gap: 8px; }
.dev-input {
  flex: 1; padding: 6px 10px; background: var(--bg-primary);
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  color: var(--text-primary); font-size: 13px;
}
.dev-btn {
  padding: 6px 12px; border: none; border-radius: var(--radius-sm);
  background: var(--accent); color: #fff; font-size: 12px; font-weight: 700;
  cursor: pointer; white-space: nowrap;
}
.dev-btn:hover { opacity: 0.9; }
.dev-btn.full { width: 100%; }
.dev-btn.danger { background: var(--danger); }
.dev-log { padding: 6px 14px; font-size: 11px; color: var(--green); min-height: 20px; }
`;
}
