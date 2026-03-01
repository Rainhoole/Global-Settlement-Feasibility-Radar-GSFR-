import { useState } from 'react';
import type { CountryData } from '../types/country';
import { flagEmoji, scoreColor, openfxBadgeColor, openfxLabel } from '../utils';

interface DetailPanelProps {
  country: CountryData;
  onClose: () => void;
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-[#94a3b8] shrink-0">{label}</span>
      <div className="flex-1 h-2.5 rounded-full bg-[#0f172a] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(value / 5) * 100}%`, backgroundColor: scoreColor(value) }}
        />
      </div>
      <span className="w-6 text-sm text-right font-medium text-[#e2e8f0]">{value}/5</span>
    </div>
  );
}

function StatusIcon({ value }: { value: string | boolean | null }) {
  if (value === true || value === 'yes' || value === 'legal' || value === 'open' || value === 'regulated')
    return <span className="text-[#22c55e]">✅</span>;
  if (value === 'partial' || value === 'gray' || value === 'allowed')
    return <span className="text-[#facc15]">🟡</span>;
  if (value === false || value === 'no' || value === 'prohibited' || value === 'strict' || value === 'restricted')
    return <span className="text-[#ef4444]">❌</span>;
  return <span className="text-[#6b7280]">❓</span>;
}

function FieldRow({ label, value, raw }: { label: string; value: string; raw?: string | boolean | null }) {
  return (
    <div className="flex items-start justify-between gap-2 py-1.5">
      <span className="text-sm text-[#94a3b8]">{label}</span>
      <span className="text-sm text-[#e2e8f0] text-right flex items-center gap-1.5">
        {raw !== undefined && <StatusIcon value={raw} />}
        {value}
      </span>
    </div>
  );
}

