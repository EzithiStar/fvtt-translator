import * as fs from 'fs/promises'
import * as path from 'path'
import { app } from 'electron'

export class BlacklistManager {
    private configPath: string
    private blacklist: Set<string> = new Set()

    constructor() {
        this.configPath = path.join(app.getPath('userData'), 'blacklist.json')
        this.load()
    }

    async load() {
        try {
            const content = await fs.readFile(this.configPath, 'utf-8')
            const list: string[] = JSON.parse(content)
            this.blacklist = new Set(list)
        } catch (e) {
            // If file doesn't exist, start empty
            this.blacklist = new Set()
        }
    }

    async save() {
        try {
            const list = Array.from(this.blacklist)
            await fs.writeFile(this.configPath, JSON.stringify(list, null, 2), 'utf-8')
        } catch (e) {
            console.error('Failed to save blacklist:', e)
        }
    }

    async getList(): Promise<string[]> {
        // Always reload from disk to ensure fresh data
        await this.load()
        return Array.from(this.blacklist).sort()
    }

    async add(key: string): Promise<boolean> {
        if (!key) return false
        this.blacklist.add(key)
        await this.save()
        return true
    }

    async remove(key: string): Promise<boolean> {
        if (this.blacklist.delete(key)) {
            await this.save()
            return true
        }
        return false
    }

    async has(key: string): Promise<boolean> {
        return this.blacklist.has(key)
    }

    // Check if a key matches any blacklist pattern
    // Supports exact match for now. Could extend to glob/regex if needed.
    // User specifically asked for "system.description.value", which suggests exact key matching for JSON.
    isBlacklisted(key: string): boolean {
        return this.blacklist.has(key)
    }
}

export const blacklistManager = new BlacklistManager()
