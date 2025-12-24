"use client";

type Props = {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
};

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (!totalPages || totalPages <= 1) return null;

  const go = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    onPageChange(p);
  };

  // tạo dải trang gọn gàng: 1 ... (p-1) p (p+1) ... total
  const pages: (number | string)[] = [];
  const push = (x: number | string) => pages.push(x);

  const window = 1; // hiển thị hàng xóm ±1
  const start = Math.max(1, page - window);
  const end = Math.min(totalPages, page + window);

  if (start > 1) {
    push(1);
    if (start > 2) push("…");
  }
  for (let i = start; i <= end; i++) push(i);
  if (end < totalPages) {
    if (end < totalPages - 1) push("…");
    push(totalPages);
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      {/* Prev button */}
      <button
        onClick={() => go(page - 1)}
        className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50/95 hover:shadow-md disabled:opacity-40 disabled:shadow-none disabled:hover:bg-white/90"
        disabled={page <= 1}
      >
        <span className="text-sm">←</span>
        <span>Trước</span>
      </button>

      {/* Pages */}
      <div className="flex items-center gap-1 rounded-full bg-slate-50/80 px-2 py-1 shadow-sm">
        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <button
              key={idx}
              onClick={() => go(p)}
              className={
                "h-9 w-9 min-w-[2.25rem] rounded-full px-0 text-sm font-semibold transition-all " +
                (p === page
                  ? "bg-slate-900 text-white shadow-md scale-105"
                  : "bg-white/90 text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50/95")
              }
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="px-2 text-slate-400 text-sm select-none">
              {p}
            </span>
          )
        )}
      </div>

      {/* Next + info */}
      <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-500">
        <span className="hidden sm:inline">
          Trang <span className="font-semibold text-slate-800">{page}</span> /{" "}
          {totalPages}
        </span>
        <button
          onClick={() => go(page + 1)}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/90 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50/95 hover:shadow-md disabled:opacity-40 disabled:shadow-none disabled:hover:bg-white/90"
          disabled={page >= totalPages}
        >
          <span>Sau</span>
          <span className="text-sm">→</span>
        </button>
      </div>
    </div>
  );
}
