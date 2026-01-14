import { net } from 'electron'
import { glossaryManager } from './glossary'

export interface AIConfig {
    provider: 'openai' | 'gemini' | 'deepseek'
    apiKey: string
    model: string
    prompt?: string
}

export const DEFAULT_PROMPT = `你是一位精通 Foundry VTT 和 Pathfinder 1e 规则的专业翻译助手。
任务：请将以下 JavaScript 代码片段中的字符串翻译为简体中文。
规则：
1. 术语准确：请参考 Pathfinder 1e 的常用中文译名（如“法术抗力”、“AC”、“感知”等）。
2. 代码安全：绝对不要翻译变量名、函数名、HTML 标签、Handlebars 语法（{{...}}）或特殊转义字符。
3. 语境判断：这是一个代码文件。如果文本看起来像是系统键名（如 "ui.notifications"）或文件路径，请保持原样，不要翻译。
4. 只返回翻译后的内容，不要包含解释。`


export class AIService {
    async translate(text: string, config: AIConfig, projectPath: string | null = null): Promise<string> {
        if (!config.apiKey) throw new Error('API Key is missing')

        // Load merged glossary from all enabled glossaries
        let glossaryContext = ''
        try {
            const glossary = await glossaryManager.loadMergedGlossary()
            if (glossary.length > 0) {
                glossaryContext = '\n\n术语表（请严格遵守以下翻译对照）：\n'
                glossary.forEach(entry => {
                    glossaryContext += `- "${entry.term}" → "${entry.definition}"`
                    if (entry.context) glossaryContext += ` (${entry.context})`
                    glossaryContext += '\n'
                })
            }
        } catch (e) {
            console.warn('Failed to load glossary:', e)
        }

        const enhancedPrompt = (config.prompt || DEFAULT_PROMPT) + glossaryContext

        if (config.provider === 'openai' || config.provider === 'deepseek') {
            return this.translateOpenAI(text, config, enhancedPrompt)
        } else if (config.provider === 'gemini') {
            return this.translateGemini(text, config, enhancedPrompt)
        }

        throw new Error('Unknown provider')
    }

    private async translateOpenAI(text: string, config: AIConfig, prompt: string): Promise<string> {
        const baseURL = config.provider === 'deepseek' ? 'https://api.deepseek.com/v1' : 'https://api.openai.com/v1'

        // Using Electron's net module to avoid CORS issues if we were in renderer, 
        // but we are in main process so node-fetch or native fetch works too. 
        // Electron's net is good for proxy support.

        const response = await fetch(`${baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [
                    { role: 'system', content: prompt },
                    { role: 'user', content: text }
                ]
            })
        })

        if (!response.ok) {
            throw new Error(`AI Request failed: ${response.statusText}`)
        }

        const data = await response.json()
        return data.choices[0].message.content.trim()
    }

    private async translateGemini(text: string, config: AIConfig, prompt: string): Promise<string> {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${prompt}:\n\n${text}`
                    }]
                }]
            })
        })

        if (!response.ok) {
            throw new Error(`Gemini Request failed: ${response.statusText}`)
        }

        const data = await response.json()
        return data.candidates[0].content.parts[0].text.trim()
    }
}

export const aiService = new AIService()
