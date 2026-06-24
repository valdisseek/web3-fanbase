import React from "react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

/** Ported from the prototype: soft border, blur, rounded card. */
export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`relative overflow-hidden p-5 rounded-2xl border border-border-base bg-card-bg/50 backdrop-blur-md shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}
