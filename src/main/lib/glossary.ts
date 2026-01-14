import * as fs from 'fs/promises'
import * as path from 'path'
import { app } from 'electron'
import { GlossaryEntry } from '../../shared/types'

export interface GlossaryFile {
    name: string
    enabled: boolean
    entryCount: number
}

export class GlossaryManager {
    private glossariesDir: string
    private configPath: string

    constructor() {
        this.glossariesDir = path.join(app.getPath('userData'), 'glossaries')
        this.configPath = path.join(app.getPath('userData'), 'glossary-config.json')
        this.ensureDirectories()
    }

    private async ensureDirectories() {
        try {
            await fs.mkdir(this.glossariesDir, { recursive: true })
        } catch (e) {
            console.error('Failed to create glossaries directory:', e)
        }
    }

    async listGlossaries(): Promise<GlossaryFile[]> {
        try {
            await this.ensureDirectories()
            const files = await fs.readdir(this.glossariesDir)
            const jsonFiles = files.filter(f => f.endsWith('.json'))

            const config = await this.loadConfig()
            const activeNames = config.active || []

            const glossaries: GlossaryFile[] = []
            for (const file of jsonFiles) {
                const entries = await this.loadGlossary(file.replace('.json', ''))
                glossaries.push({
                    name: file.replace('.json', ''),
                    enabled: activeNames.includes(file.replace('.json', '')),
                    entryCount: entries.length
                })
            }
            return glossaries
        } catch (error) {
            console.error('Failed to list glossaries:', error)
            return []
        }
    }

    async loadGlossary(name: string): Promise<GlossaryEntry[]> {
        try {
            const filePath = path.join(this.glossariesDir, `${name}.json`)
            const content = await fs.readFile(filePath, 'utf-8')
            return JSON.parse(content)
        } catch (error) {
            return []
        }
    }

    async saveGlossary(name: string, entries: GlossaryEntry[]): Promise<boolean> {
        try {
            await this.ensureDirectories()
            const filePath = path.join(this.glossariesDir, `${name}.json`)
            await fs.writeFile(filePath, JSON.stringify(entries, null, 2), 'utf-8')
            return true
        } catch (error) {
            console.error('Failed to save glossary:', error)
            return false
        }
    }

    async createGlossary(name: string): Promise<boolean> {
        try {
            await this.ensureDirectories()
            const filePath = path.join(this.glossariesDir, `${name}.json`)
            await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf-8')
            return true
        } catch (error) {
            console.error('Failed to create glossary:', error)
            return false
        }
    }

    async deleteGlossary(name: string): Promise<boolean> {
        try {
            const filePath = path.join(this.glossariesDir, `${name}.json`)
            await fs.unlink(filePath)

            // Remove from active list if present
            const config = await this.loadConfig()
            config.active = (config.active || []).filter((n: string) => n !== name)
            await this.saveConfig(config)

            return true
        } catch (error) {
            console.error('Failed to delete glossary:', error)
            return false
        }
    }

    async getActiveGlossaries(): Promise<string[]> {
        const config = await this.loadConfig()
        return config.active || []
    }

    async setActiveGlossaries(names: string[]): Promise<boolean> {
        try {
            const config = await this.loadConfig()
            config.active = names
            await this.saveConfig(config)
            return true
        } catch (error) {
            console.error('Failed to set active glossaries:', error)
            return false
        }
    }

    async loadMergedGlossary(): Promise<GlossaryEntry[]> {
        const activeNames = await this.getActiveGlossaries()
        const merged: GlossaryEntry[] = []
        const seen = new Set<string>()

        for (const name of activeNames) {
            const entries = await this.loadGlossary(name)
            for (const entry of entries) {
                if (!seen.has(entry.term)) {
                    merged.push(entry)
                    seen.add(entry.term)
                }
            }
        }

        return merged
    }

    private async loadConfig(): Promise<any> {
        try {
            const content = await fs.readFile(this.configPath, 'utf-8')
            return JSON.parse(content)
        } catch (error) {
            return { active: [] }
        }
    }

    private async saveConfig(config: any): Promise<void> {
        await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8')
    }
}

export const glossaryManager = new GlossaryManager()
