# Global Settlement Feasibility Radar — MVP 开发计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 构建一个基于世界地图的 Web 端 "全球航运即时结算可行性雷达"（Global Settlement Feasibility Radar），展示各国在监管、清算基础设施、需求规模、供应商覆盖等维度的可行性评分，并支持点击国家查看详情。

**Architecture:** 纯前端 SPA + 静态 JSON 数据（MVP 阶段不需要后端服务器）。前端使用 React + TypeScript，地图使用 react-simple-maps（基于 D3 + TopoJSON，免费开源，无需 API Key）。数据以 JSON 文件形式存储在项目中，后续可替换为 API。评分模型在前端计算。

**Tech Stack:**
- **框架:** React 18 + TypeScript + Vite
- **地图:** react-simple-maps (基于 D3/TopoJSON, 开源免费)
- **UI:** Tailwind CSS 4
- **数据:** 静态 JSON (MVP), 后续可接 PostgreSQL API
- **部署:** Vercel / Netlify (静态部署)

---

## 产品概述

### 核心用户场景
1. 用户打开网页，看到世界地图，每个国家按"可行性指数"着色（绿/黄/橙/红/灰）
2. 鼠标悬停国家，显示国名 + 可行性指数快速预览
3. 点击国家，右侧弹出详情面板，展示：
   - 四维评分雷达图（监管/基础设施/需求/覆盖度）
   - 结构化合规数据（外汇制度、稳定币监管、SWIFT、制裁等）
   - 所有数据的来源链接
   - OpenFX 支持状态（Active/Just Launched/Coming Soon/未覆盖）
4. 顶部支持按"可行性等级"和"区域"筛选
5. 支持列表视图（Table View），方便比较多个国家

### 数据模型（MVP 首批 30 国）

每个国家包含以下字段：

```typescript
interface CountryData {
  // 基础信息
  code: string;              // ISO 3166-1 alpha-2 (e.g. "AE")
  name: string;              // 英文名
  name_zh: string;           // 中文名
  region: "MENA" | "SEA" | "LATAM" | "APAC" | "EUROPE" | "NORTH_AMERICA" | "AFRICA";

  // 四维评分 (1-5)
  scores: {
    regulatory: number;       // 监管开放度
    rails: number;            // 清算基础设施成熟度
    demand: number;           // 跨境资金流需求
    coverage: number;         // 现有供应商覆盖度 (分高=已有较多覆盖)
  };

  // 可行性指数 (计算得出)
  feasibilityIndex: number;   // 0-100

  // OpenFX 状态
  openfx: {
    status: "active" | "just_launched" | "coming_soon" | "not_covered";
    currency?: string;         // 币种代码
    eta?: string;              // 上线时间 (Coming Soon)
    localRails?: string;       // 本地支付系统名称
  };

  // 模块一：外汇制度
  fxRegime: {
    currentAccountConvertible: "yes" | "partial" | "no" | "unknown";
    capitalControl: "open" | "partial" | "strict" | "unknown";
    crossBorderRestriction: string;
    forcedLocalClearing: boolean | null;
    regulationName: string;
    regulatorBody: string;
    lastUpdated: string;
    sourceUrl: string;
  };

  // 模块二：数字资产监管
  digitalAsset: {
    legalStatus: "legal" | "gray" | "prohibited" | "unknown";
    stablecoinStatus: "regulated" | "allowed" | "restricted" | "prohibited" | "unknown";
    bankCryptoPolicy: string;
    hasFramework: boolean | null;
    sourceUrl: string;
  };

  // 模块三：清算基础设施
  infrastructure: {
    swiftMember: boolean;
    hasRTGS: boolean;
    rtgsName?: string;
    hasForeignBanks: boolean;
    primaryClearingCurrency: string[];
    centralBankUrl: string;
  };

  // 模块四：制裁与合规
  sanctions: {
    ofacListed: boolean;
    euRestricted: boolean;
    ukRestricted: boolean;
    riskLevel: "low" | "medium" | "high" | "critical";
  };

  // 模块五：航运指标
  shipping: {
    portThroughputTEU?: number;  // 年吞吐量 (TEU)
    shippingRank?: number;
    unctadSource?: string;
  };

  // 数据来源
  sources: {
    type: string;
    institution: string;
    url: string;
    lastVerified: string;
  }[];
}
```

### 可行性指数计算
```
feasibilityIndex = (regulatory/5 * 30) + (rails/5 * 25) + (demand/5 * 25) + ((5-coverage)/5 * 20)
```
- 监管权重 30%：合规是底线
- 基础设施权重 25%：有 rails 才能落地
- 需求权重 25%：需求驱动 ROI
- 覆盖度（反向）权重 20%：覆盖少=机会大

