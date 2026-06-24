"use client";

import React from 'react';
import { ArrowLeft, Trophy, Crown, Star } from 'lucide-react';

interface HighestTeamViewProps {
  onBack: () => void;
}

interface Player {
  id: number;
  name: string;
  team: string;
  shirtColor: string;
  points: number;
  position: 'GKP' | 'DEF' | 'MID' | 'FWD';
  isCaptain?: boolean;
}

const dreamTeam: Player[] = [
  // GKP
  { id: 1, name: 'Sánchez', team: 'CHE', position: 'GKP', shirtColor: 'bg-green-500', points: 11 },
  // DEF
  { id: 2, name: 'Pedro Porro', team: 'TOT', position: 'DEF', shirtColor: 'bg-white', points: 15 },
  { id: 3, name: 'Virgil', team: 'LIV', position: 'DEF', shirtColor: 'bg-red-700', points: 12 },
  { id: 4, name: 'Gvardiol', team: 'MCI', position: 'DEF', shirtColor: 'bg-sky-400', points: 10 },
  // MID
  { id: 5, name: 'Salah', team: 'LIV', position: 'MID', shirtColor: 'bg-red-700', points: 24, isCaptain: true },
  { id: 6, name: 'Palmer', team: 'CHE', position: 'MID', shirtColor: 'bg-blue-700', points: 18 },
  { id: 7, name: 'Saka', team: 'ARS', position: 'MID', shirtColor: 'bg-red-600', points: 13 },
  { id: 8, name: 'Mbeumo', team: 'BRE', position: 'MID', shirtColor: 'bg-red-500', points: 11 },
  // FWD
  { id: 9, name: 'Haaland', team: 'MCI', position: 'FWD', shirtColor: 'bg-sky-400', points: 13 },
  { id: 10, name: 'Jackson', team: 'CHE', position: 'FWD', shirtColor: 'bg-blue-700', points: 12 },
  { id: 11, name: 'Watkins', team: 'AVL', position: 'FWD', shirtColor: 'bg-red-800', points: 9 },
];

const PlayerCard: React.FC<{ player: Player }> = ({ player }) => (
  <div className="flex flex-col items-center justify-center w-[23%] relative mb-2">
     <div className="relative mb-1">
        <div className={`w-8 h-9 ${player.shirtColor} rounded-t-lg rounded-b-md shadow-lg relative z-10 border border-black/10`}>
           <div className={`absolute -left-1 top-0 w-2 h-3 ${player.shirtColor} -rotate-12 rounded-sm`}></div>
           <div className={`absolute -right-1 top-0 w-2 h-3 ${player.shirtColor} rotate-12 rounded-sm`}></div>
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1 bg-white/20 rounded-b-full"></div>
        </div>
        {player.isCaptain && (
           <div className="absolute -top-2 -right-2 text-lg">👑</div>
        )}
     </div>
     <div className="w-full max-w-[70px] bg-white text-black text-[10px] font-bold text-center py-0.5 px-1 rounded-sm shadow-sm truncate leading-tight border border-gray-200">
       {player.name}
     </div>
     <div className="bg-[#1e40af] text-[9px] text-white font-bold px-2 py-0.5 rounded-b-sm mt-[1px] shadow-sm">
        {player.points} pts
     </div>
  </div>
);

export const HighestTeamView: React.FC<HighestTeamViewProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-app-bg pb-20 font-sans animate-fade-in">
      {/* Header */}
      <div className="pt-6 px-4 pb-4 bg-gradient-to-b from-yellow-500/10 to-app-bg border-b border-yellow-500/20">
        <div className="flex items-center mb-4">
          <button onClick={onBack} className="p-2 bg-glass border border-border-base rounded-full mr-4 hover:bg-white/10 text-text-main transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 text-yellow-400">
             <Trophy size={20} className="fill-yellow-400" />
             <h1 className="text-xl font-bold text-white">Dream Team</h1>
          </div>
        </div>
        
        <div className="flex justify-between items-end p-4 bg-gradient-to-r from-yellow-600/20 to-amber-700/20 rounded-2xl border border-yellow-500/30">
           <div>
              <p className="text-xs text-yellow-200 font-bold uppercase mb-1">Gameweek 11</p>
              <p className="text-3xl font-bold text-white">148 <span className="text-sm font-normal text-yellow-400">pts</span></p>
           </div>
           <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-yellow-200 font-medium bg-yellow-500/20 px-2 py-1 rounded-lg border border-yellow-500/20">
                 <Star size={12} /> Highest Scorer
              </div>
           </div>
        </div>
      </div>

      {/* Pitch View */}
      <div className="px-2 mt-4">
        <div className="w-full aspect-[3/4] rounded-3xl border-[3px] border-yellow-500/20 relative overflow-hidden shadow-[0_0_30px_rgba(234,179,8,0.1)] bg-gradient-to-b from-emerald-800 to-emerald-950">
            {/* Pitch Markings */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-16 border-b-2 border-x-2 border-white/10 rounded-b-lg"></div>
            <div className="absolute top-[45%] left-0 w-full h-px bg-white/10"></div>
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-2 border-white/10 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-16 border-t-2 border-x-2 border-white/10 rounded-t-lg"></div>

            {/* Players */}
            <div className="h-full flex flex-col justify-around pt-8 pb-4 px-2">
              {/* GKP */}
              <div className="flex justify-center">
                 {dreamTeam.filter(p => p.position === 'GKP').map(p => <PlayerCard key={p.id} player={p} />)}
              </div>
              {/* DEF */}
              <div className="flex justify-around px-4">
                 {dreamTeam.filter(p => p.position === 'DEF').map(p => <PlayerCard key={p.id} player={p} />)}
              </div>
              {/* MID */}
              <div className="flex justify-around px-6">
                 {dreamTeam.filter(p => p.position === 'MID').map(p => <PlayerCard key={p.id} player={p} />)}
              </div>
              {/* FWD */}
              <div className="flex justify-around px-10">
                 {dreamTeam.filter(p => p.position === 'FWD').map(p => <PlayerCard key={p.id} player={p} />)}
              </div>
            </div>
        </div>
      </div>

      <div className="px-6 mt-6 text-center">
         <p className="text-xs text-text-muted leading-relaxed">
            The Team of the Week is generated automatically based on the highest scoring players in each position for Gameweek 11.
         </p>
      </div>

    </div>
  );
};
