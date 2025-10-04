/**
 * @file api-client.js
 * @description 用於與後端 Gemini API 代理通訊的共用客戶端函式庫。
 */

/**
 * 呼叫後端代理以生成圖片。
 * @param {string} userPrompt - 用於生成圖片的完整提示詞。
 * @param {string} model - 要使用的模型 ('gemini-flash' 或 'imagen-3')。
 * @returns {Promise<string>} - Base64 格式的圖片資料 URL。
 */
async function callImageGenerationAPI(userPrompt, model = 'gemini-flash') {
    const response = await fetch('/api/proxy/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt, model: model })
    });

    const result = await response.json();
    if (!response.ok) {
        console.error("代理錯誤:", result.error);
        throw new Error(result.error || '圖片生成代理請求失敗');
    }
    
    let base64Data;
    if (model === 'imagen-3') {
        base64Data = result.predictions?.[0]?.bytesBase64Encoded;
    } else {
        base64Data = result?.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
    }

    if (base64Data) {
        return `data:image/png;base64,${base64Data}`;
    } else {
        console.error("API 回應中未找到圖片資料。 完整回應:", JSON.stringify(result, null, 2));
        throw new Error('API 回應中未找到有效的圖片資料。');
    }
}

/**
 * 呼叫後端代理以生成文字。
 * @param {string} prompt - 用於生成文字的提示詞。
 * @returns {Promise<string>} - 生成的文字內容。
 */
async function callTextGenerationAPI(prompt) {
    const response = await fetch('/api/proxy/text', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ prompt })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || '文字代理請求失敗');
    if (result.candidates && result.candidates.length > 0) return result.candidates[0].content.parts[0].text;
    else throw new Error('文字 API 未返回有效的內容。');
}

/**
 * 呼叫後端代理以進行文字轉語音 (TTS)。
 * @param {string} text - 要轉換為語音的文字。
 * @returns {Promise<{audioData: string, sampleRate: number}>} - 包含音訊資料和取樣率的物件。
 */
async function callTTSAPI(text) {
    const response = await fetch('/api/proxy/tts', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ text })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'TTS 代理請求失敗');

    const part = result?.candidates?.[0]?.content?.parts?.[0];
    if (part?.inlineData?.data && part?.inlineData?.mimeType.startsWith("audio/")) {
        return {
            audioData: part.inlineData.data,
            sampleRate: parseInt(part.inlineData.mimeType.match(/rate=(\d+)/)[1], 10)
        };
    } else {
        throw new Error('TTS API 未返回有效的音訊資料。');
    }
}
