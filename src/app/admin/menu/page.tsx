"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { MenuItem } from "@/lib/types";
import { formatRM, uid } from "@/lib/utils";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface FormState {
  id?: string;
  name: string;
  price: string;
  categoryId: string;
  available: boolean;
}

function emptyForm(defaultCategoryId: string): FormState {
  return { name: "", price: "", categoryId: defaultCategoryId, available: true };
}

export default function AdminMenuPage() {
  const { state, dispatch } = useStore();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [form, setForm] = useState<FormState | null>(null);
  const [deleting, setDeleting] = useState<MenuItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const filtered = useMemo(() => {
    return state.menuItems.filter((m) => {
      const matchesCat = categoryFilter === "all" || m.categoryId === categoryFilter;
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [state.menuItems, categoryFilter, search]);

  function categoryName(id: string) {
    return state.categories.find((c) => c.id === id)?.name ?? "—";
  }

  function openAdd() {
    setForm(emptyForm(state.categories[0]?.id ?? ""));
  }

  function openEdit(item: MenuItem) {
    setForm({ id: item.id, name: item.name, price: item.price.toFixed(2), categoryId: item.categoryId, available: item.available });
  }

  function save() {
    if (!form || !form.name.trim() || !form.price) return;
    const price = parseFloat(form.price) || 0;
    if (form.id) {
      dispatch({
        type: "UPDATE_MENU_ITEM",
        item: { id: form.id, name: form.name.trim(), price, categoryId: form.categoryId, available: form.available },
      });
    } else {
      dispatch({
        type: "ADD_MENU_ITEM",
        item: { id: uid("item"), name: form.name.trim(), price, categoryId: form.categoryId, available: form.available },
      });
    }
    setForm(null);
  }

  function addCategory() {
    if (!newCategoryName.trim()) return;
    dispatch({
      type: "ADD_CATEGORY",
      category: { id: uid("cat"), name: newCategoryName.trim(), order: state.categories.length },
    });
    setNewCategoryName("");
    setAddingCategory(false);
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
            <div className="text-lg font-extrabold text-ink flex-shrink-0">Menu</div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari item…"
              className="border border-border bg-white rounded-lg px-3.5 py-2.5 text-[12.5px] text-ink placeholder:text-faint w-full sm:w-56"
            />
          </div>
          <Button variant="primary" className="!min-h-0 !py-2.5 flex-shrink-0" onClick={openAdd}>
            + Tambah Item Baru
          </Button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap items-center">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-4 py-2 rounded-lg text-[12.5px] font-bold ${
              categoryFilter === "all" ? "bg-ink text-white" : "bg-white border border-border text-ink-soft"
            }`}
          >
            Semua
          </button>
          {state.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-4 py-2 rounded-lg text-[12.5px] font-bold ${
                categoryFilter === c.id ? "bg-ink text-white" : "bg-white border border-border text-ink-soft"
              }`}
            >
              {c.name}
            </button>
          ))}
          {addingCategory ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
                placeholder="Nama kategori"
                className="border border-border rounded-lg px-3 py-2 text-[12.5px] w-32"
              />
              <button onClick={addCategory} className="text-[12px] font-bold text-chili">
                Simpan
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingCategory(true)}
              className="px-3 py-2 rounded-lg text-[12.5px] font-bold text-muted border border-dashed border-disabled-border"
            >
              + Kategori
            </button>
          )}
        </div>

        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          {/* Table header — desktop only */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_110px] px-5 py-3 bg-muted-bg text-[11.5px] font-extrabold text-muted uppercase tracking-wide">
            <span>Nama Item</span>
            <span>Kategori</span>
            <span>Harga</span>
            <span>Status</span>
            <span></span>
          </div>

          {filtered.map((item) => (
            <div key={item.id} className={`border-t border-border-light ${!item.available ? "opacity-60" : ""}`}>
              {/* Mobile card row */}
              <div className="md:hidden px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold text-ink truncate">{item.name}</div>
                  <div className="text-[11.5px] text-muted mt-0.5">{categoryName(item.categoryId)}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[13px] font-bold text-ink tab-nums">{formatRM(item.price)}</span>
                  <button
                    onClick={() => dispatch({ type: "TOGGLE_AVAILABILITY", id: item.id })}
                    className={`text-[11px] font-extrabold px-2.5 py-1.5 rounded-md ${
                      item.available ? "bg-status-ready-bg text-status-ready-text" : "bg-muted-bg-2 text-muted"
                    }`}
                  >
                    {item.available ? "Ada" : "Habis"}
                  </button>
                  <span className="text-xs font-bold text-chili flex gap-0.5">
                    <button onClick={() => openEdit(item)} className="px-2 py-2">Edit</button>
                    <span className="text-muted self-center">·</span>
                    <button onClick={() => setDeleting(item)} className="px-2 py-2">Padam</button>
                  </span>
                </div>
              </div>

              {/* Desktop table row */}
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_110px] px-5 py-3.5 items-center">
                <span className="text-[13.5px] font-bold text-ink">{item.name}</span>
                <span className="text-[12.5px] text-muted">{categoryName(item.categoryId)}</span>
                <span className="text-[13px] font-bold text-ink tab-nums">{formatRM(item.price)}</span>
                <span>
                  <button
                    onClick={() => dispatch({ type: "TOGGLE_AVAILABILITY", id: item.id })}
                    className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md ${
                      item.available ? "bg-status-ready-bg text-status-ready-text" : "bg-muted-bg-2 text-muted"
                    }`}
                  >
                    {item.available ? "Ada" : "Habis"}
                  </button>
                </span>
                <span className="text-xs font-bold text-chili flex gap-2">
                  <button onClick={() => openEdit(item)}>Edit</button>·
                  <button onClick={() => setDeleting(item)}>Padam</button>
                </span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="px-5 py-8 text-center text-sm text-muted">Tiada item dijumpai</div>}
        </div>
      </div>

      {form && (
        <Modal onClose={() => setForm(null)} width={420}>
          <div className="p-6">
            <div className="text-xs font-extrabold text-ink-soft uppercase mb-4">
              {form.id ? "Edit Item" : "Tambah Item Baru"}
            </div>
            <div className="flex flex-col gap-2.5">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nama item"
                className="border border-border rounded-lg px-3 py-2.5 text-[13px] font-semibold text-ink"
              />
              <div className="flex gap-2">
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Harga (RM)"
                  inputMode="decimal"
                  className="flex-1 border border-border rounded-lg px-3 py-2.5 text-[13px] font-semibold text-ink"
                />
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="flex-1 border border-border rounded-lg px-3 py-2.5 text-[13px] font-semibold text-ink"
                >
                  {state.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, available: !form.available })}
                className="flex items-center justify-between px-3 py-2.5 bg-muted-bg rounded-lg"
              >
                <span className="text-[12.5px] font-bold text-ink-soft">Tersedia</span>
                <span
                  className={`w-9.5 h-5.5 rounded-full relative transition-colors ${form.available ? "bg-status-ready" : "bg-disabled-border"}`}
                  style={{ width: 38, height: 22 }}
                >
                  <span
                    className="w-4 h-4 rounded-full bg-white absolute top-[3px] transition-all"
                    style={{ left: form.available ? 19 : 3 }}
                  />
                </span>
              </button>
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <Button variant="secondary" className="!min-h-0 !py-2.5" onClick={() => setForm(null)}>
                Batal
              </Button>
              <Button variant="primary" className="!min-h-0 !py-2.5" onClick={save}>
                Simpan
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Padam item"
          message={`Padam "${deleting.name}" dari menu? Tindakan ini tidak boleh dibuat asal.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            dispatch({ type: "DELETE_MENU_ITEM", id: deleting.id });
            setDeleting(null);
          }}
        />
      )}
    </AppShell>
  );
}
