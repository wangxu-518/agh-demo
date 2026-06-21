# AGH 跨境肿瘤医疗协同运营平台 Demo

用于客户需求确认的多子系统高保真演示系统。患者端、马来服务端、中国运营端、专家端、国内医院承接端和归国健康管理端均有独立登录入口、导航和业务页面。

## 核心能力

- 同一患者、Case ID、任务和时间线贯穿六端
- 分配专家、医院承接、出院交接和异常升级等操作产生真实跨端待办
- 列表、详情、任务、日程、费用、随访等页面均可跳转和执行动作
- 患者移动 H5，内部角色桌面工作台
- 中英文切换
- 浏览器本地持久化及一键重置
- 五阶段归国健康管理和高危预警闭环

## 本地运行

使用工作区内置 Node/Pnpm：

```powershell
$node='C:\Users\wangx\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
$pnpm='C:\Users\wangx\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\pnpm\bin\pnpm.mjs'
& $node $pnpm install
& $node $pnpm dev
```

## 验证

```powershell
& $node $pnpm test
& $node $pnpm build
```

## 演示入口

统一入口页：`/portal`

| 系统 | 登录地址 | 演示账号 |
|---|---|---|
| 患者端 | `/patient/login` | `patient@agh.demo` |
| 马来服务端 | `/malaysia/login` | `malaysia@agh.demo` |
| 中国运营端 | `/china-ops/login` | `china@agh.demo` |
| 专家端 | `/expert/login` | `expert@agh.demo` |
| 医院承接端 | `/hospital/login` | `hospital@agh.demo` |
| 归国健康管理端 | `/health-management/login` | `health@agh.demo` |

所有演示账号密码均为 `123456`，登录页也提供一键进入。根路径默认进入 Portal。

所有患者数据均为虚构或匿名化演示数据。本系统不用于医疗诊断或真实临床决策。

## 服务器部署

构建产物部署在 `/opt/agh-demo-demo/current`，服务名为 `agh-demo.service`，监听 `8789`。部署脚本位于 `scripts/deploy_server.sh`，静态路由回退服务位于 `scripts/spa_server.py`。
