import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-[#f6f7f4]">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <p className="font-display flex items-center gap-2 font-semibold tracking-tight text-brand-800">
            <span>🌱</span> KhulaGrow <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-bold text-brand-800">Admin</span>
          </p>
          <nav aria-label="Admin" className="flex items-center gap-5 text-sm font-semibold">
            <Link href="/admin" className="text-gray-500 hover:text-brand-800">Registrations</Link>
            <Link href="/admin/measurement" className="text-gray-500 hover:text-brand-800">Measurement</Link>
            <Link href="/dashboard" className="text-brand-700 hover:text-brand-800">Open app →</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
