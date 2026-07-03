"use client";

import { useMemo } from "react";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { orderTotal } from "@/lib/types";
import { formatRM } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";

export default function AdminSummaryPage() {
  const { state } = useStore();

  const stats = useMemo(() => {
    const orders = state.orders;
    const totalSales = orders.reduce((s, o) => s + orderTotal(o), 0);
    const dineIn = orders.filter((o) => o.type === "dine-in").length;
    const tapau = orders.filter((o) => o.type === "tapau").length;

    const qtyByItem = new Map<string, number>();
    for (const o of orders) {
      for (const it of o.items) {
        qtyByItem.set(it.name, (qtyByItem.get(it.name) ?? 0) + it.quantity);
      }
    }
    const topItems = Array.from(qtyByItem.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const maxQty = topItems[0]?.[1] ?? 1;

    return { totalSales, orderCount: orders.length, dineIn, tapau, topItems, maxQty };
  }, [state.orders]);

  const today = new Date().toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" });

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 max-w-6xl w-full mx-auto">
        <div className="text-lg font-extrabold text-ink mb-1">Ringkasan Hari Ini</div>
        <div className="text-xs text-muted mb-5.5" style={{ marginBottom: 22 }}>
          {today}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
          <StatCard label="Jumlah Jualan" value={formatRM(stats.totalSales)} color="text-chili-dark" />
          <StatCard label="Bilangan Order" value={String(stats.orderCount)} color="text-ink" />
          <StatCard label="Dine-in" value={String(stats.dineIn)} color="text-status-served" />
          <StatCard label="Tapau" value={String(stats.tapau)} color="text-status-ready" />
        </div>

        <div className="bg-white border border-border rounded-2xl p-5.5" style={{ padding: 22 }}>
          <div className="text-sm font-extrabold text-ink mb-4">Item Terlaris</div>
          {stats.topItems.length === 0 ? (
            <EmptyState message="Tiada jualan direkodkan lagi" />
          ) : (
            <div className="flex flex-col gap-3">
              {stats.topItems.map(([name, qty]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-[13px] font-bold text-ink w-42 shrink-0" style={{ width: 170 }}>
                    {name}
                  </span>
                  <div className="flex-1 h-2.5 bg-border-light rounded-full">
                    <div
                      className="h-full bg-chili rounded-full"
                      style={{ width: `${Math.max(6, (qty / stats.maxQty) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-muted w-9 text-right tab-nums">{qty}×</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <div className="text-[11.5px] font-bold text-muted mb-2">{label}</div>
      <div className={`text-2xl font-extrabold tab-nums ${color}`}>{value}</div>
    </div>
  );
}
