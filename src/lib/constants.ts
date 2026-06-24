// Status/type string unions (SQLite has no native enums).

export const LedgerType = {
  GRANT: "GRANT",
  STAKE: "STAKE",
  PAYOUT: "PAYOUT",
  RAKE: "RAKE",
  REFUND: "REFUND",
  ADJUSTMENT: "ADJUSTMENT",
} as const;
export type LedgerType = (typeof LedgerType)[keyof typeof LedgerType];

export const GameweekStatus = {
  UPCOMING: "UPCOMING",
  LIVE: "LIVE",
  FINISHED: "FINISHED",
  FINALIZED: "FINALIZED",
} as const;
export type GameweekStatus = (typeof GameweekStatus)[keyof typeof GameweekStatus];

export const MarketStatus = {
  OPEN: "OPEN",
  LOCKED: "LOCKED",
  SETTLED: "SETTLED",
  VOID: "VOID",
} as const;
export type MarketStatus = (typeof MarketStatus)[keyof typeof MarketStatus];

export const LegPick = { OVER: "OVER", UNDER: "UNDER" } as const;
export type LegPick = (typeof LegPick)[keyof typeof LegPick];

export const LegResult = {
  PENDING: "PENDING",
  WON: "WON",
  LOST: "LOST",
  PUSH: "PUSH",
  VOID: "VOID",
} as const;
export type LegResult = (typeof LegResult)[keyof typeof LegResult];

export const SlipStatus = {
  PENDING: "PENDING",
  WON: "WON",
  LOST: "LOST",
  VOID: "VOID",
} as const;
export type SlipStatus = (typeof SlipStatus)[keyof typeof SlipStatus];

export const H2HMetric = {
  LINEUP_TOTAL: "LINEUP_TOTAL",
  SINGLE_PLAYER: "SINGLE_PLAYER",
} as const;
export type H2HMetric = (typeof H2HMetric)[keyof typeof H2HMetric];

export const H2HStatus = {
  OPEN: "OPEN",
  ACCEPTED: "ACCEPTED",
  LOCKED: "LOCKED",
  SETTLED: "SETTLED",
  VOID: "VOID",
} as const;
export type H2HStatus = (typeof H2HStatus)[keyof typeof H2HStatus];

export const PoolFormat = { GPP: "GPP", DOUBLE_UP: "DOUBLE_UP" } as const;
export type PoolFormat = (typeof PoolFormat)[keyof typeof PoolFormat];

export const PoolStatus = {
  OPEN: "OPEN",
  LOCKED: "LOCKED",
  SETTLED: "SETTLED",
  VOID: "VOID",
} as const;
export type PoolStatus = (typeof PoolStatus)[keyof typeof PoolStatus];

export const HOUSE_RAKE_BPS = 1000; // 10% default rake
export const PROP_VIG = 0.06; // 6% margin baked into prop multipliers
