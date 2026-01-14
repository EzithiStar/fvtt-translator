import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import * as t from '@babel/types'
import MagicString from 'magic-string'
import { promises as fs } from 'fs'

export interface StringSearchResult {
    filePath: string
    items: TranslatableItem[]
}

export interface TranslatableItem {
    id: string
    original: string
    context?: string
    translation?: string
    start: number
    end: number
    loc?: {
        start: { line: number, column: number }
        end: { line: number, column: number }
    }
}

export class CodeParser {
    async scanFile(filePath: string): Promise<StringSearchResult> {
        const code = await fs.readFile(filePath, 'utf-8')
        const ast = parse(code, {
            sourceType: 'module',
            plugins: ['typescript', 'jsx'],
            tokens: true
        })

        const items: TranslatableItem[] = []

        // Use @babel/traverse which is safer for deep ASTs than manual recursion
        // traverse default export is sometimes an object with default property depending on import env
        const traverseFn = (traverse as any).default || traverse

        traverseFn(ast, {
            StringLiteral: (path: any) => {
                const node = path.node
                const parent = path.parent

                let shouldExtract = true

                // 1. Ignore Import/Export
                if (t.isImportDeclaration(parent) || t.isExportNamedDeclaration(parent) || t.isExportAllDeclaration(parent)) {
                    shouldExtract = false
                }

                // 2. Ignore Object Keys
                if (t.isObjectProperty(parent) && parent.key === node && !parent.computed) {
                    shouldExtract = false
                }

                // 3. Keep existing ignore logic for APIs
                if (t.isCallExpression(parent)) {
                    const callee = parent.callee
                    const args = parent.arguments

                    if (t.isMemberExpression(callee) && t.isIdentifier(callee.property) && t.isIdentifier(callee.object)) {
                        const propName = callee.property.name
                        const objName = callee.object.name

                        if (propName === 'get' && args[1] === node) shouldExtract = false
                        if (propName === 'get' && objName === 'modules' && args[0] === node) shouldExtract = false
                        if (propName === 'localize' || propName === 'format') shouldExtract = false
                    }

                    if (t.isMemberExpression(callee) && t.isIdentifier(callee.object) && callee.object.name === 'Hooks') {
                        if (args[0] === node) shouldExtract = false
                    }

                    if (t.isMemberExpression(callee) && t.isIdentifier(callee.object) && callee.object.name === 'libWrapper') {
                        if (args[0] === node || args[1] === node) shouldExtract = false
                    }
                }

                // 4. Ignore logic comparisons (Binary Expressions)
                if (t.isBinaryExpression(parent)) {
                    shouldExtract = false
                }

                // Check extracted string
                if (shouldExtract && this.isTranslatable(node.value)) {
                    const startLineIndex = node.loc ? node.loc.start.line - 1 : 0
                    const contextLine = code.split(/\r?\n/)[startLineIndex]?.trim() || ''

                    items.push({
                        id: `${node.start}-${node.end}`,
                        original: node.value,
                        context: contextLine,
                        start: node.start!,
                        end: node.end!,
                        loc: node.loc!
                    })
                }
            },
            // Disable scope tracking for performance on large files
            noScope: true
        })

        return {
            filePath,
            items
        }
    }

    isTranslatable(str: string): boolean {
        const trimmed = str.trim()
        if (trimmed.length < 2) return false

        // Ignore strings starting with special chars usually used for codes
        if (trimmed.match(/^[@#$!{_]/)) return false

        // Ignore paths (contains slash)
        if (trimmed.includes('/') && !trimmed.includes(' ')) return false

        // Ignore dot-notation keys (e.g. "PF1.Something", "ui.notifications")
        // Must contain dot, no spaces, first char is letter/number
        if (trimmed.includes('.') && !trimmed.includes(' ')) return false

        // Ignore strings with no letters (must have at least one letter)
        if (!trimmed.match(/[a-zA-Z\u4e00-\u9fa5]/)) return false

        // Ignore likely variable names / keys (camelCase or snake_case without spaces)
        if (!trimmed.includes(' ')) {
            // Reject if it looks like a code id: "foo.bar", "foo_bar", "fooBar"
            if (trimmed.match(/^[a-z][a-zA-Z0-9_.-]*$/)) return false

            // Reject ALL CAPS consts: "MAX_WIDTH", "FOO_BAR"
            if (trimmed.match(/^[A-Z0-9_]+$/)) return false

            // Reject "MIXED", "Communal" (Single word PascalCase often technical, but risky. 
            // "Communal" IS a word. "Attack" IS a word.
            // We should keep them, but maybe flag them?
            // For now, let's keep simple Capital Words.)
        }

        // Check for HTML tags without text content (e.g. <i class="fas fa-check"></i>)
        const strippedHtml = trimmed.replace(/<[^>]+>/g, '').trim()
        if (trimmed.includes('<') && trimmed.includes('>') && strippedHtml.length === 0) {
            return false
        }

        return true
    }

    async applyPatch(filePath: string, translations: Record<string, string>): Promise<string> {
        const code = await fs.readFile(filePath, 'utf-8')
        const s = new MagicString(code)

        // Re-scan to get locations
        const result = await this.scanFile(filePath)

        for (const item of result.items) {
            if (translations[item.id]) { // Use ID to match exact occurrence
                let translated = translations[item.id]

                // Determine quote type from original code
                const originalRaw = code.slice(item.start, item.end)
                const quote = originalRaw[0]

                // Escape quotes if needed
                if (quote === "'") {
                    translated = translated.replace(/'/g, "\\'")
                } else if (quote === '"') {
                    translated = translated.replace(/"/g, '\\"')
                }

                s.overwrite(item.start, item.end, `${quote}${translated}${quote}`)
            }
        }

        return s.toString()
    }
}

export const codeParser = new CodeParser()
