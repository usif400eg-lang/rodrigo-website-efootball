/* ═══════════════════════════════════════════════
   RODRIGO Admin — Managers Management JS
   ═══════════════════════════════════════════════ */

// ── Database Paths ──
const MANAGERS_DB_PATH = "rodrigo_managers";
const PLAYER_STYLES_DB_PATH = "rodrigo_player_playstyles";

// ── State ──
let adminManagers = [];
let editingManagerId = null;
let deletingManagerId = null;
let mgrImageBase64 = "";
let isSubscribedToManagers = false;
let selectedPlaystyle = "";

let adminPlayerStyles = [];
let editingPlayerStyleId = null;
let deletingPlayerStyleId = null;
let isSubscribedToPlayerStyles = false;
let currentPsCategoryFilter = "all";

// ── Playstyle metadata ──
const PLAYSTYLES = {
  "Possession Game":    { emoji: "🎯", badge: "badge-possession", en: "Possession Game",    ar: "لعبة الاستحواذ" },
  "Long Ball Counter":  { emoji: "⚡", badge: "badge-longball-c", en: "Long Ball Counter",   ar: "كونتر الكرة الطويلة" },
  "Quick Counter":      { emoji: "💨", badge: "badge-quick-c",    en: "Quick Counter",       ar: "الكونتر السريع" },
  "Long Ball":          { emoji: "🚀", badge: "badge-longball",   en: "Long Ball",           ar: "الكرة الطويلة" },
  "Out Wide":           { emoji: "🏃", badge: "badge-out-wide",   en: "Out Wide",            ar: "من الجانب" },
  "Overload":           { emoji: "💪", badge: "badge-overload",   en: "Overload",            ar: "التكثيف" },
};

// ── DOM: Managers ──
const addManagerBtn         = document.getElementById("addManagerBtn");
const mgrModalOverlay       = document.getElementById("mgrModalOverlay");
const mgrModalClose         = document.getElementById("mgrModalClose");
const mgrModalCancelBtn     = document.getElementById("mgrModalCancelBtn");
const mgrModalSaveBtn       = document.getElementById("mgrModalSaveBtn");
const mgrModalTitle         = document.getElementById("mgrModalTitle");
const mgrForm               = document.getElementById("mgrForm");
const mgrNameInput          = document.getElementById("mgrName");
const mgrNationalityInput   = document.getElementById("mgrNationality");
const mgrDescInput          = document.getElementById("mgrDesc");
const mgrPlaystyleDetailInput = document.getElementById("mgrPlaystyleDetail");
const playstyleOptionsEl    = document.getElementById("playstyleOptions");
const mgrImageInput         = document.getElementById("mgrImageInput");
const mgrImagePreview       = document.getElementById("mgrImagePreview");
const mgrPreviewImg         = document.getElementById("mgrPreviewImg");
const mgrRemoveImgBtn       = document.getElementById("mgrRemoveImgBtn");
const mgrImageUploadArea    = document.getElementById("mgrImageUploadArea");
const mgrDeleteOverlay      = document.getElementById("mgrDeleteOverlay");
const mgrDeleteName         = document.getElementById("mgrDeleteName");
const mgrDeleteCancelBtn    = document.getElementById("mgrDeleteCancelBtn");
const mgrDeleteConfirmBtn   = document.getElementById("mgrDeleteConfirmBtn");
const managersTableBody     = document.getElementById("managersTableBody");
const managersTable         = document.getElementById("managersTable");
const managersTableEmpty    = document.getElementById("managersTableEmpty");
const mgrSearchInput        = document.getElementById("mgrSearch");
const mgrBoost1Input        = document.getElementById("mgrBoost1");
const mgrBoost2Input        = document.getElementById("mgrBoost2");
const mgrStatPossessionInput = document.getElementById("mgrStatPossession");
const mgrStatLBCInput       = document.getElementById("mgrStatLBC");
const mgrStatQCInput        = document.getElementById("mgrStatQC");
const mgrStatLBInput        = document.getElementById("mgrStatLB");
const mgrStatOWInput        = document.getElementById("mgrStatOW");
const mgrStatOverloadInput  = document.getElementById("mgrStatOverload");

