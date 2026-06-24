import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { isAuthorizedCron } from "@/lib/cron";
import { settleGameweek } from "@/lib/engine/settle";
import { GameweekStatus } from "@/lib/constants";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function run(req: NextRequest) {
  if (!isAuthorizedCron(req)) return fail("Unauthorized", 401);
  const gwParam = req.nextUrl.searchParams.get("gw");

  const gameweeks = gwParam
    ? [Number(gwParam)]
    : (
        await prisma.gameweek.findMany({
          where: { status: GameweekStatus.FINALIZED, dataChecked: true },
          select: { id: true },
        })
      ).map((g) => g.id);

  const results: Record<number, unknown> = {};
  for (const id of gameweeks) results[id] = await settleGameweek(id);
  return ok({ settled: results });
}

export const GET = run;
export const POST = run;
