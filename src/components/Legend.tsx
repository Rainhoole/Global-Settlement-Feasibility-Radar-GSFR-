import { OPENFX_MAP_COLOR_BY_STATUS } from '../data/openfxMap';
import { useI18n } from '../i18n';

const TIERS = [
  { key: 'active', color: OPENFX_MAP_COLOR_BY_STATUS.active, label: 'Active' },
  { key: 'just_launched', color: OPENFX_MAP_COLOR_BY_STATUS.just_launched, label: 'Just Launched / Beta' },
  { key: 'coming_soon', color: OPENFX_MAP_COLOR_BY_STATUS.coming_soon, label: 'Coming Soon' },
  { key: 'not_covered', color: OPENFX_MAP_COLOR_BY_STATUS.not_covered, label: 'Not Covered' },
] as const;

export function Legend() {
  const { t } = useI18n();

  return (
    <div className="legend-panel">
      <p className="legend-title">{t('OpenFX Coverage')}</p>
      <div className="legend-list">
        {TIERS.map((tier) => (
          <div key={tier.key} className="legend-item">
            <span className="legend-swatch" style={{ backgroundColor: tier.color }} />
            <span className="legend-text">{t(tier.label)}</span>
          </div>
        ))}
      </div>
      <p
        className="legend-note"
        title={t('Countries with incomplete source evidence are temporarily highlighted on the map.')}
      >
        {t('Border: Source Review')}
      </p>
    </div>
  );
}
