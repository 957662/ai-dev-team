# AI 开发团队

> 基于 Claude Agent SDK 框架的多 Agent 自动化开发系统

## 🤖 团队成员

| Agent | 职责 |
|:-----:|:----:|
| 🏗️ 架构师 | 系统设计、技术选型、API设计 |
| 🎨 UI设计 | 配色、图标、设计系统 |
| 💻 前端 | Vue/React 页面开发 |
| ⚙️ 后端 | FastAPI 接口开发 |
| 🗄️ 数据库 | 表结构设计、SQL |
| 🧪 测试 | 单元测试、自动化测试 |
| 🔒 安全 | 代码审计、漏洞扫描 |
| 📝 文档 | README、API文档 |
| 🖼️ 素材 | SVG图标、图片资源 |

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 编译
```bash
npm run build
```

### 运行
```bash
npm start -- --requirement "开发一个任务管理系统"
```

## 📦 项目结构

```
ai-dev-team/
├── src/
│   ├── base-agent.ts      # Agent 基类
│   ├── main.ts            # 主入口
│   └── agents/            # 9 个 Agent
│       ├── architect.ts
│       ├── frontend.ts
│       ├── backend.ts
│       └── ...
├── dist/                  # 编译输出
├── package.json
└── tsconfig.json
```

## ⚙️ 配置

### 环境变量
```bash
export ANTHROPIC_AUTH_TOKEN=your_api_key
export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
```

## 📄 许可证

MIT License
