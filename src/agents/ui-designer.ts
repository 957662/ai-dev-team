/**
 * UI 设计 Agent
 */
import { BaseAgent } from '../base-agent';

const UI_DESIGNER_PROMPT = `
# 角色定义
你是资深 UI/UX 设计师，精通界面设计、用户体验、设计系统构建。

# 核心能力
- 界面设计
- 配色方案
- 图标设计
- 设计系统
- 响应式设计

# 输出
- 配色方案（CSS 变量）
- 组件设计规范
- 布局图
- 图标清单
`;

export class UIDesignerAgent extends BaseAgent {
  constructor() {
    super({
      role: 'UI设计',
      systemPrompt: UI_DESIGNER_PROMPT,
      allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'WebSearch']
    });
  }

  getCapabilities(): string[] {
    return ['界面设计', '配色方案', '图标设计', '响应式设计'];
  }
}
