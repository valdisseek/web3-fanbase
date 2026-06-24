"use client";

import { useState } from "react";
import { ExploreView } from "@/components/prototype/components/ExploreView";
import { TrophyCabinetView } from "@/components/prototype/components/TrophyCabinetView";
import { CommunityDetailView } from "@/components/prototype/components/CommunityDetailView";
import type { Community } from "@/components/prototype/types";

export default function ExplorePage() {
  const [showCabinet, setShowCabinet] = useState(false);
  const [community, setCommunity] = useState<Community | null>(null);

  if (showCabinet) return <TrophyCabinetView onBack={() => setShowCabinet(false)} />;
  if (community) return <CommunityDetailView community={community} onBack={() => setCommunity(null)} />;

  return <ExploreView onOpenCabinet={() => setShowCabinet(true)} onOpenCommunity={setCommunity} />;
}
