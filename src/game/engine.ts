import { GameState, Token, FilterType, Player, EmissionCard, ClimateEvent, getTokenCategory, spawnToken } from '../types';

export const initialState: GameState = {
  phase: 'setup',
  round: 1,
  tier: 1,
  enableTier3: false,
  players: [],
  activePlayer: 0,
  ap: 2,
  board: {
    factory: [],
    lanes: Array(6).fill(null).map(() => ({
      core: [],
      zones: [
        { tokens: [], filters: [] },
        { tokens: [], filters: [] },
        { tokens: [], filters: [] }
      ],
      district: []
    }))
  },
  windrose: 0,
  purifiesLeft: 0,
  marketDeck: [],
  activeMarket: [],
  tier1Deck: [],
  tier2Deck: [],
  tier3Deck: [],
  selectedAction: null,
  selectedFilterIndex: null,
  vocCapturedThisPurify: 0,
  logs: [],
  pendingEmission: null,
  lastEmission: null,
  activeClimate: null,
  climateDuration: 0,
  climateModalShown: false,
};

/**
 * FILTER DECK
 * -----------
 * 6 lanes × 3 zones = 18 filter placement slots per tier 1–2 game.
 * With 2 players, 10 rounds, roughly 1–2 drafts/turn → ~25–30 purchases expected.
 * With 3 players, 10 rounds → ~35–40 purchases expected.
 * Deck is sized at 40 to never run out. Distribution weighted toward cheaper filters.
 *
 * Filter types (educationally accurate):
 *  MESH         – Mechanical particulate filter. Captures PM10 by physical size exclusion.
 *  CARBON       – Activated carbon adsorption. Removes gaseous pollutants via chemical bonding.
 *  HEPA         – High-Efficiency Particulate Air filter (dense fibre mat). Removes PM2.5 and PM10.
 *  ELECTROSTATIC– Electrostatic precipitator. Ionises particles; plates attract & collect PM2.5 & PM10.
 *  SCRUBBER     – Wet scrubber. Sprays liquid to neutralise SO₂/NO₂ and wash out PM10 particles.
 *  FAN          – Exhaust fan. Utility tool: +1 to scrub roll, enables fast Deflect.
 */
const FILTER_DECK: FilterType[] = [
  ...Array(10).fill('MESH'),         // Cheap, common – PM10 only
  ...Array(8).fill('CARBON'),        // Gas specialist – GAS only
  ...Array(7).fill('HEPA'),          // Fine particle specialist – PM2.5 + PM10
  ...Array(6).fill('ELECTROSTATIC'), // Broad PM spectrum – PM10 + PM2.5
  ...Array(5).fill('SCRUBBER'),      // Gas + coarse particle hybrid – GAS + PM10
];
// Total: 36 cards

/**
 * CLIMATE EVENT DECK (redesigned for new game rules)
 * ----------------------------------------------------
 * All events are compatible with:
 *  - Single-token-per-zone capacity
 *  - No ozone generation
 *  - New filter lineup (no ZAPPER)
 *  - Zone-based (not tile-stacking) gameplay
 *
 * Educationally accurate climate effects:
 *
 * THERMAL INVERSION: A layer of warm air traps cold polluted air near the ground.
 *   Fans cannot push air upward against the inversion layer. (Real: Los Angeles 1943 smog disaster)
 *   Effect: Deflect action disabled for all players.
 *
 * HIGH HUMIDITY: Water vapour clogs activated carbon pores via competitive adsorption.
 *   Effect: CARBON filters do not capture gas this round.
 *
 * WILDFIRE SURGE: Biomass combustion produces massive PM10 (ash, dust) and PM2.5 (smoke, soot).
 *   Effect: Emission this round contains +2 extra PM10 tokens.
 *
 * DRIZZLE: Light rain partially removes surface PM10 deposited in districts (wet deposition).
 *   Does NOT remove PM2.5 or gas — fine particles and gases require heavier chemically active rain.
 *   Effect: Remove 1 PM10 token from each district (if present).
 *
 * INDUSTRIAL ACCIDENT: Uncontrolled chemical release — toxic gas cloud spreads via wind.
 *   Effect: Immediately push 2 GAS tokens onto the windrose lane and the next lane.
 */
