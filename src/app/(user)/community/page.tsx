"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share, TrendingUp, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetAllPostsQuery, useToggleLikePostMutation, useDeletePostMutation } from "@/store/services/postApi";
import { Post, User } from "@/types/post";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale/vi";
import PostForm from "@/components/community/PostForm";
import PostModal from "@/components/community/PostModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCurrentUserQuery } from "@/store/services/authApi";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useSocketLikes } from "@/hooks/useSocketLikes";
import { useSocketPostDelete } from "@/hooks/useSocketPostDelete";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const trendingTopics = [
  { tag: "#JLPT2024", posts: 234 },
  { tag: "#KanjiOfTheDay", posts: 189 },
  { tag: "#StudyTips", posts: 156 },
  { tag: "#JapaneseGrammar", posts: 143 },
  { tag: "#AnimeJapanese", posts: 98 },
];

const friendSuggestions = [
  {
    name: "HiroshiSensei",
    avatar: "/anime-style-avatar-teacher.png",
    level: "Native",
    mutualFriends: 12,
  },
  {
    name: "MangaReader99",
    avatar: "/anime-style-avatar-boy-2.png",
    level: "N3",
    mutualFriends: 8,
  },
  {
    name: "TokyoLife",
    avatar: "/anime-style-avatar-woman-2.png",
    level: "N2",
    mutualFriends: 5,
  },
];

function CommunityPage() {
  const { data: posts = [], isLoading, refetch } = useGetAllPostsQuery();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toggleLike] = useToggleLikePostMutation();
  const [deletePost] = useDeletePostMutation();
  const { data: currentUser } = useGetCurrentUserQuery();
  const currentUserId = (currentUser?.data as any)?._id;
  const router = useRouter();

  useSocketLikes();
  useSocketPostDelete();

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    
    if (!currentUser?.data) {
      toast.error("Vui lòng đăng nhập để thích bài viết");
      router.push("/login");
      return;
    }

    try {
      await toggleLike(postId).unwrap();
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error("Vui lòng đăng nhập để thích bài viết");
        router.push("/login");
      } else {
        console.error("Error toggling like:", error);
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    try {
      await deletePost(postId).unwrap();
      toast.success("Đã xóa bài viết");
    } catch (error: any) {
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 max-w-2xl mx-auto p-6">
        {currentUser?.data && <PostForm />}

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-48 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Chưa có bài viết nào. Hãy là người đầu tiên đăng bài!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post: Post) => {
              const author = typeof post.author === "string" ? null : post.author;
              const isLiked = Array.isArray(post.likes)
                ? post.likes.includes(currentUserId)
                : false;
              const likesCount = Array.isArray(post.likes) ? post.likes.length : 0;
              const commentCount = post.commentCount || 0;

              return (
                <Card
                  key={post._id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handlePostClick(post)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={author?.avatar} />
                        <AvatarFallback>
                          {author?.fullname?.[0] || author?.username?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">
                            {author?.fullname || author?.username || "Unknown"}
                          </span>
                          {post.createdAt && (
                            <>
                              <span className="text-sm text-muted-foreground">•</span>
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(post.createdAt), {
                                  addSuffix: true,
                                  locale: vi,
                                })}
                              </span>
                            </>
                          )}
                          {author?._id === currentUserId && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-auto">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={(e) => handleDelete(e, post._id)} className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Xóa bài viết
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        {(post.caption || post.desc) && (
                          <p className="text-foreground mb-3 leading-relaxed">
                            {post.caption || post.desc}
                          </p>
                        )}
                        {post.images && post.images.length > 0 && (
                          <div className="mb-3">
                            {post.images.length === 1 ? (
                              <img
                                src={post.images[0]}
                                alt="Post"
                                className="rounded-lg max-w-full h-auto max-h-96 object-cover"
                              />
                            ) : (
                              <Carousel className="w-full">
                                <CarouselContent>
                                  {post.images.map((image, index) => (
                                    <CarouselItem key={index}>
                                      <img
                                        src={image}
                                        alt={`Post ${index + 1}`}
                                        className="rounded-lg w-full h-auto max-h-96 object-cover"
                                      />
                                    </CarouselItem>
                                  ))}
                                </CarouselContent>
                              </Carousel>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "p-0 h-auto hover:text-primary",
                              isLiked && "text-primary"
                            )}
                            onClick={(e) => handleLike(e, post._id)}
                          >
                            <Heart
                              className={cn(
                                "h-4 w-4 mr-1",
                                isLiked && "fill-current"
                              )}
                            />
                            {likesCount}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePostClick(post);
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {commentCount}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-auto hover:text-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Share className="h-4 w-4 mr-1" />
                            Chia sẻ
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <div className="w-80 p-6 space-y-6 hidden lg:block">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-lg font-semibold mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              Trending Topics
            </div>
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div
                  key={topic.tag}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-primary hover:underline cursor-pointer">
                      {topic.tag}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {topic.posts} posts
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-lg font-semibold mb-4">
              <UserPlus className="h-5 w-5 text-primary" />
              People to Follow
            </div>
            <div className="space-y-4">
              {friendSuggestions.map((friend) => (
                <div key={friend.name} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={friend.avatar} />
                    <AvatarFallback>{friend.name?.[0] ?? "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{friend.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {friend.mutualFriends} mutual friends
                    </p>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <PostModal
        post={selectedPost}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}

export default CommunityPage;
