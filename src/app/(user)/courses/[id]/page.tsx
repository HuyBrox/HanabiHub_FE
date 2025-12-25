"use client";

import { useState, useMemo, use, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
// 🗑️ REMOVED: Page visibility and localStorage (not needed for simple tracking)
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
import {
  useGetCourseByIdQuery,
  useMarkLessonCompleteMutation,
} from "@/store/services/courseApi";
import {
  useTrackVideoActivityMutation,
  useTrackTaskActivityMutation,
  useTrackCourseAccessMutation,
} from "@/store/services/activityApi";
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

// Matching Task Component
interface MatchingTaskProps {
  items: any[];
  selectedLeftId: string | null;
  matchedPairs: { [leftId: string]: string };
  showResults: boolean;
  onLeftClick: (leftId: string) => void;
  onRightClick: (rightId: string) => void;
  instructions?: string;
}

const MatchingTaskComponent = ({
  items,
  selectedLeftId,
  matchedPairs,
  showResults,
  onLeftClick,
  onRightClick,
  instructions,
}: MatchingTaskProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftItemsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const rightItemsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Track reset to force re-shuffle when user retries
  const prevShowResultsRef = useRef(showResults);
  const [shuffleKey, setShuffleKey] = useState(0);

  // Re-shuffle when showResults changes from true to false (user resets)
  useEffect(() => {
    if (prevShowResultsRef.current === true && showResults === false) {
      // User just reset, force new shuffle
      setShuffleKey((prev) => prev + 1);
    }
    prevShowResultsRef.current = showResults;
  }, [showResults]);

  // Fisher-Yates shuffle algorithm for proper randomization
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    // Use proper Fisher-Yates shuffle for true randomization
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Prepare left and right items - shuffle every time items change or shuffleKey changes
  // This ensures different order each time user enters the lesson or resets
  const { leftItems, rightItems, correctMatches } = useMemo(() => {
    const lefts: Array<{ id: string; text: string; originalIndex: number }> =
      [];
    const rights: Array<{ id: string; text: string; originalIndex: number }> =
      [];
    const correctMap: { [leftText: string]: string } = {};

    items.forEach((item, index) => {
      const leftText = item.left || item.question || "";
      const rightText = item.right || item.answer || "";

      // Use text as ID for consistent matching (text is unique and stable)
      const leftId = leftText; // Use text directly as ID
      const rightId = rightText; // Use text directly as ID

      lefts.push({
        id: leftId,
        text: leftText,
        originalIndex: index,
      });

      rights.push({
        id: rightId,
        text: rightText,
        originalIndex: index,
      });

      // Map correct answer: leftText -> rightText
      correctMap[leftText] = rightText;
    });

    // Shuffle right items using Fisher-Yates algorithm for proper randomization
    // shuffleKey dependency ensures new shuffle when user resets
    const shuffledRights = shuffleArray(rights);

    return {
      leftItems: lefts,
      rightItems: shuffledRights,
      correctMatches: correctMap,
    };
  }, [items, shuffleKey]); // Add shuffleKey to force re-shuffle when reset

  // State for connection points
  const [connections, setConnections] = useState<
    Array<{
      leftId: string;
      rightId: string;
      leftRect: DOMRect;
      rightRect: DOMRect;
      isCorrect: boolean;
    }>
  >([]);

  // Update connections when matches change
  useEffect(() => {
    const updateConnections = () => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newConnections: typeof connections = [];

      Object.entries(matchedPairs).forEach(([leftId, rightId]) => {
        const leftEl = leftItemsRef.current[leftId];
        const rightEl = rightItemsRef.current[rightId];

        if (leftEl && rightEl) {
          const leftRect = leftEl.getBoundingClientRect();
          const rightRect = rightEl.getBoundingClientRect();

          // Find if this is a correct match
          const leftItem = leftItems.find((item) => item.id === leftId);
          const rightItem = rightItems.find((item) => item.id === rightId);
          const isCorrect =
            leftItem &&
            rightItem &&
            correctMatches[leftItem.text] === rightItem.text;

          newConnections.push({
            leftId,
            rightId,
            leftRect: new DOMRect(
              leftRect.left - containerRect.left,
              leftRect.top - containerRect.top,
              leftRect.width,
              leftRect.height
            ),
            rightRect: new DOMRect(
              rightRect.left - containerRect.left,
              rightRect.top - containerRect.top,
              rightRect.width,
              rightRect.height
            ),
            isCorrect,
          });
        }
      });

      setConnections(newConnections);
    };

    // Small delay to ensure DOM is updated
    const timer = setTimeout(updateConnections, 100);
    window.addEventListener("resize", updateConnections);
    window.addEventListener("scroll", updateConnections, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateConnections);
      window.removeEventListener("scroll", updateConnections, true);
    };
  }, [matchedPairs, leftItems, rightItems, correctMatches]);

  // Check if a match is correct
  const isCorrectMatch = (leftId: string, rightId: string) => {
    if (!showResults) return false;
    const leftItem = leftItems.find((item) => item.id === leftId);
    const rightItem = rightItems.find((item) => item.id === rightId);
    return (
      leftItem && rightItem && correctMatches[leftItem.text] === rightItem.text
    );
  };

  return (
    <div className="space-y-4 md:space-y-5 lg:space-y-6">
      {/* Instructions */}
      {instructions && (
        <div className="p-3 md:p-4 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 rounded-r-lg">
          <div className="flex items-start gap-2 md:gap-3">
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1 text-sm md:text-base">
                Hướng dẫn
              </h4>
              <p className="text-xs md:text-sm text-blue-800 dark:text-blue-200">
                {instructions}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Matching Area */}
      <div
        ref={containerRef}
        className="relative min-h-[300px] md:min-h-[400px] lg:min-h-[500px]"
      >
        {/* SVG Connection Lines */}
        {connections.length > 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            {connections.map((conn, index) => {
              const leftX = conn.leftRect.left + conn.leftRect.width;
              const leftY = conn.leftRect.top + conn.leftRect.height / 2;
              const rightX = conn.rightRect.left;
              const rightY = conn.rightRect.top + conn.rightRect.height / 2;

              // Curved path for smooth connection
              const midX = (leftX + rightX) / 2;
              const controlX1 = leftX + (rightX - leftX) * 0.3;
              const controlX2 = leftX + (rightX - leftX) * 0.7;
              const path = `M ${leftX} ${leftY} C ${controlX1} ${leftY}, ${controlX2} ${rightY}, ${rightX} ${rightY}`;

              const strokeColor = showResults
                ? conn.isCorrect
                  ? "rgb(34, 197, 94)" // green-500
                  : "rgb(239, 68, 68)" // red-500
                : "rgb(251, 146, 60)"; // orange-500

              const strokeWidth = showResults ? 3 : 2.5;

              return (
                <path
                  key={`${conn.leftId}-${conn.rightId}-${index}`}
                  d={path}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={showResults && !conn.isCorrect ? "5,5" : "0"}
                  className="transition-all duration-300"
                  style={{
                    filter: showResults
                      ? conn.isCorrect
                        ? "drop-shadow(0 0 3px rgba(34, 197, 94, 0.5))"
                        : "drop-shadow(0 0 3px rgba(239, 68, 68, 0.5))"
                      : "drop-shadow(0 0 2px rgba(251, 146, 60, 0.3))",
                  }}
                />
              );
            })}
          </svg>
        )}

        {/* Two Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 relative z-20">
          {/* Left Column - Questions */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-sm md:text-base font-semibold text-center mb-3 md:mb-4 text-indigo-700 dark:text-indigo-300">
              Câu hỏi
            </h3>
            {leftItems.map((item, index) => {
              const isSelected = selectedLeftId === item.id;
              const isMatched = !!matchedPairs[item.id];
              const matchedRightId = matchedPairs[item.id];

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    leftItemsRef.current[item.id] = el;
                  }}
                  onClick={() => onLeftClick(item.id)}
                  className={cn(
                    "p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 text-sm md:text-base font-medium relative",
                    "hover:shadow-md hover:scale-[1.02]",
                    !showResults && "active:scale-95",
                    isSelected
                      ? "bg-orange-100 dark:bg-orange-900/30 border-orange-400 dark:border-orange-500 shadow-md ring-2 ring-orange-200 dark:ring-orange-800"
                      : isMatched
                      ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600",
                    showResults &&
                      matchedRightId &&
                      (isCorrectMatch(item.id, matchedRightId)
                        ? "bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-500"
                        : "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-500")
                  )}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs md:text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="flex-1">{item.text}</span>
                    {showResults && matchedRightId && (
                      <span className="flex-shrink-0">
                        {isCorrectMatch(item.id, matchedRightId) ? (
                          <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column - Answers */}
          <div className="space-y-2 md:space-y-3">
            <h3 className="text-sm md:text-base font-semibold text-center mb-3 md:mb-4 text-purple-700 dark:text-purple-300">
              Đáp án
            </h3>
            {rightItems.map((item, index) => {
              const isMatched = Object.values(matchedPairs).includes(item.id);
              const matchedLeftId = Object.keys(matchedPairs).find(
                (leftId) => matchedPairs[leftId] === item.id
              );
              const isSelectedRight =
                selectedLeftId && matchedPairs[selectedLeftId] === item.id;

              return (
                <div
                  key={item.id}
                  ref={(el) => {
                    rightItemsRef.current[item.id] = el;
                  }}
                  onClick={() => onRightClick(item.id)}
                  className={cn(
                    "p-3 md:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 text-sm md:text-base font-medium relative",
                    "hover:shadow-md hover:scale-[1.02]",
                    !showResults && "active:scale-95",
                    isSelectedRight
                      ? "bg-orange-100 dark:bg-orange-900/30 border-orange-400 dark:border-orange-500 shadow-md ring-2 ring-orange-200 dark:ring-orange-800"
                      : isMatched
                      ? "bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600",
                    showResults &&
                      matchedLeftId &&
                      (isCorrectMatch(matchedLeftId, item.id)
                        ? "bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-500"
                        : "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-500")
                  )}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs md:text-sm font-bold">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{item.text}</span>
                    {showResults && matchedLeftId && (
                      <span className="flex-shrink-0">
                        {isCorrectMatch(matchedLeftId, item.id) ? (
                          <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: string]: string;
  }>({});
  const [fillBlankAnswers, setFillBlankAnswers] = useState<{
    [key: string]: string;
  }>({});
  // Matching task state
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{
    [leftId: string]: string; // leftId -> rightId
  }>({});
  const [showResults, setShowResults] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  // 🗑️ REMOVED: startTime (not needed)
  const [videoWatchedTime, setVideoWatchedTime] = useState(0); // seconds
  const [taskElapsedTime, setTaskElapsedTime] = useState(0); // seconds for task timer
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const watchTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const taskTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 🗑️ REMOVED: autoSaveIntervalRef (not needed)
  const videoWatchedTimeRef = useRef<number>(0); // ✅ Ref để lưu latest watched time cho cleanup

  // 🗑️ REMOVED: Page visibility tracking

  const { id } = use(params);
  const {
    data: courseData,
    isLoading,
    isError,
    refetch,
  } = useGetCourseByIdQuery(id);

  // Tracking mutations
  const [trackVideoActivity] = useTrackVideoActivityMutation();
  const [trackTaskActivity] = useTrackTaskActivityMutation();
  const [trackCourseAccess] = useTrackCourseAccessMutation();
  const [markLessonComplete] = useMarkLessonCompleteMutation();

  const lessons = useMemo(() => {
    if (!courseData?.data?.lessons) return [];
    return [...courseData.data.lessons].sort((a, b) => a.order - b.order);
  }, [courseData]);

  const currentLesson = lessons[currentLessonIndex];

  // Track course access when entering the page
  useEffect(() => {
    if (id) {
      trackCourseAccess({
        courseId: id,
        action: "continue",
      }).catch((err) => console.error("Failed to track course access:", err));
    }
  }, [id, trackCourseAccess]);

  // 🎯 SIMPLE TRACKING: Start timer when entering video lesson
  useEffect(() => {
    if (!currentUser?._id || !currentLesson?._id) return;

    console.log(
      "🎬 Entering lesson:",
      currentLesson.title,
      "Type:",
      currentLesson.type
    );

    // Reset timers
    setVideoWatchedTime(0);
    videoWatchedTimeRef.current = 0;
    setTaskElapsedTime(0);

    // Clear any existing intervals
    if (watchTimeIntervalRef.current) {
      clearInterval(watchTimeIntervalRef.current);
      watchTimeIntervalRef.current = null;
    }
    if (taskTimerRef.current) {
      clearInterval(taskTimerRef.current);
      taskTimerRef.current = null;
    }

    // 🎯 SIMPLE: Start timer immediately for video lessons
    if (currentLesson?.type === "video") {
      console.log("⏰ Starting video timer...");
      watchTimeIntervalRef.current = setInterval(() => {
        setVideoWatchedTime((prev) => {
          const newTime = prev + 1;
          videoWatchedTimeRef.current = newTime;
          return newTime;
        });
      }, 1000);
    } else if (currentLesson?.type === "task") {
      // Start task timer
      taskTimerRef.current = setInterval(() => {
        setTaskElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    // Cleanup when leaving lesson
    return () => {
      if (watchTimeIntervalRef.current) {
        clearInterval(watchTimeIntervalRef.current);
        watchTimeIntervalRef.current = null;
      }
      if (taskTimerRef.current) {
        clearInterval(taskTimerRef.current);
        taskTimerRef.current = null;
      }
    };
  }, [
    currentLessonIndex,
    currentLesson?._id,
    currentLesson?.type,
    currentUser?._id,
  ]);

  // 🎯 SIMPLE: Save video progress when leaving lesson
  useEffect(() => {
    const lessonAtMount = currentLesson;

    return () => {
      const watchedSeconds = videoWatchedTimeRef.current;

      if (lessonAtMount?.type === "video" && watchedSeconds > 0) {
        console.log("🚪 Leaving lesson, sending time:", {
          lesson: lessonAtMount.title,
          watchedSeconds,
        });

        // 🎯 SIMPLE: Just send watched time, no complex calculations
        const payload = {
          courseId: id,
          lessonId: lessonAtMount._id,
          lessonTitle: lessonAtMount.title,
          totalDuration: watchedSeconds, // Use watched time as total
          watchedDuration: watchedSeconds,
          isWatchedCompletely: false, // Don't care about completion
          watchCount: 1,
        };

        trackVideoActivity(payload).catch((err) => {
          console.error("Failed to track video:", err);
        });
      }
    };
  }, [currentLesson?._id, id]);

  // 🎯 SIMPLE: Handle page unload (user closes tab, navigates away)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentLesson?.type === "video" && videoWatchedTimeRef.current > 0) {
        console.log(
          "📡 Page unload, sending beacon:",
          videoWatchedTimeRef.current,
          "seconds"
        );

        const payload = {
          courseId: id,
          lessonId: currentLesson._id,
          lessonTitle: currentLesson.title,
          totalDuration: videoWatchedTimeRef.current,
          watchedDuration: videoWatchedTimeRef.current,
          isWatchedCompletely: false,
          watchCount: 1,
        };

        const data = JSON.stringify(payload);
        const blob = new Blob([data], { type: "application/json" });
        const url = `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"
        }/user-activity/track-video`;
        navigator.sendBeacon(url, blob);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentLesson, id]);

  // 🗑️ REMOVED: Page visibility tracking (too complex, not needed)

  // 🗑️ REMOVED: Auto-save (not needed, only save on exit)

  // Helper function to check if lesson is completed by current user
  const isLessonCompleted = (lesson: any) => {
    if (!currentUser?._id || !lesson.userCompleted) return false;
    return lesson.userCompleted.some((u: any) => u._id === currentUser._id);
  };

  const completedLessons = lessons.filter((lesson) =>
    isLessonCompleted(lesson)
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

  // Matching task handlers
  const handleLeftClick = (leftId: string) => {
    if (showResults) return;

    // If clicking the same item, deselect it
    if (selectedLeftId === leftId) {
      setSelectedLeftId(null);
      return;
    }

    // If this left item is already matched, remove the match first
    if (matchedPairs[leftId]) {
      setMatchedPairs((prev) => {
        const newPairs = { ...prev };
        delete newPairs[leftId];
        return newPairs;
      });
    }

    setSelectedLeftId(leftId);
  };

  const handleRightClick = (rightId: string) => {
    if (showResults) return;

    if (!selectedLeftId) {
      // No left item selected, do nothing
      return;
    }

    // Check if this right item is already matched to another left item
    const existingLeftId = Object.keys(matchedPairs).find(
      (leftId) => matchedPairs[leftId] === rightId
    );

    if (existingLeftId) {
      // If clicking the same right item that's matched to current left, remove match
      if (existingLeftId === selectedLeftId) {
        setMatchedPairs((prev) => {
          const newPairs = { ...prev };
          delete newPairs[selectedLeftId];
          return newPairs;
        });
        setSelectedLeftId(null);
        return;
      } else {
        // Remove the old match
        setMatchedPairs((prev) => {
          const newPairs = { ...prev };
          delete newPairs[existingLeftId];
          return newPairs;
        });
      }
    }

    // Create new match
    setMatchedPairs((prev) => ({
      ...prev,
      [selectedLeftId]: rightId,
    }));

    setSelectedLeftId(null);
  };

  const calculateScore = () => {
    if (!currentLesson?.jsonTask?.items) return 0;
    const items = currentLesson.jsonTask.items;
    let correct = 0;
    let total = items.length;

    items.forEach((item: any) => {
      if (
        currentLesson.taskType === "multiple_choice" ||
        currentLesson.taskType === "listening" ||
        currentLesson.taskType === "reading"
      ) {
        if (selectedAnswers[item.id] === item.answer) correct++;
      } else if (currentLesson.taskType === "fill_blank") {
        if (
          fillBlankAnswers[item.id]?.trim().toLowerCase() ===
          item.answer?.trim().toLowerCase()
        )
          correct++;
      } else if (currentLesson.taskType === "matching") {
        // For matching: check if left text is matched to correct right text
        // In MatchingTaskComponent, we use text directly as ID
        const leftText = item.left || item.question || "";
        const correctRightText = item.right || item.answer || "";

        // Check if this left text is matched to the correct right text
        const matchedRightText = matchedPairs[leftText];
        if (matchedRightText === correctRightText) {
          correct++;
        }
      }
    });

    return Math.round((correct / total) * 100);
  };

  const handleSubmitQuiz = async () => {
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Stop task timer
    if (taskTimerRef.current) {
      clearInterval(taskTimerRef.current);
      taskTimerRef.current = null;
    }

    // Use task elapsed time for accuracy
    const timeSpentSeconds = taskElapsedTime;

    // Track task activity
    if (currentLesson) {
      try {
        const items = currentLesson.jsonTask?.items || [];
        const totalQuestions = items.length;
        let correctAnswers = 0;

        items.forEach((item: any) => {
          if (
            currentLesson.taskType === "multiple_choice" ||
            currentLesson.taskType === "listening" ||
            currentLesson.taskType === "reading"
          ) {
            if (selectedAnswers[item.id] === item.answer) correctAnswers++;
          } else if (currentLesson.taskType === "fill_blank") {
            if (
              fillBlankAnswers[item.id]?.trim().toLowerCase() ===
              item.answer?.trim().toLowerCase()
            )
              correctAnswers++;
          } else if (currentLesson.taskType === "matching") {
            // In MatchingTaskComponent, we use text directly as ID
            const leftText = item.left || item.question || "";
            const correctRightText = item.right || item.answer || "";

            // Check if this left text is matched to the correct right text
            const matchedRightText = matchedPairs[leftText];
            if (matchedRightText === correctRightText) {
              correctAnswers++;
            }
          }
        });

        // Track task activity with accurate time
        await trackTaskActivity({
          courseId: id,
          lessonId: currentLesson._id,
          lessonTitle: currentLesson.title,
          taskType:
            (currentLesson.taskType as
              | "multiple_choice"
              | "fill_blank"
              | "listening"
              | "matching"
              | "speaking"
              | "reading") || "multiple_choice",
          score: calculatedScore,
          maxScore: 100,
          correctAnswers,
          totalQuestions,
          timeSpent: timeSpentSeconds,
          completedAt: new Date().toISOString(),
        });

        // Mark lesson complete if passed (>= 60%)
        if (calculatedScore >= 60) {
          await markLessonComplete({
            courseId: id,
            lessonId: currentLesson._id,
            score: calculatedScore,
            maxScore: 100,
          });
        }
      } catch (err) {
        console.error("Failed to track task activity:", err);
      }
    }
  };

  // 🎯 SIMPLE: Save video progress before switching lessons
  const saveCurrentVideoProgress = async () => {
    const currentWatchedTime = videoWatchedTimeRef.current;

    if (
      !currentLesson ||
      currentLesson.type !== "video" ||
      currentWatchedTime === 0
    ) {
      return;
    }

    console.log("🔄 Switching lesson, saving time:", {
      lesson: currentLesson.title,
      watchedSeconds: currentWatchedTime,
    });

    const payload = {
      courseId: id,
      lessonId: currentLesson._id,
      lessonTitle: currentLesson.title,
      totalDuration: currentWatchedTime,
      watchedDuration: currentWatchedTime,
      isWatchedCompletely: false,
      watchCount: 1,
    };

    try {
      await trackVideoActivity(payload);
    } catch (err) {
      console.error("Failed to save video progress:", err);
    }
  };

  const handleNextLesson = async () => {
    if (currentLessonIndex < lessons.length - 1) {
      await saveCurrentVideoProgress();
      setCurrentLessonIndex(currentLessonIndex + 1);
      resetAnswers();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevLesson = async () => {
    if (currentLessonIndex > 0) {
      await saveCurrentVideoProgress();
      setCurrentLessonIndex(currentLessonIndex - 1);
      resetAnswers();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const resetAnswers = () => {
    setSelectedAnswers({});
    setFillBlankAnswers({});
    setSelectedLeftId(null);
    setMatchedPairs({});
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
        <div className="container mx-auto px-3 md:px-4 py-2.5 md:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-1 md:gap-2 hover:bg-primary/10 h-8 md:h-9"
              >
                <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline text-xs md:text-sm">
                  Quay lại
                </span>
              </Button>
              <div className="h-6 md:h-8 w-px bg-border hidden sm:block" />
              <div className="hidden md:block">
                <h1 className="font-semibold text-sm lg:text-base xl:text-lg line-clamp-1">
                  {course.title}
                </h1>
                <p className="text-[10px] lg:text-xs text-muted-foreground line-clamp-1">
                  Bài {currentLessonIndex + 1}/{lessons.length}:{" "}
                  {currentLesson?.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2">
              <Badge
                variant="secondary"
                className="hidden sm:flex gap-1 md:gap-1.5 px-2 md:px-3 text-xs"
              >
                <Award className="h-3 w-3 md:h-3.5 md:w-3.5" />
                <span className="font-medium">
                  {completedLessons}/{lessons.length}
                </span>
              </Badge>

              <Button
                variant="outline"
                size="sm"
                className="lg:hidden h-8 w-8 md:h-9 md:w-9 p-0"
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

          <div className="mt-2 md:mt-3 lg:hidden">
            <div className="flex items-center justify-between text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-1.5">
              <span>Tiến độ</span>
              <span className="font-medium">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress value={progressPercentage} className="h-1 md:h-1.5" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-4 py-3 md:py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 lg:gap-6">
          {/* Sidebar */}
          <aside
            className={cn(
              "lg:col-span-4 xl:col-span-3",
              "fixed lg:sticky top-[65px] md:top-[73px] lg:top-[85px] left-0",
              "h-[calc(100vh-65px)] md:h-[calc(100vh-73px)] lg:h-[calc(100vh-109px)]",
              "w-72 sm:w-80 md:w-96 lg:w-full z-40",
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
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 p-3 md:p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm md:text-base font-semibold">
                    Nội dung khóa học
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden h-7 w-7 md:h-8 md:w-8 p-0"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  </Button>
                </div>
                <div className="mt-2 md:mt-3 space-y-1.5 md:space-y-2">
                  <div className="flex items-center justify-between text-[10px] md:text-xs text-muted-foreground">
                    <span className="font-medium">Tiến độ học tập</span>
                    <span className="font-semibold text-primary">
                      {Math.round(progressPercentage)}%
                    </span>
                  </div>
                  <Progress
                    value={progressPercentage}
                    className="h-1.5 md:h-2"
                  />
                  <div className="flex items-center justify-between text-[10px] md:text-xs">
                    <span className="text-muted-foreground">
                      {completedLessons} / {lessons.length} bài học
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-2 md:p-3">
                <div className="space-y-1 md:space-y-1.5">
                  {lessons.map((lesson, index) => {
                    const isCompleted = isLessonCompleted(lesson);
                    const isCurrent = currentLessonIndex === index;

                    return (
                      <button
                        key={lesson._id}
                        onClick={async () => {
                          await saveCurrentVideoProgress();
                          setCurrentLessonIndex(index);
                          resetAnswers();
                          setIsSidebarOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-start gap-2 md:gap-3 p-2 md:p-3 rounded-lg text-left transition-all group",
                          "hover:bg-muted/70 hover:shadow-sm",
                          isCurrent
                            ? "bg-gradient-to-r from-primary/15 to-primary/5 border-2 border-primary/40 shadow-md"
                            : "border-2 border-transparent hover:border-muted"
                        )}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isCompleted ? (
                            <div className="h-6 w-6 md:h-7 md:w-7 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm">
                              <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "h-6 w-6 md:h-7 md:w-7 rounded-full border-2 flex items-center justify-center text-[10px] md:text-xs font-semibold transition-all",
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
                              "font-medium text-xs md:text-sm mb-1 md:mb-1.5 line-clamp-2 leading-snug",
                              isCurrent
                                ? "text-primary"
                                : "text-foreground group-hover:text-primary"
                            )}
                          >
                            {lesson.title}
                          </p>
                          <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
                            {lesson.type === "video" ? (
                              <div className="flex items-center gap-0.5 md:gap-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 md:px-2 py-0.5 rounded">
                                <Play className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                <span className="font-medium">Video</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-0.5 md:gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 md:px-2 py-0.5 rounded">
                                <ListChecks className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                <span className="font-medium">Bài tập</span>
                              </div>
                            )}
                            <span>•</span>
                            <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            <span>{formatDuration(lesson.duration || 0)}</span>
                          </div>
                        </div>

                        {isCurrent && (
                          <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary flex-shrink-0 mt-1" />
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
          <main className="lg:col-span-8 xl:col-span-9 space-y-3 md:space-y-4 lg:space-y-6">
            {/* Score Display - Show after submit */}
            {showResults &&
              score !== null &&
              currentLesson?.type === "task" && (
                <Card className="overflow-hidden border-0 lg:border shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                  <div
                    className={cn(
                      "p-4 md:p-5 lg:p-6 xl:p-8 text-center",
                      score >= 80
                        ? "bg-gradient-to-br from-green-500 to-emerald-600"
                        : score >= 60
                        ? "bg-gradient-to-br from-blue-500 to-cyan-600"
                        : score >= 40
                        ? "bg-gradient-to-br from-yellow-500 to-orange-600"
                        : "bg-gradient-to-br from-red-500 to-pink-600"
                    )}
                  >
                    <div className="flex flex-col items-center gap-3 md:gap-4 text-white">
                      {score >= 80 ? (
                        <Trophy className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 animate-bounce" />
                      ) : score >= 60 ? (
                        <Sparkles className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 animate-pulse" />
                      ) : (
                        <XCircle className="h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20 animate-pulse" />
                      )}
                      <div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2">
                          {score}%
                        </h2>
                        <p className="text-base md:text-lg lg:text-xl font-medium opacity-90">
                          {score >= 80
                            ? "🎉 Xuất sắc!"
                            : score >= 60
                            ? "👍 Tốt lắm!"
                            : score >= 40
                            ? "💪 Cố gắng thêm!"
                            : "📚 Hãy thử lại!"}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-2 w-full sm:w-auto">
                        <Button
                          onClick={handleRetry}
                          variant="secondary"
                          size="lg"
                          className="gap-2 bg-white/20 hover:bg-white/30 text-white border-white/30 text-sm md:text-base h-9 md:h-10 lg:h-11"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Làm lại
                        </Button>
                        {currentLessonIndex < lessons.length - 1 && (
                          <Button
                            onClick={handleNextLesson}
                            size="lg"
                            className="gap-2 bg-white text-gray-900 hover:bg-white/90 text-sm md:text-base h-9 md:h-10 lg:h-11"
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
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        ref={videoRef}
                        className="w-full h-full"
                        controls
                        src={currentLesson.videoUrl}
                      >
                        Trình duyệt của bạn không hỗ trợ video.
                      </video>
                    )}
                  </div>
                  {/* Watch time indicator */}
                  {videoWatchedTime > 0 && (
                    <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 bg-black/75 text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-medium backdrop-blur-sm">
                      ⏱️ Đã xem: {Math.floor(videoWatchedTime / 60)}:
                      {String(videoWatchedTime % 60).padStart(2, "0")}
                    </div>
                  )}
                </div>
              )}

              {/* Lesson Info */}
              <CardHeader className="bg-gradient-to-r from-background to-muted/20 p-4 md:p-5 lg:p-6">
                <div className="flex items-start justify-between gap-3 md:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 md:gap-2 mb-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="font-medium text-xs md:text-sm"
                      >
                        Bài {currentLessonIndex + 1}/{lessons.length}
                      </Badge>
                      {currentLesson?.type === "video" ? (
                        <Badge className="bg-blue-500 hover:bg-blue-600 text-xs md:text-sm">
                          <Play className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                          Video
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-xs md:text-sm">
                          <ListChecks className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                          Bài tập
                        </Badge>
                      )}
                      {/* Task Timer */}
                      {currentLesson?.type === "task" &&
                        !showResults &&
                        taskElapsedTime > 0 && (
                          <Badge
                            variant="secondary"
                            className="gap-1 text-xs md:text-sm"
                          >
                            <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            {Math.floor(taskElapsedTime / 60)}:
                            {String(taskElapsedTime % 60).padStart(2, "0")}
                          </Badge>
                        )}
                      {/* Show final time after submit */}
                      {currentLesson?.type === "task" && showResults && (
                        <Badge
                          variant="secondary"
                          className="gap-1 text-xs md:text-sm"
                        >
                          <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                          <span className="hidden sm:inline">
                            Hoàn thành trong{" "}
                          </span>
                          {Math.floor(taskElapsedTime / 60)}:
                          {String(taskElapsedTime % 60).padStart(2, "0")}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg md:text-xl lg:text-2xl leading-tight">
                      {currentLesson?.title}
                    </CardTitle>
                    {/* Only show content preview for task lessons, not video (video will show full description below) */}
                    {currentLesson?.type === "task" &&
                      currentLesson?.content && (
                        <p className="mt-1.5 md:mt-2 text-xs md:text-sm text-muted-foreground line-clamp-2">
                          {currentLesson.content}
                        </p>
                      )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 md:p-5 lg:p-6">
                {/* Video Description - Only for video lessons */}
                {currentLesson?.type === "video" && currentLesson?.content && (
                  <div className="prose dark:prose-invert max-w-none mb-4 md:mb-6">
                    <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
                      Mô tả bài học
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {currentLesson.content}
                    </p>
                  </div>
                )}

                {/* Task Content */}
                {currentLesson?.type === "task" && currentLesson.jsonTask && (
                  <div className="space-y-4 md:space-y-5 lg:space-y-6">
                    {/* Task Instructions - Only show for non-matching tasks (matching has its own instructions) */}
                    {currentLesson.taskType !== "matching" &&
                      currentLesson.jsonTask.instructions && (
                        <div className="p-3 md:p-4 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 rounded-r-lg">
                          <div className="flex items-start gap-2 md:gap-3">
                            <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1 text-sm md:text-base">
                                Hướng dẫn
                              </h4>
                              <p className="text-xs md:text-sm text-blue-800 dark:text-blue-200">
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
                            className="p-4 md:p-5 lg:p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-muted space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <h3 className="font-semibold text-sm md:text-base lg:text-lg flex items-start gap-2">
                              <span className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs md:text-sm font-bold">
                                {index + 1}
                              </span>
                              <span className="flex-1 leading-snug">
                                {item.question}
                              </span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
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
                                      "p-3 md:p-4 text-left border-2 rounded-lg transition-all font-medium group",
                                      "hover:shadow-md disabled:cursor-not-allowed relative overflow-hidden text-sm md:text-base",
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
                                    <div className="flex items-center gap-2 md:gap-3">
                                      <span
                                        className={cn(
                                          "flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center text-xs md:text-sm font-bold transition-all",
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
                                      <span className="flex-1 text-xs md:text-sm">
                                        {option.text}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                            {showResults && item.explanation && (
                              <div className="mt-3 md:mt-4 p-3 md:p-4 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 rounded-r-lg animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-xs md:text-sm font-medium text-blue-900 dark:text-blue-100 flex items-start gap-2">
                                  <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0 mt-0.5" />
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
                              className="p-4 md:p-5 lg:p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-muted space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <h3 className="font-semibold text-sm md:text-base lg:text-lg flex items-start gap-2">
                                <span className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs md:text-sm font-bold">
                                  {index + 1}
                                </span>
                                <span className="flex-1 leading-snug">
                                  {item.sentence}
                                </span>
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
                                    "w-full p-3 md:p-4 border-2 rounded-lg font-medium transition-all text-sm md:text-base",
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
                                  <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2">
                                    {isCorrect ? (
                                      <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
                                    ) : (
                                      <XCircle className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
                                    )}
                                  </div>
                                )}
                              </div>
                              {!showResults &&
                                item.hints &&
                                item.hints.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    <span className="text-[10px] md:text-xs font-medium text-muted-foreground">
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
                          <div className="p-4 md:p-5 lg:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
                              <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-500 flex items-center justify-center">
                                <Volume2 className="h-5 w-5 md:h-6 md:w-6 text-white" />
                              </div>
                              <div className="flex-1 w-full">
                                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 text-sm md:text-base">
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
                              className="p-4 md:p-5 lg:p-6 bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl border-2 border-muted space-y-3 md:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                              style={{ animationDelay: `${index * 100}ms` }}
                            >
                              <h3 className="font-semibold text-sm md:text-base lg:text-lg flex items-start gap-2">
                                <span className="flex-shrink-0 w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs md:text-sm font-bold">
                                  {index + 1}
                                </span>
                                <span className="flex-1 leading-snug">
                                  {item.question}
                                </span>
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
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
                                        "p-3 md:p-4 text-left border-2 rounded-lg transition-all font-medium group",
                                        "hover:shadow-md disabled:cursor-not-allowed text-sm md:text-base",
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
                                      <div className="flex items-center gap-2 md:gap-3">
                                        <span
                                          className={cn(
                                            "flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full border-2 flex items-center justify-center text-xs md:text-sm font-bold transition-all",
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
                                        <span className="flex-1 text-xs md:text-sm">
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

                    {/* Matching Task - Redesigned */}
                    {currentLesson.taskType === "matching" && (
                      <MatchingTaskComponent
                        key={currentLesson._id} // Force re-mount when lesson changes to ensure new shuffle
                        items={currentLesson.jsonTask.items || []}
                        selectedLeftId={selectedLeftId}
                        matchedPairs={matchedPairs}
                        showResults={showResults}
                        onLeftClick={handleLeftClick}
                        onRightClick={handleRightClick}
                        instructions={currentLesson.jsonTask.instructions}
                      />
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
                      <div className="p-6 md:p-8 lg:p-12 text-center bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 rounded-xl border-2 border-dashed border-pink-300 dark:border-pink-700">
                        <Mic className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 md:mb-4 text-pink-500 animate-pulse" />
                        <h3 className="text-lg md:text-xl font-semibold mb-2 text-pink-900 dark:text-pink-100">
                          Bài tập phát âm
                        </h3>
                        <p className="text-sm md:text-base text-muted-foreground">
                          Tính năng này đang được phát triển. Vui lòng quay lại
                          sau! 🎤
                        </p>
                      </div>
                    )}

                    {/* Submit Button for Tasks */}
                    {currentLesson?.type === "task" &&
                      currentLesson.taskType !== "speaking" &&
                      !showResults && (
                        <div className="flex justify-center pt-3 md:pt-4">
                          <Button
                            onClick={handleSubmitQuiz}
                            size="lg"
                            className="gap-2 px-6 md:px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg text-sm md:text-base h-10 md:h-11"
                          >
                            <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                            Kiểm tra kết quả
                          </Button>
                        </div>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <Card className="border-0 lg:border shadow-lg">
              <CardContent className="p-3 md:p-4 lg:p-6">
                <div className="flex items-center justify-between gap-2 md:gap-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevLesson}
                    disabled={currentLessonIndex === 0}
                    className="gap-1 md:gap-2 text-xs md:text-sm h-9 md:h-10"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Bài trước</span>
                    <span className="sm:hidden">Trước</span>
                  </Button>

                  <div className="text-center flex-1 min-w-0 px-2">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Bài học {currentLessonIndex + 1} / {lessons.length}
                    </p>
                    <Progress
                      value={((currentLessonIndex + 1) / lessons.length) * 100}
                      className="h-1.5 md:h-2 mt-1.5 md:mt-2 max-w-xs mx-auto"
                    />
                  </div>

                  <Button
                    onClick={handleNextLesson}
                    disabled={currentLessonIndex === lessons.length - 1}
                    className="gap-1 md:gap-2 bg-primary hover:bg-primary/90 text-xs md:text-sm h-9 md:h-10"
                  >
                    <span className="hidden sm:inline">Bài tiếp theo</span>
                    <span className="sm:hidden">Tiếp</span>
                    <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
