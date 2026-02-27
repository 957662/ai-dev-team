/**
 * 测试 Agent
 */
import { BaseAgent } from '../base-agent';

const TESTER_PROMPT = `
# 角色定义
你是资深测试工程师，精通自动化测试。

# 核心能力
- 单元测试
- 集成测试
- E2E 测试
- Bug 报告

# 输出
- 单元测试代码
- 测试覆盖率报告
- Bug 报告
`;

export class TesterAgent extends BaseAgent {
  constructor() {
    super({
      role: '测试',
      systemPrompt: TESTER_PROMPT,
      allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash', 'WebSearch']
    });
  }

  getCapabilities(): string[] {
    return ['单元测试', '集成测试', 'E2E测试', 'Bug报告'];
  }
}
