"use client";

import React from 'react';
import { ArrowLeft, Trophy, Calendar, Users, Shield, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { Contest } from '../types';
import { GlassCard } from './GlassCard';

interface ContestDetailsViewProps {
  contest: Contest;
  onBack: () => void;
}

export const ContestDetailsView: React.FC<ContestDetailsViewProps> = ({ contest, onBack }) => {
  return (
    <div className="min-h-screen bg-app-bg pb-24 animate-fade-in font-sans text-text-main">
      {/* Hero Header */}
      <div className="relative h-72 w-full">
        <img 
          src={contest.image} 
          alt={contest.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-app-bg via-app-bg/60 to-transparent"></div>
        
        <button 
          onClick={onBack}
          className="absolute top-6 left-4 p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute bottom-0 left-0 w-full p-6">
           <div className="flex items-center gap-2 mb-2">
              <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg">
                Featured
              </span>
              {contest.partner && (
                <span className="bg-white/10 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  by {contest.partner}
                </span>
              )}
           </div>
           <h1 className="text-3xl font-bold text-white leading-tight mb-2 shadow-sm">{contest.title}</h1>
           <p className="text-teal-400 font-bold text-lg">{contest.subtitle || contest.jackpot}</p>
        </div>
      </div>

      <div className="px-4 -mt-6 relative z-10 space-y-6">
        {/* Quick Stats */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
           <GlassCard className="min-w-[100px] flex-1 flex flex-col items-center justify-center py-4 gap-1 bg-card-bg/80">
              <Trophy className="text-yellow-400 mb-1" size={20} />
              <span className="text-[10px] text-text-muted uppercase">Prize Pool</span>
              <span className="text-sm font-bold text-text-main">{contest.jackpot}</span>
           </GlassCard>
           <GlassCard className="min-w-[100px] flex-1 flex flex-col items-center justify-center py-4 gap-1 bg-card-bg/80">
              <Calendar className="text-blue-400 mb-1" size={20} />
              <span className="text-[10px] text-text-muted uppercase">Deadline</span>
              <span className="text-sm font-bold text-text-main">{contest.deadline || 'Sat 11:00'}</span>
           </GlassCard>
           <GlassCard className="min-w-[100px] flex-1 flex flex-col items-center justify-center py-4 gap-1 bg-card-bg/80">
              <Users className="text-green-400 mb-1" size={20} />
              <span className="text-[10px] text-text-muted uppercase">Entries</span>
              <span className="text-sm font-bold text-text-main">{contest.participants || '12k+'}</span>
           </GlassCard>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border-base">
           <button className="flex-1 pb-3 text-sm font-bold text-pink-500 border-b-2 border-pink-500">Overview</button>
           <button className="flex-1 pb-3 text-sm font-bold text-text-muted hover:text-text-main transition-colors">Prizes</button>
           <button className="flex-1 pb-3 text-sm font-bold text-text-muted hover:text-text-main transition-colors">Rules</button>
           <button className="flex-1 pb-3 text-sm font-bold text-text-muted hover:text-text-main transition-colors">History</button>
        </div>

        {/* Description */}
        <div className="space-y-4">
           <h3 className="text-lg font-bold text-text-main">About this Contest</h3>
           <p className="text-sm text-text-muted leading-relaxed">
             Join the biggest fantasy event of the week! Select your 5-a-side dream team and compete for a share of the guaranteed {contest.jackpot} prize pool. Points are scored based on standard FPL rules with bonus points for goals from outside the box.
           </p>
           
           <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl flex gap-3">
              <Shield className="text-blue-400 shrink-0" size={20} />
              <div>
                 <h4 className="text-sm font-bold text-blue-100 mb-1">Verified Competition</h4>
                 <p className="text-xs text-blue-200/70">This contest is officially regulated and payouts are guaranteed within 24 hours of gameweek completion.</p>
              </div>
           </div>
        </div>

        {/* Rules List */}
        <div>
           <h3 className="text-lg font-bold text-text-main mb-3">Key Rules</h3>
           <ul className="space-y-3">
              {[
                "Max 3 players from one club",
                "Captain scores 2x points",
                "Unlimited transfers before deadline",
                "Auto-subs enabled"
              ].map((rule, i) => (
                 <li key={i} className="flex items-center gap-3 text-sm text-text-muted">
                    <CheckCircle size={16} className="text-teal-500" />
                    {rule}
                 </li>
              ))}
           </ul>
        </div>

        {/* Entry Fee Info */}
        <GlassCard className="flex items-center justify-between bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-pink-500/30">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white">
                 <DollarSign size={20} />
              </div>
              <div>
                 <p className="text-xs text-pink-200">Entry Fee</p>
                 <p className="text-lg font-bold text-white">{contest.entryFee || 'Free Entry'}</p>
              </div>
           </div>
           {contest.entryFee === 'Free Entry' ? (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                 No Deposit
              </span>
           ) : (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30">
                 Multi-Entry Allowed
              </span>
           )}
        </GlassCard>

      </div>

      {/* Floating Footer CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-nav-bg backdrop-blur-xl border-t border-border-base z-50 max-w-md mx-auto">
         <button className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-lg shadow-lg shadow-pink-900/40 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
            Enter Contest <ArrowLeft className="rotate-180" size={20} />
         </button>
         <p className="text-center text-[10px] text-text-muted mt-2 flex items-center justify-center gap-1">
            <AlertCircle size={10} /> T&Cs apply. 18+ only.
         </p>
      </div>
    </div>
  );
};
