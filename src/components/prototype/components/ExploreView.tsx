"use client";

import React, { useState } from 'react';
import { Search, Send, Crown, Sparkles, TrendingUp, Zap, Shield, Ticket, ShoppingBag, Lock, Share2, Award, Calendar, Swords, Target, DollarSign, Star, Trophy, Shirt, Heart, ChevronRight, Users } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { getFantasyAdvice } from '../services/geminiService';
import { UserProfile, Achievement, Community } from '../types';

// --- Mock Data ---

const mockProfile: UserProfile = {
  level: 12,
  title: "Tactical Tinkerer",
  xp: 2450,
  nextLevelXp: 3000,
  cabinetTheme: 'standard',
  achievements: [
    { id: '1', name: "Giant Killer", description: "Beat the league leader", tier: 'gold', iconType: 'swords', unlockedDate: '2023-10-12' },
    { id: '2', name: "Iron Manager", description: "No missed deadlines (10 wks)", tier: 'silver', iconType: 'calendar', progress: 8, maxProgress: 10 },
    { id: '3', name: "Centurion", description: "Score 100+ points in a GW", tier: 'platinum', iconType: 'target', unlockedDate: '2023-12-01' },
    { id: '4', name: "Market Mogul", description: "Team Value > £105m", tier: 'bronze', iconType: 'dollar', progress: 102, maxProgress: 105 },
    { id: '5', name: "Captain Fantastic", description: "Captain Hat-trick", tier: 'gold', iconType: 'star', unlockedDate: '2024-01-15' },
    { id: '6', name: "Derby Winner", description: "Win a H2H against rival", tier: 'silver', iconType: 'trophy', unlockedDate: '2023-09-20' },
  ]
};

const substitutionPerks = [
  { text: "Auto-Sub Optimizer", detail: "AI calculates best bench order based on xMin" },
  { text: "Live Bench Points", detail: "Real-time tracking of benched potential" },
  { text: "Effective Ownership", detail: "See who your rivals are subbing on" },
  { text: "Injury Risk Analysis", detail: "Predicted minutes for flagged players" },
];

const suggestions = [
  "Should I bench Hall for Gvardiol?",
  "Best replacements for Saka?",
  "Who is the best captain for GW13?"
];

const popularCommunities: Community[] = [
  {
    id: 1,
    name: "FPL Tactical Hub",
    description: "Deep stats and tactical debates for serious managers.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80",
    members: "124k",
    activeNow: 1205,
    leagueRank: 42,
    avatar: "https://images.unsplash.com/photo-1522778119026-d647f0565c77?auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 2,
    name: "The Differential Squad",
    description: "Finding those low-ownership gems to climb the ranks.",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80",
    members: "85k",
    activeNow: 432,
    leagueRank: 156,
    avatar: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=100&q=80"
  },
  {
    id: 3,
    name: "Wildcard Warriors",
    description: "Constant team rebuilding and chip strategy talk.",
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?auto=format&fit=crop&w=600&q=80",
    members: "210k",
    activeNow: 3421,
    leagueRank: 8,
    avatar: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=100&q=80"
  }
];

