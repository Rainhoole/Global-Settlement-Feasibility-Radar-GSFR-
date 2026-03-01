# Full UI Implementation Plan — Global Settlement Feasibility Radar

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the scaffold Vite+React+TS+Tailwind app into the full "war room" radar UI per the design spec, with dark theme, tooltip, detail panel, toolbar, legend, table view, and complete data for 30 countries + ~200 country code mappings.

**Architecture:** Single-page React app using `react-simple-maps` for the world map. All data is local JSON (no backend API). State is managed via React hooks in App.tsx. Components: WorldMap, Tooltip, DetailPanel, Toolbar, Legend, CountryTable, SearchModal. Tailwind 4 utility classes for all styling (no separate CSS files beyond index.css).

**Tech Stack:** Vite 7, React 18, TypeScript strict, Tailwind CSS 4 (`@tailwindcss/vite`), react-simple-maps 3, d3-geo

---

## Task Dependency Graph

```
Task 1 (countryCodeMap) ──┐
                          ├── Task 3 (dark theme) ── Task 4 (tooltip) ── Task 5 (legend)
Task 2 (countries.json) ──┘           │
                                      ├── Task 6 (detail panel)
                                      └── Task 7 (toolbar) ── Task 8 (table view)
```

Tasks 1 & 2 are parallelizable data-only tasks. Tasks 3-8 are sequential UI work.

---

### Task 1: Expand countryCodeMap.ts to ~200 countries

**Files:**
- Modify: `app/src/data/countryCodeMap.ts`

**Step 1: Replace the `isoNumericToAlpha2` object**

Replace the 10-entry map with a complete ISO 3166-1 numeric→alpha2 mapping covering all ~200 countries that appear in the `world-atlas@2/countries-110m.json` TopoJSON.

Key mappings to ensure are present (beyond the existing 10):
```
'032': 'AR', '152': 'CL', '170': 'CO', '356': 'IN', '360': 'ID',
'392': 'JP', '404': 'KE', '410': 'KR', '124': 'CA', '276': 'DE',
'528': 'NL', '250': 'FR', '554': 'NZ', '566': 'NG', '591': 'PA',
'710': 'ZA', '756': 'CH', '792': 'TR', '818': 'EG', '458': 'MY'
```

Plus all other countries (~180 more) so that ALL geo features on the map have a valid alpha2 code lookup, even if we don't have data for them in countries.json.

Reference: https://en.wikipedia.org/wiki/ISO_3166-1_numeric — use the standard mapping.

**Step 2: Verify**

