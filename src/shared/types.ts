export interface IFileSystem {
    selectDirectory(): Promise<string | null>
    readJson<T>(filePath: string): Promise<T>
    writeJson(filePath: string, data: any): Promise<void>
    readFile(filePath: string): Promise<string>
    writeFile(filePath: string, content: string): Promise<void>
    getFiles(dirPath: string, extensions?: string[]): Promise<string[]>
}

export type Translations = Record<string, string>

export interface ProjectConfig {
    path: string
    modules: ModuleInfo[]
}

export interface SystemPromptConfig {
    provider: string
    apiKey: string
    model: string
    temperature: number
    systemPrompt: string
}

export interface ModuleAuthor {
    name: string
    url?: string
    email?: string
    discord?: string
}

export interface ModuleCompatibility {
    minimum?: string
    verified?: string
    maximum?: string
}

export interface ModuleRelationship {
    id: string
    type: 'system' | 'module' | 'world'
    manifest?: string
    compatibility?: ModuleCompatibility
}

export interface ModuleManifest {
    id: string
    title: string
    description: string
    version: string
    authors: ModuleAuthor[]
    url?: string
    manifest?: string
    download?: string
    license?: string
    readme?: string
    bugs?: string
    changelog?: string
    compatibility?: ModuleCompatibility
    relationships?: {
        systems?: ModuleRelationship[]
        requires?: ModuleRelationship[]
        conflicts?: ModuleRelationship[]
        flags?: Record<string, any>
    }
    // Additional manifest properties
    styles?: string[]
    packs?: any[]
    // Custom / Babele fields
    babeleMappingDir?: string
    babeleRegisterScript?: string
}

export interface ModuleExportParams {
    config: ModuleManifest
    files: { source: string; target: string; type: 'lang' | 'script' | 'babele' | 'auto'; label?: string }[]
    outputPath: string
}

// Alias for backward compatibility if needed, or update consumers
export type ExportMetadata = ModuleManifest

export interface GlossaryEntry {
    term: string
    definition: string
    context?: string
}

export interface ModuleInfo {
    name: string
    path: string
    hasLang: boolean
    hasPacks: boolean
    hasScripts: boolean
}
