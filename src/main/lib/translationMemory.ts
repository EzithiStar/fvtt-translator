/**
 * Translation Memory (TM) Module
 * Stores hash(original) -> translation mappings to reuse translations
 * and reduce AI API calls.
 */
import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

interface TMEntry {
    original: string
    translation: string
    source: 'AI' | 'Manual' | 'Glossary' | 'TM'
    createdAt: string
    usageCount: number
}

interface TMData {
    entries: Record<string, TMEntry>
    stats: {
        totalEntries: number
        hitCount: number
        missCount: number
    }
}

const TM_FILE = 'translationMemory.json'

function getTMPath(): string {
    const userDataPath = app.getPath('userData')
    return path.join(userDataPath, TM_FILE)
}

function hashText(text: string): string {
    return crypto.createHash('md5').update(text.trim().toLowerCase()).digest('hex')
}

function loadTM(): TMData {
    const tmPath = getTMPath()
    try {
        if (fs.existsSync(tmPath)) {
            const content = fs.readFileSync(tmPath, 'utf-8')
            return JSON.parse(content) as TMData
        }
    } catch (error) {
        console.error('Failed to load TM:', error)
    }
    return {
        entries: {},
        stats: { totalEntries: 0, hitCount: 0, missCount: 0 }
    }
}

function saveTM(data: TMData): void {
    const tmPath = getTMPath()
    try {
        // Update totalEntries count
        data.stats.totalEntries = Object.keys(data.entries).length
        fs.writeFileSync(tmPath, JSON.stringify(data, null, 2), 'utf-8')
    } catch (error) {
        console.error('Failed to save TM:', error)
    }
}

/**
 * Look up a translation in the TM
 * @param original - Original text to look up
 * @returns TMEntry if found, null otherwise
 */
export function lookup(original: string): TMEntry | null {
    if (!original || original.trim().length === 0) return null

    const tm = loadTM()
    const hash = hashText(original)
    const entry = tm.entries[hash]

    if (entry) {
        // Increment usage count and hit count
        entry.usageCount++
        tm.stats.hitCount++
        saveTM(tm)
        return entry
    }

    // Record miss
    tm.stats.missCount++
    saveTM(tm)
    return null
}

/**
 * Add a translation to the TM
 * @param original - Original text
 * @param translation - Translated text
 * @param source - Source of translation ('AI', 'Manual', 'Glossary')
 */
export function add(original: string, translation: string, source: 'AI' | 'Manual' | 'Glossary' = 'Manual'): boolean {
    if (!original || !translation || original.trim().length === 0) return false

    const tm = loadTM()
    const hash = hashText(original)

    // Only update if new or different translation
    if (!tm.entries[hash] || tm.entries[hash].translation !== translation) {
        tm.entries[hash] = {
            original: original.trim(),
            translation: translation.trim(),
            source,
            createdAt: new Date().toISOString(),
            usageCount: 0
        }
        saveTM(tm)
        return true
    }
    return false
}

/**
 * Batch add translations to TM
 * @param items - Array of {original, translation, source}
 */
export function batchAdd(items: Array<{ original: string; translation: string; source?: 'AI' | 'Manual' | 'Glossary' }>): number {
    const tm = loadTM()
    let addedCount = 0

    for (const item of items) {
        if (!item.original || !item.translation) continue

        const hash = hashText(item.original)
        if (!tm.entries[hash] || tm.entries[hash].translation !== item.translation) {
            tm.entries[hash] = {
                original: item.original.trim(),
                translation: item.translation.trim(),
                source: item.source || 'Manual',
                createdAt: new Date().toISOString(),
                usageCount: 0
            }
            addedCount++
        }
    }

    if (addedCount > 0) {
        saveTM(tm)
    }
    return addedCount
}

/**
 * Get TM statistics
 */
export function getStats(): { totalEntries: number; hitCount: number; missCount: number; hitRate: string } {
    const tm = loadTM()
    const total = tm.stats.hitCount + tm.stats.missCount
    const hitRate = total > 0 ? ((tm.stats.hitCount / total) * 100).toFixed(1) + '%' : '0%'
    return {
        ...tm.stats,
        hitRate
    }
}

/**
 * Clear all TM entries
 */
export function clear(): boolean {
    try {
        saveTM({
            entries: {},
            stats: { totalEntries: 0, hitCount: 0, missCount: 0 }
        })
        return true
    } catch {
        return false
    }
}

/**
 * Export TM to JSON format
 */
export function exportTM(): TMData {
    return loadTM()
}

/**
 * Get recent entries for display
 */
export function getRecentEntries(limit: number = 50): TMEntry[] {
    const tm = loadTM()
    return Object.values(tm.entries)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
}
