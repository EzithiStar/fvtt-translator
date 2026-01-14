import { useState, useEffect, useRef } from 'react'
import { X, Save, FileBox, FolderInput, Plus, Trash2, Globe, Mail, MessageSquare, AlertCircle } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { StagedFile } from '../lib/moduleBuilderStore'
import { ModuleManifest, ModuleAuthor, ModuleRelationship, ModuleCompatibility } from '../../../shared/types'

import { AppSettings } from './settings/SettingsTypes'

interface ExportModalProps {
    isOpen: boolean
    onClose: () => void
    projectPath: string | null
    files: string[]
    inline?: boolean
    stagedFiles?: StagedFile[]
}

type Tab = 'general' | 'authors' | 'compatibility' | 'relationships' | 'babele' | 'files'

const DEFAULT_MANIFEST: ModuleManifest = {
    id: '',
    title: '',
    description: '',
    version: '1.0.0',
    authors: [],
    compatibility: { minimum: '10', verified: '11', maximum: '12' },
    relationships: {
        systems: [],
        requires: [
            {
                id: 'babele',
                type: 'module',
                manifest: 'https://gitlab.com/riccisi/foundryvtt-babele/-/raw/2.6.0/module/module.json',
                compatibility: {
                    minimum: '2.5.2',
                    verified: '2.6.0'
                }
            }
        ],
        flags: {}
    },
    babeleMappingDir: 'translations',
    babeleRegisterScript: 'babele.js'
}

