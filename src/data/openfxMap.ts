import type { CountryData } from '../types/country';
import { countriesByCode } from './index';

export type OpenfxStatus = CountryData['openfx']['status'];

export const OPENFX_MAP_COLOR_BY_STATUS: Record<OpenfxStatus, string> = {
  active: '#00E676',
  just_launched: '#00B8D4',
  coming_soon: '#FFB300',
  not_covered: '#1E2535',
};

export function getOpenfxMapStatus(
  alpha2: string | undefined,
): OpenfxStatus {
  if (!alpha2) {
    return 'not_covered';
  }

  const code = alpha2.toUpperCase();
  return countriesByCode.get(code)?.openfx?.status ?? 'not_covered';
}

export function getOpenfxMapColor(status: OpenfxStatus): string {
  return OPENFX_MAP_COLOR_BY_STATUS[status];
}

export function hasOpenfxHoverAccent(status: OpenfxStatus): boolean {
  return status !== 'not_covered';
}
