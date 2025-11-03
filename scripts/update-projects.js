
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import 'dotenv/config';

// --- 檔案路徑設定 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..'); // 專案根目錄
const PROJECTS_DIR = path.join(ROOT_DIR, 'public', 'show');
const METADATA_PATH = path.join(ROOT_DIR, 'metadata.json');

// --- Gemini API 設定 ---
const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

/**
 * 讀取 JSON 檔案並回傳內容，若檔案不存在則回傳空物件。
 * @param {string} filePath - 檔案路徑
 * @returns {Promise<object>}
 */
async function readJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn(`警告: 找不到檔案 ${filePath}，將建立一個新的。`);
            return {};
        }
        throw error;
    }
}

/**
 * 使用 Gemini API 為 HTML 內容生成元數據。
 * @param {string} htmlContent - HTML 檔案的內容
 * @returns {Promise<object|null>} - 包含 name, desc, tags 的物件
 */
async function generateMetadata(htmlContent) {
    if (!API_KEY) {
        console.error('錯誤: 找不到 GEMINI_API_KEY 環境變數。');
        return null;
    }

    // 提取 <body> 內容以減少 token 使用並聚焦重點
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const contentToAnalyze = bodyMatch ? bodyMatch[1] : htmlContent;

    const prompt = `
        請分析以下 HTML 內容，並以一個專業的產品經理的身份，為其生成一個簡潔且吸引人的專案介紹。
        你的目標是幫助訪客快速理解這個專案的核心價值。

        HTML 內容:
        \`\`\`html
        ${contentToAnalyze.substring(0, 3000)}
        \`\`\`

        請根據以上內容，提供一個 JSON 物件，包含以下三個鍵：
        1.  "name": (string) 一個簡潔、響亮的中文專案名稱 (最多15個字)。
        2.  "desc": (string) 一段引人入勝的中文描述 (最多60個字)，說明這個專案是什麼，解決了什麼問題。
        3.  "tags": (string[]) 一個包含3個相關中文關鍵字的陣列，便於分類。

        請直接回傳格式正確的 JSON 物件，不要包含任何額外的解釋或 markdown 格式。
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                }
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Google API 請求失敗: ${response.status} ${response.statusText}`, errorBody);
            return null;
        }

        const data = await response.json();
        const jsonString = data.candidates[0].content.parts[0].text;
        return JSON.parse(jsonString);

    } catch (error) {
        console.error('呼叫 Gemini API 時發生錯誤:', error);
        return null;
    }
}

/**
 * 主執行函式
 */
async function main() {
    console.log('🚀 開始執行專案自動更新腳本...');

    // 1. 讀取現有元數據和專案檔案
    const metadata = await readJsonFile(METADATA_PATH);
    const projectFiles = await fs.readdir(PROJECTS_DIR);
    const htmlFiles = projectFiles.filter(file => file.endsWith('.html'));

    // 2. 找出新的專案檔案
    const newFiles = htmlFiles.filter(file => !metadata[file]);

    if (newFiles.length === 0) {
        console.log('✅ 沒有偵測到新的專案檔案，無需更新。');
        return;
    }

    console.log(`🔍 偵測到 ${newFiles.length} 個新專案，開始處理...`);
    let updatedCount = 0;

    // 3. 為每個新檔案生成元數據並更新
    for (const file of newFiles) {
        console.log(`📄 正在處理檔案: ${file}`);
        const filePath = path.join(PROJECTS_DIR, file);
        const htmlContent = await fs.readFile(filePath, 'utf8');

        console.log('🧠 正在呼叫 Gemini API 生成元數據...');
        const newMetadata = await generateMetadata(htmlContent);

        if (newMetadata && newMetadata.name && newMetadata.desc && newMetadata.tags) {
            metadata[file] = newMetadata;
            updatedCount++;
            console.log(`✨ 成功生成元數據:`);
            console.log(`   - 名稱: ${newMetadata.name}`);
            console.log(`   - 描述: ${newMetadata.desc}`);
            console.log(`   - 標籤: [${newMetadata.tags.join(', ')}]`);
        } else {
            console.warn(`⚠️ 無法為 ${file} 生成元數據，將跳過此檔案。`);
        }
    }

    // 4. 如果有更新，則寫回 metadata.json
    if (updatedCount > 0) {
        await fs.writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf8');
        console.log(`💾 成功將 ${updatedCount} 個新專案的元數據寫入 metadata.json！`);
        console.log('🎉 自動化更新完成！');
    } else {
        console.log(`🤷‍♂️ 本次執行沒有成功更新任何專案的元數據。`);
    }
}

main().catch(error => {
    console.error('\n💥 腳本執行過程中發生未預期的錯誤:', error);
    process.exit(1);
});
