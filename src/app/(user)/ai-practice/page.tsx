"use client";

import { useState } from "react";
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
} from "recharts";

export default function AIPracticePage() {
  const [messages, setMessages] = useState([
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
  const [inputMessage, setInputMessage] = useState("");
  const [isChatbotOpen, setIsChatbotOpen] = useState(true);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: inputMessage }]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Tôi đã nhận được tin nhắn của bạn. Đây là nơi bạn sẽ kết nối với AI backend để xử lý câu hỏi.",
        },
      ]);
    }, 1000);

    setInputMessage("");
  };

  const weeklyProgressData = [
    { day: "T2", hours: 2.5, accuracy: 75 },
    { day: "T3", hours: 3.2, accuracy: 78 },
    { day: "T4", hours: 1.8, accuracy: 72 },
    { day: "T5", hours: 4.1, accuracy: 85 },
    { day: "T6", hours: 3.5, accuracy: 82 },
    { day: "T7", hours: 2.9, accuracy: 80 },
    { day: "CN", hours: 5.2, accuracy: 88 },
  ];

  const skillRadarData = [
    { skill: "Ngữ pháp", value: 78 },
    { skill: "Từ vựng", value: 85 },
    { skill: "Kanji", value: 65 },
    { skill: "Nghe", value: 72 },
    { skill: "Đọc", value: 80 },
    { skill: "Viết", value: 70 },
  ];

  const flashcardDistribution = [
    { name: "Thành thạo", value: 156, color: "#22c55e" },
    { name: "Đang học", value: 89, color: "#3b82f6" },
    { name: "Khó nhớ", value: 23, color: "#f97316" },
  ];

  const COLORS = ["#22c55e", "#3b82f6", "#f97316"];

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 p-2 sm:p-4 bg-background">
      {/* Left Column - Analytics Dashboard */}
      <div
        className={`flex-1 overflow-auto space-y-4 pr-0 lg:pr-2 transition-all duration-300 ${
          isChatbotOpen ? "lg:flex-[3]" : "lg:flex-1"
        }`}
      >
        {/* Overview Cards with animation */}
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
                N4
              </div>
              <p className="text-xs text-muted-foreground mt-1">Trung cấp</p>
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
              <div className="text-xl sm:text-2xl font-bold">+12%</div>
              <Progress value={75} className="mt-2 h-2" />
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
              <div className="text-xl sm:text-2xl font-bold">85%</div>
              <Progress value={85} className="mt-2 h-2" />
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
              <div className="text-xl sm:text-2xl font-bold">78%</div>
              <Progress value={78} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tiến độ tuần này
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Thời gian học và độ chính xác theo ngày
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyProgressData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis yAxisId="left" className="text-xs" />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  className="text-xs"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="hours"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Giờ học"
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Độ chính xác (%)"
                  dot={{ fill: "#22c55e", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Target className="h-5 w-5 text-primary" />
              Phân tích kỹ năng
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Đánh giá toàn diện các kỹ năng tiếng Nhật
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
          </CardContent>
        </Card>

        {/* Course Progress */}
        <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <BarChart3 className="h-5 w-5 text-primary" />
              Tiến độ khóa học
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Các khóa học đang học và mức độ hoàn thành
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 group hover:bg-muted/50 p-3 rounded-lg transition-colors">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Hiragana cơ bản</span>
                <span className="text-muted-foreground">95%</span>
              </div>
              <Progress
                value={95}
                className="h-2 transition-all duration-500"
              />
              <p className="text-xs text-muted-foreground">
                Thời gian trung bình: 2.5 giờ/tuần
              </p>
            </div>

            <div className="space-y-2 group hover:bg-muted/50 p-3 rounded-lg transition-colors">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Katakana nâng cao</span>
                <span className="text-muted-foreground">67%</span>
              </div>
              <Progress
                value={67}
                className="h-2 transition-all duration-500"
              />
              <p className="text-xs text-muted-foreground">
                Thời gian trung bình: 1.8 giờ/tuần
              </p>
            </div>

            <div className="space-y-2 group hover:bg-muted/50 p-3 rounded-lg transition-colors">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-orange-600">
                  Kanji cơ bản
                </span>
                <span className="text-orange-600">32%</span>
              </div>
              <Progress
                value={32}
                className="h-2 bg-orange-100 transition-all duration-500"
              />
              <p className="text-xs text-orange-600">
                ⚠️ Đang gặp khó khăn - Cần ôn tập thêm
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Lesson Analysis */}
        <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-600">
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
                      89%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tỷ lệ xem hết
                    </p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="text-xl sm:text-2xl font-bold text-primary">
                      12 phút
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Thời lượng TB
                    </p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="text-xl sm:text-2xl font-bold text-primary">
                      2.3 lần
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
                      8.2/10
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Điểm TB
                    </p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">
                      1.5 lần
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Làm lại
                    </p>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="text-xl sm:text-2xl font-bold text-orange-600">
                      Ngữ pháp
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

        <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-700">
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
                <span className="text-lg font-bold text-primary">82%</span>
              </div>
              <Progress
                value={82}
                className="mt-2 h-2 transition-all duration-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Study Patterns */}
        <Card className="shadow-sm animate-in fade-in slide-in-from-bottom-4 delay-800">
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
                <p className="text-base sm:text-lg font-bold mt-1">
                  19:00 - 21:00
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted hover:scale-105 transition-all">
                <p className="text-xs text-muted-foreground">
                  Độ dài phiên học TB
                </p>
                <p className="text-base sm:text-lg font-bold mt-1">45 phút</p>
              </div>
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted hover:scale-105 transition-all">
                <p className="text-xs text-muted-foreground">Chuỗi ngày học</p>
                <p className="text-base sm:text-lg font-bold mt-1">
                  12 ngày 🔥
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Dài nhất: 28 ngày
                </p>
              </div>
              <div className="p-3 sm:p-4 bg-muted/50 rounded-lg hover:bg-muted hover:scale-105 transition-all">
                <p className="text-xs text-muted-foreground">
                  Nội dung yêu thích
                </p>
                <p className="text-base sm:text-lg font-bold mt-1">
                  Flashcards
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card className="shadow-sm border-primary/30 animate-in fade-in slide-in-from-bottom-4 delay-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Sparkles className="h-5 w-5 text-primary" />
              Gợi ý từ AI
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Dựa trên phân tích học tập của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 hover:scale-105 transition-all cursor-pointer">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-xs sm:text-sm">
                    Ôn lại flashcard N5 về thời gian
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bạn đã không ôn phần này trong 3 ngày. Tỷ lệ ghi nhớ có thể
                    giảm.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 hover:scale-105 transition-all cursor-pointer">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-xs sm:text-sm">
                    Làm bài luyện ngữ pháp N4
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Điểm ngữ pháp của bạn đang thấp hơn trung bình. Hãy luyện
                    tập thêm!
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-lg hover:bg-primary/10 hover:scale-105 transition-all cursor-pointer">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-xs sm:text-sm">
                    Thử học Kanji theo chủ đề
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bạn học tốt hơn khi Kanji được nhóm theo chủ đề thay vì theo
                    thứ tự.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
          <div className="flex-1 flex flex-col pl-4 animate-in slide-in-from-right duration-300">
            <Card className="flex-1 flex flex-col shadow-lg">
              <CardHeader className="border-b bg-primary/5">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <Brain className="h-5 w-5 text-primary" />
                  Trợ lý học tập AI 🤖
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Hỏi bất cứ điều gì về việc học tiếng Nhật
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 overflow-auto p-4 space-y-4">
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
                    </div>
                  </div>
                ))}
              </CardContent>

              <div className="p-3 sm:p-4 border-t bg-muted/30">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nhập câu hỏi của bạn..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 text-xs sm:text-sm"
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
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
