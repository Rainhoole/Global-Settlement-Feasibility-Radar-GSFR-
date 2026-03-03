# Global Settlement Feasibility Radar (GSFR)

Interactive world map and country table for cross-border settlement feasibility.

## Snapshot

- Frontend: React + TypeScript + Vite
- Dataset: `142` countries (as of 2026-03-03)
- Views: map + table + searchable country detail panel
- Main source of runtime data: `src/data/countries.json`

## OpenFX Status Policy

OpenFX map color is data-driven from each country's `openfx.status`.

Current status buckets:

- `active`
- `just_launched`
- `coming_soon`
- `not_covered`

Policy currently applied in data:

- Active (explicit): `AE, AU, BR, GB, MX, US`
- Just launched: `PH, CO, AR`
- Coming soon: `CL, CA, HK, SG, ID, NZ, CH, IN, TR, SA, ZA, KR, DK, JP, NO, SE`
- Eurozone countries are also set to `active` with `EUR`
- All others default to `not_covered`

## Source Review Marker

Some countries are rendered with a highlighted border and a `Source Review` badge/tag.

- UI wording is intentionally neutral (no pipeline/provider wording)
- Meaning: source evidence for this country needs review or follow-up

## Project Structure

```text
app/
├─ src/
│  ├─ components/
│  ├─ data/
│  │  ├─ countries.json
│  │  ├─ countries.full.json
│  │  ├─ countries.launch100.json
│  │  └─ openfxMap.ts
│  ├─ types/
│  ├─ i18n.tsx
│  ├─ App.tsx
│  └─ index.css
├─ scripts/
├─ public/
├─ package.json
└─ vite.config.ts
```

## Local Development

Install dependencies:

```bash
npm ci
```

Start dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Preview build locally:

```bash
npm run preview
```

Build for GitHub Pages (repo sub-path base):

```bash
npm run build:github
```

Build zh translation bundle:

```bash
npm run i18n:build:zh
```

## Deployment

Repository is configured for GitHub Pages via workflow in `.github/workflows/`.

- Build output: `dist/`
- If deploying to repo sub-path, use `npm run build:github`

## Data Quality

Recommended checks before release:

1. Build frontend: `npm run build`
2. Validate country data in the workspace root scripts (if available)
3. Spot-check map legend and `Source Review` markers

