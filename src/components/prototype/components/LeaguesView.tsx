"use client";

import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Trophy, Clock, Users, ChevronRight, Filter, Star } from 'lucide-react';
import { Contest, LeagueSummary } from '../types';

interface LeaguesViewProps {
  onEnterContest: (contest: Contest) => void;
  onOpenLeague: (league: LeagueSummary) => void;
}

const promoSlides: Contest[] = [
  {
    id: 1,
    title: "Gameweek 14 Monster",
    subtitle: "€10,000 Guaranteed",
    jackpot: "€10,000",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80",
    partner: "BetPartner",
    cta: "Enter Now",
    deadline: "Sat 11:00",
    participants: "15,420",
    entryFee: "€5.00"
  },
  {
    id: 2,
    title: "Heineken Derby Duel",
    subtitle: "Win VIP tickets",
    jackpot: "VIP Experience",
    image: "https://images.unsplash.com/photo-1504159506876-f8338247a14a?auto=format&fit=crop&w=600&q=80",
    partner: "Heineken",
    cta: "Join",
    deadline: "Sun 14:00",
    participants: "8,200",
    entryFee: "Free"
  },
  {
    id: 3,
    title: "UCL Tuesday Special",
    subtitle: "Champions League Fantasy",
    jackpot: "€25,000",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=600&q=80",
    partner: "UEFA",
    cta: "Draft Team",
    deadline: "Tue 19:45",
    participants: "22,100",
    entryFee: "€10.00"
  },
  {
    id: 4,
    title: "Sunday League Survivor",
    subtitle: "Last man standing wins all",
    jackpot: "€1,000",
    image: "https://images.unsplash.com/photo-1575361204480-aadea25d4633?auto=format&fit=crop&w=600&q=80",
    partner: "Community",
    cta: "Join Now",
    deadline: "Sun 09:00",
    participants: "540",
    entryFee: "€2.00"
  },
  {
    id: 5,
    title: "High Roller Head-to-Head",
    subtitle: "Winner takes all",
    jackpot: "€500",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    partner: "PaddyPower",
    cta: "Challenge",
    deadline: "Sat 12:00",
    participants: "2",
    entryFee: "€250.00"
  }
];

const myCompetitions: LeagueSummary[] = [
  { id: 1, name: "Office Rivals 24/25", rank: 4, points: 840, nextMatch: "GW14" },
  { id: 2, name: "Global Classic", rank: 124050, points: 812, nextMatch: "GW14" },
  { id: 3, name: "Pub League H2H", rank: 2, points: 24, nextMatch: "vs Dave" },
];

const discoverCompetitions = [
  {
    id: 101,
    name: "Gameweek 15 Weekly",
    prize: "€10,000 Prize",
    sponsor: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=60&q=80", 
    sponsorName: "Efbet",
    deadline: "Fri 18:00",
    entrants: "1,240",
    type: "Daily",
    format: "Official",
    status: "Open"
  },
  {
    id: 102,
    name: "November Master",
    prize: "Signed Jersey",
    sponsor: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=60&q=80",
    sponsorName: "Puma",
    deadline: "Sat 11:00",
    entrants: "8,500",
    type: "Monthly",
    format: "Classic",
    status: "Open"
  }
];

export const LeaguesView: React.FC<LeaguesViewProps> = ({ onEnterContest, onOpenLeague }) => {
  const [activeTab, setActiveTab] = useState<'Open' | 'Current' | 'Past'>('Open');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Slow motion auto-scroll effect
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationFrameId: number;
    const speed = 0.5;

    const animate = () => {
      if (container) {
        if (container.scrollLeft < (container.scrollWidth - container.clientWidth)) {
           container.scrollLeft += speed;
           animationFrameId = requestAnimationFrame(animate);
        }
      }
    };

    const timeoutId = setTimeout(() => {
       animationFrameId = requestAnimationFrame(animate);
    }, 1000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, []);
  
  return (
    <div className="pb-32 font-sans text-text-main pt-4">
      {/* 1. Featured Contests */}
      <div className="mb-8">
        <div className="flex items-center justify-between px-4 mb-4">
            <h2 className="text-xl font-bold text-text-main flex items-center gap-2">
                Featured
            </h2>
        </div>
        
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-4 no-scrollbar"
          style={{ 
            scrollBehavior: 'auto',
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none' 
          }}
        >
          {promoSlides.map((slide) => (
            <div 
               key={slide.id} 
               onClick={() => onEnterContest(slide)}
               className="relative min-w-[300px] h-48 rounded-2xl overflow-hidden group cursor-pointer shadow-lg border border-border-base shrink-0"
            >
              <img src={slide.image} className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
              
              <div className="absolute top-3 left-3">
                 <span className="bg-brand-pink text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md">
                    Featured
                 </span>
              </div>

              <div className="absolute bottom-0 left-0 w-full p-4">
                 <h3 className="text-xl font-bold text-white mb-1">{slide.title}</h3>
                 <p className="text-brand-teal text-xs font-medium mb-2">{slide.subtitle}</p>
                 <div className="flex items-center gap-2 text-xs text-white/80">
                    <Clock size={12} /> {slide.deadline}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. My Competitions */}
      <div className="px-4 mb-8">
        <h2 className="text-xl font-bold text-text-main mb-4">Competitions</h2>
        <div className="space-y-3">
          {myCompetitions.map((comp) => (
            <GlassCard 
              key={comp.id} 
              className="flex justify-between items-center cursor-pointer hover:bg-glass transition-colors group"
            >
              <div onClick={() => onOpenLeague(comp)}>
                <h4 className="text-text-main font-bold text-sm mb-1">{comp.name}</h4>
                <div className="flex gap-3 text-xs text-text-muted">
                   <span>Rank: <b className="text-text-main">#{comp.rank}</b></span>
                   <span>Pts: <b className="text-text-main">{comp.points}</b></span>
                </div>
              </div>
              <ChevronRight size={18} className="text-text-muted group-hover:text-text-main" />
            </GlassCard>
          ))}
        </div>
      </div>

      {/* 3. Discover */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-main">Discover</h2>
          <button className="p-2 bg-glass rounded-full hover:bg-white/10 transition-colors border border-border-base">
             <Filter size={16} className="text-text-main" />
          </button>
        </div>

        <div className="flex gap-1 mb-6 bg-input-bg p-1 rounded-xl">
          {(['Open', 'Current', 'Past'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab 
                  ? 'bg-card-bg text-text-main shadow-sm' 
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-3">
           {discoverCompetitions.map((comp) => (
              <GlassCard key={comp.id} className="p-4 cursor-pointer hover:border-brand-purple/30 transition-colors">
                 <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-input-bg flex items-center justify-center font-bold text-text-main border border-border-base">
                          {comp.sponsorName.substring(0,1)}
                       </div>
                       <div>
                          <h3 className="text-text-main font-bold text-sm">{comp.name}</h3>
                          <p className="text-brand-teal text-xs">{comp.prize}</p>
                       </div>
                    </div>
                    <span className="bg-input-bg text-xs text-text-muted px-2 py-1 rounded-lg border border-border-base">{comp.type}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs text-text-muted mt-2 pt-2 border-t border-border-base">
                    <div className="flex items-center gap-2">
                       <Clock size={12} /> <span>{comp.deadline}</span>
                    </div>
                    <button className="text-text-main hover:text-brand-pink transition-colors font-medium flex items-center gap-1">
                        View Details <ChevronRight size={12} />
                    </button>
                 </div>
              </GlassCard>
           ))}
        </div>
      </div>
    </div>
  );
};
