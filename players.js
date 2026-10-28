/* ═══════════════════════════════════════════════
   RODRIGO — Players Development Section
   JavaScript Controller
   ═══════════════════════════════════════════════ */

const PLAYERS_FIREBASE_PATH = "rodrigo_players";

// ── State ──
let PLAYERS = [];
let playerDevModalOpen = false;

// ── DOM References ──
const playersGrid         = document.getElementById("playersGrid");
const noPlayersEl         = document.getElementById("noPlayers");
const playerDevModalOverlay = document.getElementById("playerDevModalOverlay");

// ── Load & Subscribe to Players from Firebase ──
function setupPlayersSync() {
  if (typeof firebase === "undefined" || !firebaseDb) {
    // Firebase not available — show empty state
    renderPlayers([]);
    return;
  }

  const ref = firebaseDb.ref(PLAYERS_FIREBASE_PATH);
  ref.on("value", (snapshot) => {
    const val = snapshot.val();
    let list = [];
    if (val) {
      if (Array.isArray(val)) {
        list = val.filter(p => p && p.name);
      } else if (typeof val === "object") {
        list = Object.values(val).filter(p => p && p.name);
      }
    }
    list.sort((a, b) => (Number(b.overall) || 0) - (Number(a.overall) || 0));
    PLAYERS = list;
    renderPlayers(PLAYERS);
  }, (err) => {
    console.warn("Players Firebase error:", err);
    renderPlayers([]);
  });
}

// ── Render Players Grid ──
function renderPlayers(list) {
  if (!playersGrid) return;

  playersGrid.innerHTML = "";

  if (!list || list.length === 0) {
    if (noPlayersEl) noPlayersEl.classList.add("visible");
    playersGrid.style.display = "none";
    return;
  }

  if (noPlayersEl) noPlayersEl.classList.remove("visible");
  playersGrid.style.display = "grid";

  list.forEach((player, i) => {
    const card = createPlayerCard(player, i);
    playersGrid.appendChild(card);
  });
}

// ── Create Single Player Card ──
function createPlayerCard(player, delay = 0) {
  const card = document.createElement("div");
  card.className = "player-card";
  card.style.animationDelay = `${delay * 0.08}s`;
  card.dataset.playerId = player.id;

  // Build quick stats from basicSkills count
  const basicSkillsCount = (player.basicSkills || []).length;
  const extraSkillsCount = (player.additionalSkills || []).length;
  const devsCount        = (player.developments || []).length;

  const imgHTML = player.image
    ? `<img src="${player.image}" alt="${escapeHtml(player.name)}" loading="lazy">`
    : `<div class="player-card-img-placeholder">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
        <span>لا توجد صورة</span>
      </div>`;

  // Position tag (optional)
  const positionHTML = player.position
    ? `<span class="player-position-tag">${escapeHtml(player.position)}</span>`
    : "";

  // Update label (optional)
  const updateHTML = player.updateLabel
    ? `<span class="player-update-tag">✦ ${escapeHtml(player.updateLabel)}</span>`
    : "";

  card.innerHTML = `
    <div class="player-card-img-wrap">
      ${imgHTML}
      ${player.overall ? `<div class="player-overall-badge">${player.overall}</div>` : ""}
    </div>
    <div class="player-card-body">
      <div class="player-name">${escapeHtml(player.name)}</div>
      <div class="player-position-row">
        ${positionHTML}
        ${updateHTML}
      </div>
      <div class="player-quick-stats">
        <div class="player-quick-stat">
          <span class="player-quick-stat-val">${player.overall || "—"}</span>
          <span class="player-quick-stat-label">OVR</span>
        </div>
        <div class="player-quick-stat">
          <span class="player-quick-stat-val">${basicSkillsCount || "—"}</span>
          <span class="player-quick-stat-label">مهارات</span>
        </div>
        <div class="player-quick-stat">
          <span class="player-quick-stat-val">${devsCount || "—"}</span>
          <span class="player-quick-stat-label">تطويرات</span>
        </div>
      </div>
      <button class="player-view-btn" onclick="openPlayerDevModal(${player.id})">
        <span>عرض التطوير</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </button>
    </div>
  `;

  return card;
}

// ── Open Player Development Modal ──
window.openPlayerDevModal = function(playerId) {
  const player = PLAYERS.find(p => p.id === playerId);
  if (!player) return;

  renderPlayerDevModal(player);

  if (playerDevModalOverlay) {
    playerDevModalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    playerDevModalOpen = true;
  }
};

