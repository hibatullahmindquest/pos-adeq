import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import ToastHost from "@/components/ui/ToastHost";
import ErrorBoundary from "@/components/ErrorBoundary";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Restoran Adeq Tomyam — POS",
  description: "Internal restaurant POS — order taking, kitchen display, checkout",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ErrorBoundary>
          <StoreProvider>
            {children}
            <ToastHost />
          </StoreProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
