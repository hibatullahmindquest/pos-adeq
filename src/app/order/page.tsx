import { Suspense } from "react";
import AppShell from "@/components/AppShell";
import OrderTakingView from "@/components/OrderTakingView";

export default function OrderPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <OrderTakingView />
      </Suspense>
    </AppShell>
  );
}
