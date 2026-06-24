import { syncAll } from "@/lib/fpl/sync";
import { generateMarketsForNextGw, getNextGameweek } from "@/lib/markets";

async function main() {
  console.log("Syncing FPL data...");
  const synced = await syncAll();
  console.log("Synced:", synced);
  const gw = await getNextGameweek();
  console.log("Next gameweek:", gw?.id, gw?.name, gw?.deadlineTime);
  const markets = await generateMarketsForNextGw();
  console.log("Markets:", markets);
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
