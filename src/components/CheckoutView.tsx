"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { lineTotal, PaymentMethod } from "@/lib/types";
import { formatRM } from "@/lib/utils";
import Button from "@/components/ui/Button";
import NumberPad from "@/components/ui/NumberPad";
import EmptyState from "@/components/ui/EmptyState";

export default function CheckoutView() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const tableId = searchParams.get("table");

  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [received, setReceived] = useState("");

  // Single-order mode (tapau or legacy)
  const singleOrder = orderId ? state.orders.find((o) => o.id === orderId) : null;

  // Table aggregate mode
  const tableOrders = tableId
    ? state.orders
        .filter((o) => o.tableId === tableId && o.status !== "paid" && o.status !== "cancelled")
        .sort((a, b) => a.createdAt - b.createdAt)
    : [];

  const tableName = tableId ? state.tables.find((t) => t.id === tableId)?.name ?? "Meja" : null;

  const subtotal = useMemo(() => {
    if (tableId) return tableOrders.reduce((s, o) => s + o.items.reduce((a, it) => a + lineTotal(it), 0), 0);
    return singleOrder ? singleOrder.items.reduce((s, it) => s + lineTotal(it), 0) : 0;
  }, [tableId, tableOrders, singleOrder]);

  const taxAmount =
    state.settings.taxServiceEnabled ? subtotal * (state.settings.taxServicePercent / 100) : 0;
  const grandTotal = subtotal + taxAmount;
  const receivedNum = parseFloat(received || "0") || 0;
  const change = receivedNum - grandTotal;

  function pressKey(key: string) {
    if (key === "del") { setReceived((r) => r.slice(0, -1)); return; }
    if (key === "." && received.includes(".")) return;
    setReceived((r) => r + key);
  }

  function finish() {
    if (tableId) {
      dispatch({ type: "PAY_TABLE", tableId, method, amountReceived: method === "cash" ? receivedNum : undefined });
    } else if (singleOrder) {
      dispatch({ type: "PAY_ORDER", orderId: singleOrder.id, method, amountReceived: method === "cash" ? receivedNum : undefined });
    }
    router.push("/orders");
  }

  // Guard: invalid params
  if (!orderId && !tableId) {
    return <div className="flex-1 flex items-center justify-center"><EmptyState message="Order tidak dijumpai." /></div>;
  }
  if (orderId && !singleOrder) {
    return <div className="flex-1 flex items-center justify-center"><EmptyState message="Order tidak dijumpai." /></div>;
  }
  if (tableId && tableOrders.length === 0) {
    return <div className="flex-1 flex items-center justify-center"><EmptyState message="Tiada order aktif untuk meja ini." /></div>;
  }

  const headerLabel = tableId
    ? tableName
    : singleOrder?.type === "dine-in"
      ? state.tables.find((t) => t.id === singleOrder.tableId)?.name ?? "Meja"
      : singleOrder?.customerName;

  const headerSub = tableId ? "Dine-in" : singleOrder?.type === "dine-in" ? "Dine-in" : "Tapau";
  const canPay = method === "qr" || receivedNum >= grandTotal;

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
      {/* Bill section */}
      <div className="flex-1 p-5 md:p-6 lg:p-8 overflow-y-auto">
        <div className="text-xs font-bold text-muted mb-1">Tutup Bill</div>
        <div className="text-xl font-extrabold text-ink mb-5">
          {headerLabel} · {headerSub}
        </div>

        <div className="bg-white border border-border rounded-2xl p-5">
          {tableId ? (
            /* Table mode: items grouped by round */
            tableOrders.map((o, idx) => (
              <div key={o.id} className={idx > 0 ? "mt-4 pt-4 border-t border-border-light" : ""}>
                <div className="text-[11px] font-extrabold text-muted uppercase tracking-wide mb-2.5">
                  Round {idx + 1}
                </div>
                {o.items.map((it, itemIdx) => (
                  <div
                    key={it.id}
                    className={`flex justify-between ${itemIdx < o.items.length - 1 ? "border-b border-border-light pb-3 mb-3" : "pb-1"}`}
                  >
                    <div>
                      <div className="text-[13.5px] font-bold text-ink">
                        {it.quantity}× {it.name}
                      </div>
                      {it.modifiers.length > 0 && (
                        <div className="text-[11.5px] text-muted mt-0.5">
                          {it.modifiers.map((m) => m.optionName).join(" · ")}
                        </div>
                      )}
                    </div>
                    <div className="text-[13.5px] font-extrabold text-ink tab-nums">{formatRM(lineTotal(it))}</div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            /* Single order mode */
            singleOrder!.items.map((it, idx) => (
              <div
                key={it.id}
                className={`flex justify-between ${idx < singleOrder!.items.length - 1 ? "border-b border-border-light pb-3 mb-3" : "pb-3"}`}
              >
                <div>
                  <div className="text-[13.5px] font-bold text-ink">
                    {it.quantity}× {it.name}
                  </div>
                  {it.modifiers.length > 0 && (
                    <div className="text-[11.5px] text-muted mt-0.5">
                      {it.modifiers.map((m) => m.optionName).join(" · ")}
                    </div>
                  )}
                </div>
                <div className="text-[13.5px] font-extrabold text-ink tab-nums">{formatRM(lineTotal(it))}</div>
              </div>
            ))
          )}

          <div className="h-px bg-border-light my-1.5" />
          <div className="flex justify-between text-xs text-muted mb-1.5 mt-2">
            <span>Subtotal</span>
            <span className="tab-nums">{formatRM(subtotal)}</span>
          </div>
          {state.settings.taxServiceEnabled && (
            <div className="flex justify-between text-xs text-muted mb-3">
              <span>Cukai perkhidmatan ({state.settings.taxServicePercent}%)</span>
              <span className="tab-nums">{formatRM(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline">
            <span className="text-[15px] font-extrabold text-ink">Jumlah</span>
            <span className="text-xl font-extrabold text-chili-dark tab-nums">{formatRM(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Payment section */}
      <div className="w-full md:w-[360px] lg:w-[420px] bg-white border-t md:border-t-0 md:border-l border-border p-5 md:p-6 lg:p-7 flex flex-col overflow-y-auto">
        <div className="text-xs font-extrabold text-ink-soft uppercase tracking-wide mb-3">Kaedah bayaran</div>
        <div className="flex gap-2.5 mb-5">
          <button
            type="button"
            onClick={() => setMethod("cash")}
            className={`flex-1 text-center py-4 rounded-xl text-[13.5px] font-extrabold border-[1.5px] ${
              method === "cash" ? "bg-chili-bg border-chili text-chili-dark" : "border-border text-muted"
            }`}
          >
            Cash
          </button>
          <button
            type="button"
            onClick={() => setMethod("qr")}
            className={`flex-1 text-center py-4 rounded-xl text-[13.5px] font-extrabold border-[1.5px] ${
              method === "qr" ? "bg-chili-bg border-chili text-chili-dark" : "border-border text-muted"
            }`}
          >
            QR
          </button>
        </div>

        {method === "cash" ? (
          <>
            <div className="text-xs font-bold text-muted mb-2">Jumlah diterima</div>
            <div className="text-2xl font-extrabold text-ink bg-muted-bg rounded-xl px-4 py-4 mb-3 tab-nums">
              {received ? formatRM(receivedNum) : "RM 0.00"}
            </div>
            <div
              className={`flex justify-between rounded-lg px-4 py-3 mb-5 ${
                change >= 0 ? "bg-status-ready-bg" : "bg-status-late-bg"
              }`}
            >
              <span className={`text-xs font-bold ${change >= 0 ? "text-status-ready-text" : "text-status-late-text"}`}>
                {change >= 0 ? "Baki" : "Kurang"}
              </span>
              <span className={`text-[15px] font-extrabold tab-nums ${change >= 0 ? "text-status-ready-text" : "text-status-late-text"}`}>
                {formatRM(Math.abs(change))}
              </span>
            </div>
            <NumberPad onKey={pressKey} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm text-muted text-center py-8">
            Tunjukkan QR kod kepada pelanggan untuk imbasan bayaran.
          </div>
        )}

        <Button variant="primary" fullWidth className="mt-6" disabled={!canPay} onClick={finish}>
          Tandakan Dah Bayar / Tutup Bill
        </Button>
      </div>
    </div>
  );
}
