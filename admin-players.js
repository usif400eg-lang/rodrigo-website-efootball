/* ═══════════════════════════════════════════════
   RODRIGO Admin — Players Management
   Full eFootball Hub (eFHUB) Sync Controller
   ═══════════════════════════════════════════════ */

const PLAYERS_DB_PATH = "rodrigo_players";

// ── State ──
let adminPlayers        = [];
let editingPlayerId      = null;
let deletingPlayerId     = null;
let playerImageBase64    = "";
let isSubscribedToPlayers = false;

// ── DOM References ──
const addPlayerBtn          = document.getElementById("addPlayerBtn");
const playerModalOverlay    = document.getElementById("playerModalOverlay");
const playerModalClose      = document.getElementById("playerModalClose");
const playerModalCancelBtn  = document.getElementById("playerModalCancelBtn");
const playerModalSaveBtn    = document.getElementById("playerModalSaveBtn");
const playerModalTitle      = document.getElementById("playerModalTitle");
const playerForm            = document.getElementById("playerForm");

// Basic inputs
const playerNameInput            = document.getElementById("playerName");
const playerOverallInput         = document.getElementById("playerOverall");
const playerPositionInput        = document.getElementById("playerPosition");
const playerCompatiblePosInput   = document.getElementById("playerCompatiblePositions");
const playerOffensivePlaystyleInput = document.getElementById("playerOffensivePlaystyle");
const playerDefensivePlaystyleInput = document.getElementById("playerDefensivePlaystyle");
const playerPlaystyleDescInput      = document.getElementById("playerPlaystyleDesc");
const playerBoosterInput            = document.getElementById("playerBooster");
const playerLevelCapInput           = document.getElementById("playerLevelCap");
const playerMaxPointsInput       = document.getElementById("playerMaxPoints");
const playerManagerRatingInput   = document.getElementById("playerManagerRating");

// Image inputs
const playerImageInput      = document.getElementById("playerImageInput");
const playerImagePreview    = document.getElementById("playerImagePreview");
const playerPreviewImg      = document.getElementById("playerPreviewImg");
const playerRemoveImgBtn    = document.getElementById("playerRemoveImgBtn");
const playerImageUploadArea = document.getElementById("playerImageUploadArea");

// Skills & Other
const basicSkillsList       = document.getElementById("basicSkillsList");
const addBasicSkillBtn      = document.getElementById("addBasicSkillBtn");
const additionalSkillsList  = document.getElementById("additionalSkillsList");
const addExtraSkillBtn      = document.getElementById("addExtraSkillBtn");
const playerComSkillsInput  = document.getElementById("playerComSkills");
const playerWeakFootUsage   = document.getElementById("playerWeakFootUsage");
const playerWeakFootAccuracy= document.getElementById("playerWeakFootAccuracy");
const playerFormSelect      = document.getElementById("playerForm");
const playerInjurySelect    = document.getElementById("playerInjuryResistance");

// Table
const playersTableBody      = document.getElementById("playersTableBody");
const playersTable          = document.getElementById("playersTable");
const playersTableEmpty     = document.getElementById("playersTableEmpty");

// Delete modal
const playerDeleteModalOverlay = document.getElementById("playerDeleteModalOverlay");
const playerDeleteCancelBtn    = document.getElementById("playerDeleteCancelBtn");
const playerDeleteConfirmBtn   = document.getElementById("playerDeleteConfirmBtn");
const deletePlayerNameEl       = document.getElementById("deletePlayerName");

