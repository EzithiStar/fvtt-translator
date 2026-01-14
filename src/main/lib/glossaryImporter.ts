import * as fs from 'fs/promises'
import { GlossaryEntry } from '../../shared/types'

export class GlossaryImporter {
    async importFromJsonFile(filePath: string): Promise<GlossaryEntry[]> {
        try {
            const content = await fs.readFile(filePath, 'utf-8')
            const data = JSON.parse(content)

            const entries: GlossaryEntry[] = []
            const seen = new Set<string>()

            // Skip keys for descriptions (too long for glossary)
            const skipKeys = ['description', 'desc', 'description-full', 'hint', 'help', 'tooltip', 'notes']
            // Generic keys that should not be used as terms
            const genericKeys = ['label', 'name', 'title', 'value', 'text']

            // Recursively flatten and extract key-value pairs
            // KEY = term (original), VALUE = definition (translation)
            const extract = (obj: any, prefix = '') => {
                for (const key in obj) {
                    // Skip description-like keys
                    if (skipKeys.includes(key.toLowerCase())) {
                        continue
                    }

                    const fullKey = prefix ? `${prefix}.${key}` : key

                    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                        // Nested object, recurse
                        extract(obj[key], fullKey)
                    } else if (typeof obj[key] === 'string' && obj[key].trim()) {
                        // String value found
                        const definition = obj[key].trim()

                        // Skip if too long (likely a description)
                        if (definition.length > 100) {
                            continue
                        }

                        // Extract meaningful term from key path
                        // For "PF1-Improved-Conditions.Burning.label", we want "Burning"
                        const keyParts = fullKey.split('.')
                        let term = key  // Default to last key

                        // If last key is generic (label, name, etc), use second-to-last
                        if (keyParts.length > 1 && genericKeys.includes(key.toLowerCase())) {
                            term = keyParts[keyParts.length - 2]
                        }

                        const uniqueKey = `${term}:${definition}`

                        if (!seen.has(uniqueKey)) {
                            entries.push({
                                term: term,
                                definition: definition,
                                context: fullKey  // Full path goes to context
                            })
                            seen.add(uniqueKey)
                        }
                    }
                }
            }

            extract(data)
            return entries
        } catch (error) {
            console.error('Failed to import from JSON:', error)
            throw error
        }
    }
}

export const glossaryImporter = new GlossaryImporter()
