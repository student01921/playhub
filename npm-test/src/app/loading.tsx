export default function Loading() {
  return (
    <div className="shell py-16" aria-busy="true" aria-label="Loading">
      <div className="h-4 w-28 animate-pulse rounded-full bg-forest/10" />
      <div className="mt-6 h-14 max-w-2xl animate-pulse rounded-2xl bg-forest/10" />
      <div className="mt-4 h-5 max-w-lg animate-pulse rounded-xl bg-forest/8" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="h-80 animate-pulse rounded-panel border border-line bg-white/40" />
        ))}
      </div>
    </div>
  );
}
