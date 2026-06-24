import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedCron } from "@/lib/cron";
import { syncAll } from "@/lib/fpl/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function run(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await syncAll();
    return NextResponse.json({ ok: true, synced: result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}

export const GET = run;
export const POST = run;
