import { useState, useEffect } from 'react'
import { D20Icon } from '../D20Icon'
import { useI18n } from '../../lib/i18n'
import { Github, Globe, Heart, RefreshCw, Download, CheckCircle, AlertCircle, Loader2, Power, RotateCw, ExternalLink, AlertTriangle } from 'lucide-react'

// 版本号由 Vite 在构建时从 package.json 注入
declare const __APP_VERSION__: string

interface UpdateInfo {
    version: string
    releaseName?: string
    releaseNotes?: string
    releaseDate?: string
}

export function SettingsAbout() {
    const { t, lang } = useI18n()
    const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'

    const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'>('idle')
    const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [progress, setProgress] = useState<number>(0)
    // Default to true if not set
    const [autoCheck, setAutoCheck] = useState(() => localStorage.getItem('fvtt-auto-check') !== 'false')

    useEffect(() => {
        const removeStatusListener = (window as any).api.onUpdaterStatus((newStatus: string, info: any) => {
            console.log('Updater status:', newStatus, info)

            if (newStatus === 'checking') {
                setStatus('checking')
                setErrorMsg(null)
            } else if (newStatus === 'available') {
                setStatus('available')
                setUpdateInfo(info)
            } else if (newStatus === 'not-available') {
                setStatus('not-available')
            } else if (newStatus === 'error') {
                setStatus('error')
                setErrorMsg(info) // info is error message string here
            } else if (newStatus === 'downloaded') {
                setStatus('downloaded')
            }
        })

        const removeProgressListener = (window as any).api.onUpdaterProgress((progObj: any) => {
            setStatus('downloading')
            setProgress(progObj.percent)
        })

        return () => {
            removeStatusListener()
            removeProgressListener()
        }
    }, [])

    const handleCheck = () => {
        setStatus('checking')
        setErrorMsg(null)
        setUpdateInfo(null)
            ; (window as any).api.checkForUpdates()
    }

    const handleDownload = () => {
        ; (window as any).api.downloadUpdate()
        setStatus('downloading')
        setProgress(0)
    }

    const handleInstall = () => {
        ; (window as any).api.quitAndInstall()
    }

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

            {/* Auto Update Section */}
            <div className="bg-slate-50 rounded-2xl p-5 max-w-sm mx-auto border border-slate-100 shadow-sm relative overflow-hidden transition-all">

                {/* IDLE / CHECKING / ERROR */}
                {['idle', 'checking', 'error'].includes(status) && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleCheck}
                                disabled={status === 'checking' || status === 'downloading'}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {status === 'checking' ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        {t.checking || 'Checking...'}
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw size={16} />
                                        {t.checkUpdate || 'Check for Updates'}
                                    </>
                                )}
                            </button>

                            {/* Manual Download Link */}
                            <button
                                onClick={() => (window as any).api.openExternal('https://github.com/EzithiStar/fvtt-translator/releases')}
                                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                            >
                                <ExternalLink size={16} />
                                {t.manualDownload || 'Manual Download'}
                            </button>
                        </div>

                        <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-amber-50 text-amber-600 text-xs rounded-lg border border-amber-100 max-w-fit">
                            <AlertTriangle size={12} />
                            <span>{t.autoUpdateExperimental || 'Auto-update is currently experimental.'}</span>
                        </div>

                        {/* Auto Update Option Toggle */}
                        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm mt-2">
                            <div className="flex flex-col text-left">
                                <span className="text-sm font-bold text-slate-700">{t.enableAutoUpdate || 'Enable Auto Update'}</span>
                                <span className="text-xs text-slate-400">{t.autoUpdateDesc || 'Check on startup'}</span>
                            </div>
                            <button
                                onClick={() => {
                                    const newVal = !autoCheck
                                    setAutoCheck(newVal)
                                    localStorage.setItem('fvtt-auto-check', String(newVal))
                                }}
                                className={`w-12 h-6 rounded-full transition-colors relative ${autoCheck ? 'bg-green-500' : 'bg-slate-200'}`}
                            >
                                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${autoCheck ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {status === 'error' && (
                            <div className="text-rose-500 text-xs text-left bg-rose-50 p-3 rounded-lg border border-rose-100 flex gap-2">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold mb-1">{lang === 'zh' ? '检查失败' : 'Update Check Failed'}</div>
                                    <div className="opacity-80 break-all">
                                        {errorMsg === 'ERR_DEV_MODE' ? (t.errorDevMode || 'Dev Mode: Auto-update disabled') : errorMsg}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* UPDATE AVAILABLE / DOWNLOAD */}
                {status === 'available' && updateInfo && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-center gap-2 text-green-600 font-bold bg-green-50 py-2 rounded-lg border border-green-100">
                            <Download size={18} />
                            {lang === 'zh' ? '发现新版本!' : 'New version available!'}
                        </div>

                        <div className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-400 text-xs">Current</span>
                                <span className="text-slate-400 text-xs">New</span>
                            </div>
                            <div className="flex justify-between items-center font-mono">
                                <span className="font-medium">v{version}</span>
                                <span className="text-slate-300">→</span>
                                <span className="font-bold text-green-600 text-lg">v{updateInfo.version}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold transition-all shadow-md shadow-green-200"
                        >
                            <Download size={18} />
                            {lang === 'zh' ? '下载更新' : 'Download Update'}
                        </button>
                    </div>
                )}

                {/* DOWNLOADING */}
                {status === 'downloading' && (
                    <div className="space-y-3 animate-in fade-in">
                        <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                            <span>Downloading...</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-4 bg-slate-200 rounded-full overflow-hidden w-full border border-slate-100">
                            <div
                                className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-400">Please wait while the update is being downloaded.</p>
                    </div>
                )}

                {/* DOWNLOADED / READY TO INSTALL */}
                {status === 'downloaded' && (
                    <div className="space-y-4 animate-in fade-in zoom-in-95">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CheckCircle size={24} />
                        </div>
                        <h3 className="font-bold text-slate-700">
                            {lang === 'zh' ? '下载完成' : 'Download Complete'}
                        </h3>
                        <p className="text-xs text-slate-500 -mt-2">
                            {lang === 'zh' ? '需要重启应用来应用更新' : 'Restart app to apply update'}
                        </p>

                        <button
                            onClick={handleInstall}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold transition-all shadow-lg shadow-purple-200"
                        >
                            <Power size={18} />
                            {lang === 'zh' ? '重启并安装' : 'Restart & Install'}
                        </button>
                    </div>
                )}

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

            <footer className="pt-12 text-xs text-slate-400 font-medium">
                &copy; 2024-2026 FVTT Translator Team. All rights reserved.
            </footer>
        </div>
    )
}
