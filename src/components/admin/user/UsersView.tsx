"use client";

import { useMemo, useState } from "react";
import styles from "./UsersView.module.css";
// Các component sẵn có của b (giữ nguyên api props như b đang dùng)
import StatsCards from "./StatsCards";
import UserFilters from "./UserFilters";
import UserGrid from "./UserGrid";
import CreateUserModal from "./CreateUserModal";
import UpdateUserModal from "./UpdateUserModal";
import DeleteUserDialog from "./DeleteUserDialog";

// RTK Query hooks đã tạo
import {
  useListUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  type User,
} from "@/store/services/admin/usersAdminApi";

// Debounce nhỏ để search mượt
function useDebounced<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  // đơn giản: đổi state sau delay
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function UsersView() {
  // UI state
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<{ open: boolean; id?: string }>({ open: false });
  const [openDelete, setOpenDelete] = useState<{ open: boolean; id?: string }>({ open: false });

  // filter/search
  const [searchQ, setSearchQ] = useState("");
  const debouncedQ = useDebounced(searchQ, 450);

  // gọi API list
  const { data, isLoading, isFetching, error } = useListUsersQuery(
    { search: debouncedQ, page: 1, limit: 12 },
    { refetchOnMountOrArgChange: true }
  );

  // mutations (nếu b cần gọi trực tiếp trong modal)
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  // dữ liệu hiển thị
  const users: User[] = data?.data ?? [];

  // thống kê bốn thẻ
  const stats = useMemo(() => {
    const total = users.length;
    const admin = users.filter((u) => (u as any).role === "admin").length;
    const online = users.filter((u) => (u as any).online || (u as any).isOnline).length;
    // viewCount: giả lập nếu BE chưa có trường này
    const viewCount = 8700;

    return { total, admin, online, viewCount };
  }, [users]);

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Quản Lý Người Dùng</h1>
          <p className={styles.subtitle}>Tổng quan về tài khoản người dùng và công cụ quản trị.</p>
        </div>
        <button className={styles.primaryBtn} onClick={() => setOpenCreate(true)}>
          + Thêm Người Dùng
        </button>
      </div>

      {/* STATS */}
      <StatsCards
        totalUsers={stats.total}
        adminCount={stats.admin}
        onlineCount={stats.online}
        views={stats.viewCount}
      />

      {/* FILTERS */}
      <div className={styles.card}>
        <UserFilters
          onSearch={(q: string) => setSearchQ(q)}
          // nếu b có role/status trong UserFilters có thể thêm prop onChange...
        />
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
      <CreateUserModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        // nếu modal cần gọi API:
        // onSubmit={async (payload) => { await createUser(payload).unwrap(); setOpenCreate(false); }}
      />

      <UpdateUserModal
        open={openUpdate.open}
        userId={openUpdate.id}
        onClose={() => setOpenUpdate({ open: false })}
        // onSubmit={async (payload) => { if (!openUpdate.id) return; await updateUser({ id: openUpdate.id, payload}).unwrap(); setOpenUpdate({open:false}); }}
      />

      <DeleteUserDialog
        open={openDelete.open}
        userId={openDelete.id}
        onClose={() => setOpenDelete({ open: false })}
        // onConfirm={async () => { if (!openDelete.id) return; await deleteUser(openDelete.id).unwrap(); setOpenDelete({open:false}); }}
      />
    </div>
  );
}