// ── Tab Switching (Files vs Players vs Managers) ──
window.switchAdminTab = function(tab) {
  document.querySelectorAll(".admin-nav-tab").forEach(btn => {
    btn.classList.remove("active");
  });
  document.querySelectorAll(".admin-section-panel").forEach(panel => {
    panel.classList.remove("active");
  });

  if (tab === "files") {
    const tabEl = document.getElementById("tabFiles");
    const panelEl = document.getElementById("panelFiles");
    if (tabEl) tabEl.classList.add("active");
    if (panelEl) panelEl.classList.add("active");
  } else if (tab === "players") {
    const tabEl = document.getElementById("tabPlayers");
    const panelEl = document.getElementById("panelPlayers");
    if (tabEl) tabEl.classList.add("active");
    if (panelEl) panelEl.classList.add("active");
    if (!isSubscribedToPlayers) setupPlayersAdminSync();
  } else if (tab === "managers") {
    const tabEl = document.getElementById("tabManagers");
    const panelEl = document.getElementById("panelManagers");
    if (tabEl) tabEl.classList.add("active");
    if (panelEl) panelEl.classList.add("active");
    if (typeof initManagersPanel === "function") initManagersPanel();
  }
};

// ── Firebase Sync ──
function setupPlayersAdminSync() {
  if (typeof firebase === "undefined" || !firebaseDb) return;
  isSubscribedToPlayers = true;

  firebaseDb.ref(PLAYERS_DB_PATH).on("value", (snapshot) => {
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
    adminPlayers = list;
    renderPlayersTable();
  }, (err) => {
    console.warn("Players admin sync error:", err);
    showToast("تعذر تحميل بيانات اللاعبين", "error");
  });
}

// ── Render Players Table ──
function renderPlayersTable() {
  if (!playersTableBody) return;
  playersTableBody.innerHTML = "";

  if (adminPlayers.length === 0) {
    playersTable.style.display = "none";
    playersTableEmpty.style.display = "block";
    return;
  }

  playersTable.style.display = "table";
  playersTableEmpty.style.display = "none";

  adminPlayers.forEach(player => {
    const tr = document.createElement("tr");

    // Progression Build preview string
    const prog = player.progression || {};
    const buildParts = [];
    if (prog.shooting) buildParts.push(`Shoot:${prog.shooting}`);
    if (prog.passing) buildParts.push(`Pass:${prog.passing}`);
    if (prog.dribbling) buildParts.push(`Drib:${prog.dribbling}`);
    if (prog.dexterity) buildParts.push(`Dex:${prog.dexterity}`);
    if (prog.lowerBody) buildParts.push(`L.Body:${prog.lowerBody}`);
    if (prog.aerial) buildParts.push(`Air:${prog.aerial}`);
    if (prog.defending) buildParts.push(`Def:${prog.defending}`);
    if (prog.gk1) buildParts.push(`GK1:${prog.gk1}`);
    const buildPreviewHTML = buildParts.length > 0
      ? `<div style="font-family:monospace;font-size:0.75rem;color:var(--accent-secondary);background:rgba(255,255,255,0.03);padding:4px 8px;border-radius:6px;max-width:200px;line-height:1.4;">${buildParts.slice(0, 4).join(" | ")}${buildParts.length > 4 ? ` <span style="color:var(--text-tertiary)">+${buildParts.length - 4}</span>` : ""}</div>`
      : `<span style="color:var(--text-tertiary);font-size:0.8rem;">—</span>`;

    // Skills preview
    const basicSkills = player.skills || player.basicSkills || [];
    const skillsPreviewHTML = basicSkills.length > 0
      ? `<div class="skills-preview">
          ${basicSkills.slice(0, 3).map(s => `<span class="skill-preview-tag">⚡ ${escHtml(typeof s === 'string' ? s : (s.name || ''))}</span>`).join("")}
          ${basicSkills.length > 3 ? `<span class="skill-preview-more">+${basicSkills.length - 3}</span>` : ""}
        </div>`
      : `<span style="color:var(--text-tertiary);font-size:0.8rem;">—</span>`;

    // Playstyle & Booster
    const playstyleHTML = `
      <div style="font-size:0.8rem;">
        ${player.position ? `<span style="display:inline-block;padding:2px 8px;border-radius:4px;background:rgba(34,197,94,0.15);color:#4ade80;font-weight:700;font-size:0.72rem;margin-bottom:3px;">${escHtml(player.position)}</span>` : ""}
        ${player.playstyle ? `<div style="color:var(--text-primary);font-weight:600;font-size:0.78rem;">${escHtml(player.playstyle)}</div>` : ""}
        ${player.booster ? `<div style="color:#c084fc;font-size:0.72rem;">✦ ${escHtml(player.booster)}</div>` : ""}
      </div>
    `;

    tr.innerHTML = `
      <td>
        ${player.image
          ? `<img src="${player.image}" class="player-table-img" alt="${escHtml(player.name)}">`
          : `<div class="player-table-img-placeholder">🎮</div>`}
      </td>
      <td>
        <strong style="font-size:0.95rem;">${escHtml(player.name)}</strong>
        ${player.levelCap ? `<div style="font-size:0.72rem;color:var(--text-tertiary);margin-top:2px;">Level Cap: ${player.levelCap} | Points: ${player.maxPoints || 0}</div>` : ""}
      </td>
      <td>
        <span class="overall-badge">${player.overall || "—"}</span>
      </td>
      <td>${playstyleHTML}</td>
      <td>${buildPreviewHTML}</td>
      <td>${skillsPreviewHTML}</td>
      <td>
        <div class="actions-cell">
          <button class="btn-icon edit" onclick="openPlayerEditModal(${player.id})" title="تعديل">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon delete" onclick="openPlayerDeleteModal(${player.id})" title="حذف">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    `;
    playersTableBody.appendChild(tr);
  });
}

