import { useState, useEffect } from 'react'
import { Home, Settings, FileText, FolderOpen, Box, ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '../lib/i18n'

interface SidebarProps {
    projectPath: string | null
    files: string[]
    currentFile: string | null
    onOpenFile: (file: string) => void
    onOpenProject: () => void
    onOpenSingleFile: () => void
    onGoHome: () => void
    onOpenSettings: () => void
    currentView: 'home' | 'editor' | 'settings' | 'workspace'
}

export function Sidebar({
    projectPath,
    files,
    currentFile,
    onOpenFile,
    onOpenProject,
    onOpenSingleFile,
    onGoHome,
    onOpenSettings,
    currentView
}: SidebarProps) {
    const { t } = useI18n()
    const [progressMap, setProgressMap] = useState<Record<string, number>>({})
    const [collapsed, setCollapsed] = useState(false)

    useEffect(() => {
        const fetchProgress = async () => {
            const map: Record<string, number> = {}
            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        const stats = await (window as any).api.calculateProgress(file)
                        map[file] = stats.percentage
                    } catch (e) {
                        console.error(e)
                    }
                }
            }
            setProgressMap(map)
        }

        if (files.length > 0) {
            fetchProgress()
        }
    }, [files])

    return (
        <div className={`${collapsed ? 'w-16' : 'w-64'} clay-sidebar flex flex-col h-full shrink-0 transition-all duration-300 z-20`}>
            {/* Header / Logo Area */}
            <div className="p-4 border-b border-white/40 flex items-center justify-between shrink-0">
                {!collapsed && (
                    <div onClick={onGoHome} className="cursor-pointer font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-80 transition-opacity text-base">
                        {t.appTitle}
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 rounded-xl hover:bg-white/50 text-slate-400 hover:text-blue-500 transition-all shadow-sm hover:shadow-md"
                    title={collapsed ? '展开' : '收起'}
                >
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Section: Project */}
            <div className="p-3 border-b border-white/40 shrink-0">
                {!collapsed && (
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-2">
                        {t.sectionProject}
                    </div>
                )}
                <button
                    onClick={onOpenProject}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 
                        ${collapsed ? 'justify-center' : ''}
                        text-slate-600 hover:text-blue-600 bg-white/40 hover:bg-white/80 border border-white/40 hover:border-white shadow-sm hover:shadow-md group`}
                    title={t.openProject}
                >
                    <div className="bg-blue-100 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                        <FolderOpen size={18} className="text-blue-500" />
                    </div>
                    {!collapsed && <span className="font-medium text-sm">{t.openProject}</span>}
                </button>
            </div>

            {/* Section: Files */}
            <div className="flex-1 min-h-[200px] overflow-y-auto flex flex-col custom-scrollbar border-b border-white/40">
                <div className="p-3 sticky top-0 md:static z-10 bg-inherit backdrop-blur-sm">
                    {!collapsed ? (
                        <div className="flex items-center justify-between mb-2 px-1">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {t.sectionFiles}
                            </div>
                            <button onClick={onOpenSingleFile} className="clay-icon-btn p-1.5" title={t.openFile}>
                                <div className="bg-purple-100 p-1 rounded-md">
                                    <FileText size={12} className="text-purple-500" />
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-center mb-2">
                            <button onClick={onOpenSingleFile} className="clay-icon-btn" title={t.openFile}>
                                <FileText size={18} />
                            </button>
                        </div>
                    )}
                </div>

                <div className={`${collapsed ? 'px-2' : 'px-3'} space-y-2 pb-4`}>
                    {files.length > 0 ? (
                        files.map(file => {
                            const fileName = file.replace(projectPath || '', '').replace(/^[\\/]/, '') || file.split(/[/\\]/).pop()
                            const isActive = currentFile === file
                            const isJson = file.endsWith('.json')
                            const progress = progressMap[file] !== undefined ? progressMap[file] : null

                            return (
                                <button
                                    key={file}
                                    onClick={() => onOpenFile(file)}
                                    className={`w-full text-left rounded-xl transition-all flex border
                                        ${collapsed ? 'p-2 justify-center flex-col gap-1' : 'p-3 flex-col gap-2'}
                                        ${isActive
                                            ? 'bg-white border-blue-200 shadow-md transform -translate-y-0.5'
                                            : 'bg-white/30 border-transparent hover:bg-white/60 hover:border-white/50 hover:shadow-sm text-slate-500 hover:text-slate-700'
                                        }`}
                                    title={fileName}
                                >
                                    <div className={`flex items-center gap-3 w-full ${collapsed ? 'justify-center' : ''}`}>
                                        <div className={`p-1.5 rounded-lg transition-colors ${isActive ? (isJson ? 'bg-blue-100' : 'bg-orange-100') : 'bg-slate-100'}`}>
                                            {isJson ? (
                                                <FileText size={16} className={isActive ? 'text-blue-500' : 'text-slate-400'} />
                                            ) : (
                                                <Box size={16} className={isActive ? 'text-orange-500' : 'text-slate-400'} />
                                            )}
                                        </div>

                                        {!collapsed && (
                                            <>
                                                <span className={`truncate flex-1 text-sm font-medium ${isActive ? 'text-slate-800' : ''}`}>
                                                    {fileName}
                                                </span>
                                                {progress !== null && (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${progress === 100
                                                        ? 'bg-green-100 text-green-600'
                                                        : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {progress}%
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {!collapsed && progress !== null && (
                                        <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${progress === 100
                                                    ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                                                    : 'bg-gradient-to-r from-blue-400 to-indigo-400'
                                                    }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    )}
                                </button>
                            )
                        })
                    ) : (
                        !collapsed && (
                            <div className="flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed border-slate-300 rounded-xl mx-1 bg-white/20">
                                <div className="bg-slate-100 p-3 rounded-full mb-3 text-slate-400">
                                    <FolderOpen size={24} />
                                </div>
                                <p className="text-xs text-slate-500 font-medium text-center">{t.noTermsFoundSidebar}</p>
                                <p className="text-[10px] text-slate-400 text-center mt-1">{t.dragDropFiles}</p>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className={`border-t border-white/40 space-y-2 shrink-0 ${collapsed ? 'p-2' : 'p-4'}`}>
                <button
                    onClick={onGoHome}
                    className={`w-full text-left rounded-xl transition-all flex items-center gap-3
                        ${collapsed ? 'justify-center p-3' : 'px-4 py-3'} 
                        ${currentView === 'home' ? 'bg-white shadow-md text-purple-600' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'}`}
                    title={t.appTitle}
                >
                    <Home size={20} className={currentView === 'home' ? 'text-purple-500' : 'text-slate-400'} />
                    {!collapsed && <span className="font-medium text-sm">{t.appTitle}</span>}
                </button>
                <button
                    onClick={onOpenSettings}
                    className={`w-full text-left rounded-xl transition-all flex items-center gap-3
                        ${collapsed ? 'justify-center p-3' : 'px-4 py-3'} 
                        ${currentView === 'settings' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:bg-white/50 hover:text-slate-700 hover:shadow-sm'}`}
                    title={t.settings}
                >
                    <Settings size={20} className={currentView === 'settings' ? 'text-blue-500' : 'text-slate-400'} />
                    {!collapsed && <span className="font-medium text-sm">{t.settings}</span>}
                </button>
            </div>
        </div>
    )
}
