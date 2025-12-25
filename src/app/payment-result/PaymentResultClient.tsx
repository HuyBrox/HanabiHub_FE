"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ArrowLeft,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ✅ dùng alias cho chắc path đúng trong app router
import { getVnpayStatus, TxnStatus } from "@/lib/vnpay";
import styles from "./result.module.css";

const coerceStatus = (s: any): TxnStatus => {
  if (
    s === "SUCCESS" ||
    s === "FAILED" ||
    s === "INVALID_SIGNATURE" ||
    s === "PENDING"
  )
    return s;
  return "PENDING";
};

function label(s: TxnStatus) {
  switch (s) {
    case "SUCCESS":
      return "Thanh toán thành công";
    case "FAILED":
      return "Thanh toán thất bại";
    case "INVALID_SIGNATURE":
      return "Chữ ký không hợp lệ";
    default:
      return "Đang xác nhận thanh toán...";
  }
}

function hint(s: TxnStatus) {
  switch (s) {
    case "SUCCESS":
      return "Giao dịch đã được ghi nhận. Bạn có thể quay lại trang chủ hoặc kiểm tra đơn hàng.";
    case "FAILED":
      return "Giao dịch không thành công. Bạn có thể thử lại hoặc kiểm tra thông tin thanh toán.";
    case "INVALID_SIGNATURE":
      return "Dữ liệu phản hồi không hợp lệ. Vui lòng thử kiểm tra lại trạng thái hoặc liên hệ hỗ trợ.";
    default:
      return "Hệ thống đang chờ IPN từ VNPAY. Thường mất vài giây…";
  }
}

/**
 * ✅ Trích status an toàn từ nhiều kiểu response khác nhau
 * (vì BE có thể trả {tx}, {data:{tx}}, {data}, {status}, ...)
 */
function extractStatusFromAny(resp: any): TxnStatus | null {
  const candidates = [
    resp?.tx?.status,
    resp?.data?.tx?.status,
    resp?.data?.status,
    resp?.status,
    resp?.txStatus,
    resp?.data?.txStatus,
  ];

  for (const c of candidates) {
    if (c) return coerceStatus(c);
  }
  return null;
}

