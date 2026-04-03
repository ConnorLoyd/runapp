import { getStyles } from "./styles";
import { getScripts } from "./scripts";

export function getAppHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#ff6a00">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <link rel="manifest" href="/manifest.json">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.css" />
  <title>Turf Runner</title>
  <style>${getStyles()}</style>
</head>
<body>
  <div id="app">

    <!-- Auth Screen (shown when not logged in) -->
    <div id="auth-screen" class="auth-screen" style="display:none">
      <div class="auth-card">
        <div class="auth-logo">TURF RUNNER</div>
        <div class="auth-tagline">Claim your territory</div>

        <!-- Strava Login -->
        <div class="auth-form">
          <a href="/api/auth/strava" class="auth-btn primary strava-btn" id="strava-login-btn">
            <svg class="strava-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg>
            Continue with Strava
          </a>
          <div id="login-error" class="auth-error"></div>
        </div>

        <div class="auth-explore">
          <button id="auth-explore-btn" class="auth-btn secondary">Explore Map as Guest</button>
        </div>
        <div class="auth-privacy"><a href="/privacy" target="_blank">Privacy Policy</a></div>
      </div>
    </div>

    <!-- Header -->
    <header class="app-header" id="app-header" style="display:none">
      <div class="logo">TURF RUNNER</div>
      <div class="header-actions">
        <div class="profile-dropdown-wrap" id="profile-dropdown-wrap">
          <button class="header-btn profile-icon-btn" id="profile-icon-btn" aria-label="Profile">
            <span id="header-avatar-initial">?</span>
          </button>
          <div class="profile-dropdown" id="profile-dropdown" style="display:none">
            <div class="profile-dropdown-name" id="dropdown-display-name">—</div>
            <div class="profile-dropdown-username" id="dropdown-username">—</div>
            <div class="profile-dropdown-divider"></div>
            <button class="profile-dropdown-item" data-page="page-profile">
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg></span> Profile
            </button>
            <button class="profile-dropdown-item" data-page="page-settings">
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg></span> Settings
            </button>
            <div class="profile-dropdown-divider"></div>
            <button class="profile-dropdown-item profile-dropdown-danger" id="dropdown-logout-btn">
              <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg></span> Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Page Container -->
    <div class="page-container" id="page-container" style="display:none">

      <!-- ========== MAP PAGE (HOME) ========== -->
      <div id="page-map" class="page active">
        <div class="map-container">
          <div id="map"></div>

          <!-- Map loading indicator -->
          <div id="map-loading" class="map-loading">
            <div class="map-loading-spinner"></div>
            <div class="map-loading-text">Loading map...</div>
          </div>

          <!-- Home city prompt -->
          <div id="home-city-overlay" class="home-city-overlay" style="display:none;">
            <div class="home-city-card">
              <div class="home-city-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>
              <h2 class="home-city-title">Where's your turf?</h2>
              <p class="home-city-sub">Enter your city or neighborhood to set your home base</p>
              <div class="home-city-input-wrap">
                <input type="text" id="home-city-input" class="home-city-input" placeholder="e.g. Austin, TX" autocomplete="off" />
                <button id="home-city-btn" class="home-city-btn">Set Home</button>
              </div>
              <div id="home-city-error" class="home-city-error"></div>
            </div>
          </div>

          <!-- Overlay stats -->
          <div class="map-overlay-stats">
            <div class="map-stat-chip">
              <span class="chip-item"><span class="chip-value" id="stat-held">0</span> <span class="chip-label">cells</span></span>
              <span class="chip-divider"></span>
              <span class="chip-item"><span class="chip-value amber" id="stat-rp">0</span> <span class="chip-label">RP</span></span>
            </div>
          </div>

          <!-- Map controls -->
          <div class="map-controls">
            <button class="map-ctrl-btn" id="map-recenter-btn" title="My Location">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="5" y1="12" y2="12"/><line x1="19" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="5"/><line x1="12" x2="12" y1="19" y2="22"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="map-ctrl-btn" id="map-search-btn" title="Search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </div>

          <!-- Map search bar -->
          <div id="map-search-bar" class="map-search-bar" style="display:none;">
            <input type="text" id="map-search-input" class="map-search-input" placeholder="Search city or address..." autocomplete="off" />
            <button id="map-search-go" class="map-search-go">Go</button>
            <button id="map-search-close" class="map-search-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            <div id="map-search-suggestions" class="map-search-suggestions" style="display:none;"></div>
          </div>

        </div>
      </div>

      <!-- ========== GROUP PAGE ========== -->
      <div id="page-group" class="page page-padded">
        <!-- No group state -->
        <div id="no-group" style="display:none">
          <div class="no-group-cards">
            <button class="no-group-card" id="create-group-btn">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
              <span class="no-group-card-title">Create Group</span>
            </button>
            <button class="no-group-card" id="join-group-btn">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
              <span class="no-group-card-title">Join Group</span>
            </button>
          </div>
        </div>

        <!-- Has group state -->
        <div id="has-group" style="display:none">
          <div class="group-header">
            <div class="group-color-dot" id="group-color-dot"></div>
            <div>
              <div class="group-name" id="group-name"></div>
              <div class="group-meta" id="group-meta"></div>
            </div>
          </div>

          <div class="group-stats-row">
            <div class="group-stat-card">
              <div class="stat-value" id="group-cells">0</div>
              <div class="stat-label">Cells</div>
            </div>
            <div class="group-stat-card">
              <div class="stat-value" id="group-members-count">0</div>
              <div class="stat-label">Members</div>
            </div>
          </div>

          <!-- Members -->
          <div class="section-header"><div class="section-title">Members</div></div>
          <div class="member-list" id="member-list"></div>

          <!-- Management -->
          <div class="section-header" style="margin-top:16px"><div class="section-title">Manage</div></div>
          <div class="group-mgmt">
            <button class="mgmt-btn" id="mgmt-color-btn">
              <span class="mgmt-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg></span>
              <span class="mgmt-text">
                <span class="mgmt-name">Group Color</span>
                <span class="mgmt-desc">Change territory color</span>
              </span>
              <input type="color" id="group-color-picker" class="color-picker" />
              <span class="mgmt-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span>
            </button>
            <button class="mgmt-btn" id="mgmt-invite-btn">
              <span class="mgmt-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg></span>
              <span class="mgmt-text">
                <span class="mgmt-name">Invite Players</span>
                <span class="mgmt-desc">Share invite code</span>
              </span>
              <span class="mgmt-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span>
            </button>
            <button class="mgmt-btn mgmt-danger" id="mgmt-leave-btn">
              <span class="mgmt-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg></span>
              <span class="mgmt-text">
                <span class="mgmt-name">Leave Group</span>
                <span class="mgmt-desc">Your RP stays with the group</span>
              </span>
              <span class="mgmt-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span>
            </button>            <button class="mgmt-btn mgmt-danger" id="mgmt-delete-btn" style="display:none">
              <span class="mgmt-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></span>
              <span class="mgmt-text">
                <span class="mgmt-name">Delete Group</span>
                <span class="mgmt-desc">All territory and RP are lost forever</span>
              </span>
              <span class="mgmt-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg></span>
            </button>          </div>
        </div>

        <!-- Invite Modal -->
        <div id="invite-modal" class="modal-overlay" style="display:none">
          <div class="modal-card">
            <div class="modal-header">
              <span>Invite Players</span>
              <button class="modal-close" data-close="invite-modal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
            <div class="modal-body">
              <div class="invite-code-box">
                <div class="invite-label">Invite Code</div>
                <div class="invite-code" id="invite-code-value"></div>
                <button class="btn-primary" id="invite-copy-btn">Copy Code</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Create Group Modal -->
        <div id="create-group-modal" class="modal-overlay" style="display:none">
          <div class="modal-card">
            <div class="modal-header">
              <span>Create Group</span>
              <button class="modal-close" data-close="create-group-modal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
            <div class="modal-body">
              <input type="text" id="new-group-name" class="input" placeholder="Group name" maxlength="30" />
              <button class="btn-primary" id="create-group-confirm" style="margin-top:12px;width:100%">Create</button>
              <div id="create-group-error" class="error-text"></div>
            </div>
          </div>
        </div>

        <!-- Join Group Modal -->
        <div id="join-group-modal" class="modal-overlay" style="display:none">
          <div class="modal-card">
            <div class="modal-header">
              <span>Join Group</span>
              <button class="modal-close" data-close="join-group-modal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
            <div class="modal-body">
              <input type="text" id="join-invite-code" class="input" placeholder="Enter invite code" maxlength="20" />
              <button class="btn-primary" id="join-group-confirm" style="margin-top:12px;width:100%">Join</button>
              <div id="join-group-error" class="error-text"></div>
            </div>
          </div>
        </div>

        <!-- Leave Confirmation Modal -->
        <div id="leave-modal" class="modal-overlay" style="display:none">
          <div class="modal-card">
            <div class="modal-header">
              <span>Leave Group</span>
              <button class="modal-close" data-close="leave-modal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
            <div class="modal-body">
              <p class="leave-warning">Are you sure? Your contributed RP stays with the group.</p>
              <div class="leave-actions">
                <button class="btn-secondary" data-close="leave-modal">Cancel</button>
                <button class="btn-danger" id="leave-confirm-btn">Leave Group</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Delete Group Confirmation Modal -->
        <div id="delete-group-modal" class="modal-overlay" style="display:none">
          <div class="modal-card">
            <div class="modal-header">
              <span>Delete Group</span>
              <button class="modal-close" data-close="delete-group-modal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
            <div class="modal-body">
              <p class="leave-warning" style="color:var(--danger)">This will permanently delete the group, all territory, and all RP. This cannot be undone.</p>
              <div class="leave-actions">
                <button class="btn-secondary" data-close="delete-group-modal">Cancel</button>
                <button class="btn-danger" id="delete-group-confirm-btn">Delete Forever</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== SKILLS PAGE ========== -->
      <div id="page-skills" class="page page-padded">
        <div class="rp-bar">
          <div class="rp-label">Available RP</div>
          <div class="rp-value"><span id="rp-available">0</span></div>
        </div>
        <div class="skill-timing-note">
          <span class="skill-timing-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
          Your equipped skill applies when runs are synced from Strava. Equip the skill you want <strong>before</strong> your run uploads.
        </div>
        <div class="skill-list" id="skill-list">
          <!-- Skills rendered by JS -->
        </div>
      </div>

      <!-- ========== LEADERBOARD PAGE ========== -->
      <div id="page-leaderboard" class="page page-padded">
        <div class="section-header"><div class="section-title">Cells Owned</div></div>
        <div class="lb-list" id="lb-list">
          <!-- Rendered by JS -->
        </div>
      </div>

      <!-- ========== PROFILE PAGE ========== -->
      <div id="page-profile" class="page page-padded">
        <div class="profile-card">
          <div class="profile-avatar" id="profile-avatar"></div>
          <div class="profile-name" id="profile-name"></div>
          <div class="profile-group" id="profile-group"></div>
        </div>

        <!-- Equipped Skill -->
        <div class="section-header"><div class="section-title">Equipped Skill</div></div>
        <div class="equipped-skill-card" id="equipped-skill-card">
          <span class="eq-icon" id="eq-icon"></span>
          <span class="eq-name" id="eq-name">None</span>
          <span class="eq-level" id="eq-level"></span>
        </div>

        <!-- Stats -->
        <div class="section-header" style="margin-top:16px"><div class="section-title">Stats</div></div>
        <div class="profile-stats-grid">
          <div class="p-stat"><div class="p-num" id="stat-lifetime-rp">0</div><div class="p-label">Lifetime RP</div></div>
          <div class="p-stat"><div class="p-num" id="stat-available-rp">0</div><div class="p-label">Available RP</div></div>
          <div class="p-stat"><div class="p-num" id="stat-total-runs">0</div><div class="p-label">Runs</div></div>
        </div>

        <!-- Run History -->
        <div class="section-header" style="margin-top:16px"><div class="section-title">Recent Runs</div></div>
        <div class="run-history" id="run-history"></div>

        <!-- Solo Color (hidden when in group) -->
        <div id="solo-color-section" style="display:none">
          <div class="section-header" style="margin-top:16px"><div class="section-title">Territory Color</div></div>
          <div class="settings-group">
            <div class="settings-item">
              <div class="settings-left">
                <div class="settings-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg></div>
                <div class="settings-text">
                  <div class="settings-name">Territory Color</div>
                  <div class="settings-desc" id="profile-color-desc">—</div>
                </div>
              </div>
              <input type="color" id="user-color-picker" class="color-picker" />
            </div>
          </div>
        </div>
      </div>

      <!-- ========== SETTINGS PAGE ========== -->
      <div id="page-settings" class="page page-padded">
        <div class="section-header"><div class="section-title">Account</div></div>
        <div class="settings-group">
          <div class="settings-item">
            <div class="settings-left">
              <div class="settings-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>
              <div class="settings-text">
                <div class="settings-name">Strava Account</div>
                <div class="settings-desc" id="settings-strava">Linked</div>
              </div>
            </div>
          </div>
          <div class="settings-item settings-item-btn" id="strava-disconnect-btn">
            <div class="settings-left">
              <div class="settings-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18.84 12.25 1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="m5.16 11.75-1.72 1.71a5 5 0 0 0 7.07 7.07l1.72-1.71"/><line x1="2" x2="22" y1="2" y2="22"/></svg></div>
              <div class="settings-text">
                <div class="settings-name settings-danger">Disconnect Strava</div>
                <div class="settings-desc">Removes Strava data. Game progress is kept.</div>
              </div>
            </div>
          </div>

        </div>
        <div class="section-header" style="margin-top:16px"><div class="section-title">Session</div></div>
        <div class="settings-group">
          <div class="settings-item settings-item-btn" id="logout-btn">
            <div class="settings-left">
              <div class="settings-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg></div>
              <div class="settings-text">
                <div class="settings-name settings-danger">Log Out</div>
                <div class="settings-desc">End your session</div>
              </div>
            </div>
          </div>
        </div>
        <div class="strava-attribution">
          <span>Powered by</span>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#FC4C02"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg>
          <span>Strava</span>
          <span>·</span>
          <a href="/privacy" target="_blank" style="color:#8a8a96;font-size:12px;">Privacy Policy</a>
        </div>
      </div>

    </div>

    <!-- Add Run Map Overlay -->
    <div id="run-map-overlay" class="run-overlay" style="display:none">
      <div class="run-overlay-header">
        <div class="run-overlay-title">Add Run</div>
        <div class="run-overlay-sub">Tap hexes you ran through</div>
      </div>
      <div id="run-map" class="run-map-container"></div>
      <div class="run-overlay-footer">
        <div class="run-selection-info">
          <span id="run-hex-count">0</span> hexes · ~<span id="run-distance">0.0</span> mi
        </div>
        <div class="run-overlay-actions">
          <button id="run-cancel-btn" class="run-action-btn cancel">Cancel</button>
          <button id="run-submit-btn" class="run-action-btn confirm" disabled>Submit Run</button>
        </div>
      </div>
    </div>

    <!-- Run Result Modal -->
    <div id="run-result-modal" class="modal-overlay" style="display:none">
      <div class="modal-card">
        <div class="modal-header">
          <span>Run Complete!</span>
          <button class="modal-close" data-close="run-result-modal"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        </div>
        <div class="modal-body" id="run-result-body"></div>
      </div>
    </div>

    <!-- Dev Tools Panel (localhost only) -->
    <div id="dev-panel" class="dev-panel" style="display:none">
      <button class="dev-toggle" id="dev-toggle-btn"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></button>
      <div class="dev-drawer" id="dev-drawer" style="display:none">
        <div class="dev-drawer-header">
          <span>Dev Tools</span>
          <button class="dev-drawer-close" id="dev-drawer-close"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        </div>
        <div class="dev-section">
          <div class="dev-section-title">RP</div>
          <div class="dev-row">
            <input type="number" id="dev-rp-amount" class="dev-input" value="100" min="1" max="10000" />
            <button class="dev-btn" id="dev-give-rp-btn">Give RP</button>
          </div>
        </div>
        <div class="dev-section">
          <div class="dev-section-title">Runs</div>
          <button class="dev-btn full" id="add-run-btn">Mock Run (Hex Select)</button>
        </div>
        <div class="dev-section">
          <div class="dev-section-title">Territory</div>
          <button class="dev-btn full" id="dev-seed-btn">Seed Territory at GPS</button>
        </div>
        <div class="dev-section">
          <div class="dev-section-title">Database</div>
          <button class="dev-btn danger full" id="dev-reset-btn">Reset Territory + Runs</button>
        </div>
        <div class="dev-section">
          <div class="dev-section-title">Strava Activities (All Past)</div>
          <button class="dev-btn full" id="dev-strava-load-btn">Load Activities</button>
          <div id="dev-strava-list" class="dev-strava-list"></div>
        </div>
        <div class="dev-log" id="dev-log"></div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav" id="bottom-nav" style="display:none">
      <button class="nav-item active" data-page="page-map">
        <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg></span>
        <span class="nav-label">Map</span>
      </button>
      <button class="nav-item" data-page="page-group">
        <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
        <span class="nav-label">Group</span>
      </button>
      <button class="nav-item" data-page="page-skills">
        <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg></span>
        <span class="nav-label">Skills</span>
      </button>
      <button class="nav-item" data-page="page-leaderboard">
        <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg></span>
        <span class="nav-label">Ranks</span>
      </button>
      <button class="nav-item" data-page="page-profile">
        <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg></span>
        <span class="nav-label">Profile</span>
      </button>
    </nav>

  </div>

  <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/h3-js@3.7.2/dist/h3-js.umd.js"><\/script>
  <script>${getScripts()}</script>
</body>
</html>`;
}
