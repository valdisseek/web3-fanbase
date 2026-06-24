import { NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { getNextGameweek } from "@/lib/markets";
import { finalizeDemoGameweek } from "@/lib/dev";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// DEV ONLY: force-finalize the demo gameweek and settle everything.
async function run(req: NextRequest) {
  if (process.env.NODE_ENV === "production" && !isAuthorizedCron(req)) {
    return fail("Unauthorized", 401);
  }
  const gwParam = req.nextUrl.searchParams.get("gw");
  let gameweekId = gwParam ? Number(gwParam) : null;
  if (!gameweekId) {
    const gw = await getNextGameweek();
    gameweekId = gw?.id ?? null;
  }
  if (!gameweekId) return fail("No demo gameweek to finalize");
  const result = await finalizeDemoGameweek(gameweekId);
  return ok({ gameweekId, ...result });
}

export const GET = run;
export const POST = run;
