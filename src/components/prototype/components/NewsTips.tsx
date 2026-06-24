"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';

const newsData = [
  {
    id: 1,
    title: "Who are the best picks for Gameweek 12 of FPL Challenge?",
    category: "Fantasy Challenge",
    img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 2,
    title: "Who are the best replacements for Gabriel in Fantasy?",
    category: "Fantasy Premier League",
    img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: 3,
    title: "Latest Premier League player injuries - club by club news",
    category: "INJURY UPDATE",
    img: "https://images.unsplash.com/photo-1626025437642-0b05076ca301?auto=format&fit=crop&w=400&q=80",
    isInjury: true
  },
  {
    id: 4,
    title: "Everything you need for Gameweek 12 of FPL with the latest tips",
    category: "Fantasy Premier League",
    img: "https://images.unsplash.com/photo-1522778119026-d647f0565c77?auto=format&fit=crop&w=400&q=80"
  }
];

export const NewsTips: React.FC = () => {
  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-text-main font-bold text-lg">Fantasy news and tips</h2>
        <button className="flex items-center gap-1 text-xs font-medium text-text-muted bg-glass px-3 py-1.5 rounded-full hover:bg-glass hover:text-text-main border border-border-base transition-colors">
          See all <ChevronRight size={12} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {newsData.map((item) => (
          <div key={item.id} className="flex justify-between items-start gap-4 group cursor-pointer bg-transparent hover:bg-white/5 p-2 rounded-xl -mx-2 transition-colors">
             <div className="flex-1 pt-1">
                <h3 className="text-text-main font-bold text-sm leading-snug mb-2 group-hover:text-pink-500 transition-colors line-clamp-3">
                  {item.title}
                </h3>
                <span className="text-[10px] text-teal-500 font-bold uppercase tracking-wide">{item.category}</span>
             </div>
             <div className="w-28 h-20 rounded-lg overflow-hidden border border-border-base relative flex-shrink-0 shadow-md">
                <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {item.isInjury && (
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[8px] font-bold text-center py-0.5">
                    INJURY UPDATE
                  </div>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
