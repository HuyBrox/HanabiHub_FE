"use client";

import {
  useEffect,
  useMemo,
  useState,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
} from "react";
import styles from "./UpdateUserModal.module.css";
import {
  useGetAdminUserByIdQuery,
  useUpdateAdminUserMutation,
} from "@/store/services/admin/usersAdminApi";

// CHỈ CÒN 2 ROLE & 2 STATUS
type Role = "admin" | "user";
type Status = "active" | "inactive";

type Props = {
  open: boolean;
  userId?: string;
  onClose: () => void;
};

export default function UpdateUserModal({ open, userId, onClose }: Props) {
  const { data, isLoading: loadingUser } = useGetAdminUserByIdQuery(userId!, {
    skip: !open || !userId,
  });

  const [fullname, setFullname] = useState("");
  const [role, setRole] = useState<Role>("user");
  const [status, setStatus] = useState<Status>("active");

  const [updateUser, { isLoading, error }] = useUpdateAdminUserMutation();
  const [clientErr, setClientErr] = useState("");

  const apiErrMsg = useMemo(() => {
    const anyErr = error as any;
    return (
      anyErr?.data?.message ||
      anyErr?.error ||
      (typeof anyErr === "string" ? anyErr : "")
    );
  }, [error]);

  const notFound = !loadingUser && !!userId && !data?.data;

  // Đổ data từ BE vào form
  useEffect(() => {
    if (data?.data && open) {
      const u = data.data;
      setFullname(u.name || "");
      setRole((u.role as Role) || "user");

      // nếu BE trả về gì lạ thì fallback về "active"
      const s = (u.status as Status) || "active";
      setStatus(s === "inactive" ? "inactive" : "active");
    }
  }, [data, open]);

  // ESC để đóng modal
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent | any) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isLoading, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setClientErr("");

    if (!fullname.trim()) {
      setClientErr("Vui lòng nhập họ và tên");
      return;
    }

    if (!userId) return;

    try {
      await updateUser({
        id: userId,
        body: {
          fullname: fullname.trim(),
          role,
          status,
        },
      }).unwrap();

      onClose();
    } catch {
      // lỗi đã hiển thị ở apiErrMsg
    }
  };

  // click ra ngoài để đóng modal
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-user-title"
    >
      <form
        className={styles.modal}
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="update-user-title">Chỉnh sửa người dùng</h2>
        <p>Cập nhật họ tên, vai trò và trạng thái hoạt động của tài khoản.</p>

        {(clientErr || apiErrMsg || notFound) && (
          <div className={styles.error}>
            {notFound
              ? "Không tìm thấy thông tin người dùng. Vui lòng tải lại trang."
              : clientErr || apiErrMsg || "Không thể lưu. Vui lòng thử lại."}
          </div>
        )}

        {loadingUser ? (
          <div className={styles.loading}>Đang tải thông tin…</div>
        ) : !notFound ? (
          <>
            <label className={styles.label}>
              Họ và tên
              <input
                className={styles.input}
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
                placeholder="Nhập họ và tên…"
                autoFocus
              />
            </label>

            <div className={styles.row}>
              <label className={styles.label}>
                Vai trò
                <select
                  className={styles.select}
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </label>

              <label className={styles.label}>
                Trạng thái
                <select
                  className={styles.select}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Status)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
            </div>
          </>
        ) : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancel}
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            type="submit"
            className={styles.primary}
            disabled={isLoading || notFound}
          >
            {isLoading ? "Đang lưu…" : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}
