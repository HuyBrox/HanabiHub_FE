"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCommentMutation } from "@/store/services/commentApi";
import { useGetCurrentUserQuery } from "@/store/services/authApi";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CommentFormProps {
  postId: string;
  parentId?: string | null;
  onSuccess?: () => void;
  placeholder?: string;
}

export default function CommentForm({
  postId,
  parentId = null,
  onSuccess,
  placeholder = "Viết bình luận...",
}: CommentFormProps) {
  const [text, setText] = useState("");
  const [createComment, { isLoading }] = useCreateCommentMutation();
  const { data: currentUser } = useGetCurrentUserQuery();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.data) {
      toast.error("Vui lòng đăng nhập để bình luận");
      router.push("/login");
      return;
    }

    if (!text.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    try {
      await createComment({
        text: text.trim(),
        targetId: postId,
        parentId,
      }).unwrap();

      setText("");
      onSuccess?.();
      toast.success("Bình luận thành công");
    } catch (error: any) {
      if (error?.status === 401) {
        toast.error("Vui lòng đăng nhập để bình luận");
        router.push("/login");
      } else {
        toast.error(error?.data?.message || "Có lỗi xảy ra");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-h-[60px] resize-none"
        disabled={isLoading}
        onFocus={() => {
          if (!currentUser?.data) {
            toast.error("Vui lòng đăng nhập để bình luận");
            router.push("/login");
          }
        }}
      />
      <Button
        type="submit"
        disabled={!text.trim() || isLoading || !currentUser?.data}
        className="self-end"
      >
        {isLoading ? "Đang gửi..." : "Gửi"}
      </Button>
    </form>
  );
}

