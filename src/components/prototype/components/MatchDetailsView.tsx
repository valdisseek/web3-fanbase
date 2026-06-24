"use client";

import React, { useState } from 'react';
import { ArrowLeft, Play, Tv, Share2, ChevronDown, ChevronUp, AlertCircle, RefreshCw, BarChart2, Zap, Shield, Trophy, Check, X as XIcon } from 'lucide-react';
import { Fixture, MatchEvent } from '../types';
import { GlassCard } from './GlassCard';

interface MatchDetailsViewProps {
  fixture: Fixture;
  onBack: () => void;
}

const mockEvents: MatchEvent[] = [
  { id: 1, time: "86'", type: "sub", player: "E. Guessand", detail: "M. Rogers", team: "home" },
  { id: 2, time: "82'", type: "goal", player: "D. Malen", detail: "Assist: Y. Tielemans", team: "away" },
  { id: 3, time: "81'", type: "sub", player: "L. Bogarde", detail: "O. Watkins", team: "home" },
  { id: 4, time: "77'", type: "goal", player: "R. Barkley", detail: "Assist: L. Digne", team: "home" },
  { id: 5, time: "71'", type: "sub", player: "J. Sancho", detail: "A. Onana", team: "home" },
  { id: 6, time: "67'", type: "whistle", detail: "Goalkeeper save A. Semenyo", team: "away" },
];

const fantasyPointsData = [
  { id: 1, player: "D. Malen", points: 8, breakdown: "Goal (+5), Bonus (+3)" },
  { id: 2, player: "R. Barkley", points: 7, breakdown: "Goal (+5), CS (+1), Yellow (-1), Bonus (+2)" },
  { id: 3, player: "Y. Tielemans", points: 5, breakdown: "Assist (+3), CS (+1), Bonus (+1)" },
  { id: 4, player: "L. Digne", points: 4, breakdown: "Assist (+3), CS (+1)" },
  { id: 5, player: "A. Semenyo", points: 3, breakdown: "Saves (+2), CS (+1)" },
];

const mockChannels = [
  { id: 1, name: "Diema Sport 2 HD", quality: "1080p", status: "Live" },
  { id: 2, name: "Sky Sports Main Event", quality: "4K UHD", status: "Upcoming" },
  { id: 3, name: "DAZN 1", quality: "1080p", status: "Upcoming" },
];