// ── DOM: Subtabs & Player Playstyles ──
const subtabMgrs            = document.getElementById("subtabMgrs");
const subtabPStyles         = document.getElementById("subtabPStyles");
const subviewManagers       = document.getElementById("subviewManagers");
const subviewPlayerStyles   = document.getElementById("subviewPlayerStyles");

const addPlayerStyleBtn     = document.getElementById("addPlayerStyleBtn");
const psSearchInput         = document.getElementById("psSearchInput");
const pStylesTable          = document.getElementById("pStylesTable");
const pStylesTableBody      = document.getElementById("pStylesTableBody");
const pStylesTableEmpty     = document.getElementById("pStylesTableEmpty");
const psAdminCatFilters     = document.getElementById("psAdminCatFilters");

// Player Style Modal
const psModalAdminOverlay   = document.getElementById("psModalAdminOverlay");
const psModalAdminClose     = document.getElementById("psModalAdminClose");
const psModalAdminCancelBtn = document.getElementById("psModalAdminCancelBtn");
const psModalAdminSaveBtn   = document.getElementById("psModalAdminSaveBtn");
const psAdminModalTitle     = document.getElementById("psAdminModalTitle");
const psAdminForm           = document.getElementById("psAdminForm");
const psNameEnInput         = document.getElementById("psNameEn");
const psNameArInput         = document.getElementById("psNameAr");
const psCategoryInput       = document.getElementById("psCategory");
const psIconInput           = document.getElementById("psIcon");
const psActivePosInput      = document.getElementById("psActivePos");
const psInactivePosInput    = document.getElementById("psInactivePos");
const psShortDescInput      = document.getElementById("psShortDesc");
const psFullDescInput       = document.getElementById("psFullDesc");
const psSynergyInput        = document.getElementById("psSynergy");
const psFamousInput         = document.getElementById("psFamous");

// Player Style Delete Modal
const psDeleteOverlay       = document.getElementById("psDeleteOverlay");
const psDeleteName          = document.getElementById("psDeleteName");
const psDeleteCancelBtn     = document.getElementById("psDeleteCancelBtn");
const psDeleteConfirmBtn    = document.getElementById("psDeleteConfirmBtn");

// ── Init ──
function loadManagers() {
  if (typeof firebaseDb === "undefined" || !firebaseDb) return;
  if (isSubscribedToManagers) return;
  isSubscribedToManagers = true;

  firebaseDb.ref(MANAGERS_DB_PATH).on("value", (snap) => {
    const data = snap.val();
    if (data && typeof data === "object") {
      adminManagers = Object.entries(data).map(([key, val]) => ({ _key: key, ...val }));
      adminManagers.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      adminManagers = [];
    }
    renderManagersTable(mgrSearchInput ? mgrSearchInput.value.trim() : "");
  });
}

// ── Render Table ──
function renderManagersTable(search = "") {
  const filtered = adminManagers.filter(m =>
    !search ||
    (m.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.playstyle || "").toLowerCase().includes(search.toLowerCase()) ||
    (m.nationality || "").toLowerCase().includes(search.toLowerCase())
  );

  managersTableBody.innerHTML = "";

  if (filtered.length === 0) {
    managersTable.style.display = "none";
    managersTableEmpty.style.display = "block";
    return;
  }

  managersTable.style.display = "table";
  managersTableEmpty.style.display = "none";

  filtered.forEach(m => {
    const ps = PLAYSTYLES[m.playstyle] || {};
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        ${m.image
          ? `<img src="${m.image}" class="mgr-table-img" alt="${escapeHtml(m.name || '')}">`
          : `<div class="mgr-table-img-placeholder">${ps.emoji || "👤"}</div>`}
      </td>
      <td><strong>${escapeHtml(m.name || "—")}</strong></td>
      <td>${m.nationality ? escapeHtml(m.nationality) : '<span style="color:var(--text-tertiary)">—</span>'}</td>
      <td>
        ${m.playstyle
          ? `<span class="mgr-style-badge ${ps.badge || ''}">${ps.emoji || ''} ${escapeHtml(m.playstyle)}</span>`
          : '—'}
      </td>
      <td>
        <div class="actions-cell">
          <button class="btn-icon edit" onclick="openEditMgr('${m._key}')" title="تعديل">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon delete" onclick="openDeleteMgr('${m._key}')" title="حذف">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    `;
    managersTableBody.appendChild(tr);
  });
}

