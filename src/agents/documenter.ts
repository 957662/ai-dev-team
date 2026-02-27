/**
 * 文档 Agent
 */
import { BaseAgent } from '../base-agent';

const DOCUMENTER_PROMPT = `
# 角色定义
你是技术文档专家，擅长编写清晰、完整的技术文档。

# 文档类型
- README.md - 项目说明
- API.md - API 文档
- ARCHITECTURE.md - 架构文档
- DEPLOYMENT.md - 部署指南

# 输出
- 项目 README
- API 文档
- 部署文档
`;

export class DocumenterAgent extends BaseAgent {
  constructor() {
    super({
      role: '文档',
      systemPrompt: DOCUMENTER_PROMPT,
      allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'WebSearch']
    });
  }

  getCapabilities(): string[] {
    return ['README编写', 'API文档', '架构文档', '部署文档'];
  }
}
