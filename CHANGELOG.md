# Changelog

All notable changes to this project will be documented in this file.
所有项目的重大更改都将记录在此文件中。

## [0.3.2] - 2026-01-15

### 变更
- **设置界面刷新**: 使用新的陶塑 (Claymorphism) 设计系统更新了设置模块 (常规、AI、模组、关于)。
- **模态框刷新**: 使用陶塑设计更新了导出模态框、黑名单模态框和术语表管理器（浅色背景、圆角、渐变按钮、柔和阴影）。
- **全局主题**: 重构 `App.tsx` 以强制全局使用浅色陶塑主题，移除深色背景冲突，统一仪表盘、设置和工具面板的外观。
- **面板布局优化**: 在设置界面隐藏主侧边栏，避免三栏布局的拥挤感，提供更专注的设置体验。
- **悬浮玻璃面板**: 更新工具面板为绝对定位 + 半透明玻璃效果（`backdrop-blur`），覆盖在主内容之上而非挤压布局，宽度增加到 400px。
- **开源准备**: 更新了项目文档 (README) 和仓库配置 (.gitignore)，移除了非必要的开发文件。
- **自动化发布**: 配置了 GitHub Actions 工作流 (`release.yml`)，支持通过 Git 标签触发自动构建和发布 Windows 二进制文件 (EXE/ZIP)。

### 修复
- **依赖冲突修复**: 解决了 GitHub Actions 构建环境中 `vite` 与 `@types/node` 的版本冲突问题。
- **TypeScript 编译错误修复**:
  - 解决了所有渲染组件中的 `window.api` 类型错误 (`TranslationEditor`、`Settings`、`App`、`GlossaryManager`、`ExportModal`、`BlacklistModal`)。
  - 修复了 `SettingsModule.tsx` 中的语法错误。
  - 修复了 `GlossaryManager.tsx` 中的隐式 `any` 类型。
  - 修复了 `types.ts` 中的 `ModuleManifest` 接口结构——闭合括号位置错误导致 `babeleMappingDir` 和 `babeleRegisterScript` 在接口外部。
  - 向 `ModuleManifest` 接口添加了缺失属性 (`styles`、`packs`)。
  - 修复了 `i18n.tsx` 中的重复属性名 (versionInfo、developer、toolName、github)。
  - 向中英文词典添加了缺失的翻译键：`noFilesFound`、`selectProjectPrompt`、`saveConfig`、`confirm`、`aiProvider`、`apiKey`、`modelName`、`interfaceLanguage`、`moduleConfiguration`。
  - 修复了 `exporter.ts` 访问 `moduleData` 对象上未定义属性的问题，添加了 `styles`、`packs`、`license`、`readme`。

## [0.3.1] - 2026-01-14

### Added (新增)
- **Settings Overhaul 设置重构**: 全新设计的专业级设置面板。
  - **Categorized Tabs**: 分类管理常规、AI、模组设置。
  - **Enhanced AI Config**: 支持自定义 API (Custom)、Base URL、Temperature 调节。
  - **Global Defaults**: 支持预设模组作者、链接模板和兼容性版本。(Fix: Defaults now correctly auto-populate in Export Module)
  - **Modern UI**: 侧边栏导航、毛玻璃效果、响应式布局。
  - **Language Cards**: Redesigned language selector with large cards and proper icons (`Languages` icon).
  - **Bilingual Labels**: Module Export fields now show English keys (e.g., `模组标题 (Title)`) for better reference.
- **Startup Script 启动脚本**: 新增 `启动翻译器.bat`，双击即可一键启动开发环境。
  Added `Start Translator.bat` for one-click development server startup.
- **Global Module Defaults 全局模组预设**:
  - **Authors**: Auto-fill default author name.
  - **Links**: Templates for URL, Manifest, Download links.
  - **Compatibility**: Set default core versions (Min/Verified/Max).
- **Translation Editor Enhancements**:
  - **Deduplication**: 自动去重逻辑，编辑一个译文时，所有相同原文的条目会自动同步。
  - **Ignore Row**: 添加"忽略行"功能，可临时跳过某些条目 (不参与翻译)。
- **Babele Optimization**:
  - **Simplified Script**: 生成的 `babele.js` 脚本更精简，移除不必要的 Hooks。
  - **CN Force**: 强制设置 Babele 语言为 `zh-cn` 以确保兼容性。

### Fixed (修复)
- **Export Crash 导出崩溃修复**:
  - Fixed a critical crash where files added to workspace caused `undefined` errors due to missing persistence.
  - Forced usage of `sourcePath` for reliable file tracking.
- **Export Config 导出配置修复**:
  - Fixed "Module Configuration" title translation.
  - Ensured workspace files are correctly passed to the backend exporter.
- **Dependency Cleanup 依赖清理**: 移除 6 个未使用的 npm 依赖 (level, nedb-promises, electron-updater 等)，减小项目体积约 19MB。
  Removed 6 unused npm dependencies to optimize app size.
- **Other Fixes**:
  - Fixed empty `languages` array in `module.json` structure.
  - Fixed `file is not defined` error preventing module export.

### Changed (变更)
- **Workspace View 模组工作区**: 独立的全屏模组工作区面板，按文件类型分组显示 (Lang/Babele/Script)。
- **Workspace Button 工作区入口**: 右侧工具栏新增工作区快捷按钮。
- **Sidebar 简化**: 移除嵌入的 ModuleBuilderPanel，保留文件列表，且支持折叠为图标模式。
- **GlossaryManager 性能优化**: 限制渲染 100 条 (MAX_DISPLAY)，避免大列表卡顿。
- **Output Format 输出格式**: 工作区每个文件可选择输出格式（仅译文/双语/保持原样）。
- **Blacklist System 黑名单系统**: 支持按 Key 后缀屏蔽翻译条目 (endsWith 匹配)。
