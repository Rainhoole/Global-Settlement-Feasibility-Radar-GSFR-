import { useMemo, useState } from 'react';
import type { CountryData } from '../types/country';
import { getColorByScore } from '../data';
import { flagEmoji, openfxBadgeColor, openfxLabel, scoreColor } from '../utils';
import { useI18n } from '../i18n';
import { isN8nPassed } from '../data/n8nPassedCodes';

type SortKey =
  | 'name'
  | 'region'
  | 'regulatory'
  | 'rails'
  | 'demand'
  | 'coverage'
  | 'feasibilityIndex'
  | 'openfx';
type SortDir = 'asc' | 'desc';

interface CountryTableProps {
  countries: CountryData[];
  onCountrySelect: (country: CountryData) => void;
  selectedCode?: string;
}

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Country' },
  { key: 'region', label: 'Region' },
  { key: 'regulatory', label: 'Reg' },
  { key: 'rails', label: 'Rails' },
  { key: 'demand', label: 'Demand' },
  { key: 'coverage', label: 'Coverage' },
  { key: 'feasibilityIndex', label: 'Index' },
  { key: 'openfx', label: 'OpenFX' },
];

function getSortValue(country: CountryData, key: SortKey): string | number {
  switch (key) {
    case 'name':
      return country.name;
    case 'region':
      return country.region;
    case 'regulatory':
      return country.scores.regulatory;
    case 'rails':
      return country.scores.rails;
    case 'demand':
      return country.scores.demand;
    case 'coverage':
      return country.scores.coverage;
    case 'feasibilityIndex':
      return country.feasibilityIndex;
    case 'openfx':
      return country.openfx.status;
    default:
      return 0;
  }
}

export function CountryTable({ countries, onCountrySelect, selectedCode }: CountryTableProps) {
  const { language, t } = useI18n();
  const [sortKey, setSortKey] = useState<SortKey>('feasibilityIndex');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const sorted = useMemo(() => {
    return [...countries].sort((a, b) => {
      const va = getSortValue(a, sortKey);
      const vb = getSortValue(b, sortKey);
      const cmp =
        typeof va === 'number' && typeof vb === 'number'
          ? va - vb
          : String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [countries, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDir(key === 'name' ? 'asc' : 'desc');
  }

  return (
    <div className="country-table-wrap">
      <table className="country-table">
        <thead>
          <tr>
            <th className="country-col-index">#</th>
            {COLUMNS.map((col) => (
              <th key={col.key} onClick={() => toggleSort(col.key)}>
                {t(col.label)}
                {sortKey === col.key && <span className="country-sort-arrow">{sortDir === 'asc' ? '↑' : '↓'}</span>}
              </th>
            ))}
            <th className="country-col-arrow" />
          </tr>
        </thead>

        <tbody>
          {sorted.map((country, idx) => {
            const isSelected = country.code === selectedCode;
            const primaryName = language === 'zh' ? country.name_zh : country.name;
            const secondaryName = language === 'zh' ? country.name : country.name_zh;

            return (
              <tr
                key={country.code}
                className={`country-row ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onCountrySelect(country)}
              >
                <td className="country-rank">{idx + 1}</td>

                <td className="country-name-cell">
                  <span className="country-flag">{flagEmoji(country.code)}</span>
                  <span className="country-name-wrap">
                    <span className="country-name">{primaryName}</span>
                    <span className="country-name-zh">{secondaryName}</span>
                    {isN8nPassed(country.code) && <span className="country-n8n-badge">{t('Source Review')}</span>}
                  </span>
                </td>

                <td>{t(country.region)}</td>

                {(['regulatory', 'rails', 'demand', 'coverage'] as const).map((key) => (
                  <td key={key} className="country-score-cell">
                    <span
                      className="country-score-badge"
                      style={{
                        backgroundColor: `${scoreColor(country.scores[key])}26`,
                        color: scoreColor(country.scores[key]),
                      }}
                    >
                      {country.scores[key]}
                    </span>
                  </td>
                ))}

                <td>
                  <div className="country-index-wrap">
                    <span
                      className="country-index-bar"
                      style={{ backgroundColor: getColorByScore(country.feasibilityIndex) }}
                    />
                    <span className="country-index-value">{country.feasibilityIndex}</span>
                  </div>
                </td>

                <td>
                  <span
                    className="country-openfx-badge"
                    style={{
                      backgroundColor: `${openfxBadgeColor(country.openfx.status)}26`,
                      color: openfxBadgeColor(country.openfx.status),
                    }}
                  >
                    {t(openfxLabel(country.openfx.status))}
                  </span>
                </td>

                <td className="country-arrow-cell">{t('View')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
