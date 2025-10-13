"use client";

import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Bell, Eye, Heart, MessageCircle } from 'lucide-react';

// Mock data for charts
const notificationTrends = [
  { name: 'T2', sent: 120, opened: 95, clicked: 45 },
  { name: 'T3', sent: 200, opened: 160, clicked: 80 },
  { name: 'T4', sent: 180, opened: 140, clicked: 70 },
  { name: 'T5', sent: 250, opened: 200, clicked: 100 },
  { name: 'T6', sent: 300, opened: 240, clicked: 120 },
  { name: 'T7', sent: 280, opened: 220, clicked: 110 },
  { name: 'CN', sent: 150, opened: 120, clicked: 60 }
];

const contentPerformance = [
  { name: 'Tin tức 1', views: 1200, likes: 89, comments: 23 },
  { name: 'Tin tức 2', views: 890, likes: 45, comments: 12 },
  { name: 'Tin tức 3', views: 2340, likes: 156, comments: 67 },
  { name: 'Tin tức 4', views: 567, likes: 23, comments: 8 },
  { name: 'Tin tức 5', views: 1250, likes: 89, comments: 23 }
];

const userEngagement = [
  { name: 'Desktop', value: 65, color: '#3B82F6' },
  { name: 'Mobile', value: 30, color: '#10B981' },
  { name: 'Tablet', value: 5, color: '#F59E0B' }
];

const reportStatus = [
  { name: 'Chờ xét duyệt', value: 15, color: '#F59E0B' },
  { name: 'Đã duyệt', value: 8, color: '#10B981' },
  { name: 'Đã từ chối', value: 3, color: '#EF4444' }
];

export default function AnalyticsCharts() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification Trends */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Xu Hướng Thông Báo (7 ngày qua)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={notificationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sent" stroke="#3B82F6" strokeWidth={2} name="Đã gửi" />
              <Line type="monotone" dataKey="opened" stroke="#10B981" strokeWidth={2} name="Đã mở" />
              <Line type="monotone" dataKey="clicked" stroke="#F59E0B" strokeWidth={2} name="Đã click" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Content Performance */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
            <Eye className="w-5 h-5 text-green-600" />
            Hiệu Suất Nội Dung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={contentPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#3B82F6" name="Lượt xem" />
              <Bar dataKey="likes" fill="#10B981" name="Thích" />
              <Bar dataKey="comments" fill="#F59E0B" name="Bình luận" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Engagement & Report Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
              <Users className="w-5 h-5 text-purple-600" />
              Tương Tác Người Dùng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userEngagement}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userEngagement.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Report Status */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 font-semibold">
              <Bell className="w-5 h-5 text-red-600" />
              Trạng Thái Tố Cáo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={reportStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tỷ lệ mở</p>
                <p className="text-2xl font-bold text-green-600">78.5%</p>
              </div>
              <Eye className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tỷ lệ click</p>
                <p className="text-2xl font-bold text-blue-600">42.3%</p>
              </div>
              <Heart className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tương tác</p>
                <p className="text-2xl font-bold text-purple-600">65.8%</p>
              </div>
              <MessageCircle className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retention</p>
                <p className="text-2xl font-bold text-orange-600">89.2%</p>
              </div>
              <Users className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
