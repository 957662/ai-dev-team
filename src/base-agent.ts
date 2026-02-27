/**
 * Claude Agent SDK - Agent 基类
 * 
 * 权限模式：bypassPermissions（完全自动化，无需人工确认）
 * 思考模式：adaptive（自适应深度推理）
 */
import { query, Options } from '@anthropic-ai/claude-agent-sdk';

export interface AgentConfig {
  role: string;
  systemPrompt: string;
  allowedTools: string[];
  model?: string;
}

/**
 * 权限模式说明：
 * - 'default': 标准权限，危险操作需要确认
 * - 'acceptEdits': 自动接受文件编辑
 * - 'bypassPermissions': 跳过所有权限检查（完全自动化）
 * - 'dontAsk': 不提示，未预批准则拒绝
 */
export type PermissionMode = 'default' | 'acceptEdits' | 'bypassPermissions' | 'dontAsk';

/**
 * 思考模式说明：
 * - 'adaptive': 自适应思考，模型自动决定何时思考、思考多少（推荐）
 * - 'enabled': 启用思考，可指定 token 预算
 * - 'disabled': 禁用扩展思考
 */
export type ThinkingMode = 'adaptive' | 'enabled' | 'disabled';

export interface ThinkingConfig {
  type: ThinkingMode;
  budgetTokens?: number; // 仅当 type='enabled' 时有效
}

export abstract class BaseAgent {
  protected role: string;
  protected systemPrompt: string;
  protected allowedTools: string[];
  protected model: string;
  protected permissionMode: PermissionMode = 'bypassPermissions'; // 默认完全自动化
  protected thinkingMode: ThinkingMode = 'adaptive'; // 默认自适应深度推理
  protected thinkingBudget?: number; // 思考 token 预算（可选）
  protected conversationHistory: Array<{ role: string; content: string }> = [];

  constructor(config: AgentConfig) {
    this.role = config.role;
    this.systemPrompt = config.systemPrompt;
    this.allowedTools = config.allowedTools;
    this.model = config.model || 'glm-5';
  }

  /**
   * 设置权限模式
   */
  setPermissionMode(mode: PermissionMode): void {
    this.permissionMode = mode;
  }

  /**
   * 设置思考模式
   * @param mode - 思考模式：'adaptive' | 'enabled' | 'disabled'
   * @param budgetTokens - 思考 token 预算（仅当 mode='enabled' 时有效）
   */
  setThinkingMode(mode: ThinkingMode, budgetTokens?: number): void {
    this.thinkingMode = mode;
    this.thinkingBudget = budgetTokens;
  }

  /**
   * 启用深度推理（自适应模式）
   */
  enableDeepThinking(): void {
    this.thinkingMode = 'adaptive';
  }

  /**
   * 禁用深度推理
   */
  disableDeepThinking(): void {
    this.thinkingMode = 'disabled';
  }

  async *execute(prompt: string): AsyncGenerator<any> {
    // 构建带上下文的 prompt
    let fullPrompt = prompt;
    if (this.conversationHistory.length > 0) {
      const context = this.conversationHistory
        .slice(-5)
        .map(h => `【${h.role}】: ${h.content}`)
        .join('\n\n');
      fullPrompt = `之前的上下文：\n${context}\n\n当前任务：\n${prompt}`;
    }

    // 构建思考配置
    const thinkingConfig: any = (() => {
      switch (this.thinkingMode) {
        case 'adaptive':
          return { type: 'adaptive' };
        case 'enabled':
          return { type: 'enabled', budgetTokens: this.thinkingBudget };
        case 'disabled':
          return { type: 'disabled' };
        default:
          return { type: 'adaptive' };
      }
    })();

    // 配置选项，包含完整的权限和思考设置
    const options: Options = {
      systemPrompt: this.systemPrompt,
      allowedTools: this.allowedTools as any,
      tools: this.allowedTools as any,
      // 🔑 权限配置 - 完全自动化
      permissionMode: this.permissionMode as any,
      // ⚠️ 必须设置为 true 才能使用 bypassPermissions
      allowDangerouslySkipPermissions: this.permissionMode === 'bypassPermissions',
      // 🧠 思考配置 - 深度推理
      thinking: thinkingConfig,
    };

    for await (const message of query({
      prompt: fullPrompt,
      options
    })) {
      // 记录对话历史
      if (message.type === 'assistant') {
        for (const block of (message as any).message?.content || []) {
          if ('text' in block && block.text) {
            this.conversationHistory.push({
              role: 'assistant',
              content: block.text.substring(0, 500)
            });
          }
        }
      }
      
      yield message;
    }

    this.conversationHistory.push({
      role: 'user',
      content: prompt.substring(0, 500)
    });
  }

  async executeAndCollect(prompt: string): Promise<string> {
    const results: string[] = [];
    for await (const message of this.execute(prompt)) {
      if (message.type === 'result') {
        results.push(message.result || '');
      } else if (message.type === 'assistant') {
        for (const block of (message as any).message?.content || []) {
          if ('text' in block && block.text) {
            results.push(block.text);
          }
        }
      }
    }
    return results.join('\n');
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * 获取 Agent 能力列表
   */
  abstract getCapabilities(): string[];
  
  /**
   * 获取当前权限模式
   */
  getPermissionMode(): PermissionMode {
    return this.permissionMode;
  }

  /**
   * 获取当前思考模式
   */
  getThinkingMode(): ThinkingMode {
    return this.thinkingMode;
  }
}
