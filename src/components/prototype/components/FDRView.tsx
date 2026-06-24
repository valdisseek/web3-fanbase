"use client";

import React, { useState } from 'react';
import { ArrowLeft, Info, ChevronRight, Crown, Lock, SortDesc, X } from 'lucide-react';

interface FDRViewProps {
  onBack: () => void;
}

interface FixtureNode {
  opponent: string;
  venue: 'H' | 'A';
  difficulty: 1 | 2 | 3 | 4 | 5;
}

interface TeamSchedule {
  id: number;
  name: string;
  shortName: string;
  logo: string;
  fixtures: FixtureNode[];
}

// Mock Data Generation
const generateFixtures = (): FixtureNode[] => [
  { opponent: 'IPS', venue: 'H', difficulty: 2 },
  { opponent: 'LEI', venue: 'A', difficulty: 2 },
  { opponent: 'WHU', venue: 'H', difficulty: 3 },
  { opponent: 'MUN', venue: 'A', difficulty: 4 },
  { opponent: 'LIV', venue: 'H', difficulty: 5 },
];

const teams: TeamSchedule[] = [
  { id: 1, name: 'Arsenal', shortName: 'ARS', logo: 'https://resources.premierleague.com/premierleague/badges/t3.svg', fixtures: [{ opponent: 'NFO', venue: 'H', difficulty: 2 }, { opponent: 'WHU', venue: 'A', difficulty: 3 }, { opponent: 'MUN', venue: 'H', difficulty: 4 }, { opponent: 'FUL', venue: 'A', difficulty: 2 }, { opponent: 'EVE', venue: 'H', difficulty: 2 }] },
  { id: 2, name: 'Aston Villa', shortName: 'AVL', logo: 'https://resources.premierleague.com/premierleague/badges/t7.svg', fixtures: [{ opponent: 'CRY', venue: 'H', difficulty: 2 }, { opponent: 'BRE', venue: 'A', difficulty: 3 }, { opponent: 'SOU', venue: 'H', difficulty: 2 }, { opponent: 'CHE', venue: 'A', difficulty: 4 }, { opponent: 'MCI', venue: 'A', difficulty: 5 }] },
  { id: 3, name: 'Bournemouth', shortName: 'BOU', logo: 'https://resources.premierleague.com/premierleague/badges/t91.svg', fixtures: [{ opponent: 'BHA', venue: 'H', difficulty: 3 }, { opponent: 'WOL', venue: 'A', difficulty: 2 }, { opponent: 'TOT', venue: 'H', difficulty: 4 }, { opponent: 'IPS', venue: 'A', difficulty: 2 }, { opponent: 'WHU', venue: 'H', difficulty: 3 }] },
  { id: 4, name: 'Brentford', shortName: 'BRE', logo: 'https://resources.premierleague.com/premierleague/badges/t94.svg', fixtures: [{ opponent: 'EVE', venue: 'A', difficulty: 2 }, { opponent: 'LEI', venue: 'H', difficulty: 2 }, { opponent: 'AVL', venue: 'H', difficulty: 4 }, { opponent: 'NEW', venue: 'A', difficulty: 4 }, { opponent: 'BHA', venue: 'H', difficulty: 3 }] },
  { id: 5, name: 'Brighton', shortName: 'BHA', logo: 'https://resources.premierleague.com/premierleague/badges/t36.svg', fixtures: [{ opponent: 'BOU', venue: 'A', difficulty: 3 }, { opponent: 'SOU', venue: 'H', difficulty: 2 }, { opponent: 'FUL', venue: 'A', difficulty: 3 }, { opponent: 'CRY', venue: 'H', difficulty: 2 }, { opponent: 'WHU', venue: 'A', difficulty: 3 }] },
  { id: 6, name: 'Chelsea', shortName: 'CHE', logo: 'https://resources.premierleague.com/premierleague/badges/t8.svg', fixtures: [{ opponent: 'LEI', venue: 'A', difficulty: 2 }, { opponent: 'AVL', venue: 'H', difficulty: 3 }, { opponent: 'SOU', venue: 'A', difficulty: 2 }, { opponent: 'TOT', venue: 'A', difficulty: 4 }, { opponent: 'BRE', venue: 'H', difficulty: 2 }] },
  { id: 7, name: 'Crystal Palace', shortName: 'CRY', logo: 'https://resources.premierleague.com/premierleague/badges/t31.svg', fixtures: [{ opponent: 'AVL', venue: 'A', difficulty: 4 }, { opponent: 'NEW', venue: 'H', difficulty: 4 }, { opponent: 'IPS', venue: 'A', difficulty: 2 }, { opponent: 'MCI', venue: 'H', difficulty: 5 }, { opponent: 'BHA', venue: 'A', difficulty: 3 }] },
  { id: 8, name: 'Everton', shortName: 'EVE', logo: 'https://resources.premierleague.com/premierleague/badges/t11.svg', fixtures: [{ opponent: 'BRE', venue: 'H', difficulty: 3 }, { opponent: 'MUN', venue: 'A', difficulty: 4 }, { opponent: 'WOL', venue: 'H', difficulty: 2 }, { opponent: 'LIV', venue: 'H', difficulty: 5 }, { opponent: 'ARS', venue: 'A', difficulty: 5 }] },
  { id: 9, name: 'Fulham', shortName: 'FUL', logo: 'https://resources.premierleague.com/premierleague/badges/t54.svg', fixtures: [{ opponent: 'WOL', venue: 'H', difficulty: 2 }, { opponent: 'TOT', venue: 'A', difficulty: 4 }, { opponent: 'BHA', venue: 'H', difficulty: 3 }, { opponent: 'ARS', venue: 'H', difficulty: 5 }, { opponent: 'LIV', venue: 'A', difficulty: 5 }] },
  { id: 10, name: 'Ipswich', shortName: 'IPS', logo: 'https://resources.premierleague.com/premierleague/badges/t40.svg', fixtures: [{ opponent: 'MUN', venue: 'H', difficulty: 4 }, { opponent: 'NFO', venue: 'A', difficulty: 3 }, { opponent: 'CRY', venue: 'H', difficulty: 3 }, { opponent: 'BOU', venue: 'H', difficulty: 3 }, { opponent: 'WOL', venue: 'A', difficulty: 2 }] },
  { id: 11, name: 'Leicester', shortName: 'LEI', logo: 'https://resources.premierleague.com/premierleague/badges/t13.svg', fixtures: [{ opponent: 'CHE', venue: 'H', difficulty: 5 }, { opponent: 'BRE', venue: 'A', difficulty: 3 }, { opponent: 'WHU', venue: 'H', difficulty: 3 }, { opponent: 'NEW', venue: 'A', difficulty: 4 }, { opponent: 'WOL', venue: 'H', difficulty: 2 }] },
  { id: 12, name: 'Liverpool', shortName: 'LIV', logo: 'https://resources.premierleague.com/premierleague/badges/t14.svg', fixtures: [{ opponent: 'SOU', venue: 'A', difficulty: 2 }, { opponent: 'MCI', venue: 'H', difficulty: 5 }, { opponent: 'NEW', venue: 'A', difficulty: 4 }, { opponent: 'EVE', venue: 'A', difficulty: 3 }, { opponent: 'FUL', venue: 'H', difficulty: 2 }] },
  { id: 13, name: 'Man City', shortName: 'MCI', logo: 'https://resources.premierleague.com/premierleague/badges/t43.svg', fixtures: [{ opponent: 'TOT', venue: 'H', difficulty: 4 }, { opponent: 'LIV', venue: 'A', difficulty: 5 }, { opponent: 'NFO', venue: 'H', difficulty: 2 }, { opponent: 'CRY', venue: 'A', difficulty: 3 }, { opponent: 'MUN', venue: 'H', difficulty: 4 }] },
  { id: 14, name: 'Man Utd', shortName: 'MUN', logo: 'https://resources.premierleague.com/premierleague/badges/t1.svg', fixtures: [{ opponent: 'IPS', venue: 'A', difficulty: 2 }, { opponent: 'EVE', venue: 'H', difficulty: 2 }, { opponent: 'ARS', venue: 'A', difficulty: 5 }, { opponent: 'NFO', venue: 'H', difficulty: 2 }, { opponent: 'MCI', venue: 'A', difficulty: 5 }] },
  { id: 15, name: 'Newcastle', shortName: 'NEW', logo: 'https://resources.premierleague.com/premierleague/badges/t4.svg', fixtures: [{ opponent: 'WHU', venue: 'H', difficulty: 2 }, { opponent: 'CRY', venue: 'A', difficulty: 3 }, { opponent: 'LIV', venue: 'H', difficulty: 5 }, { opponent: 'BRE', venue: 'H', difficulty: 3 }, { opponent: 'LEI', venue: 'A', difficulty: 2 }] },
  { id: 16, name: 'Nott\'m Forest', shortName: 'NFO', logo: 'https://resources.premierleague.com/premierleague/badges/t17.svg', fixtures: [{ opponent: 'ARS', venue: 'A', difficulty: 5 }, { opponent: 'IPS', venue: 'H', difficulty: 2 }, { opponent: 'MCI', venue: 'A', difficulty: 5 }, { opponent: 'MUN', venue: 'A', difficulty: 5 }, { opponent: 'AVL', venue: 'H', difficulty: 4 }] },
  { id: 17, name: 'Southampton', shortName: 'SOU', logo: 'https://resources.premierleague.com/premierleague/badges/t20.svg', fixtures: [{ opponent: 'LIV', venue: 'H', difficulty: 5 }, { opponent: 'BHA', venue: 'A', difficulty: 3 }, { opponent: 'AVL', venue: 'A', difficulty: 4 }, { opponent: 'TOT', venue: 'H', difficulty: 4 }, { opponent: 'CHE', venue: 'H', difficulty: 5 }] },
  { id: 18, name: 'Tottenham', shortName: 'TOT', logo: 'https://resources.premierleague.com/premierleague/badges/t6.svg', fixtures: [{ opponent: 'MCI', venue: 'A', difficulty: 5 }, { opponent: 'FUL', venue: 'H', difficulty: 2 }, { opponent: 'BOU', venue: 'A', difficulty: 3 }, { opponent: 'CHE', venue: 'H', difficulty: 4 }, { opponent: 'SOU', venue: 'A', difficulty: 2 }] },
  { id: 19, name: 'West Ham', shortName: 'WHU', logo: 'https://resources.premierleague.com/premierleague/badges/t21.svg', fixtures: [{ opponent: 'NEW', venue: 'A', difficulty: 4 }, { opponent: 'ARS', venue: 'H', difficulty: 5 }, { opponent: 'LEI', venue: 'A', difficulty: 2 }, { opponent: 'WOL', venue: 'H', difficulty: 2 }, { opponent: 'BOU', venue: 'A', difficulty: 3 }] },
  { id: 20, name: 'Wolves', shortName: 'WOL', logo: 'https://resources.premierleague.com/premierleague/badges/t39.svg', fixtures: [{ opponent: 'FUL', venue: 'A', difficulty: 3 }, { opponent: 'BOU', venue: 'H', difficulty: 3 }, { opponent: 'EVE', venue: 'A', difficulty: 3 }, { opponent: 'WHU', venue: 'A', difficulty: 3 }, { opponent: 'IPS', venue: 'H', difficulty: 2 }] },
];

