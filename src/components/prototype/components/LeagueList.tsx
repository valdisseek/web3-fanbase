"use client";

import React, { useState } from 'react';
import { ChevronDown, Minus, Plus, Settings, ChevronRight } from 'lucide-react';
import { LeagueSummary } from '../types';

interface LeagueListProps {
  onOpenLeague?: (league: LeagueSummary) => void;
}

interface LocalLeagueData extends LeagueSummary {
  status: 'down' | 'neutral' | 'up';
}

const privateLeaguesData: LocalLeagueData[] = [
  { id: 201, name: "Dayvy vs. The World", points: 2871, status: "down", rank: 1, nextMatch: "GW13" },
  { id: 202, name: "Squash league", points: 1, status: "neutral", rank: 12, nextMatch: "GW13" },
  { id: 203, name: "YouTube.com/FPLtips", points: 23948, status: "down", rank: 450, nextMatch: "GW13" },
  { id: 204, name: "Късметът на начинаещия", points: 9, status: "neutral", rank: 8, nextMatch: "GW13" },
  { id: 205, name: "Ритнитопъ", points: 958, status: "down", rank: 3, nextMatch: "GW13" },
  { id: 206, name: "Чичо Краси е пиян", points: 12, status: "down", rank: 15, nextMatch: "GW13" },
];

const publicLeaguesData: LocalLeagueData[] = [
  { id: 301, name: "Bulgaria", points: 7457, status: "down", rank: 1205, nextMatch: "GW13" },
  { id: 302, name: "Gameweek 1", points: 2661570, status: "down", rank: 50021, nextMatch: "GW13" },
  { id: 303, name: "Overall", points: 2693213, status: "down", rank: 850021, nextMatch: "GW13" },
  { id: 304, name: "Second Chance", points: 0, status: "neutral", rank: 1, nextMatch: "GW13" },
];

const LeagueItem: React.FC<{ data: LocalLeagueData; onClick?: () => void }> = ({ data, onClick }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between py-3 border-b border-border-base last:border-0 group cursor-pointer hover:bg-glass px-2 -mx-2 rounded transition-colors"
  >
    <span className="text-sm font-medium text-text-muted group-hover:text-text-main truncate pr-4">{data.name}</span>
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold text-text-main">{data.points}</span>
      {data.status === 'down' ? (
        <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/50">
          <ChevronDown size={14} className="text-white stroke-[3]" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full bg-[#4c1d95] flex items-center justify-center shadow-lg shadow-purple-900/50">
          <Minus size={12} className="text-white stroke-[3]" />
        </div>
      )}
    </div>
  </div>
);

export const LeagueList: React.FC<LeagueListProps> = ({ onOpenLeague }) => {
  const [activeTab, setActiveTab] = useState<'Leagues' | 'Cups'>('Leagues');

  return (
    <div className="mb-8">
      <h2 className="text-text-main font-bold text-lg mb-3 px-1">My Leagues & Cups</h2>
      
      {/* Tabs */}
      <div className="bg-input-bg p-1 rounded-xl flex gap-1 mb-4 border border-border-base">
        <button 
          onClick={() => setActiveTab('Leagues')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'Leagues' ? 'bg-glass text-text-main' : 'text-text-muted hover:text-text-main'}`}
        >
          Leagues
        </button>
        <button 
           onClick={() => setActiveTab('Cups')}
           className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'Cups' ? 'bg-glass text-text-main' : 'text-text-muted hover:text-text-main'}`}
        >
          Cups
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
         <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-border-base hover:bg-glass text-text-main text-sm font-medium transition-colors">
            <Plus size={16} /> Join Leagues
         </button>
         <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full border border-border-base hover:bg-glass text-text-main text-sm font-medium transition-colors">
            <Settings size={16} /> Configure leagues
         </button>
      </div>

      {/* League Groups */}
      <div className="space-y-6">
        {/* Group 1 */}
        <div>
          <h3 className="text-text-main font-bold text-sm mb-2 px-1">Private Leagues</h3>
          <div className="bg-card-bg/50 rounded-xl p-2 border border-border-base backdrop-blur-sm">
             {privateLeaguesData.map(league => (
                <LeagueItem 
                  key={league.id} 
                  data={league} 
                  onClick={() => onOpenLeague?.(league)} 
                />
             ))}
          </div>
        </div>

        {/* Group 2 */}
        <div>
          <h3 className="text-text-main font-bold text-sm mb-2 px-1">Public Leagues</h3>
          <div className="bg-card-bg/50 rounded-xl p-2 border border-border-base backdrop-blur-sm">
             {publicLeaguesData.map(league => (
                <LeagueItem 
                  key={league.id} 
                  data={league} 
                  onClick={() => onOpenLeague?.(league)} 
                />
             ))}
          </div>
        </div>
      </div>

    </div>
  );
};
