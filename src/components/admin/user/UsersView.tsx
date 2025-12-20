"use client";

import { useMemo, useState } from "react";
import styles from "./UsersView.module.css";

import StatsCards from "./StatsCards";
import UserFilters from "./UserFilters";
import UserGrid from "./UserGrid";
import CreateUserModal from "./CreateUserModal";
import UpdateUserModal from "./UpdateUserModal";
import DeleteUserDialog from "./DeleteUserDialog";

// RTK Query API
import {
  useListAdminUsersQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useGetAdminStatsQuery,
  type AdminUserDTO as User,
} from "@/store/services/admin/usersAdminApi";

// Debounce search
function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useMemo(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function UsersView() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<{ open: boolean; id?: string }>({
    open: false,
  });
  const [openDelete, setOpenDelete] = useState<{ open: boolean; id?: string }>(
    { open: false }
  );

  const [searchQ, setSearchQ] = useState("");
  const debouncedQ = useDebounced(searchQ, 450);

  /** GET list users */
  const { data, isLoading, isFetching, error } = useListAdminUsersQuery(
    { search: debouncedQ, page: 1, limit: 12 },
    { refetchOnMountOrArgChange: true }
  );

  /** GET stats */
  const { data: statsData, isLoading: statsLoading } = useGetAdminStatsQuery();

  /** API mutations */
  const [createUser] = useCreateAdminUserMutation();
  const [updateUser] = useUpdateAdminUserMutation();
  const [deleteUser] = useDeleteAdminUserMutation();

  const users: User[] = data?.data ?? [];

  /** Fallback stats nếu BE không trả về metrics */
  const localStats = useMemo(() => {
    const total = users.length;
    const admin = users.filter((u) => u.role === "admin").length;
    const online = users.filter((u) => u.online || (u as any).isOnline).length;
    return { total, admin, online };
  }, [users]);

  /** Ghép stats từ BE + fallback */
  const mergedStats = {
    totalUsers: statsData?.data.totalUsers ?? localStats.total,
    adminCount: statsData?.data.adminCount ?? localStats.admin,
    onlineCount: statsData?.data.onlineCount ?? localStats.online,

    // GIỮ METRICS CHO % THÁNG TRƯỚC
    metrics: statsData?.data.metrics ?? {
      users: { changePercent: null },
      admins: { changePercent: null },
    },
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Quản Lý Người Dùng</h1>
          <p className={styles.subtitle}>Tổng quan về tài khoản người dùng và công cụ quản trị.</p>
        </div>
      </div>

      {/* 4 STAT CARDS */}
      <StatsCards
        totalUsers={mergedStats.totalUsers}
        adminCount={mergedStats.adminCount}
        onlineCount={mergedStats.onlineCount}
        metrics={mergedStats.metrics}
        loading={statsLoading}
        onOpenCreate={() => setOpenCreate(true)}
      />

      {/* FILTERS */}
      <div className={styles.card}>
        <UserFilters onSearch={(q: string) => setSearchQ(q)} />
      </div>

      {/* LIST */}
      <div className={styles.card}>
        {isLoading || isFetching ? (
          <div className={styles.loading}>Đang tải danh sách...</div>
        ) : error ? (
          <div className={styles.error}>Không tải được danh sách. Thử lại sau.</div>
        ) : (
          <UserGrid
            users={users}
            onEdit={(id) => setOpenUpdate({ open: true, id })}
            onDelete={(id) => setOpenDelete({ open: true, id })}
          />
        )}
      </div>

      {/* MODALS */}
      <CreateUserModal open={openCreate} onClose={() => setOpenCreate(false)} />
      <UpdateUserModal
        open={openUpdate.open}
        userId={openUpdate.id}
        onClose={() => setOpenUpdate({ open: false })}
      />
      <DeleteUserDialog
        open={openDelete.open}
        userId={openDelete.id}
        onClose={() => setOpenDelete({ open: false })}
      />
    </div>
  );
}
