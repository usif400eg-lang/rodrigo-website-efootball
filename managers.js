/* ═══════════════════════════════════════════════
   RODRIGO — Managers & Playstyles Page Logic
   ═══════════════════════════════════════════════ */

// ── Firebase DB Path ──
const MANAGERS_DB_PATH = "rodrigo_managers";

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

// ── Pre-loaded Default Managers (with photos from Page Manager) ──
const DEFAULT_MANAGERS = [
  {
    _key: "def_klopp",
    name: "Jürgen Klopp",
    nationality: "ألمانيا / ليفربول",
    playstyle: "Quick Counter",
    image: "Page Manager/Jurgen Klopp.png",
    description: "أسلوب الـ Gegenpressing الشهير: ضغط هائل وعنيف في الثلث الأخير من ملعب الخصم بمجرد خسارة الكرة، وانقضاض فوري على المرمى بـ 3 مهاجمين سريعين.",
    playstyleDetail: "أفضل تشكيلة: 4-3-3 مع أجنحة سريعة هدافة (Prolific Winger) ومهاجم قناص (Goal Poacher). اضبط الدفاع على الضغط العالي مع حارس هجومي ممتاز."
  },
  {
    _key: "def_mourinho",
    name: "José Mourinho",
    nationality: "البرتغال / روما - ريال مدريد",
    playstyle: "Long Ball Counter",
    image: "Page Manager/Jose Mourinho.png",
    description: "ملك الدفاع التكتيكي والمرتدات القاتلة: خط دفاع متراجع وكتلة دفاعية منيعة تجبر الخصم على التسديد العشوائي، ثم ضربه بتمريرة ساقطة واحدة تقصم ظهره.",
    playstyleDetail: "أفضل تشكيلة: 4-2-2-2 أو 5-2-1-2. اعتمد على ارتكاز دفاعي صلب (Anchor Man) مع مهاجمين سريعين جداً في الخط الأمامي لإنهاء المرتدات."
  },
  {
    _key: "def_conte",
    name: "Antonio Conte",
    nationality: "إيطاليا / نابولي - إنتر ميلان",
    playstyle: "Long Ball Counter",
    image: "Page Manager/Antonio Conte.png",
    description: "منظومة دفاعية حديدية بثلاثة قلوب دفاع وانطلاقات مرعبة للأجنحة الدفاعية (Wing-backs). صلابة لا تُقهر في الصندوق وتحولات مرتدة منظمة بالمليمتر.",
    playstyleDetail: "أفضل تشكيلة: 3-5-2 أو 5-3-2. استخدم مهاجم محطة قوي بدنياً بجوار مهاجم قناص سريع، مع أظهرة هجومية ذوي لياقة بدنية خارقة."
  },
  {
    _key: "def_chivu",
    name: "Cristian Chivu",
    nationality: "رومانيا / إنتر ميلان",
    playstyle: "Possession Game",
    image: "Page Manager/Cristian Chivu.png",
    description: "بناء منظم وتدرج هادئ بالكرة من قلبي الدفاع مروراً بالارتكاز حتى إيجاد الثغرة بين خطوط المنافس، مع خط دفاع متقدم وتحكم في رتم المباراة.",
    playstyleDetail: "أفضل تشكيلة: 4-3-3 أو 4-2-1-3. وظف مدافعين بأسلوب Build Up ولاعبي وسط بأسلوب Orchestrator للتحكم في ريتم التمرير والسيطرة."
  },
  {
    _key: "def_kovac",
    name: "Niko Kovac",
    nationality: "كرواتيا / فولفسبورغ - موناكو",
    playstyle: "Quick Counter",
    image: "Page Manager/Niko Kovac.png",
    description: "انضباط بدني عالي وركض لا يتوقف: سرعة هائلة في التحول من الدفاع إلى الهجوم فور استرجاع الكرة في وسط الملعب مع تغطية دفاعية فورية.",
    playstyleDetail: "أفضل تشكيلة: 4-2-3-1 أو 4-3-3. يحتاج لاعبي وسط من نوعية Box-to-Box يتميزون بلياقة بدنية وقدرة على قطع الكرات والمساندة الهجومية."
  },
  {
    _key: "def_makino",
    name: "Makino Tomoaki",
    nationality: "اليابان / فيسيل كوبه",
    playstyle: "Out Wide",
    image: "Page Manager/Makino Tomoaki.png",
    description: "استغلال عرض الملعب بالكامل عبر الأجنحة السريعة والأظهرة المتقدمة، مع تحركات ذكية داخل منطقة الجزاء لاستقبال الكرات العرضية الرأسية.",
    playstyleDetail: "أفضل تشكيلة: 4-4-2 أو 3-4-3. المهاجم يجب أن يكون مميزاً في ضربات الرأس والارتقاء، مع أجنحة بمهارة Pinpoint Crossing."
  },
  {
    _key: "def_guardiola",
    name: "Pep Guardiola",
    nationality: "إسبانيا / مانشستر سيتي",
    playstyle: "Possession Game",
    image: "Page Manager/17592991451474.png",
    description: "فلسفة التيكي تاكا المعاصرة: الاستحواذ المطلق، تدوير الكرة باستمرار لإرهاق الخصم، وتوظيف الأظهرة كلاعبي وسط إضافيين (Inverted Fullbacks).",
    playstyleDetail: "أفضل تشكيلة: 4-3-3 أو 3-2-4-1. ركّز على لاعبين يتمتعون بدقة تمرير تتجاوز 90 مع تحكم وثيق بالكرة (Tight Possession)."
  },
  {
    _key: "def_rodriguez",
    name: "R. Rodríguez",
    nationality: "إسبانيا / جيرونا",
    playstyle: "Overload",
    image: "Page Manager/R. Rodriguez.png",
    description: "تكتيك حديث يعتمد على نقل 4 إلى 5 لاعبين لجانب واحد من الملعب لسحب دفاع المنافس، ثم إرسال كرة قطرية نحو المساحة الفارغة في الطرف المقابل.",
    playstyleDetail: "أفضل تشكيلة: 4-2-3-1 أو 3-4-2-1. استخدم صانع ألعاب ذكي (Creative Playmaker) يقرأ تحركات الفريق بسرعة وينقل اللعب للجهة العكسية."
  }
];

