# 專案工作日誌 (GEMINI.MD)

**最後更新日期:** 2025年11月4日

> **重要提醒：** 為了確保資訊同步與順利交接，每次對本專案進行重要修改後，請務必更新此文件中的「專案當前狀態」與「注意事項」。

---

## 專案當前狀態

- **版本控制:** 程式碼已更新，準備提交。
- **主要變更:** 
    1. **建立詳細 README.md**: 撰寫了一份全面的 `README.md` 文件，涵蓋專案概述、架構、安裝、使用方式等，大幅提升專案的可讀性和易用性。
    2. **API 測試頁面修正**: 
        - 修復了 `api test key test.html` 中因 API 連續回傳 429 錯誤而導致頁面崩潰的 bug。
        - 實現了「default api」選項，使其安全地透過後端 `/api/proxy/text` 端點來使用伺服器環境變數中的 API Key。
    3. **後端代理升級**: 更新了 `server.js` 中的代理邏輯，使其能處理完整的對話歷史，而不僅僅是單一的 prompt。
    4. **CI/CD 架構強化**: 優化了 `.github/workflows/auto-update-metadata.yml`，加入了防止無限循環的 `[skip ci]` 機制和併發控制，使其更穩健。
    5. **自動化腳本重構**: 完全重構了 `scripts/update-projects.js`，使其能根據 `git diff` 的結果，智能地區分「新增」、「刪除」和「修改」操作，並對修改採用差異化（小於10行潤飾/大於10行重寫）的 AI 更新策略。
- **部署狀態:** 專案已準備好推送到 GitHub。

---

## 專案架構

本專案採用 Node.js/Express 後端搭配動態 HTML 前端的架構，並透過 GitHub Actions 實現了高度自動化的 CI/CD 流程。

### 檔案結構

- `README.md`: **(新)** 全面的專案說明文件。
- `/public`: **唯一對外公開的資料夾**。
    - `index.html`: **(核心) 動態專案中心**，展示所有專案並提供搜尋功能。
    - `/show/...`: 所有動態連結的 HTML 專案頁面都存放在此。
- `server.js`: 後端伺服器主程式，處理 API 請求與檔案服務。
- `metadata.json`: **專案描述的中央資料庫**（由 CI/CD 自動維護）。
- `scripts/update-projects.js`: **(核心自動化腳本)** 偵測 git 變動並調用 AI 更新元數據。
- `.github/workflows/auto-update-metadata.yml`: **(核心 CI/CD 流程)** 定義了自動化更新元數據的完整流程。
- `GEMINI.MD`: **本工作日誌**。

---

## 主要功能

1.  **動態專案中心:** 主頁 (`index.html`) 能自動偵測 `public/show` 中的所有專案，並以互動式卡片網格呈現。
2.  **智能元數據自動化:** 推送程式碼時，GitHub Actions 會自動分析變動的 HTML 檔案，並透過 Gemini API 智能更新 `metadata.json` 中的專案名稱、描述和標籤。
3.  **安全的 API 代理:** 前端可透過 `/api/proxy/*` 端點安全地使用後端設定的 API Key，無需在瀏覽器端暴露任何敏感金鑰。

---

## 注意事項與未來任務

1.  **如何新增/更新專案:** 
    - 只需在 `public/show` 中新增或修改 `.html` 檔案，然後將變更推送到 `main` 分支即可。CI/CD 流程會自動處理後續所有 `metadata.json` 的更新。

2.  **API 金鑰設定:**
    - **本地開發:** 需在根目錄建立 `.env` 檔案並填寫 `GEMINI_API_KEY`。
    - **GitHub 部署:** 需在儲存庫的 `Settings > Secrets and variables > Actions` 中設定一個名為 `GEMINI_API_KEY` 的 Repository secret。

3.  **維護此文件:**
    - **請在每次修改專案後，記得更新此文件**，以利團隊協作和未來維護。
