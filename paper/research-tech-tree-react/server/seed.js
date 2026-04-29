const db = require('./db');

// ═══════════════════════════════════════════
// DOMAINS (internally stored in `topics` table)
// ═══════════════════════════════════════════
const DOMAINS = [
  {
    id: 'conflict',
    name: '團隊衝突管理',
    name_en: 'Team Conflict Management',
    description: '從 Coser (1956) 到現代後設分析，探索團隊衝突如何影響績效與合作。',
    icon: '⚔',
  },
  {
    id: 'chess',
    name: '西洋棋與人格影響',
    name_en: 'Chess & Personality',
    description: '西洋棋如何塑造認知能力與人格特質？從專家認知到教育遷移的研究脈絡。',
    icon: '♟',
  },
  {
    id: 'leadership',
    name: '領導理論演進',
    name_en: 'Leadership Theory Evolution',
    description: '從特質論到共享領導——七十年來領導研究的典範轉移，以及各學派之間的血統圖譜。',
    icon: '⚜',
  },
  {
    id: 'fomo',
    name: 'FOMO 錯失恐懼',
    name_en: 'Fear of Missing Out',
    description: '從 Przybylski 的自我決定理論出發，探索錯失恐懼如何在社群媒體時代影響情緒、心理健康與行為決策。',
    icon: '⊘',
  },
];

// ═══════════════════════════════════════════
// SUBDOMAINS (internally stored in `branches` table)
// Each has: id, domain, label, color, name_en, description, row_pos, year_start
// ═══════════════════════════════════════════
const SUBDOMAINS = [
  // ── Conflict Management ──
  { id: 'foundation', domain: 'conflict', label: '奠基理論', name_en: 'Foundational Theory', color: '#b8912e', row_pos: 2, year_start: 1956,
    description: '從 Coser 到 Jehn，界定衝突的本質、功能與類型，建立後續所有研究的理論基礎。' },
  { id: 'task', domain: 'conflict', label: '任務衝突', name_en: 'Task Conflict', color: '#4a8a6a', row_pos: 0, year_start: 1996,
    description: '任務衝突（認知衝突）的效果研究：它有益還是有害？條件在哪？' },
  { id: 'process', domain: 'conflict', label: '過程衝突', name_en: 'Process Conflict', color: '#7a5e8a', row_pos: 3, year_start: 1997,
    description: '過程衝突——關於分工與職責的爭議，Jehn 1997 提出的第三種衝突類型。' },
  { id: 'meta', domain: 'conflict', label: '後設分析', name_en: 'Meta-Analyses', color: '#3a7a8a', row_pos: 1, year_start: 2003,
    description: '後設分析系列：整合歷年實證，量化衝突與績效的整體效應。' },
  { id: 'resolution', domain: 'conflict', label: '衝突解決', name_en: 'Conflict Resolution', color: '#9a4a4a', row_pos: 4, year_start: 1976,
    description: '衝突處理與解決策略：從 Thomas-Kilmann 五模式到過程-狀態觀點。' },
  { id: 'trust', domain: 'conflict', label: '信任與文化', name_en: 'Trust & Culture', color: '#8a7a2e', row_pos: 2, year_start: 2000,
    description: '信任與文化作為衝突動態的調節機制，決定任務衝突是升華還是惡化。' },

  // ── Chess & Personality ──
  { id: 'expertise', domain: 'chess', label: '專家認知', name_en: 'Expert Cognition', color: '#b8912e', row_pos: 1, year_start: 1965,
    description: '從 de Groot 到組塊/模板理論，西洋棋作為專家認知的原型領域。' },
  { id: 'personality', domain: 'chess', label: '人格與個別差異', name_en: 'Personality', color: '#4a8a6a', row_pos: 3, year_start: 2007,
    description: '棋手的人格剖面與個別差異研究。' },
  { id: 'intelligence', domain: 'chess', label: '智力研究', name_en: 'Intelligence', color: '#3a7a8a', row_pos: 0, year_start: 2007,
    description: '智力、流體能力與棋力的關聯；「門檻假說」與天賦/練習之辯。' },
  { id: 'transfer', domain: 'chess', label: '認知遷移', name_en: 'Cognitive Transfer', color: '#7a5e8a', row_pos: 2, year_start: 2016,
    description: '西洋棋訓練能否遷移到其他認知能力？遠遷移的懷疑。' },
  { id: 'education', domain: 'chess', label: '教育應用', name_en: 'Educational Use', color: '#9a4a4a', row_pos: 4, year_start: 2012,
    description: '西洋棋作為教育工具的實證研究。' },

  // ── Leadership ──
  { id: 'trait', domain: 'leadership', label: '特質與行為', name_en: 'Trait & Behavioral', color: '#b8912e', row_pos: 2, year_start: 1948,
    description: '從 Stogdill 的早期整合到 Big Five 的復興——領導是不是某種「人」？' },
  { id: 'contingency', domain: 'leadership', label: '情境權變', name_en: 'Contingency Theories', color: '#4a8a6a', row_pos: 2, year_start: 1967,
    description: 'Fiedler、House 與 Vroom：沒有普適的領導風格，只有「情境對不對」。' },
  { id: 'transformational', domain: 'leadership', label: '轉型與交易', name_en: 'Transformational & Transactional', color: '#9a4a4a', row_pos: 1, year_start: 1978,
    description: 'Burns 與 Bass 的典範轉移：從交換行為到理想激勵與價值感召。' },
  { id: 'lmx', domain: 'leadership', label: 'LMX 關係取向', name_en: 'Leader-Member Exchange', color: '#7a5e8a', row_pos: 3, year_start: 1975,
    description: '領導是雙邊關係：從 vertical dyad linkage 到 LMX 的差序互動研究。' },
  { id: 'positive', domain: 'leadership', label: '正向領導', name_en: 'Positive Leadership', color: '#8a7a2e', row_pos: 0, year_start: 1977,
    description: '服務、真誠、倫理——21 世紀的道德正向取向浪潮。' },
  { id: 'shared', domain: 'leadership', label: '共享/分散式', name_en: 'Shared & Distributed', color: '#3a7a8a', row_pos: 2, year_start: 2003,
    description: '領導不必集中在一人：團隊內部的分散式影響力如何形成與運作。' },

  // ── FOMO ──
  { id: 'fomo_foundation', domain: 'fomo', label: '理論奠基', name_en: 'Foundation & Measurement', color: '#b8912e', row_pos: 2, year_start: 2013,
    description: 'Przybylski 等人建立的 FOMO 量表與自我決定理論基礎，成為後續所有研究的起點。' },
  { id: 'fomo_social_media', domain: 'fomo', label: '社群媒體', name_en: 'Social Media Behavior', color: '#3a7a8a', row_pos: 0, year_start: 2015,
    description: 'FOMO 如何驅動問題性社群媒體使用、社會比較與社群疲勞。' },
  { id: 'fomo_mental_health', domain: 'fomo', label: '心理健康', name_en: 'Mental Health', color: '#9a4a4a', row_pos: 1, year_start: 2016,
    description: 'FOMO 與焦慮、憂鬱、智慧型手機成癮及生活滿意度之間的臨床關聯。' },
  { id: 'fomo_personality', domain: 'fomo', label: '人格與歸屬', name_en: 'Personality & Belonging', color: '#7a5e8a', row_pos: 3, year_start: 2017,
    description: '從歸屬需求、神經質、依附風格等人格取向探討 FOMO 的個別差異與前因。' },
];

// ═══════════════════════════════════════════
// SUBDOMAIN PREREQS — tree edges between subdomains
// Describes which subdomain influenced which.
// ═══════════════════════════════════════════
const SUBDOMAIN_PREREQS = [
  // conflict
  ['task', 'foundation'],
  ['process', 'foundation'],
  ['meta', 'task'],
  ['meta', 'process'],
  ['resolution', 'foundation'],
  ['trust', 'task'],

  // chess
  ['personality', 'expertise'],
  ['intelligence', 'expertise'],
  ['education', 'personality'],
  ['transfer', 'intelligence'],
  ['transfer', 'education'],

  // leadership
  ['contingency', 'trait'],
  ['transformational', 'contingency'],
  ['lmx', 'contingency'],
  ['positive', 'transformational'],
  ['shared', 'transformational'],
  ['shared', 'lmx'],

  // fomo
  ['fomo_social_media', 'fomo_foundation'],
  ['fomo_mental_health', 'fomo_foundation'],
  ['fomo_personality', 'fomo_mental_health'],
  ['fomo_personality', 'fomo_social_media'],
];

