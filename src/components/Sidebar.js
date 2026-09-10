import Link from "next/link";
import { categories, getCategoryBySlug } from "@/data/categories";

export function PopularThisWeek({ blogs }) {
  return (
    <div className="rounded-xl bg-brand-light/60 p-5">
      <div className="mb-4 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--brand)">
          <path d="M12 2c1 3 2 4.2 4 6.2A7 7 0 1 1 8.4 6.8C9.7 5.4 11.4 4 12 2Z" />
        </svg>
        <h3 className="text-sm font-bold tracking-wide text-ink">POPULAR THIS WEEK</h3>
      </div>
      <ul className="space-y-4">
        {blogs.map((blog) => {
          const category = getCategoryBySlug(blog.category);
          return (
            <li key={blog.slug}>
              <Link href={`/blog/${blog.slug}`} className="group flex gap-3">
                <span
                  className="h-14 w-25 shrink-0 overflow-hidden rounded-md bg-cover bg-center"
                  style={{ backgroundImage: `url(${blog.image})` }}
                />
                <span className="flex flex-col">
                  <span className="line-clamp-2 text-[13px] font-semibold leading-5 text-ink group-hover:text-brand">
                    {blog.title}
                  </span>
                  <span className="mt-1 text-[11px] text-muted">
                    {category?.name} &middot;{" "}
                    {new Date(blog.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function StayConnected() {
  const icons = [
    {
      label: "Facebook",
      href: "https://www.facebook.com/EntertainmentCouch",
      path: "M13.5 9H15V6.5h-1.5C11.6 6.5 10 8.1 10 10.2V12H8v2.5h2V21h2.5v-6.5h2l.5-2.5h-2.5v-1.5c0-.6.4-1 1-1Z",
    },
    {
      label: "X",
      href: "https://twitter.com/ETCouch",
      path: "M4 4l7.2 9.6L4.4 20H6l6-6.5 4.6 6.5H21l-7.6-10L20 4h-1.6l-5.5 6-4.2-6H4Z",
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@entertainment-couch",
      path: "M21.6 7.6a3 3 0 0 0-2.1-2.1C17.7 5 12 5 12 5s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.6 31 31 0 0 0 2 12a31 31 0 0 0 .4 4.4 3 3 0 0 0 2.1 2.1C6.3 19 12 19 12 19s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.4ZM10 15V9l5.2 3Z",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/entertainmentcouch",
      path: "M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm4 5.2A4.8 4.8 0 1 1 7.2 13 4.8 4.8 0 0 1 12 8.2Zm0 2A2.8 2.8 0 1 0 14.8 13 2.8 2.8 0 0 0 12 10.2ZM17.4 6.6a1.1 1.1 0 1 1-1.1 1.1 1.1 0 0 1 1.1-1.1Z",
    },
  ];

  return (
    <div className="rounded-xl bg-gradient-to-br from-brand-light to-white p-5">
      <h3 className="text-sm font-bold tracking-wide text-ink">
        STAY CONNECTED
      </h3>

      <p className="mt-2 text-[13px] leading-5 text-muted">
        Follow us for daily entertainment updates and behind-the-scenes exclusives.
      </p>

      <div className="mt-4 flex gap-3">
        {icons.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink/70 shadow-sm transition-colors hover:text-brand"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d={s.path} />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}

export function BrowseCategories({ counts }) {
  // Match the navbar: only categories with a curated page/hero image show
  // up here (inNav !== false).
  const navCategories = categories.filter((c) => c.inNav !== false);

  return (
    <div className="rounded-xl bg-zinc-50 p-5">
      <h3 className="mb-4 text-sm font-bold tracking-wide text-ink">BROWSE CATEGORIES</h3>
      <ul className="divide-y divide-black/5">
        {navCategories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/category/${c.slug}`}
              className="flex items-center justify-between py-2.5 text-[13px] font-medium text-ink/80 hover:text-brand"
            >
              <span>{c.name}</span>
              <span className="flex items-center gap-1 text-muted">
                {counts?.[c.slug] ?? 0}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
