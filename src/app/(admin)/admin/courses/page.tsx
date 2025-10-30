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

// Mock data
const mockStats = {
  totalCourses: 24,
  totalLessons: 156,
  activeStudents: 342,
  completionRate: 87,
};

const mockChartData = {
  courses: [
    { month: "T1", value: 8 },
    { month: "T2", value: 12 },
    { month: "T3", value: 15 },
    { month: "T4", value: 18 },
    { month: "T5", value: 20 },
    { month: "T6", value: 24 },
  ],
  lessons: [
    { month: "T1", value: 45 },
    { month: "T2", value: 68 },
    { month: "T3", value: 92 },
    { month: "T4", value: 115 },
    { month: "T5", value: 138 },
    { month: "T6", value: 156 },
  ],
};

const CourseManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

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
                {mockStats.totalCourses}
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
                {mockStats.totalLessons}
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
                {mockStats.activeStudents}
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
                {mockStats.completionRate}%
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
                <span className="ml-auto text-xs text-slate-500 bg-white/60 px-2 py-1 rounded-full">
                  +200% năm nay
                </span>
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
                  <path
                    d={mockChartData.courses
                      .map((item, i) => {
                        const x = 60 + i * 100;
                        const y = 200 - (item.value / 30) * 170;
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
                    d={`${mockChartData.courses
                      .map((item, i) => {
                        const x = 60 + i * 100;
                        const y = 200 - (item.value / 30) * 170;
                        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                      })
                      .join(" ")} L 560 200 L 60 200 Z`}
                    fill="url(#blueAreaGradient)"
                    opacity="0.2"
                  />

                  {/* Course points */}
                  {mockChartData.courses.map((item, i) => {
                    const x = 60 + i * 100;
                    const y = 200 - (item.value / 30) * 170;
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
                  {mockChartData.courses.map((item, i) => (
                    <text
                      key={i}
                      x={60 + i * 100}
                      y="225"
                      textAnchor="middle"
                      className="text-xs font-medium"
                      fill="#64748b"
                    >
                      {item.month}
                    </text>
                  ))}

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
                <span className="ml-auto text-xs text-slate-500 bg-white/60 px-2 py-1 rounded-full">
                  +247% năm nay
                </span>
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
                  <path
                    d={mockChartData.lessons
                      .map((item, i) => {
                        const x = 60 + i * 100;
                        const y = 200 - (item.value / 200) * 170;
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
                    d={`${mockChartData.lessons
                      .map((item, i) => {
                        const x = 60 + i * 100;
                        const y = 200 - (item.value / 200) * 170;
                        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                      })
                      .join(" ")} L 560 200 L 60 200 Z`}
                    fill="url(#purpleAreaGradient)"
                    opacity="0.2"
                  />

                  {/* Lesson points */}
                  {mockChartData.lessons.map((item, i) => {
                    const x = 60 + i * 100;
                    const y = 200 - (item.value / 200) * 170;
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
                  {mockChartData.lessons.map((item, i) => (
                    <text
                      key={i}
                      x={60 + i * 100}
                      y="225"
                      textAnchor="middle"
                      className="text-xs font-medium"
                      fill="#64748b"
                    >
                      {item.month}
                    </text>
                  ))}

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
