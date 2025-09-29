import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        {/* Message list */}
        <div className="space-y-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`flex ${
                i % 2 === 0 ? "justify-end" : "justify-start"
              }`}
            >
              <Skeleton className="h-8 w-2/3 max-w-xs rounded-2xl" />
            </div>
          ))}
        </div>
        {/* Input */}
        <div className="flex items-center gap-2 mt-8">
          <Skeleton className="h-10 w-full rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
