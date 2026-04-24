# Quick Note

一个基于 Electron 的极简速记工具 —— 像便利贴一样快速记录，随时随地捕获灵感。

## ✨ 特性

- 🚀 **极速启动** - 全局快捷键唤起，0.5 秒内开始记录
- 💾 **自动保存** - 按 `Esc` 自动保存并关闭，永不丢失
- 🔍 **实时检索** - 输入 `/` 触发全文搜索，毫秒级响应
- 📁 **本地存储** - SQLite + Markdown 文件，数据完全在你手中
- 🪶 **极致轻量** - 无富文本、无云同步、无复杂功能，专注速记

## 🎯 设计理念

> **不要想，只管记。**

Quick Note 不是笔记管理软件，不是知识库，不是待办工具。  
它是一个系统级的"脑子外挂"——想到什么，记下来；需要什么，立刻找到。

## 📦 安装

### 下载安装包（推荐）

访问 [Releases](https://github.com/yourusername/quick-note/releases) 页面下载对应平台的安装包：

| 平台 | 格式 |
|------|------|
| Windows | `.exe` 或 `.exe` (安装版) |
| macOS | `.dmg` |
| Linux | `.AppImage` 或 `.deb` |

### 从源码构建

```bash
# 克隆项目
git clone https://github.com/yourusername/quick-note.git
cd quick-note

# 安装依赖
npm install

# 启动开发环境
npm run dev

# 打包生产版本
npm run build