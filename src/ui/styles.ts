export function getStyles(): string {
  return `
/* ========== Reset & Base ========== */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg-primary: #08080c;
  --bg-secondary: #0e0e14;
  --bg-card: #141418;
  --bg-card-hover: #1c1c22;
  --bg-elevated: #18181e;
  --accent: #ff6a00;
  --accent-dim: #ff6a0040;
  --accent-glow: #ff6a0018;
  --accent-bright: #ff8c2a;
  --amber: #ffb830;
  --amber-dim: #ffb83040;
  --amber-glow: #ffb83018;
  --green: #4ade80;
  --green-dim: #4ade8040;
  --danger: #ef4444;
  --danger-dim: #ef444440;
  --text-primary: #e8e8ec;
  --text-secondary: #8a8a96;
  --text-muted: #4a4a56;
  --border: #222230;
  --border-glow: #ff6a0020;
  --radius: 12px;
  --radius-sm: 8px;
  --radius-lg: 16px;
  --nav-height: 64px;
  --header-height: 52px;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

html, body {
  height: 100%;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}

/* ========== App Shell ========== */
#app {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: relative;
}

/* ========== Header ========== */
.app-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  z-index: 10;
}

.logo {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 3px;
  text-transform: uppercase;
  background: linear-gradient(135deg, var(--accent), var(--amber));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-actions {
  display: flex;
  gap: 6px;
  align-items: center;
}

.header-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.header-btn:active {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 8px var(--accent-dim);
}

/* ========== Main Content Area ========== */
.page-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: calc(var(--nav-height) + var(--safe-bottom));
}

.page {
  display: none;
  min-height: 100%;
  animation: fadeIn 0.2s ease;
}

.page.active {
  display: block;
}

.page-padded {
  padding: 16px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ========== Bottom Navigation ========== */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(var(--nav-height) + var(--safe-bottom));
  padding-bottom: var(--safe-bottom);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  border: none;
  background: none;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;
  position: relative;
  -webkit-tap-highlight-color: transparent;
}

.nav-item.active {
  color: var(--accent);
}

.nav-item .nav-icon {
  font-size: 20px;
  line-height: 1;
}

.nav-item .nav-label {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 2px;
  background: var(--accent);
  border-radius: 1px;
  box-shadow: 0 0 6px var(--accent);
}

/* ========== MAP PAGE ========== */
.map-container {
  position: relative;
  width: 100%;
  height: calc(100vh - var(--header-height) - var(--nav-height) - var(--safe-bottom));
  background: var(--bg-primary);
  overflow: hidden;
}

#map {
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* Leaflet dark theme overrides */
.leaflet-container { background: var(--bg-primary); }
.leaflet-control-attribution { display: none; }

/* Hex glow animation for contested cells */
@keyframes contestedPulse {
  0%, 100% { opacity: 0.15; }
  50% { opacity: 0.35; }
}

/* User location marker */
.user-marker {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  border: 3px solid var(--bg-primary);
  box-shadow: 0 0 12px var(--accent), 0 0 24px var(--accent-dim);
  animation: userPulse 2s ease-in-out infinite;
}

.user-marker-ring {
  position: absolute;
  width: 40px;
  height: 40px;
  top: -12px;
  left: -12px;
  border-radius: 50%;
  border: 2px solid var(--accent-dim);
  animation: ringPulse 2s ease-in-out infinite;
}

@keyframes userPulse {
  0%, 100% { box-shadow: 0 0 12px var(--accent), 0 0 24px var(--accent-dim); }
  50% { box-shadow: 0 0 18px var(--accent), 0 0 36px var(--accent-dim); }
}

@keyframes ringPulse {
  0% { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}

/* Hex cell point labels */
.hex-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  line-height: 1;
  text-shadow: 0 0 6px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9);
}

.hex-owner-badge {
  display: flex;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  pointer-events: auto;
  transition: opacity 0.15s;
}

.hex-owner-badge:active {
  opacity: 0.6;
}

.hex-owner-icon {
  font-size: 11px;
}

.hex-owner-init {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

.hex-label .hex-def {
  font-size: 15px;
  font-weight: 800;
}

.hex-label .hex-atk {
  font-size: 11px;
  font-weight: 700;
}

/* Hex owner popup card */
.hex-owner-popup {
  position: absolute;
  z-index: 1200;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
  min-width: 160px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  animation: fadeIn 0.15s ease;
  pointer-events: auto;
}

.hop-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.hop-icon {
  font-size: 24px;
}

.hop-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

.hop-type {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.hop-stats {
  display: flex;
  gap: 12px;
}

.hop-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.hop-num {
  font-size: 15px;
  font-weight: 700;
  color: var(--accent);
}

.hop-lbl {
  font-size: 9px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

/* Home city prompt overlay */
.home-city-overlay {
  position: absolute;
  inset: 0;
  z-index: 1100;
  background: rgba(8, 8, 12, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.home-city-card {
  text-align: center;
  max-width: 320px;
  width: 100%;
}

.home-city-icon {
  font-size: 48px;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 12px var(--accent));
}

.home-city-title {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 6px;
  color: var(--text-primary);
}

.home-city-sub {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 20px;
  line-height: 1.5;
}

.home-city-input-wrap {
  display: flex;
  gap: 8px;
}

.home-city-input {
  flex: 1;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.home-city-input:focus {
  border-color: var(--accent-dim);
}

.home-city-input::placeholder {
  color: var(--text-muted);
}

.home-city-btn {
  padding: 12px 18px;
  border: 1px solid var(--accent-dim);
  border-radius: var(--radius-sm);
  background: var(--accent-glow);
  color: var(--accent);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.home-city-btn:active {
  background: var(--accent-dim);
}

.home-city-error {
  font-size: 12px;
  color: var(--danger);
  margin-top: 8px;
  min-height: 16px;
}

/* Map overlay stats */
.map-overlay-stats {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  z-index: 1000;
  pointer-events: none;
}

.map-stat {
  background: #0e0e14dd;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 1000;
}

.map-stat .label {
  font-size: 9px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.map-stat .value {
  font-size: 16px;
  font-weight: 700;
  color: var(--accent);
}

.map-stat .value.amber { color: var(--amber); }
.map-stat .value.green { color: var(--green); }

/* Map quick-access buttons */
.map-quick-actions {
  position: absolute;
  bottom: 20px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: center;
  z-index: 1000;
  pointer-events: none;
}

.quick-btn {
  padding: 14px 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: #0e0e14dd;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: var(--text-secondary);
  cursor: pointer;
  text-align: center;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
}

.quick-btn:active {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 12px var(--accent-glow);
}

.quick-btn.primary {
  border-color: var(--accent-dim);
  color: var(--accent);
  background: #ff6a000d;
}

.quick-btn .btn-icon {
  font-size: 20px;
}

.quick-btn .btn-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ========== GROUP PAGE ========== */
.group-header {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.group-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--amber));
}

.group-name {
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.group-tag {
  font-size: 12px;
  color: var(--text-muted);
}

.group-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
}

.group-stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 6px;
  text-align: center;
}

.group-stat-card .stat-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
}

.group-stat-card .stat-value.amber { color: var(--amber); }
.group-stat-card .stat-value.green { color: var(--green); }

.group-stat-card .stat-label {
  font-size: 9px;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-top: 2px;
  letter-spacing: 0.3px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.section-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.section-badge {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-weight: 600;
}

/* Activity feed */
.activity-feed {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 13px;
  line-height: 1.4;
}

.activity-text strong {
  color: var(--accent);
  font-weight: 600;
}

.activity-time {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* Member list */
.member-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.member-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: var(--accent);
  flex-shrink: 0;
  border: 1px solid var(--accent-dim);
}

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  font-size: 13px;
  font-weight: 600;
}

.member-detail {
  font-size: 10px;
  color: var(--text-muted);
  display: flex;
  gap: 6px;
  align-items: center;
}

.member-skill-badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 5px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 700;
  background: var(--accent-glow);
  color: var(--accent);
  border: 1px solid var(--accent-dim);
}

.member-status {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.member-status.online { background: var(--green); box-shadow: 0 0 4px var(--green); }
.member-status.offline { background: var(--text-muted); }

.member-role {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--amber);
  letter-spacing: 0.3px;
  margin-left: 4px;
}

.member-contrib {
  text-align: right;
  flex-shrink: 0;
  margin-right: 4px;
}

.contrib-val {
  font-size: 13px;
  font-weight: 700;
  color: var(--green);
}

.contrib-lbl {
  font-size: 9px;
  color: var(--text-muted);
  text-transform: uppercase;
}

/* Raid cards */
.raid-section {
  margin-bottom: 20px;
}

.raid-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  margin-bottom: 8px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.raid-card.active-raid {
  border-color: var(--danger-dim);
  box-shadow: 0 0 12px var(--danger-dim);
}

.raid-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  background: var(--danger-dim);
}

.raid-info {
  flex: 1;
  min-width: 0;
}

.raid-name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 3px;
}

.raid-meta {
  font-size: 11px;
  color: var(--text-muted);
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.raid-timer {
  font-size: 13px;
  font-weight: 700;
  color: var(--danger);
  flex-shrink: 0;
}

.raid-status {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.raid-status.active { background: var(--danger-dim); color: var(--danger); }
.raid-status.scheduled { background: var(--amber); color: var(--bg-primary); }
.raid-status.completed { background: var(--text-muted); color: var(--bg-primary); }

.plan-raid-btn {
  width: 100%;
  padding: 12px;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.5px;
}

.plan-raid-btn:active {
  border-color: var(--danger);
  color: var(--danger);
}

.raid-votes {
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.raid-vote-bar {
  flex: 1;
  height: 6px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
}

.raid-vote-fill {
  height: 100%;
  background: var(--green);
  border-radius: 3px;
  transition: width 0.3s;
}

.raid-vote-text {
  font-size: 10px;
  color: var(--text-muted);
  white-space: nowrap;
}

/* Group Management */
.group-mgmt {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 20px;
}

.mgmt-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color 0.2s;
  text-align: left;
}

.mgmt-btn:active {
  border-color: var(--accent);
}

.mgmt-btn.mgmt-danger:active {
  border-color: var(--danger);
}

.mgmt-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.mgmt-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.mgmt-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.mgmt-danger .mgmt-name {
  color: var(--danger);
}

.mgmt-desc {
  font-size: 10px;
  color: var(--text-muted);
}

.mgmt-badge {
  background: var(--accent);
  color: var(--bg-primary);
  font-size: 10px;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 10px;
  flex-shrink: 0;
}

.mgmt-arrow {
  font-size: 18px;
  color: var(--text-muted);
  flex-shrink: 0;
}

/* Activity scroll box */
.activity-scroll-box {
  max-height: 160px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-card);
  padding: 4px 0;
  margin-bottom: 20px;
}

.activity-scroll-box::-webkit-scrollbar {
  width: 4px;
}

.activity-scroll-box::-webkit-scrollbar-track {
  background: transparent;
}

.activity-scroll-box::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 2px;
}

/* Collapsible Sections */
.section-header.collapsible {
  cursor: pointer;
  user-select: none;
  position: relative;
  padding-right: 24px;
}

.collapse-chevron {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  font-size: 16px;
  color: var(--text-muted);
  transition: transform 0.2s;
}

.section-header.collapsed .collapse-chevron {
  transform: translateY(-50%) rotate(0deg);
}

.collapse-body {
  overflow: hidden;
  transition: max-height 0.25s ease;
}

/* Group Modals */
.group-modal {
  position: fixed;
  inset: 0;
  z-index: 8000;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.group-modal-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: 100%;
  max-width: 340px;
  overflow: hidden;
}

.group-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  font-size: 15px;
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.group-modal-body {
  padding: 16px;
}

/* Invite Modal */
.invite-code-box {
  text-align: center;
  padding: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
}

.invite-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.invite-code {
  font-size: 22px;
  font-weight: 800;
  color: var(--accent);
  letter-spacing: 2px;
  font-family: monospace;
  margin-bottom: 10px;
}

.invite-copy-btn {
  padding: 8px 20px;
  background: var(--accent);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.invite-divider {
  text-align: center;
  color: var(--text-muted);
  font-size: 11px;
  margin: 12px 0;
}

.invite-share-btn {
  width: 100%;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

/* Join Requests */
.join-request-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

.join-request-item:last-child {
  border-bottom: none;
}

.jr-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: var(--accent);
  flex-shrink: 0;
}

.jr-info {
  flex: 1;
  min-width: 0;
}

.jr-name {
  font-size: 13px;
  font-weight: 600;
}

.jr-detail {
  font-size: 10px;
  color: var(--text-muted);
}

.jr-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.jr-btn {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--border);
}

.jr-btn.accept {
  background: var(--green);
  color: var(--bg-primary);
  border-color: var(--green);
}

.jr-btn.deny {
  background: transparent;
  color: var(--text-muted);
}

/* Leave Modal */
.leave-warning {
  font-size: 14px;
  margin-bottom: 8px;
}

.leave-warning strong {
  color: var(--accent);
}

.leave-note {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 16px;
  line-height: 1.4;
}

.leave-actions {
  display: flex;
  gap: 10px;
}

.leave-btn {
  flex: 1;
  padding: 11px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--border);
}

.leave-btn.cancel {
  background: var(--bg-card);
  color: var(--text-muted);
}

.leave-btn.danger {
  background: var(--danger);
  color: #fff;
  border-color: var(--danger);
}

/* Raid Map Overlay */
.raid-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
}

.raid-overlay-header {
  padding: 16px 16px 12px;
  text-align: center;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.raid-overlay-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--danger);
}

.raid-overlay-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.raid-map-container {
  flex: 1;
  min-height: 0;
}

.raid-overlay-footer {
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.raid-selection-info {
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.raid-selection-info span {
  color: var(--danger);
  font-weight: 700;
}

.raid-overlay-actions {
  display: flex;
  gap: 10px;
}

.raid-action-btn {
  flex: 1;
  padding: 12px;
  border-radius: var(--radius);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--border);
  transition: opacity 0.2s;
}

.raid-action-btn.cancel {
  background: var(--bg-card);
  color: var(--text-muted);
}

.raid-action-btn.confirm {
  background: var(--danger);
  color: #fff;
  border-color: var(--danger);
}

.raid-action-btn.confirm:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.raid-hex-selected {
  animation: raidPulse 1.5s ease-in-out infinite;
}

@keyframes raidPulse {
  0%, 100% { fill-opacity: 0.4; }
  50% { fill-opacity: 0.6; }
}

/* ========== RUN OVERLAY EXTRAS ========== */
.run-type-selector {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  justify-content: center;
}

.run-type-btn {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  transition: all 0.2s;
}

.run-type-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

/* Run result modal content */
.run-result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 12px 0;
}

.run-result-stat {
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  padding: 12px;
  text-align: center;
}

.run-result-stat .rr-value {
  font-size: 22px;
  font-weight: 800;
  color: var(--accent);
}

.run-result-stat .rr-value.green { color: var(--green); }

.run-result-stat .rr-label {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.run-result-skill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-primary);
  border-radius: var(--radius-sm);
  margin-top: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.run-result-skill .rr-skill-icon { font-size: 16px; }

/* Loading overlay */
.loading-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(8, 8, 12, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  font-size: 14px;
  color: var(--text-secondary);
}

/* ========== SKILLS PAGE ========== */
.sp-bar {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sp-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sp-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--amber);
}

.skill-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 16px;
  background: var(--bg-card);
  border-radius: var(--radius);
  padding: 4px;
  border: 1px solid var(--border);
}

.skill-tab {
  flex: 1;
  padding: 10px 8px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.skill-tab.active {
  background: var(--accent-glow);
  color: var(--accent);
  box-shadow: 0 0 8px var(--accent-glow);
}

.skill-tab.active.amber-tab {
  background: var(--amber-glow);
  color: var(--amber);
  box-shadow: 0 0 8px var(--amber-glow);
}

.skill-panel {
  display: none;
}

.skill-panel.active {
  display: block;
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skill-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}

.skill-card.equipped {
  border-color: var(--accent-dim);
  box-shadow: 0 0 10px var(--accent-glow);
}

.equipped-badge {
  margin-left: auto;
  font-size: 9px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--accent);
  color: var(--bg-primary);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  flex-shrink: 0;
}

.skill-card:active {
  background: var(--bg-card-hover);
}

.skill-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.skill-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.skill-name {
  font-size: 15px;
  font-weight: 700;
}

.skill-desc {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 10px;
}

.skill-level-bar {
  display: flex;
  gap: 4px;
  align-items: center;
}

.skill-level-pip {
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: var(--border);
  flex: 1;
}

.skill-level-pip.filled {
  background: var(--accent);
  box-shadow: 0 0 4px var(--accent-dim);
}

.skill-level-pip.filled.amber { background: var(--amber); box-shadow: 0 0 4px var(--amber-dim); }

.skill-level-label {
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 700;
  margin-left: 6px;
  flex-shrink: 0;
}

.skill-bottom {
  display: flex;
  align-items: center;
  gap: 10px;
}

.skill-bottom .skill-level-bar {
  flex: 1;
}

.skill-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.skill-equip-btn {
  padding: 5px 10px;
  border: 1px solid var(--accent-dim);
  border-radius: 6px;
  background: transparent;
  color: var(--accent);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  transition: all 0.2s;
}

.skill-equip-btn:active {
  background: var(--accent-glow);
}

.skill-lvl-btn {
  padding: 5px 10px;
  border: 1px solid var(--amber-dim);
  border-radius: 6px;
  background: transparent;
  color: var(--amber);
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.skill-lvl-btn:active {
  background: var(--amber-glow);
}

.skill-lvl-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ========== LEADERBOARD PAGE ========== */
.lb-filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
  align-items: center;
}

.lb-scope-select {
  display: flex;
  gap: 4px;
}

.lb-scope-btn {
  padding: 7px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.lb-scope-btn.active {
  border-color: var(--accent-dim);
  color: var(--accent);
  background: var(--accent-glow);
}

.lb-type-pills {
  display: flex;
  gap: 0;
  flex: 1;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  padding: 3px;
  border: 1px solid var(--border);
}

.lb-type-pill {
  flex: 1;
  padding: 7px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.lb-type-pill.active {
  background: var(--amber-glow);
  color: var(--amber);
}

.lb-panel {
  display: none;
}

.lb-panel.active {
  display: block;
}

.lb-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lb-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.lb-row.highlight {
  border-color: var(--accent-dim);
  background: var(--accent-glow);
}

.lb-rank {
  width: 28px;
  text-align: center;
  font-size: 14px;
  font-weight: 800;
  color: var(--text-muted);
  flex-shrink: 0;
}

.lb-row:nth-child(1) .lb-rank { color: #ffd700; }
.lb-row:nth-child(2) .lb-rank { color: #c0c0c0; }
.lb-row:nth-child(3) .lb-rank { color: #cd7f32; }

.lb-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent-dim);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: var(--accent);
  flex-shrink: 0;
}

.lb-avatar.group-avatar {
  border-radius: var(--radius-sm);
}

.lb-info {
  flex: 1;
  min-width: 0;
}

.lb-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lb-sub {
  font-size: 10px;
  color: var(--text-muted);
}

.lb-score {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
  flex-shrink: 0;
}

.lb-score-label {
  font-size: 9px;
  color: var(--text-muted);
  text-align: right;
}

/* ========== PROFILE PAGE ========== */
.profile-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  text-align: center;
  margin-bottom: 16px;
  position: relative;
  overflow: hidden;
}

.profile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(135deg, var(--accent-glow), var(--amber-glow));
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--bg-primary);
  border: 2px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 10px;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 16px var(--accent-dim);
}

.profile-name {
  font-size: 20px;
  font-weight: 800;
  position: relative;
}

.profile-group {
  font-size: 12px;
  color: var(--amber);
  font-weight: 600;
  margin-top: 2px;
}

.profile-joined {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

.equipped-skills {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.equipped-skill {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px 8px;
  text-align: center;
}

.equipped-skill .eq-type {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.equipped-skill .eq-type.solo { color: var(--accent); }
.equipped-skill .eq-type.double { color: var(--amber); }
.equipped-skill .eq-type.group { color: var(--amber); }

.equipped-skill .eq-icon {
  font-size: 22px;
  margin-bottom: 4px;
}

.equipped-skill .eq-name {
  font-size: 11px;
  font-weight: 600;
}

.equipped-skill .eq-level {
  font-size: 9px;
  color: var(--text-muted);
  margin-top: 2px;
}

.profile-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.p-stat {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 10px 6px;
  text-align: center;
}

.p-stat .p-num {
  font-size: 18px;
  font-weight: 700;
  color: var(--accent);
}

.p-stat .p-label {
  font-size: 9px;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-top: 2px;
  letter-spacing: 0.3px;
}

.xp-bar-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px;
  margin-bottom: 16px;
}

.xp-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 8px;
}

.xp-header .xp-level {
  color: var(--text-secondary);
  font-weight: 600;
}

.xp-header .xp-amount {
  color: var(--text-muted);
}

.xp-track {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.xp-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--accent), var(--amber));
  transition: width 0.5s ease;
}

.streak-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.streak-fire {
  font-size: 32px;
  filter: drop-shadow(0 0 6px #ff6600);
}

.streak-info .streak-count {
  font-size: 20px;
  font-weight: 800;
}

.streak-info .streak-label {
  font-size: 11px;
  color: var(--text-muted);
}

.streak-info .streak-bonus {
  font-size: 10px;
  color: var(--green);
  font-weight: 700;
  margin-top: 2px;
}

.run-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.run-entry {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.run-type-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.run-type-icon.solo { background: var(--accent-glow); }
.run-type-icon.double { background: var(--amber-glow); }
.run-type-icon.group { background: var(--amber-dim); }

.run-info {
  flex: 1;
  min-width: 0;
}

.run-title {
  font-size: 13px;
  font-weight: 600;
}

.run-detail {
  font-size: 10px;
  color: var(--text-muted);
}

.run-points {
  text-align: right;
  flex-shrink: 0;
}

.run-points .pts {
  font-size: 14px;
  font-weight: 700;
  color: var(--accent);
}

.run-points .pts-label {
  font-size: 9px;
  color: var(--text-muted);
}

/* ========== SETTINGS PAGE ========== */
.settings-group {
  margin-bottom: 20px;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  margin-bottom: 6px;
  cursor: pointer;
}

.settings-item:active {
  background: var(--bg-card-hover);
}

.settings-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.settings-icon {
  font-size: 18px;
}

.settings-text .settings-name {
  font-size: 14px;
  font-weight: 600;
}

.settings-text .settings-desc {
  font-size: 11px;
  color: var(--text-muted);
}

.settings-arrow {
  color: var(--text-muted);
  font-size: 14px;
}

/* ========== EMPTY STATE ========== */
.empty-state {
  text-align: center;
  padding: 32px 20px;
  color: var(--text-muted);
}

.empty-state .empty-icon {
  font-size: 40px;
  margin-bottom: 10px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.empty-state p {
  font-size: 12px;
  line-height: 1.5;
}

/* ========== SCROLLBAR ========== */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
`;
}
