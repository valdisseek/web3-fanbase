import { getNextGameweek } from "@/lib/markets";
import { ok } from "@/lib/api";

export async function GET() {
  const gw = await getNextGameweek();
  return ok({
    gameweek: gw
      ? { id: gw.id, name: gw.name, deadline: gw.deadlineTime, status: gw.status }
      : null,
  });
}
