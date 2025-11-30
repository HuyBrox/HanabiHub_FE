"use client";

import { useState } from "react";
import styles from "./UserFilters.module.css";

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
    <div className={styles.wrap}>
      {/* Search */}
      <input
        className={styles.input}
        placeholder="Tìm theo tên / email…"
        value={search}
        onChange={(e) => {
          const v = e.target.value;
          setSearch(v);
          onSearch(v);
        }}
      />

      {/* Role */}
      <select
        className={styles.select}
        onChange={(e) => onChangeRole(e.target.value as RoleFilter)}
      >
        <option value="">Vai trò (Tất cả)</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>

      {/* Status */}
      <select
        className={styles.select}
        onChange={(e) => onChangeStatus(e.target.value as StatusFilter)}
      >
        <option value="">Trạng thái (Tất cả)</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
}
