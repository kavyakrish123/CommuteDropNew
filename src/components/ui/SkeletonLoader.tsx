export function RequestCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
      <div className="flex justify-between items-start mb-3">
        <div className="h-5 bg-gray-200 rounded w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-28 mb-4"></div>
      <div className="h-20 bg-gray-200 rounded mb-4"></div>
      <div className="flex justify-between items-center">
        <div className="h-6 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
}

export function RequestDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Timeline skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="h-6 bg-gray-200 rounded w-40"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-48 bg-gray-200 rounded"></div>
        <div className="h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <RequestCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

