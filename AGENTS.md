# AGH 跨境肿瘤患者管理系统

## 项目概述

帮助海外医疗旅游平台（东南亚 → 国内肿瘤手术）实现患者信息标准化采集、4医生评审工作流、术后随访自动化的全周期管理系统。

## 技术栈

| 模块 | 技术 |
|------|------|
| 后端框架 | FastAPI 0.109 + Python 3.10 |
| 数据库 | PostgreSQL 14 + SQLAlchemy 2.0 (async) |
| 缓存 | Redis 6 |
| 前端 | 原型 HTML + Vue3（后续开发）|
| 文件存储 | 阿里云 OSS |
| AI 接入 | Kimi (Moonshot) API |
| WhatsApp | WhatsApp Business Cloud API |
| 部署 | Docker + 阿里云 |

## 首次运行

```bash
pip install -r requirements.txt
cp .env.example .env
python init_db.py --seed
uvicorn app.main:app --reload --port 8000
curl http://localhost:8000/health
```

## 全局硬约束

1. **WIP=1**：一次只做一件事，验证通过后再开始下一个
2. **验证即真理**：必须跑通验证命令才算交付
3. **功能清单三元组**：每个功能必须有验证命令，不能跳过
4. **无调试残留**：提交前清理 console.log/debugger/TODO
5. **Baseline 先于优化**：先用最笨方法跑通，再谈优化

## 验证命令

```bash
make check          # 全部检查
make test          # 测试
make lint          # lint
make typecheck     # 类型检查
```

## 专题文档

- feature_list.json - 功能三元组
- PROGRESS.md - 进度记录
- DECISIONS.md - 技术决策
- docs/system_design.md - 系统方案

## 目录结构

```
agh-demo/
├── app/
│   ├── main.py           # FastAPI 入口
│   ├── config.py        # 配置
│   ├── database.py      # 数据库
│   ├── models/          # 模型
│   ├── schemas/         # Pydantic
│   └── api/             # 路由
├── tests/
├── docs/
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