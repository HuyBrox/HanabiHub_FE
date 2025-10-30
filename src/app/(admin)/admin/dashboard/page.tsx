"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  StatsCard, 
  UserGrowthChart, 
  PopularCourses, 
  LevelDistribution, 
  RecentActivities, 
  QuickActions 
} from "@/components/admin/admin/dashboard";
import { Users, UserPlus, Clock, Globe, TrendingUp } from "lucide-react";
import { getStats, getPopularCourses, getRecentActivities } from "@/store/services/dashboardApi";

import axios from "axios";




export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [popularCourses, setPopularCourses] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Gọi 2 API cùng lúc
  const fetchDashboardData = async () => {
    try {
      const statsRes = await getStats();
      const coursesRes = await getPopularCourses();
      const activitiesRes = await getRecentActivities();

      // Tính toán tỉ lệ phần trăm từ dữ liệu levelDistribution
      const levelData = statsRes?.levelDistribution || {};
      const total = Object.values(levelData).reduce((sum: number, count: any) => sum + count, 0);

      const formattedLevels = Object.entries(levelData).map(
        ([level, count]: [string, any]) => ({
          level,
          count,
          percentage: total ? ((count / total) * 100).toFixed(1) : 0,
        })
      );

      setStats({
        ...statsRes,
        formattedLevelDistribution: formattedLevels,
      });

      setPopularCourses(coursesRes || []);
      setRecentActivities(activitiesRes.activities || []);
    } catch (error) {
      console.error("Lỗi khi tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  console.log(popularCourses);
  console.log(stats);
  console.log(recentActivities);

  const handleCreateUser = (userData: any) => {
    console.log('Creating user:', userData);
    // Thêm logic tạo user ở đây
  };

  const handleGenerateReport = (type: string, format: string) => {
    console.log('Generating report:', type, format);
    // Thêm logic tạo báo cáo ở đây
  };

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan hệ thống HanabiHub</p>
        </div>
        <div className="text-sm text-gray-500">
          Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng người dùng"
          value={stats?.totalUsers || 0}
          changeType="increase"
          icon={<Users className="h-4 w-4" />}
          description="Tổng số người dùng đã đăng ký"
        />
        <StatsCard
          title="Người dùng mới hôm nay"
          value={stats?.newUsersToday || 0}
          changeType="increase"
          icon={<UserPlus className="h-4 w-4" />}
          description="Đăng ký trong 24h qua"
        />
        <StatsCard
          title="Người dùng mới tuần này"
          value={stats?.newUsersThisWeek || 0}
          changeType="increase"
          icon={<TrendingUp className="h-4 w-4" />}
          description="Đăng ký trong 7 ngày qua"
        />
        <StatsCard
          title="Người dùng online"
          value={stats?.onlineUsers || 0}
          icon={<Globe className="h-4 w-4" />}
          description="Đang hoạt động hiện tại"
        />
      </div>

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart data={stats?.growthSeries || []} />
        <LevelDistribution data={stats?.formattedLevelDistribution || []} />
      </div>

      {/* Popular Courses and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularCourses courses={popularCourses} />
        <RecentActivities activities={recentActivities} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickActions 
            onCreateUser={handleCreateUser}
            onGenerateReport={handleGenerateReport}
          />
        </div>
        
        {/* Additional Stats */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Thống kê bổ sung</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{mockStats.newUsersThisMonth}</div>
                  <div className="text-sm text-gray-600">Tháng này</div>
                </div> */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{popularCourses.length}</div>
                  <div className="text-sm text-gray-600">Khóa học</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats?.formattedLevelDistribution?.reduce((sum: number, level: any) => sum + (level.count || 0), 0) || 0}
                  </div>
                  <div className="text-sm text-gray-600">Tổng cấp độ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{ stats?.RecentActivities?.length ?? 0}</div>
                  <div className="text-sm text-gray-600">Hoạt động</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
