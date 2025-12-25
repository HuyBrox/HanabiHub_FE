const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function createVnpayPayment(courseId: string, returnUrl?: string) {
  // Attach Authorization header if access token available
  let headers: any = { "Content-Type": "application/json" };
  try {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}

  const res = await fetch(`${API_BASE}/payments/vnpay/create`, {
    method: "POST",
    headers,
    credentials: "include", // ✅ gửi cookie token
    body: JSON.stringify({ courseId, returnUrl }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Tạo thanh toán thất bại");

  return data as { paymentUrl: string; txnRef: string };
}
