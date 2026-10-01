/**
 * E Ink 3D Explorer — 電子紙技術立體解說平台 v1.0
 * 核心互動邏輯
 *
 * 功能：
 * 1. 微膠囊 CSS 3D 解剖視圖（分層展開 / 組合 / X 光模式 / 帶電粒子動畫）
 * 2. 四大彩色架構 3D 剖面對比（Carta / Kaleido 3 / Gallery 3 / Spectra 6）
 * 3. 1990–2026 技術演進時光軸（可篩選分類）
 * 4. 系統拓撲 3D 立體圖（本地 vs. 雲端架構）
 * 5. BLE vs. Wi-Fi 智慧電源計算機
 * 6. 技術名詞字典（即時搜尋）
 * 7. WASD / 拖曳旋轉鏡頭控制
 */

'use strict';

// ==================== 常數資料庫 ====================

/** 微膠囊 6 大技術層定義 */
const LAYERS = [
  {
    id: 'protective',
    num: 'L-01',
    zh: '保護層 / 透明電極',
    en: 'Protective Layer / Transparent Electrode',
    class: 'layer--protective',
    badgeColor: 'rgba(200,220,255,0.7)',
    role: '光學入射 & 電場施加',
    desc: '最外層為高透明光學保護薄膜，保護電子墨水不受環境損傷。透明電極（ITO 或 PEDOT:PSS）施加均勻電場，驅動下方粒子移動。',
    specs: [
      { k: '材質', v: 'PET + ITO 透明導電層' },
      { k: '透光率', v: '> 90%' },
      { k: '厚度', v: '~100 µm' },
      { k: '功能', v: '環境光入射 / 電場施加' }
    ],
    // 3D 盒子尺寸（寬, 高, 厚, 偏移Z）
    box: { w: 260, h: 160, d: 12, z: 80 },
    color3d: { face: 'rgba(220,235,255,0.04)', border: 'rgba(200,220,255,0.22)' }
  },
  {
    id: 'eink',
    num: 'L-02',
    zh: '電子墨水層（微膠囊）',
    en: 'E Ink Layer (Microcapsules)',
    class: 'layer--eink',
    badgeColor: '#888880',
    role: '核心成像層',
    desc: '每個微膠囊（直徑約 30–60 µm）內含透明介質油，懸浮帶負電的白色 TiO₂ 粒子與帶正電的黑色碳粒子。電場控制粒子上下移動，形成黑白畫素。',
    specs: [
      { k: '微膠囊直徑', v: '30–60 µm' },
      { k: '白色粒子', v: 'TiO₂（帶負電）' },
      { k: '黑色粒子', v: '碳黑（帶正電）' },
      { k: '介質', v: '透明碳氫化合物油' },
      { k: '響應電壓', v: '±15V' }
    ],
    box: { w: 260, h: 160, d: 30, z: 48 },
    color3d: { face: 'rgba(140,150,160,0.08)', border: 'rgba(150,165,180,0.28)' }
  },
  {
    id: 'tft',
    num: 'L-03',
    zh: 'TFT 薄膜電晶體背板',
    en: 'Thin-Film Transistor (TFT) Backplane',
    class: 'layer--tft',
    badgeColor: 'rgba(57,255,20,0.8)',
    role: '像素精準控制',
    desc: '每個像素電極連接一個薄膜電晶體（TFT），透過掃描線與資料線矩陣，依序對每行每列的像素施加指定電壓。主動矩陣確保高解析度與快速尋址。',
    specs: [
      { k: '技術', v: '主動矩陣 TFT' },
      { k: '材質', v: 'a-Si / IGZO / LTPO' },
      { k: '解析度上限', v: '300+ PPI' },
      { k: '驅動電壓', v: '依驅動 IC 決定' }
    ],
    box: { w: 260, h: 160, d: 20, z: 16 },
    color3d: { face: 'rgba(10,20,8,0.9)', border: 'rgba(60,200,30,0.22)' }
  },
  {
    id: 'driver',
    num: 'L-04',
    zh: '驅動 IC',
    en: 'Display Driver IC (DDIC)',
    class: 'layer--driver',
    badgeColor: 'rgba(255,210,0,0.8)',
    role: '波形電壓序列產生',
    desc: '驅動 IC 接收顯示控制器的像素數據，依據波形（Waveform）查找表，產生精準的正負高壓時序脈衝（最高可達 ±40V），驅動 TFT 像素電極。',
    specs: [
      { k: '輸出電壓', v: '±15V ~ ±40V' },
      { k: '波形深度', v: '可達 256 步驟' },
      { k: '溫度補償', v: '支援（影響刷新速度）' },
      { k: '灰階', v: '最多 16 灰階' }
    ],
    box: { w: 200, h: 50, d: 14, z: -8 },
    color3d: { face: 'rgba(15,20,40,0.92)', border: 'rgba(255,210,0,0.22)' }
  },
  {
    id: 'mcu',
    num: 'L-05',
    zh: '主控 MCU / SoC',
    en: 'Main Controller MCU / SoC',
    class: 'layer--mcu',
    badgeColor: 'rgba(0,170,255,0.8)',
    role: '系統大腦 & 通訊',
    desc: '負責整個系統的邏輯控制：接收來自 BLE / Wi-Fi 的畫面數據、管理 Flash 快取、驅動顯示控制器、執行電源管理。是電子紙裝置的「大腦」。',
    specs: [
      { k: '常見主控', v: 'ESP32 / nRF52840 / STM32' },
      { k: 'BLE 功耗', v: '峰值 ~15 mA，待機 <1 µA' },
      { k: 'Wi-Fi 功耗', v: '峰值 50–100 mA，待機 1–5 mA' },
      { k: '快取', v: 'SPI Flash 4–64 MB' }
    ],
    box: { w: 200, h: 50, d: 14, z: -26 },
    color3d: { face: 'rgba(10,15,30,0.94)', border: 'rgba(0,170,255,0.28)' }
  },
  {
    id: 'battery',
    num: 'L-06',
    zh: '電池 & 電源管理 (PMIC)',
    en: 'Battery & Power Management IC',
    class: 'layer--battery',
    badgeColor: 'rgba(255,215,0,0.8)',
    role: '能量供應 & 雙穩態維持',
    desc: '電池提供整個系統所需電能，PMIC 負責升降壓、充電管理與各電路域的電源順序控制。E Ink 雙穩態特性意謂靜態畫面幾乎不消耗電池電量。',
    specs: [
      { k: 'ESL 典型電池', v: '紐扣電池 CR2032 (220 mAh)' },
      { k: 'ESL 壽命', v: '~5 年 (每日數次更新)' },
      { k: '靜態耗電', v: '< 1 µA (雙穩態保持)' },
      { k: 'PMIC', v: '升壓至驅動 IC 電壓需求' }
    ],
    box: { w: 200, h: 50, d: 14, z: -44 },
    color3d: { face: 'rgba(5,10,3,0.96)', border: 'rgba(255,215,0,0.25)' }
  }
];