// ═══════════════════════════════════════════
// PAPERS — Conflict Management
// ═══════════════════════════════════════════
const CONFLICT_PAPERS = [
  {
    id: 'coser1956', topic: 'conflict', year: 1956, era: '早期理論', branch: 'foundation',
    title: 'The Functions of Social Conflict',
    authors: 'Lewis Coser',
    journal: 'Book — Free Press',
    badge: '經典著作', row_pos: 1,
    summary: '提出衝突的「正功能」觀點，挑戰當時認為衝突純粹有害的主流看法。認為衝突可以促進社會凝聚、建立群體邊界、並作為社會變遷的動力。',
    key_findings: JSON.stringify(['衝突不一定是破壞性的，可以強化群體凝聚力','外部衝突能增強群體內部的團結','衝突是社會結構變遷的必要機制']),
    significance: '為後來「衝突可能有益」的研究奠定理論基礎，影響了整個組織行為學領域。',
    pdf_url: null, prereqs: [],
  },
  {
    id: 'deutsch1973', topic: 'conflict', year: 1973, era: '早期理論', branch: 'foundation',
    title: 'The Resolution of Conflict',
    authors: 'Morton Deutsch',
    journal: 'Book — Yale University Press',
    badge: '經典著作', row_pos: 2,
    summary: '提出合作與競爭理論 (Cooperation and Competition Theory)，區分建設性衝突與破壞性衝突，為衝突管理研究建立了核心理論框架。',
    key_findings: JSON.stringify(['合作情境下的衝突傾向建設性解決','競爭情境下的衝突傾向破壞性升級','衝突結果取決於當事人的互動方式']),
    significance: '建設性 vs 破壞性衝突的區分直接啟發了 Jehn 後來的任務衝突 vs 關係衝突分類。',
    pdf_url: null, prereqs: ['coser1956'],
  },
  {
    id: 'thomas1976', topic: 'conflict', year: 1976, era: '早期理論', branch: 'resolution',
    title: 'Conflict and Conflict Management',
    authors: 'Kenneth Thomas',
    journal: 'Handbook of Industrial and Organizational Psychology',
    badge: '理論框架', row_pos: 3,
    summary: '提出衝突處理的五種模式（競爭、合作、妥協、迴避、順應），即 Thomas-Kilmann 模型，至今仍是最廣泛使用的衝突管理框架之一。',
    key_findings: JSON.stringify(['五種衝突處理風格基於「堅持度」與「合作度」兩個維度','沒有單一最佳策略，需視情境選擇','個人的衝突處理風格具有一致性但可調整']),
    significance: 'Thomas-Kilmann Conflict Mode Instrument (TKI) 成為全球最常用的衝突風格評估工具。',
    pdf_url: null, prereqs: ['deutsch1973'],
  },
  {
    id: 'pinkley1990', topic: 'conflict', year: 1990, era: '轉型期', branch: 'foundation',
    title: 'Dimensions of Conflict Frame',
    authors: 'Robin Pinkley',
    journal: 'Journal of Applied Psychology, 75(2)',
    badge: null, row_pos: 1,
    summary: '透過多維度量表法 (MDS) 分析人們如何理解衝突，發現三個維度：任務vs關係、情緒vs理智、合作vs競爭。',
    key_findings: JSON.stringify(['衝突認知有三個獨立維度','任務與關係是衝突認知中最主要的區分維度','不同的衝突框架會導致不同的解決策略偏好']),
    significance: '為 Jehn (1995) 將衝突正式區分為任務衝突與關係衝突提供了實證基礎。',
    pdf_url: null, prereqs: ['deutsch1973'],
  },
  {
    id: 'jehn1995', topic: 'conflict', year: 1995, era: '典範建立', branch: 'foundation',
    title: 'A Multimethod Examination of the Benefits and Detriments of Intragroup Conflict',
    authors: 'Karen A. Jehn',
    journal: 'Administrative Science Quarterly, 40',
    badge: '⭐ 里程碑', row_pos: 2,
    summary: '正式提出任務衝突 (task conflict) 與關係衝突 (relationship conflict) 的二分框架。用多重方法研究 105 個工作團隊，發現任務衝突在特定條件下有益，關係衝突則普遍有害。',
    key_findings: JSON.stringify(['任務衝突在非例行性任務中可提升績效','關係衝突普遍降低滿意度與績效','任務類型與衝突規範是重要調節變項','任務衝突可能升級為關係衝突']),
    significance: '此框架成為後續 30 年團隊衝突研究的基石，引用次數超過 5000 次。',
    pdf_url: 'https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Negotiation_and_Conflict_Management/Jehn-ASQ-1995.pdf',
    prereqs: ['pinkley1990', 'deutsch1973'],
  },
  {
    id: 'amason1996', topic: 'conflict', year: 1996, era: '典範建立', branch: 'task',
    title: 'Distinguishing the Effects of Functional and Dysfunctional Conflict on Strategic Decision Making',
    authors: 'Allen C. Amason',
    journal: 'Academy of Management Journal, 39(1)',
    badge: '高引用', row_pos: 0,
    summary: '在高階管理團隊 (TMT) 中驗證了功能性衝突（認知衝突）與失能性衝突（情感衝突）的區別。',
    key_findings: JSON.stringify(['認知衝突提高決策品質與決策理解度','情感衝突降低決策品質、共識與情感接受度','兩種衝突的效果在高管團隊中特別明顯']),
    significance: '從策略管理角度獨立驗證了 Jehn 的衝突二分法，擴展到高管團隊場景。',
    pdf_url: null, prereqs: ['jehn1995'],
  },
  {
    id: 'jehn1997', topic: 'conflict', year: 1997, era: '典範建立', branch: 'process',
    title: 'A Qualitative Analysis of Conflict Types and Dimensions in Organizational Groups',
    authors: 'Karen A. Jehn',
    journal: 'Administrative Science Quarterly, 42',
    badge: '新概念', row_pos: 3,
    summary: '透過質化研究，新增第三種衝突類型：過程衝突 (process conflict)，指對工作分配與職責歸屬的爭議。',
    key_findings: JSON.stringify(['過程衝突是獨立於任務衝突與關係衝突的第三種類型','過程衝突涉及責任、分工與後勤安排的歧見','過程衝突對績效有負面影響']),
    significance: '將衝突類型從二分擴展為三分，使理論框架更完整。',
    pdf_url: null, prereqs: ['jehn1995'],
  },
  {
    id: 'simons2000', topic: 'conflict', year: 2000, era: '典範建立', branch: 'trust',
    title: 'Task Conflict and Relationship Conflict in Top Management Teams: The Pivotal Role of Intragroup Trust',
    authors: 'Tony Simons & Randall Peterson',
    journal: 'Journal of Applied Psychology, 85(1)',
    badge: '高引用', row_pos: 4,
    summary: '研究信任在衝突動態中的關鍵角色。發現團隊信任能防止任務衝突惡化為關係衝突。',
    key_findings: JSON.stringify(['高信任團隊中，任務衝突較不會演變為關係衝突','低信任團隊中，成員傾向將任務歧見解讀為人身攻擊','信任是任務衝突能否發揮正面效果的關鍵調節變項']),
    significance: '揭示了為什麼同樣的任務衝突在不同團隊中會有截然不同的結果。',
    pdf_url: null, prereqs: ['jehn1995', 'amason1996'],
  },
  {
    id: 'dedreu2003', topic: 'conflict', year: 2003, era: '質疑與辯論', branch: 'meta',
    title: 'Task Versus Relationship Conflict, Team Performance, and Team Member Satisfaction: A Meta-Analysis',
    authors: 'Carsten De Dreu & Laurie Weingart',
    journal: 'Journal of Applied Psychology, 88(4)',
    badge: '⭐ 里程碑', row_pos: 1,
    summary: '第一篇大規模 meta-analysis，挑戰「任務衝突有益」的觀點。發現任務衝突與關係衝突都與績效呈負相關。',
    key_findings: JSON.stringify(['任務衝突與績效呈負相關 (ρ = -.23)','關係衝突與績效呈負相關 (ρ = -.22)','兩種衝突之間高度正相關 (ρ = .54)','兩種衝突都降低團隊成員滿意度']),
    significance: '引發了重大學術辯論——任務衝突到底有沒有益處？推動了後續更精細的研究。',
    pdf_url: 'https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Negotiation_and_Conflict_Management/De_Dreu_Weingart_Task-conflict_Meta-analysis.pdf',
    prereqs: ['jehn1995', 'amason1996'],
  },
  {
    id: 'tjosvold2008', topic: 'conflict', year: 2008, era: '質疑與辯論', branch: 'resolution',
    title: "Conflict Values and Team Relationships: Conflict's Contribution to Team Effectiveness and Citizenship in China",
    authors: 'Dean Tjosvold',
    journal: 'Journal of Organizational Behavior, 29(1)',
    badge: null, row_pos: 5,
    summary: '將建設性爭論 (constructive controversy) 理論應用於中國情境，發現合作性衝突價值觀能促進團隊效能。',
    key_findings: JSON.stringify(['合作取向的衝突管理正向預測團隊效能','衝突迴避負向預測團隊效能','即使在重視和諧的文化中，建設性衝突仍然重要']),
    significance: '將衝突管理研究擴展到非西方文化情境，豐富了理論的跨文化適用性。',
    pdf_url: null, prereqs: ['deutsch1973', 'jehn1995'],
  },
  {
    id: 'behfar2008', topic: 'conflict', year: 2008, era: '質疑與辯論', branch: 'resolution',
    title: 'The Critical Role of Conflict Resolution in Teams',
    authors: 'Kristin Behfar, Randall Peterson, Elizabeth Mannix & William Trochim',
    journal: 'Journal of Applied Psychology, 93(1)',
    badge: null, row_pos: 3,
    summary: '將焦點從「衝突類型」轉向「衝突解決方式」，發現高績效團隊有更好的衝突解決策略。',
    key_findings: JSON.stringify(['高績效團隊傾向聚焦問題、對事不對人','低績效團隊的衝突解決方式傾向迴避或遷就','團隊的衝突解決歷史會形成路徑依賴']),
    significance: '將研究重心從「衝突本身」轉移到「如何管理衝突」，對實務應用影響深遠。',
    pdf_url: null, prereqs: ['jehn1997', 'thomas1976'],
  },
  {
    id: 'greer2008', topic: 'conflict', year: 2008, era: '質疑與辯論', branch: 'process',
    title: 'Conflict Transformation: A Longitudinal Investigation of the Relationships Between Different Types of Intragroup Conflict and the Moderating Role of Conflict Resolution',
    authors: 'Lindred Greer, Karen Jehn & Elizabeth Mannix',
    journal: 'Small Group Research, 39(3)',
    badge: null, row_pos: 4,
    summary: '縱貫性研究發現衝突會隨時間在不同類型之間轉化：過程衝突特別容易引發關係衝突。',
    key_findings: JSON.stringify(['過程衝突是引發關係衝突的最強預測因子','衝突類型會隨時間動態轉化','權力不對等會加速衝突升級']),
    significance: '引入時間動態觀點，揭示衝突不是靜態快照，而是持續演變的過程。',
    pdf_url: null, prereqs: ['jehn1997', 'simons2000'],
  },
  {
    id: 'dewit2012', topic: 'conflict', year: 2012, era: '整合與精煉', branch: 'meta',
    title: 'The Paradox of Intragroup Conflict: A Meta-Analysis',
    authors: 'Frank de Wit, Lindred Greer & Karen Jehn',
    journal: 'Journal of Applied Psychology, 97(2)',
    badge: '⭐ 里程碑', row_pos: 2,
    summary: '最大規模的衝突 meta-analysis（116 篇研究、8,880 團隊），解決了「任務衝突有益還是有害」的矛盾。',
    key_findings: JSON.stringify(['關係衝突與過程衝突穩定地負面影響團隊結果','任務衝突的效果不像 De Dreu (2003) 所述那樣強烈負面','當任務衝突不伴隨關係衝突時，可能有益','高管團隊比一般團隊更能從任務衝突中受益','績效衡量方式（決策品質 vs 整體績效）影響結論']),
    significance: '整合了 20 年的爭論，為「任務衝突有條件地有益」提供了最全面的證據。',
    pdf_url: null, prereqs: ['dedreu2003', 'jehn1997', 'simons2000'],
  },
  {
    id: 'bradley2012', topic: 'conflict', year: 2012, era: '整合與精煉', branch: 'task',
    title: 'Reaping the Benefits of Task Conflict in Teams: The Critical Role of Team Psychological Safety and Openness',
    authors: 'Bret Bradley, Bennett Postlethwaite, Anthony Klotz, Maria Hamdani & Kenneth Brown',
    journal: 'Journal of Applied Psychology, 97(1)',
    badge: null, row_pos: 0,
    summary: '發現心理安全感與開放性人格是決定任務衝突是否有益的關鍵。',
    key_findings: JSON.stringify(['心理安全感調節任務衝突與績效的關係','團隊成員的開放性人格特質促進建設性的任務辯論','缺乏心理安全感時，任務衝突反而降低績效']),
    significance: '連結了 Amy Edmondson 的心理安全感理論與衝突研究，為實務提供了明確建議。',
    pdf_url: null, prereqs: ['dedreu2003', 'simons2000'],
  },
  {
    id: 'dechurch2013', topic: 'conflict', year: 2013, era: '整合與精煉', branch: 'resolution',
    title: 'Moving Beyond Relationship and Task Conflict: Toward a Process-State Perspective',
    authors: 'Leslie DeChurch, Jessica Mesmer-Magnus & Dan Doty',
    journal: 'Journal of Applied Psychology, 98(4)',
    badge: null, row_pos: 5,
    summary: '主張傳統的衝突類型分類已不足夠，提出應從「過程-狀態」的角度重新理解衝突。',
    key_findings: JSON.stringify(['衝突的「如何處理」比「是什麼類型」更能預測結果','衝突過程（表達方式、回應模式）比衝突內容更重要','建議從靜態分類轉向動態過程模型']),
    significance: '代表領域的理論轉向——從「衝突是什麼」到「衝突怎麼發生」。',
    pdf_url: null, prereqs: ['dewit2012', 'behfar2008'],
  },
  {
    id: 'oleary2011', topic: 'conflict', year: 2011, era: '整合與精煉', branch: 'trust',
    title: 'Culture and Teams',
    authors: "Brandy O'Leary & Elizabeth Mortensen",
    journal: 'Research on Managing Groups and Teams, 14',
    badge: null, row_pos: 4,
    summary: '探討文化差異如何影響團隊衝突的形成與處理。',
    key_findings: JSON.stringify(['集體主義文化傾向迴避顯性衝突','個人主義文化中更可能出現直接的任務辯論','跨文化團隊需要額外的衝突管理機制']),
    significance: '提醒研究者和管理者：衝突管理策略不能一體適用，須考慮文化脈絡。',
    pdf_url: null, prereqs: ['tjosvold2008'],
  },
];

