/* ═══════════════════════════════════════════════
   RODRIGO Admin Dashboard — JavaScript
   ═══════════════════════════════════════════════ */

// ── Config ──
const ADMIN_PASSWORD = "Usif2007";
const STORAGE_KEY = "rodrigo_files";
const AUTH_KEY = "rodrigo_admin_auth";

// ── Default Files ──
const DEFAULT_FILES = [
  { id: 1,  name: "RODRIGO 2-3 RAM — 30 FPS",   ram: "2-3",   fps: 30,  downloads: 4821,  image: "", link: "#" },
  { id: 2,  name: "RODRIGO 2-3 RAM — 60 FPS",   ram: "2-3",   fps: 60,  downloads: 6234,  image: "", link: "#" },
  { id: 3,  name: "RODRIGO 4-6 RAM — 30 FPS",   ram: "4-6",   fps: 30,  downloads: 3912,  image: "", link: "#" },
  { id: 4,  name: "RODRIGO 4-6 RAM — 60 FPS",   ram: "4-6",   fps: 60,  downloads: 7543,  image: "", link: "#" },
  { id: 5,  name: "RODRIGO 6-8 RAM — 30 FPS",   ram: "6-8",   fps: 30,  downloads: 2876,  image: "", link: "#" },
  { id: 6,  name: "RODRIGO 6-8 RAM — 60 FPS",   ram: "6-8",   fps: 60,  downloads: 8190,  image: "", link: "#" },
  { id: 7,  name: "RODRIGO 6-8 RAM — 90 FPS",   ram: "6-8",   fps: 90,  downloads: 5421,  image: "", link: "#" },
  { id: 8,  name: "RODRIGO 6-8 RAM — 120 FPS",  ram: "6-8",   fps: 120, downloads: 3245,  image: "", link: "#" },
  { id: 9,  name: "RODRIGO 8-12 RAM — 30 FPS",  ram: "8-12",  fps: 30,  downloads: 2134,  image: "", link: "#" },
  { id: 10, name: "RODRIGO 8-12 RAM — 60 FPS",  ram: "8-12",  fps: 60,  downloads: 9876,  image: "", link: "#" },
  { id: 11, name: "RODRIGO 8-12 RAM — 90 FPS",  ram: "8-12",  fps: 90,  downloads: 6543,  image: "", link: "#" },
  { id: 12, name: "RODRIGO 8-12 RAM — 120 FPS", ram: "8-12",  fps: 120, downloads: 4312,  image: "", link: "#" },
  { id: 13, name: "RODRIGO 12-24 RAM — 30 FPS", ram: "12-24", fps: 30,  downloads: 1567,  image: "", link: "#" },
  { id: 14, name: "RODRIGO 12-24 RAM — 60 FPS", ram: "12-24", fps: 60,  downloads: 8321,  image: "", link: "#" },
  { id: 15, name: "RODRIGO 12-24 RAM — 90 FPS", ram: "12-24", fps: 90,  downloads: 7198,  image: "", link: "#" },
  { id: 16, name: "RODRIGO 12-24 RAM — 120 FPS",ram: "12-24", fps: 120, downloads: 5432,  image: "", link: "#" },
  { id: 17, name: "RODRIGO 12-24 RAM — 240 FPS",ram: "12-24", fps: 240, downloads: 2109,  image: "", link: "#" },
];

// ── State ──
let files = [];
let editingId = null;
let deletingId = null;
let currentImageBase64 = "";
let currentDownloadType = "link"; // "link" | "file"
let selectedFileBlob = null;
let selectedFileName = "";
let selectedFileSize = "";

// ── DOM ──
const loginScreen = document.getElementById("loginScreen");
const loginForm = document.getElementById("loginForm");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");
const dashboard = document.getElementById("dashboard");
const logoutBtn = document.getElementById("logoutBtn");

const totalFilesEl = document.getElementById("totalFiles");
const totalDownloadsEl = document.getElementById("totalDownloads");
const totalRamCategoriesEl = document.getElementById("totalRamCategories");

const filesTableBody = document.getElementById("filesTableBody");
const tableEmpty = document.getElementById("tableEmpty");
const filesTable = document.getElementById("filesTable");
const adminSearchInput = document.getElementById("adminSearch");

