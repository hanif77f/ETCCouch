"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Mobile-only hamburger button + slide-in side drawer. Replaces the
// horizontal nav's overflow "More" dropdown on small screens, where there
// isn't enough room to show categories inline.
export default function MobileNavDrawer({ items }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // The overlay is portaled to <body> (see render below) because the header
  // it lives in uses `backdrop-blur`: any ancestor with a backdrop-filter,
  // filter, transform, perspective or will-change becomes the containing
  // block for `position: fixed` descendants, which traps the drawer inside
  // the header's small box instead of covering the viewport. Portaling
  // avoids that entirely. `mounted` just guards document access on the
  // server / before hydration.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while open, and let Escape close it.
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const overlay = (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[100] bg-black/40 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed inset-y-0 right-0 z-[110] flex h-dvh w-[82%] max-w-xs flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <span className="font-display text-lg font-bold text-ink">Menu</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-md text-ink/70 transition-colors hover:text-brand"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-3">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-4 py-3 text-sm font-semibold transition-colors ${
                  active ? "bg-brand-light/60 text-brand" : "text-ink/80 hover:bg-zinc-50 hover:text-brand"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-md text-ink/80 transition-colors hover:text-brand"
      >
        <Menu size={22} strokeWidth={2} />
      </button>

      {mounted ? createPortal(overlay, document.body) : null}
    </div>
  );
}
