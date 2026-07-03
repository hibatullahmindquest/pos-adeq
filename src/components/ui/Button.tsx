"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "destructive" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-chili text-white hover:bg-chili-dark disabled:bg-disabled-border disabled:text-ink-soft",
  secondary: "bg-white border-[1.5px] border-ink text-ink hover:bg-muted-bg disabled:opacity-50",
  destructive: "bg-status-late text-white hover:opacity-90 disabled:opacity-50",
  ghost: "bg-transparent text-ink-soft hover:bg-muted-bg",
};

export default function Button({ variant = "primary", fullWidth, className = "", children, ...rest }: Props) {
  return (
    <button
      className={`min-h-[48px] px-5 py-3 rounded-xl font-extrabold text-sm transition-colors ${
        fullWidth ? "w-full" : ""
      } ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
