"use client";

import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, User, Tag as TagIcon } from "lucide-react";
// Helper function
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface NewsPreviewProps {
  title: string;
  lede: string;
  content: string;
  image?: string | null;
  imageCaption?: string;
  tags: string[];
  publishedAt: Date | null;
  author?: {
    fullname?: string;
    username?: string;
    avatar?: string;
  };
}

export function NewsPreview({
  title,
  lede,
  content,
  image,
  imageCaption,
  tags,
  publishedAt,
  author,
}: NewsPreviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      {/* Featured Image */}
      {image && (
        <div className="w-full h-80 overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          {imageCaption && (
            <div className="bg-black/50 text-white text-sm px-4 py-2">
              {imageCaption}
            </div>
          )}
        </div>
      )}

      <div className="p-8 md:p-12">
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {title || "Tiêu đề bài viết"}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
          {author?.avatar ? (
            <div className="flex items-center gap-2">
              <img
                src={author.avatar}
                alt={author.fullname || "Admin"}
                className="w-10 h-10 rounded-full"
              />
              <span className="font-medium text-gray-700">
                {author.fullname || author.username || "Admin"}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-700">
                {author?.fullname || author?.username || "Admin"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>
              {publishedAt 
                ? formatDate(publishedAt.toISOString())
                : "Ngay bây giờ"}
            </span>
          </div>
        </div>

        {/* Lede - Summary */}
        {lede && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6 mb-8">
            <p className="text-lg text-gray-800 leading-relaxed font-medium">
              {lede}
            </p>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <TagIcon className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none
            prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
            prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
            prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:w-full prose-img:h-auto
            prose-blockquote:border-l-4 prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-6 prose-blockquote:rounded-r-lg
            prose-blockquote:italic prose-blockquote:text-gray-700
            prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4
            prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-4
            prose-li:text-gray-700 prose-li:mb-2 prose-li:leading-relaxed
            prose-hr:border-gray-300 prose-hr:my-8
            prose-table:w-full prose-table:border-collapse prose-table:my-6
            prose-th:bg-gray-100 prose-th:font-semibold prose-th:p-3 prose-th:text-left prose-th:border prose-th:border-gray-300
            prose-td:p-3 prose-td:border prose-td:border-gray-300
          "
          dangerouslySetInnerHTML={{ __html: content || "<p class='text-gray-500 italic'>Nội dung bài viết sẽ hiển thị ở đây...</p>" }}
        />
      </div>
    </div>
  );
}

