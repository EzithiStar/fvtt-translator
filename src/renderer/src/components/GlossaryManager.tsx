import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Book, X, FolderPlus, Upload, FileSearch, CheckSquare, Square } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { GlossaryEntry } from '../../../shared/types'

// Extracted term for preview
interface ExtractedTerm {
    key: string
    value: string
    selected: boolean
}

interface GlossaryFile {
    name: string
    enabled: boolean
    entryCount: number
}

interface GlossaryManagerProps {
    isOpen: boolean
    onClose: () => void
    inline?: boolean
}

export function GlossaryManager({ isOpen, onClose, inline = false }: GlossaryManagerProps): JSX.Element | null {
    const { t } = useI18n()
    const [glossaries, setGlossaries] = useState<GlossaryFile[]>([])
    const [selectedGlossary, setSelectedGlossary] = useState<string | null>(null)
    const [entries, setEntries] = useState<GlossaryEntry[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [showNameInput, setShowNameInput] = useState(false)
    const [newGlossaryName, setNewGlossaryName] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    // Extraction feature states
    const [showExtractModal, setShowExtractModal] = useState(false)
    const [extractedTerms, setExtractedTerms] = useState<ExtractedTerm[]>([])
    const [extractFileName, setExtractFileName] = useState('')

    useEffect(() => {
        if (isOpen) {
            loadGlossaries()
        }
    }, [isOpen])

    // Reset to page 1 when search term changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm])

    const loadGlossaries = async () => {
        setLoading(true)
        try {
            const list = await (window as any).api.listGlossaries()
            setGlossaries(list)
            if (list.length > 0 && !selectedGlossary) {
                setSelectedGlossary(list[0].name)
                loadGlossary(list[0].name)
            } else if (selectedGlossary) {
                loadGlossary(selectedGlossary)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const loadGlossary = async (name: string) => {
        try {
            const data = await (window as any).api.loadGlossary(name)
            setEntries(data || [])
        } catch (error) {
            console.error(error)
        }
    }

    const handleSave = async () => {
        if (!selectedGlossary) return
        setLoading(true)
        try {
            await (window as any).api.saveGlossary(selectedGlossary, entries)
            await loadGlossaries()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }


    const handleCreateGlossary = () => {
        setShowNameInput(true)
        setNewGlossaryName('')
    }

    const handleConfirmCreate = async () => {
        if (!newGlossaryName || newGlossaryName.trim() === '') {
            setShowNameInput(false)
            return
        }
        try {
            const success = await (window as any).api.createGlossary(newGlossaryName.trim())
            if (success) {
                await loadGlossaries()
                setSelectedGlossary(newGlossaryName.trim())
                setEntries([])
                setShowNameInput(false)
                alert(t.glossaryCreatedSuccess || 'Glossary created successfully!')
            } else {
                alert(t.failedToCreateGlossary || 'Failed to create glossary')
            }
        } catch (error) {
            console.error('Failed to create glossary:', error)
            alert(`${t.failedToCreateGlossary || 'Error'}: ${error}`)
        }
    }

    const handleDeleteGlossary = async (name: string) => {
        if (!confirm(`${t.deleteConfirm || 'Delete glossary'} "${name}"?`)) return
        try {
            await (window as any).api.deleteGlossary(name)
            if (selectedGlossary === name) {
                setSelectedGlossary(null)
                setEntries([])
            }
            await loadGlossaries()
        } catch (error) {
            console.error(error)
        }
    }

    const handleToggleEnabled = async (name: string, enabled: boolean) => {
        try {
            const activeGlossaries = await (window as any).api.getActiveGlossaries()
            const updated = enabled
                ? [...activeGlossaries, name]
                : activeGlossaries.filter((n: string) => n !== name)
            await (window as any).api.setActiveGlossaries(updated)
            await loadGlossaries()
        } catch (error) {
            console.error(error)
        }
    }

    const handleImport = async () => {
        if (!selectedGlossary) {
            alert(t.selectGlossaryFirst || 'Please select a glossary first')
            return
        }
        try {
            const filePath = await (window as any).api.selectFile(['.json'])
            if (!filePath) return
            const imported = await (window as any).api.importGlossary(filePath)
            if (imported && imported.length > 0) {
                setEntries(prev => [...prev, ...imported])
                const message = (t.importedTerms || 'Imported {count} terms').replace('{count}', imported.length.toString())
                alert(message)
            } else {
                alert(t.noTermsFound || 'No terms found in file')
            }
        } catch (error) {
            console.error(error)
            alert(`${t.importFailed || 'Import failed'}: ${error}`)
        }
    }

    const handleLoadPreset = async () => {
        if (!selectedGlossary) {
            alert(t.selectGlossaryFirst || 'Please select a glossary first')
            return
        }
        if (!confirm(t.pf1ePresetConfirm || "Load Pathfinder 1e Core Glossary? This will be merged into the current glossary.")) return;

        setLoading(true);
        try {
            const presetModule = await import('../data/glossaries/pathfinder1e.json');
            const presetTerms = presetModule.default || presetModule;

            const newEntries = Object.entries(presetTerms).map(([term, definition]) => ({
                term,
                definition: definition as string,
                context: 'PF1e Core'
            }));

            setEntries(prev => [...prev, ...newEntries]);
            const message = (t.pf1eLoadedTerms || 'Loaded {count} terms.').replace('{count}', newEntries.length.toString());
            alert(message);
        } catch (error) {
            console.error(error);
            alert(`${t.pf1eLoadFailed || 'Failed to load preset'}: ${error}`);
        } finally {
            setLoading(false)
        }
    }

    // ===== EXTRACTION FROM TRANSLATED FILE =====
    const handleExtractFromFile = async () => {
        if (!selectedGlossary) {
            alert(t.selectGlossaryFirst || 'Please select a glossary first')
            return
        }
        try {
            const filePath = await (window as any).api.selectFile(['.json'])
            if (!filePath) return

            const content = await (window as any).api.readFile(filePath)
            const json = JSON.parse(content)

            // Flatten JSON and extract terms
            const terms: ExtractedTerm[] = []
            const flatten = (obj: any, prefix = '') => {
                for (const key in obj) {
                    const fullKey = prefix ? `${prefix}.${key}` : key
                    const val = obj[key]

                    if (typeof val === 'object' && val !== null) {
                        flatten(val, fullKey)
                    } else if (typeof val === 'string') {
                        // Smart filter logic
                        const keyLower = key.toLowerCase()
                        const lastSegment = fullKey.split('.').pop() || ''

                        // Skip descriptions, hints, long texts
                        if (/desc|hint|description|message|info|help/i.test(keyLower)) continue
                        if (val.length > 30) continue
                        if (val.includes('{') || val.includes('<')) continue
                        if (!val.trim()) continue

                        // Use last non-Label/Name segment as the "original term"
                        // e.g. for "Health.Label": "生命值", use "Health" as term
                        let termName = lastSegment
                        if (/^(label|name|single|plural|short)$/i.test(lastSegment)) {
                            const parts = fullKey.split('.')
                            termName = parts.length > 1 ? parts[parts.length - 2] : lastSegment
                        }

                        // Skip if termName looks like a variable/code
                        if (/^[a-z]{1,2}$/.test(termName)) continue // e.g. "l", "c"
                        if (/^(Short|Abbr)$/i.test(termName)) continue

                        terms.push({
                            key: termName,
                            value: val,
                            selected: true
                        })
                    }
                }
            }
            flatten(json)

            // Deduplicate by key (keep first occurrence)
            const seen = new Set<string>()
            const uniqueTerms = terms.filter(t => {
                if (seen.has(t.key)) return false
                seen.add(t.key)
                return true
            })

            setExtractedTerms(uniqueTerms)
            setExtractFileName(filePath.split(/[\\/]/).pop() || 'file')
            setShowExtractModal(true)

        } catch (error) {
            console.error(error)
            alert(`${t.extractFailed || 'Failed to extract terms'}: ${error}`)
        }
    }

    const handleImportExtracted = () => {
        const selected = extractedTerms.filter(t => t.selected)
        if (selected.length === 0) {
            alert(t.noTermsSelected || 'No terms selected')
            return
        }
        const newEntries = selected.map(t => ({
            term: t.key,
            definition: t.value,
            context: 'Extracted'
        }))
        setEntries(prev => [...prev, ...newEntries])
        setShowExtractModal(false)
        const message = (t.importedTerms || 'Imported {count} terms').replace('{count}', selected.length.toString())
        alert(message)
    }

    const toggleAllExtracted = (selectAll: boolean) => {
        setExtractedTerms(prev => prev.map(t => ({ ...t, selected: selectAll })))
    }

    const toggleExtractedTerm = (index: number) => {
        setExtractedTerms(prev => {
            const next = [...prev]
            next[index] = { ...next[index], selected: !next[index].selected }
            return next
        })
    }

    const addEntry = () => {
        setEntries(prev => [{ term: '', definition: '', context: '' }, ...prev])
    }

    const removeEntry = (index: number) => {
        setEntries(prev => prev.filter((_, i) => i !== index))
    }

    const updateEntry = (index: number, field: keyof GlossaryEntry, value: string) => {
        setEntries(prev => {
            const next = [...prev]
            next[index] = { ...next[index], [field]: value }
            return next
        })
    }

    const filteredEntries = entries.filter(e =>
        e.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.definition.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Performance optimization: paginated entries
    const PAGE_SIZE = 100
    const totalPages = Math.ceil(filteredEntries.length / PAGE_SIZE)
    const startIndex = (currentPage - 1) * PAGE_SIZE
    const displayedEntries = filteredEntries.slice(startIndex, startIndex + PAGE_SIZE)
    const hasMore = filteredEntries.length > PAGE_SIZE

    if (!isOpen) return null

    // Inline Layout (Mobile/SidePanel friendly)
    if (inline) {
        return (
            <div className="flex flex-col h-full bg-transparent">
                {/* Custom Input Dialog (same as modal) */}
                {showNameInput && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-bold text-white mb-4">{t.newGlossary}</h3>
                            <input
                                type="text"
                                value={newGlossaryName}
                                onChange={(e) => setNewGlossaryName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleConfirmCreate()}
                                placeholder={t.enterGlossaryName || 'Enter name...'}
                                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                autoFocus
                            />
                            <div className="flex gap-3 mt-4">
                                <button onClick={handleConfirmCreate} className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded">{t.save}</button>
                                <button onClick={() => setShowNameInput(false)} className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded">{t.cancel}</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Controls */}
                <div className="p-3 space-y-3 bg-white/30 backdrop-blur-sm border-b border-white/20">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 bg-white/60 rounded-lg border border-white/40 px-2 py-0.5 shadow-sm">
                            {/* Active Toggle for Current Glossary */}
                            {selectedGlossary && (
                                <input
                                    type="checkbox"
                                    checked={glossaries.find(g => g.name === selectedGlossary)?.enabled || false}
                                    onChange={(e) => handleToggleEnabled(selectedGlossary, e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                    title={t.enableGlossary || "Enable glossary for translation"}
                                />
                            )}
                            <select
                                value={selectedGlossary || ''}
                                onChange={(e) => {
                                    const val = e.target.value
                                    if (val === '__NEW__') {
                                        handleCreateGlossary()
                                    } else {
                                        setSelectedGlossary(val)
                                        loadGlossary(val)
                                    }
                                }}
                                className="flex-1 bg-transparent border-none text-sm focus:ring-0 text-slate-700 font-medium py-1.5"
                            >
                                {glossaries.length === 0 && <option value="" disabled>{t.noTermsYet || 'No glossaries'}</option>}
                                {glossaries.map(g => (
                                    <option key={g.name} value={g.name}>
                                        {g.enabled ? '✓ ' : ''}{g.name} ({g.entryCount})
                                    </option>
                                ))}
                                <option value="__NEW__" className="text-purple-600 font-bold border-t">+ {t.newGlossary}</option>
                            </select>
                        </div>

                        <button onClick={handleSave} disabled={loading || !selectedGlossary} className="p-2 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white rounded-lg shadow-sm disabled:opacity-50 disabled:shadow-none transition-all" title={t.save}>
                            <Save size={16} />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder={t.searchGlossary}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 input-field py-1.5 text-sm"
                        />
                        <button onClick={addEntry} disabled={!selectedGlossary} className="p-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-lg shadow-sm disabled:opacity-50 disabled:shadow-none transition-all" title={t.addTerm}>
                            <Plus size={16} />
                        </button>
                    </div>
                </div>

                {/* Import/Export Actions Tiny */}
                <div className="px-2 py-1 flex justify-end gap-2">
                    <button onClick={handleLoadPreset} disabled={!selectedGlossary} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1" title={t.pf1ePresetTitle || 'Load PF1e Core Glossary'}>
                        <Book size={12} /> PF1e
                    </button>
                    <button onClick={handleExtractFromFile} disabled={!selectedGlossary} className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center gap-1" title={t.extractFromFile || 'Extract terms from translated file'}>
                        <FileSearch size={12} /> {t.extractTerms || '提取'}
                    </button>
                    <button onClick={handleImport} disabled={!selectedGlossary} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                        <Upload size={12} /> {t.import}
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {displayedEntries.map((entry, i) => {
                        const actualIndex = startIndex + i
                        return (
                            <div key={actualIndex} className="bg-white/40 p-3 rounded-xl border border-white/50 hover:border-purple-300 transition-colors group relative backdrop-blur-sm shadow-sm">
                                <div className="mb-2">
                                    <input
                                        value={entry.term}
                                        onChange={(e) => updateEntry(actualIndex, 'term', e.target.value)}
                                        placeholder="术语"
                                        className="w-full bg-transparent font-bold text-slate-700 text-sm border-none p-0 focus:ring-0 placeholder-slate-400"
                                    />
                                </div>
                                <div className="mb-2">
                                    <textarea
                                        value={entry.definition}
                                        onChange={(e) => updateEntry(actualIndex, 'definition', e.target.value)}
                                        placeholder="译文"
                                        rows={1}
                                        className="w-full bg-white/60 rounded-lg px-2 py-1 text-emerald-600 text-sm border border-white/40 resize-y focus:ring-1 focus:ring-purple-300 focus:border-purple-300"
                                        style={{ minHeight: '28px' }}
                                    />
                                </div>
                                <div>
                                    <input
                                        value={entry.context || ''}
                                        onChange={(e) => updateEntry(actualIndex, 'context', e.target.value)}
                                        placeholder="上下文..."
                                        className="w-full bg-transparent text-slate-400 text-xs italic border-none p-0 focus:ring-0 placeholder-slate-300"
                                    />
                                </div>
                                <button
                                    onClick={() => removeEntry(actualIndex)}
                                    className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-red-50"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )
                    })}
                    {displayedEntries.length === 0 && (
                        <div className="text-center text-slate-400 text-xs py-4">
                            {selectedGlossary ? (searchTerm ? t.noMatches : '无条目') : t.selectOrCreate}
                        </div>
                    )}
                    {hasMore && (
                        <div className="flex items-center justify-center gap-2 text-sm py-2 border-t border-slate-100">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage <= 1}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                上一页
                            </button>
                            <span className="text-slate-500">
                                {currentPage} / {totalPages} 页 (共 {filteredEntries.length} 条)
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                下一页
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Custom Input Dialog for New Glossary */}
            {showNameInput && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">{t.newGlossary}</h3>
                        <input
                            type="text"
                            value={newGlossaryName}
                            onChange={(e) => setNewGlossaryName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleConfirmCreate()}
                            placeholder={t.enterGlossaryName || 'Enter name...'}
                            className="input-field w-full"
                            autoFocus
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleConfirmCreate}
                                className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all"
                            >
                                {t.save}
                            </button>
                            <button
                                onClick={() => setShowNameInput(false)}
                                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
                            >
                                {t.cancel}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl w-full max-w-6xl flex h-[85vh] overflow-hidden">
                    {/* Left Sidebar - Glossary List */}
                    <div className="w-72 border-r border-slate-100 flex flex-col bg-gradient-to-b from-purple-50/50 to-indigo-50/50">
                        <div className="p-5 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{t.glossaryFiles || 'Glossary Files'}</h3>
                            <button
                                onClick={handleCreateGlossary}
                                className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                            >
                                <FolderPlus size={18} />
                                {t.newGlossary || 'New Glossary'}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                            {glossaries.length === 0 ? (
                                <div className="text-center text-slate-400 py-8 text-sm">
                                    <Book size={32} className="mx-auto mb-2 opacity-30" />
                                    {t.noTermsYet}
                                </div>
                            ) : (
                                glossaries.map(g => (
                                    <div
                                        key={g.name}
                                        className={`p-3 rounded-xl cursor-pointer transition-all ${selectedGlossary === g.name
                                            ? 'bg-white border-2 border-purple-200 shadow-md'
                                            : 'bg-white/50 border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3" onClick={() => { setSelectedGlossary(g.name); loadGlossary(g.name); }}>
                                            <input
                                                type="checkbox"
                                                checked={g.enabled}
                                                onChange={(e) => { e.stopPropagation(); handleToggleEnabled(g.name, e.target.checked); }}
                                                className="w-4 h-4 rounded border-slate-300 text-purple-500 focus:ring-purple-500"
                                                title="Enable for AI"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold text-slate-700 truncate">{g.name}</div>
                                                <div className="text-xs text-slate-400">{g.entryCount} {t.term}</div>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteGlossary(g.name); }}
                                                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Content - Editor */}
                    <div className="flex-1 flex flex-col bg-[#FAFAF7]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white/80">
                            <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-400 flex items-center justify-center shadow-lg shadow-purple-200">
                                    <Book size={20} className="text-white" />
                                </div>
                                {selectedGlossary || t.glossaryManager}
                            </h2>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleLoadPreset}
                                    disabled={!selectedGlossary}
                                    className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 font-bold rounded-xl border border-purple-100 hover:border-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                    title={t.pf1ePresetTitle || 'Load PF1e Core Glossary'}
                                >
                                    <Book size={16} />
                                    PF1e
                                </button>
                                <button
                                    onClick={handleExtractFromFile}
                                    disabled={!selectedGlossary}
                                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-bold rounded-xl border border-emerald-100 hover:border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                    title={t.extractFromFile || 'Extract terms from translated file'}
                                >
                                    <FileSearch size={16} />
                                    {t.extractTerms || '提取'}
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={!selectedGlossary}
                                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl border border-blue-100 hover:border-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                >
                                    <Upload size={16} />
                                    {t.import || 'Import'}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading || !selectedGlossary}
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-green-200 disabled:opacity-50 transition-all flex items-center gap-2"
                                >
                                    <Save size={16} />
                                    {t.save}
                                </button>
                                <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all ml-2">
                                    <X size={22} />
                                </button>
                            </div>
                        </div>

                        {selectedGlossary ? (
                            <>
                                {/* Toolbar */}
                                <div className="p-4 bg-white/50 flex gap-4 border-b border-slate-100">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            placeholder={t.searchGlossary}
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="input-field w-full pl-10"
                                        />
                                        <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <button onClick={addEntry} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center gap-2">
                                        <Plus size={18} />
                                        {t.addTerm}
                                    </button>
                                </div>

                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                    <div className="col-span-3">{t.term}</div>
                                    <div className="col-span-4">{t.definition}</div>
                                    <div className="col-span-4">{t.context}</div>
                                    <div className="col-span-1 text-right">{t.action}</div>
                                </div>

                                {/* List */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                                    {displayedEntries.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center text-slate-400 py-16">
                                            <Book size={48} className="mb-3 opacity-20" />
                                            <p className="font-medium">{searchTerm ? t.noMatches : t.noTermsYet}</p>
                                        </div>
                                    ) : (
                                        <>
                                            {displayedEntries.map((entry, i) => {
                                                const actualIndex = startIndex + i
                                                return (
                                                    <div key={actualIndex} className="grid grid-cols-12 gap-4 items-center bg-white p-4 rounded-xl border border-slate-100 hover:border-purple-200 hover:shadow-sm transition-all group">
                                                        <div className="col-span-3">
                                                            <input
                                                                value={entry.term}
                                                                onChange={(e) => updateEntry(actualIndex, 'term', e.target.value)}
                                                                placeholder="Fireball"
                                                                className="bg-transparent border-none text-slate-700 w-full focus:ring-0 placeholder-slate-300 font-bold"
                                                            />
                                                        </div>
                                                        <div className="col-span-4">
                                                            <input
                                                                value={entry.definition}
                                                                onChange={(e) => updateEntry(actualIndex, 'definition', e.target.value)}
                                                                placeholder="火球术"
                                                                className="bg-transparent border-none text-emerald-600 w-full focus:ring-0 placeholder-slate-300 font-medium"
                                                            />
                                                        </div>
                                                        <div className="col-span-4">
                                                            <input
                                                                value={entry.context || ''}
                                                                onChange={(e) => updateEntry(actualIndex, 'context', e.target.value)}
                                                                placeholder={t.context}
                                                                className="bg-transparent border-none text-slate-400 w-full focus:ring-0 placeholder-slate-300 italic text-sm"
                                                            />
                                                        </div>
                                                        <div className="col-span-1 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => removeEntry(actualIndex)}
                                                                className="p-2 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            {hasMore && (
                                                <div className="flex items-center justify-center gap-3 text-sm py-4 bg-slate-50 rounded-xl border border-slate-100">
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                        disabled={currentPage <= 1}
                                                        className="px-3 py-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        ← 上一页
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-500">第</span>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={totalPages}
                                                            value={currentPage}
                                                            onChange={(e) => {
                                                                const page = parseInt(e.target.value) || 1
                                                                setCurrentPage(Math.min(Math.max(1, page), totalPages))
                                                            }}
                                                            className="w-14 px-2 py-1 text-center border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-purple-300"
                                                        />
                                                        <span className="text-slate-500">页 / 共 {totalPages} 页 ({filteredEntries.length} 条)</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                        disabled={currentPage >= totalPages}
                                                        className="px-3 py-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                                    >
                                                        下一页 →
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                <Book size={64} className="mb-4 opacity-20" />
                                <p className="font-medium">{t.selectOrCreate || 'Select or create a glossary to begin'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div >

            {/* Extraction Preview Modal */}
            {
                showExtractModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-[700px] max-h-[80vh] flex flex-col overflow-hidden border border-slate-200">
                            {/* Header */}
                            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <FileSearch size={20} className="text-emerald-500" />
                                        {t.extractFromFile || '从文件提取术语'}
                                    </h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {extractFileName} · {t.foundTerms?.replace('{count}', extractedTerms.length.toString()) || `已识别 ${extractedTerms.length} 条术语`}
                                    </p>
                                </div>
                                <button onClick={() => setShowExtractModal(false)} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            {/* Warning Tip */}
                            <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 text-amber-700 text-xs flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">⚠️</span>
                                <span>自动提取的术语可能不完全准确，Key 和 Value 的对应关系需要您手动甄别后再导入。</span>
                            </div>

                            {/* Selection Controls */}
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                                <button onClick={() => toggleAllExtracted(true)} className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1">
                                    <CheckSquare size={14} /> {t.selectAll || '全选'}
                                </button>
                                <button onClick={() => toggleAllExtracted(false)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                                    <Square size={14} /> {t.deselectAll || '取消全选'}
                                </button>
                                <span className="ml-auto text-xs text-slate-400">
                                    {t.selectedCount?.replace('{count}', extractedTerms.filter(t => t.selected).length.toString()) || `已选 ${extractedTerms.filter(t => t.selected).length} 条`}
                                </span>
                            </div>

                            {/* Terms List */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                <div className="space-y-1">
                                    {extractedTerms.map((term, i) => (
                                        <div
                                            key={i}
                                            onClick={() => toggleExtractedTerm(i)}
                                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${term.selected
                                                ? 'bg-emerald-50 border border-emerald-200'
                                                : 'bg-white/50 border border-transparent hover:bg-slate-50'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${term.selected ? 'bg-emerald-500 text-white' : 'bg-slate-200'
                                                }`}>
                                                {term.selected && <CheckSquare size={14} />}
                                            </div>
                                            <span className="font-mono text-sm text-slate-700 min-w-[120px]">{term.key}</span>
                                            <span className="text-slate-400">→</span>
                                            <span className="text-emerald-600 text-sm flex-1">{term.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowExtractModal(false)}
                                    className="px-4 py-2 text-slate-500 hover:bg-white rounded-xl transition-colors font-medium"
                                >
                                    {t.cancel || '取消'}
                                </button>
                                <button
                                    onClick={handleImportExtracted}
                                    disabled={extractedTerms.filter(t => t.selected).length === 0}
                                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center gap-2"
                                >
                                    <Upload size={16} />
                                    {t.importSelected?.replace('{count}', extractedTerms.filter(t => t.selected).length.toString()) || `导入选中 (${extractedTerms.filter(t => t.selected).length})`}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}
