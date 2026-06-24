"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/client";

export function DemoControls() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(path: string, label: string) {
    setBusy(true);
    setMsg(`${label}...`);
    try {
      await apiPost(path);
      setMsg(`${label} done.`);
      router.refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          disabled={busy}
          onClick={() => run("/api/dev/setup", "Sync + open demo GW")}
          className="flex-1 rounded-lg border border-border-base bg-card-bg px-3 py-2 text-xs font-medium disabled:opacity-50"
        >
          Sync FPL + open GW
        </button>
        <button
          disabled={busy}
          onClick={() => run("/api/dev/finalize", "Finalize + settle")}
          className="flex-1 rounded-lg border border-brand-pink/40 bg-brand-pink/10 px-3 py-2 text-xs font-medium disabled:opacity-50"
        >
          Finalize + settle GW
        </button>
      </div>
      {msg && <p className="text-xs text-text-muted">{msg}</p>}
    </div>
  );
}
