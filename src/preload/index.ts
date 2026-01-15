import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
    selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('fs:selectDirectory'),
    readJson: <T>(path: string): Promise<T> => ipcRenderer.invoke('fs:readJson', path),
    writeJson: (path: string, data: any): Promise<void> => ipcRenderer.invoke('fs:writeJson', path, data),
    readFile: (path: string): Promise<string> => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path: string, content: string): Promise<void> => ipcRenderer.invoke('fs:writeFile', path, content),
    selectFile: (extensions?: string[]): Promise<string | null> => ipcRenderer.invoke('fs:selectFile', extensions),
    getFiles: (path: string, extensions?: string[]): Promise<string[]> => ipcRenderer.invoke('fs:getFiles', path, extensions),
    scanFile: (path: string): Promise<any> => ipcRenderer.invoke('parser:scanFile', path),
    applyPatch: (path: string, translations: Record<string, string>): Promise<string> => ipcRenderer.invoke('parser:applyPatch', path, translations),
    translate: (text: string, config: any, projectPath: string | null): Promise<string> => ipcRenderer.invoke('ai:translate', text, config, projectPath),
    showSaveDialog: (defaultPath: string): Promise<string | null> => ipcRenderer.invoke('fs:showSaveDialog', defaultPath),
    extractZip: (path: string): Promise<string> => ipcRenderer.invoke('fs:extractZip', path),
    calculateProgress: (path: string): Promise<{ total: number; translated: number; percentage: number }> => ipcRenderer.invoke('fs:calculateProgress', path),
    exportModule: (projectPath: string, metadata: any, files: string[], stagedFiles?: any[]): Promise<any> => ipcRenderer.invoke('export:exportModule', projectPath, metadata, files, stagedFiles),
    getModuleInfo: (projectPath: string): Promise<any> => ipcRenderer.invoke('export:getModuleInfo', projectPath),

    // Glossary
    listGlossaries: (): Promise<any[]> => ipcRenderer.invoke('glossary:list'),
    loadGlossary: (name: string): Promise<any[]> => ipcRenderer.invoke('glossary:load', name),
    saveGlossary: (name: string, entries: any[]): Promise<boolean> => ipcRenderer.invoke('glossary:save', name, entries),
    createGlossary: (name: string): Promise<boolean> => ipcRenderer.invoke('glossary:create', name),
    deleteGlossary: (name: string): Promise<boolean> => ipcRenderer.invoke('glossary:delete', name),
    getActiveGlossaries: (): Promise<string[]> => ipcRenderer.invoke('glossary:getActive'),
    setActiveGlossaries: (names: string[]): Promise<boolean> => ipcRenderer.invoke('glossary:setActive', names),
    importGlossary: (filePath: string): Promise<any[]> => ipcRenderer.invoke('glossary:import', filePath),

    // Blacklist
    getBlacklist: (): Promise<string[]> => ipcRenderer.invoke('blacklist:get'),
    addBlacklist: (key: string): Promise<boolean> => ipcRenderer.invoke('blacklist:add', key),
    removeBlacklist: (key: string): Promise<boolean> => ipcRenderer.invoke('blacklist:remove', key),

    // Window
    resizeWindow: (width: number, height: number): Promise<void> => ipcRenderer.invoke('window:resize', width, height),
    getWindowSize: (): Promise<{ width: number; height: number }> => ipcRenderer.invoke('window:getSize'),

    // Bilingual Export
    generateBilingual: (translatedData: any, originalData: any, threshold?: number): Promise<any> =>
        ipcRenderer.invoke('export:generateBilingual', translatedData, originalData, threshold),

    // File operations for backup management
    deleteFile: (path: string): Promise<void> => ipcRenderer.invoke('fs:deleteFile', path),
    fileExists: (path: string): Promise<boolean> => ipcRenderer.invoke('fs:fileExists', path)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
