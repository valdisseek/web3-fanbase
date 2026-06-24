"use client";

import React from 'react';
import { ChevronRight, ArrowUpRight, Moon, Sun } from 'lucide-react';

interface MoreViewProps {
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

interface MenuItemProps {
  label: string;
  hasExternalIcon?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, hasExternalIcon }) => (
  <div className="flex items-center justify-between py-4 border-b border-border-base cursor-pointer group active:bg-glass -mx-4 px-4 transition-colors">
    <span className="text-base font-bold text-text-main group-hover:text-brand-pink transition-colors">{label}</span>
    {hasExternalIcon ? (
      <ArrowUpRight size={20} className="text-text-main group-hover:text-brand-pink transition-colors" />
    ) : (
      <ChevronRight size={20} className="text-brand-pink" />
    )}
  </div>
);

export const MoreView: React.FC<MoreViewProps> = ({ isDarkMode, toggleTheme }) => {
  const menuItems = [
    { label: "myPL Settings" },
    { label: "Clubs" },
    { label: "Players" },
    { label: "Statistics" },
    { label: "News" },
    { label: "Video & Audio" },
    { label: "Watch Live" },
    { label: "Shop" },
    { label: "Transfers" },
    { label: "Injuries" },
    { label: "Awards", hasExternalIcon: true },
  ];

  return (
    <div className="min-h-screen bg-app-bg pb-32 font-sans text-text-main animate-fade-in px-4 pt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-main tracking-tight">More</h1>
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="flex items-center gap-2 bg-card-bg border border-border-base px-4 py-2 rounded-full shadow-sm hover:border-brand-purple transition-colors"
        >
           {isDarkMode ? (
             <>
               <Moon size={18} className="text-brand-purple" />
               <span className="text-xs font-bold text-text-main">Dark</span>
             </>
           ) : (
             <>
               <Sun size={18} className="text-yellow-500" />
               <span className="text-xs font-bold text-text-main">Light</span>
             </>
           )}
        </button>
      </div>
      
      <div className="flex flex-col">
        {menuItems.map((item, index) => (
          <MenuItem 
            key={index} 
            label={item.label} 
            hasExternalIcon={item.hasExternalIcon} 
          />
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-border-base text-center">
        <p className="text-xs text-text-muted mb-2">Version 5.2.0</p>
        <div className="flex justify-center gap-4 text-xs font-medium text-brand-pink">
           <span>Terms & Conditions</span>
           <span>Privacy Policy</span>
           <span>Cookie Policy</span>
        </div>
      </div>
    </div>
  );
};
