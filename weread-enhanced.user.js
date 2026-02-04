// ==UserScript==
// @name         微信读书增强
// @name:en      WeRead Enhanced
// @icon         https://weread.qq.com/favicon.ico
// @namespace    https://github.com/zhangyu0806/weread-enhanced
// @version      3.4.3
// @description  微信读书网页版增强：护眼背景色、宽屏模式、自动翻页、沉浸阅读、快捷键标注（1复制/2马克笔/3波浪线/4直线/5想法）、一键发送到Flomo/Notion/Obsidian
// @description:en WeRead web enhancement: eye-care background, wide mode, auto page turn, immersive reading, hotkeys for annotations, sync to Flomo/Notion/Obsidian
// @author       zhangyu0806
// @match        https://weread.qq.com/web/reader/*
// @license      MIT
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @connect      *
// @homepageURL  https://github.com/zhangyu0806/weread-enhanced
// @supportURL   https://github.com/zhangyu0806/weread-enhanced/issues
// ==/UserScript==

console.log('[微信读书增强] 脚本开始执行');

const colors = [
    {title:"豆沙绿", rgb:"#C7EDCC"},
    {title:"杏仁黄", rgb:"#FAF9DE"},
    {title:"秋叶褐", rgb:"#FFF2E2"},
    {title:"胭脂红", rgb:"#FDE6E0"},
    {title:"海天蓝", rgb:"#DCE2F1"},
    {title:"葛巾紫", rgb:"#E9EBFE"},
    {title:"极光灰", rgb:"#EAEAEF"},
    {title:"青草绿", rgb:"#E3EDCD"},
    {title:"银河白", rgb:"#FFFFFF"}
];

const widths = [
    {title:"满列", width:"100%"},
    {title:"宽列", width:"80%"},
    {title:"默认", width:""}
];

let colorIndex = GM_getValue("colorIndex", 0);
let widthIndex = GM_getValue("widthIndex", 2);
let immersiveMode = GM_getValue("immersiveMode", false);
let spacePageEnabled = GM_getValue("spacePageEnabled", true);
let autoReadEnabled = GM_getValue("autoReadEnabled", false);
let flomoTags = GM_getValue("flomoTags", "#书摘");
let flomoTemplate = GM_getValue("flomoTemplate", "{{tags}} #{{bookName}}\n\n{{selectedText}}\n\n💭 {{thought}}");
let flomoApiUrl = GM_getValue("flomoApiUrl", "");

let autoReadTimer = null;
let autoReadSpeed = GM_getValue("autoReadSpeed", 1);

let notionEnabled = GM_getValue("notionEnabled", false);
let notionApiKey = GM_getValue("notionApiKey", "");
let notionDatabaseId = GM_getValue("notionDatabaseId", "");

let obsidianEnabled = GM_getValue("obsidianEnabled", false);
let obsidianVault = GM_getValue("obsidianVault", "");

let webhookEnabled = GM_getValue("webhookEnabled", false);
let webhookUrl = GM_getValue("webhookUrl", "");

let panelTriggerMode = GM_getValue("panelTriggerMode", "edge");

const defaultHotkeys = {
    sendToFlomo: { key: 'KeyJ', ctrl: true, shift: true, alt: true, meta: false },
    sendToNotion: { key: 'KeyN', ctrl: true, shift: true, alt: true, meta: false },
    sendToObsidian: { key: 'KeyO', ctrl: true, shift: true, alt: true, meta: false },
    sendToWebhook: { key: 'KeyW', ctrl: true, shift: true, alt: true, meta: false },
    copyFormatted: { key: 'KeyC', ctrl: true, shift: true, alt: false, meta: false },
    underlineStraight: { key: 'Digit4', ctrl: false, shift: false, alt: false, meta: false },
    underlineBg: { key: 'Digit2', ctrl: false, shift: false, alt: false, meta: false },
    underlineWave: { key: 'Digit3', ctrl: false, shift: false, alt: false, meta: false },
    writeThought: { key: 'Digit5', ctrl: false, shift: false, alt: false, meta: false },
    copyText: { key: 'Digit1', ctrl: false, shift: false, alt: false, meta: false },
    deleteUnderline: { key: 'Backspace', ctrl: false, shift: false, alt: false, meta: false },
    togglePanel: { key: 'Comma', ctrl: true, shift: false, alt: false, meta: false },
};

let hotkeys = GM_getValue("hotkeys", defaultHotkeys);
Object.keys(defaultHotkeys).forEach(k => { if (!hotkeys[k]) hotkeys[k] = defaultHotkeys[k]; });

const hotkeyLabels = {
    sendToFlomo: '发送到 Flomo',
    sendToNotion: '发送到 Notion',
    sendToObsidian: '发送到 Obsidian',
    sendToWebhook: '发送到 Webhook',
    copyFormatted: '复制格式化',
    underlineStraight: '直线',
    underlineBg: '马克笔',
    underlineWave: '波浪线',
    writeThought: '写想法',
    copyText: '复制',
    deleteUnderline: '删除划线',
    togglePanel: '设置面板',
};

function formatHotkey(hk) {
    const parts = [];
    if (hk.ctrl) parts.push('Ctrl');
    if (hk.alt) parts.push('Alt');
    if (hk.shift) parts.push('Shift');
    if (hk.meta) parts.push('Cmd');
    parts.push(hk.key.replace('Key', '').replace('Digit', ''));
    return parts.join('+');
}

