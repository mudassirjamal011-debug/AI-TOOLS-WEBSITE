export default function Loading() {
  return (
    <div className="container-page py-16" aria-busy="true" aria-live="polite">
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="skeleton h-4 w-40" />
        <div className="skeleton h-10 w-2/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-64 w-full" />
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