const CLIMATE_DECK: ClimateEvent[] = [
  {
    id: 'thermal',
    title: 'Thermal Inversion',
    effect: 'Deflect is disabled this round. Warm air traps pollution near the ground — fans cannot push upward.',
    image: './assets/climates/thermal.jpg',
  },
  {
    id: 'humidity',
    title: 'High Humidity',
    effect: 'CARBON filters are inactive this round. Moisture fills their pores, blocking gas adsorption.',
    image: './assets/climates/humidity.jpg',
  },
  {
    id: 'wildfire',
    title: 'Wildfire Surge',
    effect: 'Emission this round adds +1 PM2.5 (Smoke) and +1 PM10 (Ash). Biomass combustion floods the air with fine and coarse particles.',
    image: './assets/climates/wildfire.jpg',
  },
  {
    id: 'drizzle',
    title: 'Drizzle',
    effect: 'Remove 1 PM10 token from each district immediately. Wet deposition washes out coarse particles.',
    image: './assets/climates/drizzle.jpg',
  },
  {
    id: 'accident',
    title: 'Industrial Accident',
    effect: 'Immediately push 2 Gas tokens onto 2 adjacent Core lanes. Ruptured pipeline releases toxic fumes.',
    image: './assets/climates/accident.jpg',
  },
];

export const EMISSION_DECK_DATA: import('../types').EmissionDeckCard[] = [
  // Tier 1
  { id: '1-1', tier: 1, spawn2P: ['PM10', 'PM10'], spawn3P: ['PM10', 'PM10', 'PM10'] },
  { id: '1-2', tier: 1, spawn2P: ['PM10', 'PM10', 'GAS'], spawn3P: ['PM10', 'PM10', 'PM10', 'GAS'] },
  { id: '1-3', tier: 1, spawn2P: ['PM10', 'PM10', 'PM10'], spawn3P: ['PM10', 'PM10', 'PM10', 'PM2.5'] },
  { id: '1-4', tier: 1, spawn2P: ['PM10', 'PM10', 'GAS'], spawn3P: ['PM10', 'PM10', 'GAS', 'PM2.5'] },
  { id: '1-5', tier: 1, spawn2P: ['PM10', 'PM10', 'PM2.5'], spawn3P: ['PM10', 'PM10', 'PM10', 'PM2.5'] },
  // Tier 2
  { id: '2-1', tier: 2, spawn2P: ['PM10', 'PM10', 'GAS'], spawn3P: ['PM10', 'PM10', 'GAS', 'GAS', 'PM2.5'] },
  { id: '2-2', tier: 2, spawn2P: ['PM10', 'GAS', 'GAS'], spawn3P: ['PM10', 'PM10', 'GAS', 'GAS', 'PM2.5'] },
  { id: '2-3', tier: 2, spawn2P: ['PM10', 'PM10', 'GAS', 'PM2.5'], spawn3P: ['PM10', 'PM10', 'PM10', 'GAS', 'PM2.5', 'PM2.5'] },
  { id: '2-4', tier: 2, spawn2P: ['PM10', 'GAS', 'PM2.5'], spawn3P: ['PM10', 'PM10', 'GAS', 'GAS', 'PM2.5'] },
  { id: '2-5', tier: 2, spawn2P: ['PM10', 'PM10', 'GAS', 'PM2.5'], spawn3P: ['PM10', 'PM10', 'GAS', 'GAS', 'PM2.5', 'PM2.5'] },
  // Tier 3
  { id: '3-1', tier: 3, spawn2P: ['PM10', 'GAS', 'PM2.5', 'PM2.5'], spawn3P: ['PM10', 'PM10', 'GAS', 'GAS', 'PM2.5', 'PM2.5'] },
  { id: '3-2', tier: 3, spawn2P: ['PM10', 'PM10', 'GAS', 'PM2.5', 'PM2.5'], spawn3P: ['PM10', 'PM10', 'GAS', 'GAS', 'PM2.5', 'PM2.5', 'PM2.5'] },
  { id: '3-3', tier: 3, spawn2P: ['PM10', 'GAS', 'GAS', 'PM2.5', 'PM2.5'], spawn3P: ['PM10', 'GAS', 'GAS', 'GAS', 'PM2.5', 'PM2.5', 'PM2.5'] },
  { id: '3-4', tier: 3, spawn2P: ['PM10', 'GAS', 'PM2.5', 'PM2.5', 'PM2.5'], spawn3P: ['PM10', 'PM10', 'GAS', 'GAS', 'PM2.5', 'PM2.5', 'PM2.5'] },
  { id: '3-5', tier: 3, spawn2P: ['PM10', 'PM10', 'GAS', 'GAS', 'PM2.5', 'PM2.5'], spawn3P: ['PM10', 'PM10', 'PM10', 'GAS', 'GAS', 'PM2.5', 'PM2.5', 'PM2.5'] },
];

