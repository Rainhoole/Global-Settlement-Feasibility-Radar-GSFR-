import { useMemo, useState } from 'react';
import type { CountryData } from '../types/country';
import { getColorByScore } from '../data';
import { flagEmoji, openfxBadgeColor, openfxLabel, scoreColor } from '../utils';

type SortKey = 'name' | 'region' | 'regulatory' | 'rails' | 'demand' | 'coverage' | 'feasibilityIndex' | 'openfx';
type SortDir = 'asc' | 'desc';

interface CountryTableProps {
  countries: CountryData[];
  onCountrySelect: (country: CountryData) => void;
  selectedCode?: string;
}

const COLUMNS: { key: SortKey; label: string; short: string }[] = [
  { key: 'name', label: '国家', short: '国家' },
  { key: 'region', label: '区域', short: '区域' },
  { key: 'regulatory', label: '监管', short: '监管' },
  { key: 'rails', label: 'Rails', short: 'Rails' },
  { key: 'demand', label: '需求', short: '需求' },
  { key: 'coverage', label: '覆盖度', short: '覆盖' },
  { key: 'feasibilityIndex', label: '可行性指数', short: '指数' },
  { key: 'openfx', label: 'OpenFX', short: 'OpenFX' },
];

function getSortValue(country: CountryData, key: SortKey): string | number {
  switch (key) {
    case 'name': return country.name;
    case 'region': return country.region;
    case 'regulatory': return country.scores.regulatory;
    case 'rails': return country.scores.rails;
    case 'demand': return country.scores.demand;
    case 'coverage': return country.scores.coverage;
    case 'feasibilityIndex': return country.feasibilityIndex;
    case 'openfx': return country.openfx.status;
    default: return 0;
  }
}

export function CountryTable({ countries, onCountrySelect, selectedCode }: CountryTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('feasibilityIndex');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    return [...countries].sort((a, b) => {
      const va = getSortValue(a, sortKey);
      const vb = getSortValue(b, sortKey);
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [countries, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-[#334155]">
            <th className="text-left text-xs font-medium text-[#94a3b8] px-3 py-3 w-8">#</th>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className="text-left text-xs font-medium text-[#94a3b8] px-3 py-3 cursor-pointer hover:text-[#e2e8f0] select-none whitespace-nowrap"
              >
                {col.short}
                {sortKey === col.key && (
                  <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            ))}
            <th className="text-left text-xs font-medium text-[#94a3b8] px-3 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((country, idx) => {
            const isSelected = country.code === selectedCode;
            return (
              <tr
                key={country.code}
                onClick={() => onCountrySelect(country)}
                className="border-b border-[#1e293b] cursor-pointer hover:bg-[#334155] transition-colors"
                style={{
                  borderLeft: isSelected ? '3px solid #3b82f6' : '3px solid transparent',
                }}
              >
                <td className="px-3 py-2.5 text-[#64748b]">{idx + 1}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span>{flagEmoji(country.code)}</span>
                    <div>
                      <div className="text-[#f8fafc] font-medium">{country.name}</div>
                      <div className="text-xs text-[#64748b]">{country.name_zh}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-[#94a3b8]">{country.region}</td>
                {(['regulatory', 'rails', 'demand', 'coverage'] as const).map((key) => (
                  <td key={key} className="px-3 py-2.5 text-center">
                    <span
                      className="inline-block w-7 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: scoreColor(country.scores[key]) + '25',
                        color: scoreColor(country.scores[key]),
                      }}
                    >
                      {country.scores[key]}
                    </span>
                  </td>
                ))}
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1 h-5 rounded-full"
                      style={{ backgroundColor: getColorByScore(country.feasibilityIndex) }}
                    />
                    <span
                      className="font-bold"
                      style={{ fontFamily: "'JetBrains Mono', monospace", color: '#22d3ee' }}
                    >
                      {country.feasibilityIndex}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap"
                    style={{
                      backgroundColor: openfxBadgeColor(country.openfx.status) + '20',
                      color: openfxBadgeColor(country.openfx.status),
                    }}
                  >
                    {openfxLabel(country.openfx.status)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className="text-[#94a3b8] hover:text-[#f8fafc]" title="查看详情">👁️</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
