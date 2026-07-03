"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import TableDetailModal from "@/components/TableDetailModal";
import { useStore } from "@/lib/store";
import { Order, OrderStatus, orderTotal } from "@/lib/types";
import { elapsedLabel, formatRM } from "@/lib/utils";
import StatusBadge, { statusBorderColor } from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";

const STATUS_PRIORITY: OrderStatus[] = ["new", "cooking", "ready", "served"];

function aggregateStatus(orders: Order[]): OrderStatus | null {
  if (orders.length === 0) return null;
  for (const s of STATUS_PRIORITY) {
    if (orders.some((o) => o.status === s)) return s;
  }
  return null;
}

export default function ActiveOrdersPage() {
  const { state } = useStore();
  const router = useRouter();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const openOrders = state.orders.filter((o) => o.status !== "paid" && o.status !== "cancelled");

  const dineIn = state.tables.map((t) => {
    const tableOrders = openOrders.filter((o) => o.tableId === t.id);
    return { table: t, orders: tableOrders, status: aggregateStatus(tableOrders) };
  });

  const tapau = openOrders.filter((o) => o.type === "tapau");

  const selectedTable = selectedTableId
    ? state.tables.find((t) => t.id === selectedTableId)
    : null;

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="text-lg font-extrabold text-ink">Meja</div>
          <div className="flex gap-3.5 text-xs text-muted flex-wrap">
            <Legend color="bg-status-new" label="New" />
            <Legend color="bg-status-cooking" label="Cooking" />
            <Legend color="bg-status-ready" label="Ready" />
            <Legend color="bg-status-served" label="Served" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3.5 mb-8">
          {dineIn.map(({ table, orders, status }) => (
            <button
              key={table.id}
              type="button"
              onClick={() =>
                orders.length > 0
                  ? setSelectedTableId(table.id)
                  : router.push(`/order?table=${table.id}`)
              }
              className={`text-left bg-white border-2 rounded-2xl p-4 min-h-28 flex flex-col justify-between hover:shadow-sm transition ${
                status ? statusBorderColor(status) : "border-border"
              }`}
            >
              {status ? (
                <>
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-extrabold text-ink">{table.name}</span>
                    <StatusBadge status={status} />
                  </div>
                  <div>
                    <div className="text-[13px] text-muted mt-2">
                      {orders.length} order
                    </div>
                    <div className="text-[15px] font-extrabold text-ink tab-nums mt-0.5">
                      {formatRM(orders.reduce((s, o) => s + orderTotal(o), 0))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm font-extrabold text-ink mb-2">{table.name}</div>
                  <div className="text-[11px] text-faint">Kosong</div>
                </>
              )}
            </button>
          ))}
        </div>

        <div className="text-base font-extrabold text-ink mb-3">Tapau</div>
        <div className="flex flex-col gap-2">
          {tapau.length === 0 && <EmptyState message="Tiada order tapau aktif" />}
          {tapau.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => router.push(`/order?orderId=${o.id}`)}
              className="bg-white border border-border rounded-xl px-4 py-3 sm:px-5 sm:py-3.5 hover:border-chili transition w-full text-left"
            >
              {/* Mobile layout */}
              <div className="sm:hidden flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13.5px] font-bold text-ink truncate">
                    {o.customerName} {o.customerPhone ? `· ${o.customerPhone}` : ""}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13.5px] font-extrabold text-ink tab-nums">{formatRM(orderTotal(o))}</span>
                  <span className="text-[11.5px] text-muted">{elapsedLabel(o.createdAt)}</span>
                </div>
              </div>
              {/* Desktop layout */}
              <div className="hidden sm:grid sm:grid-cols-4 sm:items-center gap-2">
                <span className="text-[13.5px] font-bold text-ink">
                  {o.customerName} {o.customerPhone ? `· ${o.customerPhone}` : ""}
                </span>
                <span><StatusBadge status={o.status} /></span>
                <span className="text-[13.5px] font-extrabold text-ink tab-nums">{formatRM(orderTotal(o))}</span>
                <span className="text-[11.5px] text-muted">{elapsedLabel(o.createdAt)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedTableId && selectedTable && (
        <TableDetailModal
          tableId={selectedTableId}
          tableName={selectedTable.name}
          onClose={() => setSelectedTableId(null)}
        />
      )}
    </AppShell>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2.5 h-2.5 rounded-full inline-block ${color}`} />
      {label}
    </span>
  );
}
