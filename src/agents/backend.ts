/**
 * 后端 Agent
 */
import { BaseAgent } from '../base-agent';

const BACKEND_PROMPT = `
# 角色定义
你是资深后端开发工程师，精通 Python/FastAPI，擅长构建高性能 API 服务。

# 核心能力
- RESTful API 设计
- 业务逻辑实现
- 数据库操作
- 异步处理
- API 文档

# 技术栈
- 框架：FastAPI
- ORM：SQLAlchemy
- 数据库：PostgreSQL
- 文档：Swagger/OpenAPI

# 输出清单
- 数据库模型
- Pydantic Schema
- API 路由
- 业务服务
- 单元测试
`;

export class BackendAgent extends BaseAgent {
  constructor() {
    super({
      role: '后端开发',
      systemPrompt: BACKEND_PROMPT,
      allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash', 'WebSearch', 'WebFetch']
    });
  }

  getCapabilities(): string[] {
    return ['FastAPI开发', 'SQLAlchemy', 'API设计', '业务逻辑', '异步编程'];
  }
}
