"use client";

import { cn } from "@/lib/utils";
import { withAuth } from "@/components/auth";
import { useState, useMemo, useRef } from "react";
import Image from "next/image";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Loader2,
  Save,
  X,
  Mail,
  Users,
  FileText,
} from "lucide-react";
import {
  useGetUserStatsQuery,
  useGetUserCoursesQuery,
  useGetWeeklyProgressQuery,
  useGetUserAchievementsQuery,
  useGetUserInsightsQuery,
  useUpdateProfileMutation,
} from "@/store/services/userApi";
import { useGetCurrentUserQuery } from "@/store/services/authApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    bio: "",
    phone: "",
    address: "",
    level: "N5",
    gender: "other",
    isPrivate: false,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [originalData, setOriginalData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, isInitialized } = useSelector(
    (state: RootState) => state.auth
  );

  const shouldSkip = !isAuthenticated || !isInitialized;

  // Lấy current user data để so sánh
  const { data: currentUserData } = useGetCurrentUserQuery(undefined, {
    skip: shouldSkip,
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useGetUserStatsQuery(undefined, { skip: shouldSkip });
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetUserCoursesQuery(undefined, { skip: shouldSkip });
  const {
    data: weeklyData,
    isLoading: weeklyLoading,
    error: weeklyError,
  } = useGetWeeklyProgressQuery(undefined, { skip: shouldSkip });
  const {
    data: achievementsData,
    isLoading: achievementsLoading,
    error: achievementsError,
  } = useGetUserAchievementsQuery(undefined, { skip: shouldSkip });
  const {
    data: insightsData,
    isLoading: insightsLoading,
    error: insightsError,
  } = useGetUserInsightsQuery(undefined, { skip: shouldSkip });

  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

  const userStats = (statsData as any)?.data || {
    name: "User",
    username: "@user",
    avatar: "/images/placeholders/placeholder.svg",
    jlptLevel: "N5",
    joinDate: "Unknown",
    studyStreak: 0,
    totalStudyTime: 0,
    wordsLearned: 0,
    kanjiMastered: 0,
    lessonsCompleted: 0,
    email: "",
    lastActiveAt: null,
    posts: 0,
    followers: 0,
    following: 0,
    isOnline: false,
  };

  const currentUser = (currentUserData as any)?.data || {};

  const enrolledCourses = Array.isArray(coursesData)
    ? coursesData
    : (coursesData as any)?.data || [];
  const achievements = Array.isArray(achievementsData)
    ? achievementsData
    : (achievementsData as any)?.data || [];
  const weeklyProgress = Array.isArray(weeklyData)
    ? weeklyData
    : (weeklyData as any)?.data || [
        { day: "Mon", hours: 0 },
        { day: "Tue", hours: 0 },
        { day: "Wed", hours: 0 },
        { day: "Thu", hours: 0 },
        { day: "Fri", hours: 0 },
        { day: "Sat", hours: 0 },
        { day: "Sun", hours: 0 },
      ];
  const insights = (insightsData as any)?.data || {
    mostActiveDay: "N/A",
    averageSession: "0 minutes",
    favoriteCategory: "N/A",
    nextMilestone: "Start learning",
  };

  const maxHours = useMemo(
    () =>
      Math.max(
        ...weeklyProgress.map((d: { day: string; hours: number }) => d.hours),
        1
      ),
    [weeklyProgress]
  );

  const isLoading =
    statsLoading ||
    coursesLoading ||
    weeklyLoading ||
    achievementsLoading ||
    insightsLoading;

  const hasError =
    statsError ||
    coursesError ||
    weeklyError ||
    achievementsError ||
    insightsError;

  const handleEditClick = () => {
    const currentUser = (currentUserData as any)?.data || {};
    const initialData = {
      fullname: currentUser.fullname || userStats.name || "",
      username:
        currentUser.username || userStats.username?.replace("@", "") || "",
      bio: currentUser.bio || "",
      phone: currentUser.phone || "",
      address: currentUser.address || "",
      level: currentUser.level || userStats.jlptLevel || "N5",
      gender: currentUser.gender || "other",
      isPrivate: currentUser.isPrivate || false,
    };
    setFormData(initialData);
    setOriginalData(initialData);
    setAvatarPreview(currentUser.avatar || userStats.avatar || null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      // Chỉ gửi những field thay đổi (không gửi empty string)
      if (originalData) {
        if (
          formData.fullname !== originalData.fullname &&
          formData.fullname.trim() !== ""
        ) {
          formDataToSend.append("fullname", formData.fullname);
        }
        if (
          formData.username !== originalData.username &&
          formData.username.trim() !== ""
        ) {
          formDataToSend.append("username", formData.username);
        }
        if (formData.bio !== originalData.bio) {
          formDataToSend.append("bio", formData.bio || "");
        }
        if (formData.phone !== originalData.phone) {
          formDataToSend.append("phone", formData.phone || "");
        }
        if (formData.address !== originalData.address) {
          formDataToSend.append("address", formData.address || "");
        }
        if (formData.level !== originalData.level) {
          formDataToSend.append("level", formData.level);
        }
        if (formData.gender !== originalData.gender) {
          formDataToSend.append("gender", formData.gender);
        }
        if (formData.isPrivate !== originalData.isPrivate) {
          formDataToSend.append("isPrivate", String(formData.isPrivate));
        }
      } else {
        // Fallback: nếu không có originalData, gửi tất cả (không gửi empty string)
        if (formData.fullname.trim() !== "") {
          formDataToSend.append("fullname", formData.fullname);
        }
        if (formData.username.trim() !== "") {
          formDataToSend.append("username", formData.username);
        }
        formDataToSend.append("bio", formData.bio || "");
        formDataToSend.append("phone", formData.phone || "");
        formDataToSend.append("address", formData.address || "");
        formDataToSend.append("level", formData.level);
        formDataToSend.append("gender", formData.gender);
        formDataToSend.append("isPrivate", String(formData.isPrivate));
      }

      const avatarFile = fileInputRef.current?.files?.[0];
      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
      }

      // Kiểm tra xem có field nào thay đổi không
      let hasChanges = false;
      for (const _ of formDataToSend.entries()) {
        hasChanges = true;
        break;
      }
      if (!hasChanges) {
        alert("Không có thay đổi nào để cập nhật");
        return;
      }

      await updateProfile(formDataToSend).unwrap();
      setIsEditing(false);
      setAvatarPreview(null);
      setOriginalData(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      // RTK Query error structure: { status, data, error }
      console.error("Error updating profile:", {
        error,
        status: error?.status,
        data: error?.data,
        message: error?.data?.message,
        issues: error?.data?.data,
      });

      let errorMessage = "Failed to update profile";

      if (error?.data) {
        // Backend trả về { success: false, message: "...", data: [...] }
        if (error.data.message) {
          errorMessage = error.data.message;
        } else if (
          Array.isArray(error.data.data) &&
          error.data.data.length > 0
        ) {
          // Validation errors
          errorMessage = error.data.data
            .map((issue: any) => issue.message || issue.path?.join("."))
            .join(", ");
        } else if (error.data.data && typeof error.data.data === "string") {
          errorMessage = error.data.data;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-destructive">Error loading profile data</p>
          <p className="text-sm text-muted-foreground">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            {!isEditing ? (
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={
                      userStats.avatar || "/images/placeholders/placeholder.svg"
                    }
                  />
                  <AvatarFallback className="text-2xl">
                    {userStats.name?.charAt(0) || "U"}
                  </AvatarFallback>
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
                      {currentUser.isPrivate && (
                        <Badge variant="outline" className="border-yellow-500">
                          🔒 Private
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {userStats.joinDate}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {userStats.totalStudyTime}h studied
                      </div>
                      {currentUser.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {currentUser.email}
                        </div>
                      )}
                      {currentUser.lastActiveAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Last active:{" "}
                          {new Date(
                            currentUser.lastActiveAt
                          ).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <Button
                      className="bg-primary hover:bg-primary/90 md:ml-auto"
                      onClick={handleEditClick}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                  {(currentUser.posts !== undefined ||
                    currentUser.followers !== undefined ||
                    currentUser.following !== undefined) && (
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                      {currentUser.posts !== undefined && (
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {currentUser.posts || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Posts
                          </div>
                        </div>
                      )}
                      {currentUser.followers !== undefined && (
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {Array.isArray(currentUser.followers)
                              ? currentUser.followers.length
                              : currentUser.followers || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Followers
                          </div>
                        </div>
                      )}
                      {currentUser.following !== undefined && (
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {Array.isArray(currentUser.following)
                              ? currentUser.following.length
                              : currentUser.following || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Following
                          </div>
                        </div>
                      )}
                      {currentUser.isOnline !== undefined && (
                        <div className="ml-auto">
                          <Badge
                            variant={
                              currentUser.isOnline ? "default" : "outline"
                            }
                            className={
                              currentUser.isOnline ? "bg-green-500" : ""
                            }
                          >
                            {currentUser.isOnline ? "🟢 Online" : "⚫ Offline"}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={
                          avatarPreview ||
                          userStats.avatar ||
                          "/images/placeholders/placeholder.svg"
                        }
                      />
                      <AvatarFallback className="text-2xl">
                        {formData.fullname?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full"
                      >
                        Change Avatar
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Full Name
                        </label>
                        <Input
                          value={formData.fullname}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              fullname: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Username
                        </label>
                        <Input
                          value={formData.username}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              username: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    {currentUser.email && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Email{" "}
                          <span className="text-xs text-muted-foreground">
                            (read-only)
                          </span>
                        </label>
                        <Input
                          value={currentUser.email}
                          disabled
                          className="bg-muted cursor-not-allowed"
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Bio
                      </label>
                      <Textarea
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData({ ...formData, bio: e.target.value })
                        }
                        rows={3}
                        maxLength={300}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Phone
                        </label>
                        <Input
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Address
                        </label>
                        <Input
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          JLPT Level
                        </label>
                        <Select
                          value={formData.level}
                          onValueChange={(value) =>
                            setFormData({ ...formData, level: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="N5">N5</SelectItem>
                            <SelectItem value="N4">N4</SelectItem>
                            <SelectItem value="N3">N3</SelectItem>
                            <SelectItem value="N2">N2</SelectItem>
                            <SelectItem value="N1">N1</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Gender
                        </label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) =>
                            setFormData({ ...formData, gender: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <label className="text-sm font-medium mb-2 block">
                        Quyền riêng tư
                      </label>
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">Private Profile</p>
                          <p className="text-sm text-muted-foreground">
                            {formData.isPrivate
                              ? "Chỉ bạn bè mới xem được bài viết của bạn"
                              : "Mọi người có thể xem bài viết của bạn"}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant={formData.isPrivate ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              isPrivate: !formData.isPrivate,
                            })
                          }
                        >
                          {formData.isPrivate ? "🔒 Private" : "🌐 Public"}
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="submit"
                        disabled={isUpdating}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isUpdating}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {userStats.wordsLearned}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("profile.wordsLearned")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {userStats.kanjiMastered}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("profile.kanjiMastered")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {userStats.lessonsCompleted}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("profile.lessonsCompleted")}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {userStats.studyStreak}
              </div>
              <p className="text-sm text-muted-foreground">
                {t("profile.dayStreakLabel")}
              </p>
            </CardContent>
          </Card>
          {currentUser.posts !== undefined && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5" />
                  {currentUser.posts || 0}
                </div>
                <p className="text-sm text-muted-foreground">Posts</p>
              </CardContent>
            </Card>
          )}
          {currentUser.followers !== undefined && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                  <Users className="h-5 w-5" />
                  {Array.isArray(currentUser.followers)
                    ? currentUser.followers.length
                    : currentUser.followers || 0}
                </div>
                <p className="text-sm text-muted-foreground">Followers</p>
              </CardContent>
            </Card>
          )}
          {currentUser.following !== undefined && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2 flex items-center justify-center gap-2">
                  <Users className="h-5 w-5" />
                  {Array.isArray(currentUser.following)
                    ? currentUser.following.length
                    : currentUser.following || 0}
                </div>
                <p className="text-sm text-muted-foreground">Following</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t("profile.overview")}</TabsTrigger>
            <TabsTrigger value="courses">{t("profile.courses")}</TabsTrigger>
            <TabsTrigger value="achievements">
              {t("profile.achievements")}
            </TabsTrigger>
            <TabsTrigger value="progress">{t("profile.progress")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Study Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    {t("profile.thisWeekStudyTime")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {weeklyProgress.map(
                      (day: { day: string; hours: number }) => (
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
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    {t("profile.recentAchievements")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {achievements
                      .filter((a: any) => a.earned)
                      .slice(0, 3)
                      .map((achievement: any) => (
                        <div
                          key={achievement.id}
                          className="flex items-center gap-3"
                        >
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {t(achievement.title)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {achievement.earnedDate}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-200"
                          >
                            {t("profile.earned")}
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
                  {t("profile.enrolledCourses")}
                </CardTitle>
                <CardDescription>
                  {t("profile.enrolledCourses.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enrolledCourses.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>
                      No courses enrolled yet. Start learning to see your
                      progress!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enrolledCourses.map((course: any) => (
                      <Card
                        key={course.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={
                                  course.image ||
                                  "/images/placeholders/placeholder.svg"
                                }
                                alt={course.title}
                                fill
                                className="object-cover"
                                loading="lazy"
                                unoptimized
                              />
                            </div>
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
                                    : course.status === "in-progress"
                                    ? "In Progress"
                                    : "Not Started"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  {t("profile.achievementsAndBadges")}
                </CardTitle>
                <CardDescription>
                  {t("profile.achievements.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement: any) => (
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
                              {t(achievement.title)}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {achievement.description}
                            </p>
                            {achievement.earned ? (
                              <Badge
                                variant="outline"
                                className="text-green-600 border-green-200"
                              >
                                {t("profile.earned")} {achievement.earnedDate}
                              </Badge>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span>{t("common.progress")}</span>
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
                    {t("profile.learningGoals")}
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
                      <span className="text-sm">
                        {t("profile.goal.dailyStudy").replace("{hours}", "2")}
                      </span>
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">
                        {t("profile.goal.monthlyKanjiTarget").replace(
                          "{count}",
                          "50"
                        )}
                      </span>
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
                    {t("profile.studyInsights")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Most active day</span>
                    <span className="font-medium">
                      {insights.mostActiveDay}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Average session</span>
                    <span className="font-medium">
                      {insights.averageSession}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Favorite category</span>
                    <span className="font-medium">
                      {insights.favoriteCategory}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Next milestone</span>
                    <span className="font-medium">
                      {insights.nextMilestone}
                    </span>
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

export default withAuth(ProfilePage);