const addFileBtn = document.getElementById("addFileBtn");
const modalOverlay = document.getElementById("modalOverlay");
const fileModal = document.getElementById("fileModal");
const modalTitle = document.getElementById("modalTitle");
const modalClose = document.getElementById("modalClose");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const modalSaveBtn = document.getElementById("modalSaveBtn");
const fileForm = document.getElementById("fileForm");

const fileNameInput = document.getElementById("fileName");
const fileRamInput = document.getElementById("fileRam");
const fileFpsInput = document.getElementById("fileFps");
const fileDownloadsInput = document.getElementById("fileDownloads");
const fileLinkInput = document.getElementById("fileLink");

// Download Source Tabs & Dropzone DOM
const tabSourceLink = document.getElementById("tabSourceLink");
const tabSourceFile = document.getElementById("tabSourceFile");
const panelSourceLink = document.getElementById("panelSourceLink");
const panelSourceFile = document.getElementById("panelSourceFile");
const fileDropzone = document.getElementById("fileDropzone");
const actualFileInput = document.getElementById("actualFileInput");
const dropzoneEmpty = document.getElementById("dropzoneEmpty");
const dropzoneHasFile = document.getElementById("dropzoneHasFile");
const fileChosenName = document.getElementById("fileChosenName");
const fileChosenSize = document.getElementById("fileChosenSize");
const btnClearFile = document.getElementById("btnClearFile");

const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const previewImg = document.getElementById("previewImg");
const removeImgBtn = document.getElementById("removeImgBtn");
const imageUploadArea = document.getElementById("imageUploadArea");

const deleteModalOverlay = document.getElementById("deleteModalOverlay");
const deleteFileName = document.getElementById("deleteFileName");
const deleteCancelBtn = document.getElementById("deleteCancelBtn");
const deleteConfirmBtn = document.getElementById("deleteConfirmBtn");

const toastContainer = document.getElementById("toastContainer");

// ═══════════════════════════
// DATA MANAGEMENT (Local + Cloud Sync)
// ═══════════════════════════

let isSubscribedToCloud = false;

function loadFiles() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      files = JSON.parse(stored);
    } catch {
      files = [...DEFAULT_FILES];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    }
  } else {
    files = [...DEFAULT_FILES];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }

  // Subscribe to real-time Cloud updates if Firebase is configured
  if (typeof CloudDB !== "undefined" && CloudDB.isReady() && !isSubscribedToCloud) {
    isSubscribedToCloud = true;
    CloudDB.subscribeFiles(async (cloudFiles) => {
      if (cloudFiles && Array.isArray(cloudFiles) && cloudFiles.length > 0) {
        files = cloudFiles;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
        renderTable(adminSearchInput ? adminSearchInput.value.trim() : "");
        updateStats();
      } else if (!cloudFiles || cloudFiles.length === 0) {
        // Firebase database is empty! Auto-seed with current files
        console.log("⚡ Database is empty, auto-seeding files to Firebase...");
        try {
          await CloudDB.saveAllFiles(files);
          showToast("تم مزامنة ورفع الملفات إلى Firebase تلقائياً ⚡", "success");
        } catch (e) {
          console.warn("Auto-seed error:", e);
        }
      }
    });
  }
}

async function saveFiles() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  if (typeof CloudDB !== "undefined" && CloudDB.isReady()) {
    try {
      await CloudDB.saveAllFiles(files);
      return true;
    } catch (e) {
      console.error("Cloud save failed:", e);
      showToast("⚠️ تم الحفظ محلياً لكن تعذر الرفع للسحابة: " + (e.message || ""), "warning");
      return false;
    }
  }
  return false;
}

function getNextId() {
  if (files.length === 0) return 1;
  return Math.max(...files.map(f => f.id)) + 1;
}

// ═══════════════════════════
// AUTH
// ═══════════════════════════

function checkAuth() {
  const auth = sessionStorage.getItem(AUTH_KEY);
  if (auth === "true") {
    showDashboard();
  }
}

function showDashboard() {
  loginScreen.style.display = "none";
  dashboard.style.display = "block";
  loadFiles();
  renderTable();
  updateStats();
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const pw = loginPassword.value.trim();
  if (pw === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, "true");
    loginError.textContent = "";
    showDashboard();
    showToast("تم تسجيل الدخول بنجاح ✓", "success");
  } else {
    loginError.textContent = "❌ كلمة المرور غير صحيحة";
    loginPassword.value = "";
    loginPassword.focus();
  }
});

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem(AUTH_KEY);
  location.reload();
});

