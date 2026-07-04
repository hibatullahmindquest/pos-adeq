"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { MenuItem } from "@/lib/types";
import { formatRM } from "@/lib/utils";
import ModifierModal from "@/components/ModifierModal";
import CartPanel from "@/components/CartPanel";

export default function OrderTakingView() {
  const { state, dispatch } = useStore();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(state.categories[0]?.id ?? "");
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const table = searchParams.get("table");
    const orderId = searchParams.get("orderId");
    if (table) {
      dispatch({ type: "START_CART_FOR_TABLE", tableId: table });
    } else if (orderId) {
      dispatch({ type: "LOAD_CART_FROM_ORDER", orderId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = useMemo(
    () => state.menuItems.filter((m) => m.categoryId === activeCategory),
    [state.menuItems, activeCategory]
  );

  const cartItemCount = state.cart.items.reduce((s, it) => s + it.quantity, 0);
  const cartTotal = state.cart.items.reduce(
    (s, it) => s + (it.basePrice + it.modifiers.reduce((a, m) => a + m.priceDelta, 0)) * it.quantity,
    0
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0">
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <div className="flex gap-2 px-4 sm:px-6 pt-4 pb-0 overflow-x-auto">
          {[...state.categories].sort((a, b) => a.order - b.order).map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-5 py-2.5 rounded-xl text-[13.5px] font-bold whitespace-nowrap transition-colors ${
                activeCategory === c.id ? "bg-chili text-white" : "bg-white border border-border text-ink-soft"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 pb-20 md:pb-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {items.map((m) => (
              <button
                key={m.id}
                disabled={!m.available}
                onClick={() => setModalItem(m)}
                className={`text-left bg-white border border-border rounded-2xl p-4 min-h-24 flex flex-col justify-between transition ${
                  m.available ? "hover:border-chili hover:shadow-sm" : "opacity-55 bg-muted-bg cursor-not-allowed"
                }`}
              >
                <div className={`text-[14.5px] font-bold ${m.available ? "text-ink" : "text-muted"}`}>{m.name}</div>
                <div className="flex items-center justify-between">
                  <span className={`text-base font-extrabold tab-nums ${m.available ? "text-chili-dark" : "text-faint"}`}>
                    {formatRM(m.price)}
                  </span>
                  {!m.available && (
                    <span className="text-[10px] font-extrabold text-muted bg-muted-bg-2 px-1.5 py-1 rounded">
                      HABIS
                    </span>
                  )}
                </div>
              </button>
            ))}
            {items.length === 0 && (
              <div className="col-span-full text-center text-sm text-muted py-10">Tiada item dalam kategori ini</div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:flex md:w-[300px] lg:w-[340px] border-l border-border flex-shrink-0">
        <CartPanel />
      </div>

      <div className="md:hidden fixed inset-x-0 bottom-0 z-40">
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="w-full bg-white border-t border-border rounded-t-2xl shadow-[0_-8px_24px_rgba(43,36,32,0.1)] px-5 py-3 flex items-center justify-between"
        >
          <span className="text-[12.5px] font-bold text-ink-soft">{cartItemCount} item dalam order</span>
          <span className="text-lg font-extrabold text-ink tab-nums">{formatRM(cartTotal)}</span>
        </button>
      </div>

      {sheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-ink/45 flex items-end" onClick={() => setSheetOpen(false)}>
          <div
            className="w-full bg-white rounded-t-3xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3" />
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <CartPanel onSent={() => setSheetOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {modalItem && <ModifierModal item={modalItem} onClose={() => setModalItem(null)} />}
    </div>
  );
}
