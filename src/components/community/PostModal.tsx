"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Post, User } from "@/types/post";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale/vi";
import { useGetCommentsByPostQuery } from "@/store/services/commentApi";
import { useToggleLikePostMutation, useGetPostByIdQuery } from "@/store/services/postApi";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCurrentUserQuery } from "@/store/services/authApi";
import { toast } from "sonner";
import { useSocketComments } from "@/hooks/useSocketComments";
import { useSocketLikes } from "@/hooks/useSocketLikes";
import { useSocketCommentDelete } from "@/hooks/useSocketCommentDelete";
import { useDeletePostMutation } from "@/store/services/postApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";

interface PostModalProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PostModal({
  post,
  open,
  onOpenChange,
}: PostModalProps) {
  const { data: commentsData, isLoading: commentsLoading } =
    useGetCommentsByPostQuery(post?._id || "", {
      skip: !post?._id,
    });
  const { data: updatedPost } = useGetPostByIdQuery(post?._id || "", {
    skip: !post?._id,
  });
  const [toggleLike] = useToggleLikePostMutation();
  const [deletePost] = useDeletePostMutation();
  const { data: currentUser } = useGetCurrentUserQuery();
  const currentUserId = (currentUser?.data as any)?._id;

  useSocketComments(post?._id);
  useSocketLikes(post?._id);
  useSocketCommentDelete(post?._id);

  if (!post) return null;

  const displayPost = updatedPost || post;
  const author = typeof displayPost.author === "string" ? null : displayPost.author;
  const isAuthor = author?._id === currentUserId;
  const isLiked = Array.isArray(displayPost.likes)
    ? displayPost.likes.includes(currentUserId)
    : false;
  const likesCount = Array.isArray(displayPost.likes) ? displayPost.likes.length : 0;
  const comments = commentsData || [];
  const getTotalCommentCount = (comments: Comment[]): number => {
    let count = comments.length;
    comments.forEach((comment) => {
      if (comment.replies && comment.replies.length > 0) {
        count += getTotalCommentCount(comment.replies);
      }
    });
    return count;
  };
  const commentCount = getTotalCommentCount(comments) || displayPost.commentCount || 0;

  const handleLike = async () => {
    try {
      await toggleLike(displayPost._id).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;

    try {
      await deletePost(displayPost._id).unwrap();
      toast.success("Đã xóa bài viết");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {displayPost.images && displayPost.images.length > 0 && (
            <div className="md:w-1/2 bg-black flex items-center justify-center min-h-0">
              <Carousel className="w-full h-full">
                <CarouselContent className="h-full">
                  {displayPost.images.map((image, index) => (
                    <CarouselItem key={index} className="h-full">
                      <img
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-full object-contain max-h-[90vh]"
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {displayPost.images.length > 1 && (
                  <>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>
                )}
              </Carousel>
            </div>
          )}
          <div
            className={`flex flex-col flex-1 min-h-0 ${
              displayPost.images && displayPost.images.length > 0 ? "md:w-1/2" : "w-full"
            }`}
          >
            <DialogHeader className="p-4 border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={author?.avatar} />
                  <AvatarFallback>
                    {author?.fullname?.[0] || author?.username?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <DialogTitle className="text-base font-semibold">
                    {author?.fullname || author?.username || "Unknown"}
                  </DialogTitle>
                  {displayPost.createdAt && (
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(displayPost.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </p>
                  )}
                </div>
                {isAuthor && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa bài viết
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4">
                <div className="mb-4">
                  {(displayPost.caption || displayPost.desc) && (
                    <p className="text-sm mb-4 whitespace-pre-wrap">
                      {displayPost.caption || displayPost.desc}
                    </p>
                  )}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground border-t border-b py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`p-0 h-auto ${
                        isLiked ? "text-primary" : ""
                      }`}
                      onClick={handleLike}
                    >
                      <Heart
                        className={`h-4 w-4 mr-1 ${
                          isLiked ? "fill-current" : ""
                        }`}
                      />
                      {likesCount}
                    </Button>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {commentCount}
                    </div>
                    <Button variant="ghost" size="sm" className="p-0 h-auto">
                      <Share className="h-4 w-4 mr-1" />
                      Chia sẻ
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">
                    Bình luận ({commentCount})
                  </h3>
                  {commentsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Chưa có bình luận nào
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <CommentItem
                        key={comment._id}
                        comment={comment}
                        postId={displayPost._id}
                      />
                    ))
                  )}
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 border-t flex-shrink-0">
              <CommentForm postId={displayPost._id} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

