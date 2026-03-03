import type { CountryData } from '../types/country';
import { flagEmoji, scoreColor, openfxBadgeColor, openfxLabel } from '../utils';
import { useI18n } from '../i18n';
import { isN8nPassed } from '../data/n8nPassedCodes';

interface TooltipProps {
  country: CountryData;
  x: number;
  y: number;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="tooltip-score-row">
      <span className="tooltip-score-label">{label}</span>
      <div className="tooltip-score-track">
        <div
          className="tooltip-score-fill"
          style={{ width: `${(value / 5) * 100}%`, backgroundColor: scoreColor(value) }}
        />
      </div>
      <span className="tooltip-score-value">{value}/5</span>
    </div>
  );
}

export function Tooltip({ country, x, y }: TooltipProps) {
  const { language, t } = useI18n();
  const offset = 14;
  const tooltipWidth = 300;
  const tooltipHeight = 300;
  const maxX = typeof window !== 'undefined' ? window.innerWidth - tooltipWidth - 12 : x;
  const maxY = typeof window !== 'undefined' ? window.innerHeight - tooltipHeight - 12 : y;

  const left = Math.min(x + offset, maxX);
  const top = y + offset > maxY ? y - tooltipHeight : y + offset;
  const primaryName = language === 'zh' ? country.name_zh : country.name;
  const secondaryName = language === 'zh' ? country.name : country.name_zh;

  return (
    <div className="gsfr-tooltip" style={{ left, top, width: tooltipWidth }}>
      <div className="gsfr-tooltip-card">
        <div className="gsfr-tooltip-header">
          <p className="gsfr-tooltip-country">
            {flagEmoji(country.code)} {primaryName}
          </p>
          <p className="gsfr-tooltip-country-sub">{secondaryName}</p>
          {isN8nPassed(country.code) && <p className="gsfr-tooltip-n8n">{t('N8N Passed')}</p>}
        </div>

        <div className="gsfr-tooltip-index">
          <span className="gsfr-tooltip-index-label">{t('Feasibility Index')}</span>
          <div className="gsfr-tooltip-index-main">
            <span className="gsfr-tooltip-index-value">{country.feasibilityIndex}</span>
            <div className="gsfr-tooltip-index-bar">
              <span style={{ width: `${country.feasibilityIndex}%` }} />
            </div>
          </div>
        </div>

        <div className="gsfr-tooltip-scores">
          <ScoreBar label={t('Reg')} value={country.scores.regulatory} />
          <ScoreBar label={t('Rails')} value={country.scores.rails} />
          <ScoreBar label={t('Demand')} value={country.scores.demand} />
          <ScoreBar label={t('Coverage')} value={country.scores.coverage} />
        </div>

        <div className="gsfr-tooltip-meta">
          <span
            className="gsfr-tooltip-openfx"
            style={{
              backgroundColor: `${openfxBadgeColor(country.openfx.status)}26`,
              color: openfxBadgeColor(country.openfx.status),
            }}
          >
            OpenFX: {t(openfxLabel(country.openfx.status))}
          </span>
          {country.openfx.currency && <span className="gsfr-tooltip-currency">{country.openfx.currency}</span>}
        </div>
      </div>
    </div>
  );
}