function matchHotkey(e, hk) {
    return e.code === hk.key && e.ctrlKey === hk.ctrl && e.altKey === hk.alt && e.shiftKey === hk.shift && e.metaKey === hk.meta;
}

function applyBackgroundColor() {
    const color = colors[colorIndex].rgb;
    const colorTitle = colors[colorIndex].title;
    const widthTitle = widths[widthIndex].title;
    
    if (colorTitle === "银河白") return;
    
    GM_addStyle(`
        .wr_whiteTheme .readerContent .app_content,
        .wr_whiteTheme .readerTopBar,
        .wr_whiteTheme .readerControls,
        .wr_whiteTheme .readerControls_fontSize,
        .wr_whiteTheme .readerControls_item,
        .wr_whiteTheme .readerChapterContent,
        .wr_whiteTheme .readerChapterContent_container,
        .wr_whiteTheme .app_content,
        .wr_whiteTheme button.readerControls_item,
        .wr_whiteTheme .readerControls button,
        .wr_whiteTheme .readerControls_item.button {
            background-color: ${color} !important;
            background: ${color} !important;
        }
        .readerChapterContent { color: #000000CC !important; }
        .wr_whiteTheme .readerContent .app_content { box-shadow: none !important; }
    `);
    
    if (widthTitle !== "满列") {
        GM_addStyle(`.wr_page_reader.wr_whiteTheme { background: linear-gradient(#0000000d,#0000000d), ${color} !important; }`);
    } else {
        GM_addStyle(`.wr_page_reader.wr_whiteTheme { background-color: ${color} !important; }`);
    }
    
    GM_addStyle(`
        body.wr_whiteTheme { background-color: ${color} !important; }
        .wr_whiteTheme .readerFooter_button { background-color: ${color} !important; }
        body.wr_whiteTheme::-webkit-scrollbar { background-color: ${color}; }
    `);
}

function applyWidth() {
    const w = widths[widthIndex];
    if (w.width) {
        GM_addStyle(`
            .readerContent .app_content, .readerTopBar { max-width: ${w.width} !important; }
        `);
    }
}

function applyImmersiveMode() {
    if (immersiveMode) {
        GM_addStyle(`
            .readerTopBar, .readerControls { opacity: 0; transition: opacity 0.3s; }
            .readerTopBar:hover, .readerControls:hover { opacity: 1; }
        `);
    }
}

function nextPage() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', keyCode: 39 }));
}

function startAutoRead() {
    if (autoReadTimer) return;
    autoReadTimer = setInterval(() => {
        window.scrollBy(0, autoReadSpeed);
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight - 10;
        if (scrollTop >= scrollHeight) {
            nextPage();
        }
    }, 20);
}

function stopAutoRead() {
    if (autoReadTimer) {
        clearInterval(autoReadTimer);
        autoReadTimer = null;
    }
}

function getBookInfo() {
    const bookName = document.querySelector('.readerTopBar_title_link')?.textContent?.trim() || '未知书籍';
    const chapter = document.querySelector('.readerTopBar_title_chapter')?.textContent?.trim() || '';
    return { bookName, chapter };
}

function getSelectedText() {
    return window.getSelection()?.toString()?.trim() || '';
}

