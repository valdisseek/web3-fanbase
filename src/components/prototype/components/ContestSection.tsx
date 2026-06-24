"use client";

import React, { useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Contest } from '../types';

interface ContestSectionProps {
  onEnterContest?: (contest: Contest) => void;
}

const promoSlides: Contest[] = [
  {
    id: 1,
    title: "Gameweek 14 Monster",
    subtitle: "€10,000 Guaranteed Prize Pool",
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
    subtitle: "Win VIP tickets to the final",
    jackpot: "VIP Experience",
    image: "https://images.unsplash.com/photo-1504159506876-f8338247a14a?auto=format&fit=crop&w=600&q=80",
    partner: "Heineken",
    cta: "Join Challenge",
    deadline: "Sun 14:00",
    participants: "8,200",
    entryFee: "Free Entry"
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
  }
];

export const ContestSection: React.FC<ContestSectionProps> = ({ onEnterContest }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Slow motion auto-scroll effect
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationFrameId: number;
    let scrollPos = 0;
    const speed = 0.5;

    const animate = () => {
      if (container) {
        scrollPos += speed;
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
    <div className="mb-8">
      <h2 className="text-white font-bold text-lg mb-3 px-1">Featured Contests</h2>
      
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-4 -mx-4 no-scrollbar"
        style={{ 
          scrollBehavior: 'auto',
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none' 
        }}
      >
        {promoSlides.map((slide) => (
          <div 
             key={slide.id} 
             onClick={() => onEnterContest?.(slide)}
             className="relative min-w-[85%] md:min-w-[340px] h-52 rounded-2xl overflow-hidden group cursor-pointer shadow-xl border border-border-base shrink-0 hover:scale-[1.02] transition-transform duration-300"
          >
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover opacity-90 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-pink-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-md">Featured</span>
                {slide.partner && <span className="text-gray-200 text-xs font-medium backdrop-blur-sm bg-black/30 px-2 py-0.5 rounded">by {slide.partner}</span>}
              </div>
              <h3 className="text-xl font-bold text-white leading-tight mb-1">{slide.title}</h3>
              <p className="text-teal-400 font-bold text-sm mb-3">{slide.subtitle}</p>
              <div className="flex items-center gap-1 text-white text-xs font-bold bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 py-2 px-4 rounded-lg w-fit transition-colors shadow-lg">
                {slide.cta} <ChevronRight size={14} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
