"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!state.isHydrated) return;
    if (!currentUser) {
      router.replace("/login");
      return;
    }
    if (pathname.startsWith("/admin") && currentUser.role !== "admin") {
      router.replace("/order");
    }
  }, [state.isHydrated, currentUser, pathname, router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (!state.isHydrated || !currentUser) return null;

  const nav = currentUser.role === "admin" ? [...staffNav, ...adminNav] : staffNav;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <header className="bg-white border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 gap-3">
          {/* Logo + Name */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-chili flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0">
              {settings.restaurantName
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="font-extrabold text-ink text-[14px] hidden sm:block">{settings.restaurantName}</div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {nav.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-3 py-2 rounded-lg text-[12.5px] font-bold transition-colors whitespace-nowrap ${
                    active ? "bg-chili text-white" : "text-ink-soft hover:bg-muted-bg"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => dispatch({ type: "SET_ONLINE", online: !isOnline })}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] font-bold border ${
                isOnline
                  ? "border-border text-muted bg-white"
                  : "border-status-cooking bg-status-cooking-bg text-status-cooking-dark"
              }`}
              title="Simulate connectivity (demo control)"
            >
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? "bg-status-ready" : "bg-status-cooking pulse"}`} />
              <span className="hidden sm:inline">{isOnline ? "Online" : "Offline"}</span>
            </button>
            <div className="hidden md:block text-xs text-muted font-semibold whitespace-nowrap">
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
            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden w-9 h-9 rounded-lg bg-muted-bg flex items-center justify-center text-ink font-bold text-base"
              aria-label="Toggle menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-white px-4 py-3 flex flex-col gap-1">
            {nav.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-4 py-3 rounded-lg text-[13.5px] font-bold transition-colors ${
                    active ? "bg-chili text-white" : "text-ink hover:bg-muted-bg"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
            <div className="mt-2 pt-2 border-t border-border-light text-xs text-muted font-semibold px-1">
              {currentUser.name} · {currentUser.role === "admin" ? "Admin" : "Staff"}
            </div>
          </div>
        )}
      </header>
      <main className="flex-1 flex flex-col min-h-0">{children}</main>
    </div>
  );
}
