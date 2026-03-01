import type { CountryData } from '../types/country';
import { flagEmoji, scoreColor, openfxBadgeColor, openfxLabel } from '../utils';

interface TooltipProps {
  country: CountryData;
  x: number;
  y: number;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-10 text-[#94a3b8] shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-[#0f172a] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(value / 5) * 100}%`, backgroundColor: scoreColor(value) }}
        />
      </div>
      <span className="w-6 text-right text-[#e2e8f0]">{value}/5</span>
    </div>
  );
}

export function Tooltip({ country, x, y }: TooltipProps) {
  const offset = 12;
  const tooltipWidth = 280;
  const maxX = typeof window !== 'undefined' ? window.innerWidth - tooltipWidth - 20 : x;
  const maxY = typeof window !== 'undefined' ? window.innerHeight - 280 : y;

  const left = Math.min(x + offset, maxX);
  const top = y + offset > maxY ? y - 260 : y + offset;

  return (
    <div
      className="fixed z-50 pointer-events-none animate-[fadeIn_150ms_ease-out]"
      style={{ left, top, width: tooltipWidth }}
    >
      <div className="rounded-xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)]" style={{ backgroundColor: '#1e293b' }}>
        <div className="mb-3">
          <div className="text-sm font-semibold text-[#f8fafc]">
            {flagEmoji(country.code)} {country.name}
          </div>
          <div className="text-xs text-[#94a3b8]">{country.name_zh}</div>
        </div>

        <div className="mb-3 rounded-lg p-2" style={{ backgroundColor: '#111827' }}>
          <div className="text-xs text-[#94a3b8] mb-1">可行性指数</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#22d3ee' }}>
              {country.feasibilityIndex}
            </span>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-[#0f172a] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${country.feasibilityIndex}%`,
                    backgroundColor: '#22d3ee',
                  }}
                />
              </div>
              <div className="text-[10px] text-right text-[#94a3b8] mt-0.5">/100</div>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          <ScoreBar label="监管" value={country.scores.regulatory} />
          <ScoreBar label="Rails" value={country.scores.rails} />
          <ScoreBar label="需求" value={country.scores.demand} />
          <ScoreBar label="覆盖" value={country.scores.coverage} />
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{
              backgroundColor: openfxBadgeColor(country.openfx.status) + '20',
              color: openfxBadgeColor(country.openfx.status),
            }}
          >
            OpenFX: {openfxLabel(country.openfx.status)}
          </span>
          {country.openfx.currency && (
            <span className="text-xs text-[#94a3b8]">{country.openfx.currency}</span>
          )}
        </div>

        <div className="mt-2 text-[10px] text-[#64748b]">💡 点击查看详情</div>
      </div>
    </div>
  );
}
