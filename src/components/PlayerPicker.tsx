"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/client";

interface PlayerLite {
  id: number;
  name: string;
  team: string;
  position: string;
  totalPoints: number;
}

export function PlayerPicker({
  max,
  selected,
  onChange,
}: {
  max: number;
  selected: number[];
  onChange: (ids: number[]) => void;
}) {
  const [players, setPlayers] = useState<PlayerLite[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    apiGet<{ players: PlayerLite[] }>(`/api/players?take=60${q ? `&q=${encodeURIComponent(q)}` : ""}`)
      .then((d) => setPlayers(d.players))
      .catch(() => setPlayers([]));
  }, [q]);

  function toggle(id: number) {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else if (selected.length < max) onChange([...selected, id]);
  }

  return (
    <div>
      <input
        className="w-full rounded-lg bg-card-bg border border-border-base px-3 py-2 text-sm mb-2 outline-none focus:border-brand-purple"
        placeholder="Search players..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <p className="text-xs text-text-muted mb-2">
        Selected {selected.length}/{max}
      </p>
      <div className="max-h-56 overflow-y-auto space-y-1">
        {players.map((p) => {
          const on = selected.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm border ${
                on ? "border-brand-purple bg-brand-purple/10" : "border-border-base bg-card-bg/40"
              }`}
            >
              <span>
                <span className="font-medium">{p.name}</span>{" "}
                <span className="text-text-muted text-xs">
                  {p.team} · {p.position}
                </span>
              </span>
              <span className="text-text-muted text-xs">{p.totalPoints} pts</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
