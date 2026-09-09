import Link from "next/link";
import { getCategoryBySlug } from "@/data/categories";
import { getTool } from "@/data/tools";
import { getToolTheme } from "@/data/toolThemes";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BlogCard({ blog, size = "md" }) {
  const category = getCategoryBySlug(blog.category);
  // Posts tied to a tool instead of a category (see BlogForm) get a badge
  // in the tool's own accent color rather than a category one.
  const tool = !category && blog.tool ? getTool(blog.tool) : null;
  const toolTheme = tool ? getToolTheme(blog.tool) : null;
  const isLarge = size === "lg";

  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-cream">
        <img
          src={blog.image}
          alt={blog.title}
          className="h-full w-full  transition-transform duration-300 group-hover:scale-105"
        />
        {category && (
          <span
            className="absolute left-3 top-3 rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </span>
        )}
        {tool && (
          <span
            className="absolute left-3 top-3 rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: `rgb(${toolTheme.rgb})` }}
          >
            {tool.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3
          className={`font-display font-bold leading-snug text-ink group-hover:text-brand ${
            isLarge ? "text-xl" : "text-base"
          }`}
        >
          {blog.title}
        </h3>
        {isLarge && (
          <p className="line-clamp-2 text-sm leading-6 text-muted">{blog.excerpt}</p>
        )}
        <div className="mt-auto flex items-center gap-2 pt-1 text-xs text-muted">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M8 3v4M16 3v4M3 10h18" />
          </svg>
          <span>{formatDate(blog.date)}</span>
          <span aria-hidden>&middot;</span>
          <span>{blog.readTime}</span>
        </div>
      </div>
    </Link>
  );
}
