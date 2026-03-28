export type TokenCategory = 'PM10' | 'PM2.5' | 'GAS' | 'OZONE';
export type Token = 'Dust' | 'Pollen' | 'Spores' | 'Ash' | 'Smoke' | 'Soot' | 'Sulphates' | 'Nitrates' | 'CO' | 'SO2' | 'NO2' | 'CO2' | 'Ozone';

export function getTokenCategory(t: Token): TokenCategory {
  if (['Dust', 'Pollen', 'Spores', 'Ash'].includes(t)) return 'PM10';
  if (['Smoke', 'Soot', 'Sulphates', 'Nitrates'].includes(t)) return 'PM2.5';
  if (['CO', 'SO2', 'NO2', 'CO2'].includes(t)) return 'GAS';
  return 'OZONE';
}

export function spawnToken(category: TokenCategory): Token {
  if (category === 'PM10') {
    const names: Token[] = ['Dust', 'Pollen', 'Spores', 'Ash'];
    return names[Math.floor(Math.random() * names.length)];
  }
  if (category === 'PM2.5') {
    const names: Token[] = ['Smoke', 'Soot', 'Sulphates', 'Nitrates'];
    return names[Math.floor(Math.random() * names.length)];
  }
  if (category === 'GAS') {
    const names: Token[] = ['CO', 'SO2', 'NO2', 'CO2'];
    return names[Math.floor(Math.random() * names.length)];
  }
  return 'Ozone';
}

export type FilterType = 'MESH' | 'CARBON' | 'HEPA' | 'ELECTROSTATIC' | 'SCRUBBER';

export interface Zone {
  tokens: Token[];
  filters: FilterType[]; // Array to support Tier 3 stacking
}

export interface Lane {
  core: Token[];
  zones: Zone[]; // 0: Z1, 1: Z2, 2: Z3
  district: Token[];
}

export interface Player {
  id: number;
  name: string;
  sc: number;
  vp: number;
  lanes: number[];
  deflectedThisTurn: boolean;
  hand: FilterType[];
}

export interface EmissionCard {
  id: string;
  title: string;
  tokens: Token[];
  image?: string;
}

export interface EmissionDeckCard {
  id: string;
  tier: number;
  spawn2P: ('PM10' | 'PM2.5' | 'GAS')[];
  spawn3P: ('PM10' | 'PM2.5' | 'GAS')[];
}

export interface ClimateEvent {
  id: string;
  title: string;
  effect: string;
  image?: string;
}

export interface GameState {
  phase: 'setup' | 'emission' | 'actions' | 'upkeep' | 'gameover';
  round: number;
  tier: number;
  enableTier3: boolean;
  players: Player[];
  activePlayer: number;
  ap: number;
  board: {
    factory: Token[];
    lanes: Lane[]; // 6 lanes
  };
  windrose: number;
  marketDeck: FilterType[];
  activeMarket: FilterType[];
  tier1Deck: EmissionDeckCard[];
  tier2Deck: EmissionDeckCard[];
  tier3Deck: EmissionDeckCard[];
  purifiesLeft: number;
  selectedAction: 'DRAFT' | 'PLACE' | 'PURIFY' | 'DEFLECT' | null;
  selectedFilterIndex: number | null; // Index in market or hand
  logs: string[];
  pendingEmission: EmissionCard | null;
  lastEmission: EmissionCard | null;
  vocCapturedThisPurify: number;
  activeClimate: ClimateEvent | null;
  climateDuration: number;
  climateModalShown: boolean;
}
