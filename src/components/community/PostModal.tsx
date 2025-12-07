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
      <DialogContent style={{ maxWidth: '900px', width: '100%' }} className="max-h-[90vh] p-0 flex flex-col bg-[#18191a] text-white">
        {/* Header cố định chỉ để avatar */}
        <DialogHeader className="p-4 border-b border-[#3a3b3c] flex items-left gap-1">
          <Avatar>
            <AvatarImage src={author?.avatar} />
            <AvatarFallback>{author?.fullname?.[0] || author?.username?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <DialogTitle className="text-base font-semibold leading-tight text-white">
              {author?.fullname || author?.username || "Unknown"}
            </DialogTitle>
            {displayPost.createdAt && (
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(displayPost.createdAt), { addSuffix: true, locale: vi })}
              </p>
            )}
          </div>
        </DialogHeader>

        {/* Container cuộn chính */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4">
          {/* Caption + nút xóa sát phải */}
          <div className="flex justify-between items-start">
            <p className="text-sm leading-relaxed text-gray-200 whitespace-pre-wrap flex-1">
              {displayPost.caption || displayPost.desc}
            </p>
            {isAuthor && (
              <button
                onClick={handleDeletePost}
                className="ml-2 text-gray-400 hover:text-red-500 flex-shrink-0"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Images */}
          {displayPost.images && displayPost.images.length > 0 && (
            <div className="rounded-lg overflow-hidden bg-black">
              <Carousel className="w-full">
                <CarouselContent>
                  {displayPost.images.map((image, index) => (
                    <CarouselItem key={index} className="flex justify-center">
                      <img
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="max-h-[60vh] w-full object-contain"
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

          {/* Likes + comment count */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-orange-500 fill-orange-500" />
              <span>{likesCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{comments.length} bình luận</span>
            </div>
          </div>

          {/* Action buttons nằm trong scroll */}
          <div className="flex gap-2 border-y border-[#3a3b3c] py-2 text-sm font-medium text-gray-300">
            <button
              onClick={handleLike}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 hover:bg-[#3a3b3c] ${isLiked ? "text-orange-500" : ""}`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? "fill-orange-500" : ""}`} />
              Thích
            </button>
            <div className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 hover:bg-[#3a3b3c]">
              <MessageCircle className="h-5 w-5" />
              Bình luận
            </div>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-md py-2 hover:bg-[#3a3b3c]">
              <Share className="h-5 w-5" />
              Chia sẻ
            </button>
          </div>

          {/* Comment list */}
          <div className="space-y-3">
            {commentsData === undefined || commentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full bg-[#3a3b3c]" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-28 bg-[#3a3b3c]" />
                      <Skeleton className="h-4 w-full bg-[#3a3b3c]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">Chưa có bình luận nào</p>
            ) : (
              comments.map((comment) => (
                <CommentItem key={comment._id} comment={comment} postId={displayPost._id} />
              ))
            )}
          </div>
        </div>

        {/* Input comment cố định dưới cùng */}
        <div className="border-t border-[#3a3b3c] bg-[#242526] p-3">
          <CommentForm postId={displayPost._id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
