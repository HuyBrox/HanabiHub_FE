"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, Reply, MoreVertical } from "lucide-react";
import {
  useToggleLikeCommentMutation,
  useDeleteCommentMutation,
} from "@/store/services/commentApi";
import { Comment, User } from "@/types/post";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale/vi";
import CommentForm from "./CommentForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useGetCurrentUserQuery } from "@/store/services/authApi";

interface CommentItemProps {
  comment: Comment;
  postId: string;
  depth?: number;
}

export default function CommentItem({
  comment,
  postId,
  depth = 0,
}: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [toggleLike] = useToggleLikeCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const { data: currentUser } = useGetCurrentUserQuery();
  const currentUserId = (currentUser?.data as any)?._id;

  const author = typeof comment.author === "string" ? null : comment.author;
  const isLiked = Array.isArray(comment.likes)
    ? comment.likes.includes(currentUserId)
    : false;
  const likesCount = Array.isArray(comment.likes) ? comment.likes.length : 0;

  const handleLike = async () => {
    try {
      await toggleLike(comment._id).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;

    try {
      await deleteComment({
        id: comment._id,
        targetId: postId,
      }).unwrap();
      toast.success("Đã xóa bình luận");
    } catch (error: any) {
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  const isAuthor = author?._id === currentUserId;

  return (
    <div className={`${depth > 0 ? "ml-8 mt-3" : "mt-4"}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={author?.avatar} />
          <AvatarFallback>{author?.fullname?.[0] || "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">
              {author?.fullname || author?.username || "Unknown"}
            </span>
            {comment.createdAt && (
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: vi,
                })}
              </span>
            )}
            {isAuthor && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleDelete}>
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <p className="text-sm mb-2">{comment.text}</p>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 ${
                isLiked ? "text-primary" : ""
              }`}
              onClick={handleLike}
            >
              <Heart
                className={`h-4 w-4 mr-1 ${isLiked ? "fill-current" : ""}`}
              />
              {likesCount}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => setShowReply(!showReply)}
            >
              <Reply className="h-4 w-4 mr-1" />
              Trả lời
            </Button>
          </div>
          {showReply && (
            <CommentForm
              postId={postId}
              parentId={comment._id}
              onSuccess={() => setShowReply(false)}
              placeholder="Viết phản hồi..."
            />
          )}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply._id}
                  comment={reply}
                  postId={postId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

