"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./CreateUserModal.module.css";
import {
  useCreateAdminUserMutation,
  type Role,
  type Status,
} from "@/store/services/admin/usersAdminApi";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function CreateUserModal({ open, onClose, onCreated }: Props) {
  // state form
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [role, setRole] = useState<Role>("user");
  const [status, setStatus] = useState<Status>("active");
  const [clientErr, setClientErr] = useState("");

  const [createUser, { isLoading, error }] = useCreateAdminUserMutation();

  const apiErrMsg = useMemo(() => {
    const anyErr = error as any;
    return (
      anyErr?.data?.message ||
      anyErr?.error ||
      (typeof anyErr === "string" ? anyErr : "")
    );
  }, [error]);

  const validate = () => {
    if (!fullname.trim()) return "Vui lòng nhập họ và tên";
    if (!email.trim()) return "Vui lòng nhập email";
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) return "Email không hợp lệ";

    if (!password.trim()) return "Vui lòng nhập mật khẩu";
    if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";

    if (!confirmPassword.trim()) return "Vui lòng xác nhận mật khẩu";
    if (password !== confirmPassword)
      return "Mật khẩu xác nhận không khớp";

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClientErr("");

    const v = validate();
    if (v) {
      setClientErr(v);
      return;
    }

    try {
      await createUser({
        fullname: fullname.trim(),
        email: email.trim(),
        password: password.trim(),
        role,
        status, // chỉ "active" | "inactive"
      }).unwrap();

      // reset form
      setFullname("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("user");
      setStatus("active");

      onClose?.();
      onCreated?.();
    } catch {
      // lỗi đã hiển thị qua apiErrMsg
    }
  };

  // reset lỗi khi đóng
  useEffect(() => {
    if (!open) setClientErr("");
  }, [open]);

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <form className={styles.modal} onSubmit={handleSubmit}>
        <h2>Thêm người dùng</h2>

        {(clientErr || apiErrMsg) && (
          <div className={styles.error}>
            {clientErr || apiErrMsg || "Không thể lưu. Vui lòng thử lại."}
          </div>
        )}

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

        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
          />
        </label>

        <label className={styles.label}>
          Mật khẩu
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu…"
          />
        </label>

        <label className={styles.label}>
          Xác nhận mật khẩu
          <input
            className={styles.input}
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu…"
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

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancel}
            onClick={onClose}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button type="submit" className={styles.primary} disabled={isLoading}>
            {isLoading ? "Đang lưu…" : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}