// ── Modal Form Tabs (1. Basic, 2. Progression, 3. Stats, 4. Skills) ──
document.querySelectorAll(".p-tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".p-tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".player-tab-pane").forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    const target = btn.dataset.tab;
    if (target === "basic") document.getElementById("paneBasic").classList.add("active");
    else if (target === "progression") document.getElementById("paneProgression").classList.add("active");
    else if (target === "stats") document.getElementById("paneStats").classList.add("active");
    else if (target === "skills") document.getElementById("paneSkills").classList.add("active");
  });
});

// ── Progression Points Steppers (+ / -) ──
document.addEventListener("click", (e) => {
  const stepBtn = e.target.closest(".step-btn");
  if (!stepBtn) return;
  const targetId = stepBtn.dataset.target;
  const input = document.getElementById(targetId);
  if (!input) return;

  let val = parseInt(input.value) || 0;
  if (stepBtn.classList.contains("step-plus")) {
    val = Math.min(30, val + 1);
  } else if (stepBtn.classList.contains("step-minus")) {
    val = Math.max(0, val - 1);
  }
  input.value = val;
});

// ── Quick Presets for Stats ──
window.fillStatsPreset = function(type) {
  const setVal = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.value = v;
  };

  if (type === "amf") {
    setVal("st_attackingAwareness", 82);
    setVal("st_ballControl", 88);
    setVal("st_dribbling", 90);
    setVal("st_tightPossession", 89);
    setVal("st_lowPass", 86);
    setVal("st_loftedPass", 82);
    setVal("st_finishing", 80);
    setVal("st_heading", 58);
    setVal("st_setPieceTaking", 75);
    setVal("st_curl", 82);
    setVal("st_defensiveAwareness", 45);
    setVal("st_defensiveEngagement", 45);
    setVal("st_tackling", 44);
    setVal("st_aggression", 44);
    setVal("st_speed", 84);
    setVal("st_acceleration", 88);
    setVal("st_kickingPower", 82);
    setVal("st_jumping", 56);
    setVal("st_physicalContact", 72);
    setVal("st_balance", 86);
    setVal("st_stamina", 78);
    showToast("تم تطبيق نموذج صانع الألعاب (AMF) ✓", "success");
  } else if (type === "cf") {
    setVal("st_attackingAwareness", 92);
    setVal("st_ballControl", 84);
    setVal("st_dribbling", 82);
    setVal("st_tightPossession", 80);
    setVal("st_lowPass", 74);
    setVal("st_loftedPass", 68);
    setVal("st_finishing", 94);
    setVal("st_heading", 82);
    setVal("st_setPieceTaking", 70);
    setVal("st_curl", 74);
    setVal("st_defensiveAwareness", 42);
    setVal("st_defensiveEngagement", 40);
    setVal("st_tackling", 40);
    setVal("st_aggression", 48);
    setVal("st_speed", 88);
    setVal("st_acceleration", 86);
    setVal("st_kickingPower", 90);
    setVal("st_jumping", 84);
    setVal("st_physicalContact", 85);
    setVal("st_balance", 78);
    setVal("st_stamina", 80);
    showToast("تم تطبيق نموذج المهاجم القناص (CF) ✓", "success");
  } else if (type === "cb") {
    setVal("st_attackingAwareness", 55);
    setVal("st_ballControl", 70);
    setVal("st_dribbling", 65);
    setVal("st_tightPossession", 66);
    setVal("st_lowPass", 74);
    setVal("st_loftedPass", 72);
    setVal("st_finishing", 50);
    setVal("st_heading", 88);
    setVal("st_setPieceTaking", 55);
    setVal("st_curl", 55);
    setVal("st_defensiveAwareness", 92);
    setVal("st_defensiveEngagement", 90);
    setVal("st_tackling", 94);
    setVal("st_aggression", 92);
    setVal("st_speed", 78);
    setVal("st_acceleration", 74);
    setVal("st_kickingPower", 82);
    setVal("st_jumping", 90);
    setVal("st_physicalContact", 92);
    setVal("st_balance", 70);
    setVal("st_stamina", 84);
    showToast("تم تطبيق نموذج المدافع الصلب (CB) ✓", "success");
  }
};

