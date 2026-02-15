# FindSkills UI 修改记录

本文件记录 UI 优化内容，便于后续协助工作与协作。

---

## 2026-02-15

### 1. 技能卡片宽度不一致修复

**问题描述：**
- DOM Path: `main.main > div#skills-grid > article.skill-card`
- 三列布局时，最右侧卡片宽度（345px）与左侧两个卡片（693px 等）不一致
- 要求每个卡片宽度相等

**修改内容：**
- 将 `.skills-grid` 的 `grid-template-columns` 从 `repeat(N, 1fr)` 改为 `repeat(N, minmax(0, 1fr))`，确保网格列等分且不受内容影响
- 为 `.skill-card` 添加 `min-width: 0`，允许卡片在 flex 布局中正确收缩

**涉及文件：** `index.html`（CSS 部分）

---

### 2. Header 标题替换为 Logo

**问题描述：**
- DOM Path: `header.header > h1`
- 原为文字 "FindSkills"，需替换为品牌 Logo

**修改内容：**
- 将 `<h1>FindSkills</h1>` 替换为 `<img>` 引用 Logo
- 使用深色背景版本：`assets/findskills_logo_dark_background.svg`（适配当前深色主题）
- Logo 文件已放入 `assets/` 目录：
  - `findskills_logo_dark_background.svg` - 深色背景用（白字+橙色图标）
  - `findskills_logo_light_background.svg` - 浅色背景用
  - `findskills_logo.svg` - 仅图标版本

**涉及文件：** `index.html`（HTML 部分）

---

### 3. Header Logo 放大 200%

**问题描述：**
- DOM Path: `header.header > h1.header-logo`
- Logo 尺寸较小，需放大 200%

**修改内容：**
- 将 `.header-logo img` 的 `height` 从 `3rem` 调整为 `6rem`（放大一倍）

**涉及文件：** `index.html`（CSS 部分）

---

### 4. 搜索模块改为右上角放大镜图标

**问题描述：**
- DOM Path: `header.header > div.search-container`
- 原为居中大搜索框，需改为右上角放大镜图标

**修改内容：**
- 移除 header 内居中搜索容器
- 在 header 右上角添加放大镜图标按钮（`.search-trigger`）
- 点击图标打开全屏搜索遮罩（`.search-overlay`），含搜索输入框和关闭按钮
- 支持点击遮罩背景或按 ESC 关闭

**涉及文件：** `index.html`（HTML、CSS、JS）

---

### 5. 添加 Favicon

**修改内容：**
- 在 `<head>` 中添加 favicon，使用 `assets/findskills_logo.svg`（橙色 claw 图标）

**涉及文件：** `index.html`

---

### 6. 严格遵循 design-system.json 重构全站 UI

**修改内容：**
- 将 design/design-system.json 设计 tokens 映射为 CSS 变量（品牌色、浅色主题、字体、间距、圆角、阴影）
- 浅色主题：背景 light-surface，卡片 light-elevated，品牌色 #FF9667
- 字体：Inter（Google Fonts）
- 卡片：rounded-lg，shadow-sm / hover shadow-md
- 徽章：clawhub→featured (brand)，github→info，manual→neutral
- 链接/强调色：从蓝色改为品牌珊瑚色
- 搜索遮罩：light 主题样式，focus shadow-focus-brand
- Logo 切换为 findskills_logo_light_background.svg（适配浅色背景）
- 新增 .cursor/rules/design-system.mdc：后续功能和页面必须遵循设计规范

**涉及文件：** `index.html`、`.cursor/rules/design-system.mdc`

---

### 7. 添加 Google Analytics

**修改内容：**
- 在 `<head>` 中添加 Google Analytics (gtag.js)，ID: G-VRT60PZK0Q

**涉及文件：** `index.html`

---
