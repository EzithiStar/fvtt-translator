import { create } from 'zustand'

export interface TranslationItem {
    id: string
    original: string
    translation: string
    isIgnored?: boolean
}

interface TranslationProgress {
    current: number
    total: number
}

interface TranslationState {
    // 当前编辑的文件
    currentFile: string | null

    // 翻译数据
    items: TranslationItem[]

    // 文件格式
    isBabeleFormat: boolean

    // 翻译状态
    translating: boolean
    progress: TranslationProgress

    // Actions
    setCurrentFile: (file: string | null) => void
    setItems: (items: TranslationItem[]) => void
    updateItem: (id: string, translation: string) => void
    updateItemsBatch: (updates: Map<string, string>) => void
    setIsBabeleFormat: (isBabele: boolean) => void
    setTranslating: (translating: boolean) => void
    setProgress: (progress: TranslationProgress) => void

    // 清除当前编辑状态
    clearEditorState: () => void

    // 检查是否需要重新加载（文件变化时）
    shouldReload: (file: string) => boolean
}

export const useTranslationStore = create<TranslationState>()((set, get) => ({
    currentFile: null,
    items: [],
    isBabeleFormat: false,
    translating: false,
    progress: { current: 0, total: 0 },

    setCurrentFile: (file) => set({ currentFile: file }),

    setItems: (items) => set({ items }),

    updateItem: (id, translation) => set((state) => ({
        items: state.items.map(item =>
            item.id === id ? { ...item, translation } : item
        )
    })),

    // 批量更新翻译结果（按 original 匹配）
    updateItemsBatch: (updates) => set((state) => ({
        items: state.items.map(item => {
            if (updates.has(item.original)) {
                return { ...item, translation: updates.get(item.original)! }
            }
            return item
        })
    })),

    setIsBabeleFormat: (isBabele) => set({ isBabeleFormat: isBabele }),

    setTranslating: (translating) => set({ translating }),

    setProgress: (progress) => set({ progress }),

    clearEditorState: () => set({
        currentFile: null,
        items: [],
        isBabeleFormat: false,
        translating: false,
        progress: { current: 0, total: 0 }
    }),

    shouldReload: (file) => {
        const state = get()
        // 如果文件路径不同，需要重新加载
        return state.currentFile !== file
    }
}))
