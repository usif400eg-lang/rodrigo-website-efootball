/* ═══════════════════════════════════════════════
   RODRIGO — Players Development Section
   eFootball Hub (eFHUB) Native Viewer
   ═══════════════════════════════════════════════ */

const PLAYERS_FIREBASE_PATH = "rodrigo_players";

// ── State ──
let PLAYERS = [];
let playerDevModalOpen = false;

// ── DOM References ──
const playersGrid           = document.getElementById("playersGrid");
const noPlayersEl           = document.getElementById("noPlayers");
const playerDevModalOverlay = document.getElementById("playerDevModalOverlay");

// ── Stat Color Class Calculator (Matches eFHUB & eFootball Game) ──
function getStatColorClass(val) {
  val = Number(val) || 0;
  if (val >= 95) return "stat-cyan";     // 95+ Cyan / Electric Blue
  if (val >= 90) return "stat-blue";     // 90-94 Blue / Turquoise
  if (val >= 80) return "stat-green";    // 80-89 Vibrant Green (Box)
  if (val >= 70) return "stat-yellow";   // 70-79 Olive / Yellow-Green
  if (val >= 60) return "stat-orange";   // 60-69 Orange
  return "stat-red";                     // <60 Red (Box)
}

// ── Load & Subscribe to Players from Firebase ──
function setupPlayersSync() {
  if (typeof firebase === "undefined" || !firebaseDb) {
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

// ── Create Single Player Card (Top Cards Layout Matching Reference Image) ──
function createPlayerCard(player, delay = 0) {
  const card = document.createElement("div");
  card.className = "top-card-item";
  card.style.animationDelay = `${delay * 0.04}s`;
  card.dataset.playerId = player.id;
  card.onclick = () => openPlayerDevModal(player.id);

  const imgHTML = player.image
    ? `<img src="${player.image}" alt="${escapeHtml(player.name)}" loading="lazy">`
    : `<div class="top-card-img-placeholder">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
      </div>`;

  const playstyle = player.playstyle || "Hole Player";
  const booster = player.booster || "Basic";
  const overall = player.overall || "100";

  card.innerHTML = `
    <!-- Card Artwork / Portrait on Left -->
    <div class="top-card-art-box">
      ${imgHTML}
    </div>

    <!-- Center Info -->
    <div class="top-card-info">
      <div class="top-card-name" title="${escapeHtml(player.name)}">${escapeHtml(player.name)}</div>
      <div class="top-card-tags">
        <span class="top-tag-playstyle">
          <span class="tag-arrow-icon">⮝</span>
          <span class="tag-text">${escapeHtml(playstyle)}</span>
        </span>
        <span class="top-tag-booster">
          <span class="tag-booster-icon">🗲</span>
          <span class="tag-text">${escapeHtml(booster)}</span>
        </span>
      </div>
    </div>

    <!-- Overall Capsule on Right -->
    <div class="top-card-ovr-wrap">
      <div class="top-card-ovr">${overall}</div>
    </div>

    <!-- 3D Specular Glare Layer -->
    <div class="card-glare"></div>
  `;

  // Attach 3D mousemove tilt & shine effect
  attachCardTiltEffect(card);

  return card;
}

// ── 3D Tilt & Dynamic Specular Lighting on Mousemove ──
function attachCardTiltEffect(card) {
  let isHovered = false;

  card.addEventListener("mouseenter", () => {
    isHovered = true;
    card.style.transition = "transform 0.08s ease-out, box-shadow 0.2s ease, border-color 0.2s ease";
  });

  card.addEventListener("mousemove", (e) => {
    if (!isHovered) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const percentX = (x - centerX) / centerX; // -1 to 1
    const percentY = (y - centerY) / centerY; // -1 to 1

    const tiltX = -percentY * 11; // max tilt degrees
    const tiltY = percentX * 11;

    card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(12px) translateY(-4px)`;

    const glare = card.querySelector(".card-glare");
    if (glare) {
      const posX = (x / rect.width) * 100;
      const posY = (y / rect.height) * 100;
      glare.style.opacity = "1";
      glare.style.background = `radial-gradient(circle 220px at ${posX.toFixed(1)}% ${posY.toFixed(1)}%, rgba(255,255,255,0.22) 0%, rgba(56,189,248,0.12) 40%, transparent 80%)`;
    }
  });

  card.addEventListener("mouseleave", () => {
    isHovered = false;
    card.style.transition = "transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.35s ease, border-color 0.35s ease";
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) translateY(0px)";
    const glare = card.querySelector(".card-glare");
    if (glare) {
      glare.style.opacity = "0";
    }
  });
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

// ── Render Full eFHUB Development Modal ──
function renderPlayerDevModal(player) {
  const modal = document.getElementById("playerDevModal");
  if (!modal) return;

  const prog = player.progression || {};
  const st   = player.stats || {};
  const isGK = (player.position || "").toUpperCase() === "GK";

  // Progression items builder
  const buildProgBar = (label, val, maxVal = 20) => {
    const num = Number(val) || 0;
    const pct = Math.min(100, (num / maxVal) * 100);
    return `
      <div class="efhub-prog-row">
        <span class="efhub-prog-label">${label}</span>
        <div class="efhub-prog-track">
          <div class="efhub-prog-fill" style="width: ${pct}%"></div>
          <span class="efhub-prog-dot" style="left: ${pct}%"></span>
        </div>
        <span class="efhub-prog-value">${num}</span>
      </div>
    `;
  };

  // Progression bars block
  let progHTML = `
    ${buildProgBar("SHOOTING", prog.shooting || 0)}
    ${buildProgBar("PASSING", prog.passing || 0)}
    ${buildProgBar("DRIBBLING", prog.dribbling || 0)}
    ${buildProgBar("DEXTERITY", prog.dexterity || 0)}
    ${buildProgBar("LOWER BODY STRENGTH", prog.lowerBody || 0)}
    ${buildProgBar("AERIAL STRENGTH", prog.aerial || 0)}
    ${buildProgBar("DEFENDING", prog.defending || 0)}
  `;

  if (isGK || prog.gk1 || prog.gk2 || prog.gk3) {
    progHTML += `
      ${buildProgBar("GK 1", prog.gk1 || 0)}
      ${buildProgBar("GK 2", prog.gk2 || 0)}
      ${buildProgBar("GK 3", prog.gk3 || 0)}
    `;
  }

  // Stat item builder
  const buildStatItem = (label, val) => {
    const num = (val !== undefined && val !== null) ? Number(val) : 75;
    const colorClass = getStatColorClass(num);
    return `
      <div class="efhub-stat-item">
        <span class="efhub-stat-name">${label}</span>
        <span class="efhub-stat-badge ${colorClass}">${num}</span>
      </div>
    `;
  };

  // Attacking Stats
  const attackingHTML = `
    <div class="efhub-stats-column">
      <div class="efhub-column-header">ATTACKING</div>
      <div class="efhub-stats-list">
        ${buildStatItem("Attacking Awareness", st.attackingAwareness || 80)}
        ${buildStatItem("Ball Control", st.ballControl || 84)}
        ${buildStatItem("Dribbling", st.dribbling || 86)}
        ${buildStatItem("Tight Possession", st.tightPossession || 85)}
        ${buildStatItem("Low Pass", st.lowPass || 84)}
        ${buildStatItem("Lofted Pass", st.loftedPass || 78)}
        ${buildStatItem("Finishing", st.finishing || 79)}
        ${buildStatItem("Heading", st.heading || 55)}
        ${buildStatItem("Set Piece Taking", st.setPieceTaking || 69)}
        ${buildStatItem("Curl", st.curl || 75)}
      </div>
    </div>
  `;

  // Defending Stats (or GK Stats if goalkeeper)
  const defendingHTML = !isGK ? `
    <div class="efhub-stats-column">
      <div class="efhub-column-header">DEFENDING</div>
      <div class="efhub-stats-list">
        ${buildStatItem("Defensive Awareness", st.defensiveAwareness || 43)}
        ${buildStatItem("Defensive Engagement", st.defensiveEngagement || 43)}
        ${buildStatItem("Tackling", st.tackling || 42)}
        ${buildStatItem("Aggression", st.aggression || 42)}
        ${st.gkAwareness ? buildStatItem("GK Awareness", st.gkAwareness) : ""}
        ${st.gkCatching ? buildStatItem("GK Catching", st.gkCatching) : ""}
        ${st.gkParrying ? buildStatItem("GK Parrying", st.gkParrying) : ""}
        ${st.gkReflexes ? buildStatItem("GK Reflexes", st.gkReflexes) : ""}
        ${st.gkReach ? buildStatItem("GK Reach", st.gkReach) : ""}
      </div>
    </div>
  ` : `
    <div class="efhub-stats-column">
      <div class="efhub-column-header">GOALKEEPING</div>
      <div class="efhub-stats-list">
        ${buildStatItem("GK Awareness", st.gkAwareness || 90)}
        ${buildStatItem("GK Catching", st.gkCatching || 88)}
        ${buildStatItem("GK Parrying", st.gkParrying || 86)}
        ${buildStatItem("GK Reflexes", st.gkReflexes || 92)}
        ${buildStatItem("GK Reach", st.gkReach || 89)}
        ${buildStatItem("Defensive Awareness", st.defensiveAwareness || 60)}
        ${buildStatItem("Jumping", st.jumping || 84)}
      </div>
    </div>
  `;

  // Athleticism Stats
  const athleticismHTML = `
    <div class="efhub-stats-column">
      <div class="efhub-column-header">ATHLETICISM</div>
      <div class="efhub-stats-list">
        ${buildStatItem("Speed", st.speed || 80)}
        ${buildStatItem("Acceleration", st.acceleration || 84)}
        ${buildStatItem("Kicking Power", st.kickingPower || 80)}
        ${buildStatItem("Jumping", st.jumping || 54)}
        ${buildStatItem("Physical Contact", st.physicalContact || 73)}
        ${buildStatItem("Balance", st.balance || 82)}
        ${buildStatItem("Stamina", st.stamina || 73)}
      </div>
    </div>
  `;

  // Skills
  const skillsList = player.skills || (player.basicSkills ? player.basicSkills.map(s => typeof s === 'string' ? s : s.name) : []);
  const skillsHTML = skillsList.length > 0
    ? skillsList.map(s => `
        <span class="efhub-skill-pill">
          <span class="efhub-skill-icon">⚡</span>
          <span>${escapeHtml(s)}</span>
        </span>
      `).join("")
    : `<span style="color:var(--text-tertiary);font-size:0.85rem;">لا توجد مهارات مسجلة</span>`;

  // Additional Skills
  const addSkills = player.additionalSkills || [];
  const addSkillsHTML = addSkills.length > 0
    ? addSkills.map(s => `
        <span class="efhub-skill-pill add-skill">
          <span class="efhub-skill-icon">✦</span>
          <span>${escapeHtml(typeof s === 'string' ? s : s.name)}</span>
        </span>
      `).join("")
    : "";

  // COM Skills
  const comSkills = player.comSkills || [];
  const comSkillsHTML = comSkills.length > 0
    ? comSkills.map(s => `<span class="efhub-skill-pill com-skill">${escapeHtml(s)}</span>`).join("")
    : "";

  // Other Stats (Weak foot, Form, etc.)
  const ot = player.otherStats || {};
  const otherStatsHTML = `
    <div class="efhub-other-stats-grid">
      <div class="efhub-other-item">
        <span class="efhub-other-label">Weak Foot Usage:</span>
        <span class="efhub-other-val">${escapeHtml(ot.weakFootUsage || "Occasionally")}</span>
      </div>
      <div class="efhub-other-item">
        <span class="efhub-other-label">Weak Foot Accuracy:</span>
        <span class="efhub-other-val">${escapeHtml(ot.weakFootAccuracy || "Very High")}</span>
      </div>
      <div class="efhub-other-item">
        <span class="efhub-other-label">Form:</span>
        <span class="efhub-other-val highlight">${escapeHtml(ot.form || "Unwavering")}</span>
      </div>
      <div class="efhub-other-item">
        <span class="efhub-other-label">Injury Resistance:</span>
        <span class="efhub-other-val">${escapeHtml(ot.injuryResistance || "Medium")}</span>
      </div>
    </div>
  `;

  // Compatible Positions Tags
  const compPos = player.compatiblePositions || [player.position || "AMF"];
  const compPosHTML = compPos.map(p => `
    <span class="efhub-pos-chip ${p === player.position ? 'active' : ''}">${escapeHtml(p)}</span>
  `).join("");

  // Card Image
  const imgHTML = player.image
    ? `<img src="${player.image}" alt="${escapeHtml(player.name)}" class="efhub-card-thumb">`
    : `<div class="efhub-card-placeholder">🎮</div>`;

  modal.innerHTML = `
    <!-- Modal Close Button -->
    <button class="efhub-close-btn" onclick="closePlayerDevModal()" aria-label="إغلاق">&times;</button>

    <!-- Top Identity Bar -->
    <div class="efhub-top-bar">
      <div class="efhub-identity-left">
        ${imgHTML}
        <div class="efhub-identity-text">
          <div class="efhub-player-title-row">
            <span class="efhub-pos-badge">${escapeHtml(player.position || "AMF")}</span>
            <h2 class="efhub-player-name">${escapeHtml(player.name)}</h2>
            ${player.overall ? `<span class="efhub-ovr-tag">${player.overall}</span>` : ""}
          </div>
          <div class="efhub-meta-row">
            ${player.playstyle ? `<span class="efhub-badge-playstyle">⚡ ${escapeHtml(player.playstyle)}</span>` : ""}
            ${player.booster ? `<span class="efhub-badge-booster">✦ ${escapeHtml(player.booster)}</span>` : ""}
            <span class="efhub-badge-meta">Level Cap: <strong>${player.levelCap || 33}</strong></span>
            <span class="efhub-badge-meta">Points: <strong>${player.maxPoints || 64}</strong></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile View Tabs Switcher -->
    <div class="efhub-mobile-tabs">
      <button type="button" class="efhub-m-tab active" onclick="switchEfhubMobileTab('build')">⚡ نقاط التطوير (Build)</button>
      <button type="button" class="efhub-m-tab" onclick="switchEfhubMobileTab('stats')">📊 طاقات اللاعب (Stats)</button>
      <button type="button" class="efhub-m-tab" onclick="switchEfhubMobileTab('skills')">🎯 المهارات والحالة</button>
    </div>

    <!-- Main 2-Column Content Layout -->
    <div class="efhub-content-layout">

      <!-- ════ LEFT COLUMN: BUILD & ALLOCATION ════ -->
      <div class="efhub-left-panel" id="efhubLeftPanel">
        <!-- Control Header: Position, Max, Smart -->
        <div class="efhub-panel-controls">
          <div class="efhub-pill-btn active">${escapeHtml(player.position || "AMF")}</div>
          <div class="efhub-pill-btn green-btn">MAX</div>
          <div class="efhub-pill-btn blue-btn">SMART</div>
        </div>

        <!-- Level Cap & Total Points Box -->
        <div class="efhub-points-summary">
          <span>Level Cap <strong>${player.levelCap || 33}</strong></span>
          <span>Points <strong>0 / ${player.maxPoints || 64}</strong></span>
        </div>

        <!-- Progression Points Allocation Sliders -->
        <div class="efhub-progression-box">
          ${progHTML}
        </div>

        <!-- Stamina & Manager -->
        <div class="efhub-extra-controls">
          <div class="efhub-stamina-row">
            <span class="efhub-stamina-label">REMAINING STAMINA</span>
            <span class="efhub-stamina-val">70%</span>
          </div>
          <div class="efhub-stamina-bar">
            <div class="efhub-stamina-fill"></div>
          </div>

          <div class="efhub-manager-row">
            <span>MANAGER</span>
            <span class="efhub-manager-badge">${player.managerRating || 70}</span>
          </div>
        </div>

        <!-- Playstyle Card -->
        <div class="efhub-playstyle-card">
          <div class="efhub-playstyle-header">
            <span class="efhub-playstyle-icon">⮝</span>
            <span class="efhub-playstyle-name">${escapeHtml(player.playstyle || "HOLE PLAYER")}</span>
          </div>
          <div class="efhub-comp-positions">
            ${compPosHTML}
          </div>
          ${player.playstyleDesc ? `<p class="efhub-playstyle-desc">${escapeHtml(player.playstyleDesc)}</p>` : `<p class="efhub-playstyle-desc">A player who looks to make runs into the opposition goal area when the team is on the attack.</p>`}

          ${player.booster ? `
            <div class="efhub-booster-sub">
              <span class="efhub-booster-sub-icon">✔</span>
              <span class="efhub-booster-sub-title">${escapeHtml(player.booster)}</span>
            </div>
          ` : ""}
        </div>
      </div>

      <!-- ════ RIGHT COLUMN: ATTRIBUTES & SKILLS ════ -->
      <div class="efhub-right-panel" id="efhubRightPanel">

        <!-- 3-Column Attributes Grid -->
        <div class="efhub-stats-grid">
          ${attackingHTML}
          ${defendingHTML}
          ${athleticismHTML}
        </div>

        <!-- Skills Section -->
        <div class="efhub-skills-section" id="efhubSkillsSection">
          <div class="efhub-sub-header">SKILLS <span style="font-size:0.75rem;color:#38bdf8;margin-right:8px;">✦ SKILL FX</span></div>
          <div class="efhub-skills-tags-wrap">
            ${skillsHTML}
          </div>

          ${addSkillsHTML ? `
            <div class="efhub-sub-header" style="margin-top:16px;">ADDITIONAL SKILLS</div>
            <div class="efhub-skills-tags-wrap">
              ${addSkillsHTML}
            </div>
          ` : ""}

          ${comSkillsHTML ? `
            <div class="efhub-sub-header" style="margin-top:16px;">COM SKILLS</div>
            <div class="efhub-skills-tags-wrap">
              ${comSkillsHTML}
            </div>
          ` : ""}

          <!-- Other Stats -->
          <div class="efhub-sub-header" style="margin-top:18px;">OTHER STATS</div>
          ${otherStatsHTML}
        </div>

      </div>

    </div>
  `;
}

// ── Mobile Tabs Switcher in eFHUB Modal ──
window.switchEfhubMobileTab = function(tab) {
  document.querySelectorAll(".efhub-m-tab").forEach(b => b.classList.remove("active"));
  const leftPanel = document.getElementById("efhubLeftPanel");
  const rightPanel = document.getElementById("efhubRightPanel");
  const skillsSec = document.getElementById("efhubSkillsSection");

  const clickedBtn = event?.currentTarget;
  if (clickedBtn) clickedBtn.classList.add("active");

  if (tab === "build") {
    if (leftPanel) leftPanel.style.display = "block";
    if (rightPanel) rightPanel.style.display = "none";
  } else if (tab === "stats") {
    if (leftPanel) leftPanel.style.display = "none";
    if (rightPanel) {
      rightPanel.style.display = "block";
      const grid = rightPanel.querySelector(".efhub-stats-grid");
      if (grid) grid.style.display = "grid";
      if (skillsSec) skillsSec.style.display = "none";
    }
  } else if (tab === "skills") {
    if (leftPanel) leftPanel.style.display = "none";
    if (rightPanel) {
      rightPanel.style.display = "block";
      const grid = rightPanel.querySelector(".efhub-stats-grid");
      if (grid) grid.style.display = "none";
      if (skillsSec) skillsSec.style.display = "block";
    }
  }
};

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
  d.textContent = String(str);
  return d.innerHTML;
}

// ── Initialize Players Section ──
document.addEventListener("DOMContentLoaded", () => {
  showPlayerSkeletons();
  const trySync = () => {
    if (typeof firebaseDb !== "undefined" && firebaseDb) {
      setupPlayersSync();
    } else if (typeof initFirebaseApp === "function") {
      initFirebaseApp();
      setTimeout(() => setupPlayersSync(), 600);
    } else {
      renderPlayers([]);
    }
  };
  setTimeout(trySync, 300);
});

function showPlayerSkeletons() {
  if (!playersGrid) return;
  playersGrid.innerHTML = Array(6).fill(`
    <div class="top-card-item skeleton-top-card">
      <div class="top-card-art-box skeleton-pulse" style="background:rgba(255,255,255,0.06);border-radius:8px;"></div>
      <div class="top-card-info">
        <div class="skeleton-line skeleton-pulse" style="width:55%;height:18px;margin-bottom:8px;"></div>
        <div class="skeleton-line skeleton-pulse" style="width:35%;height:14px;"></div>
      </div>
      <div class="top-card-ovr-wrap">
        <div class="top-card-ovr skeleton-pulse" style="color:transparent;background:rgba(255,255,255,0.08);">100</div>
      </div>
    </div>
  `).join("");
  playersGrid.style.display = "grid";
}
