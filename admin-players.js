/* ═══════════════════════════════════════════════
   RODRIGO Admin — Players Management
   JavaScript Controller
   ═══════════════════════════════════════════════ */

const PLAYERS_DB_PATH = "rodrigo_players";

// ── State ──
let adminPlayers   = [];
let editingPlayerId = null;
let deletingPlayerId = null;
let playerImageBase64 = "";
let isSubscribedToPlayers = false;

// ── DOM References ──
const addPlayerBtn          = document.getElementById("addPlayerBtn");
const playerModalOverlay    = document.getElementById("playerModalOverlay");
const playerModalClose      = document.getElementById("playerModalClose");
const playerModalCancelBtn  = document.getElementById("playerModalCancelBtn");
const playerModalSaveBtn    = document.getElementById("playerModalSaveBtn");
const playerModalTitle      = document.getElementById("playerModalTitle");
const playerForm            = document.getElementById("playerForm");

const playerNameInput       = document.getElementById("playerName");
const playerOverallInput    = document.getElementById("playerOverall");
const playerPositionInput   = document.getElementById("playerPosition");
const playerUpdateLabelInput= document.getElementById("playerUpdateLabel");
const playerPagePathInput   = document.getElementById("playerPagePath");

const playerImageInput      = document.getElementById("playerImageInput");
const playerImagePreview    = document.getElementById("playerImagePreview");
const playerPreviewImg      = document.getElementById("playerPreviewImg");
const playerRemoveImgBtn    = document.getElementById("playerRemoveImgBtn");
const playerImageUploadArea = document.getElementById("playerImageUploadArea");

const developmentsList      = document.getElementById("developmentsList");
const addDevBtn             = document.getElementById("addDevBtn");
const basicSkillsList       = document.getElementById("basicSkillsList");
const addBasicSkillBtn      = document.getElementById("addBasicSkillBtn");
const additionalSkillsList  = document.getElementById("additionalSkillsList");
const addExtraSkillBtn      = document.getElementById("addExtraSkillBtn");

const playersTableBody      = document.getElementById("playersTableBody");
const playersTable          = document.getElementById("playersTable");
const playersTableEmpty     = document.getElementById("playersTableEmpty");

const playerDeleteModalOverlay = document.getElementById("playerDeleteModalOverlay");
const playerDeleteCancelBtn    = document.getElementById("playerDeleteCancelBtn");
const playerDeleteConfirmBtn   = document.getElementById("playerDeleteConfirmBtn");
const deletePlayerNameEl       = document.getElementById("deletePlayerName");

