import { syncAll } from "@/lib/fpl/sync";
import { ensureDemoGameweek } from "@/lib/dev";

async function main() {
  console.log("Syncing FPL data...");
  console.log("Synced:", await syncAll());
  console.log("Setting up demo gameweek...");
  console.log("Demo:", await ensureDemoGameweek());
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
