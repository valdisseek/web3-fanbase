"use client";

import { useState } from "react";
import { LeaguesView } from "@/components/prototype/components/LeaguesView";
import { ContestDetailsView } from "@/components/prototype/components/ContestDetailsView";
import { LeagueDetailsView } from "@/components/prototype/components/LeagueDetailsView";
import type { Contest, LeagueSummary } from "@/components/prototype/types";

export default function LeaguesPage() {
  const [contest, setContest] = useState<Contest | null>(null);
  const [league, setLeague] = useState<LeagueSummary | null>(null);

  if (contest) return <ContestDetailsView contest={contest} onBack={() => setContest(null)} />;
  if (league) return <LeagueDetailsView league={league} onBack={() => setLeague(null)} />;

  return <LeaguesView onEnterContest={setContest} onOpenLeague={setLeague} />;
}
