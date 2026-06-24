# Bets Tab — Draftea-Style Redesign (Design Spec)

**Date:** 2026-06-24
**Status:** Approved (design phase)
**Scope:** Visual reskin of the existing player-props betting flow into a Draftea-style UI. No new bet types. The existing money/pricing/settlement engine is untouched.

---

## 1. Goal

Replace the placeholder `/lobby` "Betting" hub with a polished, Draftea-inspired **Bets** page that browses the player-points over/under markets the backend already produces. Same engine, same bet type (player gameweek-points OVER/UNDER + parlay slip) — new presentation only, plus a small data addition (player photo code) so cards can show real FPL headshots.

The reference is the Draftea/DRAFTEA sportsbook app: a fixture-filter row, content tabs, photo-forward prop cards with multiplier buttons, and a persistent bet slip. We adapt that to single-sport FPL where the only market is player points.

## 2. Out of Scope (explicitly)

- **No team markets** (moneyline / spread / totals). The engine models only player-points props; we do not fake or build these.
- **No engine changes** — `lib/engine/*`, pricing, parlay math, settlement, and the ledger are unchanged.
- **No new bet endpoints** — placement still posts to the existing `POST /api/bets`; entries still read `GET /api/bets`.
- **No help system** and **no deposit flow** — the Help and "+" controls are presentational (the "+" links to the existing `/wallet`).

## 3. Naming & Routing Changes

| Before | After |
| --- | --- |
| Nav label "Betting" | **"Bets"** |
| Route `/lobby` (Bets hub) | **`/bets`** |
| `/props` + `/props/my-bets` | Folded into `/bets` (browse) and a **My Entries** slide-over |

- `/bets` is rendered **without the global AppShell header** (like the prototype routes), so it can render its own Draftea-style header. The `AppShell` and `BottomNav` `PROTO` regexes are extended to treat `/bets` as a no-global-header / own-frame route.
- `/lobby` becomes a redirect to `/bets` (keep old links/bookmarks working). The `DemoControls` block moves onto `/bets` (or a small "More" affordance there) since it is still needed to open a demo gameweek off-season.
- The bottom-nav "Bets" tab points to `/bets` and is active for `/bets`, `/lobby` (redirect), and any betting sub-path.

## 4. Page Structure (`/bets`)

Top to bottom, all within the existing `max-w-md` mobile column:

1. **Header (page-specific):** `Fan`**`base`** logo · Help icon (decorative) · balance pill (live, reuses `BalancePill` data) · "+" button (→ `/wallet`) · ticket icon (→ opens My Entries slide-over).
2. **Fixture chips row:** horizontal-scroll chips, one per fixture in the active gameweek, plus a leading **"All"** chip. A chip shows the two team short names (e.g. `MUN vs LIV`) and a **LIVE** indicator when the fixture is in progress. Selecting a chip filters the card feed to that fixture; "All" clears the filter.
3. **Tabs + search:** `Popular` · `By Match` · `All Players`, with a search icon that reveals a text filter (matches player name / team).
4. **Card feed:** 2-column grid of prop cards (see §5). Content depends on the active tab:
   - **Popular** — top ~10 markets by the existing ordering (projected line desc, already how `/api/markets` sorts), shown as a "🔥 Popular this gameweek" section.
   - **By Match** — markets grouped under each fixture, with a fixture sub-header (`MUN vs LIV · GW1`). Honors the selected fixture chip.
   - **All Players** — the full market list (already capped at 200 server-side), searchable.
5. **Bet-slip bar:** floats above the bottom nav whenever ≥1 leg is selected (see §6).
6. **Bottom nav:** unchanged structurally; only the label change from §3.

## 5. Prop Card (style "C")

Photo-top card with a segmented Over/Under toggle. Per card:

- **Match line** (top): a small stats glyph (left) and `HOME vs AWAY · GW{n}` (right), in muted text.
- **Headshot:** real FPL photo `https://resources.premierleague.com/premierleague/photos/players/250x250/p{code}.png`, `object-fit: contain`, bottom-aligned. **Fallback:** if `code` is null or the image errors, render a circular monogram from the player's initials (the existing prototype fallback pattern) on a card-tinted background.
- **Name + line:** player `webName`, then `Line {line} pts`.
- **Segmented control:** two halves — `Over {line}` with `overMultiplier`, `Under {line}` with `underMultiplier`. The selected half is filled sky-blue (`--color-brand-blue`, `#2f93ef`). Clicking toggles that leg in the slip; clicking the active half again removes it (existing `/props` toggle semantics).

Palette: card `--bg-card` (`#1c1c1f`), canvas `--bg-app` (`#0a0a0b`), accent `#2f93ef`, muted `#8e8e93`, borders `rgba(255,255,255,.08)` — all already defined in `globals.css`.

## 6. Bet Slip

- Reuses the existing slip state model from `/props`: a list of legs `{ marketId, player, line, pick, multiplier }`, combined multiplier = `Π multiplier`, potential payout = `floor(stake × combined)`.
- Floating bar above the bottom nav: shows `Bet slip · N legs`, the combined multiplier, a stake input, and a **Place** button (`Place · stake X → win Y cr`).
- Placement posts to existing `POST /api/bets` with `{ stake, legs: [{ marketId, pick }] }`. On success: clear slip, refresh balance (dispatch the existing `focus` event the `BalancePill` listens for).
- An expanded state lists each leg (`player pick line · ×mult`) with a remove control. This is a restyle of the current `/props` slip — no API change.

## 7. My Entries Slide-Over