/** 技術名詞字典 */
const GLOSSARY_DATA = [
  { zh: '電子紙', en: 'Electronic Paper, ePaper', category: 'principle', meaning: '具備類似紙張閱讀體驗、反射環境光、無直射藍光且超低功耗的顯示技術總稱。' },
  { zh: '電子墨水', en: 'Electronic Ink', category: 'principle', meaning: '元太科技 E Ink 旗下核心專利電泳式材料與化學墨水平台名稱。' },
  { zh: '電泳式顯示', en: 'Electrophoretic Display, EPD', category: 'principle', meaning: '將帶正負不同電荷的微米級著色粒子懸浮於液體中，透過電場控制粒子游動以成像。' },
  { zh: '微膠囊', en: 'Microcapsules', category: 'principle', meaning: '將帶電黑白粒子與透明介質封裝於直徑約髮絲粗細的球型透明微膠囊結構中。' },
  { zh: '微杯', en: 'Microcups®', category: 'principle', meaning: '另一種以滾輪微壓印製程製作的蜂巢狀杯狀腔體結構，具備極佳的耐壓與柔性彎折度。' },
  { zh: '雙穩態', en: 'Bi-stability', category: 'principle', meaning: '電子紙最重要的物理特性：粒子受電場移至定位後，即使完全移除電源仍能長久保持畫面，靜態維持完全不耗電！' },
  { zh: 'TFT 背板', en: 'Thin-Film Transistor Backplane', category: 'hardware', meaning: '控制螢幕上每一個微米像素正負電壓的主動矩陣薄膜電晶體電路。' },
  { zh: '驅動 IC', en: 'Display Driver IC', category: 'hardware', meaning: '負責產生精準正、負及接地高壓脈衝電壓序列，驅動 TFT 像素電極。' },
  { zh: '波形', en: 'Waveform', category: 'hardware', meaning: '控制粒子平滑移動、消除殘影、控制灰階深度與更新速度的專用時序電壓訊號演算法。' },
  { zh: '局部更新', en: 'Partial Refresh', category: 'hardware', meaning: '僅重新驅動螢幕上有變更的區域，大幅縮短刷新時間並消除全螢幕黑白閃爍。' },
  { zh: '全螢幕更新', en: 'Full Refresh', category: 'hardware', meaning: '對整個顯示區域進行多次反向電壓重置，將所有粒子重新歸位以徹底消除歷史殘影。' },
  { zh: '殘影', en: 'Ghosting', category: 'hardware', meaning: '粒子因局部摩擦或電場不均勻未完全歸位，導致前一個畫面輕微殘留在新畫面中的現象。' },
  { zh: '反射式顯示', en: 'Reflective Display', category: 'color', meaning: '利用外部環境光源照射反射成像，環境光愈強對比愈好，無直射藍光。' },
  { zh: '灰階', en: 'Grayscale', category: 'color', meaning: '在純黑與純白之間，透過電壓時間精細控制黑白粒子混合深度所產生的亮度層次（通常為 16 灰階）。' },
  { zh: '彩色濾光片', en: 'Color Filter Array, CFA', category: 'color', meaning: '在黑白電子紙頂部貼附 RGB 微細光學濾光層，透過子像素混色呈現豐富色彩（如 Kaleido）。' },
  { zh: '彩色印刷電子紙', en: 'Print Color ePaper', category: 'color', meaning: '以彩色濾光片 (CFA) 結合黑白電子墨水的彩色電子紙技術（如 Kaleido 系列）。' },
  { zh: '全彩電子紙', en: 'Advanced Color ePaper, ACeP', category: 'color', meaning: '不使用彩色濾光片，在每個像素中直接懸浮青、洋紅、黃、白等多彩微粒子進行物理混色（Gallery 系列）。' },
  { zh: '前光', en: 'Front Light', category: 'color', meaning: '安裝於反射螢幕正前方的導光板與微型 LED，在暗處將光線均勻打向電子紙表面反射。' },
  { zh: '電子貨架標籤', en: 'Electronic Shelf Label, ESL', category: 'application', meaning: '零售超商與量販店廣泛應用的超低功耗電子標價牌，一顆紐扣電池可運作 5 年以上。' },
  { zh: '電子紙筆記本', en: 'eNote', category: 'application', meaning: '結合電子紙低延遲手寫觸控與無眩光護眼特性的數位書寫本。' }
];

