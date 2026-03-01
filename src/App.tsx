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

function App() {
  const [regionFilter, setRegionFilter] = useState<'ALL' | Region>('ALL');
  const [feasibilityFilter, setFeasibilityFilter] = useState<FeasibilityFilter>('ALL');
  const [openfxFilter, setOpenfxFilter] = useState<OpenfxFilter>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
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
          case '80+': if (idx < 80) return false; break;
          case '60-79': if (idx < 60 || idx >= 80) return false; break;
          case '40-59': if (idx < 40 || idx >= 60) return false; break;
          case '20-39': if (idx < 20 || idx >= 40) return false; break;
          case '<20': if (idx >= 20) return false; break;
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

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#0a0f1e' }}>
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
      />

      <div className="flex-1 relative overflow-hidden">
        {viewMode === 'map' ? (
          <>
            <div
              className="w-full h-full"
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'rect') {
                  setSelectedCountry(null);
                }
              }}
            >
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
          <div className="h-full overflow-y-auto p-4 lg:p-6" style={{ backgroundColor: '#0a0f1e' }}>
            <CountryTable
              countries={filteredCountries}
              onCountrySelect={handleCountrySelect}
              selectedCode={selectedCountry?.code}
            />
          </div>
        )}

        {/* Tooltip */}
        {hoveredCountry && viewMode === 'map' && (
          <Tooltip country={hoveredCountry} x={mousePos.x} y={mousePos.y} />
        )}

        {/* Detail Panel */}
        {selectedCountry && (
          <DetailPanel
            country={selectedCountry}
            onClose={() => setSelectedCountry(null)}
          />
        )}
      </div>

      {/* Status Bar */}
      <div
        className="h-10 flex items-center px-4 lg:px-6 text-xs text-[#64748b] border-t shrink-0"
        style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
      >
        已评估: {countries.length} 国 &nbsp;|&nbsp; 数据完整度: 87% &nbsp;|&nbsp; 最后更新: 2026-02-28
      </div>

      {/* Search Modal */}
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
