"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  BookOpen,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Sparkles
} from "lucide-react";
import {
  CreateCourseModal,
  CourseTable,
} from "@/components/admin/course";
import {
  useGetCourseStatsQuery,
  useGetCourseGrowthQuery,
} from "@/store/services/admin/dashboardApi";

const CourseManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch course statistics
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useGetCourseStatsQuery();

  // Fetch course growth data
  const {
    data: growthData,
    isLoading: growthLoading,
    error: growthError,
  } = useGetCourseGrowthQuery();

  const stats = statsData || {
    totalCourses: 0,
    totalLessons: 0,
    activeStudents: 0,
    completionRate: 0,
  };

  const chartData = growthData || {
    courses: [],
    lessons: [],
  };

  const handleCreateSuccess = () => {
    // TODO: Refresh course list after creating
    console.log("Course created successfully");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                  Quản Lý Khóa Học
                </h1>
                <p className="text-slate-600 text-sm lg:text-base mt-0.5">
                  Quản lý tất cả khóa học và bài học trên hệ thống
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Tạo khóa học mới</span>
            <span className="sm:hidden">Tạo mới</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Total Courses */}
        <div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-white/60" />
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">
                Tổng Khóa Học
              </p>
              <p className="text-4xl font-bold text-white">
                {statsLoading ? "..." : stats.totalCourses}
              </p>
            </div>
          </div>
        </div>

        {/* Total Lessons */}
        <div className="group relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-white/60" />
            </div>
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">
                Tổng Bài Học
              </p>
              <p className="text-4xl font-bold text-white">
                {statsLoading ? "..." : stats.totalLessons}
              </p>
            </div>
          </div>
        </div>

        {/* Active Students */}
        <div className="group relative bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-white/60" />
            </div>
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">
                Học Viên Hoạt Động
              </p>
              <p className="text-4xl font-bold text-white">
                {statsLoading ? "..." : stats.activeStudents}
              </p>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="group relative bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-white/60" />
            </div>
            <div>
              <p className="text-amber-100 text-sm font-medium mb-1">
                Tỷ Lệ Hoàn Thành
              </p>
              <p className="text-4xl font-bold text-white">
                {statsLoading ? "..." : stats.completionRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 p-6 border-b border-slate-200/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
                Thống Kê Tăng Trưởng
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Biểu đồ khóa học và bài học theo tháng
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Course Chart */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 lg:p-6 border border-blue-200/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
                <span className="text-sm font-semibold text-slate-800">
                  Khóa học
                </span>
                {chartData.courses.length >= 2 && (
                  <span className="ml-auto text-xs text-slate-500 bg-white/60 px-2 py-1 rounded-full">
                    {(() => {
                      const first = chartData.courses[0]?.value || 0;
                      const last = chartData.courses[chartData.courses.length - 1]?.value || 0;
                      const change = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
                      return change > 0 ? `+${change}%` : `${change}%`;
                    })()}
                  </span>
                )}
              </div>
              <div className="relative h-52 lg:h-64">
                <svg className="w-full h-full" viewBox="0 0 600 240">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line
                      key={i}
                      x1="40"
                      y1={20 + i * 35}
                      x2="580"
                      y2={20 + i * 35}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Course line path */}
                  {chartData.courses.length > 0 && (
                    <>
                      <path
                        d={chartData.courses
                          .map((item, i) => {
                            const maxValue = Math.max(...chartData.courses.map((c: any) => c.value), 1);
                            const x = 60 + (i / (chartData.courses.length - 1 || 1)) * 500;
                            const y = 200 - (item.value / maxValue) * 170;
                            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="url(#blueGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Area under curve */}
                      <path
                        d={`${chartData.courses
                          .map((item, i) => {
                            const maxValue = Math.max(...chartData.courses.map((c: any) => c.value), 1);
                            const x = 60 + (i / (chartData.courses.length - 1 || 1)) * 500;
                            const y = 200 - (item.value / maxValue) * 170;
                            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                          })
                          .join(" ")} L ${60 + ((chartData.courses.length - 1) / (chartData.courses.length - 1 || 1)) * 500} 200 L 60 200 Z`}
                        fill="url(#blueAreaGradient)"
                        opacity="0.2"
                      />

                      {/* Course points */}
                      {chartData.courses.map((item: any, i: number) => {
                        const maxValue = Math.max(...chartData.courses.map((c: any) => c.value), 1);
                        const x = 60 + (i / (chartData.courses.length - 1 || 1)) * 500;
                        const y = 200 - (item.value / maxValue) * 170;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="8" fill="#3b82f6" opacity="0.2" />
                            <circle cx={x} cy={y} r="5" fill="#3b82f6" />
                            <circle cx={x} cy={y} r="2" fill="white" />
                            <text
                              x={x}
                              y={y - 15}
                              textAnchor="middle"
                              className="text-xs font-bold"
                              fill="#1e40af"
                            >
                              {item.value}
                            </text>
                          </g>
                        );
                      })}

                      {/* Month labels */}
                      {chartData.courses.map((item: any, i: number) => {
                        const x = 60 + (i / (chartData.courses.length - 1 || 1)) * 500;
                        return (
                          <text
                            key={i}
                            x={x}
                            y="225"
                            textAnchor="middle"
                            className="text-xs font-medium"
                            fill="#64748b"
                          >
                            {item.month}
                          </text>
                        );
                      })}
                    </>
                  )}
                  {growthLoading && (
                    <text x="300" y="120" textAnchor="middle" className="text-sm" fill="#64748b">
                      Đang tải...
                    </text>
                  )}
                  {!growthLoading && chartData.courses.length === 0 && (
                    <text x="300" y="120" textAnchor="middle" className="text-sm" fill="#64748b">
                      Chưa có dữ liệu
                    </text>
                  )}

                  <defs>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <linearGradient id="blueAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Lesson Chart */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 lg:p-6 border border-purple-200/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50" />
                <span className="text-sm font-semibold text-slate-800">
                  Bài học
                </span>
                {chartData.lessons.length >= 2 && (
                  <span className="ml-auto text-xs text-slate-500 bg-white/60 px-2 py-1 rounded-full">
                    {(() => {
                      const first = chartData.lessons[0]?.value || 0;
                      const last = chartData.lessons[chartData.lessons.length - 1]?.value || 0;
                      const change = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
                      return change > 0 ? `+${change}%` : `${change}%`;
                    })()}
                  </span>
                )}
              </div>
              <div className="relative h-52 lg:h-64">
                <svg className="w-full h-full" viewBox="0 0 600 240">
                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <line
                      key={i}
                      x1="40"
                      y1={20 + i * 35}
                      x2="580"
                      y2={20 + i * 35}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                  ))}

                  {/* Lesson line path */}
                  {chartData.lessons.length > 0 && (
                    <>
                      <path
                        d={chartData.lessons
                          .map((item, i) => {
                            const maxValue = Math.max(...chartData.lessons.map((l: any) => l.value), 1);
                            const x = 60 + (i / (chartData.lessons.length - 1 || 1)) * 500;
                            const y = 200 - (item.value / maxValue) * 170;
                            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                          })
                          .join(" ")}
                        fill="none"
                        stroke="url(#purpleGradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Area under curve */}
                      <path
                        d={`${chartData.lessons
                          .map((item, i) => {
                            const maxValue = Math.max(...chartData.lessons.map((l: any) => l.value), 1);
                            const x = 60 + (i / (chartData.lessons.length - 1 || 1)) * 500;
                            const y = 200 - (item.value / maxValue) * 170;
                            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                          })
                          .join(" ")} L ${60 + ((chartData.lessons.length - 1) / (chartData.lessons.length - 1 || 1)) * 500} 200 L 60 200 Z`}
                        fill="url(#purpleAreaGradient)"
                        opacity="0.2"
                      />

                      {/* Lesson points */}
                      {chartData.lessons.map((item: any, i: number) => {
                        const maxValue = Math.max(...chartData.lessons.map((l: any) => l.value), 1);
                        const x = 60 + (i / (chartData.lessons.length - 1 || 1)) * 500;
                        const y = 200 - (item.value / maxValue) * 170;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="8" fill="#a855f7" opacity="0.2" />
                            <circle cx={x} cy={y} r="5" fill="#a855f7" />
                            <circle cx={x} cy={y} r="2" fill="white" />
                            <text
                              x={x}
                              y={y - 15}
                              textAnchor="middle"
                              className="text-xs font-bold"
                              fill="#7e22ce"
                            >
                              {item.value}
                            </text>
                          </g>
                        );
                      })}

                      {/* Month labels */}
                      {chartData.lessons.map((item: any, i: number) => {
                        const x = 60 + (i / (chartData.lessons.length - 1 || 1)) * 500;
                        return (
                          <text
                            key={i}
                            x={x}
                            y="225"
                            textAnchor="middle"
                            className="text-xs font-medium"
                            fill="#64748b"
                          >
                            {item.month}
                          </text>
                        );
                      })}
                    </>
                  )}
                  {growthLoading && (
                    <text x="300" y="120" textAnchor="middle" className="text-sm" fill="#64748b">
                      Đang tải...
                    </text>
                  )}
                  {!growthLoading && chartData.lessons.length === 0 && (
                    <text x="300" y="120" textAnchor="middle" className="text-sm" fill="#64748b">
                      Chưa có dữ liệu
                    </text>
                  )}

                  <defs>
                    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                    <linearGradient id="purpleAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Carousel Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-purple-50/50 p-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-slate-900">
                  Danh Sách Khóa Học
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  Kéo để xem thêm các khóa học • Nhấn để xem chi tiết
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Drag to scroll
            </div>
          </div>
        </div>
        <div className="p-2 lg:p-4">
          <CourseTable />
        </div>
      </div>

      {/* Modals */}
      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default CourseManagement;
