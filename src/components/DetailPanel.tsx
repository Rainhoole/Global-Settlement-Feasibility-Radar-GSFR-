import { useState, type CSSProperties, type ReactNode } from 'react';
import type { CountryData } from '../types/country';
import { flagEmoji, scoreColor, openfxBadgeColor, openfxLabel } from '../utils';
import { useI18n } from '../i18n';

interface DetailPanelProps {
  country: CountryData;
  onClose: () => void;
}

type StatusTone = 'positive' | 'warning' | 'negative' | 'neutral';

function normalizeState(value: string | boolean | null | undefined): StatusTone {
  if (value === true || value === 'yes' || value === 'legal' || value === 'open' || value === 'regulated') {
    return 'positive';
  }
  if (value === 'partial' || value === 'gray' || value === 'allowed') {
    return 'warning';
  }
  if (value === false || value === 'no' || value === 'prohibited' || value === 'strict' || value === 'restricted') {
    return 'negative';
  }
  return 'neutral';
}

function stateLabel(value: string | boolean | null | undefined, trueText = 'Yes', falseText = 'No'): string {
  if (typeof value === 'boolean') {
    return value ? trueText : falseText;
  }
  if (value === null || value === undefined || value === 'unknown') {
    return 'Unknown';
  }

  switch (value) {
    case 'yes':
      return 'Yes';
    case 'no':
      return 'No';
    case 'partial':
      return 'Partial';
    case 'legal':
      return 'Legal';
    case 'gray':
      return 'Gray Area';
    case 'prohibited':
      return 'Prohibited';
    case 'open':
      return 'Open';
    case 'strict':
      return 'Strict';
    case 'regulated':
      return 'Regulated';
    case 'allowed':
      return 'Allowed';
    case 'restricted':
      return 'Restricted';
    default:
      return value;
  }
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="detail-score-row">
      <span className="detail-score-label">{label}</span>
      <div className="detail-score-track">
        <div className="detail-score-fill" style={{ width: `${(value / 5) * 100}%`, backgroundColor: scoreColor(value) }} />
      </div>
      <span className="detail-score-value">{value}/5</span>
    </div>
  );
}

function FieldRow({
  label,
  value,
  raw,
}: {
  label: string;
  value: string;
  raw?: string | boolean | null;
}) {
  const { t } = useI18n();
  const tone = raw === undefined ? 'neutral' : normalizeState(raw);

  return (
    <div className="detail-field-row">
      <span className="detail-field-label">{t(label)}</span>
      <span className={`detail-field-value tone-${tone}`}>{t(value)}</span>
    </div>
  );
}

function ModuleCard({
  title,
  accent,
  children,
  sourceUrl,
}: {
  title: string;
  accent: string;
  children: ReactNode;
  sourceUrl?: string;
}) {
  const { t } = useI18n();
  const [showSource, setShowSource] = useState(false);
  const style = { '--module-accent': accent } as CSSProperties;

  return (
    <section className="detail-module" style={style}>
      <div className="detail-module-head">
        <h4>{t(title)}</h4>
        {sourceUrl && (
          <button type="button" className="detail-module-source-btn" onClick={() => setShowSource((v) => !v)}>
            {t('Source')}
          </button>
        )}
      </div>

      <div className="detail-module-body">{children}</div>

      {showSource && sourceUrl && (
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="detail-module-source-link">
          {sourceUrl}
        </a>
      )}
    </section>
  );
}

function RiskBadge({ level }: { level: CountryData['sanctions']['riskLevel'] }) {
  const { t } = useI18n();
  return <span className={`risk-badge risk-${level}`}>{t(level.toUpperCase())}</span>;
}

