"use client";

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, ChevronLeft, ChevronRight, Trophy, Medal, ArrowUp, ArrowDown, Minus, Swords, X, DollarSign, Wallet } from 'lucide-react';
import { LeagueSummary } from '../types';
import { GlassCard } from './GlassCard';

interface LeagueDetailsViewProps {
  league: LeagueSummary;
  onBack: () => void;
}

interface LeagueEntry {
  rank: number;
  lastRank: number;
  teamName: string;
  managerName: string;
  gwPoints: number;
  totalPoints: number;
  isUser?: boolean;
}

// Mock data generator
const generateMockTable = (leagueId: number): LeagueEntry[] => {
  const entries: LeagueEntry[] = [];
  const teams = ["Gunners FC", "Klopp's Kids", "Pep's Roulette", "Ange Ball", "Ten Hag's Tricky Reds", "Dyche Ball", "Moyes Boys", "Emery's Army", "Howe's Way", "De Zerbi's Gulls"];
  const managers = ["John Doe", "Jane Smith", "Mike Ross", "Harvey Specter", "Louis Litt", "Donna Paulsen", "Rachel Zane", "Jessica Pearson", "Alex Williams", "Samantha Wheeler"];
  
  for (let i = 1; i <= 50; i++) {
    const rank = i;
    const lastRank = i + Math.floor(Math.random() * 5) - 2; // Random movement
    const teamName = `${teams[i % teams.length]} ${Math.floor(Math.random() * 100)}`;
    
    entries.push({
      rank,
      lastRank,
      teamName: teamName,
      managerName: `${managers[i % managers.length]}`,
      gwPoints: Math.floor(Math.random() * 100) + 20,
      totalPoints: 1000 - (i * 10) + Math.floor(Math.random() * 20),
      isUser: i === 4 // Mock user at rank 4
    });
  }
  return entries;
};

const ITEMS_PER_PAGE = 10;

