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

const lessons = [
  {
    id: 1,
    title: "Introduction to Hiragana",
    duration: "5 min",
    completed: true,
  },
  { id: 2, title: "あ行 (A-gyou)", duration: "8 min", completed: true },
  { id: 3, title: "か行 (Ka-gyou)", duration: "10 min", completed: true },
  { id: 4, title: "さ行 (Sa-gyou)", duration: "12 min", completed: false },
  { id: 5, title: "た行 (Ta-gyou)", duration: "10 min", completed: false },
  { id: 6, title: "な行 (Na-gyou)", duration: "8 min", completed: false },
  { id: 7, title: "は行 (Ha-gyou)", duration: "12 min", completed: false },
  { id: 8, title: "ま行 (Ma-gyou)", duration: "9 min", completed: false },
  { id: 9, title: "や行 (Ya-gyou)", duration: "6 min", completed: false },
  { id: 10, title: "ら行 (Ra-gyou)", duration: "10 min", completed: false },
  { id: 11, title: "わ行 (Wa-gyou)", duration: "5 min", completed: false },
  { id: 12, title: "Final Review", duration: "15 min", completed: false },
];

const quizQuestions = [
  {
    question: "What does the hiragana character 'さ' represent?",
    options: ["sa", "shi", "su", "se"],
    correct: 0,
  },
  {
    question: "Which hiragana character represents the sound 'ko'?",
    options: ["か", "き", "く", "こ"],
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
          <h2 className="text-xl font-semibold mb-2">Hiragana Mastery</h2>
          <p className="text-sm text-muted-foreground">
            Master all 46 hiragana characters
          </p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progress</span>
              <span>
                {completedLessons}/{lessons.length}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-medium mb-4">Lessons</h3>
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
                  <p className="font-medium text-sm truncate">{lesson.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {lesson.duration}
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
                {lessons.find((l) => l.id === currentLesson)?.title}
              </h3>
              <p className="text-gray-300">Click to start the lesson</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Exercise Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-2xl">
              <div className="mb-6">
                <Badge variant="outline" className="mb-2">
                  Lesson {currentLesson}
                </Badge>
                <h1 className="text-2xl font-bold mb-2">
                  {lessons.find((l) => l.id === currentLesson)?.title}
                </h1>
                <p className="text-muted-foreground">
                  Practice what you've learned with these interactive exercises.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Practice Quiz</CardTitle>
                  <CardDescription>
                    Test your knowledge of the characters you just learned.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {quizQuestions.map((question, questionIndex) => (
                    <div key={questionIndex} className="space-y-3">
                      <h3 className="font-medium">
                        {questionIndex + 1}. {question.question}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {question.options.map((option, optionIndex) => (
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
                            <span className="font-mono text-lg">{option}</span>
                          </button>
                        ))}
                      </div>
                      {showResults && (
                        <div className="text-sm">
                          {selectedAnswers[questionIndex] ===
                          question.correct ? (
                            <p className="text-green-600">✓ Correct!</p>
                          ) : (
                            <p className="text-red-600">
                              ✗ Incorrect. The correct answer is:{" "}
                              {question.options[question.correct]}
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
                        disabled={selectedAnswers.length < quizQuestions.length}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Submit Quiz
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
                          Try Again
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90">
                          Continue to Next Lesson
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
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Course Completion</span>
                    <span className="font-medium">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Completed</p>
                      <p className="font-semibold text-primary">
                        {completedLessons}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className="font-semibold">
                        {lessons.length - completedLessons}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Achievements</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">First Lesson Complete</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">Quiz Master</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-muted rounded-full"></div>
                      <span className="text-sm text-muted-foreground">
                        Course Graduate
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <Button variant="outline" className="w-full bg-transparent">
                    View All Courses
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
