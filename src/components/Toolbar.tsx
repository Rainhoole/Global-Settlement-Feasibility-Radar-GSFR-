import type { Region } from '../types/country';
import { useI18n } from '../i18n';

export type FeasibilityFilter = 'ALL' | '80+' | '60-79' | '40-59' | '20-39' | '<20';
export type OpenfxFilter = 'ALL' | 'active' | 'just_launched' | 'coming_soon' | 'not_covered';
export type ViewMode = 'map' | 'table';

interface ToolbarProps {
  region: 'ALL' | Region;
  onRegionChange: (v: 'ALL' | Region) => void;
  feasibility: FeasibilityFilter;
  onFeasibilityChange: (v: FeasibilityFilter) => void;
  openfxFilter: OpenfxFilter;
  onOpenfxChange: (v: OpenfxFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  onSearchOpen: () => void;
  themeLabel: string;
}

const REGIONS: Array<'ALL' | Region> = [
  'ALL',
  'MENA',
  'SEA',
  'LATAM',
  'APAC',
  'EUROPE',
  'NORTH_AMERICA',
  'AFRICA',
];

const FEASIBILITY_OPTIONS: { value: FeasibilityFilter; label: string }[] = [
  { value: 'ALL', label: 'All Scores' },
  { value: '80+', label: '80+' },
  { value: '60-79', label: '60-79' },
  { value: '40-59', label: '40-59' },
  { value: '20-39', label: '20-39' },
  { value: '<20', label: '<20' },
];

const OPENFX_OPTIONS: { value: OpenfxFilter; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'just_launched', label: 'Just Launched' },
  { value: 'coming_soon', label: 'Coming Soon' },
  { value: 'not_covered', label: 'Not Covered' },
];

const REGION_LABELS: Record<Region, string> = {
  MENA: 'MENA',
  SEA: 'SEA',
  LATAM: 'LATAM',
  APAC: 'APAC',
  EUROPE: 'Europe',
  NORTH_AMERICA: 'North America',
  AFRICA: 'Africa',
};

function regionLabel(value: 'ALL' | Region): string {
  return value === 'ALL' ? 'All Regions' : REGION_LABELS[value];
}

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="toolbar-filter-row">
      <span className="toolbar-filter-label">{label}</span>
      <span className="toolbar-filter-sep">/</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="toolbar-select"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toolbar({
  region,
  onRegionChange,
  feasibility,
  onFeasibilityChange,
  openfxFilter,
  onOpenfxChange,
  viewMode,
  onViewModeChange,
  onSearchOpen,
  themeLabel,
}: ToolbarProps) {
  const { t } = useI18n();

  return (
    <section className="toolbar-panel">
      <div className="toolbar-identity">
        <p className="toolbar-kicker">GSFR / {t('Settlement Radar')}</p>
        <h1 className="toolbar-title">{t('Global Settlement Feasibility Radar')}</h1>
        <p className="toolbar-subtitle">
          {t('Structured signal board for country-level settlement readiness.')}
        </p>
      </div>

      <div className="rh-data-grid toolbar-theme-grid">
        <span className="rh-data-label">{t('Theme')}</span>
        <span className="rh-data-sep">&gt;</span>
        <span className="rh-data-value">{t(themeLabel)}</span>
      </div>

      <div className="rh-divider" />

      <div className="toolbar-filter-group">
        <FilterSelect
          label={t('Region')}
          value={region}
          options={REGIONS.map((r) => ({ value: r, label: t(regionLabel(r)) }))}
          onChange={onRegionChange}
        />

        <FilterSelect
          label={t('Feasibility')}
          value={feasibility}
          options={FEASIBILITY_OPTIONS.map((item) => ({ ...item, label: t(item.label) }))}
          onChange={onFeasibilityChange}
        />

        <FilterSelect
          label={t('OpenFX')}
          value={openfxFilter}
          options={OPENFX_OPTIONS.map((item) => ({ ...item, label: t(item.label) }))}
          onChange={onOpenfxChange}
        />
      </div>

      <div className="rh-divider" />

      <div className="toolbar-actions">
        <button
          type="button"
          className={`toolbar-action-btn ${viewMode === 'map' ? 'is-active' : ''}`}
          onClick={() => onViewModeChange('map')}
        >
          {t('Map')}
        </button>
        <button
          type="button"
          className={`toolbar-action-btn ${viewMode === 'table' ? 'is-active' : ''}`}
          onClick={() => onViewModeChange('table')}
        >
          {t('Table')}
        </button>
        <button type="button" className="toolbar-action-btn" onClick={onSearchOpen}>
          {t('Search')}
        </button>
      </div>

      <p className="toolbar-shortcut">{t('Shortcut: Ctrl+K / Cmd+K')}</p>
    </section>
  );
}
