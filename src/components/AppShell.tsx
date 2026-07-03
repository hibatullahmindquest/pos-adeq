"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

const staffNav = [
  { href: "/order", label: "Order Taking" },
  { href: "/orders", label: "Meja & Tapau" },
  { href: "/kitchen", label: "Kitchen" },
];

const adminNav = [
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/modifiers", label: "Modifier" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/summary", label: "Ringkasan" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isOnline, settings } = state;

  useEffect(() => {
    if (!state.isHydrated) return; // wait for the persisted session to load first
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    if (pathname.startsWith("/admin") && currentUser.role !== "admin") {
      router.replace("/order");
    }
  }, [state.isHydrated, currentUser, pathname, router]);

  if (!state.isHydrated || !currentUser) return null;

  const nav = currentUser.role === "admin" ? [...staffNav, ...adminNav] : staffNav;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header className="bg-white border-b border-border">
        <div className="flex items-center justify-between px-6 py-3 gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-chili flex items-center justify-center text-white font-extrabold text-sm">
              {settings.restaurantName
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="font-extrabold text-ink text-[15px]">{settings.restaurantName}</div>
          </div>
          <nav className="flex items-center gap-1 flex-wrap">
            {nav.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-3.5 py-2 rounded-lg text-[13px] font-bold transition-colors ${
                    active ? "bg-chili text-white" : "text-ink-soft hover:bg-muted-bg"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_ONLINE", online: !isOnline })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border ${
                isOnline
                  ? "border-border text-muted bg-white"
                  : "border-status-cooking bg-status-cooking-bg text-status-cooking-dark"
              }`}
              title="Simulate connectivity (demo control)"
            >
              <span
                className={`w-2 h-2 rounded-full ${isOnline ? "bg-status-ready" : "bg-status-cooking pulse"}`}
              />
              {isOnline ? "Online" : "Offline"}
            </button>
            <div className="text-xs text-muted font-semibold">
              {currentUser.name} · {currentUser.role === "admin" ? "Admin" : "Staff"}
            </div>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: "LOGOUT" });
                router.replace("/login");
              }}
              className="w-9 h-9 rounded-full bg-muted-bg-2 flex items-center justify-center text-ink-soft text-xs font-bold hover:bg-border"
              title="Log keluar"
            >
              ⏻
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col min-h-0">{children}</main>
    </div>
  );
}