// --- Helper Components ---

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const isUnlocked = !!achievement.unlockedDate;
  
  const getIcon = () => {
    switch (achievement.iconType) {
      case 'swords': return <Swords size={20} />;
      case 'calendar': return <Calendar size={20} />;
      case 'target': return <Target size={20} />;
      case 'dollar': return <DollarSign size={20} />;
      case 'star': return <Star size={20} />;
      case 'trophy': return <Trophy size={20} />;
      default: return <Award size={20} />;
    }
  };

  const getTierColor = () => {
    switch (achievement.tier) {
      case 'platinum': return 'text-cyan-400 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]';
      case 'gold': return 'text-yellow-400 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]';
      case 'silver': return 'text-gray-300 border-gray-300';
      case 'bronze': return 'text-orange-700 border-orange-700';
    }
  };

  return (
    <div className={`flex flex-col items-center gap-2 w-[30%] mb-4 ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}>
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-white/10 to-white/5 border-2 flex items-center justify-center relative group cursor-pointer ${getTierColor()}`}>
        {getIcon()}
        {/* Tooltip Effect */}
        <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-bold text-text-main leading-tight">{achievement.name}</p>
        {!isUnlocked && achievement.progress !== undefined && (
          <div className="w-full bg-gray-700 h-1 mt-1 rounded-full overflow-hidden">
             <div className="bg-green-400 h-full" style={{ width: `${(achievement.progress / (achievement.maxProgress || 1)) * 100}%` }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ExploreViewProps {
  onOpenCabinet?: () => void;
  onOpenCommunity?: (community: Community) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onOpenCabinet, onOpenCommunity }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => setLoading(false), 1500);
    setQuery('');
  };

  return (
    <div className="pb-32 min-h-screen font-sans text-text-main space-y-8 pt-6">
      
      {/* 1. Scout AI Search Bar */}
      <div className="px-4">
         <div className="flex items-center gap-2 mb-3">
             <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-teal to-brand-purple flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
             </div>
             <h2 className="text-lg font-bold text-text-main">Scout AI</h2>
         </div>

         <div className="relative mb-4">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask for transfer advice, player stats..."
              className="w-full bg-card-bg border border-border-base text-text-main rounded-full py-3.5 pl-12 pr-12 shadow-lg focus:outline-none focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all placeholder:text-text-muted"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-purple rounded-full text-white hover:bg-brand-purple/80 transition-colors"
            >
               <Send size={16} className={loading ? 'animate-spin' : ''} />
            </button>
         </div>

         {/* Suggestion Chips */}
         <div className="flex flex-wrap gap-2">
            {suggestions.map((text, idx) => (
               <button 
                 key={idx}
                 onClick={() => setQuery(text)}
                 className="px-3 py-1.5 bg-input-bg hover:bg-glass border border-border-base rounded-lg text-xs font-medium text-text-muted hover:text-text-main transition-colors flex items-center gap-1"
               >
                 <Sparkles size={10} className="text-brand-purple" /> {text}
               </button>
            ))}
         </div>
      </div>

      {/* 2. Pro Substitution Perks */}
      <div className="px-4">
         <div className="bg-gradient-to-br from-[#2e1065] to-[#4c1d95] rounded-2xl p-6 border border-border-base relative overflow-hidden shadow-glow">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-[40px]"></div>
            
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <h3 className="text-xl font-bold text-white mb-1">Pro Subs</h3>
                     <p className="text-xs text-purple-200">Gain the tactical edge</p>
                  </div>
                  <div className="bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                     PREMIUM
                  </div>
               </div>
               
               <div className="space-y-3 mb-6">
                  {substitutionPerks.map((perk, i) => (
                     <div key={i} className="flex items-start gap-3">
                        <div className="min-w-[20px] pt-0.5">
                           <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-white leading-none">{perk.text}</p>
                           <p className="text-[10px] text-purple-200 leading-tight">{perk.detail}</p>
                        </div>
                     </div>
                  ))}
               </div>

               <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg flex items-center justify-center gap-2">
                  Unlock Pro Tools <Lock size={14} />
               </button>
            </div>
         </div>
      </div>

      {/* 3. Popular Communities */}
      <div className="px-4">
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
               Popular Communities <Users size={18} className="text-brand-teal" />
            </h2>
            <button className="text-xs text-brand-purple font-bold hover:underline flex items-center gap-1">
               See all <ChevronRight size={14} />
            </button>
         </div>
         
         <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
            {popularCommunities.map((community) => (
               <div 
                 key={community.id}
                 onClick={() => onOpenCommunity?.(community)}
                 className="min-w-[280px] bg-card-bg border border-border-base rounded-2xl overflow-hidden shadow-lg group cursor-pointer hover:border-brand-teal/50 transition-all"
               >
                  <div className="h-28 relative">
                     <img src={community.image} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt={community.name} />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                     <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl border-2 border-white/20 overflow-hidden shadow-lg">
                           <img src={community.avatar} className="w-full h-full object-cover" alt="Avatar" />
                        </div>
                        <div>
                           <h3 className="text-white font-bold text-sm leading-tight">{community.name}</h3>
                           <div className="flex items-center gap-2 text-[10px] text-gray-300">
                              <span className="flex items-center gap-1"><Users size={10} /> {community.members}</span>
                              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> {community.activeNow}</span>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="p-3">
                     <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        {community.description}
                     </p>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* 4. Commerce Section */}
      <div className="px-4 space-y-6">
         
         {/* Merchandise Store */}
         <div className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer shadow-lg border border-border-base">
            <img 
               src="https://images.unsplash.com/photo-1522778119026-d647f0565c77?auto=format&fit=crop&w=800&q=80" 
               className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            
            <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md animate-pulse">
               Mid-Season Sale
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-5">
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg">
                     <ShoppingBag size={24} />
                  </div>
                  <div>
                     <h3 className="text-2xl font-bold text-white leading-none shadow-sm">Official Store</h3>
                     <p className="text-sm text-gray-300 font-medium">Authentic Kits & Training Wear</p>
                  </div>
               </div>

               {/* Example Items */}
               <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  <div className="bg-black/60 backdrop-blur-md rounded-xl p-2.5 flex items-center gap-3 border border-white/10 shrink-0 pr-4 hover:bg-black/80 transition-colors">
                     <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-lg">👕</div>
                     <div>
                        <p className="text-xs font-bold text-white">Home Kit 24/25</p>
                        <p className="text-[10px] text-gray-300 font-mono">£80.00</p>
                     </div>
                  </div>
                   <div className="bg-black/60 backdrop-blur-md rounded-xl p-2.5 flex items-center gap-3 border border-white/10 shrink-0 pr-4 hover:bg-black/80 transition-colors">
                     <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-lg">🧣</div>
                     <div>
                        <p className="text-xs font-bold text-white">Wool Scarf</p>
                        <p className="text-[10px] text-gray-300 font-mono">£20.00</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Match Tickets */}
         <div className="relative h-auto min-h-[250px] rounded-2xl overflow-hidden group cursor-pointer shadow-lg border border-border-base bg-card-bg">
             {/* Background Header */}
             <div className="h-28 relative">
                <img 
                  src="https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?auto=format&fit=crop&w=800&q=80" 
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-card-bg"></div>
                <div className="absolute bottom-4 left-5 flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                      <Ticket size={20} />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-white leading-tight">Match Tickets</h3>
                      <p className="text-xs text-gray-300">Secure your seat</p>
                   </div>
                </div>
             </div>

             {/* Ticket Examples */}
             <div className="p-4 space-y-3 bg-card-bg relative z-10 -mt-2">
                {[
                  { match: "Arsenal vs Man Utd", date: "Sat, 22 Nov", price: "£65", status: "Selling Fast" },
                  { match: "Chelsea vs Liverpool", date: "Sun, 23 Nov", price: "£72", status: "Limited" },
                  { match: "Spurs vs Man City", date: "Sat, 29 Nov", price: "£80", status: "Sold Out" }
                ].map((ticket, i) => (
                   <div key={i} className="flex justify-between items-center bg-input-bg p-3.5 rounded-xl border border-border-base hover:border-brand-purple/50 transition-colors group/ticket">
                      <div>
                         <p className="text-sm font-bold text-text-main group-hover/ticket:text-brand-purple transition-colors">{ticket.match}</p>
                         <p className="text-xs text-text-muted flex items-center gap-1"><Calendar size={10} /> {ticket.date}</p>
                      </div>
                      <div className="text-right">
                         <span className="block text-sm font-bold text-text-main">{ticket.price}</span>
                         <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                           ticket.status === 'Sold Out' ? 'bg-red-500/10 text-red-500' : 
                           ticket.status === 'Limited' ? 'bg-yellow-500/10 text-yellow-500' :
                           'bg-green-500/10 text-green-500'
                         }`}>
                           {ticket.status}
                         </span>
                      </div>
                   </div>
                ))}
                
                <button className="w-full py-3.5 mt-2 bg-text-main text-app-bg font-bold rounded-xl text-sm hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2">
                   View Full Calendar <ChevronRight size={14} />
                </button>
             </div>
         </div>
      </div>

      {/* 5. Manager Journey & Trophy Cabinet */}
      <div className="px-4 pt-4">
         <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-main flex items-center gap-2">
               Trophy Cabinet <Crown size={16} className="text-yellow-500" />
            </h2>
            <button 
               onClick={onOpenCabinet}
               className="text-xs text-brand-purple font-bold hover:underline"
            >
               View Full Cabinet
            </button>
         </div>

         <div 
            onClick={onOpenCabinet}
            className="bg-card-bg border border-border-base rounded-2xl overflow-hidden shadow-lg relative cursor-pointer group hover:border-brand-purple/50 transition-colors"
         >
             {/* Cabinet Header / Level System */}
             <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 border-b border-white/10 relative">
                <div className="flex justify-between items-end mb-2 relative z-10">
                   <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Manager Level</span>
                      <h3 className="text-2xl font-black text-white italic">{mockProfile.level}</h3>
                      <p className="text-xs text-brand-teal font-medium">{mockProfile.title}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] text-gray-400 mb-1">{mockProfile.xp} / {mockProfile.nextLevelXp} XP</p>
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                         <div className="h-full bg-gradient-to-r from-brand-teal to-blue-500 w-[82%]"></div>
                      </div>
                   </div>
                </div>
                {/* Abstract texture */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
             </div>

             {/* The Cabinet Display */}
             <div className="p-4 bg-opacity-50 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]">
                <div className="flex justify-between items-center mb-4">
                   <p className="text-[10px] font-bold text-text-muted uppercase">Achievements</p>
                   <button className="p-1.5 hover:bg-black/10 rounded-full transition-colors text-text-muted">
                      <Share2 size={16} />
                   </button>
                </div>

                <div className="flex flex-wrap justify-between">
                   {mockProfile.achievements.map((ach) => (
                      <AchievementBadge key={ach.id} achievement={ach} />
                   ))}
                </div>
             </div>

             {/* Monetization / Upgrade */}
             <div className="bg-input-bg p-3 border-t border-border-base flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                      <Crown size={14} className="text-yellow-500" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-text-main">Premium Case</span>
                      <span className="text-[9px] text-text-muted">Unlock neon themes & borders</span>
                   </div>
                </div>
                <button className="bg-text-main text-app-bg text-xs font-bold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity">
                   Upgrade
                </button>
             </div>
         </div>
      </div>
      
    </div>
  );
};