function showToast(msg) {
    let toast = document.getElementById('wr-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'wr-toast';
        toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#fff;padding:10px 20px;border-radius:4px;z-index:99999;';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 2000);
}

function processTemplate(template, data) {
    return template
        .replace(/\{\{selectedText\}\}/g, data.selectedText || '')
        .replace(/\{\{thought\}\}/g, data.thought || '')
        .replace(/\{\{bookName\}\}/g, data.bookName || '')
        .replace(/\{\{chapter\}\}/g, data.chapter || '')
        .replace(/\{\{tags\}\}/g, flomoTags);
}

function clickToolbarButton(selector) {
    const btn = document.querySelector(selector);
    if (btn) {
        btn.click();
        return true;
    }
    return false;
}

function isReviewPanelOpen() {
    const textarea = document.querySelector('.writeReview_textarea');
    if (!textarea) return false;
    const rect = textarea.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}

GM_registerMenuCommand("背景色：" + colors[colorIndex].title, () => {
    colorIndex = (colorIndex + 1) % colors.length;
    GM_setValue("colorIndex", colorIndex);
    location.reload();
});

GM_registerMenuCommand("宽度：" + widths[widthIndex].title, () => {
    widthIndex = (widthIndex + 1) % widths.length;
    GM_setValue("widthIndex", widthIndex);
    location.reload();
});

GM_registerMenuCommand("空格翻页：" + (spacePageEnabled ? "开启" : "关闭"), () => {
    spacePageEnabled = !spacePageEnabled;
    GM_setValue("spacePageEnabled", spacePageEnabled);
    location.reload();
});

GM_registerMenuCommand("自动阅读：" + (autoReadEnabled ? "开启" : "关闭"), () => {
    autoReadEnabled = !autoReadEnabled;
    GM_setValue("autoReadEnabled", autoReadEnabled);
    if (autoReadEnabled) {
        startAutoRead();
    } else {
        stopAutoRead();
    }
    location.reload();
});

GM_registerMenuCommand("阅读模式：" + (immersiveMode ? "沉浸式" : "默认"), () => {
    immersiveMode = !immersiveMode;
    GM_setValue("immersiveMode", immersiveMode);
    location.reload();
});

GM_registerMenuCommand("Flomo标签：" + flomoTags, () => {
    const newTags = prompt("请输入Flomo标签（如 #书摘）", flomoTags);
    if (newTags !== null) {
        flomoTags = newTags;
        GM_setValue("flomoTags", flomoTags);
    }
});

GM_registerMenuCommand("自动阅读速度：" + autoReadSpeed, () => {
    const newSpeed = prompt("请输入滚动速度（像素/20ms，默认1）", autoReadSpeed);
    if (newSpeed !== null && !isNaN(newSpeed)) {
        autoReadSpeed = parseInt(newSpeed);
        GM_setValue("autoReadSpeed", autoReadSpeed);
    }
});

GM_registerMenuCommand("Notion：" + (notionEnabled ? "开启" : "关闭"), () => {
    notionEnabled = !notionEnabled;
    GM_setValue("notionEnabled", notionEnabled);
    if (notionEnabled && !notionApiKey) {
        const key = prompt("请输入 Notion API Key");
        if (key) {
            notionApiKey = key;
            GM_setValue("notionApiKey", notionApiKey);
        }
        const dbId = prompt("请输入 Notion Database ID");
        if (dbId) {
            notionDatabaseId = dbId;
            GM_setValue("notionDatabaseId", notionDatabaseId);
        }
    }
});

GM_registerMenuCommand("Obsidian：" + (obsidianEnabled ? "开启" : "关闭"), () => {
    obsidianEnabled = !obsidianEnabled;
    GM_setValue("obsidianEnabled", obsidianEnabled);
    if (obsidianEnabled && !obsidianVault) {
        const vault = prompt("请输入 Obsidian Vault 名称");
        if (vault) {
            obsidianVault = vault;
            GM_setValue("obsidianVault", obsidianVault);
        }
    }
});

GM_registerMenuCommand("Webhook：" + (webhookEnabled ? "开启" : "关闭"), () => {
    webhookEnabled = !webhookEnabled;
    GM_setValue("webhookEnabled", webhookEnabled);
    if (webhookEnabled && !webhookUrl) {
        const url = prompt("请输入 Webhook URL");
        if (url) {
            webhookUrl = url;
            GM_setValue("webhookUrl", webhookUrl);
        }
    }
});

function sendToFlomo(text, bookInfo) {
    if (!flomoApiUrl) {
        showToast("请先在设置面板配置 Flomo API URL");
        return;
    }
    const content = processTemplate(flomoTemplate, { selectedText: text, ...bookInfo });
    showToast("正在发送到 Flomo...");
    GM_xmlhttpRequest({
        method: "POST",
        url: flomoApiUrl,
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ content: content }),
        onload: (res) => {
            if (res.status >= 200 && res.status < 300) {
                showToast("已发送到 Flomo");
            } else {
                showToast("Flomo 发送失败: " + res.status);
            }
        },
        onerror: () => showToast("Flomo 网络错误")
    });
}

function sendToNotion(text, bookInfo) {
    if (!notionApiKey || !notionDatabaseId) {
        showToast("请先配置 Notion API Key 和 Database ID");
        return;
    }
    showToast("正在发送到 Notion...");
    GM_xmlhttpRequest({
        method: "POST",
        url: "https://api.notion.com/v1/pages",
        headers: {
            "Authorization": "Bearer " + notionApiKey,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28"
        },
        data: JSON.stringify({
            parent: { database_id: notionDatabaseId },
            properties: {
                Name: { title: [{ text: { content: bookInfo.bookName } }] }
            },
            children: [{
                object: "block",
                type: "paragraph",
                paragraph: { rich_text: [{ text: { content: text + "\n\n——《" + bookInfo.bookName + "》" + bookInfo.chapter } }] }
            }]
        }),
        onload: (res) => {
            if (res.status >= 200 && res.status < 300) {
                showToast("已发送到 Notion");
            } else {
                showToast("Notion 发送失败: " + res.status);
            }
        },
        onerror: () => showToast("Notion 网络错误")
    });
}

function sendToObsidian(text, bookInfo) {
    if (!obsidianVault) {
        showToast("请先配置 Obsidian Vault 名称");
        return;
    }
    const content = "> " + text + "\n> ——《" + bookInfo.bookName + "》" + bookInfo.chapter;
    const uri = "obsidian://new?vault=" + encodeURIComponent(obsidianVault) + "&content=" + encodeURIComponent(content) + "&append=true";
    window.open(uri, "_self");
    showToast("已发送到 Obsidian");
}

function sendToWebhook(text, bookInfo) {
    if (!webhookUrl) {
        showToast("请先配置 Webhook URL");
        return;
    }
    showToast("正在发送到 Webhook...");
    GM_xmlhttpRequest({
        method: "POST",
        url: webhookUrl,
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({
            text: text,
            book: bookInfo.bookName,
            chapter: bookInfo.chapter,
            url: window.location.href
        }),
        onload: () => showToast("Webhook 发送成功"),
        onerror: () => showToast("Webhook 发送失败")
    });
}

