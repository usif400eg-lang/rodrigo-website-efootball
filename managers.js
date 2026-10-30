/* ═══════════════════════════════════════════════
   RODRIGO — Managers & Playstyles Page Logic
   ═══════════════════════════════════════════════ */

// ── Playstyle Metadata ──
const PLAYSTYLE_INFO = {
  "Possession Game": {
    emoji: "🎯",
    badgeClass: "style-possession",
    en: "Possession Game",
    ar: "لعبة الاستحواذ",
    defLine: "عالي جداً (High Line)",
    compactness: "متوسطة إلى عالية",
    attackSpeed: "هادئة ومدروسة للتمرير القصير",
    pros: ["استحواذ كامل وتحكم بملعب الخصم", "خيارات تمرير متعددة وقريبة من حامل الكرة", "ضغط عكسي فوري عند فقدان الكرة"],
    cons: ["مساحات خلف قلبي الدفاع يسهل استغلالها بالكرات الساقطة", "يتطلب لاعبي وسط ومدافعين يجيدون التمرير الدقيق"],
    bestFormation: "4-3-3 أو 4-2-1-3 أو 3-2-4-1"
  },
  "Quick Counter": {
    emoji: "💨",
    badgeClass: "style-quick-c",
    en: "Quick Counter",
    ar: "الكونتر السريع",
    defLine: "متقدم (High-Mid Line)",
    compactness: "عالية جداً وضغط مكثف",
    attackSpeed: "فائقة ومباشرة للأمام",
    pros: ["انطلاقات هجومية سريعة تكسر مصيدة التسلل", "ضغط شرس في مناطق الخصم يمنعه من بناء اللعب", "فرص تهديفية وفيرة من أخطاء المدافعين"],
    cons: ["استنزاف سريع لطاقة اللاعبين بسبب الركض المستمر", "مخاطرة عند فشل الضغط بوجود مساحات شاسعة"],
    bestFormation: "4-3-1-2 أو 4-2-2-2 أو 4-3-3"
  },
  "Long Ball Counter": {
    emoji: "⚡",
    badgeClass: "style-longball-c",
    en: "Long Ball Counter",
    ar: "كونتر الكرة الطويلة",
    defLine: "متراجع وعميق (Deep Line)",
    compactness: "صلبة ومحكمة في منطقة الجزاء",
    attackSpeed: "مرتدة سريعة بالكرات الطويلة والبينية",
    pros: ["أقوى أسلوب دفاعي في اللعبة ضد الكرات البينية الساقطة", "تأمين كامل للعمق وحماية مطلقة للمرمى", "مهاجموك ينطلقون كالصواريخ بمجرد قطع الكرة"],
    cons: ["صعوبة بناء اللعب التمريري القصير إذا أغلق الخصم المرتدات", "عزلة المهاجمين إذا تأخر لاعبو الوسط في المساندة"],
    bestFormation: "4-2-2-2 أو 4-2-1-3 أو 5-2-1-2"
  },
  "Out Wide": {
    emoji: "🏃",
    badgeClass: "style-out-wide",
    en: "Out Wide",
    ar: "من الجانب / الأطراف",
    defLine: "متوسط",
    compactness: "موزعة بعرض الملعب",
    attackSpeed: "سريعة نحو الأطراف مع اختراق الصندوق",
    pros: ["انتشار عرضي يفكك أكثر التكتلات الدفاعية إحكاماً", "دخول لاعبي الوسط والمهاجمين داخل الصندوق لاستقبال العرضيات", "مساحات حرة دائمة للأجنحة والأظهرة للركض والتمرير"],
    cons: ["يتطلب أجنحة وأظهرة ذوي دقة عرضيات عالية (Cross Specialist)", "معرض للمرتدات من العمق إذا تقدم الأظهرة معاً"],
    bestFormation: "4-4-2 أو 4-2-3-1 أو 3-4-3"
  },
  "Long Ball": {
    emoji: "🚀",
    badgeClass: "style-longball",
    en: "Long Ball",
    ar: "الكرة الطويلة",
    defLine: "متوسط إلى متراجع",
    compactness: "متوسطة",
    attackSpeed: "كرات طولية هوائية مباشرة",
    pros: ["تخطي خط وسط الخصم بالكامل بدون مخاطرة التمرير القصير", "استغلال قوة المهاجم البدنية والارتقاء الهوائي", "فرص خطيرة من الكرات الثانية الساقطة أمام المرمى"],
    cons: ["نسبة فقدان الكرات الهوائية مرتفعة إذا كان مدافع الخصم طويلاً", "قلة الربط الأرضي التكتيكي"],
    bestFormation: "4-4-2 أو 4-3-1-2"
  },
  "Overload": {
    emoji: "💪",
    badgeClass: "style-overload",
    en: "Overload",
    ar: "التكثيف والزيادة العددية",
    defLine: "متغير ومرن",
    compactness: "عالية في منطقة تواجد الكرة",
    attackSpeed: "سريعة وتعتمد على التفوق العددي",
    pros: ["خلق زيادة عددية (3 ضد 2 أو 2 ضد 1) في جهة واحدة", "عزل مدافعي الخصم وفتح مساحات خيالية للجانب المعاكس", "تطوير هجومي مرن وغير متوقع للمنافس"],
    cons: ["يتطلب قراءة سريعة للملعب وتمرير دقيق للجهة العكسية", "الجهة المعاكسة تكون مكشوفة في حال الانقطاع المفاجئ للكرة"],
    bestFormation: "4-3-3 أو 3-5-2 أو 4-2-3-1"
  }
};