// ── Modal Open/Close ──
function openMgrModal() { mgrModalOverlay.classList.add("active"); document.body.style.overflow = "hidden"; }
function closeMgrModal() { mgrModalOverlay.classList.remove("active"); document.body.style.overflow = ""; resetMgrForm(); }

function resetMgrForm() {
  mgrForm.reset();
  editingManagerId = null;
  mgrImageBase64 = "";
  selectedPlaystyle = "";
  mgrPreviewImg.src = "";
  mgrPreviewImg.classList.remove("visible");
  mgrImagePreview.classList.remove("has-image");
  mgrRemoveImgBtn.style.display = "none";
  mgrModalTitle.textContent = "إضافة مدرب جديد";
  if (mgrBoost1Input) mgrBoost1Input.value = "";
  if (mgrBoost2Input) mgrBoost2Input.value = "";
  if (mgrStatPossessionInput) mgrStatPossessionInput.value = 65;
  if (mgrStatLBCInput) mgrStatLBCInput.value = 65;
  if (mgrStatQCInput) mgrStatQCInput.value = 65;
  if (mgrStatLBInput) mgrStatLBInput.value = 60;
  if (mgrStatOWInput) mgrStatOWInput.value = 64;
  if (mgrStatOverloadInput) mgrStatOverloadInput.value = 65;
  renderPlaystyleOptions();
}

// ── Playstyle selector ──
function renderPlaystyleOptions() {
  if (!playstyleOptionsEl) return;
  playstyleOptionsEl.innerHTML = Object.entries(PLAYSTYLES).map(([key, ps]) => `
    <div class="playstyle-option ${selectedPlaystyle === key ? 'selected' : ''}"
         onclick="selectPlaystyle('${key}')">
      <span class="po-emoji">${ps.emoji}</span>
      ${ps.en}
    </div>
  `).join("");
}

window.selectPlaystyle = function(key) {
  selectedPlaystyle = key;
  renderPlaystyleOptions();
};

// ── Add Button ──
addManagerBtn && addManagerBtn.addEventListener("click", () => {
  resetMgrForm();
  openMgrModal();
  renderPlaystyleOptions();
});

mgrModalClose && mgrModalClose.addEventListener("click", closeMgrModal);
mgrModalCancelBtn && mgrModalCancelBtn.addEventListener("click", closeMgrModal);
mgrModalOverlay && mgrModalOverlay.addEventListener("click", (e) => {
  if (e.target === mgrModalOverlay) closeMgrModal();
});

// ── Image ──
function compressMgrImage(dataUrl, maxW = 600, maxH = 750, q = 0.82) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      let { width: w, height: h } = img;
      if (w > maxW || h > maxH) {
        if (w / maxW > h / maxH) { h = Math.round(h * maxW / w); w = maxW; }
        else { w = Math.round(w * maxH / h); h = maxH; }
      }
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      c.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/webp", q));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function processMgrImage(file) {
  if (!file || !file.type.startsWith("image/")) { showToast("يرجى اختيار صورة صالحة", "error"); return; }
  if (file.size > 5 * 1024 * 1024) { showToast("حجم الصورة أكبر من 5MB", "error"); return; }
  const reader = new FileReader();
  reader.onload = async (ev) => {
    const compressed = await compressMgrImage(ev.target.result);
    mgrImageBase64 = compressed;
    mgrPreviewImg.src = compressed;
    mgrPreviewImg.classList.add("visible");
    mgrImagePreview.classList.add("has-image");
    mgrRemoveImgBtn.style.display = "flex";
    showToast("تم رفع صورة المدرب ✓", "success");
  };
  reader.readAsDataURL(file);
}