// ── Open / Close Player Modal ──
function openPlayerModal(isEdit = false) {
  if (playerModalOverlay) {
    playerModalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  // Reset tabs to first
  const firstTab = document.querySelector(".p-tab-btn[data-tab='basic']");
  if (firstTab) firstTab.click();
}

function closePlayerModal() {
  if (playerModalOverlay) {
    playerModalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
  resetPlayerForm();
}

if (addPlayerBtn) {
  addPlayerBtn.addEventListener("click", () => {
    editingPlayerId = null;
    playerModalTitle.textContent = "إضافة لاعب وتطويره";
    resetPlayerForm();
    openPlayerModal(false);
  });
}

if (playerModalClose)     playerModalClose.addEventListener("click", closePlayerModal);
if (playerModalCancelBtn) playerModalCancelBtn.addEventListener("click", closePlayerModal);
if (playerModalOverlay) {
  playerModalOverlay.addEventListener("click", (e) => {
    if (e.target === playerModalOverlay) closePlayerModal();
  });
}

// ── Reset Form ──
function resetPlayerForm() {
  if (playerForm) playerForm.reset();
  editingPlayerId   = null;
  playerImageBase64 = "";
  if (playerPreviewImg) { playerPreviewImg.src = ""; playerPreviewImg.classList.remove("visible"); }
  if (playerImagePreview) playerImagePreview.classList.remove("has-image");
  if (playerRemoveImgBtn) playerRemoveImgBtn.style.display = "none";
  if (basicSkillsList)      basicSkillsList.innerHTML = "";
  if (additionalSkillsList) additionalSkillsList.innerHTML = "";

  // Reset progression inputs to 0
  document.querySelectorAll(".prog-input").forEach(i => i.value = "0");

  // Reset default preset
  fillStatsPreset("amf");
}

// ── Image Upload ──
function processPlayerImage(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("يرجى اختيار ملف صورة صالح", "error");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast("حجم الصورة أكبر من 5MB", "error");
    return;
  }
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const compressed = typeof compressImage === "function"
        ? await compressImage(ev.target.result, 600, 800, 0.85)
        : ev.target.result;
      playerImageBase64 = compressed;
      if (playerPreviewImg) { playerPreviewImg.src = compressed; playerPreviewImg.classList.add("visible"); }
      if (playerImagePreview) playerImagePreview.classList.add("has-image");
      if (playerRemoveImgBtn) playerRemoveImgBtn.style.display = "flex";
      showToast("تم رفع صورة البطاقة بنجاح ✓", "success");
    } catch {
      playerImageBase64 = ev.target.result;
      if (playerPreviewImg) { playerPreviewImg.src = playerImageBase64; playerPreviewImg.classList.add("visible"); }
      if (playerImagePreview) playerImagePreview.classList.add("has-image");
      if (playerRemoveImgBtn) playerRemoveImgBtn.style.display = "flex";
    }
  };
  reader.readAsDataURL(file);
}

