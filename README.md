# 微信读书增强 WeRead Enhanced

微信读书网页版增强脚本，提升阅读体验。

## 致谢

本脚本基于以下优秀作品合并和扩展，感谢原作者的贡献：

| 原脚本 | 作者 | 链接 |
|--------|------|------|
| 微信读书 | [Velens](https://greasyfork.org/zh-CN/users/894498-velens) | [Greasyfork](https://greasyfork.org/zh-CN/scripts/440339) |
| 微信读书网页版标注笔记快捷键 | [Ernest Lee](https://greasyfork.org/zh-CN/users/1340338-ernest-lee) | [Greasyfork](https://greasyfork.org/zh-CN/scripts/497926) |

## 为什么要合并？

在使用微信读书网页版时，我需要同时安装多个脚本才能满足需求：
- **Velens 的脚本**：提供护眼背景色、宽屏模式、自动阅读等功能，非常实用
- **Ernest Lee 的脚本**：提供快捷键标注功能，大幅提升标注效率

但是：
1. **多脚本管理麻烦** - 需要分别安装、更新、配置
2. **功能有重叠** - 两个脚本都监听键盘事件，偶尔会冲突
3. **缺少笔记同步** - 我需要把划线和想法同步到 Flomo，原脚本都不支持

于是我将两个脚本合并，并添加了笔记同步功能，形成了这个增强版。

## 新增功能

在原有功能基础上，本脚本新增：

- **发送到 Flomo** - 一键同步划线/想法到 Flomo
- **发送到 Notion** - 同步到 Notion 数据库
- **发送到 Obsidian** - 同步到 Obsidian 笔记
- **自定义 Webhook** - 同步到任意支持 Webhook 的服务
- **提交想法自动同步** - 按 Ctrl+Enter 提交想法时自动同步到 Flomo
- **自定义模板** - 支持 `{{selectedText}}`、`{{thought}}`、`{{bookName}}`、`{{chapter}}`、`{{tags}}` 变量

## 功能特性

### 阅读体验（来自 Velens）
- **护眼背景色** - 9种护眼背景色可选（豆沙绿、杏仁黄等）
- **宽屏模式** - 更大的阅读区域
- **沉浸模式** - 隐藏顶栏，专注阅读
- **自动翻页** - 小键盘0开启/关闭，可调节速度

### 快捷标注（来自 Ernest Lee）
选中文字后，按数字键快速操作：

| 按键 | 功能 |
|------|------|
| `1` | 复制 |
| `2` | 马克笔（背景高亮） |
| `3` | 波浪线 |
| `4` | 直线 |
| `5` | 写想法 |
| `Backspace` | 删除划线/想法 |
| `Ctrl+Enter` | 提交想法 |
| `Esc` | 关闭想法弹窗 |

### 笔记同步（新增）

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+Alt+J` | 发送到 Flomo |
| `Ctrl+Shift+Alt+N` | 发送到 Notion |
| `Ctrl+Shift+Alt+O` | 发送到 Obsidian |
| `Ctrl+Shift+Alt+W` | 发送到 Webhook |

提交想法时（Ctrl+Enter）会自动同步到 Flomo。

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 点击下方链接安装脚本：

**[直接安装](https://raw.githubusercontent.com/zhangyu0806/weread-enhanced/main/weread-enhanced.user.js)**

## 使用说明

1. 打开 [微信读书网页版](https://weread.qq.com/web/reader/)
2. 点击油猴图标 → 微信读书增强 → 打开设置面板
3. 配置 Flomo API URL 等选项
4. 开始阅读，享受增强功能

## 获取 Flomo API

1. 打开 [Flomo](https://flomoapp.com/) → 设置 → API
2. 复制你的 API 地址
3. 粘贴到脚本设置面板

## 模板变量

Flomo 模板支持以下变量：

| 变量 | 说明 |
|------|------|
| `{{selectedText}}` | 划线文字 |
| `{{thought}}` | 想法内容 |
| `{{bookName}}` | 书名 |
| `{{chapter}}` | 章节 |
| `{{tags}}` | 自定义标签 |

示例模板：
```
{{tags}} #{{bookName}}
{{selectedText}}

💭 {{thought}}
```

## 许可证

MIT License

## 反馈

如有问题或建议，欢迎提交 [Issue](https://github.com/zhangyu0806/weread-enhanced/issues)。
