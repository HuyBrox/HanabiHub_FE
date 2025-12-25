"use client";

import { useEffect, useState } from "react";
import { Newspaper, Eye, Calendar, User, Search, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/notification/NotificationProvider";

interface NewsItem {
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

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { error } = useNotification();

  const limit = 10;

  const fetchNews = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchQuery) {
        queryParams.append("search", searchQuery);
      }

      const response = await fetch(
        `http://localhost:8080/api/v1/news/public?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }

      const data = await response.json();

      if (data.success && data.data?.items) {
        setNewsList(data.data.items);
        setTotal(data.data.total);
      }
    } catch (err) {
      console.error("Error fetching news:", err);
      error("Không thể tải tin tức");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchNews();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getExcerpt = (html: string, maxLength: number = 200) => {
    // Strip HTML tags
    const text = html.replace(/<[^>]*>/g, "");
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Newspaper className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tin Tức</h1>
              <p className="text-muted-foreground">
                Cập nhật kiến thức và thông tin mới nhất về học tiếng Nhật
              </p>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-input text-foreground"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-95 transition font-medium"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* News List */}
        {loading ? (
          <div className="bg-card rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Đang tải tin tức...</p>
          </div>
        ) : newsList.length === 0 ? (
          <div className="bg-card rounded-lg shadow-sm p-12 text-center">
            <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Không có tin tức
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Không tìm thấy tin tức phù hợp với từ khóa"
                : "Chưa có tin tức nào được xuất bản"}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {newsList.map((news, index) => (
              <article
                key={news._id}
                onClick={() => router.push(`/news/${news._id}`)}
                className="bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer border border-border group"
              >
                <div className="flex flex-col md:flex-row md:items-stretch">
                  {/* Featured Image */}
                  {news.image && (
                    <div className="md:w-1/3 w-full h-56 md:h-auto overflow-hidden bg-muted">
                      <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className={`flex-1 p-6 ${news.image ? 'md:p-8' : 'p-8'}`}>
                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors leading-tight">
                      {news.title}
                    </h2>

                    {/* Excerpt - Render HTML content properly */}
                    <div 
                      className="text-muted-foreground mb-5 line-clamp-3 prose prose-sm max-w-none
                        prose-headings:text-foreground
                        prose-p:text-muted-foreground prose-p:mb-2
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-foreground
                        prose-img:rounded-lg prose-img:shadow-md
                        prose-ul:list-disc prose-ol:list-decimal
                        prose-li:text-muted-foreground"
                      dangerouslySetInnerHTML={{ 
                        __html: news.content.length > 300 
                          ? news.content.substring(0, 300) + '...' 
                          : news.content 
                      }}
                    />

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        {news.author?.avatar ? (
                          <img
                            src={news.author.avatar}
                            alt={news.author.fullname}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <span className="font-medium text-foreground">{news.author?.fullname || "Admin"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(news.publishedAt || news.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{news.views || 0} lượt xem</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {news.tags && news.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {news.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary/5 text-primary rounded-full text-xs font-medium hover:bg-primary/10 transition-colors"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && newsList.length > 0 && (
          <div className="mt-8 flex items-center justify-between bg-card rounded-lg shadow-sm p-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {(page - 1) * limit + 1} -{" "}
              {Math.min(page * limit, total)} / {total} tin tức
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Trước
              </button>
              <span className="px-4 py-2 text-sm font-medium text-muted-foreground">
                Trang {page} / {Math.ceil(total / limit)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * limit >= total}
                className="px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

