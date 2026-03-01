import countriesRaw from './countries.json';
import type { CountryData } from '../types/country';

export function calculateFeasibility(scores: CountryData['scores']): number {
  const { regulatory, rails, demand, coverage } = scores;
  return Math.round(
    (regulatory / 5) * 30 +
      (rails / 5) * 25 +
      (demand / 5) * 25 +
      ((5 - coverage) / 5) * 20,
  );
}

export function getColorByScore(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#4ade80';
  if (score >= 40) return '#facc15';
  if (score >= 20) return '#f97316';
  if (score >= 0) return '#ef4444';
  return '#374151';
}

export const countries: CountryData[] = (countriesRaw as CountryData[]).map((country) => ({
  ...country,
  feasibilityIndex: calculateFeasibility(country.scores),
}));

export const countriesByCode = new Map(countries.map((country) => [country.code, country] as const));
