import { useState, useEffect } from 'react'
import { useI18n } from '../lib/i18n'
import { AppSettings, DEFAULT_SETTINGS } from './settings/SettingsTypes'
import { SettingsGeneral } from './settings/SettingsGeneral'
import { SettingsAI } from './settings/SettingsAI'
import { SettingsModule } from './settings/SettingsModule'
import { SettingsAbout } from './settings/SettingsAbout'
import { SettingsTM } from './settings/SettingsTM'
import { Settings as SettingsIcon, Cpu, Package, Info, ArrowLeft, Save, RotateCcw, Database } from 'lucide-react'

// Tabs definition
type SettingsTab = 'general' | 'ai' | 'tm' | 'module' | 'about'

export function Settings({ onBack }: { onBack: () => void }): JSX.Element {
    const { t } = useI18n()
    const [activeTab, setActiveTab] = useState<SettingsTab>('general')
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
    const [hasChanges, setHasChanges] = useState(false)

    // Load settings
    useEffect(() => {
        const saved = localStorage.getItem('fvtt-translator-settings')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setSettings({ ...DEFAULT_SETTINGS, ...parsed })
            } catch (e) {
                console.error('Failed to parse settings', e)
            }
        }
    }, [])

    // Update handler
    const updateSettings = (updates: Partial<AppSettings>) => {
        setSettings(prev => ({ ...prev, ...updates }))
        setHasChanges(true)
    }

    // Save handler
    const handleSave = () => {
        localStorage.setItem('fvtt-translator-settings', JSON.stringify(settings))
        localStorage.setItem('fvtt-translator-lang', settings.language) // Sync standalone lang key
        setHasChanges(false)
        onBack()
    }

    const handleReset = () => {
        if (confirm(t.resetConfirm)) {
            setSettings(DEFAULT_SETTINGS)
            setHasChanges(true)
        }
    }

    // Sidebar Items
    const tabs: { id: SettingsTab; label: string; icon: React.FC<any> }[] = [
        { id: 'general', label: t.settingTabs?.general || 'General', icon: SettingsIcon },
        { id: 'ai', label: t.settingTabs?.ai || 'AI Translation', icon: Cpu },
        { id: 'tm', label: t.settingTabs?.tm || 'Translation Memory', icon: Database },
        { id: 'module', label: t.settingTabs?.module || 'Module', icon: Package },
        { id: 'about', label: t.settingTabs?.about || 'About', icon: Info },
    ]

    return (
        <div className="flex h-full bg-[#FAFAF7] text-slate-700 overflow-hidden animate-fade-in relative z-50">
            {/* Sidebar */}
            <div className="w-64 bg-white/50 backdrop-blur-md border-r border-[#E0E0E0] flex flex-col shrink-0">
                <div className="p-6 border-b border-[#E0E0E0] flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <h2 className="text-xl font-extrabold text-[#4A4A4A] tracking-tight">{t.settings}</h2>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-md transform translate-x-1 border border-blue-100'
                                : 'text-slate-500 hover:bg-white/60 hover:text-slate-700 hover:translate-x-1'
                                }`}
                        >
                            <div className={`p-1.5 rounded-lg ${activeTab === tab.id ? 'bg-blue-50' : 'bg-transparent'}`}>
                                <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-500' : 'text-slate-400'} />
                            </div>
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-[#E0E0E0] bg-white/30">
                    <button
                        onClick={handleReset}
                        className="w-full flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 py-3 transition-colors bg-transparent hover:bg-red-50 rounded-xl"
                    >
                        <RotateCcw size={14} />
                        {t.resetSettings}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#FAFAF7]">

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <div className="max-w-3xl">
                        <header className="mb-8">
                            <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </h1>
                            <p className="text-slate-500 font-medium text-sm">
                                {activeTab === 'general' && (t.generalSettings || 'Configure interface preferences')}
                                {activeTab === 'ai' && (t.aiSettings || 'Manage AI models and API keys')}
                                {activeTab === 'tm' && (t.tmSettings || 'Manage translation cache and memory')}
                                {activeTab === 'module' && (t.moduleSettings || 'Default paths and build options')}
                                {activeTab === 'about' && (t.aboutSettings || 'Version and developer info')}
                            </p>
                        </header>

                        <div className="clay-panel p-6 bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-200/50 rounded-2xl">
                            {activeTab === 'general' && <SettingsGeneral settings={settings} updateSettings={updateSettings} />}
                            {activeTab === 'ai' && <SettingsAI settings={settings} updateSettings={updateSettings} />}
                            {activeTab === 'tm' && <SettingsTM />}
                            {activeTab === 'module' && <SettingsModule settings={settings} updateSettings={updateSettings} />}
                            {activeTab === 'about' && <SettingsAbout />}
                        </div>
                    </div>
                </div>

                {/* Footer Action Bar */}
                <div className="p-5 border-t border-[#E0E0E0] bg-white/80 backdrop-blur-md flex justify-end gap-4 z-10 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
                    <button
                        onClick={onBack}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-all font-bold text-sm"
                    >
                        {t.cancel}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className={`px-8 py-2.5 rounded-xl flex items-center gap-2 font-bold text-sm shadow-md transition-all transform ${hasChanges
                            ? 'bg-[#7EC8C8] hover:bg-[#6DB8B8] text-white shadow-teal-200 hover:-translate-y-0.5'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        <Save size={18} />
                        {t.saveConfig}
                    </button>
                </div>
            </div>
        </div>
    )
}
