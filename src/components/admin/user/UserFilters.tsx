import React, { useState } from "react";

type RoleFilter = "" | "admin" | "user";
type StatusFilter = "" | "active" | "inactive";

interface UserFiltersProps {
  onSearch: (q: string) => void;
  onChangeRole: (role: RoleFilter) => void;
  onChangeStatus: (status: StatusFilter) => void;
}

export default function UserFilters({
  onSearch,
  onChangeRole,
  onChangeStatus,
}: UserFiltersProps) {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {/* Search box */}
      <input
        className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none 
                   focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        placeholder="Tìm theo tên / email"
        value={search}
        onChange={(e) => {
          const v = e.target.value;
          setSearch(v);
          onSearch(v);
        }}
      />

      {/* Role filter */}
      <select
        className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none 
                   focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        onChange={(e) => onChangeRole(e.target.value as RoleFilter)}
      >
        <option value="">Vai trò (tất cả)</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>

      {/* Status filter — ❌ không còn blocked */}
      <select
        className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none 
                   focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
        onChange={(e) => onChangeStatus(e.target.value as StatusFilter)}
      >
        <option value="">Trạng thái (tất cả)</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
}
