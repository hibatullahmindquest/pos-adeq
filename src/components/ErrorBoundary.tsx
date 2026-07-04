"use client";
import React from "react";

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-cream p-6 text-center">
          <div>
            <div className="text-xl font-extrabold text-ink mb-2">Ralat berlaku</div>
            <div className="text-sm text-muted mb-5">Sila reload halaman. Jika masalah berterusan, kosongkan cache browser.</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-chili text-white font-bold rounded-lg text-sm"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
