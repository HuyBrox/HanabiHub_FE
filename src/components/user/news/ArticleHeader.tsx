"use client";

import { User, Calendar, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ArticleHeaderProps {
  title: string;
  author?: {
    fullname?: string;
    username?: string;
    avatar?: string;
  };
  publishedAt: string;
  views?: number;
  tags?: string[];
}

export function ArticleHeader({
  title,
  author,
  publishedAt,
  views,
  tags,
}: ArticleHeaderProps) {
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

  return (
    <div className="mb-8">
      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
        {title}
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
          <span>{formatDate(publishedAt)}</span>
        </div>
        {views !== undefined && views > 0 && (
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{views} lượt xem</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
            >
              🏷️ {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