export const LeagueDetailsView: React.FC<LeagueDetailsViewProps> = ({ league, onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showBattleModal, setShowBattleModal] = useState(false);
  
  const fullTable = useMemo(() => generateMockTable(league.id), [league.id]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return fullTable;
    return fullTable.filter(entry => 
      entry.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.managerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [fullTable, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy size={16} className="text-yellow-400" />;
    if (rank === 2) return <Medal size={16} className="text-gray-300" />;
    if (rank === 3) return <Medal size={16} className="text-amber-600" />;
    return <span className="text-sm font-bold text-text-muted">{rank}</span>;
  };

  const getMovementIcon = (current: number, last: number) => {
    if (current < last) return <ArrowUp size={12} className="text-green-500" />;
    if (current > last) return <ArrowDown size={12} className="text-red-500" />;
    return <Minus size={12} className="text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-app-bg pb-32 font-sans text-text-main animate-fade-in relative">
      {/* Header */}
      <div className="pt-6 px-4 pb-6 bg-gradient-to-b from-purple-900/40 to-app-bg border-b border-border-base sticky top-0 z-20 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 bg-glass border border-border-base rounded-full hover:bg-white/10 text-text-main transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-text-main truncate">{league.name}</h1>
        </div>
        
        {/* User Stats Strip */}
        <div className="flex gap-4">
           <div className="flex-1 bg-card-bg/50 rounded-xl p-3 border border-border-base flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center">
                 <Trophy size={20} className="text-teal-400" />
              </div>
              <div>
                 <p className="text-[10px] text-text-muted uppercase">Your Rank</p>
                 <p className="text-lg font-bold text-white">#{league.rank}</p>
              </div>
           </div>
           <div className="flex-1 bg-card-bg/50 rounded-xl p-3 border border-border-base flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                 <ArrowUp size={20} className="text-pink-400" />
              </div>
              <div>
                 <p className="text-[10px] text-text-muted uppercase">Total Pts</p>
                 <p className="text-lg font-bold text-white">{league.points}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="px-4 py-3 flex text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-base bg-app-bg/95 sticky top-[140px] z-10">
         <div className="w-12 text-center">Rank</div>
         <div className="flex-1 px-2">Team & Manager</div>
         <div className="w-12 text-center">GW</div>
         <div className="w-14 text-center">Total</div>
      </div>

      {/* List */}
      <div className="px-2 py-2 space-y-1">
         {currentData.map((entry) => (
            <GlassCard 
              key={entry.rank} 
              className={`p-0 flex items-center py-3 border-0 ${entry.isUser ? '!bg-teal-500/10 !border-teal-500/30 border' : 'bg-transparent hover:bg-glass'}`}
            >
               <div className="w-12 flex flex-col items-center gap-1">
                  {getRankIcon(entry.rank)}
                  {getMovementIcon(entry.rank, entry.lastRank)}
               </div>
               <div className="flex-1 px-2 min-w-0">
                  <h4 className={`text-sm font-bold truncate ${entry.isUser ? 'text-teal-400' : 'text-text-main'}`}>
                    {entry.teamName}
                  </h4>
                  <p className="text-xs text-text-muted truncate">{entry.managerName}</p>
               </div>
               <div className="w-12 text-center font-medium text-text-muted">
                  {entry.gwPoints}
               </div>
               <div className="w-14 text-center font-bold text-text-main text-sm">
                  {entry.totalPoints}
               </div>
            </GlassCard>
         ))}
         {currentData.length === 0 && (
            <div className="text-center py-10 text-text-muted">
               No teams found matching "{searchQuery}"
            </div>
         )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-6">
           <button 
             disabled={currentPage === 1}
             onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
             className="p-2 rounded-full bg-glass border border-border-base text-text-main disabled:opacity-30 hover:bg-white/10 transition-colors"
           >
              <ChevronLeft size={20} />
           </button>
           <span className="text-sm text-text-muted font-medium">
              Page {currentPage} of {totalPages}
           </span>
           <button 
             disabled={currentPage === totalPages}
             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
             className="p-2 rounded-full bg-glass border border-border-base text-text-main disabled:opacity-30 hover:bg-white/10 transition-colors"
           >
              <ChevronRight size={20} />
           </button>
        </div>
      )}

      {/* Sticky Search Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-nav-bg backdrop-blur-xl border-t border-border-base z-30 max-w-md mx-auto">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search by team or manager..."
              className="w-full bg-input-bg border border-border-base text-text-main text-sm rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-text-muted shadow-lg"
            />
         </div>
      </div>

      {/* Battle Sticker (Floating Action Button) */}
      <div className="fixed bottom-24 right-4 z-40 animate-bounce-slow">
        <button onClick={() => setShowBattleModal(true)} className="relative group">
           <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
           <div className="relative bg-app-bg border border-pink-500/50 rounded-full p-3 pr-5 flex items-center gap-2 shadow-2xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center shadow-lg">
                 <Swords className="text-white" size={20} />
              </div>
              <div>
                 <span className="font-black text-white italic uppercase tracking-wider block text-xs">Battle</span>
                 <span className="text-[10px] text-pink-400 font-bold">Challenge</span>
              </div>
           </div>
           <div className="absolute -top-1 right-2 bg-yellow-400 text-black text-[9px] font-bold px-1.5 rounded-full border border-white shadow-sm">
              NEW
           </div>
        </button>
      </div>

      {/* Battle Betting Modal */}
      {showBattleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-4">
           <GlassCard className="w-full max-w-sm bg-[#1a0b2e] border-pink-500/30 relative overflow-hidden shadow-2xl">
              {/* Decorative BG */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/20 rounded-full blur-[60px] pointer-events-none"></div>
              
              <button 
                 onClick={() => setShowBattleModal(false)} 
                 className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 text-white transition-colors z-10"
              >
                 <X size={20} />
              </button>

              <div className="text-center mb-6 relative">
                 <div className="w-20 h-20 bg-gradient-to-tr from-pink-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-pink-900/50 rotate-3 border border-white/10">
                    <Swords size={40} className="text-white drop-shadow-md" />
                 </div>
                 <h2 className="text-3xl font-black text-white uppercase italic tracking-wider transform -skew-x-6">Head 2 Head</h2>
                 <p className="text-xs text-pink-300 font-bold uppercase tracking-widest mt-1">Place your bet</p>
              </div>

              <div className="space-y-4 mb-8">
                 {/* Opponent Selector */}
                 <div className="bg-black/40 rounded-xl p-3 border border-white/10 group focus-within:border-pink-500/50 transition-colors">
                    <label className="text-[10px] font-bold text-text-muted uppercase mb-2 block">Choose Opponent</label>
                    <div className="relative">
                       <select className="w-full bg-transparent text-white font-bold text-sm outline-none appearance-none cursor-pointer">
                          <option>Select a manager...</option>
                          {fullTable.slice(0, 5).map(entry => !entry.isUser && (
                             <option key={entry.rank}>{entry.teamName} ({entry.managerName})</option>
                          ))}
                       </select>
                       <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 text-white pointer-events-none rotate-90" size={16} />
                    </div>
                 </div>

                 {/* Wager Settings */}
                 <div className="flex gap-3">
                    <div className="flex-1 bg-black/40 rounded-xl p-3 border border-white/10 flex flex-col justify-between group focus-within:border-pink-500/50 transition-colors">
                       <label className="text-[10px] font-bold text-text-muted uppercase mb-1 block">Wager</label>
                       <div className="flex items-center gap-2 text-yellow-400 font-bold text-lg">
                          <DollarSign size={18} />
                          <input type="number" defaultValue="5" className="w-full bg-transparent outline-none" />
                       </div>
                    </div>
                    <div className="flex-1 bg-black/40 rounded-xl p-3 border border-white/10 flex flex-col justify-between">
                       <label className="text-[10px] font-bold text-text-muted uppercase mb-1 block">Metric</label>
                       <div className="flex items-center justify-between text-sm font-bold text-white">
                          <span>GW Points</span>
                          <Trophy size={14} className="text-teal-400" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3 flex gap-3 items-center">
                    <Wallet size={16} className="text-pink-400 shrink-0" />
                    <p className="text-[10px] text-pink-200">
                       Winner takes all. A 5% platform fee applies to the pot.
                    </p>
                 </div>
              </div>

              <button className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-pink-900/40 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                 <span className="relative">Send Challenge</span> <Swords size={20} className="relative" />
              </button>
           </GlassCard>
        </div>
      )}

    </div>
  );
};