Run: `cd app && npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**
```bash
git add app/src/data/countryCodeMap.ts
git commit -m "data: expand countryCodeMap to ~200 ISO numeric codes"
```

---

### Task 2: Expand countries.json with 20 new countries

**Files:**
- Modify: `app/src/data/countries.json`

**Step 1: Add 20 country entries**

Add full structured data for these 20 countries: CO, AR, CL, IN, ID, ZA, TR, KR, JP, CA, CH, NZ, DE, FR, NL, PA, EG, MY, NG, KE.

Each entry must follow the exact `CountryData` type from `app/src/types/country.ts`. Use the scores from the design spec table (section 8 of `docs/frontend-design-spec.md`):

| Code | name | name_zh | region | reg | rails | demand | coverage | openfx status |
|------|------|---------|--------|-----|-------|--------|----------|---------------|
| CO | Colombia | 哥伦比亚 | LATAM | 3 | 4 | 4 | 2 | just_launched |
| AR | Argentina | 阿根廷 | LATAM | 3 | 3 | 4 | 2 | just_launched |
| CL | Chile | 智利 | LATAM | 4 | 4 | 3 | 2 | coming_soon |
| IN | India | 印度 | APAC | 3 | 5 | 5 | 3 | coming_soon |
| ID | Indonesia | 印度尼西亚 | SEA | 3 | 4 | 4 | 2 | coming_soon |
| ZA | South Africa | 南非 | AFRICA | 3 | 4 | 3 | 2 | coming_soon |
| TR | Turkey | 土耳其 | MENA | 2 | 4 | 4 | 2 | coming_soon |
| KR | South Korea | 韩国 | APAC | 3 | 5 | 3 | 4 | coming_soon |
| JP | Japan | 日本 | APAC | 3 | 5 | 4 | 5 | coming_soon |
| CA | Canada | 加拿大 | NORTH_AMERICA | 4 | 4 | 3 | 4 | coming_soon |
| CH | Switzerland | 瑞士 | EUROPE | 5 | 5 | 3 | 4 | coming_soon |
| NZ | New Zealand | 新西兰 | APAC | 4 | 4 | 2 | 3 | coming_soon |
| DE | Germany | 德国 | EUROPE | 4 | 5 | 4 | 5 | active |
| FR | France | 法国 | EUROPE | 4 | 5 | 4 | 5 | active |
| NL | Netherlands | 荷兰 | EUROPE | 4 | 5 | 4 | 5 | active |
| PA | Panama | 巴拿马 | LATAM | 4 | 3 | 3 | 1 | not_covered |
| EG | Egypt | 埃及 | MENA | 2 | 3 | 4 | 1 | not_covered |
| MY | Malaysia | 马来西亚 | SEA | 3 | 4 | 3 | 2 | coming_soon |
| NG | Nigeria | 尼日利亚 | AFRICA | 2 | 3 | 4 | 1 | not_covered |
| KE | Kenya | 肯尼亚 | AFRICA | 3 | 4 | 3 | 1 | not_covered |

For each country, populate reasonable fxRegime, digitalAsset, infrastructure, sanctions, shipping, and sources data consistent with the country's profile. Use the existing 10 entries as templates for the data structure. Set `feasibilityIndex: 0` (computed at load time).

ETAs for coming_soon countries per the design spec: CL=Q1, CH/ID/NZ/CA=Q2, SA/IN/TR/ZA/KR=Q3, JP=Q4.

**Step 2: Verify**

Run: `cd app && npx tsc --noEmit`
Expected: No type errors

**Step 3: Commit**
```bash
git add app/src/data/countries.json
git commit -m "data: add 20 countries (30 total)"
```

---

### Task 3: Dark theme overhaul + color fix

**Files:**
- Modify: `app/src/index.css` — add dark body bg, font imports
- Modify: `app/src/data/index.ts` — fix `getColorByScore` colors
- Modify: `app/src/components/WorldMap.tsx` — fix border/fill colors
- Modify: `app/src/App.tsx` — change layout bg classes

**Step 1: Fix `getColorByScore` in `data/index.ts`**

Change:
- `#86efac` → `#4ade80` (60-79 range per design spec)
- Default `#d1d5db` → `#374151` (N/A per design spec)

**Step 2: Update `index.css`**

Add to index.css:
```css
body {
  background-color: #0a0f1e;
}
```

Import Inter font (Google Fonts link in index.html `<head>`):
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
```

**Step 3: Update WorldMap.tsx**

- Change unfilled country fill from `'#d1d5db'` to `'#1e293b'`
- Change stroke from `'#ffffff'` to `'#1e293b'`
- Keep hover behavior but change hover fill for countries with data to a brighter version
- Add hover white border highlight (stroke: white, strokeWidth: 2 on hover for data countries)

**Step 4: Update App.tsx**

- Change `bg-slate-950` → use inline style `backgroundColor: '#0a0f1e'` or add a custom Tailwind class
- Remove the max-w-7xl constraint on the map section — map should fill viewport width
- Remove the sidebar grid layout (the sidebar will be replaced by tooltip + detail panel)
- Remove `border border-slate-800 bg-slate-900` wrapper around map — map ocean should blend with page bg

**Step 5: Verify**

Run: `cd app && npm run dev` — visually confirm dark theme, correct colors, no gray countries on dark bg.

**Step 6: Commit**
```bash
git add app/src/index.css app/src/data/index.ts app/src/components/WorldMap.tsx app/src/App.tsx app/index.html
git commit -m "ui: dark war-room theme overhaul"
```

---

### Task 4: Tooltip component (mouse-following)

**Files:**
- Create: `app/src/components/Tooltip.tsx`
- Modify: `app/src/components/WorldMap.tsx` — pass mouse position
- Modify: `app/src/App.tsx` — render Tooltip, track mouse coords

**Step 1: Create Tooltip.tsx**

The tooltip must:
- Follow the mouse cursor with offset (12px, 12px)
- Be 280px wide, auto height
- Show: flag emoji + country name (EN) + name_zh + feasibility index (large, cyan `#22d3ee`, mono font) + 4 score bars (horizontal, colored by value) + OpenFX status badge + "💡 点击查看详情" hint
- Background: `#1e293b`, border-radius 12px, box-shadow `0 8px 32px rgba(0,0,0,0.5)`
- Fade in 150ms animation
- Stay within viewport bounds (flip position if near edges)
- Use `position: fixed` with `pointer-events: none`

