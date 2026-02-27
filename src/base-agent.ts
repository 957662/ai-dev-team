/**
 * Claude Agent SDK - Agent 基类
 */
import { query, Options } from '@anthropic-ai/claude-agent-sdk';

export interface AgentConfig {
  role: string;
  systemPrompt: string;
  allowedTools: string[];
  model?: string;
}

export abstract class BaseAgent {
  protected role: string;
  protected systemPrompt: string;
  protected allowedTools: string[];
  protected model: string;
  protected conversationHistory: Array<{ role: string; content: string }> = [];

  constructor(config: AgentConfig) {
    this.role = config.role;
    this.systemPrompt = config.systemPrompt;
    this.allowedTools = config.allowedTools;
    this.model = config.model || 'glm-5';
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

    const options: Options = {
      systemPrompt: this.systemPrompt,
      allowedTools: this.allowedTools as any,
      tools: this.allowedTools as any,
    };

    for await (const message of query({
      prompt: fullPrompt,
      options
    })) {
      // 记录对话历史
      if (message.type === 'assistant') {
        for (const block of (message as any).message.content) {
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
        for (const block of (message as any).message.content) {
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

  abstract getCapabilities(): string[];
}