mgrImagePreview && mgrImagePreview.addEventListener("click", () => mgrImageInput.click());
mgrImageInput && mgrImageInput.addEventListener("change", (e) => { if (e.target.files[0]) processMgrImage(e.target.files[0]); });
mgrImageUploadArea && mgrImageUploadArea.addEventListener("dragover", (e) => { e.preventDefault(); mgrImageUploadArea.classList.add("dragover"); });
mgrImageUploadArea && mgrImageUploadArea.addEventListener("dragleave", () => mgrImageUploadArea.classList.remove("dragover"));
mgrImageUploadArea && mgrImageUploadArea.addEventListener("drop", (e) => {
  e.preventDefault(); mgrImageUploadArea.classList.remove("dragover");
  if (e.dataTransfer.files[0]) processMgrImage(e.dataTransfer.files[0]);
});
mgrRemoveImgBtn && mgrRemoveImgBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  mgrImageBase64 = ""; mgrPreviewImg.src = "";
  mgrPreviewImg.classList.remove("visible"); mgrImagePreview.classList.remove("has-image");
  mgrRemoveImgBtn.style.display = "none"; mgrImageInput.value = "";
});

// ── Save ──
mgrForm && mgrForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name     = mgrNameInput.value.trim();
  const nat      = mgrNationalityInput ? mgrNationalityInput.value.trim() : "";
  const desc     = mgrDescInput.value.trim();
  const psDetail = mgrPlaystyleDetailInput ? mgrPlaystyleDetailInput.value.trim() : "";
  const boost1   = mgrBoost1Input ? mgrBoost1Input.value.trim() : "";
  const boost2   = mgrBoost2Input ? mgrBoost2Input.value.trim() : "";
  const boosters = [boost1, boost2].filter(Boolean);

  const stats = {
    possession: Number(mgrStatPossessionInput?.value) || 65,
    longBallCounter: Number(mgrStatLBCInput?.value) || 65,
    quickCounter: Number(mgrStatQCInput?.value) || 65,
    longBall: Number(mgrStatLBInput?.value) || 60,
    outWide: Number(mgrStatOWInput?.value) || 64,
    overload: Number(mgrStatOverloadInput?.value) || 65
  };

  // Determine top playstyle if not explicitly set
  let topStyle = selectedPlaystyle;
  if (!topStyle) {
    const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    const topKey = sorted[0][0];
    const mapKeys = {
      possession: "Possession Game",
      longBallCounter: "Long Ball Counter",
      quickCounter: "Quick Counter",
      longBall: "Long Ball",
      outWide: "Out Wide",
      overload: "Overload"
    };
    topStyle = mapKeys[topKey] || "Possession Game";
  }

  if (!name) { showToast("يرجى إدخال اسم المدرب", "error"); return; }

  mgrModalSaveBtn.disabled = true; mgrModalSaveBtn.style.opacity = "0.7";

  const payload = {
    name,
    nationality: nat,
    playstyle: topStyle,
    boosters,
    stats,
    description: desc,
    playstyleDetail: psDetail,
    image: mgrImageBase64 || (editingManagerId ? (adminManagers.find(m => m._key === editingManagerId)?.image || "") : ""),
    updatedAt: new Date().toISOString()
  };

  try {
    if (editingManagerId) {
      await firebaseDb.ref(`${MANAGERS_DB_PATH}/${editingManagerId}`).update(payload);
      showToast("تم تعديل المدرب بنجاح ✓", "success");
    } else {
      payload.createdAt = new Date().toISOString();
      await firebaseDb.ref(MANAGERS_DB_PATH).push(payload);
      showToast("تم إضافة المدرب بنجاح ✓", "success");
    }
    closeMgrModal();
  } catch (err) {
    console.error(err);
    showToast("خطأ في الحفظ: " + err.message, "error");
  } finally {
    mgrModalSaveBtn.disabled = false; mgrModalSaveBtn.style.opacity = "1";
  }
});

