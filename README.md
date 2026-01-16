# FVTT 模组翻译工具 (FVTT Translator)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Electron](https://img.shields.io/badge/Electron-v28+-orange)
![React](https://img.shields.io/badge/React-v18-blue)

**FVTT Translator** 是一款专为 Foundry VTT 模组汉化者设计的现代化翻译工具。它集成了 AI 自动翻译、术语表管理、双语对照编辑以及一键打包导出功能，旨在极大地简化模组汉化的工作流程。

## ✨ 核心特性

- **🎨 现代陶塑风格界面 (Claymorphism)**
  - 精美的 UI 设计，悬浮玻璃拟态面板，提供舒适的视觉体验。
  - 支持 **浅色/深色主题** 切换（设置 → 常规）。
  - 可调节窗口分辨率（小/中/大/超大）。

- **🤖 AI 智能翻译**
  - 支持 **OpenAI**、**DeepSeek**、**Gemini** 等多种大模型接口。
  - 支持自定义 API 端点 (Base URL) 和模型参数 (Temperature)。
  - **上下文感知**：智能识别并在翻译时保持 HTML 标签和 Foundry 特有语法代码。

- **📚 强大的术语管理**
  - 内置术语表管理器，支持导入/导出。
  - 翻译时自动高亮和提示术语，确保专有名词翻译一致性。

- **🛠️ 模组工作区**
  - **拖拽导入**：直接拖入 JSON 或 JS 文件即可开始翻译。
  - **智能解析**：自动识别 `en.json` 语言文件和 Babele 映射文件。
  - **文件夹层级导航**：侧边栏显示可展开的目录树结构。
  - **文件暂存**：支持多文件同时管理，按类型（Lang/Babele/Script）分组。

- **� 便捷功能**
  - **自动更新**：内置自动更新机制，支持检查更新、下载进度条及重启安装。
  - **手动下载**：支持一键跳转 Release 页面手动下载。
  - **文件标签页**：支持同时打开多个文件标签页，状态重启自动恢复。

- **�📦 一键导出**
  - 自动生成符合规范的模组结构 (`module.json`, `lang/`, `packs/`)。
  - 内置 **Babele** 支持，自动生成 `babele.register` 脚本。
  - **智能双语对照**：短语自动双语化 (`中文 英文`)，长句仅保留译文。
  - 支持多种输出格式：仅译文、双语对照、保持原样。

## 🚀 快速开始

### 📥 直接下载使用（推荐）

无需安装任何开发环境，下载即用！

1. 前往 [**Releases 页面**](https://github.com/EzithiStar/fvtt-translator/releases)
2. 下载最新版本的 **FVTT-Translator-Setup-x.x.x.zip**（绿色免安装）或 **.exe**（安装版）
3. 解压后双击 `FVTT Translator.exe` 即可启动
4. **检查更新**：在设置 -> 关于页面，点击"检查更新"即可自动获取最新版本。

> 💡 查看 [CHANGELOG.md](./CHANGELOG.md) 了解每个版本的更新内容。

---

## 📖 使用指南

1. **打开项目**：选择一个现有的 FVTT 模组文件夹，或直接拖入单独的 JSON 文件。
2. **配置翻译**：在设置中配置您的 AI API Key。
3. **开始翻译**：
   - 使用左侧文件列表导航文件。
   - 点击"自动翻译"让 AI 帮您完成初稿。
   - 使用"术语表"面板管理专有名词。
4. **导出模组**：进入工作区，点击导出按钮，生成可直接放入 FVTT `Data/modules` 的汉化包。

---

## 🛠️ 技术栈

- **Core**: Electron, React 18, TypeScript
- **State Management**: Zustand
- **Styling**: TailwindCSS (Claymorphism Design)
- **Tooling**: Vite, Electron-Vite

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！如果您有好的建议或发现了 Bug，请随时反馈。

---

## 💻 开发者指南

如果您想参与开发或从源码运行，请参考以下步骤：

### 环境要求
- [Node.js](https://nodejs.org/) v18+

### 开发环境运行

```bash
# 克隆仓库
git clone https://github.com/EzithiStar/fvtt-translator.git
cd fvtt-translator

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 本地打包

```bash
npm run build    # 构建代码
npm run package  # 打包成 exe/zip (产物在 dist 目录)
```

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

