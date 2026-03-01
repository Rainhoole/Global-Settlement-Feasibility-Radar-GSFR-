# GSFR Agent Guide (V1 Baseline)

本文档用于给后续开发者快速建立上下文，说明 GSFR 的 V1 是如何开发、如何部署、当前技术栈和已知坑位。  
当前文档对应版本：`V1 / v1.0.0`，当前工作分支：`v2-dev`（从 V1 基线继续迭代）。

## 1. 项目定位

- 项目名：Global Settlement Feasibility Radar (GSFR)
- 目标：以地图 + 表格方式展示各国在跨境结算场景下的可行性、OpenFX 覆盖状态、监管与支付基础设施信息。
- V1 输出：一个可在线访问、可筛选、可查看国家详情的前端可视化站点。

## 2. V1 里程碑快照

- V1 标签：`v1.0.0`
- V1 前备份标签：`backup-v1-pre-v2-20260301-2332`
- 当前远端主分支：`master`
- V2 开发分支：`v2-dev`
- 生产访问路径（GitHub Pages 子路径）：`/Global-Settlement-Feasibility-Radar-GSFR-/`
- 短链接入口：`https://rainhoole.com/GSFR`（由 `MY_WEBSITE` 仓库重定向）

## 3. V1 功能范围

- 世界地图可视化（按 OpenFX 状态着色）
- 多条件筛选
  - Region
  - Feasibility
  - OpenFX Status
- 地图/表格双视图切换
- 搜索弹窗（`Ctrl+K / Cmd+K`）
- 国家详情面板（监管、数字资产、清算、制裁、航运等）

## 4. 技术栈与依赖

- 前端框架：`React 18`
- 语言：`TypeScript`
- 构建工具：`Vite`
- 样式：`Tailwind CSS`（通过 `@tailwindcss/vite`）
- 地图：`react-simple-maps` + `d3-geo`
- 部署：`GitHub Pages` + `GitHub Actions`

关键脚本（`package.json`）：

- `npm run dev`：本地开发
- `npm run build`：标准构建
- `npm run build:github`：Pages 构建（带子路径 `base`）

## 5. 目录结构（V1）

```text
app/
├─ src/
│  ├─ components/      # 地图、表格、筛选、详情等 UI 组件
│  ├─ data/            # 运行时数据（countries.json 等）
│  ├─ types/           # 类型定义
│  └─ App.tsx          # 页面状态与主流程
├─ docs/               # 研究文档、CSV 数据表、复盘文档
├─ .github/workflows/  # 自动部署工作流
├─ README.md
└─ agent.md            # 本文档
```

## 6. 数据流（V1 现实情况）

V1 的数据链路是“文档数据”和“前端运行数据”双轨并存：

- 研究与维护：`docs/*.csv`
- 前端实际读取：`src/data/countries.json`

重要结论：

- 改 `docs/*.csv` 不会自动反映到页面。
- 页面展示是否更新，取决于 `src/data/countries.json` 是否更新并重新部署。
- V2 优先任务之一是建立 `docs -> json` 的自动转换脚本。

## 7. 部署策略（V1）

### 7.1 GSFR 仓库部署

仓库：`Global-Settlement-Feasibility-Radar-GSFR-`  
工作流：`.github/workflows/deploy-pages.yml`

- 触发：push 到 `master`
- Node 版本：22
- 构建：`npm run build:github`
- 发布目录：`dist`

### 7.2 子路径部署关键点

GSFR 不是挂在根路径，而是挂在：

- `/Global-Settlement-Feasibility-Radar-GSFR-/`

因此必须使用：

- `vite build --base=/Global-Settlement-Feasibility-Radar-GSFR-/`

否则会出现静态资源 404 或空白页。

### 7.3 rainhoole.com 的入口逻辑

`rainhoole.com` 当前主站来自 `MY_WEBSITE` 仓库。  
GSFR 使用 `MY_WEBSITE/GSFR/index.html` 做跳转入口：

- `https://rainhoole.com/GSFR` -> `https://rainhoole.com/GSFR/` -> GSFR 页面

## 8. V1 期间踩过的坑（必须记住）

1. 子路径 base 未设置导致空白页
- 现象：页面有标题但内容空白，控制台资源 404
- 根因：构建产物资源路径不正确
- 修复：引入 `build:github` + 自动化 Pages 工作流

2. 修改了 CSV 但页面不变
- 根因：运行时数据来自 `src/data/countries.json`
- 修复：更新 json 后再发布

3. 文本替换误改目标国家
- 根因：按位置替换而不是按 `code` 锚点替换
- 修复：按 `code=DK/SE/NO` 块级校验再提交

4. 缓存导致“看起来没更新”
- 现象：刚部署后仍看到旧页面
- 处理：`Ctrl+F5` 强刷，或带查询参数验证

## 9. V2 开发起点与规则

当前 V2 已开始，基于：

- 分支：`v2-dev`
- 基线标签：`v1.0.0`

建议规则：

- 所有 V2 功能先在 `v2-dev` 开发
- 变更前先确认“真实运行时数据源”
- 每次提交前至少执行 `npm run build`
- 涉及部署路径的改动必须验证 Pages 子路径

## 10. 常用操作清单

```bash
# 切到 V2 分支
git checkout v2-dev

# 本地开发
npm ci
npm run dev

# 构建验证
npm run build
npm run build:github

# 查看最近提交
git log --oneline -10

# 从 V1 回滚排查
git checkout v1.0.0
```

## 11. V1 -> V2 建议优先级

- P0：建立 `docs/*.csv -> src/data/countries.json` 自动同步流程
- P0：统一 UTF-8 编码并修复历史乱码字段
- P1：补充数据完整性校验脚本（占位符、空字段、枚举合法性）
- P1：增加基础自动化测试（筛选逻辑、关键组件渲染）
- P2：完善发布流程文档和变更日志

---

维护说明：当 V2 完成阶段性里程碑后，请更新本文档中的“版本快照、数据流和部署策略”章节，保持其作为团队入口文档的准确性。