// ── Edit ──
window.openEditMgr = function(key) {
  const m = adminManagers.find(x => x._key === key);
  if (!m) return;
  editingManagerId = key;
  mgrModalTitle.textContent = "تعديل المدرب";
  mgrNameInput.value = m.name || "";
  if (mgrNationalityInput) mgrNationalityInput.value = m.nationality || "";
  mgrDescInput.value = m.description || "";
  if (mgrPlaystyleDetailInput) mgrPlaystyleDetailInput.value = m.playstyleDetail || "";
  selectedPlaystyle = m.playstyle || "";

  const boosters = Array.isArray(m.boosters) ? m.boosters : (m.boosters ? String(m.boosters).split(",") : []);
  if (mgrBoost1Input) mgrBoost1Input.value = boosters[0] || "";
  if (mgrBoost2Input) mgrBoost2Input.value = boosters[1] || "";

  const stats = m.stats || {};
  if (mgrStatPossessionInput) mgrStatPossessionInput.value = stats.possession ?? 65;
  if (mgrStatLBCInput) mgrStatLBCInput.value = stats.longBallCounter ?? 65;
  if (mgrStatQCInput) mgrStatQCInput.value = stats.quickCounter ?? 65;
  if (mgrStatLBInput) mgrStatLBInput.value = stats.longBall ?? 60;
  if (mgrStatOWInput) mgrStatOWInput.value = stats.outWide ?? 64;
  if (mgrStatOverloadInput) mgrStatOverloadInput.value = stats.overload ?? 65;

  mgrImageBase64 = m.image || "";
  if (m.image) {
    mgrPreviewImg.src = m.image;
    mgrPreviewImg.classList.add("visible");
    mgrImagePreview.classList.add("has-image");
    mgrRemoveImgBtn.style.display = "flex";
  } else {
    mgrPreviewImg.src = "";
    mgrPreviewImg.classList.remove("visible");
    mgrImagePreview.classList.remove("has-image");
    mgrRemoveImgBtn.style.display = "none";
  }
  renderPlaystyleOptions();
  openMgrModal();
};

// ── Delete ──
window.openDeleteMgr = function(key) {
  const m = adminManagers.find(x => x._key === key);
  if (!m) return;
  deletingManagerId = key;
  mgrDeleteName.textContent = m.name || "";
  mgrDeleteOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
};

function closeMgrDeleteModal() {
  mgrDeleteOverlay.classList.remove("active");
  document.body.style.overflow = "";
  deletingManagerId = null;
}

mgrDeleteCancelBtn && mgrDeleteCancelBtn.addEventListener("click", closeMgrDeleteModal);
mgrDeleteOverlay && mgrDeleteOverlay.addEventListener("click", (e) => { if (e.target === mgrDeleteOverlay) closeMgrDeleteModal(); });

mgrDeleteConfirmBtn && mgrDeleteConfirmBtn.addEventListener("click", async () => {
  if (!deletingManagerId) return;
  try {
    await firebaseDb.ref(`${MANAGERS_DB_PATH}/${deletingManagerId}`).remove();
    showToast("تم حذف المدرب ✓", "success");
  } catch (err) {
    showToast("خطأ في الحذف", "error");
  }
  closeMgrDeleteModal();
});

// ── Search Managers ──
mgrSearchInput && mgrSearchInput.addEventListener("input", (e) => {
  renderManagersTable(e.target.value.trim());
});

