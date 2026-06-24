"use client";

import React from 'react';
import { ArrowLeft, Trophy, Shield, Award, Zap, Target, Medal, Crown, Share2 } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface TrophyCabinetViewProps {
  onBack: () => void;
}

const mainTrophies = [
  {
    id: 1,
    title: "Premier League Winner",
    subtitle: "2023/24 • 1st Place",
    icon: <Trophy size={48} className="text-yellow-400 drop-shadow-sm" />,
    color: "bg-yellow-500", 
  },
  {
    id: 2,
    title: "Cup Finalist",
    subtitle: "2023/24 • Runner up",
    icon: <Trophy size={42} className="text-gray-300 drop-shadow-sm" />,
    color: "bg-gray-400",
  },
  {
    id: 3,
    title: "Monthly Winner",
    subtitle: "Oct 2024 • Top 1%",
    icon: <Shield size={42} className="text-orange-400 drop-shadow-sm" />,
    color: "bg-orange-500",
  }
];

const badges = [
  { id: 1, name: "Golden Boot", icon: <Target size={24} />, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { id: 2, name: "Best Manager", icon: <Crown size={24} />, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { id: 3, name: "Clean Sheet King", icon: <Shield size={24} />, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: 4, name: "Derby Winner", icon: <Medal size={24} />, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  { id: 5, name: "Rival Conqueror", icon: <Award size={24} />, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
  { id: 6, name: "Active Trader", icon: <Zap size={24} />, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { id: 7, name: "Early Riser", icon: <Zap size={24} />, color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/20" },
  { id: 8, name: "Loyal Fan", icon: <Shield size={24} />, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
];

export const TrophyCabinetView: React.FC<TrophyCabinetViewProps> = ({ onBack }) => {
  // Helper to chunk badges for shelves (3 per shelf)
  const badgeRows = [];
  for (let i = 0; i < badges.length; i += 3) {
    badgeRows.push(badges.slice(i, i + 3));
  }

  return (
    <div className="min-h-screen bg-app-bg pb-24 font-sans text-text-main relative overflow-hidden animate-fade-in">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-brand-purple/10 to-transparent pointer-events-none"></div>

      {/* Header Bar */}
      <div className="pt-6 px-4 pb-4 flex items-center justify-between sticky top-0 z-30 bg-app-bg/95 backdrop-blur-xl border-b border-border-base">
        <button onClick={onBack} className="p-2 rounded-full border border-border-base bg-glass hover:bg-white/10 text-text-main transition-colors">
           <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-text-main">Trophy Cabinet</h1>
        <button className="p-2 rounded-full border border-border-base bg-glass hover:bg-white/10 text-text-main transition-colors">
           <Share2 size={20} />
        </button>
      </div>

      <div className="px-4 py-6 space-y-8">
        
        {/* Manager Profile Card */}
        <GlassCard className="flex items-center gap-4 bg-gradient-to-br from-card-bg to-input-bg border-border-base shadow-sm">
           <div className="relative">
              <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-brand-purple to-brand-pink shadow-md">
                 <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80" className="w-full h-full rounded-full object-cover border-2 border-app-bg" alt="Manager" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-brand-teal text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-app-bg shadow-sm">
                 Lvl 12
              </div>
           </div>
           <div className="flex-1">
              <h2 className="text-lg font-bold text-text-main">Manager Name</h2>
              <p className="text-xs text-brand-purple font-medium mb-3">Tactical Tinkerer</p>
              
              {/* XP Bar */}
              <div className="flex items-center gap-2 text-[10px] text-text-muted mb-1.5">
                 <span className="font-medium">XP Progress</span>
                 <span className="text-text-main font-bold ml-auto">2450 / 3000</span>
              </div>
              <div className="h-1.5 w-full bg-input-bg rounded-full overflow-hidden border border-black/5">
                 <div className="h-full bg-gradient-to-r from-brand-purple to-brand-pink w-[82%] shadow-[0_0_10px_rgba(236,72,153,0.3)]"></div>
              </div>
           </div>
        </GlassCard>

        {/* Section: Major Trophies (Shelf 1) */}
        <div className="space-y-2">
           <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider px-1">Season Honours</h3>
           
           <div className="relative pt-12 pb-0 mb-6">
              {/* Shelf Graphic */}
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-b from-white/10 to-transparent border-t border-white/20 rounded-sm transform perspective-[100px] rotate-x-12"></div>
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-white/30 shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>

              <div className="flex justify-around items-end relative z-10 pb-1">
                 {mainTrophies.map((trophy) => (
                    <div key={trophy.id} className="flex flex-col items-center text-center group w-1/3 cursor-pointer">
                       {/* Trophy Icon with Hover Float */}
                       <div className={`mb-3 transition-transform duration-300 group-hover:-translate-y-2 relative filter drop-shadow-lg`}>
                          {/* Glow */}
                          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 ${trophy.color}/20 blur-xl rounded-full`}></div>
                          {trophy.icon}
                       </div>
                       
                       {/* Plaque */}
                       <div className="bg-gradient-to-b from-card-bg to-black/40 border border-border-base rounded-lg p-2 w-24 flex flex-col items-center justify-center shadow-md relative mt-1 group-hover:border-text-main/30 transition-colors">
                          <h3 className="text-[9px] font-bold text-text-main leading-tight mb-0.5 line-clamp-1">{trophy.title}</h3>
                          <p className="text-[8px] text-text-muted font-medium">{trophy.subtitle}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Section: Achievements (Shelves) */}
        <div className="space-y-4">
           <h3 className="text-sm font-bold text-text-muted uppercase tracking-wider px-1">Achievements</h3>
           
           {/* Loop through rows to create shelves */}
           {badgeRows.map((row, rowIndex) => (
             <div key={rowIndex} className="relative pt-8 pb-0 mb-10 last:mb-0">
                {/* Shelf Graphic */}
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-white/5 to-transparent border-t border-white/10 shadow-sm"></div>
                {/* Wood/Material texture hint */}
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-b from-black/20 to-transparent"></div>

                <div className="flex justify-start px-2 relative z-10 pb-1">
                   {row.map((badge, idx) => (
                      <div key={badge.id} className="flex flex-col items-center group cursor-pointer w-1/3">
                         <div className={`w-14 h-14 rounded-xl ${badge.bg} ${badge.border} border flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg bg-card-bg relative`}>
                            {/* Reflection */}
                            <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5 rounded-t-xl"></div>
                            <div className={badge.color}>{badge.icon}</div>
                         </div>
                         
                         <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider text-center leading-tight max-w-[80px] group-hover:text-text-main transition-colors bg-card-bg/80 px-2 py-1 rounded-md border border-border-base backdrop-blur-sm shadow-sm">
                            {badge.name}
                         </span>
                      </div>
                   ))}
                </div>
             </div>
           ))}
        </div>

      </div>

    </div>
  );
};
