import { OPENFX_MAP_COLOR_BY_STATUS } from '../data/openfxMap';

const TIERS = [
  { key: 'active', color: OPENFX_MAP_COLOR_BY_STATUS.active, label: 'Active (OpenFX 已上线)' },
  { key: 'just_launched', color: OPENFX_MAP_COLOR_BY_STATUS.just_launched, label: 'Just Launched / Beta' },
  { key: 'coming_soon', color: OPENFX_MAP_COLOR_BY_STATUS.coming_soon, label: 'Coming Soon (路线图)' },
  { key: 'not_covered', color: OPENFX_MAP_COLOR_BY_STATUS.not_covered, label: '无覆盖 / 数据不足' },
] as const;

export function Legend() {
  return (
    <div
      className="absolute bottom-4 left-4 z-10 rounded-xl p-3 text-xs backdrop-blur-sm"
      style={{ backgroundColor: '#111827cc' }}
    >
      <div className="text-[#f8fafc] font-semibold mb-2">OpenFX Coverage</div>
      <div className="space-y-1.5">
        {TIERS.map((tier) => (
          <div key={tier.key} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: tier.color }}
            />
            <span className="text-[#e2e8f0]">{tier.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