// ═══════════════════════════════════════════════
//   SUBTABS: Managers vs Player Playstyles
// ═══════════════════════════════════════════════
window.switchMgrSubtab = function(tab) {
  if (tab === "managers") {
    subtabMgrs && subtabMgrs.classList.add("active");
    subtabPStyles && subtabPStyles.classList.remove("active");
    if (subviewManagers) subviewManagers.style.display = "block";
    if (subviewPlayerStyles) subviewPlayerStyles.style.display = "none";
  } else if (tab === "playstyles") {
    subtabMgrs && subtabMgrs.classList.remove("active");
    subtabPStyles && subtabPStyles.classList.add("active");
    if (subviewManagers) subviewManagers.style.display = "none";
    if (subviewPlayerStyles) subviewPlayerStyles.style.display = "block";
    if (!isSubscribedToPlayerStyles) {
      loadPlayerStyles();
    }
  }
};

// ═══════════════════════════════════════════════
//   PLAYER PLAYSTYLES MANAGEMENT
// ═══════════════════════════════════════════════

function loadPlayerStyles() {
  if (typeof firebaseDb === "undefined" || !firebaseDb) return;
  if (isSubscribedToPlayerStyles) return;
  isSubscribedToPlayerStyles = true;

  firebaseDb.ref(PLAYER_STYLES_DB_PATH).on("value", (snap) => {
    const data = snap.val();
    if (data && typeof data === "object") {
      adminPlayerStyles = Object.entries(data).map(([key, val]) => ({ _key: key, ...val }));
      adminPlayerStyles.sort((a, b) => (a.nameEn || "").localeCompare(b.nameEn || ""));
    } else {
      adminPlayerStyles = [];
    }
    renderPlayerStylesTable(psSearchInput ? psSearchInput.value.trim() : "");
  });
}

