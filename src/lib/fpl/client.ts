import type { FplBootstrap, FplFixture, FplLive } from "./types";

const BASE = "https://fantasy.premierleague.com/api";
// FPL 403s the default Node UA; send a browser-like UA.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function getJson<T>(path: string, attempt = 0): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`FPL ${path} -> ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      return getJson<T>(path, attempt + 1);
    }
    throw err;
  }
}

export const fplClient = {
  bootstrap: () => getJson<FplBootstrap>("/bootstrap-static/"),
  fixtures: (eventId?: number) =>
    getJson<FplFixture[]>(eventId ? `/fixtures/?event=${eventId}` : "/fixtures/"),
  eventLive: (eventId: number) => getJson<FplLive>(`/event/${eventId}/live/`),
};
