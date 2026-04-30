# 闪念笔记 (Quick-Note)

极速启动、本地优先的全局闪念捕捉工具。

## ✨ 特性

- 🚀 **极速启动** - 全局快捷键 `Alt+Space` (macOS: `Option+Space`) 唤起，300ms 内响应
- 💾 **无感存储** - 输入内容自动保存，无需点击保存按钮
- 🔐 **数据自有** - 单一 JSON 文件存储，可随意拷贝、导入、导出
- ⌨️ **纯键盘流** - 斜杠命令 `/` 完成所有操作，无需离开键盘

## 🎯 设计理念

> **不要想，只管记。**

Quick-Note 不是笔记管理软件，不是知识库，不是待办工具。  
它是一个系统级的"脑子外挂"——想到什么，记下来；需要什么，立刻找到。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build

# 特定平台构建
npm run build:win
npm run build:mac
npm run build:linux
```

## 📖 使用指南

### 核心流程

1. **触发**：按下 `Alt+Space` (macOS: `Option+Space`)
2. **输入**：极简输入框出现在屏幕中央，自动获得焦点
3. **记录**：输入内容，默认创建新笔记
4. **命令**：在输入框行首使用斜杠命令执行特定动作
5. **关闭**：按 `Esc` 或点击外部区域，窗口消失，内容自动保存

### 斜杠命令

| 命令 | 功能 | 示例 |
|------|------|------|
| `/new-file` | 新建笔记（默认行为） | `这是一条笔记 /new-file` |
| `/save` | 追加到上一条笔记 | `继续追加内容 /save` |
| `/rename` | 重命名上一条笔记 | `/rename 会议纪要` |
| `/list` | 列出最近 5-10 条笔记 | `/list` |
| `/search` | 全文模糊搜索 | `/search 产品方案` |
| `/export` | 导出全部数据 | `/export` |
| `/import` | 导入数据文件 | `/import` |
| `/help` | 显示帮助 | `/help` |

### 命令规则

- `/` 必须在一行的行首
- 命令和参数之间有一个空格
- 执行成功显示绿色对勾，失败显示红色提示

## 🔧 托盘菜单

右键点击系统托盘图标访问以下功能：

- **打开主面板** - 显示历史笔记列表
- **设置热键...** - 自定义全局快捷键
- **打开数据目录** - 在资源管理器中打开存储位置
- **导出数据 / 导入数据** - 数据迁移
- **开机自启** - 随系统启动
- **关于 / 退出**

## 📁 数据存储

数据文件存储在系统用户数据文件夹内：

- **Windows**: `C:\Users\[用户名]\AppData\Roaming\Quick-Note\data.json`
- **macOS**: `~/Library/Application Support/Quick-Note/data.json`
- **Linux**: `~/.config/Quick-Note/data.json`

### 数据结构

```json
{
  "version": "1.0",
  "notes": [
    {
      "id": "uuid_v4_string",
      "title": "笔记标题",
      "content": "笔记内容",
      "createdAt": "ISO 8601 timestamp",
      "updatedAt": "ISO 8601 timestamp"
    }
  ],
  "lastNoteId": "uuid_of_last_operated_note"
}
```

## 🔒 隐私与安全

- **绝对无网络**：代码层面禁止所有网络请求
- **本地存储**：数据文件未加密，依赖操作系统账户保护
- **数据备份**：检测到文件损坏时自动备份为 `data_backup.json`

## 📦 技术栈

- **框架**: Electron 39
- **前端**: React 19 + TypeScript
- **构建**: electron-vite
- **打包**: electron-builder

## 🛠️ 开发计划

请参考 [plan.md](./plan.md) 获取详细的开发计划和架构设计。

## 📄 许可证

MIT License