function renderPlayerStylesTable(search = "") {
  if (!pStylesTableBody) return;

  const filtered = adminPlayerStyles.filter(ps => {
    const matchCat = currentPsCategoryFilter === "all" || ps.category === currentPsCategoryFilter;
    const matchSearch = !search ||
      (ps.nameEn || "").toLowerCase().includes(search.toLowerCase()) ||
      (ps.nameAr || "").toLowerCase().includes(search.toLowerCase()) ||
      (ps.activePos || "").toLowerCase().includes(search.toLowerCase()) ||
      (ps.category || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  pStylesTableBody.innerHTML = "";

  if (filtered.length === 0) {
    if (pStylesTable) pStylesTable.style.display = "none";
    if (pStylesTableEmpty) pStylesTableEmpty.style.display = "block";
    return;
  }

  if (pStylesTable) pStylesTable.style.display = "table";
  if (pStylesTableEmpty) pStylesTableEmpty.style.display = "none";

  const catClassMap = {
    FWD: "badge-cat-fwd",
    MID: "badge-cat-mid",
    DEF: "badge-cat-def",
    GK:  "badge-cat-gk"
  };

  filtered.forEach(ps => {
    const catClass = catClassMap[ps.category] || "badge-cat-fwd";
    const activePositions = Array.isArray(ps.activePos)
      ? ps.activePos
      : (ps.activePos ? String(ps.activePos).split(",").map(p => p.trim()).filter(Boolean) : []);

    const positionsPills = activePositions.map(pos => `
      <span style="font-size:0.7rem;font-weight:700;padding:2px 7px;border-radius:4px;background:rgba(255,255,255,0.06);margin-left:4px;">
        ${escapeHtml(pos)}
      </span>
    `).join("");

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="text-align:center;font-size:1.3rem;">
        ${escapeHtml(ps.icon || "⚽")}
      </td>
      <td><strong>${escapeHtml(ps.nameEn || "—")}</strong></td>
      <td>${escapeHtml(ps.nameAr || "—")}</td>
      <td>
        <span class="ps-category-badge ${catClass}" style="padding:3px 8px;border-radius:6px;font-size:0.75rem;font-weight:800;">
          ${escapeHtml(ps.category || "—")}
        </span>
      </td>
      <td>${positionsPills || '<span style="color:var(--text-tertiary)">—</span>'}</td>
      <td>
        <div class="actions-cell">
          <button class="btn-icon edit" onclick="openEditPlayerStyle('${ps._key}')" title="تعديل">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon delete" onclick="openDeletePlayerStyle('${ps._key}')" title="حذف">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    `;
    pStylesTableBody.appendChild(tr);
  });
}

// ── Category Filters (Admin) ──
if (psAdminCatFilters) {
  psAdminCatFilters.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-ps-cat-filter");
    if (!btn) return;
    psAdminCatFilters.querySelectorAll(".btn-ps-cat-filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentPsCategoryFilter = btn.getAttribute("data-cat") || "all";
    renderPlayerStylesTable(psSearchInput ? psSearchInput.value.trim() : "");
  });
}

// ── Search Player Playstyles ──
psSearchInput && psSearchInput.addEventListener("input", (e) => {
  renderPlayerStylesTable(e.target.value.trim());
});

// ── Player Playstyle Modal Open/Close ──
function openPlayerStyleModal() {
  if (psModalAdminOverlay) {
    psModalAdminOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closePlayerStyleModal() {
  if (psModalAdminOverlay) {
    psModalAdminOverlay.classList.remove("active");
    document.body.style.overflow = "";
    resetPlayerStyleForm();
  }
}

function resetPlayerStyleForm() {
  if (psAdminForm) psAdminForm.reset();
  editingPlayerStyleId = null;
  if (psAdminModalTitle) psAdminModalTitle.textContent = "إضافة أسلوب لاعب جديد";
  if (psIconInput) psIconInput.value = "⚽";
  if (psInactivePosInput) psInactivePosInput.value = "باقي المراكز";
}

addPlayerStyleBtn && addPlayerStyleBtn.addEventListener("click", () => {
  resetPlayerStyleForm();
  openPlayerStyleModal();
});

psModalAdminClose && psModalAdminClose.addEventListener("click", closePlayerStyleModal);
psModalAdminCancelBtn && psModalAdminCancelBtn.addEventListener("click", closePlayerStyleModal);
psModalAdminOverlay && psModalAdminOverlay.addEventListener("click", (e) => {
  if (e.target === psModalAdminOverlay) closePlayerStyleModal();
});

// ── Save Player Playstyle ──
psAdminForm && psAdminForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nameEn = psNameEnInput ? psNameEnInput.value.trim() : "";
  const nameAr = psNameArInput ? psNameArInput.value.trim() : "";
  const category = psCategoryInput ? psCategoryInput.value : "FWD";
  const icon = (psIconInput && psIconInput.value.trim()) ? psIconInput.value.trim() : "⚽";
  const activePos = psActivePosInput ? psActivePosInput.value.trim() : "";
  const inactivePos = psInactivePosInput ? psInactivePosInput.value.trim() : "باقي المراكز";
  const shortDesc = psShortDescInput ? psShortDescInput.value.trim() : "";
  const fullDesc = psFullDescInput ? psFullDescInput.value.trim() : "";
  const synergy = psSynergyInput ? psSynergyInput.value.trim() : "";
  const famous = psFamousInput ? psFamousInput.value.trim() : "";

  if (!nameEn || !nameAr || !shortDesc) {
    showToast("يرجى ملء الحقول المطلوبة", "error");
    return;
  }

  const payload = {
    nameEn,
    nameAr,
    category,
    icon,
    activePos,
    inactivePos,
    shortDesc,
    fullDesc,
    synergy,
    famous,
    updatedAt: Date.now()
  };

  try {
    if (editingPlayerStyleId) {
      await firebaseDb.ref(`${PLAYER_STYLES_DB_PATH}/${editingPlayerStyleId}`).update(payload);
      showToast("تم تحديث أسلوب اللاعب بنجاح ✓", "success");
    } else {
      payload.createdAt = Date.now();
      const newRef = firebaseDb.ref(PLAYER_STYLES_DB_PATH).push();
      await newRef.set(payload);
      showToast("تمت إضافة أسلوب اللاعب بنجاح ✓", "success");
    }
    closePlayerStyleModal();
  } catch (err) {
    console.error("Save player playstyle error:", err);
    showToast("خطأ أثناء حفظ أسلوب اللاعب", "error");
  }
});

// ── Edit Player Playstyle ──
window.openEditPlayerStyle = function(key) {
  const ps = adminPlayerStyles.find(x => x._key === key);
  if (!ps) return;

  editingPlayerStyleId = key;
  if (psAdminModalTitle) psAdminModalTitle.textContent = "تعديل أسلوب اللاعب";

  if (psNameEnInput) psNameEnInput.value = ps.nameEn || "";
  if (psNameArInput) psNameArInput.value = ps.nameAr || "";
  if (psCategoryInput) psCategoryInput.value = ps.category || "FWD";
  if (psIconInput) psIconInput.value = ps.icon || "⚽";
  if (psActivePosInput) psActivePosInput.value = Array.isArray(ps.activePos) ? ps.activePos.join(", ") : (ps.activePos || "");
  if (psInactivePosInput) psInactivePosInput.value = ps.inactivePos || "باقي المراكز";
  if (psShortDescInput) psShortDescInput.value = ps.shortDesc || "";
  if (psFullDescInput) psFullDescInput.value = ps.fullDesc || "";
  if (psSynergyInput) psSynergyInput.value = ps.synergy || "";
  if (psFamousInput) psFamousInput.value = Array.isArray(ps.famous) ? ps.famous.join(", ") : (ps.famous || "");

  openPlayerStyleModal();
};

// ── Delete Player Playstyle ──
window.openDeletePlayerStyle = function(key) {
  const ps = adminPlayerStyles.find(x => x._key === key);
  if (!ps) return;
  deletingPlayerStyleId = key;
  if (psDeleteName) psDeleteName.textContent = `${ps.nameEn || ''} (${ps.nameAr || ''})`;
  if (psDeleteOverlay) {
    psDeleteOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
};

function closePlayerStyleDeleteModal() {
  if (psDeleteOverlay) {
    psDeleteOverlay.classList.remove("active");
    document.body.style.overflow = "";
    deletingPlayerStyleId = null;
  }
}

psDeleteCancelBtn && psDeleteCancelBtn.addEventListener("click", closePlayerStyleDeleteModal);
psDeleteOverlay && psDeleteOverlay.addEventListener("click", (e) => {
  if (e.target === psDeleteOverlay) closePlayerStyleDeleteModal();
});

psDeleteConfirmBtn && psDeleteConfirmBtn.addEventListener("click", async () => {
  if (!deletingPlayerStyleId) return;
  try {
    await firebaseDb.ref(`${PLAYER_STYLES_DB_PATH}/${deletingPlayerStyleId}`).remove();
    showToast("تم حذف أسلوب اللاعب ✓", "success");
  } catch (err) {
    showToast("خطأ في حذف أسلوب اللاعب", "error");
  }
  closePlayerStyleDeleteModal();
});

// ── Escape Key Handler ──
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (mgrModalOverlay && mgrModalOverlay.classList.contains("active")) closeMgrModal();
    if (mgrDeleteOverlay && mgrDeleteOverlay.classList.contains("active")) closeMgrDeleteModal();
    if (psModalAdminOverlay && psModalAdminOverlay.classList.contains("active")) closePlayerStyleModal();
    if (psDeleteOverlay && psDeleteOverlay.classList.contains("active")) closePlayerStyleDeleteModal();
  }
});

// ── Bootstrap on tab switch ──
// Called from admin-players.js switchAdminTab
function initManagersPanel() {
  loadManagers();
  loadPlayerStyles();
}
