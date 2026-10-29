/* ═══════════════════════════════════════════════
   RODRIGO Admin — Managers Management JS
   ═══════════════════════════════════════════════ */

const MANAGERS_DB_PATH = "rodrigo_managers";

// ── State ──
let adminManagers = [];
let editingManagerId = null;
let deletingManagerId = null;
let mgrImageBase64 = "";
let isSubscribedToManagers = false;
let selectedPlaystyle = "";

// ── Playstyle metadata ──
const PLAYSTYLES = {
  "Possession Game":    { emoji: "🎯", badge: "badge-possession", en: "Possession Game",    ar: "لعبة الاستحواذ" },
  "Long Ball Counter":  { emoji: "⚡", badge: "badge-longball-c", en: "Long Ball Counter",   ar: "كونتر الكرة الطويلة" },
  "Quick Counter":      { emoji: "💨", badge: "badge-quick-c",    en: "Quick Counter",       ar: "الكونتر السريع" },
  "Long Ball":          { emoji: "🚀", badge: "badge-longball",   en: "Long Ball",           ar: "الكرة الطويلة" },
  "Out Wide":           { emoji: "🏃", badge: "badge-out-wide",   en: "Out Wide",            ar: "من الجانب" },
  "Overload":           { emoji: "💪", badge: "badge-overload",   en: "Overload",            ar: "التكثيف" },
};

// ── DOM ──
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

// ── Search ──
mgrSearchInput && mgrSearchInput.addEventListener("input", (e) => {
  renderManagersTable(e.target.value.trim());
});

// ── Escape key ──
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (mgrModalOverlay && mgrModalOverlay.classList.contains("active")) closeMgrModal();
    if (mgrDeleteOverlay && mgrDeleteOverlay.classList.contains("active")) closeMgrDeleteModal();
  }
});

// ── Bootstrap on tab switch ──
// Called from admin.js switchAdminTab
function initManagersPanel() {
  loadManagers();
}
