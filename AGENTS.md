# AGH 跨境肿瘤患者管理系统

## 项目概述

帮助海外医疗旅游平台（东南亚 → 国内肿瘤手术）实现患者信息标准化采集、4医生评审工作流、术后随访自动化的全周期管理系统。

## 技术栈

| 模块 | 技术 |
|------|------|
| 前端框架 | Vue 3 + Vite |
| 路由 | Vue Router |
| 状态管理 | Pinia + localStorage |
| 测试 | Vitest |
| 部署 | 静态构建 + systemd |

## 首次运行

```bash
pnpm install
pnpm dev
```

## 全局硬约束

1. **WIP=1**：一次只做一件事，验证通过后再开始下一个
2. **验证即真理**：必须跑通验证命令才算交付
3. **功能清单三元组**：每个功能必须有验证命令，不能跳过
4. **无调试残留**：提交前清理 console.log/debugger/TODO
5. **Baseline 先于优化**：先用最笨方法跑通，再谈优化
6. **报价范围优先**：所有任务必须能追溯到客户三期报价方案，不得因原型优化自动扩大交付范围
7. **A/B/C 范围治理**：A 类按期实施，B 类严格限深，C 类暂停并进入增购清单
8. **开发前范围登记**：新增功能必须先在 `feature_list.json` 填写 `phase`、`quote_basis`、`scope_class`、`scope_status`

## 验证命令

```bash
make check          # 全部检查
make test          # 测试
make build         # 生产构建
```

## 专题文档

- feature_list.json - 功能三元组
- PROGRESS.md - 进度记录
- DECISIONS.md - 技术决策
- REQUIREMENTS_MATRIX.md - 客户需求确认矩阵
- SCOPE_MATRIX.md - 三期报价范围、限深规则与增购清单
- docs/system_design.md - 系统方案

## 目录结构

```
agh-demo/
├── src/
│   ├── views/           # 六端工作台、登录页与业务页面
│   ├── config/          # 六端入口、账号和导航配置
│   ├── components/      # 共享组件
│   ├── stores/          # Pinia 状态与测试
│   └── data/            # 演示种子数据
├── legacy/              # 旧版单页原型
├── Makefile
├── requirements.txt
├── requirements-dev.txt
├── init_db.py
├── SPEC.md
├── feature_list.json
├── PROGRESS.md
├── DECISIONS.md
└── AGENTS.md
```

## 当前进度

详见 PROGRESS.md
