# Global Settlement Feasibility Radar (GSFR)

全球跨境结算可行性雷达。项目以世界地图和数据表形式展示各国家/地区在跨境结算场景下的可行性评估、OpenFX 覆盖状态、监管与基础设施信息。

## 当前版本

- 当前稳定基线：`V1`
- 版本号：`1.0.0`
- Git 标签：`v1.0.0`
- 线上地址：`https://rainhoole.com/Global-Settlement-Feasibility-Radar-GSFR-/`

> 后续 `V2` 建议从 `v1.0.0` 标签创建分支开始开发，确保 V1 可随时回溯。

## 核心功能

- 世界地图可视化（按 OpenFX 覆盖状态着色）
- 地区、可行性分数、OpenFX 状态多维筛选
- 地图/表格双视图切换
- 国家搜索（`Ctrl+K / Cmd+K`）
- 国家详情侧栏（监管、数字资产、清算基础设施、航运等）

## 技术栈

- `React 18`
- `TypeScript`
- `Vite`
- `Tailwind CSS`
- `react-simple-maps` + `d3-geo`
- `GitHub Actions` + `GitHub Pages`

## 项目结构

```text
app/
├─ src/
│  ├─ components/         # 地图、表格、筛选、详情面板等组件
│  ├─ data/               # 前端运行时数据（countries.json 等）
│  ├─ types/              # 类型定义
│  └─ App.tsx             # 主入口页面逻辑
├─ docs/                  # 研究与规划文档、CSV 数据表
├─ .github/workflows/     # GitHub Pages 自动部署
├─ package.json
└─ vite.config.ts
```

## 本地开发

### 1) 安装依赖

```bash
npm ci
```

### 2) 启动开发环境

```bash
npm run dev
```

### 3) 构建

```bash
npm run build
```

### 4) GitHub Pages 构建（带子路径 base）

```bash
npm run build:github
```

## 部署说明（GitHub Pages）

已配置自动部署工作流：`.github/workflows/deploy-pages.yml`

- 触发条件：推送到 `master`
- 构建命令：`npm run build:github`
- 发布目录：`dist`

> 本项目部署在子路径 `/Global-Settlement-Feasibility-Radar-GSFR-/`，必须使用 `build:github`，否则会出现静态资源 404。

## 数据说明

- 前端页面当前直接读取：`src/data/countries.json`
- 研究数据和资料维护在：`docs/*.csv`

当前 `docs/*.csv` 与 `src/data/countries.json` 之间仍是“人工同步”关系，尚未自动化。

## V2 开发建议

### 建议流程

1. 从 V1 标签创建开发分支：

```bash
git checkout -b v2-dev v1.0.0
```

2. 在 `v2-dev` 开发与验证，稳定后再合并到主分支。
3. V2 发布时打新标签（如 `v2.0.0`）。

### 建议优先项

- 建立 `docs/*.csv -> src/data/countries.json` 自动转换脚本
- 统一中文编码，清理历史乱码字段
- 补充基础测试（数据完整性检查、关键组件渲染）
- 增加变更日志（`CHANGELOG.md`）

## 许可证

当前仓库未声明许可证；如需开源分发，建议补充 `LICENSE` 文件。