export type GameAction = 
  | { type: 'START_GAME'; players: { name: string }[]; enableTier3: boolean }
  | { type: 'SPAWN_EMISSION' }
  | { type: 'RESOLVE_EMISSION' }
  | { type: 'RESOLVE_CLIMATE' }
  | { type: 'SELECT_ACTION'; action: 'DRAFT' | 'PLACE' | 'PURIFY' | 'DEFLECT'; index?: number }
  | { type: 'EXECUTE_DRAFT' }
  | { type: 'EXECUTE_PLACE'; laneIndex: number; zoneIndex: number }
  | { type: 'EXECUTE_PURIFY'; laneIndex: number; zoneIndex: number; tokenIndex: number }
  | { type: 'EXECUTE_DEFLECT'; laneIndex: number; zoneIndex: number; tokenIndex: number }
  | { type: 'END_TURN' }
  | { type: 'UPKEEP' };

function log(state: GameState, msg: string) {
  state.logs = [msg, ...state.logs].slice(0, 15);
}

function shuffle<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

/**
 * FILTER CATCH RULES (educationally accurate)
 * --------------------------------------------
 * MESH:          PM10 (physical size exclusion — particles >10 µm caught in mesh)
 * CARBON:        GAS  (activated carbon surface adsorbs CO, SO₂, NO₂, CO₂)
 *                     Half-strength in High Humidity (moisture fills pores)
 * HEPA:          PM2.5 + PM10 (dense fibre mat captures particles ≥0.3 µm)
 * ELECTROSTATIC: PM10 + PM2.5 (corona discharge ionises particles; collector plates attract them)
 * SCRUBBER:      GAS + PM10  (liquid spray absorbs SO₂/NO₂; scrubs large particles)
 */
function canFilterCatch(filter: FilterType, token: Token, state: GameState): boolean {
  const cat = getTokenCategory(token);

  switch (filter) {
    case 'MESH':
      return cat === 'PM10';

    case 'CARBON':
      if (cat !== 'GAS') return false;
      // High Humidity: water vapour blocks all active carbon pores via competitive adsorption
      // → CARBON filters are completely inactive in humid conditions
      if (state.activeClimate?.id === 'humidity') return false;
      return true;

    case 'HEPA':
      return cat === 'PM2.5' || cat === 'PM10';

    case 'ELECTROSTATIC':
      return cat === 'PM10' || cat === 'PM2.5';

    case 'SCRUBBER':
      return cat === 'GAS' || cat === 'PM10';

    default:
      return false;
  }
}

function purifyToken(state: GameState, laneIndex: number, zoneIndex: number, tokenIndex: number): FilterType | false {
  const lane = state.board.lanes[laneIndex];
  
  if (zoneIndex === 0) {
    const token = lane.core[tokenIndex];
    log(state, `Cannot purify ${token} in the core — place filters in zones first.`);
    return false;
  }

  const filterZone = lane.zones[zoneIndex - 1];
  const token = filterZone.tokens[tokenIndex];
  let caught = false;
  let usedFilter: FilterType | null = null;

  for (const filter of filterZone.filters) {
    if (canFilterCatch(filter, token, state)) {
      caught = true;
      usedFilter = filter;
      if (filter === 'CARBON') state.vocCapturedThisPurify += 1;
      
      const vLimit = 3;
      if (filter === 'CARBON' && state.vocCapturedThisPurify > vLimit) {
        log(state, `CARBON filter is saturated! Cannot capture more VOCs this turn.`);
        return false;
      }
      break;
    }
  }

  if (caught) {
    filterZone.tokens.splice(tokenIndex, 1);

    const owner = state.players.find(p => p.lanes.includes(laneIndex));
    if (owner) {
      owner.sc += 1;
      owner.vp += 1;
    }

    log(state, `${token} purified by ${usedFilter} in Lane ${laneIndex + 1} Zone ${zoneIndex}! (+1 VP)`);
    return usedFilter as FilterType;
  } else {
    log(state, `No compatible filter for ${token} in this zone.`);
    return false;
  }
}