Flag emoji mapping: create a small utility `flagEmoji(code: string)` that converts alpha2 to flag emoji using Unicode regional indicator symbols.

Score bar colors: 5=`#22c55e`, 4=`#4ade80`, 3=`#facc15`, 2=`#f97316`, 1=`#ef4444`

OpenFX badge: colored pill with status text. Colors per design spec: active=#22c55e, just_launched=#3b82f6, coming_soon=#a78bfa, not_covered=#6b7280.

**Step 2: Update WorldMap.tsx**

Add `onMouseMove` handler to each Geography to capture mouse position and pass it up.
Update the `WorldMapProps` interface to include `onMouseMove: (e: React.MouseEvent) => void`.

**Step 3: Update App.tsx**

- Track `mousePos: { x: number; y: number }` state
- Render `<Tooltip>` component when `hoveredCountry` is not null, passing country data and mousePos
- Remove the old sidebar "Country Snapshot" section

**Step 4: Verify**

Run: `cd app && npm run dev` — hover countries, tooltip follows mouse with correct data.

**Step 5: Commit**
```bash
git add app/src/components/Tooltip.tsx app/src/components/WorldMap.tsx app/src/App.tsx
git commit -m "feat: mouse-following tooltip with scores and OpenFX badge"
```

---

### Task 5: Legend component

**Files:**
- Create: `app/src/components/Legend.tsx`
- Modify: `app/src/App.tsx` — render Legend on map view

**Step 1: Create Legend.tsx**

- Position: bottom-left of map area, absolute/fixed
- Background: `#111827cc` (semi-transparent), `backdrop-blur-sm`, 12px border-radius
- Content: "可行性指数" title + 6 rows, each with colored circle (12px) + label + score range
- Tiers: 80-100 #22c55e "高可行", 60-79 #4ade80 "中等可行", 40-59 #facc15 "受限可行", 20-39 #f97316 "低可行", 0-19 #ef4444 "不可行", N/A #374151 "数据不足"

**Step 2: Add Legend to App.tsx**

Render inside the map container div with `position: absolute; bottom: 16px; left: 16px`.

**Step 3: Verify**

Run: `cd app && npm run dev` — legend visible bottom-left, colors correct.

**Step 4: Commit**
```bash
git add app/src/components/Legend.tsx app/src/App.tsx
git commit -m "feat: legend component with feasibility color tiers"
```

---

### Task 6: Detail Panel redesign

**Files:**
- Create: `app/src/components/DetailPanel.tsx`
- Modify: `app/src/App.tsx` — render DetailPanel, handle open/close

**Step 1: Create DetailPanel.tsx**

480px wide panel that slides in from the right side of the viewport.

Structure (top to bottom):
1. **Top bar**: Close button (✕) top-right
2. **Country header**: Flag + name + name_zh
3. **Feasibility index**: Large number in `#22d3ee` (JetBrains Mono), progress bar, /100
4. **Status tags row**: OpenFX badge + currency + region
5. **4-score bars**: regulatory, rails, demand, coverage — horizontal bars with labels
6. **5 data module cards** (collapsible):
   - FX Regime (blue left border `#3b82f6`)
   - Digital Asset Regulation (purple left border `#a78bfa`)
   - Banking & Clearing Infrastructure (cyan left border `#22d3ee`)
   - Sanctions & Compliance (orange left border `#f97316`)
   - Shipping Metrics (green left border `#22c55e`)
7. **Sources summary** at bottom

Each module card:
- Background `#1e293b`, 12px border-radius, 2px left colored border
- Field rows: label (gray `#94a3b8`) left, value (white `#e2e8f0`) right + status icon
- Collapsible "📎 来源 ›" section
- Status icons: yes/legal/open=✅ green, partial/gray=🟡 yellow, no/prohibited=❌ red, unknown=❓ gray

Animation: `translateX(100%)` → `translateX(0)` in 300ms ease-out on open, reverse 200ms ease-in on close.

Panel must be scrollable internally (overflow-y: auto).

**Step 2: Update App.tsx**

- Render `<DetailPanel>` when `selectedCountry` is not null
- Map area should NOT shrink when panel opens (panel overlays the map)
- Add click handler on map background to close panel
- Remove old sidebar "Selected Country" section

**Step 3: Verify**

Run: `cd app && npm run dev` — click country, panel slides in with all data, close button works.

