export interface FixtureChip {
  id: number;
  label: string;
  live: boolean;
}

export interface FixtureForChips {
  id: number;
  teamHId: number;
  teamAId: number;
  started: boolean;
  finished: boolean;
}

export function buildFixtureChips(
  fixtures: FixtureForChips[],
  teamShortById: Record<number, string>,
): FixtureChip[] {
  return fixtures.map((f) => ({
    id: f.id,
    label: `${teamShortById[f.teamHId] ?? "?"} vs ${teamShortById[f.teamAId] ?? "?"}`,
    live: f.started && !f.finished,
  }));
}