// ── Complete Player Playstyles (All 22 eFootball In-Game Styles) ──
const PLAYER_PLAYSTYLES = [
  // ── FORWARDS (FWD) ──
  {
    id: "goal_poacher",
    category: "FWD",
    nameEn: "Goal Poacher",
    nameAr: "قناص الأهداف (مهاجم القناص)",
    icon: "🎯",
    color: "#ef4444",
    bgAlpha: "rgba(239,68,68,0.12)",
    borderCol: "rgba(239,68,68,0.35)",
    shortDesc: "مهاجم يعيش على حافة مصيدة التسلل وينطلق خلف المدافعين بمجرد لمح التمريرة البينية.",
    fullDesc: "الأسلوب الهجومي الأكثر فتكاً وشعبية في eFootball. يقف اللاعب باستمرار على الخط الأخير مع مدافعي الخصم، ويتحرك في اللحظة المثالية للهروب في العمق والانفراد بالحارس. مثالي جداً لإنهاء التمريرات البينية السريعة.",
    activePos: ["CF", "SS"],
    inactivePos: "الأجنحة (LWG/RWG)، خط الوسط بالكامل، وخط الدفاع.",
    synergy: "يتناغم بشكل خارق مع أسلوبي الكونتر (Quick Counter و Long Ball Counter) لوجود مساحات للانطلاق خلف المدافعين.",
    stats: ["Offensive Awareness", "Finishing", "Speed", "Acceleration"],
    famous: ["Mbappé", "Haaland", "Lewandowski", "Shevchenko", "Torres", "Inzaghi"]
  },
  {
    id: "dummy_runner",
    category: "FWD",
    nameEn: "Dummy Runner",
    nameAr: "المهاجم الوهمي (اللاعب الساحب للدفاع)",
    icon: "🎭",
    color: "#f59e0b",
    bgAlpha: "rgba(245,158,11,0.12)",
    borderCol: "rgba(245,158,11,0.35)",
    shortDesc: "يجري تحركات ذكية لسحب مدافعي الخصم معه وتفريغ مساحات شاغرة لزملائه القادمين من الخلف.",
    fullDesc: "لاعب تكتيكي من الطراز الرفيع. عندما تهاجم، يقوم بتحركات مفاجئة مائلة أو متأخرة تجبر قلبي دفاع الخصم على تتبعه، مما يفتح ممراً شاسعاً لتقدم الجناح أو صانع الألعاب للتسجيل بحرية تامة.",
    activePos: ["CF", "SS", "AMF"],
    inactivePos: "الأجنحة (LWG/RWG)، ولاعبي الارتكاز، وخط الدفاع.",
    synergy: "ممتاز في خطط الاستحواذ والتكثيف (Possession & Overload) مع أجنحة هدافة تدخل في العمق.",
    stats: ["Offensive Awareness", "Acceleration", "Stamina", "Speed"],
    famous: ["Thomas Müller", "Diogo Jota", "Firmino", "David Alaba (CF version)"]
  },
  {
    id: "fox_in_the_box",
    category: "FWD",
    nameEn: "Fox in the Box",
    nameAr: "صياد منطقة الجزاء (ثعلب الصندوق)",
    icon: "🦊",
    color: "#fb923c",
    bgAlpha: "rgba(251,146,60,0.12)",
    borderCol: "rgba(251,146,60,0.35)",
    shortDesc: "مهاجم لا يغادر منطقة الجزاء أبداً، يتربص بأي كرة طائشة أو عرضية ليدعها في الشباك.",
    fullDesc: "على عكس القناص الذي يركض في المساحات، يبقى ثعلب الصندوق متمركزاً داخل منطقة العمليات محاطاً بالمدافعين، ويتمركز بذكاء لاستقبال التمريرات القاتلة والتسديد المباشر من اللمسة الأولى (First-time Shot).",
    activePos: ["CF"],
    inactivePos: "أي مركز آخر غير CF.",
    synergy: "أسلوب Out Wide و Long Ball: يستقبل العرضيات والكرات الساقطة داخل الـ 18 ببراعة استثنائية.",
    stats: ["Finishing", "Offensive Awareness", "Physical Contact", "Heading"],
    famous: ["Romário", "Van Nistelrooy", "Batistuta", "Kane", "Vieri"]
  },
  {
    id: "target_man",
    category: "FWD",
    nameEn: "Target Man",
    nameAr: "المهاجم المحطة (محطة التوزيع الهوائي)",
    icon: "🧱",
    color: "#a855f7",
    bgAlpha: "rgba(168,85,247,0.12)",
    borderCol: "rgba(168,85,247,0.35)",
    shortDesc: "مهاجم عملاق يستلم الكرات الطويلة بظهره للمرمى ويثبت المدافعين ليمهد الكرة لزملائه.",
    fullDesc: "المحطة الهجومية الأفضل: عندما ترسل كرة عالية، يستخدم قوته البدنية لحجز المدافع وتثبيت الكرة، أو إسقاطها برأسه أمام الجناح أو صانع الألعاب المنطلق. يعتبر ركيزة استراتيجية لتخطي ضغط الخصم العالي.",
    activePos: ["CF"],
    inactivePos: "أي مركز آخر غير رأس الحربة الصريح CF.",
    synergy: "الأسلوب المثالي لمدربي Long Ball و Out Wide، خصوصاً للكرات العرضية والكرات الطويلة المباشرة.",
    stats: ["Physical Contact", "Heading", "Jump", "Tight Possession"],
    famous: ["Ibrahimović", "Giroud", "Drogba", "Koller", "Luuk de Jong"]
  },
  {
    id: "deep_lying_forward",
    category: "FWD",
    nameEn: "Deep-Lying Forward",
    nameAr: "المهاجم المتأخر (المهاجم الربّاط)",
    icon: "⚓",
    color: "#6366f1",
    bgAlpha: "rgba(99,102,241,0.12)",
    borderCol: "rgba(99,102,241,0.35)",
    shortDesc: "يتراجع للخلف لاستلام الكرة والمشاركة في صناعة اللعب ثم ينطلق فجأة نحو منطقة الجزاء.",
    fullDesc: "يجمع بين حاسة التهديف وبراعة صناعة اللعب. يتراجع حتى دائرة المنتصف ليساعد في التمرير وخلق زيادة عددية في الوسط، مما يجبر مدافع الخصم على الخروج خلفه وترك فراغ هائل في قلعة الدفاع.",
    activePos: ["CF", "SS"],
    inactivePos: "الأجنحة وباقي المراكز الدفاعية.",
    synergy: "مبهر جداً في Possession Game و Quick Counter، ويشكل ثنائية ساحرة مع قناص أهداف (Goal Poacher).",
    stats: ["Low Pass", "Ball Control", "Tight Possession", "Finishing"],
    famous: ["Lionel Messi (CF/SS)", "Harry Kane", "Benzema", "Totti", "Cruyff"]
  },
  {
    id: "prolific_winger",
    category: "FWD",
    nameEn: "Prolific Winger",
    nameAr: "الجناح الهدّاف (الجناح المخترق للعمق)",
    icon: "⚡",
    color: "#06b6d4",
    bgAlpha: "rgba(6,182,212,0.12)",
    borderCol: "rgba(6,182,212,0.35)",
    shortDesc: "جناح يبدأ انطلاقته من الخط الجانبي ثم يقتحم عمق منطقة الجزاء ليسجل الأهداف بنفسه.",
    fullDesc: "الأسلوب المفضل لأجنحة النخبة الحديثة. لا يكتفي بالبقاء على خط التماس، بل يكسر قطرياً نحو منطقة الجزاء للتسديد بالقدم العكسية (مثل روبن أو صلاح) أو لاستقبال العرضيات في القائم البعيد.",
    activePos: ["LWG", "RWG"],
    inactivePos: "لا يتفعل في مركز LMF أو RMF أو SS أو CF.",
    synergy: "فعّال جداً في كل الأساليب وخصوصاً Quick Counter و Possession Game حيث يمنحك منفذاً تهديفياً إضافياً.",
    stats: ["Speed", "Acceleration", "Finishing", "Curl", "Dribbling"],
    famous: ["Mohamed Salah", "Neymar Jr", "Vinícius Júnior", "Son Heung-min", "Leão"]
  },
  {
    id: "roaming_flank",
    category: "FWD",
    nameEn: "Roaming Flank",
    nameAr: "الجناح الحر / المتنقل",
    icon: "🌪️",
    color: "#14b8a6",
    bgAlpha: "rgba(20,184,166,0.12)",
    borderCol: "rgba(20,184,166,0.35)",
    shortDesc: "جناح غير مقيد بالطرف، يدخل باستمرار إلى عمق الوسط ليطلب الكرة ويشارك في بناء الهجمة.",
    fullDesc: "يتحرك بحرية بين الجناح وعمق الملعب (Half-spaces). إذا كان زميله مضغوطاً، يقترب منه كخيار تمرير آمن في العمق، تاركاً مساحة التماس خالية تماماً لتقدم الظهير السريع من الخلف.",
    activePos: ["LWG", "RWG", "LMF", "RMF"],
    inactivePos: "CF / SS / AMF / CMF.",
    synergy: "ممتاز مع أسلوب Possession Game و Overload، ويخلق تناغماً رهيباً مع ظهير هجومي (Offensive Fullback).",
    stats: ["Dribbling", "Tight Possession", "Low Pass", "Balance"],
    famous: ["Lionel Messi", "Bernardo Silva", "Pedri (LWG)", "Phil Foden", "Kubo"]
  },
  {
    id: "cross_specialist",
    category: "FWD",
    nameEn: "Cross Specialist",
    nameAr: "أخصائي العرضيات (صاحب الكرات المليمترية)",
    icon: "📐",
    color: "#10b981",
    bgAlpha: "rgba(16,185,129,0.12)",
    borderCol: "rgba(16,185,129,0.35)",
    shortDesc: "يلتزم بأقصى خط التماس ويبحث دائماً عن زاوية إرسال عرضية متقنة ومقوسة داخل الصندوق.",
    fullDesc: "لا يدخل إلى العمق إلا نادراً. يظل محاذياً لخط التماس ليضمن دائماً اتساع الملعب واستلام الكرة بأريحية، ثم يرسل كرات عرضية مقوسة بالمليمتر نحو رؤوس المهاجمين داخل منطقة العمليات.",
    activePos: ["RMF", "LMF", "RWG", "LWG"],
    inactivePos: "أي مركز داخل عمق الملعب.",
    synergy: "هو السلاح الفتاك رقم 1 لأسلوب Out Wide مع وجود مهاجم محطة (Target Man) أو ثعلب صندوق.",
    stats: ["Lofted Pass", "Curl", "Kicking Power", "Pinpoint Crossing Skill"],
    famous: ["David Beckham", "Filip Kostić", "Kieran Trippier", "Pedro Porro"]
  },

  // ── MIDFIELDERS (MID) ──
  {
    id: "hole_player",
    category: "MID",
    nameEn: "Hole Player",
    nameAr: "صانع الألعاب المتسلل (اللاعب الخفي)",
    icon: "🕳️",
    color: "#ec4899",
    bgAlpha: "rgba(236,72,153,0.12)",
    borderCol: "rgba(236,72,153,0.35)",
    shortDesc: "ينقض من الخلف إلى داخل منطقة الجزاء كالسهم بمجرد اقتراب الكرة من الثلث الأخير.",
    fullDesc: "أخطر أسلوب خط وسط في eFootball بلا منازع! يتمركز في العمق بهدوء، وفور انشغال مدافعي الخصم بمراقبة رأس الحربة، يخترق الفجوة الدفاعية بسرعة رهيبة ليجد نفسه منفرداً بالمرمى دون أي رقابة.",
    activePos: ["AMF", "SS", "CMF", "LMF", "RMF"],
    inactivePos: "CF / DMF / خط الدفاع.",
    synergy: "يتألق بشكل استثنائي في Quick Counter و Long Ball Counter و Possession Game.",
    stats: ["Offensive Awareness", "Acceleration", "Finishing", "Speed"],
    famous: ["Kaká", "Cruyff (AMF)", "Bellingham", "Musiala", "Iniesta", "Lampard"]
  },
  {
    id: "box_to_box",
    category: "MID",
    nameEn: "Box-to-Box",
    nameAr: "لاعب صندوق لصندوق (محرك الملعب الشامل)",
    icon: "🔄",
    color: "#3b82f6",
    bgAlpha: "rgba(59,130,246,0.12)",
    borderCol: "rgba(59,130,246,0.35)",
    shortDesc: "يركض طوال 90 دقيقة بلا توقف بين صندوق فريقه لقطع الكرات وصندوق الخصم للمساندة والتسديد.",
    fullDesc: "الرئة الحقيقية لأي تشكيلة. يدافع بضراوة في منطقة فريقه، وبمجرد استرجاع الكرة يركض للأمام لمساندة الهجمة والتسديد من خارج منطقة الجزاء. يحتاج إلى لياقة بدنية خارقة وقوة التحام.",
    activePos: ["CMF", "DMF", "LMF", "RMF"],
    inactivePos: "AMF / SS / خط الدفاع.",
    synergy: "يناسب جميع أساليب اللعب بدون استثناء، ويمنح توازناً مثالياً لوسط الميدان.",
    stats: ["Stamina", "Defensive Engagement", "Physical Contact", "Kicking Power"],
    famous: ["Valverde", "Gerrard", "Barella", "Matthäus", "Kanté", "Camavinga"]
  },
  {
    id: "classic_no_10",
    category: "MID",
    nameEn: "Classic No. 10",
    nameAr: "صانع الألعاب الكلاسيكي (المايسترو الثابت)",
    icon: "🎩",
    color: "#d946ef",
    bgAlpha: "rgba(217,70,239,0.12)",
    borderCol: "rgba(217,70,239,0.35)",
    shortDesc: "صانع ألعاب موهوب يفضل التمركز الثابت وتوزيع التمريرات البينية الساحرة دون بذل مجهود ركض كبير.",
    fullDesc: "في تحديثات eFootball الأخيرة أصبح هذا الأسلوب أكثر فاعلية؛ حيث يبقى اللاعب في مساحات شاغرة بين خطوط الخصم، محافظاً على طاقته، ليرسل تمريرات سحرية حاسمة تضع المهاجمين وجهاً لوجه مع الشباك.",
    activePos: ["AMF", "SS"],
    inactivePos: "CMF / DMF / الأجنحة / CF.",
    synergy: "مناسب جداً لأسلوب Possession Game ولعبة التمرير الهادئة.",
    stats: ["Low Pass", "Through Passing Skill", "Tight Possession", "Curl"],
    famous: ["Maradona", "Ronaldinho", "Zico", "Rivaldo", "Özil", "James Rodríguez"]
  },
  {
    id: "creative_playmaker",
    category: "MID",
    nameEn: "Creative Playmaker",
    nameAr: "صانع الألعاب المبتكر (العقل المدبر)",
    icon: "🎨",
    color: "#8b5cf6",
    bgAlpha: "rgba(139,92,246,0.12)",
    borderCol: "rgba(139,92,246,0.35)",
    shortDesc: "يبحث دائماً عن المساحات الخالية لاستلام الكرة وابتكار حلول هجومية غير متوقعة لكسر الدفاع.",
    fullDesc: "لاعب ذكي وحيوي للغاية. يتحرك في الفراغات لاستلام الكرة والتمرير، ولا يتردد في التوغل بالكرة وصناعة الفرص أو التسديد المنحني المقوس (Curler) من حافة منطقة الجزاء.",
    activePos: ["SS", "AMF", "LWG", "RWG", "LMF", "RMF"],
    inactivePos: "CF / CMF / DMF.",
    synergy: "رائع في Possession Game و Quick Counter مع مهاجمين سريعين يستقبلون بينياته.",
    stats: ["Low Pass", "Dribbling", "Ball Control", "Through Passing"],
    famous: ["Neymar Jr", "De Bruyne", "Modrić", "Pedri", "Dybala", "Griezmann"]
  },
  {
    id: "orchestrator",
    category: "MID",
    nameEn: "Orchestrator",
    nameAr: "المايسترو / ممرر الكرات (ضابط الإيقاع)",
    icon: "🎼",
    color: "#38bdf8",
    bgAlpha: "rgba(56,189,248,0.12)",
    borderCol: "rgba(56,189,248,0.35)",
    shortDesc: "يتمركز في عمق الوسط لتنظيم سير اللعب وتوزيع الكرات القصيرة والطويلة بدقة مجهرية.",
    fullDesc: "العقل المفكر في بناء اللعب من الخلف. يتراجع بين قلبي الدفاع لاستلام الكرة تحت الضغط، ثم يغير اتجاه اللعب بتمريرة قطرية طويلة أو تمريرة بينية تخترق خط وسط المنافس بسهولة.",
    activePos: ["CMF", "DMF"],
    inactivePos: "AMF / الأجنحة / الدفاع.",
    synergy: "حجر زاوية في Possession Game و Long Ball Counter لبدء الهجمة باحترافية.",
    stats: ["Low Pass", "Lofted Pass", "Tight Possession", "Balance"],
    famous: ["Andrea Pirlo", "Toni Kroos", "Luka Modrić", "Frenkie de Jong", "Scholes"]
  },
  {
    id: "anchor_man",
    category: "MID",
    nameEn: "Anchor Man",
    nameAr: "لاعب الارتكاز الدفاعي (حامي ظهر الفريق)",
    icon: "⚓",
    color: "#22c55e",
    bgAlpha: "rgba(34,197,94,0.12)",
    borderCol: "rgba(34,197,94,0.35)",
    shortDesc: "لاعب ارتكاز صارم لا يتقدم للهجوم أبداً، بل يلتزم بالتواجد أمام قلبي الدفاع لإفشال كل المرتدات.",
    fullDesc: "الدرع الواقي الأكثر أماناً في اللعبة! لا يتقدم للأمام حتى لو ضغطت على الهجوم، بل يقف كالسد المنيع أمام قلبي الدفاع لقطع الكرات البينية، اعتراض التمريرات، والالتحام مع صانع ألعاب الخصم لمنعه من الاستدارة.",
    activePos: ["DMF"],
    inactivePos: "أي مركز آخر غير الارتكاز الصريح DMF.",
    synergy: "أساسي وإجباري تقريباً في Quick Counter لحماية ظهر الفريق، وممتاز في Long Ball Counter.",
    stats: ["Defensive Awareness", "Tackling", "Physical Contact", "Interception Skill"],
    famous: ["Rodri", "Casemiro", "Gilberto Silva", "Fabinho", "Busquets"]
  },
  {
    id: "the_destroyer",
    category: "MID",
    nameEn: "The Destroyer",
    nameAr: "المدمّر (قاطع الكرات الشرس)",
    icon: "💥",
    color: "#f43f5e",
    bgAlpha: "rgba(244,63,94,0.12)",
    borderCol: "rgba(244,63,94,0.35)",
    shortDesc: "مدافع أو ارتكاز عدواني يندفع بقوة وشراسة نحو حامل الكرة لافتكاكها والالتحام معه بعنف.",
    fullDesc: "مقاتل لا يرحم. بمجرد أن يستلم مهاجم الخصم الكرة، يخرج المدمر من خطه وينقض عليه فوراً قبل أن يستدير. استخدامه في خط الوسط يخلق ضغطاً مرعباً، لكن استخدامه كقلب دفاع يتطلب الحذر حتى لا يترك فراغاً خلفه.",
    activePos: ["CB", "DMF", "CMF"],
    inactivePos: "الأظهرة / صانع الألعاب / الهجوم.",
    synergy: "خارق في أسلوب Quick Counter للضغط المتقدم واسترجاع الكرة في نصف ملعب الخصم.",
    stats: ["Aggression", "Defensive Engagement", "Physical Contact", "Tackling"],
    famous: ["Patrick Vieira", "Davids", "Gattuso", "Rúben Dias", "Puyol", "Koulibaly"]
  },

  // ── DEFENDERS (DEF) ──
  {
    id: "build_up",
    category: "DEF",
    nameEn: "Build Up",
    nameAr: "بناء اللعب من الخلف (المدافع الموزع)",
    icon: "🧱",
    color: "#64748b",
    bgAlpha: "rgba(100,116,139,0.12)",
    borderCol: "rgba(100,116,139,0.35)",
    shortDesc: "قلب دفاع منضبط يتراجع للخلف لتسلم الكرة من الحارس وتوزيع التمريرات الدقيقة بهدوء.",
    fullDesc: "المدافع الأكثر أماناً وهدوءاً. لا يندفع بشكل عشوائي للأمام، بل يراقب تحركات المهاجمين بدقة، ويجيد التمرير الأرضي والطولي لتفادي ضغط الخصم وبدء الهجمة بشكل صحيح.",
    activePos: ["CB"],
    inactivePos: "أي مركز آخر غير قلب الدفاع CB.",
    synergy: "المدافع المثالي لـ Possession Game و Long Ball Counter، ويُنصح بوضعه بجانب مدافع Destroyer.",
    stats: ["Low Pass", "Defensive Awareness", "Heading", "Physical Contact"],
    famous: ["Van Dijk", "Maldini", "Beckenbauer", "De Ligt", "Saliba", "Marquinhos"]
  },
  {
    id: "extra_frontman",
    category: "DEF",
    nameEn: "Extra Frontman",
    nameAr: "المدافع المتقدم (المدافع الإضافي بالهجوم)",
    icon: "⚔️",
    color: "#eab308",
    bgAlpha: "rgba(234,179,8,0.12)",
    borderCol: "rgba(234,179,8,0.35)",
    shortDesc: "قلب دفاع يتقدم بجرأة لمساندة الهجوم والتسديد عندما تتاح له فرصة أو في الضربات الثابتة.",
    fullDesc: "مدافع يتمتع بنزعة هجومية. عندما يسيطر فريقك على الكرة في نصف ملعب الخصم، يتقدم لخط الوسط لتشكيل زيادة عددية أو إطلاق تسديدات صاروخية بعيدة المدى، كما يشكل خطورة قصوى في الضربات الركنية.",
    activePos: ["CB"],
    inactivePos: "أي مركز آخر غير قلب الدفاع CB.",
    synergy: "ممتاز في Possession Game و Overload لفك التكتلات، لكن يحتاج ارتكاز Anchor Man للتغطية مكانه.",
    stats: ["Physical Contact", "Heading", "Kicking Power", "Defensive Awareness"],
    famous: ["Sergio Ramos", "Bastoni", "Koundé", "David Alaba (CB)", "Piqué"]
  },
  {
    id: "offensive_fullback",
    category: "DEF",
    nameEn: "Offensive Fullback",
    nameAr: "الظهير الهجومي (المساند السريع)",
    icon: "🏃",
    color: "#0284c7",
    bgAlpha: "rgba(2,132,199,0.12)",
    borderCol: "rgba(2,132,199,0.35)",
    shortDesc: "ظهير يندفع على طول خط التماس لمساندة الهجوم وإرسال العرضيات في كل هجمة.",
    fullDesc: "الظهير التقليدي الحديث: لا يتردد في الركض السريع على الجناح للتداخل وطلب الكرة خلف ظهير الخصم، ثم إرسال عرضيات متقنة للمهاجمين داخل الصندوق.",
    activePos: ["RB", "LB"],
    inactivePos: "قلوب الدفاع أو لاعبو خط الوسط.",
    synergy: "السلاح الأساسي لأسلوب Out Wide و Overload، ويتناغم جداً مع أجنحة Roaming Flank.",
    stats: ["Speed", "Stamina", "Lofted Pass", "Acceleration"],
    famous: ["Roberto Carlos", "Cafu", "Davies", "Hakimi", "Alexander-Arnold", "Theo Hernández"]
  },
  {
    id: "defensive_fullback",
    category: "DEF",
    nameEn: "Defensive Fullback",
    nameAr: "الظهير الدفاعي (الجدار الطرفي)",
    icon: "🛡️",
    color: "#15803d",
    bgAlpha: "rgba(21,128,61,0.12)",
    borderCol: "rgba(21,128,61,0.35)",
    shortDesc: "ظهير حديدي يلتزم بالمهام الدفاعية فقط ولا يتقدم للهجوم، مشكلاً خط دفاع رباعي صلب.",
    fullDesc: "الخيار الدفاعي الأكثر تفضيلاً للمحترفين في البطولات الإلكترونية! يبقى في مكانه بجوار قلوب الدفاع ليمنع أجنحة الخصم السريعة من الانطلاق أو لعب العرضيات، ويغلق المساحات تماماً في المرتدات.",
    activePos: ["RB", "LB"],
    inactivePos: "قلوب الدفاع أو الوسط.",
    synergy: "أساسي جداً في Quick Counter لتأمين الأطراف ضد المرتدات، وممتاز في Long Ball Counter.",
    stats: ["Defensive Awareness", "Tackling", "Physical Contact", "Speed"],
    famous: ["Costacurta", "Wan-Bissaka", "Ferland Mendy", "Tomiyasu", "Pavard"]
  },
  {
    id: "fullback_finisher",
    category: "DEF",
    nameEn: "Fullback Finisher",
    nameAr: "الظهير الهدّاف (المخترق للعمق)",
    icon: "🎯",
    color: "#ca8a04",
    bgAlpha: "rgba(202,138,4,0.12)",
    borderCol: "rgba(202,138,4,0.35)",
    shortDesc: "ظهير غير تقليدي يدخل إلى عمق منطقة الجزاء أو خط الوسط ليسجل الأهداف أو يمرر كلاعب وسط.",
    fullDesc: "ابتكار بيب غوارديولا الشهير: عندما يهاجم فريقك، لا يركض الظهير على خط التماس بل يخترق مباشرة نحو عمق منطقة الجزاء كلاعب هجوم إضافي غير مراقب، مما يربك دفاع الخصم كلياً.",
    activePos: ["RB", "LB"],
    inactivePos: "قلوب الدفاع أو حراسة المرمى.",
    synergy: "سلاح سري فتاك في Possession Game و Overload لخلق ارتباك دفاعي ومفاجأة الخصم.",
    stats: ["Offensive Awareness", "Finishing", "Low Pass", "Stamina"],
    famous: ["João Cancelo", "Zinchenko", "Guerreiro", "Alexander-Arnold (Inverted)"]
  },

  // ── GOALKEEPERS (GK) ──
  {
    id: "offensive_gk",
    category: "GK",
    nameEn: "Offensive Goalkeeper",
    nameAr: "حارس المرمى الهجومي (حارس القشاش)",
    icon: "🧤",
    color: "#059669",
    bgAlpha: "rgba(5,150,105,0.12)",
    borderCol: "rgba(5,150,105,0.35)",
    shortDesc: "حارس شجاع يخرج سريعاً من مرماه لقطع الكرات البينية الساقطة خلف خط دفاعه المتقدم.",
    fullDesc: "يلعب كـ 'Sweeper Keeper'؛ يتمركز على حافة منطقة الجزاء، وبمجرد أن يلعب الخصم كرة بينية ساقطة خلف الدفاع، ينطلق الحارس بأقصى سرعة لتشتيت الكرة قبل أن يصل إليها مهاجم الخصم.",
    activePos: ["GK"],
    inactivePos: "أي مركز آخر.",
    synergy: "إجباري تماماً في خطط الضغط العالي والخط المتقدم مثل Possession Game و Quick Counter.",
    stats: ["GK Awareness", "GK Reach", "Speed", "Acceleration"],
    famous: ["Neuer", "Alisson Becker", "Ederson", "Casillas", "Schmeichel", "Dida"]
  },
  {
    id: "defensive_gk",
    category: "GK",
    nameEn: "Defensive Goalkeeper",
    nameAr: "حارس المرمى الدفاعي (حارس خط المرمى)",
    icon: "🧱",
    color: "#0891b2",
    bgAlpha: "rgba(8,145,178,0.12)",
    borderCol: "rgba(8,145,178,0.35)",
    shortDesc: "حارس يفضل البقاء متمركزاً على خط مرماه للتركيز على رد الفعل والارتماء للتصدي للتسديدات الصعبة.",
    fullDesc: "لا يغامر بالخروج من مرماه إلا بأمر يدوي منك. يركز كامل انتباهه على خط المرمى ويتمتع بردود فعل خارقة (Reflexes) وتصديات بهلوانية للكرات القوية والتسديدات القريبة والمباغتة.",
    activePos: ["GK"],
    inactivePos: "أي مركز آخر.",
    synergy: "الحارس المثالي لـ Long Ball Counter والخطط الدفاعية المتراجعة حيث لا توجد مساحات خلف الدفاع.",
    stats: ["GK Reflexes", "GK Reach", "GK Awareness", "Jump"],
    famous: ["Courtois", "Oblak", "Donnarumma", "Cech", "Kahn", "Buffon"]
  }
];

