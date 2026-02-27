/**
 * 自主迭代引擎 - 让 Agent 团队自动开发、自动迭代
 */

import * as fs from 'fs';
import * as path from 'path';
import * as childProcess from 'child_process';

import { BaseAgent, PermissionMode } from './base-agent';
import {
  ArchitectAgent,
  FrontendAgent,
  BackendAgent,
  DatabaseAgent,
  UIDesignerAgent,
  TesterAgent,
  SecurityAgent,
  DocumenterAgent,
  AssetsAgent
} from './agents';
import { ProductManagerAgent } from './agents/product-manager';

export interface IterationConfig {
  /** 项目路径 */
  projectPath: string;
  /** 迭代间隔（毫秒） */
  intervalMs: number;
  /** 最大迭代次数（0 = 无限） */
  maxIterations: number;
  /** 是否自动提交 */
  autoCommit: boolean;
  /** 是否自动推送 */
  autoPush: boolean;
  /** 权限模式 */
  permissionMode: PermissionMode;
}

export interface IterationResult {
  iteration: number;
  task: string;
  status: 'success' | 'failed' | 'skipped';
  message: string;
  timestamp: Date;
}

export class AutoIterationEngine {
  private config: IterationConfig;
  private productManager: ProductManagerAgent;
  private agents: {
    architect: ArchitectAgent;
    frontend: FrontendAgent;
    backend: BackendAgent;
    database: DatabaseAgent;
    uiDesigner: UIDesignerAgent;
    tester: TesterAgent;
    security: SecurityAgent;
    documenter: DocumenterAgent;
    assets: AssetsAgent;
  };
  private iterationCount: number = 0;
  private isRunning: boolean = false;
  private history: IterationResult[] = [];

  constructor(config: Partial<IterationConfig> = {}) {
    this.config = {
      projectPath: config.projectPath || process.cwd(),
      intervalMs: config.intervalMs || 60000, // 默认 1 分钟
      maxIterations: config.maxIterations || 0, // 默认无限
      autoCommit: config.autoCommit ?? true,
      autoPush: config.autoPush ?? true,
      permissionMode: config.permissionMode || 'bypassPermissions',
    };

    // 初始化产品经理
    this.productManager = new ProductManagerAgent();
    this.productManager.setPermissionMode(this.config.permissionMode);
    this.productManager.setThinkingMode('adaptive'); // 启用自适应深度推理

    // 初始化开发团队
    this.agents = {
      architect: new ArchitectAgent(),
      frontend: new FrontendAgent(),
      backend: new BackendAgent(),
      database: new DatabaseAgent(),
      uiDesigner: new UIDesignerAgent(),
      tester: new TesterAgent(),
      security: new SecurityAgent(),
      documenter: new DocumenterAgent(),
      assets: new AssetsAgent(),
    };

    // 设置权限和深度推理
    Object.values(this.agents).forEach(agent => {
      agent.setPermissionMode(this.config.permissionMode);
      agent.setThinkingMode('adaptive'); // 启用自适应深度推理
    });
  }

  /**
   * 启动自动迭代
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️ 自动迭代已在运行中');
      return;
    }

    this.isRunning = true;
    console.log('🚀 自动迭代引擎启动');
    console.log(`📁 项目路径: ${this.config.projectPath}`);
    console.log(`⏱️ 迭代间隔: ${this.config.intervalMs / 1000}秒`);
    console.log(`🔄 最大迭代: ${this.config.maxIterations || '无限'}`);
    console.log('');

    while (this.isRunning) {
      // 检查是否达到最大迭代次数
      if (this.config.maxIterations > 0 && this.iterationCount >= this.config.maxIterations) {
        console.log(`✅ 已达到最大迭代次数 ${this.config.maxIterations}`);
        break;
      }

      this.iterationCount++;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`🔄 迭代 #${this.iterationCount}`);
      console.log(`${'='.repeat(60)}`);

      try {
        await this.runIteration();
      } catch (error) {
        console.error('❌ 迭代失败:', error);
        this.history.push({
          iteration: this.iterationCount,
          task: 'unknown',
          status: 'failed',
          message: String(error),
          timestamp: new Date(),
        });
      }

      // 等待下一次迭代
      if (this.isRunning && (this.config.maxIterations === 0 || this.iterationCount < this.config.maxIterations)) {
        console.log(`\n⏳ 等待 ${this.config.intervalMs / 1000} 秒后开始下一次迭代...`);
        await this.sleep(this.config.intervalMs);
      }
    }

    console.log('\n🛑 自动迭代引擎已停止');
  }

  /**
   * 停止自动迭代
   */
  stop(): void {
    this.isRunning = false;
    console.log('🛑 正在停止自动迭代...');
  }

