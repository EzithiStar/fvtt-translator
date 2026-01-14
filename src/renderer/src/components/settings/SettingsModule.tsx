import { useI18n } from '../../lib/i18n'
import { AppSettings } from './SettingsTypes'
import { FolderOpen, Package, AlertCircle, Users, Link, CheckCircle, Globe } from 'lucide-react'

interface Props {
    settings: AppSettings
    updateSettings: (updates: Partial<AppSettings>) => void
}

export function SettingsModule({ settings, updateSettings }: Props) {
    const { t, lang } = useI18n()

    // Helper to update module defaults
    const updateDefaults = (updates: Partial<AppSettings['moduleDefaults']>) => {
        updateSettings({
            moduleDefaults: {
                ...settings.moduleDefaults,
                ...updates
            }
        })
    }

    const updateCompatibility = (updates: Partial<AppSettings['moduleDefaults']['compatibility']>) => {
        updateSettings({
            moduleDefaults: {
                ...settings.moduleDefaults,
                compatibility: {
                    ...settings.moduleDefaults.compatibility,
                    ...updates
                }
            }
        })
    }

    const handleSelectFolder = async () => {
        const path = await (window as any).api.selectDirectory()
        if (path) {
            updateSettings({ workspacePath: path })
        }
    }

    return (
        <div className="space-y-8 animate-fade-in pb-8">
            {/* Workspace Path */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 border-b border-gray-200 pb-2 flex items-center gap-2">
                    <Package size={20} className="text-green-500" />
                    {lang === 'zh' ? '模组工作区 (Workspace)' : 'Module Workspace'}
                </h3>

                <div className="clay-card p-6 border border-slate-100 space-y-5 bg-slate-50/50">
                    <div className="flex gap-4">
                        <button
                            onClick={() => updateSettings({ workspacePath: 'default' })}
                            className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all shadow-sm ${settings.workspacePath === 'default'
                                ? 'bg-green-50 border-green-200 text-green-700 shadow-md'
                                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {lang === 'zh' ? '使用默认目录' : 'Default Directory'}
                        </button>
                        <button
                            onClick={handleSelectFolder}
                            className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${settings.workspacePath !== 'default'
                                ? 'bg-green-50 border-green-200 text-green-700 shadow-md'
                                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            <FolderOpen size={16} />
                            {lang === 'zh' ? '选择自定义目录...' : 'Custom Directory...'}
                        </button>
                    </div>

                    <div className="relative">
                        <label className="absolute -top-2.5 left-3 bg-[#FAFAF7] px-2 text-xs font-bold text-slate-400">
                            {lang === 'zh' ? '当前路径' : 'Current Path'}
                        </label>
                        <div className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-600 break-all shadow-inner">
                            {settings.workspacePath === 'default'
                                ? (lang === 'zh' ? './ (与项目同目录)' : './ (Project Directory)')
                                : settings.workspacePath}
                        </div>
                    </div>

                    <div className="flex items-start gap-3 text-xs text-slate-500 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <AlertCircle size={16} className="mt-0.5 text-blue-400 shrink-0" />
                        <p className="leading-relaxed">
                            {lang === 'zh'
                                ? '工作区目录用于存放模组构建过程中的文件。导出模组时，生成的结果也会默认保存到此位置附近。'
                                : 'The workspace directory stores files during the module building process. Exported modules will also be saved near here by default.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Global Defaults */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 border-b border-gray-200 pb-2 flex items-center gap-2">
                    <Globe size={20} className="text-blue-500" />
                    {t.moduleDefaults || 'Global Defaults'}
                </h3>
                <p className="text-xs text-slate-400 font-medium -mt-2">
                    {lang === 'zh'
                        ? '预设构建新模组时的默认信息。'
                        : 'Default information used when building new modules.'}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Authors */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                            <Users size={16} className="text-slate-400" />
                            {t.defaultAuthors || 'Default Authors'}
                        </label>
                        <input
                            type="text"
                            value={settings.moduleDefaults.authors}
                            onChange={(e) => updateDefaults({ authors: e.target.value })}
                            className="input-field w-full"
                            placeholder={t.defaultAuthorsPlaceholder || 'e.g. Name'}
                        />
                    </div>

                    {/* Compatibility */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                            <CheckCircle size={16} className="text-slate-400" />
                            {t.compatibility || 'Compatibility'}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.minimum || 'Min'}</span>
                                <input
                                    type="text"
                                    value={settings.moduleDefaults.compatibility.minimum}
                                    onChange={(e) => updateCompatibility({ minimum: e.target.value })}
                                    className="input-field w-full text-center p-2"
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.verified || 'Verified'}</span>
                                <input
                                    type="text"
                                    value={settings.moduleDefaults.compatibility.verified}
                                    onChange={(e) => updateCompatibility({ verified: e.target.value })}
                                    className="input-field w-full text-center p-2"
                                />
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t.maximum || 'Max'}</span>
                                <input
                                    type="text"
                                    value={settings.moduleDefaults.compatibility.maximum}
                                    onChange={(e) => updateCompatibility({ maximum: e.target.value })}
                                    className="input-field w-full text-center p-2"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Link Templates */}
                <div className="space-y-3 pt-4">
                    <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                        <Link size={16} className="text-slate-400" />
                        {t.linkTemplates || 'Links'}
                    </label>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-xs font-bold text-slate-400 font-mono">URL</div>
                            <input
                                type="text"
                                value={settings.moduleDefaults.url}
                                onChange={(e) => updateDefaults({ url: e.target.value })}
                                className="input-field w-full pl-12"
                                placeholder="https://github.com/user/repo"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-xs font-bold text-slate-400 font-mono">JSON</div>
                            <input
                                type="text"
                                value={settings.moduleDefaults.manifest}
                                onChange={(e) => updateDefaults({ manifest: e.target.value })}
                                className="input-field w-full pl-12"
                                placeholder="https://github.com/user/repo/releases/latest/download/module.json"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-3 text-xs font-bold text-slate-400 font-mono">ZIP</div>
                            <input
                                type="text"
                                value={settings.moduleDefaults.download}
                                onChange={(e) => updateDefaults({ download: e.target.value })}
                                className="input-field w-full pl-12"
                                placeholder="https://github.com/user/repo/releases/latest/download/module.zip"
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 italic">
                        {lang === 'zh'
                            ? '提示: 构建新模组时将自动填充这些链接。'
                            : 'Tip: These links will be auto-filled when creating a new module.'}
                    </p>
                </div>
            </section>
        </div>
    )
}
