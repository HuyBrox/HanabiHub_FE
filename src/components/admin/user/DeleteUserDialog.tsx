"use client";

import { useMemo } from "react";
import styles from "./CreateUserModal.module.css";
import {
  useSoftDeleteAdminUserMutation,
  useDeleteAdminUserMutation,
} from "@/store/services/admin/usersAdminApi";

type Props = {
  open: boolean;
  userId?: string;
  onClose: () => void;
  onDeleted?: () => void;     // optional: để page refetch
  mode?: "soft" | "hard";     // mặc định soft
};

export default function DeleteUserDialog({
  open,
  userId,
  onClose,
  onDeleted,
  mode = "soft",
}: Props) {
  const [softDelete, softState] = useSoftDeleteAdminUserMutation();
  const [hardDelete, hardState] = useDeleteAdminUserMutation();

  const isLoading = softState.isLoading || hardState.isLoading;
  const error = softState.error || hardState.error;

  const apiErrMsg = useMemo(() => {
    const anyErr = error as any;
    return anyErr?.data?.message || anyErr?.error || "";
  }, [error]);

  if (!open) return null;

  const handleDelete = async () => {
    if (!userId) return;
    try {
      if (mode === "hard") {
        await hardDelete(userId).unwrap();
      } else {
        await softDelete(userId).unwrap();
      }
      onDeleted?.();
      onClose?.();
    } catch {
      /* lỗi hiển thị ở apiErrMsg */
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Xác nhận xóa người dùng</h2>

        {apiErrMsg && <div className={styles.error}>{apiErrMsg}</div>}

        <p style={{ margin: "8px 0 16px", color: "#334155" }}>
          {mode === "hard"
            ? "Bạn có chắc muốn xóa vĩnh viễn người dùng này? Hành động không thể hoàn tác."
            : "Bạn có chắc muốn chuyển người dùng này vào thùng rác?"}
        </p>

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose} disabled={isLoading}>
            Hủy
          </button>
          <button
            type="button"
            className={styles.primary}
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Đang xóa…" : mode === "hard" ? "Xóa vĩnh viễn" : "Xóa (soft)"}
          </button>
        </div>
      </div>
    </div>
  );
}
