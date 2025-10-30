"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  Clock,
  Users,
  Star,
  BookOpen,
  CheckCircle,
  Award,
  Globe,
  Download,
  Heart,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { useGetCourseByIdQuery } from "@/store/services/courseApi";
import { LoadingSpinner } from "@/components/loading";
import { withAuth } from "@/components/auth";

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

// Helper function để format thời gian
const formatDuration = (duration: number) => {
  if (duration < 60) return `${duration} phút`;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

function CoursePreviewPage() {
  const params = useParams();
  const courseId = (params as any).id as string;
  const [isLiked, setIsLiked] = useState(false);

  // Fetch course data từ API
  const {
    data: courseData,
    isLoading,
    isError,
    refetch,
  } = useGetCourseByIdQuery(courseId);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (isError || !courseData?.data) {
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

  const course = courseData.data;
  const totalDuration = course.lessons?.reduce((sum, lesson) => sum + (lesson.duration || 0), 0) || 0;

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
                <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
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
            {/* Course Video Preview */}
            <Card>
              <div className="aspect-video bg-black rounded-t-lg relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Play className="h-8 w-8 text-primary-foreground ml-1" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Xem trước khóa học</h3>
                    <p className="text-gray-300">Nhấp để xem video giới thiệu</p>
                  </div>
                </div>
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
                      <span>{course.lessons?.length || 0} bài học</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{(course.studentCount || course.students?.length || 0).toLocaleString()} học viên</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{course.level}</Badge>
                </div>
                <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
                <p className="text-muted-foreground mb-6">{course.description}</p>
                <div className="flex items-center gap-4">
                  <Link href={`/courses/${course._id}`}>
                    <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
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
              <Tabs defaultValue="curriculum" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="curriculum">Chương trình</TabsTrigger>
                  <TabsTrigger value="instructor">Giảng viên</TabsTrigger>
                  <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
                  <TabsTrigger value="details">Chi tiết</TabsTrigger>
                </TabsList>

                <TabsContent value="curriculum" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold mb-4">Nội dung khóa học</h3>
                    {course.lessons?.map((lesson, index) => (
                      <div
                        key={lesson._id}
                        className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          {(lesson.userCompleted?.length || 0) > 0 ? (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                          )}
                        </div>
                        <div className="flex-1">
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
                </TabsContent>

                <TabsContent value="instructor" className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold">
                        {course.instructor?.fullname?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {course.instructor?.fullname || 'Chưa xác định'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {course.instructor?.email || 'Chưa xác định'}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>4.9</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>5,000+ học viên</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="p-6">
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Chưa có đánh giá</h3>
                    <p className="text-muted-foreground">
                      Hãy là người đầu tiên đánh giá khóa học này
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Yêu cầu</h4>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Không cần kiến thức tiếng Nhật trước đó</li>
                        <li>Máy tính hoặc thiết bị di động có kết nối internet</li>
                        <li>Dedication to practice 15-20 minutes daily</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Bạn sẽ học được gì</h4>
                      <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Đọc và viết tất cả các ký tự hiragana</li>
                        <li>Hiểu thứ tự nét vẽ và kỹ thuật viết đúng</li>
                        <li>Nhận biết hiragana trong văn bản tiếng Nhật thực tế</li>
                        <li>Sử dụng kỹ thuật ghi nhớ để học nhanh hơn</li>
                        <li>Xây dựng nền tảng cho việc học tiếng Nhật tiếp theo</li>
                      </ul>
                    </div>
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
                  <span className="font-medium">{formatDuration(totalDuration)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Số bài học</span>
                  <span className="font-medium">{course.lessons?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Học viên</span>
                  <span className="font-medium">{(course.studentCount || course.students?.length || 0).toLocaleString()}</span>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CoursePreviewPage);