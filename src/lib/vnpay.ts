// lib/vnpay.ts
export type TxnStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "INVALID_SIGNATURE"
  | "ERROR";

export type VnpayStatusResult = {
  status: TxnStatus;
  message?: string;
  raw?: any;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const isTxnStatus = (v: any): v is TxnStatus => {
  return (
    v === "PENDING" ||
    v === "SUCCESS" ||
    v === "FAILED" ||
    v === "INVALID_SIGNATURE" ||
    v === "ERROR"
  );
};

// Map code VNPAY -> TxnStatus
function mapVnpCodeToStatus(code: string): TxnStatus {
  const c = String(code || "").trim();

  // VNPAY transaction success
  if (c === "00") return "SUCCESS";

  // Common pending-like codes (tuỳ BE bạn)
  if (c === "01") return "PENDING";

  // Anything else treat as FAILED
  return "FAILED";
}

// Tìm status trong nhiều kiểu response khác nhau
function extractStatusFromAny(obj: any): { status?: TxnStatus; message?: string } {
  if (!obj) return {};

  // Nếu BE trả luôn status dạng chữ
  const directCandidates = [
    obj.status,
    obj.txnStatus,
    obj.transactionStatus,
    obj.vnp_TransactionStatus,
    obj.vnp_ResponseCode,
    obj.code,
    obj.responseCode,
    obj?.data?.status,
    obj?.data?.txnStatus,
    obj?.data?.transactionStatus,
    obj?.data?.vnp_TransactionStatus,
    obj?.data?.vnp_ResponseCode,
    obj?.data?.code,
    obj?.data?.responseCode,
  ];

  // message candidates
  const msgCandidates = [
    obj.message,
    obj.msg,
    obj.error,
    obj.detail,
    obj?.data?.message,
    obj?.data?.msg,
    obj?.data?.detail,
  ].filter(Boolean);

  const message =
    msgCandidates.length > 0 ? String(msgCandidates[0]) : undefined;

  // 1) Nếu có status chữ hợp lệ
  for (const v of directCandidates) {
    if (typeof v === "string" && isTxnStatus(v)) return { status: v, message };
  }

  // 2) Nếu có code dạng "00", "01", ...
  for (const v of directCandidates) {
    if (typeof v === "string" && v.trim() !== "" && !isTxnStatus(v)) {
      // nếu là "00"/"01"/...
      if (/^\d{2}$/.test(v.trim())) {
        return { status: mapVnpCodeToStatus(v.trim()), message };
      }
    }
    if (typeof v === "number") {
      const s = String(v);
      if (/^\d{2}$/.test(s)) {
        return { status: mapVnpCodeToStatus(s), message };
      }
    }
  }

  // 3) Nếu có success boolean mà không có status/code
  if (typeof obj.success === "boolean") {
    return { status: obj.success ? "SUCCESS" : "FAILED", message };
  }
  if (typeof obj?.data?.success === "boolean") {
    return { status: obj.data.success ? "SUCCESS" : "FAILED", message };
  }

  return { message };
}

export async function getVnpayStatus(txnRef: string): Promise<VnpayStatusResult> {
  if (!txnRef) {
    return {
      status: "ERROR",
      message: "Thiếu txnRef. Không thể kiểm tra trạng thái thanh toán.",
    };
  }

  const url = `${API_BASE}/payments/vnpay/status?txnRef=${encodeURIComponent(
    txnRef
  )}`;

  try {
    const res = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: { "Accept": "application/json" },
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") || "";
    let body: any = null;

    if (contentType.includes("application/json")) {
      body = await res.json().catch(() => null);
    } else {
      const text = await res.text().catch(() => "");
      // nếu server trả text JSON string
      try {
        body = JSON.parse(text);
      } catch {
        body = { message: text };
      }
    }

    const extracted = extractStatusFromAny(body);

    if (!extracted.status) {
      return {
        status: "ERROR",
        message:
          extracted.message ||
          "Server trả về dữ liệu trạng thái không đúng định dạng. Vui lòng bấm “Kiểm tra lại” hoặc liên hệ hỗ trợ.",
        raw: body,
      };
    }

    // Nếu HTTP != 200 mà vẫn có status -> vẫn trả về để hiển thị
    return {
      status: extracted.status,
      message: extracted.message,
      raw: body,
    };
  } catch (err: any) {
    return {
      status: "ERROR",
      message: err?.message || "Không thể kết nối server để kiểm tra trạng thái.",
    };
  }
}