// ── Database Paths ──
const MANAGERS_DB_PATH = "rodrigo_managers";
const PLAYER_STYLES_DB_PATH = "rodrigo_player_playstyles";

// ── Zeroed Out Data (User populates both Managers & Player Playstyles via Admin panel) ──
const DEFAULT_MANAGERS = [];
const DEFAULT_PLAYER_PLAYSTYLES = [];

// ── State ──
let allManagers = [];
let allPlayerStyles = [];
let activeManagerFilter = "all";
let managerSearchQuery = "";
let activePlayerCatFilter = "all";

// ── DOM Elements ──
const managersGridEl           = document.getElementById("managersGrid");
const playerStylesGridEl       = document.getElementById("playerStylesGrid");
const managerFilterRowEl       = document.getElementById("managerFilterRow");
const playerStyleFilterRowEl   = document.getElementById("playerStyleFilterRow");
const mgrPublicSearchEl        = document.getElementById("mgrPublicSearch");

// Manager Detail Modal
const mgrDetailModalOverlay    = document.getElementById("mgrDetailModalOverlay");
const mgrDetailModalClose      = document.getElementById("mgrDetailModalClose");
const mgrModalImg              = document.getElementById("mgrModalImg");
const mgrModalHeroPlaceholder  = document.getElementById("mgrModalHeroPlaceholder");
const mgrModalName             = document.getElementById("mgrModalName");
const mgrModalStyleBadge       = document.getElementById("mgrModalStyleBadge");
const mgrModalNatBadge         = document.getElementById("mgrModalNatBadge");
const mgrModalDescText         = document.getElementById("mgrModalDescText");
const mgrModalDetailText       = document.getElementById("mgrModalDetailText");
const mgrModalDetailSection    = document.getElementById("mgrModalDetailSection");
const mgrModalTraits           = document.getElementById("mgrModalTraits");

// Player Style Detail Modal
const psDetailModalOverlay     = document.getElementById("psDetailModalOverlay");
const psDetailModalClose       = document.getElementById("psDetailModalClose");
const psModalIcon              = document.getElementById("psModalIcon");
const psModalTitleEn           = document.getElementById("psModalTitleEn");
const psModalTitleAr           = document.getElementById("psModalTitleAr");
const psModalFullDesc          = document.getElementById("psModalFullDesc");
const psModalActivePos         = document.getElementById("psModalActivePos");
const psModalInactivePos       = document.getElementById("psModalInactivePos");
const psModalSynergy           = document.getElementById("psModalSynergy");
const psModalFamousPlayers     = document.getElementById("psModalFamousPlayers");

