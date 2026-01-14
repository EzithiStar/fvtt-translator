import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type StagedFileType = 'lang' | 'script' | 'babele' | 'other'
export type OutputFormat = 'translated' | 'bilingual' | 'original'

export interface StagedFile {
    id: string
    sourcePath: string
    targetPath: string
    type: StagedFileType
    label?: string // For custom lang name in module.json
    outputFormat?: OutputFormat // For bilingual output toggle
}

interface ModuleBuilderState {
    targetId: string
    stagedFiles: StagedFile[]

    setTargetId: (id: string) => void
    addStagedFile: (file: Omit<StagedFile, 'id'>) => void
    removeStagedFile: (id: string) => void
    updateStagedFile: (id: string, updates: Partial<StagedFile>) => void
    clearStagedFiles: () => void

    // Actions
    autoDetectType: (fileName: string, content?: string) => { type: StagedFileType, targetPath: string }
}

export const useModuleBuilder = create<ModuleBuilderState>()(
    persist(
        (set, get) => ({
            targetId: '',
            stagedFiles: [],

            setTargetId: (id) => set({ targetId: id }),

            addStagedFile: (file) => set((state) => {
                // Prevent duplicates by sourcePath
                if (state.stagedFiles.some(f => f.sourcePath === file.sourcePath)) {
                    return state
                }
                const id = Math.random().toString(36).substring(7)
                return { stagedFiles: [...state.stagedFiles, { ...file, id }] }
            }),

            removeStagedFile: (id) => set((state) => ({
                stagedFiles: state.stagedFiles.filter(f => f.id !== id)
            })),

            updateStagedFile: (id, updates) => set((state) => ({
                stagedFiles: state.stagedFiles.map(f => f.id === id ? { ...f, ...updates } : f)
            })),

            clearStagedFiles: () => set({ stagedFiles: [] }),

            autoDetectType: (fileName: string, content?: string) => {
                const lower = fileName.toLowerCase()

                // 1. Scripts
                if (lower.endsWith('.js')) {
                    if (lower === 'babele.js' || lower === 'register.js') {
                        return { type: 'script', targetPath: `scripts/${fileName}` }
                    }
                    return { type: 'script', targetPath: `scripts/${fileName}` }
                }

                // 2. Languages / Babele
                if (lower.endsWith('.json')) {
                    // Start simple: if name is cn.json / en.json -> lang
                    if (lower === 'cn.json' || lower === 'zh.json' || lower === 'zh-cn.json' || lower === 'en.json') {
                        return { type: 'lang', targetPath: `lang/${fileName}` }
                    }

                    // Smart Detection via Content
                    if (content) {
                        try {
                            // Simple heuristic check on string content to avoid parsing huge files if possible, 
                            // but parsing is safer.
                            if (content.includes('"entries":') || content.includes('"mapping":')) {
                                return { type: 'babele', targetPath: `translations/${fileName}` }
                            }
                        } catch (e) { }
                    }

                    // Default to 'lang' for generic JSONs now (User Feedback), 
                    // unless identified as Babele mapping above.
                    // This fixes the issue where mod lang files were defaulting to translations/
                    return { type: 'lang', targetPath: `lang/${fileName}` }
                }

                return { type: 'other', targetPath: fileName }
            }
        }),
        {
            name: 'module-builder-storage'
        }
    )
)
