export default function GameBoardSkeleton() {
  return (
    <div className="flex aspect-square w-full max-w-md items-center justify-center rounded-xl border border-border bg-card">
      <div className="flex flex-col items-center gap-3 text-muted">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        <span className="text-sm">Loading board…</span>
      </div>
    </div>
  );
}

