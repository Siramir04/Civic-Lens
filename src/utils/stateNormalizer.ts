/**
 * State Normalizer Utility for CivicLens
 * Handles all Nigerian state name variations, typos, and abbreviations.
 */

export const OFFICIAL_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano',
  'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara', 'Federal Capital Territory'
] as const;

export type OfficialState = typeof OFFICIAL_STATES[number];

export const ZONES = {
  'North Central': ['Benue', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau', 'Federal Capital Territory'],
  'North East': ['Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba', 'Yobe'],
  'North West': ['Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Sokoto', 'Zamfara'],
  'South East': ['Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo'],
  'South South': ['Akwa Ibom', 'Bayelsa', 'Cross River', 'Delta', 'Edo', 'Rivers'],
  'South West': ['Ekiti', 'Lagos', 'Ogun', 'Ondo', 'Osun', 'Oyo']
} as const;

const VARIATIONS: Record<string, string[]> = {
  'Abia': ['abia', 'aba'],
  'Adamawa': ['adamawa', 'yola', 'adu'],
  'Akwa Ibom': ['akwa ibom', 'akwa-ibom', 'akwaibom', 'uyo'],
  'Anambra': ['anambra', 'awka', 'onitsha'],
  'Bauchi': ['bauchi'],
  'Bayelsa': ['bayelsa', 'yenagoa'],
  'Benue': ['benue', 'makurdi'],
  'Borno': ['borno', 'maiduguri', 'bornu'],
  'Cross River': ['cross river', 'crossriver', 'cross-river', 'calabar'],
  'Delta': ['delta', 'asaba', 'warri'],
  'Ebonyi': ['ebonyi', 'abakaliki'],
  'Edo': ['edo', 'benin city', 'benin'],
  'Ekiti': ['ekiti', 'ado ekiti'],
  'Enugu': ['enugu'],
  'Gombe': ['gombe'],
  'Imo': ['imo', 'owerri'],
  'Jigawa': ['jigawa', 'dutse'],
  'Kaduna': ['kaduna'],
  'Kano': ['kano'],
  'Katsina': ['katsina'],
  'Kebbi': ['kebbi', 'birnin kebbi'],
  'Kogi': ['kogi', 'lokoja'],
  'Kwara': ['kwara', 'ilorin'],
  'Lagos': ['lagos', 'eko'],
  'Nasarawa': ['nasarawa', 'lafia'],
  'Niger': ['niger', 'minna'],
  'Ogun': ['ogun', 'abeokuta'],
  'Ondo': ['ondo', 'akure'],
  'Osun': ['osun', 'osogbo', 'ife'],
  'Oyo': ['oyo', 'ibadan'],
  'Plateau': ['plateau', 'jos'],
  'Rivers': ['rivers', 'river state', 'ph', 'port harcourt'],
  'Sokoto': ['sokoto'],
  'Taraba': ['taraba', 'jalingo'],
  'Yobe': ['yobe', 'damaturu'],
  'Zamfara': ['zamfara', 'gusau'],
  'Federal Capital Territory': [
    'fct', 'f.c.t', 'abuja', 'federal capital territory',
    'federal capital', 'f c t'
  ]
};

const REVERSE_MAP: Record<string, OfficialState> = {};
Object.entries(VARIATIONS).forEach(([official, variants]) => {
  variants.forEach(v => {
    REVERSE_MAP[v.toLowerCase()] = official as OfficialState;
  });
});

export class StateNormalizer {
  static normalize(rawName: string | undefined | null): OfficialState | null {
    if (!rawName) return null;

    const cleaned = rawName.trim().toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');

    // Direct lookup
    if (REVERSE_MAP[cleaned]) {
      return REVERSE_MAP[cleaned];
    }

    // Official list check
    const officialMatch = OFFICIAL_STATES.find(s => s.toLowerCase() === cleaned);
    if (officialMatch) return officialMatch;

    // Fuzzy: check if cleaned is a substring of any variant or vice-versa
    for (const [variant, official] of Object.entries(REVERSE_MAP)) {
      if (cleaned.length >= 3 && (variant.includes(cleaned) || cleaned.includes(variant))) {
        return official;
      }
    }

    // Word overlap
    const rawWords = new Set(cleaned.split(' '));
    for (const official of OFFICIAL_STATES) {
      const officialWords = official.toLowerCase().split(' ');
      if (officialWords.some(word => rawWords.has(word))) {
        return official;
      }
    }

    return null;
  }

  static getZone(stateName: string): string | null {
    const normalized = this.normalize(stateName);
    if (!normalized) return null;

    for (const [zone, states] of Object.entries(ZONES)) {
      if ((states as readonly string[]).includes(normalized)) {
        return zone;
      }
    }
    return null;
  }
}
