import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import { useI18n } from '../lib/i18n'

interface PromptModalProps {
    isOpen: boolean
    title: string
    defaultValue?: string
    onConfirm: (value: string) => void
    onClose: () => void
}

export function PromptModal({ isOpen, title, defaultValue = '', onConfirm, onClose }: PromptModalProps): JSX.Element | null {
    const { t } = useI18n()
    const [value, setValue] = useState(defaultValue)

    useEffect(() => {
        if (isOpen) setValue(defaultValue)
    }, [isOpen, defaultValue])

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onConfirm(value)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-[400px] p-4 animate-scaleIn">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-200">{title}</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        >
                            {t.cancel || 'Cancel'}
                        </button>
                        <button
                            type="submit"
                            className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex items-center gap-1.5 shadow-sm transition-all"
                        >
                            <Check size={14} />
                            {t.confirm || 'Confirm'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
