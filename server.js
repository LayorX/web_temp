import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import cors from 'cors'; 
import { fileURLToPath } from 'url';
import 'dotenv/config'; // 載入 .env 檔案中的環境變數
import fetch from 'node-fetch'; // 用於在後端發送請求

// 設置 __dirname

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

const METADATA_PATH = path.join(__dirname, 'metadata.json');
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

// --- API 代理路由 ---

// 圖片生成代理
app.post('/api/proxy/image', async (req, res) => {
    const { prompt, model } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: '伺服器未設定 API 金鑰' });
    }

    let apiUrl, payload;
    if (model === 'imagen-3') {
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
        const [p, np] = prompt.split("Negative prompt:");
        payload = {
            instances: [{ prompt: p.trim(), negative_prompt: (np || "").trim() }],
            parameters: { "sampleCount": 1 }
        };
    } else {
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`;
        payload = {
            contents: [{ parts: [{ text: prompt.split("Negative prompt:")[0].trim() }] }],
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        };
    }

    try {
        const apiResponse = await fetch(apiUrl, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
        const data = await apiResponse.json();
        if (!apiResponse.ok) {
            console.error("Google API Error:", data);
            throw new Error(data.error?.message || 'Google API 請求失敗');
        }
        res.json(data);
    } catch (error) {
        console.error('圖片生成代理錯誤:', error);
        res.status(500).json({ error: error.message });
    }
});

// 文字生成代理
app.post('/api/proxy/text', async (req, res) => {
    // 直接從請求主體獲取 contents 和 generationConfig
    const { contents, generationConfig } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: '伺服器未設定 API 金鑰' });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    // 傳遞從客戶端收到的完整 payload
    const payload = { contents, generationConfig };

    try {
        const apiResponse = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await apiResponse.json();
        if (!apiResponse.ok) throw new Error(data.error?.message || 'Google API 請求失敗');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// TTS 代理
app.post('/api/proxy/tts', async (req, res) => {
    const { text } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: '伺服器未設定 API 金鑰' });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: `請用溫柔、富有磁性的年輕女性聲音朗讀以下內容：${text}` }] }],
        generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zubenelgenubi" } } } },
        model: "gemini-2.5-flash-preview-tts"
    };

    try {
        const apiResponse = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await apiResponse.json();
        if (!apiResponse.ok) throw new Error(data.error?.message || 'Google API 請求失敗');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 啟動伺服器並預先載入元數據
app.listen(PORT, async () => {
    await loadMetadata(); // 在監聽前載入元數據
    console.log(`伺服器正在 http://localhost:${PORT} 上運行`);
    console.log(`API 端點: /api/projects`);
});