// ═══════════════════════════════════════════
// PAPERS — Chess & Personality
// ═══════════════════════════════════════════
const CHESS_PAPERS = [
  {
    id: 'degroot1965', topic: 'chess', year: 1965, era: '奠基期', branch: 'expertise',
    title: 'Thought and Choice in Chess',
    authors: 'Adriaan de Groot',
    journal: 'Book — Mouton (2nd ed.)',
    badge: '經典著作', row_pos: 1,
    summary: '首創「放聲思考法」(think-aloud protocol) 研究棋手的思考過程，揭示大師與新手在問題表徵與搜索策略上的根本差異。大師依賴直覺式模式辨認，而非更深的搜索。',
    key_findings: JSON.stringify(['大師依賴直覺式的模式辨認而非更深的搜索','棋局知覺 (board perception) 是專業表現的核心','經驗累積的知識比計算能力更重要']),
    significance: '開創了西洋棋認知研究領域，奠定了後續專家研究的方法論基礎。',
    pdf_url: null, prereqs: [],
  },
  {
    id: 'chase1973', topic: 'chess', year: 1973, era: '奠基期', branch: 'expertise',
    title: 'Perception in Chess',
    authors: 'William Chase & Herbert Simon',
    journal: 'Cognitive Psychology, 4(1)',
    badge: '⭐ 里程碑', row_pos: 2,
    summary: '提出「組塊理論」(chunking theory)。透過短期記憶實驗證明，大師能記住有意義的棋局佈陣但對隨機排列表現與新手無異，說明專業表現源於知識組塊而非超凡記憶力。',
    key_findings: JSON.stringify(['大師的記憶優勢僅限於有意義的棋局佈陣','專家心中儲存了約 50,000 個棋局組塊 (chunks)','短期記憶容量限制同樣適用於大師']),
    significance: '組塊理論成為認知心理學中最具影響力的專家表現解釋理論之一。',
    pdf_url: null, prereqs: ['degroot1965'],
  },
  {
    id: 'ericsson1993', topic: 'chess', year: 1993, era: '理論發展', branch: 'expertise',
    title: 'The Role of Deliberate Practice in the Acquisition of Expert Performance',
    authors: 'K. Anders Ericsson, Ralf Krampe & Clemens Tesch-Römer',
    journal: 'Psychological Review, 100(3)',
    badge: '⭐ 里程碑', row_pos: 0,
    summary: '提出「刻意練習」(deliberate practice) 理論，主張專家表現主要由系統性練習的質量與數量決定。西洋棋是其核心驗證領域之一，認為達到大師水平需約 10 年的刻意練習。',
    key_findings: JSON.stringify(['達到專家水平需要約 10 年 / 10,000 小時的刻意練習','練習必須有明確目標、即時回饋且超出舒適區','動機與持續投入是關鍵因素']),
    significance: '深刻影響了人們對天賦與練習的理解，「一萬小時定律」廣為流傳。',
    pdf_url: null, prereqs: ['chase1973'],
  },
  {
    id: 'gobet1996', topic: 'chess', year: 1996, era: '理論發展', branch: 'expertise',
    title: 'Templates in Chess Memory: A Mechanism for Recalling Several Boards',
    authors: 'Fernand Gobet & Herbert Simon',
    journal: 'Cognitive Psychology, 31(1)',
    badge: '理論框架', row_pos: 2,
    summary: '擴展 Chase & Simon 的組塊理論，提出「模板理論」(template theory)。模板是帶有可變插槽的大型知識結構，解釋了大師如何在快速瀏覽後同時記住多個棋盤。',
    key_findings: JSON.stringify(['模板是比組塊更大的知識結構，可容納可變資訊','大師擁有大量模板可快速編碼新棋局','模板理論可解釋閃視記憶 (glance memory) 和多盤記憶現象']),
    significance: '彌補了組塊理論的不足，成為解釋棋手認知的主流理論框架。',
    pdf_url: null, prereqs: ['chase1973'],
  },
  {
    id: 'bilalic2007p', topic: 'chess', year: 2007, era: '人格研究', branch: 'personality',
    title: 'Personality Profiles of Young Chess Players',
    authors: 'Merim Bilalić, Peter McLeod & Fernand Gobet',
    journal: 'Personality and Individual Differences, 42(6)',
    badge: null, row_pos: 3,
    summary: '以青少年棋手為對象，使用五大人格量表研究棋手的人格特質剖面。發現棋手在經驗開放性上得分較高，在外向性上得分較低，且人格特質與棋力之間存在顯著關聯。',
    key_findings: JSON.stringify(['棋手在經驗開放性 (Openness) 上顯著高於常模','高等級棋手在外向性 (Extraversion) 上得分較低','嚴謹性 (Conscientiousness) 與練習量正相關，間接影響棋力']),
    significance: '首次以青少年棋手為對象系統化建立人格特質與西洋棋表現的實證聯繫。',
    pdf_url: null, prereqs: ['ericsson1993'],
  },
  {
    id: 'grabner2007', topic: 'chess', year: 2007, era: '人格研究', branch: 'intelligence',
    title: 'Individual Differences in Chess Expertise: A Psychometric Investigation',
    authors: 'Roland Grabner, Elsbeth Stern & Aljoscha Neubauer',
    journal: 'Acta Psychologica, 124(3)',
    badge: '高引用', row_pos: 1,
    summary: '以心理計量方法全面研究棋手的個別差異。發現智力（特別是數字能力和空間能力）是棋力的顯著預測因子，但練習量仍然是最強的預測因子。',
    key_findings: JSON.stringify(['數值推理和空間能力與棋力顯著相關','練習量仍然是棋力最強的預測因子','智力對棋力的影響在低等級棋手中更為明顯']),
    significance: '提供了天賦（智力）與練習在專家表現中交互作用的重要實證。',
    pdf_url: null, prereqs: ['ericsson1993', 'chase1973'],
  },
  {
    id: 'bilalic2007i', topic: 'chess', year: 2007, era: '人格研究', branch: 'intelligence',
    title: 'Does Chess Need Intelligence? A Study with Young Chess Players',
    authors: 'Merim Bilalić, Peter McLeod & Fernand Gobet',
    journal: 'Intelligence, 35(5)',
    badge: null, row_pos: 0,
    summary: '以青少年棋手為對象研究智力與棋力的關係。發現智力與入門階段的棋力相關，但在進階棋手中，練習量才是主要預測因子，提出「門檻假說」。',
    key_findings: JSON.stringify(['智力影響初學階段的學習速度','練習量在中高等級棋手中是更強的預測因子','智力較高的兒童不一定成為最優秀的棋手']),
    significance: '挑戰了「高智力 = 高棋力」的簡單假設，揭示了智力與練習的複雜互動。',
    pdf_url: null, prereqs: ['grabner2007', 'ericsson1993'],
  },
  {
    id: 'aciego2012', topic: 'chess', year: 2012, era: '教育實證', branch: 'education',
    title: 'The Benefits of Chess for the Intellectual and Social-Emotional Enrichment in Schoolchildren',
    authors: 'Ramón Aciego, Lorena García & Moisés Betancort',
    journal: 'The Spanish Journal of Psychology, 15(2)',
    badge: null, row_pos: 4,
    summary: '研究學校西洋棋教學對兒童認知與社會情感發展的影響。與足球和籃球等課外活動相比，西洋棋能更有效地提升問題解決能力和社會適應力。',
    key_findings: JSON.stringify(['西洋棋訓練提升了問題解決能力和注意力','社會情感適應方面也有正面改善','效果優於足球、籃球等其他課外活動的比較組']),
    significance: '為西洋棋作為教育工具提供了同時涵蓋認知與人格發展的實證支持。',
    pdf_url: null, prereqs: ['bilalic2007p'],
  },
  {
    id: 'burgoyne2016', topic: 'chess', year: 2016, era: '後設整合', branch: 'intelligence',
    title: 'The Relationship Between Cognitive Ability and Chess Skill: A Comprehensive Meta-Analysis',
    authors: 'Alexander Burgoyne, Giovanni Sala, Fernand Gobet, Brooke Macnamara, Guillermo Campitelli & David Hambrick',
    journal: 'Intelligence, 59',
    badge: '⭐ 里程碑', row_pos: 1,
    summary: '最大規模的西洋棋與認知能力後設分析（19 篇研究），系統性整合了棋力與各項認知能力之間的關係，發現認知能力是棋力的顯著但非唯一預測因子。',
    key_findings: JSON.stringify(['棋力與流體智力、處理速度、短期記憶和工作記憶都有顯著正相關','認知能力的預測力在低等級棋手中更強','年齡是重要的調節變項——兒童棋手的相關更強']),
    significance: '提供了棋力與認知能力關係最全面的量化證據，為「智力 vs 練習」之爭提供數據基礎。',
    pdf_url: null, prereqs: ['grabner2007', 'bilalic2007i'],
  },
  {
    id: 'sala2016', topic: 'chess', year: 2016, era: '後設整合', branch: 'transfer',
    title: 'Do the Benefits of Chess Instruction Transfer to Academic and Cognitive Skills? A Meta-Analysis',
    authors: 'Giovanni Sala & Fernand Gobet',
    journal: 'Educational Research Review, 18',
    badge: '高引用', row_pos: 3,
    summary: '首篇針對西洋棋教學認知遷移效果的後設分析。綜合 24 篇實驗研究，發現西洋棋教學在數學和認知技能上有小到中等的效果，但有主動控制組的研究效果量較小。',
    key_findings: JSON.stringify(['整體效果量 d = 0.34','數學效果量 d = 0.38，認知技能 d = 0.33','有主動控制組的研究效果量顯著更小']),
    significance: '首次以後設分析系統檢驗西洋棋教學遷移效果，暗示遷移效果可能被高估。',
    pdf_url: null, prereqs: ['aciego2012', 'burgoyne2016'],
  },
  {
    id: 'sala2017', topic: 'chess', year: 2017, era: '後設整合', branch: 'transfer',
    title: 'Does Far Transfer Exist? Negative Evidence From Chess, Music, and Working Memory Training',
    authors: 'Giovanni Sala & Fernand Gobet',
    journal: 'Current Directions in Psychological Science, 26(6)',
    badge: '⭐ 里程碑', row_pos: 4,
    summary: '三篇後設分析的綜合報告，比較西洋棋、音樂和工作記憶訓練的遠遷移效果。發現效果量與實驗設計品質呈反比，對遠遷移的存在提出嚴重質疑。',
    key_findings: JSON.stringify(['遠遷移效果量隨實驗設計品質提高而縮小','有主動控制組的研究幾乎無顯著效果','訓練效果可能源於安慰劑效應或期望效應']),
    significance: '對西洋棋教育遷移價值的重大挑戰，引發了「遠遷移是否存在」的廣泛辯論。',
    pdf_url: null, prereqs: ['sala2016'],
  },
  {
    id: 'gonzalezburgos2024', topic: 'chess', year: 2024, era: '當代研究', branch: 'expertise',
    title: 'The Effect of Chess on Cognition: A Graph Theory Study on Cognitive Data',
    authors: 'Lissett Gonzalez-Burgos, Candida Lozano-Rodriguez, Yaiza Molina, Eloy Garcia-Cabello, Ramon Aciego, Jose Barroso & Daniel Ferreira',
    journal: 'Frontiers in Psychology, 15',
    badge: '新方法', row_pos: 2,
    summary: '以圖論 (graph theory) 分析棋手的「認知連接組」(cognitive connectome)，發現棋手具有更高的局部效率但更低的全域效率，且認知架構重組為三個功能一致的模組。',
    key_findings: JSON.stringify(['棋手展現出優越的視覺空間能力','棋手認知網絡有更高的局部效率（特化整合）','執行功能與注意力在棋手認知網絡中扮演核心角色']),
    significance: '首次以多變量圖論方法研究棋手認知結構，開創了認知連接組研究的新方向。',
    pdf_url: null, prereqs: ['burgoyne2016', 'gobet1996'],
  },
];