/** 四大彩色架構 */
const COLOR_ARCHS = [
  {
    id: 'carta',
    name: 'Carta 1200',
    en: 'E Ink Carta™ 1200 (Black & White)',
    accent: '#c8d8f0',
    layers3d: [
      { label: '保護層', color: 'rgba(220,235,255,0.07)', border: 'rgba(200,220,255,0.3)', h: 8 },
      { label: '電子墨水（黑白）', color: 'rgba(130,140,150,0.15)', border: 'rgba(150,165,180,0.35)', h: 28 },
      { label: 'TFT 背板', color: 'rgba(5,15,5,0.9)', border: 'rgba(57,200,30,0.25)', h: 14 }
    ],
    specs: [
      { label: '解析度', value: '300 PPI', color: '#00e5ff' },
      { label: '色彩數', value: '16 灰階', color: '#888' },
      { label: '刷新時間', value: '< 1 秒（全刷）', color: '#00ff88' }
    ],
    desc: '黑白電子紙旗艦平台，超高對比、頂級 300 PPI 解析度，反射率業界最高，刷新速度最快，適合電子書閱讀器主流應用。',
    pros: ['300 PPI 頂級解析度', '反射率最高（像紙張）', '16 灰階細膩層次', '最快刷新速度', '最成熟、成本最低'],
    cons: ['僅黑白，不支援彩色', '夜間需配置前光', '無法呈現色彩資訊']
  },
  {
    id: 'kaleido',
    name: 'Kaleido™ 3',
    en: 'E Ink Kaleido™ 3 (CFA 彩色印刷)',
    accent: '#9960ff',
    layers3d: [
      { label: 'RGB CFA 彩色濾光片', color: 'rgba(80,50,120,0.12)', border: 'rgba(150,80,255,0.4)', h: 10 },
      { label: '保護層', color: 'rgba(220,235,255,0.05)', border: 'rgba(200,220,255,0.2)', h: 6 },
      { label: '電子墨水（黑白）', color: 'rgba(130,140,150,0.12)', border: 'rgba(150,165,180,0.3)', h: 26 },
      { label: 'TFT 背板', color: 'rgba(5,15,5,0.9)', border: 'rgba(57,200,30,0.22)', h: 14 }
    ],
    specs: [
      { label: '黑白解析度', value: '300 PPI', color: '#c8d8f0' },
      { label: '彩色解析度', value: '150 PPI（因 CFA）', color: '#9960ff' },
      { label: '色彩數', value: '4,096 色', color: '#ff00cc' }
    ],
    desc: 'Kaleido 3 以 RGB 彩色濾光片（CFA）結合 Carta 黑白墨水，因 CFA 拆分像素，彩色解析度降為 150 PPI，但黑白文字仍保 300 PPI。適合漫畫書與彩色電子書。',
    pros: ['黑白文字仍有 300 PPI', '4,096 色彩色顯示', '刷新速度接近黑白', '成本較 Gallery 低', '適合電子書 + 漫畫'],
    cons: ['彩色解析度僅 150 PPI（CFA 拆分）', '色彩較柔和，飽和度有限', '亮度因 CFA 略有損耗', '色域小於 ACeP 架構']
  },
  {
    id: 'gallery',
    name: 'Gallery™ 3',
    en: 'E Ink Gallery™ 3 (ACeP 全彩)',
    accent: '#ff00aa',
    layers3d: [
      { label: '保護層', color: 'rgba(220,235,255,0.05)', border: 'rgba(200,220,255,0.2)', h: 8 },
      { label: 'CMYW 四色粒子墨水', color: 'rgba(100,0,80,0.08)', border: 'rgba(220,0,150,0.38)', h: 38 },
      { label: 'TFT 背板', color: 'rgba(5,15,5,0.9)', border: 'rgba(57,200,30,0.22)', h: 14 }
    ],
    specs: [
      { label: '黑白解析度', value: '300 PPI', color: '#c8d8f0' },
      { label: '彩色解析度', value: '300 PPI（無 CFA）', color: '#ff00aa' },
      { label: '色域', value: '50,000+ 色', color: '#ff00aa' }
    ],
    desc: '革命性 ACeP 全彩技術：每個像素直接懸浮青（C）、洋紅（M）、黃（Y）、白（W）四色粒子，無 CFA 濾光片損耗，黑白與彩色皆達 300 PPI，色域超越 50,000 色。',
    pros: ['黑白與彩色均達 300 PPI（無 CFA 犧牲）', '50,000+ 色寬廣色域', '色彩飽和度遠超 Kaleido', '適合博物館、美術館、商業看板', '不需濾光片，無彩色解析度損耗'],
    cons: ['全彩刷新約 1~1.5 秒（比黑白慢）', '波形控制更複雜', '驅動 IC 成本更高', '不適合高頻動態畫面', '內容處理鏈更複雜']
  },
  {
    id: 'spectra',
    name: 'Spectra™ 6',
    en: 'E Ink Spectra™ 6 (零售標籤 / 看板)',
    accent: '#ff3300',
    layers3d: [
      { label: '保護層', color: 'rgba(220,235,255,0.05)', border: 'rgba(200,220,255,0.2)', h: 8 },
      { label: '多色（黑白紅黃藍綠）粒子墨水', color: 'rgba(80,10,5,0.1)', border: 'rgba(255,50,0,0.42)', h: 32 },
      { label: 'TFT 背板', color: 'rgba(5,15,5,0.9)', border: 'rgba(57,200,30,0.22)', h: 14 }
    ],
    specs: [
      { label: '色彩', value: '黑/白/紅/黃/藍/綠', color: '#ff3300' },
      { label: '全彩刷新', value: '~15 秒（7.3 吋）', color: '#ff7700' },
      { label: '局部刷新', value: '數秒', color: '#ffcc00' }
    ],
    desc: 'Spectra 6 針對零售電子貨架標籤（ESL）與商業看板設計，提供高飽和黑/白/紅/黃/藍/綠六色，2026 Q1 出貨面積已超越黑白消費電子產品。注意：全彩刷新需 ~15 秒，局部更新可縮短至數秒。',
    pros: ['高飽和六色，促銷標示極醒目', '雙穩態 — 零售場景幾乎不需更新', '批量 ESL 部署成本優勢', '2026 年出貨面積超越黑白消費電子', '無需背光，大型看板省電'],
    cons: ['全彩刷新 ~15 秒（7.3 吋）', '不適合高頻動態畫面', '色彩為固定幾種，非連續調色', '波形控制複雜', '系統設計（ESL 網關）要求較高']
  }
];

/** 技術演進時間軸 */
const TIMELINE_DATA = [
  { year: '1990 年代', title: 'MIT Media Lab 電泳墨水原理建立', desc: '美國麻省理工學院媒體實驗室開創帶電微米粒子懸浮微封裝技術，奠定電子紙理論基石。', citation: 'MIT 核心專利', category: 'bw', link: 'https://en.wikipedia.org/wiki/E_Ink' },
  { year: '1997', title: 'E Ink Corporation 正式成立', desc: '由 MIT 研究團隊創立 E Ink 公司，開啟將實驗室微膠囊技術走向商用化的大門。', citation: 'en.wikipedia', category: 'key', link: 'https://en.wikipedia.org/wiki/E_Ink' },
  { year: '1998', title: '微膠囊電泳封裝研究公開', desc: '發表微膠囊有效抑制帶電粒子沉降與聚集的突破性論文，證明電子墨水具備工業級可靠壽命。', citation: 'Nature 論文', category: 'bw', link: 'https://en.wikipedia.org/wiki/E_Ink' },
  { year: '2004', title: '全球首款 E Ink 閱讀器 Sony LIBRIé 登場', desc: 'Sony 與元太前身合作推出世界首部電子墨水閱讀器，掀起全球無紙化數位閱讀革命。', citation: '產業歷史', category: 'key', link: 'http://www.diversifiedautonc.com/history.html' },
  { year: '2007', title: 'E Ink Vizplex® 技術問世', desc: '第一代大規模量產商用電子紙模組，刷新速度與黑白反差大幅提升，推動初代 Amazon Kindle 爆發普及。', citation: 'en.wikipedia', category: 'bw', link: 'https://en.wikipedia.org/wiki/E_Ink' },
  { year: '約 2010', title: 'E Ink Pearl™ 技術普及', desc: '對比度提升 50%，黑白層次更深邃，廣泛應用於 Kindle Paperwhite 與各大電子書旗艦產品。', citation: '產品型錄', category: 'bw', link: 'https://inkframe.net/en/guides/e-paper-technology-guide' },
  { year: '2013', title: 'E Ink Carta™ 革命性黑白畫質', desc: '進一步提升反射率與文字銳利度，支援 Smooth 灰階演算法與局部無閃爍刷新。', citation: '技術手冊', category: 'bw', link: 'https://inkframe.net/en/guides/e-paper-technology-guide' },
  { year: '2014 以後', title: 'Carta HD 邁向 300 PPI 視網膜級', desc: '文字邊緣平滑媲美實體雷射印刷紙張，確立 300 PPI 為頂級電子書閱讀器的全球黃金標準。', citation: '元太規格書', category: 'bw', link: 'https://tw.eink.com/tech/detail/FAQ' },
  { year: '2019', title: 'ACeP 全彩微粒子技術發表（Gallery 雛形）', desc: '擺脫 RGB 濾光片，首次在微膠囊中注入青、洋紅、黃、白四色彩色粒子，實現全彩飽和混色。', citation: 'tw.eink 官方發布', category: 'color', link: 'https://tw.eink.com/upload/2024_05_27/47_20240527170202zo92fgjJH6.pdf' },
  { year: '2020', title: 'E Ink Kaleido™ 彩色印刷電子紙上市', desc: '以彩色濾光片陣列 (CFA) 完美結合成熟的 Carta 墨水，提供 4,096 色與流暢的漫畫翻頁體驗。', citation: 'Kaleido 品牌專頁', category: 'color', link: 'https://tw.eink.com/brand/detail/Kaleido' },
  { year: '2021', title: 'Kaleido Plus 與 Spectra 3100 擴大零售佈局', desc: '改善濾光片透光度與飽和度；四色 Spectra 導入零售電子標籤，支持醒目黃紅促銷標示。', citation: '元太新聞發布', category: 'color', link: 'https://tw.eink.com/news/detail/B5GBRBN5KO' },
  { year: '2022', title: 'Kaleido 3 與 Gallery 3 同步大放異彩', desc: 'Kaleido 3 達到黑白 300 PPI / 彩色 150 PPI（因 CFA 拆分像素）；Gallery 3 無 CFA 濾光片，黑白與彩色均達 300 PPI，全彩翻頁刷新壓至約 1~1.5 秒正式量產。', citation: 'Gallery 3 量產發布', category: 'key', link: 'https://tw.eink.com/news/detail/E%20Ink_Announces_E%20Ink_Gallery%E2%84%A2_3_Moves_Into_Mass_Production_With_Customer_Launches' },
  { year: '2023', title: 'Kaleido 3 Outdoor 戶外全彩看板', desc: '針對戶外廣告牌與公共資訊顯示最佳化，強化抗紫外線與高亮度模式，拓展電子紙至戶外應用。', citation: 'tw.eink 新聞', category: 'color', link: 'https://tw.eink.com/news/detail/Q7FU6K47HU' },
  { year: '2026', title: 'Spectra 6 出貨面積超越黑白消費電子產品', desc: '元太 2026 Q1 法說會重點：Spectra 6 出貨「面積」（非數量）已超越黑白消費性電子產品，反映智慧零售市場爆發！（零售貨架標籤尺寸普遍大於電子書閱讀器，故面積數據具參考意義。）', citation: '2026 Q1 線上法說會', category: 'key', link: 'https://tw.eink.com/investor/' }
];

