/* ═══════════════════════════════════════════════
   RODRIGO Files — Download Hub
   JavaScript Controller
   ═══════════════════════════════════════════════ */

// ── Storage Key (shared with admin panel) ──
const STORAGE_KEY = "rodrigo_files";

// ── Default Files (fallback if localStorage is empty) ──
const DEFAULT_FILES = [
  { id: 1,  name: "RODRIGO 2-3 RAM — 30 FPS",  ram: "2-3",   fps: 30,  downloads: 4821,  image: "", link: "#" },
  { id: 2,  name: "RODRIGO 2-3 RAM — 60 FPS",  ram: "2-3",   fps: 60,  downloads: 6234,  image: "", link: "#" },
  { id: 3,  name: "RODRIGO 4-6 RAM — 30 FPS",  ram: "4-6",   fps: 30,  downloads: 3912,  image: "", link: "#" },
  { id: 4,  name: "RODRIGO 4-6 RAM — 60 FPS",  ram: "4-6",   fps: 60,  downloads: 7543,  image: "", link: "#" },
  { id: 5,  name: "RODRIGO 6-8 RAM — 30 FPS",  ram: "6-8",   fps: 30,  downloads: 2876,  image: "", link: "#" },
  { id: 6,  name: "RODRIGO 6-8 RAM — 60 FPS",  ram: "6-8",   fps: 60,  downloads: 8190,  image: "", link: "#" },
  { id: 7,  name: "RODRIGO 6-8 RAM — 90 FPS",  ram: "6-8",   fps: 90,  downloads: 5421,  image: "", link: "#" },
  { id: 8,  name: "RODRIGO 6-8 RAM — 120 FPS", ram: "6-8",   fps: 120, downloads: 3245,  image: "", link: "#" },
  { id: 9,  name: "RODRIGO 8-12 RAM — 30 FPS",  ram: "8-12",  fps: 30,  downloads: 2134,  image: "", link: "#" },
  { id: 10, name: "RODRIGO 8-12 RAM — 60 FPS",  ram: "8-12",  fps: 60,  downloads: 9876,  image: "", link: "#" },
  { id: 11, name: "RODRIGO 8-12 RAM — 90 FPS",  ram: "8-12",  fps: 90,  downloads: 6543,  image: "", link: "#" },
  { id: 12, name: "RODRIGO 8-12 RAM — 120 FPS", ram: "8-12",  fps: 120, downloads: 4312,  image: "", link: "#" },
  { id: 13, name: "RODRIGO 12-24 RAM — 30 FPS",  ram: "12-24", fps: 30,  downloads: 1567,  image: "", link: "#" },
  { id: 14, name: "RODRIGO 12-24 RAM — 60 FPS",  ram: "12-24", fps: 60,  downloads: 8321,  image: "", link: "#" },
  { id: 15, name: "RODRIGO 12-24 RAM — 90 FPS",  ram: "12-24", fps: 90,  downloads: 7198,  image: "", link: "#" },
  { id: 16, name: "RODRIGO 12-24 RAM — 120 FPS", ram: "12-24", fps: 120, downloads: 5432,  image: "", link: "#" },
  { id: 17, name: "RODRIGO 12-24 RAM — 240 FPS", ram: "12-24", fps: 240, downloads: 2109,  image: "", link: "#" },
];

// ── Load files from localStorage (synced with admin) ──
function loadFiles() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* fall through */ }
  }
  // First visit: save defaults and return them
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FILES));
  return [...DEFAULT_FILES];
}

// ── Icon helper ──
function getIconForRam(ram) {
  const icons = { "2-3": "📁", "4-6": "📂", "6-8": "📦", "8-12": "🗃️", "12-24": "💎" };
  return icons[ram] || "📁";
}

let FILES = loadFiles();

// ── State ──
let activeRam = "all";
let activeFps = "all";
let searchQuery = "";

// ── DOM References ──
const cardsGrid = document.getElementById("cardsGrid");
const noResults = document.getElementById("noResults");
const resultsCount = document.getElementById("resultsCount");
const searchInput = document.getElementById("searchInput");
const searchClear = document.getElementById("searchClear");
const resetFilters = document.getElementById("resetFilters");
const ramFilters = document.getElementById("ramFilters");
const fpsFilters = document.getElementById("fpsFilters");
const navbar = document.getElementById("navbar");
const scrollTopBtn = document.getElementById("scrollTopBtn");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");

