import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Save, Sparkles, AlertCircle, FilePlus, BookPlus, X, PackagePlus, EyeOff, Eye } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { useModuleBuilder } from '../lib/moduleBuilderStore'
import { useTranslationStore, TranslationItem } from '../lib/translationStore'
import { PromptModal } from './PromptModal'

// TranslationItem is now imported from translationStore

export function TranslationEditor({ file, projectPath, onSave, onBack }: { file: string, projectPath: string | null, onSave: (items: TranslationItem[]) => void, onBack: () => void }): JSX.Element {
    const { t } = useI18n()
    const { addStagedFile, autoDetectType } = useModuleBuilder()

    // 使用全局 store 代替 useState，切换视图时保持状态
    const {
        items,
        setItems,
        updateItemsBatch,
        isBabeleFormat,
        setIsBabeleFormat,
        translating,
        setTranslating,
        currentFile,
        setCurrentFile,
        shouldReload
    } = useTranslationStore()

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // 只在文件变化时重新加载
        if (shouldReload(file)) {
            setCurrentFile(file)
            loadContent()
        } else {
            setLoading(false)
        }
    }, [file])

    const loadContent = async () => {
        setLoading(true)
        try {
            if (file.endsWith('.json')) {
                const data = await (window as any).api.readJson(file)

                // 自动备份原文件（如果尚未备份）
                const backupPath = file + '.original'
                try {
                    await (window as any).api.readFile(backupPath)
                    // 备份已存在，不做任何事
                } catch {
                    // 备份不存在，创建备份
                    await (window as any).api.writeJson(backupPath, data)
                    console.log('Created original backup:', backupPath)
                }

                // Detect Babele format
                const isBabele = data.hasOwnProperty('label') && (data.hasOwnProperty('entries') || data.hasOwnProperty('mapping'))
                setIsBabeleFormat(isBabele)

                // Helper to flatten nested objects with handling for array-like objects if needed
                // Using ':::' as separator to avoid issues with dots in keys
                const flatten = (obj: any, prefix = ''): Record<string, string> => {
                    const separator = ':::'
                    let acc: Record<string, string> = {}

                    for (const key in obj) {
                        const newKey = prefix ? prefix + separator + key : key

                        if (typeof obj[key] === 'object' && obj[key] !== null) {
                            Object.assign(acc, flatten(obj[key], newKey))
                        } else if (typeof obj[key] === 'string') {
                            acc[newKey] = obj[key]
                        }
                    }
                    return acc
                }

                const flatData = flatten(data)

                // Get blacklist concurrently
                const blacklistArr = await (window as any).api.getBlacklist()

                // Debug: Show sample of flattened keys
                const allKeys = Object.keys(flatData)

                const loadedItems = Object.entries(flatData)
                    .filter(([key]) => {
                        // Normalize key: internal flatten uses ':::' but user blacklist uses dots
                        const normalizedKey = key.replace(/:::/g, '.')
                        // Check if any blacklist entry is a suffix of the key (partial match)
                        const isBlocked = blacklistArr.some((pattern: string) => normalizedKey.endsWith(pattern))
                        return !isBlocked
                    }) // Filter blacklisted keys immediately!
                    .map(([key, value]) => ({
                        id: key,
                        // Key is ID. Original text is the VALUE.
                        original: value,
                        translation: value
                    }))

                setItems(loadedItems)
            } else if (file.endsWith('.js')) {
                setIsBabeleFormat(false)
                const result = await (window as any).api.scanFile(file)
                const loadedItems = result.items.map((item: any) => ({
                    id: item.id,
                    original: item.original,
                    translation: item.translation || ''
                }))
                setItems(loadedItems)
            }
        } catch (error) {
            console.error(error)
            setError(t.errorLoad)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveFile = async (saveAs: boolean = false) => {
        try {
            let targetPath = file

            if (saveAs || file.endsWith('.js')) {
                // Force Save As for JS files unless explicitly handled otherwise in future
                // Or if user clicked "Save As"
                const ext = file.split('.').pop()
                const defaultName = file.replace(`.${ext}`, `_zh.${ext}`)
                const selectedPath = await (window as any).api.showSaveDialog(defaultName)
                if (!selectedPath) return // Canceled
                targetPath = selectedPath
            }

            if (targetPath.endsWith('.json')) {
                // Helper to unflatten keys (custom separator) back to nested objects
                const unflatten = (data: Record<string, string>): Record<string, any> => {
                    const result: Record<string, any> = {}
                    const separator = ':::' // Use a separator unlikely to be in keys

                    for (const i in data) {
                        const keys = i.split(separator)
                        let current = result

                        for (let j = 0; j < keys.length; j++) {
                            const key = keys[j]
                            if (j === keys.length - 1) {
                                current[key] = data[i]
                            } else {
                                current[key] = current[key] || {}
                                current = current[key]
                            }
                        }
                    }
                    return result
                }

                const flatData: Record<string, string> = {}
                items.forEach(item => {
                    flatData[item.id] = item.translation
                })

                const nestedData = unflatten(flatData)
                await (window as any).api.writeJson(targetPath, nestedData)
            } else if (targetPath.endsWith('.js')) {
                // Prepare translations map
                const translationMap: Record<string, string> = {}
                items.forEach(item => {
                    // Only include items that are translated and different from original
                    // Use item.id which contains location info to ensure correctness
                    if (item.translation && item.translation !== item.original) {
                        translationMap[item.id] = item.translation
                    }
                })

                // Apply patch to get new content
                // Note: We are using the ORIGINAL file path to scan/patch, but writing to targetPath
                // If saving over same file, this is fine.
                // If saving as new file, we still patch the original source content.
                const patchedContent = await (window as any).api.applyPatch(file, translationMap)

                await (window as any).api.writeFile(targetPath, patchedContent)
            }

            onSave(items)
        } catch (error) {
            console.error(error)
            setError(t.errorSave)
        }
    }

    const isTranslatingRef = useRef(false)

    // Ensure ref matches state on mount/unmount safety
    useEffect(() => {
        return () => {
            isTranslatingRef.current = false
        }
    }, [])

    const handleAutoTranslate = async () => {
        // Toggle logic
        if (translating) {
            setTranslating(false)
            isTranslatingRef.current = false
            return
        }

        const savedSettings = localStorage.getItem('fvtt-translator-settings')
        if (!savedSettings) {
            setError(t.configureSettings)
            return
        }

        const config = JSON.parse(savedSettings)
        if (!config.apiKey) {
            setError(t.apiKey + ' Missing')
            return
        }

        setTranslating(true)
        isTranslatingRef.current = true
        setError(null)

        const processedIds = new Set<string>()
        let consecutiveFailures = 0

        try {
            while (isTranslatingRef.current) {
                // Get fresh list of items from store
                const currentItems = useTranslationStore.getState().items

                // Find untranslated items that haven't been attempted in this session
                const untranslated = currentItems.filter(i =>
                    (!i.translation || i.translation === i.original) && !processedIds.has(i.id)
                )

                if (untranslated.length === 0) {
                    // Check if there are ANY untranslated items left (even ones we tried)
                    const anyUntranslated = currentItems.some(i => !i.translation || i.translation === i.original)
                    if (anyUntranslated && processedIds.size > 0) {
                        // We tried everything but some failed. Stop.
                        if (consecutiveFailures > 0) {
                            setError(t.errorBatchNetwork || "Network error. Stopped.")
                        }
                    }
                    break
                }

                const batch = untranslated.slice(0, 10)

                // Mark as processed immediately so we don't pick them up again if they fail silently
                batch.forEach(i => processedIds.add(i.id))

                // Process batch in parallel
                const results = await Promise.all(batch.map(async (item) => {
                    try {
                        const translation = await (window as any).api.translate(item.original, config, projectPath)
                        return { id: item.id, translation, original: item.original }
                    } catch (e) {
                        console.error(`Error translating ${item.id}:`, e)
                        return null
                    }
                }))

                // Check if ENTIRE batch failed
                const successCount = results.filter(r => r !== null).length

                if (successCount === 0) {
                    consecutiveFailures++
                    // If 3 batches fail in a row, assume network/API is down and stop
                    if (consecutiveFailures >= 3) {
                        setError(t.errorBatchNetwork || "Too many failures. Stopping.")
                        break
                    }
                } else {
                    consecutiveFailures = 0
                }

                // Update state with results
                if (successCount > 0) {
                    const updates = new Map<string, string>()
                    results.forEach(res => {
                        if (res) {
                            updates.set(res.original, res.translation)
                        }
                    })
                    updateItemsBatch(updates)
                }

                // Small delay
                await new Promise(r => setTimeout(r, 500))
            }
        } catch (e: any) {
            console.error("Auto translate loop error:", e)
            setError(e.message || "Unknown error")
        } finally {
            setTranslating(false)
            isTranslatingRef.current = false
        }
    }

    const handleAddToGlossary = async (original: string, translation: string) => {
        if (!original || !translation || original === translation) return

        try {
            // Get list of glossaries
            const glossaries = await (window as any).api.listGlossaries()
            const activeGlossaries = await (window as any).api.getActiveGlossaries()

            // Use first active glossary, or create default one
            let targetGlossary = activeGlossaries.length > 0 ? activeGlossaries[0] : null

            if (!targetGlossary) {
                // Create default glossary if none exists
                await (window as any).api.createGlossary('default')
                await (window as any).api.setActiveGlossaries(['default'])
                targetGlossary = 'default'
            }

            // Load existing entries
            const entries = await (window as any).api.loadGlossary(targetGlossary)

            // Check if term already exists
            const exists = entries.some((e: any) => e.term === original)
            if (exists) {
                alert('This term already exists in the glossary!')
                return
            }

            // Add new term
            const newEntries = [...entries, { term: original, definition: translation, context: '' }]
            await (window as any).api.saveGlossary(targetGlossary, newEntries)

            alert(`Term added to glossary "${targetGlossary}"!`)
        } catch (e) {
            console.error(e)
            setError('Failed to add to glossary')
        }
    }

    const [promptOpen, setPromptOpen] = useState(false)
    const [promptConfig, setPromptConfig] = useState<{ title: string; defaultValue: string; onConfirm: (val: string) => void }>({ title: '', defaultValue: '', onConfirm: () => { } })

    const openPrompt = (title: string, defaultValue: string, onConfirm: (val: string) => void) => {
        setPromptConfig({ title, defaultValue, onConfirm })
        setPromptOpen(true)
    }

    return (
        <div className="flex flex-col h-full bg-[#FAFAF7] text-slate-700 relative">
            <PromptModal
                isOpen={promptOpen}
                title={promptConfig.title}
                defaultValue={promptConfig.defaultValue}
                onConfirm={promptConfig.onConfirm}
                onClose={() => setPromptOpen(false)}
            />
            {/* Toolbar - Clay Style */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/50 backdrop-blur-sm shrink-0 shadow-sm z-20">
                <div className="flex flex-col min-w-0 flex-1 mr-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                            title={t.closeFile || "Close"}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="text-xl font-bold truncate text-slate-800" title={file}>{file.split(/[/\\]/).pop()}</h2>
                        {isBabeleFormat && (
                            <span className="px-2.5 py-0.5 text-xs bg-orange-100 text-orange-600 border border-orange-200 rounded-full font-bold whitespace-nowrap shadow-sm">
                                Babele
                            </span>
                        )}
                        {/* Progress Badge */}
                        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-slate-200 shadow-sm">
                            <div className="text-xs font-bold text-blue-500">
                                {Math.round((items.filter(i => /[\u4e00-\u9fa5]/.test(i.translation)).length / items.length) * 100) || 0}%
                            </div>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-400"
                                    style={{ width: `${Math.round((items.filter(i => /[\u4e00-\u9fa5]/.test(i.translation)).length / items.length) * 100) || 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                    <span className="text-xs text-slate-400 truncate ml-9" title={file}>{file}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={handleAutoTranslate}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm font-bold border shadow-sm
                        ${translating
                                ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100 animate-pulse'
                                : 'bg-white text-purple-600 border-purple-100 hover:border-purple-300 hover:shadow-md'}`}
                        title={translating ? t.stopTranslating : t.autoTranslate}
                    >
                        {translating ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                        ) : (
                            <Sparkles size={16} />
                        )}
                        <span className="hidden sm:inline">{translating ? t.stopTranslating : t.autoTranslate}</span>
                    </button>

                    <div className="h-8 w-px bg-slate-200 mx-1" />

                    <button
                        onClick={async () => {
                            // Safe Staging: Create a temp copy instead of overwriting original
                            // Filter out ignored items
                            const validItems = items.filter(i => i.id !== 'system.description.value')

                            // Apply Bilingual Format (Heuristic: Translation + Original for short text)
                            const flatStagedContent: Record<string, any> = {}
                            validItems.forEach(item => {
                                let value = item.translation || item.original
                                // Heuristic: If short (likely name/term) and has translation, append original
                                const isShort = item.original.length < 50 && !/[\n\r]/.test(item.original)
                                const hasTranslation = item.translation && item.translation !== item.original

                                if (isShort && hasTranslation) {
                                    value = `${item.translation} ${item.original}`
                                }
                                flatStagedContent[item.id] = value
                            })

                            // Helper to unflatten keys (custom separator) back to nested objects
                            const unflatten = (data: Record<string, string>): Record<string, any> => {
                                const result: Record<string, any> = {}
                                const separator = ':::'

                                for (const i in data) {
                                    const keys = i.split(separator)
                                    let current = result

                                    for (let j = 0; j < keys.length; j++) {
                                        const key = keys[j]
                                        if (j === keys.length - 1) {
                                            current[key] = data[i]
                                        } else {
                                            current[key] = current[key] || {}
                                            current = current[key]
                                        }
                                    }
                                }
                                return result
                            }

                            const nestedStagedContent = unflatten(flatStagedContent)

                            // Save to a temp staging file
                            // Using a simple convention: original.json -> original.staged.json in same dir (safest for relative paths)
                            // or better, ask main process to save to temp. For now, let's use a suffix to avoid overwrite.
                            const stagedPath = file.replace(/\.json$/, '.staged.json')

                            try {
                                await (window as any).api.writeJson(stagedPath, nestedStagedContent)

                                const fileName = file.split(/[/\\]/).pop() || 'file'
                                // Smart Detection: Pass content string to helper
                                const contentStr = JSON.stringify(nestedStagedContent)
                                const { type, targetPath } = autoDetectType(fileName, contentStr)

                                openPrompt(t.targetPathPrompt || 'Target Path', targetPath, (input) => {
                                    if (input) {
                                        addStagedFile({
                                            sourcePath: stagedPath, // Use the staged file!
                                            targetPath: input,
                                            type: type
                                        })
                                        // Removed blocking alert to prevent UI focus issues
                                    }
                                })
                            } catch (e) {
                                console.error(e)
                                setError("Failed to create staging file")
                            }
                        }}
                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 border border-slate-200 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                        title={t.addToModule}
                    >
                        <PackagePlus size={18} />
                        <span className="hidden lg:inline">{t.addToModule}</span>
                    </button>

                    <div className="flex items-center rounded-xl bg-white border border-slate-200 p-1 shadow-sm">
                        <button
                            onClick={() => handleSaveFile(false)}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 hover:text-green-600 transition-colors flex items-center gap-2 px-3 hover:shadow-sm"
                            title={t.save}
                        >
                            <Save size={18} />
                            <span className="hidden md:inline text-sm font-bold">{t.save}</span>
                        </button>
                        <div className="w-px h-5 bg-slate-100 mx-1" />
                        <button
                            onClick={() => handleSaveFile(true)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-400 hover:text-blue-500 transition-colors hover:shadow-sm"
                            title={t.saveAs}
                        >
                            <FilePlus size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border-b border-rose-100 p-3 text-center text-rose-500 text-sm flex items-center justify-center gap-2 font-medium">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-[#FAFAF7]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4 animate-pulse">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                        <span className="text-blue-400 font-medium">{t.translating}...</span>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-[1fr_1fr_40px_40px_40px] gap-6 mb-4 font-bold text-slate-400 px-4 sticky top-0 bg-[#FAFAF7]/95 py-3 z-10 backdrop-blur-sm border-b border-slate-100 uppercase text-xs tracking-wider">
                            <div>{t.original}</div>
                            <div>{t.translation}</div>
                            <div className="text-center">{t.status}</div>
                            <div className="text-center" title="忽略"><EyeOff size={16} className="mx-auto" /></div>
                            <div></div>
                        </div>

                        <div className="space-y-3 pb-8">
                            {items.filter(i => i.id !== 'system.description.value').map(item => (
                                <div
                                    key={item.id}
                                    className={`clay-card grid grid-cols-[1fr_1fr_40px_40px_40px] gap-6 items-start p-4 transition-all duration-300 ${item.isIgnored
                                        ? 'bg-slate-50 border-slate-100 opacity-60 grayscale'
                                        : 'hover:border-blue-200 hover:shadow-md'
                                        }`}
                                >
                                    <div className={`font-mono text-sm break-words select-text pt-2 leading-relaxed ${item.isIgnored ? 'text-slate-400 line-through' : 'text-slate-600'}`}>
                                        {item.original}
                                    </div>
                                    <textarea
                                        className={`input-field w-full min-h-[42px] leading-relaxed resize-y ${item.isIgnored ? 'text-slate-400 bg-slate-50 shadow-none border-transparent' : ''}`}
                                        value={item.translation}
                                        disabled={item.isIgnored}
                                        onChange={(e) => {
                                            const newVal = e.target.value
                                            const newItems = items.map(i =>
                                                // Sync translation for all items with same original text
                                                i.original === item.original ? { ...i, translation: newVal } : i
                                            )
                                            setItems(newItems)
                                        }}
                                        rows={Math.max(2, Math.min(10, Math.ceil(item.translation.length / 50)))}
                                    />

                                    <div className="flex justify-center pt-3">
                                        <div
                                            className={`w-3 h-3 rounded-full shadow-sm ${item.isIgnored
                                                ? 'bg-slate-300'
                                                : (item.translation !== item.original || /[\u4e00-\u9fa5]/.test(item.translation))
                                                    ? 'bg-green-400 ring-2 ring-green-100'
                                                    : 'bg-rose-400 ring-2 ring-rose-100'
                                                }`}
                                            title={item.isIgnored ? '已忽略' : ((item.translation !== item.original || /[\u4e00-\u9fa5]/.test(item.translation)) ? (t.translated || "Translated") : (t.untranslated || "Untranslated"))}
                                        />
                                    </div>

                                    <div className="flex justify-center pt-1">
                                        <button
                                            onClick={() => {
                                                const newItems = items.map(i =>
                                                    i.id === item.id ? { ...i, isIgnored: !i.isIgnored } : i
                                                )
                                                setItems(newItems)
                                            }}
                                            className={`p-2 rounded-lg transition-colors ${item.isIgnored
                                                ? 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100'
                                                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                                }`}
                                            title={item.isIgnored ? '取消忽略' : '忽略此条'}
                                        >
                                            {item.isIgnored ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>

                                    <div className="flex justify-center pt-1">
                                        <button
                                            onClick={() => handleAddToGlossary(item.original, item.translation)}
                                            disabled={!item.translation || item.translation === item.original || item.isIgnored}
                                            className="p-2 rounded-lg hover:bg-purple-50 text-purple-400 hover:text-purple-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-sm"
                                            title={t.addToGlossary}
                                        >
                                            <BookPlus size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
