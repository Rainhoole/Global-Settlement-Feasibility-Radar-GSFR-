import type { CountryData } from '../types/country';

export type OpenfxStatus = CountryData['openfx']['status'];

export const OPENFX_MAP_COLOR_BY_STATUS: Record<OpenfxStatus, string> = {
  active: '#00E676',
  just_launched: '#00B8D4',
  coming_soon: '#FFB300',
  not_covered: '#1E2535',
};

const ACTIVE_CODES = new Set([
  'AE', 'AU', 'BR', 'DE', 'FR', 'IT', 'ES', 'NL', 'MX', 'GB', 'US',
]);

const JUST_LAUNCHED_CODES = new Set(['PH', 'CO', 'AR']);

const COMING_SOON_CODES = new Set([
  'CL', 'CA', 'HK', 'SG', 'ID', 'NZ', 'CH', 'IN', 'TR', 'SA', 'ZA', 'KR', 'DK', 'JP', 'SE', 'NO',
]);

export function getOpenfxMapStatus(
  alpha2: string | undefined,
): OpenfxStatus {
  if (!alpha2) {
    return 'not_covered';
  }

  const code = alpha2.toUpperCase();
  if (ACTIVE_CODES.has(code)) {
    return 'active';
  }
  if (JUST_LAUNCHED_CODES.has(code)) {
    return 'just_launched';
  }
  if (COMING_SOON_CODES.has(code)) {
    return 'coming_soon';
  }
  return 'not_covered';
}

export function getOpenfxMapColor(status: OpenfxStatus): string {
  return OPENFX_MAP_COLOR_BY_STATUS[status];
}

export function hasOpenfxHoverAccent(status: OpenfxStatus): boolean {
  return status !== 'not_covered';
}
