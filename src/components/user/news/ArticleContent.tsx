"use client";

interface ArticleContentProps {
  content: string;
  image?: string;
  imageCaption?: string;
}

export function ArticleContent({
  content,
  image,
  imageCaption,
}: ArticleContentProps) {
  return (
    <div className="space-y-8">
      {/* Featured Image */}
      {image && (
        <div className="w-full overflow-hidden rounded-xl shadow-lg">
          <img
            src={image}
            alt="Featured"
            className="w-full h-auto object-cover"
          />
          {imageCaption && (
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
              <p className="text-sm text-gray-600 italic text-center">
                {imageCaption}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-lg max-w-none
          prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-10 prose-headings:mb-6
          prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-5 prose-p:text-base prose-p:text-[17px]
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium
          prose-strong:text-gray-900 prose-strong:font-semibold
          prose-code:text-pink-600 prose-code:bg-pink-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
          prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
          prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8 prose-img:w-full prose-img:h-auto prose-img:border prose-img:border-gray-200
          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-6 prose-blockquote:rounded-r-lg
          prose-blockquote:italic prose-blockquote:text-gray-700
          prose-ul:list-disc prose-ul:pl-6 prose-ul:my-5
          prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-5
          prose-li:text-gray-700 prose-li:mb-2 prose-li:leading-relaxed
          prose-hr:border-gray-300 prose-hr:my-8
          prose-table:w-full prose-table:border-collapse prose-table:my-6
          prose-th:bg-gray-100 prose-th:font-semibold prose-th:p-3 prose-th:text-left prose-th:border prose-th:border-gray-300
          prose-td:p-3 prose-td:border prose-td:border-gray-300
        "
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

