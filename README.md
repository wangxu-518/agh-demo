# AGH 跨境肿瘤医疗协同运营平台 Demo

用于客户需求确认的多子系统高保真演示系统。统一演示中心下包含患者端、马来服务端、中国运营端、专家端、国内医院承接端和归国健康管理端。

## 核心能力

- 同一患者、Case ID、任务和时间线贯穿六端
- 关键操作产生真实跨端状态联动
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

## 路由

- `/demo`：统一演示中心
- `/patient`：患者移动端
- `/malaysia`：马来服务端
- `/china-ops`：中国运营端
- `/expert`：专家评审端
- `/hospital`：医院承接端
- `/health-management`：归国健康管理端
- `/legacy`：旧版原型（内部参考，资源位于 `public/legacy`）

所有患者数据均为虚构或匿名化演示数据。本系统不用于医疗诊断或真实临床决策。

## 服务器部署

构建产物部署在 `/opt/agh-demo-demo/current`，服务名为 `agh-demo.service`，监听 `8789`。部署脚本位于 `scripts/deploy_server.sh`，静态路由回退服务位于 `scripts/spa_server.py`。