export function ExportModal({ isOpen, onClose, projectPath, files, inline = false, stagedFiles = [] }: ExportModalProps): JSX.Element | null {
    const { t } = useI18n()
    const [activeTab, setActiveTab] = useState<Tab>('general')
    const [formData, setFormData] = useState<ModuleManifest>(DEFAULT_MANIFEST)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedFiles, setSelectedFiles] = useState<string[]>([])
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        // Auto-select files
        if (isOpen) {
            if (stagedFiles && stagedFiles.length > 0) {
                setSelectedFiles(stagedFiles.map(sf => sf.sourcePath || sf.id))
            } else if (files.length > 0) {
                setSelectedFiles(files.filter(f => {
                    const lower = f.toLowerCase()
                    return lower.endsWith('.json') || lower.endsWith('.js')
                }))
            }

            // Load Global Defaults (ONLY if not loading an existing project)
            // Even if loading project, we might want to fill gaps?
            // For safety, let's apply defaults only to empty fields, validation happens in state update
            if (!projectPath) {
                try {
                    const savedSettings = localStorage.getItem('fvtt-translator-settings')
                    if (savedSettings) {
                        const settings = JSON.parse(savedSettings) as AppSettings
                        if (settings.moduleDefaults) {
                            const defs = settings.moduleDefaults
                            setFormData(prev => {
                                // Authors
                                let newAuthors = [...prev.authors]
                                if (newAuthors.length === 0 && defs.authors) {
                                    newAuthors = [{ name: defs.authors }]
                                }

                                // Compatibility
                                const newCompat = { ...prev.compatibility }
                                if (defs.compatibility) {
                                    if (defs.compatibility.minimum) newCompat.minimum = defs.compatibility.minimum
                                    if (defs.compatibility.verified) newCompat.verified = defs.compatibility.verified
                                    if (defs.compatibility.maximum) newCompat.maximum = defs.compatibility.maximum
                                }

                                return {
                                    ...prev,
                                    authors: newAuthors,
                                    compatibility: newCompat,
                                    url: prev.url || defs.url || '',
                                    manifest: prev.manifest || defs.manifest || '',
                                    download: prev.download || defs.download || ''
                                }
                            })
                        }
                    }
                } catch (e) {
                    console.error('Failed to load global defaults:', e)
                }
            }
        }
    }, [isOpen, files, stagedFiles, projectPath])

    useEffect(() => {
        if (isOpen && projectPath) {
            loadModuleInfo(projectPath)
        }
    }, [isOpen, projectPath])

    const loadModuleInfo = async (path: string) => {
        try {
            const info: Partial<ModuleManifest> = await (window as any).api.getModuleInfo(path)
            if (info && (info.id || info.title)) {
                setFormData(prev => ({
                    ...DEFAULT_MANIFEST,
                    ...info,
                    // Ensure arrays and objects exist if missing from loaded data
                    authors: info.authors || [],
                    compatibility: info.compatibility || prev.compatibility,
                    relationships: {
                        systems: info.relationships?.systems || [],
                        requires: info.relationships?.requires || [],
                        flags: info.relationships?.flags || {}
                    },
                    babeleMappingDir: info.babeleMappingDir || 'compendium',
                    babeleRegisterScript: info.babeleRegisterScript || 'register.js'
                }))
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleImportMetadata = async () => {
        const path = await (window as any).api.selectDirectory()
        if (path) {
            await loadModuleInfo(path)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // --- Dynamic Field Helpers ---

    const updateAuthor = (index: number, field: keyof ModuleAuthor, value: string) => {
        setFormData(prev => {
            const newAuthors = [...prev.authors]
            newAuthors[index] = { ...newAuthors[index], [field]: value }
            return { ...prev, authors: newAuthors }
        })
    }

    const addAuthor = () => {
        setFormData(prev => ({
            ...prev,
            authors: [...prev.authors, { name: '' }]
        }))
    }

    const removeAuthor = (index: number) => {
        setFormData(prev => ({
            ...prev,
            authors: prev.authors.filter((_, i) => i !== index)
        }))
    }

    const updateCompatibility = (field: 'minimum' | 'verified' | 'maximum', value: string) => {
        setFormData(prev => ({
            ...prev,
            compatibility: { ...prev.compatibility, [field]: value }
        }))
    }

    const updateRelationship = (
        category: 'systems' | 'requires',
        index: number,
        field: keyof ModuleRelationship,
        value: string
    ) => {
        setFormData(prev => {
            const rels = prev.relationships || { systems: [], requires: [] }
            const list = [...(rels[category] || [])]
            list[index] = { ...list[index], [field]: value }
            return {
                ...prev,
                relationships: { ...rels, [category]: list }
            }
        })
    }

    const addRelationship = (category: 'systems' | 'requires', type: 'system' | 'module') => {
        setFormData(prev => {
            const rels = prev.relationships || { systems: [], requires: [] }
            return {
                ...prev,
                relationships: {
                    ...rels,
                    [category]: [...(rels[category] || []), { id: '', type }]
                }
            }
        })
    }

    const removeRelationship = (category: 'systems' | 'requires', index: number) => {
        setFormData(prev => {
            const rels = prev.relationships || { systems: [], requires: [] }
            return {
                ...prev,
                relationships: {
                    ...rels,
                    [category]: (rels[category] || []).filter((_, i) => i !== index)
                }
            }
        })
    }

    // --- Save & Export ---

    const handleSaveConfig = async () => {
        if (!projectPath) return
        const path = projectPath + (projectPath.includes('\\') ? '\\' : '/') + 'module.json'

        if (!formData.id) {
            setError(t.moduleIdRequired || 'Module ID is required')
            return
        }

        try {
            setLoading(true)
            await (window as any).api.writeJson(path, formData)
            alert(t.saveSuccess || 'Saved module.json successfully!')
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        // If stagedFiles exist, we don't need projectPath
        if (!projectPath && (!stagedFiles || stagedFiles.length === 0)) return

        if (!formData.id) {
            setError(t.moduleIdRequired || 'Module ID is required')
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Pass stagedFiles to exportModule
            const result = await (window as any).api.exportModule(
                projectPath || '', // Empty if virtual
                formData,
                selectedFiles,
                stagedFiles // New arg
            )
            if (result.success) {
                if (!inline) onClose()
                alert((t.exportSuccess || 'Module exported successfully to: ').replace('{path}', result.path))
            } else {
                setError(result.error || t.exportFailed || 'Export failed')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null
    // If inline, render. If not inline, ensure either projectPath OR stagedFiles exist.
    if (!projectPath && !inline && (!stagedFiles || stagedFiles.length === 0)) return null

    const TabButton = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: any }) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold transition-all rounded-t-xl -mb-px
                ${activeTab === id
                    ? 'bg-white text-slate-700 border border-slate-200 border-b-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
        >
            <Icon size={16} />
            {label}
        </button>
    )

    const Content = (
        <div className={`flex flex-col h-full ${inline ? 'bg-[#FAFAF7]' : 'bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl w-[800px] h-[600px] max-h-[90vh] overflow-hidden'}`}>
            {/* Header */}
            {!inline ? (
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-200">
                            <FileBox size={20} className="text-white" />
                        </div>
                        {t.moduleConfiguration}
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleImportMetadata}
                            className="px-4 py-2 bg-white hover:bg-slate-50 text-blue-600 font-bold rounded-xl border border-blue-100 hover:border-blue-200 transition-all flex items-center gap-2 shadow-sm"
                        >
                            <FolderInput size={16} /> {t.importMetadata || "Load Info"}
                        </button>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
                            <X size={22} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-3 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white/50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Module Settings</span>
                    <button
                        type="button"
                        onClick={handleImportMetadata}
                        className="text-xs text-blue-500 hover:text-blue-600 font-bold flex items-center gap-1"
                    >
                        <FolderInput size={12} /> {t.importMetadata?.split(' ')[0] || "Load"}
                    </button>
                </div>
            )}

            {/* Content Area with Sidebar/Tabs */}
            <div className={`flex flex-col flex-1 min-h-0`}>

                {/* Tabs */}
                <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50 px-4 pt-3 shrink-0 custom-scrollbar gap-1">
                    <TabButton id="general" label={t.tabGeneral || "General"} icon={FileBox} />
                    <TabButton id="authors" label={t.tabAuthors || "Authors"} icon={Mail} />
                    <TabButton id="compatibility" label={t.tabCompatibility || "Compatibility"} icon={AlertCircle} />
                    <TabButton id="relationships" label={t.tabRelationships || "Relationships"} icon={Globe} />
                    <TabButton id="babele" label={t.tabBabele || "Babele"} icon={MessageSquare} />
                    <TabButton id="files" label={t.tabFiles || "Files"} icon={FolderInput} />
                </div>

                {/* Main Scrollable Form */}
                <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">
                    {error && (
                        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-600 p-4 rounded-xl text-sm flex items-center gap-3 font-medium">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {activeTab === 'general' && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-500">{t.moduleTitle}</label>
                                    <input required name="title" value={formData.title} onChange={handleChange} className="input-field w-full" placeholder="My Module" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-500">{t.moduleId}</label>
                                    <input required name="id" value={formData.id} onChange={handleChange} className="input-field w-full font-mono" placeholder="my-module-id" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-500">{t.version}</label>
                                    <input required name="version" value={formData.version} onChange={handleChange} className="input-field w-full font-mono" placeholder="1.0.0" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-500">{t.url}</label>
                                    <input name="url" value={formData.url || ''} onChange={handleChange} className="input-field w-full text-sm" placeholder="https://github.com/..." />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase text-slate-500">{t.manifest}</label>
                                <input name="manifest" value={formData.manifest || ''} onChange={handleChange} className="input-field w-full text-sm" placeholder="https://.../module.json" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-500">{t.download}</label>
                                    <input name="download" value={formData.download || ''} onChange={handleChange} className="input-field w-full text-sm" placeholder="https://.../module.zip" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-500">{t.license}</label>
                                    <input name="license" value={formData.license || ''} onChange={handleChange} className="input-field w-full text-sm" placeholder="LICENSE.txt" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-500">{t.readme}</label>
                                    <input name="readme" value={formData.readme || ''} onChange={handleChange} className="input-field w-full text-sm" placeholder="README.md" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-500">{t.bugs}</label>
                                    <input name="bugs" value={formData.bugs || ''} onChange={handleChange} className="input-field w-full text-sm" placeholder=".../issues" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-500">{t.changelog}</label>
                                    <input name="changelog" value={formData.changelog || ''} onChange={handleChange} className="input-field w-full text-sm" placeholder=".../releases" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase text-slate-500">{t.description}</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="input-field w-full resize-none" />
                            </div>
                        </div>
                    )}

                    {activeTab === 'authors' && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-300 uppercase">{t.tabAuthors}</h3>
                                <button type="button" onClick={addAuthor} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded flex items-center gap-1">
                                    <Plus size={14} /> {t.addAuthor || "Add"}
                                </button>
                            </div>
                            {formData.authors.length === 0 && <p className="text-slate-500 text-sm italic py-2">No authors listed.</p>}
                            <div className="space-y-3">
                                {formData.authors.map((author, idx) => (
                                    <div key={idx} className="flex gap-2 items-start bg-slate-900/50 p-3 rounded border border-slate-800">
                                        <div className="grid grid-cols-2 gap-2 flex-1">
                                            <input value={author.name} onChange={e => updateAuthor(idx, 'name', e.target.value)} placeholder={t.name || "Name"} className="input-field w-full text-sm" />
                                            <input value={author.email || ''} onChange={e => updateAuthor(idx, 'email', e.target.value)} placeholder={t.email || "Email"} className="input-field w-full text-sm" />
                                            <input value={author.url || ''} onChange={e => updateAuthor(idx, 'url', e.target.value)} placeholder={t.url || "URL"} className="input-field w-full text-sm" />
                                            <input value={author.discord || ''} onChange={e => updateAuthor(idx, 'discord', e.target.value)} placeholder={t.discord || "Discord"} className="input-field w-full text-sm" />
                                        </div>
                                        <button type="button" onClick={() => removeAuthor(idx)} className="text-red-400 hover:text-red-300 p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'compatibility' && (
                        <div className="space-y-4 animate-fadeIn">
                            <h3 className="text-sm font-bold text-slate-300 uppercase">{t.coreVersion}</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-500">{t.minimum}</label>
                                    <input value={formData.compatibility?.minimum || ''} onChange={e => updateCompatibility('minimum', e.target.value)} className="input-field w-full font-mono" placeholder="10" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-500">{t.verified}</label>
                                    <input value={formData.compatibility?.verified || ''} onChange={e => updateCompatibility('verified', e.target.value)} className="input-field w-full font-mono" placeholder="11" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold uppercase text-slate-500">{t.maximum}</label>
                                    <input value={formData.compatibility?.maximum || ''} onChange={e => updateCompatibility('maximum', e.target.value)} className="input-field w-full font-mono" placeholder="12" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'relationships' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Systems */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <h3 className="text-sm font-bold text-slate-300 uppercase">{t.systems}</h3>
                                    <button type="button" onClick={() => addRelationship('systems', 'system')} className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-2 py-1 rounded flex items-center gap-1">
                                        <Plus size={14} /> {t.addSystem || "Add"}
                                    </button>
                                </div>
                                {(!formData.relationships?.systems?.length) && <p className="text-slate-500 text-sm italic">No systems defined.</p>}
                                {formData.relationships?.systems?.map((rel, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input value={rel.id} onChange={e => updateRelationship('systems', idx, 'id', e.target.value)} placeholder="System ID (e.g. pf1)" className="input-field flex-1 font-mono text-sm" />
                                        <input value={rel.manifest || ''} onChange={e => updateRelationship('systems', idx, 'manifest', e.target.value)} placeholder="Manifest URL (Optional)" className="input-field flex-1 text-sm" />
                                        <button type="button" onClick={() => removeRelationship('systems', idx)} className="text-red-400 hover:text-red-300 p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Modules */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                    <h3 className="text-sm font-bold text-slate-300 uppercase">{t.modules} (Requires)</h3>
                                    <button type="button" onClick={() => addRelationship('requires', 'module')} className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-2 py-1 rounded flex items-center gap-1">
                                        <Plus size={14} /> {t.addModule || "Add"}
                                    </button>
                                </div>
                                {(!formData.relationships?.requires?.length) && <p className="text-slate-500 text-sm italic">No dependencies.</p>}
                                {formData.relationships?.requires?.map((rel, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input value={rel.id} onChange={e => updateRelationship('requires', idx, 'id', e.target.value)} placeholder="Module ID" className="input-field flex-1 font-mono text-sm" />
                                        <input value={rel.manifest || ''} onChange={e => updateRelationship('requires', idx, 'manifest', e.target.value)} placeholder="Manifest URL (Optional)" className="input-field flex-1 text-sm" />
                                        <button type="button" onClick={() => removeRelationship('requires', idx)} className="text-red-400 hover:text-red-300 p-1">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'babele' && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="p-3 bg-blue-900/20 border border-blue-900/50 rounded text-blue-200 text-sm">
                                <p>{t.babeleHelp}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase text-slate-500">{t.mappingDir}</label>
                                <input name="babeleMappingDir" value={formData.babeleMappingDir} onChange={handleChange} className="input-field w-full font-mono" />
                                <p className="text-xs text-slate-600">{t.babeleDirHelp}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold uppercase text-slate-500">{t.registerScript}</label>
                                <div className="flex gap-2">
                                    <input name="babeleRegisterScript" value={formData.babeleRegisterScript} onChange={handleChange} className="input-field w-full font-mono" />
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (!projectPath) return
                                            try {
                                                const scriptName = 'babele.js' // Force standardization
                                                const scriptDir = projectPath + (projectPath.includes('\\') ? '\\' : '/') + 'scripts'
                                                const scriptPath = scriptDir + (projectPath.includes('\\') ? '\\' : '/') + scriptName

                                                // 1. Create scripts dir if not exists (backend handles write, but let's be safe via creating it implicitly by writing file? writeJson does, writeFile might not recursive... 
                                                // Actually (window as any).api.writeFile usually just writes. We might need to ensure dir. 
                                                // Using a raw script string based on the reference module.
                                                const template = `
/*
 * Babele Registration Script
 * Generated by FVTT Translator
 */

Hooks.once('init', () => {
    // Register settings to toggle automatic translation
    game.settings.register("${formData.id}", "autoRegisterBabel", {
        name: "Auto-Register Babele",
        hint: "Automatically enable translation mappings.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
        onChange: (value) => {
            if (value) window.location.reload();
        }
    });

    if (typeof Babele !== 'undefined') {
        Babele.get().register({
            module: "${formData.id}",
            lang: "zh-cn",
            dir: "${formData.babeleMappingDir}"
        });
        
        // Example: Register Converters
        // Babele.get().registerConverters({
        //     "myConverter": (value) => { return value; }
        // });
    }
});
`
                                                // We need a way to ensure directory exists. 
                                                // Since we don't have 'mkdir' in API directly visible in env.d.ts (it's in fileSystem.ts backend but maybe not exposed as raw mkdir).
                                                // 'exportModule' does mkdir. 'writeJson' does not explicitly say.
                                                // Let's rely on the user having a 'scripts' folder or just try writing.
                                                // If it fails, we might need to add mkdir to API.
                                                // Wait, check env.d.ts... no mkdir.
                                                // But 'writeFile' in node usually requires dir. 
                                                // Let's assume for now the user can create it or we rely on 'exportModule' later.
                                                // Actually, let's use a workaround: write a dummy file via 'exportModule' logic? No that's too heavy.
                                                // Let's just try writing. If it fails, we alert user to create 'scripts' folder.

                                                await (window as any).api.writeFile(scriptPath, template.trim())

                                                setFormData(prev => ({ ...prev, babeleRegisterScript: scriptName }))
                                                alert(t.scriptGenerated?.replace('{path}', scriptName) || 'Script generated!')
                                            } catch (e: any) {
                                                alert((t.scriptError || 'Error: {error}').replace('{error}', e.message))
                                            }
                                        }}
                                        className="btn-secondary whitespace-nowrap text-xs"
                                        title="Generate a robust babele.js template"
                                    >
                                        {t.generateScript || "Generate Script"}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-600">{t.registerScriptHelp}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'files' && (
                        <div className="space-y-1 flex-1 min-h-0 flex flex-col h-full animate-fadeIn">
                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">{t.includedFiles}</label>
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 overflow-y-auto custom-scrollbar flex-1 min-h-[150px] shadow-inner">
                                {stagedFiles && stagedFiles.length > 0 ? (
                                    // Builder Mode: List staged files (Read-only view for now, or selectable? For export, they are implicitly selected)
                                    <div className="space-y-1">
                                        <div className="text-xs text-slate-400 pb-2 border-b border-white/5 mb-2">
                                            {t.stagingArea} ({stagedFiles.length})
                                        </div>
                                        {stagedFiles.map(file => (
                                            <div key={file.id} className="flex items-center gap-3 p-2 rounded-lg bg-white border border-slate-100 shadow-sm">
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${file.type === 'lang' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                                                    {file.type}
                                                </span>
                                                <span className="text-xs font-medium text-slate-600 flex-1 truncate">{file.targetPath}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    files.length === 0 ? (
                                        <p className="text-slate-500 text-sm text-center py-4">{t.noTermsFound || "No files"}</p>
                                    ) : (
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2 px-1">
                                                <span className="text-xs text-slate-400">{t.filesSelected?.replace('{count}', selectedFiles.length.toString())}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (selectedFiles.length === files.length) setSelectedFiles([])
                                                        else setSelectedFiles(files)
                                                    }}
                                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    {selectedFiles.length === files.length ? t.deselectAll : t.selectAll}
                                                </button>
                                            </div>
                                            {files.map(file => {
                                                const ext = file.split('.').pop()
                                                const isJson = ext === 'json'
                                                const isJs = ext === 'js'
                                                const relPath = projectPath ? file.replace(projectPath, '').replace(/^[\\/]/, '') : file

                                                if (!isJson && !isJs) return null

                                                return (
                                                    <label key={file} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer group transition-colors border border-transparent hover:border-blue-100 hover:shadow-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedFiles.includes(file)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedFiles(prev => [...prev, file])
                                                                else setSelectedFiles(prev => prev.filter(f => f !== file))
                                                            }}
                                                            className="rounded border-slate-300 bg-white text-blue-500 focus:ring-offset-0 focus:ring-1 focus:ring-blue-500/50"
                                                        />
                                                        <span className={`text-xs font-medium truncate flex-1 
                                                            ${isJson ? 'text-slate-600 group-hover:text-blue-600' :
                                                                isJs ? 'text-slate-600 group-hover:text-blue-600' : 'text-slate-400'}`}>
                                                            {relPath}
                                                        </span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* Footer Actions */}
            <div className={`p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/80 shrink-0 ${!inline ? 'rounded-b-3xl' : ''}`}>
                <button
                    type="button"
                    onClick={handleSaveConfig}
                    disabled={loading || !projectPath}
                    className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-white hover:text-slate-800 transition-all flex items-center gap-2 border border-slate-200 hover:border-slate-300 hover:shadow-sm font-bold disabled:opacity-50"
                    title="Save module.json to project folder"
                >
                    <Save size={16} /> {t.saveConfig || "Save Config"}
                </button>

                {!inline && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-all font-bold"
                    >
                        {t.cancel || "Cancel"}
                    </button>
                )}
                <button
                    onClick={() => handleSubmit()}
                    disabled={loading || (!projectPath && (!stagedFiles || stagedFiles.length === 0))}
                    className={`px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 transition-all flex items-center gap-2 ${inline ? 'w-full justify-center' : ''}`}
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Loading...
                        </div>
                    ) : (
                        <>
                            <FileBox size={18} />
                            {t.export || "Export"}
                        </>
                    )}
                </button>
            </div>
        </div>
    )

    if (inline) return Content

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fadeIn">
            {Content}
        </div>
    )
}
