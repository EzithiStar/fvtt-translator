import { useState } from 'react'
import { useI18n } from '../lib/i18n'
import { ExportModal } from './ExportModal'
import { GlossaryManager } from './GlossaryManager'
import { BlacklistModal } from './BlacklistModal'
import { FileBox, Book, FileText, ShieldAlert, FolderOpen } from 'lucide-react'

interface DashboardProps {
    projectPath: string | null
    setProjectPath: (path: string) => void
    files: string[]
    setFiles: (files: string[]) => void
    onOpenEditor: (file: string) => void
    onOpenSettings: () => void
    onOpenProjectTrigger: () => void
    onOpenFileTrigger: () => void
    loading: boolean
}

export function Dashboard({
    projectPath,
    files,
    onOpenEditor,
    onOpenSettings,
    onOpenProjectTrigger,
    onOpenFileTrigger,
    loading
}: DashboardProps): JSX.Element {
    const { t } = useI18n()
    const [showExportModal, setShowExportModal] = useState(false)
    const [showGlossary, setShowGlossary] = useState(false)
    const [showBlacklist, setShowBlacklist] = useState(false)

    // Internal logic moved to App.tsx

    return (
        <div className="flex flex-col h-full p-6 overflow-hidden max-w-7xl mx-auto w-full">
            {/* Header - Clay Style */}
            <header className="mb-6 flex justify-between items-center animate-fadeIn">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
                        {t.appTitle}
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowBlacklist(true)}
                        className="clay-card py-2 px-3 text-xs text-rose-500 hover:text-rose-600 hover:scale-105 transition-all flex items-center gap-1.5 font-medium"
                        title={t.blacklist}
                    >
                        <ShieldAlert size={16} />
                        {t.blacklist}
                    </button>
                    <button
                        onClick={() => setShowGlossary(true)}
                        className="clay-card py-2 px-3 text-xs text-purple-500 hover:text-purple-600 hover:scale-105 transition-all flex items-center gap-1.5 font-medium"
                    >
                        <Book size={16} />
                        {t.glossary}
                    </button>
                    {projectPath && files.length > 0 && (
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
                        >
                            <FileBox size={16} />
                            {t.exportModule || "Export"}
                        </button>
                    )}
                </div>
            </header>

            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                projectPath={projectPath}
                files={files}
            />

            <GlossaryManager
                isOpen={showGlossary}
                onClose={() => setShowGlossary(false)}
            />

            <BlacklistModal
                isOpen={showBlacklist}
                onClose={() => setShowBlacklist(false)}
            />

            {/* Main Action Area */}
            <div className="flex-1 flex flex-col min-h-0 gap-6">
                <div className="clay-panel p-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                        <button
                            onClick={onOpenProjectTrigger}
                            className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 group whitespace-nowrap"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 2H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
                            {projectPath ? t.openProject : t.openProject}
                        </button>

                        <button
                            onClick={onOpenFileTrigger}
                            className="btn-secondary text-sm px-5 py-2.5 flex items-center gap-2 group whitespace-nowrap"
                        >
                            <FileText size={18} className="text-blue-500 group-hover:scale-110 transition-transform" />
                            {t.openFile || "Open File"}
                        </button>

                        {projectPath ? (
                            <div className="flex items-center gap-3 ml-2 overflow-hidden bg-white/50 px-3 py-1.5 rounded-lg border border-white/60">
                                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold whitespace-nowrap">{t.currentProject}</span>
                                <div className="text-slate-600 font-mono text-xs truncate">
                                    {projectPath}
                                </div>
                            </div>
                        ) : (
                            <span className="text-slate-400 italic flex items-center gap-2 ml-2 text-xs truncate">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 11-1 9" /><path d="m19 11-4-7" /><path d="M2 11h20" /><path d="m3.5 11 1.6 7.4a2 2 0 0 0 2 1.6h9.8c.9 0 1.8-.7 2-1.6l1.7-7.4" /><path d="m4.5 11 4-7" /><path d="m9 11 1 9" /></svg>
                                {t.pleaseOpen}
                            </span>
                        )}
                    </div>
                </div>

                {/* File Grid */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-blue-500 animate-pulse">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                            <span className="text-sm font-medium text-slate-500">Scanning...</span>
                        </div>
                    </div>
                ) : files.length > 0 ? (
                    <div className="flex-1 overflow-y-auto pr-2 pb-4 min-h-0 custom-scrollbar clay-panel bg-white/50 backdrop-blur-sm p-1">
                        {/* List Header */}
                        <div className="grid grid-cols-[auto_1fr_100px_100px] gap-4 mb-2 px-4 py-3 font-bold text-slate-400 text-xs tracking-wider border-b border-gray-100 uppercase sticky top-0 bg-[#FAFAF7]/95 z-10 backdrop-blur-md">
                            <div className="w-10"></div>
                            <div>{t.fileName}</div>
                            <div>{t.type}</div>
                            <div className="text-right">{t.action}</div>
                        </div>

                        <div className="space-y-2 p-2">
                            {files.map((file) => {
                                const ext = file.split('.').pop()
                                const isJson = ext === 'json'
                                const isJs = ext === 'js'
                                const fileName = file.replace(projectPath || '', '').replace(/^[\\/]/, '') || file.split(/[/\\]/).pop()

                                return (
                                    <div
                                        key={file}
                                        onClick={() => onOpenEditor(file)}
                                        className="clay-card group grid grid-cols-[auto_1fr_100px_100px] gap-4 items-center px-4 py-3 cursor-pointer hover:bg-white border-transparent hover:border-blue-100"
                                    >
                                        <div className="w-10 flex justify-center">
                                            <div className={`p-2 rounded-lg ${isJson ? 'bg-orange-100' : isJs ? 'bg-blue-100' : 'bg-green-100'}`}>
                                                {isJson ? (
                                                    <FileText size={20} className="text-orange-500" />
                                                ) : isJs ? (
                                                    <FileBox size={20} className="text-blue-500" />
                                                ) : (
                                                    <Book size={20} className="text-green-500" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-slate-700 font-bold text-sm truncate group-hover:text-blue-600 transition-colors">{fileName}</div>
                                            <div className="text-slate-400 text-xs truncate mt-0.5">{file}</div>
                                        </div>
                                        <div>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border
                                                    ${isJson ? 'bg-orange-50 border-orange-100 text-orange-600' :
                                                    isJs ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                                        'bg-green-50 border-green-100 text-green-600'}`}>
                                                {isJson ? 'JSON' : isJs ? 'JS' : 'OTHER'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <button className="text-sm font-semibold text-blue-500 opacity-0 group-hover:opacity-100 transition-all hover:text-blue-600 hover:translate-x-1 flex items-center justify-end gap-1 ml-auto bg-blue-50 px-3 py-1 rounded-full">
                                                {t.translate} <span className="text-lg leading-none mb-0.5">&rarr;</span>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-slate-400 gap-6 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                        <div className="bg-slate-100 p-6 rounded-full">
                            <FolderOpen size={48} className="text-slate-300" />
                        </div>
                        <p className="font-medium text-lg text-slate-500">{projectPath ? (t.noFilesFound || "No translatable files found.") : (t.selectProjectPrompt || "Select a project to begin.")}</p>
                        {!projectPath && (
                            <button onClick={onOpenProjectTrigger} className="btn-primary">
                                {t.openProject}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
