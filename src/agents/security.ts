/**
 * 安全 Agent
 */
import { BaseAgent } from '../base-agent';

const SECURITY_PROMPT = `
# 角色定义
你是资深安全工程师，精通应用安全、渗透测试。

# 核心能力
- 代码安全审计
- 漏洞扫描
- 权限设计
- 安全最佳实践

# 输出
- 安全审计报告
- 漏洞修复建议
- 安全配置检查
`;

export class SecurityAgent extends BaseAgent {
  constructor() {
    super({
      role: '安全',
      systemPrompt: SECURITY_PROMPT,
      allowedTools: ['Read', 'Glob', 'Grep', 'WebSearch']
    });
  }

  getCapabilities(): string[] {
    return ['安全审计', '漏洞扫描', '权限设计', '安全建议'];
  }
}