// ── Tab Switching ──
window.switchAdminTab = function(tab) {
  // Update tab buttons
  document.querySelectorAll(".admin-nav-tab").forEach(btn => {
    btn.classList.remove("active");
  });

  if (tab === "files") {
    document.getElementById("tabFiles").classList.add("active");
    document.getElementById("panelFiles").classList.add("active");
    document.getElementById("panelPlayers").classList.remove("active");
  } else {
    document.getElementById("tabPlayers").classList.add("active");
    document.getElementById("panelPlayers").classList.add("active");
    document.getElementById("panelFiles").classList.remove("active");
    // Load players when tab first opened
    if (!isSubscribedToPlayers) setupPlayersAdminSync();
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

    // Basic skills preview
    const basicSkills = player.basicSkills || [];
    const skillsPreviewHTML = basicSkills.length > 0
      ? `<div class="skills-preview">
          ${basicSkills.slice(0, 3).map(s => `<span class="skill-preview-tag">${escHtml(s.icon || "")} ${escHtml(s.name || s)}</span>`).join("")}
          ${basicSkills.length > 3 ? `<span class="skill-preview-more">+${basicSkills.length - 3}</span>` : ""}
        </div>`
      : `<span style="color:var(--text-tertiary);font-size:0.8rem;">—</span>`;

    // Page path
    const pagePath = player.pagePath
      ? `<a href="${encodeURI(player.pagePath)}" target="_blank" style="color:var(--accent-secondary);font-size:0.8rem;text-decoration:none;" title="${escHtml(player.pagePath)}">📄 ${escHtml(player.pagePath.split("/").pop())}</a>`
      : `<span style="color:var(--text-tertiary);font-size:0.8rem;">—</span>`;

    tr.innerHTML = `
      <td>
        ${player.image
          ? `<img src="${player.image}" class="player-table-img" alt="${escHtml(player.name)}">`
          : `<div class="player-table-img-placeholder">🎮</div>`}
      </td>
      <td>
        <strong>${escHtml(player.name)}</strong>
        ${player.position ? `<div style="margin-top:4px;"><span style="font-size:0.75rem;color:var(--accent-secondary);">${escHtml(player.position)}</span></div>` : ""}
        ${player.updateLabel ? `<div style="margin-top:4px;font-size:0.72rem;color:#a855f7;">✦ ${escHtml(player.updateLabel)}</div>` : ""}
      </td>
      <td>
        <span class="overall-badge">${player.overall || "—"}</span>
      </td>
      <td>${skillsPreviewHTML}</td>
      <td>${pagePath}</td>
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

// ── Next Player ID ──
function getNextPlayerId() {
  if (adminPlayers.length === 0) return Date.now();
  return Math.max(...adminPlayers.map(p => p.id || 0)) + 1;
}

// ── Open Add Modal ──
if (addPlayerBtn) {
  addPlayerBtn.addEventListener("click", () => {
    resetPlayerForm();
    playerModalTitle.textContent = "إضافة لاعب جديد";
    editingPlayerId = null;
    openPlayerModal();
  });
}

function openPlayerModal() {
  if (playerModalOverlay) {
    playerModalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closePlayerModal() {
  if (playerModalOverlay) {
    playerModalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
  resetPlayerForm();
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
  editingPlayerId  = null;
  playerImageBase64 = "";
  if (playerPreviewImg) { playerPreviewImg.src = ""; playerPreviewImg.classList.remove("visible"); }
  if (playerImagePreview) playerImagePreview.classList.remove("has-image");
  if (playerRemoveImgBtn) playerRemoveImgBtn.style.display = "none";
  if (developmentsList)    developmentsList.innerHTML = "";
  if (basicSkillsList)     basicSkillsList.innerHTML = "";
  if (additionalSkillsList) additionalSkillsList.innerHTML = "";
}

// ── Image Upload (Reuse admin's compressImage function) ──
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
        ? await compressImage(ev.target.result, 600, 800, 0.82)
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

// ════════════════════════════════
// DEVELOPMENTS LIST MANAGEMENT
// ════════════════════════════════

function addDevItem(data = {}) {
  const item = document.createElement("div");
  item.className = "dev-list-item";
  item.innerHTML = `
    <div class="dev-list-item-header">
      <input type="text" class="dev-emoji-input" value="${data.icon || '⚡'}" placeholder="⚡" maxlength="4" title="أيقونة/إيموجي">
      <input type="text" class="dev-title-input" value="${escHtml(data.title || '')}" placeholder="عنوان التطوير...">
      <button type="button" class="dev-remove-btn" onclick="this.closest('.dev-list-item').remove()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        حذف
      </button>
    </div>
    <textarea class="dev-desc-input" placeholder="وصف اختياري للتطوير...">${escHtml(data.desc || '')}</textarea>
  `;
  if (developmentsList) developmentsList.appendChild(item);
}

if (addDevBtn) addDevBtn.addEventListener("click", () => addDevItem());

// ════════════════════════════════
// SKILLS LIST MANAGEMENT
// ════════════════════════════════

function addSkillItem(container, data = {}) {
  const item = document.createElement("div");
  item.className = "skill-list-item";
  item.innerHTML = `
    <input type="text" class="dev-emoji-input skill-list-emoji-btn" value="${data.icon || '✦'}" placeholder="✦" maxlength="4" title="أيقونة">
    <input type="text" class="skill-list-input" value="${escHtml(data.name || '')}" placeholder="اسم المهارة...">
    <button type="button" class="skill-list-remove-btn" onclick="this.closest('.skill-list-item').remove()">✕</button>
  `;
  if (container) container.appendChild(item);
}

if (addBasicSkillBtn)   addBasicSkillBtn.addEventListener("click",   () => addSkillItem(basicSkillsList));
if (addExtraSkillBtn)   addExtraSkillBtn.addEventListener("click",   () => addSkillItem(additionalSkillsList));

// ── Collect form data ──
function collectDevelopments() {
  if (!developmentsList) return [];
  return Array.from(developmentsList.querySelectorAll(".dev-list-item")).map(item => ({
    icon:  item.querySelector(".dev-emoji-input")?.value?.trim() || "⚡",
    title: item.querySelector(".dev-title-input")?.value?.trim() || "",
    desc:  item.querySelector(".dev-desc-input")?.value?.trim()  || ""
  })).filter(d => d.title);
}

function collectSkills(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(".skill-list-item")).map(item => ({
    icon: item.querySelector(".dev-emoji-input")?.value?.trim() || "✦",
    name: item.querySelector(".skill-list-input")?.value?.trim() || ""
  })).filter(s => s.name);
}

// ════════════════════════════════
// SAVE PLAYER (Add/Edit)
// ════════════════════════════════

if (playerForm) {
  playerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name    = playerNameInput?.value.trim();
    const overall = parseInt(playerOverallInput?.value) || 0;
    const position     = playerPositionInput?.value.trim();
    const updateLabel  = playerUpdateLabelInput?.value.trim();
    const pagePath     = playerPagePathInput?.value.trim();
    const developments = collectDevelopments();
    const basicSkills  = collectSkills(basicSkillsList);
    const additionalSkills = collectSkills(additionalSkillsList);

    if (!name || !overall) {
      showToast("يرجى إدخال اسم اللاعب والـ Overall", "error");
      return;
    }

    playerModalSaveBtn.disabled = true;
    playerModalSaveBtn.style.opacity = "0.7";

    try {
      if (!firebaseDb) {
        showToast("Firebase غير متصل. تعذر الحفظ.", "error");
        return;
      }

      if (editingPlayerId) {
        // Edit existing player
        const playerData = {
          id: editingPlayerId, name, overall, position, updateLabel, pagePath,
          developments, basicSkills, additionalSkills,
          image: playerImageBase64 || (adminPlayers.find(p => p.id === editingPlayerId)?.image || "")
        };
        // If image was removed (no base64 and removeBtn hidden)
        if (!playerImageBase64 && playerRemoveImgBtn?.style.display === "none") {
          playerData.image = "";
        }
        await firebaseDb.ref(`${PLAYERS_DB_PATH}/p_${editingPlayerId}`).set(playerData);
        showToast("تم تعديل اللاعب وتطبيق التغييرات فوراً عند الجميع ⚡", "success");
      } else {
        // Add new player
        const newId = getNextPlayerId();
        const playerData = {
          id: newId, name, overall, position, updateLabel, pagePath,
          developments, basicSkills, additionalSkills,
          image: playerImageBase64
        };
        await firebaseDb.ref(`${PLAYERS_DB_PATH}/p_${newId}`).set(playerData);
        showToast("تم إضافة اللاعب وظهوره فوراً في الموقع ⚡", "success");
      }

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

// ════════════════════════════════
// EDIT PLAYER
// ════════════════════════════════

window.openPlayerEditModal = function(id) {
  const player = adminPlayers.find(p => p.id === id);
  if (!player) return;

  editingPlayerId = id;
  playerModalTitle.textContent = "تعديل اللاعب";

  if (playerNameInput)        playerNameInput.value        = player.name || "";
  if (playerOverallInput)     playerOverallInput.value     = player.overall || "";
  if (playerPositionInput)    playerPositionInput.value    = player.position || "";
  if (playerUpdateLabelInput) playerUpdateLabelInput.value = player.updateLabel || "";
  if (playerPagePathInput)    playerPagePathInput.value    = player.pagePath || "";

  // Image
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

  // Developments
  if (developmentsList) developmentsList.innerHTML = "";
  (player.developments || []).forEach(d => addDevItem(d));

  // Basic Skills
  if (basicSkillsList) basicSkillsList.innerHTML = "";
  (player.basicSkills || []).forEach(s => addSkillItem(basicSkillsList, s));

  // Additional Skills
  if (additionalSkillsList) additionalSkillsList.innerHTML = "";
  (player.additionalSkills || []).forEach(s => addSkillItem(additionalSkillsList, s));

  openPlayerModal();
};

// ════════════════════════════════
// DELETE PLAYER
// ════════════════════════════════

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

if (playerDeleteCancelBtn) playerDeleteCancelBtn.addEventListener("click", closePlayerDeleteModal);
if (playerDeleteModalOverlay) {
  playerDeleteModalOverlay.addEventListener("click", (e) => {
    if (e.target === playerDeleteModalOverlay) closePlayerDeleteModal();
  });
}

if (playerDeleteConfirmBtn) {
  playerDeleteConfirmBtn.addEventListener("click", async () => {
    if (!deletingPlayerId || !firebaseDb) return;
    try {
      playerDeleteConfirmBtn.disabled = true;
      await firebaseDb.ref(`${PLAYERS_DB_PATH}/p_${deletingPlayerId}`).remove();
      showToast("تم حذف اللاعب من الموقع فوراً ✓", "success");
      closePlayerDeleteModal();
    } catch (err) {
      showToast("حدث خطأ أثناء الحذف: " + (err.message || ""), "error");
    } finally {
      playerDeleteConfirmBtn.disabled = false;
    }
  });
}

// ── Helper ──
function escHtml(str) {
  if (!str) return "";
  const d = document.createElement("div");
  d.textContent = String(str);
  return d.innerHTML;
}

// ── Keyboard shortcuts for players modals ──
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (playerModalOverlay?.classList.contains("active")) closePlayerModal();
    if (playerDeleteModalOverlay?.classList.contains("active")) closePlayerDeleteModal();
  }
});
