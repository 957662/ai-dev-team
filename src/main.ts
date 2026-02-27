#!/usr/bin/env node

/**
 * AI 开发团队 - 主程序入口
 * 基于 Claude Agent SDK 框架
 * 
 * 使用方法：
 *   node dist/main.js --requirement "开发一个任务管理系统"
 *   node dist/main.js --file requirements.txt
 *   node dist/main.js --check
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
  AssetsAgent
} from './agents';

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
║     测试 | 安全 | 文档 | 素材                                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
}

function printHelp() {
  console.log(`
使用方法：

1. 运行项目（使用默认需求）:
   npm start

2. 指定需求:
   npm start -- --requirement "开发一个博客系统"

3. 从文件读取:
   npm start -- --file requirements.txt

4. 检查部署状态:
   npm run check

5. 编译 TypeScript:
   npm run build
`);
}

async function runProject(requirement: string, projectName: string = 'my-project') {
  console.log(`\n📦 项目名称: ${projectName}`);
  console.log(`📋 需求长度: ${requirement.length} 字符\n`);

  const agents = {
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

  console.log('=' .repeat(60));
  console.log(`📋 项目需求: ${requirement.substring(0, 100)}...`);
  console.log('=' .repeat(60));

  // Phase 1: 架构设计
  console.log('\n🏗️ Phase 1: 架构设计');
  const archResult = await agents.architect.executeAndCollect(
    `根据以下需求设计系统架构：\n${requirement}`
  );
  console.log('架构设计完成');

  // Phase 2: UI + 后端 + 数据库 (并行)
  console.log('\n🎨 Phase 2: UI设计 + 后端 + 数据库');
  const [uiResult, backendResult, dbResult] = await Promise.all([
    agents.uiDesigner.executeAndCollect('设计 UI 系统'),
    agents.backend.executeAndCollect(`根据架构：\n${archResult.substring(0, 2000)}`),
    agents.database.executeAndCollect('设计数据库')
  ]);
  console.log('UI/后端/数据库设计完成');

  // Phase 3: 前端 + 素材
  console.log('\n💻 Phase 3: 前端开发 + 素材');
  const [frontendResult, assetsResult] = await Promise.all([
    agents.frontend.executeAndCollect('实现前端页面'),
    agents.assets.executeAndCollect('制作素材图标')
  ]);
  console.log('前端/素材完成');

  // Phase 4: 测试 + 安全 + 文档
  console.log('\n🧪 Phase 4: 测试 + 安全 + 文档');
  const [testResult, securityResult, docResult] = await Promise.all([
    agents.tester.executeAndCollect('编写测试用例'),
    agents.security.executeAndCollect('安全审计'),
    agents.documenter.executeAndCollect('编写文档')
  ]);
  console.log('测试/安全/文档完成');

  console.log('\n✅ 项目完成！');
  
  return {
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
    'src/agents/index.ts',
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
    console.log('     请设置环境变量或配置智谱 API Key');
  }

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
  if (!process.env.ANTHROPIC_AUTH_TOKEN && !process.env.ANTHROPIC_AUTH_TOKEN?.startsWith('GLM-')) {
    console.log('⚠️ 注意: 未设置 ANTHROPIC_AUTH_TOKEN');
    console.log('请确保已配置智谱 API Key');
  }

  // 运行项目
  await runProject(requirement);
}

main().catch(console.error);
