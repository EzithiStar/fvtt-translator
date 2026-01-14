import { useState } from 'react'
import { useI18n } from '../lib/i18n'
import { useModuleBuilder, StagedFile } from '../lib/moduleBuilderStore'
import { ExportModal } from './ExportModal'
import {
    FolderOpen,
    Trash2,
    FileJson,
    FileCode,
    FileText,
    Package,
    ChevronDown,
    ChevronRight,
    Plus,
    X,
    ArrowLeft,
    CheckSquare,
    Square
} from 'lucide-react'

interface WorkspaceViewProps {
    projectPath: string | null
    files: string[]
    onBack: () => void
}

export function WorkspaceView({ projectPath, files, onBack }: WorkspaceViewProps): JSX.Element {
    const { t } = useI18n()
    const { stagedFiles, removeStagedFile, clearStagedFiles, updateStagedFile, addStagedFile, autoDetectType } = useModuleBuilder()
    const [showExportModal, setShowExportModal] = useState(false)
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        lang: true,
        babele: true,
        script: true,
        other: true
    })
    const [isDragging, setIsDragging] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    // Batch selection helpers
    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }

    const selectAll = () => {
        setSelectedIds(new Set(stagedFiles.map(f => f.id)))
    }

    const deselectAll = () => {
        setSelectedIds(new Set())
    }

    const deleteSelected = () => {
        selectedIds.forEach(id => removeStagedFile(id))
        setSelectedIds(new Set())
    }

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const droppedFiles = Array.from(e.dataTransfer.files)
        for (const file of droppedFiles) {
            // Only accept JSON and JS files
            // In Electron, File objects have a 'path' property
            const filePath = (file as any).path as string
            // Skip if no valid path (e.g., dragging folders or invalid items)
            if (!filePath) continue
            if (file.name.endsWith('.json') || file.name.endsWith('.js')) {
                const { type, targetPath } = autoDetectType(file.name)
                addStagedFile({
                    sourcePath: filePath,
                    targetPath,
                    type
                })
            }
        }
    }

    // Group files by type
    const groupedFiles = {
        lang: stagedFiles.filter(f => f.type === 'lang'),
        babele: stagedFiles.filter(f => f.type === 'babele'),
        script: stagedFiles.filter(f => f.type === 'script'),
        other: stagedFiles.filter(f => f.type === 'other')
    }

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'lang': return <FileJson size={16} className="text-amber-500" />
            case 'babele': return <FileText size={16} className="text-blue-500" />
            case 'script': return <FileCode size={16} className="text-emerald-500" />
            default: return <FileText size={16} className="text-slate-400" />
        }
    }

    const getSectionTitle = (type: string) => {
        switch (type) {
            case 'lang': return '语言文件 (Lang)'
            case 'babele': return 'Compendium 映射 (Babele)'
            case 'script': return '脚本文件 (Scripts)'
            default: return '其他文件'
        }
    }

    const getSectionColor = (type: string) => {
        switch (type) {
            case 'lang': return 'border-amber-200 bg-amber-50/50'
            case 'babele': return 'border-blue-200 bg-blue-50/50'
            case 'script': return 'border-emerald-200 bg-emerald-50/50'
            default: return 'border-slate-200 bg-slate-50/50'
        }
    }

    const renderFileSection = (type: string, files: StagedFile[]) => {
        if (files.length === 0) return null
        const isExpanded = expandedSections[type]

        return (
            <div key={type} className={`rounded-lg border ${getSectionColor(type)} overflow-hidden`}>
                <button
                    onClick={() => toggleSection(type)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/40 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        {getFileIcon(type)}
                        <span className="font-medium">{getSectionTitle(type)}</span>
                        <span className="text-xs text-slate-500 ml-2">({files.length})</span>
                    </div>
                </button>

                {isExpanded && (
                    <div className="border-t border-black/5">
                        {files.map(file => (
                            <div
                                key={file.id}
                                className={`px-4 py-3 flex flex-col gap-2 hover:bg-white/40 border-b border-black/5 last:border-0 ${selectedIds.has(file.id) ? 'bg-blue-50' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    {/* Checkbox for selection */}
                                    <button
                                        onClick={() => toggleSelect(file.id)}
                                        className="text-slate-400 hover:text-blue-500 transition-colors"
                                    >
                                        {selectedIds.has(file.id) ? <CheckSquare size={18} className="text-blue-500" /> : <Square size={18} />}
                                    </button>
                                    {/* Type selector */}
                                    <select
                                        value={file.type}
                                        onChange={(e) => {
                                            const newType = e.target.value as 'lang' | 'babele' | 'script' | 'other'
                                            const typePathMap: Record<string, string> = {
                                                'lang': 'lang/',
                                                'babele': 'translations/',
                                                'script': 'scripts/',
                                                'other': ''
                                            }
                                            const fileName = file.targetPath.split('/').pop() || file.sourcePath?.split(/[/\\]/).pop() || 'file'
                                            updateStagedFile(file.id, {
                                                type: newType,
                                                targetPath: typePathMap[newType] + fileName
                                            })
                                        }}
                                        className="w-24 text-xs px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 outline-none cursor-pointer focus:border-blue-300 shadow-sm"
                                        title="文件类型"
                                    >
                                        <option value="lang">Lang</option>
                                        <option value="babele">Babele</option>
                                        <option value="script">Script</option>
                                        <option value="other">Other</option>
                                    </select>

                                    {/* Target path editor */}
                                    <input
                                        type="text"
                                        value={file.targetPath}
                                        onChange={(e) => updateStagedFile(file.id, { targetPath: e.target.value })}
                                        className="flex-1 text-sm font-mono px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 focus:border-blue-400 outline-none shadow-sm"
                                        placeholder="目标路径..."
                                    />

                                    {file.type === 'lang' && (
                                        <input
                                            type="text"
                                            value={file.label || ''}
                                            onChange={(e) => updateStagedFile(file.id, { label: e.target.value })}
                                            placeholder="显示名称"
                                            className="w-32 text-xs px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 focus:border-amber-400 outline-none shadow-sm"
                                        />
                                    )}
                                    {(file.type === 'lang' || file.type === 'babele') && (
                                        <select
                                            value={file.outputFormat || 'translated'}
                                            onChange={(e) => updateStagedFile(file.id, { outputFormat: e.target.value as 'translated' | 'bilingual' | 'original' })}
                                            className="w-24 text-xs px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 outline-none cursor-pointer shadow-sm"
                                            title="输出格式"
                                        >
                                            <option value="translated">仅译文</option>
                                            <option value="bilingual">双语</option>
                                            <option value="original">原样</option>
                                        </select>
                                    )}
                                    <button
                                        onClick={() => removeStagedFile(file.id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="text-xs text-slate-400 pl-[108px] truncate font-medium">
                                    源: {file.sourcePath?.split(/[/\\]/).pop() || 'Unknown'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-[#FAFAF7] text-slate-700">
            {/* Header */}
            <div className="shrink-0 px-8 py-5 border-b border-[#E5DDD5] flex items-center justify-between bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="text-slate-400 hover:text-slate-600 transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-100"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-extrabold flex items-center gap-3 text-slate-800 tracking-tight">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <Package size={24} />
                            </div>
                            模组工作区
                        </h1>
                        <p className="text-sm font-medium text-slate-500 ml-1">管理待导出的翻译文件</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                        共 {stagedFiles.length} 个文件
                        {selectedIds.size > 0 && ` (已选 ${selectedIds.size})`}
                    </span>
                    {stagedFiles.length > 0 && (
                        <>
                            {/* Batch selection buttons */}
                            <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
                                <button
                                    onClick={selectAll}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                                    title="全选"
                                >
                                    全选
                                </button>
                                <button
                                    onClick={deselectAll}
                                    className="px-3 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
                                    title="取消全选"
                                >
                                    取消
                                </button>
                                {selectedIds.size > 0 && (
                                    <button
                                        onClick={deleteSelected}
                                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors flex items-center gap-1"
                                    >
                                        <Trash2 size={14} />
                                        删除 ({selectedIds.size})
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => clearStagedFiles()}
                                className="px-4 py-2 text-sm font-bold rounded-xl border border-red-200 text-red-500 hover:bg-red-50 transition-colors clay-card shadow-sm"
                            >
                                清空全部
                            </button>
                            <button
                                onClick={() => setShowExportModal(true)}
                                className="px-6 py-2 text-sm rounded-xl btn-primary font-bold transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                            >
                                <Package size={18} />
                                导出模组
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div
                className={`flex-1 overflow-auto p-8 transition-colors custom-scrollbar ${isDragging ? 'bg-blue-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isDragging ? (
                    <div className="h-full flex flex-col items-center justify-center border-4 border-dashed border-blue-300 rounded-3xl bg-blue-50/50">
                        <Package size={80} className="mb-6 text-blue-400 animate-bounce" />
                        <h2 className="text-2xl font-bold text-blue-600 mb-2">拖放文件到此处</h2>
                        <p className="text-base font-medium text-blue-400">支持 JSON 和 JS 文件</p>
                    </div>
                ) : stagedFiles.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 border-4 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                        <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                            <Package size={64} className="text-slate-300" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-500 mb-3">工作区为空</h2>
                        <p className="text-base text-center max-w-md mb-6 font-medium text-slate-400">
                            在翻译编辑器中完成翻译后，点击"添加到模组"按钮将文件添加到此处。
                        </p>
                        <p className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">或直接拖放 JSON/JS 文件到此处</p>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto space-y-4">
                        {renderFileSection('lang', groupedFiles.lang)}
                        {renderFileSection('babele', groupedFiles.babele)}
                        {renderFileSection('script', groupedFiles.script)}
                        {renderFileSection('other', groupedFiles.other)}
                    </div>
                )}
            </div>

            {/* Export Modal */}
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                projectPath={projectPath}
                files={files}
                stagedFiles={stagedFiles}
            />
        </div>
    )
}
