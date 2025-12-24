"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  StatsCards,
} from "@/components/admin/user";
import {
  useGetAdminUserByIdQuery,
  useUpdateAdminUserMutation,
  type Role,
  type Status,
} from "@/store/services/admin/usersAdminApi";

type FormState = {
  fullname: string;
  email: string;
  role: Role;
  status: Status;
};

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const rawId = (params?.id ?? "") as string | string[];
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const { data, isLoading, isFetching, error } = useGetAdminUserByIdQuery(id, {
    skip: !id,
  });
  const [updateUser, { isLoading: saving }] = useUpdateAdminUserMutation();

  // Map dữ liệu BE -> form
  const initialForm: FormState | null = useMemo(() => {
    const u = data?.data;
    if (!u) return null;
    return {
      fullname: u.fullname || u.name || u.username || "",
      email: u.email || "",
      role: (u.role as Role) ?? ((u as any).isAdmin ? "admin" : "user"),
      status: (u.status as Status) ?? ((u as any).isActive === false ? "inactive" : "active"),
    };
  }, [data]);

  const [form, setForm] = useState<FormState | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (initialForm) setForm(initialForm);
  }, [initialForm]);

  const onChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    if (!form) return;
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    if (!form || !id) return;
    setMsg(null);
    try {
      await updateUser({
        id,
        body: {
          fullname: form.fullname,
          role: form.role,
          status: form.status,
        },
      }).unwrap();
      setMsg({ type: "success", text: "Cập nhật thành công!" });
      // Optional: quay lại danh sách
      // router.push("/admin/users");
    } catch (e: any) {
      setMsg({ type: "error", text: e?.data?.message || "Cập nhật thất bại. Vui lòng thử lại." });
    }
  };

  if (!id) {
    return (
      <div className="max-w-[1100px] mx-auto p-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
          Không tìm thấy tham số <b>id</b> trên URL.
        </div>
      </div>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="max-w-[1100px] mx-auto p-4">
        <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
          Đang tải thông tin người dùng...
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="max-w-[1100px] mx-auto p-4">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-rose-700">
          Không tải được dữ liệu người dùng hoặc người dùng không tồn tại.
        </div>
        <button
          onClick={() => router.back()}
          className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
            Chỉnh sửa người dùng
          </h1>
          <p className="mt-1 text-slate-600">Cập nhật thông tin tài khoản và quyền hạn.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            ← Quay lại
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>

      {/* (Tuỳ chọn) Thẻ thống kê dùng chung */}
      <StatsCards />

      {/* Form chỉnh sửa */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {msg && (
          <div
            className={`mb-4 rounded-lg border p-3 text-sm ${
              msg.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Họ tên */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Họ và tên</span>
            <input
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-400"
              value={form.fullname}
              onChange={(e) => onChange("fullname", e.target.value)}
              placeholder="VD: Nguyễn Văn A"
            />
          </label>

          {/* Email - Read only */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Email (không thể chỉnh sửa)</span>
            <input
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 outline-none cursor-not-allowed"
              type="email"
              value={form.email}
              disabled
              placeholder="VD: a@example.com"
            />
          </label>

          {/* Vai trò */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Vai trò</span>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-400"
              value={form.role}
              onChange={(e) => onChange("role", e.target.value as FormState["role"])}
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </label>

          {/* Trạng thái */}
          <label className="flex flex-col gap-1">
            <span className="text-sm text-slate-600">Trạng thái</span>
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-slate-400"
              value={form.status}
              onChange={(e) => onChange("status", e.target.value as FormState["status"])}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
