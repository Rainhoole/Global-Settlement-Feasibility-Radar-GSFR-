import type { Region } from '../types/country';

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
}

const REGIONS: Array<'ALL' | Region> = ['ALL', 'MENA', 'SEA', 'LATAM', 'APAC', 'EUROPE', 'NORTH_AMERICA', 'AFRICA'];

const FEASIBILITY_OPTIONS: { value: FeasibilityFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: '80+', label: '高可行 (80+)' },
  { value: '60-79', label: '中等可行 (60-79)' },
  { value: '40-59', label: '受限可行 (40-59)' },
  { value: '20-39', label: '低可行 (20-39)' },
  { value: '<20', label: '不可行 (<20)' },
];

const OPENFX_OPTIONS: { value: OpenfxFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'just_launched', label: 'Just Launched' },
  { value: 'coming_soon', label: 'Coming Soon' },
  { value: 'not_covered', label: 'Not Covered' },
];

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
    <div className="flex items-center gap-1.5">
      <label className="text-xs text-[#94a3b8] hidden lg:block">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="text-xs rounded-md border border-[#334155] px-2 py-1.5 text-[#e2e8f0] cursor-pointer"
        style={{ backgroundColor: '#1e293b' }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Toolbar({
  region, onRegionChange,
  feasibility, onFeasibilityChange,
  openfxFilter, onOpenfxChange,
  viewMode, onViewModeChange,
  onSearchOpen,
}: ToolbarProps) {
  return (
    <header
      className="h-16 flex items-center px-4 lg:px-6 gap-4 border-b shrink-0"
      style={{ backgroundColor: '#111827', borderColor: '#1e293b' }}
    >
      {/* Brand */}
      <div className="shrink-0 mr-2">
        <div className="text-base font-bold text-[#f8fafc] leading-tight">🌐 GSFR</div>
        <div className="text-[10px] text-[#64748b] leading-tight hidden sm:block">Global Settlement Feasibility Radar</div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-1 overflow-x-auto">
        <FilterSelect
          label="Region"
          value={region}
          options={REGIONS.map((r) => ({ value: r, label: r === 'ALL' ? 'All Regions' : r }))}
          onChange={onRegionChange}
        />
        <FilterSelect
          label="Feasibility"
          value={feasibility}
          options={FEASIBILITY_OPTIONS}
          onChange={onFeasibilityChange}
        />
        <FilterSelect
          label="OpenFX"
          value={openfxFilter}
          options={OPENFX_OPTIONS}
          onChange={onOpenfxChange}
        />
      </div>

      {/* View toggle + Search */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onViewModeChange('map')}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer border-none ${
            viewMode === 'map' ? 'text-white' : 'text-[#94a3b8] hover:text-[#e2e8f0]'
          }`}
          style={{ backgroundColor: viewMode === 'map' ? '#3b82f6' : 'transparent' }}
          title="Map View"
        >
          🗺️
        </button>
        <button
          onClick={() => onViewModeChange('table')}
          className={`px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer border-none ${
            viewMode === 'table' ? 'text-white' : 'text-[#94a3b8] hover:text-[#e2e8f0]'
          }`}
          style={{ backgroundColor: viewMode === 'table' ? '#3b82f6' : 'transparent' }}
          title="Table View"
        >
          📊
        </button>
        <button
          onClick={onSearchOpen}
          className="px-2.5 py-1.5 rounded-md text-xs text-[#94a3b8] hover:text-[#e2e8f0] cursor-pointer border-none bg-transparent"
          title="Search (Ctrl+K)"
        >
          🔍
        </button>
      </div>
    </header>
  );
}
