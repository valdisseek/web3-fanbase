# Bets Tab — Draftea-Style Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `/lobby` "Betting" hub with a Draftea-style **Bets** page (own header, fixture chips, Popular/By Match/All Players tabs, photo-forward prop cards, floating bet slip) wired to the existing player-props engine.

**Architecture:** A small additive backend change (store FPL player `code`, enrich `/api/markets`) feeds new presentational components under `src/components/bets/`. A single client island (`BetsClient`) owns interaction state and reuses the unchanged `POST /api/bets` placement flow. Routing is renamed `/lobby → /bets`; `/bets` renders without the global header so it can show its own.

**Tech Stack:** Next.js 16.2.9 (App Router, Turbopack), React 19.2.4, TypeScript, Tailwind CSS v4 (CSS-variable theme already in `globals.css`), Prisma + SQLite, Vitest + @testing-library/react (jsdom for `*.dom.test.tsx`), lucide-react.

## Global Constraints

- **Visual reskin only** — no new bet types; `lib/engine/*`, pricing, parlay math, settlement, and the ledger are untouched.
- **Placement unchanged** — bets post to existing `POST /api/bets` (`{ stake, legs: [{ marketId, pick }] }`); entries read `GET /api/bets`.
- **Palette** comes from existing CSS vars: accent `--color-brand-blue` `#2f93ef`, canvas `--bg-app` `#0a0a0b`, card `--bg-card` `#1c1c1f`, muted text `--text-muted` `#8e8e93`. Use Tailwind tokens already mapped (`bg-app-bg`, `bg-card-bg`, `text-text-main`, `text-text-muted`, `border-border-base`, `text-brand-blue`). `text-brand-purple` resolves to the same blue.
- **Mobile column** — everything lives inside the existing `max-w-md mx-auto` frame.
- **Headshot URL** — `https://resources.premierleague.com/premierleague/photos/players/250x250/p{code}.png`; always fall back to initials (never a broken image).
- **Naming** — nav label is exactly **"Bets"**; route is exactly `/bets`.
- **Test runner** — `npx vitest run <file>`. Component tests MUST end in `.dom.test.tsx` (jsdom); pure-logic tests end in `.test.ts` (node).
- **Git** — this project is **not** a git repo yet. Run `git init` once before starting if you want the `git commit` steps to succeed; otherwise treat each commit step as a checkpoint marker.

---

## File Structure

```
prisma/schema.prisma                         # Modify: add Player.code
src/lib/fpl/types.ts                          # Modify: FplElement.code
src/lib/fpl/sync.ts                           # Modify: playerUpsertFields() incl code
src/lib/marketRows.ts                         # Create: MarketRow type + buildMarketRows() (pure)
src/app/api/markets/route.ts                  # Modify: use buildMarketRows, richer rows
src/lib/betsView.ts                           # Create: FixtureChip type + buildFixtureChips() (pure)

src/components/bets/PlayerHeadshot.tsx        # Create: photo + initials fallback (+ initials())
src/components/bets/PropCard.tsx              # Create: style-C card
src/components/bets/FixtureChips.tsx          # Create: fixture filter row
src/components/bets/BetTabs.tsx               # Create: Popular/By Match/All Players + search
src/components/bets/BetsHeader.tsx            # Create: logo·help·balance·"+"·entries ticket
src/components/bets/BetSlipBar.tsx            # Create: floating slip (restyle of /props slip)
src/components/bets/MyEntriesSheet.tsx        # Create: entries slide-over (restyle of my-bets)
src/components/bets/BetsClient.tsx            # Create: client island wiring it all
src/app/(app)/bets/page.tsx                   # Create: server wrapper

src/app/(app)/lobby/page.tsx                  # Modify: redirect → /bets
src/app/(app)/props/page.tsx                  # Modify: redirect → /bets
src/app/(app)/props/my-bets/page.tsx          # Modify: redirect → /bets
src/components/shell/AppShell.tsx             # Modify: PROTO regex incl bets
src/components/shell/BottomNav.tsx            # Modify: label "Bets", href /bets, active logic

tests/lib/marketRows.test.ts                  # Create
tests/lib/betsView.test.ts                    # Create
tests/lib/playerFields.test.ts                # Create
tests/components/PlayerHeadshot.dom.test.tsx  # Create
tests/components/PropCard.dom.test.tsx        # Create
tests/components/FixtureChips.dom.test.tsx    # Create
tests/components/BetTabs.dom.test.tsx         # Create
tests/components/BetSlipBar.dom.test.tsx      # Create
tests/components/MyEntriesSheet.dom.test.tsx  # Create
tests/components/BetsClient.dom.test.tsx      # Create
tests/components/BottomNav.dom.test.tsx       # Create
```

**Shared types** live in `src/lib/marketRows.ts` and `src/lib/betsView.ts` (importable by both server route and client components).

---

## Task 1: Store FPL player photo `code`

**Files:**
- Modify: `prisma/schema.prisma` (Player model, lines ~66-82)
- Modify: `src/lib/fpl/types.ts` (FplElement, lines 10-22)
- Modify: `src/lib/fpl/sync.ts` (player upsert, lines 24-42)
- Test: `tests/lib/playerFields.test.ts`

**Interfaces:**
- Produces: `playerUpsertFields(p: FplElement): { webName, firstName, secondName, teamId, elementType, nowCost, totalPoints, form, epNext, status, code }` exported from `src/lib/fpl/sync.ts`. `FplElement` gains `code: number`. `Player` gains `code Int?`.

- [ ] **Step 1: Add `code` to the FPL element type**

In `src/lib/fpl/types.ts`, add to `FplElement` (after `id: number;`):

```typescript
export interface FplElement {
  id: number;
  code: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  total_points: number;
  form: string;
  ep_next: string;
  status: string;
}
```

- [ ] **Step 2: Write the failing test for the field mapper**

Create `tests/lib/playerFields.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { playerUpsertFields } from "@/lib/fpl/sync";
import type { FplElement } from "@/lib/fpl/types";

const el: FplElement = {
  id: 9, code: 118748, web_name: "Salah", first_name: "Mohamed",
  second_name: "Salah", team: 12, element_type: 3, now_cost: 130,
  total_points: 200, form: "7.5", ep_next: "6.2", status: "a",
};

describe("playerUpsertFields", () => {
  it("maps the FPL photo code through", () => {
    expect(playerUpsertFields(el).code).toBe(118748);
  });
  it("parses numeric strings", () => {
    const f = playerUpsertFields(el);
    expect(f.form).toBe(7.5);
    expect(f.epNext).toBe(6.2);
    expect(f.webName).toBe("Salah");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/lib/playerFields.test.ts`
Expected: FAIL — `playerUpsertFields` is not exported.

- [ ] **Step 4: Extract and export the field mapper, include `code`**

In `src/lib/fpl/sync.ts`, replace the inline field object inside `syncBootstrap`'s element loop (lines 24-42) with a call to a new exported helper. Add near the top (after imports):

```typescript
export function playerUpsertFields(p: FplElement) {
  return {
    webName: p.web_name,
    firstName: p.first_name,
    secondName: p.second_name,
    teamId: p.team,
    elementType: p.element_type,
    nowCost: p.now_cost,
    totalPoints: p.total_points,
    form: parseFloat(p.form) || 0,
    epNext: parseFloat(p.ep_next) || 0,
    status: p.status,
    code: p.code,
  };
}
```

Then change the loop body to:

```typescript
  for (const p of data.elements) {
    const fields = playerUpsertFields(p);
    await prisma.player.upsert({
      where: { id: p.id },
      update: fields,
      create: { id: p.id, ...fields },
    });
  }
```

- [ ] **Step 5: Add `code` to the Player schema**

In `prisma/schema.prisma`, add to the `Player` model (after `status` line 77):

```prisma
  status      String @default("a")
  code        Int?   // FPL element.code — player photo id
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tests/lib/playerFields.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 7: Apply the schema change**

Run: `npx prisma db push`
Expected: "Your database is now in sync with your Prisma schema." and the client regenerates.

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma src/lib/fpl/types.ts src/lib/fpl/sync.ts tests/lib/playerFields.test.ts
git commit -m "feat(bets): store FPL player photo code"
```

---

## Task 2: Enrich `/api/markets` with photo + fixture data

**Files:**
- Create: `src/lib/marketRows.ts`
- Modify: `src/app/api/markets/route.ts`
- Test: `tests/lib/marketRows.test.ts`

**Interfaces:**
- Consumes: nothing from prior tasks at runtime.
- Produces: `MarketRow` interface and `buildMarketRows(markets, fixtures, teamShortById)` from `src/lib/marketRows.ts`:

```typescript
export interface MarketRow {
  id: string;
  playerId: number;
  player: string;        // webName
  team: string;          // player's team shortName
  code: number | null;
  teamId: number;
  position: number;      // elementType
  line: number;
  overMultiplier: number;
  underMultiplier: number;
  opponent: string | null;
  isHome: boolean;
  fixtureId: number | null;
}
```

The `/api/markets` GET response becomes `{ gameweekId, markets: MarketRow[] }`.

- [ ] **Step 1: Write the failing test**

Create `tests/lib/marketRows.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildMarketRows, type RawMarket, type FixtureForMapping } from "@/lib/marketRows";

const teamShort = { 11: "MUN", 12: "LIV", 13: "ARS" };

const market: RawMarket = {
  id: "m1", playerId: 9, webName: "Salah", teamId: 12, teamShort: "LIV",
  elementType: 3, line: 6.5, overMultiplier: 1.85, underMultiplier: 1.95, code: 118748,
};

const fixtures: FixtureForMapping[] = [
  { id: 100, teamHId: 11, teamAId: 12, started: false, finished: false },
];

describe("buildMarketRows", () => {
  it("resolves opponent, home/away, and fixture id", () => {
    const [row] = buildMarketRows([market], fixtures, teamShort);
    expect(row.opponent).toBe("MUN");
    expect(row.isHome).toBe(false);
    expect(row.fixtureId).toBe(100);
    expect(row.code).toBe(118748);
    expect(row.player).toBe("Salah");
  });

  it("marks home correctly", () => {
    const home = { ...market, teamId: 11, teamShort: "MUN" };
    const [row] = buildMarketRows([home], fixtures, teamShort);
    expect(row.isHome).toBe(true);
    expect(row.opponent).toBe("LIV");
  });

  it("returns null opponent/fixture when the team has no fixture (blank GW)", () => {
    const [row] = buildMarketRows([market], [], teamShort);
    expect(row.opponent).toBeNull();
    expect(row.fixtureId).toBeNull();
    expect(row.isHome).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/marketRows.test.ts`
Expected: FAIL — cannot find module `@/lib/marketRows`.

- [ ] **Step 3: Implement the pure mapper**

Create `src/lib/marketRows.ts`:

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/lib/marketRows.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Wire the route to use it**

Replace `src/app/api/markets/route.ts` entirely:

```typescript
import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getNextGameweek } from "@/lib/markets";
import { MarketStatus } from "@/lib/constants";
import { ok } from "@/lib/api";
import { buildMarketRows, type RawMarket } from "@/lib/marketRows";

export async function GET(req: NextRequest) {
  const gwParam = req.nextUrl.searchParams.get("gw");
  let gameweekId = gwParam ? Number(gwParam) : null;
  if (!gameweekId) {
    const gw = await getNextGameweek();
    gameweekId = gw?.id ?? null;
  }
  if (!gameweekId) return ok({ gameweekId: null, markets: [] });

  const [markets, fixtures, teams] = await Promise.all([
    prisma.propMarket.findMany({
      where: { gameweekId, status: MarketStatus.OPEN },
      include: { player: { include: { team: true } } },
      orderBy: { line: "desc" },
      take: 200,
    }),
    prisma.fixture.findMany({ where: { gameweekId } }),
    prisma.team.findMany(),
  ]);

  const teamShortById: Record<number, string> = {};
  for (const t of teams) teamShortById[t.id] = t.shortName;

  const raw: RawMarket[] = markets.map((m) => ({
    id: m.id,
    playerId: m.playerId,
    webName: m.player.webName,
    teamId: m.player.teamId,
    teamShort: m.player.team.shortName,
    elementType: m.player.elementType,
    line: m.line,
    overMultiplier: m.overMultiplier,
    underMultiplier: m.underMultiplier,
    code: m.player.code,
  }));

  return ok({
    gameweekId,
    markets: buildMarketRows(
      raw,
      fixtures.map((f) => ({
        id: f.id,
        teamHId: f.teamHId,
        teamAId: f.teamAId,
        started: f.started,
        finished: f.finished,
      })),
      teamShortById,
    ),
  });
}
```

- [ ] **Step 6: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/lib/marketRows.ts src/app/api/markets/route.ts tests/lib/marketRows.test.ts
git commit -m "feat(bets): enrich markets API with photo code and fixture data"
```

---

## Task 3: `PlayerHeadshot` component

**Files:**
- Create: `src/components/bets/PlayerHeadshot.tsx`
- Test: `tests/components/PlayerHeadshot.dom.test.tsx`

**Interfaces:**
- Produces: `initials(name: string): string` and `PlayerHeadshot({ code, name, size? }: { code: number | null; name: string; size?: number })` from `src/components/bets/PlayerHeadshot.tsx`.

- [ ] **Step 1: Write the failing test**

Create `tests/components/PlayerHeadshot.dom.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PlayerHeadshot, initials } from "@/components/bets/PlayerHeadshot";

describe("initials", () => {
  it("takes first + last initial", () => {
    expect(initials("M. Salah")).toBe("MS");
    expect(initials("Bukayo Saka")).toBe("BS");
  });
  it("uses first two letters for a single word", () => {
    expect(initials("Salah")).toBe("SA");
  });
});