### 颜色映射
| 分值区间 | 颜色 | 含义 |
|---------|------|------|
| 80-100  | 深绿 #22c55e | 高可行性 - 一线机会 |
| 60-79   | 浅绿 #86efac | 中等可行 - 二线机会 |
| 40-59   | 黄色 #facc15 | 受限可行 - 长期候选 |
| 20-39   | 橙色 #f97316 | 低可行性 - 高风险 |
| 0-19    | 红色 #ef4444 | 不可行 - 暂不考虑 |
| N/A     | 灰色 #d1d5db | 数据不足 |

---

## 任务拆解

### Task 1: 项目初始化 — Vite + React + TypeScript + Tailwind

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `tailwind.config.js` (如 Tailwind 4 需要)

**Step 1: 使用 Vite 创建 React + TypeScript 项目**

```bash
cd "e:/全球外汇地图项目"
npm create vite@latest app -- --template react-ts
```

**Step 2: 进入项目目录，安装依赖**

```bash
cd "e:/全球外汇地图项目/app"
npm install
```

**Step 3: 安装 Tailwind CSS**

```bash
npm install -D tailwindcss @tailwindcss/vite
```

配置 `vite.config.ts` 加入 Tailwind 插件，在 `src/index.css` 中添加 `@import "tailwindcss";`。

**Step 4: 安装地图库和其他依赖**

```bash
npm install react-simple-maps d3-geo
npm install -D @types/d3-geo
```

**Step 5: 验证开发服务器启动**

```bash
npm run dev
```

Expected: 浏览器打开 localhost 能看到 Vite + React 默认页面。

**Step 6: Commit**

```bash
git init
git add .
git commit -m "chore: init project with Vite + React + TypeScript + Tailwind + react-simple-maps"
```

---

### Task 2: 数据层 — 国家数据 JSON 与 TypeScript 类型定义

**Files:**
- Create: `src/types/country.ts` — TypeScript 接口定义
- Create: `src/data/countries.json` — 首批国家数据（10 国先行）
- Create: `src/data/index.ts` — 数据加载与计算逻辑

**Step 1: 创建 TypeScript 类型文件 `src/types/country.ts`**

按上方数据模型定义所有 interface。

**Step 2: 创建首批 10 国数据 `src/data/countries.json`**

首批优先国家（基于调研文档）：
1. UAE (AE) — Regulatory: 5, Rails: 5, Demand: 5, Coverage: 4
2. Philippines (PH) — Regulatory: 4, Rails: 5, Demand: 5, Coverage: 3
3. Mexico (MX) — Regulatory: 3, Rails: 5, Demand: 5, Coverage: 3
4. Brazil (BR) — Regulatory: 4, Rails: 5, Demand: 4, Coverage: 3
5. Hong Kong (HK) — Regulatory: 4, Rails: 5, Demand: 5, Coverage: 4
6. Saudi Arabia (SA) — Regulatory: 2, Rails: 4, Demand: 5, Coverage: 2
7. United States (US) — Regulatory: 3, Rails: 4, Demand: 5, Coverage: 5
8. United Kingdom (GB) — Regulatory: 4, Rails: 5, Demand: 4, Coverage: 5
9. Australia (AU) — Regulatory: 4, Rails: 5, Demand: 3, Coverage: 4
10. Singapore (SG) — Regulatory: 5, Rails: 5, Demand: 4, Coverage: 4

每个国家需包含完整的五大模块数据和来源链接。数据来自 `idea.md` 和 `openfx...md` 中已有的研究成果。

**Step 3: 创建数据加载与评分计算工具 `src/data/index.ts`**

```typescript
import countriesRaw from './countries.json';
import type { CountryData } from '../types/country';

export function calculateFeasibility(scores: CountryData['scores']): number {
  const { regulatory, rails, demand, coverage } = scores;
  return Math.round(
    (regulatory / 5) * 30 +
    (rails / 5) * 25 +
    (demand / 5) * 25 +
    ((5 - coverage) / 5) * 20
  );
}

export function getColorByScore(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#86efac';
  if (score >= 40) return '#facc15';
  if (score >= 20) return '#f97316';
  if (score >= 0) return '#ef4444';
  return '#d1d5db';
}

export const countries: CountryData[] = (countriesRaw as CountryData[]).map(c => ({
  ...c,
  feasibilityIndex: calculateFeasibility(c.scores),
}));
```

**Step 4: 验证数据加载**

