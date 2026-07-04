"use client";

import { useMemo } from "react";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { CancelledItem, Order, lineTotal, orderTotal } from "@/lib/types";
import { formatRM } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatTime(ms: number): string {
  return new Date(ms).toLocaleTimeString("ms-MY", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function cancelledValue(items: CancelledItem[]): number {
  return items.reduce((s, ci) => {
    const modTotal = ci.modifiers.reduce((a, m) => a + m.priceDelta, 0);
    return s + (ci.basePrice + modTotal) * ci.quantity;
  }, 0);
}

function consolidateItems(orders: Order[]): string {
  const map = new Map<string, number>();
  for (const o of orders) {
    for (const it of o.items) {
      map.set(it.name, (map.get(it.name) ?? 0) + it.quantity);
    }
  }
  return Array.from(map.entries())
    .map(([name, qty]) => `${name} x${qty}`)
    .join(", ");
}

interface TxRow {
  paidAt: number;
  label: string;
  type: string;
  items: string;
  cancelled: number;
  subtotal: number;
  tax: number;
  total: number;
  method: string;
  change: number | null;
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function AdminSummaryPage() {
  const { state } = useStore();

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const stats = useMemo(() => {
    const orders = state.orders;
    const totalSales = orders.filter((o) => o.status === "paid").reduce((s, o) => s + orderTotal(o), 0);
    const dineIn = orders.filter((o) => o.type === "dine-in" && o.status === "paid").length;
    const tapau = orders.filter((o) => o.type === "tapau" && o.status === "paid").length;

    const qtyByItem = new Map<string, number>();
    for (const o of orders.filter((o) => o.status === "paid")) {
      for (const it of o.items) {
        qtyByItem.set(it.name, (qtyByItem.get(it.name) ?? 0) + it.quantity);
      }
    }
    const topItems = Array.from(qtyByItem.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const maxQty = topItems[0]?.[1] ?? 1;

    return { totalSales, orderCount: orders.filter((o) => o.status === "paid").length, dineIn, tapau, topItems, maxQty };
  }, [state.orders]);

  const transactions = useMemo<TxRow[]>(() => {
    const todayPaid = state.orders.filter(
      (o) => o.status === "paid" && o.updatedAt >= todayStart
    );

    // Group by paymentBatchId
    const groups = new Map<string, Order[]>();
    for (const o of todayPaid) {
      const key = o.paymentBatchId ?? o.id;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(o);
    }

    return Array.from(groups.values())
      .map((orders) => {
        const first = orders[0];
        const paidAt = Math.max(...orders.map((o) => o.updatedAt));
        const tableName = state.tables.find((t) => t.id === first.tableId)?.name ?? first.tableId ?? "Meja";
        const label = tableName;

        const subtotal = orders.reduce(
          (s, o) => s + o.items.reduce((a, it) => a + lineTotal(it), 0),
          0
        );
        const tax = state.settings.taxServiceEnabled
          ? subtotal * (state.settings.taxServicePercent / 100)
          : 0;
        const total = subtotal + tax;

        const allCancelled = orders.flatMap((o) => o.cancelledItems ?? []);
        const cancelled = cancelledValue(allCancelled);

        const method = first.paymentMethod === "qr" ? "QR" : "Cash";
        const received = first.amountReceived;
        const change = received !== undefined ? received - total : null;

        return {
          paidAt,
          label,
          type: orders.every((o) => o.type === "tapau") ? "Tapau" : orders.some((o) => o.type === "tapau") ? "Dine-in + Tapau" : "Dine-in",
          items: consolidateItems(orders),
          cancelled,
          subtotal,
          tax,
          total,
          method,
          change,
        };
      })
      .sort((a, b) => a.paidAt - b.paidAt);
  }, [state.orders, state.tables, state.settings, todayStart]);

  function exportCSV() {
    const headers = ["Masa", "Meja/Pelanggan", "Type", "Items", "Cancelled (RM)", "Subtotal", "Tax", "Total", "Method", "Baki"];
    const rows = transactions.map((t) => [
      formatTime(t.paidAt),
      t.label,
      t.type,
      t.items,
      t.cancelled.toFixed(2),
      t.subtotal.toFixed(2),
      t.tax.toFixed(2),
      t.total.toFixed(2),
      t.method,
      t.change !== null ? t.change.toFixed(2) : "-",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const today = new Date().toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" });

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
        <div className="text-lg font-extrabold text-ink mb-1">Ringkasan Hari Ini</div>
        <div className="text-xs text-muted mb-5.5" style={{ marginBottom: 22 }}>
          {today}
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
          <StatCard label="Jumlah Jualan" value={formatRM(stats.totalSales)} color="text-chili-dark" />
          <StatCard label="Bilangan Order" value={String(stats.orderCount)} color="text-ink" />
          <StatCard label="Dine-in" value={String(stats.dineIn)} color="text-status-served" />
          <StatCard label="Tapau" value={String(stats.tapau)} color="text-status-ready" />
        </div>

        {/* Top items */}
        <div className="bg-white border border-border rounded-2xl p-5.5 mb-5" style={{ padding: 22 }}>
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

        {/* Daily transaction breakdown */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="text-sm font-extrabold text-ink">Transaksi Hari Ini</div>
            <button
              type="button"
              onClick={exportCSV}
              disabled={transactions.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-bold bg-muted-bg text-ink-soft hover:bg-border disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              ↓ Export CSV
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="px-5 py-10">
              <EmptyState message="Tiada transaksi hari ini" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px] min-w-[760px]">
                <thead>
                  <tr className="bg-muted-bg text-[11px] font-extrabold text-muted uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Masa</th>
                    <th className="px-4 py-3 text-left">Meja/Pelanggan</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Items</th>
                    <th className="px-4 py-3 text-right">Cancelled</th>
                    <th className="px-4 py-3 text-right">Subtotal</th>
                    <th className="px-4 py-3 text-right">Tax</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-left">Method</th>
                    <th className="px-4 py-3 text-right">Baki</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                  {transactions.map((t, idx) => (
                    <tr key={idx} className="hover:bg-muted-bg/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-ink tab-nums whitespace-nowrap">{formatTime(t.paidAt)}</td>
                      <td className="px-4 py-3 font-bold text-ink whitespace-nowrap">{t.label}</td>
                      <td className="px-4 py-3 text-ink-soft whitespace-nowrap">{t.type}</td>
                      <td className="px-4 py-3 text-ink-soft max-w-[200px] truncate" title={t.items}>{t.items}</td>
                      <td className="px-4 py-3 text-right tab-nums whitespace-nowrap">
                        {t.cancelled > 0 ? (
                          <span className="text-status-late font-bold">{formatRM(t.cancelled)}</span>
                        ) : (
                          <span className="text-faint">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-ink-soft tab-nums whitespace-nowrap">{formatRM(t.subtotal)}</td>
                      <td className="px-4 py-3 text-right text-ink-soft tab-nums whitespace-nowrap">
                        {t.tax > 0 ? formatRM(t.tax) : <span className="text-faint">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-ink tab-nums whitespace-nowrap">{formatRM(t.total)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-[11px] font-extrabold px-2 py-1 rounded-md ${
                          t.method === "QR" ? "bg-[#E1EBFA] text-status-served" : "bg-status-ready-bg text-status-ready-text"
                        }`}>
                          {t.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tab-nums whitespace-nowrap">
                        {t.change !== null ? (
                          <span className="text-ink-soft">{formatRM(t.change)}</span>
                        ) : (
                          <span className="text-faint">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted-bg border-t-2 border-border">
                    <td colSpan={7} className="px-4 py-3 text-[11.5px] font-extrabold text-ink-soft uppercase tracking-wide">
                      Jumlah ({transactions.length} transaksi)
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-chili-dark tab-nums whitespace-nowrap">
                      {formatRM(transactions.reduce((s, t) => s + t.total, 0))}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
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