// ═══════════════════════════
// RENDER TABLE
// ═══════════════════════════

function renderTable(search = "") {
  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.ram.includes(search) ||
    f.fps.toString().includes(search)
  );

  filesTableBody.innerHTML = "";

  if (filtered.length === 0) {
    filesTable.style.display = "none";
    tableEmpty.style.display = "block";
  } else {
    filesTable.style.display = "table";
    tableEmpty.style.display = "none";

    filtered.forEach(file => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>
          ${file.image
            ? `<img src="${file.image}" class="table-img" alt="${file.name}">`
            : `<div class="table-img-placeholder">${getIconForRam(file.ram)}</div>`
          }
        </td>
        <td>
          <strong>${escapeHtml(file.name)}</strong>
          <div style="margin-top: 6px;">
            ${file.downloadType === "file"
              ? `<span class="source-badge badge-file" title="${escapeHtml(file.fileMeta?.name || 'ملف مباشر')}">💾 ملف: ${escapeHtml(file.fileMeta?.name || 'مباشر')} (${file.fileMeta?.size || ''})</span>`
              : `<span class="source-badge badge-link" title="${escapeHtml(file.link || '')}">🔥 ميديا فاير / رابط</span>`
            }
          </div>
        </td>
        <td><span class="ram-badge">${file.ram} GB</span></td>
        <td><span class="fps-badge fps-${file.fps}">${file.fps} FPS</span></td>
        <td>${formatNumber(file.downloads)}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon edit" onclick="openEditModal(${file.id})" title="تعديل">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-icon delete" onclick="openDeleteModal(${file.id})" title="حذف">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      `;
      filesTableBody.appendChild(tr);
    });
  }
}

function getIconForRam(ram) {
  const icons = { "2-3": "📁", "4-6": "📂", "6-8": "📦", "8-12": "🗃️", "12-24": "💎" };
  return icons[ram] || "📁";
}

function formatNumber(num) {
  return num.toLocaleString("en-US");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ═══════════════════════════
// STATS
// ═══════════════════════════

function updateStats() {
  totalFilesEl.textContent = files.length;
  totalDownloadsEl.textContent = formatNumber(files.reduce((sum, f) => sum + (f.downloads || 0), 0));
  const uniqueRam = new Set(files.map(f => f.ram));
  totalRamCategoriesEl.textContent = uniqueRam.size;
}

// ═══════════════════════════
// SEARCH
// ═══════════════════════════

let searchTimeout;
adminSearchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    renderTable(e.target.value.trim());
  }, 200);
});

// ═══════════════════════════
// MODAL (ADD / EDIT)
// ═══════════════════════════

function openModal() {
  modalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalOverlay.classList.remove("active");
  document.body.style.overflow = "";
  resetForm();
}

function switchDownloadSource(type) {
  currentDownloadType = type;
  if (type === "link") {
    tabSourceLink.classList.add("active");
    tabSourceFile.classList.remove("active");
    panelSourceLink.style.display = "block";
    panelSourceFile.style.display = "none";
  } else {
    tabSourceFile.classList.add("active");
    tabSourceLink.classList.remove("active");
    panelSourceFile.style.display = "block";
    panelSourceLink.style.display = "none";
  }
}

tabSourceLink.addEventListener("click", () => switchDownloadSource("link"));
tabSourceFile.addEventListener("click", () => switchDownloadSource("file"));

function handleActualFile(file) {
  if (!file) return;
  selectedFileBlob = file;
  selectedFileName = file.name;
  selectedFileSize = formatBytes(file.size);

  fileChosenName.textContent = selectedFileName;
  fileChosenSize.textContent = selectedFileSize;

  dropzoneEmpty.style.display = "none";
  dropzoneHasFile.style.display = "block";
  showToast(`تم اختيار الملف: ${selectedFileName} (${selectedFileSize})`, "success");
}

function clearActualFile() {
  selectedFileBlob = null;
  selectedFileName = "";
  selectedFileSize = "";
  actualFileInput.value = "";
  dropzoneEmpty.style.display = "flex";
  dropzoneHasFile.style.display = "none";
}

fileDropzone.addEventListener("click", (e) => {
  if (e.target.closest("#btnClearFile")) return;
  actualFileInput.click();
});

actualFileInput.addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (f) handleActualFile(f);
});

fileDropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  fileDropzone.classList.add("dragover");
});

fileDropzone.addEventListener("dragleave", () => {
  fileDropzone.classList.remove("dragover");
});

fileDropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  fileDropzone.classList.remove("dragover");
  const f = e.dataTransfer.files[0];
  if (f) handleActualFile(f);
});

btnClearFile.addEventListener("click", (e) => {
  e.stopPropagation();
  clearActualFile();
});

function resetForm() {
  fileForm.reset();
  editingId = null;
  currentImageBase64 = "";
  previewImg.src = "";
  previewImg.classList.remove("visible");
  imagePreview.classList.remove("has-image");
  removeImgBtn.style.display = "none";
  clearActualFile();
  switchDownloadSource("link");
  modalTitle.textContent = "إضافة ملف جديد";
}

addFileBtn.addEventListener("click", () => {
  resetForm();
  openModal();
});

modalClose.addEventListener("click", closeModal);
modalCancelBtn.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Image Upload with Compression & Drag-and-Drop (HD 800x450 for wide card banners)
function compressImage(dataUrl, maxWidth = 800, maxHeight = 450, quality = 0.82) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        if (width / maxWidth > height / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/webp", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function processImageFile(file) {
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
      const compressed = await compressImage(ev.target.result);
      currentImageBase64 = compressed;
      previewImg.src = compressed;
      previewImg.classList.add("visible");
      imagePreview.classList.add("has-image");
      removeImgBtn.style.display = "flex";
      showToast("تم رفع الصورة بنجاح ✓", "success");
    } catch {
      currentImageBase64 = ev.target.result;
      previewImg.src = currentImageBase64;
      previewImg.classList.add("visible");
      imagePreview.classList.add("has-image");
      removeImgBtn.style.display = "flex";
    }
  };
  reader.readAsDataURL(file);
}

imagePreview.addEventListener("click", () => imageInput.click());

imageInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) processImageFile(file);
});

// Drag and drop image
imageUploadArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  imageUploadArea.classList.add("dragover");
});

imageUploadArea.addEventListener("dragleave", () => {
  imageUploadArea.classList.remove("dragover");
});

imageUploadArea.addEventListener("drop", (e) => {
  e.preventDefault();
  imageUploadArea.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) processImageFile(file);
});

removeImgBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  currentImageBase64 = "";
  previewImg.src = "";
  previewImg.classList.remove("visible");
  imagePreview.classList.remove("has-image");
  removeImgBtn.style.display = "none";
  imageInput.value = "";
});

// Save (Add or Edit)
fileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = fileNameInput.value.trim();
  const ram = fileRamInput.value;
  const fps = parseInt(fileFpsInput.value);
  const downloads = parseInt(fileDownloadsInput.value) || 0;

  if (!name || !ram || !fps) {
    showToast("يرجى ملء جميع الحقول المطلوبة", "error");
    return;
  }

  let downloadType = currentDownloadType;
  let link = "#";
  let fileMeta = null;

  if (downloadType === "file") {
    if (!selectedFileName) {
      showToast("يرجى اختيار ملف التحميل من الجهاز", "error");
      return;
    }
    fileMeta = {
      name: selectedFileName,
      size: selectedFileSize
    };
  } else {
    link = fileLinkInput.value.trim() || "#";
    if (!link || link === "#") {
      showToast("يرجى وضع رابط ميديا فاير أو الرابط المباشر", "warning");
    }
  }

  modalSaveBtn.disabled = true;
  modalSaveBtn.style.opacity = "0.7";

  try {
    if (editingId) {
      // Edit existing
      const idx = files.findIndex(f => f.id === editingId);
      if (idx !== -1) {
        files[idx].name = name;
        files[idx].ram = ram;
        files[idx].fps = fps;
        files[idx].downloads = downloads;
        files[idx].downloadType = downloadType;
        files[idx].link = link;
        files[idx].fileMeta = fileMeta;

        if (currentImageBase64) {
          files[idx].image = currentImageBase64;
        } else if (removeImgBtn.style.display === "none") {
          files[idx].image = "";
        }

        // Save blob if newly uploaded
        if (downloadType === "file" && selectedFileBlob) {
          await saveDownloadBlob(editingId, selectedFileBlob, selectedFileName, selectedFileSize);
        } else if (downloadType === "link") {
          await deleteDownloadBlob(editingId);
        }
      }
      showToast("تم تعديل الملف بنجاح ✓", "success");
    } else {
      // Add new
      const newId = getNextId();
      const newFile = {
        id: newId,
        name,
        ram,
        fps,
        downloads,
        image: currentImageBase64,
        downloadType,
        link,
        fileMeta
      };

      if (downloadType === "file" && selectedFileBlob) {
        await saveDownloadBlob(newId, selectedFileBlob, selectedFileName, selectedFileSize);
      }

      files.push(newFile);
    }

    await saveFiles();
    renderTable(adminSearchInput.value.trim());
    updateStats();
    closeModal();

    if (typeof CloudDB !== "undefined" && CloudDB.isReady()) {
      showToast("تم الحفظ والتطبيق عند جميع الزوار فوراً ⚡", "success");
    } else {
      showToast("تم الحفظ محلياً. لتعميمه للكل اضغط زر السحابة بالأعلى ☁️", "info");
    }
  } catch (err) {
    console.error(err);
    showToast("حدث خطأ أثناء حفظ الملف", "error");
  } finally {
    modalSaveBtn.disabled = false;
    modalSaveBtn.style.opacity = "1";
  }
});

// Edit Modal
window.openEditModal = function(id) {
  const file = files.find(f => f.id === id);
  if (!file) return;

  editingId = id;
  modalTitle.textContent = "تعديل الملف";

  fileNameInput.value = file.name;
  fileRamInput.value = file.ram;
  fileFpsInput.value = file.fps;
  fileDownloadsInput.value = file.downloads;

  // Set download source
  if (file.downloadType === "file") {
    switchDownloadSource("file");
    selectedFileName = file.fileMeta?.name || "ملف مرفوع";
    selectedFileSize = file.fileMeta?.size || "";
    fileChosenName.textContent = selectedFileName;
    fileChosenSize.textContent = selectedFileSize;
    dropzoneEmpty.style.display = "none";
    dropzoneHasFile.style.display = "block";
    fileLinkInput.value = "";
  } else {
    switchDownloadSource("link");
    fileLinkInput.value = file.link && file.link !== "#" ? file.link : "";
    clearActualFile();
  }

  // Set image
  if (file.image) {
    currentImageBase64 = file.image;
    previewImg.src = file.image;
    previewImg.classList.add("visible");
    imagePreview.classList.add("has-image");
    removeImgBtn.style.display = "flex";
  } else {
    currentImageBase64 = "";
    previewImg.src = "";
    previewImg.classList.remove("visible");
    imagePreview.classList.remove("has-image");
    removeImgBtn.style.display = "none";
  }

  openModal();
};

// ═══════════════════════════
// DELETE MODAL
// ═══════════════════════════

window.openDeleteModal = function(id) {
  const file = files.find(f => f.id === id);
  if (!file) return;

  deletingId = id;
  deleteFileName.textContent = file.name;
  deleteModalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
};

function closeDeleteModal() {
  deleteModalOverlay.classList.remove("active");
  document.body.style.overflow = "";
  deletingId = null;
}

deleteCancelBtn.addEventListener("click", closeDeleteModal);

deleteModalOverlay.addEventListener("click", (e) => {
  if (e.target === deleteModalOverlay) closeDeleteModal();
});

deleteConfirmBtn.addEventListener("click", async () => {
  if (deletingId !== null) {
    await deleteDownloadBlob(deletingId);
    files = files.filter(f => f.id !== deletingId);
    await saveFiles();
    renderTable(adminSearchInput.value.trim());
    updateStats();
    if (typeof CloudDB !== "undefined" && CloudDB.isReady()) {
      showToast("تم حذف الملف من السحابة عند الكل ✓", "success");
    } else {
      showToast("تم حذف الملف محلياً ✓", "success");
    }
    closeDeleteModal();
  }
});

// ═══════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ"
  };

  toast.innerHTML = `<span>${icons[type] || ""}</span> ${message}`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("removing");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ═══════════════════════════
// KEYBOARD SHORTCUTS
// ═══════════════════════════

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (modalOverlay.classList.contains("active")) closeModal();
    if (deleteModalOverlay.classList.contains("active")) closeDeleteModal();
  }
});

// ═══════════════════════════
// CLOUD SYNC & FIREBASE LOGIC
// ═══════════════════════════

const cloudStatusBtn = document.getElementById("cloudStatusBtn");
const cloudStatusDot = document.getElementById("cloudStatusDot");
const cloudStatusText = document.getElementById("cloudStatusText");

const cloudModalOverlay = document.getElementById("cloudModalOverlay");
const cloudModalClose = document.getElementById("cloudModalClose");
const cloudModalCancelBtn = document.getElementById("cloudModalCancelBtn");

const cloudStatusCard = document.getElementById("cloudStatusCard");
const modalStatusDot = document.getElementById("modalStatusDot");
const modalStatusTitle = document.getElementById("modalStatusTitle");
const modalStatusDesc = document.getElementById("modalStatusDesc");
const btnTestCloudConnection = document.getElementById("btnTestCloudConnection");

const tabPasteJson = document.getElementById("tabPasteJson");
const tabManualConfig = document.getElementById("tabManualConfig");
const panelPasteJson = document.getElementById("panelPasteJson");
const panelManualConfig = document.getElementById("panelManualConfig");

const firebaseSnippetInput = document.getElementById("firebaseSnippetInput");
const fbDatabaseUrl = document.getElementById("fbDatabaseUrl");
const fbApiKey = document.getElementById("fbApiKey");
const fbProjectId = document.getElementById("fbProjectId");

const btnSaveCloudConfig = document.getElementById("btnSaveCloudConfig");
const btnClearCloudConfig = document.getElementById("btnClearCloudConfig");
const btnPushAllToCloud = document.getElementById("btnPushAllToCloud");

// Update Cloud UI status based on current Firebase state
function updateCloudStatusUI() {
  if (!cloudStatusBtn) return;

  const isConfigured = isFirebaseConfigured();
  const isReady = typeof CloudDB !== "undefined" && CloudDB.isReady();

  if (isConfigured && isReady) {
    cloudStatusDot.className = "status-indicator-dot online";
    cloudStatusText.textContent = "متصل بالسحابة (مباشر ⚡)";
    if (cloudStatusCard) cloudStatusCard.classList.add("connected");
    if (modalStatusDot) modalStatusDot.className = "status-indicator-dot online";
    if (modalStatusTitle) modalStatusTitle.textContent = "متصل بقاعدة بيانات Firebase ✓";
    if (modalStatusDesc) modalStatusDesc.textContent = "أي تعديل تقوم به يُطبق فوراً عند جميع الزوار حول العالم.";
  } else if (isConfigured) {
    cloudStatusDot.className = "status-indicator-dot";
    cloudStatusText.textContent = "جاري التحقق من السحابة...";
    if (cloudStatusCard) cloudStatusCard.classList.remove("connected");
    if (modalStatusDot) modalStatusDot.className = "status-indicator-dot";
    if (modalStatusTitle) modalStatusTitle.textContent = "الإعدادات محفوظة (جاري الاتصال)";
    if (modalStatusDesc) modalStatusDesc.textContent = "اضغط إعادة الفحص للتحقق من الاتصال";
  } else {
    cloudStatusDot.className = "status-indicator-dot offline";
    cloudStatusText.textContent = "وضع محلي (اضغط للربط ☁️)";
    if (cloudStatusCard) cloudStatusCard.classList.remove("connected");
    if (modalStatusDot) modalStatusDot.className = "status-indicator-dot offline";
    if (modalStatusTitle) modalStatusTitle.textContent = "غير متصل بالسحابة (وضع محلي)";
    if (modalStatusDesc) modalStatusDesc.textContent = "التعديلات تُحفظ على جهازك فقط. اربط Firebase لتطبيقها عند الجميع.";
  }
}

// Extract Firebase config from pasted text (JSON or JS snippet)
function extractFirebaseConfig(input) {
  if (!input || !input.trim()) return null;
  const str = input.trim();

  // Try pure JSON
  try {
    const json = JSON.parse(str);
    if (json.apiKey) return json;
  } catch {}

  // Parse JS snippet e.g. apiKey: "...", databaseURL: "..."
  const config = {};
  const keys = ["apiKey", "authDomain", "databaseURL", "projectId", "storageBucket", "messagingSenderId", "appId"];
  
  keys.forEach((k) => {
    const regex = new RegExp(`${k}\\s*:\\s*["'\`]([^"'\`]+)["'\`]`, "i");
    const match = str.match(regex);
    if (match && match[1]) {
      config[k] = match[1].trim();
    }
  });

  if (config.apiKey && (config.databaseURL || config.projectId)) {
    return config;
  }
  return null;
}

