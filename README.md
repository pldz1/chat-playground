# Chat Playground

一个本地优先的 AIGC Playground：前端用 Vue 3，后端用 FastAPI + SQLite，聊天与生图请求主要由浏览器直接调用 AI 提供商接口，本地 Python 服务负责账号、配置、会话、图片缓存和静态资源托管。

这份 README 以当前仓库代码为准，目标是同时服务于：

- 想直接跑起来的人
- 想二次开发的人
- 需要快速理解项目结构与边界的 AI / 开发助手

---

## 1. 现在这个项目到底是什么

它不是一个“后端代理所有大模型请求”的典型服务端产品，而是一个更接近本地工具的架构：

- 前端直接请求 OpenAI / Azure OpenAI / DeepSeek
- Python 后端只处理这个 Playground 自己的数据
- 聊天记录、模型配置、提示词模板、图片缓存都可以本地保存
- 没有 Python 服务时，前端还能自动退化到 `localStorage` mock backend

一句话概括：

> 浏览器负责 AI 请求，本地 FastAPI 负责本地数据。

---

## 2. 当前核心能力

### 聊天

- 多模型配置
- 支持 `OpenAI`、`Azure OpenAI`、`DeepSeek`
- 流式输出
- Markdown 渲染
- 会话列表、新建、重命名、删除
- 每个会话独立保存聊天参数
- 可配置的聊天参数面板

### 生图

- 多图像模型配置
- 生成后展示历史图片
- 删除图片
- 复制图片
- 保存到本地
- Python 后端模式下支持图片下载后写入 SQLite
- mock 模式下会把图片转成 `data:` URL 存进 `localStorage`

### 设置中心

- 独立 `/settings` 页面
- 管理聊天模型
- 管理图像模型
- 管理提示词模板
- 软件设置、导入导出、切换后端地址
- 自动保存

### 前端独立运行

- 无后端时自动 fallback 到 `localStorage`
- 支持纯前端开发
- 支持纯静态部署

### UI 基础能力

- 多语言（当前已接入中文 / 英文词条体系）
- 主题切换
- 通用浮层 tooltip / dropdown，使用 `Teleport` 避免被容器裁切

---

## 3. 真实架构

## 3.1 数据流

### 聊天链路

1. 用户在前端选择聊天模型
2. 前端根据当前模型配置构造 `AIGCClient`
3. 浏览器直接调用对应提供商接口
4. 流式内容在前端实时渲染
5. 会话、消息、参数配置再通过本地 API 保存

### 生图链路

1. 前端直接调用图像模型接口
2. 生成结果先进入前端状态
3. 后端模式下：
   - 前端请求 `/api/v1/image/pushImage`
   - Python 下载图片并写入 SQLite
4. mock 模式下：
   - 前端把图片抓成 `data:` URL
   - 写入 `localStorage`

## 3.2 这套设计的优点和代价

优点：

- 本地开发简单
- 新增模型配置快
- 后端代码较轻
- 前端可以脱离 Python 单独跑

代价：

- API Key 在浏览器环境中使用
- 不适合作为公网生产安全架构
- 后端无法统一代理、审计、限流所有模型请求

---

## 4. 技术栈

### 前端

- Vue 3
- Vue Router
- Vuex
- Vite
- TailwindCSS
- DaisyUI
- Vue I18n
- Axios
- `openai` JavaScript SDK
- `markdown-it`
- `highlight.js`

### 后端

- FastAPI
- Uvicorn
- aiosqlite
- aiohttp
- pywebview

### 数据存储

- SQLite
- `localStorage`（mock fallback 模式）

---

## 5. 目录结构

```text
chat-playground/
├─ README.md
├─ dev.py
├─ web/
│  ├─ package.json
│  ├─ vite.config.js
│  ├─ vite.mock.config.js
│  └─ src/
│     ├─ components/
│     ├─ constants/
│     ├─ i18n/
│     ├─ router/
│     ├─ services/
│     ├─ store/
│     ├─ utils/
│     └─ views/
└─ server/
   ├─ main.py
   ├─ dev.py
   ├─ config.json
   ├─ requirements.txt
   ├─ statics/
   ├─ win_webview.py
   └─ scripts/
      ├─ apis/
      ├─ database/
      ├─ libs/
      └─ typedefs/
```

运行后会自动生成：

- `server/.database/`
- `server/.cache/`
- `server/.bin/`

数据库通常包括：

- `user.db`
- `chat.db`
- `image.db`

---

## 6. 路由与页面

当前前端路由定义在 `web/src/router/index.js`：

- `/login`
- `/home`
- `/chat`
- `/image`
- `/settings`

### `/login`

- 默认用户名 / 密码：`admin / admin`
- 登录成功后进入 `/home`
- 如果后端不可达，页面会提示当前将使用本地存储模式

### `/home`

当前首页是入口页，不再承担复杂设置：

