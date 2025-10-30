import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * 🎓 Learning Insights API - Lấy phân tích học tập của user
 * Dữ liệu từ BE được tính toán bằng logic code thuần (không AI)
 */

// ============ TYPES ============

export interface LearningPerformance {
  overallLevel: "beginner" | "intermediate" | "advanced";
  weeklyProgress: number; // % change from last week
  consistency: number; // 0-100
  retention: number; // %
}

export interface CourseProgress {
  coursesInProgress: number;
  averageCompletionTime: number; // days
  strugglingCourses: Array<{
    courseId: string;
    stuckAt: string;
  }>;
}

export interface LessonMastery {
  videoLessons: {
    averageWatchTime: number; // minutes
    completionRate: number; // %
    rewatch: number;
  };
  taskLessons: {
    averageScore: number; // %
    averageAttempts: number;
    commonMistakes: string[];
  };
}

export interface FlashcardMastery {
  masteredCards: number;
  learningCards: number;
  difficultCards: number;
  averageResponseTime: number; // milliseconds
  dailyRetention: number; // %
}

export interface SkillMastery {
  listening: {
    level: number; // 0-100
    tasksCompleted: number;
    averageScore: number;
    lastPracticed: string | null;
  };
  speaking: {
    level: number;
    tasksCompleted: number;
    averageScore: number;
    lastPracticed: string | null;
  };
  reading: {
    level: number;
    tasksCompleted: number;
    averageScore: number;
    lastPracticed: string | null;
  };
  writing: {
    level: number;
    tasksCompleted: number;
    averageScore: number;
    lastPracticed: string | null;
  };
}

export interface StudyPatterns {
  bestStudyTime: string; // "morning" | "afternoon" | "evening" | "night"
  averageSessionLength: number; // minutes
  studyFrequency: number; // days in last 7 days
  currentStreak: number;
  longestStreak: number;
  preferredContent: "video" | "task" | "flashcard";
}

export interface LearningInsights {
  performance: LearningPerformance;
  analysis: {
    courseProgress: CourseProgress;
    lessonMastery: LessonMastery;
    flashcardMastery: FlashcardMastery;
    skillMastery: SkillMastery;
  };
  patterns: StudyPatterns;
  lastUpdated: string;
}

// New analytics types
export interface DailyStat {
  date: string;
  studyTime: number; // minutes
  lessonsCompleted: number;
  cardsReviewed: number;
  cardsLearned: number;
  correctRate: number;
  streak: number;
}

export interface TimeAnalytics {
  byContentType: Array<{
    name: string;
    value: number; // minutes
    percentage: number;
  }>;
  bySkill: Array<{
    skill: string;
    time: number; // minutes
    percentage: number;
  }>;
  totalTime: number; // minutes
}

export interface WeakArea {
  skill: string;
  level: number;
  tasksCompleted: number;
  averageScore: number;
  suggestion: string;
}

export interface WeakAreas {
  weakSkills: WeakArea[];
  difficultCards: {
    count: number;
    suggestion: string | null;
  };
  strugglingCourses: Array<{
    courseId: string;
    stuckAt: string;
  }>;
  hasWeakAreas: boolean;
}

export interface ProgressTimeline {
  timeline: Array<{
    date: string;
    studyTime: number;
    score: number;
    activities: number;
  }>;
  summary: {
    totalDays: number;
    activeDays: number;
    averageScore: number;
  };
}

export interface DetailedPerformance {
  performance: LearningPerformance;
  patterns: StudyPatterns;
  metadata: {
    version: string;
    confidence: number;
    lastUpdated: string;
    lastSyncedAt: string;
    dataPoints: number;
  };
  additionalMetrics: {
    totalLessons: number;
    completedLessons: number;
    completionRate: number;
    totalCards: number;
    totalSessions: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  credentials: "include",
  prepareHeaders: (headers) => {
    return headers;
  },
});