// Populate inputs with current config
function populateCloudInputs() {
  const currentConfig = getActiveFirebaseConfig();
  if (currentConfig && currentConfig.apiKey) {
    fbDatabaseUrl.value = currentConfig.databaseURL || "";
    fbApiKey.value = currentConfig.apiKey || "";
    fbProjectId.value = currentConfig.projectId || "";
    firebaseSnippetInput.value = JSON.stringify(currentConfig, null, 2);
  }
}

function openCloudModal() {
  populateCloudInputs();
  updateCloudStatusUI();
  cloudModalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeCloudModal() {
  cloudModalOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

// Cloud Modal Event Listeners
if (cloudStatusBtn) cloudStatusBtn.addEventListener("click", openCloudModal);
if (cloudModalClose) cloudModalClose.addEventListener("click", closeCloudModal);
if (cloudModalCancelBtn) cloudModalCancelBtn.addEventListener("click", closeCloudModal);

if (cloudModalOverlay) {
  cloudModalOverlay.addEventListener("click", (e) => {
    if (e.target === cloudModalOverlay) closeCloudModal();
  });
}

// Tabs switching
if (tabPasteJson && tabManualConfig) {
  tabPasteJson.addEventListener("click", () => {
    tabPasteJson.classList.add("active");
    tabManualConfig.classList.remove("active");
    panelPasteJson.style.display = "block";
    panelManualConfig.style.display = "none";
  });

  tabManualConfig.addEventListener("click", () => {
    tabManualConfig.classList.add("active");
    tabPasteJson.classList.remove("active");
    panelManualConfig.style.display = "block";
    panelPasteJson.style.display = "none";
  });
}

// Save Cloud Config
if (btnSaveCloudConfig) {
  btnSaveCloudConfig.addEventListener("click", async () => {
    btnSaveCloudConfig.disabled = true;
    btnSaveCloudConfig.style.opacity = "0.7";

    let configToSave = null;

    if (tabPasteJson.classList.contains("active")) {
      const rawText = firebaseSnippetInput.value.trim();
      configToSave = extractFirebaseConfig(rawText);
      if (!configToSave) {
        showToast("يرجى لصق كود Firebase صالح يحتوي على apiKey", "error");
        btnSaveCloudConfig.disabled = false;
        btnSaveCloudConfig.style.opacity = "1";
        return;
      }
    } else {
      const dbUrl = fbDatabaseUrl.value.trim();
      const apiKey = fbApiKey.value.trim();
      const projId = fbProjectId.value.trim();

      if (!apiKey || (!dbUrl && !projId)) {
        showToast("يرجى إدخال مفتاح API ورابط قاعدة البيانات أو Project ID", "error");
        btnSaveCloudConfig.disabled = false;
        btnSaveCloudConfig.style.opacity = "1";
        return;
      }

      configToSave = {
        apiKey,
        databaseURL: dbUrl || `https://${projId}-default-rtdb.firebaseio.com`,
        projectId: projId
      };
    }

    try {
      showToast("جاري فحص الاتصال بقاعدة البيانات...", "info");
      await CloudDB.testConnection(configToSave);

      // Save to localStorage
      localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(configToSave));
      
      // Re-init Firebase
      initFirebaseApp();

      updateCloudStatusUI();
      showToast("تم ربط قاعدة بيانات Firebase بنجاح! السحابة متصلة الآن ⚡", "success");

      // Auto start cloud subscription
      if (!isSubscribedToCloud) {
        isSubscribedToCloud = true;
        CloudDB.subscribeFiles((cloudFiles) => {
          if (cloudFiles && Array.isArray(cloudFiles) && cloudFiles.length > 0) {
            files = cloudFiles;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
            renderTable(adminSearchInput ? adminSearchInput.value.trim() : "");
            updateStats();
          }
        });
      }

      setTimeout(closeCloudModal, 800);
    } catch (err) {
      console.error("Firebase Test Error:", err);
      showToast("فشل الاتصال: تأكد من صحة المفاتيح وأن قواعد Realtime Database مفعلة (Test Mode)", "error");
    } finally {
      btnSaveCloudConfig.disabled = false;
      btnSaveCloudConfig.style.opacity = "1";
    }
  });
}

// Test Cloud Connection button
if (btnTestCloudConnection) {
  btnTestCloudConnection.addEventListener("click", async () => {
    btnTestCloudConnection.disabled = true;
    showToast("جاري اختبار الاتصال...", "info");

    const currentConfig = getActiveFirebaseConfig();
    if (!currentConfig || !currentConfig.apiKey) {
      showToast("لا توجد إعدادات Firebase محفوظة بعد", "warning");
      btnTestCloudConnection.disabled = false;
      return;
    }

    try {
      await CloudDB.testConnection(currentConfig);
      initFirebaseApp();
      updateCloudStatusUI();
      showToast("الاتصال بالسحابة يعمل بكفاءة تامة ✓", "success");
    } catch (err) {
      console.error(err);
      updateCloudStatusUI();
      showToast("تعذر الاتصال بالسحابة: " + (err.message || ""), "error");
    } finally {
      btnTestCloudConnection.disabled = false;
    }
  });
}

// Push all current files to Cloud
if (btnPushAllToCloud) {
  btnPushAllToCloud.addEventListener("click", async () => {
    if (!CloudDB.isReady()) {
      showToast("يرجى تفعيل وحفظ إعدادات Firebase أولاً للتمكن من الرفع", "warning");
      return;
    }

    btnPushAllToCloud.disabled = true;
    btnPushAllToCloud.style.opacity = "0.7";
    showToast("جاري رفع جميع الملفات إلى السحابة...", "info");

    try {
      await CloudDB.saveAllFiles(files);
      showToast(`تم رفع جميع الملفات (${files.length} ملف) إلى السحابة بنجاح! أصبحت تظهر للجميع الآن 🚀`, "success");
    } catch (err) {
      console.error("Push to cloud error:", err);
      showToast("فشل رفع الملفات للسحابة: " + (err.message || ""), "error");
    } finally {
      btnPushAllToCloud.disabled = false;
      btnPushAllToCloud.style.opacity = "1";
    }
  });
}

// Clear Cloud Config
if (btnClearCloudConfig) {
  btnClearCloudConfig.addEventListener("click", () => {
    if (confirm("هل تريد إلغاء ربط Firebase والعودة للتخزين المحلي فقط؟")) {
      localStorage.removeItem(FIREBASE_CONFIG_STORAGE_KEY);
      location.reload();
    }
  });
}

// Wipe / Reset Cloud Database
const btnWipeCloudDatabase = document.getElementById("btnWipeCloudDatabase");
if (btnWipeCloudDatabase) {
  btnWipeCloudDatabase.addEventListener("click", async () => {
    if (confirm("⚠️ هل أنت متأكد من مسح وتصفير كافة البيانات في قاعدة بيانات Firebase وإعادتها للملفات الافتراضية النظيفة؟")) {
      try {
        btnWipeCloudDatabase.disabled = true;
        btnWipeCloudDatabase.style.opacity = "0.6";
        showToast("جاري تصفير قاعدة البيانات...", "info");
        await CloudDB.saveAllFiles(DEFAULT_FILES);
        files = [...DEFAULT_FILES];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
        renderTable();
        updateStats();
        showToast("تم تصفير قاعدة البيانات وإعادتها نظيفة بنجاح ✓", "success");
      } catch (e) {
        console.error("Wipe DB error:", e);
        showToast("حدث خطأ أثناء التصفير: " + (e.message || ""), "error");
      } finally {
        btnWipeCloudDatabase.disabled = false;
        btnWipeCloudDatabase.style.opacity = "1";
      }
    }
  });
}

// ═══════════════════════════
// INIT
// ═══════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  setTimeout(() => {
    updateCloudStatusUI();
  }, 400);
});
