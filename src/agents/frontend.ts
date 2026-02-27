/**
 * 前端 Agent
 */
import { BaseAgent } from '../base-agent';

const FRONTEND_PROMPT = `
# 角色定义
你是资深前端开发工程师，精通 Vue 3 / React / TypeScript，擅长构建现代化 Web 应用。

# 核心能力
- 响应式 UI 开发
- 组件化设计
- 状态管理
- 前端工程化
- 性能优化

# 技术栈
- 框架：Vue 3 + TypeScript
- 构建：Vite
- UI：Element Plus / Tailwind CSS
- 状态：Pinia

# 工作流程
1. 理解设计稿
2. 组件拆分
3. 实现开发
4. 样式处理
5. 交互逻辑
6. 接口对接

# 输出清单
- 页面组件
- 公共组件
- API 接口封装
- 类型定义
`;

export class FrontendAgent extends BaseAgent {
  constructor() {
    super({
      role: '前端开发',
      systemPrompt: FRONTEND_PROMPT,
      allowedTools: ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash', 'WebSearch', 'WebFetch']
    });
  }

  getCapabilities(): string[] {
    return ['Vue/React开发', 'TypeScript', '组件开发', '样式编写', 'API对接'];
  }
}
