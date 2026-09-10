import { NextResponse } from "next/server";

import { getAllBlogs, getBlogsByCategory } from "@/lib/blogs";
import { categories } from "@/data/categories";

// Frontend-facing blogs feed.
//
// The auto-blog backend already supports `?category=<key>`, but its keys are
// its own ("news") and it doesn't know about the hardcoded posts in
// blogs.json. This route is the single place that speaks the site's own
// language: LOCAL category slugs, hardcoded + generated posts merged, one
// consistent card shape.
//
//   GET /api/blogs
//   GET /api/blogs?category=latest-news
//   GET /api/blogs?category=sports&limit=6
//   GET /api/blogs?source=api          -> generated posts only
//   GET /api/blogs?source=local        -> hardcoded posts only
//   GET /api/blogs?q=trump             -> title/keyword search across both
//
// Response: { success, data: { blogs, total, page, limit, category, source } }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_SOURCES = new Set(["all", "local", "api"]);

function matchesQuery(blog, q) {
  const needle = q.toLowerCase();
  return (
    blog.title?.toLowerCase().includes(needle) ||
    blog.excerpt?.toLowerCase().includes(needle) ||
    (blog.keywords || []).some((k) => String(k).toLowerCase().includes(needle))
  );
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category")?.trim() || null;
  const q = searchParams.get("q")?.trim() || null;
  const sourceParam = searchParams.get("source")?.trim() || "all";
  const source = VALID_SOURCES.has(sourceParam) ? sourceParam : "all";

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limitParam = Number(searchParams.get("limit"));
  const limit = Math.min(100, Math.max(1, limitParam || 12));

  if (category && !categories.some((c) => c.slug === category)) {
    return NextResponse.json(
      { success: false, message: `Unknown category "${category}"`, data: null },
      { status: 400 }
    );
  }

  try {
    let blogs = category
      ? await getBlogsByCategory(category, { source })
      : await getAllBlogs({ source });

    if (q) blogs = blogs.filter((b) => matchesQuery(b, q));

    const total = blogs.length;
    const start = (page - 1) * limit;
    const paged = blogs.slice(start, start + limit);

    return NextResponse.json(
      {
        success: true,
        message: "OK",
        data: {
          blogs: paged,
          total,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit)),
          hasNextPage: start + limit < total,
          hasPrevPage: page > 1,
          category,
          source,
        },
      },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err) {
    console.error("[/api/blogs] failed:", err);
    return NextResponse.json(
      { success: false, message: "Failed to load blogs", data: null },
      { status: 500 }
    );
  }
}
