import { Suspense } from "react";
import AppShell from "@/components/AppShell";
import CheckoutView from "@/components/CheckoutView";

export default function CheckoutPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <CheckoutView />
      </Suspense>
    </AppShell>
  );
}
