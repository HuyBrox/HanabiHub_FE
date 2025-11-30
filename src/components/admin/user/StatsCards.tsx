import React from "react";

interface ChangeMetric {
  currentMonth?: number;
  previousMonth?: number;
  changePercent?: number | null;
}

interface Metrics {
  users?: ChangeMetric;
  admins?: ChangeMetric;
  online?: ChangeMetric;
  visits?: ChangeMetric;
}

interface StatsCardsProps {
  totalUsers: number;
  adminCount: number;
  onlineCount: number;
  visits: number; // tổng tài khoản bị vô hiệu hóa (inactive + blocked)
  loading?: boolean;
  metrics?: Metrics;
}

/** Text mô tả % thay đổi cho 2 card đầu */
function formatChangeText(change?: number | null): string {
  if (change === null || change === undefined) return "Chưa có dữ liệu tháng trước";
  if (change === 0) return "Không thay đổi so với tháng trước";
  if (change > 0) return `+${change}% so với tháng trước`;
  return `${change}% so với tháng trước`;
}

export function StatsCards({
  totalUsers,
  adminCount,
  onlineCount,
  visits,
  loading,
  metrics,
}: StatsCardsProps) {
  // Skeleton khi loading
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="relative h-28 overflow-hidden rounded-2xl bg-slate-100/80 shadow-sm dark:bg-slate-800/70"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100/0 via-slate-200/60 to-slate-100/0 dark:via-slate-600/60 animate-[pulse_1.4s_ease-in-out_infinite]" />
          </div>
        ))}
      </div>
    );
  }

  const usersChange = metrics?.users?.changePercent;
  const adminsChange = metrics?.admins?.changePercent;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Tổng người dùng */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 p-5 text-white shadow-md transition-transform duration-150 hover:-translate-y-1 hover:shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-xl" />
        <div className="text-[13px] font-semibold uppercase tracking-[0.12em] opacity-90">
          Tổng người dùng
        </div>
        <div className="mt-2 flex items-end gap-2">
          <div className="text-4xl font-extrabold leading-none tracking-tight">
            {totalUsers ?? 0}
          </div>
        </div>
        <div className="mt-3 text-[13px] font-medium opacity-90">
          {formatChangeText(usersChange)}
        </div>
      </div>

      {/* Tài khoản Admin */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-fuchsia-500 to-purple-600 p-5 text-white shadow-md transition-transform duration-150 hover:-translate-y-1 hover:shadow-xl">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/20 blur-xl" />
        <div className="text-[13px] font-semibold uppercase tracking-[0.12em] opacity-90">
          Tài khoản Admin
        </div>
        <div className="mt-2 flex items-end gap-2">
          <div className="text-4xl font-extrabold leading-none tracking-tight">
            {adminCount ?? 0}
          </div>
        </div>
        <div className="mt-3 text-[13px] font-medium opacity-90">
          {formatChangeText(adminsChange)}
        </div>
      </div>

      {/* Người dùng Online – KHÔNG hiển thị % tháng trước */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-5 text-white shadow-md transition-transform duration-150 hover:-translate-y-1 hover:shadow-xl">
        <div className="pointer-events-none absolute -right-9 -top-9 h-28 w-28 rounded-full bg-white/15 blur-xl" />
        <div className="text-[13px] font-semibold uppercase tracking-[0.12em] opacity-90">
          Người dùng Online
        </div>
        <div className="mt-2 text-4xl font-extrabold leading-none tracking-tight">
          {onlineCount ?? 0}
        </div>
        <div className="mt-3 text-[12px] font-medium opacity-90">
          Số tài khoản đang hoạt động trong hệ thống.
        </div>
      </div>

      {/* Tài khoản bị vô hiệu hóa – KHÔNG hiển thị % tháng trước */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 text-white shadow-md transition-transform duration-150 hover:-translate-y-1 hover:shadow-xl">
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/18 blur-xl" />
        <div className="text-[13px] font-semibold uppercase tracking-[0.12em] opacity-90">
          Tài khoản bị vô hiệu hóa
        </div>
        <div className="mt-2 text-4xl font-extrabold leading-none tracking-tight">
          {visits?.toLocaleString() ?? "0"}
        </div>
        <div className="mt-3 text-[12px] font-medium opacity-90">
          Tổng số tài khoản đang ở trạng thái inactive.
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