export function DetailPanel({ country, onClose }: DetailPanelProps) {
  const { language, t } = useI18n();

  return (
    <aside className="detail-panel">
      <div className="detail-panel-top">
        <button type="button" className="detail-close-btn" onClick={onClose}>
          {t('Close')}
        </button>
      </div>

      <div className="detail-panel-body">
        <header className="detail-country-head">
          <h2>
            {flagEmoji(country.code)} {language === 'zh' ? country.name_zh : country.name}
          </h2>
          <p>{language === 'zh' ? country.name : country.name_zh}</p>
        </header>

        <section className="detail-index-card">
          <span className="detail-index-label">{t('Feasibility Index')}</span>
          <div className="detail-index-row">
            <strong>{country.feasibilityIndex}</strong>
            <div className="detail-index-track">
              <span style={{ width: `${country.feasibilityIndex}%` }} />
            </div>
          </div>
        </section>

        <section className="detail-tag-row">
          <span
            className="detail-tag"
            style={{
              backgroundColor: `${openfxBadgeColor(country.openfx.status)}26`,
              color: openfxBadgeColor(country.openfx.status),
            }}
          >
            OpenFX: {t(openfxLabel(country.openfx.status))}
          </span>
          <span className="detail-tag">{t(country.region)}</span>
          {country.openfx.currency && <span className="detail-tag">{country.openfx.currency}</span>}
          {country.openfx.eta && <span className="detail-tag">ETA: {country.openfx.eta}</span>}
        </section>

        <section className="detail-score-list">
          <ScoreBar label={t('Regulatory')} value={country.scores.regulatory} />
          <ScoreBar label={t('Rails')} value={country.scores.rails} />
          <ScoreBar label={t('Demand')} value={country.scores.demand} />
          <ScoreBar label={t('Coverage')} value={country.scores.coverage} />
        </section>

        <ModuleCard title="FX Regime" accent="#4F8CFF" sourceUrl={country.fxRegime.sourceUrl}>
          <FieldRow
            label="Current Account Convertibility"
            raw={country.fxRegime.currentAccountConvertible}
            value={stateLabel(country.fxRegime.currentAccountConvertible)}
          />
          <FieldRow
            label="Capital Account Control"
            raw={country.fxRegime.capitalControl}
            value={stateLabel(country.fxRegime.capitalControl)}
          />
          <FieldRow label="Cross-border Restriction" value={country.fxRegime.crossBorderRestriction} />
          <FieldRow
            label="Forced Local Clearing"
            raw={country.fxRegime.forcedLocalClearing}
            value={stateLabel(country.fxRegime.forcedLocalClearing)}
          />
          <FieldRow label="Regulator" value={country.fxRegime.regulatorBody} />
          <FieldRow label="Last Updated" value={country.fxRegime.lastUpdated} />
        </ModuleCard>

        <ModuleCard title="Digital Asset Policy" accent="#A888F7" sourceUrl={country.digitalAsset.sourceUrl}>
          <FieldRow
            label="Legal Status"
            raw={country.digitalAsset.legalStatus}
            value={stateLabel(country.digitalAsset.legalStatus)}
          />
          <FieldRow
            label="Stablecoin"
            raw={country.digitalAsset.stablecoinStatus}
            value={stateLabel(country.digitalAsset.stablecoinStatus)}
          />
          <FieldRow label="Bank Participation" value={country.digitalAsset.bankCryptoPolicy} />
          <FieldRow
            label="Dedicated Framework"
            raw={country.digitalAsset.hasFramework}
            value={stateLabel(country.digitalAsset.hasFramework)}
          />
        </ModuleCard>

        <ModuleCard title="Banking Infrastructure" accent="#5FD7D0" sourceUrl={country.infrastructure.centralBankUrl}>
          <FieldRow
            label="SWIFT Member"
            raw={country.infrastructure.swiftMember}
            value={stateLabel(country.infrastructure.swiftMember)}
          />
          <FieldRow
            label="RTGS"
            raw={country.infrastructure.hasRTGS}
            value={country.infrastructure.rtgsName ?? stateLabel(country.infrastructure.hasRTGS)}
          />
          <FieldRow
            label="Foreign Banks"
            raw={country.infrastructure.hasForeignBanks}
            value={stateLabel(country.infrastructure.hasForeignBanks)}
          />
          <FieldRow label="Primary Clearing Currency" value={country.infrastructure.primaryClearingCurrency.join(', ')} />
        </ModuleCard>

        <ModuleCard title="Sanctions & Compliance" accent="#F59B4A">
          <FieldRow label="OFAC Listed" raw={country.sanctions.ofacListed} value={stateLabel(country.sanctions.ofacListed)} />
          <FieldRow label="EU Restricted" raw={country.sanctions.euRestricted} value={stateLabel(country.sanctions.euRestricted)} />
          <FieldRow label="UK Restricted" raw={country.sanctions.ukRestricted} value={stateLabel(country.sanctions.ukRestricted)} />
          <div className="detail-field-row">
            <span className="detail-field-label">{t('Risk Level')}</span>
            <RiskBadge level={country.sanctions.riskLevel} />
          </div>
        </ModuleCard>

        <ModuleCard title="Shipping Signals" accent="#62CC6A" sourceUrl={country.shipping.unctadSource}>
          {country.shipping.portThroughputTEU ? (
            <FieldRow
              label="Port Throughput"
              value={`${(country.shipping.portThroughputTEU / 1_000_000).toFixed(1)}M TEU / year`}
            />
          ) : null}

          {country.shipping.shippingRank ? (
            <FieldRow label="Global Rank" value={`#${country.shipping.shippingRank}`} />
          ) : null}

          {!country.shipping.portThroughputTEU && !country.shipping.shippingRank && (
            <FieldRow label="Shipping Data" value="No structured value" />
          )}
        </ModuleCard>

        {country.sources.length > 0 && (
          <section className="detail-module" style={{ '--module-accent': '#8B8B8B' } as CSSProperties}>
            <div className="detail-module-head">
              <h4>{t('Sources')}</h4>
            </div>
            <div className="detail-source-list">
              {country.sources.map((src, index) => (
                <article key={`${src.url}-${index}`} className="detail-source-item">
                  <p>
                    {t(src.institution)} · {src.lastVerified}
                  </p>
                  <a href={src.url} target="_blank" rel="noopener noreferrer">
                    {src.url}
                  </a>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </aside>
  );
}
