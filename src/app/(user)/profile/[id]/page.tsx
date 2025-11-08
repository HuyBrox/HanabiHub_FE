"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { withAuth } from "@/components/auth";
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
  UserPlus,
  UserMinus,
  MessageCircle,
} from "lucide-react";
import {
  useGetUserProfileByIdQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
} from "@/store/services/userApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useGetCurrentUserQuery } from "@/store/services/authApi";
import Link from "next/link";

function OtherUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { isAuthenticated, isInitialized, user: currentUser } = useSelector(
    (state: RootState) => state.auth
  );

  const shouldSkip = !isAuthenticated || !isInitialized || !userId;

  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useGetUserProfileByIdQuery(userId, {
    skip: shouldSkip,
  });

  const [followUser, { isLoading: isFollowingUser }] =
    useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowingUser }] =
    useUnfollowUserMutation();

  const user = (userData as any)?.data || null;
  const isOwnProfile = user?.isOwnProfile || false;
  const isFollowing = user?.isFollowing || false;
  const isFriend = user?.isFriend || false;
  const canViewPosts = user?.canViewPosts ?? true;
  const canMessage = user?.canMessage || false;
  const isPrivate = user?.isPrivate || false;

  const handleFollow = async () => {
    try {
      await followUser({ userId }).unwrap();
      refetch();
    } catch (error: any) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowUser({ userId }).unwrap();
      refetch();
    } catch (error: any) {
      console.error("Error unfollowing user:", error);
    }
  };

  const isTogglingFollow = isFollowingUser || isUnfollowingUser;

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

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-destructive">Không tìm thấy người dùng</p>
          <Button onClick={() => router.back()}>Quay lại</Button>
        </div>
      </div>
    );
  }

  // Nếu là profile của chính mình, redirect về /profile
  if (isOwnProfile) {
    router.push("/profile");
    return null;
  }

  const followersCount = user.followersCount || 0;
  const followingCount = user.followingCount || 0;
  const postsCount = user.posts || 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={user.avatar || "/images/placeholders/placeholder.svg"}
                />
                <AvatarFallback className="text-2xl">
                  {user.fullname?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-bold">{user.fullname}</h1>
                    <p className="text-muted-foreground">@{user.username}</p>
                    {user.bio && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {user.bio}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {user.level && (
                      <Badge
                        variant="default"
                        className="bg-primary text-primary-foreground"
                      >
                        JLPT {user.level}
                      </Badge>
                    )}
                    {isFriend && (
                      <Badge variant="default" className="bg-blue-500">
                        👥 Bạn bè
                      </Badge>
                    )}
                    {isPrivate && (
                      <Badge variant="outline" className="border-yellow-500">
                        🔒 Private
                      </Badge>
                    )}
                    {user.isOnline !== undefined && (
                      <Badge
                        variant={user.isOnline ? "default" : "outline"}
                        className={user.isOnline ? "bg-green-500" : ""}
                      >
                        {user.isOnline ? "🟢 Online" : "⚫ Offline"}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{postsCount}</div>
                      <div className="text-xs text-muted-foreground">Posts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{followersCount}</div>
                      <div className="text-xs text-muted-foreground">
                        Followers
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{followingCount}</div>
                      <div className="text-xs text-muted-foreground">
                        Following
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:ml-auto">
                    {isFollowing ? (
                      <Button
                        variant="outline"
                        onClick={handleUnfollow}
                        disabled={isTogglingFollow}
                        className="bg-background hover:bg-muted"
                      >
                        {isTogglingFollow ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Đang bỏ theo dõi...
                          </>
                        ) : (
                          <>
                            <UserMinus className="h-4 w-4 mr-2" />
                            Bỏ theo dõi
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        onClick={handleFollow}
                        disabled={isTogglingFollow}
                        className="bg-primary hover:bg-primary/90"
                      >
                        {isTogglingFollow ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Đang theo dõi...
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Theo dõi
                          </>
                        )}
                      </Button>
                    )}
                    {canMessage && (
                      <Button variant="outline" asChild>
                        <Link href={`/messages?userId=${userId}`}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Nhắn tin
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {postsCount}
              </div>
              <p className="text-sm text-muted-foreground">Posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {followersCount}
              </div>
              <p className="text-sm text-muted-foreground">Followers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {followingCount}
              </div>
              <p className="text-sm text-muted-foreground">Following</p>
            </CardContent>
          </Card>
          {user.level && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {user.level}
                </div>
                <p className="text-sm text-muted-foreground">JLPT Level</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Thông tin
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.level && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">JLPT Level</span>
                    <Badge variant="default">{user.level}</Badge>
                  </div>
                )}
                {user.gender && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Giới tính</span>
                    <span className="font-medium capitalize">{user.gender}</span>
                  </div>
                )}
                {user.createdAt && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Tham gia</span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
                {user.lastActiveAt && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Hoạt động lần cuối</span>
                    <span className="font-medium">
                      {new Date(user.lastActiveAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Posts
                </CardTitle>
                <CardDescription>
                  Danh sách bài viết của {user.fullname}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!canViewPosts ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-semibold mb-2">
                      {isPrivate
                        ? "Profile này là riêng tư"
                        : "Bạn cần follow để xem bài viết"}
                    </p>
                    <p className="text-sm">
                      {isPrivate
                        ? "Chỉ bạn bè mới có thể xem bài viết của người dùng này"
                        : "Hãy follow để xem bài viết"}
                    </p>
                  </div>
                ) : postsCount === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có bài viết nào</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Tính năng posts đang được phát triển</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default withAuth(OtherUserProfilePage);

