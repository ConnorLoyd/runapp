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
  <title>Turf</title>
  <style>${getStyles()}</style>
</head>
<body>
  <div id="app">

    <!-- Header -->
    <header class="app-header">
      <div class="logo">TURF</div>
      <div class="header-actions">
        <button class="header-btn" aria-label="Notifications">🔔</button>
        <button class="header-btn" aria-label="Settings" data-page="page-settings">⚙️</button>
      </div>
    </header>

    <!-- Page Container -->
    <div class="page-container">

      <!-- ========== MAP PAGE (HOME) ========== -->
      <div id="page-map" class="page active">
        <div class="map-container">
          <div id="map"></div>

          <!-- Home city prompt (shown when no location data) -->
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
              <span class="value">7</span>
            </div>
            <div class="map-stat">
              <span class="label">Points</span>
              <span class="value amber">1,847</span>
            </div>
            <div class="map-stat">
              <span class="label">Streak</span>
              <span class="value green">5d</span>
            </div>
          </div>

          <!-- Quick action button -->
          <div class="map-quick-actions">
            <button class="quick-btn primary">
              <span class="btn-icon">➕</span>
              <span class="btn-label">Add Runs</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ========== GROUP PAGE ========== -->
      <div id="page-group" class="page page-padded">
        <div class="group-header">
          <div class="group-name">Shadow Runners</div>
          <div class="group-tag">Est. March 2026 · 8 of 15 members</div>
        </div>

        <!-- Stats -->
        <div class="group-stats-row">
          <div class="group-stat-card">
            <div class="stat-value">24</div>
            <div class="stat-label">Zones</div>
          </div>
          <div class="group-stat-card">
            <div class="stat-value amber">1.8K</div>
            <div class="stat-label">Points</div>
          </div>
          <div class="group-stat-card">
            <div class="stat-value green">5d</div>
            <div class="stat-label">Streak</div>
          </div>
          <div class="group-stat-card">
            <div class="stat-value amber">#3</div>
            <div class="stat-label">Rank</div>
          </div>
        </div>

        <!-- Members & Contributions -->
        <div class="section-header">
          <div class="section-title">Members</div>
          <div class="section-badge">8 / 15</div>
        </div>
        <div class="member-list">
          <div class="member-row">
            <div class="member-avatar">A</div>
            <div class="member-info">
              <div class="member-name">Alex <span class="member-role">Leader</span></div>
              <div class="member-detail">
                <span class="member-skill-badge">🔭 Wide Scan 3</span>
              </div>
            </div>
            <div class="member-contrib">
              <div class="contrib-val">+38</div>
              <div class="contrib-lbl">pts</div>
            </div>
            <div class="member-status online"></div>
          </div>
          <div class="member-row">
            <div class="member-avatar">J</div>
            <div class="member-info">
              <div class="member-name">Jordan</div>
              <div class="member-detail">
                <span class="member-skill-badge">💥 Strike Force 2</span>
              </div>
            </div>
            <div class="member-contrib">
              <div class="contrib-val">+29</div>
              <div class="contrib-lbl">pts</div>
            </div>
            <div class="member-status online"></div>
          </div>
          <div class="member-row">
            <div class="member-avatar">S</div>
            <div class="member-info">
              <div class="member-name">Sam</div>
              <div class="member-detail">
                <span class="member-skill-badge">🛡️ Shield 2</span>
              </div>
            </div>
            <div class="member-contrib">
              <div class="contrib-val">+24</div>
              <div class="contrib-lbl">pts</div>
            </div>
            <div class="member-status online"></div>
          </div>
          <div class="member-row">
            <div class="member-avatar">M</div>
            <div class="member-info">
              <div class="member-name">Morgan</div>
              <div class="member-detail">
                <span class="member-skill-badge">🔭 Wide Scan 4</span>
              </div>
            </div>
            <div class="member-contrib">
              <div class="contrib-val">+21</div>
              <div class="contrib-lbl">pts</div>
            </div>
            <div class="member-status offline"></div>
          </div>
          <div class="member-row">
            <div class="member-avatar">R</div>
            <div class="member-info">
              <div class="member-name">Riley</div>
              <div class="member-detail">
                <span class="member-skill-badge">🏃 Trailblazer 1</span>
              </div>
            </div>
            <div class="member-contrib">
              <div class="contrib-val">+12</div>
              <div class="contrib-lbl">pts</div>
            </div>
            <div class="member-status offline"></div>
          </div>
        </div>

        <!-- Raid Voting -->
        <div class="section-header">
          <div class="section-title">Raids</div>
          <div class="section-badge">1 per week</div>
        </div>
        <div class="raid-section">
          <div class="raid-card active-raid">
            <div class="raid-icon-wrap">⚔️</div>
            <div class="raid-info">
              <div class="raid-name">Riverside Loop Takeover</div>
              <div class="raid-meta">
                <span class="raid-status active">Active</span>
                · 3 cells · 18h left
              </div>
              <div class="raid-votes">
                <div class="raid-vote-bar"><div class="raid-vote-fill" style="width:75%"></div></div>
                <span class="raid-vote-text">6/8 voted yes</span>
              </div>
            </div>
          </div>
          <button class="plan-raid-btn" id="propose-raid-btn">⚔️ Propose Raid</button>
        </div>

        <!-- Group Management (collapsible, starts collapsed) -->
        <div class="section-header collapsible collapsed" data-collapse="mgmt-body">
          <div class="section-title">Management</div>
          <span class="collapse-chevron">›</span>
        </div>
        <div id="mgmt-body" class="collapse-body" style="display:none">
          <div class="group-mgmt">
            <button class="mgmt-btn" id="mgmt-invite-btn">
              <span class="mgmt-icon">📨</span>
              <span class="mgmt-text">
                <span class="mgmt-name">Invite Players</span>
                <span class="mgmt-desc">Share invite link or code</span>
              </span>
              <span class="mgmt-arrow">›</span>
            </button>
            <button class="mgmt-btn" id="mgmt-requests-btn">
              <span class="mgmt-icon">📥</span>
              <span class="mgmt-text">
                <span class="mgmt-name">Join Requests</span>
                <span class="mgmt-desc">2 pending requests</span>
              </span>
              <span class="mgmt-badge">2</span>
              <span class="mgmt-arrow">›</span>
            </button>
            <button class="mgmt-btn mgmt-danger" id="mgmt-leave-btn">
              <span class="mgmt-icon">🚪</span>
              <span class="mgmt-text">
                <span class="mgmt-name">Leave Group</span>
                <span class="mgmt-desc">Your points stay with the group</span>
              </span>
              <span class="mgmt-arrow">›</span>
            </button>
          </div>
        </div>

        <!-- Activity Feed (collapsible, starts collapsed) -->
        <div class="section-header collapsible collapsed" data-collapse="activity-body">
          <div class="section-title">Activity</div>
          <div class="section-badge">Today</div>
          <span class="collapse-chevron">›</span>
        </div>
        <div id="activity-body" class="collapse-body" style="display:none">
          <div class="activity-scroll-box">
            <div class="activity-feed">
              <div class="activity-item">
                <div class="activity-icon">⚔️</div>
                <div class="activity-content">
                  <div class="activity-text"><strong>Alex</strong> captured 3 cells near Riverside Loop</div>
                  <div class="activity-time">2 hours ago</div>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-icon">🛡️</div>
                <div class="activity-content">
                  <div class="activity-text"><strong>Jordan</strong> and <strong>Sam</strong> defended Campus North</div>
                  <div class="activity-time">5 hours ago</div>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-icon">🔥</div>
                <div class="activity-content">
                  <div class="activity-text">Group streak extended to <strong>5 days</strong> — bonus active!</div>
                  <div class="activity-time">6 hours ago</div>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-icon">🗺️</div>
                <div class="activity-content">
                  <div class="activity-text"><strong>Morgan</strong> scouted 12 new cells in the park</div>
                  <div class="activity-time">Yesterday</div>
                </div>
              </div>
              <div class="activity-item">
                <div class="activity-icon">👋</div>
                <div class="activity-content">
                  <div class="activity-text"><strong>Riley</strong> joined the group</div>
                  <div class="activity-time">2 days ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Invite Modal -->
        <div id="invite-modal" class="group-modal" style="display:none">
          <div class="group-modal-card">
            <div class="group-modal-header">
              <span>Invite Players</span>
              <button class="modal-close" data-close="invite-modal">&times;</button>
            </div>
            <div class="group-modal-body">
              <div class="invite-code-box">
                <div class="invite-label">Invite Code</div>
                <div class="invite-code" id="invite-code-value">SHADOW-7X2K</div>
                <button class="invite-copy-btn" id="invite-copy-btn">Copy Code</button>
              </div>
              <div class="invite-divider">or</div>
              <button class="invite-share-btn" id="invite-share-btn">Share Invite Link</button>
            </div>
          </div>
        </div>

        <!-- Join Requests Modal -->
        <div id="requests-modal" class="group-modal" style="display:none">
          <div class="group-modal-card">
            <div class="group-modal-header">
              <span>Join Requests</span>
              <button class="modal-close" data-close="requests-modal">&times;</button>
            </div>
            <div class="group-modal-body">
              <div class="join-request-item">
                <div class="jr-avatar">T</div>
                <div class="jr-info">
                  <div class="jr-name">Taylor</div>
                  <div class="jr-detail">Level 4 · 23 runs · 156 pts</div>
                </div>
                <div class="jr-actions">
                  <button class="jr-btn accept">Accept</button>
                  <button class="jr-btn deny">Deny</button>
                </div>
              </div>
              <div class="join-request-item">
                <div class="jr-avatar">C</div>
                <div class="jr-info">
                  <div class="jr-name">Casey</div>
                  <div class="jr-detail">Level 2 · 8 runs · 42 pts</div>
                </div>
                <div class="jr-actions">
                  <button class="jr-btn accept">Accept</button>
                  <button class="jr-btn deny">Deny</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Leave Confirmation Modal -->
        <div id="leave-modal" class="group-modal" style="display:none">
          <div class="group-modal-card">
            <div class="group-modal-header">
              <span>Leave Group</span>
              <button class="modal-close" data-close="leave-modal">&times;</button>
            </div>
            <div class="group-modal-body">
              <p class="leave-warning">Are you sure you want to leave <strong>Shadow Runners</strong>?</p>
              <p class="leave-note">Your contributed points stay with the group. You can rejoin later if accepted.</p>
              <div class="leave-actions">
                <button class="leave-btn cancel" data-close="leave-modal">Cancel</button>
                <button class="leave-btn danger" id="leave-confirm-btn">Leave Group</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== SKILLS PAGE ========== -->
      <div id="page-skills" class="page page-padded">
        <div class="sp-bar">
          <div class="sp-label">Skill Points</div>
          <div class="sp-value"><span id="sp-amount">142</span> SP</div>
        </div>

        <div class="skill-tabs">
          <button class="skill-tab active" data-skill-tab="solo">Solo</button>
          <button class="skill-tab amber-tab" data-skill-tab="double">Double</button>
          <button class="skill-tab amber-tab" data-skill-tab="group">Group</button>
        </div>

        <!-- Solo Skills -->
        <div id="skills-solo" class="skill-panel active">
          <div class="skill-list">
            <div class="skill-card equipped" data-skill="wide-scan" data-level="3" data-type="solo">
              <div class="skill-top">
                <div class="skill-icon">🔭</div>
                <div class="skill-name">Wide Scan</div>
                <span class="equipped-badge">Equipped</span>
              </div>
              <div class="skill-desc">Reveals adjacent H3 cells as you run, expanding fog reveal beyond just the cells you pass through.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip filled"></div>
                  <div class="skill-level-pip filled"></div>
                  <div class="skill-level-pip filled"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 3</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="30">⬆ 30 SP</button>
                </div>
              </div>
            </div>

            <div class="skill-card" data-skill="strike-force" data-level="2" data-type="solo">
              <div class="skill-top">
                <div class="skill-icon">💥</div>
                <div class="skill-name">Strike Force</div>
              </div>
              <div class="skill-desc">Your points count for more in enemy-owned cells. Attack bonus doesn't boost friendly territory.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip filled"></div>
                  <div class="skill-level-pip filled"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 2</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="25">⬆ 25 SP</button>
                </div>
              </div>
            </div>

            <div class="skill-card" data-skill="shield" data-level="1" data-type="solo">
              <div class="skill-top">
                <div class="skill-icon">🛡️</div>
                <div class="skill-name">Shield</div>
              </div>
              <div class="skill-desc">Solo runs in friendly-owned cells add bonus defense points, reinforcing your group's territory.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip filled"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 1</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="15">⬆ 15 SP</button>
                </div>
              </div>
            </div>

            <div class="skill-card" data-skill="trailblazer" data-level="0" data-type="solo">
              <div class="skill-top">
                <div class="skill-icon">🏃</div>
                <div class="skill-name">Trailblazer</div>
              </div>
              <div class="skill-desc">Earn bonus SP when running through unclaimed or newly discovered cells.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 0</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="10">⬆ 10 SP</button>
                </div>
              </div>
            </div>

            <div class="skill-card" data-skill="ghost-run" data-level="0" data-type="solo">
              <div class="skill-top">
                <div class="skill-icon">👻</div>
                <div class="skill-name">Ghost Run</div>
              </div>
              <div class="skill-desc">Enemy groups don't receive notifications when you enter their territory. Stealth operations.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 0</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="10">⬆ 10 SP</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Double Skills -->
        <div id="skills-double" class="skill-panel">
          <div class="skill-list">
            <div class="skill-card equipped" data-skill="recon-sweep" data-level="2" data-type="double">
              <div class="skill-top">
                <div class="skill-icon">📡</div>
                <div class="skill-name">Recon Sweep</div>
                <span class="equipped-badge">Equipped</span>
              </div>
              <div class="skill-desc">Both runners reveal adjacent cells with expanded fog reveal. Stacking for massive area coverage.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip filled amber"></div>
                  <div class="skill-level-pip filled amber"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 2</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="25">⬆ 25 SP</button>
                </div>
              </div>
            </div>

            <div class="skill-card" data-skill="combined-arms" data-level="1" data-type="double">
              <div class="skill-top">
                <div class="skill-icon">⚔️</div>
                <div class="skill-name">Combined Arms</div>
              </div>
              <div class="skill-desc">Both runners earn bonus attack points in enemy territory. Devastating in coordinated strikes.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip filled amber"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 1</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="15">⬆ 15 SP</button>
                </div>
              </div>
            </div>

            <div class="skill-card" data-skill="fortify-pair" data-level="0" data-type="double">
              <div class="skill-top">
                <div class="skill-icon">🏰</div>
                <div class="skill-name">Fortify Pair</div>
              </div>
              <div class="skill-desc">Friendly cells gain a temporary defense shield lasting after the run ends.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 0</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="10">⬆ 10 SP</button>
                </div>
              </div>
            </div>

            <div class="skill-card" data-skill="sync-bonus" data-level="0" data-type="double">
              <div class="skill-top">
                <div class="skill-icon">🔗</div>
                <div class="skill-name">Sync Bonus</div>
              </div>
              <div class="skill-desc">Both runners earn bonus SP, rewarding paired running and coordination.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 0</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="10">⬆ 10 SP</button>
                </div>
              </div>
            </div>

            <div class="skill-card" data-skill="lockdown" data-level="0" data-type="double">
              <div class="skill-top">
                <div class="skill-icon">🔒</div>
                <div class="skill-name">Lockdown</div>
              </div>
              <div class="skill-desc">When a cell is captured by the pair, it gets bonus points automatically. Instant fortification.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 0</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="10">⬆ 10 SP</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Group Skills -->
        <div id="skills-group" class="skill-panel">
          <div class="skill-list">
            <div class="skill-card equipped" data-skill="war-march" data-level="4" data-type="group">
              <div class="skill-top">
                <div class="skill-icon">🚩</div>
                <div class="skill-name">War March</div>
                <span class="equipped-badge">Equipped</span>
              </div>
              <div class="skill-desc">All group members earn bonus points per cell. The most powerful raw point boost in the game.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip filled amber"></div>
                  <div class="skill-level-pip filled amber"></div>
                  <div class="skill-level-pip filled amber"></div>
                  <div class="skill-level-pip filled amber"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 4</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="40">⬆ 40 SP</button>
                </div>
              </div>
            </div>

            <div class="skill-card" data-skill="iron-curtain" data-level="1" data-type="group">
              <div class="skill-top">
                <div class="skill-icon">🧱</div>
                <div class="skill-name">Iron Curtain</div>
              </div>
              <div class="skill-desc">Cells you pass through become significantly harder to flip for a duration. Territorial lockdown.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip filled amber"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 1</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="20">⬆ 20 SP</button>
                </div>
              </div>
            </div>

            <div class="skill-card" data-skill="rally-cry" data-level="0" data-type="group">
              <div class="skill-top">
                <div class="skill-icon">📢</div>
                <div class="skill-name">Rally Cry</div>
              </div>
              <div class="skill-desc">Streak bonus growth is amplified for the group. Rewards consistency and coordination.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 0</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="10">⬆ 10 SP</button>
                </div>
              </div>
            </div>

            <div class="skill-card" data-skill="bounty-hunt" data-level="0" data-type="group">
              <div class="skill-top">
                <div class="skill-icon">💰</div>
                <div class="skill-name">Bounty Hunt</div>
              </div>
              <div class="skill-desc">All group members earn bonus SP. Best SP farming method in the game.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 0</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="10">⬆ 10 SP</button>
                </div>
              </div>
            </div>

            <div class="skill-card" data-skill="siege-engine" data-level="0" data-type="group">
              <div class="skill-top">
                <div class="skill-icon">🏗️</div>
                <div class="skill-name">Siege Engine</div>
              </div>
              <div class="skill-desc">During raids, your group's attack multiplier is amplified. Only active during raid windows.</div>
              <div class="skill-bottom">
                <div class="skill-level-bar">
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <div class="skill-level-pip"></div>
                  <span class="skill-level-label">Lv 0</span>
                </div>
                <div class="skill-actions">
                  <button class="skill-lvl-btn" data-cost="10">⬆ 10 SP</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== LEADERBOARD PAGE ========== -->
      <div id="page-leaderboard" class="page page-padded">
        <!-- Combined filter bar: scope selector + type toggle -->
        <div class="lb-filter-bar">
          <div class="lb-scope-select" id="lb-scope-toggle">
            <button class="lb-scope-btn active" data-scope="local">📍 Local</button>
            <button class="lb-scope-btn" data-scope="global">🌍 Global</button>
          </div>
          <div class="lb-type-pills" id="lb-type-toggle">
            <button class="lb-type-pill active" data-type="groups">Groups</button>
            <button class="lb-type-pill" data-type="individuals">Players</button>
          </div>
        </div>

        <!-- Local Groups -->
        <div id="lb-local-groups" class="lb-panel active">
          <div class="lb-list">
            <div class="lb-row">
              <div class="lb-rank">1</div>
              <div class="lb-avatar group-avatar">PR</div>
              <div class="lb-info">
                <div class="lb-name">Pavement Rippers</div>
                <div class="lb-sub">12 members · 8d streak</div>
              </div>
              <div>
                <div class="lb-score">48</div>
                <div class="lb-score-label">cells</div>
              </div>
            </div>
            <div class="lb-row">
              <div class="lb-rank">2</div>
              <div class="lb-avatar group-avatar">NR</div>
              <div class="lb-info">
                <div class="lb-name">Night Runners</div>
                <div class="lb-sub">9 members · 3d streak</div>
              </div>
              <div>
                <div class="lb-score">35</div>
                <div class="lb-score-label">cells</div>
              </div>
            </div>
            <div class="lb-row highlight">
              <div class="lb-rank">3</div>
              <div class="lb-avatar group-avatar">SR</div>
              <div class="lb-info">
                <div class="lb-name">Shadow Runners</div>
                <div class="lb-sub">8 members · 5d streak</div>
              </div>
              <div>
                <div class="lb-score">24</div>
                <div class="lb-score-label">cells</div>
              </div>
            </div>
            <div class="lb-row">
              <div class="lb-rank">4</div>
              <div class="lb-avatar group-avatar">TC</div>
              <div class="lb-info">
                <div class="lb-name">Trail Crushers</div>
                <div class="lb-sub">6 members · 1d streak</div>
              </div>
              <div>
                <div class="lb-score">18</div>
                <div class="lb-score-label">cells</div>
              </div>
            </div>
            <div class="lb-row">
              <div class="lb-rank">5</div>
              <div class="lb-avatar group-avatar">DM</div>
              <div class="lb-info">
                <div class="lb-name">Dawn Militia</div>
                <div class="lb-sub">4 members · 0d streak</div>
              </div>
              <div>
                <div class="lb-score">11</div>
                <div class="lb-score-label">cells</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Local Individuals -->
        <div id="lb-local-individuals" class="lb-panel">
          <div class="lb-list">
            <div class="lb-row">
              <div class="lb-rank">1</div>
              <div class="lb-avatar">K</div>
              <div class="lb-info">
                <div class="lb-name">Kai</div>
                <div class="lb-sub">Pavement Rippers · Scout</div>
              </div>
              <div>
                <div class="lb-score">312</div>
                <div class="lb-score-label">SP</div>
              </div>
            </div>
            <div class="lb-row">
              <div class="lb-rank">2</div>
              <div class="lb-avatar">E</div>
              <div class="lb-info">
                <div class="lb-name">Elara</div>
                <div class="lb-sub">Night Runners · Strike Force</div>
              </div>
              <div>
                <div class="lb-score">278</div>
                <div class="lb-score-label">SP</div>
              </div>
            </div>
            <div class="lb-row highlight">
              <div class="lb-rank">3</div>
              <div class="lb-avatar">A</div>
              <div class="lb-info">
                <div class="lb-name">Alex</div>
                <div class="lb-sub">Shadow Runners · Wide Scan</div>
              </div>
              <div>
                <div class="lb-score">245</div>
                <div class="lb-score-label">SP</div>
              </div>
            </div>
            <div class="lb-row">
              <div class="lb-rank">4</div>
              <div class="lb-avatar">T</div>
              <div class="lb-info">
                <div class="lb-name">Thane</div>
                <div class="lb-sub">Trail Crushers · Trailblazer</div>
              </div>
              <div>
                <div class="lb-score">201</div>
                <div class="lb-score-label">SP</div>
              </div>
            </div>
            <div class="lb-row">
              <div class="lb-rank">5</div>
              <div class="lb-avatar">J</div>
              <div class="lb-info">
                <div class="lb-name">Jordan</div>
                <div class="lb-sub">Shadow Runners · Strike Force</div>
              </div>
              <div>
                <div class="lb-score">189</div>
                <div class="lb-score-label">SP</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Global Groups -->
        <div id="lb-global-groups" class="lb-panel">
          <div class="lb-list">
            <div class="lb-row">
              <div class="lb-rank">1</div>
              <div class="lb-avatar group-avatar">VR</div>
              <div class="lb-info">
                <div class="lb-name">Velocity Reapers</div>
                <div class="lb-sub">15 members · 21d streak</div>
              </div>
              <div>
                <div class="lb-score">340</div>
                <div class="lb-score-label">cells</div>
              </div>
            </div>
            <div class="lb-row">
              <div class="lb-rank">2</div>
              <div class="lb-avatar group-avatar">SF</div>
              <div class="lb-info">
                <div class="lb-name">Stride Force</div>
                <div class="lb-sub">14 members · 15d streak</div>
              </div>
              <div>
                <div class="lb-score">298</div>
                <div class="lb-score-label">cells</div>
              </div>
            </div>
            <div class="lb-row">
              <div class="lb-rank">3</div>
              <div class="lb-avatar group-avatar">PR</div>
              <div class="lb-info">
                <div class="lb-name">Pavement Rippers</div>
                <div class="lb-sub">12 members · 8d streak</div>
              </div>
              <div>
                <div class="lb-score">251</div>
                <div class="lb-score-label">cells</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Global Individuals -->
        <div id="lb-global-individuals" class="lb-panel">
          <div class="lb-list">
            <div class="lb-row">
              <div class="lb-rank">1</div>
              <div class="lb-avatar">Z</div>
              <div class="lb-info">
                <div class="lb-name">Zephyr</div>
                <div class="lb-sub">Velocity Reapers · War March</div>
              </div>
              <div>
                <div class="lb-score">1,420</div>
                <div class="lb-score-label">SP</div>
              </div>
            </div>
            <div class="lb-row">
              <div class="lb-rank">2</div>
              <div class="lb-avatar">N</div>
              <div class="lb-info">
                <div class="lb-name">Nova</div>
                <div class="lb-sub">Stride Force · Ghost Run</div>
              </div>
              <div>
                <div class="lb-score">1,205</div>
                <div class="lb-score-label">SP</div>
              </div>
            </div>
            <div class="lb-row">
              <div class="lb-rank">3</div>
              <div class="lb-avatar">K</div>
              <div class="lb-info">
                <div class="lb-name">Kai</div>
                <div class="lb-sub">Pavement Rippers · Scout</div>
              </div>
              <div>
                <div class="lb-score">1,108</div>
                <div class="lb-score-label">SP</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== PROFILE PAGE ========== -->
      <div id="page-profile" class="page page-padded">
        <div class="profile-card">
          <div class="profile-avatar">🏃</div>
          <div class="profile-name">Alex</div>
          <div class="profile-group">Shadow Runners</div>
          <div class="profile-joined">Joined March 2026</div>
        </div>

        <!-- Equipped Skills -->
        <div class="section-header" style="margin-bottom: 10px;">
          <div class="section-title">Equipped Skills</div>
        </div>
        <div class="equipped-skills">
          <div class="equipped-skill">
            <div class="eq-type solo">Solo</div>
            <div class="eq-icon">🔭</div>
            <div class="eq-name">Wide Scan</div>
            <div class="eq-level">Level 3</div>
          </div>
          <div class="equipped-skill">
            <div class="eq-type double">Double</div>
            <div class="eq-icon">📡</div>
            <div class="eq-name">Recon Sweep</div>
            <div class="eq-level">Level 2</div>
          </div>
          <div class="equipped-skill">
            <div class="eq-type group">Group</div>
            <div class="eq-icon">🚩</div>
            <div class="eq-name">War March</div>
            <div class="eq-level">Level 4</div>
          </div>
        </div>

        <!-- XP Bar -->
        <div class="xp-bar-section">
          <div class="xp-header">
            <span class="xp-level">Level 7</span>
            <span class="xp-amount">1,420 / 2,000 SP earned</span>
          </div>
          <div class="xp-track">
            <div class="xp-fill" style="width: 71%"></div>
          </div>
        </div>

        <!-- Streak -->
        <div class="streak-card">
          <div class="streak-fire">🔥</div>
          <div class="streak-info">
            <div class="streak-count">5 Day Streak</div>
            <div class="streak-label">Group streak active</div>
            <div class="streak-bonus">+8 bonus points per zone</div>
          </div>
        </div>

        <!-- Stats -->
        <div class="section-header" style="margin-bottom: 10px;">
          <div class="section-title">Stats</div>
        </div>
        <div class="profile-stats-grid">
          <div class="p-stat">
            <div class="p-num">47</div>
            <div class="p-label">Runs</div>
          </div>
          <div class="p-stat">
            <div class="p-num">142</div>
            <div class="p-label">SP Earned</div>
          </div>
          <div class="p-stat">
            <div class="p-num">89 km</div>
            <div class="p-label">Distance</div>
          </div>
          <div class="p-stat">
            <div class="p-num">24</div>
            <div class="p-label">Captures</div>
          </div>
          <div class="p-stat">
            <div class="p-num">156</div>
            <div class="p-label">Cells Run</div>
          </div>
          <div class="p-stat">
            <div class="p-num">3</div>
            <div class="p-label">Raids</div>
          </div>
        </div>

        <!-- Run History -->
        <div class="section-header" style="margin-bottom: 10px;">
          <div class="section-title">Recent Runs</div>
        </div>
        <div class="run-history">
          <div class="run-entry">
            <div class="run-type-icon solo">🏃</div>
            <div class="run-info">
              <div class="run-title">Morning Scout</div>
              <div class="run-detail">Solo · 5.2 km · 12 cells · 28 min</div>
            </div>
            <div class="run-points">
              <div class="pts">+12</div>
              <div class="pts-label">pts</div>
            </div>
          </div>
          <div class="run-entry">
            <div class="run-type-icon double">👥</div>
            <div class="run-info">
              <div class="run-title">Campus Defense</div>
              <div class="run-detail">Double w/ Jordan · 3.8 km · 8 cells</div>
            </div>
            <div class="run-points">
              <div class="pts">+8</div>
              <div class="pts-label">pts</div>
            </div>
          </div>
          <div class="run-entry">
            <div class="run-type-icon group">⚑</div>
            <div class="run-info">
              <div class="run-title">Saturday Raid Run</div>
              <div class="run-detail">Group (5) · 8.1 km · 18 cells</div>
            </div>
            <div class="run-points">
              <div class="pts">+18</div>
              <div class="pts-label">pts</div>
            </div>
          </div>
          <div class="run-entry">
            <div class="run-type-icon solo">🏃</div>
            <div class="run-info">
              <div class="run-title">Riverside Recon</div>
              <div class="run-detail">Solo · 6.4 km · 15 cells · 35 min</div>
            </div>
            <div class="run-points">
              <div class="pts">+15</div>
              <div class="pts-label">pts</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== SETTINGS PAGE ========== -->
      <div id="page-settings" class="page page-padded">
        <div class="section-header" style="margin-bottom: 10px;">
          <div class="section-title">Account</div>
        </div>
        <div class="settings-group">
          <div class="settings-item">
            <div class="settings-left">
              <div class="settings-icon">🔗</div>
              <div class="settings-text">
                <div class="settings-name">Strava Account</div>
                <div class="settings-desc">Connected as @alex_runs</div>
              </div>
            </div>
            <div class="settings-arrow">›</div>
          </div>
          <div class="settings-item">
            <div class="settings-left">
              <div class="settings-icon">👤</div>
              <div class="settings-text">
                <div class="settings-name">Display Name</div>
                <div class="settings-desc">Alex</div>
              </div>
            </div>
            <div class="settings-arrow">›</div>
          </div>
        </div>

        <div class="section-header" style="margin-bottom: 10px;">
          <div class="section-title">Privacy</div>
        </div>
        <div class="settings-group">
          <div class="settings-item">
            <div class="settings-left">
              <div class="settings-icon">🏠</div>
              <div class="settings-text">
                <div class="settings-name">Privacy Zone</div>
                <div class="settings-desc">200m radius around home</div>
              </div>
            </div>
            <div class="settings-arrow">›</div>
          </div>
          <div class="settings-item">
            <div class="settings-left">
              <div class="settings-icon">🚫</div>
              <div class="settings-text">
                <div class="settings-name">Block List</div>
                <div class="settings-desc">0 blocked users</div>
              </div>
            </div>
            <div class="settings-arrow">›</div>
          </div>
        </div>

        <div class="section-header" style="margin-bottom: 10px;">
          <div class="section-title">Notifications</div>
        </div>
        <div class="settings-group">
          <div class="settings-item">
            <div class="settings-left">
              <div class="settings-icon">📊</div>
              <div class="settings-text">
                <div class="settings-name">Run Results</div>
                <div class="settings-desc">Summary after each run</div>
              </div>
            </div>
            <div class="settings-arrow">›</div>
          </div>
          <div class="settings-item">
            <div class="settings-left">
              <div class="settings-icon">⚔️</div>
              <div class="settings-text">
                <div class="settings-name">Raid Alerts</div>
                <div class="settings-desc">When territory is targeted</div>
              </div>
            </div>
            <div class="settings-arrow">›</div>
          </div>
          <div class="settings-item">
            <div class="settings-left">
              <div class="settings-icon">📰</div>
              <div class="settings-text">
                <div class="settings-name">Group News</div>
                <div class="settings-desc">Territory changes, member updates</div>
              </div>
            </div>
            <div class="settings-arrow">›</div>
          </div>
        </div>
      </div>

    </div>

    <!-- Raid Map Overlay -->
    <div id="raid-map-overlay" class="raid-overlay" style="display:none">
      <div class="raid-overlay-header">
        <div class="raid-overlay-title">Select Raid Targets</div>
        <div class="raid-overlay-sub">Tap enemy hexes to target (max 5)</div>
      </div>
      <div id="raid-map" class="raid-map-container"></div>
      <div class="raid-overlay-footer">
        <div class="raid-selection-info">
          <span id="raid-hex-count">0</span> / 5 hexes selected
        </div>
        <div class="raid-overlay-actions">
          <button id="raid-cancel-btn" class="raid-action-btn cancel">Cancel</button>
          <button id="raid-confirm-btn" class="raid-action-btn confirm" disabled>Propose Raid</button>
        </div>
      </div>
    </div>

    <!-- Add Run Map Overlay -->
    <div id="run-map-overlay" class="raid-overlay" style="display:none">
      <div class="raid-overlay-header">
        <div class="raid-overlay-title">Add Run</div>
        <div class="raid-overlay-sub">Tap hexes you ran through</div>
      </div>
      <div id="run-map" class="raid-map-container"></div>
      <div class="raid-overlay-footer">
        <div class="run-type-selector">
          <button class="run-type-btn active" data-run-type="solo">🏃 Solo</button>
          <button class="run-type-btn" data-run-type="double">👥 Double</button>
          <button class="run-type-btn" data-run-type="group">⚑ Group</button>
        </div>
        <div class="raid-selection-info">
          <span id="run-hex-count">0</span> hexes · ~<span id="run-distance">0.0</span> mi
        </div>
        <div class="raid-overlay-actions">
          <button id="run-cancel-btn" class="raid-action-btn cancel">Cancel</button>
          <button id="run-submit-btn" class="raid-action-btn confirm" disabled>Submit Run</button>
        </div>
      </div>
    </div>

    <!-- Run Result Modal -->
    <div id="run-result-modal" class="group-modal" style="display:none">
      <div class="group-modal-card">
        <div class="group-modal-header">
          <span>Run Complete!</span>
          <button class="modal-close" data-close="run-result-modal">&times;</button>
        </div>
        <div class="group-modal-body" id="run-result-body">
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
      <button class="nav-item active" data-page="page-map">
        <span class="nav-icon">⬡</span>
        <span class="nav-label">Map</span>
      </button>
      <button class="nav-item" data-page="page-group">
        <span class="nav-icon">⚑</span>
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
