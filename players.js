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
function renderPlayers(list, searchKeyword = "") {
  if (!playersGrid) return;
  playersGrid.innerHTML = "";

  if (!list || list.length === 0) {
    if (noPlayersEl) {
      noPlayersEl.classList.add("visible");
      const title = noPlayersEl.querySelector("h3");
      const desc = noPlayersEl.querySelector("p");
      if (searchKeyword) {
        if (title) title.textContent = "لا يوجد لاعبين يطابقون بحثك";
        if (desc) desc.textContent = `لم نتمكن من إيجاد لاعب مطابق للبحث "${searchKeyword}"`;
      } else {
        if (title) title.textContent = "لا توجد تطويرات بعد";
        if (desc) desc.textContent = "سيتم إضافة تطويرات اللاعبين قريباً";
      }
    }
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

  const offensivePlaystyle = player.offensivePlaystyle || player.playstyle || "";
  const defensivePlaystyle = player.defensivePlaystyle || "";
  const booster = player.booster || "";
  const overall = player.overall || "100";

  // Build tags HTML: 1. Offensive (Red Up), 2. Defensive (Blue Down), 3. Booster (Cyan Down)
  let tagsHTML = "";

  if (offensivePlaystyle) {
    tagsHTML += `
      <!-- Offensive Playstyle (Red/Pink Official Icon) -->
      <span class="top-tag-playstyle tag-offensive" title="الأسلوب الهجومي: ${escapeHtml(offensivePlaystyle)}">
        <span class="tag-box-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 60 60" fill="none">
            <path d="M56 0C58.2091 0 60 1.79086 60 4V56C60 58.14 58.3194 59.8879 56.2061 59.9951L56 60H4L3.79395 59.9951C1.7488 59.8913 0.108652 58.2512 0.00488281 56.2061L0 56V4C0 1.79086 1.79086 1.12745e-07 4 0H56ZM6 54H54V6H6V54ZM50 24.5V45L30 36.5L10 45V24.5L30 15L50 24.5Z" fill="#FF3464"/>
          </svg>
        </span>
        <span class="tag-text">${escapeHtml(offensivePlaystyle)}</span>
      </span>
    `;
  }

  if (defensivePlaystyle) {
    tagsHTML += `
      <!-- Defensive Playstyle (Cyan/Blue Official Icon) -->
      <span class="top-tag-playstyle tag-defensive" title="الأسلوب الدفاعي: ${escapeHtml(defensivePlaystyle)}">
        <span class="tag-box-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 60 60" fill="none">
            <path d="M56 0C58.2091 0 60 1.79086 60 4V56C60 58.14 58.3194 59.8879 56.2061 59.9951L56 60H4L3.79395 59.9951C1.7488 59.8913 0.108652 58.2512 0.00488281 56.2061L0 56V4C0 1.79086 1.79086 1.12745e-07 4 0H56ZM6 54H54V6H6V54ZM50 35.5L30 45L10 35.5V15L30 23.5L50 15V35.5Z" fill="#00EFFF"/>
          </svg>
        </span>
        <span class="tag-text">${escapeHtml(defensivePlaystyle)}</span>
      </span>
    `;
  }

  if (booster) {
    tagsHTML += `
      <!-- Booster (Official eFootball Hexagon Icon) -->
      <span class="top-tag-booster" title="البوستر: ${escapeHtml(booster)}">
        <img src="page player/Booster2.png" class="tag-booster-img" alt="Booster" width="20" height="20">
        <span class="tag-text">${escapeHtml(booster)}</span>
      </span>
    `;
  }

  // If no tags provided at all, fallback to default preview
  if (!tagsHTML) {
    tagsHTML = `
      <span class="top-tag-playstyle tag-offensive">
        <span class="tag-box-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 60 60" fill="none">
            <path d="M56 0C58.2091 0 60 1.79086 60 4V56C60 58.14 58.3194 59.8879 56.2061 59.9951L56 60H4L3.79395 59.9951C1.7488 59.8913 0.108652 58.2512 0.00488281 56.2061L0 56V4C0 1.79086 1.79086 1.12745e-07 4 0H56ZM6 54H54V6H6V54ZM50 24.5V45L30 36.5L10 45V24.5L30 15L50 24.5Z" fill="#FF3464"/>
          </svg>
        </span>
        <span class="tag-text">HOLE PLAYER</span>
      </span>
      <span class="top-tag-booster">
        <img src="page player/Booster2.png" class="tag-booster-img" alt="Booster" width="20" height="20">
        <span class="tag-text">PASS DISRUPTOR</span>
      </span>
    `;
  }

  card.innerHTML = `
    <!-- Card Artwork on Left (Popping Out Above Container - Exact Image Match) -->
    <div class="top-card-art-box">
      ${imgHTML}
    </div>

    <!-- Center Info -->
    <div class="top-card-info">
      <div class="top-card-name" title="${escapeHtml(player.name)}">${escapeHtml(player.name)}</div>
      <div class="top-card-tags">
        ${tagsHTML}
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

    const tiltX = -percentY * 12; // tilt X axis
    const tiltY = percentX * 12;  // tilt Y axis

    card.style.transform = `perspective(900px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-5px)`;

    // Card artwork parallax pop-out movement!
    const artBox = card.querySelector(".top-card-art-box");
    if (artBox) {
      artBox.style.transform = `translateY(-10px) scale(1.08) rotate(${tiltY * 0.4}deg) translateZ(30px)`;
    }

    // Dynamic specular glare layer following cursor
    const glare = card.querySelector(".card-glare");
    if (glare) {
      const posX = (x / rect.width) * 100;
      const posY = (y / rect.height) * 100;
      glare.style.opacity = "1";
      glare.style.background = `radial-gradient(circle 220px at ${posX.toFixed(1)}% ${posY.toFixed(1)}%, rgba(255,255,255,0.2) 0%, rgba(56,189,248,0.12) 40%, transparent 80%)`;
    }
  });

  card.addEventListener("mouseleave", () => {
    isHovered = false;
    card.style.transition = "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease, border-color 0.4s ease";
    card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";

    const artBox = card.querySelector(".top-card-art-box");
    if (artBox) {
      artBox.style.transform = "translateY(0px) scale(1) rotate(0deg) translateZ(0px)";
    }

    const glare = card.querySelector(".card-glare");
    if (glare) {
      glare.style.opacity = "0";
    }
  });
}

// ── Open Player Development Modal ──
window.openPlayerDevModal = function(playerId) {
  const player = PLAYERS.find(p => String(p.id) === String(playerId));
  if (!player) return;

  renderPlayerDevModal(player);

  const modal = document.getElementById("playerDevModal");
  if (modal) modal.scrollTop = 0;

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

  // Find other versions of this same player (by name, case-insensitive, excluding current card)
  const currentCleanName = (player.name || "").trim().toLowerCase();
  const otherVersions = PLAYERS.filter(p => {
    if (String(p.id) === String(player.id)) return false;
    const otherCleanName = (p.name || "").trim().toLowerCase();
    return otherCleanName === currentCleanName;
  });

  let otherVersionsHTML = "";
  if (otherVersions.length > 0) {
    otherVersionsHTML = `
      <!-- ════ OTHER VERSIONS SECTION (نسخ أخرى لنفس اللاعب) ════ -->
      <div class="efhub-other-versions-section">
        <div class="efhub-other-versions-header">
          <div class="efhub-ov-title-wrap">
            <span class="efhub-ov-icon">🎴</span>
            <div class="efhub-ov-title-text">
              <h3 class="efhub-other-versions-title">نسخ أخرى للاعب (${escapeHtml(player.name)})</h3>
              <span class="efhub-other-versions-count">${otherVersions.length} ${otherVersions.length === 1 ? 'نسخة متوفرة' : 'نسخ متوفرة'}</span>
            </div>
          </div>
          <span class="efhub-ov-hint">اضغط على أي نسخة للتبديل المباشر وعرض تطويرتها</span>
        </div>
        <div class="efhub-other-versions-grid">
          ${otherVersions.map(v => {
            const vImg = v.image
              ? `<img src="${v.image}" alt="${escapeHtml(v.name)}" class="efhub-v-thumb-img">`
              : `<div class="efhub-v-thumb-ph">🎮</div>`;
            return `
              <div class="efhub-version-card" onclick="openPlayerDevModal('${v.id}')" role="button" tabindex="0" title="عرض نسخة ${escapeHtml(v.name)} (${v.overall})">
                <div class="efhub-version-card-art">
                  ${vImg}
                  <span class="efhub-version-ovr">${v.overall || '100'}</span>
                </div>
                <div class="efhub-version-details">
                  <div class="efhub-version-pos-row">
                    <span class="efhub-version-pos">${escapeHtml(v.position || 'AMF')}</span>
                    <span class="efhub-version-name">${escapeHtml(v.name)}</span>
                  </div>
                  <div class="efhub-version-tags">
                    ${v.offensivePlaystyle || v.playstyle ? `<span class="efhub-v-tag red"><span class="v-dot"></span>${escapeHtml(v.offensivePlaystyle || v.playstyle)}</span>` : ''}
                    ${v.defensivePlaystyle ? `<span class="efhub-v-tag blue"><span class="v-dot"></span>${escapeHtml(v.defensivePlaystyle)}</span>` : ''}
                    ${v.booster ? `<span class="efhub-v-tag cyan"><span class="v-dot"></span>${escapeHtml(v.booster)}</span>` : ''}
                  </div>
                </div>
                <div class="efhub-version-action">
                  <span>عرض النسخة</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

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
            ${player.offensivePlaystyle || player.playstyle ? `<span class="efhub-badge-playstyle">⚡ ${escapeHtml(player.offensivePlaystyle || player.playstyle)}</span>` : ""}
            ${player.defensivePlaystyle ? `<span class="efhub-badge-playstyle" style="border-color:rgba(56,189,248,0.35);color:#38bdf8;">🛡️ ${escapeHtml(player.defensivePlaystyle)}</span>` : ""}
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

    ${otherVersionsHTML}
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

// ── Player Search & Filter Logic ──
let playerSearchQuery = "";

function initPlayerSearch() {
  const searchInput    = document.getElementById("playerSearchInput");
  const searchClearBtn = document.getElementById("playerSearchClear");
  const searchStatus   = document.getElementById("playerSearchStatus");
  const searchCount    = document.getElementById("playerSearchCount");
  const resetBtn       = document.getElementById("playerResetSearchBtn");
  const showAllBtn     = document.getElementById("topCardsShowAllBtn");

  if (!searchInput) return;

  const handleSearch = (q) => {
    playerSearchQuery = (q || "").trim();
    if (searchClearBtn) searchClearBtn.style.display = playerSearchQuery ? "flex" : "none";

    if (!playerSearchQuery) {
      if (searchStatus) searchStatus.style.display = "none";
      renderPlayers(PLAYERS);
      return;
    }

    const needle = playerSearchQuery.toLowerCase();
    const filtered = PLAYERS.filter(p => {
      const name = (p.name || "").toLowerCase();
      const pos = (p.position || "").toLowerCase();
      const comp = (p.compatiblePositions || []).join(" ").toLowerCase();
      const offPs = (p.offensivePlaystyle || p.playstyle || "").toLowerCase();
      const defPs = (p.defensivePlaystyle || "").toLowerCase();
      const bst = (p.booster || "").toLowerCase();
      const ovr = String(p.overall || "");
      return name.includes(needle) || pos.includes(needle) || comp.includes(needle) || offPs.includes(needle) || defPs.includes(needle) || bst.includes(needle) || ovr.includes(needle);
    });

    if (searchStatus && searchCount) {
      searchStatus.style.display = "flex";
      searchCount.textContent = `تم العثور على ${filtered.length} ${filtered.length === 1 ? 'لاعب' : 'لاعبين'}`;
    }

    renderPlayers(filtered, playerSearchQuery);
  };

  searchInput.addEventListener("input", (e) => handleSearch(e.target.value));

  const clearSearch = () => {
    searchInput.value = "";
    handleSearch("");
    searchInput.focus();
  };

  if (searchClearBtn) searchClearBtn.addEventListener("click", clearSearch);
  if (resetBtn) resetBtn.addEventListener("click", clearSearch);
  if (showAllBtn) showAllBtn.addEventListener("click", clearSearch);
}

// ── Initialize Players Section ──
document.addEventListener("DOMContentLoaded", () => {
  showPlayerSkeletons();
  initPlayerSearch();
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
