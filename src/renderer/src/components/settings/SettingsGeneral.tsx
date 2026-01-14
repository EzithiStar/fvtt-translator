import { useI18n } from '../../lib/i18n'
import { AppSettings } from './SettingsTypes'
import { Monitor, Moon, Sun, Check, Languages } from 'lucide-react'

interface Props {
    settings: AppSettings
    updateSettings: (updates: Partial<AppSettings>) => void
}

export function SettingsGeneral({ settings, updateSettings }: Props) {
    const { t, setLang, lang } = useI18n()

    const handleLangChange = (newLang: 'en' | 'zh') => {
        setLang(newLang)
        updateSettings({ language: newLang })
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Language */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 border-b border-gray-200 pb-2 flex items-center gap-2">
                    <Languages size={20} className="text-blue-500" />
                    {t.interfaceLanguage}
                </h3>

                <div className="flex flex-wrap gap-4">
                    {/* English Option */}
                    <button
                        onClick={() => handleLangChange('en')}
                        className={`group relative p-4 rounded-2xl text-left transition-all duration-300 overflow-hidden clay-card min-w-[160px] flex-1 ${lang === 'en'
                            ? 'bg-blue-50 border-blue-200 shadow-lg'
                            : 'hover:bg-white hover:shadow-md border-transparent'
                            }`}
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <span className="text-3xl filter drop-shadow-sm transform group-hover:scale-110 transition-transform">🇺🇸</span>
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-base font-bold ${lang === 'en' ? 'text-blue-700' : 'text-slate-600'}`}>
                                    English
                                </h4>
                                <p className="text-[10px] text-slate-400 font-medium truncate">
                                    United States
                                </p>
                            </div>
                            {lang === 'en' && (
                                <div className="bg-blue-500 rounded-full p-1 text-white shadow-md">
                                    <Check size={14} strokeWidth={3} />
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Chinese Option */}
                    <button
                        onClick={() => handleLangChange('zh')}
                        className={`group relative p-4 rounded-2xl text-left transition-all duration-300 overflow-hidden clay-card min-w-[160px] flex-1 ${lang === 'zh'
                            ? 'bg-red-50 border-red-200 shadow-lg'
                            : 'hover:bg-white hover:shadow-md border-transparent'
                            }`}
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <span className="text-3xl filter drop-shadow-sm transform group-hover:scale-110 transition-transform">🇨🇳</span>
                            <div className="flex-1 min-w-0">
                                <h4 className={`text-base font-bold ${lang === 'zh' ? 'text-red-700' : 'text-slate-600'}`}>
                                    简体中文
                                </h4>
                                <p className="text-[10px] text-slate-400 font-medium truncate">
                                    Simplified
                                </p>
                            </div>
                            {lang === 'zh' && (
                                <div className="bg-red-500 rounded-full p-1 text-white shadow-md">
                                    <Check size={14} strokeWidth={3} />
                                </div>
                            )}
                        </div>
                    </button>
                </div>

                <p className="text-xs text-slate-400 px-2 font-medium">
                    {lang === 'zh'
                        ? '切换界面的显示语言。不影响翻译的源语言和目标语言设置。'
                        : 'Switch the interface display language. Does not affect source/target translation settings.'}
                </p>
            </section>

            {/* Theme (Placeholder for now) */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 border-b border-gray-200 pb-2 flex items-center gap-2">
                    <Monitor size={20} className="text-purple-500" />
                    {t.theme}
                </h3>
                <div className="grid grid-cols-2 gap-6 opacity-75">
                    <button
                        className="p-5 rounded-2xl border bg-white border-blue-200 text-slate-700 flex items-center justify-center gap-3 cursor-default shadow-sm pointer-events-none"
                    >
                        <Sun size={22} className="text-amber-500" />
                        <span className="font-bold">{t.themeLight}</span>
                    </button>
                    <button
                        disabled
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-100 text-slate-400 flex items-center justify-center gap-3 cursor-not-allowed opacity-60"
                    >
                        <Moon size={22} />
                        <span className="font-medium">{t.themeDark}</span>
                    </button>
                </div>
            </section>
        </div>
    )
}
