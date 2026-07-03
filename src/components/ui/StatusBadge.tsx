import { OrderStatus } from "@/lib/types";

const config: Record<OrderStatus, { label: string; bg: string; text: string; dot: string }> = {
  new: { label: "NEW", bg: "bg-muted-bg-2", text: "text-ink-soft", dot: "bg-status-new" },
  cooking: { label: "COOKING", bg: "bg-status-cooking-bg", text: "text-status-cooking-dark", dot: "bg-status-cooking" },
  ready: { label: "READY", bg: "bg-status-ready-bg", text: "text-status-ready-text", dot: "bg-status-ready" },
  served: { label: "SERVED", bg: "bg-[#E1EBFA]", text: "text-status-served", dot: "bg-status-served" },
  paid: { label: "PAID", bg: "bg-status-ready-bg", text: "text-status-ready-text", dot: "bg-status-ready" },
};

export default function StatusBadge({ status, dotOnly }: { status: OrderStatus; dotOnly?: boolean }) {
  const c = config[status];
  if (dotOnly) {
    return <span className={`inline-block w-[9px] h-[9px] rounded-full ${c.dot}`} />;
  }
  return (
    <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md ${c.bg} ${c.text}`}>{c.label}</span>
  );
}

export function statusSolidBg(status: OrderStatus): string {
  return (
    {
      new: "bg-status-new",
      cooking: "bg-status-cooking",
      ready: "bg-status-ready",
      served: "bg-status-served",
      paid: "bg-status-ready",
    } as Record<OrderStatus, string>
  )[status];
}

export function statusBorderColor(status: OrderStatus): string {
  return (
    {
      new: "border-border",
      cooking: "border-status-cooking",
      ready: "border-status-ready",
      served: "border-status-served",
      paid: "border-status-ready",
    } as Record<OrderStatus, string>
  )[status];
}
