import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors'; 
import { fileURLToPath } from 'url';

// 設置 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 只托管 'public' 目錄下的靜態檔案
const PUBLIC_DIR = path.join(__dirname, 'public');
app.use(express.static(PUBLIC_DIR));

// 更新 PROJECTS_DIR 以指向 public/show
const PROJECTS_DIR = path.join(PUBLIC_DIR, 'show');

const METADATA_PATH = path.join(__dirname, '..', 'metadata.json');
let projectMetadata = {};

// --- 輔助函式：在伺服器啟動時讀取元數據 ---
async function loadMetadata() {
    try {
        const data = await fs.readFile(METADATA_PATH, 'utf8');
        projectMetadata = JSON.parse(data);
        console.log('成功載入 metadata.json');
    } catch (error) {
        console.error('無法讀取或解析 metadata.json:', error);
        // 在元數據載入失敗時，可以選擇提供一個空的預設值
        projectMetadata = {};
    }
}

// --- API 端點: /api/projects ---
app.get('/api/projects', async (req, res) => {
    try {
        const files = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });

        const projectFiles = files
            .filter(dirent => dirent.isFile() && dirent.name.endsWith('.html'))
            .map(dirent => {
                // 從載入的元數據中查找，如果找不到則提供預設值
                const metadata = projectMetadata[dirent.name] || {
                    name: dirent.name.replace('.html', ''),
                    desc: "一個新發現的專案。",
                    tags: ["New"]
                };
                return {
                    filename: dirent.name,
                    ...metadata
                };
            });
        
        res.json(projectFiles);

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn(`[WARN] 專案目錄找不到: ${PROJECTS_DIR}`);
            return res.status(200).json([]);
        }
        
        console.error('[ERROR] 掃描專案目錄失敗:', error);
        res.status(500).json({ error: '掃描專案目錄失敗' });
    }
});

// 啟動伺服器並預先載入元數據
app.listen(PORT, async () => {
    await loadMetadata(); // 在監聽前載入元數據
    console.log(`伺服器正在 http://localhost:${PORT} 上運行`);
    console.log(`API 端點: /api/projects`);
});