// ── Card Rendering ──
function createCard(file, delay = 0) {
  const card = document.createElement("div");
  card.className = "download-card";
  card.style.animationDelay = `${delay * 0.06}s`;
  card.dataset.id = file.id;
  card.dataset.ram = file.ram;
  card.dataset.fps = file.fps;

  const icon = file.icon || getIconForRam(file.ram);
  const downloadLink = file.link || "#";
  const isDirectFile = file.downloadType === "file";

  // Source tag
  const sourceTagHTML = isDirectFile
    ? `<span class="card-source-tag tag-direct">💾 Direct File${file.fileMeta?.size ? ` (${file.fileMeta.size})` : ''}</span>`
    : `<span class="card-source-tag tag-mediafire">🔥 MediaFire</span>`;

  // Top Section: Large banner if image exists, or compact icon header
  let topSectionHTML;
  if (file.image) {
    topSectionHTML = `
      <div class="card-banner">
        <img src="${file.image}" alt="${file.name}" class="card-banner-img">
        <div class="card-banner-overlay"></div>
        <div class="card-banner-badges">
          <span class="card-badge-fps fps-${file.fps}">${file.fps} FPS</span>
          ${sourceTagHTML}
        </div>
      </div>
    `;
  } else {
    topSectionHTML = `
      <div class="card-header">
        <div class="card-icon">${icon}</div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:6px;">
          <span class="card-badge-fps fps-${file.fps}">${file.fps} FPS</span>
          ${sourceTagHTML}
        </div>
      </div>
    `;
  }

  // Action Button (Triggers Math Verification Modal)
  const actionButtonHTML = `
    <button type="button" class="download-btn" onclick="openDownloadModal(${file.id})">
      <span>Download</span>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    </button>
  `;

  card.innerHTML = `
    ${topSectionHTML}
    <h3 class="card-name">${file.name}</h3>
    <div class="card-meta">
      <span class="meta-item">
        <span class="meta-icon">💾</span>
        ${file.ram} GB RAM
      </span>
      <span class="meta-item">
        <span class="meta-icon">🎯</span>
        ${file.fps} FPS
      </span>
      <span class="meta-item">
        <span class="meta-icon">${isDirectFile ? '📦' : '🔗'}</span>
        ${isDirectFile ? (file.fileMeta?.name || 'Config File') : 'MediaFire'}
      </span>
    </div>
    <div class="card-footer">
      <div class="download-count">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        <span class="download-count-num">${formatNumber(file.downloads)} downloads</span>
      </div>
      ${actionButtonHTML}
    </div>
  `;

  return card;
}

function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return (num || 0).toString();
}

// ═══════════════════════════════════════════════
// DOWNLOAD VERIFICATION MODAL & MATH CHALLENGE
// ═══════════════════════════════════════════════

let targetDownloadFile = null;
let currentChallengeAnswer = null;

const downloadModalOverlay = document.getElementById("downloadModalOverlay");
const dlModalClose = document.getElementById("dlModalClose");
const dlModalCancel = document.getElementById("dlModalCancel");
const dlConfirmBtn = document.getElementById("dlConfirmBtn");
const dlRefreshMath = document.getElementById("dlRefreshMath");

const dlMathNum1 = document.getElementById("dlMathNum1");
const dlMathOp = document.getElementById("dlMathOp");
const dlMathNum2 = document.getElementById("dlMathNum2");
const dlAnswerInput = document.getElementById("dlAnswerInput");
const dlErrorMsg = document.getElementById("dlErrorMsg");

const dlFileName = document.getElementById("dlFileName");
const dlFileRam = document.getElementById("dlFileRam");
const dlFileFps = document.getElementById("dlFileFps");
const dlFileSource = document.getElementById("dlFileSource");
const dlFileIcon = document.getElementById("dlFileIcon");

