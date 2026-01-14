/// <reference types="vite/client" />

interface Window {
    api: {
        selectDirectory: () => Promise<string | null>
        readJson: <T>(path: string) => Promise<T>
        writeJson: (path: string, data: any) => Promise<void>
        readFile: (path: string) => Promise<string>
        writeFile: (path: string, content: string) => Promise<void>
        selectFile: (extensions?: string[]) => Promise<string | null>
        getFiles: (path: string, extensions?: string[]) => Promise<string[]>
        scanFile: (path: string) => Promise<any>
        applyPatch: (path: string, translations: Record<string, string>) => Promise<string>
        translate: (text: string, config: any, projectPath: string | null) => Promise<string>
        showSaveDialog: (defaultPath: string) => Promise<string | null>
        extractZip: (path: string) => Promise<string>
        calculateProgress: (path: string) => Promise<{ total: number; translated: number; percentage: number }>

        // Export APIs
        exportModule: (projectPath: string, metadata: any, files: string[]) => Promise<{ success: boolean; path?: string; error?: string }>
        getModuleInfo: (projectPath: string) => Promise<any>

        // Glossary
        listGlossaries: () => Promise<{ name: string, enabled: boolean, entryCount: number }[]>
        loadGlossary: (name: string) => Promise<{ term: string, definition: string, context?: string }[]>
        saveGlossary: (name: string, entries: { term: string, definition: string, context?: string }[]) => Promise<boolean>
        createGlossary: (name: string) => Promise<boolean>
        deleteGlossary: (name: string) => Promise<boolean>
        getActiveGlossaries: () => Promise<string[]>
        setActiveGlossaries: (names: string[]) => Promise<boolean>
        importGlossary: (filePath: string) => Promise<{ term: string, definition: string, context?: string }[]>

        // Blacklist
        getBlacklist: () => Promise<string[]>
        addBlacklist: (key: string) => Promise<boolean>
        removeBlacklist: (key: string) => Promise<boolean>
    }
}
