"use client";

import { cn } from "@/lib/utils";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  Calendar,
  Trophy,
  BookOpen,
  Target,
  Flame,
  Award,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";

const userStats = {
  name: "Alex Johnson",
  username: "@alexlearns",
  avatar: "/anime-style-avatar-user.png",
  jlptLevel: "N4",
  joinDate: "March 2024",
  studyStreak: 47,
  totalStudyTime: 156,
  wordsLearned: 1247,
  kanjiMastered: 89,
  lessonsCompleted: 34,
};

const enrolledCourses = [
  {
    id: 1,
    title: "Hiragana Mastery",
    progress: 100,
    status: "completed",
    image:
      "/images/japanese/japanese-hiragana-characters-colorful-illustration.png",
  },
  {
    id: 2,
    title: "Katakana Essentials",
    progress: 75,
    status: "in-progress",
    image: "/images/japanese/japanese-katakana-characters-modern-design.png",
  },
  {
    id: 3,
    title: "Essential Kanji",
    progress: 45,
    status: "in-progress",
    image:
      "/images/japanese/japanese-kanji-characters-traditional-calligraphy.png",
  },
  {
    id: 4,
    title: "JLPT N4 Grammar",
    progress: 20,
    status: "in-progress",
    image: "/japanese-grammar-book-illustration.png",
  },
];

const achievements = [
  {
    id: 1,
    title: "First Steps",
    description: "Complete your first lesson",
    icon: "🎯",
    earned: true,
    earnedDate: "March 15, 2024",
  },
  {
    id: 2,
    title: "Hiragana Master",
    description: "Master all 46 hiragana characters",
    icon: "🔤",
    earned: true,
    earnedDate: "April 2, 2024",
  },
  {
    id: 3,
    title: "Study Streak",
    description: "Study for 30 consecutive days",
    icon: "🔥",
    earned: true,
    earnedDate: "May 10, 2024",
  },
  {
    id: 4,
    title: "Kanji Collector",
    description: "Learn 100 kanji characters",
    icon: "📚",
    earned: false,
    progress: 89,
  },
  {
    id: 5,
    title: "Community Helper",
    description: "Help 10 fellow learners",
    icon: "🤝",
    earned: false,
    progress: 7,
  },
  {
    id: 6,
    title: "JLPT Ready",
    description: "Complete N4 preparation course",
    icon: "🎓",
    earned: false,
    progress: 20,
  },
];

const weeklyProgress = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 1.8 },
  { day: "Wed", hours: 3.2 },
  { day: "Thu", hours: 2.1 },
  { day: "Fri", hours: 1.5 },
  { day: "Sat", hours: 4.0 },
  { day: "Sun", hours: 2.8 },
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const maxHours = Math.max(...weeklyProgress.map((d) => d.hours));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={
                    userStats.avatar || "/images/placeholders/placeholder.svg"
                  }
                />
                <AvatarFallback className="text-2xl">AJ</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{userStats.name}</h1>
                    <p className="text-muted-foreground">
                      {userStats.username}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="default"
                      className="bg-primary text-primary-foreground"
                    >
                      JLPT {userStats.jlptLevel}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Flame className="h-3 w-3" />
                      {userStats.studyStreak} day streak
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {userStats.joinDate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {userStats.totalStudyTime}h studied
                    </div>
                  </div>
                  <Button
                    className="bg-primary hover:bg-primary/90 md:ml-auto"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {userStats.wordsLearned}
              </div>
              <p className="text-sm text-muted-foreground">Words Learned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {userStats.kanjiMastered}
              </div>
              <p className="text-sm text-muted-foreground">Kanji Mastered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {userStats.lessonsCompleted}
              </div>
              <p className="text-sm text-muted-foreground">Lessons Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {userStats.studyStreak}
              </div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Study Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    This Week's Study Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weeklyProgress.map((day) => (
                      <div key={day.day} className="flex items-center gap-3">
                        <div className="w-8 text-sm text-muted-foreground">
                          {day.day}
                        </div>
                        <div className="flex-1">
                          <div className="bg-muted rounded-full h-2">
                            <div
                              className="bg-primary rounded-full h-2 transition-all"
                              style={{
                                width: `${(day.hours / maxHours) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <div className="w-12 text-sm text-right">
                          {day.hours}h
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements
                      .filter((a) => a.earned)
                      .slice(0, 3)
                      .map((achievement) => (
                        <div
                          key={achievement.id}
                          className="flex items-center gap-3"
                        >
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <p className="font-medium">{achievement.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {achievement.earnedDate}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200"
                          >
                            Earned
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Enrolled Courses
                </CardTitle>
                <CardDescription>
                  Track your progress across all courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrolledCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <img
                            src={
                              course.image ||
                              "/images/placeholders/placeholder.svg"
                            }
                            alt={course.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">
                              {course.title}
                            </h3>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>Progress</span>
                                <span className="font-medium">
                                  {course.progress}%
                                </span>
                              </div>
                              <Progress
                                value={course.progress}
                                className="h-2"
                              />
                              <Badge
                                variant={
                                  course.status === "completed"
                                    ? "default"
                                    : "outline"
                                }
                                className={
                                  course.status === "completed"
                                    ? "bg-green-600"
                                    : ""
                                }
                              >
                                {course.status === "completed"
                                  ? "Completed"
                                  : "In Progress"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Achievements & Badges
                </CardTitle>
                <CardDescription>
                  Your learning milestones and accomplishments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <Card
                      key={achievement.id}
                      className={cn(
                        "transition-all",
                        achievement.earned
                          ? "border-green-200 bg-green-50/50"
                          : "border-muted"
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">
                              {achievement.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            {achievement.earned ? (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-200"
                              >
                                Earned {achievement.earnedDate}
                              </Badge>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{achievement.progress}/100</span>
                                </div>
                                <Progress
                                  value={achievement.progress}
                                  className="h-2"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Learning Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">JLPT N3 Preparation</span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Daily Study Goal (2h)</span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monthly Kanji Target (50)</span>
                      <span className="text-sm font-medium">72%</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    Study Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Most active day</span>
                    <span className="font-medium">Saturday</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Average session</span>
                    <span className="font-medium">45 minutes</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Favorite category</span>
                    <span className="font-medium">Kanji</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Next milestone</span>
                    <span className="font-medium">100 Kanji</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
