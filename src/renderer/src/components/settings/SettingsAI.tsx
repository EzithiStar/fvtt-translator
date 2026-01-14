import { useI18n } from '../../lib/i18n'
import { AppSettings, AIProvider } from './SettingsTypes'
import { Bot, Key, Server, Thermometer, Cpu } from 'lucide-react'

interface Props {
    settings: AppSettings
    updateSettings: (updates: Partial<AppSettings>) => void
}

export function SettingsAI({ settings, updateSettings }: Props) {
    const { t } = useI18n()

    // Predefined models for quick selection
    const QUICK_MODELS: Record<string, string[]> = {
        openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
        gemini: ['gemini-pro', 'gemini-1.5-flash'],
        deepseek: ['deepseek-chat', 'deepseek-coder'],
        custom: []
    }

    return (
        <div className="space-y-8 animate-fade-in pb-8">
            {/* Provider Selection */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 border-b border-gray-200 pb-2 flex items-center gap-2">
                    <Bot size={20} className="text-blue-500" />
                    {t.aiProvider}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['openai', 'gemini', 'deepseek', 'custom'].map((p) => (
                        <button
                            key={p}
                            onClick={() => updateSettings({
                                provider: p as AIProvider,
                                baseUrl: p === 'custom' ? '' : settings.baseUrl // Clear base URL if switching to custom initially
                            })}
                            className={`p-3 rounded-xl border text-sm font-bold transition-all capitalize shadow-sm ${settings.provider === p
                                ? 'bg-purple-50 border-purple-200 text-purple-700 shadow-md transform -translate-y-0.5'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                        >
                            {p === 'custom' ? t.providerCustom.split(' ')[0] : p}
                        </button>
                    ))}
                </div>
            </section>

            {/* API Key */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 border-b border-gray-200 pb-2 flex items-center gap-2">
                    <Key size={20} className="text-yellow-500" />
                    {t.apiKey}
                </h3>
                <div className="relative">
                    <input
                        type="password"
                        value={settings.apiKey}
                        onChange={(e) => updateSettings({ apiKey: e.target.value })}
                        className="input-field w-full pl-10 py-3"
                        placeholder="sk-..."
                    />
                    <div className="absolute left-3 top-3.5 text-slate-400">
                        <Key size={18} />
                    </div>
                </div>
            </section>

            {/* Base URL (Conditional) */}
            {(settings.provider === 'custom' || settings.provider === 'openai') && (
                <section className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-700 border-b border-gray-200 pb-2 flex items-center gap-2">
                        <Server size={20} className="text-green-500" />
                        {t.baseUrl}
                    </h3>
                    <div className="relative">
                        <input
                            type="text"
                            value={settings.baseUrl || ''}
                            onChange={(e) => updateSettings({ baseUrl: e.target.value })}
                            className="input-field w-full pl-10 py-3"
                            placeholder={t.baseUrlPlaceholder}
                        />
                        <div className="absolute left-3 top-3.5 text-slate-400">
                            <Server size={18} />
                        </div>
                    </div>
                </section>
            )}

            {/* Model & Parameters */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 border-b border-gray-200 pb-2 flex items-center gap-2">
                    <Cpu size={20} className="text-red-500" />
                    {t.modelName} & {t.temperature}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Model Name */}
                    <div className="space-y-2">
                        <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">{t.modelName}</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={settings.model}
                                onChange={(e) => updateSettings({ model: e.target.value })}
                                className="input-field w-full py-3"
                                list="model-suggestions"
                            />
                            <datalist id="model-suggestions">
                                {QUICK_MODELS[settings.provider]?.map(m => (
                                    <option key={m} value={m} />
                                ))}
                            </datalist>
                        </div>
                    </div>

                    {/* Temperature */}
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs uppercase font-bold text-slate-400 tracking-wider">{t.temperature}</label>
                            <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{settings.temperature}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={settings.temperature}
                            onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
                        />
                        <p className="text-[10px] text-slate-400">{t.temperatureHelp}</p>
                    </div>
                </div>
            </section>

            {/* System Prompt */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-slate-700 border-b border-gray-200 pb-2">
                    {t.systemPrompt}
                </h3>
                <textarea
                    value={settings.systemPrompt}
                    onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
                    className="input-field w-full h-48 resize-none font-mono text-sm leading-relaxed"
                    placeholder={t.systemPromptPlaceholder}
                />
            </section>
        </div>
    )
}