if (playerImagePreview) playerImagePreview.addEventListener("click", () => playerImageInput && playerImageInput.click());
if (playerImageInput) {
  playerImageInput.addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f) processPlayerImage(f);
  });
}
if (playerImageUploadArea) {
  playerImageUploadArea.addEventListener("dragover", (e) => { e.preventDefault(); playerImageUploadArea.classList.add("dragover"); });
  playerImageUploadArea.addEventListener("dragleave", () => playerImageUploadArea.classList.remove("dragover"));
  playerImageUploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    playerImageUploadArea.classList.remove("dragover");
    const f = e.dataTransfer.files[0];
    if (f) processPlayerImage(f);
  });
}
if (playerRemoveImgBtn) {
  playerRemoveImgBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    playerImageBase64 = "";
    if (playerPreviewImg) { playerPreviewImg.src = ""; playerPreviewImg.classList.remove("visible"); }
    if (playerImagePreview) playerImagePreview.classList.remove("has-image");
    playerRemoveImgBtn.style.display = "none";
    if (playerImageInput) playerImageInput.value = "";
  });
}

// ── Skills List Management ──
function addSkillItem(container, skillName = "") {
  if (!container) return;
  const item = document.createElement("div");
  item.className = "skill-list-item";
  item.innerHTML = `
    <span class="skill-list-emoji-btn">⚡</span>
    <input type="text" class="skill-list-input" value="${escHtml(skillName)}" placeholder="اسم المهارة...">
    <button type="button" class="skill-list-remove-btn" onclick="this.closest('.skill-list-item').remove()">✕</button>
  `;
  container.appendChild(item);
}

window.quickAddSkill = function(name) {
  if (!basicSkillsList) return;
  // Check if already added
  const existing = Array.from(basicSkillsList.querySelectorAll(".skill-list-input")).map(i => i.value.trim());
  if (existing.includes(name)) {
    showToast(`المهارة "${name}" مضافة بالفعل`, "warning");
    return;
  }
  addSkillItem(basicSkillsList, name);
  showToast(`تمت إضافة ${name} ✓`, "success");
};

if (addBasicSkillBtn) addBasicSkillBtn.addEventListener("click", () => addSkillItem(basicSkillsList));
if (addExtraSkillBtn) addExtraSkillBtn.addEventListener("click", () => addSkillItem(additionalSkillsList));

function collectSkills(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(".skill-list-input"))
    .map(i => i.value.trim())
    .filter(Boolean);
}

// ── Collect Progression Points ──
function collectProgression() {
  const getNum = (id) => Math.max(0, parseInt(document.getElementById(id)?.value) || 0);
  return {
    shooting:   getNum("progShooting"),
    passing:    getNum("progPassing"),
    dribbling:  getNum("progDribbling"),
    dexterity:  getNum("progDexterity"),
    lowerBody:  getNum("progLowerBody"),
    aerial:     getNum("progAerial"),
    defending:  getNum("progDefending"),
    gk1:        getNum("progGk1"),
    gk2:        getNum("progGk2"),
    gk3:        getNum("progGk3")
  };
}

// ── Collect In-Game Stats ──
function collectStats() {
  const getStat = (id) => parseInt(document.getElementById(id)?.value) || 40;
  return {
    // Attacking
    attackingAwareness: getStat("st_attackingAwareness"),
    ballControl:        getStat("st_ballControl"),
    dribbling:          getStat("st_dribbling"),
    tightPossession:    getStat("st_tightPossession"),
    lowPass:            getStat("st_lowPass"),
    loftedPass:         getStat("st_loftedPass"),
    finishing:          getStat("st_finishing"),
    heading:            getStat("st_heading"),
    setPieceTaking:     getStat("st_setPieceTaking"),
    curl:               getStat("st_curl"),

    // Defending
    defensiveAwareness:  getStat("st_defensiveAwareness"),
    defensiveEngagement: getStat("st_defensiveEngagement"),
    tackling:            getStat("st_tackling"),
    aggression:          getStat("st_aggression"),

    // Athleticism
    speed:           getStat("st_speed"),
    acceleration:    getStat("st_acceleration"),
    kickingPower:    getStat("st_kickingPower"),
    jumping:         getStat("st_jumping"),
    physicalContact: getStat("st_physicalContact"),
    balance:         getStat("st_balance"),
    stamina:         getStat("st_stamina"),

    // Goalkeeping
    gkAwareness: getStat("st_gkAwareness"),
    gkCatching:  getStat("st_gkCatching"),
    gkParrying:  getStat("st_gkParrying"),
    gkReflexes:  getStat("st_gkReflexes"),
    gkReach:     getStat("st_gkReach")
  };
}

