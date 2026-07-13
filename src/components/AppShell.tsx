"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { FarmProvider, useFarm } from "./FarmContext";
import { Onboarding } from "./Onboarding";
import { cn } from "./ui";

const NAV = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/batches", label: "Batches", icon: "🌿" },
  { href: "/log", label: "Log", icon: "＋", fab: true },
  { href: "/tasks", label: "Tasks", icon: "✅" },
  { href: "/more", label: "More", icon: "☰" },
];

const SIDEBAR_MAIN = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/batches", label: "Batches", icon: "🌿" },
  { href: "/tasks", label: "Tasks", icon: "✅" },
];

const SIDEBAR_MANAGE = [
  { href: "/farms", label: "Farms & areas", icon: "🚜" },
  { href: "/harvests", label: "Harvests", icon: "✂️" },
  { href: "/inventory", label: "Inventory", icon: "📦" },
  { href: "/compliance", label: "Compliance", icon: "🛡️" },
  { href: "/documents", label: "Documents", icon: "📄" },
  { href: "/reports", label: "Reports", icon: "📊" },
  { href: "/audit", label: "Audit trail", icon: "🔍" },
  { href: "/billing", label: "Billing", icon: "💳" },
  { href: "/help", label: "How it works", icon: "❓" },
];

function SidebarLink({ href, label, icon }: { href: string; label: string; icon: string }) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active ? "bg-brand-50 text-brand-800" : "text-gray-600 hover:bg-gray-50"
      )}
    >
      <span className="text-lg leading-none">{icon}</span>
      {label}
    </Link>
  );
}

/** Desktop-only left sidebar (≥ lg). Mobile/tablet keep the bottom nav. */
function Sidebar() {
  const { user } = useFarm();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-gray-100 bg-white lg:flex">
      <div className="flex h-14 items-center gap-2 border-b border-gray-100 px-5 font-bold text-brand-800">
        <span className="text-xl">🌱</span>
        KhulaGrow
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {SIDEBAR_MAIN.map((item) => (
          <SidebarLink key={item.href} {...item} />
        ))}

        <Link
          href="/log"
          className="mt-2 mb-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 text-sm font-semibold text-white shadow-sm shadow-brand-700/20 transition-colors hover:bg-brand-800"
        >
          ＋ Quick log
        </Link>

        <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-gray-400">
          Manage
        </p>
        {SIDEBAR_MANAGE.map((item) => (
          <SidebarLink key={item.href} {...item} />
        ))}

        {user?.isAdmin && (
          <>
            <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide text-gray-400">
              Platform
            </p>
            <SidebarLink href="/admin" label="Admin" icon="🛠️" />
          </>
        )}
      </nav>

      <div className="border-t border-gray-100 p-3">
        {user && (
          <p className="truncate px-3 pb-2 text-xs text-gray-400">{user.name}</p>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <span className="text-lg leading-none">↩</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}

function Header() {
  const { farm, farms, setFarmId, online, pending, billing } = useFarm();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-4 lg:max-w-4xl">
        <div className="flex items-center gap-2 font-bold text-brand-800 lg:hidden">
          <span className="text-xl">🌱</span>
          <span className="hidden sm:inline">KhulaGrow</span>
        </div>
        <div className="hidden lg:block" aria-hidden />
        <div className="flex items-center gap-2">
          {billing?.status === "TRIALING" && (
            <Link
              href="/billing"
              className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-800"
            >
              Trial · {billing.daysLeft}d left
            </Link>
          )}
          {!online && (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
              Offline{pending > 0 ? ` · ${pending} queued` : ""}
            </span>
          )}
          {online && pending > 0 && (
            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
              Syncing {pending}…
            </span>
          )}
          {farms.length > 0 ? (
            <select
              value={farm?.id ?? ""}
              onChange={(e) => setFarmId(e.target.value)}
              className="h-9 max-w-[180px] truncate rounded-lg border border-gray-200 bg-white px-2 text-sm font-medium lg:max-w-[260px]"
              aria-label="Select farm"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => router.push("/farms/new")}
              className="h-9 rounded-lg bg-brand-700 px-3 text-sm font-semibold text-white"
            >
              + Add farm
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white pb-safe lg:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-5">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          if (item.fab) {
            return (
              <Link key={item.href} href={item.href} className="flex items-center justify-center py-1.5" aria-label="Quick log">
                <span className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-full bg-brand-700 text-2xl font-bold text-white shadow-lg shadow-brand-700/30">
                  {item.icon}
                </span>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium",
                active ? "text-brand-700" : "text-gray-400"
              )}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Hard-gates the app UI to /billing once trial + subscription have lapsed. */
function SubscriptionGate({ children }: { children: ReactNode }) {
  const { billing, loading } = useFarm();
  const pathname = usePathname();
  const router = useRouter();

  const locked = !loading && billing !== null && !billing.active;

  useEffect(() => {
    if (locked && !pathname.startsWith("/billing")) {
      router.replace("/billing");
    }
  }, [locked, pathname, router]);

  if (locked && !pathname.startsWith("/billing")) return null;
  return <>{children}</>;
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <FarmProvider>
      <div className="min-h-dvh">
        <Sidebar />
        <div className="lg:pl-64">
          <Header />
          <main className="mx-auto max-w-3xl px-4 pb-28 pt-4 lg:max-w-4xl lg:pb-10">
            <SubscriptionGate>{children}</SubscriptionGate>
            <Onboarding />
          </main>
        </div>
        <BottomNav />
      </div>
    </FarmProvider>
  );
}
