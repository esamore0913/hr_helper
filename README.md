<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/7f8dfee6-f218-4bdc-9105-ba0f973824e0

## 專案操作指南

### 1. 本機執行
**環境要求:** 請先安裝 [Node.js](https://nodejs.org/)。*(目前系統尚未安裝 Node.js 或尚未加入環境變數中，需安裝後才能順利執行)*

1. 安裝套件：
   ```bash
   npm install
   ```
2. 設定環境變數：將 `.env.example` 複製並重新命名為 `.env.local`，並填入您的 `GEMINI_API_KEY`
3. 啟動專案：
   ```bash
   npm run dev
   ```

### 2. GitHub Action 部署
專案已設定好 GitHub Actions (路徑：`.github/workflows/deploy.yml`)。
- 當程式碼推送到 `main` 分支時，會自動觸發打包並部署到 **GitHub Pages**。
- **後續設定:** 請至 GitHub Repository 的 `Settings` -> `Pages`，將 Build and deployment 的 Source 設為 `GitHub Actions`。
- *注意: 如果您的專案位址包含 repo 名稱 (如 `https://<username>.github.io/<repo>/`)，請記得在 `vite.config.ts` 中加入 `base: '/<repo>/'`。*

### 3. Git 忽略檔 (.gitignore) 說明
已更新 `.gitignore`，過濾以下常見的無效或隱私檔案：
- `node_modules/`, `dist/` 等編譯與依賴檔案
- `.log` 等日誌檔
- `.env*` 等環境變數檔案，避免機密外洩 (僅保留 `.env.example` 供參考)
- `.vscode/`, `.DS_Store` 等編輯器與系統暫存檔