**Step 4: Commit**
```bash
git add app/src/components/DetailPanel.tsx app/src/App.tsx
git commit -m "feat: slide-in detail panel with 5 data modules"
```

---

### Task 7: Toolbar enhancement

**Files:**
- Create: `app/src/components/Toolbar.tsx`
- Create: `app/src/components/SearchModal.tsx`
- Modify: `app/src/App.tsx` — add filter state, view toggle, search

**Step 1: Create Toolbar.tsx**

64px height, background `#111827`, bottom border `1px solid #1e293b`.

Layout (left to right):
1. **Left**: "🌐 GSFR" logo text (large) + "Global Settlement Feasibility Radar" subtitle
2. **Center**: 3 filter dropdowns:
   - Region: All / MENA / SEA / LATAM / APAC / EUROPE / NORTH_AMERICA / AFRICA
   - Feasibility: All / 80+ / 60-79 / 40-59 / 20-39 / <20
   - OpenFX Status: All / Active / Just Launched / Coming Soon / Not Covered
3. **Right**: View toggle buttons (Map 🗺️ / Table 📊) + Search button 🔍

Props:
- `region`, `onRegionChange`
- `feasibilityFilter`, `onFeasibilityChange`
- `openfxFilter`, `onOpenfxChange`
- `viewMode: 'map' | 'table'`, `onViewModeChange`
- `onSearchOpen`

Active view button highlighted with `#3b82f6` background.

Filter dropdowns: dark styled selects with `bg-[#1e293b]` background.

**Step 2: Create SearchModal.tsx**

Command-palette style search:
- Triggered by clicking search button or Ctrl+K / Cmd+K
- Centered overlay with backdrop blur
- Input field with real-time filtering by English name, Chinese name, or ISO code
- Results list showing: flag + name + name_zh + feasibility score + OpenFX badge
- Click result → close search + select country (open detail panel)
- Esc to close

**Step 3: Update App.tsx**

- Replace old header with `<Toolbar>`
- Add state: `feasibilityFilter`, `openfxFilter`, `viewMode`
- Update `filteredCodes` logic to include all 3 filters
- Add keyboard listener for Cmd+K / Ctrl+K to open search
- Render `<SearchModal>` when search is open

**Step 4: Verify**

Run: `cd app && npm run dev` — all filters work, view toggle switches, search opens with Cmd+K.

**Step 5: Commit**
```bash
git add app/src/components/Toolbar.tsx app/src/components/SearchModal.tsx app/src/App.tsx
git commit -m "feat: toolbar with filters, view toggle, and search"
```

---

### Task 8: Country Table view

**Files:**
- Create: `app/src/components/CountryTable.tsx`
- Modify: `app/src/App.tsx` — conditionally render table or map

**Step 1: Create CountryTable.tsx**

Full-width table with columns: #, Country (flag+name+name_zh), Region, Regulatory, Rails, Demand, Coverage, Feasibility Index (with color bar), OpenFX Status (colored badge), Action (eye icon to open detail).

Features:
- Sortable by clicking column headers (toggle asc/desc)
- Default sort: feasibility index descending
- Current sort column shows arrow indicator
- Feasibility index column: number with colored bar (same colors as map)
- Score columns (1-5): background intensity reflects value (darker = higher)
- Row hover: background `#334155`
- Selected row (currently open in detail panel): left 3px blue border
- Clickable rows open the detail panel

Props:
- `countries: CountryData[]` (already filtered by App.tsx)
- `onCountrySelect: (country: CountryData) => void`
- `selectedCode?: string`

**Step 2: Update App.tsx**

- When `viewMode === 'table'`, render `<CountryTable>` instead of `<WorldMap>` + `<Legend>`
- Pass filtered countries list and select handler

**Step 3: Verify**

Run: `cd app && npm run dev` — toggle to table view, sorting works, clicking row opens detail panel.

**Step 4: Commit**
```bash
git add app/src/components/CountryTable.tsx app/src/App.tsx
git commit -m "feat: sortable country table view"
```

---

## Final Verification

After all tasks:
1. `cd app && npx tsc --noEmit` — no type errors
2. `cd app && npm run build` — builds successfully
3. `cd app && npm run dev` — manual verification:
   - Dark theme, correct colors on map
   - All 30 countries colored, rest dark gray
   - Tooltip follows mouse with scores
   - Detail panel slides in on click
   - Legend shows in bottom-left
   - Filters work (region, feasibility, OpenFX)
   - Table view shows sorted data
   - Search (Cmd+K) finds countries
   - No console errors