/** 系統拓撲節點 */
const SYSTEM_LOCAL = [
  { id: 'phone', label: '手機 App', sub: 'BLE 控制端', color: '#4488ff', bdrColor: 'rgba(68,136,255,0.4)', x: '50%', y: '8%', w: 140 },
  { id: 'ble', label: 'BLE 5.0', sub: '無線通訊', color: '#00e5ff', bdrColor: 'rgba(0,229,255,0.4)', x: '50%', y: '28%', w: 120 },
  { id: 'mcu', label: '主控 MCU', sub: 'ESP32 / nRF52840', color: '#00ff88', bdrColor: 'rgba(0,255,136,0.4)', x: '50%', y: '48%', w: 140 },
  { id: 'flash', label: 'Flash 快取', sub: 'SPI Flash 4–64 MB', color: '#ffe020', bdrColor: 'rgba(255,224,32,0.35)', x: '20%', y: '58%', w: 130 },
  { id: 'ddic', label: '驅動 IC', sub: 'Display Driver IC', color: '#ff7700', bdrColor: 'rgba(255,119,0,0.4)', x: '50%', y: '68%', w: 130 },
  { id: 'epd', label: 'EPD 電子紙面板', sub: 'E Ink Carta / Gallery', color: '#c8d8f0', bdrColor: 'rgba(200,216,240,0.4)', x: '50%', y: '85%', w: 160 },
  { id: 'battery', label: '電池 + PMIC', sub: '電源管理', color: '#ff00cc', bdrColor: 'rgba(255,0,204,0.35)', x: '80%', y: '48%', w: 130 }
];

const SYSTEM_CLOUD = [
  { id: 'cloud', label: '雲端 AI 服務', sub: 'AWS / GCP / Azure', color: '#4488ff', bdrColor: 'rgba(68,136,255,0.5)', x: '50%', y: '5%', w: 150 },
  { id: 'wifi', label: 'Wi-Fi / BLE', sub: '無線連線', color: '#00e5ff', bdrColor: 'rgba(0,229,255,0.4)', x: '50%', y: '28%', w: 130 },
  { id: 'mcu', label: '輕量 MCU', sub: '只負責顯示', color: '#00ff88', bdrColor: 'rgba(0,255,136,0.35)', x: '50%', y: '50%', w: 130 },
  { id: 'ddic', label: '驅動 IC', sub: 'Display Driver IC', color: '#ff7700', bdrColor: 'rgba(255,119,0,0.35)', x: '50%', y: '68%', w: 130 },
  { id: 'epd', label: 'EPD 電子紙面板', sub: 'E Ink Carta / Gallery', color: '#c8d8f0', bdrColor: 'rgba(200,216,240,0.35)', x: '50%', y: '85%', w: 160 },
  { id: 'battery', label: '電池 + PMIC', sub: '電源管理', color: '#ff00cc', bdrColor: 'rgba(255,0,204,0.35)', x: '80%', y: '50%', w: 130 }
];

// ==================== 全域狀態 ====================
const state = {
  currentScreen: 'capsule',
  capsule: {
    rotX: -25, rotY: 20, scale: 0.9,
    exploded: false, xray: false,
    activeLayer: null,
    dragging: false, lastX: 0, lastY: 0
  },
  power: {
    comm: 'ble',
    updates: 24,
    size: 'small',
    battery: 500
  },
  timeline: { filter: 'all' },
  system: { arch: 'local' }
};

// ==================== 工具函式 ====================
const $ = id => document.getElementById(id);

/** 建立 CSS 3D 盒子 DOM（六面體） */
function make3DBox(w, h, d, faceColor, borderColor, extras = '') {
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const faces = [
    { cls: 'face-front',  style: `width:${w}px;height:${h}px; transform:translateX(${-hw}px) translateY(${-hh}px) translateZ(${hd}px);` },
    { cls: 'face-back',   style: `width:${w}px;height:${h}px; transform:translateX(${-hw}px) translateY(${-hh}px) translateZ(${-hd}px) rotateY(180deg);` },
    { cls: 'face-top',    style: `width:${w}px;height:${d}px; transform:translateX(${-hw}px) translateY(${-hd}px) rotateX(90deg) translateZ(${hh}px);` },
    { cls: 'face-bottom', style: `width:${w}px;height:${d}px; transform:translateX(${-hw}px) translateY(${-hd}px) rotateX(-90deg) translateZ(${hh}px);` },
    { cls: 'face-left',   style: `width:${d}px;height:${h}px; transform:translateX(${-hd}px) translateY(${-hh}px) rotateY(-90deg) translateZ(${hw}px);` },
    { cls: 'face-right',  style: `width:${d}px;height:${h}px; transform:translateX(${-hd}px) translateY(${-hh}px) rotateY(90deg) translateZ(${hw}px);` }
  ];
  return faces.map(f => `<div class="box3d-face ${f.cls}" style="${f.style} background:${faceColor};border-color:${borderColor};${extras}"></div>`).join('');
}

// ==================== 畫面切換 ====================
function initNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const screen = item.dataset.screen;
      switchScreen(screen);
    });
  });
}

function switchScreen(id) {
  state.currentScreen = id;
  document.querySelectorAll('.screen').forEach(s => s.hidden = true);
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById(`screen-${id}`);
  if (el) el.hidden = false;
  const nav = document.getElementById(`nav-${id}`);
  if (nav) nav.classList.add('active');
}

// ==================== A. 微膠囊 3D 解剖 ====================

function initCapsule() {
  buildLayerList();
  buildCapsule3D();
  bindCapsuleControls();
  initGlossary();
  initMouseDrag('capsule-3d-wrapper', state.capsule);
  initKeyboardControls('capsule-3d-wrapper', state.capsule);
}

