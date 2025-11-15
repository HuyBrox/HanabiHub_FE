"use client";

type Role = "admin" | "moderator" | "user" | "viewer";
type Status = "active" | "inactive" | "blocked";

export interface AdminUserView {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  online?: boolean;          // 👈 nhận từ BE
  lastLoginAt?: string;
  avatar?: string;
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

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {users.map((user) => {
        const initial = user.name?.[0]?.toUpperCase() ?? "U";

        const roleLabel: Record<Role, string> = {
          admin: "Admin",
          moderator: "Moderator",
          user: "User",
          viewer: "Viewer",
        };

        const roleColor: Record<Role, string> = {
          admin: "bg-rose-50 text-rose-700",
          moderator: "bg-amber-50 text-amber-700",
          user: "bg-sky-50 text-sky-700",
          viewer: "bg-emerald-50 text-emerald-700",
        };

        const statusLabel: Record<Status, string> = {
          active: "Đang hoạt động",
          inactive: "Ngưng hoạt động",
          blocked: "Đã chặn",
        };

        // 👇 DÙNG CỜ online THẬT TỪ BE
        const isOnline = user.online === true;

        return (
          <article
            key={user.id}
            className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
          >
            {/* Menu 3 chấm */}
            <button
              className="absolute right-4 top-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              type="button"
            >
              ⋯
            </button>

            {/* Header: avatar + name + email */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-semibold text-white shadow-sm">
                {initial}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-slate-900">
                  {user.name}
                </h3>
                <p className="truncate text-xs text-slate-500">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Body: role + online chip + status text */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {/* Vai trò */}
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${roleColor[user.role]}`}
              >
                {roleLabel[user.role]}
              </span>

              {/* Online / Offline – DÙNG user.online */}
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
            </div>

            {/* Info lines */}
            <dl className="mt-4 space-y-2 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <dt className="font-medium text-slate-600">Trạng thái hệ thống</dt>
                <dd className="text-right text-slate-700">
                  {statusLabel[user.status]}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1 font-medium text-slate-600">
                  <span className="text-[11px]">⏱</span> Đăng nhập cuối
                </dt>
                <dd className="text-right">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString("vi-VN")
                    : "Không rõ"}
                </dd>
              </div>
            </dl>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => onEdit?.(user.id)}
                  className="inline-flex items-center gap-1 font-medium text-violet-600 hover:text-violet-700"
                >
                  <span className="text-[11px]">✏️</span> Sửa
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(user.id)}
                  className="inline-flex items-center gap-1 font-medium text-rose-600 hover:text-rose-700"
                >
                  <span className="text-[11px]">🗑</span> Xóa
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
