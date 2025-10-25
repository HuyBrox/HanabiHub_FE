"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  Target,
  Zap,
  BookOpen,
  Video,
  FileText,
  Clock,
  Award,
  Sparkles,
  Send,
  BarChart3,
  PieChart,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  TrendingDown,
  Calendar,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";
import {
  useGetMyLearningInsightsQuery,
  useForceUpdateInsightsMutation,
  useGetDailyStatsQuery,
  useGetTimeAnalyticsQuery,
  useGetWeakAreasQuery,
  useGetProgressTimelineQuery,
  useGetDetailedPerformanceQuery,
} from "@/store/services/learningInsightsApi";
import { useSendChatMessageMutation } from "@/store/services/aiChatApi";
import { LoadingSpinner } from "@/components/loading";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";

export default function AIPracticePage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "ai"; content: string; source?: string }>
  >([
    {
      role: "ai",
      content: "Xin chào! Tôi là trợ lý học tập AI của bạn. 👋",
    },
    {
      role: "ai",
      content:
        "Dựa trên dữ liệu học tập, hôm nay bạn nên ôn lại phần flashcard về thời gian.",
    },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(true);
  const [timeRange, setTimeRange] = useState<7 | 30>(7);
  const [isSending, setIsSending] = useState(false);

  // Fetch data from BE
  const {
    data: insightsData,
    isLoading,
    isError,
    refetch,
  } = useGetMyLearningInsightsQuery();

  // Memoize query params to prevent infinite re-fetching
  const dailyStatsParams = useMemo(() => ({ days: timeRange }), [timeRange]);

  const { data: dailyStatsData } = useGetDailyStatsQuery(dailyStatsParams);
  const { data: timeAnalyticsData } = useGetTimeAnalyticsQuery();
  const { data: weakAreasData } = useGetWeakAreasQuery();
  const { data: timelineData } = useGetProgressTimelineQuery();
  const { data: detailedPerfData } = useGetDetailedPerformanceQuery();

  const [forceUpdate, { isLoading: isUpdating }] =
    useForceUpdateInsightsMutation();

  const [sendChatMessage] = useSendChatMessageMutation();

  // Format date for charts - move before early returns
  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }, []);

  // Prepare daily stats chart data - MUST be before early returns
  const dailyChartData = useMemo(
    () =>
      dailyStatsData?.data?.map((stat) => ({
        date: formatDate(stat.date),
        "Thời gian học": stat.studyTime,
        "Bài đã làm": stat.lessonsCompleted,
        "Thẻ ôn": stat.cardsReviewed,
      })) || [],
    [dailyStatsData, formatDate]
  );

  // Prepare time distribution data - MUST be before early returns
  const timeDistribution = useMemo(
    () => timeAnalyticsData?.data?.byContentType || [],
    [timeAnalyticsData]
  );

  // Get weak areas - MUST be before early returns
  const weakAreas = useMemo(() => weakAreasData?.data, [weakAreasData]);

  const handleSendMessage = useCallback(async () => {
    if (!inputRef.current || !user?._id) {
      return;
    }

    const trimmedMessage = inputRef.current.value.trim();

    if (!trimmedMessage) {
      return;
    }

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: trimmedMessage }]);

    // Clear input
    inputRef.current.value = "";
    setIsSending(true);

    try {
      const response = await sendChatMessage({
        user_id: user._id,
        message: trimmedMessage,
      }).unwrap();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: response.reply,
          source: response.source,
        },
      ]);
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn. Vui lòng thử lại sau.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }, [user, sendChatMessage]);

  const handleForceUpdate = useCallback(async () => {
    try {
      await forceUpdate().unwrap();
      refetch();
    } catch (error) {
      console.error("Failed to update insights:", error);
    }
  }, [forceUpdate, refetch]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (isError || !insightsData?.data) {
    return (
      <div className="h-full flex flex-col gap-4 p-4 items-center justify-center bg-background">
        <p className="text-muted-foreground">
          Chưa có dữ liệu học tập. Hãy bắt đầu học để thấy phân tích!
        </p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    );
  }

  const insights = insightsData.data;
  const performance = insights.performance;
  const analysis = insights.analysis;
  const patterns = insights.patterns;

  // Guard: Ensure all required data exists
  if (!performance || !analysis || !patterns || !analysis.skillMastery) {
    return (
      <div className="h-full flex flex-col gap-4 p-4 items-center justify-center bg-background">
        <p className="text-muted-foreground">
          Dữ liệu chưa đầy đủ. Hãy học thêm để có phân tích chi tiết!
        </p>
        <Button onClick={() => refetch()}>Thử lại</Button>
      </div>
    );
  }

  // Transform skill mastery data for radar chart
  const skillRadarData = [
    { skill: "Nghe", value: analysis.skillMastery.listening.level },
    { skill: "Nói", value: analysis.skillMastery.speaking.level },
    { skill: "Đọc", value: analysis.skillMastery.reading.level },
    { skill: "Viết", value: analysis.skillMastery.writing.level },
  ];

  // Flashcard distribution for pie chart
  const flashcardDistribution = [
    {
      name: "Thành thạo",
      value: analysis.flashcardMastery.masteredCards,
      color: "#22c55e",
    },
    {
      name: "Đang học",
      value: analysis.flashcardMastery.learningCards,
      color: "#3b82f6",
    },
    {
      name: "Khó nhớ",
      value: analysis.flashcardMastery.difficultCards,
      color: "#f97316",
    },
  ];

  const COLORS = ["#22c55e", "#3b82f6", "#f97316"];

  // Map overall level to display text
  const getLevelDisplay = (level: string) => {
    const levelMap = {
      beginner: "Sơ cấp",
      intermediate: "Trung cấp",
      advanced: "Nâng cao",
    };
    return levelMap[level as keyof typeof levelMap] || "Sơ cấp";
  };

  // Get timeline data
  const timeline = timelineData?.data;

  // Get detailed performance
  const detailedPerf = detailedPerfData?.data;

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 p-2 sm:p-4 bg-background overflow-hidden">
      {/* Left Column - Analytics Dashboard */}
      <div
        className={`flex-1 overflow-auto space-y-4 pr-0 lg:pr-2 transition-all duration-300 ${
          isChatbotOpen ? "lg:flex-[3]" : "lg:flex-1"
        }`}
      >
        {/* Header with Refresh Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Phân tích học tập</h2>
            <p className="text-sm text-muted-foreground">
              Cập nhật lần cuối: {new Date(insights.lastUpdated).toLocaleString("vi-VN")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleForceUpdate}
            disabled={isUpdating}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isUpdating ? "animate-spin" : ""}`}
            />
            {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </div>

        {/* Overview Cards with real data */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          <Card className="border-primary/20 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline">Trình độ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">
                {getLevelDisplay(performance.overallLevel)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {performance.overallLevel}
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-75">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="hidden sm:inline">Tiến bộ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {performance.weeklyProgress >= 0 ? "+" : ""}
                {Math.round(performance.weeklyProgress)}%
              </div>
              <Progress
                value={Math.min(Math.abs(performance.weeklyProgress), 100)}
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-150">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="hidden sm:inline">Duy trì</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {Math.round(performance.consistency)}%
              </div>
              <Progress value={performance.consistency} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 delay-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="hidden sm:inline">Ghi nhớ</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {Math.round(performance.retention)}%
              </div>
              <Progress value={performance.retention} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Weak Areas Alert */}
        {weakAreas?.hasWeakAreas && (
          <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-950/30 animate-in fade-in slide-in-from-bottom-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Cần cải thiện</AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              {weakAreas.weakSkills.map((skill, idx) => (
                <div key={idx} className="text-sm">
                  • Kỹ năng <strong>{skill.skill}</strong>: {skill.level}/100 - {skill.suggestion}
                </div>
              ))}
              {weakAreas.difficultCards.count > 0 && (
                <div className="text-sm">
                  • <strong>{weakAreas.difficultCards.count}</strong> thẻ flashcard khó - {weakAreas.difficultCards.suggestion}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Daily Learning Activity Chart */}
        <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Activity className="h-5 w-5 text-primary" />
                  Hoạt động học tập hàng ngày
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Thống kê {timeRange} ngày gần nhất
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={timeRange === 7 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(7)}
                >
                  7 ngày
                </Button>
                <Button
                  variant={timeRange === 30 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(30)}
                >
                  30 ngày
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {dailyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Thời gian học"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    stroke="hsl(var(--primary))"
                  />
                  <Line
                    type="monotone"
                    dataKey="Bài đã làm"
                    stroke="#22c55e"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="Thẻ ôn"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Chưa có dữ liệu học tập trong khoảng thời gian này
              </div>
            )}
          </CardContent>
        </Card>

        {/* Time Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Time by Content Type */}
          <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <PieChart className="h-5 w-5 text-primary" />
                Phân bố thời gian
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Theo loại nội dung
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeDistribution.length > 0 && timeDistribution.some((d) => d.percentage > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={timeDistribution.filter((d) => d.percentage > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {timeDistribution.filter((d) => d.percentage > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number, name: string) => {
                        const item = timeDistribution.find((d) => d.name === name);
                        return [`${item?.value || 0} phút (${value}%)`, name];
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                  Chưa có dữ liệu thời gian học
                </div>
              )}
              <div className="mt-4 space-y-2">
                {timeDistribution.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-medium">{item.value} phút</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Metrics */}
          <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <BarChart3 className="h-5 w-5 text-primary" />
                Số liệu tổng quan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {detailedPerf && (
                <>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Tổng bài học</span>
                    <span className="text-lg font-bold">{detailedPerf.additionalMetrics.totalLessons}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Đã hoàn thành</span>
                    <span className="text-lg font-bold text-green-600">
                      {detailedPerf.additionalMetrics.completedLessons}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Tỷ lệ hoàn thành</span>
                    <span className="text-lg font-bold text-primary">
                      {detailedPerf.additionalMetrics.completionRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Tổng flashcard</span>
                    <span className="text-lg font-bold">{detailedPerf.additionalMetrics.totalCards}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Phiên học</span>
                    <span className="text-lg font-bold">{detailedPerf.additionalMetrics.totalSessions}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <span className="text-sm font-medium">Độ tin cậy dữ liệu</span>
                    <span className="text-lg font-bold text-primary">
                      {detailedPerf.metadata.confidence}%
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress Timeline */}
        {timeline && timeline.timeline.length > 0 && (
          <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Calendar className="h-5 w-5 text-primary" />
                Tiến trình 30 ngày
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {timeline.summary.activeDays}/{timeline.summary.totalDays} ngày học tập - Điểm TB: {timeline.summary.averageScore}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={timeline.timeline.map((t) => ({
                  date: formatDate(t.date),
                  score: t.score,
                  time: t.studyTime,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="score"
                    name="Điểm (%)"
                    fill="#22c55e"
                    fillOpacity={0.6}
                    stroke="#22c55e"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Skill Analysis (4 skills radar chart) */}
        <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Target className="h-5 w-5 text-primary" />
              Phân tích 4 kỹ năng (Nghe - Nói - Đọc - Viết)
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Đánh giá dựa trên flashcard và bài tập đã làm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={skillRadarData}>
                <PolarGrid className="stroke-muted" />
                <PolarAngleAxis dataKey="skill" className="text-xs" />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  className="text-xs"
                />
                <Radar
                  name="Kỹ năng"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Skill Details */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {Object.entries(analysis.skillMastery).map(([key, skill]: [string, any]) => (
                <div
                  key={key}
                  className="p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium capitalize">
                      {key === "listening"
                        ? "Nghe"
                        : key === "speaking"
                        ? "Nói"
                        : key === "reading"
                        ? "Đọc"
                        : "Viết"}
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {skill.level}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Bài đã làm: {skill.tasksCompleted}</p>
                    <p>Điểm TB: {Math.round(skill.averageScore)}%</p>
                    {skill.lastPracticed && (
                      <p>
                        Lần cuối:{" "}
                        {new Date(skill.lastPracticed).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Progress */}
        <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 className="h-5 w-5 text-primary" />
              Tiến độ khóa học
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {analysis.courseProgress.coursesInProgress} khóa đang học
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Đang học</p>
                <p className="text-2xl font-bold text-primary">
                  {analysis.courseProgress.coursesInProgress}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">Thời gian TB</p>
                <p className="text-2xl font-bold text-primary">
                  {analysis.courseProgress.averageCompletionTime} ngày
                </p>
              </div>
            </div>

            {analysis.courseProgress.strugglingCourses.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-orange-600">
                  ⚠️ Khóa đang gặp khó khăn
                </h4>
                {analysis.courseProgress.strugglingCourses.map((course: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200"
                  >
                    <p className="text-sm text-orange-600">
                      Khóa: {course.courseId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bị kẹt tại: {course.stuckAt}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lesson Analysis */}
        <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <BookOpen className="h-5 w-5 text-primary" />
              Phân tích bài học
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="video" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="video"
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Video className="h-4 w-4" />
                  Video
                </TabsTrigger>
                <TabsTrigger
                  value="exercise"
                  className="flex items-center gap-2 text-xs sm:text-sm"
                >
                  <FileText className="h-4 w-4" />
                  Bài tập
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="text-xl sm:text-2xl font-bold text-primary">
                      {analysis.lessonMastery.videoLessons.completionRate}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tỷ lệ xem hết
                    </p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="text-xl sm:text-2xl font-bold text-primary">
                      {analysis.lessonMastery.videoLessons.averageWatchTime} phút
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Thời lượng TB
                    </p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="text-xl sm:text-2xl font-bold text-primary">
                      {analysis.lessonMastery.videoLessons.rewatch} lần
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Số lần xem lại
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="exercise" className="space-y-4 mt-4">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      {analysis.lessonMastery.taskLessons.averageScore}%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Điểm TB
                    </p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                      {analysis.lessonMastery.taskLessons.averageAttempts} lần
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Làm lại
                    </p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="text-base sm:text-lg font-bold text-orange-600">
                      {analysis.lessonMastery.taskLessons.commonMistakes.length}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Lỗi thường
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Flashcard Statistics */}
        <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <PieChart className="h-5 w-5 text-primary" />
              Thống kê Flashcard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={flashcardDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {flashcardDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                {flashcardDistribution.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <span
                      className="text-lg font-bold"
                      style={{ color: item.color }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">
                  Tỷ lệ đúng (24h gần nhất)
                </span>
                <span className="text-lg font-bold text-primary">
                  {analysis.flashcardMastery.dailyRetention}%
                </span>
              </div>
              <Progress
                value={analysis.flashcardMastery.dailyRetention}
                className="mt-2 h-2 transition-all duration-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Study Patterns */}
        <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Clock className="h-5 w-5 text-primary" />
              Thói quen học tập
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted hover:scale-105 transition-all">
                <p className="text-xs text-muted-foreground">
                  Khung giờ học tốt nhất
                </p>
                <p className="text-base sm:text-lg font-bold mt-1 capitalize">
                  {patterns.bestStudyTime}
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted hover:scale-105 transition-all">
                <p className="text-xs text-muted-foreground">
                  Độ dài phiên học TB
                </p>
                <p className="text-base sm:text-lg font-bold mt-1">
                  {patterns.averageSessionLength} phút
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted hover:scale-105 transition-all">
                <p className="text-xs text-muted-foreground">Chuỗi ngày học</p>
                <p className="text-base sm:text-lg font-bold mt-1">
                  {patterns.currentStreak} ngày 🔥
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dài nhất: {patterns.longestStreak} ngày
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted hover:scale-105 transition-all">
                <p className="text-xs text-muted-foreground">
                  Nội dung yêu thích
                </p>
                <p className="text-base sm:text-lg font-bold mt-1 capitalize">
                  {patterns.preferredContent === "video"
                    ? "Video"
                    : patterns.preferredContent === "task"
                    ? "Bài tập"
                    : "Flashcards"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Suggestions (Rule-based, not AI) */}
        <Card className="shadow-sm border-primary/30 animate-in fade-in slide-in-from-bottom-4 delay-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Sparkles className="h-5 w-5 text-primary" />
              Gợi ý từ hệ thống
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Dựa trên phân tích học tập của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Dynamic suggestions based on data */}
            {analysis.flashcardMastery.difficultCards > 5 && (
              <div className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-xs sm:text-sm">
                      Ôn lại {analysis.flashcardMastery.difficultCards} thẻ khó
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Bạn có {analysis.flashcardMastery.difficultCards} thẻ
                      flashcard cần ôn lại. Hãy dành 10 phút ôn tập!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {Object.entries(analysis.skillMastery).map(([skill, data]: [string, any]) =>
              data.level < 50 ? (
                <div
                  key={skill}
                  className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 hover:scale-105 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium text-xs sm:text-sm">
                        Cải thiện kỹ năng{" "}
                        {skill === "listening"
                          ? "Nghe"
                          : skill === "speaking"
                          ? "Nói"
                          : skill === "reading"
                          ? "Đọc"
                          : "Viết"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Kỹ năng này đang ở mức {data.level}/100. Hãy luyện tập
                        thêm để cải thiện!
                      </p>
                    </div>
                  </div>
                </div>
              ) : null
            )}

            {patterns.currentStreak === 0 && (
              <div className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 hover:scale-105 transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-xs sm:text-sm">
                      Bắt đầu chuỗi học tập mới
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Hãy học ít nhất 15 phút mỗi ngày để xây dựng thói quen!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {weakAreas && !weakAreas.hasWeakAreas && (
              <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-xs sm:text-sm text-green-700 dark:text-green-400">
                      Bạn đang học rất tốt! 🎉
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tiếp tục duy trì nhịp độ học tập như vậy nhé!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column - AI Chatbot (placeholder) */}
      <div
        className={`flex flex-col transition-all duration-300 ${
          isChatbotOpen ? "flex-[2] lg:flex-[2]" : "w-12"
        } border-l relative`}
      >
        {/* Toggle button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className="absolute -left-4 top-4 z-10 rounded-full bg-background border shadow-md hover:scale-110 transition-transform"
        >
          {isChatbotOpen ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {isChatbotOpen && (
          <div className="h-full flex flex-col pl-4 animate-in slide-in-from-right duration-300">
            <Card className="h-full flex flex-col shadow-lg">
              <CardHeader className="border-b bg-primary/5 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Brain className="h-5 w-5 text-primary" />
                  Trợ lý học tập AI 🤖
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Hỏi bất cứ điều gì về việc học tiếng Nhật
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    } animate-in slide-in-from-bottom-2`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 sm:px-4 py-2 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80 transition-colors"
                      }`}
                    >
                      <p className="text-xs sm:text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      {message.source && (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {message.source === "RAG"
                              ? "📚 Ngữ pháp"
                              : message.source === "Translator"
                              ? "🌐 Dịch thuật"
                              : "🤖 AI"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start animate-in slide-in-from-bottom-2">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Đang suy nghĩ...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <div className="p-3 sm:p-4 border-t bg-muted/30 flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Nhập câu hỏi của bạn..."
                    onKeyPress={(e) =>
                      e.key === "Enter" && !isSending && handleSendMessage()
                    }
                    disabled={isSending}
                    className="flex-1 text-xs sm:text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    disabled={isSending}
                    className="shrink-0 hover:scale-110 transition-transform"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Tip: Hỏi về ngữ pháp, từ vựng, hoặc yêu cầu gợi ý học tập
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
