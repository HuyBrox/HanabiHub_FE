"use client";

import { useState, useMemo, use } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  Circle,
  Award,
  Globe,
  Download,
  Heart,
  Share2,
  ArrowLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  GraduationCap,
  Target,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCourseByIdQuery } from "@/store/services/courseApi";
import { LoadingSpinner } from "@/components/loading";
import { withAuth } from "@/components/auth";
import Link from "next/link";
import Image from "next/image";

// Helper function để format giá
const formatPrice = (price: number) => {
  if (price === 0) return "Miễn phí";
  return `${price.toLocaleString("vi-VN")} VNĐ`;
};

// Helper function để format thời gian
const formatDuration = (duration: number) => {
  if (duration < 60) return `${duration} phút`;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

// Helper function để format ngày
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Unwrap params Promise
  const { id } = use(params);

  // Fetch course data từ API
  const {
    data: courseData,
    isLoading,
    isError,
    refetch,
  } = useGetCourseByIdQuery(id);

  // Transform lessons data
  const lessons = useMemo(() => {
    if (!courseData?.data?.lessons) return [];
    // Create a copy of the array before sorting to avoid mutating readonly array
    return [...courseData.data.lessons].sort((a, b) => a.order - b.order);
  }, [courseData]);

  const course = courseData?.data;
  const totalDuration = lessons.reduce(
    (sum, lesson) => sum + (lesson.duration || 0),
    0
  );
  const completedLessons = lessons.filter(
    (lesson) => (lesson.userCompleted?.length || 0) > 0
  ).length;
  const progressPercentage =
    lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (isError || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Có lỗi xảy ra</h3>
          <p className="text-muted-foreground mb-4">
            Không thể tải thông tin khóa học. Vui lòng thử lại.
          </p>
          <Button onClick={() => refetch()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/courses">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground">{course.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart
                  className={`h-4 w-4 ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Thumbnail & Info */}
            <Card>
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-lg relative overflow-hidden">
                {course.thumbnail ? (
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <BookOpen className="h-20 w-20 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold">{course.title}</h3>
                    </div>
                  </div>
                )}
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formatDuration(totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{lessons.length} bài học</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {(
                          course.studentCount ||
                          course.students?.length ||
                          0
                        ).toLocaleString()}{" "}
                        học viên
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">{course.level}</Badge>
                </div>
                <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
                <p className="text-muted-foreground mb-6">
                  {course.description}
                </p>
                <div className="flex items-center gap-4">
                  <Link href={`/courses/${course._id}`}>
                    <Button
                      size="lg"
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Bắt đầu học
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg">
                    <Download className="h-4 w-4 mr-2" />
                    Tải tài liệu
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Course Details Tabs */}
            <Card>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                  <TabsTrigger value="curriculum">Chương trình</TabsTrigger>
                  <TabsTrigger value="instructor">Giảng viên</TabsTrigger>
                  <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">
                        Giới thiệu khóa học
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Mục tiêu khóa học
                      </h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Nắm vững kiến thức cơ bản về tiếng Nhật</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Phát triển kỹ năng giao tiếp thực tế</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Chuẩn bị cho các kỳ thi JLPT</span>
                        </li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Bạn sẽ học được gì
                      </h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Đọc và viết tất cả các ký tự hiragana</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Hiểu thứ tự nét vẽ và kỹ thuật viết đúng</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>
                            Nhận biết hiragana trong văn bản tiếng Nhật thực tế
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Sử dụng kỹ thuật ghi nhớ để học nhanh hơn</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="curriculum" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">
                        Nội dung khóa học
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        {completedLessons}/{lessons.length} bài đã hoàn thành
                      </div>
                    </div>

                    {lessons.length > 0 && (
                      <div className="mb-4">
                        <Progress value={progressPercentage} className="h-2" />
                      </div>
                    )}

                    <div className="space-y-3">
                      {lessons.map((lesson, index) => (
                        <div
                          key={lesson._id}
                          className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            {(lesson.userCompleted?.length || 0) > 0 ? (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                Bài {index + 1}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {lesson.type === "video" ? "Video" : "Bài tập"}
                              </Badge>
                            </div>
                            <h4 className="font-medium">{lesson.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {lesson.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{formatDuration(lesson.duration || 0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="instructor" className="p-6">
                  <div className="flex items-start gap-6">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={course.instructor?.avatar} />
                      <AvatarFallback className="text-2xl">
                        {course.instructor?.fullname?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {course.instructor?.fullname || "Chưa xác định"}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {course.instructor?.email || "Chưa xác định"}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>4.9</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>5,000+ học viên</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          <span>10+ năm kinh nghiệm</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        Giảng viên có nhiều năm kinh nghiệm trong việc giảng dạy
                        tiếng Nhật, đã giúp hàng nghìn học viên đạt được mục
                        tiêu học tập của mình.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="p-6">
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Chưa có đánh giá
                    </h3>
                    <p className="text-muted-foreground">
                      Hãy là người đầu tiên đánh giá khóa học này
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-orange-500 mb-2">
                    {formatPrice(course.price)}
                  </div>
                  {course.price > 0 && (
                    <div className="text-sm text-muted-foreground line-through">
                      {formatPrice(course.price * 1.5)}
                    </div>
                  )}
                </div>
                <Link href={`/courses/${course._id}`} className="w-full">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 mb-4">
                    <Play className="h-4 w-4 mr-2" />
                    Bắt đầu học ngay
                  </Button>
                </Link>
                <div className="text-center text-sm text-muted-foreground">
                  Đảm bảo hoàn tiền trong 30 ngày
                </div>
              </CardContent>
            </Card>

            {/* Course Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thống kê khóa học</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Thời lượng</span>
                  <span className="font-medium">
                    {formatDuration(totalDuration)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Số bài học</span>
                  <span className="font-medium">{lessons.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Học viên</span>
                  <span className="font-medium">
                    {(
                      course.studentCount ||
                      course.students?.length ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cấp độ</span>
                  <Badge variant="secondary">{course.level}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ngôn ngữ</span>
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <span>Tiếng Việt</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Chứng chỉ</span>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4 text-primary" />
                    <span>Có</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ngày tạo</span>
                  <span className="font-medium">
                    {formatDate(course.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            {lessons.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tiến độ học tập</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Hoàn thành</span>
                      <span className="font-medium">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Đã hoàn thành</p>
                      <p className="font-semibold text-primary">
                        {completedLessons}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Còn lại</p>
                      <p className="font-semibold">
                        {lessons.length - completedLessons}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CourseDetailPage);