function buildLayerList() {
  const list = $('layer-list');
  list.innerHTML = '';
  LAYERS.forEach((layer, i) => {
    const div = document.createElement('div');
    div.className = 'layer-item';
    div.dataset.id = layer.id;
    div.setAttribute('role', 'listitem');
    div.innerHTML = `
      <div class="layer-item-num">${layer.num}</div>
      <div class="layer-item-name">${layer.zh}</div>
      <div class="layer-item-en">${layer.en}</div>
    `;
    div.addEventListener('click', () => selectLayer(layer, div));
    list.appendChild(div);
  });
}

function buildCapsule3D() {
  const wrapper = $('capsule-3d-wrapper');
  wrapper.innerHTML = '';
  wrapper.style.transform = `rotateX(${state.capsule.rotX}deg) rotateY(${state.capsule.rotY}deg) scale(${state.capsule.scale})`;

  LAYERS.forEach((layer, i) => {
    const partDiv = document.createElement('div');
    partDiv.className = `device-part ${layer.class}`;
    partDiv.id = `part-${layer.id}`;
    partDiv.dataset.id = layer.id;
    partDiv.style.cssText = 'position:absolute; left:0; top:0; width:0; height:0; transform-style:preserve-3d; transition: transform 0.65s cubic-bezier(0.4,0,0.2,1), opacity 0.4s;';

    const pivot = document.createElement('div');
    pivot.className = 'box3d-pivot';
    pivot.style.transform = `translateZ(${layer.box.z}px)`;

    pivot.innerHTML = make3DBox(
      layer.box.w, layer.box.h, layer.box.d,
      layer.color3d.face, layer.color3d.border
    );

    // 標籤
    const label = document.createElement('div');
    label.className = 'layer-label-3d';
    label.textContent = `${layer.num} ${layer.zh}`;
    label.style.transform = `translateX(-90px) translateY(-${layer.box.h / 2 + 12}px) translateZ(${layer.box.d / 2 + 2}px)`;
    pivot.appendChild(label);

    partDiv.appendChild(pivot);
    partDiv.addEventListener('click', () => selectLayer(layer, null));
    wrapper.appendChild(partDiv);
  });

  updateCapsule3DTransform();
}

function selectLayer(layer, listItem) {
  // 更新左側列表高亮
  document.querySelectorAll('.layer-item').forEach(li => li.classList.remove('active'));
  if (listItem) listItem.classList.add('active');
  else {
    const li = document.querySelector(`.layer-item[data-id="${layer.id}"]`);
    if (li) li.classList.add('active');
  }

  // 3D 高亮
  document.querySelectorAll('.device-part').forEach(p => p.classList.remove('layer-active'));
  const part = $(`part-${layer.id}`);
  if (part) part.classList.add('layer-active');

  // 標籤顯示
  document.querySelectorAll('.layer-label-3d').forEach(l => l.style.opacity = 0);
  if (part) {
    const lbl = part.querySelector('.layer-label-3d');
    if (lbl) lbl.style.opacity = 1;
  }

  // 右側詳情
  const detail = $('layer-detail');
  detail.innerHTML = `
    <div class="layer-detail-card">
      <div class="ldc-num">${layer.num}</div>
      <div class="ldc-name">${layer.zh}</div>
      <div class="ldc-en">${layer.en}</div>
      <div class="ldc-role">${layer.role}</div>
      <div class="ldc-desc">${layer.desc}</div>
      <div class="ldc-specs">
        ${layer.specs.map(s => `<div class="spec-row"><span class="spec-key">${s.k}</span><span class="spec-val">${s.v}</span></div>`).join('')}
      </div>
    </div>
  `;
  state.capsule.activeLayer = layer.id;
}

function bindCapsuleControls() {
  // 分層展開
  $('btn-explode').addEventListener('click', () => {
    state.capsule.exploded = true;
    document.querySelectorAll('.device-part').forEach((part, i) => {
      const layer = LAYERS[i];
      // 往外展開：用 z 軸偏移擴大
      part.style.transform = `translateZ(${(i - 2.5) * 45}px)`;
      part.classList.add('layer-exploded');
      const lbl = part.querySelector('.layer-label-3d');
      if (lbl) lbl.style.opacity = 1;
    });
    $('btn-view-explode').classList.add('active');
    $('btn-view-assembled').classList.remove('active');
  });

  // 重置組合
  $('btn-reset-capsule').addEventListener('click', () => {
    state.capsule.exploded = false;
    document.querySelectorAll('.device-part').forEach(part => {
      part.style.transform = '';
      part.classList.remove('layer-exploded', 'layer-active');
      const lbl = part.querySelector('.layer-label-3d');
      if (lbl) lbl.style.opacity = 0;
    });
    $('btn-view-assembled').classList.add('active');
    $('btn-view-explode').classList.remove('active');
    $('btn-view-xray').classList.remove('active');
    document.querySelectorAll('.layer-item').forEach(li => li.classList.remove('active'));
    $('layer-detail').innerHTML = '<div class="no-selection-msg">← 點擊左側技術層<br/>查看詳細說明</div>';
  });

  // 視圖按鈕
  $('btn-view-assembled').addEventListener('click', () => $('btn-reset-capsule').click());
  $('btn-view-explode').addEventListener('click', () => $('btn-explode').click());
  $('btn-view-xray').addEventListener('click', () => {
    // X 光模式 — 降低所有層不透明度
    document.querySelectorAll('.device-part').forEach(p => {
      p.style.opacity = state.capsule.xray ? '1' : '0.35';
    });
    state.capsule.xray = !state.capsule.xray;
    $('btn-view-xray').classList.toggle('active', state.capsule.xray);
  });

  // 電場按鈕
  $('btn-field-pos').addEventListener('click', () => setField('pos'));
  $('btn-field-neg').addEventListener('click', () => setField('neg'));
  $('btn-field-gray').addEventListener('click', () => setField('gray'));
  $('btn-field-bistable').addEventListener('click', () => setField('off'));
  $('btn-particle-anim').addEventListener('click', toggleParticleAnim);
}

function setField(mode) {
  // 切換電場按鈕狀態
  ['pos','neg','gray','bistable'].forEach(m => {
    const btn = $(`btn-field-${m}`);
    if (btn) btn.classList.remove('active-pos','active-neg','active-gray');
  });
  if (mode === 'pos') $('btn-field-pos').classList.add('active-pos');
  if (mode === 'neg') $('btn-field-neg').classList.add('active-neg');
  if (mode === 'gray') $('btn-field-gray').classList.add('active-gray');

  // 用前面動畫顏色表達電場效果
  const einkPart = $('part-eink');
  if (!einkPart) return;
  const frontFace = einkPart.querySelector('.face-front');
  if (!frontFace) return;
  if (mode === 'pos') {
    frontFace.style.background = 'linear-gradient(135deg, rgba(232,232,224,0.55), rgba(200,210,220,0.2))';
    frontFace.style.boxShadow = 'inset 0 0 30px rgba(232,232,224,0.3)';
  } else if (mode === 'neg') {
    frontFace.style.background = 'linear-gradient(135deg, rgba(20,20,20,0.85), rgba(5,5,5,0.7))';
    frontFace.style.boxShadow = 'inset 0 0 30px rgba(0,0,0,0.6)';
  } else if (mode === 'gray') {
    frontFace.style.background = 'linear-gradient(135deg, rgba(130,130,120,0.55), rgba(80,80,70,0.3))';
    frontFace.style.boxShadow = '';
  } else {
    frontFace.style.background = '';
    frontFace.style.boxShadow = '';
  }
}

