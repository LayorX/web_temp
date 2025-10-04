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
// 假設您的 /show/ 目錄位於伺服器應用的根目錄
const PROJECTS_DIR = path.join(__dirname, 'show');

// 啟用 CORS，允許前端 (Canvas) 進行跨域請求
app.use(cors());
app.use(express.json());

// 托管根目錄下的靜態檔案 (例如 index.html 和 show/ 資料夾)
app.use(express.static(__dirname));

// --- 輔助函式：根據檔名產生專案元數據 ---
// 在真實應用中，您可能需要從資料庫或 JSON 文件中讀取這些數據
function generateProjectMetadata(filename) {
    const nameMap = {
        'chat-capsule.html': { name: "時間膠囊聊天室", desc: "一個具備時間戳記的即時通訊應用。", tags: ["Realtime", "Firebase"] },
        'reactor-game.html': { name: "反應堆小遊戲", desc: "基於速度與反射力的極簡主義小遊戲。", tags: ["Game", "Canvas"] },
        'three-planet.html': { name: "3D星球生成器", desc: "使用 Three.js 製作的互動式 3D 體驗。", tags: ["3D", "WebGPU"] },
        'todo-firestore.html': { name: "待辦清單 (Firestore)", desc: "具備雲端同步功能的任務管理工具。", tags: ["Data", "Storage"] },
        'color-spectrum.html': { name: "光譜配色生成器", desc: "探索動態色彩理論與優雅的配色方案。", tags: ["Design", "Utility"] },
    };
    
    // 如果是新的或未知的檔案，提供預設元數據
    return nameMap[filename] || {
        name: filename.replace('.html', '').replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        desc: "這是一個新的互動式專案。",
        tags: ["New", "HTML"]
    };
}

// --- API 端點: /api/projects ---
app.get('/api/projects', async (req, res) => {
    try {
        console.log(`Scanning directory: ${PROJECTS_DIR}`);
        
        // 讀取目錄內容
        const files = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });

        // 過濾出所有以 .html 結尾的檔案
        const projectFiles = files
            .filter(dirent => dirent.isFile() && dirent.name.endsWith('.html'))
            .map(dirent => {
                const metadata = generateProjectMetadata(dirent.name);
                return {
                    filename: dirent.name,
                    ...metadata
                };
            });
        
        // 成功回傳 JSON 格式的檔案列表
        res.json(projectFiles);

    } catch (error) {
        // 如果目錄不存在 (ENOENT)，回傳空列表或錯誤訊息
        if (error.code === 'ENOENT') {
            console.warn(`[WARN] Project directory not found at: ${PROJECTS_DIR}`);
            return res.status(200).json([]); // 目錄不存在，回傳空列表
        }
        
        console.error('[ERROR] Failed to scan project directory:', error);
        res.status(500).json({ error: 'Failed to scan project directory' });
    }
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoint: /api/projects`);
});
