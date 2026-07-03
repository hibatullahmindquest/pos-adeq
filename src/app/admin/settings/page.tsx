"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Role } from "@/lib/types";
import { uid } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function AdminSettingsPage() {
  const { state, dispatch } = useStore();
  const [addingStaff, setAddingStaff] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState<Role>("staff");
  const [staffPin, setStaffPin] = useState("");
  const [newTableName, setNewTableName] = useState("");
  const [addingTable, setAddingTable] = useState(false);

  function saveStaff() {
    if (!staffName.trim() || staffPin.length !== 4) return;
    dispatch({ type: "ADD_STAFF", staff: { id: uid("staff"), name: staffName.trim(), role: staffRole, pin: staffPin } });
    setAddingStaff(false);
    setStaffName("");
    setStaffPin("");
    setStaffRole("staff");
  }

  function saveReset() {
    if (!resettingId || staffPin.length !== 4) return;
    dispatch({ type: "RESET_PIN", id: resettingId, pin: staffPin });
    setResettingId(null);
    setStaffPin("");
  }

  function addTable() {
    if (!newTableName.trim()) return;
    dispatch({ type: "ADD_TABLE", table: { id: uid("table"), name: newTableName.trim() } });
    setNewTableName("");
    setAddingTable(false);
  }

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-border rounded-2xl p-5.5" style={{ padding: 22 }}>
          <div className="text-sm font-extrabold text-ink mb-4">Maklumat Restoran</div>
          <div className="flex items-center gap-3.5 mb-3.5">
            <div className="w-13 h-13 rounded-xl bg-chili text-white flex items-center justify-center font-extrabold" style={{ width: 52, height: 52 }}>
              {state.settings.restaurantName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div className="text-xs font-bold text-chili">Tukar Logo</div>
          </div>
          <input
            value={state.settings.restaurantName}
            onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { restaurantName: e.target.value } })}
            className="w-full border border-border rounded-lg px-3 py-2.5 text-[12.5px] font-semibold text-ink mb-2.5"
          />
          <input
            value={state.settings.address}
            onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { address: e.target.value } })}
            placeholder="Alamat restoran…"
            className="w-full border border-border rounded-lg px-3 py-2.5 text-[12.5px] text-ink"
          />
        </div>

        <div className="bg-white border border-border rounded-2xl p-5.5" style={{ padding: 22 }}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-extrabold text-ink">Susunan Meja</span>
            <button onClick={() => setAddingTable(true)} className="text-xs font-bold text-chili">
              + Tambah Meja
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {state.tables.map((t) => (
              <div key={t.id} className="bg-muted-bg rounded-lg py-2.5 text-center text-[12.5px] font-bold text-ink">
                {t.name}
              </div>
            ))}
          </div>
          {addingTable && (
            <div className="flex gap-1.5 mt-3">
              <input
                autoFocus
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTable()}
                placeholder="Nama meja"
                className="flex-1 border border-border rounded-lg px-3 py-2 text-[12.5px]"
              />
              <button onClick={addTable} className="text-xs font-bold text-chili px-2">
                Simpan
              </button>
            </div>
          )}
        </div>

        <div className="bg-white border border-border rounded-2xl p-5.5" style={{ padding: 22 }}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-extrabold text-ink">Akaun Kakitangan</span>
            <button onClick={() => setAddingStaff(true)} className="text-xs font-bold text-chili">
              + Tambah Staff
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {state.staff.map((s, idx) => (
              <div key={s.id} className={`flex justify-between items-center py-2.5 px-1 ${idx > 0 ? "border-t border-border-light" : ""}`}>
                <span className="text-[13px] font-bold text-ink">{s.name}</span>
                <span
                  className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md ${
                    s.role === "admin" ? "text-chili-dark bg-chili-bg" : "text-ink-soft bg-muted-bg"
                  }`}
                >
                  {s.role === "admin" ? "Admin" : "Staff"}
                </span>
                <button onClick={() => setResettingId(s.id)} className="text-xs font-bold text-muted">
                  Reset PIN
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-5.5" style={{ padding: 22 }}>
          <div className="text-sm font-extrabold text-ink mb-4">Cukai &amp; Perkhidmatan</div>
          <button
            type="button"
            onClick={() => dispatch({ type: "UPDATE_SETTINGS", settings: { taxServiceEnabled: !state.settings.taxServiceEnabled } })}
            className="flex justify-between items-center py-2.5 px-1 w-full mb-2"
          >
            <span className="text-[13px] font-bold text-ink">Cukai perkhidmatan</span>
            <span
              className={`rounded-full relative ${state.settings.taxServiceEnabled ? "bg-status-ready" : "bg-disabled-border"}`}
              style={{ width: 38, height: 22 }}
            >
              <span
                className="w-4 h-4 rounded-full bg-white absolute top-[3px] transition-all"
                style={{ left: state.settings.taxServiceEnabled ? 19 : 3 }}
              />
            </span>
          </button>
          <input
            value={state.settings.taxServicePercent}
            onChange={(e) => dispatch({ type: "UPDATE_SETTINGS", settings: { taxServicePercent: parseFloat(e.target.value) || 0 } })}
            type="number"
            className="border border-border rounded-lg px-3 py-2.5 text-[12.5px] font-semibold text-ink w-24"
          />
          <span className="text-[12.5px] text-muted ml-1.5">%</span>
        </div>
      </div>

      {addingStaff && (
        <Modal onClose={() => setAddingStaff(false)} width={360}>
          <div className="p-6">
            <div className="text-xs font-extrabold text-ink-soft uppercase mb-4">Tambah Staff</div>
            <div className="flex flex-col gap-2.5">
              <input
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="Nama"
                className="border border-border rounded-lg px-3 py-2.5 text-[13px]"
              />
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as Role)}
                className="border border-border rounded-lg px-3 py-2.5 text-[13px]"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <input
                value={staffPin}
                onChange={(e) => setStaffPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="PIN (4 digit)"
                inputMode="numeric"
                className="border border-border rounded-lg px-3 py-2.5 text-[13px] tab-nums"
              />
            </div>
            <div className="flex gap-2 justify-end mt-5">
              <Button variant="secondary" className="!min-h-0 !py-2.5" onClick={() => setAddingStaff(false)}>
                Batal
              </Button>
              <Button variant="primary" className="!min-h-0 !py-2.5" onClick={saveStaff}>
                Simpan
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {resettingId && (
        <Modal onClose={() => setResettingId(null)} width={340}>
          <div className="p-6">
            <div className="text-xs font-extrabold text-ink-soft uppercase mb-4">Reset PIN</div>
            <input
              value={staffPin}
              onChange={(e) => setStaffPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="PIN baru (4 digit)"
              inputMode="numeric"
              className="border border-border rounded-lg px-3 py-2.5 text-[13px] w-full tab-nums"
            />
            <div className="flex gap-2 justify-end mt-5">
              <Button variant="secondary" className="!min-h-0 !py-2.5" onClick={() => setResettingId(null)}>
                Batal
              </Button>
              <Button variant="primary" className="!min-h-0 !py-2.5" onClick={saveReset}>
                Simpan
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