// ═══════════════════════════════════════════
// PAPERS — Leadership Theory Evolution
// ═══════════════════════════════════════════
const LEADERSHIP_PAPERS = [
  // ── Trait & Behavioral ──
  {
    id: 'stogdill1948', topic: 'leadership', year: 1948, era: '早期特質論', branch: 'trait',
    title: 'Personal Factors Associated with Leadership: A Survey of the Literature',
    authors: 'Ralph M. Stogdill',
    journal: 'The Journal of Psychology, 25(1)',
    badge: '經典著作', row_pos: 1,
    summary: '整合 1904–1947 年間 124 篇研究，首次系統檢驗「偉人論」。結論是單靠人格特質無法充分解釋領導出現，情境同樣重要，預告了行為與情境學派的興起。',
    key_findings: JSON.stringify(['特質與領導有一定關聯但相關偏低','情境脈絡對誰成為領導者影響重大','領導是一種關係，不是特定一組固定特質']),
    significance: '標誌特質論的衰退，打開了領導研究走向行為與情境學派的大門。',
    pdf_url: null, prereqs: [],
  },
  {
    id: 'fleishman1953', topic: 'leadership', year: 1953, era: '行為學派', branch: 'trait',
    title: 'The Description of Supervisory Behavior',
    authors: 'Edwin A. Fleishman',
    journal: 'Journal of Applied Psychology, 37(1)',
    badge: '理論框架', row_pos: 2,
    summary: '俄亥俄州立大學領導研究的代表作，透過 LBDQ 量表萃取出兩個核心行為維度：「關懷」(consideration) 與「結構倡導」(initiating structure)，奠定行為學派雙因子模型。',
    key_findings: JSON.stringify(['領導行為可歸納為「關懷」與「結構倡導」兩維度','這兩個維度相對獨立，不是單一連續體的兩端','行為取向可觀測、可訓練，比特質論更具實務價值']),
    significance: '行為學派的典範，直接啟發後續 Blake-Mouton 管理方格與 Fiedler 的情境觀。',
    pdf_url: null, prereqs: ['stogdill1948'],
  },
  {
    id: 'judge2002', topic: 'leadership', year: 2002, era: '特質復興', branch: 'trait',
    title: 'Personality and Leadership: A Qualitative and Quantitative Review',
    authors: 'Timothy A. Judge, Joyce E. Bono, Remus Ilies & Megan W. Gerhardt',
    journal: 'Journal of Applied Psychology, 87(4)',
    badge: '⭐ 里程碑', row_pos: 0,
    summary: '以 Big Five 人格架構重新檢視 73 個樣本的特質-領導關係，發現外向性、嚴謹性、開放性與情緒穩定性皆顯著預測領導，重新確立特質論的實證地位。',
    key_findings: JSON.stringify(['外向性是最強的特質預測因子 (ρ = .31)','嚴謹性、開放性、情緒穩定性也顯著相關','Big Five 整體多元相關達 .48']),
    significance: '推動「新特質論」的復興，證明在合適的架構下特質仍有實質解釋力。',
    pdf_url: null, prereqs: ['stogdill1948', 'fleishman1953'],
  },

  // ── Contingency ──
  {
    id: 'fiedler1967', topic: 'leadership', year: 1967, era: '情境權變', branch: 'contingency',
    title: 'A Theory of Leadership Effectiveness',
    authors: 'Fred E. Fiedler',
    journal: 'Book — McGraw-Hill',
    badge: '⭐ 里程碑', row_pos: 2,
    summary: '首個完整的權變理論：領導效能取決於領導風格（以 LPC 量表測量）與情境有利度（領導-成員關係、任務結構、職位權力）的匹配程度。',
    key_findings: JSON.stringify(['沒有普適的最佳風格，只有「對的情境」','高 LPC（關係導向）在中等有利情境最有效','低 LPC（任務導向）在極有利或極不利情境最有效']),
    significance: '開創情境權變典範，將領導研究從「找對的人」轉向「找對的匹配」。',
    pdf_url: null, prereqs: ['fleishman1953'],
  },
  {
    id: 'house1971', topic: 'leadership', year: 1971, era: '情境權變', branch: 'contingency',
    title: 'A Path-Goal Theory of Leader Effectiveness',
    authors: 'Robert J. House',
    journal: 'Administrative Science Quarterly, 16(3)',
    badge: '高引用', row_pos: 1,
    summary: '以期望理論為基礎提出「路徑-目標理論」：領導者的職責是釐清成員達成目標的路徑並提供動機資源，行為風格（指導、支持、參與、成就導向）應依部屬與任務特性調整。',
    key_findings: JSON.stringify(['領導行為透過激勵機制影響績效與滿意度','部屬特性（能力、控制感）決定最適風格','任務結構調節指導型領導的效果']),
    significance: '連結領導與動機理論，成為管理教育中最常被引用的權變模型之一。',
    pdf_url: null, prereqs: ['fiedler1967'],
  },
  {
    id: 'vroom1973', topic: 'leadership', year: 1973, era: '情境權變', branch: 'contingency',
    title: 'Leadership and Decision-Making',
    authors: 'Victor H. Vroom & Philip W. Yetton',
    journal: 'Book — University of Pittsburgh Press',
    badge: '理論框架', row_pos: 3,
    summary: '提出規範性決策模型：領導者應依決策品質需求、部屬資訊、接受度等情境變數，在獨裁、諮詢、群體決策之間選擇合適做法。首開「領導即決策風格」的取徑。',
    key_findings: JSON.stringify(['決策風格應隨情境改變，不應固著於單一取向','群體參與提升接受度但降低決策速度','提供可操作的決策樹流程輔助主管選擇']),
    significance: '將權變思想具體化為實務決策工具，影響了後續參與式管理研究。',
    pdf_url: null, prereqs: ['fiedler1967'],
  },

  // ── Transformational ──
  {
    id: 'burns1978', topic: 'leadership', year: 1978, era: '轉型典範', branch: 'transformational',
    title: 'Leadership',
    authors: 'James MacGregor Burns',
    journal: 'Book — Harper & Row',
    badge: '經典著作', row_pos: 1,
    summary: '首次區分交易型 (transactional) 與轉型 (transforming) 領導：前者基於利益交換，後者基於價值提升與相互激勵。引入道德層次，認為真正的領導能將雙方提升到更高的動機與道德層次。',
    key_findings: JSON.stringify(['交易領導與轉型領導是兩種本質不同的關係','轉型領導涉及道德與價值的相互提升','領導與權力不同——領導需要部屬認同共同目的']),
    significance: '開啟領導研究的「新領導典範」，轉移焦點從行為與情境到願景、價值與意義。',
    pdf_url: null, prereqs: ['house1971'],
  },
  {
    id: 'bass1985', topic: 'leadership', year: 1985, era: '轉型典範', branch: 'transformational',
    title: 'Leadership and Performance Beyond Expectations',
    authors: 'Bernard M. Bass',
    journal: 'Book — Free Press',
    badge: '⭐ 里程碑', row_pos: 0,
    summary: '將 Burns 的概念操作化為可測量的 Full Range Leadership Model，提出轉型領導的四個 I：理想化影響、激勵激發、智能激發、個別關懷。開發 MLQ 量表供後續實證研究使用。',
    key_findings: JSON.stringify(['轉型領導四構面：4I——理想化、激勵、智能、關懷','轉型領導可加在交易領導之上產生「超越期望」的績效','MLQ 量表成為跨文化的標準測量工具']),
    significance: '讓轉型領導從哲學概念變成可實證的主流研究典範，引用數以萬計。',
    pdf_url: null, prereqs: ['burns1978'],
  },
  {
    id: 'podsakoff1990', topic: 'leadership', year: 1990, era: '轉型典範', branch: 'transformational',
    title: 'Transformational Leader Behaviors and Their Effects on Followers\' Trust in Leader, Satisfaction, and Organizational Citizenship Behaviors',
    authors: 'Philip M. Podsakoff, Scott B. MacKenzie, Robert H. Moorman & Richard Fetter',
    journal: 'Leadership Quarterly, 1(2)',
    badge: '高引用', row_pos: 2,
    summary: '另闢一條轉型領導行為量表路徑（非 MLQ），驗證轉型領導透過「對領導者的信任」中介影響部屬的組織公民行為與滿意度。',
    key_findings: JSON.stringify(['轉型領導顯著提升部屬對領導者的信任','信任中介了領導行為對 OCB 的效果','個別關懷特別能預測滿意度與公民行為']),
    significance: '建立了轉型領導 → 信任 → 部屬行為的中介機制，影響後續數百篇研究。',
    pdf_url: null, prereqs: ['bass1985'],
  },
  {
    id: 'judge_piccolo2004', topic: 'leadership', year: 2004, era: '轉型典範', branch: 'transformational',
    title: 'Transformational and Transactional Leadership: A Meta-Analytic Test of Their Relative Validity',
    authors: 'Timothy A. Judge & Ronald F. Piccolo',
    journal: 'Journal of Applied Psychology, 89(5)',
    badge: '⭐ 里程碑', row_pos: 1,
    summary: '626 個效果量的後設分析，比較轉型與交易領導各面向的效能。發現轉型領導與「條件性獎酬」兩者對多項結果都有強效，顯示完整的 FRLM 比單一構面更具解釋力。',
    key_findings: JSON.stringify(['轉型領導與領導效能總體相關達 ρ = .44','條件性獎酬效果與轉型領導接近，不應被忽視','被動例外管理與放任領導對結果有負面效果']),
    significance: '為 FRLM 提供最全面的量化證據，也揭示交易領導中「獎酬」面向被低估。',
    pdf_url: null, prereqs: ['bass1985', 'podsakoff1990'],
  },

  // ── LMX ──
  {
    id: 'dansereau1975', topic: 'leadership', year: 1975, era: 'LMX 起源', branch: 'lmx',
    title: 'A Vertical Dyad Linkage Approach to Leadership Within Formal Organizations',
    authors: 'Fred Dansereau, George Graen & William J. Haga',
    journal: 'Organizational Behavior and Human Performance, 13(1)',
    badge: '經典著作', row_pos: 0,
    summary: '首次提出領導者與每個部屬的關係是獨特的「垂直對偶連結」(VDL)，而非齊一對待。將團隊內區分為「圈內」(in-group) 與「圈外」(out-group)，預告了 LMX 理論的誕生。',
    key_findings: JSON.stringify(['領導行為在同一團隊內因人而異','圈內成員獲得更多資源、信任與發展機會','對偶關係是領導效能的真正分析單位']),
    significance: '打破「平均領導風格」的假設，開創 LMX 研究的前身。',
    pdf_url: null, prereqs: ['fleishman1953'],
  },
  {
    id: 'graen_uhlbien1995', topic: 'leadership', year: 1995, era: 'LMX 成熟', branch: 'lmx',
    title: 'Relationship-Based Approach to Leadership: Development of Leader-Member Exchange (LMX) Theory of Leadership Over 25 Years',
    authors: 'George B. Graen & Mary Uhl-Bien',
    journal: 'Leadership Quarterly, 6(2)',
    badge: '⭐ 里程碑', row_pos: 1,
    summary: '回顧 LMX 研究 25 年演進，提出「領導建立」(leadership making) 的三階段模型：陌生人→熟人→夥伴。明確主張 LMX 是可被發展的關係品質，並非天生差別待遇。',
    key_findings: JSON.stringify(['LMX 品質經歷三階段發展：陌生人、熟人、夥伴','高 LMX 關係具備信任、尊重與相互義務','領導者應努力建立每個對偶的高品質關係']),
    significance: '將 LMX 從描述性的差別現象升級為規範性的發展理論，推動管理實務應用。',
    pdf_url: null, prereqs: ['dansereau1975'],
  },
  {
    id: 'gerstner_day1997', topic: 'leadership', year: 1997, era: 'LMX 整合', branch: 'lmx',
    title: 'Meta-Analytic Review of Leader-Member Exchange Theory: Correlates and Construct Issues',
    authors: 'Charlotte R. Gerstner & David V. Day',
    journal: 'Journal of Applied Psychology, 82(6)',
    badge: '高引用', row_pos: 2,
    summary: '首篇 LMX 後設分析（79 篇研究），整合 LMX 與工作績效、滿意度、承諾、離職意圖等結果變項的關係，並評估不同 LMX 量表的建構效度。',
    key_findings: JSON.stringify(['LMX 與工作滿意度 (ρ = .50)、承諾 (ρ = .42) 高度相關','LMX 與工作績效正相關但相關較弱 (ρ = .30)','不同 LMX 量表間有相當一致性但仍存差異']),
    significance: '為 LMX 理論提供穩固的實證基礎，並引發後續建構清晰化的討論。',
    pdf_url: null, prereqs: ['graen_uhlbien1995'],
  },

  // ── Positive Leadership ──
  {
    id: 'greenleaf1977', topic: 'leadership', year: 1977, era: '正向領導起源', branch: 'positive',
    title: 'Servant Leadership: A Journey into the Nature of Legitimate Power and Greatness',
    authors: 'Robert K. Greenleaf',
    journal: 'Book — Paulist Press',
    badge: '經典著作', row_pos: 0,
    summary: '提出「服務型領導」概念：真正的領導者首先是服務者，優先關懷部屬成長、組織社群福祉與更廣的利害關係人。與以權力為中心的傳統觀形成鮮明對比。',
    key_findings: JSON.stringify(['領導的起點是「服務他人」的意願，不是權力','服務型領導以部屬成長與福祉為首要衡量標準','組織應建立道德社群，而非僅追求效率']),
    significance: '預示了 21 世紀初的「道德正向領導」浪潮，是服務、真誠、倫理各流派的共同思想源頭。',
    pdf_url: null, prereqs: ['burns1978'],
  },
  {
    id: 'brown2005', topic: 'leadership', year: 2005, era: '正向領導興起', branch: 'positive',
    title: 'Ethical Leadership: A Social Learning Perspective for Construct Development and Testing',
    authors: 'Michael E. Brown, Linda K. Treviño & David A. Harrison',
    journal: 'Organizational Behavior and Human Decision Processes, 97(2)',
    badge: '⭐ 里程碑', row_pos: 1,
    summary: '以社會學習理論為基礎，正式定義「倫理領導」並開發 ELS 量表。倫理領導者既是道德人 (moral person) 也是道德管理者 (moral manager)，以行為示範與明確溝通塑造部屬的倫理行為。',
    key_findings: JSON.stringify(['倫理領導透過角色示範 (role modeling) 運作','倫理領導與滿意度、工作投入及減少不道德行為相關','ELS 量表為後續數百篇研究提供測量基礎']),
    significance: '讓倫理領導從規範性討論變成可實證研究的建構，帶動整個領域十年的熱潮。',
    pdf_url: null, prereqs: ['bass1985', 'greenleaf1977'],
  },
  {
    id: 'walumbwa2008', topic: 'leadership', year: 2008, era: '正向領導興起', branch: 'positive',
    title: 'Authentic Leadership: Development and Validation of a Theory-Based Measure',
    authors: 'Fred O. Walumbwa, Bruce J. Avolio, William L. Gardner, Tara S. Wernsing & Suzanne J. Peterson',
    journal: 'Journal of Management, 34(1)',
    badge: '高引用', row_pos: 2,
    summary: '確立真誠領導的四構面：自我覺察、關係透明、內化道德觀、平衡式處理資訊。開發 ALQ 量表並完成跨樣本驗證，成為真誠領導研究的標準測量工具。',
    key_findings: JSON.stringify(['真誠領導四構面具良好建構效度','與倫理領導、轉型領導有部分重疊但可區分','真誠領導預測 OCB、工作投入與績效']),
    significance: 'ALQ 量表讓真誠領導迅速成為正向領導研究的主流分支之一。',
    pdf_url: null, prereqs: ['bass1985', 'graen_uhlbien1995'],
  },

  // ── Shared / Distributed ──
  {
    id: 'pearce2003', topic: 'leadership', year: 2003, era: '共享領導起源', branch: 'shared',
    title: 'Shared Leadership: Reframing the Hows and Whys of Leadership',
    authors: 'Craig L. Pearce & Jay A. Conger (Eds.)',
    journal: 'Book — SAGE Publications',
    badge: '經典著作', row_pos: 1,
    summary: '將「領導是團隊內分散的、動態的相互影響過程」這個觀念系統化。主張在知識型、自主性高的工作中，傳統的垂直領導不足，共享領導才是真正的績效機制。',
    key_findings: JSON.stringify(['共享領導是團隊成員彼此互為領導者的橫向過程','垂直與共享領導可以並存且互補','共享領導特別適合知識型與複雜任務團隊']),
    significance: '為後續共享/集體/分散式領導研究提供基礎定義與理論框架。',
    pdf_url: null, prereqs: ['bass1985', 'graen_uhlbien1995'],
  },
  {
    id: 'carson2007', topic: 'leadership', year: 2007, era: '共享領導實證', branch: 'shared',
    title: 'Shared Leadership in Teams: An Investigation of Antecedents and Consequences',
    authors: 'Jay B. Carson, Paul E. Tesluk & Jennifer A. Marrone',
    journal: 'Academy of Management Journal, 50(5)',
    badge: '高引用', row_pos: 2,
    summary: '以社會網絡分析操作化共享領導（網絡密度），驗證團隊內部環境（共同目的、社會支持、發聲）與外部教練行為共同促成共享領導，進而提升團隊績效。',
    key_findings: JSON.stringify(['共享領導是團隊層次的網絡密度建構','內部環境三因素是共享領導的前因','共享領導顯著預測團隊績效']),
    significance: '提供最具影響力的共享領導操作化方式，啟發大量後續量化研究。',
    pdf_url: null, prereqs: ['pearce2003'],
  },
  {
    id: 'dinnocenzo2016', topic: 'leadership', year: 2016, era: '共享領導整合', branch: 'shared',
    title: 'A Meta-Analysis of Different Forms of Shared Leadership-Team Performance Relations',
    authors: 'Lauren D\'Innocenzo, John E. Mathieu & Michael R. Kukenberger',
    journal: 'Journal of Management, 42(7)',
    badge: '⭐ 里程碑', row_pos: 3,
    summary: '43 個獨立樣本的後設分析，發現共享領導與團隊績效正相關 (ρ = .20–.35)，關係隨績效衡量方式與共享領導測量方式而變；網絡法的效果量大於聚合評分法。',
    key_findings: JSON.stringify(['共享領導與團隊績效有中等正相關','網絡密度法比成員平均法得到更強的效果量','任務複雜度調節共享領導的效益']),
    significance: '為共享領導理論提供了整合性證據，並揭示未來研究方法選擇的重要性。',
    pdf_url: null, prereqs: ['carson2007'],
  },
];