// Generate a random math problem (Addition or Multiplication)
function generateMathChallenge() {
  const isMultiplication = Math.random() > 0.7; // 30% chance for small multiplication
  let n1, n2, op, answer;

  if (isMultiplication) {
    n1 = Math.floor(Math.random() * 8) + 2; // 2 to 9
    n2 = Math.floor(Math.random() * 6) + 2; // 2 to 7
    op = "×";
    answer = n1 * n2;
  } else {
    n1 = Math.floor(Math.random() * 25) + 5; // 5 to 29
    n2 = Math.floor(Math.random() * 15) + 3; // 3 to 17
    op = "+";
    answer = n1 + n2;
  }

  currentChallengeAnswer = answer;
  if (dlMathNum1) dlMathNum1.textContent = n1;
  if (dlMathOp) dlMathOp.textContent = op;
  if (dlMathNum2) dlMathNum2.textContent = n2;

  if (dlAnswerInput) {
    dlAnswerInput.value = "";
    dlAnswerInput.classList.remove("error");
  }
  if (dlErrorMsg) {
    dlErrorMsg.textContent = "";
  }
}

// Open Verification Modal when user clicks Download
window.openDownloadModal = function(fileId) {
  const file = FILES.find(f => f.id === fileId);
  if (!file) return;

  targetDownloadFile = file;

  if (dlFileName) dlFileName.textContent = file.name;
  if (dlFileRam) dlFileRam.textContent = `${file.ram} GB RAM`;
  if (dlFileFps) {
    dlFileFps.textContent = `${file.fps} FPS`;
    dlFileFps.className = `dl-tag dl-tag-fps fps-${file.fps}`;
  }
  if (dlFileSource) {
    dlFileSource.textContent = file.downloadType === "file" 
      ? `💾 ${file.fileMeta?.name || 'ملف مباشر'}`
      : (file.link && file.link !== "#" ? "🔥 ميديا فاير / رابط" : "⚡ كونفج أداء فائق");
  }
  if (dlFileIcon) dlFileIcon.textContent = getIconForRam(file.ram);

  if (dlConfirmBtn) {
    dlConfirmBtn.classList.remove("success");
    dlConfirmBtn.disabled = false;
    dlConfirmBtn.innerHTML = `
      <span>تنزيل الآن</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
    `;
  }

  generateMathChallenge();

  if (downloadModalOverlay) {
    downloadModalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  setTimeout(() => {
    if (dlAnswerInput) dlAnswerInput.focus();
  }, 100);
};

function closeDownloadModal() {
  if (downloadModalOverlay) {
    downloadModalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
  targetDownloadFile = null;
}

// Validate answer and trigger actual download
async function processDownloadVerification() {
  if (!targetDownloadFile) return;

  const userVal = parseInt(dlAnswerInput.value.trim(), 10);

  if (isNaN(userVal)) {
    if (dlErrorMsg) dlErrorMsg.textContent = "يرجى كتابة ناتج المسألة الحسابية للمتابعة!";
    if (dlAnswerInput) {
      dlAnswerInput.classList.add("error");
      dlAnswerInput.focus();
    }
    return;
  }

  if (userVal !== currentChallengeAnswer) {
    if (dlErrorMsg) dlErrorMsg.textContent = "❌ الناتج غير صحيح! حاول مجدداً مع هذه المسألة:";
    if (dlAnswerInput) {
      dlAnswerInput.classList.add("error");
      setTimeout(() => dlAnswerInput.classList.remove("error"), 500);
    }
    generateMathChallenge();
    if (dlAnswerInput) dlAnswerInput.focus();
    return;
  }

  // Answer is Correct!
  if (dlErrorMsg) dlErrorMsg.textContent = "";
  if (dlConfirmBtn) {
    dlConfirmBtn.classList.add("success");
    dlConfirmBtn.disabled = true;
    dlConfirmBtn.innerHTML = `
      <span>جاري بدء التنزيل... ✓</span>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    `;
  }

  // Atomically increment download count
  incrementDownloadCount(targetDownloadFile.id);

  // Trigger download action
  await triggerActualDownload(targetDownloadFile);

  // Close modal smoothly
  setTimeout(() => {
    closeDownloadModal();
  }, 1200);
}

// Actual Download Triggering
async function triggerActualDownload(file) {
  // Case 1: External Link (MediaFire / Google Drive)
  if (file.downloadType !== "file" && file.link && file.link !== "#") {
    const a = document.createElement("a");
    a.href = file.link;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 500);
    return;
  }

  // Case 2: Binary file stored in IndexedDB
  if (file.downloadType === "file" && typeof getDownloadBlob === "function") {
    try {
      const item = await getDownloadBlob(file.id);
      if (item && item.blob) {
        triggerBlobDownload(item.blob, item.name || `${file.name}.zip`);
        return;
      }
    } catch (e) {
      console.warn("IndexedDB blob fetch error:", e);
    }
  }

  // Case 3: Reliable Automatic Config Generator (Always works even if link is #)
  const safeFilename = `RODRIGO_${file.ram}RAM_${file.fps}FPS_Config.ini`;
  const configText = [
    `; ══════════════════════════════════════════════════`,
    `; RODRIGO eFootball Mobile — Optimization Config`,
    `; File: ${file.name}`,
    `; Target RAM: ${file.ram} GB`,
    `; Target FPS: ${file.fps} FPS`,
    `; Generated: ${new Date().toLocaleDateString()}`,
    `; Status: Verified ✓ High Performance Unlocked`,
    `; ══════════════════════════════════════════════════`,
    ``,
    `[SystemSettings]`,
    `r.MobileContentScaleFactor=1.0`,
    `r.TonemapperFilm=1`,
    `r.DefaultFeature.AntiAliasing=0`,
    `r.ShadowQuality=0`,
    `r.PostProcessQuality=0`,
    `r.TextureQuality=1`,
    `r.EffectsQuality=0`,
    ``,
    `[Framerate]`,
    `TargetFPS=${file.fps}`,
    `bSmoothFrameRate=True`,
    `MinDesiredFrameRate=${file.fps}`,
    `MaxDesiredFrameRate=${file.fps}`,
    ``,
    `[DeviceOptimization]`,
    `TargetDeviceMemoryLimit=${file.ram}GB`,
    `VulkanRenderingEnabled=True`,
    `ThermalThrottlingDisabled=True`,
    `TouchLatencyReduction=True`
  ].join("\r\n");

  const blob = new Blob([configText], { type: "text/plain;charset=utf-8" });
  triggerBlobDownload(blob, safeFilename);
}

// Attach Verification Modal Listeners
if (dlModalClose) dlModalClose.addEventListener("click", closeDownloadModal);
if (dlModalCancel) dlModalCancel.addEventListener("click", closeDownloadModal);
if (dlRefreshMath) dlRefreshMath.addEventListener("click", () => {
  generateMathChallenge();
  if (dlAnswerInput) dlAnswerInput.focus();
});
if (dlConfirmBtn) dlConfirmBtn.addEventListener("click", processDownloadVerification);

if (dlAnswerInput) {
  dlAnswerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      processDownloadVerification();
    }
  });
}

