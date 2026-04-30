# Quick-Note 项目开发计划

## 1. 项目概述

### 1.1 项目背景
基于需求文档，本项目是一个**极速启动、本地优先的全局闪念捕捉工具**，核心价值在于极低的操作摩擦和数据的完全掌控。

### 1.2 核心目标
| 目标 | 描述 |
|------|------|
| 极速启动 | Alt+Space 热键 300ms 内呼出 |
| 无感存储 | 自动保存，无需点击保存按钮 |
| 数据自有 | 单一 JSON 文件存储，便携导入导出 |
| 纯键盘流 | 斜杠命令 `/` 完成所有操作 |

---

## 2. 技术架构设计

### 2.1 整体架构
```
┌─────────────────────────────────────────────────────────────┐
│                    Quick-Note 架构                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐      IPC      ┌──────────────┐           │
│  │  Renderer   │ ←──────────→ │    Main      │           │
│  │  (React)    │              │  (Electron)  │           │
│  │             │              │              │           │
│  │ • 输入界面  │              │ • 全局热键   │           │
│  │ • 命令解析  │              │ • 托盘菜单   │           │
│  │ • 状态管理  │              │ • 数据读写   │           │
│  └─────────────┘              └──────────────┘           │
│                                        │                  │
│                                        ↓                  │
│                              ┌────────────────┐           │
│                              │   data.json    │           │
│                              └────────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 目录结构
```
src/
├── main/                    # Electron 主进程
│   ├── index.ts             # 主入口，窗口/托盘/热键管理
│   ├── dataManager.ts       # 数据读写核心模块
│   ├── ipcHandlers.ts       # IPC 事件处理
│   ├── shortcutManager.ts   # 全局热键管理
│   └── types/               # 类型定义
│       └── index.ts
├── preload/                 # 预加载脚本
│   ├── index.ts             # 暴露 API 给渲染进程
│   └── index.d.ts           # TypeScript 声明
└── renderer/                # React 渲染进程
    ├── src/
    │   ├── main.tsx         # React 入口
    │   ├── App.tsx          # 主应用组件
    │   ├── components/      # UI 组件
    │   │   ├── NoteInput.tsx       # 核心输入框
    │   │   ├── CommandMenu.tsx     # 命令提示菜单
    │   │   ├── NoteList.tsx        # 笔记列表
    │   │   └── StatusIndicator.tsx # 状态指示器
    │   ├── hooks/           # 自定义 Hooks
    │   │   └── useNote.ts   # 笔记操作 Hook
    │   ├── utils/           # 工具函数
    │   │   └── commandParser.ts    # 命令解析器
    │   └── assets/          # 静态资源
    └── index.html           # HTML 模板
```

### 2.3 关键技术选型
| 模块 | 技术 | 说明 |
|------|------|------|
| 框架 | Electron + React | 跨平台桌面应用 |
| 语言 | TypeScript | 类型安全 |
| 数据存储 | fs + JSON | 单文件便携存储 |
| 全局热键 | electron.globalShortcut | 系统级快捷键 |
| UI | React + CSS | 极简毛玻璃效果 |

---

## 3. 功能模块划分

### 3.1 模块总览
| 模块 | 职责 | 状态 |
|------|------|------|
| **热键系统** | 全局热键注册、冲突检测、自定义配置 | 核心 |
| **输入界面** | 无边框窗口、毛玻璃效果、自动聚焦 | 核心 |
| **命令系统** | 斜杠命令解析、执行、反馈 | 核心 |
| **数据管理** | JSON 文件读写、版本控制、备份恢复 | 核心 |
| **托盘菜单** | 系统托盘、设置入口、导入导出 | 辅助 |

### 3.2 命令系统详细设计

| 命令 | 功能 | 参数 | 触发条件 |
|------|------|------|----------|
| `/new-file` | 新建笔记 | 无 | 行首输入 |
| `/save` | 追加到上一条 | 无 | 行首输入 |
| `/rename` | 重命名上一条 | `新文件名` | 行首输入 + 参数 |
| `/list` | 列出最近笔记 | 无 | 行首输入 |
| `/search` | 全文搜索 | `关键字` | 行首输入 + 参数 |
| `/export` | 导出数据 | 无 | 行首输入 |
| `/import` | 导入数据 | 无 | 行首输入 |
| `/help` | 显示帮助 | 无 | 行首输入 |

### 3.3 数据结构设计
```typescript
interface Note {
  id: string;                 // UUID v4
  title: string;              // 第一行或重命名后的值
  content: string;            // 完整内容，支持多行
  createdAt: string;          // ISO 8601 时间戳
  updatedAt: string;          // ISO 8601 时间戳
}

