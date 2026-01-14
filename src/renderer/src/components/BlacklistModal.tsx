import { useState, useEffect } from 'react'
import { X, Plus, Trash2, ShieldAlert } from 'lucide-react'
import { useI18n } from '../lib/i18n'

interface BlacklistModalProps {
    isOpen: boolean
    onClose: () => void
}

export function BlacklistModal({ isOpen, onClose }: BlacklistModalProps): JSX.Element | null {
    const { t } = useI18n()
    const [keys, setKeys] = useState<string[]>([])
    const [newKey, setNewKey] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) loadBlacklist()
    }, [isOpen])

    const loadBlacklist = async () => {
        try {
            setLoading(true)
            const list = await (window as any).api.getBlacklist()
            setKeys(list)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async () => {
        if (!newKey.trim()) return
        if (keys.includes(newKey.trim())) return

        try {
            await (window as any).api.addBlacklist(newKey.trim())
            setNewKey('')
            loadBlacklist()
        } catch (e) {
            console.error(e)
        }
    }

    const handleRemove = async (key: string) => {
        try {
            await (window as any).api.removeBlacklist(key)
            loadBlacklist()
        } catch (e) {
            console.error(e)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAdd()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-orange-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center shadow-lg shadow-rose-200">
                            <ShieldAlert size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">{t.blacklistManager || "Blacklist Manager"}</h2>
                            <p className="text-xs text-slate-500">{t.blacklistHelper || "Add keys to exclude."}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 overflow-hidden flex flex-col gap-4">
                    {/* Add Input */}
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t.enterKey || "Enter key to block..."}
                            className="input-field flex-1"
                        />
                        <button
                            onClick={handleAdd}
                            disabled={!newKey.trim()}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-bold shadow-lg shadow-rose-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 transition-all flex items-center gap-2"
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 rounded-2xl border border-slate-100 p-3 min-h-[200px]">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="w-8 h-8 border-3 border-slate-200 border-t-rose-500 rounded-full animate-spin"></div>
                            </div>
                        ) : keys.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                <ShieldAlert size={40} className="mb-3 opacity-30" />
                                <p className="text-sm font-medium">{t.noBlacklist || "No blocked keys yet."}</p>
                                <p className="text-xs mt-1">Add keys above to filter them out.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {keys.map(key => (
                                    <div
                                        key={key}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 hover:border-rose-200 hover:shadow-sm group transition-all"
                                    >
                                        <span className="text-sm font-mono text-slate-700 break-all">{key}</span>
                                        <button
                                            onClick={() => handleRemove(key)}
                                            className="p-2 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
