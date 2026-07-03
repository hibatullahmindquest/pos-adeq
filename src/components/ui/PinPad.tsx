"use client";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  error?: boolean;
}

export default function PinPad({ value, onChange, onSubmit, maxLength = 4, error }: Props) {
  const dotColor = error ? "bg-status-late" : "bg-chili";
  const dotEmptyBorder = error ? "border-status-late/50" : "border-disabled-border";

  function press(key: string) {
    if (key === "del") {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= maxLength) return;
    onChange(value + key);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-3.5">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full ${
              i < value.length ? dotColor : `border-2 ${dotEmptyBorder}`
            }`}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3.5">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <button
            key={n}
            onClick={() => press(n)}
            className="w-18 h-18 rounded-2xl bg-white border border-border flex items-center justify-center text-[22px] font-bold text-ink hover:bg-muted-bg active:scale-95 transition"
            style={{ width: 72, height: 72 }}
            type="button"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => press("del")}
          className="rounded-2xl flex items-center justify-center text-[13px] font-bold text-muted hover:bg-muted-bg active:scale-95 transition"
          style={{ width: 72, height: 72 }}
          type="button"
        >
          Padam
        </button>
        <button
          onClick={() => press("0")}
          className="rounded-2xl bg-white border border-border flex items-center justify-center text-[22px] font-bold text-ink hover:bg-muted-bg active:scale-95 transition"
          style={{ width: 72, height: 72 }}
          type="button"
        >
          0
        </button>
        <button
          onClick={onSubmit}
          disabled={value.length !== maxLength}
          className="rounded-2xl bg-chili disabled:bg-disabled-border flex items-center justify-center text-[13px] font-bold text-white active:scale-95 transition"
          style={{ width: 72, height: 72 }}
          type="button"
        >
          Masuk
        </button>
      </div>
    </div>
  );
}
