"use client";

import { useState } from "react";
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
import { useLanguage } from "@/lib/language-context";

const courseData = {
  1: {
    id: 1,
    title: {
      en: "Hiragana Mastery",
      vi: "Thành thạo Hiragana",
    },
    description: {
      en: "Master all 46 hiragana characters with interactive exercises, mnemonics, and cultural context. This comprehensive course will take you from complete beginner to confident hiragana reader.",
      vi: "Thành thạo 46 ký tự hiragana với các bài tập tương tác, ghi nhớ và văn hóa. Khóa học này sẽ giúp bạn từ người mới bắt đầu trở thành người đọc hiragana tự tin.",
    },
    longDescription: {
      en: "Hiragana is the foundation of Japanese writing. In this course, you'll learn all 46 basic hiragana characters plus their variations. We use proven memory techniques, interactive exercises, and real-world examples to ensure you not only memorize the characters but truly understand how to use them.",
      vi: "Hiragana là nền tảng của chữ viết tiếng Nhật. Trong khóa học này, bạn sẽ học tất cả 46 ký tự hiragana cơ bản và các biến thể. Chúng tôi sử dụng kỹ thuật ghi nhớ, bài tập tương tác và ví dụ thực tế để giúp bạn không chỉ ghi nhớ mà còn hiểu cách sử dụng.",
    },
    image: "/japanese-hiragana-characters-colorful-illustration.png",
    level: {
      en: "Beginner",
      vi: "Người mới bắt đầu",
    },
    duration: {
      en: "2 weeks",
      vi: "2 tuần",
    },
    students: 1234,
    rating: 4.8,
    reviews: 156,
    price: {
      en: "Free",
      vi: "Miễn phí",
    },
    originalPrice: "$39",
    category: {
      en: "Writing System",
      vi: "Hệ thống chữ viết",
    },
    instructor: {
      name: {
        en: "Tanaka Sensei",
        vi: "Thầy Tanaka",
      },
      avatar: "/anime-style-avatar-teacher.png",
      bio: {
        en: "Native Japanese speaker with 10+ years teaching experience",
        vi: "Giáo viên bản xứ với hơn 10 năm kinh nghiệm giảng dạy",
      },
      rating: 4.9,
      students: 5000,
    },
    lessons: 12,
    totalHours: 8,
    language: {
      en: "English",
      vi: "Tiếng Anh",
    },
    certificate: true,
    features: {
      en: [
        "Interactive character practice",
        "Memory techniques and mnemonics",
        "Audio pronunciation guides",
        "Cultural context lessons",
        "Progress tracking",
        "Mobile-friendly exercises",
      ],
      vi: [
        "Luyện tập ký tự tương tác",
        "Kỹ thuật ghi nhớ và mẹo học",
        "Hướng dẫn phát âm",
        "Bài học về văn hóa",
        "Theo dõi tiến trình",
        "Bài tập phù hợp di động",
      ],
    },
    curriculum: [
      {
        title: {
          en: "Introduction to Hiragana",
          vi: "Giới thiệu về Hiragana",
        },
        duration: {
          en: "15 min",
          vi: "15 phút",
        },
        type: "video",
        completed: false,
      },
      {
        title: {
          en: "A-row Characters (あ, い, う, え, お)",
          vi: "Nhóm ký tự A (あ, い, う, え, お)",
        },
        duration: {
          en: "25 min",
          vi: "25 phút",
        },
        type: "interactive",
        completed: false,
      },
      // ...các bài học khác cũng làm tương tự...
    ],
    requirements: {
      en: [
        "No prior Japanese knowledge required",
        "Computer or mobile device with internet",
        "Dedication to practice 15-20 minutes daily",
      ],
      vi: [
        "Không cần kiến thức tiếng Nhật trước đó",
        "Máy tính hoặc điện thoại có internet",
        "Cam kết luyện tập 15-20 phút mỗi ngày",
      ],
    },
    whatYouLearn: {
      en: [
        "Read and write all 46 hiragana characters",
        "Understand stroke order and proper writing technique",
        "Recognize hiragana in real Japanese text",
        "Use memory techniques for faster learning",
        "Build foundation for further Japanese study",
      ],
      vi: [
        "Đọc và viết 46 ký tự hiragana",
        "Hiểu thứ tự nét và kỹ thuật viết đúng",
        "Nhận diện hiragana trong văn bản thực tế",
        "Áp dụng kỹ thuật ghi nhớ để học nhanh hơn",
        "Xây dựng nền tảng cho việc học tiếng Nhật tiếp theo",
      ],
    },
  },
};

