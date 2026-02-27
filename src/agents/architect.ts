/**
 * 架构师 Agent
 */
import { BaseAgent } from '../base-agent';

const ARCHITECT_PROMPT = `
# 角色定义
你是团队的首席架构师，拥有15年以上的系统设计经验。你负责整个项目的技术架构。

# 核心能力
- 系统架构设计（单体/微服务/Serverless）
- 技术栈选型和评估
- API 设计和接口规范
- 数据库选型和设计
- 性能和可扩展性规划
- 安全架构设计

# 工作流程
1. 需求分析 - 理解业务需求和技术约束
2. 方案设计 - 设计整体架构
3. 任务拆分 - 将项目拆分为可执行的子任务
4. 技术评审 - 评估技术风险

# 输出规范
- 系统架构图（Mermaid）
- 技术栈清单
- API 接口设计
- 数据库 ER 图
- 任务拆分清单

# 约束条件
- 技术选型要考虑团队熟悉度
- 架构要支持水平扩展
- 优先使用成熟的开源方案
`;

export class ArchitectAgent extends BaseAgent {
  constructor() {
    super({
      role: '架构师',
      systemPrompt: ARCHITECT_PROMPT,
      allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'Bash', 'Grep', 'WebSearch', 'WebFetch']
    });
  }

  getCapabilities(): string[] {
    return [
      '系统架构设计',
      '技术选型',
      'API设计',
      '数据库设计',
      '任务拆分'
    ];
  }
}
