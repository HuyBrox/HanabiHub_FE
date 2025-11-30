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
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetCourseByIdQuery,
  useGetUserCourseProgressQuery,
  useResetCourseProgressMutation,
} from "@/store/services/courseApi";
import { LoadingSpinner } from "@/components/loading";
import { withAuth } from "@/components/auth";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  // Unwrap params Promise
  const { id } = use(params);

  // Fetch course data từ API
  const {
    data: courseData,
    isLoading,
    isError,
    refetch,
  } = useGetCourseByIdQuery(id);

  // Fetch user progress
  const { data: progressData, isLoading: progressLoading } =
    useGetUserCourseProgressQuery(id);

  const [resetProgress, { isLoading: isResetting }] =
    useResetCourseProgressMutation();

  // Transform lessons data
  const lessons = useMemo(() => {
    if (!courseData?.data?.lessons) return [];
    // Create a copy of the array before sorting to avoid mutating readonly array
    return [...courseData.data.lessons].sort((a, b) => a.order - b.order);
  }, [courseData]);

  const course = courseData?.data;
  const userProgress = progressData?.data;

  const totalDuration = lessons.reduce(
    (sum, lesson) => sum + (lesson.duration || 0),
    0
  );

  // Check if lesson is completed using userProgress
  const isLessonCompleted = (lessonId: string): boolean => {
    if (!userProgress?.completedLessons) return false;
    return userProgress.completedLessons.some(
      (completed) => completed.lessonId === lessonId
    );
  };

  const completedLessons = lessons.filter((lesson) =>
    isLessonCompleted(lesson._id)
  ).length;

  const progressPercentage = userProgress?.progressPercentage || 0;

  // Determine next lesson to continue
  const nextLesson = useMemo(() => {
    if (userProgress?.currentLessonId) {
      // Resume from current lesson
      return lessons.find((l) => l._id === userProgress.currentLessonId);
    }
    // Or start from first incomplete lesson
    return lessons.find((l) => !isLessonCompleted(l._id));
  }, [lessons, userProgress, isLessonCompleted]);

  const handleStartLearning = () => {
    if (nextLesson) {
      router.push(`/courses/${id}/learn/${nextLesson._id}`);
    } else if (lessons.length > 0) {
      router.push(`/courses/${id}/learn/${lessons[0]._id}`);
    }
  };

  const handleResetProgress = async () => {
    if (confirm("Bạn có chắc muốn reset tiến độ khóa học này?")) {
      try {
        await resetProgress(id).unwrap();
        refetch();
      } catch (error) {
        console.error("Failed to reset progress:", error);
      }
    }
  };

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
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="h-8 md:h-9 text-xs md:text-sm">
                <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Quay lại</span>
              </Button>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold line-clamp-2">{course.title}</h1>
              <p className="text-xs md:text-sm text-muted-foreground line-clamp-1 mt-0.5">{course.description}</p>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className="h-8 w-8 md:h-9 md:w-9 p-0"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 md:h-9 md:w-9 p-0">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 lg:space-y-8">
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
                      <BookOpen className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 mx-auto mb-2 md:mb-4 opacity-50" />
                      <h3 className="text-base md:text-lg lg:text-xl font-semibold px-2">{course.title}</h3>
                    </div>
                  </div>
                )}
              </div>
              <CardContent className="p-4 md:p-5 lg:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 lg:gap-4 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <span>{formatDuration(totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 md:h-4 md:w-4" />
                      <span>{lessons.length} bài học</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
                  <Badge variant="secondary" className="text-xs w-fit">{course.level}</Badge>
                </div>
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 lg:mb-4">{course.title}</h2>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-5 lg:mb-6">
                  {course.description}
                </p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 lg:gap-4">
                  <Button
                    size="lg"
                    onClick={handleStartLearning}
                    className="bg-orange-500 hover:bg-orange-600 text-sm md:text-base h-10 md:h-11"
                    disabled={lessons.length === 0}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {userProgress?.status === "in_progress"
                      ? "Tiếp tục học"
                      : "Bắt đầu học"}
                  </Button>
                  {userProgress?.status === "in_progress" && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleResetProgress}
                      disabled={isResetting}
                      className="text-sm md:text-base h-10 md:h-11"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Reset tiến độ</span>
                      <span className="sm:hidden">Reset</span>
                    </Button>
                  )}
                  <Button variant="outline" size="lg" className="text-sm md:text-base h-10 md:h-11">
                    <Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Tải tài liệu</span>
                    <span className="sm:hidden">Tải về</span>
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
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                  <TabsTrigger value="overview" className="text-xs md:text-sm py-2 px-2 md:px-4">Tổng quan</TabsTrigger>
                  <TabsTrigger value="curriculum" className="text-xs md:text-sm py-2 px-2 md:px-4">Chương trình</TabsTrigger>
                  <TabsTrigger value="instructor" className="text-xs md:text-sm py-2 px-2 md:px-4">Giảng viên</TabsTrigger>
                  <TabsTrigger value="reviews" className="text-xs md:text-sm py-2 px-2 md:px-4">Đánh giá</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="p-4 md:p-5 lg:p-6">
                  <div className="space-y-4 md:space-y-5 lg:space-y-6">
                    <div>
                      <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">
                        Giới thiệu khóa học
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                        <Target className="h-4 w-4 md:h-5 md:w-5" />
                        Mục tiêu khóa học
                      </h4>
                      <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Nắm vững kiến thức cơ bản về tiếng Nhật</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Phát triển kỹ năng giao tiếp thực tế</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>Chuẩn bị cho các kỳ thi JLPT</span>
                        </li>
                      </ul>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2 md:mb-3 flex items-center gap-2 text-sm md:text-base">
                        <Lightbulb className="h-4 w-4 md:h-5 md:w-5" />
                        Bạn sẽ học được gì
                      </h4>
                      <ul className="space-y-1.5 md:space-y-2 text-sm md:text-base text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Đọc và viết tất cả các ký tự hiragana</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Hiểu thứ tự nét vẽ và kỹ thuật viết đúng</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>
                            Nhận biết hiragana trong văn bản tiếng Nhật thực tế
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Sử dụng kỹ thuật ghi nhớ để học nhanh hơn</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="curriculum" className="p-4 md:p-5 lg:p-6">
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
                      <h3 className="text-lg md:text-xl font-semibold">
                        Nội dung khóa học
                      </h3>
                      <div className="text-xs md:text-sm text-muted-foreground">
                        {completedLessons}/{lessons.length} bài đã hoàn thành
                      </div>
                    </div>

                    {lessons.length > 0 && (
                      <div className="mb-3 md:mb-4">
                        <Progress value={progressPercentage} className="h-1.5 md:h-2" />
                      </div>
                    )}

                    <div className="space-y-2 md:space-y-3">
                      {lessons.map((lesson, index) => {
                        const completed = isLessonCompleted(lesson._id);
                        const isCurrent =
                          lesson._id === userProgress?.currentLessonId;
                        return (
                          <div
                            key={lesson._id}
                            className={cn(
                              "flex items-start gap-2 md:gap-3 lg:gap-4 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer",
                              isCurrent && "border-primary bg-primary/5"
                            )}
                            onClick={() =>
                              router.push(`/courses/${id}/learn/${lesson._id}`)
                            }
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {completed ? (
                                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                              ) : isCurrent ? (
                                <Circle className="h-4 w-4 md:h-5 md:w-5 text-primary fill-primary/20" />
                              ) : (
                                <Circle className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px] md:text-xs">
                                  Bài {index + 1}
                                </Badge>
                                <Badge variant="secondary" className="text-[10px] md:text-xs">
                                  {lesson.type === "video" ? "Video" : "Bài tập"}
                                </Badge>
                                {isCurrent && (
                                  <Badge
                                    variant="default"
                                    className="text-[10px] md:text-xs bg-primary"
                                  >
                                    Đang học
                                  </Badge>
                                )}
                                {completed && (
                                  <Badge
                                    variant="default"
                                    className="text-[10px] md:text-xs bg-green-600"
                                  >
                                    Hoàn thành ✓
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-medium text-sm md:text-base mb-1">{lesson.title}</h4>
                              <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                                {lesson.content}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground flex-shrink-0">
                              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              <span>{formatDuration(lesson.duration || 0)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="instructor" className="p-4 md:p-5 lg:p-6">
                  <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6">
                    <Avatar className="w-16 h-16 md:w-20 md:h-20">
                      <AvatarImage src={course.instructor?.avatar} />
                      <AvatarFallback className="text-xl md:text-2xl">
                        {course.instructor?.fullname?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-semibold mb-2">
                        {course.instructor?.fullname || "Chưa xác định"}
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                        {course.instructor?.email || "Chưa xác định"}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-yellow-400 text-yellow-400" />
                          <span>4.9</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          <span>5,000+ học viên</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          <span>10+ năm kinh nghiệm</span>
                        </div>
                      </div>
                      <p className="text-sm md:text-base text-muted-foreground">
                        Giảng viên có nhiều năm kinh nghiệm trong việc giảng dạy
                        tiếng Nhật, đã giúp hàng nghìn học viên đạt được mục
                        tiêu học tập của mình.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="p-4 md:p-5 lg:p-6">
                  <div className="text-center py-6 md:py-8">
                    <Star className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-3 md:mb-4" />
                    <h3 className="text-base md:text-lg font-semibold mb-2">
                      Chưa có đánh giá
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Hãy là người đầu tiên đánh giá khóa học này
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-5 lg:space-y-6">
            {/* Course Info Card */}
            <Card>
              <CardContent className="p-4 md:p-5 lg:p-6">
                <div className="text-center mb-4 md:mb-5 lg:mb-6">
                  <div className="text-2xl md:text-3xl font-bold text-orange-500 mb-1 md:mb-2">
                    {formatPrice(course.price)}
                  </div>
                  {course.price > 0 && (
                    <div className="text-xs md:text-sm text-muted-foreground line-through">
                      {formatPrice(course.price * 1.5)}
                    </div>
                  )}
                </div>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 mb-3 md:mb-4 text-sm md:text-base h-10 md:h-11"
                  onClick={handleStartLearning}
                  disabled={lessons.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  <span className="line-clamp-1">
                    {userProgress?.status === "in_progress"
                      ? nextLesson
                        ? `Tiếp tục: ${nextLesson.title.slice(0, 15)}...`
                        : "Tiếp tục học"
                      : "Bắt đầu học ngay"}
                  </span>
                </Button>
                <div className="text-center text-xs md:text-sm text-muted-foreground">
                  Đảm bảo hoàn tiền trong 30 ngày
                </div>
              </CardContent>
            </Card>

            {/* Course Stats */}
            <Card>
              <CardHeader className="p-4 md:p-5 lg:p-6 pb-3 md:pb-4">
                <CardTitle className="text-base md:text-lg">Thống kê khóa học</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-5 lg:p-6 pt-0 space-y-3 md:space-y-4">
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Thời lượng</span>
                  <span className="font-medium">
                    {formatDuration(totalDuration)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Số bài học</span>
                  <span className="font-medium">{lessons.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Học viên</span>
                  <span className="font-medium">
                    {(
                      course.studentCount ||
                      course.students?.length ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Cấp độ</span>
                  <Badge variant="secondary" className="text-xs">{course.level}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Ngôn ngữ</span>
                  <div className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="text-sm">Tiếng Việt</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Chứng chỉ</span>
                  <div className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    <span className="text-sm">Có</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm md:text-base">
                  <span className="text-muted-foreground">Ngày tạo</span>
                  <span className="font-medium text-xs md:text-sm">
                    {formatDate(course.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            {lessons.length > 0 && (
              <Card>
                <CardHeader className="p-4 md:p-5 lg:p-6 pb-3 md:pb-4">
                  <CardTitle className="text-base md:text-lg">Tiến độ học tập</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-5 lg:p-6 pt-0 space-y-3 md:space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs md:text-sm mb-2">
                      <span>Hoàn thành</span>
                      <span className="font-medium">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2 md:h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Đã hoàn thành</p>
                      <p className="font-semibold text-primary text-base md:text-lg">
                        {completedLessons}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Còn lại</p>
                      <p className="font-semibold text-base md:text-lg">
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
