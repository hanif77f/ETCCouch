"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const GAP = 22; // px gap between items (matches gap-5/xl:gap-6 average)

export default function CategoryNav({ items }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const moreRef = useRef(null);
  const wrapRef = useRef(null);

  // Start by assuming everything fits so the full link list is always present
  // in the server-rendered HTML (good for SEO / no-JS), then correct once we
  // can measure real widths in the browser.
  const [visibleCount, setVisibleCount] = useState(items.length);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const recalc = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerWidth = container.clientWidth;

    const widths = itemRefs.current.map((el) => (el ? el.offsetWidth : 0));
    const moreWidth = moreRef.current ? moreRef.current.offsetWidth : 90;

    const fullTotal = widths.reduce((sum, w) => sum + w + GAP, 0);

    if (fullTotal <= containerWidth) {
      setVisibleCount(items.length);
      return;
    }

    let total = moreWidth + GAP;
    let count = 0;
    for (let i = 0; i < widths.length; i += 1) {
      total += widths[i] + GAP;
      if (total > containerWidth) break;
      count = i + 1;
    }
    setVisibleCount(count);
  }, [items.length]);

  useLayoutEffect(() => {
    recalc();
  }, [recalc]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => recalc());
    ro.observe(container);
    window.addEventListener("resize", recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recalc);
    };
  }, [recalc]);

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const overflowCount = items.length - visibleCount;
  const hasOverflow = overflowCount > 0;
  const overflowHasActive = items
    .slice(visibleCount)
    .some((item) => pathname === item.href);

  return (
    <div ref={containerRef} className="relative min-w-0 flex-1">
      {/* Hidden measuring row: renders every item off-screen so we always know
          each one's real width, including items currently tucked into More.
          Clipped to a zero-size box (rather than putting overflow-hidden on
          the whole container above) so it can't widen the page's scroll
          area, while the "More" dropdown below — which also needs to escape
          this container's bounds — isn't clipped along with it. */}
      <div className="h-0 w-0 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none invisible absolute left-0 top-0 flex items-center whitespace-nowrap"
          style={{ gap: GAP }}
        >
          {items.map((item, i) => (
            <span
              key={item.href}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="text-[13px] font-semibold"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end" style={{ gap: GAP }}>
        {items.slice(0, visibleCount).map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`whitespace-nowrap text-[13px] font-semibold tracking-wide transition-colors hover:text-brand ${
                active ? "text-brand" : "text-ink/80"
              }`}
            >
              {item.label}
            </Link>
          );
        })}

        <div ref={wrapRef} className={`relative shrink-0 ${hasOverflow ? "" : "invisible w-0 overflow-hidden"}`}>
          <button
            ref={moreRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={open}
            className={`flex items-center gap-1 whitespace-nowrap text-[13px] font-semibold tracking-wide transition-colors hover:text-brand ${
              overflowHasActive ? "text-brand" : "text-ink/80"
            }`}
          >
            More
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div
            role="menu"
            className={`absolute right-0 top-full z-50 mt-3 w-64 max-h-[70vh] overflow-y-auto rounded-xl border border-black/5 bg-white py-2 shadow-xl ${
              open ? "" : "hidden"
            }`}
          >
            {items.slice(visibleCount).map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-brand-light/60 hover:text-brand ${
                    active ? "text-brand" : "text-ink/80"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
