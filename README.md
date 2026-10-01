# E Ink 3D 技術探索器 — E Ink 3D Explorer

> 以三維立體視角，完整解說元太科技 E Ink 電子紙全系列技術原理。

## 專案簡介

**E Ink 3D Explorer** 是一個以互動式 3D 視覺化方式，呈現 E Ink 電子紙所有核心技術的教育型網頁應用。靈感來自 Cyberpunk 風格的 HUD 三面板體驗設計，將電子紙的微觀結構（微膠囊、帶電粒子、TFT 背板）以有厚度、有立體感的 CSS 3D 形式呈現，並結合互動動畫說明每個技術概念。

## 技術資料來源

本專案所有技術資料均來自 `e ink yuantai` 專案的 `tech.md` 與 `app.js`，資料已根據以下更正補充：

1. **Spectra 6 刷新時間**：區分全彩刷新（~15 秒）與局部更新（數秒），避免誤導。
2. **Gallery 3 解析度**：強調黑白與彩色皆達 300 PPI（因無 CFA 濾光片）。
3. **運算外移功耗量化**：Wi-Fi 峰值 50-100 mA vs. BLE 峰值 15 mA；待機分別為 1-5 mA vs. &lt;1 µA。
4. **2026 法說會數據**：Spectra 6 出貨面積（非數量）超越黑白消費電子。

## 功能特色

- 3D 微膠囊解剖：CSS 3D 立體層疊展示 E Ink 微膠囊結構
- 帶電粒子動畫：即時模擬正負電場驅動黑白粒子移動的物理過程
- 四大彩色架構 3D 對比：Carta / Kaleido 3 / Gallery 3 / Spectra 6 立體層疊剖面圖
- 技術演進時光軸：1990-2026 里程碑 3D 卡片流
- 電源智慧計算機：BLE vs. Wi-Fi 功耗即時對比
- 系統拓撲 3D 展示：本地運算路徑 vs. 雲端運算架構立體圖

## 檔案結構

```
e-ink-3d-explorer/
├── index.html      # 主頁面（三面板 HUD 介面）
├── style.css       # 設計系統（Cyberpunk 暗色主題 + CSS 3D）
├── app.js          # 互動邏輯（3D 場景、動畫、資料）
├── .gitignore      # Git 忽略設定
└── README.md       # 本說明文件
```

## 本地開發

直接在瀏覽器開啟 `index.html` 即可，無需任何建置工具。

## GitHub Pages 部署

本專案為純靜態網頁，可直接部署至 GitHub Pages。

---

*本專案為 iT 邦幫忙鐵人賽 Vibe Coding 主題作品*
