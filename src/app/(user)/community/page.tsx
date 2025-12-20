"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share } from "lucide-react";
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
      <div className="flex-1 max-w-3xl mx-auto p-6">
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
                              <div className="relative w-full" style={{ maxHeight: '384px' }}>
                                <Image
                                  src={post.images[0]}
                                  alt="Post"
                                  width={800}
                                  height={600}
                                  className="rounded-lg max-w-full h-auto max-h-96 object-cover"
                                  loading="lazy"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <Carousel className="w-full">
                                <CarouselContent>
                                  {post.images.map((image, index) => (
                                    <CarouselItem key={index}>
                                      <div className="relative w-full" style={{ maxHeight: '384px' }}>
                                        <Image
                                          src={image}
                                          alt={`Post ${index + 1}`}
                                          width={800}
                                          height={600}
                                          className="rounded-lg w-full h-auto max-h-96 object-cover"
                                          loading="lazy"
                                          unoptimized
                                        />
                                      </div>
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

      <PostModal
        post={selectedPost}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}

export default CommunityPage;
