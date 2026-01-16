import React, { useState, useEffect } from 'react'

export type Language = 'en' | 'zh'

const translations = {
    en: {
        appTitle: 'FVTT Translator',
        appSubtitle: 'Foundry VTT Translation Assistant',
        // ...
        versionInfo: 'Version: {version}',
        developer: 'Developer: EzithStar',
        toolName: 'Tool: Antigravity',
        github: 'GitHub Repository',
        openProject: 'Open Module / Data Folder',
        openFile: 'Open File (JSON / ZIP)',
        currentProject: 'Current Project:',
        pleaseOpen: 'Please open a Foundry VTT module or system folder to begin.',
        detectedFiles: 'Detected Files',
        fileName: 'File Name',
        type: 'Type',
        action: 'Action',
        translate: 'Translate',

        back: 'Back',
        save: 'Save',
        saveAs: 'Save As',
        autoTranslate: 'Auto Translate (Beta)',
        translating: 'Translating...',
        original: 'Original / Key',
        translation: 'Translation',
        status: 'Status',

        // Old settings keys removed to prevent duplicates
        // (aiProvider, apiKey, modelName, saveConfig, interfaceLanguage, languageEn, languageZh, systemPrompt...)

        systemPrompt: 'System Prompt', // Keep for now if used elsewhere, but ideally consolidate
        systemPromptPlaceholder: 'You are a translator...',
        errorLoad: 'Failed to load file content',
        errorSave: 'Failed to save file',
        configureSettings: 'Please configure AI API Key in Settings first.',

        // Settings Overhaul
        settingTabs: {
            general: 'General',
            ai: 'AI Translation',
            module: 'Module',
            about: 'About',
        },
        settings: 'Settings',
        generalSettings: 'General Settings',
        aiSettings: 'AI Configuration',
        moduleSettings: 'Module Settings',
        aboutSettings: 'About & Info',

        // AI Options
        providerCustom: 'Custom (OpenAI Compatible)',
        baseUrl: 'Base URL',
        baseUrlPlaceholder: 'e.g. https://api.openai.com/v1',
        temperature: 'Temperature',
        temperatureHelp: 'Higher values make output more random, lower values more deterministic.',
        maxTokens: 'Max Tokens',

        // Module Config Defaults
        moduleDefaults: 'Global Module Defaults',
        defaultAuthors: 'Default Authors',
        defaultAuthorsPlaceholder: 'e.g. EzithStar',
        linkTemplates: 'Link Templates',
        compatibility: 'Compatibility',
        minVer: 'Minimum Core Version',
        verifiedVer: 'Verified Core Version',
        maxVer: 'Maximum Core Version',

        // General Options
        theme: 'Theme',
        themeDark: 'Dark (Glass)',
        themeLight: 'Light (Coming Soon)',
        resetSettings: 'Reset All Settings',
        resetConfirm: 'Are you sure you want to reset all settings to default?',

        // Missing keys for other components
        noFilesFound: 'No files found',
        selectProjectPrompt: 'Please select a project first',
        saveConfig: 'Save Config',
        confirm: 'Confirm',
        aiProvider: 'AI Provider',
        apiKey: 'API Key',
        modelName: 'Model Name',
        interfaceLanguage: 'Interface Language',

        exportModule: 'Export Module',
        export: 'Export',
        cancel: 'Cancel',
        glossary: 'Glossary',
        glossaryManager: 'Glossary Manager',
        addTerm: 'Add Term',
        term: 'Term',
        definition: 'Definition',
        context: 'Context / Notes',
        searchGlossary: 'Search glossary...',
        noMatches: 'No matches found.',
        noTermsYet: 'No glossary terms yet. Add one to get started.',
        addToGlossary: 'Add to Glossary',
        newGlossary: 'New Glossary',
        glossaryFiles: 'Glossary Files',
        selectOrCreate: 'Select or create a glossary to begin',
        import: 'Import',
        enterGlossaryName: 'Enter glossary name:',
        deleteConfirm: 'Delete glossary',
        glossaryCreatedSuccess: 'Glossary created successfully!',
        failedToCreateGlossary: 'Failed to create glossary',
        importedTerms: 'Imported {count} terms',
        noTermsFound: 'No terms found in file',
        importFailed: 'Import failed',
        selectGlossaryFirst: 'Please select a glossary first',
        stopTranslating: 'Stop Translating',
        errorBatch: 'Translation batch failed. Stopping to prevent infinite loop.',
        errorBatchNetwork: 'Network error or API limit reached. Stopping.',
        // New keys
        moduleTitle: 'Module Title',
        moduleId: 'Module ID',
        version: 'Version',
        author: 'Author',
        description: 'Description',
        targetSystemId: 'Target System ID',
        babeleSettings: 'Babele Settings',
        mappingDir: 'Mapping Directory',
        registerScript: 'Register Script (babele.js)',
        importMetadata: 'Load Info from Module',
        includedFiles: 'Included Files',
        selectAll: 'Select All',
        deselectAll: 'Deselect All',
        filesSelected: '{count} selected',
        layoutBottom: 'Dock Bottom',
        layoutRight: 'Dock Right',
        closeFile: 'Close File',
        babeleDirHelp: 'Directory where Babele mapping files will be stored (e.g. compendium)',
        registerScriptHelp: 'Filename for the registration script (e.g. register.js or babele.js)',
        generateScript: 'Generate Script Template',
        scriptGenerated: 'Script generated successfully at: {path}',
        moduleConfiguration: 'Module Configuration',

        // Sidebar Sections
        sectionProject: 'Project',
        sectionFiles: 'Files',
        sectionModules: 'Modules',
        dragDropFiles: 'Drag & Drop Files Here',
        noTermsFoundSidebar: 'No files detected',

        // Alerts
        zipExtracted: 'Zip extracted successfully to: {path}',
        zipFailed: 'Failed to extract zip file',

        // Module Builder
        builderTitle: 'Module Builder',
        builderEmpty: 'No staged files',
        addToModule: 'Add to Module',
        removeFromModule: 'Remove',
        stagingArea: 'Staging Area',
        targetPath: 'Target Path',
        smartSave: 'Smart Save',
        pathPlaceholder: 'e.g. lang/cn.json',
        builderExport: 'Export Build',

        // Advanced Module Editor
        tabGeneral: 'General',
        tabAuthors: 'Authors',
        tabCompatibility: 'Compatibility',
        tabRelationships: 'Relationships',
        tabBabele: 'Babele',
        tabFiles: 'Files',


        url: 'URL',
        manifest: 'Manifest URL',
        download: 'Download URL',
        license: 'License',
        readme: 'Readme',
        bugs: 'Bugs',
        changelog: 'Changelog',


        name: 'Name',
        email: 'Email',
        discord: 'Discord',
        addAuthor: 'Add Author',

        minimum: 'Minimum',
        verified: 'Verified',
        maximum: 'Maximum',
        coreVersion: 'Core Version',

        systems: 'Systems',
        modules: 'Modules (Requires)',
        addSystem: 'Add System',
        addModule: 'Add Module',


        // babeleSettings: 'Babele Settings', // Duplicate
        // mappingDir: 'Mapping Directory', // Duplicate
        // registerScript: 'Register Script', // Duplicate
        // babeleDirHelp: 'Directory for translation mappings', // Duplicate
        // registerScriptHelp: 'Script filename (e.g. babele.js)', // Duplicate
        // generateScript: 'Generate Script', // Duplicate
        // scriptGenerated: 'Script generated at {path}', // Duplicate

        // includedFiles: 'Included Files', // Duplicate
        // filesSelected: '{count} selected', // Duplicate
        // selectAll: 'Select All', // Duplicate
        // deselectAll: 'Deselect All', // Duplicate

        // saveConfig: 'Save Config',
        // Blacklist
        blacklist: 'Blacklist',
        blacklistManager: 'Blacklist Manager',
        blacklistHelper: 'Add JSON keys to exclude from translation (e.g. system.description.value).',
        enterKey: 'Enter key property...',
        noBlacklist: 'No keys blacklisted.',
        addKey: 'Add Key',

        // Translation Status
        translated: 'Translated',
        untranslated: 'Untranslated',
        targetPathPrompt: 'Enter target path for the file:',
        ignored: 'Ignored',

        // New Export & Alerts
        babeleHelp: 'Babele settings help configure the translation mapping automatically.',
        saveSuccess: 'Saved module.json successfully!',
        exportSuccess: 'Module exported successfully to: {path}',
        exportFailed: 'Export failed',
        moduleIdRequired: 'Module ID is required',
        scriptError: 'Error: {error}\n(Please ensure "scripts" folder exists)',

        // PF1e Glossary Preset
        pf1ePresetTitle: 'Load PF1e Core Glossary',
        pf1ePresetConfirm: 'Load Pathfinder 1e Core Glossary? This will be merged into the current glossary.',
        pf1eLoadedTerms: 'Loaded {count} terms.',
        pf1eLoadFailed: 'Failed to load preset',

        // Extraction from Translated File
        extractFromFile: 'Extract from File',
        extractTerms: 'Extract',
        extractFailed: 'Failed to extract terms',
        foundTerms: 'Found {count} terms',
        selectedCount: 'Selected: {count}',
        noTermsSelected: 'No terms selected',
        importSelected: 'Import Selected ({count})',
        selectAll: 'Select All',
        deselectAll: 'Deselect All',
    },
    zh: {
        appTitle: 'FVTT 翻译器',
        appSubtitle: 'Foundry VTT 翻译助手',
        openProject: '打开模组/数据文件夹',
        openFile: '打开文件 (JSON / ZIP)',
        currentProject: '当前项目:',
        pleaseOpen: '请打开 Foundry VTT 模组或系统文件夹以开始。',
        detectedFiles: '检测到的文件',
        fileName: '文件名',
        type: '类型',
        action: '操作',
        translate: '翻译',

        back: '返回',
        save: '保存',
        saveAs: '另存为',
        autoTranslate: '自动翻译 (测试版)',
        translating: '翻译中...',
        original: '原文 / 键 (Key)',
        translation: '译文',
        status: '状态',

        // Old keys removed

        systemPrompt: '系统提示词',
        systemPromptPlaceholder: '你是一个翻译...',
        errorLoad: '加载文件内容失败',
        errorSave: '保存文件失败',
        configureSettings: '请先在设置中配置 AI API 密钥。',
        exportModule: '导出模组',
        export: '导出',
        cancel: '取消',
        glossary: '术语表',
        glossaryManager: '术语表管理',
        addTerm: '添加术语',
        term: '原文 (Term)',
        definition: '译文 (Definition)',
        context: '语境 / 备注',
        searchGlossary: '搜索术语...',
        noMatches: '未找到匹配项。',
        noTermsYet: '暂无术语。请添加一条以开始。',
        addToGlossary: '添加到术语表',
        newGlossary: '新建术语表',
        glossaryFiles: '术语表文件',
        selectOrCreate: '选择或创建一个术语表',
        import: '导入',
        enterGlossaryName: '输入术语表名称:',
        deleteConfirm: '删除术语表',
        glossaryCreatedSuccess: '术语表创建成功！',
        failedToCreateGlossary: '创建术语表失败',
        importedTerms: '成功导入 {count} 条术语',
        noTermsFound: '文件中未找到术语',
        importFailed: '导入失败',
        selectGlossaryFirst: '请先选择一个术语表',
        stopTranslating: '停止翻译',
        errorBatch: '翻译批次失败。为防止死循环已停止。',
        errorBatchNetwork: '网络错误或 API 限制。已停止。',

        // Settings Overhaul
        settingTabs: {
            general: '常规设置',
            ai: 'AI 翻译',
            module: '模组配置',
            about: '关于',
        },
        settings: '设置',
        generalSettings: '常规设置',
        aiSettings: 'AI 配置',
        moduleSettings: '模组设置',
        aboutSettings: '关于与信息',

        // AI Options
        providerCustom: '自定义 (兼容 OpenAI)',
        baseUrl: 'API 地址 (Base URL)',
        baseUrlPlaceholder: '例如 https://api.openai.com/v1',
        temperature: '随机性 (Temperature)',
        temperatureHelp: '数值越高生成的文本越随机，数值越低越稳定。',
        maxTokens: '最大 Token 数',

        // Module Config Defaults
        moduleDefaults: '全局模组预设',
        defaultAuthors: '默认作者',
        defaultAuthorsPlaceholder: '例如: EzithStar',
        linkTemplates: '链接设置',
        compatibility: '核心版本兼容性',
        minVer: '最低',
        verifiedVer: '验证',
        maxVer: '最高',

        // General Options
        theme: '主题',
        themeDark: '深色 (毛玻璃)',
        themeLight: '浅色 (敬请期待)',
        resetSettings: '重置所有设置',
        resetConfirm: '确定要重置所有设置并恢复默认吗？',

        // Missing keys for other components
        noFilesFound: '未找到文件',
        selectProjectPrompt: '请先选择一个项目',
        saveConfig: '保存配置',
        confirm: '确认',
        aiProvider: 'AI 服务商',
        apiKey: 'API 密钥',
        modelName: '模型名称',
        interfaceLanguage: '界面语言',

        versionInfo: '当前版本: {version}',
        developer: '开发者: EzithStar',
        toolName: '工具: Antigravity',
        github: 'GitHub 仓库',

        // New keys & Fixes
        // New keys & Fixes
        moduleTitle: '模组标题 (Title)',
        moduleId: '模组 ID (ID)',
        version: '版本 (Version)',
        author: '作者 (Author)',
        description: '描述 (Description)',
        targetSystemId: '目标系统 ID (System ID)',
        babeleSettings: 'Babele 设置',
        mappingDir: '映射目录 (Dir)',
        registerScript: '注册脚本 (babele.js)',
        importMetadata: '从模组加载信息',
        includedFiles: '包含的文件 (Files)',
        selectAll: '全选',
        deselectAll: '取消全选',
        filesSelected: '已选 {count} 个',
        layoutBottom: '停靠底部',
        layoutRight: '停靠右侧',
        closeFile: '关闭文件',
        babeleDirHelp: 'Babele 映射文件存储目录 (例如 compendium)',
        registerScriptHelp: '注册脚本的文件名 (例如 register.js 或 babele.js)',
        generateScript: '生成脚本模板',
        scriptGenerated: '脚本生成成功: {path}',
        moduleConfiguration: '模组配置',

        tabGeneral: '常规 (General)',
        tabAuthors: '作者 (Authors)',
        tabCompatibility: '兼容性 (Compatibility)',
        tabRelationships: '依赖 (Relationships)',
        tabBabele: 'Babele',
        tabFiles: '文件 (Files)',

        name: '名称 (Name)',
        email: '邮箱 (Email)',
        url: '链接 (URL)',
        discord: 'Discord',
        addAuthor: '添加 (Add)',
        remove: '移除',

        minimum: '最低 (Min)',
        verified: '验证 (Verified)',
        maximum: '最高 (Max)',
        coreVersion: '核心版本 (Core Ver)',
        systemVersion: '系统版本 (System Ver)',

        systems: '系统 (Systems)',
        modules: '依赖模组 (Modules)',
        flags: 'Flags',
        addSystem: '添加系统',
        addModule: '添加模组',
        manifest: 'Manifest',

        styles: '样式 (CSS)',
        addStyle: '添加样式',
        noStyles: '无样式',

        changelog: '更新日志 (Changelog)',
        readme: '说明文件 (Readme)',
        bugs: '反馈 (Bugs)',
        download: '下载链接 (Download)',
        license: '许可证 (License)',

        // Sidebar Sections
        sectionProject: '项目',
        sectionFiles: '文件',
        sectionModules: '模组',
        dragDropFiles: '拖拽文件',
        noTermsFoundSidebar: '空',

        // Alerts
        zipExtracted: '解压至: {path}',
        zipFailed: '解压失败',

        // Module Builder
        builderTitle: '正在构建',
        builderEmpty: '无文件',
        addToModule: '加入模组',
        removeFromModule: '移除',
        stagingArea: '暂存区',
        targetPath: '路径',
        smartSave: '智能构建',
        pathPlaceholder: '如 lang/cn.json',
        builderExport: '导出',

        // Blacklist
        blacklist: '黑名单',
        blacklistManager: '黑名单管理',
        blacklistHelper: '添加需要从翻译中排除的 JSON 键名 (如 system.description.value)。',
        enterKey: '输入要忽略的键名...',
        noBlacklist: '暂无黑名单。',
        addKey: '添加',

        // Translation Status
        translated: '已翻译',
        untranslated: '未翻译',
        targetPathPrompt: '请输入文件的目标路径：',
        ignored: '已忽略',

        // New Export & Alerts
        babeleHelp: 'Babele 设置可以帮助自动配置翻译映射。',
        saveSuccess: '成功保存 module.json！',
        exportSuccess: '模组导出成功至: {path}',
        exportFailed: '导出失败',
        moduleIdRequired: '必须填写模组 ID (Module ID)',
        scriptError: '错误: {error}\n(请确保 "scripts" 文件夹存在)',

        // PF1e Glossary Preset
        pf1ePresetTitle: '加载 PF1e 核心术语库',
        pf1ePresetConfirm: '加载 Pathfinder 1e 核心术语库？这些术语将合并到当前术语表中。',
        pf1eLoadedTerms: '已加载 {count} 条术语。',
        pf1eLoadFailed: '加载预设失败',

        // Extraction from Translated File
        extractFromFile: '从文件提取术语',
        extractTerms: '提取',
        extractFailed: '提取术语失败',
        foundTerms: '已识别 {count} 条术语',
        selectedCount: '已选 {count} 条',
        noTermsSelected: '未选中任何术语',
        importSelected: '导入选中 ({count})',
        selectAll: '全选',
        deselectAll: '取消全选',
    }
}

// Create Context
const I18nContext = React.createContext<{
    lang: Language
    setLang: (lang: Language) => void
    t: typeof translations['en']
} | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [lang, setLang] = useState<Language>('en')

    useEffect(() => {
        const saved = localStorage.getItem('fvtt-translator-lang') as Language
        if (saved) setLang(saved)
    }, [])

    const changeLanguage = (newLang: Language) => {
        setLang(newLang)
        localStorage.setItem('fvtt-translator-lang', newLang)
    }

    const value = {
        lang,
        setLang: changeLanguage,
        t: translations[lang]
    }

    return (
        <I18nContext.Provider value={value} >
            {children}
        </I18nContext.Provider>
    )
}

export function useI18n() {
    const context = React.useContext(I18nContext)
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider')
    }
    return context
}