// ── Render Modal Content ──
function renderPlayerDevModal(player) {
  const modal = document.getElementById("playerDevModal");
  if (!modal) return;

  const imgHTML = player.image
    ? `<img src="${player.image}" alt="${escapeHtml(player.name)}">`
    : `<div class="player-card-img-placeholder"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg></div>`;

  // Developments
  const developments = player.developments || [];
  const devsHTML = developments.length > 0
    ? developments.map(d => `
        <div class="pdm-dev-item">
          <div class="pdm-dev-icon">${d.icon || "⚡"}</div>
          <div class="pdm-dev-text">
            <div class="pdm-dev-title">${escapeHtml(d.title || "")}</div>
            ${d.desc ? `<div class="pdm-dev-desc">${escapeHtml(d.desc)}</div>` : ""}
          </div>
        </div>`).join("")
    : `<p style="color:var(--text-tertiary);font-size:0.85rem;padding:8px 0;">لا توجد تطويرات مسجّلة</p>`;

  // Basic Skills
  const basicSkills = player.basicSkills || [];
  const basicSkillsHTML = basicSkills.length > 0
    ? basicSkills.map(s => `
        <div class="pdm-skill-item">
          <span class="pdm-skill-icon">${s.icon || "✦"}</span>
          <span class="pdm-skill-label">${escapeHtml(s.name || s)}</span>
        </div>`).join("")
    : `<p style="color:var(--text-tertiary);font-size:0.85rem;">لا توجد مهارات أساسية</p>`;

  // Additional Skills
  const additionalSkills = player.additionalSkills || [];
  const additionalSkillsHTML = additionalSkills.length > 0
    ? additionalSkills.map(s => `
        <span class="pdm-extra-tag">
          ${s.icon ? `<span>${s.icon}</span>` : ""}
          ${escapeHtml(s.name || s)}
        </span>`).join("")
    : `<p style="color:var(--text-tertiary);font-size:0.85rem;">لا توجد مهارات إضافية</p>`;

  // Page link button
  const pageLinkHTML = player.pagePath
    ? `<a href="${encodeURI(player.pagePath)}" class="pdm-page-link-btn" target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        <span>فتح صفحة التطوير الكاملة</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </a>`
    : "";

  modal.innerHTML = `
    <div class="pdm-header">
      <div class="pdm-header-info">
        <span class="pdm-badge">⚡ تطوير اللاعب</span>
        <div class="pdm-player-name">${escapeHtml(player.name)}</div>
        ${player.position || player.updateLabel ? `
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:4px;">
          ${player.position ? `<span class="player-position-tag">${escapeHtml(player.position)}</span>` : ""}
          ${player.updateLabel ? `<span class="player-update-tag">✦ ${escapeHtml(player.updateLabel)}</span>` : ""}
        </div>` : ""}
      </div>
      <button class="pdm-close-btn" id="pdmCloseBtn" onclick="closePlayerDevModal()">&times;</button>
    </div>

    <div class="pdm-body">
      <div class="pdm-card-column">
        <div class="pdm-card-img-wrap">${imgHTML}</div>
        <div class="pdm-overall-card">
          <div class="pdm-overall-num">${player.overall || "—"}</div>
          <div class="pdm-overall-label">Overall</div>
        </div>
      </div>

      <div class="pdm-info-column">
        <div class="pdm-section">
          <div class="pdm-section-title">التطويرات والتحديثات</div>
          <div class="pdm-developments-list">${devsHTML}</div>
        </div>

        <div class="pdm-section">
          <div class="pdm-section-title">المهارات الأساسية</div>
          <div class="pdm-skills-grid">${basicSkillsHTML}</div>
        </div>

        <div class="pdm-section">
          <div class="pdm-section-title">المهارات الإضافية</div>
          <div class="pdm-extra-skills">${additionalSkillsHTML}</div>
        </div>

        ${pageLinkHTML}
      </div>
    </div>
  `;
}

// ── Close Modal ──
window.closePlayerDevModal = function() {
  if (playerDevModalOverlay) {
    playerDevModalOverlay.classList.remove("active");
    document.body.style.overflow = "";
    playerDevModalOpen = false;
  }
};

// ── Modal Overlay Click to Close ──
if (playerDevModalOverlay) {
  playerDevModalOverlay.addEventListener("click", (e) => {
    if (e.target === playerDevModalOverlay) closePlayerDevModal();
  });
}

// ── Escape Key ──
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && playerDevModalOpen) closePlayerDevModal();
});

// ── Helper: Escape HTML ──
function escapeHtml(str) {
  if (!str) return "";
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

// ── Initialize Players Section ──
document.addEventListener("DOMContentLoaded", () => {
  // Show skeletons while loading
  showPlayerSkeletons();

  // Wait for Firebase to be ready then subscribe
  const trySync = () => {
    if (typeof firebaseDb !== "undefined" && firebaseDb) {
      setupPlayersSync();
    } else if (typeof initFirebaseApp === "function") {
      initFirebaseApp();
      setTimeout(() => {
        setupPlayersSync();
      }, 600);
    } else {
      renderPlayers([]);
    }
  };

  // Give Firebase a moment to init
  setTimeout(trySync, 300);
});

function showPlayerSkeletons() {
  if (!playersGrid) return;
  playersGrid.innerHTML = Array(4).fill(`
    <div class="player-card-skeleton">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-line" style="width:70%"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line btn"></div>
      </div>
    </div>
  `).join("");
  playersGrid.style.display = "grid";
}
