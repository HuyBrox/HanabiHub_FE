"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Eye, Calendar, User, Tag } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useNotification } from "@/components/notification/NotificationProvider";

interface NewsDetail {
  _id: string;
  title: string;
  content: string;
  image?: string;
  author: {
    _id: string;
    fullname: string;
    username: string;
    avatar?: string;
  };
  views: number;
  tags: string[];
  publishedAt: string;
  createdAt: string;
}

export default function NewsDetailPage() {
  const [news, setNews] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const { error } = useNotification();

  const newsId = params.id as string;

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8080/api/v1/news/public/${newsId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch news detail");
        }

        const data = await response.json();

        if (data.success && data.data) {
          setNews(data.data);
        }
      } catch (err) {
        console.error("Error fetching news detail:", err);
        error("Không thể tải tin tức");
      } finally {
        setLoading(false);
      }
    };

    if (newsId) {
      fetchNewsDetail();
    }
  }, [newsId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Đang tải tin tức...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Không tìm thấy tin tức
            </h3>
            <p className="text-gray-500 mb-6">
              Tin tức không tồn tại hoặc đã bị xóa
            </p>
            <button
              onClick={() => router.push("/news")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push("/news")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Quay lại danh sách tin tức</span>
        </button>

        {/* Article */}
        <article className="bg-card rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 md:p-12">
            {/* Title (text-first) */}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {news.title}
            </h1>

            {/* Short lede */}
            <p className="text-lg text-muted-foreground mb-4">{news.content ? news.content.replace(/<[^>]*>/g, '').slice(0, 220).trim() + (news.content.length > 220 ? '...' : '') : ''}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-2">
                {news.author?.avatar ? (
                  <img
                    src={news.author.avatar}
                    alt={news.author.fullname}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
                <span className="font-medium text-foreground">
                  {news.author?.fullname || "Admin"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(news.publishedAt || news.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{news.views} lượt xem</span>
              </div>
            </div>

            {/* Featured Image (aspect 16:9, max-height) */}
            {news.image && (
              <div className="w-full aspect-video max-h-[60vh] overflow-hidden bg-muted rounded-lg mb-8">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Tags */}
            {news.tags && news.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {news.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-primary/5 text-primary rounded-full text-sm font-medium"
                  >
                    <Tag className="w-4 h-4" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Content - Render TinyMCE HTML content properly */}
            <div
              className={`prose prose-lg dark:prose-invert prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:w-full`}
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </div>
        </article>

        {/* Related Actions */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/news")}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-95 transition font-medium"
          >
            Xem thêm tin tức khác
          </button>
        </div>
      </div>
        {/* Related Actions */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/news")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Xem thêm tin tức khác
          </button>
        </div>
      </div>
    </div>
  );
}