interface DataStore {
  version: string;            // 版本号，用于兼容性检查
  notes: Note[];              // 笔记数组
  lastNoteId: string | null;  // 最后操作的笔记 ID
}
```

---

## 4. 开发计划

### 4.1 开发阶段划分

| 阶段 | 时间 | 目标 | 交付物 |
|------|------|------|--------|
| **Phase 1** | 1-2 天 | 基础框架搭建 | 窗口、托盘、热键 |
| **Phase 2** | 2-3 天 | 核心数据模块 | JSON读写、IPC通信 |
| **Phase 3** | 2-3 天 | 命令系统实现 | 8个斜杠命令 |
| **Phase 4** | 2 天 | UI 完善 | 毛玻璃效果、状态反馈 |
| **Phase 5** | 1-2 天 | 异常处理 | 数据损坏、热键冲突 |
| **Phase 6** | 1 天 | 测试与打包 | 跨平台构建验证 |

### 4.2 Phase 1: 基础框架搭建

**目标**：实现窗口创建、托盘菜单、全局热键基础功能

| 任务 | 描述 | 负责人 |
|------|------|--------|
| 1.1 | 优化主窗口配置（无边框、置顶、毛玻璃） | @author wujingkai |
| 1.2 | 实现托盘菜单（显示/退出） | @author wujingkai |
| 1.3 | 注册默认热键 Alt+Space | @author wujingkai |
| 1.4 | 实现窗口显示/隐藏逻辑 | @author wujingkai |

### 4.3 Phase 2: 核心数据模块

**目标**：实现 JSON 文件读写、IPC 通信机制

| 任务 | 描述 | 负责人 |
|------|------|--------|
| 2.1 | 定义数据结构类型 | @author wujingkai |
| 2.2 | 实现 dataManager（读写、备份） | @author wujingkai |
| 2.3 | 实现 IPC 事件处理 | @author wujingkai |
| 2.4 | 预加载脚本暴露 API | @author wujingkai |

### 4.4 Phase 3: 命令系统实现

**目标**：实现全部 8 个斜杠命令

| 任务 | 描述 | 负责人 |
|------|------|--------|
| 3.1 | 命令解析器（识别 `/command` 模式） | @author wujingkai |
| 3.2 | `/new-file` 和 `/save` 实现 | @author wujingkai |
| 3.3 | `/rename` 实现（带参数） | @author wujingkai |
| 3.4 | `/list` 和 `/search` 实现 | @author wujingkai |
| 3.5 | `/export` 和 `/import` 实现 | @author wujingkai |
| 3.6 | `/help` 实现 | @author wujingkai |

### 4.5 Phase 4: UI 完善

**目标**：实现美观的输入界面和状态反馈

| 任务 | 描述 | 负责人 |
|------|------|--------|
| 4.1 | 毛玻璃效果输入框组件 | @author wujingkai |
| 4.2 | 命令提示菜单组件 | @author wujingkai |
| 4.3 | 笔记列表展示组件 | @author wujingkai |
| 4.4 | 状态指示器（成功/失败） | @author wujingkai |

### 4.6 Phase 5: 异常处理

**目标**：处理各种边界情况和错误

| 任务 | 描述 | 负责人 |
|------|------|--------|
| 5.1 | 热键冲突检测与提示 | @author wujingkai |
| 5.2 | JSON 文件损坏处理（备份+重置） | @author wujingkai |
| 5.3 | 导入版本不兼容处理 | @author wujingkai |
| 5.4 | 开机自启功能 | @author wujingkai |

### 4.7 Phase 6: 测试与打包

**目标**：验证功能并构建跨平台安装包

| 任务 | 描述 | 负责人 |
|------|------|--------|
| 6.1 | 功能测试（各命令验证） | @author wujingkai |
| 6.2 | 构建 Windows 安装包 | @author wujingkai |
| 6.3 | 构建 macOS 安装包 | @author wujingkai |
| 6.4 | 构建 Linux 安装包 | @author wujingkai |

---

## 5. IPC 通信设计

### 5.1 渲染进程 → 主进程

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `note:create` | `{ content: string }` | 创建新笔记 |
| `note:append` | `{ content: string }` | 追加到上一条笔记 |
| `note:rename` | `{ newTitle: string }` | 重命名上一条笔记 |
| `note:list` | `{ limit?: number }` | 获取笔记列表 |
| `note:search` | `{ keyword: string }` | 搜索笔记 |
| `app:export` | 无 | 导出数据 |
| `app:import` | `{ filePath: string }` | 导入数据 |
| `app:showHelp` | 无 | 显示帮助 |
| `app:toggleWindow` | 无 | 显示/隐藏窗口 |

### 5.2 主进程 → 渲染进程

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `note:created` | `{ note: Note }` | 笔记创建成功 |
| `note:updated` | `{ note: Note }` | 笔记更新成功 |
| `note:listed` | `{ notes: Note[] }` | 返回笔记列表 |
| `note:searched` | `{ notes: Note[] }` | 返回搜索结果 |
| `app:status` | `{ type: 'success' | 'error' | 'info', message: string }` | 状态通知 |

---

## 6. 安全与性能考量

### 6.1 安全措施
- **禁止网络请求**：在 webPreferences 中禁用 remote 模块
- **沙箱模式**：启用 sandbox 增强安全性
- **路径限制**：数据文件仅存储在用户数据目录

### 6.2 性能优化
- **延迟加载**：窗口隐藏时释放资源
- **批量写入**：避免频繁 IO
- **内存管理**：限制笔记列表显示数量

### 6.3 异常处理
| 异常场景 | 处理策略 |
|----------|----------|
| JSON 文件损坏 | 备份并创建新文件 |
| 热键冲突 | 提示用户修改 |
| 导入版本不兼容 | 提示升级软件 |

---

## 7. 代码规范

### 7.1 命名约定
- 文件：小写字母 + 连字符（`data-manager.ts`）
- 变量：驼峰命名（`lastNoteId`）
- 常量：全大写 + 下划线（`MAX_NOTES_DISPLAY`）

### 7.2 代码风格
- 使用 ESLint + Prettier 自动格式化
- 函数单一职责原则
- 必要时添加注释（解释为什么，不是做什么）

### 7.3 注释规范
- 类/函数必须添加 `@author wujingkai` 注释
- 公共 API 提供 JSDoc 文档

---

## 8. 里程碑与验收标准

### 8.1 里程碑
| 日期 | 里程碑 | 验收标准 |
|------|--------|----------|
| Day 2 | 基础框架完成 | 热键唤起窗口、托盘菜单工作 |
| Day 5 | 核心功能完成 | 新建/保存/追加笔记正常 |
| Day 8 | 命令系统完成 | 8 个命令全部实现 |
| Day 10 | UI 完善 | 毛玻璃效果、状态反馈 |
| Day 12 | 异常处理 | 热键冲突、数据损坏处理 |
| Day 14 | 测试打包 | 跨平台安装包构建成功 |

### 8.2 验收清单
- [ ] Alt+Space 热键 300ms 内唤起窗口
- [ ] 输入内容自动保存
- [ ] 8 个斜杠命令全部正常工作
- [ ] 数据文件可导入导出
- [ ] 热键冲突检测
- [ ] JSON 损坏自动备份
- [ ] 开机自启功能
- [ ] 跨平台构建成功

---

## 9. 附录

### 9.1 数据文件路径
- Windows: `%APPDATA%\Quick-Note\data.json`
- macOS: `~/Library/Application Support/Quick-Note/data.json`
- Linux: `~/.config/Quick-Note/data.json`

### 9.2 默认热键
- Windows/Linux: `Alt+Space`
- macOS: `Option+Space`（备选 `Command+Shift+Space`）

### 9.3 扩展规划
1. Markdown 预览
2. 标签系统（`#标签`）
3. 云同步（WebDAV）
4. 每日回顾提醒
