"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { ModifierGroup } from "@/lib/types";
import { uid } from "@/lib/utils";

export default function AdminModifiersPage() {
  const { state, dispatch } = useStore();
  const [selectedId, setSelectedId] = useState<string>(state.modifierGroups[0]?.id ?? "");
  const selected = state.modifierGroups.find((g) => g.id === selectedId);

  function addGroup() {
    const group: ModifierGroup = {
      id: uid("mod"),
      name: "Kumpulan Baru",
      selectionType: "single",
      options: [],
      categoryIds: [],
    };
    dispatch({ type: "ADD_MODIFIER_GROUP", group });
    setSelectedId(group.id);
  }

  function updateGroup(next: ModifierGroup) {
    dispatch({ type: "UPDATE_MODIFIER_GROUP", group: next });
  }

  function addOption() {
    if (!selected) return;
    updateGroup({
      ...selected,
      options: [...selected.options, { id: uid("opt"), name: "Pilihan baru", priceDelta: 0 }],
    });
  }

  function toggleCategory(catId: string) {
    if (!selected) return;
    const has = selected.categoryIds.includes(catId);
    updateGroup({
      ...selected,
      categoryIds: has ? selected.categoryIds.filter((c) => c !== catId) : [...selected.categoryIds, catId],
    });
  }

  return (
    <AppShell>
      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl w-full mx-auto min-h-0">
        <div className="lg:w-[320px] border-b lg:border-b-0 lg:border-r border-border p-5 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[15px] font-extrabold text-ink">Kumpulan Modifier</div>
          </div>
          <div className="flex flex-col gap-2">
            {state.modifierGroups.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedId(g.id)}
                className={`text-left rounded-xl px-3.5 py-3 border-[1.5px] transition-colors ${
                  g.id === selectedId ? "bg-chili-bg border-chili" : "bg-white border-border"
                }`}
              >
                <div className={`text-[13px] font-extrabold ${g.id === selectedId ? "text-chili-dark" : "text-ink"}`}>
                  {g.name}
                </div>
                <div className={`text-[11px] mt-0.5 ${g.id === selectedId ? "text-chili-dark" : "text-muted"}`}>
                  {g.selectionType === "single" ? "Single-select" : "Multi-select"} ·{" "}
                  {g.options.every((o) => o.priceDelta === 0) ? "RM0" : "Harga berubah"}
                </div>
              </button>
            ))}
            <button
              onClick={addGroup}
              className="mt-1 text-center py-2.5 border-[1.5px] border-dashed border-disabled-border rounded-xl text-[12.5px] font-bold text-muted"
            >
              + Kumpulan Baru
            </button>
          </div>
        </div>

        {selected ? (
          <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-1.5 gap-3 flex-wrap">
              <input
                value={selected.name}
                onChange={(e) => updateGroup({ ...selected, name: e.target.value })}
                className="text-lg font-extrabold text-ink bg-transparent border-b border-transparent focus:border-border"
              />
              <button
                onClick={() => dispatch({ type: "ADD_TOAST", toast: { id: uid("toast"), kind: "success", message: "Perubahan disimpan" } })}
                className="text-xs font-bold text-chili"
              >
                Simpan Perubahan
              </button>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <select
                value={selected.selectionType}
                onChange={(e) => updateGroup({ ...selected, selectionType: e.target.value as "single" | "multi" })}
                className="text-[12.5px] text-ink-soft border border-border rounded-lg px-2.5 py-1.5"
              >
                <option value="single">Single-select</option>
                <option value="multi">Multi-select</option>
              </select>
              <span className="text-[12.5px] text-muted">
                {selected.selectionType === "single" ? "Pelanggan pilih satu sahaja" : "Boleh pilih lebih dari satu"}
              </span>
              <button
                onClick={() => dispatch({ type: "DELETE_MODIFIER_GROUP", id: selected.id })}
                className="ml-auto text-xs font-bold text-status-late"
              >
                Padam Kumpulan
              </button>
            </div>

            <div className="flex flex-col gap-2.5 mb-6">
              {selected.options.map((opt) => (
                <div
                  key={opt.id}
                  className="grid grid-cols-[2fr_1fr_90px] items-center gap-2.5 bg-white border border-border rounded-xl px-4 py-3"
                >
                  <input
                    value={opt.name}
                    onChange={(e) =>
                      updateGroup({
                        ...selected,
                        options: selected.options.map((o) => (o.id === opt.id ? { ...o, name: e.target.value } : o)),
                      })
                    }
                    className="text-[13px] font-bold text-ink bg-transparent"
                  />
                  <input
                    value={opt.priceDelta}
                    onChange={(e) =>
                      updateGroup({
                        ...selected,
                        options: selected.options.map((o) =>
                          o.id === opt.id ? { ...o, priceDelta: parseFloat(e.target.value) || 0 } : o
                        ),
                      })
                    }
                    type="number"
                    step="0.5"
                    className="text-[12.5px] text-ink-soft tab-nums bg-transparent"
                  />
                  <button
                    onClick={() => updateGroup({ ...selected, options: selected.options.filter((o) => o.id !== opt.id) })}
                    className="text-xs font-bold text-muted justify-self-end"
                  >
                    Padam
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="text-center py-2.5 border-[1.5px] border-dashed border-disabled-border rounded-xl text-[12.5px] font-bold text-muted"
              >
                + Pilihan Baru
              </button>
            </div>

            <div className="text-[13px] font-extrabold text-ink-soft mb-2.5">Terpakai pada</div>
            <div className="flex gap-2 flex-wrap">
              {state.categories.map((c) => {
                const active = selected.categoryIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleCategory(c.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold ${
                      active ? "bg-muted-bg text-ink" : "bg-white border border-border text-muted"
                    }`}
                  >
                    Kategori: {c.name} {active ? "✓" : ""}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted text-sm">Pilih atau cipta kumpulan modifier</div>
        )}
      </div>
    </AppShell>
  );
}