export default function CoursePreviewPage() {
  const params = useParams();
  const courseId = Number.parseInt(params.id as string);
  const { language, t } = useLanguage();
  const course = courseData[courseId as keyof typeof courseData];
  const [isLiked, setIsLiked] = useState(false);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">
            {t("course.courseNotFound")}
          </h1>
          <Link href="/courses">
            <Button>{t("course.backToCourses")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/courses">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("course.backToCourses")}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  {course.category[language]}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  {course.level[language]}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {course.title[language]}
              </h1>

              <p className="text-xl opacity-90 mb-6">{course.description[language]}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="opacity-75">({course.reviews} {t("course.reviewsCount")})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.students.toLocaleString()} {t("course.students")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{course.totalHours} {t("course.hours")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{course.lessons} {t("course.lessons")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span>{course.language[language]}</span>
                </div>
              </div>
            </div>

            {/* Course Preview Card */}
            <div className="lg:col-span-1">
              <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
                <div className="relative">
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title[language]}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-t-lg">
                    <Button
                      size="lg"
                      className="bg-white/90 text-gray-900 hover:bg-white"
                    >
                      <Play className="h-6 w-6 mr-2" />
                      {t("course.previewCourse")}
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-orange-500">
                        {course.price[language]}
                      </span>
                      {course.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          {course.originalPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{t("course.limitedTimeOffer")}</p>
                  </div>

                  <Link href={`/courses/${course.id}`} className="block mb-4">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-3">
                      {t("course.startLearningNow")}
                    </Button>
                  </Link>

                  <div className="flex gap-2 mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => setIsLiked(!isLiked)}
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${
                          isLiked ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                      {isLiked ? t("course.liked") : t("course.like")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      {t("course.share")}
                    </Button>
                  </div>

                  <div className="space-y-3 text-sm">
                    {course.features[language].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{t("course.lifetimeAccess")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{t("course.mobileAndDesktop")}</span>
                    </div>
                    {course.certificate && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-green-500" />
                        <span>{t("course.certificateOfCompletion")}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-green-500" />
                      <span>{t("course.downloadableResources")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">{t("course.overview")}</TabsTrigger>
                <TabsTrigger value="curriculum">{t("course.curriculum")}</TabsTrigger>
                <TabsTrigger value="instructor">{t("course.instructor")}</TabsTrigger>
                <TabsTrigger value="reviews">{t("course.reviews")}</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("course.aboutThisCourse")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {course.longDescription[language]}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("course.whatYoullLearn")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.whatYouLearn[language].map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("course.requirements")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.requirements[language].map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">
                            {req}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("course.courseCurriculum")}</CardTitle>
                    <CardDescription>
                      {course.lessons} {t("course.lessonsTotal")} • {course.totalHours} {t("course.hoursTotal")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {course.curriculum.map((lesson, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            {lesson.type === "video" && (
                              <Play className="h-5 w-5 text-blue-500" />
                            )}
                            {lesson.type === "interactive" && (
                              <BookOpen className="h-5 w-5 text-green-500" />
                            )}
                            {lesson.type === "quiz" && (
                              <CheckCircle className="h-5 w-5 text-orange-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{lesson.title[language]}</h4>
                            <p className="text-sm text-gray-500">
                              {lesson.duration[language]}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {lesson.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("course.meetYourInstructor")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <img
                        src={course.instructor.avatar || "/placeholder.svg"}
                        alt={course.instructor.name[language]}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          {course.instructor.name[language]}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {course.instructor.bio[language]}
                        </p>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{course.instructor.rating} {t("course.rating")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {course.instructor.students.toLocaleString()}{" "}
                              {t("course.students")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TabsContent value="reviews" giữ nguyên vì là review mẫu */}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("course.courseFeatures")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {course.features[language].map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* ...sidebar related courses giữ nguyên... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}