在 `App.tsx` 中临时 `console.log(countries)` 确认数据加载正确，打开浏览器 Console 检查。

**Step 5: Commit**

```bash
git add src/types/ src/data/
git commit -m "feat: add country data model, first 10 countries data, and scoring logic"
```

---

### Task 3: 地图组件 — 世界地图渲染与国家着色

**Files:**
- Create: `src/components/WorldMap.tsx` — 世界地图主组件
- Modify: `src/App.tsx` — 集成地图

**Step 1: 创建 WorldMap 组件**

```typescript
// src/components/WorldMap.tsx
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { countries, getColorByScore } from '../data';
import type { CountryData } from '../types/country';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface WorldMapProps {
  onCountryClick: (country: CountryData) => void;
  onCountryHover: (country: CountryData | null) => void;
  filteredCodes?: Set<string>;
}

export function WorldMap({ onCountryClick, onCountryHover, filteredCodes }: WorldMapProps) {
  // 构建 ISO numeric -> CountryData 的映射
  // react-simple-maps 使用 ISO 3166-1 numeric 码
  // 需要维护一个 alpha2 -> numeric 的映射表

  return (
    <ComposableMap projection="geoMercator" projectionConfig={{ scale: 140, center: [0, 30] }}>
      <ZoomableGroup>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const countryData = findCountryByGeoId(geo.id);
              const isFiltered = !filteredCodes || (countryData && filteredCodes.has(countryData.code));
              const fillColor = countryData && isFiltered
                ? getColorByScore(countryData.feasibilityIndex)
                : '#d1d5db';

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillColor}
                  stroke="#fff"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#60a5fa', cursor: 'pointer' },
                    pressed: { outline: 'none' },
                  }}
                  onClick={() => countryData && onCountryClick(countryData)}
                  onMouseEnter={() => countryData && onCountryHover(countryData)}
                  onMouseLeave={() => onCountryHover(null)}
                />
              );
            })
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
}
```

**Step 2: 创建 ISO 国家代码映射工具**

Create `src/data/countryCodeMap.ts` — 将 ISO 3166-1 numeric 码映射到 alpha-2 码（react-simple-maps 的 TopoJSON 使用 numeric ID）。

**Step 3: 在 App.tsx 中集成地图**

```typescript
import { WorldMap } from './components/WorldMap';
// 全屏地图布局
```

**Step 4: 验证地图渲染**

启动 dev server，确认世界地图正确显示，已有数据的国家有颜色着色。

**Step 5: Commit**

```bash
git add src/components/WorldMap.tsx src/data/countryCodeMap.ts src/App.tsx
git commit -m "feat: add world map with country coloring by feasibility score"
```

---

### Task 4: 悬浮提示 — Tooltip 组件

**Files:**
- Create: `src/components/Tooltip.tsx`
- Modify: `src/App.tsx` — 集成 Tooltip

**Step 1: 创建 Tooltip 组件**

鼠标悬停在国家上时，跟随鼠标显示一个小卡片：
- 国名（中英文）
- 可行性指数分值
- OpenFX 状态标签
- 四维评分条形图

```typescript
// src/components/Tooltip.tsx
interface TooltipProps {
  country: CountryData;
  position: { x: number; y: number };
}
```

**Step 2: 在 App.tsx 中追踪鼠标位置并传给 Tooltip**

使用 `onMouseMove` 事件获取坐标。

**Step 3: 验证悬浮效果**

鼠标在地图上移动，Tooltip 应跟随并显示对应国家信息。

**Step 4: Commit**

```bash
git add src/components/Tooltip.tsx src/App.tsx
git commit -m "feat: add hover tooltip showing country summary and scores"
```

---

### Task 5: 详情面板 — 国家详情侧边栏

**Files:**
- Create: `src/components/CountryDetail.tsx` — 详情面板主组件
- Create: `src/components/ScoreRadar.tsx` — 四维评分可视化（简单 CSS 条形图）
- Create: `src/components/DataModule.tsx` — 单个数据模块展示组件
- Modify: `src/App.tsx`

**Step 1: 创建 ScoreRadar 组件**

四维评分的水平条形图可视化（不引入额外图表库，用 CSS 实现）：
- 监管开放度: █████ 5/5
- 清算基础设施: ████░ 4/5
- 需求规模: █████ 5/5
- 覆盖度: ██░░░ 2/5

**Step 2: 创建 DataModule 组件**

可复用的"数据模块"卡片，展示每个评估模块（外汇制度、数字资产、基础设施、制裁、航运）的结构化字段，每个字段旁显示来源链接图标。

**Step 3: 创建 CountryDetail 主面板**