  /**
   * 执行单次迭代
   */
  private async runIteration(): Promise<void> {
    // Phase 1: 产品经理分析项目，发现需求
    console.log('\n📋 Phase 1: 产品经理分析项目...');
    const analysisResult = await this.productManager.executeAndCollect(
      `分析项目 ${this.config.projectPath} 的当前状态，识别可以改进的地方，提出下一个要开发的功能。` +
      `\n\n要求：` +
      `\n1. 阅读项目代码` +
      `\n2. 发现缺失的功能或可改进的地方` +
      `\n3. 提出一个具体的开发任务` +
      `\n4. 任务要小而具体，可以在一次迭代中完成`
    );

    console.log(`📊 分析结果: ${analysisResult.substring(0, 200)}...`);

    // 提取任务
    const task = this.extractTask(analysisResult);
    console.log(`\n🎯 本次任务: ${task}`);

    // Phase 2: 架构师设计
    console.log('\n🏗️ Phase 2: 架构师设计...');
    const designResult = await this.agents.architect.executeAndCollect(
      `为以下任务设计技术方案：\n${task}\n\n项目路径：${this.config.projectPath}`
    );
    console.log('✅ 设计完成');

    // Phase 3: 并行开发
    console.log('\n💻 Phase 3: 并行开发...');
    const [frontendResult, backendResult, dbResult, assetsResult] = await Promise.all([
      this.agents.frontend.executeAndCollect(`前端开发任务：\n${task}\n\n设计方案：\n${designResult.substring(0, 1000)}`),
      this.agents.backend.executeAndCollect(`后端开发任务：\n${task}\n\n设计方案：\n${designResult.substring(0, 1000)}`),
      this.agents.database.executeAndCollect(`数据库任务：\n${task}\n\n设计方案：\n${designResult.substring(0, 1000)}`),
      this.agents.assets.executeAndCollect(`素材任务：\n${task}`),
    ]);
    console.log('✅ 开发完成');

    // Phase 4: 测试 + 安全 + 文档
    console.log('\n🧪 Phase 4: 测试 + 安全 + 文档...');
    const [testResult, securityResult, docResult] = await Promise.all([
      this.agents.tester.executeAndCollect(`为新功能编写测试：\n${task}`),
      this.agents.security.executeAndCollect(`安全审计新代码：\n${task}`),
      this.agents.documenter.executeAndCollect(`更新文档，记录新功能：\n${task}`),
    ]);
    console.log('✅ 测试/安全/文档完成');

    // Phase 5: Git 提交
    if (this.config.autoCommit) {
      console.log('\n📦 Phase 5: Git 提交...');
      await this.gitCommit(task);
    }

    // 记录结果
    this.history.push({
      iteration: this.iterationCount,
      task,
      status: 'success',
      message: '迭代完成',
      timestamp: new Date(),
    });

    console.log('\n✅ 迭代完成！');
  }

  /**
   * 从分析结果中提取任务
   */
  private extractTask(analysis: string): string {
    // 尝试提取任务描述
    const lines = analysis.split('\n');
    for (const line of lines) {
      if (line.includes('任务') || line.includes('建议') || line.includes('开发')) {
        return line.trim();
      }
    }
    // 如果没有找到，返回前 100 字符
    return analysis.substring(0, 100);
  }

  /**
   * Git 提交
   */
  private async gitCommit(task: string): Promise<void> {
    try {
      const cwd = this.config.projectPath;
      
      // git add
      childProcess.execSync('git add .', { cwd });
      
      // git commit
      const commitMessage = `auto: ${task.substring(0, 50)}`;
      childProcess.execSync(`git commit -m "${commitMessage}"`, { cwd });
      
      console.log(`✅ 已提交: ${commitMessage}`);

      // git push
      if (this.config.autoPush) {
        childProcess.execSync('git push', { cwd });
        console.log('✅ 已推送到远程');
      }
    } catch (error) {
      console.log('⚠️ Git 操作失败（可能没有变更）:', String(error));
    }
  }

  /**
   * 休眠
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取迭代历史
   */
  getHistory(): IterationResult[] {
    return this.history;
  }

  /**
   * 获取迭代次数
   */
  getIterationCount(): number {
    return this.iterationCount;
  }

  /**
   * 是否正在运行
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }
}
