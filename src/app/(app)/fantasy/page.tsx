"use client";

import { useState } from "react";
import { FantasyView } from "@/components/prototype/components/FantasyView";
import { FDRView } from "@/components/prototype/components/FDRView";
import { ContestDetailsView } from "@/components/prototype/components/ContestDetailsView";
import { LeagueDetailsView } from "@/components/prototype/components/LeagueDetailsView";
import type { Contest, LeagueSummary } from "@/components/prototype/types";

export default function FantasyPage() {
  const [contest, setContest] = useState<Contest | null>(null);
  const [league, setLeague] = useState<LeagueSummary | null>(null);
  const [showFDR, setShowFDR] = useState(false);

  if (contest) return <ContestDetailsView contest={contest} onBack={() => setContest(null)} />;
  if (league) return <LeagueDetailsView league={league} onBack={() => setLeague(null)} />;
  if (showFDR) return <FDRView onBack={() => setShowFDR(false)} />;

  return (
    <FantasyView
      onFDRClick={() => setShowFDR(true)}
      onEnterContest={setContest}
      onOpenLeague={setLeague}
    />
  );
}
