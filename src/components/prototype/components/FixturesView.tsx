"use client";
import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Tv, TrendingUp, Filter, ExternalLink } from 'lucide-react';
import { Fixture } from '../types';
import { GlassCard } from './GlassCard';
import { MatchDetailsView } from './MatchDetailsView';

interface FixturesViewProps {
  onBack: () => void;
}

// Mock Data
const mockFixtures: Fixture[] = [
  {
    id: 1,
    date: "Saturday, November 22",
    time: "12:30 PM",
    status: 'UPCOMING',
    venue: "King Power Stadium",
    home: { name: "Leicester", short: "LEI", logo: "https://resources.premierleague.com/premierleague/badges/t13.svg" },
    away: { name: "Chelsea", short: "CHE", logo: "https://resources.premierleague.com/premierleague/badges/t8.svg" },
    broadcaster: { name: "TNT Sports", url: "#" },
    betting: {
      partnerName: "Bet365",
      partnerLogo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Bet365_Logo.svg/1200px-Bet365_Logo.svg.png",
      odds: { home: "5.25", draw: "4.00", away: "1.60" },
      link: "#"
    }
  },
  {
    id: 2,
    date: "Saturday, November 22",
    time: "3:00 PM",
    status: 'UPCOMING',
    venue: "Emirates Stadium",
    home: { name: "Arsenal", short: "ARS", logo: "https://resources.premierleague.com/premierleague/badges/t3.svg" },
    away: { name: "Nott'm Forest", short: "NFO", logo: "https://resources.premierleague.com/premierleague/badges/t17.svg" },
    broadcaster: { name: "Peacock", url: "#" },
    betting: {
      partnerName: "Bet365",
      partnerLogo: "",
      odds: { home: "1.33", draw: "5.50", away: "9.00" },
      link: "#"
    }
  },
  {
    id: 3,
    date: "Saturday, November 22",
    time: "5:30 PM",
    status: 'UPCOMING',
    venue: "Etihad Stadium",
    home: { name: "Man City", short: "MCI", logo: "https://resources.premierleague.com/premierleague/badges/t43.svg" },
    away: { name: "Tottenham", short: "TOT", logo: "https://resources.premierleague.com/premierleague/badges/t6.svg" },
    broadcaster: { name: "Sky Sports", url: "#" },
    betting: {
      partnerName: "William Hill",
      partnerLogo: "",
      odds: { home: "1.50", draw: "4.80", away: "5.50" },
      link: "#"
    }
  },
  {
    id: 4,
    date: "Sunday, November 23",
    time: "2:00 PM",
    status: 'UPCOMING',
    venue: "St Mary's Stadium",
    home: { name: "Southampton", short: "SOU", logo: "https://resources.premierleague.com/premierleague/badges/t20.svg" },
    away: { name: "Liverpool", short: "LIV", logo: "https://resources.premierleague.com/premierleague/badges/t14.svg" },
    broadcaster: { name: "Sky Sports", url: "#" },
    betting: {
      partnerName: "Bet365",
      partnerLogo: "",
      odds: { home: "9.50", draw: "6.00", away: "1.28" },
      link: "#"
    }
  },
  {
    id: 5,
    date: "Monday, November 24",
    time: "8:00 PM",
    status: 'UPCOMING',
    venue: "St James' Park",
    home: { name: "Newcastle", short: "NEW", logo: "https://resources.premierleague.com/premierleague/badges/t4.svg" },
    away: { name: "West Ham", short: "WHU", logo: "https://resources.premierleague.com/premierleague/badges/t21.svg" },
    broadcaster: { name: "Sky Sports", url: "#" },
    betting: {
      partnerName: "Bet365",
      partnerLogo: "",
      odds: { home: "1.85", draw: "3.80", away: "3.80" },
      link: "#"
    }
  }
];

