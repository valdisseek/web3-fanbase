export interface RawMarket {
  id: string;
  playerId: number;
  webName: string;
  teamId: number;
  teamShort: string;
  elementType: number;
  line: number;
  overMultiplier: number;
  underMultiplier: number;
  code: number | null;
}

export interface FixtureForMapping {
  id: number;
  teamHId: number;
  teamAId: number;
  started: boolean;
  finished: boolean;
}

export interface MarketRow {
  id: string;
  playerId: number;
  player: string;
  team: string;
  code: number | null;
  teamId: number;
  position: number;
  line: number;
  overMultiplier: number;
  underMultiplier: number;
  opponent: string | null;
  isHome: boolean;
  fixtureId: number | null;
}

export function buildMarketRows(
  markets: RawMarket[],
  fixtures: FixtureForMapping[],
  teamShortById: Record<number, string>,
): MarketRow[] {
  return markets.map((m) => {
    const fx = fixtures.find(
      (f) => f.teamHId === m.teamId || f.teamAId === m.teamId,
    );
    const isHome = fx ? fx.teamHId === m.teamId : false;
    const opponentId = fx ? (isHome ? fx.teamAId : fx.teamHId) : null;
    return {
      id: m.id,
      playerId: m.playerId,
      player: m.webName,
      team: m.teamShort,
      code: m.code,
      teamId: m.teamId,
      position: m.elementType,
      line: m.line,
      overMultiplier: m.overMultiplier,
      underMultiplier: m.underMultiplier,
      opponent: opponentId != null ? (teamShortById[opponentId] ?? null) : null,
      isHome,
      fixtureId: fx?.id ?? null,
    };
  });
}