export const learningInsightsApi = createApi({
  reducerPath: "learningInsightsApi",
  baseQuery,
  tagTypes: ["LearningInsights"],
  endpoints: (builder) => ({
    // ============ LEARNING INSIGHTS ENDPOINTS ============

    // 📊 Lấy tất cả insights của user
    getMyLearningInsights: builder.query<
      ApiResponse<LearningInsights>,
      void
    >({
      query: () => ({
        url: "/learning-insights/my-insights",
        method: "GET",
      }),
      providesTags: ["LearningInsights"],
    }),

    // 📈 Lấy performance overview
    getPerformanceOverview: builder.query<
      ApiResponse<LearningPerformance>,
      void
    >({
      query: () => ({
        url: "/learning-insights/performance",
        method: "GET",
      }),
      providesTags: ["LearningInsights"],
    }),

    // 📚 Lấy course progress
    getCourseProgress: builder.query<
      ApiResponse<CourseProgress>,
      void
    >({
      query: () => ({
        url: "/learning-insights/course-progress",
        method: "GET",
      }),
      providesTags: ["LearningInsights"],
    }),

    // 🎴 Lấy flashcard mastery
    getFlashcardMastery: builder.query<
      ApiResponse<FlashcardMastery>,
      void
    >({
      query: () => ({
        url: "/learning-insights/flashcard-mastery",
        method: "GET",
      }),
      providesTags: ["LearningInsights"],
    }),

    // 🎯 Lấy skill mastery (4 kỹ năng)
    getSkillMastery: builder.query<
      ApiResponse<SkillMastery>,
      void
    >({
      query: () => ({
        url: "/learning-insights/skill-mastery",
        method: "GET",
      }),
      providesTags: ["LearningInsights"],
    }),

    // ⏰ Lấy study patterns
    getStudyPatterns: builder.query<
      ApiResponse<StudyPatterns>,
      void
    >({
      query: () => ({
        url: "/learning-insights/study-patterns",
        method: "GET",
      }),
      providesTags: ["LearningInsights"],
    }),

    // 🔄 Force update insights (manual trigger)
    forceUpdateInsights: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: "/learning-insights/update",
        method: "POST",
      }),
      invalidatesTags: ["LearningInsights"],
    }),

    // ============ NEW ANALYTICS ENDPOINTS ============

    // 📅 Lấy daily learning statistics
    getDailyStats: builder.query<ApiResponse<DailyStat[]>, { days?: number }>({
      query: ({ days = 7 }) => ({
        url: `/learning-insights/daily-stats?days=${days}`,
        method: "GET",
      }),
      providesTags: ["LearningInsights"],
    }),

    // ⏱️ Lấy time analytics
    getTimeAnalytics: builder.query<ApiResponse<TimeAnalytics>, void>({
      query: () => ({
        url: "/learning-insights/time-analytics",
        method: "GET",
      }),
      providesTags: ["LearningInsights"],
    }),

    // 🚨 Lấy weak areas
    getWeakAreas: builder.query<ApiResponse<WeakAreas>, void>({
      query: () => ({
        url: "/learning-insights/weak-areas",
        method: "GET",
      }),
      providesTags: ["LearningInsights"],
    }),

    // 📈 Lấy progress timeline
    getProgressTimeline: builder.query<ApiResponse<ProgressTimeline>, void>({
      query: () => ({
        url: "/learning-insights/progress-timeline",
        method: "GET",
      }),
      providesTags: ["LearningInsights"],
    }),

    // 🎯 Lấy detailed performance
    getDetailedPerformance: builder.query<
      ApiResponse<DetailedPerformance>,
      void
    >({
      query: () => ({
        url: "/learning-insights/detailed-performance",
        method: "GET",
      }),
      providesTags: ["LearningInsights"],
    }),
  }),
});

// Export hooks
export const {
  useGetMyLearningInsightsQuery,
  useGetPerformanceOverviewQuery,
  useGetCourseProgressQuery,
  useGetFlashcardMasteryQuery,
  useGetSkillMasteryQuery,
  useGetStudyPatternsQuery,
  useForceUpdateInsightsMutation,
  // New hooks
  useGetDailyStatsQuery,
  useGetTimeAnalyticsQuery,
  useGetWeakAreasQuery,
  useGetProgressTimelineQuery,
  useGetDetailedPerformanceQuery,
} = learningInsightsApi;

