"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import PinPad from "@/components/ui/PinPad";

export default function LoginPage() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (state.currentUser) router.replace("/order");
  }, [state.currentUser, router]);

  useEffect(() => {
    if (state.loginError) {
      const t = setTimeout(() => {
        setPin("");
        dispatch({ type: "CLEAR_LOGIN_ERROR" });
      }, 900);
      return () => clearTimeout(t);
    }
  }, [state.loginError, dispatch]);

  function submit() {
    if (pin.length !== 4) return;
    dispatch({ type: "LOGIN", pin });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream p-6">
      <div className="w-full max-w-md bg-surface rounded-[20px] border border-border shadow-[0_12px_32px_rgba(43,36,32,0.08)] flex flex-col items-center gap-6 py-14 px-8">
        <div className="w-18 h-18 rounded-[18px] bg-chili flex items-center justify-center text-white font-extrabold text-2xl" style={{ width: 72, height: 72 }}>
          {state.settings.restaurantName
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div className="text-center">
          <div className="text-xl font-extrabold text-ink">{state.settings.restaurantName}</div>
          <div className="text-[13px] text-muted mt-0.5">Sistem POS Kakitangan</div>
        </div>

        <PinPad value={pin} onChange={setPin} onSubmit={submit} error={!!state.loginError} />

        <div className="h-10 flex items-center">
          {state.loginError && (
            <div className="bg-status-late-bg text-status-late-text text-[12.5px] font-semibold rounded-lg px-3 py-2.5">
              {state.loginError}
            </div>
          )}
        </div>

        <div className="text-[11px] text-faint text-center leading-relaxed">
          Demo PIN — Admin (Ali): 1234 · Staff (Mira): 1111 · Staff (Farid): 2222
        </div>
      </div>
    </div>
  );
}
