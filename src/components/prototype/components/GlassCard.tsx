"use client";

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', gradient = false }) => {
  // Revert to rounded corners, soft borders, and backdrop blur
  const baseStyle = "relative overflow-hidden p-5 rounded-2xl border border-border-base backdrop-blur-md shadow-glass transition-all duration-300";
  
  const bgStyle = gradient 
    ? "bg-gradient-to-br from-white/10 to-white/5" 
    : "bg-card-bg/50";

  return (
    <div className={`${baseStyle} ${bgStyle} ${className}`}>
      {children}
    </div>
  );
};
