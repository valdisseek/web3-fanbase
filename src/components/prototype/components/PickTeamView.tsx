"use client";

import React, { useState } from 'react';
import { ArrowLeft, Shirt, ChevronDown, MessageSquare, Send, X, Shield, Zap, Star, AlertTriangle, Sparkles, TrendingUp, RefreshCw, DollarSign } from 'lucide-react';
import { getFantasyAdvice, getTransferSuggestions } from '../services/geminiService';

interface PickTeamViewProps {
  onBack: () => void;
  initialTab?: 'Points' | 'Pick Team' | 'Transfers';
}

interface Player {
  id: number;
  name: string;
  team: string;
  opponent: string;
  isHome: boolean;
  position: 'GKP' | 'DEF' | 'MID' | 'FWD';
  isCaptain?: boolean;
  isVice?: boolean;
  isFlagged?: boolean;
  shirtColor: string;
  points: number;
  price: string;
}

const initialSquad: Player[] = [
  // GKP
  { id: 1, name: 'Raya', team: 'ARS', opponent: 'TOT', isHome: true, position: 'GKP', shirtColor: 'bg-yellow-400', points: 6, price: "£5.6m" },
  // DEF
  { id: 2, name: 'J.Timber', team: 'ARS', opponent: 'TOT', isHome: true, position: 'DEF', shirtColor: 'bg-red-600', isFlagged: false, points: 2, price: "£5.5m" },
  { id: 3, name: 'Richards', team: 'CPL', opponent: 'WOL', isHome: false, position: 'DEF', shirtColor: 'bg-blue-600', points: 6, price: "£4.5m" },
  { id: 4, name: 'Senesi', team: 'BOU', opponent: 'WHU', isHome: true, position: 'DEF', shirtColor: 'bg-red-500', points: 1, price: "£4.8m" },
  { id: 5, name: 'Calafiori', team: 'ARS', opponent: 'TOT', isHome: true, position: 'DEF', shirtColor: 'bg-red-600', isFlagged: true, points: 0, price: "£5.8m" },
  // MID
  { id: 6, name: 'Tavernier', team: 'BOU', opponent: 'WHU', isHome: true, position: 'MID', shirtColor: 'bg-red-500', points: 5, price: "£5.5m" },
  { id: 7, name: 'M.Salah', team: 'LIV', opponent: 'NFO', isHome: true, position: 'MID', shirtColor: 'bg-red-700', isVice: true, points: 13, price: "£12.8m" },
  { id: 8, name: 'Caicedo', team: 'CHE', opponent: 'BUR', isHome: false, position: 'MID', shirtColor: 'bg-blue-700', points: 3, price: "£5.0m" },
  // FWD
  { id: 9, name: 'Woltem...', team: 'NEW', opponent: 'MCI', isHome: true, position: 'FWD', shirtColor: 'bg-black', points: 2, price: "£6.0m" }, 
  { id: 10, name: 'Haaland', team: 'MCI', opponent: 'NEW', isHome: false, position: 'FWD', shirtColor: 'bg-sky-400', isCaptain: true, points: 8, price: "£15.2m" },
  { id: 11, name: 'João Ped...', team: 'BHA', opponent: 'BUR', isHome: false, position: 'FWD', shirtColor: 'bg-blue-500', points: 9, price: "£5.8m" },
  // Bench
  { id: 12, name: 'Dúbravka', team: 'NEW', opponent: 'MCI', isHome: true, position: 'GKP', shirtColor: 'bg-green-400', points: 0, price: "£4.0m" },
  { id: 13, name: 'Kama...', team: 'AVL', opponent: 'LIV', isHome: false, position: 'MID', shirtColor: 'bg-red-800', points: 1, price: "£5.2m" },
  { id: 14, name: 'Struijk', team: 'LEE', opponent: 'CHE', isHome: true, position: 'DEF', shirtColor: 'bg-white', points: 0, price: "£4.5m" },
  { id: 15, name: 'Burn', team: 'NEW', opponent: 'MCI', isHome: true, position: 'DEF', shirtColor: 'bg-black', isFlagged: true, points: 0, price: "£4.4m" },
];

type ViewTab = 'Points' | 'Pick Team' | 'Transfers';

