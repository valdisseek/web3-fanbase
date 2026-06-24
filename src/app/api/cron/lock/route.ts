import { NextRequest } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { lockExpired } from "@/lib/engine/lock";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

async function run(req: NextRequest) {
  if (!isAuthorizedCron(req)) return fail("Unauthorized", 401);
  const result = await lockExpired();
  return ok({ locked: result });
}

export const GET = run;
export const POST = run;
