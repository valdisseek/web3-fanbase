import { redirect } from "next/navigation";
import { getNextGameweek } from "@/lib/markets";
import { GlassCard } from "@/components/ui/GlassCard";
import { DemoControls } from "@/components/DemoControls";

export const dynamic = "force-dynamic";

export default async function LobbyPage() {
  const gw = await getNextGameweek();
  if (gw) redirect("/bets");

  // Off-season: no gameweek yet — surface the demo setup, then users land on /bets.
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">Demo setup</h1>
        <p className="text-text-muted text-sm">
          FPL is off-season. Open a finished gameweek as a betting demo, then head to Bets.
        </p>
      </div>
      <GlassCard>
        <DemoControls />
      </GlassCard>
    </div>
  );
}