// 粒子動畫
let particleAnimRunning = false;
let particleAF = null;
let particles = [];

function toggleParticleAnim() {
  const overlay = $('particle-overlay');
  particleAnimRunning = !particleAnimRunning;
  overlay.hidden = !particleAnimRunning;
  if (particleAnimRunning) startParticleAnim();
  else stopParticleAnim();
}

function startParticleAnim() {
  const canvas = $('particle-canvas');
  const vp = $('capsule-viewport');
  canvas.width = vp.clientWidth;
  canvas.height = vp.clientHeight;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // 建立粒子群
  particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: W * 0.2 + Math.random() * W * 0.6,
      y: Math.random() * H,
      r: 3 + Math.random() * 5,
      isWhite: Math.random() > 0.5,
      vy: (Math.random() - 0.5) * 0.8,
      vx: (Math.random() - 0.5) * 0.4,
      phase: Math.random() * Math.PI * 2
    });
  }

  let t = 0;
  function loop() {
    if (!particleAnimRunning) return;
    t += 0.02;
    ctx.clearRect(0, 0, W, H);

    // 背景
    ctx.fillStyle = 'rgba(4,7,15,0.15)';
    ctx.fillRect(0, 0, W, H);

    particles.forEach(p => {
      // 電場驅動：白色往上，黑色往下（週期性）
      const fieldDir = Math.sin(t * 0.5) > 0 ? -1 : 1;
      p.vy += (p.isWhite ? fieldDir : -fieldDir) * 0.04;
      p.vy *= 0.92;
      p.vx *= 0.95;
      p.y += p.vy;
      p.x += p.vx;

      // 邊界反彈
      if (p.y < 20) { p.y = 20; p.vy = Math.abs(p.vy) * 0.5; }
      if (p.y > H - 20) { p.y = H - 20; p.vy = -Math.abs(p.vy) * 0.5; }
      if (p.x < W * 0.15) { p.x = W * 0.15; p.vx = Math.abs(p.vx); }
      if (p.x > W * 0.85) { p.x = W * 0.85; p.vx = -Math.abs(p.vx); }

      // 繪製粒子
      const alpha = 0.5 + 0.4 * Math.sin(p.phase + t * 2);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      if (p.isWhite) {
        ctx.fillStyle = `rgba(230,230,220,${alpha})`;
        ctx.shadowColor = 'rgba(230,230,220,0.5)';
        ctx.shadowBlur = 6;
      } else {
        ctx.fillStyle = `rgba(30,30,25,${alpha * 0.8})`;
        ctx.strokeStyle = `rgba(80,80,70,${alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.fill();
    });

    // 電場線指示
    const fieldUp = Math.sin(t * 0.5) > 0;
    ctx.font = '11px "Share Tech Mono"';
    ctx.fillStyle = `rgba(0,229,255,${0.4 + 0.3 * Math.abs(Math.sin(t * 0.5))})`;
    ctx.textAlign = 'center';
    ctx.fillText(fieldUp ? '↑ 正電場 — 白色粒子移至表面' : '↓ 負電場 — 黑色粒子移至表面', W / 2, 22);

    particleAF = requestAnimationFrame(loop);
  }
  loop();
}

function stopParticleAnim() {
  if (particleAF) cancelAnimationFrame(particleAF);
  const canvas = $('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// ==================== 3D 鏡頭控制 ====================
function updateCapsule3DTransform() {
  const s = state.capsule;
  $('capsule-3d-wrapper').style.transform =
    `rotateX(${s.rotX}deg) rotateY(${s.rotY}deg) scale(${s.scale})`;
}

function initMouseDrag(wrapperId, camState) {
  const vp = $('capsule-viewport');
  if (!vp) return;

  vp.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    camState.dragging = true;
    camState.lastX = e.clientX;
    camState.lastY = e.clientY;
  });

  window.addEventListener('mousemove', e => {
    if (!camState.dragging) return;
    const dx = e.clientX - camState.lastX;
    const dy = e.clientY - camState.lastY;
    camState.lastX = e.clientX;
    camState.lastY = e.clientY;
    camState.rotY += dx * 0.4;
    camState.rotX -= dy * 0.4;
    camState.rotX = Math.max(-80, Math.min(80, camState.rotX));
    updateCapsule3DTransform();
  });

  window.addEventListener('mouseup', () => { camState.dragging = false; });

  // 滾輪縮放
  vp.addEventListener('wheel', e => {
    e.preventDefault();
    camState.scale -= e.deltaY * 0.001;
    camState.scale = Math.max(0.4, Math.min(1.8, camState.scale));
    updateCapsule3DTransform();
  }, { passive: false });
}

function initKeyboardControls(wrapperId, camState) {
  window.addEventListener('keydown', e => {
    if (state.currentScreen !== 'capsule') return;
    const spd = 3;
    switch (e.key.toUpperCase()) {
      case 'W': camState.rotX -= spd; break;
      case 'S': camState.rotX += spd; break;
      case 'A': camState.rotY -= spd; break;
      case 'D': camState.rotY += spd; break;
      case 'Q': camState.scale -= 0.05; break;
      case 'E': camState.scale += 0.05; break;
      case 'R': camState.rotX = -25; camState.rotY = 20; camState.scale = 0.9; break;
      default: return;
    }
    camState.rotX = Math.max(-80, Math.min(80, camState.rotX));
    camState.scale = Math.max(0.4, Math.min(1.8, camState.scale));
    updateCapsule3DTransform();
  });
}

// ==================== 技術名詞字典 ====================
function initGlossary() {
  renderGlossary('');
  $('glossary-search').addEventListener('input', e => renderGlossary(e.target.value));
}

function renderGlossary(query) {
  const q = query.toLowerCase();
  const list = $('glossary-list');
  list.innerHTML = '';
  const filtered = GLOSSARY_DATA.filter(g =>
    !q || g.zh.includes(q) || g.en.toLowerCase().includes(q) || g.meaning.includes(q)
  );
  filtered.forEach(g => {
    const div = document.createElement('div');
    div.className = 'glossary-item';
    div.setAttribute('role', 'listitem');
    div.innerHTML = `
      <div class="glossary-item-zh">${g.zh}</div>
      <div class="glossary-item-en">${g.en}</div>
      <span class="glossary-item-cat cat-${g.category}">${g.category}</span>
    `;
    div.addEventListener('click', () => openGlossaryModal(g));
    list.appendChild(div);
  });
  if (!filtered.length) {
    list.innerHTML = '<div class="no-selection-msg">找不到相符名詞</div>';
  }
}

function openGlossaryModal(g) {
  $('glossary-modal-title').textContent = `${g.zh} / ${g.en}`;
  $('glossary-modal-body').innerHTML = `
    <div class="ldc-name">${g.zh}</div>
    <div class="ldc-en">${g.en}</div>
    <p style="margin-top:10px;font-size:12px;color:var(--text-dim);line-height:1.8;">${g.meaning}</p>
    <div style="margin-top:12px;">
      <span class="glossary-item-cat cat-${g.category}" style="font-size:10px;">${g.category}</span>
    </div>
  `;
  $('glossary-modal-overlay').hidden = false;
}

function initGlossaryModal() {
  $('glossary-modal-close').addEventListener('click', () => {
    $('glossary-modal-overlay').hidden = true;
  });
  $('glossary-modal-overlay').addEventListener('click', e => {
    if (e.target === $('glossary-modal-overlay')) $('glossary-modal-overlay').hidden = true;
  });
}

// ==================== B. 彩色架構 3D ====================
function initColorArch() {
  const grid = $('color-arch-grid');
  grid.innerHTML = '';
  COLOR_ARCHS.forEach(arch => {
    const card = document.createElement('div');
    card.className = 'color-arch-card';
    card.setAttribute('role', 'listitem');
    card.id = `arch-card-${arch.id}`;

    // 建立 3D 層疊
    let stackHTML = '';
    let zOff = 0;
    [...arch.layers3d].reverse().forEach((l, i) => {
      zOff = i * 20;
      const hw = 140, hh = l.h / 2;
      stackHTML += `
        <div style="position:absolute;transform-style:preserve-3d;transform:translateZ(${zOff}px)">
          ${make3DBox(280, l.h, 18, l.color, l.border)}
          <div style="position:absolute;left:-70px;top:${-hh}px;transform:translateZ(10px);
            font-family:'Share Tech Mono',monospace;font-size:8px;color:${arch.accent};
            white-space:nowrap;opacity:0.8">${l.label}</div>
        </div>
      `;
    });

    const specBadges = arch.specs.map(s =>
      `<span class="arch-spec-badge" style="color:${s.color};border-color:${s.color}40;">${s.label}: <strong>${s.value}</strong></span>`
    ).join('');

    card.innerHTML = `
      <div class="card-3d-viewport">
        <div class="card-scene">
          <div class="card-3d-stack" id="stack-${arch.id}" style="transform:rotateX(-22deg) rotateY(18deg) scale(0.75)">
            ${stackHTML}
          </div>
        </div>
      </div>
      <div class="card-info">
        <div class="card-arch-name" style="color:${arch.accent}">${arch.name}</div>
        <div class="card-arch-en">${arch.en}</div>
        <div class="card-arch-specs">${specBadges}</div>
        <div class="card-arch-desc">${arch.desc}</div>
        <div class="card-hover-hint">→ 點擊查看詳細規格</div>
      </div>
    `;
    card.addEventListener('click', () => showColorDetail(arch));
    grid.appendChild(card);
  });

  $('color-detail-close').addEventListener('click', () => {
    $('color-detail-panel').hidden = true;
    document.querySelectorAll('.color-arch-card').forEach(c => c.classList.remove('active'));
  });
}

function showColorDetail(arch) {
  document.querySelectorAll('.color-arch-card').forEach(c => c.classList.remove('active'));
  const card = $(`arch-card-${arch.id}`);
  if (card) card.classList.add('active');

  $('color-detail-title').textContent = `// ${arch.name} — ${arch.en}`;
  $('color-detail-title').style.color = arch.accent;

  const prosItems = arch.pros.map(p => `<div class="pros-item">${p}</div>`).join('');
  const consItems = arch.cons.map(c => `<div class="cons-item">${c}</div>`).join('');

  $('color-detail-body').innerHTML = `
    <p style="font-size:12px;color:var(--text-dim);line-height:1.8;margin-bottom:14px;">${arch.desc}</p>
    <div class="detail-pros-cons">
      <div class="pros-col">
        <div class="pros-title">✦ 優點</div>
        ${prosItems}
      </div>
      <div class="cons-col">
        <div class="cons-title">▲ 限制</div>
        ${consItems}
      </div>
    </div>
  `;

  $('color-detail-panel').hidden = false;
}

// ==================== C. 技術演進時光軸 ====================
function initTimeline() {
  const track = $('timeline-track');
  track.innerHTML = '';

  TIMELINE_DATA.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = `timeline-card cat-${item.category}`;
    card.dataset.cat = item.category;
    card.setAttribute('role', 'listitem');
    card.style.animationDelay = `${i * 0.06}s`;
    card.innerHTML = `
      <div class="tl-year">${item.year} <span class="tl-cat-badge cat-${item.category}">${{ bw:'⬜ 黑白', color:'🎨 彩色', key:'⭐ 關鍵' }[item.category]}</span></div>
      <div class="tl-title">${item.title}</div>
      <div class="tl-desc">${item.desc}</div>
      <a class="tl-citation" href="${item.link}" target="_blank" rel="noopener">${item.citation} ↗</a>
    `;
    track.appendChild(card);
  });

  // 篩選按鈕
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      state.timeline.filter = f;
      filterTimeline(f);
    });
  });
}

