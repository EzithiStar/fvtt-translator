/**
 * Settings - Translation Memory Management
 * Displays TM statistics and provides management controls
 */
import { useState, useEffect } from 'react'
import { Database, Trash2, BarChart3, RefreshCw } from 'lucide-react'
import { useI18n } from '../../lib/i18n'

interface TMStats {
    totalEntries: number
    hitCount: number
    missCount: number
    hitRate: string
}

export function SettingsTM(): JSX.Element {
    const { t } = useI18n()
    const [stats, setStats] = useState<TMStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [clearing, setClearing] = useState(false)

    const loadStats = async () => {
        setLoading(true)
        try {
            const tmStats = await (window as any).api.tmGetStats()
            setStats(tmStats)
        } catch (error) {
            console.error('Failed to load TM stats:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadStats()
    }, [])

    const handleClear = async () => {
        if (!confirm(t.tmClearConfirm || '确定要清空翻译记忆库吗？所有缓存的翻译将被删除。')) return

        setClearing(true)
        try {
            await (window as any).api.tmClear()
            await loadStats()
            alert(t.tmCleared || '翻译记忆库已清空')
        } catch (error) {
            console.error('Failed to clear TM:', error)
            alert(t.tmClearFailed || '清空失败')
        } finally {
            setClearing(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-200">
                    <Database size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">{t.tmTitle || '翻译记忆库'}</h3>
                    <p className="text-sm text-slate-500">{t.tmSubtitle || '自动复用已翻译内容，减少 AI 调用'}</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                {/* Total Entries */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-500 mb-2">
                        <Database size={18} />
                        <span className="text-sm font-medium">{t.tmTotalEntries || '总条目数'}</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">
                        {loading ? '...' : stats?.totalEntries || 0}
                    </div>
                </div>

                {/* Hit Rate */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                    <div className="flex items-center gap-2 text-green-500 mb-2">
                        <BarChart3 size={18} />
                        <span className="text-sm font-medium">{t.tmHitRate || '命中率'}</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">
                        {loading ? '...' : stats?.hitRate || '0%'}
                    </div>
                </div>

                {/* Hit Count */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                    <div className="text-sm text-slate-500 mb-1">{t.tmHitCount || '命中次数'}</div>
                    <div className="text-xl font-bold text-emerald-600">
                        {loading ? '...' : stats?.hitCount || 0}
                    </div>
                </div>

                {/* Miss Count */}
                <div className="bg-white rounded-2xl p-4 border border-slate-100">
                    <div className="text-sm text-slate-500 mb-1">{t.tmMissCount || '未命中次数'}</div>
                    <div className="text-xl font-bold text-amber-600">
                        {loading ? '...' : stats?.missCount || 0}
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-2">
                <p>💡 <strong>{t.tmHowItWorks || '工作原理'}:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-slate-500">
                    <li>{t.tmDesc1 || '翻译时自动查询记忆库，100% 匹配直接使用'}</li>
                    <li>{t.tmDesc2 || 'AI 翻译结果会自动保存到记忆库'}</li>
                    <li>{t.tmDesc3 || '减少重复调用 AI，节省 Token 消耗'}</li>
                </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={loadStats}
                    disabled={loading}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    {t.refresh || '刷新'}
                </button>
                <button
                    onClick={handleClear}
                    disabled={clearing || (stats?.totalEntries === 0)}
                    className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <Trash2 size={18} />
                    {t.tmClear || '清空记忆库'}
                </button>
            </div>
        </div>
    )
}
