import { PROP_VIG } from "@/lib/constants";

/** Snap a projection to the nearest 0.5 so settlement lines avoid pushes. */
export function snapLine(mu: number): number {
  const snapped = Math.round(mu * 2) / 2;
  // Keep lines on the X.5 grid (whole-number lines can PUSH).
  return Number.isInteger(snapped) ? snapped + 0.5 : snapped;
}

/** Logistic probability that actual points exceed the line, given projection mu. */
export function probOver(mu: number, line: number, k = 2.5): number {
  const p = 1 / (1 + Math.exp(-(mu - line) / k));
  // Clamp so multipliers never explode on extreme inputs.
  return Math.min(0.95, Math.max(0.05, p));
}

export interface PropPrice {
  line: number;
  overMultiplier: number;
  underMultiplier: number;
}

/**
 * Produce an over/under market for a projection. Vig is baked into both
 * multipliers so the book has an overround (house edge).
 */
export function priceProp(mu: number, vig = PROP_VIG): PropPrice {
  const line = snapLine(mu);
  const pOver = probOver(mu, line);
  const pUnder = 1 - pOver;
  const round2 = (n: number) => Math.round(n * 100) / 100;
  return {
    line,
    overMultiplier: round2((1 / pOver) * (1 - vig)),
    underMultiplier: round2((1 / pUnder) * (1 - vig)),
  };
}

/** Overround > 1 means the book has an edge. Used in invariant tests. */
export function overround(price: PropPrice): number {
  return 1 / price.overMultiplier + 1 / price.underMultiplier;
}