右侧滑出面板（占屏幕 40% 宽度），包含：
- 标题栏：国旗 emoji + 国名 + 可行性指数大数字
- OpenFX 状态标签（Active/Coming Soon 等）
- ScoreRadar 四维评分图
- 五个 DataModule 卡片
- 底部来源列表

**Step 4: 集成到 App.tsx**

点击地图上的国家 → 设置 `selectedCountry` state → 显示 CountryDetail 面板。

**Step 5: 验证详情面板**

点击 UAE，右侧弹出详情面板，展示完整数据和来源链接。

**Step 6: Commit**

```bash
git add src/components/CountryDetail.tsx src/components/ScoreRadar.tsx src/components/DataModule.tsx src/App.tsx
git commit -m "feat: add country detail panel with scores, data modules, and source links"
```

---

### Task 6: 筛选与图例 — 顶部工具栏

**Files:**
- Create: `src/components/Toolbar.tsx` — 顶部筛选栏
- Create: `src/components/Legend.tsx` — 颜色图例
- Modify: `src/App.tsx`

**Step 1: 创建 Legend 组件**

地图右下角显示颜色图例：
- 🟢 高可行 (80-100)
- 🟩 中等可行 (60-79)
- 🟡 受限可行 (40-59)
- 🟠 低可行 (20-39)
- 🔴 不可行 (0-19)
- ⬜ 数据不足

**Step 2: 创建 Toolbar 组件**

顶部导航栏包含：
- 产品标题 "Global Settlement Feasibility Radar"
- 区域筛选下拉：All / MENA / SEA / LATAM / APAC / EUROPE / NORTH_AMERICA / AFRICA
- 可行性等级筛选：All / 高可行 / 中等可行 / 受限可行 / 低可行 / 不可行
- OpenFX 状态筛选：All / Active / Just Launched / Coming Soon / Not Covered
- 视图切换：地图视图 / 列表视图

**Step 3: 在 App.tsx 中实现筛选逻辑**

使用 `useState` 管理筛选状态，将过滤后的国家列表传给 WorldMap。

**Step 4: 验证筛选功能**

选择 "MENA" 区域 → 只有 UAE 和 SA 着色，其他变灰。

**Step 5: Commit**

```bash
git add src/components/Toolbar.tsx src/components/Legend.tsx src/App.tsx
git commit -m "feat: add toolbar with region, feasibility, and OpenFX status filters"
```

---

### Task 7: 列表视图 — 国家对比表格

**Files:**
- Create: `src/components/CountryTable.tsx`
- Modify: `src/App.tsx`

**Step 1: 创建 CountryTable 组件**

表格列包含：
| 国家 | 区域 | 监管 | Rails | 需求 | 覆盖度 | 可行性指数 | OpenFX | 操作 |

支持按列排序。点击行可打开详情面板。

```typescript
// 表头可点击排序
// 可行性指数列用颜色背景标识
// OpenFX 状态列用标签样式
```

**Step 2: 在 App.tsx 中实现视图切换**

Toolbar 中的视图切换按钮控制显示 `WorldMap` 还是 `CountryTable`。

**Step 3: 验证列表视图**

切换到列表视图，确认所有国家按可行性指数排序。点击行打开详情。

**Step 4: Commit**

```bash
git add src/components/CountryTable.tsx src/App.tsx
git commit -m "feat: add country comparison table view with sorting"
```

---

### Task 8: 补齐数据 — 扩展至 30 国

**Files:**
- Modify: `src/data/countries.json` — 新增 20 国数据

**Step 1: 新增以下 20 个国家数据**

基于文档中的 OpenFX Coming Soon 列表和航运重要国家：

11. Germany (DE) — 欧元区代表
12. France (FR) — 欧元区 + CMA CGM 总部
13. Netherlands (NL) — 鹿特丹港
14. Colombia (CO) — OpenFX Just Launched
15. Argentina (AR) — OpenFX Just Launched
16. Chile (CL) — OpenFX Coming Soon Q1 2026
17. India (IN) — OpenFX Coming Soon Q3 2026
18. Indonesia (ID) — OpenFX Coming Soon Q2 2026
19. South Africa (ZA) — OpenFX Coming Soon Q3 2026
20. Turkey (TR) — OpenFX Coming Soon Q3 2026
21. South Korea (KR) — OpenFX Coming Soon Q3 2026
22. Japan (JP) — OpenFX Coming Soon Q4 2026
23. Canada (CA) — OpenFX Coming Soon Q2 2026
24. Switzerland (CH) — OpenFX Coming Soon Q2 2026
25. New Zealand (NZ) — OpenFX Coming Soon Q2 2026
26. Panama (PA) — 巴拿马运河枢纽
27. Egypt (EG) — 苏伊士运河
28. Malaysia (MY) — 马六甲海峡
29. Nigeria (NG) — 非洲航运枢纽
30. Kenya (KE) — 东非航运枢纽

