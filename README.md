# CF-Server-Monitor-Pro

**版本：V1.3**

一个基于 Cloudflare Workers + D1 的多服务器监控探针系统，支持实时监控、历史数据查看、延迟追踪、地图展示等功能。

本项目基于[CF-Server-Monitor-Pro](https://github.com/a63414262/CF-Server-Monitor-Pro)深度二次开发

## ✨ 功能特点

- 📊 **实时监控**：CPU、内存、磁盘、网络、进程数、连接数
- 📈 **历史图表**：支持 1/3/6/12/24 小时历史数据查看
- 🌍 **全球地图**：可视化展示服务器分布
- 🔔 **离线告警**：支持 Telegram 和企业微信通知
- 🎨 **多主题**：2 种预设主题 + 自定义 CSS
- 📱 **响应式**：支持桌面端和移动端
- 🔄 **自动部署**：GitHub Actions 一键部署
- 🗺️ **延迟追踪**：国内电信/联通/移动/字节延迟监测
- 🔒 **服务器隐藏**：可设置特定服务器对非登录用户隐藏
- ↕️ **拖拽排序**：后台拖拽调整服务器显示顺序

## 📁 项目结构

```
server-monitor/
├── public/
│   └── install.sh              # 一键安装脚本（含卸载）
├── src/
│   ├── index.js                # 主入口 - 路由分发
│   ├── database/
│   │   └── schema.js           # 数据库初始化、历史数据存储
│   ├── middleware/
│   │   └── auth.js             # 认证中间件
│   ├── handlers/
│   │   ├── admin.js            # 后台管理 API
│   │   ├── admin-ui.js         # 后台管理界面
│   │   ├── update.js           # 数据上报处理
│   │   ├── dashboard.js        # 前台大盘首页
│   │   └── server-detail.js    # 服务器详情页（24h历史）
│   ├── services/
│   │   └── notification.js     # 通知服务
│   ├── utils/
│   │   ├── format.js           # 格式化工具
│   │   └── settings.js         # 设置管理
│   └── themes/
│       └── styles.js           # 主题样式
├── package.json
├── wrangler.toml
└── .github/
    └── workflows/
        └── deploy.yml          # GitHub Actions 自动部署
```

## 🚀 快速开始

### 前置要求

- [Cloudflare 账户](https://dash.cloudflare.com/)
- [GitHub 账户](https://github.com/)

### 第一步：Fork 项目

点击右上角 **Fork** 按钮，将项目 Fork 到你的 GitHub 账户。

### 第二步：创建 D1 数据库

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **D1 SQL Database**
3. 点击 **Create database**
4. 数据库名称填写：`server-monitor-db`
5. 点击 **Create**
6. 记录下生成的 **Database ID**，稍后会用到

### 第三步：获取 Cloudflare 配置

#### 获取 Account ID

**方式一：从右侧面板获取**

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 在右侧面板找到 **Account ID**
3. 复制保存

**方式二：从 URL 中获取**

- 登录后访问任意 Cloudflare 页面，例如 `https://dash.cloudflare.com/f81d307ba09470a84732724694435c9c4c4c/workers-and-pages`
- URL 中 `dash.cloudflare.com/` 之后的那串字符就是 Account ID
- 以上例子中，`f81d307ba09470a84732724694435c9c4c4c` 就是 Account ID

#### 获取 API Token

1. 打开 [API Tokens 页面](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **Create Token/创建令牌**
3. 选择（ **Edit Cloudflare Workers/编辑 Cloudflare Workers** ）模板
4. 在 **Account Resources/帐户资源** 选择你的账户
5. 点击 **Continue to summary/继续以显示摘要**→ **Create Token/创建令牌**
6. 复制生成的 Token（只显示一次！）

### 第四步：配置 GitHub Secrets

1. 打开你 Fork 的 GitHub 仓库
2. 进入 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**，依次添加以下 4 个密钥：

| Secret 名称        | 值                         | 说明                |
| ---------------- | ------------------------- | ----------------- |
| `CF_API_TOKEN`   | 第三步获取的 Token              | Cloudflare API 令牌 |
| `CF_ACCOUNT_ID`  | 第三步获取的 ID                 | Cloudflare 账户 ID  |
| `API_USER_NAME`  | 自定义用户名（如 `admin`）         | 管理后台用户名           |
| `API_SECRET`     | 自定义密码（如 `MyMonitor2024!`） | 探针认证密钥 & 管理后台密码   |
| `D1_DATABASE_ID` | 第二步获取的 Database ID        | D1 数据库 ID         |

### 第五步：部署

#### 方式一：自动部署

推送代码到 `main` 分支即可自动部署：

```bash
# 克隆你 Fork 的仓库
git clone https://github.com/你的用户名/CF-Server-Monitor-Pro.git
cd CF-Server-Monitor-Pro

# 可选：修改配置后提交
git add .
git commit -m "Initial setup"
git push origin main
```

推送后，GitHub Actions 会自动部署。在仓库的 **Actions** 标签页可查看部署进度。

#### 方式二：手动部署

也可以通过 GitHub Actions 手动触发部署：

1. 进入你的 GitHub 仓库页面
2. 点击顶部的 **Actions** 标签
3. 在左侧工作流列表中选择 **Deploy to Cloudflare Workers**
4. 点击右侧的 **Run workflow** 按钮
5. 选择分支（默认选择 `main`）
6. 点击 **Run workflow** 开始部署

部署进度可在 **Actions** 标签页中查看。

### 第六步：访问管理后台

部署成功后，访问管理后台：

```
https://你的项目名.你的子域.workers.dev/admin
```

- 用户名：你设置的 `API_USER_NAME`
- 密码：你设置的 `API_SECRET`

> **提示**：项目名和子域可以在 Cloudflare Workers & Pages 页面找到。

## 🖥️ 添加服务器监控

### 在管理后台添加服务器

1. 进入管理后台 `/admin`
2. 在"服务器名称"输入框填写名称
3. 点击 **+ 添加服务器**
4. 点击新服务器旁的 **📋** 按钮复制安装命令

### 在目标服务器上安装探针

```bash
# 粘贴从管理后台复制的命令，类似：
curl -sL https://你的项目.你的子域.workers.dev/install.sh | bash -s install <SERVER_ID> <SECRET> <WORKER_URL> [INTERVAL]
```

**参数说明：**

| 参数           | 说明              | 默认值  |
| ------------ | --------------- | ---- |
| `SERVER_ID`  | 服务器唯一标识符（必填）    | -    |
| `SECRET`     | API 认证密钥（必填）    | -    |
| `WORKER_URL` | Worker 上报地址（必填） | -    |
| `INTERVAL`   | 数据上报间隔（秒）       | `60` |

**示例：**

```bash
# 默认60秒上报间隔
curl -sL https://example.workers.dev/install.sh | bash -s install abc123 secret https://example.workers.dev/update

# 30秒上报间隔（更实时）
curl -sL https://example.workers.dev/install.sh | bash -s install abc123 secret https://example.workers.dev/update 30

# 120秒上报间隔（节省资源）
curl -sL https://example.workers.dev/install.sh | bash -s install abc123 secret https://example.workers.dev/update 120
```

> **注意**：上报间隔越短，数据越实时，但会增加 API 调用和数据库存储。建议根据服务器数量和网络状况选择合适的间隔。

支持的系统：Ubuntu / Debian / CentOS / RHEL / Fedora / Rocky / AlmaLinux

### 卸载探针

```bash
curl -sL https://你的项目.你的子域.workers.dev/install.sh | bash -s uninstall
```

## 📊 使用说明

### 前台大盘

访问 `https://你的项目.你的子域.workers.dev/` 查看：

- **卡片视图**：服务器状态概览（含实时网速和本月流量）
- **表格视图**：详细数据列表（含本月累计流量）
- **地图视图**：全球服务器分布
- **过滤器**：按国家筛选服务器

### 服务器详情

点击任意服务器卡片进入详情页：

- 实时 CPU/内存/磁盘/网络
- 1/3/6/12/24 小时历史趋势图
- 鼠标悬停查看具体时间点的数值
- 国内三大运营商延迟追踪

### 主题切换

管理后台支持 2 种主题：

1. 默认黑色终端
2. 白色终端
3. 完全自定义 CSS

### 拖拽排序

在管理后台的服务器列表中，可以通过拖拽调整服务器的显示顺序：

1. 进入管理后台 `/admin`
2. 找到服务器列表最左侧的 `⋮⋮` 拖拽手柄
3. 按住拖拽手柄上下拖动调整顺序
4. 松开鼠标后自动保存排序
5. 首页会按此排序显示服务器

> **分组排序**：分组的顺序由该分组内第一个出现的服务器位置决定。

### 服务器隐藏

可以将特定服务器设置为对非登录用户隐藏：

1. 进入管理后台 `/admin`
2. 点击服务器行右侧的 **✏️ 编辑** 按钮
3. 勾选 **Hide from Public** 选项
4. 点击 **保存**

> **隐藏效果**：
> - 非登录状态下，首页不显示该服务器
> - 非登录状态下，直接访问该服务器详情页返回 404
> - 非登录状态下，所有相关 API 接口也无法访问该服务器数据
> - 登录管理员后可正常查看所有服务器

## 🔔 离线告警配置

在管理后台 → 全局设置中配置：

**Telegram 告警：**

1. 创建 Telegram Bot（通过 [@BotFather](https://t.me/BotFather)）
2. 获取 Bot Token
3. 获取 Chat ID（通过 [@userinfobot](https://t.me/userinfobot)）
4. 填入后台设置并开启

**企业微信告警：**

1. 创建群机器人，获取 Webhook URL
2. 填入 Bot Token 字段
3. Chat ID 留空

## 📸 界面预览

<img width="1903" height="1341" alt="image" src="https://github.com/user-attachments/assets/77344b37-c7ce-4bff-b820-cbd0b4b26579" />
<img width="1907" height="683" alt="image" src="https://github.com/user-attachments/assets/48cf2f27-66d2-4b39-a5d3-ea9c5d5bb908" />
<img width="1788" height="876" alt="image" src="https://github.com/user-attachments/assets/658e68e9-f858-408b-a603-537e55625701" />
<img width="1788" height="1724" alt="image" src="https://github.com/user-attachments/assets/f2c1fc38-ecd9-48be-8fea-fbb5ff3aad51" />
<img width="1788" height="1126" alt="image" src="https://github.com/user-attachments/assets/e28da6fb-915b-4417-a25c-faa7b3b11656" />
<img width="1788" height="1480" alt="image" src="https://github.com/user-attachments/assets/4069d509-6ac9-4fa1-ade2-8eac43dbf6db" />
<img width="1875" height="723" alt="image" src="https://github.com/user-attachments/assets/a806179f-8cb0-4713-b774-2741cb094a6f" />

白色主题

<img width="1788" height="1268" alt="image" src="https://github.com/user-attachments/assets/a229d14e-6099-4863-ad3d-3202fe2add58" />
<img width="1904" height="671" alt="image" src="https://github.com/user-attachments/assets/48767b1b-f85e-48af-bd4f-cbe61c01d020" />
<img width="1788" height="876" alt="image" src="https://github.com/user-attachments/assets/d8abbeb3-bb66-4be6-9d56-5cb42a579950" />
<img width="1788" height="1126" alt="image" src="https://github.com/user-attachments/assets/9b4b9f4a-0e62-4ae6-87dc-e8c5a5306975" />
<img width="1904" height="788" alt="image" src="https://github.com/user-attachments/assets/d0d53cf2-1d3d-4463-8b11-b92ca4eef8a3" />
<img width="1903" height="705" alt="image" src="https://github.com/user-attachments/assets/acc08244-c0f1-438b-88cc-871879be09b7" />


## 🛠️ 本地开发

```bash
# 安装依赖
npm install
   ```
# 创建 D1 数据库
npx wrangler d1 create server-monitor-db

# 更新 wrangler.toml 中的 database_id

# 前端依赖
npm run build:frontend

# 启动本地开发服务器
npm run dev

# 导入测试数据
见 /test/README.md 中的说明

# 部署
npm run deploy
```

## 📝 环境变量说明

| 变量               | 说明                                     | 必需 |
| ---------------- | -------------------------------------- | -- |
| `API_SECRET`     | 探针认证密钥 + 管理后台密码                        | ✅  |
| `D1_DATABASE_ID` | Cloudflare D1 数据库 ID                   | ✅  |
| `CF_API_TOKEN`   | Cloudflare API Token（仅 GitHub Actions） | ✅  |
| `CF_ACCOUNT_ID`  | Cloudflare 账户 ID（仅 GitHub Actions）     | ✅  |

## ❓ 常见问题

**Q: 部署后访问 404？**
A: 确认 `wrangler.toml` 中的 `database_id` 已正确配置，且 D1 数据库已创建。

**Q: 探针安装后不显示数据？**
A: 检查服务器是否能访问 Worker URL，查看探针日志：`journalctl -u cf-probe -f`

**Q: 如何更换 API\_SECRET？**
A: 更新 GitHub Secrets 中的 `API_SECRET`，重新部署，并在所有服务器上重新安装探针。

**Q: D1 数据库免费额度够用吗？**
A: Cloudflare D1 免费版提供 5GB 存储和 50 亿次读取/月，足以支持大量服务器监控。

## 📄 许可证

MIT License

## 🙏 致谢

- [CF-Server-Monitor-Pro](https://github.com/a63414262/CF-Server-Monitor-Pro)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Chart.js](https://www.chartjs.org/)
- [Leaflet](https://leafletjs.com/)