export const FixturesView: React.FC<FixturesViewProps> = ({ onBack }) => {
  const [gameweek, setGameweek] = useState(12);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  // Group fixtures by date
  const groupedFixtures = mockFixtures.reduce((groups, fixture) => {
    const date = fixture.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(fixture);
    return groups;
  }, {} as Record<string, Fixture[]>);

  if (selectedFixture) {
    return <MatchDetailsView fixture={selectedFixture} onBack={() => setSelectedFixture(null)} />;
  }

  return (
    <div className="min-h-screen bg-app-bg pb-24 font-sans text-text-main animate-fade-in">
      
      {/* Header */}
      <div className="pt-6 px-4 pb-2 sticky top-0 z-30 bg-app-bg/95 backdrop-blur-xl border-b border-border-base">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-glass border border-border-base rounded-full hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Matches</h1>
          </div>
          <button className="p-2 bg-glass border border-border-base rounded-full hover:bg-white/10 transition-colors">
             <Filter size={20} />
          </button>
        </div>

        {/* Gameweek Navigation */}
        <div className="flex items-center justify-between bg-card-bg rounded-xl p-1 mb-2 border border-border-base">
           <button 
             onClick={() => setGameweek(g => Math.max(1, g - 1))}
             className="p-2 hover:bg-white/10 rounded-lg transition-colors"
           >
              <ChevronLeft size={20} className="text-text-muted" />
           </button>
           <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wide">Gameweek</span>
              <span className="text-lg font-bold text-white leading-none">{gameweek}</span>
           </div>
           <button 
             onClick={() => setGameweek(g => Math.min(38, g + 1))}
             className="p-2 hover:bg-white/10 rounded-lg transition-colors"
           >
              <ChevronRight size={20} className="text-text-muted" />
           </button>
        </div>
      </div>

      {/* Fixtures List */}
      <div className="px-4 py-4 space-y-6">
        {Object.entries(groupedFixtures).map(([date, fixtures]) => (
          <div key={date}>
            <h2 className="text-base font-bold text-text-main mb-2 px-1">{date}</h2>
            <div className="space-y-2">
              {fixtures.map((fixture) => (
                <div 
                  key={fixture.id} 
                  onClick={() => setSelectedFixture(fixture)}
                  className="bg-card-bg rounded-xl overflow-hidden border border-border-base shadow-md cursor-pointer hover:border-pink-500/50 transition-colors"
                >
                   
                   {/* Match Info */}
                   <div className="p-3 pb-2 pointer-events-none">
                      {/* Header: Competition Info */}
                      <div className="flex justify-center mb-2">
                         <div className="text-[9px] text-text-muted font-medium uppercase tracking-wider flex items-center gap-1">
                            PL <span className="w-0.5 h-0.5 rounded-full bg-text-muted"></span> GW{gameweek}
                         </div>
                      </div>

                      {/* Teams & Score */}
                      <div className="flex items-center justify-between mb-3">
                         {/* Home */}
                         <div className="flex flex-col items-center flex-1">
                            <div className="w-8 h-8 mb-1">
                               <img src={fixture.home.logo} alt={fixture.home.name} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40')} />
                            </div>
                            <span className="text-sm font-bold text-white">{fixture.home.short}</span>
                         </div>

                         {/* VS / Time Pill */}
                         <div className="mx-2 flex flex-col items-center">
                            <div className="bg-glass border border-border-base px-3 py-1 rounded-full backdrop-blur-md">
                               <span className="text-sm font-bold text-white tabular-nums tracking-tight">{fixture.time}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-[9px] text-text-muted">
                               <MapPin size={8} /> {fixture.venue.split(' ').slice(0,2).join(' ')}
                            </div>
                         </div>

                         {/* Away */}
                         <div className="flex flex-col items-center flex-1">
                            <div className="w-8 h-8 mb-1">
                               <img src={fixture.away.logo} alt={fixture.away.name} className="w-full h-full object-contain" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/40')} />
                            </div>
                            <span className="text-sm font-bold text-white">{fixture.away.short}</span>
                         </div>
                      </div>

                      {/* Broadcaster Link */}
                      <div className="flex justify-center mb-1">
                         <div className="flex items-center gap-1 text-[10px] font-medium text-text-muted px-2 py-0.5 rounded-full bg-glass">
                            <Tv size={10} /> {fixture.broadcaster.name}
                         </div>
                      </div>
                   </div>

                   {/* Betting Partner Footer */}
                   <div className="block bg-gradient-to-r from-[#1e293b] to-[#0f172a] border-t border-border-base p-2 hover:bg-white/5 transition-colors group" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-yellow-400 rounded flex items-center justify-center text-[8px] font-bold text-black">
                               {fixture.betting.partnerName.substring(0, 3)}
                            </div>
                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Odds</span>
                         </div>
                         
                         <div className="flex gap-2 text-[10px] font-mono">
                            <div className="flex flex-col items-center">
                               <span className="text-[8px] text-text-muted leading-none">1</span>
                               <span className="text-green-400 font-bold">{fixture.betting.odds.home}</span>
                            </div>
                            <div className="flex flex-col items-center">
                               <span className="text-[8px] text-text-muted leading-none">X</span>
                               <span className="text-gray-300 font-bold">{fixture.betting.odds.draw}</span>
                            </div>
                            <div className="flex flex-col items-center">
                               <span className="text-[8px] text-text-muted leading-none">2</span>
                               <span className="text-red-400 font-bold">{fixture.betting.odds.away}</span>
                            </div>
                         </div>

                         <ExternalLink size={10} className="text-text-muted group-hover:text-white transition-colors" />
                      </div>
                   </div>

                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
