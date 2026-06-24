"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Trophy, Send, Users, ChevronRight, MoreVertical, Heart, Share2, Sparkles, Target } from 'lucide-react';
import { Community } from '../types';
import { GlassCard } from './GlassCard';

interface CommunityDetailViewProps {
  community: Community;
  onBack: () => void;
}

interface ChatMessage {
  id: number;
  user: string;
  avatar: string;
  text: string;
  time: string;
  isMe?: boolean;
}

const mockMessages: ChatMessage[] = [
  { id: 1, user: "Alex FPL", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80", text: "Is anyone captaining Haaland or is Saka the play for GW13?", time: "10:24", isMe: false },
  { id: 2, user: "Tactical Sarah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", text: "Haaland's away form is scary, but Saka against that Forest high line is tempting.", time: "10:26", isMe: false },
  { id: 3, user: "Me", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80", text: "I'm thinking of a crazy differential... Son captain?", time: "10:30", isMe: true },
  { id: 4, user: "Mod Bot", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80", text: "Friendly reminder to check the injury report before the deadline!", time: "10:35", isMe: false },
];

export const CommunityDetailView: React.FC<CommunityDetailViewProps> = ({ community, onBack }) => {
  const [activeTab, setActiveTab] = useState<'Chat' | 'League'>('Chat');
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const msg: ChatMessage = {
      id: Date.now(),
      user: "Me",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    
    setMessages([...messages, msg]);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-app-bg pb-24 font-sans text-text-main animate-fade-in flex flex-col">
      {/* Hero Header */}
      <div className="relative h-48 w-full shrink-0">
        <img src={community.image} className="w-full h-full object-cover" alt={community.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-app-bg via-app-bg/40 to-transparent"></div>
        
        <button 
          onClick={onBack}
          className="absolute top-6 left-4 p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/20 transition-colors z-10"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="absolute bottom-0 left-0 w-full p-6 pb-2">
           <div className="flex items-end gap-4">
              <div className="w-16 h-16 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl relative z-10 -mb-6 bg-card-bg">
                 <img src={community.avatar} className="w-full h-full object-cover" alt="Avatar" />
              </div>
              <div className="flex-1 pb-1">
                 <h1 className="text-xl font-bold text-white leading-tight shadow-sm">{community.name}</h1>
                 <p className="text-teal-400 font-bold text-xs">League Rank #{community.leagueRank}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="pt-8 px-4 flex-1 flex flex-col">
        {/* Stats Row */}
        <div className="flex gap-4 mb-6">
           <div className="flex-1 bg-card-bg border border-border-base rounded-xl p-3 flex flex-col items-center">
              <span className="text-[10px] text-text-muted uppercase font-bold mb-1">Members</span>
              <span className="text-lg font-bold text-text-main">{community.members}</span>
           </div>
           <div className="flex-1 bg-card-bg border border-border-base rounded-xl p-3 flex flex-col items-center">
              <span className="text-[10px] text-text-muted uppercase font-bold mb-1">Active Now</span>
              <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-lg font-bold text-text-main">{community.activeNow}</span>
              </div>
           </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-border-base mb-4 sticky top-0 bg-app-bg z-20 pt-2">
           {(['Chat', 'League'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 pb-3 text-sm font-bold transition-all relative ${
                  activeTab === tab ? 'text-brand-pink' : 'text-text-muted'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-pink rounded-t-full shadow-[0_-2px_8px_rgba(236,72,153,0.5)]"></div>
                )}
              </button>
           ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1">
           {activeTab === 'Chat' ? (
              <div className="flex flex-col h-full">
                 <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
                    {messages.map((msg) => (
                       <div key={msg.id} className={`flex items-start gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                          <img src={msg.avatar} className="w-8 h-8 rounded-full border border-border-base shrink-0" alt={msg.user} />
                          <div className={`flex flex-col ${msg.isMe ? 'items-end' : ''}`}>
                             <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-text-muted">{msg.user}</span>
                                <span className="text-[10px] text-gray-500">{msg.time}</span>
                             </div>
                             <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                               msg.isMe 
                                 ? 'bg-brand-pink text-white rounded-tr-none' 
                                 : 'bg-card-bg border border-border-base text-text-main rounded-tl-none'
                             }`}>
                                {msg.text}
                             </div>
                          </div>
                       </div>
                    ))}
                    <div ref={chatEndRef} />
                 </div>
                 
                 {/* Chat Input */}
                 <form onSubmit={handleSendMessage} className="pb-8">
                    <div className="relative">
                       <input 
                         type="text" 
                         value={newMessage}
                         onChange={(e) => setNewMessage(e.target.value)}
                         placeholder="Message the community..."
                         className="w-full bg-input-bg border border-border-base text-text-main rounded-2xl py-3.5 pl-4 pr-12 focus:outline-none focus:border-brand-pink transition-all shadow-lg"
                       />
                       <button 
                         type="submit" 
                         className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-pink rounded-xl text-white hover:opacity-90 transition-opacity"
                       >
                          <Send size={18} />
                       </button>
                    </div>
                 </form>
              </div>
           ) : (
              <div className="space-y-6 animate-fade-in pb-10">
                 <GlassCard className="bg-gradient-to-br from-brand-purple/10 to-card-bg border-brand-purple/20">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3">
                          <Trophy className="text-yellow-400" size={24} />
                          <div>
                             <h4 className="font-bold text-text-main">Official League</h4>
                             <p className="text-xs text-text-muted">Top members of this month</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className="text-xs font-bold text-brand-purple block uppercase">Rank</span>
                          <span className="text-xl font-black text-white italic">#{community.leagueRank}</span>
                       </div>
                    </div>
                    
                    <div className="space-y-3">
                       {[
                         { name: "Top G Manager", points: 842, rank: 1 },
                         { name: "Tactical Sarah", points: 835, rank: 2 },
                         { name: "Alex FPL", points: 812, rank: 3 },
                         { name: "Scout Advisor", points: 798, rank: 4 }
                       ].map((m) => (
                          <div key={m.rank} className="flex items-center justify-between p-2.5 rounded-lg bg-glass border border-border-base">
                             <div className="flex items-center gap-3">
                                <span className="w-5 text-xs font-black text-text-muted">{m.rank}</span>
                                <span className="text-sm font-bold text-text-main">{m.name}</span>
                             </div>
                             <span className="text-sm font-bold text-text-main">{m.points} pts</span>
                          </div>
                       ))}
                    </div>

                    <button className="w-full mt-4 py-3 border border-brand-purple/30 rounded-xl text-brand-purple font-bold text-sm hover:bg-brand-purple/10 transition-colors flex items-center justify-center gap-2">
                       Join League <ChevronRight size={16} />
                    </button>
                 </GlassCard>

                 <div className="space-y-4">
                    <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider px-1">Community Goals</h4>
                    <div className="bg-card-bg border border-border-base rounded-xl p-4 space-y-4">
                       <div>
                          <div className="flex justify-between items-center mb-1.5">
                             <span className="text-xs font-bold text-text-main">Active Members Target</span>
                             <span className="text-xs text-text-muted">85%</span>
                          </div>
                          <div className="h-2 w-full bg-input-bg rounded-full overflow-hidden">
                             <div className="h-full bg-brand-teal w-[85%]"></div>
                          </div>
                       </div>
                       <div>
                          <div className="flex justify-between items-center mb-1.5">
                             <span className="text-xs font-bold text-text-main">Global League Climb</span>
                             <span className="text-xs text-text-muted">42 / 50</span>
                          </div>
                          <div className="h-2 w-full bg-input-bg rounded-full overflow-hidden">
                             <div className="h-full bg-brand-pink w-[42%]"></div>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