- Opened from the header ticket icon. Reads existing `GET /api/bets` (returns slips with legs, status, payout).
- Filter pills: **Live** (PENDING legs in an in-progress GW) · **Upcoming** (PENDING in an open GW) · **Past** (WON/LOST/VOID). MVP mapping: `PENDING → Upcoming/Live` by the gameweek status the slip's markets belong to; settled statuses → Past. If gameweek-status-per-slip is not readily available client-side, MVP collapses to **Open** (PENDING) vs **Settled**, and the three-way split is a follow-up.
- Each entry card: status chip, stake · combined multiplier, per-leg rows (`player pick line`, scored points when settled, leg result), and the payout/potential line. This is the existing `/props/my-bets` content, restyled and relocated.

## 8. Data / Backend Changes (minimal)

These are the only backend touches; all are additive and idempotent.

### 8.1 `Player.code`
- Add `code Int?` to the `Player` model in `prisma/schema.prisma`. Migrate.
- FPL `bootstrap-static` `elements[]` already carries `code` (the photo number). Add `code: p.code` to the upsert field set in `syncBootstrap` (`src/lib/fpl/sync.ts`) and to the `FplElement` type. Re-running sync backfills it.

### 8.2 `/api/markets` — richer market rows
Extend the response mapping in `src/app/api/markets/route.ts` so each market carries what the card needs:
- `code` — `m.player.code` (for the headshot URL; may be null → fallback).
- `teamId` — `m.player.teamId`.
- `opponent` / `isHome` / `fixtureId` — derived from the gameweek's `Fixture` rows: find the fixture where `teamHId === teamId || teamAId === teamId`; expose the opposing team's `shortName`, whether the player's team is home, and the fixture id (used for the chips filter and "By Match" grouping). Players with no fixture in the GW (blank GW) get `opponent: null` and are grouped under an "Other" bucket.

Already present and reused as-is: `id`, `player` (webName), `team` (shortName), `position`, `line`, `overMultiplier`, `underMultiplier`.

No change to `getNextGameweek`, pricing, or market generation.

## 9. Components (new / changed)

```
src/
  app/(app)/
    bets/page.tsx                 # new: server wrapper — loads gw + fixtures, renders BetsClient
    lobby/page.tsx                # change: redirect → /bets
    props/…                        # removed (folded into /bets); routes redirect to /bets
  components/
    bets/
      BetsHeader.tsx              # logo · help · balance · "+" · entries ticket
      FixtureChips.tsx           # horizontal fixture filter w/ LIVE state
      BetTabs.tsx                # Popular / By Match / All Players + search
      PropCard.tsx               # style-C card w/ headshot + segmented O/U
      PlayerHeadshot.tsx         # FPL photo w/ initials fallback
      BetSlipBar.tsx             # floating slip (restyle of /props slip)
      MyEntriesSheet.tsx         # slide-over (restyle of /props/my-bets)
      BetsClient.tsx             # client island: tab/chip/search state, slip state, wiring
  shell/
    AppShell.tsx                 # change: extend PROTO/own-header regex to include /bets
    BottomNav.tsx                # change: "Betting" → "Bets", href /lobby → /bets, active logic
```

Each component is presentational with typed props; `BetsClient` owns interaction state and API calls (`/api/markets`, `/api/bets`). Files stay focused and individually testable.

## 10. Data Flow

1. `bets/page.tsx` (server) loads the active gameweek + its fixtures, passes them to `BetsClient`.
2. `BetsClient` fetches `/api/markets` (enriched per §8.2), holds slip + filter + tab state.
3. Card clicks mutate slip state; `BetSlipBar` POSTs to `/api/bets`; success clears slip and refreshes the balance pill.
4. The entries ticket opens `MyEntriesSheet`, which fetches `/api/bets`.

## 11. Error / Empty States

- **No active gameweek / no markets:** feed shows an empty card pointing to demo setup (the `DemoControls` affordance moved onto `/bets`).
- **Headshot 404 / null code:** initials monogram fallback (never a broken image).
- **No fixture for a player (blank GW):** card omits the `vs` opponent; grouped under "Other" in By Match.
- **Placement failure (locked GW, insufficient funds):** the existing API error message is surfaced inline on the slip bar (unchanged behavior).
- **Entries fetch empty:** "No bets yet."

## 12. Testing

- **Component:** `PropCard` renders headshot vs initials fallback; segmented toggle reflects selected leg; `FixtureChips` LIVE state; `BetTabs` switches content.
- **Headshot:** `PlayerHeadshot` falls back to initials on null `code` and on image error.
- **Data mapping:** `/api/markets` returns `code`, `opponent`, `isHome`, `fixtureId`; player with no fixture → `opponent: null`.
- **Slip integration (reuse existing):** build slip → combined multiplier = product → place posts correct `{stake, legs}` → balance refresh fires. These mirror the current `/props` behavior and must stay green.
- **Sync:** `syncBootstrap` persists `code`; re-run is idempotent (no dupes, code stable).
- **Routing:** `/lobby` and `/props*` redirect to `/bets`; `/bets` renders without the global header; bottom-nav "Bets" active on `/bets`.

## 13. Success Criteria

- `/bets` renders the Draftea-style layout (own header, fixture chips, three tabs, 2-col card-C grid, floating slip) in the near-black + sky-blue palette.
- A user can filter by fixture, switch tabs, search players, build a parlay across cards, place it against the real engine, see the balance update, and review entries — all on real synced data.
- Real FPL headshots show where a `code` exists; initials fallback everywhere else; no broken images.
- No engine, pricing, or settlement behavior changed; existing bet/settlement tests stay green.