describe("PlayerHeadshot", () => {
  it("renders the FPL photo when code is present", () => {
    render(<PlayerHeadshot code={118748} name="M. Salah" />);
    const img = screen.getByAltText("M. Salah") as HTMLImageElement;
    expect(img.src).toContain("p118748.png");
  });

  it("shows initials when code is null", () => {
    render(<PlayerHeadshot code={null} name="M. Salah" />);
    expect(screen.getByText("MS")).toBeTruthy();
  });

  it("falls back to initials when the image errors", () => {
    render(<PlayerHeadshot code={999} name="M. Salah" />);
    fireEvent.error(screen.getByAltText("M. Salah"));
    expect(screen.getByText("MS")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/PlayerHeadshot.dom.test.tsx`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the component**

Create `src/components/bets/PlayerHeadshot.tsx`:

```tsx
"use client";

import { useState } from "react";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function PlayerHeadshot({
  code,
  name,
  size = 92,
}: {
  code: number | null;
  name: string;
  size?: number;
}) {
  const [errored, setErrored] = useState(false);
  const showPhoto = code != null && !errored;

  if (showPhoto) {
    return (
      <img
        src={`https://resources.premierleague.com/premierleague/photos/players/250x250/p${code}.png`}
        alt={name}
        onError={() => setErrored(true)}
        style={{ height: size }}
        className="w-full object-contain object-bottom"
      />
    );
  }

  return (
    <div
      style={{ height: size }}
      aria-label={name}
      className="flex items-center justify-center text-2xl font-bold text-brand-blue"
    >
      {initials(name)}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/PlayerHeadshot.dom.test.tsx`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/bets/PlayerHeadshot.tsx tests/components/PlayerHeadshot.dom.test.tsx
git commit -m "feat(bets): PlayerHeadshot with initials fallback"
```

---

## Task 4: `PropCard` component (style C)

**Files:**
- Create: `src/components/bets/PropCard.tsx`
- Test: `tests/components/PropCard.dom.test.tsx`

**Interfaces:**
- Consumes: `MarketRow` from `@/lib/marketRows`; `PlayerHeadshot` from Task 3.
- Produces: `type Pick = "OVER" | "UNDER"` and `PropCard({ market, gwName, selected, onPick }: { market: MarketRow; gwName: string; selected: Pick | null; onPick: (market: MarketRow, pick: Pick) => void })` from `src/components/bets/PropCard.tsx`. The Over button has `aria-pressed`, accessible name `Over {line}`; Under button accessible name `Under {line}`.

- [ ] **Step 1: Write the failing test**

Create `tests/components/PropCard.dom.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PropCard } from "@/components/bets/PropCard";
import type { MarketRow } from "@/lib/marketRows";

const market: MarketRow = {
  id: "m1", playerId: 9, player: "Salah", team: "LIV", code: 118748, teamId: 12,
  position: 3, line: 6.5, overMultiplier: 1.85, underMultiplier: 1.95,
  opponent: "MUN", isHome: false, fixtureId: 100,
};

describe("PropCard", () => {
  it("renders player, match label, line, and both multipliers", () => {
    render(<PropCard market={market} gwName="GW1" selected={null} onPick={() => {}} />);
    expect(screen.getByText("Salah")).toBeTruthy();
    expect(screen.getByText(/MUN vs LIV/)).toBeTruthy();
    expect(screen.getByText(/GW1/)).toBeTruthy();
    expect(screen.getByText("1.85×")).toBeTruthy();
    expect(screen.getByText("1.95×")).toBeTruthy();
  });

  it("calls onPick with OVER when the over button is clicked", () => {
    const onPick = vi.fn();
    render(<PropCard market={market} gwName="GW1" selected={null} onPick={onPick} />);
    fireEvent.click(screen.getByRole("button", { name: /Over 6.5/ }));
    expect(onPick).toHaveBeenCalledWith(market, "OVER");
  });

  it("marks the selected side as pressed", () => {
    render(<PropCard market={market} gwName="GW1" selected="UNDER" onPick={() => {}} />);
    expect(screen.getByRole("button", { name: /Under 6.5/ }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: /Over 6.5/ }).getAttribute("aria-pressed")).toBe("false");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/PropCard.dom.test.tsx`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the component**

Create `src/components/bets/PropCard.tsx`:

```tsx
"use client";

import { BarChart2 } from "lucide-react";
import type { MarketRow } from "@/lib/marketRows";
import { PlayerHeadshot } from "./PlayerHeadshot";

export type Pick = "OVER" | "UNDER";

function matchLabel(m: MarketRow): string {
  if (!m.opponent) return m.team;
  return m.isHome ? `${m.team} vs ${m.opponent}` : `${m.opponent} vs ${m.team}`;
}

export function PropCard({
  market,
  gwName,
  selected,
  onPick,
}: {
  market: MarketRow;
  gwName: string;
  selected: Pick | null;
  onPick: (market: MarketRow, pick: Pick) => void;
}) {
  return (
    <div className="bg-card-bg border border-border-base rounded-2xl overflow-hidden">
      <div className="flex justify-between items-center px-2.5 pt-2 text-[9px] text-text-muted">
        <span className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center">
          <BarChart2 size={11} />
        </span>
        <span>{matchLabel(market)} · {gwName}</span>
      </div>

      <PlayerHeadshot code={market.code} name={market.player} size={92} />

      <div className="text-center font-bold text-sm px-2">{market.player}</div>
      <div className="text-center text-[10px] text-text-muted mt-0.5 mb-2">
        Line <strong className="text-text-main">{market.line} pts</strong>
      </div>

      <div className="mx-2 mb-2 flex border border-border-base rounded-xl overflow-hidden">
        <button
          aria-pressed={selected === "OVER"}
          onClick={() => onPick(market, "OVER")}
          className={`flex-1 py-1.5 flex flex-col items-center gap-px text-xs font-bold ${
            selected === "OVER" ? "bg-brand-blue/20 text-brand-blue" : "text-text-main"
          }`}
        >
          <span className="text-[8px] uppercase tracking-wide text-text-muted">
            Over {market.line}
          </span>
          {market.overMultiplier.toFixed(2)}×
        </button>
        <button
          aria-pressed={selected === "UNDER"}
          onClick={() => onPick(market, "UNDER")}
          className={`flex-1 py-1.5 flex flex-col items-center gap-px text-xs font-bold border-l border-border-base ${
            selected === "UNDER" ? "bg-brand-blue/20 text-brand-blue" : "text-text-main"
          }`}
        >
          <span className="text-[8px] uppercase tracking-wide text-text-muted">
            Under {market.line}
          </span>
          {market.underMultiplier.toFixed(2)}×
        </button>
      </div>
    </div>
  );
}
```

Note: the accessible name of each button is its full text content (label span + multiplier), so `name: /Over 6.5/` and the visible `1.85×` text both resolve. The `toFixed(2)` of `1.85` is `"1.85"`, rendered as `1.85×`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/PropCard.dom.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/bets/PropCard.tsx tests/components/PropCard.dom.test.tsx
git commit -m "feat(bets): PropCard style-C with segmented over/under"
```

---

## Task 5: `buildFixtureChips` helper + `FixtureChips` component

**Files:**
- Create: `src/lib/betsView.ts`
- Create: `src/components/bets/FixtureChips.tsx`
- Test: `tests/lib/betsView.test.ts`, `tests/components/FixtureChips.dom.test.tsx`

**Interfaces:**
- Produces:
  - `FixtureChip` interface and `buildFixtureChips(fixtures, teamShortById): FixtureChip[]` from `src/lib/betsView.ts`:
    ```typescript
    export interface FixtureChip { id: number; label: string; live: boolean; }
    export interface FixtureForChips { id: number; teamHId: number; teamAId: number; started: boolean; finished: boolean; }
    export function buildFixtureChips(fixtures: FixtureForChips[], teamShortById: Record<number, string>): FixtureChip[];
    ```
  - `FixtureChips({ fixtures, activeFixtureId, onSelect }: { fixtures: FixtureChip[]; activeFixtureId: number | null; onSelect: (id: number | null) => void })` from `src/components/bets/FixtureChips.tsx`.

- [ ] **Step 1: Write the failing helper test**

Create `tests/lib/betsView.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildFixtureChips, type FixtureForChips } from "@/lib/betsView";

const teamShort = { 11: "MUN", 12: "LIV", 13: "ARS", 14: "CITY" };
const fixtures: FixtureForChips[] = [
  { id: 100, teamHId: 11, teamAId: 12, started: true, finished: false },
  { id: 101, teamHId: 14, teamAId: 13, started: false, finished: false },
];

describe("buildFixtureChips", () => {
  it("labels home vs away and flags live fixtures", () => {
    const chips = buildFixtureChips(fixtures, teamShort);
    expect(chips[0]).toEqual({ id: 100, label: "MUN vs LIV", live: true });
    expect(chips[1]).toEqual({ id: 101, label: "CITY vs ARS", live: false });
  });
  it("is not live once finished", () => {
    const done = [{ ...fixtures[0], started: true, finished: true }];
    expect(buildFixtureChips(done, teamShort)[0].live).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/betsView.test.ts`
Expected: FAIL — cannot find module `@/lib/betsView`.

- [ ] **Step 3: Implement the helper**

Create `src/lib/betsView.ts`:

```typescript
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
```

- [ ] **Step 4: Run helper test to verify it passes**

Run: `npx vitest run tests/lib/betsView.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write the failing component test**

Create `tests/components/FixtureChips.dom.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FixtureChips } from "@/components/bets/FixtureChips";

const chips = [
  { id: 100, label: "MUN vs LIV", live: true },
  { id: 101, label: "CITY vs ARS", live: false },
];

describe("FixtureChips", () => {
  it("renders an All chip plus one per fixture and a LIVE marker", () => {
    render(<FixtureChips fixtures={chips} activeFixtureId={null} onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "All" })).toBeTruthy();
    expect(screen.getByText("MUN vs LIV")).toBeTruthy();
    expect(screen.getByText("LIVE")).toBeTruthy();
  });

  it("selects a fixture and clears via All", () => {
    const onSelect = vi.fn();
    render(<FixtureChips fixtures={chips} activeFixtureId={100} onSelect={onSelect} />);
    fireEvent.click(screen.getByText("CITY vs ARS"));
    expect(onSelect).toHaveBeenCalledWith(101);
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
```

- [ ] **Step 6: Run component test to verify it fails**

Run: `npx vitest run tests/components/FixtureChips.dom.test.tsx`
Expected: FAIL — cannot find module.

- [ ] **Step 7: Implement the component**

Create `src/components/bets/FixtureChips.tsx`:

```tsx
"use client";

import type { FixtureChip } from "@/lib/betsView";

export function FixtureChips({
  fixtures,
  activeFixtureId,
  onSelect,
}: {
  fixtures: FixtureChip[];
  activeFixtureId: number | null;
  onSelect: (id: number | null) => void;
}) {
  const base =
    "flex-none rounded-[10px] px-2.5 py-1.5 text-[11px] whitespace-nowrap border transition-colors";
  return (
    <div className="flex gap-2 px-4 pb-2.5 overflow-x-auto">
      <button
        onClick={() => onSelect(null)}
        className={`${base} ${
          activeFixtureId === null
            ? "bg-brand-blue/15 border-brand-blue text-brand-blue font-bold"
            : "bg-card-bg border-border-base text-text-muted"
        }`}
      >
        All
      </button>
      {fixtures.map((f) => (
        <button
          key={f.id}
          onClick={() => onSelect(f.id)}
          className={`${base} ${
            activeFixtureId === f.id
              ? "bg-brand-blue/15 border-brand-blue text-brand-blue font-bold"
              : f.live
              ? "bg-card-bg border-red-500/40 text-text-main"
              : "bg-card-bg border-border-base text-text-main"
          }`}
        >
          {f.label}
          {f.live && <span className="ml-1 text-red-500 font-bold">LIVE</span>}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Run component test to verify it passes**

Run: `npx vitest run tests/components/FixtureChips.dom.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```bash
git add src/lib/betsView.ts src/components/bets/FixtureChips.tsx tests/lib/betsView.test.ts tests/components/FixtureChips.dom.test.tsx
git commit -m "feat(bets): fixture chips row + builder"
```

---

## Task 6: `BetTabs` component

**Files:**
- Create: `src/components/bets/BetTabs.tsx`
- Test: `tests/components/BetTabs.dom.test.tsx`

**Interfaces:**
- Produces: `type TabKey = "popular" | "match" | "all"` and `BetTabs({ active, onChange, query, onQuery }: { active: TabKey; onChange: (t: TabKey) => void; query: string; onQuery: (q: string) => void })` from `src/components/bets/BetTabs.tsx`.

- [ ] **Step 1: Write the failing test**

Create `tests/components/BetTabs.dom.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BetTabs } from "@/components/bets/BetTabs";

describe("BetTabs", () => {
  it("renders the three tabs and reports changes", () => {
    const onChange = vi.fn();
    render(<BetTabs active="popular" onChange={onChange} query="" onQuery={() => {}} />);
    expect(screen.getByRole("button", { name: "Popular" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "All Players" }));
    expect(onChange).toHaveBeenCalledWith("all");
  });

  it("reports search query changes", () => {
    const onQuery = vi.fn();
    render(<BetTabs active="all" onChange={() => {}} query="" onQuery={onQuery} />);
    fireEvent.change(screen.getByPlaceholderText("Search players"), {
      target: { value: "sal" },
    });
    expect(onQuery).toHaveBeenCalledWith("sal");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/BetTabs.dom.test.tsx`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the component**

Create `src/components/bets/BetTabs.tsx`:

```tsx
"use client";

import { Search } from "lucide-react";

export type TabKey = "popular" | "match" | "all";

const TABS: { key: TabKey; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "match", label: "By Match" },
  { key: "all", label: "All Players" },
];

export function BetTabs({
  active,
  onChange,
  query,
  onQuery,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
  query: string;
  onQuery: (q: string) => void;
}) {
  return (
    <div className="flex gap-4 px-4 items-center border-b border-border-base">
      {TABS.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`py-2.5 text-[13px] font-bold relative ${
            active === t.key ? "text-text-main" : "text-text-muted"
          }`}
        >
          {t.label}
          {active === t.key && (
            <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand-blue rounded" />
          )}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-1.5 text-text-muted">
        <Search size={14} />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search players"
          className="bg-transparent text-xs outline-none w-24 text-text-main placeholder:text-text-muted"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/BetTabs.dom.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/bets/BetTabs.tsx tests/components/BetTabs.dom.test.tsx
git commit -m "feat(bets): Popular/By Match/All Players tabs with search"
```

---

## Task 7: `BetSlipBar` component

**Files:**
- Create: `src/components/bets/BetSlipBar.tsx`
- Test: `tests/components/BetSlipBar.dom.test.tsx`

**Interfaces:**
- Consumes: `fmtCredits` from `@/lib/client`.
- Produces: `Leg` interface and `BetSlipBar` from `src/components/bets/BetSlipBar.tsx`:
  ```typescript
  export interface Leg { marketId: string; player: string; line: number; pick: "OVER" | "UNDER"; multiplier: number; }
  // props:
  // { legs: Leg[]; stake: number; busy: boolean; message: string | null;
  //   onStake: (n: number) => void; onRemove: (marketId: string) => void; onPlace: () => void }
  ```
  Renders nothing when `legs` is empty.

- [ ] **Step 1: Write the failing test**

Create `tests/components/BetSlipBar.dom.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BetSlipBar, type Leg } from "@/components/bets/BetSlipBar";

const legs: Leg[] = [
  { marketId: "m1", player: "Salah", line: 6.5, pick: "OVER", multiplier: 2 },
  { marketId: "m2", player: "Haaland", line: 7.5, pick: "UNDER", multiplier: 1.85 },
];

describe("BetSlipBar", () => {
  it("renders nothing when there are no legs", () => {
    const { container } = render(
      <BetSlipBar legs={[]} stake={100} busy={false} message={null}
        onStake={() => {}} onRemove={() => {}} onPlace={() => {}} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows leg count, combined multiplier, and potential payout", () => {
    render(
      <BetSlipBar legs={legs} stake={100} busy={false} message={null}
        onStake={() => {}} onRemove={() => {}} onPlace={() => {}} />,
    );
    expect(screen.getByText(/2 legs/)).toBeTruthy();
    expect(screen.getByText("×3.70")).toBeTruthy();        // 2 * 1.85
    expect(screen.getByText(/win 370/)).toBeTruthy();      // floor(100 * 3.70)
  });

  it("fires onPlace when the place button is clicked", () => {
    const onPlace = vi.fn();
    render(
      <BetSlipBar legs={legs} stake={100} busy={false} message={null}
        onStake={() => {}} onRemove={() => {}} onPlace={onPlace} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Place/ }));
    expect(onPlace).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/BetSlipBar.dom.test.tsx`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the component**

Create `src/components/bets/BetSlipBar.tsx`:

```tsx
"use client";

import { X } from "lucide-react";
import { fmtCredits } from "@/lib/client";

export interface Leg {
  marketId: string;
  player: string;
  line: number;
  pick: "OVER" | "UNDER";
  multiplier: number;
}

export function BetSlipBar({
  legs,
  stake,
  busy,
  message,
  onStake,
  onRemove,
  onPlace,
}: {
  legs: Leg[];
  stake: number;
  busy: boolean;
  message: string | null;
  onStake: (n: number) => void;
  onRemove: (marketId: string) => void;
  onPlace: () => void;
}) {
  if (legs.length === 0) return null;

  const combined = legs.reduce((m, l) => m * l.multiplier, 1);
  const potential = Math.floor(stake * combined);

  return (
    <div className="fixed bottom-[72px] left-0 right-0 max-w-md mx-auto px-3 z-40">
      <div className="bg-card-bg border border-brand-blue rounded-2xl p-3 shadow-glass">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-sm">
            Bet slip · {legs.length} {legs.length === 1 ? "leg" : "legs"}
          </span>
          <span className="text-brand-blue font-bold text-sm">×{combined.toFixed(2)}</span>
        </div>

        <div className="space-y-1 mb-3 max-h-24 overflow-y-auto">
          {legs.map((l) => (
            <div key={l.marketId} className="text-xs text-text-muted flex justify-between items-center">
              <span>{l.player} {l.pick} {l.line} · ×{l.multiplier.toFixed(2)}</span>
              <button onClick={() => onRemove(l.marketId)} aria-label={`Remove ${l.player}`}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            value={stake}
            onChange={(e) => onStake(Math.max(1, Number(e.target.value)))}
            className="w-24 rounded-lg bg-app-bg border border-border-base px-3 py-2 text-sm outline-none"
          />
          <button
            onClick={onPlace}
            disabled={busy}
            className="flex-1 rounded-lg bg-gradient-to-tr from-blue-500 to-blue-600 py-2 text-sm font-bold disabled:opacity-50"
          >
            Place · win {fmtCredits(potential)}
          </button>
        </div>

        {message && <p className="text-xs text-brand-blue mt-2">{message}</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/BetSlipBar.dom.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/bets/BetSlipBar.tsx tests/components/BetSlipBar.dom.test.tsx
git commit -m "feat(bets): floating bet slip bar"
```

---

## Task 8: `MyEntriesSheet` component

**Files:**
- Create: `src/components/bets/MyEntriesSheet.tsx`
- Test: `tests/components/MyEntriesSheet.dom.test.tsx`

**Interfaces:**
- Consumes: `apiGet`, `fmtCredits` from `@/lib/client`.
- Produces: `MyEntriesSheet({ open, onClose }: { open: boolean; onClose: () => void })`. When `open`, it fetches `GET /api/bets` (shape `{ slips: Slip[] }`, where `Slip` matches the existing `/props/my-bets` shape) and shows filter pills **All / Open / Settled** (Open = `PENDING`; Settled = `WON | LOST | VOID`). The Live/Upcoming/Past three-way split from the spec is a documented follow-up.

- [ ] **Step 1: Write the failing test**

Create `tests/components/MyEntriesSheet.dom.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MyEntriesSheet } from "@/components/bets/MyEntriesSheet";

const slips = [
  { id: "s1", stake: 100, combinedMultiplier: 2, potentialPayout: 200, status: "PENDING", payout: null,
    legs: [{ player: "Salah", pick: "OVER", line: 6.5, multiplier: 2, result: "PENDING", resultPoints: null }] },
  { id: "s2", stake: 50, combinedMultiplier: 3, potentialPayout: 150, status: "WON", payout: 150,
    legs: [{ player: "Haaland", pick: "UNDER", line: 7.5, multiplier: 3, result: "WON", resultPoints: 4 }] },
];

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: true,
    json: async () => ({ slips }),
  })) as unknown as typeof fetch);
});
afterEach(() => vi.unstubAllGlobals());

describe("MyEntriesSheet", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<MyEntriesSheet open={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("loads slips and filters to settled", async () => {
    render(<MyEntriesSheet open={true} onClose={() => {}} />);
    await waitFor(() => expect(screen.getByText("Salah OVER 6.5")).toBeTruthy());
    fireEvent.click(screen.getByRole("button", { name: "Settled" }));
    expect(screen.queryByText("Salah OVER 6.5")).toBeNull();
    expect(screen.getByText("Haaland UNDER 7.5")).toBeTruthy();
  });

  it("calls onClose from the close button", async () => {
    const onClose = vi.fn();
    render(<MyEntriesSheet open={true} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/MyEntriesSheet.dom.test.tsx`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the component**

Create `src/components/bets/MyEntriesSheet.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiGet, fmtCredits } from "@/lib/client";

interface Leg {
  player: string;
  pick: string;
  line: number;
  multiplier: number;
  result: string;
  resultPoints: number | null;
}
interface Slip {
  id: string;
  stake: number;
  combinedMultiplier: number;
  potentialPayout: number;
  status: string;
  payout: number | null;
  legs: Leg[];
}

type Filter = "all" | "open" | "settled";

const statusColor: Record<string, string> = {
  PENDING: "text-text-muted",
  WON: "text-brand-blue",
  LOST: "text-brand-pink",
  VOID: "text-text-muted",
};

export function MyEntriesSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [slips, setSlips] = useState<Slip[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    apiGet<{ slips: Slip[] }>("/api/bets")
      .then((d) => setSlips(d.slips))
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const shown = slips.filter((s) =>
    filter === "all"
      ? true
      : filter === "open"
      ? s.status === "PENDING"
      : s.status !== "PENDING",
  );

  const pills: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "settled", label: "Settled" },
  ];

  return (
    <div className="fixed inset-0 z-50 max-w-md mx-auto bg-app-bg flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-base">
        <h2 className="font-extrabold text-lg">My Entries</h2>
        <button onClick={onClose} aria-label="Close entries" className="text-text-muted">
          <X size={22} />
        </button>
      </div>

      <div className="flex gap-2 px-4 py-3">
        {pills.map((p) => (
          <button
            key={p.key}
            onClick={() => setFilter(p.key)}
            className={`rounded-full px-3 py-1 text-xs font-bold border ${
              filter === p.key
                ? "bg-brand-blue/15 border-brand-blue text-brand-blue"
                : "bg-card-bg border-border-base text-text-muted"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
        {loading && <p className="text-text-muted text-sm">Loading…</p>}
        {!loading && shown.length === 0 && (
          <p className="text-text-muted text-sm">No bets yet.</p>
        )}
        {shown.map((s) => (
          <div key={s.id} className="bg-card-bg border border-border-base rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`font-semibold ${statusColor[s.status]}`}>{s.status}</span>
              <span className="text-sm text-text-muted">
                {fmtCredits(s.stake)} cr · ×{s.combinedMultiplier.toFixed(2)}
              </span>
            </div>
            <div className="space-y-1">
              {s.legs.map((l, i) => (
                <div key={i} className="text-xs flex justify-between">
                  <span>
                    {l.player} {l.pick} {l.line}
                    {l.resultPoints !== null && (
                      <span className="text-text-muted"> (scored {l.resultPoints})</span>
                    )}
                  </span>
                  <span className={statusColor[l.result] ?? "text-text-muted"}>{l.result}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm">
              {s.status === "WON" ? (
                <span className="text-brand-blue">Won {fmtCredits(s.payout ?? 0)} cr</span>
              ) : s.status === "PENDING" ? (
                <span className="text-text-muted">Potential {fmtCredits(s.potentialPayout)} cr</span>
              ) : s.status === "VOID" ? (
                <span className="text-text-muted">Refunded {fmtCredits(s.payout ?? 0)} cr</span>
              ) : (
                <span className="text-brand-pink">Lost</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/MyEntriesSheet.dom.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/bets/MyEntriesSheet.tsx tests/components/MyEntriesSheet.dom.test.tsx
git commit -m "feat(bets): My Entries slide-over with status filters"
```

---

## Task 9: `BetsHeader` component

**Files:**
- Create: `src/components/bets/BetsHeader.tsx`
- Test: `tests/components/BetsHeader.dom.test.tsx`

**Interfaces:**
- Consumes: `BalancePill` from `@/components/shell/BalancePill`.
- Produces: `BetsHeader({ onOpenEntries }: { onOpenEntries: () => void })`. The "+" is a Next `<Link href="/wallet">`; the entries ticket is a button calling `onOpenEntries`; Help is decorative.

- [ ] **Step 1: Write the failing test**

Create `tests/components/BetsHeader.dom.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BetsHeader } from "@/components/bets/BetsHeader";

// BalancePill fetches /api/wallet on mount; stub it.
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: true,
    json: async () => ({ balance: 25500 }),
  })) as unknown as typeof fetch);
});
afterEach(() => vi.unstubAllGlobals());

describe("BetsHeader", () => {
  it("renders the brand and a wallet (+) link", () => {
    render(<BetsHeader onOpenEntries={() => {}} />);
    expect(screen.getByText("base")).toBeTruthy();
    const plus = screen.getByRole("link", { name: /add funds/i }) as HTMLAnchorElement;
    expect(plus.getAttribute("href")).toBe("/wallet");
  });

  it("opens entries from the ticket button", () => {
    const onOpenEntries = vi.fn();
    render(<BetsHeader onOpenEntries={onOpenEntries} />);
    fireEvent.click(screen.getByRole("button", { name: /my entries/i }));
    expect(onOpenEntries).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/BetsHeader.dom.test.tsx`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the component**

Create `src/components/bets/BetsHeader.tsx`:

```tsx
"use client";

import Link from "next/link";
import { HelpCircle, Plus, Ticket } from "lucide-react";
import { BalancePill } from "@/components/shell/BalancePill";

export function BetsHeader({ onOpenEntries }: { onOpenEntries: () => void }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-nav-bg backdrop-blur-xl border-b border-border-base sticky top-0 z-40">
      <Link href="/bets" className="font-extrabold text-lg">
        Fan<span className="text-brand-blue">base</span>
      </Link>
      <div className="flex items-center gap-2.5">
        <span className="flex flex-col items-center text-[9px] text-text-muted" aria-hidden>
          <HelpCircle size={18} />
          Help
        </span>
        <BalancePill />
        <Link
          href="/wallet"
          aria-label="Add funds"
          className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white"
        >
          <Plus size={18} />
        </Link>
        <button
          onClick={onOpenEntries}
          aria-label="My entries"
          className="w-8 h-8 rounded-full bg-card-bg border border-border-base flex items-center justify-center text-text-main"
        >
          <Ticket size={16} />
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/BetsHeader.dom.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/bets/BetsHeader.tsx tests/components/BetsHeader.dom.test.tsx
git commit -m "feat(bets): Draftea-style page header"
```

---

## Task 10: `BetsClient` island + `/bets` server page

**Files:**
- Create: `src/components/bets/BetsClient.tsx`
- Create: `src/app/(app)/bets/page.tsx`
- Test: `tests/components/BetsClient.dom.test.tsx`

**Interfaces:**
- Consumes: `MarketRow` (`@/lib/marketRows`), `FixtureChip` (`@/lib/betsView`), `apiGet`/`apiPost` (`@/lib/client`), and all Task 3–9 components; `Pick` from `PropCard`; `Leg` from `BetSlipBar`.
- Produces: `BetsClient({ gwName, fixtures, hasGameweek }: { gwName: string; fixtures: FixtureChip[]; hasGameweek: boolean })`.

- [ ] **Step 1: Write the failing integration test**

Create `tests/components/BetsClient.dom.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BetsClient } from "@/components/bets/BetsClient";
import type { MarketRow } from "@/lib/marketRows";

const markets: MarketRow[] = [
  { id: "m1", playerId: 9, player: "Salah", team: "LIV", code: 118748, teamId: 12,
    position: 3, line: 6.5, overMultiplier: 1.85, underMultiplier: 1.95,
    opponent: "MUN", isHome: false, fixtureId: 100 },
  { id: "m2", playerId: 1, player: "Haaland", team: "CITY", code: 223094, teamId: 14,
    position: 4, line: 7.5, overMultiplier: 1.80, underMultiplier: 2.00,
    opponent: "ARS", isHome: true, fixtureId: 101 },
];

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (String(url).includes("/api/markets")) {
      return { ok: true, json: async () => ({ gameweekId: 1, markets }) };
    }
    return { ok: true, json: async () => ({}) };
  }) as unknown as typeof fetch);
});
afterEach(() => vi.unstubAllGlobals());

const chips = [
  { id: 100, label: "MUN vs LIV", live: false },
  { id: 101, label: "CITY vs ARS", live: false },
];

describe("BetsClient", () => {
  it("loads markets and renders prop cards", async () => {
    render(<BetsClient gwName="GW1" fixtures={chips} hasGameweek={true} />);
    await waitFor(() => expect(screen.getByText("Salah")).toBeTruthy());
    expect(screen.getByText("Haaland")).toBeTruthy();
  });

  it("adds a pick to the bet slip", async () => {
    render(<BetsClient gwName="GW1" fixtures={chips} hasGameweek={true} />);
    await waitFor(() => expect(screen.getByText("Salah")).toBeTruthy());
    fireEvent.click(screen.getAllByRole("button", { name: /Over 6.5/ })[0]);
    expect(screen.getByText(/1 leg/)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/BetsClient.dom.test.tsx`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the client island**

Create `src/components/bets/BetsClient.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { MarketRow } from "@/lib/marketRows";
import type { FixtureChip } from "@/lib/betsView";
import { apiGet, apiPost, fmtCredits } from "@/lib/client";
import { BetsHeader } from "./BetsHeader";
import { FixtureChips } from "./FixtureChips";
import { BetTabs, type TabKey } from "./BetTabs";
import { PropCard, type Pick } from "./PropCard";
import { BetSlipBar, type Leg } from "./BetSlipBar";
import { MyEntriesSheet } from "./MyEntriesSheet";

const POPULAR_COUNT = 10;

export function BetsClient({
  gwName,
  fixtures,
  hasGameweek,
}: {
  gwName: string;
  fixtures: FixtureChip[];
  hasGameweek: boolean;
}) {
  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("popular");
  const [query, setQuery] = useState("");
  const [fixtureId, setFixtureId] = useState<number | null>(null);
  const [legs, setLegs] = useState<Leg[]>([]);
  const [stake, setStake] = useState(100);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [entriesOpen, setEntriesOpen] = useState(false);

  useEffect(() => {
    apiGet<{ markets: MarketRow[] }>("/api/markets")
      .then((d) => setMarkets(d.markets))
      .catch((e) => setMessage(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  // Filtering by fixture chip + search, regardless of tab.
  const base = useMemo(() => {
    let list = markets;
    if (fixtureId != null) list = list.filter((m) => m.fixtureId === fixtureId);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) => m.player.toLowerCase().includes(q) || m.team.toLowerCase().includes(q),
      );
    }
    return list;
  }, [markets, fixtureId, query]);

  const popular = useMemo(() => base.slice(0, POPULAR_COUNT), [base]);

  // Group for "By Match": fixtureId -> rows, with a label from the first row.
  const groups = useMemo(() => {
    const map = new Map<string, { label: string; rows: MarketRow[] }>();
    for (const m of base) {
      const key = m.fixtureId != null ? String(m.fixtureId) : "other";
      const label = m.opponent
        ? m.isHome
          ? `${m.team} vs ${m.opponent}`
          : `${m.opponent} vs ${m.team}`
        : "Other";
      if (!map.has(key)) map.set(key, { label, rows: [] });
      map.get(key)!.rows.push(m);
    }
    return [...map.values()];
  }, [base]);

  function pickOf(marketId: string): Pick | null {
    const leg = legs.find((l) => l.marketId === marketId);
    return leg ? leg.pick : null;
  }

  function onPick(m: MarketRow, pick: Pick) {
    setLegs((prev) => {
      const without = prev.filter((l) => l.marketId !== m.id);
      const existing = prev.find((l) => l.marketId === m.id);
      if (existing && existing.pick === pick) return without; // toggle off
      const multiplier = pick === "OVER" ? m.overMultiplier : m.underMultiplier;
      return [...without, { marketId: m.id, player: m.player, line: m.line, pick, multiplier }];
    });
  }

  function onRemove(marketId: string) {
    setLegs((prev) => prev.filter((l) => l.marketId !== marketId));
  }

  async function onPlace() {
    setBusy(true);
    setMessage(null);
    try {
      const combined = legs.reduce((m, l) => m * l.multiplier, 1);
      await apiPost("/api/bets", {
        stake,
        legs: legs.map((l) => ({ marketId: l.marketId, pick: l.pick })),
      });
      setMessage(`Bet placed! Potential ${fmtCredits(Math.floor(stake * combined))} cr.`);
      setLegs([]);
      window.dispatchEvent(new Event("focus")); // refresh balance pill
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-app-bg">
      <BetsHeader onOpenEntries={() => setEntriesOpen(true)} />
      <FixtureChips fixtures={fixtures} activeFixtureId={fixtureId} onSelect={setFixtureId} />
      <BetTabs active={tab} onChange={setTab} query={query} onQuery={setQuery} />

      <div className="px-4 pt-3 pb-28">
        {loading && <p className="text-text-muted text-sm">Loading markets…</p>}

        {!loading && !hasGameweek && (
          <div className="bg-card-bg border border-border-base rounded-xl p-4 text-sm text-text-muted">
            No active gameweek. Open a demo gameweek from the{" "}
            <Link href="/wallet" className="text-brand-blue">Wallet</Link> /{" "}
            <Link href="/lobby" className="text-brand-blue">demo controls</Link>.
          </div>
        )}

        {!loading && hasGameweek && base.length === 0 && (
          <p className="text-text-muted text-sm">No markets match your filters.</p>
        )}

        {!loading && tab !== "match" && (
          <>
            {tab === "popular" && (
              <div className="text-[11px] uppercase tracking-wide text-text-muted font-bold mb-2">
                🔥 Popular this gameweek
              </div>
            )}
            <div className="grid grid-cols-2 gap-2.5">
              {(tab === "popular" ? popular : base).map((m) => (
                <PropCard
                  key={m.id}
                  market={m}
                  gwName={gwName}
                  selected={pickOf(m.id)}
                  onPick={onPick}
                />
              ))}
            </div>
          </>
        )}

        {!loading && tab === "match" && (
          <div className="space-y-5">
            {groups.map((g) => (
              <div key={g.label}>
                <div className="text-[11px] uppercase tracking-wide text-text-muted font-bold mb-2">
                  {g.label}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {g.rows.map((m) => (
                    <PropCard
                      key={m.id}
                      market={m}
                      gwName={gwName}
                      selected={pickOf(m.id)}
                      onPick={onPick}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BetSlipBar
        legs={legs}
        stake={stake}
        busy={busy}
        message={message}
        onStake={setStake}
        onRemove={onRemove}
        onPlace={onPlace}
      />

      <MyEntriesSheet open={entriesOpen} onClose={() => setEntriesOpen(false)} />
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/BetsClient.dom.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Create the server page**

Create `src/app/(app)/bets/page.tsx`:

```tsx
import { prisma } from "@/lib/db";
import { getNextGameweek } from "@/lib/markets";
import { buildFixtureChips, type FixtureForChips } from "@/lib/betsView";
import { BetsClient } from "@/components/bets/BetsClient";

export const dynamic = "force-dynamic";

export default async function BetsPage() {
  const gw = await getNextGameweek();

  let chips: ReturnType<typeof buildFixtureChips> = [];
  if (gw) {
    const [fixtures, teams] = await Promise.all([
      prisma.fixture.findMany({ where: { gameweekId: gw.id } }),
      prisma.team.findMany(),
    ]);
    const teamShortById: Record<number, string> = {};
    for (const t of teams) teamShortById[t.id] = t.shortName;
    const forChips: FixtureForChips[] = fixtures.map((f) => ({
      id: f.id,
      teamHId: f.teamHId,
      teamAId: f.teamAId,
      started: f.started,
      finished: f.finished,
    }));
    chips = buildFixtureChips(forChips, teamShortById);
  }

  return <BetsClient gwName={gw?.name ?? "GW"} fixtures={chips} hasGameweek={!!gw} />;
}
```

- [ ] **Step 6: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/bets/BetsClient.tsx "src/app/(app)/bets/page.tsx" tests/components/BetsClient.dom.test.tsx
git commit -m "feat(bets): assemble BetsClient and /bets server page"
```

---

## Task 11: Routing, nav rename, and redirects

**Files:**
- Modify: `src/components/shell/BottomNav.tsx` (lines 7, 13, 22)
- Modify: `src/components/shell/AppShell.tsx` (line 9)
- Modify: `src/app/(app)/lobby/page.tsx`
- Modify: `src/app/(app)/props/page.tsx`
- Modify: `src/app/(app)/props/my-bets/page.tsx`
- Test: `tests/components/BottomNav.dom.test.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `/bets` is the canonical Bets route; `/lobby`, `/props`, `/props/my-bets` redirect to it; `/bets` renders without the global header.

Note on the `/lobby` demo controls: the off-season `DemoControls` block stays reachable at `/lobby`’s old behavior is replaced by a redirect, so move the demo affordance. For this task, keep `DemoControls` accessible by leaving a minimal `/lobby` page that renders **only** `DemoControls` is NOT what we want (it would defeat the redirect). Instead, the `BetsClient` empty-state already links to `/lobby`. To keep that link working as a demo surface, make `/lobby` redirect **only when a gameweek exists**; otherwise render the demo controls. This preserves off-season setup without a second hub.

- [ ] **Step 1: Write the failing BottomNav test**

Create `tests/components/BottomNav.dom.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BottomNav } from "@/components/shell/BottomNav";

beforeEach(() => {
  vi.mock("next/navigation", () => ({ usePathname: () => "/bets" }));
});

describe("BottomNav", () => {
  it("labels the first tab 'Bets' linking to /bets", () => {
    render(<BottomNav />);
    const link = screen.getByRole("link", { name: /Bets/ }) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/bets");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/BottomNav.dom.test.tsx`
Expected: FAIL — current label is "Betting" and href is `/lobby`.

- [ ] **Step 3: Update BottomNav**

In `src/components/shell/BottomNav.tsx`:

Change line 7 (the PROTO regex) to include `bets`:

```typescript
const PROTO = /^\/(bets|leagues|fantasy|explore|more)(\/|$)/;
```

Change line 13 to make Bets active on `/bets` (and the old `/lobby`):

```typescript
  const bettingActive = pathname.startsWith("/bets") || pathname.startsWith("/lobby");
```

Change line 22 (the first NavButton) to:

```tsx
        <NavButton href="/bets" icon={<Ticket size={24} />} label="Bets" isActive={bettingActive} />
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/BottomNav.dom.test.tsx`
Expected: PASS.

- [ ] **Step 5: Update AppShell so `/bets` has no global header**

In `src/components/shell/AppShell.tsx`, change line 9 (the PROTO regex) to include `bets`:

```typescript
const PROTO = /^\/(bets|leagues|fantasy|explore|more)(\/|$)/;
```

This makes `isProto` true for `/bets`, so the global header is skipped and `main` uses the `flex-1 pb-24` (no extra padding) branch — `BetsClient` brings its own header and padding.

- [ ] **Step 6: Redirect `/props` and `/props/my-bets` to `/bets`**

Replace `src/app/(app)/props/page.tsx` entirely:

```tsx
import { redirect } from "next/navigation";

export default function PropsRedirect() {
  redirect("/bets");
}
```

Replace `src/app/(app)/props/my-bets/page.tsx` entirely:

```tsx
import { redirect } from "next/navigation";

export default function MyBetsRedirect() {
  redirect("/bets");
}
```

- [ ] **Step 7: Make `/lobby` redirect when a gameweek exists, else show demo controls**

Replace `src/app/(app)/lobby/page.tsx` entirely:

```tsx
import { redirect } from "next/navigation";
import { getNextGameweek } from "@/lib/markets";
import { GlassCard } from "@/components/ui/GlassCard";
import { DemoControls } from "@/components/DemoControls";

export const dynamic = "force-dynamic";

export default async function LobbyPage() {
  const gw = await getNextGameweek();
  if (gw) redirect("/bets");

  // Off-season: no gameweek yet — surface the demo setup, then users land on /bets.
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">Demo setup</h1>
        <p className="text-text-muted text-sm">
          FPL is off-season. Open a finished gameweek as a betting demo, then head to Bets.
        </p>
      </div>
      <GlassCard>
        <DemoControls />
      </GlassCard>
    </div>
  );
}
```

- [ ] **Step 8: Verify typecheck and full suite**

Run: `npx tsc --noEmit && npx vitest run`
Expected: no type errors; all tests green (engine + lib + components).

- [ ] **Step 9: Commit**

```bash
git add src/components/shell/BottomNav.tsx src/components/shell/AppShell.tsx "src/app/(app)/lobby/page.tsx" "src/app/(app)/props/page.tsx" "src/app/(app)/props/my-bets/page.tsx" tests/components/BottomNav.dom.test.tsx
git commit -m "feat(bets): route /bets, rename nav, redirect old routes"
```

---

## Task 12: Manual verification on the running app

**Files:** none (manual QA against the dev server on port 5000).

- [ ] **Step 1: Ensure data exists**

If off-season / empty DB: visit `/lobby`, run the demo controls to open a gameweek, then run a sync so `Player.code` is backfilled (the demo/sync path calls `syncBootstrap`). Confirm via a quick check that markets exist:

Run: `npx tsx -e "import('./src/lib/db').then(async ({prisma})=>{console.log('markets', await prisma.propMarket.count()); console.log('withCode', await prisma.player.count({where:{code:{not:null}}}));})"`
Expected: non-zero `markets`; `withCode` > 0.

- [ ] **Step 2: Load `/bets`**

Open `http://localhost:5000/bets`. Verify: own header (logo · Help · balance · "+" · ticket), fixture chips with any LIVE markers, the three tabs, and a 2-column grid of cards with real headshots (initials where no photo). No global Fanbase header above it.

- [ ] **Step 3: Build and place a parlay**

Click Over/Under on two cards → slip bar appears with `×` combined and potential. Set a stake, click Place → success message, slip clears, balance pill updates.

- [ ] **Step 4: Tabs, filters, entries**

Switch to By Match (grouped by fixture) and All Players (full list); type in search to filter; tap a fixture chip to filter; open the ticket → My Entries shows the just-placed bet under All/Open. Confirm `/lobby` redirects to `/bets` when a gameweek exists, and `/props` redirects to `/bets`.

- [ ] **Step 5: Commit any fixups**

```bash
git add -A
git commit -m "chore(bets): manual QA fixups"
```

---

## Self-Review

**Spec coverage:**
- §3 naming/routing → Task 11 (label "Bets", `/bets`, redirects, no global header). ✓
- §4 page structure (header, chips, tabs, feed, slip, nav) → Tasks 5–10. ✓
- §5 card style-C + headshot fallback → Tasks 3, 4. ✓
- §6 bet slip (existing engine, focus refresh) → Tasks 7, 10. ✓
- §7 My Entries with status filters (MVP All/Open/Settled, three-way as follow-up) → Task 8. ✓
- §8 data changes (`Player.code`, enriched `/api/markets`) → Tasks 1, 2. ✓
- §9 component inventory → Tasks 3–11 (one file each). ✓
- §10 data flow → Task 10 wiring. ✓
- §11 error/empty states (no GW, headshot 404, blank-GW opponent null, placement error, empty entries) → Tasks 3, 4 (fallback), 8 (empty), 10 (no-GW + filter-empty + place error). ✓
- §12 testing → each task ships its tests; Task 11 runs the full suite. ✓

**Placeholder scan:** No TBD/TODO; every code step shows full code; the one spec ambiguity (3-way entries split) is resolved to a concrete MVP (All/Open/Settled) with the richer split named as follow-up.

**Type consistency:** `MarketRow` defined in Task 2 is imported unchanged by Tasks 4 and 10. `Pick = "OVER" | "UNDER"` (Task 4) matches `Leg.pick` (Task 7) and the `/api/bets` payload `pick`. `FixtureChip` (Task 5) is consumed by Task 10/page. `Leg` (Task 7) is the single source used by `BetSlipBar` and `BetsClient`. `playerUpsertFields` return includes `code` (Task 1) matching `Player.code` schema and `RawMarket.code` (Task 2).

---

## Setup / Verification

1. (Optional) `git init` if you want commit steps to land.
2. `npx prisma db push` (applies `Player.code`).
3. `npm test` → all Vitest suites green (engine, lib, components).
4. `npm run dev` → app on `http://localhost:5000`; follow Task 12 for manual QA.