每个国家按 idea.md 中的 SOP 模板填入结构化数据。对于无法确认的字段标注 `"unknown"`。

**Step 2: 验证数据完整性**

在列表视图中确认 30 国全部显示，无数据缺失导致的渲染错误。

**Step 3: Commit**

```bash
git add src/data/countries.json
git commit -m "feat: expand country database to 30 countries"
```

---

### Task 9: 走廊视图 — A→B 路线查询（可选增强）

**Files:**
- Create: `src/components/CorridorQuery.tsx`
- Modify: `src/App.tsx`

**Step 1: 创建走廊查询组件**

两个下拉选择框：
- 出发国 (From)
- 目的国 (To)

选择后显示：
- 两国的可行性对比
- 该走廊的综合评分 = min(fromRegulatory, toRegulatory) × min(fromRails, toRails) ...
- OpenFX 是否两端都支持
- 理论结算速度对比（传统 vs 新型通道）
- 风险提示（若任一端有制裁或强管制）

**Step 2: 在地图上可视化走廊**

选择两国后，在地图上画一条连线（使用 `<Line>` 组件），颜色反映走廊可行性。

**Step 3: 验证走廊查询**

选择 UAE → Philippines，确认显示两国评分对比和走廊综合评估。

**Step 4: Commit**

```bash
git add src/components/CorridorQuery.tsx src/App.tsx
git commit -m "feat: add corridor A-to-B query with route visualization"
```

---

### Task 10: 响应式布局与样式收尾

**Files:**
- Modify: `src/App.tsx` — 整体布局
- Modify: `src/index.css` — 全局样式
- Create: `public/favicon.svg` — 产品 icon

**Step 1: 整体布局调整**

```
┌─────────────────────────────────────────────────┐
│  Toolbar (筛选栏)                                │
├─────────────────────────────────┬───────────────┤
│                                 │               │
│    World Map / Table View       │  Detail Panel  │
│    (60%)                        │  (40%)         │
│                                 │               │
│                                 │               │
├─────────────────────────────────┴───────────────┤
│  Legend + Status Bar                             │
└─────────────────────────────────────────────────┘
```

无详情面板时地图占满整个宽度；点击国家后右侧滑出面板。

**Step 2: 移动端适配**

- 小屏幕下详情面板变为底部抽屉
- Toolbar 筛选折叠为汉堡菜单

**Step 3: 深色主题**

默认深色背景（#0f172a），地图用深色调，信息面板用半透明深灰，营造"作战室/情报系统"视觉感。

**Step 4: 验证在不同屏幕尺寸下的表现**

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: finalize responsive layout and dark theme"
```

---

### Task 11: 构建与部署

**Files:**
- Create: `vercel.json` 或 `netlify.toml` (部署配置)
- Modify: `package.json` — 确认 build script

**Step 1: 构建生产版本**

```bash
npm run build
```

Expected: `dist/` 目录生成，无报错。

**Step 2: 本地预览**

```bash
npm run preview
```

确认构建产物正常运行。

**Step 3: 部署配置**

创建 `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

**Step 4: Commit**

```bash
git add vercel.json
git commit -m "chore: add deployment config"
```

---

## 里程碑时间线

| 里程碑 | 任务 | 预计时间 |
|--------|------|----------|
| M1: 可跑起来的地图 | Task 1-3 | 第 1 天 |
| M2: 可交互的原型 | Task 4-6 | 第 2 天 |
| M3: 完整 MVP | Task 7-8 | 第 3 天 |
| M4: 走廊查询增强 | Task 9 | 第 4 天 |
| M5: 样式与部署 | Task 10-11 | 第 5 天 |

## 后续扩展方向（MVP 之后）

1. **后端 API + PostgreSQL** — 替换静态 JSON，支持 CRUD 和版本历史
2. **AI 数据采集** — 按 idea.md 中的 SOP，用 AI 逐国研究并填充数据
3. **实时情报层** — 监管变化预警、外汇政策更新推送
4. **航运公司/港口叠加层** — 地图上标注 DP World、GAC、Monjasa 等目标客户
5. **走廊路径优化引擎** — 输入航线+货值+币种，输出最优结算路径
6. **数据导出** — 生成 PDF/CSV 国家评估报告
7. **用户系统** — 登录、权限、收藏、自定义评分模型