// ── SAVE PLAYER (Add / Edit) ──
if (playerForm) {
  playerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name    = playerNameInput?.value.trim();
    const overall = parseInt(playerOverallInput?.value) || 0;
    const position = playerPositionInput?.value.trim() || "AMF";
    const compatiblePositionsStr = playerCompatiblePosInput?.value.trim() || "";
    const compatiblePositions = compatiblePositionsStr
      ? compatiblePositionsStr.split(",").map(s => s.trim().toUpperCase()).filter(Boolean)
      : [position.toUpperCase()];

    const offensivePlaystyle = playerOffensivePlaystyleInput?.value.trim() || "";
    const defensivePlaystyle = playerDefensivePlaystyleInput?.value.trim() || "";
    const playstyleDesc      = playerPlaystyleDescInput?.value.trim() || "";
    const booster            = playerBoosterInput?.value.trim() || "";
    const levelCap           = parseInt(playerLevelCapInput?.value) || 33;
    const maxPoints          = parseInt(playerMaxPointsInput?.value) || 64;
    const managerRating      = parseInt(playerManagerRatingInput?.value) || 70;

    const progression      = collectProgression();
    const stats            = collectStats();
    const skills           = collectSkills(basicSkillsList);
    const additionalSkills = collectSkills(additionalSkillsList);
    const comSkillsStr     = playerComSkillsInput?.value.trim() || "";
    const comSkills        = comSkillsStr ? comSkillsStr.split(",").map(s => s.trim()).filter(Boolean) : [];

    const otherStats = {
      weakFootUsage:    playerWeakFootUsage?.value || "Occasionally",
      weakFootAccuracy: playerWeakFootAccuracy?.value || "Very High",
      form:             playerFormSelect?.value || "Unwavering",
      injuryResistance: playerInjurySelect?.value || "Medium"
    };

    if (!name || !overall) {
      showToast("يرجى إدخال اسم اللاعب والـ Overall الإجمالي", "error");
      return;
    }

    playerModalSaveBtn.disabled = true;
    playerModalSaveBtn.style.opacity = "0.7";

    try {
      if (!firebaseDb) {
        showToast("Firebase غير متصل. تعذر الحفظ.", "error");
        return;
      }

      const id = editingPlayerId || getNextPlayerId();
      const existingPlayer = adminPlayers.find(p => p.id === id);

      let finalImage = playerImageBase64;
      if (!finalImage && existingPlayer && playerRemoveImgBtn?.style.display !== "none") {
        finalImage = existingPlayer.image || "";
      }

      const playerData = {
        id,
        name,
        overall,
        position,
        compatiblePositions,
        offensivePlaystyle,
        defensivePlaystyle,
        playstyle: offensivePlaystyle || defensivePlaystyle || "",
        playstyleDesc,
        booster,
        levelCap,
        maxPoints,
        managerRating,
        progression,
        stats,
        skills,
        additionalSkills,
        comSkills,
        otherStats,
        image: finalImage,
        updatedAt: Date.now()
      };

      await firebaseDb.ref(`${PLAYERS_DB_PATH}/p_${id}`).set(playerData);
      showToast(editingPlayerId ? "تم تعديل اللاعب وتحديثه عند الجميع ⚡" : "تم إضافة وتطوير اللاعب ونشره فوراً في الموقع ⚡", "success");
      closePlayerModal();
    } catch (err) {
      console.error("Save player error:", err);
      showToast("حدث خطأ أثناء الحفظ: " + (err.message || ""), "error");
    } finally {
      playerModalSaveBtn.disabled = false;
      playerModalSaveBtn.style.opacity = "1";
    }
  });
}

