import { NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { syncAll } from "@/lib/fpl/sync";
import { ensureDemoGameweek } from "@/lib/dev";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

// DEV ONLY: sync FPL data and open a demo gameweek (markets + pools).
async function run(req: NextRequest) {
  if (process.env.NODE_ENV === "production" && !isAuthorizedCron(req)) {
    return fail("Unauthorized", 401);
  }
  const synced = await syncAll();
  const demo = await ensureDemoGameweek();
  return ok({ synced, demo });
}

export const GET = run;
export const POST = run;