function pushToken(state: GameState, laneIndex: number, fromZone: number, token: Token) {
  const lane = state.board.lanes[laneIndex];
  const nextZoneIndex = fromZone + 1;

  if (nextZoneIndex === 0) {
    // Entering core — capacity 2
    lane.core.push(token);
    if (lane.core.length > 2) {
      const overflow = lane.core.shift()!;
      pushToken(state, laneIndex, 0, overflow);
    }
  } else if (nextZoneIndex >= 1 && nextZoneIndex <= 3) {
    // Entering a filter zone — capacity 1 (zone hexes overflow at 2nd token)
    const zone = lane.zones[nextZoneIndex - 1];
    zone.tokens.push(token);
    if (zone.tokens.length > 1) {
      const overflow = zone.tokens.shift()!;
      pushToken(state, laneIndex, nextZoneIndex, overflow);
    }
  } else if (nextZoneIndex === 4) {
    // Reaching the district
    lane.district.push(token);
    log(state, `${token} reached District ${laneIndex + 1}!`);
  }
}

// Shared cost map — single source of truth
export const FILTER_COSTS: Record<FilterType, number> = {
  MESH: 4,
  CARBON: 6,
  HEPA: 9,
  ELECTROSTATIC: 9,
  SCRUBBER: 10,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  const newState = JSON.parse(JSON.stringify(state)) as GameState;

  switch (action.type) {
    case 'START_GAME': {
      const is3P = action.players.length === 3;
      newState.enableTier3 = action.enableTier3;
      newState.players = action.players.map((p, i) => ({
        id: i,
        name: p.name,
        sc: is3P ? 10 : 12,
        vp: 0,
        lanes: is3P ? [i * 2, i * 2 + 1] : (i === 0 ? [0, 2, 4] : [1, 3, 5]),
        deflectedThisTurn: false,
        hand: []
      }));
      newState.marketDeck = shuffle(FILTER_DECK);
      newState.tier1Deck = shuffle(EMISSION_DECK_DATA.filter(c => c.tier === 1));
      newState.tier2Deck = shuffle(EMISSION_DECK_DATA.filter(c => c.tier === 2));
      newState.tier3Deck = shuffle(EMISSION_DECK_DATA.filter(c => c.tier === 3));
      // Always show 5 market cards for consistent choice and pacing
      newState.activeMarket = newState.marketDeck.splice(0, 5);
      newState.phase = 'emission';
      log(newState, `Game started with ${action.players.length} players.`);
      return newState;
    }

    case 'SPAWN_EMISSION': {
      // Check for Climate Event at rounds 4, 9, 14
      if ([4, 9, 14].includes(newState.round) && !newState.activeClimate) {
        const event = CLIMATE_DECK[Math.floor(Math.random() * CLIMATE_DECK.length)];
        newState.activeClimate = event;
        newState.climateDuration = 1;
        newState.climateModalShown = false;
        log(newState, `CLIMATE EVENT: ${event.title}`);
      }

      const is3P = newState.players.length === 3;
      let categories: ('PM10' | 'PM2.5' | 'GAS')[] = [];
      let cardStr = '';
      
      // Draw from the appropriate tier deck
      let drawnCard: import('../types').EmissionDeckCard | undefined;
      if (newState.tier === 1) drawnCard = newState.tier1Deck.pop();
      else if (newState.tier === 2) drawnCard = newState.tier2Deck.pop();
      else drawnCard = newState.tier3Deck.pop();

      if (drawnCard) {
        categories = is3P ? [...drawnCard.spawn3P] : [...drawnCard.spawn2P];
        cardStr = drawnCard.id;
      } else {
        // Fallback if deck is empty (e.g. game extended beyond normal rounds)
        categories = ['PM10', 'GAS', 'PM2.5'];
        cardStr = 'Fallback';
      }

      // Wildfire Surge: adds PM2.5 (Smoke) and PM10 (Ash) from biomass combustion
      if (newState.activeClimate?.id === 'wildfire') {
        categories = [...categories, 'PM2.5', 'PM10'];
      }

      const tokens = categories.map(c => spawnToken(c));

      newState.pendingEmission = {
        id: `emission-${newState.round}`,
        title: `Emission Wave ${newState.round} [Card ${cardStr}]`,
        tokens,
        image: `./assets/emissions/tier${newState.tier}.jpg`
      };
      
      return newState;
    }

    case 'RESOLVE_CLIMATE': {
      newState.climateModalShown = true;

      if (newState.activeClimate?.id === 'drizzle') {
        // Drizzle: wet deposition removes 1 PM10 token from each district
        // Wet deposition only removes coarse particulates (PM10) — PM2.5 and gas require heavier/acidic rain
        let removed = 0;
        newState.board.lanes.forEach(l => {
          const idx = l.district.findIndex(t => getTokenCategory(t) === 'PM10');
          if (idx !== -1) {
            l.district.splice(idx, 1);
            removed++;
          }
        });
        newState.climateDuration = 0; // Instant one-time effect
        log(newState, `Drizzle: removed ${removed} PM10 token(s) from districts.`);

      } else if (newState.activeClimate?.id === 'accident') {
        // Industrial Accident: ruptured pipeline releases 2 gas tokens on adjacent core lanes
        const lane1 = newState.windrose;
        const lane2 = (newState.windrose + 1) % 6;
        pushToken(newState, lane1, -1, spawnToken('GAS'));
        pushToken(newState, lane2, -1, spawnToken('GAS'));
        newState.climateDuration = 0;
        log(newState, `Industrial Accident! 2 Gas tokens released on Lanes ${lane1 + 1} & ${lane2 + 1}.`);
      }
      return newState;
    }

    case 'RESOLVE_EMISSION': {
      if (!newState.pendingEmission) return newState;
      
      let currentWindrose = Math.floor(Math.random() * 6);
      newState.windrose = currentWindrose;
      log(newState, `Emission detected. Wind carries pollution to Lane ${currentWindrose + 1}`);

        for (const token of newState.pendingEmission.tokens) {
          pushToken(newState, currentWindrose, -1, token);
          currentWindrose = (currentWindrose + 1) % 6;
        }
      newState.lastEmission = newState.pendingEmission;
      newState.pendingEmission = null;
      newState.phase = 'actions';
      log(newState, `Action Phase: ${newState.players[newState.activePlayer].name}'s turn.`);
      return newState;
    }

    case 'SELECT_ACTION':
      newState.selectedAction = action.action;
      newState.selectedFilterIndex = action.index ?? null;
      
      if (action.action === 'PURIFY') {
        const dieFaces = [1, 1, 1, 2, 2, 3];
        const baseRoll = dieFaces[Math.floor(Math.random() * dieFaces.length)];
        
        newState.purifiesLeft = baseRoll;
        newState.vocCapturedThisPurify = 0;
        newState.ap -= 1;
        
        log(newState, `Rolled a ${baseRoll}. ${newState.purifiesLeft} purifies available.`);
      }
      return newState;

    case 'EXECUTE_DRAFT': {
      const player = newState.players[newState.activePlayer];
      const filter = newState.activeMarket[newState.selectedFilterIndex!];
      const cost = FILTER_COSTS[filter];

      if (player.sc >= cost) {
        player.sc -= cost;
        player.hand.push(filter);
        newState.activeMarket.splice(newState.selectedFilterIndex!, 1);
        // Always replenish market to 5 cards
        while (newState.activeMarket.length < 5 && newState.marketDeck.length > 0) {
          newState.activeMarket.push(newState.marketDeck.shift()!);
        }
        newState.ap -= 1;
        log(newState, `Drafted ${filter} filter to hand. (-${cost} SC)`);
        newState.selectedAction = null;
        newState.selectedFilterIndex = null;
      }
      return newState;
    }

    case 'EXECUTE_PLACE': {
      const player = newState.players[newState.activePlayer];
      const filter = player.hand[newState.selectedFilterIndex!];
      const zone = newState.board.lanes[action.laneIndex].zones[action.zoneIndex - 1];

      if (zone.filters.length > 0) {
        if (newState.tier >= 3 && zone.filters.length < 2) {
          // Tier 3: allows stacking two filters in the same zone
          zone.filters.push(filter);
          log(newState, `Stacked ${filter} on Lane ${action.laneIndex + 1}, Zone ${action.zoneIndex}.`);
        } else {
          // Replace existing filter — auto-sell old one at half price
          const oldFilter = zone.filters[zone.filters.length - 1];
          const sellValue = Math.floor(FILTER_COSTS[oldFilter] / 2);
          player.sc += sellValue;
          zone.filters[zone.filters.length - 1] = filter;
          log(newState, `Replaced ${oldFilter} with ${filter}. Reclaimed ${sellValue} SC.`);
        }
      } else {
        zone.filters.push(filter);
        log(newState, `Placed ${filter} on Lane ${action.laneIndex + 1}, Zone ${action.zoneIndex}.`);
      }

      // Auto-scrub: new filter immediately catches any matching tokens already in the zone
      for (let i = zone.tokens.length - 1; i >= 0; i--) {
        const token = zone.tokens[i];
        if (canFilterCatch(filter, token, newState)) {
          zone.tokens.splice(i, 1);
          player.sc += 1;
          player.vp += 1;
          log(newState, `${token} immediately captured by new ${filter}! (+1 VP)`);
        }
      }

      player.hand.splice(newState.selectedFilterIndex!, 1);
      newState.selectedAction = null;
      newState.selectedFilterIndex = null;
      // Placing a filter is a free action
      return newState;
    }

    case 'EXECUTE_PURIFY': {
      if (newState.purifiesLeft > 0) {
        const usedFilter = purifyToken(newState, action.laneIndex, action.zoneIndex, action.tokenIndex);
        if (usedFilter) {
          newState.purifiesLeft -= 1;
          if (newState.purifiesLeft === 0) {
            newState.selectedAction = null;
          }
        }
      }
      return newState;
    }

    case 'EXECUTE_DEFLECT': {
      const player = newState.players[newState.activePlayer];
      if (player.deflectedThisTurn) {
        log(newState, "You can only deflect once per turn.");
        return newState;
      }
      if (action.zoneIndex === 0) {
        log(newState, "Tokens in the Core cannot be deflected. Only tokens in Zones can be deflected.");
        return newState;
      }
      if (newState.activeClimate?.id === 'thermal') {
        log(newState, "Thermal Inversion: Deflect is disabled!");
        return newState;
      }
      
      const zone = newState.board.lanes[action.laneIndex].zones[action.zoneIndex - 1].tokens;
      const token = zone.splice(action.tokenIndex, 1)[0];
      
      let minTokens = Infinity;
      let targetLane = -1;
      
      for (let i = 0; i < 6; i++) {
        if (player.lanes.includes(i)) continue;
        const l = newState.board.lanes[i];
        const activeTokens = l.core.length + l.zones[0].tokens.length + l.zones[1].tokens.length + l.zones[2].tokens.length;
        if (activeTokens < minTokens) {
          minTokens = activeTokens;
          targetLane = i;
        }
      }
      
      if (targetLane !== -1) {
        pushToken(newState, targetLane, 0, token);
        log(newState, `Deflected token to Lane ${targetLane + 1} (Zone 1).`);
      }
      
      player.deflectedThisTurn = true;
      newState.ap -= 1;
      newState.selectedAction = null;
      return newState;
    }

    case 'END_TURN':
      newState.players[newState.activePlayer].deflectedThisTurn = false;
      newState.ap = 2;
      newState.selectedAction = null;
      newState.selectedFilterIndex = null;
      newState.purifiesLeft = 0;
      newState.vocCapturedThisPurify = 0;
      
      const nextPlayer = (newState.activePlayer + 1) % newState.players.length;

      if (nextPlayer <= newState.activePlayer) {
        newState.phase = 'upkeep';
        newState.activePlayer = 0;
        log(newState, 'Round ended. Entering Upkeep phase.');
      } else {
        newState.activePlayer = nextPlayer;
        log(newState, `${newState.players[newState.activePlayer].name}'s turn.`);
      }
      return newState;

    case 'UPKEEP': {
      const is3P = newState.players.length === 3;

      const maxRounds = newState.enableTier3 ? 15 : 10;

      if (newState.round >= maxRounds) {
        newState.phase = 'gameover';
        log(newState, 'SIMULATION COMPLETE.');
        
        // Final VP Bonus — rewards for keeping districts clean
        // Clean air is the goal: fewer district pollutants = higher bonus
        for (const player of newState.players) {
          let bonus = 0;
          for (const l of player.lanes) {
            const pollutants = newState.board.lanes[l].district.length;
            if (pollutants === 0) {
              bonus += 5;   // Perfectly clean district
            } else if (pollutants <= 2) {
              bonus += 3;   // Mostly clean district
            }
            // 3+ pollutants: no bonus (district air quality unacceptable)
          }
          player.vp += bonus;
          if (bonus > 0) {
            log(newState, `${player.name} earns +${bonus} VP for clean districts!`);
          }
        }
      } else {
        newState.round += 1;
        if (newState.round >= 6 && newState.round <= 10) newState.tier = 2;
        if (newState.round >= 11) newState.tier = 3;
        
        if (newState.climateDuration > 0) {
          newState.climateDuration -= 1;
          if (newState.climateDuration === 0) {
            log(newState, `${newState.activeClimate?.title} climate event has ended.`);
            newState.activeClimate = null;
          }
        }

        newState.phase = 'emission';
        for (const p of newState.players) {
          p.sc += is3P ? 2 : 3;
        }
        log(newState, `Round ${newState.round} begins. Stipends distributed.`);
      }
      return newState;
    }

    default:
      return state;
  }
}
