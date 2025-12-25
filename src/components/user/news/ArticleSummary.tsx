"use client";

interface ArticleSummaryProps {
  lede: string;
}

export function ArticleSummary({ lede }: ArticleSummaryProps) {
  if (!lede) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-lg p-6 mb-8 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">💡</span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 uppercase tracking-wide">
            Tóm tắt nhanh
          </h3>
          <p className="text-lg text-gray-800 leading-relaxed font-medium">
            {lede}
          </p>
        </div>
      </div>
    </div>
  );
}

