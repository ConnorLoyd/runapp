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
              <span>◉</span> Profile
            </button>
            <button class="profile-dropdown-item" data-page="page-settings">
              <span>⚙️</span> Settings
            </button>
            <div class="profile-dropdown-divider"></div>
            <button class="profile-dropdown-item profile-dropdown-danger" id="dropdown-logout-btn">
              <span>🚪</span> Sign Out
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
              <div class="home-city-icon">📍</div>
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
            <div class="map-stat">
              <span class="label">Held</span>
              <span class="value" id="stat-held">0</span>
            </div>
            <div class="map-stat">
              <span class="label">RP</span>
              <span class="value amber" id="stat-rp">0</span>
            </div>
          </div>

          <!-- Map controls -->
          <div class="map-controls">
            <button class="map-ctrl-btn" id="map-recenter-btn" title="My Location">
              <span>📍</span>
            </button>
            <button class="map-ctrl-btn" id="map-search-btn" title="Search">
              <span>🔍</span>
            </button>
          </div>

          <!-- Map search bar -->
          <div id="map-search-bar" class="map-search-bar" style="display:none;">
            <input type="text" id="map-search-input" class="map-search-input" placeholder="Search city or address..." autocomplete="off" />
            <button id="map-search-go" class="map-search-go">Go</button>
            <button id="map-search-close" class="map-search-close">&times;</button>
            <div id="map-search-suggestions" class="map-search-suggestions" style="display:none;"></div>
          </div>

          <!-- Quick action button -->
          <div class="map-quick-actions">
            <button class="quick-btn primary" id="add-run-btn">
              <span class="btn-icon">➕</span>
              <span class="btn-label">Add Run</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ========== GROUP PAGE ========== -->
      <div id="page-group" class="page page-padded">
        <!-- No group state -->
        <div id="no-group" style="display:none">
          <div class="empty-state">
            <div class="empty-icon">⚑</div>
            <h3>No Group</h3>
            <p>Create a group or join one with an invite code.</p>
            <div class="empty-actions">
              <button class="btn-primary" id="create-group-btn">Create Group</button>
              <button class="btn-secondary" id="join-group-btn">Join Group</button>
            </div>
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
              <span class="mgmt-icon">🎨</span>
              <span class="mgmt-text">
                <span class="mgmt-name">Group Color</span>
                <span class="mgmt-desc">Change territory color</span>
              </span>
              <input type="color" id="group-color-picker" class="color-picker" />
              <span class="mgmt-arrow">›</span>
            </button>
            <button class="mgmt-btn" id="mgmt-invite-btn">
              <span class="mgmt-icon">📨</span>
              <span class="mgmt-text">
                <span class="mgmt-name">Invite Players</span>
                <span class="mgmt-desc">Share invite code</span>
              </span>
              <span class="mgmt-arrow">›</span>
            </button>
            <button class="mgmt-btn mgmt-danger" id="mgmt-leave-btn">
              <span class="mgmt-icon">🚪</span>
              <span class="mgmt-text">
                <span class="mgmt-name">Leave Group</span>
                <span class="mgmt-desc">Your RP stays with the group</span>
              </span>
              <span class="mgmt-arrow">›</span>
            </button>            <button class="mgmt-btn mgmt-danger" id="mgmt-delete-btn" style="display:none">
              <span class="mgmt-icon">💀</span>
              <span class="mgmt-text">
                <span class="mgmt-name">Delete Group</span>
                <span class="mgmt-desc">All territory and RP are lost forever</span>
              </span>
              <span class="mgmt-arrow">›</span>
            </button>          </div>
        </div>

        <!-- Invite Modal -->
        <div id="invite-modal" class="modal-overlay" style="display:none">
          <div class="modal-card">
            <div class="modal-header">
              <span>Invite Players</span>
              <button class="modal-close" data-close="invite-modal">&times;</button>
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
              <button class="modal-close" data-close="create-group-modal">&times;</button>
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
              <button class="modal-close" data-close="join-group-modal">&times;</button>
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
              <button class="modal-close" data-close="leave-modal">&times;</button>
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
              <button class="modal-close" data-close="delete-group-modal">&times;</button>
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
          <div class="profile-avatar" id="profile-avatar">🏃</div>
          <div class="profile-name" id="profile-name"></div>
          <div class="profile-group" id="profile-group"></div>
        </div>

        <!-- Equipped Skill -->
        <div class="section-header"><div class="section-title">Equipped Skill</div></div>
        <div class="equipped-skill-card" id="equipped-skill-card">
          <span class="eq-icon" id="eq-icon">—</span>
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
      </div>

      <!-- ========== SETTINGS PAGE ========== -->
      <div id="page-settings" class="page page-padded">
        <div class="section-header"><div class="section-title">Account</div></div>
        <div class="settings-group">
          <div class="settings-item">
            <div class="settings-left">
              <div class="settings-icon">🔗</div>
              <div class="settings-text">
                <div class="settings-name">Strava Account</div>
                <div class="settings-desc" id="settings-strava">Linked</div>
              </div>
            </div>
          </div>
          <div class="settings-item settings-item-btn" id="strava-disconnect-btn">
            <div class="settings-left">
              <div class="settings-icon">⛓️‍💥</div>
              <div class="settings-text">
                <div class="settings-name settings-danger">Disconnect Strava</div>
                <div class="settings-desc">Removes Strava data. Game progress is kept.</div>
              </div>
            </div>
          </div>
          <div class="settings-item">
            <div class="settings-left">
              <div class="settings-icon">🎨</div>
              <div class="settings-text">
                <div class="settings-name">Territory Color</div>
                <div class="settings-desc" id="settings-color">—</div>
              </div>
            </div>
            <input type="color" id="user-color-picker" class="color-picker" />
          </div>
        </div>
        <div class="section-header" style="margin-top:16px"><div class="section-title">Session</div></div>
        <div class="settings-group">
          <div class="settings-item settings-item-btn" id="logout-btn">
            <div class="settings-left">
              <div class="settings-icon">🚪</div>
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
          <button class="modal-close" data-close="run-result-modal">&times;</button>
        </div>
        <div class="modal-body" id="run-result-body"></div>
      </div>
    </div>

    <!-- Dev Tools Panel (localhost only) -->
    <div id="dev-panel" class="dev-panel" style="display:none">
      <button class="dev-toggle" id="dev-toggle-btn">🛠</button>
      <div class="dev-drawer" id="dev-drawer" style="display:none">
        <div class="dev-drawer-header">
          <span>Dev Tools</span>
          <button class="dev-drawer-close" id="dev-drawer-close">&times;</button>
        </div>
        <div class="dev-section">
          <div class="dev-section-title">RP</div>
          <div class="dev-row">
            <input type="number" id="dev-rp-amount" class="dev-input" value="100" min="1" max="10000" />
            <button class="dev-btn" id="dev-give-rp-btn">Give RP</button>
          </div>
        </div>
        <div class="dev-section">
          <div class="dev-section-title">Territory</div>
          <button class="dev-btn full" id="dev-seed-btn">Seed Territory at GPS</button>
        </div>
        <div class="dev-section">
          <div class="dev-section-title">Database</div>
          <button class="dev-btn danger full" id="dev-reset-btn">Reset Territory + Runs</button>
        </div>
        <div class="dev-log" id="dev-log"></div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav" id="bottom-nav" style="display:none">
      <button class="nav-item active" data-page="page-map">
        <span class="nav-icon">⬡</span>
        <span class="nav-label">Map</span>
      </button>
      <button class="nav-item" data-page="page-group">
        <span class="nav-icon">👥</span>
        <span class="nav-label">Group</span>
      </button>
      <button class="nav-item" data-page="page-skills">
        <span class="nav-icon">⚡</span>
        <span class="nav-label">Skills</span>
      </button>
      <button class="nav-item" data-page="page-leaderboard">
        <span class="nav-icon">🏆</span>
        <span class="nav-label">Ranks</span>
      </button>
      <button class="nav-item" data-page="page-profile">
        <span class="nav-icon">◉</span>
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
