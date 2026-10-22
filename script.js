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
  card.dataset.ram = file.ram;
  card.dataset.fps = file.fps;

  const icon = file.icon || getIconForRam(file.ram);
  const downloadLink = file.link || "#";

  // Build image HTML: show uploaded image or icon fallback
  let imageHTML;
  if (file.image) {
    imageHTML = `<img src="${file.image}" alt="${file.name}" class="card-image">`;
  } else {
    imageHTML = `<div class="card-icon">${icon}</div>`;
  }

  card.innerHTML = `
    <div class="card-header">
      ${imageHTML}
      <span class="card-badge-fps fps-${file.fps}">${file.fps} FPS</span>
    </div>
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
        <span class="meta-icon">📄</span>
        Config File
      </span>
    </div>
    <div class="card-footer">
      <div class="download-count">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        ${formatNumber(file.downloads)} downloads
      </div>
      <a href="${downloadLink}" class="download-btn" ${downloadLink !== '#' ? '' : `onclick="handleDownload(event, '${file.name.replace(/'/g, "\\'")}')"`}>
        <span>Download</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </a>
    </div>
  `;

  return card;
}

function formatNumber(num) {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
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

// ── Download Handler ──
function handleDownload(e, fileName) {
  e.preventDefault();
  const btn = e.currentTarget;
  const originalHTML = btn.innerHTML;

  btn.innerHTML = `
    <span>Downloading...</span>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  `;
  btn.style.pointerEvents = "none";

  setTimeout(() => {
    btn.innerHTML = `
      <span>Downloaded ✓</span>
    `;
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.style.pointerEvents = "";
    }, 1500);
  }, 1200);
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

// ── Initialize ──
document.addEventListener("DOMContentLoaded", () => {
  updateHeroStats();
  renderCards();
  animateCounters();
  updateActiveNavLink();
});
