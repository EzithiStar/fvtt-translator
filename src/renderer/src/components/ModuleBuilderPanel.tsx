import { Trash2, Package, Save, FolderOpen } from 'lucide-react'
import { useModuleBuilder, StagedFile } from '../lib/moduleBuilderStore'
import { useI18n } from '../lib/i18n'
import { useState } from 'react'
import { ExportModal } from './ExportModal'

interface ModuleBuilderPanelProps {
    onOpenFile: (path: string) => void
}

export function ModuleBuilderPanel({ onOpenFile }: ModuleBuilderPanelProps) {
    const { t } = useI18n()
    const { stagedFiles, removeStagedFile, updateStagedFile, clearStagedFiles } = useModuleBuilder()
    const [isExportOpen, setIsExportOpen] = useState(false)

    // Cycle types: lang -> babele -> script -> other
    const handleToggleType = (file: StagedFile, e: React.MouseEvent) => {
        e.stopPropagation()
        const types: StagedFile['type'][] = ['lang', 'babele', 'script', 'other']
        const currentIdx = types.indexOf(file.type)
        const nextType = types[(currentIdx + 1) % types.length]

        // Auto-adjust target path based on type change for convenience?
        // Maybe too invasive. Let's just change type.
        // Actually, paths usually follow type. 
        // If switching TO babele -> translations/
        // If switching TO lang -> lang/
        // Let's offer a smart switch or just switch type. 
        // User can drag/drop or edit path later? We don't have path edit yet.
        // Let's just switch type for now to solve the "Is Babele?" logic.
        updateStagedFile(file.id, { type: nextType })
    }

    // Group files by type
    const groups = {
        lang: stagedFiles.filter(f => f.type === 'lang'),
        babele: stagedFiles.filter(f => f.type === 'babele'),
        script: stagedFiles.filter(f => f.type === 'script'),
        other: stagedFiles.filter(f => f.type === 'other')
    }

    const renderFileGroup = (title: string, files: StagedFile[], icon: React.ReactNode, isLang: boolean = false) => {
        if (files.length === 0) return null
        return (
            <div className="mb-3">
                <div className="flex items-center gap-1.5 px-1 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {icon}
                    {title} ({files.length})
                </div>
                <div className="space-y-1">
                    {files.map(file => (
                        <div
                            key={file.id}
                            onClick={() => onOpenFile(file.sourcePath)}
                            className="group relative flex flex-col p-2 rounded bg-slate-800/40 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all text-xs cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5 text-blue-200 min-w-0">
                                    <button
                                        onClick={(e) => handleToggleType(file, e)}
                                        className={`opacity-70 font-mono text-[10px] uppercase font-bold px-1 rounded hover:bg-white/20 transition-colors
                                            ${file.type === 'lang' ? 'bg-blue-900 text-blue-300' :
                                                file.type === 'babele' ? 'bg-orange-900 text-orange-300' :
                                                    file.type === 'script' ? 'bg-yellow-900 text-yellow-300' : 'bg-slate-700 text-slate-300'}`}
                                        title="Click to change file type"
                                    >
                                        {file.type}
                                    </button>
                                    <span className="font-medium truncate" title={file.targetPath}>{file.targetPath.split('/').pop()}</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeStagedFile(file.id)
                                    }}
                                    className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                    title={t.removeFromModule}
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                                <div className="text-[10px] text-slate-500 truncate flex-1" title={file.sourcePath}>
                                    {file.sourcePath.split(/[/\\]/).pop()}
                                </div>
                                {/* Label Editor for Languages */}
                                {isLang && (
                                    <input
                                        type="text"
                                        className="bg-black/30 text-[10px] text-green-300 border border-white/5 rounded px-1.5 py-0.5 w-24 text-right focus:w-full focus:bg-slate-900 transition-all outline-none"
                                        placeholder="Display Name"
                                        value={file.label || ''}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => updateStagedFile(file.id, { label: e.target.value })}
                                        title="Module Registration Name (e.g. 中文-ModName)"
                                    />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (stagedFiles.length === 0) {
        return (
            <div className="p-4 text-center text-slate-600 text-xs border-2 border-dashed border-slate-800 rounded mx-2 mt-2">
                <Package className="mx-auto mb-2 opacity-50" size={20} />
                {t.builderEmpty}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full min-h-0 bg-slate-900/50">
            <div className="p-2 border-b border-white/5 flex justify-between items-center bg-slate-900 sticky top-0 z-10">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t.stagingArea} ({stagedFiles.length})</span>
                <button
                    onClick={clearStagedFiles}
                    className="text-[10px] text-red-400 hover:text-red-300 px-1"
                >
                    Clear
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {renderFileGroup("Languages", groups.lang, <FolderOpen size={12} />, true)}
                {renderFileGroup("Compendium Maps", groups.babele, <FolderOpen size={12} />)}
                {renderFileGroup("Scripts", groups.script, <FolderOpen size={12} />)}
                {renderFileGroup("Others", groups.other, <FolderOpen size={12} />)}
            </div>

            <div className="p-2 border-t border-white/5 bg-slate-900 sticky bottom-0 z-10">
                <button
                    onClick={() => setIsExportOpen(true)}
                    className="w-full btn-primary py-1.5 text-xs flex justify-center items-center gap-2"
                >
                    <Package size={14} />
                    {t.builderExport}
                </button>
            </div>

            <ExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                projectPath={null} // Virtual project
                files={[]} // Virtual
                stagedFiles={stagedFiles} // New Prop
            />
        </div>
    )
}