export default function PaymentResultClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const txnRef = sp.get("txnRef") || "";
  const statusFromReturn = coerceStatus(sp.get("status"));

  const [status, setStatus] = useState<TxnStatus>(statusFromReturn);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // debug raw response (để biết BE trả gì)
  const [raw, setRaw] = useState<any>(null);
  const [showRaw, setShowRaw] = useState(false);

  const title = useMemo(() => label(status), [status]);

  const variant =
    status === "SUCCESS"
      ? "success"
      : status === "PENDING"
      ? "pending"
      : "fail";

  // ✅ confetti: dynamic import (client-only)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;

    const fire = async () => {
      if (status !== "SUCCESS") return;
      const mod = await import("canvas-confetti");
      const confetti = mod.default;

      confetti({ particleCount: 130, spread: 90, origin: { y: 0.72 } });
      t = setTimeout(() => {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.78 } });
      }, 350);
    };

    fire();
    return () => {
      if (t !== undefined) clearTimeout(t);
    };
  }, [status]);

  // ✅ poll BE status (IPN có thể về muộn)
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const run = async () => {
      if (!txnRef) {
        setChecking(false);
        setError("Thiếu txnRef. (BE redirect về FE phải có txnRef)");
        return;
      }

      setChecking(true);
      setError("");
      setRaw(null);
      setShowRaw(false);

      const start = Date.now();
      const MAX = 20000; // 20s
      const STEP = 1500; // 1.5s

      const tick = async () => {
        if (stopped) return;

        try {
          const resp: any = await getVnpayStatus(txnRef);
          setRaw(resp);

          // ✅ cố gắng extract status từ mọi format
          const nextStatus = extractStatusFromAny(resp);

          if (!nextStatus) {
            setChecking(false);
            setError(
              "Không đọc được trạng thái từ server (response không đúng định dạng). Vui lòng bấm “Kiểm tra lại” hoặc liên hệ hỗ trợ."
            );
            return;
          }

          setStatus(nextStatus);

          if (nextStatus !== "PENDING") {
            setChecking(false);
            return;
          }

          if (Date.now() - start > MAX) {
            setChecking(false);
            return;
          }

          t = setTimeout(tick, STEP);
        } catch (e: any) {
          setChecking(false);

          const msg = String(e?.message || "Không thể kiểm tra trạng thái");

          if (msg.toLowerCase().includes("invalid response format")) {
            setError(
              "Server trả về dữ liệu trạng thái không đúng định dạng. Vui lòng bấm “Kiểm tra lại” hoặc liên hệ hỗ trợ."
            );
          } else {
            setError(msg);
          }

          if (e?.raw) setRaw(e.raw);
        }
      };

      tick();
    };

    run();
    return () => {
      stopped = true;
      if (t !== undefined) clearTimeout(t);
    };
  }, [txnRef]);

  const Icon =
    status === "SUCCESS"
      ? CheckCircle2
      : status === "PENDING"
      ? Loader2
      : XCircle;

  const onCopy = async () => {
    if (!txnRef) return;
    try {
      await navigator.clipboard.writeText(txnRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.bgOrnament} />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.brandMark}>
            <span className={styles.brandVN}>VN</span>
            <span className={styles.brandPAY}>PAY</span>
          </div>
          <div className={styles.brandMeta}>
            <div className={styles.brandTitle}>Kết quả thanh toán</div>
            <div className={styles.brandSub}>Cổng thanh toán VNPAY</div>
          </div>
          <div className={styles.brandChip}>Secure</div>
        </div>

        {/* Status */}
        <div className={`${styles.statusBox} ${styles[variant]}`}>
          <div className={styles.iconBubble} aria-hidden="true">
            <Icon
              size={26}
              className={variant === "pending" ? styles.spin : ""}
            />
          </div>

          <div className={styles.statusText}>
            <h1 className={styles.h1}>{title}</h1>
            <p className={styles.p}>{hint(status)}</p>

            {variant === "pending" && (
              <div className={styles.progressWrap} aria-hidden="true">
                <div className={styles.progressBar} />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className={styles.grid}>
          <div className={styles.kv}>
            <div className={styles.k}>Mã giao dịch (txnRef)</div>
            <div className={styles.vMono}>{txnRef || "—"}</div>
          </div>

          <div className={styles.kv}>
            <div className={styles.k}>Trạng thái</div>
            <div className={styles.vStrong}>{status}</div>
          </div>
        </div>

        <div className={styles.tools}>
          <button
            className={styles.copyBtn}
            onClick={onCopy}
            disabled={!txnRef}
            title="Copy txnRef"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? "Đã copy" : "Copy txnRef"}
          </button>

          <div className={styles.note}>
            {checking
              ? "Đang tự động kiểm tra trạng thái…"
              : "Bạn có thể bấm kiểm tra lại nếu cần."}
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className={styles.errorBox}
            >
              <div>{error}</div>

              {/* ✅ debug raw response */}
              {raw && (
                <button
                  type="button"
                  onClick={() => setShowRaw((v) => !v)}
                  style={{
                    marginTop: 10,
                    display: "inline-flex",
                    gap: 6,
                    alignItems: "center",
                    fontSize: 12,
                    opacity: 0.9,
                  }}
                >
                  {showRaw ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {showRaw ? "Ẩn chi tiết" : "Xem chi tiết (debug)"}
                </button>
              )}

              {raw && showRaw && (
                <pre
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 10,
                    background: "rgba(0,0,0,0.06)",
                    overflow: "auto",
                    fontSize: 12,
                    lineHeight: 1.35,
                    maxHeight: 220,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {JSON.stringify(raw, null, 2)}
                </pre>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.btnPrimary}
            onClick={() => router.push("/courses")}
          >
            <ArrowLeft size={18} />
            Về trang chủ
          </button>

          <button
            className={styles.btnGhost}
            onClick={() => window.location.reload()}
            disabled={checking}
            title={checking ? "Đang kiểm tra…" : "Kiểm tra lại"}
          >
            <RefreshCw size={18} className={checking ? styles.spinSlow : ""} />
            {checking ? "Đang kiểm tra..." : "Kiểm tra lại"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
