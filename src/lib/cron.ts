import { NextRequest } from "next/server";

/** Returns true if the request carries the configured cron secret
 *  (header `x-cron-secret` or `?secret=` query param). */
export function isAuthorizedCron(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const header = req.headers.get("x-cron-secret");
  const query = req.nextUrl.searchParams.get("secret");
  return header === expected || query === expected;
}
