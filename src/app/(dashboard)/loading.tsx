export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
      <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse"
          >
            <div className="h-44 bg-white/10" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-20 bg-white/10 rounded" />
              <div className="h-5 w-3/4 bg-white/10 rounded" />
              <div className="h-3 w-full bg-white/10 rounded" />
              <div className="h-1.5 w-full bg-white/10 rounded-full" />
              <div className="flex justify-between pt-3 border-t border-white/5">
                <div className="h-3 w-16 bg-white/10 rounded" />
                <div className="h-3 w-12 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