- Chat
- Image
- Settings

### `/chat`

- 左侧折叠式会话侧边栏
- 新建会话
- 会话切换
- 会话重命名 / 删除
- Markdown 聊天展示
- 动态聊天参数面板

### `/image`

- 选择图像模型
- 配置图像生成参数
- 展示历史图片
- 删除、保存、复制

### `/settings`

当前设置页不是弹窗，而是独立工作台页面。

包含四个分区：

- Prompt Templates
- Chat Models
- Image Models
- App

特征：

- 左侧 tab 导航
- 右侧内容区
- 自动保存状态提示
- 离开页面时会处理未保存中的情况

---

## 7. 模型配置机制

模型配置不是写死在后端的，而是保存在用户数据中。

当前模型数据结构核心定义位于：

- `web/src/constants/model.js`

基础结构：

```js
{
  name: "",
  apiType: "",
  baseURL: "",
  endpoint: "",
  apiKey: "",
  modelType: "",
  model: "",
  deployment: "",
  apiVersion: "",
  chatParamDefs: []
}
```

## 7.1 聊天模型

支持：

- `OpenAI`
- `Azure OpenAI`
- `DeepSeek`

当前 UI 以手动输入 `Model ID` 为主，建议项为辅。  
固定列表只是建议，不是限制。

当前内置建议模型包括：

- `gpt-5.4`
- `gpt-5.4-mini`
- `gpt-5.4-nano`
- `gpt-5`
- `gpt-5-mini`
- `gpt-5-nano`
- `gpt-4.1`
- `gpt-4.1-mini`
- `gpt-4.1-nano`
- `gpt-4o`
- `gpt-4o-mini`
- `o1`
- `o3`
- `o3-mini`
- `o4-mini`
- `deepseek-v3`
- `deepseek-r1`

## 7.2 图像模型

同样以手动输入为主，建议项包括：

- `gpt-image-1.5`
- `gpt-image-1`
- `gpt-image-1-mini`
- `chatgpt-image-latest`
- `dall-e-2`
- `dall-e-3`

## 7.3 现在最重要的变化：聊天参数由模型定义

`ChatSettings.vue` 不再靠硬编码判断“某个模型有没有 `max_tokens`”。  
现在由模型配置里的 `chatParamDefs` 决定聊天设置页显示哪些参数。

例如：

- `gpt-5.1` 不配置 `max_tokens`，聊天设置页就不显示
- `gpt-4.1` 配置了 `max_tokens:number`，聊天设置页就显示滑块 + 数字输入

参数类型当前支持：

- `number`
- `string`
- `array`
- `boolean`

表现方式：

- `number` -> 滑块 + 数值输入
- `string` -> 文本输入
- `array` -> 文本输入，按 JSON 数组解析
- `boolean` -> 开关

相关文件：

- `web/src/constants/model.js`
- `web/src/components/ModelEditCard.vue`
- `web/src/views/chat/ChatSettings.vue`

---

## 8. 设置页当前交互

当前设置页已经不是旧版“每张卡片单独编辑/保存”的模式，而是：

- 列表 + 详情编辑
- 统一工作台布局
- 自动保存

### Chat Models / Image Models

- 左侧模型列表
- 右侧当前模型详情
- 支持新增
- 支持复制
- 支持删除

### ModelEditCard

`web/src/components/ModelEditCard.vue` 当前主要分成三块：

- Connection
- Identity
- Chat Parameters（仅聊天模型）

聊天参数编辑器支持：

- 使用 preset 快速添加
- 自定义参数
- 单个参数折叠 / 展开
- 全部展开 / 全部折叠

---

## 9. mock / localStorage fallback

当前前端已经内置 mock backend。

核心实现：

- `web/src/services/api/axios-request.js`
- `web/src/services/api/mock-local-server.js`

行为：

1. 先请求真实 API
2. 如果服务不可达，或接口不存在，则切到 mock backend
3. mock backend 用 `localStorage` 模拟后端数据

触发 fallback 的典型场景包括：

- 网络不可达
- `404`
- `405`
- `501`
- `502`
- `503`
- `504`

mock 模式当前覆盖：

- 登录
- 模型配置读写
- 提示词模板读写
- 会话列表增删改查
- 消息读写
- 会话设置读写
- 图片列表读写

mock 数据会按用户分桶保存，并且当前用户登录状态也会持久化，所以刷新页面后不会丢失同一用户下的数据。

限制：

- `localStorage` 容量有限
- 更适合 demo / 纯前端开发 / 静态预览
- 不适合长期保存大量图片

---

## 10. 启动方式

## 10.1 前置要求

- Python 3.10+ 更稳妥
- Node.js 18+ 更稳妥
- npm

## 10.2 安装前端依赖

```bash
cd web
npm install
```

## 10.3 安装后端依赖

```bash
cd server
pip install -r requirements.txt
```

