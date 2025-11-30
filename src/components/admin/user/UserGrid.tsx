"use client";

import styles from "./UserGrid.module.css";

type Role = "admin" | "user";
type Status = "active" | "inactive";

export interface AdminUserView {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  online?: boolean;
  lastLoginAt?: string;
}

interface UserGridProps {
  users: AdminUserView[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function UserGrid({ users, onEdit, onDelete }: UserGridProps) {
  if (!users.length) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-sm text-slate-500">
        Không có kết quả phù hợp.
      </div>
    );
  }

  const roleLabel: Record<Role, string> = {
    admin: "Admin",
    user: "User",
  };

  const statusLabel: Record<Status, string> = {
    active: "Đang hoạt động",
    inactive: "Ngưng hoạt động",
  };

  return (
    <div className={styles.grid}>
      {users.map((user) => {
        const initial = user.name?.[0]?.toUpperCase() ?? "U";

        /* ==== ROLE COLOR ==== */
        const roleClass = user.role === "admin" ? styles.role_admin : styles.role_user;

        /* ==== ONLINE CHIP ==== */
        const isOnline = user.online === true && user.status === "active";

        const stateClass = isOnline ? styles.state_online : styles.state_offline;
        const dotClass = isOnline ? styles.dotOn : styles.dotOff;
        const stateText = isOnline ? "Online" : "Offline";

        /* ==== AVATAR COLOR ==== */
        const avatarClass = user.role === "admin" ? styles.av_admin : styles.av_user;

        const lastLogin = user.lastLoginAt
          ? new Date(user.lastLoginAt).toLocaleDateString("vi-VN")
          : "Không rõ";

        return (
          <article key={user.id} className={styles.card}>
            {/* Header: avatar + info + menu */}
            <div className={styles.row}>
              <div className={`${styles.avatar} ${avatarClass}`}>{initial}</div>

              <div className={styles.flexGrow}>
                <div className={styles.name}>{user.name}</div>
                <div className={styles.email}>{user.email}</div>
              </div>

              <button className={styles.kebab} type="button">
                ⋯
              </button>
            </div>

            {/* Role + Online */}
            <div className={styles.metaGrid}>
              <div>
                <div className={styles.metaLabel}>Vai trò</div>
                <div className={`${styles.badge} ${roleClass}`}>
                  {roleLabel[user.role]}
                </div>
              </div>

              <div>
                <div className={styles.metaLabel}>Trạng thái</div>
                <div className={`${styles.badge} ${stateClass}`}>
                  <span className={`${styles.dot} ${dotClass}`} />
                  {stateText}
                </div>
              </div>
            </div>

            {/* Last login */}
            <div className={styles.lastRow}>
              <span className={styles.clock}>⏱</span>
              <span>
                Đăng nhập cuối:{" "}
                <span className={styles.lastStrong}>{lastLogin}</span>
              </span>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button
                type="button"
                onClick={() => onEdit?.(user.id)}
                className={`${styles.link} ${styles.linkEdit}`}
              >
                ✏️ Sửa
              </button>

              <button
                type="button"
                onClick={() => onDelete?.(user.id)}
                className={`${styles.link} ${styles.linkDel}`}
              >
                🗑 Xóa
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