const PlayerCard: React.FC<{ player: Player, isBench?: boolean, mode: ViewTab }> = ({ player, isBench = false, mode }) => (
  <div className="flex flex-col items-center justify-center w-[23%] relative mb-2">
     {/* Shirt Graphic */}
     <div className="relative mb-1 group cursor-pointer transition-transform active:scale-95">
        {/* Shirt Body */}
        <div className={`w-8 h-9 ${player.shirtColor} rounded-t-lg rounded-b-md shadow-lg relative z-10`}>
           {/* Sleeves */}
           <div className={`absolute -left-1 top-0 w-2 h-3 ${player.shirtColor} -rotate-12 rounded-sm`}></div>
           <div className={`absolute -right-1 top-0 w-2 h-3 ${player.shirtColor} rotate-12 rounded-sm`}></div>
           {/* Collar */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1 bg-white/20 rounded-b-full"></div>
           {/* Kit Logo placeholder */}
           <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[6px] text-white/50 font-bold">ADS</div>
        </div>

        {/* Status Badges (Show differently based on mode) */}
        {mode === 'Pick Team' && (
          <>
            {player.isCaptain && (
              <div className="absolute -top-1 -right-2 w-4 h-4 bg-black border border-white rounded-full flex items-center justify-center text-[8px] font-bold text-white z-20">C</div>
            )}
            {player.isVice && (
              <div className="absolute -top-1 -right-2 w-4 h-4 bg-black border border-white rounded-full flex items-center justify-center text-[8px] font-bold text-white z-20">V</div>
            )}
          </>
        )}
        
        {player.isFlagged && (
          <div className="absolute -top-1 -right-2 w-4 h-4 bg-yellow-400 border border-white rounded-full flex items-center justify-center z-20">
            <AlertTriangle size={8} className="text-black fill-black" />
          </div>
        )}
     </div>

     {/* Name Tag */}
     <div className={`w-full max-w-[70px] ${isBench ? 'bg-gray-700/90 text-gray-300' : 'bg-white text-black'} text-[10px] font-bold text-center py-0.5 px-1 rounded-sm shadow-sm truncate leading-tight`}>
       {player.name}
     </div>
     
     {/* Bottom Info Tag */}
     {mode === 'Pick Team' && (
       <div className="bg-[#1a0b2e]/80 backdrop-blur-sm text-[9px] text-white px-1.5 py-0.5 rounded-b-sm mt-[1px]">
          {player.opponent} ({player.isHome ? 'H' : 'A'})
       </div>
     )}
     {mode === 'Points' && (
       <div className="bg-[#1e40af]/90 backdrop-blur-sm text-[9px] text-white font-bold px-2 py-0.5 rounded-b-sm mt-[1px] border-t border-white/10">
          {player.points} pts
       </div>
     )}
     {mode === 'Transfers' && (
       <div className="bg-[#064e3b]/90 backdrop-blur-sm text-[9px] text-white px-1.5 py-0.5 rounded-b-sm mt-[1px] border-t border-white/10">
          {player.price}
       </div>
     )}
  </div>
);

export const PickTeamView: React.FC<PickTeamViewProps> = ({ onBack, initialTab }) => {
  const [activeTab, setActiveTab] = useState<ViewTab>(initialTab || 'Pick Team');
  const [viewMode, setViewMode] = useState<'Pitch' | 'List'>('Pitch');
  
  // AI Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string, type?: 'text' | 'report'}[]>([
    { role: 'ai', text: "Hi boss! I'm your AI Assistant Manager. I can help you analyze your squad, suggest transfers, or pick a captain.", type: 'text' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userMsg = chatQuery;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatQuery('');
    setLoading(true);

    const advice = await getFantasyAdvice(userMsg);
    setChatHistory(prev => [...prev, { role: 'ai', text: advice }]);
    setLoading(false);
  };

  const handleAnalyzeSquad = async () => {
    setLoading(true);
    setChatHistory(prev => [...prev, { role: 'user', text: "Analyze my squad and suggest transfers." }]);
    const squadString = initialSquad.map(p => `${p.name} (${p.team} - ${p.position})`);
    const suggestions = await getTransferSuggestions(squadString);
    setChatHistory(prev => [...prev, { role: 'ai', text: suggestions, type: 'report' }]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-app-bg pb-20 relative font-sans transition-colors duration-300">
      {/* Top Header */}
      <div className="pt-6 px-4 pb-2">
        <div className="flex items-center mb-4">
          <button onClick={onBack} className="p-2 bg-glass border border-border-base rounded-full mr-4 hover:bg-white/10 text-text-main">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-text-main">Team</h1>
        </div>
        
        {/* Tabs */}
        <div className="flex p-1 bg-input-bg rounded-xl border border-border-base mb-4">
          {(['Points', 'Pick Team', 'Transfers'] as ViewTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab 
                  ? 'bg-pink-600 text-white shadow-lg' 
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Specific Sub-Headers */}
      <div className="px-4 mb-6">
        {activeTab === 'Points' && (
          <div className="flex justify-between items-center bg-card-bg p-4 rounded-xl border border-border-base shadow-sm">
             <div className="text-center flex-1 border-r border-border-base">
                <p className="text-xs text-text-muted uppercase font-bold">GW12 Points</p>
                <p className="text-2xl font-bold text-white">45</p>
             </div>
             <div className="text-center flex-1">
                <p className="text-xs text-text-muted uppercase font-bold">Average</p>
                <p className="text-2xl font-bold text-text-muted">38</p>
             </div>
          </div>
        )}

        {activeTab === 'Pick Team' && (
          <>
             <div className="flex items-center justify-center text-text-muted text-xs font-medium mb-4">
                <span>Gameweek 12</span>
                <span className="mx-2">•</span>
                <span>Deadline: Sat 22 Nov, 13:00</span>
             </div>
             <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 min-w-max">
                   <ChipCard title="Bench Boost" status="Available" icon={<Shirt size={14} />} color="blue" />
                   <ChipCard title="Triple Captain" status="Played GW7" icon={<Shield size={14} />} color="purple" disabled />
                   <ChipCard title="Wildcard" status="Played GW4" icon={<Star size={14} />} color="purple" disabled />
                   <ChipCard title="Free Hit" status="Available" icon={<Zap size={14} />} color="blue" />
                </div>
             </div>
          </>
        )}

        {activeTab === 'Transfers' && (
          <div className="bg-card-bg p-4 rounded-xl border border-border-base shadow-sm space-y-3">
             <div className="flex justify-between items-center">
                <div>
                   <p className="text-xs text-text-muted uppercase font-bold">Free Transfers</p>
                   <p className="text-xl font-bold text-white">1</p>
                </div>
                <div className="text-right">
                   <p className="text-xs text-text-muted uppercase font-bold">Bank</p>
                   <p className="text-xl font-bold text-teal-400">£2.4m</p>
                </div>
                <div className="text-right">
                   <p className="text-xs text-text-muted uppercase font-bold">Cost</p>
                   <p className="text-xl font-bold text-white">0 pts</p>
                </div>
             </div>
             <div className="flex gap-2">
                <button className="flex-1 bg-glass border border-border-base text-text-main text-xs font-bold py-2 rounded-lg hover:bg-white/10">Auto Pick</button>
                <button className="flex-1 bg-glass border border-border-base text-text-main text-xs font-bold py-2 rounded-lg hover:bg-white/10">Reset</button>
                <button className="flex-1 bg-purple-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-purple-500">Wildcard</button>
             </div>
          </div>
        )}
      </div>

      {/* Pitch / List Toggle (Only show if not in List mode already or if relevant) */}
      <div className="px-4 mb-4 flex justify-center">
        <div className="bg-input-bg p-1 rounded-xl flex w-64 border border-border-base">
          <button 
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'Pitch' ? 'bg-[#4c1d95] text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
            onClick={() => setViewMode('Pitch')}
          >
            Pitch
          </button>
          <button 
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'List' ? 'bg-[#4c1d95] text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
            onClick={() => setViewMode('List')}
          >
            List
          </button>
        </div>
      </div>

      {/* Pitch View */}
      {viewMode === 'Pitch' && (
        <div className="relative mx-2 animate-fade-in">
           {/* Pitch Background */}
           <div className={`w-full aspect-[3/4] rounded-t-3xl border-[3px] border-white/20 relative overflow-hidden shadow-2xl ${activeTab === 'Transfers' ? 'bg-gradient-to-b from-teal-900 to-slate-900' : 'bg-gradient-to-b from-green-600 to-emerald-700'}`}>
              {/* Pitch Markings */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-16 border-b-2 border-x-2 border-white/30 rounded-b-lg"></div>
              <div className="absolute top-[45%] left-0 w-full h-px bg-white/20"></div>
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-24 h-24 rounded-full border-2 border-white/20 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-16 border-t-2 border-x-2 border-white/30 rounded-t-lg"></div>
              
              {/* Background Logos */}
              <div className="absolute top-2 left-0 w-full flex justify-between px-8 opacity-30 pointer-events-none">
                <div className="flex items-center gap-1 text-white font-bold text-sm">
                  <div className="w-4 h-4 bg-current rounded-full"></div> {activeTab}
                </div>
                <div className="flex items-center gap-1 text-white font-bold text-sm">
                  <div className="w-4 h-4 bg-current rounded-full"></div> {activeTab}
                </div>
              </div>

              {/* Player Rows */}
              <div className="h-full flex flex-col justify-around pt-8 pb-4 px-2">
                {/* GKP */}
                <div className="flex justify-center">
                   {initialSquad.filter(p => p.position === 'GKP' && p.id < 12).map(p => <PlayerCard key={p.id} player={p} mode={activeTab} />)}
                </div>
                {/* DEF */}
                <div className="flex justify-around px-4">
                   {initialSquad.filter(p => p.position === 'DEF' && p.id < 12).map(p => <PlayerCard key={p.id} player={p} mode={activeTab} />)}
                </div>
                {/* MID */}
                <div className="flex justify-around px-8">
                   {initialSquad.filter(p => p.position === 'MID' && p.id < 12).map(p => <PlayerCard key={p.id} player={p} mode={activeTab} />)}
                </div>
                {/* FWD */}
                <div className="flex justify-around px-8">
                   {initialSquad.filter(p => p.position === 'FWD' && p.id < 12).map(p => <PlayerCard key={p.id} player={p} mode={activeTab} />)}
                </div>
              </div>
           </div>
           
           {/* Bench */}
           <div className={`p-4 rounded-b-3xl mx-0.5 -mt-1 relative z-10 border-x border-b border-white/10 ${activeTab === 'Transfers' ? 'bg-gradient-to-b from-slate-900 to-app-bg' : 'bg-gradient-to-b from-emerald-800 to-app-bg'}`}>
              <div className="flex justify-between text-[10px] font-bold text-gray-300 mb-2 px-2 uppercase tracking-wider">
                 <span>GK</span><span>MID</span><span>MID</span><span>DEF</span>
              </div>
              <div className="flex justify-between gap-2">
                 {initialSquad.slice(11).map(p => (
                    <PlayerCard key={p.id} player={p} isBench mode={activeTab} />
                 ))}
              </div>
           </div>
        </div>
      )}

      {viewMode === 'List' && (
        <div className="px-4 space-y-2">
          {initialSquad.map(player => (
            <div key={player.id} className="bg-card-bg p-3 rounded-xl flex justify-between items-center border border-border-base">
               <div className="flex items-center gap-3">
                 <div className={`w-8 h-8 rounded-lg ${player.shirtColor} flex items-center justify-center text-white text-[8px] font-bold shadow-sm`}>
                    {player.team}
                 </div>
                 <div>
                    <p className="text-sm font-bold text-text-main">{player.name}</p>
                    <p className="text-[10px] text-text-muted">{player.position} • {player.opponent}</p>
                 </div>
               </div>
               <div className="text-right">
                  {activeTab === 'Points' && <span className="text-blue-400 font-bold">{player.points} pts</span>}
                  {activeTab === 'Pick Team' && <span className="text-text-muted text-xs">{player.isHome ? 'Home' : 'Away'}</span>}
                  {activeTab === 'Transfers' && <span className="text-green-400 font-bold">{player.price}</span>}
               </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Assist Manager Floating Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 right-4 w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-purple-600 to-pink-500 shadow-2xl shadow-purple-900/50 z-50 hover:scale-110 transition-transform group"
      >
        <div className="w-full h-full rounded-full bg-card-bg overflow-hidden relative border-2 border-transparent">
           <img 
             src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" 
             alt="AI Manager" 
             className="w-full h-full object-cover"
           />
           <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-1">
              <span className="text-[8px] font-bold text-white uppercase">AI Assist</span>
           </div>
        </div>
        {/* Notification dot */}
        <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border border-white z-10 animate-pulse"></div>
      </button>

      {/* AI Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full sm:w-[400px] h-[85vh] sm:h-[650px] bg-card-bg sm:rounded-3xl rounded-t-3xl border border-border-base shadow-2xl flex flex-col relative overflow-hidden animate-slide-up">
             
             {/* Modal Header */}
             <div className="p-4 border-b border-border-base flex justify-between items-center bg-card-bg">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full overflow-hidden border border-border-base">
                      <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover" />
                   </div>
                   <div>
                      <h3 className="text-text-main font-bold">Assistant Manager</h3>
                      <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Gemini AI Active</p>
                   </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 bg-glass rounded-full hover:bg-gray-100/10 text-text-main transition-colors">
                   <X size={20} />
                </button>
             </div>

             {/* Quick Actions Toolbar */}
             <div className="px-4 py-3 bg-app-bg border-b border-border-base flex gap-2 overflow-x-auto scrollbar-hide">
                <button 
                  onClick={handleAnalyzeSquad}
                  disabled={loading}
                  className="flex items-center gap-1.5 bg-purple-600/20 border border-purple-500/50 text-purple-200 text-xs font-bold px-3 py-2 rounded-lg hover:bg-purple-600/40 whitespace-nowrap transition-colors"
                >
                   <Sparkles size={12} /> Analyze Squad
                </button>
                <button 
                  onClick={() => setChatQuery("Who should I captain this week?")}
                  className="flex items-center gap-1.5 bg-blue-600/20 border border-blue-500/50 text-blue-200 text-xs font-bold px-3 py-2 rounded-lg hover:bg-blue-600/40 whitespace-nowrap transition-colors"
                >
                   <Shield size={12} /> Captain Picks
                </button>
                <button 
                  onClick={() => setChatQuery("Any differential picks under 6.0m?")}
                  className="flex items-center gap-1.5 bg-green-600/20 border border-green-500/50 text-green-200 text-xs font-bold px-3 py-2 rounded-lg hover:bg-green-600/40 whitespace-nowrap transition-colors"
                >
                   <TrendingUp size={12} /> Differentials
                </button>
             </div>

             {/* Chat History */}
             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-app-bg">
                {chatHistory.map((msg, idx) => (
                   <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.type === 'report' ? (
                        <div className="max-w-[90%] bg-card-bg border border-border-base rounded-2xl rounded-tl-none overflow-hidden shadow-lg">
                           <div className="bg-gradient-to-r from-purple-700 to-purple-900 p-2 px-3 flex items-center gap-2">
                              <Sparkles size={14} className="text-yellow-300" />
                              <span className="text-xs font-bold text-white uppercase tracking-wide">Transfer Suggestions</span>
                           </div>
                           <div className="p-3 text-sm text-text-main whitespace-pre-wrap leading-relaxed">
                              {msg.text}
                           </div>
                        </div>
                      ) : (
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-glass border border-border-base text-text-main rounded-tl-none'}`}>
                           {msg.text}
                        </div>
                      )}
                   </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                     <div className="bg-glass p-3 rounded-2xl rounded-tl-none text-xs text-text-muted flex items-center gap-2">
                        <Sparkles size={14} className="animate-spin text-purple-500" /> Analyzing data...
                     </div>
                  </div>
                )}
             </div>

             {/* Input Area */}
             <form onSubmit={handleChatSubmit} className="p-4 border-t border-border-base bg-card-bg">
                <div className="relative">
                   <input 
                     type="text" 
                     value={chatQuery}
                     onChange={(e) => setChatQuery(e.target.value)}
                     placeholder="Ask Gemini Manager..."
                     className="w-full bg-input-bg border border-border-base text-text-main rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-teal-500 transition-colors placeholder:text-text-muted"
                   />
                   <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-teal-600 rounded-lg text-white hover:bg-teal-500 transition-colors">
                      <Send size={16} />
                   </button>
                </div>
             </form>

          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component for Chips
const ChipCard: React.FC<{ title: string, status: string, icon: React.ReactNode, color: 'blue' | 'purple', disabled?: boolean }> = ({ title, status, icon, color, disabled }) => {
  const baseColor = color === 'blue' ? 'bg-[#1e3a8a]' : 'bg-[#4c1d95]';
  const borderColor = color === 'blue' ? 'border-blue-500/30' : 'border-purple-500/30';
  const iconBg = color === 'blue' ? 'bg-blue-500' : 'bg-purple-500';

  return (
    <div className={`w-28 rounded-xl p-2.5 border ${borderColor} ${disabled ? 'opacity-60' : ''} ${baseColor} flex flex-col items-center gap-1.5`}>
       <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center text-white shadow-lg mb-1`}>
          {icon}
       </div>
       <span className="text-[10px] font-bold text-white text-center leading-tight h-6 flex items-center">{title}</span>
       <div className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${disabled ? 'bg-black/30 text-gray-400' : 'bg-white/20 text-white'}`}>
          {status}
       </div>
    </div>
  );
};