// ── Init & Firebase Sync ──
function init() {
  loadManagersData();
  loadPlayerStylesData();
  setupFilterEvents();
  setupSearchEvent();
  setupModalEvents();
  setupNavbarScroll();
}

function loadPlayerStylesData() {
  allPlayerStyles = [...DEFAULT_PLAYER_PLAYSTYLES];
  renderPlayerStyles();

  if (typeof firebaseDb !== "undefined" && firebaseDb) {
    try {
      firebaseDb.ref(PLAYER_STYLES_DB_PATH).on("value", (snap) => {
        const data = snap.val();
        if (data && typeof data === "object") {
          allPlayerStyles = Object.entries(data).map(([key, val]) => ({
            _key: key,
            ...val
          }));
        } else {
          allPlayerStyles = [...DEFAULT_PLAYER_PLAYSTYLES];
        }
        renderPlayerStyles();
      });
    } catch (err) {
      console.warn("Could not connect to Firebase player playstyles table:", err);
      renderPlayerStyles();
    }
  }
}

function loadManagersData() {
  // Start with default managers
  allManagers = [...DEFAULT_MANAGERS];
  renderManagers();

  // If Firebase is available, listen for live updates
  if (typeof firebaseDb !== "undefined" && firebaseDb) {
    try {
      firebaseDb.ref(MANAGERS_DB_PATH).on("value", (snap) => {
        const data = snap.val();
        if (data && typeof data === "object") {
          const liveManagers = Object.entries(data).map(([key, val]) => ({
            _key: key,
            ...val
          }));

          // Merge: remove any default managers that have same name or key, and prepend live managers
          const liveNames = new Set(liveManagers.map(m => (m.name || "").toLowerCase().trim()));
          const remainingDefaults = DEFAULT_MANAGERS.filter(m => !liveNames.has((m.name || "").toLowerCase().trim()));

          allManagers = [...liveManagers, ...remainingDefaults];
        } else {
          allManagers = [...DEFAULT_MANAGERS];
        }
        renderManagers();
      });
    } catch (err) {
      console.warn("Could not connect to Firebase managers table, using defaults:", err);
      renderManagers();
    }
  }
}

// ── Render Managers Grid ──
// ── Rating Threshold Colors (90+ Cyan, 80-89 Green, 70-79 Yellow, 60-69 Orange, <60 Red) ──
function getRatingStyle(val) {
  val = Number(val) || 0;
  if (val >= 90) return { badge: "stat-cyan", text: "txt-cyan", bar: "bar-cyan" };
  if (val >= 80) return { badge: "stat-green", text: "txt-green", bar: "bar-green" };
  if (val >= 70) return { badge: "stat-yellow", text: "txt-yellow", bar: "bar-yellow" };
  if (val >= 60) return { badge: "stat-orange", text: "txt-orange", bar: "bar-orange" };
  return { badge: "stat-red", text: "txt-red", bar: "bar-red" };
}