// ═══════════════════════════════════════════
// PAPERS — FOMO (Fear of Missing Out)
// ═══════════════════════════════════════════
const FOMO_PAPERS = [
  {
    id: 'przybylski2013', topic: 'fomo', year: 2013, era: '奠基期', branch: 'fomo_foundation',
    title: 'Motivational, Emotional, and Behavioral Correlates of Fear of Missing Out',
    authors: 'Andrew K. Przybylski, Kou Murayama, Cody R. DeHaan & Valerie Gladwell',
    journal: 'Computers in Human Behavior, 29(4)',
    badge: '⭐ 里程碑', row_pos: 2,
    summary: 'FOMO 研究的奠基之作。首次在自我決定理論 (SDT) 框架下定義 FOMO 為「對他人可能正經歷有益體驗而自己缺席的瀰漫性擔憂」，並開發出 10 題的 FOMO 量表。',
    key_findings: JSON.stringify(['FOMO 與心理需求未滿足（自主、勝任、關係）顯著相關','低心情、低生活滿意度預測更高 FOMO','FOMO 中介需求缺失與社群媒體過度使用的關係']),
    significance: '首創可測量的 FOMO 構念與量表，成為此後十年所有 FOMO 研究的理論與方法基礎，引用數已超過萬次。',
    pdf_url: 'https://selfdeterminationtheory.org/wp-content/uploads/2014/04/2013_PrzybylskiMurayamaDeHaanGladwell_CIHB.pdf',
    prereqs: [],
  },
  {
    id: 'alt2015', topic: 'fomo', year: 2015, era: '早期驗證', branch: 'fomo_social_media',
    title: "College Students' Academic Motivation, Media Engagement and Fear of Missing Out",
    authors: 'Dorit Alt',
    journal: 'Computers in Human Behavior, 49',
    badge: null, row_pos: 0,
    summary: '以大學生為對象，驗證 FOMO 中介了「學業動機品質」與「社群媒體使用強度」之間的關係，將 FOMO 納入教育動機框架。',
    key_findings: JSON.stringify(['社交媒體涉入與 FOMO 高度正相關','內在（掌握取向）動機減弱 FOMO','外在（表現取向）動機強化 FOMO 及社群使用']),
    significance: '把 FOMO 研究延伸到學術動機領域，指出 FOMO 是連結動機品質與數位行為的重要情緒機制。',
    pdf_url: null, prereqs: ['przybylski2013'],
  },
  {
    id: 'beyens2016', topic: 'fomo', year: 2016, era: '早期驗證', branch: 'fomo_social_media',
    title: "I Don't Want to Miss a Thing: Adolescents' Fear of Missing Out and its Relationship to Adolescents' Social Needs, Facebook Use, and Facebook Related Stress",
    authors: 'Ine Beyens, Eline Frison & Steven Eggermont',
    journal: 'Computers in Human Behavior, 64',
    badge: '高引用', row_pos: 1,
    summary: '以 402 名比利時青少年為樣本，驗證歸屬與人氣需求如何透過 FOMO 增加 Facebook 使用強度與相關壓力。',
    key_findings: JSON.stringify(['歸屬需求與人氣需求正向預測 FOMO','FOMO 完全中介社會需求與 Facebook 使用強度','FOMO 也中介需求與 Facebook 相關壓力']),
    significance: '在青少年樣本中確立了「社會需求 → FOMO → 社群媒體壓力」的中介路徑，成為後續青少年 FOMO 研究的標竿。',
    pdf_url: null, prereqs: ['przybylski2013'],
  },
  {
    id: 'elhai2016', topic: 'fomo', year: 2016, era: '臨床連結', branch: 'fomo_mental_health',
    title: 'Fear of Missing Out, Need for Touch, Anxiety and Depression are Related to Problematic Smartphone Use',
    authors: 'Jon D. Elhai, Jason C. Levine, Robert D. Dvorak & Brian J. Hall',
    journal: 'Computers in Human Behavior, 63',
    badge: '⭐ 里程碑', row_pos: 1,
    summary: '首次系統檢驗 FOMO、焦慮、憂鬱與問題性智慧型手機使用 (PSU) 的關聯，發現 FOMO 是 PSU 嚴重性的重要心理驅動因子。',
    key_findings: JSON.stringify(['FOMO 顯著預測 PSU，獨立於焦慮與憂鬱','焦慮與 PSU 正相關，憂鬱則不一致','觸覺需求 (need for touch) 也預測 PSU']),
    significance: '把 FOMO 嵌入臨床心理學脈絡，奠定 FOMO 與智慧型手機成癮研究的主流方向。',
    pdf_url: null, prereqs: ['przybylski2013'],
  },
  {
    id: 'oberst2017', topic: 'fomo', year: 2017, era: '臨床連結', branch: 'fomo_mental_health',
    title: 'Negative Consequences from Heavy Social Networking in Adolescents: The Mediating Role of Fear of Missing Out',
    authors: 'Ursula Oberst, Elisa Wegmann, Benjamin Stodt, Matthias Brand & Andrés Chamarro',
    journal: 'Journal of Adolescence, 55',
    badge: '高引用', row_pos: 2,
    summary: '以 5,280 名西班牙青少年為樣本，驗證 FOMO 中介「社群網站密集使用」與焦慮、憂鬱等負面結果的關係，並確認女性青少年 FOMO 水準顯著較高。',
    key_findings: JSON.stringify(['重度社群使用透過 FOMO 間接影響心理健康','女性青少年的 FOMO 顯著高於男性','FOMO 同時中介焦慮與憂鬱兩類結果']),
    significance: '大規模樣本確立 FOMO 為青少年社群使用負面後果的關鍵中介機制，影響政策與臨床建議。',
    pdf_url: null, prereqs: ['elhai2016', 'beyens2016'],
  },
  {
    id: 'blackwell2017', topic: 'fomo', year: 2017, era: '個別差異', branch: 'fomo_personality',
    title: 'Extraversion, Neuroticism, Attachment Style and Fear of Missing Out as Predictors of Social Media Use and Addiction',
    authors: 'David Blackwell, Carrie Leaman, Rose Tramposch, Ciera Osborne & Miriam Liss',
    journal: 'Personality and Individual Differences, 116',
    badge: null, row_pos: 3,
    summary: '將五大人格與依附風格納入 FOMO 模型，發現 FOMO 與神經質及焦慮依附顯著相關，且獨立於人格變項預測社群媒體使用與成癮。',
    key_findings: JSON.stringify(['神經質與焦慮依附正向預測 FOMO','FOMO 預測社群使用與成癮，效果獨立於人格','外向性預測使用量但不預測成癮']),
    significance: '將 FOMO 置於人格—依附—行為的因果鏈上，成為 FOMO 個別差異研究的範本。',
    pdf_url: null, prereqs: ['elhai2016'],
  },
  {
    id: 'milyavskaya2018', topic: 'fomo', year: 2018, era: '個別差異', branch: 'fomo_mental_health',
    title: 'Fear of Missing Out: Prevalence, Dynamics, and Consequences of Experiencing FOMO',
    authors: 'Marina Milyavskaya, Mark Saffran, Nora Hope & Richard Koestner',
    journal: 'Motivation and Emotion, 42(5)',
    badge: null, row_pos: 0,
    summary: '以每日日記法追蹤大學生的 FOMO 經驗，揭示 FOMO 是普遍且每日多次發生的情緒狀態，並連結到負面情感、疲憊與課業投入降低。',
    key_findings: JSON.stringify(['FOMO 是每日發生的日常情緒現象，非僅特質','當日 FOMO 越高，該日的負面情感、疲憊越強','FOMO 與睡眠問題、注意力分散相關']),
    significance: '把 FOMO 從跨個體差異拓展到個體內動態，提供 FOMO 作為「狀態」的時序證據。',
    pdf_url: null, prereqs: ['przybylski2013'],
  },
  {
    id: 'dempsey2019', topic: 'fomo', year: 2019, era: '機制整合', branch: 'fomo_mental_health',
    title: 'Fear of Missing Out (FoMO) and Rumination Mediate Relations Between Social Anxiety and Problematic Facebook Use',
    authors: "Allison E. Dempsey, Kara B. O'Brien, Megan D. Tiamiyu & Jon D. Elhai",
    journal: 'Addictive Behaviors Reports, 9',
    badge: null, row_pos: 3,
    summary: '檢驗「社交焦慮 → FOMO／反芻思考 → 問題性 Facebook 使用」的序列中介模型，發現 FOMO 與反芻各自獨立中介此一路徑。',
    key_findings: JSON.stringify(['社交焦慮透過 FOMO 間接影響問題性 Facebook 使用','反芻思考是另一獨立中介路徑','兩條中介路徑對臨床介入具不同意涵']),
    significance: '建立 FOMO 與焦慮病理的連結，為臨床介入（如 CBT 對反芻）提供機制性依據。',
    pdf_url: null, prereqs: ['elhai2016', 'oberst2017'],
  },
  {
    id: 'tandon2021', topic: 'fomo', year: 2021, era: '機制整合', branch: 'fomo_social_media',
    title: 'Dark Consequences of Social Media-Induced Fear of Missing Out (FoMO): Social Media Stalking, Comparisons, and Fatigue',
    authors: 'Anushree Tandon, Amandeep Dhir, Shalini Talwar, Puneet Kaur & Matti Mäntymäki',
    journal: 'Technological Forecasting and Social Change, 171',
    badge: '高引用', row_pos: 2,
    summary: '以壓力-應變-結果 (SSO) 框架探討社群媒體誘發的 FOMO 如何透過社交監看、向上比較與自我揭露，導致社群媒體疲勞。',
    key_findings: JSON.stringify(['FOMO 透過社交監看與向上比較惡化疲勞','自我揭露意圖反而放大 FOMO 的影響','SSO 框架為數位疲勞研究提供統合語言']),
    significance: '把 FOMO 嵌入資訊系統研究的 SSO 壓力框架，拓展到行銷與組織行為脈絡。',
    pdf_url: null, prereqs: ['oberst2017', 'beyens2016'],
  },
  {
    id: 'gupta2021', topic: 'fomo', year: 2021, era: '機制整合', branch: 'fomo_foundation',
    title: 'Fear of Missing Out: A Brief Overview of Origin, Theoretical Underpinnings and Relationship with Mental Health',
    authors: 'Mayank Gupta & Aditya Sharma',
    journal: 'World Journal of Clinical Cases, 9(19)',
    badge: '回顧論文', row_pos: 3,
    summary: '系統回顧 FOMO 的概念起源、理論基礎與心理健康研究。梳理 FOMO 與焦慮、憂鬱、物質使用、睡眠問題的關聯，並提出臨床評估與介入建議。',
    key_findings: JSON.stringify(['FOMO 是社群媒體時代的普遍心理現象','FOMO 與多種心理病理共病','臨床上應評估 FOMO 作為問題性使用的前因']),
    significance: '為臨床心理學界提供第一份完整的 FOMO 回顧，促進 FOMO 納入治療考量。',
    pdf_url: null, prereqs: ['przybylski2013', 'elhai2016'],
  },
  {
    id: 'alabri2022', topic: 'fomo', year: 2022, era: '當代研究', branch: 'fomo_personality',
    title: 'Fear of Missing Out (FOMO): The Effects of the Need to Belong, Perceived Centrality, and Fear of Social Exclusion',
    authors: 'Abdullah Alabri',
    journal: 'Human Behavior and Emerging Technologies, 2022',
    badge: null, row_pos: 4,
    summary: '檢驗歸屬需求、感知中心性與社會排斥恐懼如何共同預測 FOMO，資料顯示三者均為 FOMO 的獨立前因，其中社會排斥恐懼效果最強。',
    key_findings: JSON.stringify(['社會排斥恐懼是 FOMO 最強的預測因子','感知中心性與歸屬需求也顯著預測 FOMO','三者共同解釋大部分 FOMO 個別差異']),
    significance: '把 FOMO 置於社會排斥與歸屬需求的理論脈絡，為介入策略提供新的心理標的。',
    pdf_url: null, prereqs: ['blackwell2017', 'przybylski2013'],
  },
];