// ── State ──
let allManagers = [];
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
  renderPlayerStyles();
  setupFilterEvents();
  setupSearchEvent();
  setupModalEvents();
  setupNavbarScroll();
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
function renderManagers() {
  if (!managersGridEl) return;

  const filtered = allManagers.filter(m => {
    // Style filter
    const matchStyle = activeManagerFilter === "all" || m.playstyle === activeManagerFilter;
    // Search query
    const matchSearch = !managerSearchQuery ||
      (m.name || "").toLowerCase().includes(managerSearchQuery.toLowerCase()) ||
      (m.playstyle || "").toLowerCase().includes(managerSearchQuery.toLowerCase()) ||
      (m.nationality || "").toLowerCase().includes(managerSearchQuery.toLowerCase()) ||
      (m.description || "").toLowerCase().includes(managerSearchQuery.toLowerCase());
    return matchStyle && matchSearch;
  });

  managersGridEl.innerHTML = "";

  if (filtered.length === 0) {
    managersGridEl.innerHTML = `
      <div class="empty-grid-state">
        <div class="empty-icon">👔</div>
        <p>لم يتم العثور على مدربين يطابقون بحثك</p>
        <span style="font-size:0.8rem;color:var(--text-sec);margin-top:6px;display:block;">جرب اختيار أسلوب آخر أو مسح كلمة البحث</span>
      </div>
    `;
    return;
  }

  filtered.forEach(m => {
    const ps = PLAYSTYLE_INFO[m.playstyle] || { emoji: "⚽", badgeClass: "style-possession", ar: m.playstyle };
    const card = document.createElement("div");
    card.className = "manager-card";
    card.setAttribute("tabindex", "0");
    card.onclick = () => openManagerDetail(m);

    // Image handling
    const imgHtml = m.image
      ? `<img src="${escapeHtml(m.image)}" alt="${escapeHtml(m.name || 'Manager')}" loading="lazy" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'manager-img-placeholder\\'>${ps.emoji}</div>';">`
      : `<div class="manager-img-placeholder">${ps.emoji}</div>`;

    card.innerHTML = `
      <div class="manager-img-wrap">
        ${imgHtml}
      </div>
      <div class="manager-card-body">
        <span class="manager-style-tag ${ps.badgeClass}">
          <span>${ps.emoji}</span>
          <span>${escapeHtml(m.playstyle || 'Tactics')}</span>
        </span>
        <h3 class="manager-name">${escapeHtml(m.name || 'مدرب')}</h3>
        <p class="manager-desc">${escapeHtml(m.description || 'شرح التكتيك وطريقة اللعب التنافسية في eFootball...')}</p>
      </div>
      <div class="manager-card-footer">
        <div class="manager-meta">
          ${m.nationality ? `<span class="meta-chip">🌍 ${escapeHtml(m.nationality)}</span>` : ''}
        </div>
        <span class="btn-view-manager">
          <span>التفاصيل</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </span>
      </div>
    `;
    managersGridEl.appendChild(card);
  });
}

