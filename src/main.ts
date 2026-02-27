#!/usr/bin/env node

/**
 * AI 开发团队 - 主程序入口
 * 基于 Claude Agent SDK 框架
 * 
 * 使用方法：
 *   # 按需求开发
 *   node dist/main.js --requirement "开发一个任务管理系统"
 *   
 *   # 自主迭代模式（自动发现需求、自动开发）
 *   node dist/main.js --auto
 *   
 *   # 自主迭代模式（指定间隔和次数）
 *   node dist/main.js --auto --interval 60 --max 10
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  ArchitectAgent,
  FrontendAgent,
  BackendAgent,
  DatabaseAgent,
  UIDesignerAgent,
  TesterAgent,
  SecurityAgent,
  DocumenterAgent,
  AssetsAgent,
  ProductManagerAgent
} from './agents';
import { AutoIterationEngine, IterationConfig } from './auto-iteration';

const DEFAULT_REQUIREMENT = `
开发一个任务管理系统：

功能需求：
1. 用户注册/登录 (JWT认证)
2. 创建/编辑/删除任务
3. 任务分类和标签
4. 任务优先级 (高/中/低)
5. 任务截止日期
6. 任务搜索和筛选
7. 任务统计和报表

技术要求：
- 前端：Vue 3 + TypeScript + Element Plus
- 后端：FastAPI + PostgreSQL
- 支持移动端适配
- 支持暗色模式
`;

function printBanner() {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║     🤖 AI 开发团队 - Claude Agent SDK 框架                    ║
║                                                               ║
║     架构师 | 前端 | 后端 | 数据库 | UI设计                     ║
║     测试 | 安全 | 文档 | 素材 | 产品经理                       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

function printHelp() {
  console.log(`
使用方法：

1. 按需求开发（传统模式）:
   npm start -- --requirement "开发一个博客系统"

2. 自主迭代模式（自动发现需求、自动开发）:
   npm start -- --auto

3. 自主迭代模式（指定参数）:
   npm start -- --auto --interval 120 --max 5
   --interval: 迭代间隔（秒），默认 60
   --max: 最大迭代次数，默认 0（无限）

4. 检查部署状态:
   npm run check

选项：
  --auto          启用自主迭代模式
  --interval N    迭代间隔（秒）
  --max N         最大迭代次数
  --no-push       禁止自动推送
  --requirement   指定需求
  --file          从文件读取需求
`);
}

async function runAutoIteration() {
  const args = process.argv.slice(2);
  
  // 解析参数
  let intervalSec = 60;
  let maxIterations = 0;
  let autoPush = true;

  const intervalIndex = args.indexOf('--interval');
  if (intervalIndex !== -1 && args[intervalIndex + 1]) {
    intervalSec = parseInt(args[intervalIndex + 1], 10);
  }

  const maxIndex = args.indexOf('--max');
  if (maxIndex !== -1 && args[maxIndex + 1]) {
    maxIterations = parseInt(args[maxIndex + 1], 10);
  }

  if (args.includes('--no-push')) {
    autoPush = false;
  }

  console.log('🔄 启动自主迭代模式');
  console.log(`   间隔: ${intervalSec} 秒`);
  console.log(`   最大次数: ${maxIterations || '无限'}`);
  console.log(`   自动推送: ${autoPush ? '是' : '否'}`);
  console.log('');

  const config: Partial<IterationConfig> = {
    projectPath: process.cwd(),
    intervalMs: intervalSec * 1000,
    maxIterations,
    autoPush,
    autoCommit: true,
    permissionMode: 'bypassPermissions',
  };

  const engine = new AutoIterationEngine(config);

  // 处理退出信号
  process.on('SIGINT', () => {
    console.log('\n收到退出信号...');
    engine.stop();
    process.exit(0);
  });

  await engine.start();
}

async function runProject(requirement: string, projectName: string = 'my-project') {
  console.log(`\n📦 项目名称: ${projectName}`);
  console.log(`📋 需求长度: ${requirement.length} 字符\n`);

  const agents = {
    productManager: new ProductManagerAgent(),
    architect: new ArchitectAgent(),
    frontend: new FrontendAgent(),
    backend: new BackendAgent(),
    database: new DatabaseAgent(),
    uiDesigner: new UIDesignerAgent(),
    tester: new TesterAgent(),
    security: new SecurityAgent(),
    documenter: new DocumenterAgent(),
    assets: new AssetsAgent()
  };

  // 设置完全自动化权限
  Object.values(agents).forEach(agent => {
    agent.setPermissionMode('bypassPermissions');
  });

  console.log('=' .repeat(60));
  console.log(`📋 项目需求: ${requirement.substring(0, 100)}...`);
  console.log('=' .repeat(60));

  // Phase 1: 产品经理分析
  console.log('\n📊 Phase 1: 产品经理分析需求');
  const pmResult = await agents.productManager.executeAndCollect(
    `分析以下需求，拆分为具体任务：\n${requirement}`
  );
  console.log('分析完成');

  // Phase 2: 架构设计
  console.log('\n🏗️ Phase 2: 架构设计');
  const archResult = await agents.architect.executeAndCollect(
    `根据以下需求设计系统架构：\n${requirement}\n\n产品分析：\n${pmResult.substring(0, 2000)}`
  );
  console.log('架构设计完成');

  // Phase 3: UI + 后端 + 数据库 (并行)
  console.log('\n🎨 Phase 3: UI设计 + 后端 + 数据库');
  const [uiResult, backendResult, dbResult] = await Promise.all([
    agents.uiDesigner.executeAndCollect('设计 UI 系统'),
    agents.backend.executeAndCollect(`根据架构开发后端：\n${archResult.substring(0, 2000)}`),
    agents.database.executeAndCollect('设计数据库')
  ]);
  console.log('UI/后端/数据库完成');

  // Phase 4: 前端 + 素材
  console.log('\n💻 Phase 4: 前端开发 + 素材');
  const [frontendResult, assetsResult] = await Promise.all([
    agents.frontend.executeAndCollect('实现前端页面'),
    agents.assets.executeAndCollect('制作素材图标')
  ]);
  console.log('前端/素材完成');

  // Phase 5: 测试 + 安全 + 文档
  console.log('\n🧪 Phase 5: 测试 + 安全 + 文档');
  const [testResult, securityResult, docResult] = await Promise.all([
    agents.tester.executeAndCollect('编写测试用例'),
    agents.security.executeAndCollect('安全审计'),
    agents.documenter.executeAndCollect('编写文档')
  ]);
  console.log('测试/安全/文档完成');

  console.log('\n✅ 项目完成！');
  
  return {
    productManager: pmResult,
    architecture: archResult,
    ui: uiResult,
    backend: backendResult,
    database: dbResult,
    frontend: frontendResult,
    assets: assetsResult,
    testing: testResult,
    security: securityResult,
    documentation: docResult
  };
}

function checkDeployment() {
  console.log('🔍 检查部署状态...\n');

  const dirs = ['src', 'src/agents', 'dist'];
  const files = [
    'package.json',
    'tsconfig.json',
    'src/base-agent.ts',
    'src/auto-iteration.ts',
    'src/agents/index.ts',
    'src/agents/product-manager.ts',
    'src/main.ts'
  ];

  console.log('📁 目录:');
  dirs.forEach(d => {
    const exists = fs.existsSync(d);
    console.log(`  ${exists ? '✅' : '❌'} ${d}/`);
  });

  console.log('\n📄 文件:');
  files.forEach(f => {
    const exists = fs.existsSync(f);
    console.log(`  ${exists ? '✅' : '❌'} ${f}`);
  });

  // 检查环境变量
  console.log('\n📝 环境变量:');
  if (process.env.ANTHROPIC_AUTH_TOKEN) {
    console.log('  ✅ ANTHROPIC_AUTH_TOKEN 已配置');
  } else {
    console.log('  ⚠️ 未检测到 ANTHROPIC_AUTH_TOKEN');
  }

  console.log('\n🤖 Agent 团队:');
  const agentFiles = [
    'architect.ts', 'frontend.ts', 'backend.ts', 'database.ts',
    'ui-designer.ts', 'tester.ts', 'security.ts', 'documenter.ts',
    'assets.ts', 'product-manager.ts'
  ];
  agentFiles.forEach(f => {
    const exists = fs.existsSync(`src/agents/${f}`);
    console.log(`  ${exists ? '✅' : '❌'} ${f.replace('.ts', '')}`);
  });

  console.log('\n✅ 部署检查完成！');
}

async function main() {
  printBanner();

  const args = process.argv.slice(2);
  
  if (args.includes('--check') || args.includes('-c')) {
    checkDeployment();
    return;
  }

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  // 自主迭代模式
  if (args.includes('--auto')) {
    await runAutoIteration();
    return;
  }

  // 获取需求
  let requirement = DEFAULT_REQUIREMENT;
  
  const reqIndex = args.indexOf('--requirement') || args.indexOf('-r');
  if (reqIndex !== -1 && args[reqIndex + 1]) {
    requirement = args[reqIndex + 1];
  }

  const fileIndex = args.indexOf('--file') || args.indexOf('-f');
  if (fileIndex !== -1 && args[fileIndex + 1]) {
    const filePath = args[fileIndex + 1];
    if (fs.existsSync(filePath)) {
      requirement = fs.readFileSync(filePath, 'utf-8');
    } else {
      console.error(`❌ 文件不存在: ${filePath}`);
      process.exit(1);
    }
  }

  // 检查环境变量
  if (!process.env.ANTHROPIC_AUTH_TOKEN) {
    console.log('⚠️ 注意: 未设置 ANTHROPIC_AUTH_TOKEN');
    console.log('请确保已配置智谱 API Key');
  }

  // 运行项目
  await runProject(requirement);
}

main().catch(console.error);
