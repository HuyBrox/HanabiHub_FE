"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share, Trash2, MoreVertical } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Post, Comment } from "@/types/post";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale/vi";
import { useGetCommentsByPostQuery } from "@/store/services/commentApi";
import {
  useToggleLikePostMutation,
  useGetPostByIdQuery,
  useDeletePostMutation,
} from "@/store/services/postApi";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetCurrentUserQuery } from "@/store/services/authApi";
import { toast } from "sonner";
import { useSocketComments } from "@/hooks/useSocketComments";
import { useSocketLikes } from "@/hooks/useSocketLikes";
import { useSocketCommentDelete } from "@/hooks/useSocketCommentDelete";

interface PostModalProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PostModal({ post, open, onOpenChange }: PostModalProps) {
  const { data: commentsData, isLoading: commentsLoading } =
    useGetCommentsByPostQuery(post?._id || "", { skip: !post?._id });

  const { data: updatedPost } = useGetPostByIdQuery(post?._id || "", { skip: !post?._id });
  const [toggleLike] = useToggleLikePostMutation();
  const [deletePost] = useDeletePostMutation();
  const { data: currentUser } = useGetCurrentUserQuery();
  const currentUserId = (currentUser?.data as any)?._id;

  // Socket
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
  const comments = (commentsData as Comment[]) || [];

  const handleLike = async () => {
    try {
      await toggleLike(displayPost._id).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDeletePost = async () => {
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
      <DialogContent
        style={{ maxWidth: '900px', width: '100%' }}
        className="max-h-[90vh] p-0 flex flex-col bg-background text-foreground"
      >
        {/* Header cố định */}
        <DialogHeader className="p-4 md:p-5 border-b border-border flex items-center gap-3">
          <Avatar className="h-10 w-10 md:h-12 md:w-12">
            <AvatarImage src={author?.avatar} />
            <AvatarFallback className="bg-orange-500 text-white">
              {author?.fullname?.[0] || author?.username?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-base md:text-lg font-semibold leading-tight text-foreground">
              {author?.fullname || author?.username || "Unknown"}
            </DialogTitle>
            {displayPost.createdAt && (
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(displayPost.createdAt), { addSuffix: true, locale: vi })}
              </p>
            )}
          </div>
        </DialogHeader>

        {/* Container cuộn chính */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pt-4 md:pt-6 space-y-4 md:space-y-5">
          {/* Caption + nút xóa */}
          <div className="flex justify-between items-start gap-3">
            <p className="text-sm md:text-base leading-relaxed text-foreground whitespace-pre-wrap flex-1">
              {displayPost.caption || displayPost.desc}
            </p>
            {isAuthor && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDeletePost}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            )}
          </div>

          {/* Images */}
          {displayPost.images && displayPost.images.length > 0 && (
            <div className="rounded-lg overflow-hidden bg-muted/50">
              <Carousel className="w-full">
                <CarouselContent>
                  {displayPost.images.map((image, index) => (
                    <CarouselItem key={index} className="flex justify-center">
                      <div className="relative w-full" style={{ maxHeight: '60vh' }}>
                        <Image
                          src={image}
                          alt={`Post image ${index + 1}`}
                          width={800}
                          height={600}
                          className="max-h-[60vh] w-full object-contain"
                          loading="lazy"
                          unoptimized
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {displayPost.images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-2 bg-background/80 hover:bg-background border-border" />
                    <CarouselNext className="right-2 bg-background/80 hover:bg-background border-border" />
                  </>
                )}
              </Carousel>
            </div>
          )}

          {/* Likes + comment count */}
          <div className="flex items-center justify-between text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-orange-500 fill-orange-500" />
              <span className="font-medium">{likesCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="font-medium">{comments.length} bình luận</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-1 md:gap-2 border-y border-border py-2 text-sm font-medium">
            <Button
              variant="ghost"
              onClick={handleLike}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 h-auto hover:bg-muted transition-colors ${
                isLiked ? "text-orange-500 hover:text-orange-600" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-orange-500 text-orange-500" : ""}`} />
              Thích
            </Button>
            <Button
              variant="ghost"
              className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 h-auto text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Bình luận
            </Button>
            <Button
              variant="ghost"
              className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 h-auto text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Share className="h-5 w-5" />
              Chia sẻ
            </Button>
          </div>

          {/* Comment list */}
          <div className="space-y-3 md:space-y-4">
            {commentsData === undefined || commentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-28 md:w-32" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="py-8 md:py-10 text-center">
                <MessageCircle className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm md:text-base text-muted-foreground">Chưa có bình luận nào</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">Hãy là người đầu tiên bình luận!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <CommentItem key={comment._id} comment={comment} postId={displayPost._id} />
              ))
            )}
          </div>
        </div>

        {/* Input comment cố định dưới cùng */}
        <div className="border-t border-border bg-muted/30 p-3 md:p-4">
          <CommentForm postId={displayPost._id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
