"use client";

import { useMemo, useState } from "react";
import { MenuItem, SelectedModifier } from "@/lib/types";
import { useStore, buildOrderItem } from "@/lib/store";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { formatDelta, formatRM } from "@/lib/utils";

export default function ModifierModal({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const { state, dispatch } = useStore();
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");

  const groups = useMemo(
    () => state.modifierGroups.filter((g) => g.categoryIds.includes(item.categoryId)),
    [state.modifierGroups, item.categoryId]
  );

  function toggleOption(groupId: string, optionId: string, multi: boolean) {
    setSelections((prev) => {
      const current = prev[groupId] ?? [];
      if (multi) {
        const next = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [groupId]: next };
      }
      const next = current.includes(optionId) ? [] : [optionId];
      return { ...prev, [groupId]: next };
    });
  }

  const selectedMods: SelectedModifier[] = useMemo(() => {
    const out: SelectedModifier[] = [];
    for (const g of groups) {
      const chosen = selections[g.id] ?? [];
      for (const optId of chosen) {
        const opt = g.options.find((o) => o.id === optId);
        if (opt) out.push({ groupId: g.id, groupName: g.name, optionId: opt.id, optionName: opt.name, priceDelta: opt.priceDelta });
      }
    }
    return out;
  }, [groups, selections]);

  const modDelta = selectedMods.reduce((s, m) => s + m.priceDelta, 0);
  const unitPrice = item.price + modDelta;
  const total = unitPrice * qty;

  function confirm() {
    const orderItem = buildOrderItem(item, selectedMods, qty, note);
    dispatch({ type: "ADD_CART_ITEM", item: orderItem });
    onClose();
  }

  return (
    <Modal onClose={onClose} width={480}>
      <div className="px-6 py-5 border-b border-border-light">
        <div className="text-lg font-extrabold text-ink">{item.name}</div>
        <div className="text-sm font-bold text-muted mt-0.5 tab-nums">Harga asas: {formatRM(item.price)}</div>
      </div>

      <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto" style={{ maxHeight: 420 }}>
        {groups.map((g) => (
          <div key={g.id}>
            <div className="text-[12.5px] font-extrabold text-ink-soft uppercase tracking-wide mb-2.5">{g.name}</div>
            {g.selectionType === "single" ? (
              <div className="flex gap-2">
                {g.options.map((opt) => {
                  const active = (selections[g.id] ?? []).includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleOption(g.id, opt.id, false)}
                      className={`flex-1 text-center py-2.5 rounded-lg text-[12.5px] font-bold border-[1.5px] transition-colors ${
                        active
                          ? "bg-chili-bg border-chili text-chili-dark"
                          : "bg-muted-bg border-transparent text-muted"
                      }`}
                    >
                      {opt.name}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {g.options.map((opt) => {
                  const active = (selections[g.id] ?? []).includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleOption(g.id, opt.id, true)}
                      className={`flex justify-between items-center px-3.5 py-3 rounded-lg border-[1.5px] transition-colors ${
                        active ? "bg-chili-bg border-chili" : "bg-muted-bg border-transparent"
                      }`}
                    >
                      <span className={`text-[13px] font-bold ${active ? "text-ink" : "text-ink-soft"}`}>{opt.name}</span>
                      <span className={`text-[13px] font-extrabold tab-nums ${active ? "text-chili-dark" : "text-muted"}`}>
                        {formatDelta(opt.priceDelta)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <div>
          <div className="text-[12.5px] font-extrabold text-ink-soft uppercase tracking-wide mb-2.5">Kuantiti</div>
          <div className="inline-block">
            <QuantityStepper qty={qty} onChange={(v) => setQty(Math.max(1, v))} />
          </div>
        </div>

        <div>
          <div className="text-[12.5px] font-extrabold text-ink-soft uppercase tracking-wide mb-2.5">Nota</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="cth: tolong cepat, pisah bungkus…"
            rows={2}
            className="w-full border border-border rounded-lg px-3.5 py-3 text-[13px] text-ink placeholder:text-faint resize-none"
          />
        </div>
      </div>

      <div className="px-6 py-4 border-t border-border-light flex gap-2.5 items-center">
        <Button variant="secondary" className="flex-1 !min-h-0 !py-3.5" onClick={onClose}>
          Batal
        </Button>
        <Button variant="primary" className="flex-[2] !min-h-0 !py-3.5" onClick={confirm}>
          Tambah ke Order <span className="tab-nums">({formatRM(total)})</span>
        </Button>
      </div>
    </Modal>
  );
}
