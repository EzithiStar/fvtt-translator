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

            {/* Theme */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
                    <Monitor size={20} className="text-purple-500" />
                    {t.theme}
                </h3>
                <div className="grid grid-cols-2 gap-6">
                    <button
                        onClick={() => {
                            localStorage.setItem('fvtt-theme', 'light')
                            document.documentElement.classList.remove('dark')
                        }}
                        className={`p-5 rounded-2xl border flex items-center justify-center gap-3 transition-all ${!document.documentElement.classList.contains('dark')
                                ? 'bg-white border-blue-200 text-slate-700 shadow-md'
                                : 'bg-white/50 border-slate-200 text-slate-500 hover:border-blue-200 hover:shadow-sm'
                            }`}
                    >
                        <Sun size={22} className="text-amber-500" />
                        <span className="font-bold">{t.themeLight}</span>
                    </button>
                    <button
                        onClick={() => {
                            localStorage.setItem('fvtt-theme', 'dark')
                            document.documentElement.classList.add('dark')
                        }}
                        className={`p-5 rounded-2xl border flex items-center justify-center gap-3 transition-all ${document.documentElement.classList.contains('dark')
                                ? 'bg-slate-800 border-blue-500 text-white shadow-md'
                                : 'bg-slate-100 border-slate-200 text-slate-500 hover:border-blue-300 hover:shadow-sm'
                            }`}
                    >
                        <Moon size={22} className={document.documentElement.classList.contains('dark') ? 'text-blue-400' : ''} />
                        <span className="font-medium">{t.themeDark}</span>
                    </button>
                </div>
                <p className="text-xs text-slate-400 px-2 font-medium">
                    {lang === 'zh'
                        ? '深色模式为实验性功能，部分界面可能显示异常。'
                        : 'Dark mode is experimental. Some UI elements may not display correctly.'}
                </p>
            </section>

            {/* Window Resolution */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 border-b border-gray-200 pb-2 flex items-center gap-2">
                    <Monitor size={20} className="text-green-500" />
                    {lang === 'zh' ? '窗口分辨率' : 'Window Resolution'}
                </h3>
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { name: lang === 'zh' ? '小' : 'S', width: 1024, height: 768 },
                        { name: lang === 'zh' ? '中' : 'M', width: 1280, height: 800 },
                        { name: lang === 'zh' ? '大' : 'L', width: 1440, height: 900 },
                        { name: lang === 'zh' ? '超大' : 'XL', width: 1920, height: 1080 },
                    ].map((res) => (
                        <button
                            key={res.name}
                            onClick={async () => {
                                await (window as any).api.resizeWindow(res.width, res.height)
                                // 保存到 localStorage
                                localStorage.setItem('fvtt-window-size', JSON.stringify({ width: res.width, height: res.height }))
                            }}
                            className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all text-center shadow-sm hover:shadow-md"
                        >
                            <div className="text-lg font-bold text-slate-700">{res.name}</div>
                            <div className="text-xs text-slate-400">{res.width}×{res.height}</div>
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-400 px-2 font-medium">
                    {lang === 'zh'
                        ? '选择适合您屏幕的窗口大小，设置会立即生效并保存。'
                        : 'Choose a window size that fits your screen. Changes apply immediately.'}
                </p>
            </section>
        </div>
    )
}
