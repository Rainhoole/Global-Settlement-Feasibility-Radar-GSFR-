export type Region =
  | 'MENA'
  | 'SEA'
  | 'LATAM'
  | 'APAC'
  | 'EUROPE'
  | 'NORTH_AMERICA'
  | 'AFRICA';

export interface CountryData {
  code: string;
  name: string;
  name_zh: string;
  region: Region;
  scores: {
    regulatory: number;
    rails: number;
    demand: number;
    coverage: number;
  };
  feasibilityIndex: number;
  openfx: {
    status: 'active' | 'just_launched' | 'coming_soon' | 'not_covered';
    currency?: string;
    eta?: string;
    localRails?: string;
  };
  fxRegime: {
    currentAccountConvertible: 'yes' | 'partial' | 'no' | 'unknown';
    capitalControl: 'open' | 'partial' | 'strict' | 'unknown';
    crossBorderRestriction: string;
    forcedLocalClearing: boolean | null;
    regulationName: string;
    regulatorBody: string;
    lastUpdated: string;
    sourceUrl: string;
  };
  digitalAsset: {
    legalStatus: 'legal' | 'gray' | 'prohibited' | 'unknown';
    stablecoinStatus: 'regulated' | 'allowed' | 'restricted' | 'prohibited' | 'unknown';
    bankCryptoPolicy: string;
    hasFramework: boolean | null;
    sourceUrl: string;
  };
  infrastructure: {
    swiftMember: boolean;
    hasRTGS: boolean;
    rtgsName?: string;
    hasForeignBanks: boolean;
    primaryClearingCurrency: string[];
    centralBankUrl: string;
  };
  sanctions: {
    ofacListed: boolean;
    euRestricted: boolean;
    ukRestricted: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  shipping: {
    portThroughputTEU?: number;
    shippingRank?: number;
    unctadSource?: string;
  };
  sources: {
    type: string;
    institution: string;
    url: string;
    lastVerified: string;
  }[];
}