const getColorClass = (difficulty: number) => {
  switch (difficulty) {
    case 1: return 'bg-[#375523] text-white border-[#375523]'; // Dark Green (Easy)
    case 2: return 'bg-[#01fc7a] text-black border-[#01fc7a]'; // Neon Green (Good)
    case 3: return 'bg-[#e7e7e7] text-black border-[#e7e7e7]'; // Grey (Neutral)
    case 4: return 'bg-[#ff1751] text-white border-[#ff1751]'; // Red (Hard)
    case 5: return 'bg-[#80072d] text-white border-[#80072d]'; // Dark Red (Very Hard)
    default: return 'bg-gray-800 text-white';
  }
};

const sortOptions = [
  "Easiest",
  "Hardest",
  "Best rotation pairs",
  "Goals Scored",
  "Goals Conceded",
  "xG"
];

export const FDRView: React.FC<FDRViewProps> = ({ onBack }) => {
  const [showSortMenu, setShowSortMenu] = useState(false);

  return (
    <div className="min-h-screen bg-app-bg pb-24 font-sans text-text-main animate-fade-in flex flex-col relative">
      
      {/* Header */}
      <div className="pt-6 px-4 pb-4 sticky top-0 z-30 bg-app-bg/95 backdrop-blur-xl border-b border-border-base">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-glass border border-border-base rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">Fixture Difficulty</h1>
          </div>
          <button 
            onClick={() => setShowSortMenu(true)}
            className="p-2 bg-glass border border-border-base rounded-full hover:bg-white/10 transition-colors flex items-center gap-1 group"
          >
             <SortDesc size={16} />
             <Lock size={12} className="text-yellow-400" />
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="flex-1 overflow-y-auto relative">
        
        {/* Pro Feature Sticker Overlay */}
        <div className="absolute top-[40px] bottom-0 right-0 w-[55%] z-40 flex flex-col items-center justify-center pointer-events-none sticky inset-0">
          <div className="fixed top-1/2 -translate-y-1/2 right-[10%] flex flex-col items-center animate-bounce-slow">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-5 py-3 rounded-2xl font-black shadow-[0_0_30px_rgba(234,179,8,0.4)] flex items-center gap-2 transform -rotate-6 border-2 border-yellow-200">
               <Crown size={20} className="text-black fill-black" /> 
               <span className="text-sm tracking-wide">PRO FEATURE</span>
            </div>
            <div className="mt-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-center shadow-xl">
               <p className="text-[10px] text-white/90 font-bold mb-1">Unlock Next 3 Gameweeks</p>
               <div className="flex justify-center text-yellow-400">
                  <Lock size={12} />
               </div>
            </div>
          </div>
        </div>

        <div className="min-w-full inline-block align-middle">
           <div className="border-b border-border-base">
              {/* Table Header */}
              <div className="flex text-[10px] font-bold text-text-muted uppercase tracking-wider bg-card-bg/50 sticky top-0 z-20 backdrop-blur-md">
                 <div className="w-16 py-3 pl-4 sticky left-0 bg-app-bg z-30 border-r border-border-base shadow-[2px_0_5px_rgba(0,0,0,0.2)]">Team</div>
                 {['GW12', 'GW13', 'GW14', 'GW15', 'GW16'].map((gw, i) => (
                    <div key={i} className={`flex-1 min-w-[60px] py-3 text-center border-r border-white/5 last:border-0 ${i >= 2 ? 'opacity-40' : ''}`}>{gw}</div>
                 ))}
              </div>

              {/* Table Body */}
              <div className="divide-y divide-border-base">
                 {teams.map((team) => (
                    <div key={team.id} className="flex items-stretch hover:bg-white/5 transition-colors">
                       {/* Sticky Team Column */}
                       <div className="w-16 py-2 pl-4 sticky left-0 bg-app-bg z-10 border-r border-border-base flex flex-col justify-center shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
                          <div className="w-6 h-6 mb-1">
                             <img src={team.logo} alt={team.shortName} className="w-full h-full object-contain" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/24'} />
                          </div>
                          <span className="text-[10px] font-bold text-white leading-none">{team.shortName}</span>
                       </div>

                       {/* Fixture Columns */}
                       {team.fixtures.map((fixture, index) => (
                          <div key={index} className="flex-1 min-w-[60px] p-1 border-r border-white/5 last:border-0 flex items-center justify-center relative">
                             <div className={`w-full h-10 rounded flex flex-col items-center justify-center ${getColorClass(fixture.difficulty)} border transition-all duration-300 ${index >= 2 ? 'blur-[4px] opacity-20 grayscale' : ''}`}>
                                <span className="text-[10px] font-bold leading-none">{fixture.opponent}</span>
                                <span className="text-[9px] font-medium leading-none opacity-80">({fixture.venue})</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Fixed Legend Footer */}
      <div className="bg-card-bg border-t border-border-base p-4 safe-pb sticky bottom-0 z-30">
         <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[10px] font-bold text-text-muted uppercase">Easy</span>
            <span className="text-[10px] font-bold text-text-muted uppercase">Hard</span>
         </div>
         <div className="flex h-3 rounded-full overflow-hidden shadow-inner">
            <div className="flex-1 bg-[#375523]"></div>
            <div className="flex-1 bg-[#01fc7a]"></div>
            <div className="flex-1 bg-[#e7e7e7]"></div>
            <div className="flex-1 bg-[#ff1751]"></div>
            <div className="flex-1 bg-[#80072d]"></div>
         </div>
         <div className="flex justify-between mt-1 text-[9px] text-text-muted font-medium px-2">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
         </div>
      </div>

      {/* Locked Sort Modal */}
      {showSortMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowSortMenu(false)}>
           <div className="w-full max-w-md bg-[#1c1c1e] rounded-t-2xl p-6 border-t border-white/10" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Sort by <span className="bg-yellow-500 text-black text-[10px] px-2 py-0.5 rounded font-black uppercase">PRO</span>
                 </h3>
                 <button onClick={() => setShowSortMenu(false)} className="text-gray-400 hover:text-white">
                    <X size={20} />
                 </button>
              </div>
              <div className="space-y-2">
                 {sortOptions.map((option, idx) => (
                    <button key={idx} className="w-full p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors opacity-70">
                       <span className="font-bold text-gray-300 group-hover:text-white">{option}</span>
                       <Lock size={16} className="text-yellow-500/80" />
                    </button>
                 ))}
              </div>
              <button className="w-full mt-6 py-3.5 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-xl text-black font-bold shadow-lg shadow-yellow-900/40 transform hover:scale-[1.02] transition-transform">
                 Unlock Pro Sorting
              </button>
           </div>
        </div>
      )}

    </div>
  );
};
