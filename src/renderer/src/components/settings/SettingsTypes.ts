export type AIProvider = 'openai' | 'gemini' | 'deepseek' | 'custom'

export interface AppSettings {
    // General
    theme: 'dark' | 'light'
    language: 'en' | 'zh'

    // AI
    provider: AIProvider
    apiKey: string
    model: string
    baseUrl?: string // For custom provider or overriding default
    temperature: number
    maxTokens?: number
    systemPrompt: string

    // Module
    workspacePath: string // 'default' or absolute path
    moduleDefaults: {
        authors: string
        url?: string
        manifest?: string
        download?: string
        compatibility: {
            minimum: string
            verified: string
            maximum: string
        }
    }
}

export const DEFAULT_SETTINGS: AppSettings = {
    theme: 'dark',
    language: 'zh',

    provider: 'openai',
    apiKey: '',
    model: 'gpt-3.5-turbo',
    baseUrl: '',
    temperature: 0.7,
    systemPrompt: '你是一位精通 Foundry VTT 和 Pathfinder 1e 规则的专业翻译助手。\n任务：请将以下 JavaScript 代码片段中的字符串翻译为简体中文。\n规则：\n1. 术语准确：请参考 Pathfinder 1e 的常用中文译名（如"法术抗力"、"AC"、"感知"等）。\n2. 代码安全：绝对不要翻译变量名、函数名、HTML 标签、Handlebars 语法（{{...}}）或特殊转义字符。\n3. 语境判断：这是一个代码文件。如果文本看起来像是系统键名（如 "ui.notifications"）或文件路径，请保持原样，不要翻译。\n4. 只返回翻译后的内容，不要包含解释。',

    workspacePath: 'default',
    moduleDefaults: {
        authors: '',
        url: '',
        manifest: '',
        download: '',
        compatibility: {
            minimum: '10',
            verified: '11',
            maximum: ''
        }
    }
}