GM_addStyle(`
    #wr-edge-trigger {
        position: fixed;
        right: 0;
        top: 0;
        width: 8px;
        height: 100vh;
        z-index: 99998;
    }
    #wr-panel {
        position: fixed;
        right: -340px;
        top: 0;
        width: 320px;
        height: 100vh;
        background: #fff;
        border-left: 1px solid #e0e0e0;
        box-shadow: -4px 0 20px rgba(0,0,0,0.1);
        z-index: 99999;
        transition: right 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        overflow-y: auto;
    }
    #wr-panel.open { right: 0; }
    .wr-panel-header {
        padding: 16px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: sticky;
        top: 0;
        background: #fff;
    }
    .wr-panel-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
    .wr-panel-close { cursor: pointer; font-size: 20px; color: #999; }
    .wr-panel-close:hover { color: #333; }
    .wr-panel-content { padding: 16px; }
    .wr-section { margin-bottom: 20px; }
    .wr-section-title {
        font-size: 12px;
        color: #999;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    .wr-hotkey-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f5f5f5;
    }
    .wr-hotkey-label { font-size: 13px; color: #333; }
    .wr-hotkey-value {
        font-size: 12px;
        background: #e8e8e8;
        color: #333;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        min-width: 80px;
        text-align: center;
        transition: all 0.2s;
        border: 1px solid #ccc;
    }
    .wr-hotkey-value:hover { background: #d8d8d8; }
    .wr-hotkey-value.recording { background: #1890ff; color: #fff; }
    .wr-input-group { margin-bottom: 12px; }
    .wr-input-group label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
    .wr-input-group input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 13px;
        box-sizing: border-box;
    }
    .wr-input-group input:focus { border-color: #1890ff; outline: none; }
    .wr-input-group select {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 13px;
        box-sizing: border-box;
        background: #fff;
    }
    .wr-help-link {
        font-size: 11px;
        color: #1890ff;
        text-decoration: none;
        margin-left: 8px;
        font-weight: normal;
        text-transform: none;
        letter-spacing: 0;
    }
    .wr-help-link:hover { text-decoration: underline; }
    .wr-help-text {
        font-size: 11px;
        color: #999;
        margin-bottom: 10px;
        line-height: 1.5;
    }
    .wr-guide {
        background: #f8f9fa;
        border-radius: 6px;
        padding: 0 !important;
        margin-bottom: 16px !important;
    }
    .wr-guide-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 12px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        color: #333;
    }
    .wr-guide-header:hover { background: #f0f0f0; border-radius: 6px; }
    .wr-guide-arrow { font-size: 10px; color: #999; transition: transform 0.2s; }
    .wr-guide.collapsed .wr-guide-arrow { transform: rotate(-90deg); }
    .wr-guide-content {
        padding: 0 12px 12px;
        font-size: 12px;
        color: #666;
        line-height: 1.6;
    }
    .wr-guide-content p { margin: 4px 0; }
    .wr-guide.collapsed .wr-guide-content { display: none; }
    #wr-edge-trigger.hidden { display: none; }
`);

