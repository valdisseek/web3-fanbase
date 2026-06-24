"use client";

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Filter, ArrowUpDown, Info, TrendingUp, TrendingDown, RefreshCcw, ChevronDown, SlidersHorizontal, Star } from 'lucide-react';

interface PlayerStatisticsViewProps {
  onBack: () => void;
  mode?: 'stats' | 'transfer';
}

interface PlayerStat {
  id: number;
  name: string;
  firstName?: string; // For the compact view like "M.Salah"
  team: string;
  teamShort: string;
  position: 'GKP' | 'DEF' | 'MID' | 'FWD';
  price: number;
  priceChange: 'up' | 'down' | 'same';
  totalPoints: number;
  form: number;
  selectedBy: number;
  status: 'available' | 'injured' | 'suspended' | 'doubtful';
  isDreamTeam?: boolean; // The little green star
  shirtColor: string; // CSS class for bg color
  nextOpponent: string;
  stats: {
    goals: number;
    assists: number;
    cleanSheets: number;
    ictIndex: number;
  };
}

// Data matching the screenshot closer + existing mock data
const mockPlayers: PlayerStat[] = [
  { 
    id: 1, name: 'Haaland', firstName: '', team: 'Man City', teamShort: 'MCI', position: 'FWD', 
    price: 15.0, priceChange: 'same', totalPoints: 112, form: 5.0, selectedBy: 73.0, status: 'available', isDreamTeam: true,
    shirtColor: 'bg-sky-400', nextOpponent: 'TOT (H)',
    stats: { goals: 12, assists: 0, cleanSheets: 0, ictIndex: 115.4 }
  },
  { 
    id: 2, name: 'M.Salah', firstName: '', team: 'Liverpool', teamShort: 'LIV', position: 'MID', 
    price: 14.0, priceChange: 'up', totalPoints: 108, form: 0.8, selectedBy: 17.6, status: 'available',
    shirtColor: 'bg-red-700', nextOpponent: 'SOU (A)',
    stats: { goals: 8, assists: 6, cleanSheets: 5, ictIndex: 110.2 }
  },
  { 
    id: 3, name: 'Isak', firstName: '', team: 'Newcastle', teamShort: 'NEW', position: 'FWD', 
    price: 10.4, priceChange: 'down', totalPoints: 45, form: 3.0, selectedBy: 4.7, status: 'available',
    shirtColor: 'bg-black', nextOpponent: 'WHU (H)',
    stats: { goals: 4, assists: 1, cleanSheets: 0, ictIndex: 55.4 }
  },
  { 
    id: 4, name: 'Palmer', firstName: '', team: 'Chelsea', teamShort: 'CHE', position: 'MID', 
    price: 10.3, priceChange: 'same', totalPoints: 84, form: 0.5, selectedBy: 10.0, status: 'available',
    shirtColor: 'bg-blue-600', nextOpponent: 'LEI (A)',
    stats: { goals: 7, assists: 5, cleanSheets: 2, ictIndex: 94.5 }
  },
  { 
    id: 5, name: 'Saka', firstName: '', team: 'Arsenal', teamShort: 'ARS', position: 'MID', 
    price: 10.2, priceChange: 'same', totalPoints: 78, form: 4.8, selectedBy: 19.7, status: 'injured',
    shirtColor: 'bg-red-600', nextOpponent: 'NFO (H)',
    stats: { goals: 3, assists: 7, cleanSheets: 3, ictIndex: 88.1 }
  },
  { 
    id: 6, name: 'B.Fernandes', firstName: '', team: 'Man Utd', teamShort: 'MUN', position: 'MID', 
    price: 9.1, priceChange: 'up', totalPoints: 60, form: 8.8, selectedBy: 22.5, status: 'available', isDreamTeam: true,
    shirtColor: 'bg-red-600', nextOpponent: 'IPS (A)',
    stats: { goals: 4, assists: 3, cleanSheets: 2, ictIndex: 76.5 }
  },
  { 
    id: 7, name: 'Gyökeres', firstName: '', team: 'Arsenal', teamShort: 'ARS', position: 'FWD', 
    price: 8.8, priceChange: 'up', totalPoints: 0, form: 0.5, selectedBy: 10.5, status: 'available',
    shirtColor: 'bg-red-600', nextOpponent: 'NFO (H)',
    stats: { goals: 0, assists: 0, cleanSheets: 0, ictIndex: 0 }
  },
  { 
    id: 8, name: 'Son', firstName: 'H-M.', team: 'Spurs', teamShort: 'TOT', position: 'MID', 
    price: 9.9, priceChange: 'down', totalPoints: 65, form: 2.1, selectedBy: 8.2, status: 'available',
    shirtColor: 'bg-white', nextOpponent: 'MCI (A)',
    stats: { goals: 3, assists: 3, cleanSheets: 0, ictIndex: 60.2 }
  }
];