if (downloadModalOverlay) {
  downloadModalOverlay.addEventListener("click", (e) => {
    if (e.target === downloadModalOverlay) closeDownloadModal();
  });
}

function incrementDownloadCount(fileId) {
  const file = FILES.find(f => f.id === fileId);
  if (file) {
    file.downloads = (file.downloads || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(FILES));
    const countEl = document.querySelector(`.download-card[data-id="${fileId}"] .download-count-num`);
    if (countEl) {
      countEl.textContent = `${formatNumber(file.downloads)} downloads`;
    }

    // Atomically increment in Firebase Cloud Database
    if (typeof CloudDB !== "undefined" && CloudDB.isReady()) {
      CloudDB.incrementDownload(fileId);
    }
  }
}

function renderCards() {
  const filtered = FILES.filter(file => {
    const matchRam = activeRam === "all" || file.ram === activeRam;
    const matchFps = activeFps === "all" || file.fps === parseInt(activeFps);
    const matchSearch = searchQuery === "" ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.ram.includes(searchQuery) ||
      file.fps.toString().includes(searchQuery);
    return matchRam && matchFps && matchSearch;
  });

  // Clear grid
  cardsGrid.innerHTML = "";

  if (filtered.length === 0) {
    noResults.classList.add("visible");
    cardsGrid.style.display = "none";
  } else {
    noResults.classList.remove("visible");
    cardsGrid.style.display = "grid";
    filtered.forEach((file, i) => {
      cardsGrid.appendChild(createCard(file, i));
    });
  }

  // Update count
  resultsCount.textContent = `Showing ${filtered.length} file${filtered.length !== 1 ? 's' : ''}`;
}

