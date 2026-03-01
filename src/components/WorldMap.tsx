import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { countriesByCode } from '../data';
import { alpha2FromGeoId } from '../data/countryCodeMap';
import { getOpenfxMapColor, getOpenfxMapStatus, hasOpenfxHoverAccent } from '../data/openfxMap';
import type { CountryData } from '../types/country';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const MAP_WIDTH = 800;
const MAP_HEIGHT = 600;
const MAP_PROJECTION_SCALE = 140;
const MAP_PROJECTION_CENTER: [number, number] = [0, 30];

interface WorldMapProps {
  onCountryClick: (country: CountryData) => void;
  onCountryHover: (country: CountryData | null) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  filteredCodes?: Set<string>;
  selectedCode?: string;
}

export function WorldMap({ onCountryClick, onCountryHover, onMouseMove, filteredCodes, selectedCode }: WorldMapProps) {
  return (
    <ComposableMap
      width={MAP_WIDTH}
      height={MAP_HEIGHT}
      projection="geoMercator"
      projectionConfig={{ scale: MAP_PROJECTION_SCALE, center: MAP_PROJECTION_CENTER }}
    >
      <ZoomableGroup>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const alpha2 = alpha2FromGeoId(geo.id);
              const countryData = alpha2 ? countriesByCode.get(alpha2) : undefined;
              const isFiltered = !filteredCodes || (countryData && filteredCodes.has(countryData.code));
              const mapStatus = getOpenfxMapStatus(alpha2);
              const fillColor = isFiltered ? getOpenfxMapColor(mapStatus) : 'var(--gsfr-map-muted)';
              const isSelected = countryData && countryData.code === selectedCode;
              const useHoverAccent = Boolean(countryData && isFiltered && hasOpenfxHoverAccent(mapStatus));

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fillColor}
                  stroke={isSelected ? 'var(--rh-accent-color)' : 'var(--gsfr-map-stroke)'}
                  strokeWidth={isSelected ? 1.6 : 0.4}
                  style={{
                    default: { outline: 'none' },
                    hover: {
                      outline: 'none',
                      fill: useHoverAccent ? 'var(--rh-accent-color)' : fillColor,
                      stroke: useHoverAccent ? 'var(--rh-accent-color)' : 'var(--gsfr-map-stroke)',
                      strokeWidth: useHoverAccent ? 1.1 : 0.4,
                      cursor: countryData && isFiltered ? 'pointer' : 'default',
                    },
                    pressed: { outline: 'none' },
                  }}
                  onClick={() => countryData && isFiltered && onCountryClick(countryData)}
                  onMouseEnter={() => countryData && isFiltered && onCountryHover(countryData)}
                  onMouseLeave={() => onCountryHover(null)}
                  onMouseMove={onMouseMove}
                />
              );
            })
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
}