// Reusable Shirt Component
const ShirtIcon = ({ color }: { color: string }) => (
  <div className="relative w-8 h-9 shrink-0 mx-auto">
     <div className={`w-full h-full ${color} rounded-t-lg rounded-b-md shadow-sm relative z-10 transition-transform group-hover:scale-105`}>
         {/* Sleeves */}
         <div className={`absolute -left-1 top-0 w-2 h-3 ${color} -rotate-12 rounded-sm`}></div>
         <div className={`absolute -right-1 top-0 w-2 h-3 ${color} rotate-12 rounded-sm`}></div>
         {/* Collar */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1 bg-black/20 rounded-b-full"></div>
     </div>
  </div>
);

export const PlayerStatisticsView: React.FC<PlayerStatisticsViewProps> = ({ onBack, mode = 'stats' }) => {
  const [activeTab, setActiveTab] = useState<'All' | 'GKP' | 'DEF' | 'MID' | 'FWD'>('All');
  const [sortBy, setSortBy] = useState<'price' | 'points' | 'form' | 'selected'>('price');

  const filteredPlayers = useMemo(() => {
    return mockPlayers.filter(p => {
      const matchPos = activeTab === 'All' || p.position === activeTab;
      return matchPos;
    }).sort((a, b) => {
        if (sortBy === 'price') return b.price - a.price;
        if (sortBy === 'points') return b.totalPoints - a.totalPoints;
        if (sortBy === 'form') return b.form - a.form;
        if (sortBy === 'selected') return b.selectedBy - a.selectedBy;
        return 0;
    });
  }, [activeTab, sortBy]);

  return (
    <div className="min-h-screen bg-[#2c0b38] pb-24 font-sans text-white animate-fade-in relative">
      
      {/* Header */}
      <div className="pt-6 px-4 pb-4 bg-[#2c0b38] sticky top-0 z-30">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="p-2 bg-[#481e57] rounded-full hover:bg-[#5a256d] transition-colors border border-white/10">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Statistics</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Filters Row */}
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
            <button className="flex items-center justify-center w-12 h-10 border border-white/20 rounded-lg hover:bg-white/5 transition-colors shrink-0">
               <SlidersHorizontal size={18} />
            </button>
            
            <button className="flex items-center justify-between px-3 h-10 border border-white/20 rounded-lg min-w-[130px] text-sm hover:bg-white/5 transition-colors shrink-0">
               <span>All Positions</span>
               <ChevronDown size={14} className="ml-2 text-gray-400" />
            </button>

            <button className="flex items-center justify-between px-3 h-10 border border-white/20 rounded-lg min-w-[100px] text-sm hover:bg-white/5 transition-colors shrink-0">
               <span>All Clubs</span>
               <ChevronDown size={14} className="ml-2 text-gray-400" />
            </button>

            <button className="flex items-center justify-between px-3 h-10 border border-white/20 rounded-lg text-sm hover:bg-white/5 transition-colors shrink-0">
               <span>Reset</span>
               <RefreshCcw size={14} className="ml-2 text-gray-400" />
            </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="bg-[#1f0625] sticky top-[136px] z-20 border-b border-white/10 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center px-4 py-3">
         <div className="flex-1 flex items-center gap-1 cursor-pointer hover:text-white" onClick={() => setSortBy('points')}>
            Player <ArrowUpDown size={10} />
         </div>
         <div className="w-14 text-center cursor-pointer hover:text-white" onClick={() => setSortBy('form')}>
            Form <ArrowUpDown size={10} className="inline ml-0.5" />
         </div>
         <div className="w-16 text-center cursor-pointer hover:text-white leading-tight" onClick={() => setSortBy('price')}>
            Current<br/>Price <ArrowUpDown size={10} className="inline ml-0.5" />
         </div>
         <div className="w-16 text-center cursor-pointer hover:text-white" onClick={() => setSortBy('selected')}>
            Selected <ArrowUpDown size={10} className="inline ml-0.5" />
         </div>
      </div>

      {/* Player List */}
      <div className="bg-[#2c0b38]">
         {filteredPlayers.map((player) => (
             <div 
                key={player.id} 
                className="group flex items-center px-2 py-4 border-b border-white/10 hover:bg-[#3d104d] transition-colors cursor-pointer relative"
             >
                {/* Info Icon */}
                <button className="p-2 text-white hover:text-brand-pink shrink-0">
                   <div className="w-5 h-5 rounded-full border border-white/40 flex items-center justify-center font-serif italic text-xs font-bold">i</div>
                </button>

                {/* Shirt */}
                <div className="w-12 flex justify-center shrink-0">
                   <ShirtIcon color={player.shirtColor} />
                </div>

                {/* Player Details */}
                <div className="flex-1 min-w-0 pr-2">
                   <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white truncate">{player.name}</span>
                      {player.isDreamTeam && (
                         <div className="w-3 h-3 bg-green-500 rounded-sm flex items-center justify-center rotate-45">
                            <Star size={8} className="text-black fill-black -rotate-45" />
                         </div>
                      )}
                      {player.status === 'injured' && (
                         <div className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                            <Info size={8} className="text-white" />
                         </div>
                      )}
                   </div>
                   <div className="text-[11px] text-gray-400 flex items-center gap-1">
                      <span>{player.team}</span>
                      <span className="text-[9px] uppercase">{player.position}</span>
                   </div>
                </div>

                {/* Stats Columns */}
                <div className="w-14 text-center text-sm font-medium text-white">
                   {player.form.toFixed(1)}
                </div>
                <div className="w-16 text-center text-sm font-medium text-white">
                   £{player.price}m
                </div>
                <div className="w-16 text-center text-sm font-medium text-white">
                   {player.selectedBy.toFixed(1)} %
                </div>
             </div>
         ))}
      </div>

      {/* Floating Action Button for Sorting (Mobile Friendly Addition) */}
      <div className="fixed bottom-24 right-4 lg:hidden">
         <button className="bg-brand-purple text-white p-3 rounded-full shadow-lg border border-white/20 hover:scale-110 transition-transform">
             <Filter size={24} />
         </button>
      </div>

    </div>
  );
};
