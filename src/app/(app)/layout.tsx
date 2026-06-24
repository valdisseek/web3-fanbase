import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { BalancePill } from "@/components/shell/BalancePill";
import { BottomNav } from "@/components/shell/BottomNav";
import { LogoutButton } from "@/components/shell/LogoutButton";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col border-x border-border-base bg-app-bg">
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-nav-bg backdrop-blur-xl border-b border-border-base">
        <Link href="/lobby" className="font-extrabold text-lg">
          Fan<span className="text-brand-purple">base</span>
        </Link>
        <div className="flex items-center gap-3">
          <BalancePill />
          <span className="text-sm text-text-muted hidden sm:inline">{session.displayName}</span>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 pb-24 px-4 pt-4 animate-fade-in">{children}</main>
      <BottomNav />
    </div>
  );
}
