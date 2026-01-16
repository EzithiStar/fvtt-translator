import { D20Icon } from '../D20Icon'
import { useI18n } from '../../lib/i18n'
import { Github, Globe, Heart } from 'lucide-react'

// 版本号由 Vite 在构建时从 package.json 注入
declare const __APP_VERSION__: string


export function SettingsAbout() {
    const { t, lang } = useI18n()
    const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'

    return (
        <div className="space-y-8 animate-fade-in text-center pt-8">
            <div className="space-y-4">
                <div className="w-28 h-28 mx-auto flex items-center justify-center mb-6">
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-blue-200">
                        <D20Icon />
                    </div>
                </div>
                <h2 className="text-3xl font-extrabold text-slate-700 tracking-tight">
                    {t.appTitle}
                </h2>
                <p className="text-slate-500 font-medium">
                    {t.appSubtitle}
                </p>
                <div className="inline-block px-4 py-1.5 bg-white rounded-full text-xs font-bold text-blue-500 mt-2 border border-blue-100 shadow-sm">
                    Version {version}
                </div>
            </div>

            <div className="border-t border-slate-200 my-8 w-2/3 mx-auto" />

            <div className="space-y-6">
                <div className="text-slate-500 text-sm flex flex-col items-center gap-1">
                    <p className="font-medium">
                        {lang === 'zh' ? '由' : 'Created by'} <span className="text-slate-800 font-bold">EzithStar</span> {lang === 'zh' ? '开发' : ''}
                    </p>
                    <p className="text-xs text-slate-400">
                        {t.toolName || 'Tool: Antigravity'}
                    </p>
                </div>

                <div className="flex justify-center gap-6">
                    <a href="https://github.com/EzithiStar/fvtt-translator" target="_blank" rel="noreferrer"
                        className="p-4 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-slate-300 hover:text-slate-700 hover:shadow-lg hover:-translate-y-1 transition-all">
                        <Github size={24} />
                    </a>
                    <a href="#" className="p-4 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-blue-200 hover:text-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all">
                        <Globe size={24} />
                    </a>
                    <a href="#" className="p-4 rounded-2xl bg-white text-slate-400 border border-slate-100 hover:border-red-200 hover:text-red-500 hover:shadow-lg hover:-translate-y-1 transition-all" title="Support">
                        <Heart size={24} />
                    </a>
                </div>
            </div>

            <footer className="pt-20 text-xs text-slate-400 font-medium">
                &copy; 2024-2026 FVTT Translator Team. All rights reserved.
            </footer>
        </div>
    )
}