// ── EDIT PLAYER ──
window.openPlayerEditModal = function(id) {
  const player = adminPlayers.find(p => p.id === id);
  if (!player) return;

  editingPlayerId = id;
  playerModalTitle.textContent = "تعديل تطوير اللاعب";

  // Basic Info
  if (playerNameInput)          playerNameInput.value          = player.name || "";
  if (playerOverallInput)       playerOverallInput.value       = player.overall || "";
  if (playerPositionInput)      playerPositionInput.value      = player.position || "";
  if (playerOffensivePlaystyleInput) playerOffensivePlaystyleInput.value = player.offensivePlaystyle || player.playstyle || "";
  if (playerDefensivePlaystyleInput) playerDefensivePlaystyleInput.value = player.defensivePlaystyle || "";
  if (playerPlaystyleDescInput)      playerPlaystyleDescInput.value      = player.playstyleDesc || "";
  if (playerBoosterInput)            playerBoosterInput.value            = player.booster || "";
  if (playerLevelCapInput)           playerLevelCapInput.value           = player.levelCap || 33;
  if (playerMaxPointsInput)     playerMaxPointsInput.value     = player.maxPoints || 64;
  if (playerManagerRatingInput) playerManagerRatingInput.value = player.managerRating || 70;

  // Progression Points
  const prog = player.progression || {};
  const setProg = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || 0; };
  setProg("progShooting", prog.shooting);
  setProg("progPassing", prog.passing);
  setProg("progDribbling", prog.dribbling);
  setProg("progDexterity", prog.dexterity);
  setProg("progLowerBody", prog.lowerBody);
  setProg("progAerial", prog.aerial);
  setProg("progDefending", prog.defending);
  setProg("progGk1", prog.gk1);
  setProg("progGk2", prog.gk2);
  setProg("progGk3", prog.gk3);

  // In-Game Stats
  const st = player.stats || {};
  const setSt = (id, val, def) => { const el = document.getElementById(id); if (el) el.value = (val !== undefined && val !== null) ? val : def; };
  setSt("st_attackingAwareness", st.attackingAwareness, 80);
  setSt("st_ballControl", st.ballControl, 84);
  setSt("st_dribbling", st.dribbling, 86);
  setSt("st_tightPossession", st.tightPossession, 85);
  setSt("st_lowPass", st.lowPass, 84);
  setSt("st_loftedPass", st.loftedPass, 78);
  setSt("st_finishing", st.finishing, 79);
  setSt("st_heading", st.heading, 55);
  setSt("st_setPieceTaking", st.setPieceTaking, 69);
  setSt("st_curl", st.curl, 75);

  setSt("st_defensiveAwareness", st.defensiveAwareness, 43);
  setSt("st_defensiveEngagement", st.defensiveEngagement, 43);
  setSt("st_tackling", st.tackling, 42);
  setSt("st_aggression", st.aggression, 42);

  setSt("st_speed", st.speed, 80);
  setSt("st_acceleration", st.acceleration, 84);
  setSt("st_kickingPower", st.kickingPower, 80);
  setSt("st_jumping", st.jumping, 54);
  setSt("st_physicalContact", st.physicalContact, 73);
  setSt("st_balance", st.balance, 82);
  setSt("st_stamina", st.stamina, 73);

  setSt("st_gkAwareness", st.gkAwareness, 40);
  setSt("st_gkCatching", st.gkCatching, 40);
  setSt("st_gkParrying", st.gkParrying, 40);
  setSt("st_gkReflexes", st.gkReflexes, 40);
  setSt("st_gkReach", st.gkReach, 40);

  // Skills
  if (basicSkillsList) basicSkillsList.innerHTML = "";
  const skillsList = player.skills || (player.basicSkills ? player.basicSkills.map(s => typeof s === 'string' ? s : s.name) : []);
  skillsList.forEach(s => addSkillItem(basicSkillsList, s));

  if (additionalSkillsList) additionalSkillsList.innerHTML = "";
  const addSkills = player.additionalSkills || [];
  addSkills.forEach(s => addSkillItem(additionalSkillsList, typeof s === 'string' ? s : s.name));

  if (playerComSkillsInput) playerComSkillsInput.value = (player.comSkills || []).join(", ");

  // Other Stats
  const ot = player.otherStats || {};
  if (playerWeakFootUsage)    playerWeakFootUsage.value    = ot.weakFootUsage || "Occasionally";
  if (playerWeakFootAccuracy) playerWeakFootAccuracy.value = ot.weakFootAccuracy || "Very High";
  if (playerFormSelect)       playerFormSelect.value       = ot.form || "Unwavering";
  if (playerInjurySelect)     playerInjurySelect.value     = ot.injuryResistance || "Medium";

  // Image Preview
  if (player.image) {
    playerImageBase64 = player.image;
    if (playerPreviewImg) { playerPreviewImg.src = player.image; playerPreviewImg.classList.add("visible"); }
    if (playerImagePreview) playerImagePreview.classList.add("has-image");
    if (playerRemoveImgBtn) playerRemoveImgBtn.style.display = "flex";
  } else {
    playerImageBase64 = "";
    if (playerPreviewImg) { playerPreviewImg.src = ""; playerPreviewImg.classList.remove("visible"); }
    if (playerImagePreview) playerImagePreview.classList.remove("has-image");
    if (playerRemoveImgBtn) playerRemoveImgBtn.style.display = "none";
  }

  openPlayerModal(true);
};

