"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetUserQuery } from "@/store/services/admin/usersAdminApi";

/** Helpers nhỏ để không lệ thuộc file utils */
function formatDate(input?: string | Date) {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRole(role?: string, isAdmin?: boolean) {
  if (role) return role;
  return isAdmin ? "admin" : "user";
}

function formatStatus(status?: string, isActive?: boolean) {
  if (status) return status;
  if (isActive === false) return "inactive";
  return "active";
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  // id trong app router có thể là string | string[]
  const rawId = (params?.id ?? "") as string | string[];
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { data, isLoading, isFetching, error } = useGetUserQuery(id, {
    skip: !id,
  });

  const user = data?.data; // BE trả { success, data: User }

  if (!id) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
          Không tìm thấy tham số <b>id</b> trên URL.
        </div>
      </div>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="p-4">
        <div className="animate-pulse rounded-lg border border-slate-200 bg-white p-4">
          Đang tải chi tiết người dùng...
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-4">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">
          Không tải được chi tiết người dùng hoặc người dùng không tồn tại.
        </div>
      </div>
    );
  }

  const displayName = user.fullname || user.name || user.username || "—";
  const email = user.email || "—";
  const role = formatRole(user.role as string | undefined, (user as any).isAdmin);
  const status = formatStatus(user.status as string | undefined, (user as any).isActive);
  const lastLogin = (user as any).lastLoginAt || (user as any).updatedAt || user.createdAt;

  return (
    <div style={{ paddingBottom: 24 }} className="max-w-[900px] mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
          Chi Tiết Người Dùng
        </h1>
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
        >
          ← Quay lại
        </button>
      </div>

      {/* Card nội dung */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="m-0 mb-1 text-slate-500 text-sm">Tên</p>
            <p className="m-0 text-[15px] font-semibold text-slate-800">{displayName}</p>
          </div>

          <div>
            <p className="m-0 mb-1 text-slate-500 text-sm">Email</p>
            <p className="m-0 text-[15px] font-medium text-slate-800">{email}</p>
          </div>

          <div>
            <p className="m-0 mb-1 text-slate-500 text-sm">Vai trò</p>
            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              {role}
            </span>
          </div>

          <div>
            <p className="m-0 mb-1 text-slate-500 text-sm">Trạng thái</p>
            <span
              className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
                status === "active"
                  ? "bg-emerald-100 text-emerald-700"
                  : status === "inactive"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {status}
            </span>
          </div>

          <div>
            <p className="m-0 mb-1 text-slate-500 text-sm">Đăng nhập cuối</p>
            <p className="m-0 text-[15px] font-medium text-slate-800">
              {formatDate(lastLogin)}
            </p>
          </div>

          <div>
            <p className="m-0 mb-1 text-slate-500 text-sm">Ngày tạo</p>
            <p className="m-0 text-[15px] font-medium text-slate-800">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* Avatar & username (tuỳ có/không) */}
        {(user as any).avatar || user.username ? (
          <div className="mt-6 flex items-center gap-3">
            {(user as any).avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={(user as any).avatar}
                alt="avatar"
                className="h-12 w-12 rounded-full border border-slate-200 object-cover"
              />
            ) : null}
            {user.username ? (
              <div className="text-sm text-slate-600">
                <b>Username:</b> {user.username}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
