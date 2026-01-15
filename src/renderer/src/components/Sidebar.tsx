import { useState, useEffect, useMemo } from 'react'
import { Home, Settings, FileText, FolderOpen, Box, ChevronLeft, ChevronRight, ChevronDown, Folder } from 'lucide-react'
import { useI18n } from '../lib/i18n'

// 树节点接口
interface TreeNode {
    name: string           // 显示名称
    path: string           // 完整路径
    isFolder: boolean      // 是否为文件夹
    children: TreeNode[]   // 子节点
}

// 从平铺文件列表构建树结构
function buildTree(files: string[], projectPath: string | null): TreeNode[] {
    if (!projectPath || files.length === 0) return []

    const root: TreeNode[] = []
    const normalizedBase = projectPath.replace(/\\/g, '/')

    for (const file of files) {
        const normalizedFile = file.replace(/\\/g, '/')
        const relativePath = normalizedFile.replace(normalizedBase, '').replace(/^\//, '')
        const parts = relativePath.split('/')

        let currentLevel = root
        let currentPath = normalizedBase

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i]
            currentPath += '/' + part
            const isLastPart = i === parts.length - 1

            let existing = currentLevel.find(n => n.name === part)

            if (!existing) {
                existing = {
                    name: part,
                    path: currentPath.replace(/\//g, '\\'), // 恢复 Windows 路径格式
                    isFolder: !isLastPart,
                    children: []
                }
                currentLevel.push(existing)
            }

            if (!isLastPart) {
                currentLevel = existing.children
            }
        }
    }

    // 排序：文件夹在前，文件在后，按名称排序
    const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.sort((a, b) => {
            if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
            return a.name.localeCompare(b.name)
        }).map(n => ({ ...n, children: sortNodes(n.children) }))
    }

    return sortNodes(root)
}

// 树节点渲染组件（递归）
interface TreeNodeItemProps {
    node: TreeNode
    depth: number
    collapsed: boolean
    currentFile: string | null
    progressMap: Record<string, number>
    expandedFolders: Set<string>
    toggleFolder: (path: string) => void
    onOpenFile: (file: string) => void
}

function TreeNodeItem({
    node,
    depth,
    collapsed,
    currentFile,
    progressMap,
    expandedFolders,
    toggleFolder,
    onOpenFile
}: TreeNodeItemProps) {
    const isExpanded = expandedFolders.has(node.path)
    const isActive = currentFile === node.path
    const isJson = node.name.endsWith('.json')
    const progress = progressMap[node.path] ?? null

    if (node.isFolder) {
        return (
            <div>
                <button
                    onClick={() => toggleFolder(node.path)}
                    className={`w-full text-left rounded-lg transition-all flex items-center gap-2 p-2 hover:bg-white/60 text-slate-600 hover:text-slate-800`}
                    style={{ paddingLeft: collapsed ? 8 : 8 + depth * 12 }}
                >
                    {!collapsed && (
                        <span className="text-slate-400 transition-transform" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                            <ChevronRight size={14} />
                        </span>
                    )}
                    <div className="bg-amber-100 p-1 rounded-md">
                        <Folder size={14} className="text-amber-500" />
                    </div>
                    {!collapsed && <span className="text-xs font-medium truncate">{node.name}</span>}
                </button>
                {isExpanded && !collapsed && (
                    <div className="space-y-0.5">
                        {node.children.map(child => (
                            <TreeNodeItem
                                key={child.path}
                                node={child}
                                depth={depth + 1}
                                collapsed={collapsed}
                                currentFile={currentFile}
                                progressMap={progressMap}
                                expandedFolders={expandedFolders}
                                toggleFolder={toggleFolder}
                                onOpenFile={onOpenFile}
                            />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    // 文件节点
    return (
        <button
            onClick={() => onOpenFile(node.path)}
            className={`w-full text-left rounded-lg transition-all flex items-center gap-2 p-2
                ${isActive
                    ? 'bg-white border border-blue-200 shadow-sm text-slate-800'
                    : 'hover:bg-white/60 text-slate-500 hover:text-slate-700 border border-transparent'
                }`}
            style={{ paddingLeft: collapsed ? 8 : 8 + depth * 12 }}
            title={node.name}
        >
            <div className={`p-1 rounded-md ${isActive ? (isJson ? 'bg-blue-100' : 'bg-orange-100') : 'bg-slate-100'}`}>
                {isJson ? (
                    <FileText size={14} className={isActive ? 'text-blue-500' : 'text-slate-400'} />
                ) : (
                    <Box size={14} className={isActive ? 'text-orange-500' : 'text-slate-400'} />
                )}
            </div>
            {!collapsed && (
                <>
                    <span className="text-xs font-medium truncate flex-1">{node.name}</span>
                    {progress !== null && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${progress === 100 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                            {progress}%
                        </span>
                    )}
                </>
            )}
        </button>
    )
}

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
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

    // 构建树结构
    const fileTree = useMemo(() => buildTree(files, projectPath), [files, projectPath])

    // 展开/折叠文件夹
    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev)
            if (next.has(path)) {
                next.delete(path)
            } else {
                next.add(path)
            }
            return next
        })
    }

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

                <div className={`${collapsed ? 'px-2' : 'px-3'} space-y-1 pb-4`}>
                    {fileTree.length > 0 ? (
                        fileTree.map(node => (
                            <TreeNodeItem
                                key={node.path}
                                node={node}
                                depth={0}
                                collapsed={collapsed}
                                currentFile={currentFile}
                                progressMap={progressMap}
                                expandedFolders={expandedFolders}
                                toggleFolder={toggleFolder}
                                onOpenFile={onOpenFile}
                            />
                        ))
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
