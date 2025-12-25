import { Suspense } from "react";
import PaymentResultClient from "./PaymentResultClient";

export default function Page() {
  return (
    <Suspense
      fallback={<div className="p-6">Đang tải kết quả thanh toán...</div>}
    >
      <PaymentResultClient />
    </Suspense>
  );
}
