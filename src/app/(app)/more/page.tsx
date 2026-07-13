"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFarm } from "@/components/FarmContext";
import { Card, PageHeader } from "@/components/ui";

const ITEMS = [
  { href: "/farms", icon: "🚜", label: "Farms & areas", desc: "Locations, blocks, tunnels, team" },
  { href: "/harvests", icon: "✂️", label: "Harvests", desc: "Harvest records and yields" },
  { href: "/inventory", icon: "📦", label: "Inventory", desc: "Lots, processing, storage, packaging" },
  { href: "/compliance", icon: "🛡️", label: "Compliance", desc: "SAHPRA records, inspections, destruction" },
  { href: "/documents", icon: "📄", label: "Documents", desc: "Licences, SOPs, certificates" },
  { href: "/reports", icon: "📊", label: "Reports & exports", desc: "PDF and Excel reports" },
  { href: "/audit", icon: "🔍", label: "Audit trail", desc: "Who did what, when" },
  { href: "/billing", icon: "💳", label: "Billing", desc: "Subscription — R1,500/month" },
  { href: "/help", icon: "❓", label: "How it works", desc: "Step-by-step guide and welcome tour" },
];

export default function MorePage() {
  const router = useRouter();
  const { user } = useFarm();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div>
      <PageHeader title="More" subtitle={user ? `Signed in as ${user.name}` : undefined} />
      <div className="space-y-2.5">
        {user?.isAdmin && (
          <Link href="/admin" className="block">
            <Card className="flex items-center gap-3.5 border border-brand-200 p-3.5 active:scale-[0.99] transition-transform">
              <span className="text-2xl">🛠️</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Admin</p>
                <p className="text-xs text-gray-400">Registrations, billing status, contacts</p>
              </div>
              <span className="text-gray-300">›</span>
            </Card>
          </Link>
        )}
        {ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="block">
            <Card className="flex items-center gap-3.5 p-3.5 active:scale-[0.99] transition-transform">
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <span className="text-gray-300">›</span>
            </Card>
          </Link>
        ))}
        <button onClick={logout} className="mt-4 w-full rounded-2xl border border-red-100 bg-white py-3.5 font-semibold text-red-600 active:bg-red-50">
          Sign out
        </button>
      </div>
    </div>
  );
}