function ModuleCard({
  title,
  borderColor,
  children,
  sourceUrl,
}: {
  title: string;
  borderColor: string;
  children: React.ReactNode;
  sourceUrl?: string;
}) {
  const [showSource, setShowSource] = useState(false);

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: '#1e293b', borderLeft: `3px solid ${borderColor}` }}
    >
      <h4 className="text-sm font-semibold text-[#f8fafc] mb-3">{title}</h4>
      {children}
      {sourceUrl && (
        <div className="mt-2 border-t border-[#334155] pt-2">
          <button
            onClick={() => setShowSource(!showSource)}
            className="text-xs text-[#60a5fa] hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            📎 来源 {showSource ? '▾' : '›'}
          </button>
          {showSource && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-[#60a5fa] hover:underline mt-1 break-all"
            >
              {sourceUrl}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, { text: string; bg: string }> = {
    low: { text: '#22c55e', bg: '#22c55e15' },
    medium: { text: '#facc15', bg: '#facc1515' },
    high: { text: '#f97316', bg: '#f9731615' },
    critical: { text: '#ef4444', bg: '#ef444415' },
  };
  const c = colors[level] || colors.medium;
  const label = level === 'low' ? '🟢 低' : level === 'medium' ? '🟡 中' : level === 'high' ? '🟠 高' : '🔴 严重';
  return (
    <span className="text-xs px-2 py-0.5 rounded" style={{ color: c.text, backgroundColor: c.bg }}>
      {label}
    </span>
  );
}

export function DetailPanel({ country, onClose }: DetailPanelProps) {
  return (
    <div
      className="fixed top-0 right-0 h-full z-40 overflow-y-auto animate-[slideIn_300ms_ease-out]"
      style={{ width: 480, backgroundColor: '#111827' }}
    >
      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-end p-4" style={{ backgroundColor: '#111827' }}>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#334155] cursor-pointer bg-transparent border-none text-lg"
        >
          ✕
        </button>
      </div>

      <div className="px-6 pb-6 space-y-5">
        {/* Country header */}
        <div>
          <h2 className="text-xl font-bold text-[#f8fafc]">
            {flagEmoji(country.code)} {country.name}
          </h2>
          <p className="text-sm text-[#94a3b8]">{country.name_zh}</p>
        </div>

        {/* Feasibility Index */}
        <div className="rounded-xl p-4" style={{ backgroundColor: '#1e293b' }}>
          <div className="text-xs text-[#94a3b8] uppercase tracking-wider mb-1">Feasibility Index</div>
          <div className="flex items-end gap-3">
            <span
              className="text-5xl font-bold leading-none"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: '#22d3ee' }}
            >
              {country.feasibilityIndex}
            </span>
            <div className="flex-1 pb-2">
              <div className="h-3 rounded-full bg-[#0f172a] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${country.feasibilityIndex}%`, backgroundColor: '#22d3ee' }}
                />
              </div>
              <div className="text-xs text-right text-[#94a3b8] mt-0.5">/100</div>
            </div>
          </div>
        </div>

        {/* Status tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-md"
            style={{
              backgroundColor: openfxBadgeColor(country.openfx.status) + '20',
              color: openfxBadgeColor(country.openfx.status),
            }}
          >
            OpenFX: {openfxLabel(country.openfx.status)}
          </span>
          {country.openfx.currency && (
            <span className="text-xs px-2.5 py-1 rounded-md bg-[#334155] text-[#e2e8f0]">
              {country.openfx.currency}
            </span>
          )}
          <span className="text-xs px-2.5 py-1 rounded-md bg-[#334155] text-[#e2e8f0]">
            {country.region}
          </span>
          {country.openfx.eta && (
            <span className="text-xs px-2.5 py-1 rounded-md bg-[#334155] text-[#94a3b8]">
              ETA: {country.openfx.eta}
            </span>
          )}
        </div>

        {/* Score bars */}
        <div className="space-y-2.5">
          <ScoreBar label="监管开放度" value={country.scores.regulatory} />
          <ScoreBar label="清算基础设施" value={country.scores.rails} />
          <ScoreBar label="跨境需求规模" value={country.scores.demand} />
          <ScoreBar label="供应商覆盖度" value={country.scores.coverage} />
        </div>

        {/* Module 1: FX Regime */}
        <ModuleCard title="外汇制度" borderColor="#3b82f6" sourceUrl={country.fxRegime.sourceUrl}>
          <div className="divide-y divide-[#334155]">
            <FieldRow label="贸易外汇可自由兑换" value={country.fxRegime.currentAccountConvertible === 'yes' ? '是' : country.fxRegime.currentAccountConvertible === 'partial' ? '部分' : '否'} raw={country.fxRegime.currentAccountConvertible} />
            <FieldRow label="资本项目开放程度" value={country.fxRegime.capitalControl === 'open' ? '开放' : country.fxRegime.capitalControl === 'partial' ? '部分开放' : '严格管制'} raw={country.fxRegime.capitalControl} />
            <FieldRow label="跨境限制" value={country.fxRegime.crossBorderRestriction} />
            <FieldRow label="强制本地清算" value={country.fxRegime.forcedLocalClearing === true ? '是' : country.fxRegime.forcedLocalClearing === false ? '否' : '未确认'} raw={country.fxRegime.forcedLocalClearing} />
            <FieldRow label="监管机构" value={country.fxRegime.regulatorBody} />
          </div>
        </ModuleCard>

        {/* Module 2: Digital Asset */}
        <ModuleCard title="数字资产监管" borderColor="#a78bfa" sourceUrl={country.digitalAsset.sourceUrl}>
          <div className="divide-y divide-[#334155]">
            <FieldRow label="数字资产合法性" value={country.digitalAsset.legalStatus === 'legal' ? '合法' : country.digitalAsset.legalStatus === 'gray' ? '灰色地带' : '禁止'} raw={country.digitalAsset.legalStatus} />
            <FieldRow label="稳定币监管状态" value={country.digitalAsset.stablecoinStatus} raw={country.digitalAsset.stablecoinStatus} />
            <FieldRow label="银行参与加密业务" value={country.digitalAsset.bankCryptoPolicy} />
            <FieldRow label="专门监管框架" value={country.digitalAsset.hasFramework ? '有' : country.digitalAsset.hasFramework === false ? '无' : '未确认'} raw={country.digitalAsset.hasFramework} />
          </div>
        </ModuleCard>

        {/* Module 3: Infrastructure */}
        <ModuleCard title="银行与清算基础设施" borderColor="#22d3ee" sourceUrl={country.infrastructure.centralBankUrl}>
          <div className="divide-y divide-[#334155]">
            <FieldRow label="SWIFT 成员" value={country.infrastructure.swiftMember ? '是' : '否'} raw={country.infrastructure.swiftMember} />
            <FieldRow label="实时支付系统" value={country.infrastructure.rtgsName || (country.infrastructure.hasRTGS ? '有' : '无')} raw={country.infrastructure.hasRTGS} />
            <FieldRow label="外资银行运营" value={country.infrastructure.hasForeignBanks ? '是' : '否'} raw={country.infrastructure.hasForeignBanks} />
            <FieldRow label="主要清算货币" value={country.infrastructure.primaryClearingCurrency.join(', ')} />
          </div>
        </ModuleCard>

        {/* Module 4: Sanctions */}
        <ModuleCard title="制裁与合规风险" borderColor="#f97316">
          <div className="divide-y divide-[#334155]">
            <FieldRow label="OFAC 制裁" value={country.sanctions.ofacListed ? '是' : '否'} raw={!country.sanctions.ofacListed} />
            <FieldRow label="欧盟金融限制" value={country.sanctions.euRestricted ? '是' : '否'} raw={!country.sanctions.euRestricted} />
            <FieldRow label="英国制裁" value={country.sanctions.ukRestricted ? '是' : '否'} raw={!country.sanctions.ukRestricted} />
            <div className="flex items-center justify-between py-1.5">
              <span className="text-sm text-[#94a3b8]">风险级别</span>
              <RiskBadge level={country.sanctions.riskLevel} />
            </div>
          </div>
        </ModuleCard>

        {/* Module 5: Shipping */}
        <ModuleCard title="航运规模指标" borderColor="#22c55e" sourceUrl={country.shipping.unctadSource}>
          <div className="divide-y divide-[#334155]">
            {country.shipping.portThroughputTEU && (
              <FieldRow
                label="港口吞吐量"
                value={`${(country.shipping.portThroughputTEU / 1000000).toFixed(1)} 百万 TEU/年`}
              />
            )}
            {country.shipping.shippingRank && (
              <FieldRow label="全球排名" value={`#${country.shipping.shippingRank}`} />
            )}
          </div>
        </ModuleCard>

        {/* Sources */}
        {country.sources.length > 0 && (
          <div className="rounded-xl p-4" style={{ backgroundColor: '#1e293b' }}>
            <h4 className="text-sm font-semibold text-[#f8fafc] mb-3">数据来源汇总</h4>
            <div className="space-y-2">
              {country.sources.map((src, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-[#94a3b8]">•</span>
                  <div>
                    <span className="text-[#e2e8f0]">{src.institution}</span>
                    <span className="text-[#64748b] ml-1">({src.lastVerified})</span>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#60a5fa] hover:underline break-all"
                    >
                      {src.url}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
