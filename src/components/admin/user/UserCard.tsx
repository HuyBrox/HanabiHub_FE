import styles from "./UserCard.module.css";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  online?: boolean;
  lastLoginAt?: string;
};

export default function UserCard({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const initial = user.name?.[0]?.toUpperCase() ?? "U";

  const roleClass = {
    admin: styles.badgeRed,
    moderator: styles.badgeYellow,
    user: styles.badgeBlue,
    viewer: styles.badgeGreen,
  }[user.role] ?? styles.badgeGray;

  /* ============================
        ONLINE CHIP (dùng online thật)
     ============================ */
  const isOnline = user.online === true; // 👈 dùng BE trả về

  const onlineChip = (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isOnline
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`mr-1 h-2 w-2 rounded-full ${
          isOnline ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {isOnline ? "Online" : "Offline"}
    </span>
  );

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <div className={styles.avatar}>{initial}</div>

        <div>
          <div className={styles.name}>{user.name}</div>
          <div className={styles.email}>{user.email}</div>
        </div>

        <button className={styles.more} title="More">
          ⋯
        </button>
      </div>

      {/* ===================== */}
      {/*    ROLE + ONLINE      */}
      {/* ===================== */}
      <div className={styles.meta}>
        <span className={`${styles.badge} ${roleClass}`}>{user.role}</span>

        {/* 👇 CHIP ONLINE mới */}
        {onlineChip}
      </div>

      <div className={styles.footer}>
        <span className={styles.note}>
          Đăng nhập cuối: {user.lastLoginAt ?? "Không rõ"}
        </span>

        <div className={styles.actions}>
          <button
            onClick={() => onEdit?.(user.id)}
            className={styles.link}
          >
            ✏️ Sửa
          </button>
          <button
            onClick={() => onDelete?.(user.id)}
            className={`${styles.link} ${styles.danger}`}
          >
            🗑️ Xóa
          </button>
        </div>
      </div>
    </div>
  );
}