// ═══════════════════════════════════════════
// SEED — idempotent upsert
// ═══════════════════════════════════════════
function seed() {
  const upsertTopic = db.prepare(`
    INSERT INTO topics (id, name, name_en, description, icon)
    VALUES (@id, @name, @name_en, @description, @icon)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      name_en = excluded.name_en,
      description = excluded.description,
      icon = excluded.icon
  `);

  const upsertBranch = db.prepare(`
    INSERT INTO branches (id, topic, label, color, name_en, description, row_pos, year_start)
    VALUES (@id, @domain, @label, @color, @name_en, @description, @row_pos, @year_start)
    ON CONFLICT(id) DO UPDATE SET
      topic = excluded.topic,
      label = excluded.label,
      color = excluded.color,
      name_en = excluded.name_en,
      description = excluded.description,
      row_pos = excluded.row_pos,
      year_start = excluded.year_start
  `);

  const insertPaper = db.prepare(`
    INSERT OR IGNORE INTO papers (id, topic, year, era, branch, title, authors, journal, badge, row_pos, summary, key_findings, significance, pdf_url)
    VALUES (@id, @topic, @year, @era, @branch, @title, @authors, @journal, @badge, @row_pos, @summary, @key_findings, @significance, @pdf_url)
  `);

  const insertPrereq = db.prepare('INSERT OR IGNORE INTO paper_prereqs (paper_id, prereq_id) VALUES (?, ?)');
  const insertBranchPrereq = db.prepare('INSERT OR IGNORE INTO branch_prereqs (branch_id, prereq_id) VALUES (?, ?)');

  const allPapers = [...CONFLICT_PAPERS, ...CHESS_PAPERS, ...LEADERSHIP_PAPERS, ...FOMO_PAPERS];

  const seedAll = db.transaction(() => {
    for (const d of DOMAINS) upsertTopic.run(d);
    for (const s of SUBDOMAINS) upsertBranch.run(s);
    for (const [branchId, prereqId] of SUBDOMAIN_PREREQS) {
      insertBranchPrereq.run(branchId, prereqId);
    }
    for (const p of allPapers) {
      const { prereqs, ...paperData } = p;
      insertPaper.run(paperData);
      for (const prereqId of prereqs) {
        insertPrereq.run(p.id, prereqId);
      }
    }
  });

  seedAll();

  const domainCount = db.prepare('SELECT COUNT(*) as c FROM topics').get().c;
  const subdomainCount = db.prepare('SELECT COUNT(*) as c FROM branches').get().c;
  const paperCount = db.prepare('SELECT COUNT(*) as c FROM papers').get().c;
  console.log(`Seed complete: ${domainCount} domains, ${subdomainCount} subdomains, ${paperCount} papers.`);
}

seed();
