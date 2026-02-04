# 微信读书增强 WeRead Enhanced

微信读书网页版增强脚本，提升阅读体验。

## 功能特性

### 阅读体验
- **护眼背景色** - 9种护眼背景色可选（豆沙绿、杏仁黄等）
- **宽屏模式** - 更大的阅读区域
- **沉浸模式** - 隐藏顶栏，专注阅读
- **自动翻页** - 小键盘0开启/关闭，可调节速度

### 快捷标注
选中文字后，按数字键快速操作：
| 按键 | 功能 |
|------|------|
| `1` | 复制 |
| `2` | 马克笔（背景高亮） |
| `3` | 波浪线 |
| `4` | 直线 |
| `5` | 写想法 |
| `Backspace` | 删除划线/想法 |

### 笔记同步
一键发送划线/想法到：
- **Flomo** - `Ctrl+Shift+Alt+J`
- **Notion** - `Ctrl+Shift+Alt+N`
- **Obsidian** - `Ctrl+Shift+Alt+O`
- **自定义Webhook** - `Ctrl+Shift+Alt+W`

提交想法时（Ctrl+Enter）自动同步到 Flomo。

### 模板变量
Flomo 模板支持以下变量：
- `{{selectedText}}` - 划线文字
- `{{thought}}` - 想法内容
- `{{bookName}}` - 书名
- `{{chapter}}` - 章节
- `{{tags}}` - 自定义标签

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 点击下方链接安装脚本：

[![安装脚本](https://img.shields.io/badge/安装脚本-Greasyfork-red)](https://greasyfork.org/zh-CN/scripts/你的脚本ID)

或直接安装：[weread-enhanced.user.js](https://raw.githubusercontent.com/zhangyu0806/weread-enhanced/main/weread-enhanced.user.js)

## 使用说明

1. 打开 [微信读书网页版](https://weread.qq.com/web/reader/)
2. 点击油猴图标 → 微信读书增强 → 打开设置面板
3. 配置 Flomo API URL 等选项
4. 开始阅读，享受增强功能

## 获取 Flomo API

1. 打开 [Flomo](https://flomoapp.com/) → 设置 → API
2. 复制你的 API 地址
3. 粘贴到脚本设置面板

## 许可证

MIT License
