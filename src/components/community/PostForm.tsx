"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon, X } from "lucide-react";
import { useCreatePostMutation } from "@/store/services/postApi";
import { toast } from "sonner";
import { useGetCurrentUserQuery } from "@/store/services/authApi";

export default function PostForm() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [createPost, { isLoading }] = useCreatePostMutation();
  const { data: currentUser } = useGetCurrentUserQuery();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      toast.error("Tối đa 10 hình ảnh");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    URL.revokeObjectURL(imagePreviews[index]);
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      toast.error("Vui lòng nhập nội dung hoặc chọn hình ảnh");
      return;
    }

    try {
      await createPost({
        caption: content,
        desc: content,
        images: images.length > 0 ? images : undefined,
      }).unwrap();

      setContent("");
      setImages([]);
      setImagePreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success("Đăng bài thành công");
    } catch (error: any) {
      toast.error(error?.data?.message || "Có lỗi xảy ra");
    }
  };

  if (!currentUser?.data) {
    return null;
  }

  return (
    <div className="bg-card rounded-lg border p-4 mb-6">
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage
            src={
              (currentUser?.data as any)?.avatar ||
              "/anime-style-avatar-user.png"
            }
          />
          <AvatarFallback>
            {(currentUser?.data as any)?.fullname?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Chia sẻ hành trình học tiếng Nhật của bạn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] resize-none border-0 p-3 focus-visible:ring-0"
          />
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group h-32">
                  <Image
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                    loading="lazy"
                    unoptimized
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 10}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Hình ảnh
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              className="bg-primary hover:bg-primary/90"
              disabled={(!content.trim() && images.length === 0) || isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? "Đang đăng..." : "Đăng"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

