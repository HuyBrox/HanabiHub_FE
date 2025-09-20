"use client";

import { useState } from "react";
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
import { CheckCircle, Circle, Play, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/language-context";

// Đầy đủ các bài học, mỗi trường là đa ngôn ngữ
const lessons = [
  {
    id: 1,
    title: { en: "Introduction to Hiragana", vi: "Giới thiệu về Hiragana" },
    duration: { en: "5 min", vi: "5 phút" },
    completed: true,
  },
  {
    id: 2,
    title: { en: "A-gyou (あ行)", vi: "Nhóm A-gyou (あ行)" },
    duration: { en: "8 min", vi: "8 phút" },
    completed: true,
  },
  {
    id: 3,
    title: { en: "Ka-gyou (か行)", vi: "Nhóm Ka-gyou (か行)" },
    duration: { en: "10 min", vi: "10 phút" },
    completed: true,
  },
  {
    id: 4,
    title: { en: "Sa-gyou (さ行)", vi: "Nhóm Sa-gyou (さ行)" },
    duration: { en: "12 min", vi: "12 phút" },
    completed: false,
  },
  {
    id: 5,
    title: { en: "Ta-gyou (た行)", vi: "Nhóm Ta-gyou (た行)" },
    duration: { en: "10 min", vi: "10 phút" },
    completed: false,
  },
  {
    id: 6,
    title: { en: "Na-gyou (な行)", vi: "Nhóm Na-gyou (な行)" },
    duration: { en: "8 min", vi: "8 phút" },
    completed: false,
  },
  {
    id: 7,
    title: { en: "Ha-gyou (は行)", vi: "Nhóm Ha-gyou (は行)" },
    duration: { en: "12 min", vi: "12 phút" },
    completed: false,
  },
  {
    id: 8,
    title: { en: "Ma-gyou (ま行)", vi: "Nhóm Ma-gyou (ま行)" },
    duration: { en: "9 min", vi: "9 phút" },
    completed: false,
  },
  {
    id: 9,
    title: { en: "Ya-gyou (や行)", vi: "Nhóm Ya-gyou (や行)" },
    duration: { en: "6 min", vi: "6 phút" },
    completed: false,
  },
  {
    id: 10,
    title: { en: "Ra-gyou (ら行)", vi: "Nhóm Ra-gyou (ら行)" },
    duration: { en: "10 min", vi: "10 phút" },
    completed: false,
  },
  {
    id: 11,
    title: { en: "Wa-gyou (わ行)", vi: "Nhóm Wa-gyou (わ行)" },
    duration: { en: "5 min", vi: "5 phút" },
    completed: false,
  },
  {
    id: 12,
    title: { en: "Final Review", vi: "Ôn tập cuối khóa" },
    duration: { en: "15 min", vi: "15 phút" },
    completed: false,
  },
];

// Quiz cũng đa ngôn ngữ
const quizQuestions = [
  {
    question: {
      en: "What does the hiragana character 'さ' represent?",
      vi: "Ký tự hiragana 'さ' biểu thị âm gì?",
    },
    options: {
      en: ["sa", "shi", "su", "se"],
      vi: ["sa", "shi", "su", "se"],
    },
    correct: 0,
  },
  {
    question: {
      en: "Which hiragana character represents the sound 'ko'?",
      vi: "Ký tự hiragana nào biểu thị âm 'ko'?",
    },
    options: {
      en: ["か", "き", "く", "こ"],
      vi: ["か", "kí", "ku", "ko"],
    },
    correct: 3,
  },
];

export default function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [currentLesson, setCurrentLesson] = useState(4);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { language } = useLanguage();

  const completedLessons = lessons.filter((lesson) => lesson.completed).length;
  const progressPercentage = (completedLessons / lessons.length) * 100;

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Lesson List */}
      <div className="w-80 bg-card border-r border-border overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold mb-2">
            {language === "vi" ? "Thành thạo Hiragana" : "Hiragana Mastery"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === "vi"
              ? "Thành thạo 46 ký tự hiragana"
              : "Master all 46 hiragana characters"}
          </p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>{language === "vi" ? "Tiến trình" : "Progress"}</span>
              <span>
                {completedLessons}/{lessons.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-medium mb-4">
            {language === "vi" ? "Bài học" : "Lessons"}
          </h3>
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => setCurrentLesson(lesson.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                  currentLesson === lesson.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50"
                )}
              >
                {lesson.completed ? (
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {lesson.title[language]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lesson.duration[language]}
                  </p>
                </div>
                {currentLesson === lesson.id && (
                  <ChevronRight className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Video Player */}
        <div className="bg-black relative">
          <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                <Play className="h-8 w-8 text-primary-foreground ml-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {lessons.find((l) => l.id === currentLesson)?.title[language]}
              </h3>
              <p className="text-gray-300">
                {language === "vi"
                  ? "Nhấn để bắt đầu bài học"
                  : "Click to start the lesson"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Exercise Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl">
              <div className="mb-6">
                <Badge variant="outline" className="mb-2">
                  {language === "vi" ? "Bài học" : "Lesson"} {currentLesson}
                </Badge>
                <h1 className="text-2xl font-bold mb-2">
                  {lessons.find((l) => l.id === currentLesson)?.title[language]}
                </h1>
                <p className="text-muted-foreground">
                  {language === "vi"
                    ? "Luyện tập những gì bạn đã học với các bài tập tương tác."
                    : "Practice what you've learned with these interactive exercises."}
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>
                    {language === "vi" ? "Kiểm tra luyện tập" : "Practice Quiz"}
                  </CardTitle>
                  <CardDescription>
                    {language === "vi"
                      ? "Kiểm tra kiến thức về các ký tự bạn vừa học."
                      : "Test your knowledge of the characters you just learned."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {quizQuestions.map((question, questionIndex) => (
                    <div key={questionIndex} className="space-y-3">
                      <h3 className="font-medium">
                        {questionIndex + 1}. {question.question[language]}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {question.options[language].map(
                          (option: string, optionIndex: number) => (
                            <button
                              key={optionIndex}
                              onClick={() =>
                                handleAnswerSelect(questionIndex, optionIndex)
                              }
                              className={cn(
                                "p-3 text-left border rounded-lg transition-colors",
                                selectedAnswers[questionIndex] === optionIndex
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:bg-muted/50",
                                showResults &&
                                  optionIndex === question.correct &&
                                  "border-green-500 bg-green-50",
                                showResults &&
                                  selectedAnswers[questionIndex] ===
                                    optionIndex &&
                                  optionIndex !== question.correct &&
                                  "border-red-500 bg-red-50"
                              )}
                            >
                              <span className="font-mono text-lg">
                                {option}
                              </span>
                            </button>
                          )
                        )}
                      </div>
                      {showResults && (
                        <div className="text-sm">
                          {selectedAnswers[questionIndex] ===
                          question.correct ? (
                            <p className="text-green-600">
                              {language === "vi" ? "✓ Đúng!" : "✓ Correct!"}
                            </p>
                          ) : (
                            <p className="text-red-600">
                              {language === "vi"
                                ? "✗ Sai. Đáp án đúng là: "
                                : "✗ Incorrect. The correct answer is: "}
                              {question.options[language][question.correct]}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-4">
                    {!showResults ? (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={
                          selectedAnswers.length < quizQuestions.length
                        }
                        className="bg-primary hover:bg-primary/90"
                      >
                        {language === "vi" ? "Nộp bài kiểm tra" : "Submit Quiz"}
                      </Button>
                    ) : (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            setSelectedAnswers([]);
                            setShowResults(false);
                          }}
                          variant="outline"
                        >
                          {language === "vi" ? "Làm lại" : "Try Again"}
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90">
                          {language === "vi"
                            ? "Tiếp tục bài học tiếp theo"
                            : "Continue to Next Lesson"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Sidebar - Progress Tracker */}
          <div className="w-80 bg-card border-l border-border p-6 overflow-y-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === "vi" ? "Tiến trình của bạn" : "Your Progress"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>
                      {language === "vi"
                        ? "Hoàn thành khóa học"
                        : "Course Completion"}
                    </span>
                    <span className="font-medium">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">
                    {language === "vi" ? "Thống kê" : "Statistics"}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">
                        {language === "vi" ? "Đã hoàn thành" : "Completed"}
                      </p>
                      <p className="font-semibold text-primary">
                        {completedLessons}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        {language === "vi" ? "Còn lại" : "Remaining"}
                      </p>
                      <p className="font-semibold">
                        {lessons.length - completedLessons}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">
                    {language === "vi" ? "Thành tích" : "Achievements"}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">
                        {language === "vi"
                          ? "Hoàn thành bài học đầu tiên"
                          : "First Lesson Complete"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">
                        {language === "vi"
                          ? "Bậc thầy kiểm tra"
                          : "Quiz Master"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-muted rounded-full"></div>
                      <span className="text-sm text-muted-foreground">
                        {language === "vi"
                          ? "Tốt nghiệp khóa học"
                          : "Course Graduate"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="outline" className="w-full bg-transparent">
                    {language === "vi"
                      ? "Xem tất cả khóa học"
                      : "View All Courses"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}