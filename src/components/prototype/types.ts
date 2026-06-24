
export interface League {
  id: number;
  name: string;
  status: 'up' | 'down' | 'neutral';
  rank: number;
  points: number;
  type: 'classic' | 'general';
}

export interface LeagueSummary {
  id: number;
  name: string;
  rank: number;
  points: number;
  nextMatch: string;
}

export interface NewsItem {
  id: number;
  title: string;
  image: string;
  category: string;
}

export interface Contest {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  jackpot: string;
  image: string;
  partner?: string;
  cta?: string;
  entryFee?: string;
  deadline?: string;
  participants?: string;
}

export interface MatchEvent {
  id: number;
  time: string;
  type: 'goal' | 'card' | 'sub' | 'whistle';
  player?: string;
  detail?: string;
  team: 'home' | 'away';
}

export interface Fixture {
  id: number;
  home: { name: string; short: string; logo: string };
  away: { name: string; short: string; logo: string };
  date: string; // "Sunday, November 23"
  time: string; // "4:30 PM" or "2 - 1"
  venue: string;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  broadcaster: { name: string; url: string; logo?: string };
  betting: {
    partnerName: string;
    partnerLogo: string;
    odds: { home: string; draw: string; away: string };
    link: string;
  };
}

export interface Community {
  id: number;
  name: string;
  description: string;
  image: string;
  members: string;
  activeNow: number;
  leagueRank: number;
  avatar: string;
}

// --- Trophy Cabinet & Progression Types ---

export interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  iconType: 'swords' | 'calendar' | 'target' | 'dollar' | 'star' | 'trophy' | 'shield' | 'shirt' | 'zap' | 'heart';
  unlockedDate?: string;
  progress?: number; // e.g., 8/10 weeks
  maxProgress?: number;
}

export interface UserProfile {
  level: number;
  title: string; // e.g., "Sunday League Rookie"
  xp: number;
  nextLevelXp: number;
  achievements: Achievement[];
  cabinetTheme: 'standard' | 'wood' | 'neon' | 'gold';
}