function filterTimeline(filter) {
  document.querySelectorAll('.timeline-card').forEach(card => {
    card.hidden = (filter !== 'all' && card.dataset.cat !== filter);
  });
}

// ==================== D. 系統拓撲 ====================
function initSystem() {
  renderSystem('local');

  $('btn-local').addEventListener('click', () => {
    document.querySelectorAll('.sys-btn').forEach(b => b.classList.remove('active'));
    $('btn-local').classList.add('active');
    renderSystem('local');
    state.system.arch = 'local';
  });

  $('btn-cloud').addEventListener('click', () => {
    document.querySelectorAll('.sys-btn').forEach(b => b.classList.remove('active'));
    $('btn-cloud').classList.add('active');
    renderSystem('cloud');
    state.system.arch = 'cloud';
  });
}

function renderSystem(arch) {
  const nodes = arch === 'local' ? SYSTEM_LOCAL : SYSTEM_CLOUD;
  const container = $('system-3d-container');
  const legend = $('system-legend');
  container.innerHTML = '';
  legend.innerHTML = '';

  nodes.forEach((node, i) => {
    const el = document.createElement('div');
    el.className = 'sys-node';
    el.style.cssText = `
      position: absolute;
      left: ${node.x}; top: ${node.y};
      transform: translateX(-50%) translateY(-50%);
      animation: fade-in-up 0.3s ${i * 0.07}s both;
    `;
    el.innerHTML = `
      <div class="sys-box" style="width:${node.w}px;border-color:${node.bdrColor};box-shadow:0 0 15px ${node.bdrColor};">
        <div class="sys-box-name" style="color:${node.color}">${node.label}</div>
        <div class="sys-box-sub" style="color:rgba(255,255,255,0.3)">${node.sub}</div>
      </div>
    `;
    container.appendChild(el);
  });

  // 圖例
  const legendItems = arch === 'local'
    ? [{ color: '#4488ff', label: '手機端' }, { color: '#00e5ff', label: 'BLE 通訊' }, { color: '#00ff88', label: '主控 MCU' }, { color: '#ff7700', label: '顯示驅動' }, { color: '#c8d8f0', label: 'E Ink 面板' }]
    : [{ color: '#4488ff', label: '雲端服務' }, { color: '#00e5ff', label: 'Wi-Fi / BLE' }, { color: '#00ff88', label: '輕量 MCU' }, { color: '#ff7700', label: '顯示驅動' }, { color: '#c8d8f0', label: 'E Ink 面板' }];

  legendItems.forEach(item => {
    legend.innerHTML += `
      <div class="legend-item">
        <div class="legend-dot" style="background:${item.color};border-color:${item.color}"></div>
        <span>${item.label}</span>
      </div>
    `;
  });

  // 架構說明
  const note = arch === 'local'
    ? '本地運算：BLE 接收畫面資料 → MCU 在裝置端處理 → 驅動 IC → E Ink 面板。功耗低，適合 ESL 與電子書。'
    : '雲端外移：雲端執行 AI 推論、歷史儲存與同步 → Wi-Fi / BLE 傳輸渲染結果 → 輕量 MCU → E Ink 面板。Wi-Fi 峰值電流 50–100 mA（遠高於 BLE 的 15 mA），待機亦需 1–5 mA。';
  container.insertAdjacentHTML('beforeend', `
    <div style="position:absolute;bottom:10px;left:0;right:0;text-align:center;font-family:'Share Tech Mono',monospace;font-size:9px;color:rgba(0,229,255,0.4);padding:0 20px;">${note}</div>
  `);
}

