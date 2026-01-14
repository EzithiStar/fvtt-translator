import { app, dialog } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import AdmZip from 'adm-zip'

export class FileSystemHandler {
    async selectDirectory(): Promise<string | null> {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openDirectory']
        })
        if (canceled || filePaths.length === 0) {
            return null
        }
        return filePaths[0]
    }

    async selectFile(extensions?: string[]): Promise<string | null> {
        const filters = extensions && extensions.length > 0
            ? [{ name: 'Files', extensions: extensions.map(e => e.replace('.', '')) }]
            : []
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters
        })
        if (canceled || filePaths.length === 0) {
            return null
        }
        return filePaths[0]
    }

    async readJson<T>(filePath: string): Promise<T> {
        const content = await fs.readFile(filePath, 'utf-8')
        if (!content || content.trim() === '') {
            return {} as T
        }
        try {
            return JSON.parse(content)
        } catch (error) {
            console.error('Failed to parse JSON:', filePath, error)
            return {} as T
        }
    }

    async writeJson(filePath: string, data: any): Promise<void> {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    }

    async readFile(filePath: string): Promise<string> {
        return fs.readFile(filePath, 'utf-8')
    }

    async writeFile(filePath: string, content: string): Promise<void> {
        await fs.writeFile(filePath, content, 'utf-8')
    }

    async getFiles(dirPath: string, extensions: string[] = []): Promise<string[]> {
        const files: string[] = []

        async function traverse(currentPath: string) {
            const stat = await fs.stat(currentPath)
            if (stat.isFile()) {
                if (extensions.length === 0 || extensions.includes(path.extname(currentPath))) {
                    files.push(currentPath)
                }
                return
            }

            const entries = await fs.readdir(currentPath, { withFileTypes: true })
            for (const entry of entries) {
                const fullPath = path.join(currentPath, entry.name)
                if (entry.isDirectory()) {
                    await traverse(fullPath)
                } else if (entry.isFile()) {
                    if (extensions.length === 0 || extensions.includes(path.extname(entry.name))) {
                        files.push(fullPath)
                    }
                }
            }
        }

        await traverse(dirPath)
        return files
    }

    async showSaveDialog(defaultPath: string): Promise<string | null> {
        const { canceled, filePath } = await dialog.showSaveDialog({
            defaultPath: defaultPath,
            filters: [{ name: 'All Files', extensions: ['*'] }]
        })
        return canceled ? null : filePath
    }

    async extractZip(zipPath: string): Promise<string> {
        try {
            const zip = new AdmZip(zipPath)
            const targetDir = zipPath.replace(/\.zip$/i, '') + '_unpacked'

            // Ensure directory exists (AdmZip might create it but let's be safe or just let AdmZip handle it)
            // AdmZip.extractAllTo(targetPath, overwrite)
            zip.extractAllTo(targetDir, true)
            return targetDir
        } catch (error) {
            console.error('Failed to extract zip:', error)
            throw error
        }
    }

    async calculateProgress(filePath: string): Promise<{ total: number; translated: number; percentage: number }> {
        try {
            if (!filePath.toLowerCase().endsWith('.json')) {
                return { total: 0, translated: 0, percentage: 0 }
            }

            const content = await fs.readFile(filePath, 'utf-8')
            const json = JSON.parse(content)

            let total = 0
            let translated = 0

            const traverse = (obj: any) => {
                for (const key in obj) {
                    const value = obj[key]
                    if (typeof value === 'object' && value !== null) {
                        traverse(value)
                    } else if (typeof value === 'string') {
                        total++
                        // Check for CJK characters (Chinese, Japanese, Korean ranges)
                        if (/[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/.test(value)) {
                            translated++
                        }
                    }
                }
            }

            traverse(json)

            return {
                total,
                translated,
                percentage: total > 0 ? Math.round((translated / total) * 100) : 0
            }
        } catch (error) {
            console.error(`Error calculating progress for ${filePath}:`, error)
            return { total: 0, translated: 0, percentage: 0 }
        }
    }
}

export const fileSystem = new FileSystemHandler()
