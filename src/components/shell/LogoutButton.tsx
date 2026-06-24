"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { apiPost } from "@/lib/client";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await apiPost("/api/auth/logout");
    router.push("/login");
    router.refresh();
  }
  return (
    <button onClick={logout} className="text-text-muted hover:text-text-main" title="Log out">
      <LogOut size={18} />
    </button>
  );
}
