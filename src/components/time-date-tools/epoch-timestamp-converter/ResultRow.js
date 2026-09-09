/**
 * One labelled output value with a copy-to-clipboard action. Uses plain
 * high-contrast ink rather than the site's `.lcd` glow style — `.lcd` is
 * tuned for the dark board stage and reads too faint on this light surface.
 */
export default function ResultRow({ label, value, copyKey, copied, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3.5 py-2.5">
      <div className="min-w-0">
        <div className="text-[0.7rem] font-medium uppercase tracking-wider text-muted">{label}</div>
        <div className="truncate font-mono text-sm text-fg">{value}</div>
      </div>
      <button
        type="button"
        onClick={() => onCopy(copyKey, value)}
        className="shrink-0 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted transition hover:border-accent/50 hover:text-fg focus-ring"
      >
        {copied === copyKey ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

