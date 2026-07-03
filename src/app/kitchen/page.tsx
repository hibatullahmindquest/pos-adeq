"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Order } from "@/lib/types";
import { elapsedClock, waitTier } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";

function tierStyles(tier: "fresh" | "amber" | "red") {
  if (tier === "red")
    return {
      border: "border-status-late",
      timer: "text-status-late pulse",
      btnBg: "bg-status-late",
      btnText: "text-white",
    };
  if (tier === "amber")
    return {
      border: "border-status-cooking",
      timer: "text-status-cooking",
      btnBg: "bg-status-cooking",
      btnText: "text-kds-bg",
    };
  return {
    border: "border-kds-border",
    timer: "text-kds-muted",
    btnBg: "bg-kds-accent",
    btnText: "text-kds-bg",
  };
}

function Ticket({ order, fading }: { order: Order; fading: boolean }) {
  const { state, dispatch } = useStore();
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const tableName = state.tables.find((t) => t.id === order.tableId)?.name ?? order.tableId;
  const label = order.type === "dine-in" ? tableName : `Tapau · ${order.customerName}`;

  if (fading) {
    return (
      <div className="bg-kds-card border-2 border-kds-border rounded-2xl p-4 opacity-45">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[15px] font-extrabold text-kds-text">{label}</span>
          <span className="text-[11px] font-extrabold text-status-ready">✓ READY</span>
        </div>
        <div className="text-xs text-kds-muted">Bergerak keluar papan…</div>
      </div>
    );
  }

  const tier = waitTier(order.createdAt);
  const s = tierStyles(tier);

  return (
    <div className={`bg-kds-card border-2 rounded-2xl p-4 ${s.border}`}>
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[15px] font-extrabold text-kds-text">{label}</span>
        <span className={`text-xs font-extrabold tab-nums ${s.timer}`}>{elapsedClock(order.createdAt)}</span>
      </div>
      {order.offlineLate && (
        <div className="inline-flex items-center gap-1.5 bg-kds-late-bg rounded-md px-2 py-1 mb-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-kds-accent inline-block" />
          <span className="text-[10.5px] font-extrabold text-kds-late-text">Dihantar lewat (offline)</span>
        </div>
      )}
      <div className="h-px bg-kds-border mb-2.5" />
      <div className="flex flex-col gap-2.5 mb-1">
        {order.items.map((it) => (
          <div key={it.id}>
            <div className="text-[13.5px] font-bold text-kds-text">
              {it.quantity}× {it.name}
            </div>
            {it.modifiers.length > 0 ? (
              <div className="text-xs font-bold text-kds-accent mt-0.5">
                {it.modifiers.map((m) => m.optionName).join(" · ")}
              </div>
            ) : (
              <div className="text-xs text-kds-muted">Tiada nota</div>
            )}
            {it.note && (
              <div className="bg-kds-late-bg rounded-lg px-2.5 py-2 mt-1.5">
                <div className="text-[11px] font-bold text-kds-late-text">Nota: {it.note}</div>
              </div>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() =>
          dispatch({
            type: "SET_ORDER_STATUS",
            orderId: order.id,
            status: order.status === "new" ? "cooking" : "ready",
          })
        }
        className={`mt-3.5 w-full text-center py-2.5 rounded-lg text-[13px] font-extrabold ${s.btnBg} ${s.btnText}`}
      >
        {order.status === "new" ? "Mula Masak" : "Siap"}
      </button>
    </div>
  );
}

export default function KitchenPage() {
  const { state, dispatch } = useStore();
  const active = state.orders
    .filter((o) => o.status === "new" || o.status === "cooking")
    .sort((a, b) => a.createdAt - b.createdAt);
  const fading = state.orders.filter((o) => o.status === "ready");

  useEffect(() => {
    const timers = fading.map((o) =>
      setTimeout(() => dispatch({ type: "SET_ORDER_STATUS", orderId: o.id, status: "served" }), 2400)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fading.map((o) => o.id).join(",")]);

  return (
    <AppShell>
      <div className="flex-1 bg-kds-bg overflow-y-auto p-4 sm:p-6 lg:p-7">
        <div className="flex justify-between items-center mb-5">
          <div className="text-lg font-extrabold text-kds-text">Kitchen · {active.length} order aktif</div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-kds-accent pulse inline-block" />
            <span className="text-xs font-semibold text-kds-muted">
              Realtime · {state.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        {active.length === 0 && fading.length === 0 ? (
          <div className="text-kds-muted">
            <EmptyState message="Tiada order aktif — semua ticket sudah siap." />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {active.map((o) => (
              <Ticket key={o.id} order={o} fading={false} />
            ))}
            {fading.map((o) => (
              <Ticket key={o.id} order={o} fading={true} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
