import { prisma } from "@/lib/db";
import { placeSlip } from "@/lib/actions/bets";
import { joinPool } from "@/lib/actions/pools";
import { createChallenge, acceptChallenge } from "@/lib/actions/h2h";
import { finalizeDemoGameweek } from "@/lib/dev";
import { settleGameweek } from "@/lib/engine/settle";
import { getNextGameweek } from "@/lib/markets";
import { H2HMetric, LegPick } from "@/lib/constants";

async function totalCredits(): Promise<bigint> {
  const accts = await prisma.creditAccount.findMany();
  return accts.reduce((s, a) => s + a.balance, 0n);
}

async function assertLedgerInvariant() {
  const accts = await prisma.creditAccount.findMany({ include: { entries: true } });
  for (const a of accts) {
    const sum = a.entries.reduce((s, e) => s + e.amount, 0n);
    if (sum !== a.balance) {
      throw new Error(`Ledger invariant FAILED for ${a.id}: balance ${a.balance} != ledger ${sum}`);
    }
  }
  console.log("✓ balance === sum(ledger) for all", accts.length, "accounts");
}

async function bal(userId: string) {
  const a = await prisma.creditAccount.findUnique({ where: { userId } });
  return a?.balance ?? 0n;
}

async function main() {
  const alice = await prisma.user.findUniqueOrThrow({ where: { email: "alice@example.com" } });
  const bob = await prisma.user.findUniqueOrThrow({ where: { email: "bob@example.com" } });
  const gw = await getNextGameweek();
  if (!gw) throw new Error("No demo gameweek — run demo-setup first");

  const markets = await prisma.propMarket.findMany({
    where: { gameweekId: gw.id, status: "OPEN" },
    take: 3,
  });
  const players = await prisma.player.findMany({ orderBy: { totalPoints: "desc" }, take: 6 });
  const pool = await prisma.pool.findFirstOrThrow({
    where: { gameweekId: gw.id, name: "100cr Double-Up" },
  });

  const total0 = await totalCredits();
  const aliceStart = await bal(alice.id);
  const bobStart = await bal(bob.id);
  console.log("Start — total:", total0.toString(), "alice:", aliceStart.toString(), "bob:", bobStart.toString());

  // Alice: 2-leg parlay
  await placeSlip(alice.id, [
    { marketId: markets[0].id, pick: LegPick.OVER },
    { marketId: markets[1].id, pick: LegPick.UNDER },
  ], 100n);
  // Bob: single-leg
  await placeSlip(bob.id, [{ marketId: markets[0].id, pick: LegPick.UNDER }], 200n);

  // Both join the double-up pool
  await joinPool(alice.id, pool.id, [players[0].id, players[1].id, players[2].id]);
  await joinPool(bob.id, pool.id, [players[3].id, players[4].id, players[5].id]);

  // H2H single-player: alice vs bob
  const ch = await createChallenge(alice.id, {
    gameweekId: gw.id,
    metric: H2HMetric.SINGLE_PLAYER,
    lineup: [players[0].id],
    stake: 300n,
  });
  await acceptChallenge(bob.id, ch.id, [players[5].id]);

  const totalMid = await totalCredits();
  console.log("After placement — total:", totalMid.toString(), "(should equal start)");
  if (totalMid !== total0) throw new Error("Credit conservation FAILED after placement");

  // Finalize + settle (uses real GW points)
  const result = await finalizeDemoGameweek(gw.id);
  console.log("Settled:", JSON.stringify(result.settled));

  const totalAfter = await totalCredits();
  if (totalAfter !== total0) throw new Error(`Credit conservation FAILED after settle: ${totalAfter} != ${total0}`);
  console.log("✓ total credits conserved through settlement:", totalAfter.toString());

  // Idempotency: settle again -> no change
  await settleGameweek(gw.id);
  const totalAfter2 = await totalCredits();
  if (totalAfter2 !== totalAfter) throw new Error("Settlement NOT idempotent");
  console.log("✓ settlement is idempotent (re-run changed nothing)");

  await assertLedgerInvariant();

  const house = await prisma.creditAccount.findUniqueOrThrow({ where: { id: "house" } });
  console.log("\nFinal balances:");
  console.log("  alice:", (await bal(alice.id)).toString(), `(Δ ${(await bal(alice.id)) - aliceStart})`);
  console.log("  bob:  ", (await bal(bob.id)).toString(), `(Δ ${(await bal(bob.id)) - bobStart})`);
  console.log("  HOUSE:", house.balance.toString(), "(rake captured)");
  console.log("\n✅ E2E PASSED");
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error("❌ E2E FAILED:", e);
    process.exit(1);
  },
);
