# Changelog / 更新日志

> 📌 **说明**: 本文件记录每个版本的更新内容。发布 Release 时，GitHub Actions 会自动读取最新版本的更新说明。
> 
> **版本号规则**:
> - `+0.0.1` - 小修复、Bug 修复、UI 微调
> - `+0.1.0` - 新功能、较大改动
> - `+1.0.0` - 重大版本更新、不兼容变更

---

## [1.1.0] - 2026-01-15

> 🎉 **重大更新**：新增多项实用功能，提升翻译体验！

### ✨ 新增功能
- **窗口分辨率设置**: 在设置-常规中新增分辨率选择器（小/中/大/超大），默认分辨率从 900×670 增加到 1280×800
- **文件夹层级导航**: 侧边栏文件列表现在显示为可展开的目录树结构，点击文件夹可展开/折叠
- **深色主题**: 在设置-常规中开启深色模式（实验性功能）
- **版本号自动同步**: 设置-关于页面的版本号现在从 package.json 自动读取
- **智能双语导出**: 
  - 开启翻译时自动备份原文件 (`.original`)
  - 短语 (<50字符) 显示为 `中文 英文`，长句仅保留译文
  - 模组工作区的"双语"选项现在使用智能双语生成

### 🐛 修复
- **视图导航修复**: 从模组工作区返回时，现在能正确返回到之前的编辑器界面
- **翻译状态持久化**: 完善了视图切换时的状态保持逻辑，翻译进度不再丢失

### 🎨 界面优化
- **导出模块界面**: 修复 Babele 设置区域和作者卡片的配色问题，统一浅色陶塑风格

---

## [1.0.0] - 2026-01-15 13:00

### ✨ 新增功能
- **自动化发布**: 配置 GitHub Actions (`release.yml`)，支持 Git 标签触发自动构建和发布 Windows EXE/ZIP
- **开源准备**: 更新了 README 和 .gitignore，移除非必要开发文件

### 🎨 界面优化
- **陶塑风格主题**: 全面应用 Claymorphism 设计系统到设置、模态框、工具面板
- **面板布局优化**: 设置界面隐藏主侧边栏，避免三栏拥挤
- **悬浮玻璃面板**: 工具面板使用绝对定位 + `backdrop-blur` 半透明效果

### 🐛 修复
- **翻译状态持久化**: 解决切换视图后翻译进度丢失的问题（使用 Zustand 全局状态）
- **依赖冲突**: 修复 GitHub Actions 中 vite 与 @types/node 版本冲突
- **TypeScript 编译错误**: 修复所有渲染组件中的类型错误

---

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
