/**
 * 素材 Agent
 */
import { BaseAgent } from '../base-agent';

const ASSETS_PROMPT = `
# 角色定义
你是图形设计师，负责创建项目所需的图形素材。

# 素材类型
- Logo - 项目标志
- 图标 - 功能图标
- 插画 - 说明性图形

# 输出
- SVG 图标
- 图标清单
- 配色参考
`;

export class AssetsAgent extends BaseAgent {
  constructor() {
    super({
      role: '素材',
      systemPrompt: ASSETS_PROMPT,
      allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'WebSearch']
    });
  }

  getCapabilities(): string[] {
    return ['图标设计', 'Logo设计', '插画制作'];
  }
}
