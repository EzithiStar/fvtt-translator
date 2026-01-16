# Changelog / 更新日志

> 📌 **说明**: 本文件记录每个版本的更新内容。发布 Release 时，GitHub Actions 会自动读取最新版本的更新说明。
> 
> **版本号规则**:
> - `+0.0.1` - 小修复、Bug 修复、UI 微调
> - `+0.1.0` - 新功能、较大改动
> - `+1.0.0` - 重大版本更新、不兼容变更

---

## [1.2.1] - 2026-01-16

### Fixed
- **Auto Update**:
  - **Manual Download**: Fixed clicking "Manual Download" not opening the browser.
    - **手动下载**: 修复了点击手动下载按钮无反应的问题。
  - **Dev Mode**: Prevent infinite "Checking..." spinner in development mode by showing a clear error message.
    - **开发模式**: 防止在开发环境下无限检查更新，现在会显示明确的不可用提示。
  - **CSP Error**: Fixed `Content-Security-Policy` issue blocking Web Workers (e.g. for 3D dice).
    - **CSP 错误**: 修复了阻止 Web Worker 运行的 CSP 策略，解决了控制台安全警告。
- **Release Notes**: Fixed garbled characters (`%0D%0A`) in GitHub Release body.
  - **发布说明**: 修复了 GitHub Release 页面更新说明显示乱码的问题。

### Changed
- **Auto Update UX**:
  - Added "Enable Auto Update" toggle switch in Settings (user preference).
    - **自动更新开关**: 在设置中新增了启用/禁用自动更新的开关。
  - Translated experimental feature warning and error messages.
    - **本地化**: 翻译了自动更新相关的警告和错误提示。
- **Performance**:
  - **Translation Editor**: Implemented Lazy Loading (pagination) to fix lag when opening large files.
    - **编辑器性能**: 实现了懒加载（分页渲染），极大优化了打开大文件时的流畅度。

## [1.2.0] - 2026-01-16

### Added
- **File Tabs**: Support opening multiple files simultaneously in sidebar tabs.
  - **文件标签页**: 支持在侧边栏同时打开多个文件标签页。
- **Auto Update**: Built-in auto-update mechanism using GitHub Releases.
  - **自动更新**: 内置自动更新机制，支持检查更新、下载进度条及重启安装。
- **Glossary Selector**: Quickly toggle active glossaries from the sidebar panel.
  - **术语表选择**: 在侧栏面板中快速切换启用的术语表。
- **Performance**: Optimized editor loading state to prevent flickering.
  - **性能优化**: 优化编辑器加载状态，防止切换文件时闪烁。

### Fixed
- **State Persistence**: Active file and opened tabs are restored after restart.
  - **状态持久化**: 重启后自动恢复打开的文件和标签页。

## [1.1.9] - 2026-01-16

### ✨ 新功能
- **翻译记忆库 (Translation Memory)**: 自动复用已翻译内容，减少 AI 调用。
  - 翻译前自动查询记忆库，100% 匹配直接使用
  - AI 翻译结果自动保存到记忆库
  - 新增设置标签页：查看统计 (命中率)、清空记忆库
- **术语表智能匹配**: 翻译编辑器中自动高亮术语表中的词汇。
  - 黄色背景高亮显示匹配的术语
  - 悬停显示术语译文 Tooltip
  - 点击高亮术语一键插入译文

---

## [1.1.8] - 2026-01-16

### ✨ 新功能
- **从已翻译文件提取术语**: 在术语表管理中新增"提取"按钮，支持打开已翻译 JSON 文件，智能识别 `Key=原文`、`Value=译文`，预览后一键导入术语表。
  - 自动过滤长描述、变量、HTML 标签
  - 支持全选/取消/单选操作
  - 新增警告提示：提醒用户需手动甄别提取结果
- **分页页码跳转**: 术语表支持直接输入页码跳转，不再需要逐页翻页。
- **每页条数增加**: 术语表每页显示数量从 50 条增加到 100 条。

### 🐛 修复
- **术语删除/编辑问题**: 修复了第 2 页及之后的术语无法正确删除和编辑的索引计算 Bug。
- **提取按钮位置**: 在中间大术语表界面 (Modal) 也添加了提取按钮。

---

## [1.1.7] - 2026-01-16

### ✨ 改进
- **核心术语库 (System Verified)**: 替换为基于 PF1 官方系统 (`en.json` / `cn.json`) 提取的精准术语库 (~300条)。涵盖技能、状态、战斗术语等，权威性更高。
- **术语表分页**: 术语表管理界面新增分页功能，每页显示 50 条，可翻页查看全部内容。
- **核心术语库**: PF1e 术语库已精简为 ~200 条人工精选核心词条 (技能/职业/状态/法术)，更准确实用。
- **PF1e 按钮本地化**: 修复了术语表管理中 PF1e 按钮的英文提示，现支持中英文切换。

### 🐛 修复
- **空白条目过滤**: 修复了导入 Babele/JSON 文件时，空白值会显示为单独一行的问题。
- **单文件侧边栏**: 修复了打开单个文件时侧边栏不显示文件名的问题。

---

## [1.1.6] - 2026-01-15

### ✨ 新增功能
- **Pathfinder 1e 内置术语表**: 集成了从 CHM 提取的 26,000+ 条目术语库。
  - 在术语表管理界面新增 "Load PF1e Preset" 按钮。
  - 点击即可一键导入海量对照数据，大幅提升翻译准确度。

---

## [1.1.5] - 2026-01-15

### 🐛 紧急修复
- **Web资源加载修复**: 移除了 3D 骰子中导致部分网络环境下崩溃的远程 HDR 贴图，改为本地灯光渲染，彻底消除白屏风险

---

## [1.1.4] - 2026-01-15

### 🐛 紧急修复
- **启动崩溃修复**: 解决了因 3D 引擎依赖版本不兼容导致的白屏崩溃问题 (Downgraded three.js to stable v0.160)

---

## [1.1.3] - 2026-01-15

### ✨ 界面优化
- **真·3D 骰子**: 引入 Three.js 引擎，将关于页的骰子升级为全 3D 物理渲染模型
  - 真实的旋转动画与金属丝网光泽
  - 投掷结果以巨大的 3D 悬浮文字叠加显示
  - 大成功/大失败会有震撼的粒子庆祝特效

---

## [1.1.2] - 2026-01-15

### ✨ 界面优化
- **D20 彩蛋升级**: 
  - 优化骰子图标样式，更符合界面主题
  - 投掷动画升级，结果数字浮现在屏幕前方
  - 新增"大成功" (Nat 20) 金色粒子庆祝特效
  - 增加 3 秒冷却时间，防止误触

---

## [1.1.1] - 2026-01-15

### ✨ 新增功能
- **关于页彩蛋**: 将设置页面的图标替换为交互式 D20 骰子。点击可掷骰检定，掷出 20 或 1 会有特殊效果！

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
