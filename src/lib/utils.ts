export function formatRM(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}RM ${abs.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDelta(amount: number): string {
  if (amount === 0) return "RM0";
  const sign = amount > 0 ? "+" : "−";
  return `${sign}RM ${Math.abs(amount).toFixed(2)}`;
}

export function elapsedLabel(fromMs: number, nowMs: number = Date.now()): string {
  const diffMs = Math.max(0, nowMs - fromMs);
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  if (mins < 1) return `${secs}s lalu`;
  return `${mins} min lalu`;
}

export function elapsedClock(fromMs: number, nowMs: number = Date.now()): string {
  const diffMs = Math.max(0, nowMs - fromMs);
  const totalSecs = Math.floor(diffMs / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function waitTier(fromMs: number, nowMs: number = Date.now()): "fresh" | "amber" | "red" {
  const mins = (nowMs - fromMs) / 60000;
  if (mins < 5) return "fresh";
  if (mins < 12) return "amber";
  return "red";
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}
