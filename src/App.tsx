import { useCallback, useEffect, useMemo, useState } from 'react';
import { WorldMap } from './components/WorldMap';
import { Tooltip } from './components/Tooltip';
import { Legend } from './components/Legend';
import { DetailPanel } from './components/DetailPanel';
import { Toolbar } from './components/Toolbar';
import { SearchModal } from './components/SearchModal';
import { CountryTable } from './components/CountryTable';
import { countries } from './data';
import type { CountryData, Region } from './types/country';
import type { FeasibilityFilter, OpenfxFilter, ViewMode } from './components/Toolbar';
import { useI18n } from './i18n';

const THEMES = [
  { className: 'rh-theme-mono-dark', label: 'Mono Dark' },
  { className: 'rh-theme-organic-warm', label: 'Organic Warm' },
  { className: 'rh-theme-brutalist', label: 'Brutalist' },
  { className: 'rh-theme-emerald', label: 'Emerald' },
  { className: 'rh-theme-neon-orange', label: 'Neon Orange' },
  { className: 'rh-theme-matrix', label: 'Matrix' },
] as const;

function App() {
  const { language, toggleLanguage, t } = useI18n();
  const [regionFilter, setRegionFilter] = useState<'ALL' | Region>('ALL');
  const [feasibilityFilter, setFeasibilityFilter] = useState<FeasibilityFilter>('ALL');
  const [openfxFilter, setOpenfxFilter] = useState<OpenfxFilter>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchOpen, setSearchOpen] = useState(false);
  const [themeIndex, setThemeIndex] = useState(3);

  const activeTheme = THEMES[themeIndex];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filteredCountries = useMemo(() => {
    return countries.filter((c) => {
      if (regionFilter !== 'ALL' && c.region !== regionFilter) return false;
      if (openfxFilter !== 'ALL' && c.openfx.status !== openfxFilter) return false;
      if (feasibilityFilter !== 'ALL') {
        const idx = c.feasibilityIndex;
        switch (feasibilityFilter) {
          case '80+':
            if (idx < 80) return false;
            break;
          case '60-79':
            if (idx < 60 || idx >= 80) return false;
            break;
          case '40-59':
            if (idx < 40 || idx >= 60) return false;
            break;
          case '20-39':
            if (idx < 20 || idx >= 40) return false;
            break;
          case '<20':
            if (idx >= 20) return false;
            break;
        }
      }
      return true;
    });
  }, [regionFilter, feasibilityFilter, openfxFilter]);

  const filteredCodes = useMemo(() => {
    if (regionFilter === 'ALL' && feasibilityFilter === 'ALL' && openfxFilter === 'ALL') {
      return undefined;
    }
    return new Set(filteredCountries.map((c) => c.code));
  }, [filteredCountries, regionFilter, feasibilityFilter, openfxFilter]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleCountrySelect = useCallback((country: CountryData) => {
    setSelectedCountry(country);
  }, []);

  const handleThemeSwitch = useCallback(() => {
    setThemeIndex((idx) => (idx + 1) % THEMES.length);
  }, []);

  const handleMapBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (tag === 'svg' || tag === 'rect') {
      setSelectedCountry(null);
    }
  }, []);

  return (
    <div className={`rh-page ${activeTheme.className}`}>
      <div className="gsfr-shell">
        <aside className="gsfr-sidebar">
          <Toolbar
            region={regionFilter}
            onRegionChange={setRegionFilter}
            feasibility={feasibilityFilter}
            onFeasibilityChange={setFeasibilityFilter}
            openfxFilter={openfxFilter}
            onOpenfxChange={setOpenfxFilter}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSearchOpen={() => setSearchOpen(true)}
            themeLabel={activeTheme.label}
          />

          <div className="rh-divider" />

          <footer className="rh-footer gsfr-footer">
            <div className="rh-footer__main">
              <span>{t('Rainhoole GSFR')}</span>
              <span>
                <span className="rh-bullet" />
                2026
              </span>
            </div>
            <div className="rh-footer__sub">
              <span>{t('Research System')}</span>
              <span>{t('Signal Before Scale')}</span>
            </div>
          </footer>
        </aside>

        <section className="gsfr-main">
          <div className="gsfr-main-surface">
            {viewMode === 'map' ? (
              <>
                <div className="gsfr-map-stage" onClick={handleMapBackdropClick}>
                  <WorldMap
                    onCountryClick={handleCountrySelect}
                    onCountryHover={setHoveredCountry}
                    onMouseMove={handleMouseMove}
                    filteredCodes={filteredCodes}
                    selectedCode={selectedCountry?.code}
                  />
                </div>
                <Legend />
              </>
            ) : (
              <div className="gsfr-table-stage">
                <CountryTable
                  countries={filteredCountries}
                  onCountrySelect={handleCountrySelect}
                  selectedCode={selectedCountry?.code}
                />
              </div>
            )}

            {hoveredCountry && viewMode === 'map' && (
              <Tooltip country={hoveredCountry} x={mousePos.x} y={mousePos.y} />
            )}

            {selectedCountry && (
              <DetailPanel
                country={selectedCountry}
                onClose={() => setSelectedCountry(null)}
              />
            )}
          </div>

          <div className="gsfr-status-bar">
            <span>{t('Countries Evaluated')}: {countries.length}</span>
            <span>{t('Data Completeness')}: 87%</span>
            <span>{t('Last Update')}: 2026-02-28</span>
          </div>
        </section>
      </div>

      <div className="rh-floating-actions">
        <button type="button" className="rh-switch-btn rh-lang-btn" onClick={toggleLanguage}>
          {language === 'en' ? '中 / EN' : 'EN / 中'}
        </button>
        <button type="button" className="rh-switch-btn" onClick={handleThemeSwitch}>
          {t('Switch Style')}
        </button>
      </div>

      {searchOpen && (
        <SearchModal
          onSelect={handleCountrySelect}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
