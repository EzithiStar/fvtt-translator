import { useState } from 'react'
import { Book, FileBox, X } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { GlossaryManager } from './GlossaryManager'
import { ExportModal } from './ExportModal'

interface ToolPanelProps {
    isOpen: boolean
    activeTool: 'glossary' | 'export' | null
    onClose: () => void
    projectPath: string | null
    files: string[]
    dock?: 'right' | 'bottom'
}

export function ToolPanel({ isOpen, activeTool, onClose, projectPath, files, dock = 'right' }: ToolPanelProps) {
    const { t } = useI18n()

    // Determine base classes based on dock position
    const baseClasses = "flex flex-col transition-all duration-300 overflow-hidden z-30 shadow-2xl bg-white/50 backdrop-blur-2xl"
    const dockClasses = dock === 'right'
        ? `absolute right-0 top-0 bottom-0 border-l border-[#E5DDD5] ${isOpen ? 'w-[400px] translate-x-0' : 'w-0 translate-x-full opacity-0'}`
        : `absolute bottom-0 left-0 right-0 border-t border-[#E5DDD5] w-full ${isOpen ? 'h-72 translate-y-0' : 'h-0 translate-y-full opacity-0'}`

    return (
        <div className={`${baseClasses} ${dockClasses}`}>
            {isOpen && (
                <>
                    <div className="p-4 border-b border-white/30 flex items-center justify-between shrink-0">
                        <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">
                            {activeTool === 'glossary' ? t.glossaryManager : t.exportModule}
                        </h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {activeTool === 'glossary' && (
                            <div className="h-full">
                                <GlossaryManager isOpen={true} onClose={() => { }} inline={true} />
                            </div>
                        )}
                        {activeTool === 'export' && (
                            <div className="h-full">
                                <ExportModal isOpen={true} onClose={() => { }} projectPath={projectPath} files={files} inline={true} />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