// ── DELETE PLAYER ──
window.openPlayerDeleteModal = function(id) {
  const player = adminPlayers.find(p => p.id === id);
  if (!player) return;

  deletingPlayerId = id;
  if (deletePlayerNameEl) deletePlayerNameEl.textContent = player.name;
  if (playerDeleteModalOverlay) {
    playerDeleteModalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
};

function closePlayerDeleteModal() {
  if (playerDeleteModalOverlay) {
    playerDeleteModalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
  deletingPlayerId = null;
}

if (playerDeleteCancelBtn)  playerDeleteCancelBtn.addEventListener("click", closePlayerDeleteModal);
if (playerDeleteModalOverlay) {
  playerDeleteModalOverlay.addEventListener("click", (e) => {
    if (e.target === playerDeleteModalOverlay) closePlayerDeleteModal();
  });
}

if (playerDeleteConfirmBtn) {
  playerDeleteConfirmBtn.addEventListener("click", async () => {
    if (!deletingPlayerId) return;

    playerDeleteConfirmBtn.disabled = true;
    playerDeleteConfirmBtn.style.opacity = "0.7";

    try {
      if (!firebaseDb) {
        showToast("Firebase غير متصل. تعذر الحذف.", "error");
        return;
      }

      await firebaseDb.ref(`${PLAYERS_DB_PATH}/p_${deletingPlayerId}`).remove();
      showToast("تم حذف اللاعب وتحديث الموقع فوراً ⚡", "success");
      closePlayerDeleteModal();
    } catch (err) {
      console.error("Delete player error:", err);
      showToast("حدث خطأ أثناء الحذف: " + (err.message || ""), "error");
    } finally {
      playerDeleteConfirmBtn.disabled = false;
      playerDeleteConfirmBtn.style.opacity = "1";
    }
  });
}

// ── Helpers ──
function getNextPlayerId() {
  if (adminPlayers.length === 0) return 1;
  const ids = adminPlayers.map(p => Number(p.id) || 0);
  return Math.max(...ids) + 1;
}

function escHtml(str) {
  if (!str) return "";
  const d = document.createElement("div");
  d.textContent = String(str);
  return d.innerHTML;
}

// ── Initialize on load ──
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (typeof firebaseDb !== "undefined" && firebaseDb && !isSubscribedToPlayers) {
      setupPlayersAdminSync();
    }
  }, 500);
});
