# AGH 技术决策记录

## D-001：后端框架 - FastAPI

**问题**：用什么后端框架

**决策**：FastAPI

**理由**：异步原生、类型安全、自动 OpenAPI 文档

**日期**：2026-05-28

---

## D-002：数据库 - PostgreSQL

**问题**：用什么数据库

**决策**：PostgreSQL + asyncpg

**理由**：JSONB/数组支持好，异步驱动成熟

**日期**：2026-05-28

---

## D-003：患者状态枚举

**决策**：9 状态枚举覆盖完整生命周期

```
initial → consulting → reviewing → reviewed 
→ contracted → surgery_scheduled → post_surgery 
→ followup → closed
```

**日期**：2026-05-28

---

## D-004：评审优先级

**决策**：4 级优先级 low/normal/high/urgent

**理由**：高优先级需 4 小时内响应

**日期**：2026-05-28

---

## D-005：文件存储 - OSS 预签名 URL

**决策**：阿里云 OSS + 预签名 URL 模式

**理由**：患者直传 OSS，不经过 API 中转

**日期**：2026-05-28

---

## D-006：WhatsApp - 官方 Cloud API

**决策**：WhatsApp Business Cloud API + Webhook 路由

**理由**：官方渠道不封号，多销售通过消息分配协同

**日期**：2026-05-28

---

## D-007：随访节点 - 4 个固定节点

**决策**：day_7 / day_30 / day_90 / day_180

**理由**：参考行业标准，覆盖术后关键康复期

**日期**：2026-05-28

---

| 日期 | 决策数 |
|------|--------|
| 2026-05-28 | 7 |