export const MatchDetailsView: React.FC<MatchDetailsViewProps> = ({ fixture, onBack }) => {
  const [activeTab, setActiveTab] = useState<'Details' | 'AI Insights' | 'Lineups' | 'Stats'>('Details');

  return (
    <div className="min-h-screen bg-app-bg pb-80 font-sans text-text-main animate-fade-in relative">
      
      {/* Sticky Header */}
      <div className="pt-6 px-4 pb-0 sticky top-0 z-30 bg-app-bg/95 backdrop-blur-xl border-b border-border-base shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="p-2 bg-glass border border-border-base rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-4">
             <button className="p-2 bg-glass border border-border-base rounded-full hover:bg-white/10 transition-colors">
               <Share2 size={20} />
             </button>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center justify-between mb-6">
           <div className="flex flex-col items-center w-1/3">
              <div className="w-16 h-16 mb-2 p-2 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                 <img src={fixture.home.logo} alt={fixture.home.name} className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-bold text-center leading-tight">{fixture.home.name}</span>
           </div>

           <div className="flex flex-col items-center w-1/3">
              <div className="flex items-center gap-3 mb-1">
                 <span className="text-4xl font-bold font-mono">1</span>
                 <span className="text-4xl font-bold font-mono text-text-muted/50">-</span>
                 <span className="text-4xl font-bold font-mono">4</span>
              </div>
              <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded uppercase tracking-wide border border-green-400/20">Full Time</span>
           </div>

           <div className="flex flex-col items-center w-1/3">
              <div className="w-16 h-16 mb-2 p-2 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                 <img src={fixture.away.logo} alt={fixture.away.name} className="w-full h-full object-contain" />
              </div>
              <span className="text-sm font-bold text-center leading-tight">{fixture.away.name}</span>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4 space-y-6">

         {/* Match Events Timeline (Moved Up) */}
         <div className="bg-card-bg rounded-xl border border-border-base overflow-hidden">
            <div className="p-3 bg-white/5 border-b border-border-base flex justify-between items-center">
               <h3 className="text-sm font-bold text-text-main flex items-center gap-2">
                 <RefreshCw size={14} className="text-teal-400" /> Match Timeline
               </h3>
               <span className="text-[10px] font-bold text-text-muted bg-glass px-2 py-0.5 rounded border border-border-base">+4 min added</span>
            </div>
            
            <div className="p-4 space-y-4">
               {mockEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 text-sm">
                     <div className="w-8 font-mono font-bold text-text-muted pt-0.5 text-right">{event.time}</div>
                     
                     <div className="relative flex flex-col items-center pt-1.5 h-full">
                        <div className={`w-2 h-2 rounded-full ${event.type === 'goal' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-600'}`}></div>
                        <div className="w-0.5 h-full bg-white/10 absolute top-2 -z-10 min-h-[20px]"></div>
                     </div>

                     <div className="flex-1 pb-2">
                        <div className="flex items-center gap-2">
                           {event.type === 'goal' && <span className="text-lg leading-none">⚽</span>}
                           {event.type === 'sub' && <RefreshCw size={14} className="text-green-400" />}
                           {event.type === 'whistle' && <Play size={14} className="text-blue-400 fill-blue-400" />}
                           
                           <span className="font-bold text-white text-sm">{event.player || event.detail}</span>
                           {event.type === 'goal' && (
                              <div className="bg-[#1e1b4b] border border-blue-500/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                 <Play size={8} className="text-white fill-white" />
                                 <span className="text-[10px] font-bold text-white">4 - 0</span>
                              </div>
                           )}
                        </div>
                        {event.player && event.detail && (
                           <div className="text-xs text-text-muted mt-0.5">{event.detail}</div>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Tabs */}
         <div className="flex border-b border-border-base sticky top-[200px] bg-app-bg z-20 pt-2">
            {['Details', 'AI Insights', 'Lineups', 'Stats'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 pb-3 text-sm font-bold transition-colors relative ${
                  activeTab === tab ? 'text-pink-500' : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-pink-500 rounded-t-full shadow-[0_-2px_8px_rgba(236,72,153,0.5)]"></div>
                )}
              </button>
            ))}
         </div>

         {/* Betting Odds Card */}
         <div className="bg-card-bg rounded-xl p-4 border border-border-base">
            <div className="flex justify-between items-center mb-3">
               <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Market</span>
               <div className="flex items-center gap-1">
                  <span className="text-[10px] text-text-muted">Odds by</span>
                  <div className="bg-yellow-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">MrBit</div>
               </div>
            </div>
            <div className="flex gap-3">
               <button className="flex-1 bg-glass hover:bg-white/10 border border-border-base py-2.5 rounded-lg flex flex-col items-center transition-colors">
                  <span className="text-[10px] text-text-muted font-bold uppercase mb-0.5">Home</span>
                  <span className="text-sm font-bold text-green-400">2.25</span>
               </button>
               <button className="flex-1 bg-glass hover:bg-white/10 border border-border-base py-2.5 rounded-lg flex flex-col items-center transition-colors">
                  <span className="text-[10px] text-text-muted font-bold uppercase mb-0.5">Draw</span>
                  <span className="text-sm font-bold text-white">3.40</span>
               </button>
               <button className="flex-1 bg-glass hover:bg-white/10 border border-border-base py-2.5 rounded-lg flex flex-col items-center transition-colors">
                  <span className="text-[10px] text-text-muted font-bold uppercase mb-0.5">Away</span>
                  <span className="text-sm font-bold text-white">3.20</span>
               </button>
            </div>
         </div>

         {/* AI Betting Prediction Bar */}
         <div>
            <div className="flex items-center gap-2 mb-3">
               <Zap size={16} className="text-pink-500 fill-pink-500" />
               <h3 className="text-sm font-bold text-text-main">AI Win Probability</h3>
            </div>
            <div className="bg-card-bg rounded-xl p-4 border border-border-base shadow-lg">
               <div className="flex justify-between text-xs mb-2 font-bold">
                  <span className="text-blue-400">Home 33%</span>
                  <span className="text-gray-400">Draw 25%</span>
                  <span className="text-pink-500">Away 42%</span>
               </div>
               <div className="h-3 w-full bg-glass rounded-full overflow-hidden flex shadow-inner">
                  <div className="h-full bg-blue-500 w-[33%]"></div>
                  <div className="h-full bg-gray-600 w-[25%] border-l border-r border-black/20"></div>
                  <div className="h-full bg-pink-500 w-[42%]"></div>
               </div>
               <div className="mt-3 p-3 bg-pink-500/10 border border-pink-500/20 rounded-lg">
                 <p className="text-[10px] text-text-muted leading-relaxed">
                    <span className="text-pink-400 font-bold">AI Insight:</span> Away team has a higher probability based on recent away form and H2H history. Expected goals (xG) favor the visitors by 1.2.
                 </p>
               </div>
            </div>
         </div>

         {/* Highlights Video */}
         <div className="rounded-xl overflow-hidden relative group cursor-pointer border border-border-base bg-black shadow-lg">
            <div className="aspect-video relative">
               <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80" alt="Highlights" className="w-full h-full object-cover opacity-60" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                     <Play size={24} className="ml-1 text-white fill-white" />
                  </div>
               </div>
               {/* Match Info Overlay */}
               <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none">
                  <div className="w-16"><img src={fixture.home.logo} className="w-full opacity-80" /></div>
                  <div className="text-center">
                     <h3 className="text-xl font-black text-white italic tracking-tighter uppercase drop-shadow-lg">Official<br/>Highlights</h3>
                  </div>
                  <div className="w-16"><img src={fixture.away.logo} className="w-full opacity-80" /></div>
               </div>
            </div>
            <div className="p-3 bg-card-bg flex justify-between items-center">
               <span className="text-sm font-bold text-white">Watch Highlights</span>
               <button className="text-xs bg-white text-black font-bold px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
                  See all media
               </button>
            </div>
         </div>

         {/* Fantasy Points Breakdown (New Section at Bottom) */}
         <div className="bg-gradient-to-br from-purple-900/20 to-card-bg rounded-xl border border-purple-500/30 overflow-hidden shadow-lg">
            <div className="p-3 border-b border-border-base flex justify-between items-center bg-purple-500/10">
               <h3 className="text-sm font-bold text-white flex items-center gap-2">
                 <Trophy size={14} className="text-yellow-400 fill-yellow-400" /> Fantasy Points System
               </h3>
               <span className="text-[10px] text-purple-300 font-bold bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30">Live Updates</span>
            </div>
            
            <div className="divide-y divide-border-base">
               {fantasyPointsData.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-glass flex items-center justify-center text-[10px] font-bold border border-border-base">
                           {item.player.split(' ')[0][0]}{item.player.split(' ')[1][0]}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-white">{item.player}</p>
                           <p className="text-[10px] text-text-muted">{item.breakdown}</p>
                        </div>
                     </div>
                     <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-teal-400 leading-none">{item.points}</span>
                        <span className="text-[9px] text-text-muted uppercase">Pts</span>
                     </div>
                  </div>
               ))}
            </div>
            <div className="p-2 bg-black/20 text-center">
               <button className="text-[10px] text-text-muted hover:text-white transition-colors flex items-center justify-center gap-1 w-full">
                  View Full Player List <ChevronDown size={10} />
               </button>
            </div>
         </div>

      </div>

      {/* Sticky TV Footer (Fixed & Expanded) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto">
         <div className="bg-[#1c1c1e] border-t border-border-base shadow-[0_-4px_20px_rgba(0,0,0,0.5)] rounded-t-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 pb-2">
               <div className="flex items-center gap-2">
                  <Tv size={16} className="text-pink-500" />
                  <h3 className="text-sm font-bold text-white">TV channels</h3>
               </div>
               
               {/* Fixed Flag Icon */}
               <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                  <div className="w-6 h-4 rounded-sm overflow-hidden relative border border-white/20 shadow-sm flex">
                     <div className="w-1/3 h-full bg-white"></div>
                     <div className="w-1/3 h-full bg-green-600"></div>
                     <div className="w-1/3 h-full bg-red-600"></div>
                  </div>
                  <ChevronDown size={14} className="text-text-muted" />
               </div>
            </div>

            {/* Channels List */}
            <div className="px-3 pb-3 space-y-2">
              {mockChannels.map((channel) => (
                <div key={channel.id} className="bg-white/5 rounded-xl p-3 flex justify-between items-center border border-white/10 hover:border-white/20 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-black/30 flex items-center justify-center">
                        <Tv size={16} className="text-white group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="text-sm font-bold text-white">{channel.name}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                      <div className="flex items-center gap-1">
                        <Check size={10} className="text-green-500" />
                        <span className="text-[10px] font-bold text-white">10</span>
                      </div>
                      <div className="flex items-center gap-1">
                         <XIcon size={10} className="text-red-500" />
                         <span className="text-[10px] font-bold text-white">0</span>
                      </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full text-center text-xs text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center justify-center gap-1 py-3 border-t border-white/5 bg-white/5 hover:bg-white/10">
               See full TV schedule <ArrowLeft size={12} className="rotate-180" />
            </button>
         </div>
      </div>

    </div>
  );
};