## 10.4 一键开发模式

根目录执行：

```bash
python dev.py
```

它会同时启动：

- `web` 下的 `npm run dev`
- `server/dev.py`

默认端口：

- 前端：`127.0.0.1:20090`
- 后端：`127.0.0.1:20088`

对应开发配置：

- `web/vite.config.js`

这个配置会把：

- `/api` -> `http://127.0.0.1:20088`

## 10.5 只跑前端 mock 开发

```bash
cd web
npm install
npm run dev:mock
```

对应配置：

- `web/vite.mock.config.js`

这个模式不会走 Vite 的 `/api` 代理，更适合验证 fallback / localStorage。

## 10.6 正常构建前端

```bash
cd web
npm run build
```

构建产物输出到：

```text
server/statics
```

然后启动后端：

```bash
cd server
python main.py
```

## 10.7 纯静态 mock 构建

```bash
cd web
npm run build:mock
```

产物输出到：

```text
web/dist
```

可以直接静态托管，例如：

```bash
cd web/dist
python -m http.server 20098 --bind 0.0.0.0
```

这种模式下若访问 `/api/...` 返回 `404/405/501` 等，前端会自动切到 `localStorage`。

---

## 11. 后端配置

配置文件：

```text
server/config.json
```

当前默认内容：

```json
{
  "host": "127.0.0.1",
  "port": 20088,
  "username": "admin",
  "password": "admin"
}
```

说明：

- `host` / `port`：本地 FastAPI 地址
- `username` / `password`：默认管理员账号

---

## 12. Python 在项目里的作用

Python 不是模型请求主链路的代理层，它现在主要承担：

- 本地 Web 服务
- 登录接口
- SQLite 持久化
- 图片下载与缓存
- 前端静态资源托管
- Windows `pywebview` 桌面封装

关键入口：

- `server/main.py`
- `server/dev.py`
- `server/win_webview.py`

数据库相关：

- `server/scripts/database/aio_user.py`
- `server/scripts/database/aio_chat.py`
- `server/scripts/database/aio_image.py`

API 路由相关：

- `server/scripts/apis/user.py`
- `server/scripts/apis/chat.py`
- `server/scripts/apis/image.py`

---

## 13. 主题、多语言与 UI

当前前端已经接入：

- 主题切换
- Vue I18n
- 中文 / 英文词条

相关文件：

- `web/src/i18n/index.js`
- `web/src/components/ThemeController.vue`
- `web/src/components/LanguageController.vue`
- `web/src/components/HeaderBar.vue`

当前通用头部已经在这些页面复用：

- `/home`
- `/chat`
- `/image`
- `/settings`

当前浮层体系已经统一到：

- `web/src/components/AppTooltip.vue`
- `web/src/components/AppDropdownMenu.vue`

它们通过 `Teleport` 到 `body` 渲染，避免被容器的 `overflow`、阴影或 stacking context 裁切。

---

## 14. Windows 桌面模式

```bash
cd server
python win_webview.py
```

行为：

- 后台启动 FastAPI
- 使用 `pywebview` 打开桌面窗口
- 接管网页中的部分桌面行为

另外还提供：

- `server/win_webview.spec`

用于打包。

---

## 15. 适合 AI 理解项目的阅读顺序

如果你是 AI / 新开发者，建议按这个顺序读：

1. `web/src/router/index.js`
2. `web/src/views/home/LoginPage.vue`
3. `web/src/views/home/HomePage.vue`
4. `web/src/views/chat/HomePage.vue`
5. `web/src/views/chat/SidebarCard.vue`
6. `web/src/views/chat/ChatCard.vue`
7. `web/src/views/chat/ChatSettings.vue`
8. `web/src/views/image/HomePage.vue`
9. `web/src/views/user/UserSettings.vue`
10. `web/src/components/ModelEditCard.vue`
11. `web/src/constants/model.js`
12. `web/src/services/aigc/aigc-cient.js`
13. `web/src/services/api/axios-request.js`
14. `web/src/services/api/mock-local-server.js`
15. `server/main.py`
16. `server/scripts/apis/*`
17. `server/scripts/database/*`

---

## 16. 已知边界

- 这不是安全的生产级公网站点架构
- 注册与权限体系并不完整
- 主题与 i18n 已接入主链路，但仍可能有个别深层文案未完全覆盖
- 前端构建体积当前偏大，Vite build 会出现 chunk size warning

---

## 17. 常用命令速查

```bash
# 一键开发
python dev.py

# 前端开发（真实后端）
cd web && npm run dev

# 前端开发（mock/localStorage）
cd web && npm run dev:mock

# 构建给 FastAPI 托管的前端
cd web && npm run build

# 构建纯静态 mock 版本
cd web && npm run build:mock

# 启动后端
cd server && python main.py

# 启动 Windows WebView
cd server && python win_webview.py
```
