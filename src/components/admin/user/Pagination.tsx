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
    <div className="mt-6 flex items-center justify-between gap-3">
      <button
        onClick={() => go(page - 1)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        disabled={page <= 1}
      >
        ← Trước
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          typeof p === "number" ? (
            <button
              key={idx}
              onClick={() => go(p)}
              className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold ${
                p === page
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="px-2 text-slate-500">
              {p}
            </span>
          )
        )}
      </div>

      <button
        onClick={() => go(page + 1)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        disabled={page >= totalPages}
      >
        Sau →
      </button>
    </div>
  );
}