function createPanel() {
    const trigger = document.createElement('div');
    trigger.id = 'wr-edge-trigger';
    if (panelTriggerMode === 'hidden') trigger.classList.add('hidden');
    document.body.appendChild(trigger);

    const panel = document.createElement('div');
    panel.id = 'wr-panel';
    
    let hotkeyHTML = '';
    Object.keys(hotkeys).forEach(name => {
        hotkeyHTML += `
            <div class="wr-hotkey-item">
                <span class="wr-hotkey-label">${hotkeyLabels[name] || name}</span>
                <span class="wr-hotkey-value" data-name="${name}">${formatHotkey(hotkeys[name])}</span>
            </div>
        `;
    });

    panel.innerHTML = `
        <div class="wr-panel-header">
            <h3>设置</h3>
            <span class="wr-panel-close">×</span>
        </div>
        <div class="wr-panel-content">
            <div class="wr-section wr-guide">
                <div class="wr-guide-header" id="wr-guide-toggle">
                    <span>使用说明</span>
                    <span class="wr-guide-arrow">▼</span>
                </div>
                <div class="wr-guide-content" id="wr-guide-content">
                    <p><b>快捷标注（选中文字后）：</b></p>
                    <p>• 1 复制 / 2 马克笔 / 3 波浪线 / 4 直线 / 5 写想法</p>
                    <p>• Backspace 删除划线/想法</p>
                    <p>• Ctrl+Enter 提交想法（自动同步Flomo）</p>
                    <p>• Esc 关闭想法弹窗</p>
                    <p><b>笔记同步：</b></p>
                    <p>• Ctrl+Shift+Alt+J 发送到 Flomo</p>
                    <p>• Ctrl+Shift+Alt+N 发送到 Notion</p>
                    <p>• Ctrl+Shift+Alt+O 发送到 Obsidian</p>
                    <p>• Ctrl+Shift+Alt+W 发送到 Webhook</p>
                    <p><b>其他：</b></p>
                    <p>• Ctrl+, 打开设置面板</p>
                    <p>• 小键盘0 自动阅读开关</p>
                </div>
            </div>
            <div class="wr-section">
                <div class="wr-section-title">面板触发方式</div>
                <div class="wr-input-group">
                    <select id="wr-trigger-mode">
                        <option value="edge" ${panelTriggerMode === 'edge' ? 'selected' : ''}>鼠标移到右边缘</option>
                        <option value="hidden" ${panelTriggerMode === 'hidden' ? 'selected' : ''}>完全隐藏 (仅快捷键)</option>
                    </select>
                </div>
                <div class="wr-hotkey-item">
                    <span class="wr-hotkey-label">打开设置面板</span>
                    <span class="wr-hotkey-value" data-name="togglePanel">${formatHotkey(hotkeys.togglePanel)}</span>
                </div>
            </div>
            <div class="wr-section">
                <div class="wr-section-title">Flomo <a href="https://flomoapp.com/mine?source=incoming_webhook" target="_blank" class="wr-help-link">获取 API</a></div>
                <div class="wr-help-text">登录 Flomo → 设置 → API → 复制 webhook 地址</div>
                <div class="wr-input-group">
                    <label>API URL</label>
                    <input type="text" id="wr-flomo-api" value="${flomoApiUrl}" placeholder="https://flomoapp.com/iwh/...">
                </div>
                <div class="wr-input-group">
                    <label>标签 (发送时自动添加)</label>
                    <input type="text" id="wr-flomo-tags" value="${flomoTags}" placeholder="#书摘">
                </div>
                <div class="wr-input-group">
                    <label>模板 (可用: {{tags}}, {{bookName}}, {{chapter}}, {{selectedText}}, {{thought}})</label>
                    <input type="text" id="wr-flomo-template" value="${flomoTemplate.replace(/\n/g, '\\n')}">
                </div>
            </div>
            <div class="wr-section">
                <div class="wr-section-title">Notion <a href="https://www.notion.so/my-integrations" target="_blank" class="wr-help-link">创建 Integration</a></div>
                <div class="wr-help-text">1. 创建 Integration 获取 API Key<br>2. 在数据库页面 Share → 邀请该 Integration<br>3. 复制数据库链接中的 ID</div>
                <div class="wr-input-group">
                    <label>API Key</label>
                    <input type="password" id="wr-notion-key" value="${notionApiKey}" placeholder="secret_...">
                </div>
                <div class="wr-input-group">
                    <label>Database ID</label>
                    <input type="text" id="wr-notion-db" value="${notionDatabaseId}" placeholder="32位字符串">
                </div>
            </div>
            <div class="wr-section">
                <div class="wr-section-title">Obsidian</div>
                <div class="wr-help-text">通过 obsidian:// 协议发送，需安装 Obsidian 桌面版</div>
                <div class="wr-input-group">
                    <label>Vault 名称 (区分大小写)</label>
                    <input type="text" id="wr-obsidian-vault" value="${obsidianVault}" placeholder="MyVault">
                </div>
            </div>
            <div class="wr-section">
                <div class="wr-section-title">Webhook</div>
                <div class="wr-help-text">发送 JSON: {text, book, chapter, url}</div>
                <div class="wr-input-group">
                    <label>URL</label>
                    <input type="text" id="wr-webhook-url" value="${webhookUrl}" placeholder="https://...">
                </div>
            </div>
            <div class="wr-section">
                <div class="wr-section-title">快捷键 (点击修改)</div>
                ${hotkeyHTML}
            </div>
        </div>
    `;
    document.body.appendChild(panel);

    document.getElementById('wr-guide-toggle').onclick = () => {
        document.querySelector('.wr-guide').classList.toggle('collapsed');
    };

    if (panelTriggerMode === 'edge') {
        trigger.addEventListener('mouseenter', () => panel.classList.add('open'));
    }
    panel.addEventListener('mouseleave', (e) => {
        if (!panel.contains(e.relatedTarget)) panel.classList.remove('open');
    });
    panel.querySelector('.wr-panel-close').onclick = () => panel.classList.remove('open');

    document.getElementById('wr-trigger-mode').onchange = (e) => {
        panelTriggerMode = e.target.value;
        GM_setValue("panelTriggerMode", panelTriggerMode);
        location.reload();
    };

    document.getElementById('wr-flomo-api').onchange = (e) => {
        flomoApiUrl = e.target.value;
        GM_setValue("flomoApiUrl", flomoApiUrl);
    };
    document.getElementById('wr-flomo-tags').onchange = (e) => {
        flomoTags = e.target.value;
        GM_setValue("flomoTags", flomoTags);
    };
    document.getElementById('wr-flomo-template').onchange = (e) => {
        flomoTemplate = e.target.value.replace(/\\n/g, '\n');
        GM_setValue("flomoTemplate", flomoTemplate);
    };
    document.getElementById('wr-notion-key').onchange = (e) => {
        notionApiKey = e.target.value;
        GM_setValue("notionApiKey", notionApiKey);
        notionEnabled = !!notionApiKey;
        GM_setValue("notionEnabled", notionEnabled);
    };
    document.getElementById('wr-notion-db').onchange = (e) => {
        notionDatabaseId = e.target.value;
        GM_setValue("notionDatabaseId", notionDatabaseId);
    };
    document.getElementById('wr-obsidian-vault').onchange = (e) => {
        obsidianVault = e.target.value;
        GM_setValue("obsidianVault", obsidianVault);
        obsidianEnabled = !!obsidianVault;
        GM_setValue("obsidianEnabled", obsidianEnabled);
    };
    document.getElementById('wr-webhook-url').onchange = (e) => {
        webhookUrl = e.target.value;
        GM_setValue("webhookUrl", webhookUrl);
        webhookEnabled = !!webhookUrl;
        GM_setValue("webhookEnabled", webhookEnabled);
    };

    panel.querySelectorAll('.wr-hotkey-value').forEach(el => {
        el.onclick = () => {
            const name = el.dataset.name;
            el.textContent = '按键...';
            el.classList.add('recording');
            
            const handler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;
                
                hotkeys[name] = {
                    key: e.code,
                    ctrl: e.ctrlKey,
                    alt: e.altKey,
                    shift: e.shiftKey,
                    meta: e.metaKey
                };
                GM_setValue("hotkeys", hotkeys);
                el.textContent = formatHotkey(hotkeys[name]);
                el.classList.remove('recording');
                document.removeEventListener('keydown', handler, true);
            };
            document.addEventListener('keydown', handler, true);
        };
    });
}

