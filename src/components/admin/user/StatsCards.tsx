import React from "react";

interface ChangeMetric {
  changePercent?: number | null;
}

interface Metrics {
  users?: ChangeMetric;
  admins?: ChangeMetric;
  online?: ChangeMetric;
  visits?: ChangeMetric; // dùng cho inactive
}

interface StatsCardsProps {
  totalUsers: number;
  adminCount: number;
  onlineCount: number;
  visits: number; // tổng inactive
  loading?: boolean;
  metrics?: Metrics;
}

/** Text + hoặc - % */
function formatChangeText(change?: number | null): string {
  if (change === null || change === undefined)
    return "Chưa có dữ liệu tháng trước";
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
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-700"
          />
        ))}
      </div>
    );
  }

  const usersText = formatChangeText(metrics?.users?.changePercent);
  const adminsText = formatChangeText(metrics?.admins?.changePercent);
  const onlineText = formatChangeText(metrics?.online?.changePercent);
  const visitsText = formatChangeText(metrics?.visits?.changePercent);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Tổng người dùng */}
      <div className="rounded-2xl p-5 text-white shadow-sm bg-gradient-to-br from-fuchsia-500 to-violet-600">
        <div className="text-[15px] font-semibold opacity-95">
          Tổng Người Dùng
        </div>
        <div className="mt-2 text-4xl font-extrabold">{totalUsers}</div>
        <div className="mt-3 text-[13px] opacity-90">{usersText}</div>
      </div>

      {/* Admin */}
      <div className="rounded-2xl p-5 text-white shadow-sm bg-gradient-to-br from-rose-500 to-fuchsia-600">
        <div className="text-[15px] font-semibold opacity-95">
          Tài khoản Admin
        </div>
        <div className="mt-2 text-4xl font-extrabold">{adminCount}</div>
        <div className="mt-3 text-[13px] opacity-90">{adminsText}</div>
      </div>

      {/* Online */}
      <div className="rounded-2xl p-5 text-white shadow-sm bg-gradient-to-br from-emerald-500 to-green-600">
        <div className="text-[15px] font-semibold opacity-95">
          Người dùng Online
        </div>
        <div className="mt-2 text-4xl font-extrabold">{onlineCount}</div>
        <div className="mt-3 text-[13px] opacity-90">{onlineText}</div>
      </div>

      {/* Inactive */}
      <div className="rounded-2xl p-5 text-white shadow-sm bg-gradient-to-br from-amber-500 to-orange-600">
        <div className="text-[15px] font-semibold opacity-95">
          Tài khoản bị vô hiệu hóa
        </div>
        <div className="mt-2 text-4xl font-extrabold">
          {visits?.toLocaleString()}
        </div>
        <div className="mt-3 text-[13px] opacity-90">{visitsText}</div>
      </div>
    </div>
  );
}

export default StatsCards;
