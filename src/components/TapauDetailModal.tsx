"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { lineTotal } from "@/lib/types";
import { formatRM } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";

interface Props {
  orderId: string;
  onClose: () => void;
}

export default function TapauDetailModal({ orderId, onClose }: Props) {
  const { state, dispatch } = useStore();
  const router = useRouter();

  const order = state.orders.find((o) => o.id === orderId);
  if (!order) return null;

  const total = order.items.reduce((s, it) => s + lineTotal(it), 0);

  function pay() {
    onClose();
    router.push(`/checkout?orderId=${orderId}`);
  }

  function cancelOrder() {
    dispatch({ type: "CANCEL_ORDER", orderId });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/45 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-[15px] font-extrabold text-ink">
              {order.customerName || "Tapau"}
            </div>
            <div className="text-xs text-muted mt-0.5 flex items-center gap-2">
              {order.customerPhone && <span>{order.customerPhone}</span>}
              <StatusBadge status={order.status} />
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-muted-bg flex items-center justify-center text-muted text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted-bg">
              <span className="text-[12.5px] font-extrabold text-ink">Items</span>
              <button
                onClick={cancelOrder}
                className="text-[11.5px] font-bold text-status-late hover:underline px-1 py-1"
              >
                Batal Order
              </button>
            </div>
            <div className="divide-y divide-border-light">
              {order.items.length === 0 ? (
                <div className="px-4 py-3 text-[12px] text-muted">Semua item dibatalkan</div>
              ) : (
                order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-ink">
                        {item.quantity}× {item.name}
                      </div>
                      {item.modifiers.length > 0 && (
                        <div className="text-[11px] text-muted mt-0.5">
                          {item.modifiers.map((m) => m.optionName).join(" · ")}
                        </div>
                      )}
                    </div>
                    <span className="text-[13px] font-extrabold text-ink tab-nums flex-shrink-0">
                      {formatRM(lineTotal(item))}
                    </span>
                    <button
                      onClick={() => dispatch({ type: "CANCEL_ORDER_ITEM", orderId, itemId: item.id })}
                      aria-label={`Batal ${item.name}`}
                      className="w-7 h-7 rounded-full bg-status-late-bg text-status-late text-[11px] font-extrabold flex items-center justify-center flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border bg-surface">
          <div className="flex justify-between items-baseline mb-3">
            <span className="text-[13px] font-bold text-ink-soft">Jumlah</span>
            <span className="text-xl font-extrabold text-ink tab-nums">{formatRM(total)}</span>
          </div>
          <Button variant="primary" fullWidth disabled={total === 0} onClick={pay}>
            Bayar
          </Button>
        </div>
      </div>
    </div>
  );
}
