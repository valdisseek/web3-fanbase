"use client";

import React, { useState } from 'react';
import { StatsHeader } from './StatsHeader';
import { ContestSection } from './ContestSection';
import { LeagueList } from './LeagueList';
import { NewsTips } from './NewsTips';
import { ChevronRight, Podcast, Twitter, Facebook } from 'lucide-react';
import { PickTeamView } from './PickTeamView';
import { FixturesView } from './FixturesView';
import { PlayerStatisticsView } from './PlayerStatisticsView';
import { Contest, LeagueSummary } from '../types';

interface FantasyViewProps {
  onFDRClick?: () => void;
  onEnterContest?: (contest: Contest) => void;
  onOpenLeague?: (league: LeagueSummary) => void;
}

const MenuLink: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between py-4 border-b border-border-base cursor-pointer group hover:bg-glass px-2 -mx-2 rounded transition-colors"
  >
    <span className="text-text-main font-bold text-sm">{label}</span>
    <ChevronRight size={16} className="text-text-muted group-hover:text-text-main transition-colors" />
  </div>
);

const FooterLink: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center justify-between py-4 border-b border-border-base cursor-pointer hover:text-pink-400 transition-colors">
     <span className="text-text-main font-bold text-sm">{label}</span>
     <ChevronRight size={16} className="text-text-muted" />
  </div>
);

export const FantasyView: React.FC<FantasyViewProps> = ({ onFDRClick, onEnterContest, onOpenLeague }) => {
  const [showPickTeam, setShowPickTeam] = useState(false);
  const [pickTeamTab, setPickTeamTab] = useState<'Points' | 'Pick Team' | 'Transfers'>('Pick Team');
  const [showFixtures, setShowFixtures] = useState(false);
  const [showPlayerStats, setShowPlayerStats] = useState(false);

  if (showPickTeam) {
    return <PickTeamView onBack={() => setShowPickTeam(false)} initialTab={pickTeamTab} />;
  }

  if (showFixtures) {
    return <FixturesView onBack={() => setShowFixtures(false)} />;
  }

  if (showPlayerStats) {
    return <PlayerStatisticsView onBack={() => setShowPlayerStats(false)} />;
  }

  return (
    <div className="px-4 pt-4 pb-32 space-y-8 font-sans animate-fade-in">
      
      {/* 1. Header Stats Card */}
      <StatsHeader 
        onTeamClick={() => { setPickTeamTab('Pick Team'); setShowPickTeam(true); }}
        onPointsClick={() => { setPickTeamTab('Points'); setShowPickTeam(true); }}
      />

      {/* 2. Menu List */}
      <div className="space-y-1 mb-8">
         <MenuLink label="Fixtures" onClick={() => setShowFixtures(true)} />
         <MenuLink label="Fixture Difficulty Rating" onClick={onFDRClick} />
         <MenuLink label="Player Statistics" onClick={() => setShowPlayerStats(true)} />
         <MenuLink label="Set Piece Taker" />
      </div>

      {/* 3. Featured Contests */}
      <ContestSection onEnterContest={onEnterContest} />

      {/* 4. Leagues & Cups */}
      <LeagueList onOpenLeague={onOpenLeague} />

      {/* 5. News */}
      <NewsTips />

      {/* 6. More about FPL */}
      <div>
        <h2 className="text-text-main font-bold text-lg mb-2 px-1">More about FPL</h2>
        <FooterLink label="FPL Prizes" />
        <FooterLink label="Help & Rules" />
      </div>

      {/* 7. Follow FPL */}
      <div className="pt-4">
        <h2 className="text-text-main font-bold text-lg mb-4 px-1">Follow FPL</h2>
        <div className="flex gap-4">
           <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                 <Podcast className="text-white" size={24} />
              </div>
              <span className="text-xs font-medium text-text-main">FPL Podcast</span>
           </div>
           <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-lime-400 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                 <Twitter className="text-black fill-black" size={24} />
              </div>
              <span className="text-xs font-medium text-text-main">@OfficialFPL</span>
           </div>
           <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                 <Facebook className="text-white fill-white" size={24} />
              </div>
              <span className="text-xs font-medium text-text-main">@OfficialFPL</span>
           </div>
        </div>
      </div>

    </div>
  );
};
