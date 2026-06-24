"use client";

import { useState } from "react";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function PlayerHeadshot({
  code,
  name,
  size = 92,
}: {
  code: number | null;
  name: string;
  size?: number;
}) {
  const [errored, setErrored] = useState(false);
  const showPhoto = code != null && !errored;

  if (showPhoto) {
    return (
      <img
        src={`https://resources.premierleague.com/premierleague/photos/players/250x250/p${code}.png`}
        alt={name}
        onError={() => setErrored(true)}
        style={{ height: size }}
        className="w-full object-contain object-bottom"
      />
    );
  }

  return (
    <div
      style={{ height: size }}
      aria-label={name}
      className="flex items-center justify-center text-2xl font-bold text-brand-blue"
    >
      {initials(name)}
    </div>
  );
}
