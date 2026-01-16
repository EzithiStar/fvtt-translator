# FVTT Translator 改进路线图 (Improvement Roadmap)

本文档记录了项目的后续优化建议及详细实施步骤。

## 🔥 优先级高 - 用户体验 (UX)

### 1. 快捷键支持 (Keyboard Shortcuts)
提升高频操作的效率。
**实施步骤**:
1.  **引入库**: 使用 `react-hotkeys-hook` 或原生 `window.addEventListener`。
2.  **定义快捷键**:
    - `Ctrl + S`: 保存当前文件。
    - `Ctrl + Enter`: 确认/应用当前翻译。
    - `Esc`: 关闭当前弹窗（Settings, ExportModal, BlacklistModal）。
    - `Ctrl + F`: 聚焦搜索框（需先实现搜索功能）。
3.  **全局监听**: 在 [App.tsx](file:///d:/fvtt-translator/src/renderer/src/App.tsx) 或布局组件中添加全局监听器。
4.  **组件级监听**: 在 [TranslationEditor](file:///d:/fvtt-translator/src/renderer/src/components/TranslationEditor.tsx#14-606) 中处理特定的编辑快捷键。
5.  **提示**: 在 UI 按钮旁的 Tooltip 中显示快捷键提示。

### 2. 搜索与筛选 (Search & Filter)
在大型翻译文件中快速定位。
**实施步骤**:
1.  **状态管理**: 在 `translationStore` 中添加 `searchQuery` 和 `filterMode` (All/Translated/Untranslated) 状态。
2.  **UI 组件**: 在 [TranslationEditor](file:///d:/fvtt-translator/src/renderer/src/components/TranslationEditor.tsx#14-606) 顶部添加搜索输入框和筛选下拉菜单。
3.  **过滤逻辑**: 修改渲染列表的逻辑，基于 `items.filter()` 实现：
    - 匹配原文或译文内容。
    - 匹配 Key/ID。
4.  **性能优化**: 对搜索输入进行防抖 (Debounce) 处理，避免频繁重渲染。
5.  **高亮显示**: 在搜索结果中高亮匹配的文本。

### 3. 翻译进度可视化 (Progress Visualization)
直观展示当前任务进度。
**实施步骤**:
1.  **计算逻辑**: 复用 `translationStore` 中的 `stats` 数据 (total, translated)。
2.  **组件开发**: 创建 `ProgressBar` 组件（带动画的填充条）。
3.  **UI 集成**:
    - **顶部栏**: 在主标题下方显示全局或当前文件的进度条。
    - **侧边栏**: 在文件列表中为每个文件添加微型进度圆环（可选）。
4.  **动态更新**: 确保每次翻译更新时进度条平滑过渡。

### 4. 清理原本备份 (Manage Original Backups)
方便用户清理自动生成的 `.original` 文件。
**实施步骤**:
1.  **后端 API**: 复用已有的 [deleteFile](file:///d:/fvtt-translator/src/main/lib/fileSystem.ts#148-151) 和 [getFiles](file:///d:/fvtt-translator/src/main/lib/fileSystem.ts#56-84) API。
2.  **设置界面**: 在“设置 -> 常规”或“设置 -> 模组配置”中添加“清理备份文件”选项。
3.  **交互流程**:
    - 点击“扫描备份”按钮，列出所有 `.original` 文件及其大小。
    - 点击“一键清理”按钮，批量删除。
    - 显示清理结果通知（如“已释放 1.2MB 空间”）。

### 5. 多语言翻译目标 (Multi-language Support)
扩展用户群体。
**实施步骤**:
1.  **配置存储**: 在 [Settings](file:///d:/fvtt-translator/src/renderer/src/components/Settings.tsx#13-155) 中添加 `targetLanguage` 选项（默认 `zh-CN`）。
2.  **Prompt 调整**: 修改 AI 翻译的 Prompt 模板，将目标语言作为变量传入。
3.  **界面文案**: 更新显示的语言名称（如“中文”改为动态显示）。
4.  **导出调整**: 
    - `module.json` 的 `languages` 字段需根据目标语言自动调整（如 [es](file:///d:/fvtt-translator/src/main/lib/fileSystem.ts#56-84), `fr`, `ja`）。
    - 导出文件名调整（如 `_es.json`）。

---

## 🎨 界面优化 (UI Optimization)

### 6. 深色主题完善 (Dark Theme Polish)
**实施步骤**:
1.  **全局审查**: 遍历所有组件，检查在 `.dark` 类下的表现。
2.  **颜色映射**: 确保所有硬编码的颜色值都替换为 CSS 变量或 Tailwind 的 `dark:` 修饰符。
3.  **滚动条**: 适配深色滚动条样式。
4.  **图标适配**: 调整深色模式下的图标颜色（避免某些深色图标在深色背景下不可见）。

### 7. 列表由于拖拽 (Drag & Drop Reordering)
**实施步骤**:
1.  **库选择**: 使用 `dnd-kit` 或 `react-beautiful-dnd`。
2.  **工作区集成**: 允许拖拽调整 [WorkspaceView](file:///d:/fvtt-translator/src/renderer/src/components/WorkspaceView.tsx#27-365) 中文件的打包顺序。
3.  **导出逻辑**: 确保导出时按照视觉顺序处理文件。

---

## 🔧 功能增强 (Feature Enhancements)

### 8. 翻译记忆库 (Translation Memory - TM)
复用已有的翻译，减少 AI 消耗，保持一致性。
**实施步骤**:
1.  **数据结构**: 设计 TM 存储格式（如 SQLite 或 JSON Lines），存储 `hash(original) -> translation`。
2.  **入库逻辑**: 用户确认翻译或保存文件时，将条目写入 TM。
3.  **匹配逻辑**: 
    - 自动翻译前，先查询 TM。
    - 如果存在完全匹配 (100% Match)，直接使用 TM 结果，不调用 AI。
    - 标记来源为 "TM" 而非 "AI"。
4.  **管理界面**: 允许用户查看、导出、清空记忆库。

### 9. 术语表智能匹配 (Smart Glossary)
翻译时自动高亮术语。
**实施步骤**:
1.  **预处理**: 加载文件时，遍历术语表，构建 Aho-Corasick 自动机或正则匹配树。
2.  **高亮渲染**: 自定义 `Textarea` 或使用 `contenteditable`，将原文中的术语用特殊样式包裹。
3.  **提示交互**: 鼠标悬停在术语上显示标准译文，点击一键插入。
4.  **AI 集成**: 确保 AI Prompt 显式包含当前段落涉及的术语对照。

### 10. 导入/导出项目 (Project Management)
方便迁移或备份。
**实施步骤**:
1.  **归档格式**: 定义 `.fvtt-trans` 格式（实质为 ZIP）。
2.  **包含内容**: `original_files/`, `translated_files/`, `glossary.json`, `settings.json`, `workspace.json`。
3.  **IPC 实现**: 使用 `adm-zip` 在主进程处理打包和解包。
4.  **UI 入口**: 首页添加“导入项目”和“导出项目”按钮。

---

## 📦 工程化 (Engineering)

### 11. 自动更新 (Auto Update)
**实施步骤**:
1.  **Electron Builder**: 配置 `publish: ['github']`。
2.  **主进程**: 使用 `electron-updater` 模块。
3.  **事件监听**: 监听 `update-available`, `update-downloaded`。
4.  **UI 提示**: 当有更新时，显示弹窗提示用户“重启并安装”。

### 12. 错误监控 (Error Reporting)
**实施步骤**:
1.  **全局捕获**: 在 `main` (process.on('uncaughtException')) 和 `renderer` (window.onerror) 添加捕获。
2.  **日志记录**: 将错误堆栈写入 `AppData/logs/error.log`。
3.  **用户反馈**: 弹窗提示“发生错误”，并提供“复制错误日志”按钮，方便用户提交 Issue。

---

## 💡 远期规划

### 13. 协作翻译
**思路**: 基于 Git 或 P2P 技术，允许多人实时编辑同一份翻译文件。
### 14. 社区术语库
**思路**: 对接外部 API 或 GitHub 仓库，自动拉取 D&D 5E, Pathfinder 等系统的标准术语集。