// ==================== E. 電源計算機 ====================
function initPower() {
  // 初始算一次
  calcPower();

  // 綁定控制
  document.querySelectorAll('[data-comm]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-comm]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.power.comm = btn.dataset.comm;
      calcPower();
    });
  });

  document.querySelectorAll('[data-size]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-size]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.power.size = btn.dataset.size;
      calcPower();
    });
  });

  $('param-updates').addEventListener('input', () => {
    state.power.updates = parseInt($('param-updates').value);
    $('val-updates').textContent = state.power.updates;
    calcPower();
  });

  $('param-battery').addEventListener('input', () => {
    state.power.battery = parseInt($('param-battery').value);
    $('val-battery').textContent = state.power.battery;
    calcPower();
  });

  // 情境預設
  $('preset-esl').addEventListener('click', () => {
    setPreset('esl');
  });
  $('preset-reader').addEventListener('click', () => {
    setPreset('reader');
  });
  $('preset-signage').addEventListener('click', () => {
    setPreset('signage');
  });
}

function setPreset(preset) {
  document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  $(`preset-${preset}`).classList.add('active');

  if (preset === 'esl') {
    state.power.comm = 'ble'; state.power.updates = 8; state.power.size = 'small'; state.power.battery = 220;
  } else if (preset === 'reader') {
    state.power.comm = 'ble'; state.power.updates = 50; state.power.size = 'medium'; state.power.battery = 1500;
  } else if (preset === 'signage') {
    state.power.comm = 'wifi'; state.power.updates = 48; state.power.size = 'large'; state.power.battery = 5000;
  }

  // 同步 UI
  document.querySelectorAll('[data-comm]').forEach(b => b.classList.toggle('active', b.dataset.comm === state.power.comm));
  document.querySelectorAll('[data-size]').forEach(b => b.classList.toggle('active', b.dataset.size === state.power.size));
  $('param-updates').value = state.power.updates;
  $('val-updates').textContent = state.power.updates;
  $('param-battery').value = state.power.battery;
  $('val-battery').textContent = state.power.battery;
  calcPower();
}

function calcPower() {
  const { comm, updates, size, battery } = state.power;

  // 各功耗參數（mA）
  const epdRefreshCurrent = { small: 8, medium: 14, large: 22 }[size]; // 依尺寸
  const epdRefreshDuration = { small: 0.8, medium: 1.2, large: 2.0 }[size]; // 秒
  const commPeakCurrent = comm === 'ble' ? 15 : 75; // mA
  const commPeakDuration = comm === 'ble' ? 0.5 : 2.0; // 秒
  const commStandbyCurrent = comm === 'ble' ? 0.001 : 3; // mA

  // MCU 功耗
  const mcuActive = 8; // mA（處理時）
  const mcuSleep = 0.01; // mA（DeepSleep）

  // 每次更新耗電量（mAh）
  const secondsPerUpdate = (epdRefreshDuration + commPeakDuration + 0.5); // 大約花費秒數
  const updateEnergy =
    (epdRefreshCurrent * epdRefreshDuration / 3600) +
    (commPeakCurrent * commPeakDuration / 3600) +
    (mcuActive * secondsPerUpdate / 3600);

  // 每日待機耗電
  const sleepHoursPerDay = 24 - (secondsPerUpdate * updates / 3600);
  const standbyEnergy = commStandbyCurrent * sleepHoursPerDay + mcuSleep * 24;

  // 每日總耗電
  const dailyEnergy = updateEnergy * updates + standbyEnergy; // mAh
  const batteryLife = battery / dailyEnergy;

  // 更新顯示
  $('result-life').textContent = batteryLife > 1000
    ? `${(batteryLife / 365).toFixed(1)} 年`
    : `${batteryLife.toFixed(0)} 天`;
  $('result-life-sub').textContent = `電池容量 ${battery} mAh / 每日耗電 ${dailyEnergy.toFixed(2)} mAh`;
  $('result-daily').textContent = `${dailyEnergy.toFixed(2)} mAh`;

  // 功耗分解長條圖
  const total = updateEnergy * updates + standbyEnergy;
  const components = [
    { label: 'EPD 刷新', val: updateEnergy * updates, color: '#c8d8f0' },
    { label: comm === 'ble' ? 'BLE 通訊' : 'Wi-Fi 通訊', val: commPeakCurrent * commPeakDuration * updates / 3600, color: comm === 'ble' ? '#4488ff' : '#ff7700' },
    { label: 'MCU 運算', val: mcuActive * secondsPerUpdate * updates / 3600, color: '#00ff88' },
    { label: '通訊待機', val: commStandbyCurrent * sleepHoursPerDay, color: comm === 'ble' ? '#224488' : '#883300' },
    { label: 'MCU 休眠', val: mcuSleep * 24, color: '#115522' }
  ];

  const bars = $('breakdown-bars');
  bars.innerHTML = '';
  components.forEach(comp => {
    const pct = Math.min(100, (comp.val / total * 100)).toFixed(1);
    bars.innerHTML += `
      <div class="bar-row">
        <div class="bar-label">${comp.label}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%;background:${comp.color};box-shadow:0 0 8px ${comp.color}50"></div>
        </div>
        <div class="bar-val">${comp.val.toFixed(3)} mAh (${pct}%)</div>
      </div>
    `;
  });
}

// ==================== 入口點 ====================
document.addEventListener('DOMContentLoaded', () => {
  // 導覽
  initNav();

  // 初始化各畫面（延遲，避免阻塞）
  initCapsule();
  initColorArch();
  initTimeline();
  initSystem();
  initPower();
  initGlossaryModal();

  // Layer modal 關閉
  $('layer-modal-close').addEventListener('click', () => $('layer-modal-overlay').hidden = true);
  $('layer-modal-overlay').addEventListener('click', e => {
    if (e.target === $('layer-modal-overlay')) $('layer-modal-overlay').hidden = true;
  });

  // 終端機初始化訊息動畫（彩蛋）
  console.log('%c E INK 3D EXPLORER LOADED ', 'background:#00e5ff;color:#04070f;font-family:monospace;font-size:14px;padding:4px 8px;');
  console.log('%c 元太科技電子紙技術立體解說平台 v1.0', 'color:#00e5ff;font-family:monospace;');
});
