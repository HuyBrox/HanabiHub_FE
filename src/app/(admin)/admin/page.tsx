"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  Bell, 
  BarChart3, 
  TrendingUp,
  Eye,
  MessageCircle,
  Star
} from "lucide-react";
import Link from "next/link";

// Mock data for dashboard stats
const dashboardStats = [
  {
    title: "Tổng Người Dùng",
    value: "1,234",
    change: "+12%",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Khóa Học",
    value: "45",
    change: "+8%",
    icon: BookOpen,
    color: "text-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "Thông Báo",
    value: "89",
    change: "+23%",
    icon: Bell,
    color: "text-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    title: "Lượt Xem",
    value: "12.5K",
    change: "+15%",
    icon: Eye,
    color: "text-orange-600",
    bgColor: "bg-orange-50"
  }
];

const recentActivities = [
  {
    id: 1,
    type: "user",
    message: "Người dùng mới đăng ký: Nguyễn Văn A",
    time: "2 phút trước",
    icon: Users
  },
  {
    id: 2,
    type: "content",
    message: "Bài viết mới được tạo: 'Học tiếng Nhật cơ bản'",
    time: "15 phút trước",
    icon: BookOpen
  },
  {
    id: 3,
    type: "notification",
    message: "Thông báo hệ thống đã được gửi",
    time: "1 giờ trước",
    icon: Bell
  },
  {
    id: 4,
    type: "analytics",
    message: "Báo cáo tháng 1 đã được tạo",
    time: "2 giờ trước",
    icon: BarChart3
  }
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Tổng quan hệ thống HanabiHub</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="bg-white border border-gray-200 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-sm text-green-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {stat.change} so với tháng trước
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quản Lý Người Dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Quản lý tài khoản người dùng, phân quyền và thông tin cá nhân</p>
            <Link href="/admin/users">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Users className="h-4 w-4 mr-2" />
                Quản Lý Người Dùng
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Nội Dung & Thông Báo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Quản lý nội dung học tập và thông báo hệ thống</p>
            <Link href="/admin/content">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                <Bell className="h-4 w-4 mr-2" />
                Quản Lý Nội Dung & Thông Báo
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">Quản Lý Khóa Học</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Tạo và quản lý các khóa học tiếng Nhật</p>
            <Link href="/admin/courses">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <BookOpen className="h-4 w-4 mr-2" />
                Quản Lý Khóa Học
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Hoạt Động Gần Đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <activity.icon className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