function togglePanel() {
    const panel = document.getElementById('wr-panel');
    if (panel) panel.classList.toggle('open');
}

applyBackgroundColor();
applyWidth();
applyImmersiveMode();
createPanel();

if (autoReadEnabled) {
    setTimeout(startAutoRead, 2000);
}

// 监听发表想法按钮点击，同步到 Flomo
document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.wr_btn.wr_btn_Big, .writeReview_submit_button, .reviewEditorControl_submit_button');
    if (!btn || !btn.innerText?.includes('发')) return;
    
    const textareas = document.querySelectorAll('.writeReview_textarea');
    let thoughtText = '';
    textareas.forEach(ta => {
        const rect = ta.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && ta.value?.trim()) {
            thoughtText = ta.value.trim();
        }
    });
    
    let selectedText = wrState.lastUnderlineText || '';
    
    // 如果没有保存的划线文字，尝试从剪贴板读取
    if (!selectedText) {
        try {
            const clipText = await navigator.clipboard.readText();
            if (clipText?.trim() && clipText.trim() !== thoughtText) {
                selectedText = clipText.trim();
            }
        } catch (e) {}
    }
    
    if (flomoApiUrl && (thoughtText || selectedText)) {
        const bookInfo = getBookInfo();
        sendToFlomo(selectedText, { ...bookInfo, thought: thoughtText });
        console.log('[WR] 点击发表，同步到 Flomo:', { selectedText, thoughtText });
    }
}, true);

const wrState = {
    selectedText: '',
    selectedRange: null,
    lastSelectedAt: 0,
    lastUnderlineText: '',
    buttons: {
        copy: null,
        underlineBg: null,
        underlineWave: null,
        underlineStraight: null,
        removeUnderline: null,
        review: null,
    },
};

function wrRestoreSelection() {
    const range = wrState.selectedRange;
    if (!range) return false;
    const sel = window.getSelection();
    if (!sel) return false;
    try {
        sel.removeAllRanges();
        sel.addRange(range);
        return true;
    } catch (_) {
        return false;
    }
}

function getToolbarBtn(type) {
    const selectors = {
        copy: '.toolbarItem.copy, .review_section_toolbar_item_copy',
        underlineBg: '.toolbarItem.underlineBg, .review_section_toolbar_item_underline[class*="Bg"], .review_section_toolbar_item_marker',
        underlineWave: '.toolbarItem.underlineHandWrite, .review_section_toolbar_item_underline[class*="Wave"], .review_section_toolbar_item_wave',
        underlineStraight: '.toolbarItem.underlineStraight, .review_section_toolbar_item_underline',
        removeUnderline: '.toolbarItem.removeUnderline, .review_section_toolbar_item_remove',
        review: '.toolbarItem.review, .review_section_toolbar_item_review'
    };
    return document.querySelector(selectors[type] || '');
}

function wrHasToolbar() {
    return !!(
        document.querySelector('.reader_toolbar_container') ||
        document.querySelector('.readerToolbar') ||
        document.querySelector('.review_section_toolbar_items_wrapper') ||
        getToolbarBtn('copy')
    );
}

function wrRefreshButtons() {
    wrState.buttons.copy = getToolbarBtn('copy');
    wrState.buttons.underlineBg = getToolbarBtn('underlineBg');
    wrState.buttons.underlineWave = getToolbarBtn('underlineWave');
    wrState.buttons.underlineStraight = getToolbarBtn('underlineStraight');
    wrState.buttons.removeUnderline = getToolbarBtn('removeUnderline');
    wrState.buttons.review = getToolbarBtn('review');
}

function wrRefreshSelection() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount < 1) return;
    const range = selection.getRangeAt(0);
    const text = range?.toString?.().trim?.() || '';
    if (!text) return;
    wrState.selectedText = text;
    try {
        wrState.selectedRange = range.cloneRange();
    } catch (_) {
        wrState.selectedRange = null;
    }
    wrState.lastSelectedAt = Date.now();
}

let wrRaf = 0;
function wrScheduleRefresh() {
    // 立即保存选区，避免快捷键触发时选区已被清除
    wrRefreshSelection();

    // 同时安排下一帧刷新按钮状态
    if (wrRaf) return;
    wrRaf = requestAnimationFrame(() => {
        wrRaf = 0;
        console.log('[WR] refreshed, selectedText:', wrState.selectedText);
        if (wrHasToolbar()) wrRefreshButtons();
    });
}

document.addEventListener('selectionchange', wrScheduleRefresh, true);
document.addEventListener('mouseup', wrScheduleRefresh, true);

function wrShouldIgnoreKeyEventTarget(target) {
    if (!target) return false;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;
    return false;
}

function wrIsActionKeyCode(keyCode) {
    return keyCode === 49 || keyCode === 50 || keyCode === 51 || keyCode === 52 || keyCode === 53 || keyCode === 8;
}

function wrHasNoModifiers(e) {
    return !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey;
}

function wrClickNextFrame(el) {
    if (!el) return false;
    requestAnimationFrame(() => el.click());
    return true;
}

