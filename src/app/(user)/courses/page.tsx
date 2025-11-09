"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { withAuth } from "@/components/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Clock, Users, Star, BookOpen, Filter, Play } from "lucide-react";
import { useGetAllCoursesQuery } from "@/store/services/courseApi";
import { LoadingSpinner } from "@/components/loading";

// Helper function để format giá
const formatPrice = (price: number) => {
  if (price === 0) return "Miễn phí";
  return `${price.toLocaleString('vi-VN')} VNĐ`;
};

// Helper function để format thời gian học dự kiến
const estimateDuration = (lessonCount: number) => {
  const weeks = Math.ceil(lessonCount / 3); // Giả sử 3 bài/tuần
  return `${weeks} tuần`;
};

const categories = [
  "All",
  "Writing System",
  "Grammar",
  "Speaking",
  "Business",
  "Culture",
];
const levels = ["All", "Beginner", "Intermediate", "Advanced"];

function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");

  // Fetch courses từ API
  // Memoize query params to prevent infinite re-fetching
  const coursesQueryParams = useMemo(() => ({ limit: 50 }), []);

  const {
    data: coursesData,
    isLoading,
    isError,
    refetch,
  } = useGetAllCoursesQuery(coursesQueryParams);

  // Transform và filter courses
  const filteredCourses = useMemo(() => {
    if (!coursesData?.data) return [];

    return coursesData.data.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel =
        selectedLevel === "All" || course.level === selectedLevel;

      return matchesSearch && matchesLevel;
    });
  }, [coursesData, searchTerm, selectedLevel]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h3>
          <p className="text-muted-foreground mb-4">
            Không thể tải danh sách khóa học. Vui lòng thử lại.
          </p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-3 md:mb-6">
              Khám phá khóa học tiếng Nhật
            </h1>
            <p className="text-sm md:text-xl lg:text-2xl mb-4 md:mb-8 opacity-90 px-2">
              Từ cơ bản đến nâng cao, tìm khóa học hoàn hảo cho hành trình học tiếng Nhật của bạn
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
              <Input
                type="text"
                placeholder="Tìm kiếm khóa học..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 md:pl-12 pr-4 py-2.5 md:py-4 text-sm md:text-lg rounded-full border-0 shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 lg:px-6 py-6 md:py-12">
        {/* Filters */}
        <div className="flex flex-col md:flex-row md:flex-wrap gap-3 md:gap-4 mb-4 md:mb-8">
          <div className="flex items-center gap-2 mb-1 md:mb-0">
            <Filter className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
            <span className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
              Bộ lọc:
            </span>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`text-xs md:text-sm ${
                  selectedCategory === category
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Level Filter */}
          <div className="flex flex-wrap gap-2">
            {levels.map((level) => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedLevel(level)}
                className={`text-xs md:text-sm ${
                  selectedLevel === level
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 md:mb-6">
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Hiển thị {filteredCourses.length} trong {coursesData?.data?.length || 0} khóa học
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
          {filteredCourses.map((course) => (
            <Card
              key={course._id}
              className="group md:hover:shadow-lg transition-all duration-300 md:hover:-translate-y-1 overflow-hidden flex flex-col"
            >
              <div className="relative">
                <img
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  className="w-full h-28 sm:h-32 md:h-36 lg:h-40 object-cover md:group-hover:scale-105 transition-transform duration-300"
                />
                {(course.studentCount || course.students?.length || 0) > 100 && (
                  <Badge className="absolute top-1.5 left-1.5 md:top-2 md:left-2 bg-orange-500 hover:bg-orange-600 text-[10px] md:text-xs px-1.5 py-0.5">
                    Phổ biến
                  </Badge>
                )}
                <div className="absolute top-1.5 right-1.5 md:top-2 md:right-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-full px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs font-medium">
                  {formatPrice(course.price)}
                </div>
              </div>

              <CardHeader className="p-3 md:p-4 pb-2 flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm md:text-base lg:text-lg mb-1 md:group-hover:text-orange-500 transition-colors line-clamp-2 leading-tight">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="text-[11px] md:text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1 leading-snug">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-gray-500 mt-2 md:mt-3">
                  <div className="flex items-center gap-0.5 md:gap-1">
                    <Users className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    <span>{(course.studentCount || course.students?.length || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-0.5 md:gap-1">
                    <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    <span>{estimateDuration(course.lessons?.length || 0)}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-3 md:p-4 pt-0 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 py-0.5">{course.level}</Badge>
                  <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs text-gray-500">
                    <BookOpen className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    <span>{course.lessons?.length || 0} bài</span>
                  </div>
                </div>

                <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                  {course.instructor?.fullname || 'Chưa xác định'}
                </p>
              </CardContent>

              <CardFooter className="p-3 md:p-4 pt-2">
                <div className="flex gap-1.5 md:gap-2 w-full">
                  <Link href={`/courses/${course._id}/detail`} className="flex-1">
                    <Button variant="outline" className="w-full text-[10px] md:text-xs h-7 md:h-8 px-2">
                      <BookOpen className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                      Chi tiết
                    </Button>
                  </Link>
                  <Link href={`/courses/${course._id}`} className="flex-1">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-[10px] md:text-xs h-7 md:h-8 px-2">
                      <Play className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                      Học
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-8 md:py-12">
            <div className="text-gray-400 mb-3 md:mb-4">
              <BookOpen className="h-12 w-12 md:h-16 md:w-16 mx-auto" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Không tìm thấy khóa học
            </h3>
            <p className="text-sm md:text-base text-gray-500">
              Thử điều chỉnh từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(CoursesPage);
