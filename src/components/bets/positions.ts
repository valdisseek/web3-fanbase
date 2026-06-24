// FPL element_type → position abbreviation. Used by the prop cards and the
// circular position-category selector (the FPL analogue of Draftea's sport row).

export const POSITIONS: { value: number | null; label: string }[] = [
  { value: null, label: "All" },
  { value: 1, label: "GKP" },
  { value: 2, label: "DEF" },
  { value: 3, label: "MID" },
  { value: 4, label: "FWD" },
];

const MAP: Record<number, string> = { 1: "GKP", 2: "DEF", 3: "MID", 4: "FWD" };

export function positionLabel(elementType: number): string {
  return MAP[elementType] ?? "";
}