// 微信读书用 Canvas 渲染文字，需要通过复制按钮获取选中内容
let lastCopiedText = '';

// 监听工具栏复制按钮点击
document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.toolbarItem.copy, .wr_copy, .review_section_toolbar_item_copy');
    if (copyBtn) {
        setTimeout(async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text?.trim()) {
                    lastCopiedText = text.trim();
                    wrState.lastUnderlineText = text.trim();
                    console.log('[WR] 复制按钮点击，保存文字:', lastCopiedText.slice(0, 50));
                }
            } catch (e) {
                console.log('[WR] 读取剪贴板失败:', e);
            }
        }, 100);
    }
}, true);

// 监听写想法按钮点击，先复制再打开
document.addEventListener('click', (e) => {
    const reviewBtn = e.target.closest('.toolbarItem.review, .review_section_toolbar_item_review');
    if (reviewBtn) {
        const copyBtn = document.querySelector('.toolbarItem.copy, .review_section_toolbar_item_copy');
        if (copyBtn) {
            copyBtn.click();
            setTimeout(async () => {
                try {
                    const text = await navigator.clipboard.readText();
                    if (text?.trim()) {
                        lastCopiedText = text.trim();
                        wrState.lastUnderlineText = text.trim();
                        console.log('[WR] 写想法前复制，保存文字:', lastCopiedText.slice(0, 50));
                    }
                } catch (e) {}
            }, 100);
        }
    }
}, true);

async function getSelectionViaClipboard() {
    const copyBtn = getToolbarBtn('copy') || document.querySelector('.wr_copy');
    if (!copyBtn) return '';
    
    lastCopiedText = '';
    copyBtn.click();
    
    await new Promise(r => setTimeout(r, 300));
    
    if (!lastCopiedText) {
        try {
            const text = await navigator.clipboard.readText();
            if (text?.trim()) lastCopiedText = text.trim();
        } catch (e) {}
    }
    
    return lastCopiedText;
}

function requireSelectionOrToast() {
    const hasToolbar = document.querySelector('.reader_toolbar_container') || 
                      document.querySelector('.readerToolbar');
    if (!hasToolbar) {
        showToast('请先选中文字');
        return false;
    }
    return true;
}

async function requireSelectionAsync() {
    const hasToolbar = document.querySelector('.reader_toolbar_container') || 
                      document.querySelector('.readerToolbar');
    if (!hasToolbar) {
        showToast('请先选中文字');
        return null;
    }
    
    const text = await getSelectionViaClipboard();
    if (!text) {
        showToast('获取选中文字失败');
        return null;
    }
    
    wrState.selectedText = text;
    return text;
}

console.log('[微信读书增强] 准备注册 keydown 监听器');

