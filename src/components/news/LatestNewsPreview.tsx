import React from 'react';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  image?: string;
  publishedAt?: string;
  createdAt?: string;
}

interface Props {
  recentNews: NewsItem[];
  loading?: boolean;
  onSelect: (newsId: string) => void;
  maxItems?: number;
}

export default function LatestNewsPreview({ recentNews, loading, onSelect, maxItems = 5 }: Props) {
  const excerpt = (html: string = '') => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > 140 ? text.substring(0, 140).trim() + '...' : text;
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (e) {
      return dateString;
    }
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground">Đang tải...</div>;

  if (!recentNews || recentNews.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="font-medium">Chưa có bài viết</p>
        <p className="text-sm text-muted-foreground">Hãy thử lại sau hoặc kiểm tra danh sách tin tức.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      {/* Grid: featured (first) + compact list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {recentNews.slice(0, maxItems).map((item, idx) => {
          // Featured first item
          if (idx === 0) {
            return (
              <article
                key={item._id}
                className="cursor-pointer border border-border rounded-lg overflow-hidden hover:shadow-sm transition bg-card lg:col-span-2"
                onClick={() => onSelect(item._id)}
              >
                <div className="p-4">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 line-clamp-2">{item.title}</h3>
                  {/* Lede (1-2 lines) */}
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{excerpt(item.content)}</p>
                  <div className="text-xs text-muted-foreground">{formatTime(item.publishedAt || item.createdAt)}</div>
                </div>
                <div className="w-full aspect-video overflow-hidden bg-muted">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-muted/60" />
                  )}
                </div>
              </article>
            );
          }

          // Compact variant for the rest
          return (
            <article
              key={item._id}
              className="cursor-pointer flex items-start gap-3 border border-border rounded-lg overflow-hidden hover:bg-muted transition bg-card p-3"
              onClick={() => onSelect(item._id)}
            >
              <div className="w-20 aspect-square rounded overflow-hidden bg-muted shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover object-center" />
                ) : (
                  <div className="w-full h-full bg-muted/60" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground line-clamp-2">{item.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{excerpt(item.content)}</p>
                <div className="text-xs text-muted-foreground mt-2">{formatTime(item.publishedAt || item.createdAt)}</div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