// ── Render Managers Grid (Exact eFootball Card Style) ──
function renderManagers() {
  if (!managersGridEl) return;

  const filtered = allManagers.filter(m => {
    // Style filter: check primary playstyle or if that stat is >= 80
    let matchStyle = activeManagerFilter === "all" || m.playstyle === activeManagerFilter;
    if (!matchStyle && m.stats && activeManagerFilter !== "all") {
      const mapKey = {
        "Possession Game": m.stats.possession,
        "Long Ball Counter": m.stats.longBallCounter,
        "Quick Counter": m.stats.quickCounter,
        "Long Ball": m.stats.longBall,
        "Out Wide": m.stats.outWide,
        "Overload": m.stats.overload
      };
      if ((mapKey[activeManagerFilter] || 0) >= 80) {
        matchStyle = true;
      }
    }

    const matchSearch = !managerSearchQuery ||
      (m.name || "").toLowerCase().includes(managerSearchQuery.toLowerCase()) ||
      (m.playstyle || "").toLowerCase().includes(managerSearchQuery.toLowerCase()) ||
      (m.nationality || "").toLowerCase().includes(managerSearchQuery.toLowerCase()) ||
      (m.description || "").toLowerCase().includes(managerSearchQuery.toLowerCase());
    return matchStyle && matchSearch;
  });

  managersGridEl.innerHTML = "";

  if (filtered.length === 0) {
    if (allManagers.length === 0) {
      managersGridEl.innerHTML = `
        <div class="empty-grid-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div class="empty-icon" style="font-size: 3rem; margin-bottom: 12px;">👔</div>
          <p style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary); margin-bottom: 6px;">لا يوجد مدربون مضافون حالياً</p>
          <span style="font-size: 0.85rem; color: var(--text-sec); display: block;">يمكنك إضافة المدربين وتكتيكاتهم وبوستراتهم بسهولة من لوحة التحكم</span>
        </div>
      `;
    } else {
      managersGridEl.innerHTML = `
        <div class="empty-grid-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div class="empty-icon" style="font-size: 2.5rem; margin-bottom: 10px;">🔍</div>
          <p>لم يتم العثور على مدربين يطابقون بحثك</p>
          <span style="font-size: 0.8rem; color: var(--text-sec); margin-top: 6px; display: block;">جرب اختيار أسلوب آخر أو مسح كلمة البحث</span>
        </div>
      `;
    }
    return;
  }

  filtered.forEach(m => {
    const card = document.createElement("div");
    card.className = "mgr-card-efootball";
    card.setAttribute("tabindex", "0");
    card.onclick = () => openManagerDetail(m);

    // Normalize stats
    const stats = m.stats || {
      possession: m.playstyle === "Possession Game" ? 88 : 65,
      longBallCounter: m.playstyle === "Long Ball Counter" ? 88 : 67,
      quickCounter: m.playstyle === "Quick Counter" ? 88 : 74,
      longBall: m.playstyle === "Long Ball" ? 88 : 58,
      outWide: m.playstyle === "Out Wide" ? 88 : 64,
      overload: m.playstyle === "Overload" ? 88 : 75
    };

    // Normalize boosters
    const boostersList = Array.isArray(m.boosters)
      ? m.boosters
      : (m.boosters ? String(m.boosters).split(",") : []);
    const boostersHtml = boostersList.map(b => `<span class="mgr-boost-pill">${escapeHtml(b.trim())}</span>`).join("");

    // The 6 stats matching eFootball layout exactly
    const statItems = [
      { name: "Possession Game", val: stats.possession ?? 65 },
      { name: "Long Ball Counter", val: stats.longBallCounter ?? 65 },
      { name: "Quick Counter", val: stats.quickCounter ?? 65 },
      { name: "Long Ball", val: stats.longBall ?? 60 },
      { name: "Out Wide", val: stats.outWide ?? 64 },
      { name: "Overload", val: stats.overload ?? 65 }
    ];

    const statsHtml = statItems.map(s => {
      const cls = getRatingStyle(s.val);
      return `
        <div class="mgr-stat-row">
          <div class="mgr-stat-top-line">
            <span class="mgr-stat-badge ${cls.badge}">${s.val}</span>
            <span class="mgr-stat-label ${cls.text}">${s.name}</span>
          </div>
          <div class="mgr-bar-track">
            <div class="mgr-bar-fill ${cls.bar}" style="width: ${Math.min(s.val, 100)}%;"></div>
          </div>
        </div>
      `;
    }).join("");

    card.innerHTML = `
      <div class="mgr-card-top">
        <div class="mgr-avatar-box">
          <img src="${escapeHtml(m.image || 'Page Manager/Makino Tomoaki.png')}"
               class="mgr-avatar-img"
               alt="${escapeHtml(m.name || 'Manager')}"
               loading="lazy"
               onerror="this.onerror=null;this.src='Page Manager/Makino Tomoaki.png';">
          <div class="mgr-avatar-badge" title="Booster Manager">
            <span class="badge-dot"></span>
            <span class="badge-dot"></span>
          </div>
        </div>
        <div class="mgr-info-col">
          <h3 class="mgr-card-name" title="${escapeHtml(m.name)}">${escapeHtml(m.name || 'Manager')}</h3>
          <div class="mgr-boosters-row">
            ${boostersHtml}
          </div>
        </div>
      </div>
      <div class="mgr-stats-list">
        ${statsHtml}
      </div>
    `;

    managersGridEl.appendChild(card);
  });
}

