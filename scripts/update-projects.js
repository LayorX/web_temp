
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import 'dotenv/config';
import { execSync } from 'child_process';

// --- 檔案路徑設定 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT_DIR, 'public', 'show');
const METADATA_PATH = path.join(ROOT_DIR, 'metadata.json');

// --- Gemini API 設定 ---
const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// --- 輔助函式 ---

async function readJsonFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return {};
        throw error;
    }
}

async function callGeminiAPI(prompt) {
    if (!API_KEY) {
        console.error('錯誤: 找不到 GEMINI_API_KEY 環境變數。');
        return null;
    }
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" },
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`Google API 請求失敗: ${response.status}`, errorBody);
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

// --- 核心 Metadata 生成函式 ---

// 「暴力破解」模式: 從頭分析整個檔案
async function generateMetadata(htmlContent) {
    const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const contentToAnalyze = bodyMatch ? bodyMatch[1] : htmlContent;
    console.log('💥 「暴力破解」模式:');
    console.log(contentToAnalyze.substring(0, 500));
    const prompt = `
        請分析以下 HTML 內容，為其生成一個簡潔且吸引人的專案介紹。

        HTML 內容:
        \`\`\`html
        ${contentToAnalyze.substring(0, 4000)}
        \`\`\`

        請提供一個 JSON 物件，包含 "name" (string, 最多15字), "desc" (string, 最多80字), "tags" (string[], 3個關鍵字)。
        請直接回傳格式正確的 JSON 物件，不要包含任何額外的解釋或 markdown 格式。
    `;
    return callGeminiAPI(prompt);
}

// 「手術刀」模式: 根據差異潤飾現有元數據
async function generateRefinedMetadata(oldMetadata, htmlDiff) {
    console.log('「手術刀」模式:');
    console.log(oldMetadata);
    console.log(htmlDiff);
    console.log('=======================================');

    const prompt = `
        作為一個產品文案專家，請根據一個 HTML 檔案的內容變動，來優化它的元數據。

        這是【舊的元數據】:
        \`\`\`json
        ${JSON.stringify(oldMetadata, null, 2)}
        \`\`\`

        這是【HTML 檔案的變動內容】(以 diff 格式呈現):
        \`\`\`diff
        ${htmlDiff.substring(0, 4000)}
        \`\`\`

        任務: 
        請在舊元數據的基礎上，進行細微但精準的潤飾，以反映 HTML 的變動。
        - 如果變動很小 (例如修正錯字)，則稍微調整文字使其更通順即可。
        - 如果變動增加了新功能，則在描述中簡要體現出來。
        - 保持風格和語氣的一致性。

        JSON 物件，包含 "name" (string, 最多15字), "desc" (string, 最多80字), "tags" (string[], 3個關鍵字)。

        請回傳一個【優化後】的 JSON 物件，包含 "name", "desc", "tags"。格式需與舊元數據一致。
        請直接回傳格式正確的 JSON 物件，不要包含任何額外的解釋或 markdown 格式。
    `;
    return callGeminiAPI(prompt);
}

// --- Git 變動分析函式 ---

function getChangedFiles() {
    // 獲取 HEAD 與其前一個 commit 之間的差異
    const output = execSync('git diff --name-status HEAD~1 HEAD').toString();
    const files = output.split('\n').filter(Boolean).map(line => {
        const [status, filePath] = line.split('\t');
        return { status, filePath };
    });
    return files.filter(f => f.filePath && f.filePath.startsWith('public/show/'));
}

function getDiffLineCount(filePath) {
    const output = execSync(`git diff --numstat HEAD~1 HEAD -- ${filePath}`).toString();
    const match = output.match(/^(\d+)\s+(\d+)/);
    return match ? parseInt(match[1]) + parseInt(match[2]) : 0;
}

// --- 主執行函式 ---

async function main() {
    console.log('🚀 開始執行差異化專案更新腳本...');
    const metadata = await readJsonFile(METADATA_PATH);
    const changedFiles = getChangedFiles();

    if (changedFiles.length === 0) {
        console.log('✅ 沒有偵測到 public/show/ 中的檔案變動。');
        return;
    }

    let hasChanges = false;

    for (const { status, filePath } of changedFiles) {
        const fileName = path.basename(filePath);
        console.log(`\n📄 偵測到 [${status}] 狀態的檔案: ${fileName}`);

        if (status === 'D') { // 檔案被刪除
            if (metadata[fileName]) {
                delete metadata[fileName];
                hasChanges = true;
                console.log(`🗑️ 已從 metadata.json 中移除 ${fileName}。`);
            }
            continue;
        }

        const htmlContent = await fs.readFile(filePath, 'utf8');
        let newMetadata = null;

        if (status === 'A') { // 新增的檔案
            console.log('✨ 此為新檔案，使用「暴力破解」模式生成全新元數據...');
            newMetadata = await generateMetadata(htmlContent);
        } else if (status === 'M') { // 修改的檔案
            const lineCount = getDiffLineCount(filePath);
            console.log(`📊 變動行數: ${lineCount}`);

            if (lineCount >= 10) {
                console.log('💥 變動較大，使用「暴力破解」模式重新生成元數據...');
                newMetadata = await generateMetadata(htmlContent);
            } else {
                console.log('🔪 變動較小，使用「手術刀」模式潤飾元數據...');
                const oldMetadata = metadata[fileName];
                if (oldMetadata) {
                    const htmlDiff = execSync(`git diff HEAD~1 HEAD -- ${filePath}`).toString();
                    newMetadata = await generateRefinedMetadata(oldMetadata, htmlDiff);
                } else {
                    console.warn(`⚠️ 找不到 ${fileName} 的舊元數據，將改用「暴力破解」模式。`);
                    newMetadata = await generateMetadata(htmlContent);
                }
            }
        }

        if (newMetadata) {
            metadata[fileName] = newMetadata;
            hasChanges = true;
            console.log(`💡 成功為 ${fileName} 生成/更新元數據。`);
        } else {
            console.warn(`⚠️ 未能為 ${fileName} 處理元數據。`);
        }
    }

    if (hasChanges) {
        await fs.writeFile(METADATA_PATH, JSON.stringify(metadata, null, 2), 'utf8');
        console.log('\n💾 成功將更新寫入 metadata.json！');
    } else {
        console.log('\n🤷‍♂️ 本次執行沒有對 metadata.json 產生任何變更。');
    }

    console.log('🎉 腳本執行完畢！');
}

main().catch(error => {
    console.error('\n💥 腳本執行過程中發生未預期的錯誤:', error);
    process.exit(1);
});
