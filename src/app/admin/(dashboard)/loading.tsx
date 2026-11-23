export default function Loading() {
  return (
    <div className="space-y-6 animate-fade-in-fast">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-7 w-56" />
          <div className="skeleton h-3 w-40" />
        </div>
        <div className="skeleton h-9 w-36 rounded-xl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-4">
            <div className="flex justify-between">
              <div className="skeleton h-11 w-11 rounded-xl" />
              <div className="skeleton h-6 w-12 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-7 w-32" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2 space-y-4">
          <div className="skeleton h-6 w-48" />
          <div className="skeleton h-64 w-full" />
        </div>
        <div className="card p-5 space-y-4">
          <div className="skeleton h-6 w-32" />
          <div className="mx-auto skeleton h-48 w-48 rounded-full" />
        </div>
      </div>

      <div className="card p-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
