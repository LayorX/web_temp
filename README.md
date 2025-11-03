[English Version](./README.en.md)

# 晝夜協奏曲 - 自動化 HTML 專案展示平台

<img src="images/banner_.png" alt="Project Banner" style="border-radius: 10px; margin-top: 10px; margin-bottom: 10px;width: 350px; height: 300px;">

## 🚀 線上展示 (Live Demo)

[**點擊此處查看線上展示**](https://show.zeabur.app/)

---

本專案的核心目標是提供一個**簡單、快速、自動化**的解決方案，讓你上傳的 HTML 專案能夠被即時展示和管理。它不僅是一個互動式作品集，更是一個實踐 CI/CD、安全 API 代理和 AI 自動化元數據管理的現代 Web 開發範例。

## ✨ 專案概述

本專案的核心是一個名為「晝夜協奏曲」的雙主題互動式網站。它最大的特色是其**自動化流程**：你只需要將新的 HTML 專案檔案推送到 GitHub 倉庫，後續的元數據（如專案名稱、描述）生成、列表更新等工作都將由 AI 和 GitHub Actions 自動完成。

**主要功能：**

- **自動化專案展示**：只需上傳 HTML 檔案，無需任何手動設定，專案即可在主頁的動態中心以卡片形式呈現。
- **AI 驅動的元數據**：透過 GitHub Actions，在程式碼推送時自動分析 HTML 檔案內容，並利用 Gemini API 智能生成專案的名稱、描述和標籤。
- **雙主題 UI**：提供日、夜兩種完全不同的視覺與聽覺體驗。
- **安全的後端代理**：內建一組後端 API，安全地將前端請求代理到 Google Gemini API，保護你的 API Key 不在前端洩漏。

---

## 🛠️ 架構說明

本專案採用前後端分離的架構，並透過 GitHub Actions 實現了高度自動化的 CI/CD 流程。

### **前端 (Frontend)**

- **技術棧**：原生 HTML, CSS, 和 JavaScript。
- **核心頁面**：`public/index.html` 是唯一的入口，它是一個單頁應用 (SPA) 風格的頁面，負責動態載入和渲染專案列表。

### **後端 (Backend)**

- **技術棧**：[Node.js](https://nodejs.org/) 搭配 [Express.js](https://expressjs.com/) 框架。
- **功能**：提供靜態檔案服務、專案列表 API (`/api/projects`)，以及一個安全的 Gemini 代理 API (`/api/proxy/*`)。

### **自動化 (Automation)**

- **技術棧**：[GitHub Actions](https://github.com/features/actions) 搭配 Node.js 腳本 (`scripts/update-projects.js`)。
- **流程**：當 `main` 分支有新的 `push` 時，工作流程會自動分析變動的 HTML 檔案，調用 Gemini API 更新元數據，並將結果推送回倉庫。

---

## 🚀 安裝指南

請依照以下步驟在本機環境中設定並運行此專案。

1.  **複製儲存庫**
    ```bash
    git clone https://github.com/LayorX/web_temp.git
    cd web_temp
    ```

2.  **安裝依賴**
    ```bash
    npm install
    ```

3.  **設定環境變數**
    在專案根目錄下建立一個名為 `.env` 的檔案，並填入你的 Google Gemini API Key。
    ```
    # .env
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
    ```

4.  **啟動伺服器**
    ```bash
    npm start
    ```

5.  **訪問應用**
    打開你的瀏覽器，訪問 `http://localhost:3000`。

---

## ☁️ 部署

### **部署到 Zeabur**

本專案可以輕鬆地一鍵部署到 [Zeabur](https://zeabur.com/)。

1.  **Fork 本專案** 到你自己的 GitHub 帳戶。
2.  在你的 Zeabur 儀表板中，點擊「新增服務 (Add Service)」，並選擇從 GitHub 匯入。
3.  選擇你剛剛 fork 的儲存庫，Zeabur 將會自動偵測到這是一個 Node.js 專案並進行部署。
4.  部署完成後，進入該服務的「變數 (Variables)」分頁，點擊「新增變數 (Add Variable)」。
5.  建立一個名為 `GEMINI_API_KEY` 的變數，並將你的 Gemini API Key 貼入值欄位中。
6.  Zeabur 會自動重新部署以應用新的環境變數。完成後，你的專案即可透過 Zeabur 提供的公開網址訪問。

---

## 📖 使用方式

本專案的核心是「Git-based」的自動化流程。

1.  在 `public/show/` 資料夾中新增或修改你的 `.html` 專案檔案。
2.  將你的變更 `commit` 並 `push` 到 `main` 分支。
3.  等待幾分鐘，讓 GitHub Action 自動完成元數據的生成與更新。
4.  重新整理你的網站，新的專案或變更就會出現在主頁上。

---

## 🤝 貢獻指南

關於如何為本專案做出貢獻，詳情請見 [CONTRIBUTING.md](./CONTRIBUTING.md) 檔案。

---

## 📄 授權資訊

本專案採用 MIT 授權。詳情請見 [LICENSE](./LICENSE) 檔案。
