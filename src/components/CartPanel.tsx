"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { lineTotal } from "@/lib/types";
import { formatRM } from "@/lib/utils";
import Button from "@/components/ui/Button";
import QuantityStepper from "@/components/ui/QuantityStepper";
import EmptyState from "@/components/ui/EmptyState";

export default function CartPanel({ onSent }: { onSent?: () => void }) {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const { cart, isOnline, pendingOrders } = state;
  const [sending, setSending] = useState(false);

  const total = cart.items.reduce((s, it) => s + lineTotal(it), 0);

  function send() {
    if (cart.items.length === 0 || sending) return;
    setSending(true);
    setTimeout(() => {
      dispatch({ type: "SEND_ORDER" });
      setSending(false);
      onSent?.();
    }, 550);
  }

  function pay() {
    if (!cart.orderId) return;
    router.push(`/checkout?orderId=${cart.orderId}`);
  }

  const queuedCount = pendingOrders.length;

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-4.5 pt-4.5 pb-3 border-b border-border" style={{ paddingLeft: 18, paddingRight: 18, paddingTop: 18 }}>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-muted font-semibold">Meja</span>
          <select
            value={cart.tableId ?? ""}
            onChange={(e) => dispatch({ type: "SET_CART_TABLE", tableId: e.target.value })}
            className="text-[15px] font-extrabold text-ink bg-cream px-3.5 py-1.5 rounded-lg border-none"
          >
            <option value="" disabled>
              Pilih meja
            </option>
            {state.tables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!isOnline && (
        <div className="bg-status-cooking-bg border-b border-[#F0DFA0] px-4 py-2.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-status-cooking-dark pulse inline-block" />
          <span className="text-xs font-bold text-status-cooking-dark">
            Tiada internet — order akan dihantar bila online
          </span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4.5 py-3.5 flex flex-col gap-3" style={{ paddingLeft: 18, paddingRight: 18 }}>
        {cart.items.length === 0 ? (
          <EmptyState message="Belum ada item — pilih dari menu" />
        ) : (
          cart.items.map((it) => (
            <div key={it.id} className="border-b border-border-light pb-3 last:border-0">
              <div className="flex justify-between items-start">
                <div className="text-[13.5px] font-bold text-ink">{it.name}</div>
                <div className="text-[13.5px] font-extrabold text-ink tab-nums">{formatRM(lineTotal(it))}</div>
              </div>
              {it.modifiers.length > 0 && (
                <div className="text-[11.5px] text-muted mt-0.5 leading-relaxed">
                  {it.modifiers.map((m) => (m.priceDelta !== 0 ? `+${m.optionName}` : m.optionName)).join(" · ")}
                </div>
              )}
              <div className="flex items-center justify-between mt-2">
                <QuantityStepper qty={it.quantity} onChange={(q) => dispatch({ type: "UPDATE_CART_ITEM_QTY", itemId: it.id, qty: q })} />
                {!isOnline && (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-status-cooking-dark">
                    <span className="w-1.5 h-1.5 rounded-full bg-status-cooking-dark inline-block" />
                    Belum sync
                  </span>
                )}
                {isOnline && <span className="text-[11px] text-faint">Nota: {it.note ?? "—"}</span>}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-4.5 py-4 border-t border-border bg-surface" style={{ paddingLeft: 18, paddingRight: 18 }}>
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-[13px] font-bold text-ink-soft">Jumlah</span>
          <span className="text-2xl font-extrabold text-ink tab-nums">{formatRM(total)}</span>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            fullWidth
            disabled={cart.items.length === 0 || sending}
            onClick={send}
            className={!isOnline ? "!bg-disabled-border !text-ink-soft" : ""}
          >
            {sending ? (
              <span className="flex items-center justify-center gap-2">
                Menghantar <span className="w-2 h-2 rounded-full bg-white pulse inline-block" />
              </span>
            ) : !isOnline ? (
              `Hantar ke Kitchen${queuedCount > 0 ? ` (queued ${queuedCount})` : ""}`
            ) : (
              "Hantar ke Kitchen"
            )}
          </Button>
          <Button variant="secondary" fullWidth disabled={!cart.orderId} onClick={pay}>
            Bayar
          </Button>
        </div>
      </div>
    </div>
  );
}