// ── Open Manager Detail Modal ──
function openManagerDetail(m) {
  const ps = PLAYSTYLE_INFO[m.playstyle] || { emoji: "⚽", badgeClass: "style-possession", ar: m.playstyle };

  mgrModalName.textContent = m.name || "مدرب";
  mgrModalStyleBadge.className = `mgr-style-tag ${ps.badgeClass}`;
  mgrModalStyleBadge.innerHTML = `<span>${ps.emoji}</span> <span>${escapeHtml(m.playstyle || '')} (${ps.ar || ''})</span>`;
  mgrModalNatBadge.textContent = m.nationality ? `🌍 ${m.nationality}` : "eFootball Manager";

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

  const filtered = PLAYER_PLAYSTYLES.filter(ps => {
    if (activePlayerCatFilter === "all") return true;
    return ps.category === activePlayerCatFilter;
  });

  playerStylesGridEl.innerHTML = "";

  filtered.forEach(ps => {
    const card = document.createElement("div");
    card.className = "ps-card";
    card.style.setProperty("--ps-color-a", ps.bgAlpha);
    card.style.setProperty("--ps-color-border", ps.borderCol);
    card.style.setProperty("--ps-glow", ps.bgAlpha);
    card.onclick = () => openPlayerStyleDetail(ps);

    card.innerHTML = `
      <div class="ps-card-header">
        <div class="ps-icon" style="background:${ps.bgAlpha};border:1px solid ${ps.borderCol};color:${ps.color};">
          ${ps.icon}
        </div>
        <div class="ps-name-block">
          <div class="ps-name-en">${escapeHtml(ps.nameEn)}</div>
          <div class="ps-name-ar">${escapeHtml(ps.nameAr)}</div>
        </div>
        <span class="ps-category-badge" style="background:${ps.bgAlpha};color:${ps.color};border:1px solid ${ps.borderCol};">
          ${ps.category}
        </span>
      </div>
      <p class="ps-desc">${escapeHtml(ps.shortDesc)}</p>
      <div class="ps-key-stats">
        ${ps.activePos.map(pos => `<span class="ps-stat" style="color:${ps.color};background:rgba(255,255,255,0.05);">${pos}</span>`).join("")}
      </div>
    `;
    playerStylesGridEl.appendChild(card);
  });
}

// ── Open Player Style Detail Modal ──
function openPlayerStyleDetail(ps) {
  psModalIcon.textContent = ps.icon;
  psModalIcon.style.background = ps.bgAlpha;
  psModalIcon.style.border = `1px solid ${ps.borderCol}`;
  psModalIcon.style.color = ps.color;

  psModalTitleEn.textContent = ps.nameEn;
  psModalTitleAr.textContent = ps.nameAr;
  psModalFullDesc.textContent = ps.fullDesc;

  // Active positions badges
  psModalActivePos.innerHTML = ps.activePos.map(pos => `
    <span style="display:inline-block;padding:5px 12px;border-radius:6px;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);color:#4ade80;font-size:0.8rem;font-weight:700;">
      ✓ ${pos}
    </span>
  `).join("");

  psModalInactivePos.textContent = ps.inactivePos;
  psModalSynergy.textContent = ps.synergy;

  // Famous players pills
  psModalFamousPlayers.innerHTML = ps.famous.map(name => `
    <span style="display:inline-block;padding:5px 12px;border-radius:999px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.25);color:#fbbf24;font-size:0.8rem;font-weight:700;">
      ⭐ ${escapeHtml(name)}
    </span>
  `).join("");

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
