import { useState, useEffect } from 'react'
import { Dashboard } from './components/Dashboard'
import { TranslationEditor } from './components/TranslationEditor'
import { Settings } from './components/Settings'
import { Sidebar } from './components/Sidebar'
import { ToolPanel } from './components/ToolPanel'
import { WorkspaceView } from './components/WorkspaceView'
import { useI18n } from './lib/i18n'
import { useFileTabStore } from './lib/fileTabStore'
import './index.css'

export default function App(): JSX.Element {
    const { t } = useI18n()
    const [view, setView] = useState<'home' | 'editor' | 'settings' | 'workspace'>('home')
    const [previousView, setPreviousView] = useState<'home' | 'editor' | 'settings'>('home') // 记录上一个视图
    const [currentFile, setCurrentFile] = useState<string | null>(null)
    const [projectPath, setProjectPath] = useState<string | null>(null)
    const [projectFiles, setProjectFiles] = useState<string[]>([])
    const [activeTool, setActiveTool] = useState<'glossary' | 'export' | null>(null)
    const [toolDock, setToolDock] = useState<'right' | 'bottom'>('right')
    // loading state managed by child components or specific actions
    const [loading, setLoading] = useState(false)

    // File Tabs Integration
    const { activeFile, openFile } = useFileTabStore()

    // Sync view with active file tab
    useEffect(() => {
        if (activeFile) {
            setCurrentFile(activeFile)
            if (view !== 'settings' && view !== 'workspace') {
                setView('editor')
            }
        } else {
            // Only switch back to home if we were in editor mode and closed all files
            if (view === 'editor') {
                setCurrentFile(null)
                setView('home')
            }
        }
    }, [activeFile])

    // 切换到工作区时记住当前视图
    const goToWorkspace = () => {
        setPreviousView(view === 'workspace' ? 'home' : view as 'home' | 'editor' | 'settings')
        setView('workspace')
    }

    // 从工作区返回时恢复之前的视图
    const goBackFromWorkspace = () => {
        // 如果之前在编辑器且有文件，返回编辑器；否则返回主页
        if (previousView === 'editor' && activeFile) {
            setView('editor')
        } else {
            setView('home')
        }
    }

    // Lifted Logic: Open Project
    const handleOpenProject = async () => {
        const path = await (window as any).api.selectDirectory()
        if (path) {
            setProjectPath(path)
            await loadFiles(path)
        }
    }

    // Lifted Logic: Open Single File/Zip
    const handleOpenSingleFile = async () => {
        const file = await (window as any).api.selectFile(['json', 'zip'])
        if (!file) return

        if (file.endsWith('.zip')) {
            setLoading(true)
            try {
                const targetPath = await (window as any).api.extractZip(file)
                setProjectPath(targetPath)
                await loadFiles(targetPath)
                alert(t.zipExtracted?.replace('{path}', targetPath) || 'Zip extracted successfully')
            } catch (e) {
                console.error(e)
                alert(t.zipFailed || 'Failed to extract zip file')
            } finally {
                setLoading(false)
            }
        } else {
            // 单文件模式：projectPath 为 null，files 直接包含该文件
            setProjectPath(null)
            setProjectFiles([file])
            // Auto open the file via store
            openFile(file)
        }
    }

    const loadFiles = async (path: string) => {
        setLoading(true)
        try {
            const foundFiles = await (window as any).api.getFiles(path, ['.json', '.js', '.db'])
            setProjectFiles(foundFiles)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenFile = (file: string) => {
        openFile(file)
    }

    const toggleTool = (tool: 'glossary' | 'export') => {
        setActiveTool(current => current === tool ? null : tool)
    }

    return (
        <div className="h-screen w-screen bg-[#FAFAF7] text-slate-700 overflow-hidden flex">
            {/* Left Sidebar - Hidden in Settings View to avoid 3-column layout */}
            {view !== 'settings' && (
                <Sidebar
                    projectPath={projectPath}
                    files={projectFiles}
                    currentFile={currentFile}
                    onOpenFile={handleOpenFile}
                    onOpenProject={handleOpenProject}
                    onOpenSingleFile={handleOpenSingleFile}
                    onGoHome={() => setView('home')}
                    onOpenSettings={() => setView('settings')}
                    currentView={view}
                />
            )}

            {/* Main Layout */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAF7] relative h-full">
                {/* Horizontal Container for Editor + Right Panel */}
                <div className="flex-1 flex flex-row min-h-0 overflow-hidden relative">

                    {/* Editor Area (Flex 1) */}
                    <div className="flex-1 flex flex-col min-w-0 relative">
                        {view === 'settings' ? (
                            <Settings onBack={() => setView('home')} />
                        ) : view === 'workspace' ? (
                            <WorkspaceView
                                projectPath={projectPath}
                                files={projectFiles}
                                onBack={goBackFromWorkspace}
                            />
                        ) : (
                            <div className="flex-1 overflow-hidden relative border-r border-[#E5DDD5]">
                                {view === 'editor' && currentFile ? (
                                    <TranslationEditor
                                        file={currentFile}
                                        projectPath={projectPath}
                                        onSave={() => { }}
                                        onBack={() => setView('home')}
                                    />
                                ) : (
                                    <Dashboard
                                        projectPath={projectPath}
                                        setProjectPath={setProjectPath}
                                        files={projectFiles}
                                        setFiles={setProjectFiles}
                                        onOpenEditor={handleOpenFile}
                                        onOpenSettings={() => setView('settings')}
                                        onOpenProjectTrigger={handleOpenProject}
                                        onOpenFileTrigger={handleOpenSingleFile}
                                        loading={loading}
                                    />
                                )}
                            </div>
                        )}

                        {/* If Dock Bottom, ToolPanel lives here inside the vertical flex of Main Area */}
                        {toolDock === 'bottom' && (
                            <div className="border-t border-[#E5DDD5] bg-[#FFFDF9] border-r border-[#E5DDD5]">
                                <ToolPanel
                                    isOpen={!!activeTool}
                                    activeTool={activeTool}
                                    onClose={() => setActiveTool(null)}
                                    projectPath={projectPath}
                                    files={projectFiles}
                                    dock="bottom"
                                />
                            </div>
                        )}
                    </div>

                    {/* If Dock Right, ToolPanel lives here */}
                    {toolDock === 'right' && (
                        <ToolPanel
                            isOpen={!!activeTool}
                            activeTool={activeTool}
                            onClose={() => setActiveTool(null)}
                            projectPath={projectPath}
                            files={projectFiles}
                            dock="right"
                        />
                    )}
                </div>
            </div>

            {/* Right Control Strip */}
            <div className="w-14 bg-[#FFFDF9] border-l border-[#E5DDD5] flex flex-col items-center py-4 gap-4 z-20 shrink-0 shadow-sm">
                <button
                    onClick={() => toggleTool('glossary')}
                    className={`clay-icon-btn ${activeTool === 'glossary' ? 'active' : ''}`}
                    title={t.glossary}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                </button>

                {/* Workspace Button */}
                <button
                    onClick={goToWorkspace}
                    className={`clay-icon-btn ${view === 'workspace' ? 'active' : ''}`}
                    title="模组工作区"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>
                </button>

                <div className="flex-1" />

                {/* Close Tool Panel Button (only show when a tool is open) */}
                {activeTool && (
                    <button
                        onClick={() => setActiveTool(null)}
                        className="clay-icon-btn text-rose-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-200"
                        title="关闭面板"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                )}
            </div>
        </div>
    )
}

