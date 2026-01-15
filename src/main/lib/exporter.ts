import { BrowserWindow, dialog } from 'electron'
import * as fs from 'fs/promises'
import * as path from 'path'
import { ExportMetadata } from '../../shared/types'

export class ModuleExporter {
    async exportModule(
        projectPath: string,
        metadata: ExportMetadata,
        files: string[],
        stagedFiles?: { sourcePath: string; targetPath: string; type: string; label?: string }[]
    ): Promise<{ success: boolean; path?: string; error?: string }> {
        try {
            // 1. Ask user where to save the module
            const { canceled, filePaths } = await dialog.showOpenDialog({
                title: 'Select Output Directory for New Module',
                properties: ['openDirectory', 'createDirectory']
            })

            if (canceled || filePaths.length === 0) {
                return { success: false, error: 'Cancelled' }
            }

            const outputParentDir = filePaths[0]
            const moduleDir = path.join(outputParentDir, metadata.id)
            const moduleJsonPath = path.join(moduleDir, 'module.json')

            // Check if module already exists
            const existingModuleData: any = {}
            try {
                const existingContent = await fs.readFile(moduleJsonPath, 'utf-8')
                Object.assign(existingModuleData, JSON.parse(existingContent))
            } catch { } // Ignore if new

            // Babele Configuration defaults
            // Standard: use 'translations' or 'compendium' for mapping
            const babeleDirName = metadata.babeleMappingDir || 'translations'
            const registerScriptName = 'babele.js'

            // 2. Create Module Structure
            await fs.mkdir(moduleDir, { recursive: true })
            await fs.mkdir(path.join(moduleDir, 'lang'), { recursive: true })
            await fs.mkdir(path.join(moduleDir, 'scripts'), { recursive: true })
            await fs.mkdir(path.join(moduleDir, babeleDirName), { recursive: true })
            // Optional: styles if needed, but not core for translation only

            // 3. Process and Copy Translation Files
            const languages: { lang: string; name: string; path: string }[] = []
            const esmodules: string[] = []
            let isBabeleModule = false

            // Standardize items into a unified list
            const itemsToProcess: { source: string; target: string; type?: string; label?: string }[] = []

            if (stagedFiles && stagedFiles.length > 0) {
                // Builder Mode: Use staged files
                stagedFiles.forEach(f => {
                    itemsToProcess.push({
                        source: f.sourcePath,
                        target: f.targetPath,
                        type: f.type,
                        label: f.label
                    })
                })
            } else {
                // Legacy Mode
                files.forEach(f => {
                    const source = path.isAbsolute(f) ? f : path.join(projectPath, f)
                    itemsToProcess.push({ source, target: '', type: 'auto' })
                })
            }

            for (const file of itemsToProcess) {
                let { source, target, type } = file
                const outputFormat = (file as any).outputFormat || 'translated'

                let content = ''
                try {
                    content = await fs.readFile(source, 'utf-8')
                } catch (e) { continue }

                // Auto-detect if needed
                if (!target || type === 'auto') {
                    const fileName = path.basename(source)
                    if (source.endsWith('.json')) {
                        let isBabeleFile = false
                        try {
                            const json = JSON.parse(content)
                            if (json.label && (json.entries || json.mapping)) isBabeleFile = true
                        } catch { }

                        if (isBabeleFile) {
                            target = `${babeleDirName}/${fileName}`
                            type = 'babele'
                        } else {
                            target = `lang/${fileName}`
                            type = 'lang'
                        }
                    } else if (source.endsWith('.js')) {
                        target = `scripts/${fileName}`
                        type = 'script'
                    }
                }

                // Enforce structure cleanup - ensure target doesn't have leading slashes
                // and uses correct separators
                const safeTarget = target.replace(/\\/g, '/').replace(/^\//, '')

                // Determine absolute write path
                const targetAbsolute = path.join(moduleDir, safeTarget)

                // Ensure parent directory exists
                await fs.mkdir(path.dirname(targetAbsolute), { recursive: true })

                // Handle outputFormat for JSON files
                if (source.endsWith('.json') && outputFormat === 'bilingual') {
                    // 智能双语处理：读取原文备份并生成双语对照
                    const originalPath = source + '.original'
                    try {
                        const originalContent = await fs.readFile(originalPath, 'utf-8')
                        const translatedData = JSON.parse(content)
                        const originalData = JSON.parse(originalContent)
                        const bilingualData = this.generateBilingual(translatedData, originalData)
                        await fs.writeFile(targetAbsolute, JSON.stringify(bilingualData, null, 2), 'utf-8')
                    } catch (e) {
                        // 如果没有原文备份，直接复制原文件
                        console.warn('No original backup found for bilingual, copying as-is:', source)
                        await fs.copyFile(source, targetAbsolute)
                    }
                } else {
                    // 其他格式直接复制
                    await fs.copyFile(source, targetAbsolute)
                }

                // Metadata Collection
                if (type === 'lang' || safeTarget.startsWith('lang/')) {
                    const fileName = path.basename(safeTarget)
                    let langCode = 'cn'
                    let langName = file.label || `中文-${fileName.replace('.json', '')}` // Use custom label or fallback

                    const lowerName = fileName.toLowerCase()
                    if (lowerName.includes('en')) { langCode = 'en'; langName = 'English' }
                    else if (lowerName.includes('zh-tw')) { langCode = 'zh-tw'; langName = 'Chinese (Traditional)' }
                    // Default to cn/zh-cn if not English or TW

                    // Allow multiple entries!
                    languages.push({
                        lang: langCode,
                        name: langName,
                        path: safeTarget
                    })
                } else if (type === 'script' || safeTarget.startsWith('scripts/')) {
                    if (!esmodules.includes(safeTarget)) {
                        esmodules.push(safeTarget)
                    }
                } else if (type === 'babele' || safeTarget.startsWith(babeleDirName) || safeTarget.startsWith('translations') || safeTarget.startsWith('compendium')) {
                    isBabeleModule = true
                }
            }

            // 4. Handle module.json (Merge logic)
            const moduleData = {
                id: metadata.id,
                title: metadata.title,
                description: metadata.description || `Translation for ${metadata.title}`,
                version: metadata.version || '1.0.0',
                authors: metadata.authors || [],
                compatibility: metadata.compatibility || { minimum: "10", verified: "11", maximum: "12" },
                relationships: metadata.relationships || { systems: [], requires: [] },
                esmodules: existingModuleData.esmodules || [], // Keep existing if any, we merge ours later
                languages: existingModuleData.languages || [],
                systems: existingModuleData.systems || [],
                url: metadata.url || existingModuleData.url,
                manifest: metadata.manifest || existingModuleData.manifest,
                download: metadata.download || existingModuleData.download,
                // Additional properties
                styles: existingModuleData.styles || [],
                packs: existingModuleData.packs || [],
                license: metadata.license || existingModuleData.license,
                readme: metadata.readme || existingModuleData.readme
            }

            // Sync systems/relationships
            if (metadata.relationships?.systems) {
                moduleData.systems = metadata.relationships.systems.map(s => s.id)
                moduleData.relationships.systems = metadata.relationships.systems
            }

            // Merge Languages
            languages.forEach(l => {
                if (!moduleData.languages.some((el: any) => el.path === l.path)) {
                    moduleData.languages.push(l)
                }
            })

            // Merge ESModules
            esmodules.forEach(m => {
                if (!moduleData.esmodules.includes(m)) {
                    moduleData.esmodules.push(m)
                }
            })

            // 5. Babele & Script Generation (The "Gold Standard" Logic)
            if (isBabeleModule) {
                // Determine target system ID from relationships or guess
                let targetId = 'TARGET_ID'
                if (moduleData.relationships.systems && moduleData.relationships.systems.length > 0) {
                    targetId = moduleData.relationships.systems[0].id
                } else if (metadata.id.includes('pf1')) {
                    targetId = 'pf1' // Hardcode guess for pf1 based on user context
                } else if (metadata.id.endsWith('-zh')) {
                    targetId = metadata.id.replace(/-zh$/, '')
                }

                const registerScriptPath = `scripts/${registerScriptName}`
                const absoluteScriptPath = path.join(moduleDir, registerScriptPath)

                // Determine language code from registered languages or default to 'zh-cn'
                // Determine language code from registered languages or default to 'cn'
                // User specifically requested to avoid 'zh-cn' for Babele
                let primaryLang = languages.length > 0 ? languages[0].lang : 'cn'
                if (primaryLang === 'zh-cn') primaryLang = 'cn'

                // Generate Standard Babele Script (inspired by pf1e_compendium_chn)
                const babeleScriptContent = `Hooks.once('babele.init', (babele) => {
    // Auto-register Babele
    babele.register({
        module: '${moduleData.id}',
        lang: '${primaryLang}',
        dir: '${babeleDirName}',
        // If your files are not named exactly like the compendium packs (e.g. "pf1.spells.json"),
        // you must use the 'files' array to map them manually:
        /*
        files: [
            { path: "companions.json", id: "pf1.pf-companions" },
            { path: "spells.json", id: "pf1.spells" }
        ]
        */
    });
});
`
                // write file (overwrite to ensure correctness for "builder" mode)
                await fs.writeFile(absoluteScriptPath, babeleScriptContent.trim())

                // Ensure it's in esmodules
                if (!moduleData.esmodules.includes(registerScriptPath)) {
                    moduleData.esmodules.push(registerScriptPath)
                }

                // Ensure Babele dependency
                moduleData.relationships.requires = moduleData.relationships.requires || []
                if (!moduleData.relationships.requires.some((r: any) => r.id === 'babele')) {
                    moduleData.relationships.requires.push({
                        id: 'babele',
                        type: 'module',
                        manifest: 'https://gitlab.com/riccisi/foundryvtt-babele/raw/master/module/module.json'
                    })
                }
            }

            // 6. Write module.json with standard field ordering
            // Important: Use flattened keys if that is what the user implies is 'correct' for their legacy reference?
            // BUT strict V12 uses nested. The user complaint about "two lines" might refer to the visual clutter of objects?
            // Let's keep nested but ensure it is clean.

            const finalModuleData: any = {
                id: moduleData.id,
                title: moduleData.title,
                description: moduleData.description,
                version: moduleData.version,
                authors: moduleData.authors,
                compatibility: moduleData.compatibility,
                relationships: {
                    systems: moduleData.relationships.systems || [],
                    requires: moduleData.relationships.requires || []
                },
                // Flatten styles/esmodules/languages to top level
                esmodules: moduleData.esmodules,
                styles: moduleData.styles || [],
                languages: moduleData.languages,
                packs: moduleData.packs || [],

                url: moduleData.url,
                manifest: moduleData.manifest,
                download: moduleData.download,
                license: moduleData.license,
                readme: moduleData.readme
            }

            // Remove nested flags if empty
            // ...

            // Remove undefined keys
            Object.keys(finalModuleData).forEach(key => finalModuleData[key] === undefined && delete finalModuleData[key])

            await fs.writeFile(moduleJsonPath, JSON.stringify(finalModuleData, null, 2), 'utf-8')

            return { success: true, path: moduleDir }

        } catch (error: any) {
            console.error("Export failed:", error)
            return { success: false, error: error.message }
        }
    }

    async getModuleInfo(projectPath: string): Promise<Partial<ExportMetadata>> {
        try {
            const moduleJsonPath = path.join(projectPath, 'module.json')
            const content = await fs.readFile(moduleJsonPath, 'utf-8')
            const data = JSON.parse(content)

            // Convert old author format (string vs object) if needed, but Foundry allows both?
            // V12 strictly prefers arrays.
            let authors = data.authors || []
            if (typeof data.author === 'string') {
                authors = [{ name: data.author }]
            }

            return {
                id: data.id ? `${data.id}-zh` : '',
                title: data.title ? `${data.title} (Chinese)` : '',
                description: data.description || '',
                version: data.version || '1.0.0',
                authors: authors,
                compatibility: data.compatibility,
                relationships: data.relationships,
                url: data.url,
                manifest: data.manifest,
                download: data.download
            }
        } catch (e) {
            // File might not exist, return empty
            return {}
        }
    }

    /**
     * 生成智能双语对照
     * @param translatedData 翻译后的 JSON 数据
     * @param originalData 原始 JSON 数据
     * @param threshold 字符长度阈值（小于此长度的使用双语）
     * @returns 双语对照后的 JSON 数据
     */
    generateBilingual(
        translatedData: any,
        originalData: any,
        threshold: number = 50
    ): any {
        const merge = (translated: any, original: any): any => {
            if (typeof translated === 'string' && typeof original === 'string') {
                // 智能判断：短语使用双语，长句仅保留翻译
                if (original.length < threshold && translated !== original) {
                    // 格式：中文 英文（用空格分隔）
                    return `${translated} ${original}`
                }
                return translated
            }

            if (Array.isArray(translated) && Array.isArray(original)) {
                return translated.map((item, i) => merge(item, original[i] ?? item))
            }

            if (typeof translated === 'object' && typeof original === 'object' && translated !== null) {
                const result: any = {}
                for (const key of Object.keys(translated)) {
                    result[key] = merge(translated[key], original?.[key] ?? translated[key])
                }
                return result
            }

            return translated
        }

        return merge(translatedData, originalData)
    }
}

export const moduleExporter = new ModuleExporter()