// ── Filter Logic ──
function setFilterActive(container, value, dataAttr) {
  container.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset[dataAttr] === value);
  });
}

ramFilters.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  activeRam = btn.dataset.ram;
  setFilterActive(ramFilters, activeRam, "ram");
  renderCards();
});

fpsFilters.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  activeFps = btn.dataset.fps;
  setFilterActive(fpsFilters, activeFps, "fps");
  renderCards();
});

resetFilters.addEventListener("click", () => {
  activeRam = "all";
  activeFps = "all";
  searchQuery = "";
  searchInput.value = "";
  searchClear.classList.remove("visible");
  setFilterActive(ramFilters, "all", "ram");
  setFilterActive(fpsFilters, "all", "fps");
  renderCards();
});

// ── Search ──
let searchTimeout;
searchInput.addEventListener("input", (e) => {
  clearTimeout(searchTimeout);
  const val = e.target.value.trim();
  searchClear.classList.toggle("visible", val.length > 0);
  searchTimeout = setTimeout(() => {
    searchQuery = val;
    renderCards();
  }, 250);
});

searchClear.addEventListener("click", () => {
  searchInput.value = "";
  searchQuery = "";
  searchClear.classList.remove("visible");
  searchInput.focus();
  renderCards();
});

// ── Navbar Scroll ──
let lastScroll = 0;
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  navbar.classList.toggle("scrolled", scrollY > 50);
  scrollTopBtn.classList.toggle("visible", scrollY > 500);
  lastScroll = scrollY;
}, { passive: true });

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// ── Mobile Menu ──
mobileMenuBtn.addEventListener("click", () => {
  mobileMenuBtn.classList.toggle("active");
  mobileMenuOverlay.classList.toggle("active");
  document.body.style.overflow = mobileMenuOverlay.classList.contains("active") ? "hidden" : "";
});

mobileMenuOverlay.querySelectorAll(".mobile-link").forEach(link => {
  link.addEventListener("click", () => {
    mobileMenuBtn.classList.remove("active");
    mobileMenuOverlay.classList.remove("active");
    document.body.style.overflow = "";
  });
});

// ── Counter Animation ──
function animateCounters() {
  const counters = document.querySelectorAll(".stat-number[data-count]");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const duration = 2000;
        const startTime = performance.now();

        function update(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);

          if (target >= 1000) {
            el.textContent = formatNumber(current);
          } else {
            el.textContent = current;
          }

          if (progress < 1) {
            requestAnimationFrame(update);
          } else {
            if (target >= 1000) {
              el.textContent = formatNumber(target) + "+";
            } else {
              el.textContent = target;
            }
          }
        }
        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

// ── Active Nav Link on Scroll ──
function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id], .hero[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  }, { rootMargin: "-40% 0px -60% 0px" });

  sections.forEach(section => observer.observe(section));
}

// ── Smooth Scroll for Anchor Links ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", (e) => {
    const targetId = anchor.getAttribute("href");
    if (targetId === "#") return;
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// ── Dynamic Hero Stats ──
function updateHeroStats() {
  const statNumbers = document.querySelectorAll(".hero-stats .stat-item .stat-number");
  if (statNumbers.length >= 3) {
    const totalFiles = FILES.length;
    const uniqueRams = new Set(FILES.map(f => f.ram)).size;
    const totalDownloads = FILES.reduce((sum, f) => sum + (f.downloads || 0), 0);

    statNumbers[0].dataset.count = totalFiles;
    statNumbers[1].dataset.count = uniqueRams;
    statNumbers[2].dataset.count = totalDownloads;
  }
}

// ── Live Sync across Tabs ──
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    FILES = loadFiles();
    renderCards();
    updateHeroStats();
  }
});

// ── Realtime Cloud Sync (Firebase) ──
function setupCloudLiveSync() {
  if (typeof CloudDB !== "undefined") {
    CloudDB.subscribeFiles((cloudFiles) => {
      if (cloudFiles && Array.isArray(cloudFiles) && cloudFiles.length > 0) {
        FILES = cloudFiles;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(FILES));
        renderCards();
        updateHeroStats();
      }
    });
  }
}

// ── Initialize ──
document.addEventListener("DOMContentLoaded", () => {
  updateHeroStats();
  renderCards();
  animateCounters();
  updateActiveNavLink();
  setupCloudLiveSync();
});
