import React from 'react';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  author?: any;
  image?: string;
  views?: number;
  tags?: string[];
  publishedAt?: string;
  createdAt?: string;
}

interface Props {
  news: NewsItem;
}

export default function NewsDetail({ news }: Props) {
  if (!news) return null;

  // Helper: strip HTML and create a short lede (1-2 lines)
  const stripHtml = (html: string = '') => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const lede = (html: string = '') => {
    const t = stripHtml(html);
    return t.length > 200 ? t.slice(0, 200).trim() + '...' : t;
  };

  return (
    <div className="flex-1">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight text-foreground">{news.title}</h1>

          {/* Short lede shown under title (keeps text-first layout) */}
          <p className="text-lg text-muted-foreground mb-4">{lede(news.content)}</p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
            {news.author?.avatar ? (
              <div className="flex items-center gap-2">
                <img src={news.author.avatar} alt={news.author.fullname} className="w-10 h-10 rounded-full" />
                <span className="font-medium text-foreground">{news.author?.fullname || 'Admin'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">{(news.author?.fullname || 'A')[0]?.toUpperCase()}</span>
                </div>
                <span className="font-medium text-foreground">{news.author?.fullname || 'Admin'}</span>
              </div>
            )}

            <span>{new Date(news.publishedAt || news.createdAt || '').toLocaleDateString('vi-VN')}</span>
            {news.views && <span className="flex items-center gap-1">👁️ {news.views} lượt xem</span>}
          </div>

          {news.tags && news.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {news.tags.map((tag, i) => (
                <span key={i} className="text-sm px-3 py-1 bg-primary/5 border-primary/20 rounded">🏷️ {tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Featured image - aspect-ratio 16:9, max-height, object-fit:cover */}
        {news.image && (
          <div className="w-full aspect-video max-h-[60vh] overflow-hidden rounded-lg bg-muted mb-8">
            <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Article body (prose will follow the container width so text has comfortable line length) */}
        <article className="prose prose-lg dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: news.content }} />
        </article>
      </div>
    </div>
  );
}
