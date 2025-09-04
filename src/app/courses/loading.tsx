export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="animate-pulse space-y-6">
        <div className="h-56 bg-gray-200 rounded-lg dark:bg-neutral-800" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-6 w-3/5 bg-gray-200 rounded" />
            <div className="h-4 w-2/3 bg-gray-200 rounded" />
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="h-24 bg-gray-200 rounded" />
              <div className="h-24 bg-gray-200 rounded" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          </div>
          <aside className="space-y-4">
            <div className="h-40 bg-gray-200 rounded" />
            <div className="h-24 bg-gray-200 rounded" />
          </aside>
        </div>
      </div>
    </div>
  );
}
