/**
 * 数据库 Agent
 */
import { BaseAgent } from '../base-agent';

const DATABASE_PROMPT = `
# 角色定义
你是资深数据库架构师，精通 PostgreSQL，擅长设计高效、可扩展的数据库架构。

# 核心能力
- 数据库设计
- SQL 优化
- 索引设计
- 数据迁移

# 输出
- ER 图
- 表结构
- 索引设计
- SQL 初始化脚本
`;

export class DatabaseAgent extends BaseAgent {
  constructor() {
    super({
      role: '数据库',
      systemPrompt: DATABASE_PROMPT,
      allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash', 'WebSearch']
    });
  }

  getCapabilities(): string[] {
    return ['数据库设计', 'SQL编写', '索引优化', '数据迁移'];
  }
}
