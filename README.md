# 微信读书增强 WeRead Enhanced

微信读书网页版增强脚本，提升阅读体验。

## 我的痛点

我喜欢在大屏上读书，方便汇总想法、摘抄和做笔记。

用 Flomo 记笔记和摘抄有个好处：每日回顾时，总会不经意间灵感迸发。这种便捷的回顾方式，让我养成了随手存笔记到 Flomo 的习惯。

但以前的流程太繁琐：
1. 选中文字 → 点击划线
2. 想写想法 → 再点写想法按钮 → 输入 → 点发表
3. 想同步到 Flomo → 复制内容 → 打开 Flomo → 粘贴 → 添加标签 → 保存

每条笔记都要重复这些步骤，严重打断阅读心流。

**现在：**
- **摘抄** —— 选中文字 → 按快捷键 → 自动划线并同步到 Flomo
- **写想法** —— 选中文字 → 按快捷键 → 写想法 → 点发表 → 自动同步到 Flomo

一键完成，专注阅读。

## 使用流程

### 首次配置

1. 安装脚本后，打开微信读书网页版
2. 鼠标移到屏幕右边缘，弹出设置面板（或按 `Ctrl+,`）
3. 在 Flomo 区域填入你的 API URL
4. 根据需要修改标签和模板

### 日常阅读 - 摘抄

1. 选中想要摘录的文字
2. 按 `Ctrl+Shift+Alt+J`
3. 自动划线 + 发送到 Flomo，继续阅读

### 日常阅读 - 写想法

1. 选中触发思考的文字
2. 按 `5` 打开写想法面板
3. 输入你的想法
4. 点击"发表"按钮
5. 自动同步到 Flomo，继续阅读

### 快捷键速查

**选中文字后：**

| 快捷键 | 功能 |
|--------|------|
| `1` | 复制文字 |
| `2` | 马克笔高亮 |
| `3` | 波浪线 |
| `4` | 直线划线 |
| `5` | 写想法 |
| `Backspace` | 删除划线 |
| `Esc` | 关闭弹窗 |

**笔记同步：**

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+Alt+J` | 发送到 Flomo |
| `Ctrl+Shift+Alt+N` | 发送到 Notion |
| `Ctrl+Shift+Alt+O` | 发送到 Obsidian |
| `Ctrl+Shift+Alt+W` | 发送到 Webhook |

## 致谢

本脚本基于以下优秀作品合并和扩展，感谢原作者的贡献：

| 原脚本 | 作者 | 链接 |
|--------|------|------|
| 微信读书 | [Velens](https://greasyfork.org/zh-CN/users/894498-velens) | [Greasyfork](https://greasyfork.org/zh-CN/scripts/440339) |
| 微信读书网页版标注笔记快捷键 | [Ernest Lee](https://greasyfork.org/zh-CN/users/1340338-ernest-lee) | [Greasyfork](https://greasyfork.org/zh-CN/scripts/497926) |

## 功能特性

### 阅读体验（来自 Velens）

- **护眼背景色** - 9种可选（豆沙绿、杏仁黄等）
- **宽屏模式** - 更大的阅读区域
- **沉浸模式** - 隐藏顶栏，专注阅读
- **自动翻页** - 小键盘0开启/关闭

### 快捷标注（来自 Ernest Lee）

- 数字键快速标注，告别繁琐点击
- 注：1-5 和 Backspace 快捷键不建议修改

### 笔记同步（新增）

- 支持 Flomo / Notion / Obsidian / Webhook
- 摘抄和想法使用独立模板
- 点击发表自动同步想法到 Flomo

## 安装

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
2. 点击下方链接安装脚本：

**[直接安装](https://raw.githubusercontent.com/zhangyu0806/weread-enhanced/main/weread-enhanced.user.js)**

## 设置说明

### 打开设置面板

- 鼠标移到屏幕右边缘（可关闭）
- 按 `Ctrl+,` 快捷键

### 自定义快捷键

所有快捷键都可在设置面板中修改，点击后按下新组合键即可。

### 获取 Flomo API

Flomo → 设置 → API → 复制地址 → 粘贴到设置面板

## 模板设置

### 摘抄模板

快捷键发送划线时使用。

可用变量：`{{selectedText}}`, `{{bookName}}`, `{{chapter}}`, `{{tags}}`

### 想法模板

点击发表时使用。

可用变量：`{{selectedText}}`, `{{thought}}`, `{{bookName}}`, `{{chapter}}`, `{{tags}}`

### 层级标签

想要 `#书摘/书名` 这样的层级标签？

- 标签填：`#书摘`
- 模板填：`{{tags}}/{{bookName}}`

## 许可证

MIT License

## 反馈

如有问题或建议，欢迎提交 [Issue](https://github.com/zhangyu0806/weread-enhanced/issues)。
