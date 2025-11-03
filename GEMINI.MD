# 專案工作日誌 (GEMINI.MD)

**最後更新日期:** 2025年11月4日

> **重要提醒：** 為了確保資訊同步與順利交接，每次對本專案進行重要修改後，請務必更新此文件中的「專案當前狀態」與「注意事項」。

---

## 專案當前狀態

- **版本控制:** 程式碼已更新並提交。
- **主要變更:** 
    1. **`index.html` 重構:** 主頁已從靜態入口頁面完全重構為一個動態的「專案集線器」(Projects Hub)。
    2. **核心功能:** 現在主頁會直接從 `/api/projects` 加載所有專案，並以卡片形式呈現。
    3. **互動提升:** 新增了即時搜尋功能，允許使用者快速篩選專案。
    4. **程式碼清理:** 移除了舊的、不再使用的彈出視窗 (modal) 相關的 HTML、CSS 和 JavaScript。
- **部署狀態:** 專案已準備好推送到 GitHub。

---

## 專案架構

本專案採用 Node.js/Express 後端搭配動態 HTML 前端的架構。

### 檔案結構

- `/public`: **唯一對外公開的資料夾**。
    - `index.html`: **(核心) 動態專案中心**，展示所有專案並提供搜尋功能。
    - `/show/...`: 所有動態連結的 HTML 專案頁面都存放在此。
    - `/js/api-client.js`: 用於呼叫後端 Gemini API 代理的共用 JavaScript 函式庫。
- `server.js`: 後端伺服器主程式，處理 API 請求與檔案服務。
- `metadata.json`: **專案描述的中央資料庫**。
- `package.json`: Node.js 專案定義檔。
- `GEMINI.MD`: **本工作日誌**。

### 後端 (server.js)

- **靜態服務:** 只將 `public` 資料夾作為靜態資源目錄對外提供服務。
- **專案列表 API (`/api/projects`):** 動態列出 `public/show` 中的專案並結合 `metadata.json` 的內容。
- **Gemini 代理 API (`/api/proxy/*`):** 提供 `/image`, `/text`, `/tts` 三個路由，安全地將前端請求轉發至 Google API。

---

## 主要功能

1.  **動態專案中心:** 主頁 (`index.html`) 能自動偵測 `public/show` 中的所有專案，並以互動式卡片網格呈現。
2.  **即時專案搜尋:** 使用者可以在主頁上透過關鍵字即時搜尋和篩選專案。
3.  **集中化元數據管理:** 所有專案的顯示名稱、描述和標籤都統一在 `metadata.json` 中管理。
4.  **安全的 API 呼叫:** 透過後端代理模式，保護 API Key 不會在前端洩漏。
5.  **可重用的 API 客戶端:** 提供 `api-client.js`，讓任何 HTML 頁面都能輕鬆、安全地使用 Gemini API 功能。

---

## 注意事項與未來任務

1.  **如何在新的 HTML 檔案中使用 Gemini API:**
    - 在您的新 HTML 檔案中，於 `</body>` 標籤前引入共用函式庫：
      ```html
      <script src="/js/api-client.js"></script>
      ```
    - 引入後，您就可以在自己的 `<script>` 標籤中直接呼叫 `callImageGenerationAPI`, `callTextGenerationAPI`, `callTTSAPI` 等函式。

2.  **如何新增專案:**
    - 在 `public/show` 中新增您的 HTML 檔案。
    - 編輯根目錄的 `metadata.json` 檔案，為新專案加入對應的名稱、描述與標籤。
    - 主頁的專案中心將會自動偵測並顯示您的新專案。

3.  **[安全警告] API 金鑰:**
    - 專案中仍有 `TKVv0_old.html` 檔案包含舊的 API Key 邏輯，雖然目前未使用，但未來若要重新啟用，建議比照 `api-client.js` 的模式進行重構。

4.  **維護此文件:**
    - **請在每次修改專案後，記得更新此文件**，以利團隊協作和未來維護。