// ── Open Manager Detail Modal ("صفحة المدرب الخاصة") ──
function openManagerDetail(m) {
  const ps = PLAYSTYLE_INFO[m.playstyle] || { emoji: "⚽", badgeClass: "style-possession", ar: m.playstyle };

  mgrModalName.textContent = m.name || "مدرب";
  mgrModalStyleBadge.className = `mgr-style-tag ${ps.badgeClass}`;
  mgrModalStyleBadge.innerHTML = `<span>${ps.emoji}</span> <span>${escapeHtml(m.playstyle || '')} (${ps.ar || ''})</span>`;
  mgrModalNatBadge.textContent = m.nationality ? `🌍 ${m.nationality}` : "eFootball Manager";

  // Boosters
  const boostersEl = document.getElementById("mgrModalBoosters");
  if (boostersEl) {
    const boostersList = Array.isArray(m.boosters)
      ? m.boosters
      : (m.boosters ? String(m.boosters).split(",") : []);
    if (boostersList.length > 0) {
      boostersEl.innerHTML = boostersList.map(b => `
        <span style="background:rgba(59,130,246,0.15);border:1px solid #3b82f6;color:#93c5fd;font-size:0.78rem;font-weight:800;padding:4px 10px;border-radius:6px;">
          ⚡ ${escapeHtml(b.trim())}
        </span>
      `).join("");
      boostersEl.style.display = "flex";
    } else {
      boostersEl.style.display = "none";
    }
  }

  // 6 Stats Breakdown in Modal
  const statsListEl = document.getElementById("mgrModalStatsList");
  if (statsListEl) {
    const stats = m.stats || {
      possession: m.playstyle === "Possession Game" ? 88 : 65,
      longBallCounter: m.playstyle === "Long Ball Counter" ? 88 : 67,
      quickCounter: m.playstyle === "Quick Counter" ? 88 : 74,
      longBall: m.playstyle === "Long Ball" ? 88 : 58,
      outWide: m.playstyle === "Out Wide" ? 88 : 64,
      overload: m.playstyle === "Overload" ? 88 : 75
    };

    const statItems = [
      { name: "Possession Game", val: stats.possession ?? 65 },
      { name: "Long Ball Counter", val: stats.longBallCounter ?? 65 },
      { name: "Quick Counter", val: stats.quickCounter ?? 65 },
      { name: "Long Ball", val: stats.longBall ?? 60 },
      { name: "Out Wide", val: stats.outWide ?? 64 },
      { name: "Overload", val: stats.overload ?? 65 }
    ];

    statsListEl.innerHTML = statItems.map(s => {
      const cls = getRatingStyle(s.val);
      return `
        <div style="display:flex;flex-direction:column;gap:4px;">
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:0.8rem;font-weight:700;" class="${cls.text}">${s.name}</span>
            <span class="mgr-stat-badge ${cls.badge}">${s.val}</span>
          </div>
          <div class="mgr-bar-track">
            <div class="mgr-bar-fill ${cls.bar}" style="width: ${Math.min(s.val, 100)}%;"></div>
          </div>
        </div>
      `;
    }).join("");
  }

  mgrModalDescText.textContent = m.description || "شرح تكتيكي مفصل حول أسلوب اللعب وكيفية إدارة المباريات بكفاءة عالية.";

  if (m.playstyleDetail) {
    mgrModalDetailSection.style.display = "block";
    mgrModalDetailText.textContent = m.playstyleDetail;
  } else if (ps.bestFormation) {
    mgrModalDetailSection.style.display = "block";
    mgrModalDetailText.textContent = `التشكيلات الموصى بها: ${ps.bestFormation} — سرعة اللعب: ${ps.attackSpeed || 'متوازنة'}.`;
  } else {
    mgrModalDetailSection.style.display = "none";
  }

  // Recommended Synergies
  const synergiesEl = document.getElementById("mgrModalSynergies");
  if (synergiesEl) {
    const recs = {
      "Possession Game": ["Creative Playmaker", "Orchestrator", "Hole Player", "Deep-Lying Forward", "Build Up"],
      "Quick Counter": ["Goal Poacher", "Prolific Winger", "The Destroyer", "Anchor Man", "Offensive GK"],
      "Long Ball Counter": ["Goal Poacher", "Target Man", "Anchor Man", "Defensive Fullback", "Defensive GK"],
      "Out Wide": ["Cross Specialist", "Target Man", "Fox in the Box", "Offensive Fullback"],
      "Long Ball": ["Target Man", "Fox in the Box", "Box-to-Box", "Build Up"],
      "Overload": ["Roaming Flank", "Fullback Finisher", "Hole Player", "Dummy Runner"]
    };
    const list = recs[m.playstyle] || ["Goal Poacher", "Anchor Man", "Box-to-Box"];
    synergiesEl.innerHTML = list.map(item => `
      <span style="background:rgba(108,99,255,0.12);border:1px solid rgba(108,99,255,0.3);color:#c084fc;padding:5px 12px;border-radius:6px;font-size:0.8rem;font-weight:700;">
        ⭐ ${item}
      </span>
    `).join("");
  }

  // Traits list
  mgrModalTraits.innerHTML = `
    <div class="mgr-trait">
      <span style="font-size:1.1rem;">🛡️</span>
      <div>
        <div style="font-size:0.7rem;color:var(--text-dim);">خط الدفاع</div>
        <div style="font-size:0.8rem;color:var(--text-primary);">${ps.defLine || 'متوازن'}</div>
      </div>
    </div>
    <div class="mgr-trait">
      <span style="font-size:1.1rem;">🔒</span>
      <div>
        <div style="font-size:0.7rem;color:var(--text-dim);">الكثافة الدفاعية</div>
        <div style="font-size:0.8rem;color:var(--text-primary);">${ps.compactness || 'متوسطة'}</div>
      </div>
    </div>
    <div class="mgr-trait">
      <span style="font-size:1.1rem;">⚡</span>
      <div>
        <div style="font-size:0.7rem;color:var(--text-dim);">سرعة التحول</div>
        <div style="font-size:0.8rem;color:var(--text-primary);">${ps.attackSpeed || 'سريعة'}</div>
      </div>
    </div>
    <div class="mgr-trait">
      <span style="font-size:1.1rem;">📋</span>
      <div>
        <div style="font-size:0.7rem;color:var(--text-dim);">التشكيلة المفضلة</div>
        <div style="font-size:0.8rem;color:var(--text-primary);">${ps.bestFormation || '4-3-3 / 4-2-2-2'}</div>
      </div>
    </div>
  `;

  // Hero image
  if (m.image) {
    mgrModalImg.src = m.image;
    mgrModalImg.style.display = "block";
    mgrModalHeroPlaceholder.style.display = "none";
  } else {
    mgrModalImg.style.display = "none";
    mgrModalHeroPlaceholder.style.display = "flex";
    mgrModalHeroPlaceholder.textContent = ps.emoji;
  }

  mgrDetailModalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeManagerDetail() {
  mgrDetailModalOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

// ── Render Player Playstyles ──
function renderPlayerStyles() {
  if (!playerStylesGridEl) return;

  const filtered = allPlayerStyles.filter(ps => {
    if (activePlayerCatFilter === "all") return true;
    return ps.category === activePlayerCatFilter;
  });

  playerStylesGridEl.innerHTML = "";

  if (filtered.length === 0) {
    if (allPlayerStyles.length === 0) {
      playerStylesGridEl.innerHTML = `
        <div class="empty-grid-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div class="empty-icon" style="font-size: 3rem; margin-bottom: 12px;">🏃</div>
          <p style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary); margin-bottom: 6px;">لا توجد أساليب لعب للاعبين مضافة حالياً</p>
          <span style="font-size: 0.85rem; color: var(--text-sec); display: block;">يمكنك إضافة أساليب تحرك اللاعبين ومراكزهم والتناغم بسهولة من لوحة التحكم</span>
        </div>
      `;
    } else {
      playerStylesGridEl.innerHTML = `
        <div class="empty-grid-state" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
          <div class="empty-icon" style="font-size: 2.5rem; margin-bottom: 10px;">🔍</div>
          <p>لا توجد أساليب في هذا القسم تطابق اختيارك</p>
          <span style="font-size: 0.8rem; color: var(--text-sec); margin-top: 6px; display: block;">جرب اختيار فئة أخرى من القائمة أعلاه</span>
        </div>
      `;
    }
    return;
  }

  const catThemes = {
    FWD: { color: "#f43f5e", bgAlpha: "rgba(244,63,94,0.12)", borderCol: "rgba(244,63,94,0.3)" },
    MID: { color: "#3b82f6", bgAlpha: "rgba(59,130,246,0.12)", borderCol: "rgba(59,130,246,0.3)" },
    DEF: { color: "#10b981", bgAlpha: "rgba(16,185,129,0.12)", borderCol: "rgba(16,185,129,0.3)" },
    GK:  { color: "#eab308", bgAlpha: "rgba(234,179,8,0.12)",  borderCol: "rgba(234,179,8,0.3)" }
  };

  filtered.forEach(ps => {
    const card = document.createElement("div");
    card.className = "ps-card";
    const theme = catThemes[ps.category] || catThemes.FWD;
    const col = ps.color || theme.color;
    const bg = ps.bgAlpha || theme.bgAlpha;
    const border = ps.borderCol || theme.borderCol;

    card.style.setProperty("--ps-color-a", bg);
    card.style.setProperty("--ps-color-border", border);
    card.style.setProperty("--ps-glow", bg);
    card.onclick = () => openPlayerStyleDetail(ps);

    const activePositions = Array.isArray(ps.activePos)
      ? ps.activePos
      : (ps.activePos ? String(ps.activePos).split(",").map(p => p.trim()).filter(Boolean) : []);

    card.innerHTML = `
      <div class="ps-card-header">
        <div class="ps-icon" style="background:${bg};border:1px solid ${border};color:${col};">
          ${escapeHtml(ps.icon || '⚽')}
        </div>
        <div class="ps-name-block">
          <div class="ps-name-en">${escapeHtml(ps.nameEn || '')}</div>
          <div class="ps-name-ar">${escapeHtml(ps.nameAr || '')}</div>
        </div>
        <span class="ps-category-badge" style="background:${bg};color:${col};border:1px solid ${border};">
          ${escapeHtml(ps.category || '')}
        </span>
      </div>
      <p class="ps-desc">${escapeHtml(ps.shortDesc || '')}</p>
      <div class="ps-key-stats">
        ${activePositions.map(pos => `<span class="ps-stat" style="color:${col};background:rgba(255,255,255,0.05);">${escapeHtml(pos)}</span>`).join("")}
      </div>
    `;
    playerStylesGridEl.appendChild(card);
  });
}

// ── Open Player Style Detail Modal ──
function openPlayerStyleDetail(ps) {
  const catThemes = {
    FWD: { color: "#f43f5e", bgAlpha: "rgba(244,63,94,0.15)", borderCol: "rgba(244,63,94,0.35)" },
    MID: { color: "#3b82f6", bgAlpha: "rgba(59,130,246,0.15)", borderCol: "rgba(59,130,246,0.35)" },
    DEF: { color: "#10b981", bgAlpha: "rgba(16,185,129,0.15)", borderCol: "rgba(16,185,129,0.35)" },
    GK:  { color: "#eab308", bgAlpha: "rgba(234,179,8,0.15)",  borderCol: "rgba(234,179,8,0.35)" }
  };
  const theme = catThemes[ps.category] || catThemes.FWD;
  const col = ps.color || theme.color;
  const bg = ps.bgAlpha || theme.bgAlpha;
  const border = ps.borderCol || theme.borderCol;

  psModalIcon.textContent = ps.icon || "⚽";
  psModalIcon.style.background = bg;
  psModalIcon.style.border = `1px solid ${border}`;
  psModalIcon.style.color = col;

  psModalTitleEn.textContent = ps.nameEn || "—";
  psModalTitleAr.textContent = ps.nameAr || "—";
  psModalFullDesc.textContent = ps.fullDesc || ps.shortDesc || "—";

  // Active positions badges
  const activePositions = Array.isArray(ps.activePos)
    ? ps.activePos
    : (ps.activePos ? String(ps.activePos).split(",").map(p => p.trim()).filter(Boolean) : []);

  psModalActivePos.innerHTML = activePositions.length > 0
    ? activePositions.map(pos => `
        <span style="display:inline-block;padding:5px 12px;border-radius:6px;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);color:#4ade80;font-size:0.8rem;font-weight:700;">
          ✓ ${escapeHtml(pos)}
        </span>
      `).join("")
    : `<span style="color:var(--text-dim);font-size:0.8rem;">—</span>`;

  psModalInactivePos.textContent = ps.inactivePos || "—";
  psModalSynergy.textContent = ps.synergy || "—";

  // Famous players pills
  const famousList = Array.isArray(ps.famous)
    ? ps.famous
    : (ps.famous ? String(ps.famous).split(",").map(f => f.trim()).filter(Boolean) : []);

  psModalFamousPlayers.innerHTML = famousList.length > 0
    ? famousList.map(name => `
        <span style="display:inline-block;padding:5px 12px;border-radius:999px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.25);color:#fbbf24;font-size:0.8rem;font-weight:700;">
          ⭐ ${escapeHtml(name)}
        </span>
      `).join("")
    : `<span style="color:var(--text-dim);font-size:0.8rem;">—</span>`;

  psDetailModalOverlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closePlayerStyleDetail() {
  psDetailModalOverlay.classList.remove("active");
  document.body.style.overflow = "";
}

// ── Filter and Search Handlers ──
function setupFilterEvents() {
  // Manager style filters
  if (managerFilterRowEl) {
    managerFilterRowEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      managerFilterRowEl.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeManagerFilter = btn.getAttribute("data-style");
      renderManagers();
    });
  }

  // Player category filters
  if (playerStyleFilterRowEl) {
    playerStyleFilterRowEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      playerStyleFilterRowEl.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activePlayerCatFilter = btn.getAttribute("data-cat");
      renderPlayerStyles();
    });
  }
}

function setupSearchEvent() {
  if (mgrPublicSearchEl) {
    mgrPublicSearchEl.addEventListener("input", (e) => {
      managerSearchQuery = e.target.value.trim();
      renderManagers();
    });
  }
}

// ── Modal Listeners ──
function setupModalEvents() {
  mgrDetailModalClose && mgrDetailModalClose.addEventListener("click", closeManagerDetail);
  mgrDetailModalOverlay && mgrDetailModalOverlay.addEventListener("click", (e) => {
    if (e.target === mgrDetailModalOverlay) closeManagerDetail();
  });

  psDetailModalClose && psDetailModalClose.addEventListener("click", closePlayerStyleDetail);
  psDetailModalOverlay && psDetailModalOverlay.addEventListener("click", (e) => {
    if (e.target === psDetailModalOverlay) closePlayerStyleDetail();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeManagerDetail();
      closePlayerStyleDetail();
    }
  });
}

// ── Navbar Scroll Effect ──
function setupNavbarScroll() {
  const nav = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      nav && nav.classList.add("scrolled");
    } else {
      nav && nav.classList.remove("scrolled");
    }
  });
}

// ── Helpers ──
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ── Boot ──
document.addEventListener("DOMContentLoaded", init);