// Use window capture so we run before page handlers.
window.addEventListener('keydown', (e) => {
    console.log('[WR] keydown:', e.keyCode, e.code, 'ctrl:', e.ctrlKey, 'shift:', e.shiftKey, 'alt:', e.altKey);
    console.log('[WR] hotkeys.sendToFlomo:', JSON.stringify(hotkeys.sendToFlomo));
    
    const reviewOpen = isReviewPanelOpen();
    
    // 写想法面板打开时，处理 Ctrl+Enter 和 Esc
    if (reviewOpen) {
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 13) {
            e.preventDefault();
            e.stopImmediatePropagation();
            
            const textareas = document.querySelectorAll('.writeReview_textarea');
            let thoughtText = '';
            textareas.forEach(ta => {
                const rect = ta.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0 && ta.value?.trim()) {
                    thoughtText = ta.value.trim();
                }
            });
            
            const submitBtn = document.querySelector('.wr_btn.wr_btn_Big');
            if (submitBtn && submitBtn.innerText?.includes('发')) submitBtn.click();
            
            const selectedText = wrState.lastUnderlineText || '';
            
            if (flomoApiUrl && (thoughtText || selectedText)) {
                const bookInfo = getBookInfo();
                sendToFlomo(selectedText, { ...bookInfo, thought: thoughtText });
                console.log('[WR] Ctrl+Enter 发表，同步到 Flomo:', { selectedText, thoughtText });
            }
            return;
        } else if (e.keyCode === 27) {
            const closeBtn = document.querySelector('.reader_float_panel_header_closeBtn, .readerWriteReviewPanel .closeButton');
            if (closeBtn) closeBtn.click();
            return;
        }
    }
    
    if (wrShouldIgnoreKeyEventTarget(e.target)) {
        console.log('[WR] ignored target');
        return;
    }

    if (matchHotkey(e, hotkeys.togglePanel)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        togglePanel();
        return;
    }

    if (e.code === 'Space' && spacePageEnabled && !reviewOpen) {
        const scrollTop = document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight - 10;
        if (scrollTop >= scrollHeight) {
            e.preventDefault();
            e.stopImmediatePropagation();
            nextPage();
        }
    }

    if (wrHasNoModifiers(e) && wrIsActionKeyCode(e.keyCode)) {
        const toolbarReady = wrHasToolbar();
        console.log('[WR] keyCode:', e.keyCode, 'toolbarReady:', toolbarReady);
        if (toolbarReady) {
            e.preventDefault();
            e.stopImmediatePropagation();
            wrRefreshSelection();
            wrRestoreSelection();

            const keyCode = e.keyCode;
            if (keyCode === 49) {
                wrClickNextFrame(getToolbarBtn('copy'));
            } else if (keyCode === 50) {
                wrClickNextFrame(getToolbarBtn('underlineBg'));
            } else if (keyCode === 51) {
                wrClickNextFrame(getToolbarBtn('underlineWave'));
            } else if (keyCode === 52) {
                wrClickNextFrame(getToolbarBtn('underlineStraight'));
            } else if (keyCode === 53) {
                getSelectionViaClipboard().then(text => {
                    if (text) wrState.lastUnderlineText = text;
                });
                wrClickNextFrame(getToolbarBtn('review'));
            } else if (keyCode === 8) {
                wrClickNextFrame(getToolbarBtn('removeUnderline'));
                document.querySelector('.readerReviewDetail_item .actions .actionItem')?.click();
            }
            return;
        }
    }

    wrRefreshSelection();

    // Some WeRead handlers clear selection on keydown; restore from cache.
    wrRestoreSelection();

    const toolbarReady = wrHasToolbar();
    if (toolbarReady) wrRefreshButtons();

    const keyCode = e.keyCode;
    const hasCachedSelection = !!(wrState.selectedRange || wrState.selectedText);
    const shouldHandleActionKey = wrIsActionKeyCode(keyCode) && (toolbarReady || hasCachedSelection);

    if (shouldHandleActionKey) {
        e.preventDefault();
        e.stopImmediatePropagation();
        wrRestoreSelection();

        if (keyCode === 49) {
            wrClickNextFrame(wrState.buttons.copy || getToolbarBtn('copy'));
        } else if (keyCode === 50) {
            wrClickNextFrame(wrState.buttons.underlineBg || getToolbarBtn('underlineBg'));
        } else if (keyCode === 51) {
            wrClickNextFrame(wrState.buttons.underlineWave || getToolbarBtn('underlineWave'));
        } else if (keyCode === 52) {
            wrClickNextFrame(wrState.buttons.underlineStraight || getToolbarBtn('underlineStraight'));
        } else if (keyCode === 53) {
            getSelectionViaClipboard().then(text => {
                if (text) wrState.lastUnderlineText = text;
            });
            wrClickNextFrame(wrState.buttons.review || getToolbarBtn('review'));
        } else if (keyCode === 8) {
            wrClickNextFrame(wrState.buttons.removeUnderline || getToolbarBtn('removeUnderline'));
            document.querySelector('.readerReviewDetail_item .actions .actionItem')?.click();
        }
    }

    if (matchHotkey(e, hotkeys.sendToFlomo)) {
        console.log('[WR] matched sendToFlomo');
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!requireSelectionOrToast()) return;
        
        (async () => {
            const selectedText = await requireSelectionAsync();
            if (!selectedText) return;
            
            console.log('[WR] selectedText:', selectedText);
            const bookInfo = getBookInfo();
            const content = processTemplate(flomoTemplate, { selectedText, ...bookInfo });
            wrClickNextFrame(wrState.buttons.underlineStraight || getToolbarBtn('underlineStraight'));
            GM_setClipboard(content);
            sendToFlomo(selectedText, bookInfo);
        })();
    }

    if (matchHotkey(e, hotkeys.copyFormatted)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!requireSelectionOrToast()) return;
        
        (async () => {
            const selectedText = await requireSelectionAsync();
            if (!selectedText) return;
            
            const info = getBookInfo();
            const content = `${selectedText}\n\n——《${info.bookName}》${info.chapter}`;
            GM_setClipboard(content);
            showToast('已复制格式化文本');
        })();
    }

    if (matchHotkey(e, hotkeys.sendToNotion)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!requireSelectionOrToast()) return;
        
        (async () => {
            const selectedText = await requireSelectionAsync();
            if (!selectedText) return;
            
            const bookInfo = getBookInfo();
            const content = `${selectedText}\n\n——《${bookInfo.bookName}》${bookInfo.chapter}`;
            wrClickNextFrame(wrState.buttons.underlineStraight || getToolbarBtn('underlineStraight'));
            GM_setClipboard(content);
            sendToNotion(selectedText, bookInfo);
        })();
    }

    if (matchHotkey(e, hotkeys.sendToObsidian)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!requireSelectionOrToast()) return;
        
        (async () => {
            const selectedText = await requireSelectionAsync();
            if (!selectedText) return;
            
            const bookInfo = getBookInfo();
            const content = `${selectedText}\n\n——《${bookInfo.bookName}》${bookInfo.chapter}`;
            wrClickNextFrame(wrState.buttons.underlineStraight || getToolbarBtn('underlineStraight'));
            GM_setClipboard(content);
            sendToObsidian(selectedText, bookInfo);
        })();
    }

    if (matchHotkey(e, hotkeys.sendToWebhook)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!requireSelectionOrToast()) return;
        
        (async () => {
            const selectedText = await requireSelectionAsync();
            if (!selectedText) return;
            
            const bookInfo = getBookInfo();
            const content = `${selectedText}\n\n——《${bookInfo.bookName}》${bookInfo.chapter}`;
            wrClickNextFrame(wrState.buttons.underlineStraight || getToolbarBtn('underlineStraight'));
            GM_setClipboard(content);
            sendToWebhook(selectedText, bookInfo);
        })();
    }

    if (e.code === 'Numpad0') {
        if (autoReadTimer) {
            stopAutoRead();
            showToast('自动阅读已暂停');
        } else {
            startAutoRead();
            showToast('自动阅读已开始');
        }
    }
}, true);

console.log('[微信读书增强] 已加载 v3.3.0');
