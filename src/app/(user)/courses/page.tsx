"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
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
import {
  Search,
  Clock,
  Users,
  Star,
  BookOpen,
  Filter,
  Play,
} from "lucide-react";
import { useGetAllCoursesQuery } from "@/store/services/courseApi";
import { LoadingSpinner } from "@/components/loading";

// Helper function để format giá
const formatPrice = (price: number) => {
  if (price === 0) return "Miễn phí";
  return `${price.toLocaleString("vi-VN")} VNĐ`;
};

// Helper function để format thời gian học dự kiến
const estimateDuration = (lessonCount: number) => {
  const weeks = Math.ceil(lessonCount / 3); // Giả sử 3 bài/tuần
  return `${weeks} tuần`;
};

// Helper function để tính rating trung bình
const calculateAverageRating = (
  ratings?: Array<{ user: string; rating: number }>
) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return sum / ratings.length;
};

type PriceFilter = "all" | "free" | "paid";
type RatingFilter = "all" | "rated" | "high";

function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");

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

    let courses = coursesData.data.filter((course) => {
      // Filter theo search term
      const matchesSearch =
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter theo price
      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "free" && course.price === 0) ||
        (priceFilter === "paid" && course.price > 0);

      // Filter theo rating
      const ratings = course.ratings || [];
      const avgRating = calculateAverageRating(ratings);
      const matchesRating =
        ratingFilter === "all" ||
        (ratingFilter === "rated" && ratings.length > 0) ||
        (ratingFilter === "high" && avgRating >= 4.0);

      return matchesSearch && matchesPrice && matchesRating;
    });

    return courses;
  }, [coursesData, searchTerm, priceFilter, ratingFilter]);

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
      <div className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white py-12 md:py-20 lg:py-24 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 tracking-tight">
              Khám phá khóa học tiếng Nhật
            </h1>
            <p className="text-base md:text-xl lg:text-2xl mb-6 md:mb-10 opacity-95 px-2 leading-relaxed">
              Từ cơ bản đến nâng cao, tìm khóa học hoàn hảo cho hành trình học
              tiếng Nhật của bạn
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative group">
                <Search className="absolute left-4 md:left-5 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5 md:h-6 md:w-6 transition-colors group-focus-within:text-orange-500" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm khóa học theo tên hoặc mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 md:pl-14 pr-4 py-3 md:py-4 text-sm md:text-base rounded-full border-0 shadow-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-orange-500 transition-all duration-200"
                />
              </div>
              {searchTerm && (
                <div className="mt-3 text-sm text-white/90">
                  Đang tìm kiếm:{" "}
                  <span className="font-semibold">"{searchTerm}"</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 lg:px-6 py-6 md:py-12">
        {/* Filters */}
        <div className="flex flex-col gap-4 md:gap-6 mb-4 md:mb-8">
          {/* Filter Row 1: Price & Rating */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
              <span className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300">
                Bộ lọc:
              </span>
            </div>

            {/* Price Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={priceFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setPriceFilter("all")}
                className={`text-xs md:text-sm ${
                  priceFilter === "all"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                Tất cả
              </Button>
              <Button
                variant={priceFilter === "free" ? "default" : "outline"}
                size="sm"
                onClick={() => setPriceFilter("free")}
                className={`text-xs md:text-sm ${
                  priceFilter === "free"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                Miễn phí
              </Button>
              <Button
                variant={priceFilter === "paid" ? "default" : "outline"}
                size="sm"
                onClick={() => setPriceFilter("paid")}
                className={`text-xs md:text-sm ${
                  priceFilter === "paid"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                Có phí
              </Button>
            </div>

            {/* Rating Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={ratingFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setRatingFilter("all")}
                className={`text-xs md:text-sm ${
                  ratingFilter === "all"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                Tất cả
              </Button>
              <Button
                variant={ratingFilter === "rated" ? "default" : "outline"}
                size="sm"
                onClick={() => setRatingFilter("rated")}
                className={`text-xs md:text-sm flex items-center gap-1 ${
                  ratingFilter === "rated"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                <Star className="h-3 w-3" />
                Có đánh giá
              </Button>
              <Button
                variant={ratingFilter === "high" ? "default" : "outline"}
                size="sm"
                onClick={() => setRatingFilter("high")}
                className={`text-xs md:text-sm flex items-center gap-1 ${
                  ratingFilter === "high"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : ""
                }`}
              >
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                Đánh giá cao
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 md:mb-6">
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
            Hiển thị {filteredCourses.length} trong{" "}
            {coursesData?.data?.length || 0} khóa học
          </p>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
          {filteredCourses.map((course) => (
            <Card
              key={course._id}
              className="group md:hover:shadow-lg transition-all duration-300 md:hover:-translate-y-1 overflow-hidden flex flex-col"
            >
              <div className="relative h-28 sm:h-32 md:h-36 lg:h-40">
                <Image
                  src={course.thumbnail || "/placeholder.svg"}
                  alt={course.title}
                  fill
                  className="object-cover md:group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  unoptimized
                />
                {(course.studentCount || course.students?.length || 0) >
                  100 && (
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
                    <span>
                      {(
                        course.studentCount ||
                        course.students?.length ||
                        0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 md:gap-1">
                    <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    <span>{estimateDuration(course.lessons?.length || 0)}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-3 md:p-4 pt-0 pb-2">
                <div className="flex items-center justify-between mb-2">
                  {/* Rating Display */}
                  {(() => {
                    const ratings = course.ratings || [];
                    const avgRating = calculateAverageRating(ratings);
                    if (ratings.length > 0) {
                      return (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] md:text-xs font-medium">
                            {avgRating.toFixed(1)}
                          </span>
                          <span className="text-[10px] md:text-xs text-gray-500">
                            ({ratings.length})
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs text-gray-500">
                    <BookOpen className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    <span>{course.lessons?.length || 0} bài</span>
                  </div>
                </div>

                <p className="text-[10px] md:text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                  {course.instructor?.fullname || "Chưa xác định"}
                </p>
              </CardContent>

              <CardFooter className="p-3 md:p-4 pt-2">
                <div className="flex gap-1.5 md:gap-2 w-full">
                  <Link
                    href={`/courses/${course._id}/detail`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full text-[10px] md:text-xs h-7 md:h-8 px-2"
                    >
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
