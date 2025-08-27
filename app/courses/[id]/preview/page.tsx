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

const courseData = {
  1: {
    id: 1,
    title: "Hiragana Mastery",
    description:
      "Master all 46 hiragana characters with interactive exercises, mnemonics, and cultural context. This comprehensive course will take you from complete beginner to confident hiragana reader.",
    longDescription:
      "Hiragana is the foundation of Japanese writing. In this course, you'll learn all 46 basic hiragana characters plus their variations. We use proven memory techniques, interactive exercises, and real-world examples to ensure you not only memorize the characters but truly understand how to use them.",
    image: "/japanese-hiragana-characters-colorful-illustration.png",
    level: "Beginner",
    duration: "2 weeks",
    students: 1234,
    rating: 4.8,
    reviews: 156,
    price: "Free",
    originalPrice: "$39",
    category: "Writing System",
    instructor: {
      name: "Tanaka Sensei",
      avatar: "/anime-style-avatar-teacher.png",
      bio: "Native Japanese speaker with 10+ years teaching experience",
      rating: 4.9,
      students: 5000,
    },
    lessons: 12,
    totalHours: 8,
    language: "English",
    certificate: true,
    features: [
      "Interactive character practice",
      "Memory techniques and mnemonics",
      "Audio pronunciation guides",
      "Cultural context lessons",
      "Progress tracking",
      "Mobile-friendly exercises",
    ],
    curriculum: [
      {
        title: "Introduction to Hiragana",
        duration: "15 min",
        type: "video",
        completed: false,
      },
      {
        title: "A-row Characters (あ, い, う, え, お)",
        duration: "25 min",
        type: "interactive",
        completed: false,
      },
      {
        title: "K-row Characters (か, き, く, け, こ)",
        duration: "25 min",
        type: "interactive",
        completed: false,
      },
      {
        title: "S-row Characters (さ, し, す, せ, そ)",
        duration: "25 min",
        type: "interactive",
        completed: false,
      },
      {
        title: "T-row Characters (た, ち, つ, て, と)",
        duration: "25 min",
        type: "interactive",
        completed: false,
      },
      {
        title: "N-row Characters (な, に, ぬ, ね, の)",
        duration: "25 min",
        type: "interactive",
        completed: false,
      },
      {
        title: "H-row Characters (は, ひ, ふ, へ, ほ)",
        duration: "25 min",
        type: "interactive",
        completed: false,
      },
      {
        title: "M-row Characters (ま, み, む, め, も)",
        duration: "25 min",
        type: "interactive",
        completed: false,
      },
      {
        title: "Y-row Characters (や, ゆ, よ)",
        duration: "15 min",
        type: "interactive",
        completed: false,
      },
      {
        title: "R-row Characters (ら, り, る, れ, ろ)",
        duration: "25 min",
        type: "interactive",
        completed: false,
      },
      {
        title: "W-row and N (わ, を, ん)",
        duration: "20 min",
        type: "interactive",
        completed: false,
      },
      {
        title: "Final Review and Assessment",
        duration: "30 min",
        type: "quiz",
        completed: false,
      },
    ],
    requirements: [
      "No prior Japanese knowledge required",
      "Computer or mobile device with internet",
      "Dedication to practice 15-20 minutes daily",
    ],
    whatYouLearn: [
      "Read and write all 46 hiragana characters",
      "Understand stroke order and proper writing technique",
      "Recognize hiragana in real Japanese text",
      "Use memory techniques for faster learning",
      "Build foundation for further Japanese study",
    ],
  },
};

export default function CoursePreviewPage() {
  const params = useParams();
  const courseId = Number.parseInt(params.id as string);
  const course = courseData[courseId as keyof typeof courseData];
  const [isLiked, setIsLiked] = useState(false);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-600 mb-4">
            Course not found
          </h1>
          <Link href="/courses">
            <Button>Back to Courses</Button>
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
                Back to Courses
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-white/20 text-white border-white/30">
                  {course.category}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  {course.level}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                {course.title}
              </h1>

              <p className="text-xl opacity-90 mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="opacity-75">({course.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{course.totalHours} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{course.lessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span>{course.language}</span>
                </div>
              </div>
            </div>

            {/* Course Preview Card */}
            <div className="lg:col-span-1">
              <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
                <div className="relative">
                  <img
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-t-lg">
                    <Button
                      size="lg"
                      className="bg-white/90 text-gray-900 hover:bg-white"
                    >
                      <Play className="h-6 w-6 mr-2" />
                      Preview Course
                    </Button>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-3xl font-bold text-orange-500">
                        {course.price}
                      </span>
                      {course.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          {course.originalPrice}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">Limited time offer</p>
                  </div>

                  <Link href={`/courses/${course.id}`} className="block mb-4">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-3">
                      Start Learning Now
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
                      {isLiked ? "Liked" : "Like"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Mobile and desktop</span>
                    </div>
                    {course.certificate && (
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-green-500" />
                        <span>Certificate of completion</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4 text-green-500" />
                      <span>Downloadable resources</span>
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
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Course</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {course.longDescription}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>What You'll Learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.whatYouLearn.map((item, index) => (
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
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.requirements.map((req, index) => (
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
                    <CardTitle>Course Curriculum</CardTitle>
                    <CardDescription>
                      {course.lessons} lessons • {course.totalHours} hours total
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
                            <h4 className="font-medium">{lesson.title}</h4>
                            <p className="text-sm text-gray-500">
                              {lesson.duration}
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
                    <CardTitle>Meet Your Instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <img
                        src={course.instructor.avatar || "/placeholder.svg"}
                        alt={course.instructor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          {course.instructor.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {course.instructor.bio}
                        </p>

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{course.instructor.rating} rating</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>
                              {course.instructor.students.toLocaleString()}{" "}
                              students
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-2xl font-bold">
                          {course.rating}
                        </span>
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        Based on {course.reviews} reviews
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Sample reviews */}
                      <div className="border-b pb-4">
                        <div className="flex items-start gap-3">
                          <img
                            src="/anime-style-avatar-girl.png"
                            alt="Student"
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">Sarah M.</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              "Excellent course! The mnemonics really helped me
                              remember the characters. I went from knowing zero
                              hiragana to reading simple words in just two
                              weeks."
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-b pb-4">
                        <div className="flex items-start gap-3">
                          <img
                            src="/anime-style-avatar-boy.png"
                            alt="Student"
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">Mike T.</span>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300">
                              "Perfect for beginners! The interactive exercises
                              made learning fun and engaging. Tanaka Sensei
                              explains everything clearly."
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Course Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {course.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Related Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Link href="/courses/2/preview" className="block">
                      <div className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <img
                          src="/japanese-katakana-characters-modern-design.png"
                          alt="Katakana Essentials"
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            Katakana Essentials
                          </h4>
                          <p className="text-xs text-gray-500">
                            Beginner • $29
                          </p>
                        </div>
                      </div>
                    </Link>

                    <Link href="/courses/3/preview" className="block">
                      <div className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <img
                          src="/japanese-kanji-characters-traditional-calligraphy.png"
                          alt="Essential Kanji"
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            Essential Kanji
                          </h4>
                          <p className="text-xs text-gray-500">
                            Intermediate • $49
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
