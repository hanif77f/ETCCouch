"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import ResultRow from "./ResultRow";

const UNIT_OPTIONS = [
  { value: "auto", label: "Auto-detect" },
  { value: "seconds", label: "Seconds" },
  { value: "ms", label: "Milliseconds" },
];

// 10-digit timestamps (~1.7e9 today) are seconds; 13-digit ones (~1.7e12)
// are milliseconds. 1e11 sits cleanly between the two, so it's a safe cutoff
// for "auto" mode.
const MS_CUTOFF = 1e11;

function toMs(raw, unit) {
  const trimmed = raw.trim();
  if (!trimmed) return { ms: null, error: null };
  const num = Number(trimmed);
  if (!Number.isFinite(num)) return { ms: null, error: "Not a valid number." };

  let ms;
  if (unit === "seconds") ms = num * 1000;
  else if (unit === "ms") ms = num;
  else ms = Math.abs(num) > MS_CUTOFF ? num : num * 1000;

  if (Number.isNaN(new Date(ms).getTime())) return { ms: null, error: "That value is out of range." };
  return { ms, error: null };
}

function formatRelative(ms) {
  const diffSeconds = (ms - Date.now()) / 1000;
  const abs = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];
  for (const [unit, secs] of units) {
    if (abs >= secs || unit === "second") return rtf.format(Math.round(diffSeconds / secs), unit);
  }
  return rtf.format(0, "second");
}

/** Local `datetime-local` input value (with seconds) for a Date, e.g. for prefilling "now". */
function toDateTimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

const inputClass =
  "min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 font-mono text-sm text-fg placeholder:text-muted focus-ring";
const selectClass = "rounded-lg border border-border bg-surface px-2.5 py-2.5 text-sm text-fg focus-ring";

/**
 * The interactive part of the epoch converter — everything around it (hero,
 * FAQ, breadcrumb) is static and server-rendered in the page itself.
 */
export default function EpochConverterTool() {
  // Starts null so the server-rendered markup and first client render match;
  // the live clock only starts ticking after mount.
  const [now, setNow] = useState(null);
  const [tsInput, setTsInput] = useState("");
  const [unit, setUnit] = useState("auto");
  const [dateInput, setDateInput] = useState("");
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { ms: tsMs, error: tsError } = toMs(tsInput, unit);
  const tsDate = tsMs !== null ? new Date(tsMs) : null;

  const dateMs = dateInput ? new Date(dateInput).getTime() : NaN;
  const dateValid = Boolean(dateInput) && !Number.isNaN(dateMs);

  function copy(key, value) {
    if (!value || !navigator.clipboard) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    });
  }

  function useCurrentTimestamp() {
    setTsInput(String(Math.floor(Date.now() / 1000)));
    setUnit("seconds");
  }

  function useCurrentDate() {
    setDateInput(toDateTimeLocalValue(new Date()));
  }

  return (
    <div>
      {/* Solid dark plate (not the translucent `.lcd-plate`, which is tuned
          for the colorful board stage and washes out on this light page) —
          deep plum background with bright lavender text for real contrast. */}
      <div className="inline-flex w-fit items-center gap-2 rounded-md bg-fg px-3 py-1.5 text-xs shadow-soft">
        <span className="font-mono tracking-wider text-accent-soft">
          Current Unix time — {now !== null ? Math.floor(now / 1000) : "—"}
        </span>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {/* Timestamp -> Date */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Timestamp → Date</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Paste a Unix timestamp — seconds or milliseconds, auto-detected.
          </p>

          <div className="mt-4 flex gap-2">
            <input
              className={inputClass}
              type="text"
              inputMode="numeric"
              placeholder="e.g. 1757001234"
              value={tsInput}
              onChange={(e) => setTsInput(e.target.value)}
              aria-label="Unix timestamp"
            />
            <select
              className={selectClass}
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              aria-label="Timestamp unit"
            >
              {UNIT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={useCurrentTimestamp}>
            Use current time
          </Button>

          <div className="mt-5 space-y-2.5">
            {tsError ? (
              <p className="text-sm italic text-muted">{tsError}</p>
            ) : tsDate ? (
              <>
                <ResultRow
                  label="Local time"
                  value={tsDate.toLocaleString(undefined, { dateStyle: "full", timeStyle: "long" })}
                  copyKey="local"
                  copied={copied}
                  onCopy={copy}
                />
                <ResultRow label="UTC" value={tsDate.toUTCString()} copyKey="utc" copied={copied} onCopy={copy} />
                <ResultRow label="ISO 8601" value={tsDate.toISOString()} copyKey="iso" copied={copied} onCopy={copy} />
                <ResultRow
                  label="Relative"
                  value={formatRelative(tsMs)}
                  copyKey="relative"
                  copied={copied}
                  onCopy={copy}
                />
              </>
            ) : (
              <p className="text-sm italic text-muted">Enter a timestamp above to convert it.</p>
            )}
          </div>
        </section>

        {/* Date -> Timestamp */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6">
          <h2 className="font-display text-xl font-semibold tracking-tight text-fg">Date → Timestamp</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">Pick a date and time in your local timezone.</p>

          <div className="mt-4 flex gap-2">
            <input
              className={inputClass}
              type="datetime-local"
              step="1"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              aria-label="Date and time"
            />
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={useCurrentDate}>
            Use now
          </Button>

          <div className="mt-5 space-y-2.5">
            {dateValid ? (
              <>
                <ResultRow
                  label="Seconds"
                  value={String(Math.floor(dateMs / 1000))}
                  copyKey="sec"
                  copied={copied}
                  onCopy={copy}
                />
                <ResultRow label="Milliseconds" value={String(dateMs)} copyKey="ms" copied={copied} onCopy={copy} />
                <ResultRow
                  label="ISO 8601"
                  value={new Date(dateMs).toISOString()}
                  copyKey="iso2"
                  copied={copied}
                  onCopy={copy}
                />
              </>
            ) : (
              <p className="text-sm italic text-muted">Pick a date above to convert it.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
