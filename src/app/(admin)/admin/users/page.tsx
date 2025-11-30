"use client";

import { useMemo, useState } from "react";
import {
  StatsCards,
  UserFilters,
  UserGrid,
  CreateUserModal,
  UpdateUserModal,
  DeleteUserDialog,
} from "@/components/admin/user";
import Pagination from "@/components/admin/user/Pagination";
import {
  useListAdminUsersQuery,
  useGetAdminStatsQuery,
  Role,
  Status,
} from "@/store/services/admin/usersAdminApi";

type RoleFilter = Role | "";
type StatusFilter = Status | "";

export default function UsersPage() {
  // ============ MODAL STATE ============
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<{ open: boolean; id?: string }>(
    { open: false }
  );
  const [openDelete, setOpenDelete] = useState<{ open: boolean; id?: string }>(
    { open: false }
  );

  // ============ FILTER + PAGING ============
  const [searchQ, setSearchQ] = useState("");
  const [role, setRole] = useState<RoleFilter>("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  const roleParam: Role | undefined = role || undefined;
  const statusParam: Status | undefined = status || undefined;

  // ============ CALL API LIST ============
  const { data, isLoading, isFetching, error, refetch } =
    useListAdminUsersQuery({
      page,
      limit,
      search: searchQ || undefined,
      role: roleParam,
      status: statusParam,
    });

  // ============ CALL API STATS ============
  const { data: stats, isLoading: statsLoading } = useGetAdminStatsQuery();

  // ============ MAP DATA -> USERGRID ============
  const users = useMemo(() => {
    const raw = data?.data ?? [];
    return raw.map((u: any) => ({
      id: u.id as string,
      name: (u.name ?? "Chưa rõ tên") as string,
      email: u.email as string,
      role: (u.role ?? "user") as Role,
      status: (u.status ?? "inactive") as Status,
      online: !!u.online,
      lastLoginAt: u.lastLoginAt as string | undefined,
      avatar: u.avatar as string | undefined,
    }));
  }, [data]);

  const pg = data?.pagination;
  const totalPages = pg?.totalPages ?? 1;

  // ============ ERROR TEXT ============
  const errorText = (() => {
    const anyErr = error as any;
    return (
      anyErr?.data?.message ||
      anyErr?.error ||
      (typeof anyErr === "string" ? anyErr : "")
    );
  })();

  // ============ RENDER ============
  return (
    <div className="mx-auto max-w-[1200px] p-4 sm:p-6">
      {/* HEADER */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              👥
            </span>
            <div>
              <h1 className="font-[Inter] text-3xl font-extrabold tracking-tight text-slate-800">
                Quản Lý Người Dùng
              </h1>
              <p className="font-[Inter] mt-2 text-lg text-slate-600">
                Tổng quan về tài khoản người dùng và công cụ quản trị.
              </p>
            </div>
          </div>

          <button
            onClick={() => setOpenCreate(true)}
            className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Thêm Người Dùng
          </button>
        </div>
      </div>

      {/* STATS */}
      <StatsCards
        totalUsers={stats?.data?.totalUsers ?? 0}
        adminCount={stats?.data?.adminCount ?? 0}
        onlineCount={stats?.data?.onlineCount ?? 0}
        visits={stats?.data?.visits ?? 0}
        metrics={stats?.data?.metrics}
        loading={statsLoading}
      />

      {/* FILTERS */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <UserFilters
          onSearch={(q) => {
            setPage(1);
            setSearchQ(q);
          }}
          onChangeRole={(r) => {
            setPage(1);
            setRole(r as RoleFilter);
          }}
          onChangeStatus={(s) => {
            setPage(1);
            setStatus(s as StatusFilter);
          }}
        />
      </div>

      {/* ERROR BOX */}
      {errorText && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
          Lỗi tải danh sách: <span className="font-medium">{errorText}</span>
        </div>
      )}

      {/* LIST + PAGINATION */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-slate-700">
          {isLoading || isFetching
            ? "Đang tải danh sách…"
            : `Danh Sách Người dùng (${users.length} / trang)`}
        </div>

        <UserGrid
          users={users}
          onEdit={(id) => setOpenUpdate({ open: true, id })}
          onDelete={(id) => setOpenDelete({ open: true, id })}
        />

        <Pagination
          page={pg?.page ?? page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* MODALS */}
      <CreateUserModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={() => {
          refetch();
          setOpenCreate(false);
        }}
      />
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
