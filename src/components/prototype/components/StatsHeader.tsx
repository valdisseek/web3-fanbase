"use client";

import React from 'react';
import { Shirt, Activity, Clock } from 'lucide-react';

interface StatsHeaderProps {
  onTeamClick?: () => void;
  onPointsClick?: () => void;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({ onTeamClick, onPointsClick }) => {
  return (
    <div className="relative mb-6">
      {/* Main Card */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 text-white shadow-glow relative overflow-hidden">
        
        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-xl"></div>

        {/* Header Content */}
        <div className="relative z-10 flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-white/80 uppercase tracking-wide">Gameweek 12</span>
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]"></span>
            </div>
            <h2 className="text-2xl font-bold">My Team</h2>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <span className="text-xs font-bold">Average: 38</span>
          </div>
        </div>

        {/* Points & Deadline Display */}
        <div className="relative z-10 flex flex-col items-center mb-6">
          <div className="flex items-end gap-2">
            <span className="text-6xl font-bold tracking-tighter cursor-pointer hover:scale-105 transition-transform" onClick={onPointsClick}>45</span>
            <span className="text-lg font-medium text-white/80 mb-2">pts</span>
          </div>
          
          <div className="mt-2 flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-sm">
             <Clock size={12} className="text-purple-200" />
             <span className="text-xs text-purple-100 font-medium">GW13 Deadline:</span>
             <span className="text-xs font-bold text-white">Fri 29 Nov, 18:30</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex gap-3">
          <button 
            onClick={onTeamClick}
            className="flex-1 bg-white text-indigo-900 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Shirt size={16} /> Team
          </button>
        </div>
      </div>
    </div>
  );
};
