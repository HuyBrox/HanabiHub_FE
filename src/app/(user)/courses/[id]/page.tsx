"use client";

import { useState, useMemo, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  Circle,
  Play,
  ChevronRight,
  Volume2,
  ArrowLeft,
  Menu,
  X,
  BookOpen,
  Award,
  Clock,
  ListChecks,
  ChevronLeft,
  Sparkles,
  XCircle,
  RotateCcw,
  Trophy,
  FileText,
  Mic,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetCourseByIdQuery } from "@/store/services/courseApi";
import { LoadingSpinner } from "@/components/loading";
import { withAuth } from "@/components/auth";
import { useRouter } from "next/navigation";

const formatDuration = (duration: number) => {
  if (duration < 60) return `${duration} phút`;
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

const getYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [fillBlankAnswers, setFillBlankAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const { id } = use(params);
  const {
    data: courseData,
    isLoading,
    isError,
    refetch,
  } = useGetCourseByIdQuery(id);

  const lessons = useMemo(() => {
    if (!courseData?.data?.lessons) return [];
    return [...courseData.data.lessons].sort((a, b) => a.order - b.order);
  }, [courseData]);

  const currentLesson = lessons[currentLessonIndex];
  const completedLessons = lessons.filter(
    (lesson) => (lesson.userCompleted?.length || 0) > 0
  ).length;
  const progressPercentage =
    lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

  const handleAnswerSelect = (questionId: string, answer: string) => {
    if (showResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleFillBlankChange = (itemId: string, value: string) => {
    if (showResults) return;
    setFillBlankAnswers((prev) => ({ ...prev, [itemId]: value }));
  };

  const calculateScore = () => {
    if (!currentLesson?.jsonTask?.items) return 0;
    const items = currentLesson.jsonTask.items;
    let correct = 0;
    let total = items.length;

    items.forEach((item: any) => {
      if (
        currentLesson.taskType === "multiple_choice" ||
        currentLesson.taskType === "listening"
      ) {
        if (selectedAnswers[item.id] === item.answer) correct++;
      } else if (currentLesson.taskType === "fill_blank") {
        if (
          fillBlankAnswers[item.id]?.trim().toLowerCase() ===
          item.answer?.trim().toLowerCase()
        )
          correct++;
      }
    });

    return Math.round((correct / total) * 100);
  };

  const handleSubmitQuiz = () => {
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
      resetAnswers();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
      resetAnswers();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const resetAnswers = () => {
    setSelectedAnswers({});
    setFillBlankAnswers({});
    setShowResults(false);
    setScore(null);
  };

  const handleRetry = () => {
    resetAnswers();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !courseData?.data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2 hover:bg-primary/10"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Quay lại</span>
              </Button>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div className="hidden md:block">
                <h1 className="font-semibold text-base lg:text-lg line-clamp-1">
                  {course.title}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Bài {currentLessonIndex + 1}/{lessons.length}:{" "}
                  {currentLesson?.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="hidden sm:flex gap-1.5 px-3"
              >
                <Award className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">
                  {completedLessons}/{lessons.length}
                </span>
              </Badge>

              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="mt-3 lg:hidden">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
              <span>Tiến độ</span>
              <span className="font-medium">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside
            className={cn(
              "lg:col-span-4 xl:col-span-3",
              "fixed lg:sticky top-[73px] lg:top-[85px] left-0",
              "h-[calc(100vh-73px)] lg:h-[calc(100vh-109px)]",
              "w-80 sm:w-96 lg:w-full z-40",
              "bg-white dark:bg-gray-900 lg:bg-transparent",
              "border-r lg:border-0 border-gray-200 dark:border-gray-800",
              "transition-transform duration-300 ease-in-out",
              "shadow-xl lg:shadow-none",
              isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0",
              "overflow-hidden"
            )}
          >
            <Card className="h-full flex flex-col border-0 lg:border rounded-none lg:rounded-lg shadow-none lg:shadow">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">
                    Nội dung khóa học
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden h-8 w-8 p-0"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-medium">Tiến độ học tập</span>
                    <span className="font-semibold text-primary">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {completedLessons} / {lessons.length} bài học
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-2 sm:p-3">
                <div className="space-y-1.5">
                  {lessons.map((lesson, index) => {
                    const isCompleted = (lesson.userCompleted?.length || 0) > 0;
                    const isCurrent = currentLessonIndex === index;

                    return (
                      <button
                        key={lesson._id}
                        onClick={() => {
                          setCurrentLessonIndex(index);
                          resetAnswers();
                          setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all group",
                          "hover:bg-muted/70 hover:shadow-sm",
                          isCurrent
                            ? "bg-gradient-to-r from-primary/15 to-primary/5 border-2 border-primary/40 shadow-md"
                            : "border-2 border-transparent hover:border-muted"
                        )}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isCompleted ? (
                            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                              <CheckCircle className="h-4 w-4 text-white" />
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "h-7 w-7 rounded-full border-2 flex items-center justify-center text-xs font-semibold transition-all",
                                isCurrent
                                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                  : "border-muted-foreground/30 text-muted-foreground group-hover:border-primary/50"
                              )}
                            >
                              {index + 1}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "font-medium text-sm mb-1.5 line-clamp-2 leading-snug",
                              isCurrent
                                ? "text-primary"
                                : "text-foreground group-hover:text-primary"
                            )}
                          >
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {lesson.type === "video" ? (
                              <div className="flex items-center gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                                <Play className="h-3 w-3" />
                                <span className="font-medium">Video</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded">
                                <ListChecks className="h-3 w-3" />
                                <span className="font-medium">Bài tập</span>
                              </div>
                            )}
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(lesson.duration || 0)}</span>
                          </div>
                        </div>

                        {isCurrent && (
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="lg:col-span-8 xl:col-span-9 space-y-4 lg:space-y-6">
            {/* Score Display - Show after submit */}
            {showResults &&
              score !== null &&
              currentLesson?.type === "task" && (
                <Card className="overflow-hidden border-0 lg:border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                  <div
                    className={cn(
                      "p-6 lg:p-8 text-center",
                      score >= 80
                        ? "bg-gradient-to-br from-green-500 to-emerald-600"
                        : score >= 60
                        ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                        : score >= 40
                        ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                        : "bg-gradient-to-br from-red-500 to-pink-600"
                    )}
                  >
                    <div className="flex flex-col items-center gap-4 text-white">
                      {score >= 80 ? (
                        <Trophy className="h-16 w-16 lg:h-20 lg:w-20 animate-bounce" />
                      ) : score >= 60 ? (
                        <Sparkles className="h-16 w-16 lg:h-20 lg:w-20 animate-pulse" />
                      ) : (
                        <XCircle className="h-16 w-16 lg:h-20 lg:w-20 animate-pulse" />
                      )}
                      <div>
                        <h2 className="text-3xl lg:text-4xl font-bold mb-2">
                          {score}%
                        </h2>
                        <p className="text-lg lg:text-xl font-medium opacity-90">
                          {score >= 80
                            ? "🎉 Xuất sắc!"
                            : score >= 60
                            ? "👍 Tốt lắm!"
                            : score >= 40
                            ? "💪 Cố gắng thêm!"
                            : "📚 Hãy thử lại!"}
                        </p>
                      </div>
                      <div className="flex gap-3 mt-2">
                        <Button
                          onClick={handleRetry}
                          variant="secondary"
                          size="lg"
                          className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Làm lại
                        </Button>
                        {currentLessonIndex < lessons.length - 1 && (
                          <Button
                            onClick={handleNextLesson}
                            size="lg"
                            className="gap-2 bg-white text-gray-900 hover:bg-white/90"
                          >
                            Bài tiếp theo
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

            {/* Lesson Content Card */}
            <Card className="overflow-hidden border-0 lg:border shadow-lg">
              {/* Video Lesson */}
              {currentLesson?.type === "video" && currentLesson.videoUrl && (
                <div className="relative bg-black group">
                  <div className="aspect-video">
                    {currentLesson.videoType === "youtube" ? (
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                          currentLesson.videoUrl
                        )}`}
                        title={currentLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        className="w-full h-full"
                        controls
                        src={currentLesson.videoUrl}
                      >
                        Trình duyệt của bạn không hỗ trợ video.
                      </video>
                    )}
                  </div>
                </div>
              )}

              {/* Lesson Info */}
              <CardHeader className="bg-gradient-to-r from-background to-muted/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="font-medium">
                        Bài {currentLessonIndex + 1}/{lessons.length}
                      </Badge>
                      {currentLesson?.type === "video" ? (
                        <Badge className="bg-blue-500 hover:bg-blue-600">
                          <Play className="h-3 w-3 mr-1" />
                          Video
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-500 hover:bg-orange-600">
                          <ListChecks className="h-3 w-3 mr-1" />
                          Bài tập
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl lg:text-2xl">
                      {currentLesson?.title}
                    </CardTitle>
                    {currentLesson?.content && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {currentLesson.content}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 lg:p-6">
                {/* Video Description */}
                {currentLesson?.type === "video" && (
                  <div className="prose dark:prose-invert max-w-none">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Mô tả bài học
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {currentLesson.content ||
                        "Không có mô tả cho bài học này."}
                    </p>
                  </div>
                )}

                {/* Task Content */}
                {currentLesson?.type === "task" && currentLesson.jsonTask && (
                  <div className="space-y-6">
                    {/* Task Instructions */}
                    {currentLesson.jsonTask.instructions && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 rounded-r-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                              Hướng dẫn
                            </h4>
                            <p className="text-sm text-blue-800 dark:text-blue-200">
                              {currentLesson.jsonTask.instructions}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Multiple Choice Task */}
                    {currentLesson.taskType === "multiple_choice" &&
                      currentLesson.jsonTask.items?.map(
                        (item: any, index: number) => (
                          <div
                            key={item.id || index}
                            className="p-5 lg:p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-muted space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <h3 className="font-semibold text-base lg:text-lg flex items-start gap-2">
                              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </span>
                              <span className="flex-1">{item.question}</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {item.options?.map((option: any) => {
                                const isSelected =
                                  selectedAnswers[item.id] === option.key;
                                const isCorrect = option.key === item.answer;
                                const showCorrect = showResults && isCorrect;
                                const showWrong =
                                  showResults && isSelected && !isCorrect;

                                return (
                                  <button
                                    key={option.key}
                                    onClick={() =>
                                      handleAnswerSelect(item.id, option.key)
                                    }
                                    disabled={showResults}
                                    className={cn(
                                      "p-4 text-left border-2 rounded-lg transition-all font-medium group",
                                      "hover:shadow-md disabled:cursor-not-allowed relative overflow-hidden",
                                      !showResults &&
                                        isSelected &&
                                        "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20",
                                      !showResults &&
                                        !isSelected &&
                                        "border-border hover:bg-muted/50 hover:border-primary/50",
                                      showCorrect &&
                                        "border-green-500 bg-green-50 dark:bg-green-950/30 ring-2 ring-green-500/20",
                                      showWrong &&
                                        "border-red-500 bg-red-50 dark:bg-red-950/30 ring-2 ring-red-500/20"
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span
                                        className={cn(
                                          "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all",
                                          isSelected &&
                                            !showResults &&
                                            "border-primary bg-primary text-primary-foreground",
                                          !isSelected &&
                                            !showResults &&
                                            "border-muted-foreground/30 group-hover:border-primary/50",
                                          showCorrect &&
                                            "border-green-500 bg-green-500 text-white",
                                          showWrong &&
                                            "border-red-500 bg-red-500 text-white"
                                        )}
                                      >
                                        {showCorrect
                                          ? "✓"
                                          : showWrong
                                          ? "✗"
                                          : option.key}
                                      </span>
                                      <span className="flex-1">
                                        {option.text}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            {showResults && item.explanation && (
                              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 rounded-r-lg animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-start gap-2">
                                  <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                  <span>{item.explanation}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      )}

                    {/* Fill Blank Task */}
                    {currentLesson.taskType === "fill_blank" &&
                      currentLesson.jsonTask.items?.map(
                        (item: any, index: number) => {
                          const isCorrect =
                            fillBlankAnswers[item.id]?.trim().toLowerCase() ===
                            item.answer?.trim().toLowerCase();
                          const showCorrect = showResults && isCorrect;
                          const showWrong = showResults && !isCorrect;

                          return (
                            <div
                              key={item.id || index}
                              className="p-5 lg:p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-muted space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <h3 className="font-semibold text-base lg:text-lg flex items-start gap-2">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </span>
                                <span className="flex-1">{item.sentence}</span>
                              </h3>
                              <div className="relative">
                                <Input
                                  type="text"
                                  value={fillBlankAnswers[item.id] || ""}
                                  onChange={(e) =>
                                    handleFillBlankChange(
                                      item.id,
                                      e.target.value
                                    )
                                  }
                                  disabled={showResults}
                                  placeholder="Nhập câu trả lời..."
                                  className={cn(
                                    "w-full p-4 border-2 rounded-lg font-medium transition-all text-base",
                                    "focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed",
                                    showCorrect &&
                                      "border-green-500 bg-green-50 dark:bg-green-950/30 ring-2 ring-green-500/20",
                                    showWrong &&
                                      "border-red-500 bg-red-50 dark:bg-red-950/30 ring-2 ring-red-500/20",
                                    !showResults &&
                                      "border-border focus:border-primary"
                                  )}
                                />
                                {showResults && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {isCorrect ? (
                                      <CheckCircle className="h-6 w-6 text-green-500" />
                                    ) : (
                                      <XCircle className="h-6 w-6 text-red-500" />
                                    )}
                                  </div>
                                )}
                              </div>
                              {!showResults &&
                                item.hints &&
                                item.hints.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Gợi ý:
                                    </span>
                                    {item.hints.map(
                                      (hint: string, i: number) => (
                                        <Badge
                                          key={i}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          💡 {hint}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                )}
                              {showWrong && (
                                <div className="p-4 bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 rounded-r-lg animate-in fade-in slide-in-from-top-2 duration-300">
                                  <p className="text-sm font-medium text-green-900 dark:text-green-100 flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                    <span>
                                      Đáp án đúng:{" "}
                                      <strong>{item.answer}</strong>
                                    </span>
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        }
                      )}

                    {/* Listening Task */}
                    {currentLesson.taskType === "listening" && (
                      <>
                        {/* Audio Player */}
                        {currentLesson.jsonTask.audioUrl && (
                          <div className="p-5 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                                <Volume2 className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                                  Nghe audio và trả lời câu hỏi
                                </h4>
                                <audio
                                  controls
                                  src={currentLesson.jsonTask.audioUrl}
                                  className="w-full"
                                >
                                  Trình duyệt của bạn không hỗ trợ audio.
                                </audio>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Listening Questions (same as multiple choice) */}
                        {currentLesson.jsonTask.items?.map(
                          (item: any, index: number) => (
                            <div
                              key={item.id || index}
                              className="p-5 lg:p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-muted space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <h3 className="font-semibold text-base lg:text-lg flex items-start gap-2">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </span>
                                <span className="flex-1">{item.question}</span>
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {item.options?.map((option: any) => {
                                  const isSelected =
                                    selectedAnswers[item.id] === option.key;
                                  const isCorrect = option.key === item.answer;
                                  const showCorrect = showResults && isCorrect;
                                  const showWrong =
                                    showResults && isSelected && !isCorrect;

                                  return (
                                    <button
                                      key={option.key}
                                      onClick={() =>
                                        handleAnswerSelect(item.id, option.key)
                                      }
                                      disabled={showResults}
                                      className={cn(
                                        "p-4 text-left border-2 rounded-lg transition-all font-medium group",
                                        "hover:shadow-md disabled:cursor-not-allowed",
                                        !showResults &&
                                          isSelected &&
                                          "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20",
                                        !showResults &&
                                          !isSelected &&
                                          "border-border hover:bg-muted/50 hover:border-primary/50",
                                        showCorrect &&
                                          "border-green-500 bg-green-50 dark:bg-green-950/30 ring-2 ring-green-500/20",
                                        showWrong &&
                                          "border-red-500 bg-red-50 dark:bg-red-950/30 ring-2 ring-red-500/20"
                                      )}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span
                                          className={cn(
                                            "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all",
                                            isSelected &&
                                              !showResults &&
                                              "border-primary bg-primary text-primary-foreground",
                                            !isSelected &&
                                              !showResults &&
                                              "border-muted-foreground/30 group-hover:border-primary/50",
                                            showCorrect &&
                                              "border-green-500 bg-green-500 text-white",
                                            showWrong &&
                                              "border-red-500 bg-red-500 text-white"
                                          )}
                                        >
                                          {showCorrect
                                            ? "✓"
                                            : showWrong
                                            ? "✗"
                                            : option.key}
                                        </span>
                                        <span className="flex-1">
                                          {option.text}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        )}
                      </>
                    )}

                    {/* Matching Task */}
                    {currentLesson.taskType === "matching" && (
                      <div className="space-y-3">
                        {currentLesson.jsonTask.items?.map(
                          (item: any, index: number) => (
                            <div
                              key={item.id || index}
                              className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 animate-in fade-in slide-in-from-left-4 duration-500"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <div className="flex items-center gap-4">
                                <div className="flex-1 font-medium text-indigo-900 dark:text-indigo-100">
                                  {item.left}
                                </div>
                                <div className="flex-shrink-0">
                                  <ChevronRight className="h-5 w-5 text-indigo-500" />
                                </div>
                                <div className="flex-1 font-medium text-purple-900 dark:text-purple-100">
                                  {item.right}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Reading Task */}
                    {currentLesson.taskType === "reading" && (
                      <div className="space-y-6">
                        {/* Reading Passage */}
                        {currentLesson.jsonTask.passage && (
                          <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                            <div className="flex items-start gap-3 mb-4">
                              <FileText className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                              <h4 className="font-semibold text-lg text-amber-900 dark:text-amber-100">
                                Đoạn văn
                              </h4>
                            </div>
                            <div className="prose dark:prose-invert max-w-none">
                              <p className="text-base leading-relaxed whitespace-pre-wrap">
                                {currentLesson.jsonTask.passage}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Reading Questions */}
                        {currentLesson.jsonTask.items?.map(
                          (item: any, index: number) => (
                            <div
                              key={item.id || index}
                              className="p-5 lg:p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-muted space-y-4"
                            >
                              <h3 className="font-semibold text-base lg:text-lg flex items-start gap-2">
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </span>
                                <span className="flex-1">{item.question}</span>
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {item.options?.map((option: any) => {
                                  const isSelected =
                                    selectedAnswers[item.id] === option.key;
                                  const isCorrect = option.key === item.answer;
                                  const showCorrect = showResults && isCorrect;
                                  const showWrong =
                                    showResults && isSelected && !isCorrect;

                                  return (
                                    <button
                                      key={option.key}
                                      onClick={() =>
                                        handleAnswerSelect(item.id, option.key)
                                      }
                                      disabled={showResults}
                                      className={cn(
                                        "p-4 text-left border-2 rounded-lg transition-all font-medium group",
                                        "hover:shadow-md disabled:cursor-not-allowed",
                                        !showResults &&
                                          isSelected &&
                                          "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20",
                                        !showResults &&
                                          !isSelected &&
                                          "border-border hover:bg-muted/50 hover:border-primary/50",
                                        showCorrect &&
                                          "border-green-500 bg-green-50 dark:bg-green-950/30 ring-2 ring-green-500/20",
                                        showWrong &&
                                          "border-red-500 bg-red-50 dark:bg-red-950/30 ring-2 ring-red-500/20"
                                      )}
                                    >
                                      <div className="flex items-center gap-3">
                                        <span
                                          className={cn(
                                            "flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all",
                                            isSelected &&
                                              !showResults &&
                                              "border-primary bg-primary text-primary-foreground",
                                            !isSelected &&
                                              !showResults &&
                                              "border-muted-foreground/30 group-hover:border-primary/50",
                                            showCorrect &&
                                              "border-green-500 bg-green-500 text-white",
                                            showWrong &&
                                              "border-red-500 bg-red-500 text-white"
                                          )}
                                        >
                                          {showCorrect
                                            ? "✓"
                                            : showWrong
                                            ? "✗"
                                            : option.key}
                                        </span>
                                        <span className="flex-1">
                                          {option.text}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Speaking Task - Coming Soon */}
                    {currentLesson.taskType === "speaking" && (
                      <div className="p-8 lg:p-12 text-center bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 rounded-xl border-2 border-dashed border-pink-300 dark:border-pink-700">
                        <Mic className="h-16 w-16 mx-auto mb-4 text-pink-500 animate-pulse" />
                        <h3 className="text-xl font-semibold mb-2 text-pink-900 dark:text-pink-100">
                          Bài tập phát âm
                        </h3>
                        <p className="text-muted-foreground">
                          Tính năng này đang được phát triển. Vui lòng quay lại
                          sau! 🎤
                        </p>
                      </div>
                    )}

                    {/* Submit Button for Tasks */}
                    {currentLesson?.type === "task" &&
                      currentLesson.taskType !== "matching" &&
                      currentLesson.taskType !== "speaking" &&
                      !showResults && (
                        <div className="flex justify-center pt-4">
                          <Button
                            onClick={handleSubmitQuiz}
                            size="lg"
                            className="gap-2 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                          >
                            <CheckCircle className="h-5 w-5" />
                            Nộp bài
                          </Button>
                        </div>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <Card className="border-0 lg:border shadow-lg">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center justify-between gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevLesson}
                    disabled={currentLessonIndex === 0}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Bài trước</span>
                  </Button>

                  <div className="text-center flex-1">
                    <p className="text-sm text-muted-foreground">
                      Bài học {currentLessonIndex + 1} / {lessons.length}
                    </p>
                    <Progress
                      value={((currentLessonIndex + 1) / lessons.length) * 100}
                      className="h-2 mt-2 max-w-xs mx-auto"
                    />
                  </div>

                  <Button
                    onClick={handleNextLesson}
                    disabled={currentLessonIndex === lessons.length - 1}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    <span className="hidden sm:inline">Bài tiếp theo</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}

export default withAuth(CourseDetailPage);
