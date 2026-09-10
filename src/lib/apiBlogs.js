// ---------------------------------------------------------------------------
// Auto-generated blogs API client.
//
// The backend at NEXT_PUBLIC_BLOGS_API_BASE_URL generates articles on a cron
// and exposes them over two public, unauthenticated endpoints:
//
//   GET /api/blogs/generatedblogs          -> paginated cards + filters + seo
//   GET /api/blogs/generatedblogs/:slug    -> one article + full SEO payload
//
// Everything here normalizes those payloads into the SAME shape the hardcoded
// posts in src/data/blogs.json use, so BlogCard, the sidebar, the category
// pages and the sitemap keep working without knowing where a post came from.
// The only extra field is `source` ("local" | "api") plus a few API-only
// extras (toc / faqs / keyTakeaways) that the detail page renders when present.
//
// Every function here is fail-safe: if the backend is down or slow the site
// still renders with just the hardcoded posts instead of throwing.
// ---------------------------------------------------------------------------

import { categories } from "@/data/categories";

export const BLOGS_API_BASE_URL = (
  process.env.NEXT_PUBLIC_BLOGS_API_BASE_URL ||
  "https://blogsautobackend.entertainmentcouch.com"
).replace(/\/$/, "");

// How long Next.js may serve a cached copy of an API response (seconds).
const LIST_REVALIDATE = 300;
const DETAIL_REVALIDATE = 300;
const SLUGS_REVALIDATE = 3600;

// The API caps `limit` server-side; 50 is comfortably inside it.
const PAGE_SIZE = 50;
const MAX_PAGES = 20;

// ---------------------------------------------------------------------------
// Category mapping
//
// The backend has its own category keys. Most of them are identical to our
// local slugs in src/data/categories.js — the one that isn't is "news",
// which is our "latest-news" page. Anything unrecognised falls back to
// "latest-news" so an API post is never orphaned off every category page.
// ---------------------------------------------------------------------------

export const API_CATEGORY_TO_SLUG = {
  news: "latest-news",
  sports: "sports",
  "technology-ai": "technology-ai",
  "movies-tv": "movies-tv",
  "health-wellness": "health-wellness",
  lifestyle: "lifestyle",
  "deals-buying-guides": "deals-buying-guides",
};

const FALLBACK_CATEGORY_SLUG = "latest-news";

const LOCAL_SLUGS = new Set(categories.map((c) => c.slug));

/** Backend category key -> local category slug used by /category/[slug]. */
export function apiCategoryToSlug(key) {
  if (!key) return FALLBACK_CATEGORY_SLUG;
  const mapped = API_CATEGORY_TO_SLUG[key];
  if (mapped) return mapped;
  // Unknown key: use it directly if we happen to have a page for it.
  return LOCAL_SLUGS.has(key) ? key : FALLBACK_CATEGORY_SLUG;
}

/**
 * Local category slug -> the backend key(s) that feed it, so a category page
 * can ask the API for just its own posts (`?category=news`) instead of
 * downloading everything and filtering client-side.
 * Returns null when no backend category maps to this page.
 */
export function slugToApiCategory(slug) {
  const entry = Object.entries(API_CATEGORY_TO_SLUG).find(([, s]) => s === slug);
  return entry ? entry[0] : null;
}

// ---------------------------------------------------------------------------
// Low-level fetch
// ---------------------------------------------------------------------------

async function apiGet(path, { revalidate = LIST_REVALIDATE } = {}) {
  const url = `${BLOGS_API_BASE_URL}${path}`;
  try {
    const res = await fetch(url, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      // A 404 on a detail route is normal (unknown slug) — not worth a warning.
      if (res.status !== 404) {
        console.warn(`[blogs-api] ${res.status} ${res.statusText} for ${url}`);
      }
      return null;
    }
    const payload = await res.json();
    return payload?.success ? payload.data : null;
  } catch (err) {
    // Network failure / DNS / timeout: degrade to hardcoded-only content.
    console.warn(`[blogs-api] request failed for ${url}:`, err?.message || err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Normalization: API payload -> the shape src/data/blogs.json uses
// ---------------------------------------------------------------------------

function readTimeFrom(minutes) {
  const m = Number(minutes);
  return `${Number.isFinite(m) && m > 0 ? Math.round(m) : 1} min read`;
}

function absoluteImage(coverImage) {
  const url = coverImage?.url;
  if (!url) return "/images/blogs/default.svg";
  if (/^https?:\/\//i.test(url) || url.startsWith("/")) return url;
  return `${BLOGS_API_BASE_URL}/${url}`;
}

/**
 * Turn one API card into a local-shaped blog object.
 * Keeps the local field names (image / date / readTime / category) so every
 * existing component renders it unchanged.
 */
export function normalizeApiBlog(card) {
  if (!card?.slug) return null;

  return {
    slug: card.slug,
    title: card.title || "",
    // Local category slug, so getCategoryBySlug() resolves the colour, name
    // and /category/<slug> link exactly like a hardcoded post.
    category: apiCategoryToSlug(card.category?.key),
    tool: null,
    excerpt: card.excerpt || "",
    image: absoluteImage(card.coverImage),
    imageAlt: card.coverImage?.alt || card.title || "",
    // List cards don't carry an author; the detail payload does. Default to
    // the same byline the backend uses so a card and its article agree.
    author:
      (typeof card.author === "string" ? card.author : card.author?.name) ||
      "Editorial Team",
    date: card.publishedAt || card.updatedAt || new Date().toISOString(),
    updatedAt: card.updatedAt || card.publishedAt || null,
    readTime: readTimeFrom(card.readingMinutes),
    wordCount: card.wordCount ?? null,
    keywords: Array.isArray(card.keywords) ? card.keywords : [],
    // Cards carry no body; the detail endpoint fills this in.
    content: "",
    source: "api",
    apiId: card.id || null,
    apiCategoryKey: card.category?.key || null,
    apiCategoryLabel: card.category?.label || null,
  };
}

/**
 * The article body already opens with its own <h1>, but our detail page
 * renders the title as the page <h1> in the hero. Drop the duplicate so the
 * page has exactly one h1 (and so Google doesn't see two).
 */
function stripLeadingH1(html) {
  if (!html) return "";
  return html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, "");
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * One page of API blogs, normalized.
 * @param {{category?: string, page?: number, limit?: number, q?: string, sort?: string}} params
 *        `category` is the BACKEND key (e.g. "news"), not our local slug.
 */
export async function getApiBlogsPage(params = {}) {
  const search = new URLSearchParams();
  const { category, page = 1, limit = PAGE_SIZE, q, sort } = params;
  search.set("page", String(page));
  search.set("limit", String(limit));
  if (category) search.set("category", category);
  if (q) search.set("q", q);
  if (sort) search.set("sort", sort);

  const data = await apiGet(`/api/blogs/generatedblogs?${search.toString()}`);
  if (!data) return { blogs: [], pagination: null, filters: null };

  return {
    blogs: (data.blogs || []).map(normalizeApiBlog).filter(Boolean),
    pagination: data.pagination || null,
    filters: data.filters || null,
  };
}

/**
 * Every published API blog (walks pagination), normalized and newest-first.
 * Optionally scoped to one LOCAL category slug.
 */
export async function getApiBlogs({ categorySlug, q, limit } = {}) {
  // A category page that has no backend counterpart (e.g. "gaming") gets the
  // hardcoded posts only — no point calling the API for it.
  let category;
  if (categorySlug) {
    category = slugToApiCategory(categorySlug);
    if (!category) return [];
  }

  const collected = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const { blogs, pagination } = await getApiBlogsPage({ category, page, q });
    collected.push(...blogs);
    if (limit && collected.length >= limit) break;
    if (!pagination?.hasNextPage) break;
  }

  // "news" is the only backend category that maps onto a differently-named
  // local page, but a future key could map onto an existing page too — filter
  // defensively so a category page never shows a post that isn't its own.
  const scoped = categorySlug
    ? collected.filter((b) => b.category === categorySlug)
    : collected;

  return limit ? scoped.slice(0, limit) : scoped;
}

/** Category keys + live post counts, as reported by the backend. */
export async function getApiCategoryCounts() {
  const { filters } = await getApiBlogsPage({ limit: 1 });
  const counts = {};
  for (const c of filters?.categories || []) {
    const slug = apiCategoryToSlug(c.key);
    counts[slug] = (counts[slug] || 0) + (Number(c.count) || 0);
  }
  return counts;
}

/**
 * One article with its full body and SEO payload.
 * Returns null for an unknown slug (or when the backend is unreachable).
 */
export async function getApiBlogDetail(slug) {
  if (!slug) return null;
  const data = await apiGet(
    `/api/blogs/generatedblogs/${encodeURIComponent(slug)}`,
    { revalidate: DETAIL_REVALIDATE }
  );
  if (!data?.blog) return null;

  const raw = data.blog;
  const blog = {
    ...normalizeApiBlog(raw),
    title: raw.h1 || raw.title || "",
    content: stripLeadingH1(raw.contentHtml),
  };

  return {
    blog,
    toc: Array.isArray(raw.toc) ? raw.toc : [],
    faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
    keyTakeaways: Array.isArray(raw.keyTakeaways) ? raw.keyTakeaways : [],
    sourceUrls: Array.isArray(raw.sourceUrls) ? raw.sourceUrls : [],
    seo: data.seo || null,
    related: (data.related || []).map(normalizeApiBlog).filter(Boolean),
    prev: data.prev ? normalizeApiBlog(data.prev) : null,
    next: data.next ? normalizeApiBlog(data.next) : null,
  };
}

/** Cheap slug feed for sitemap.js / generateStaticParams(). */
export async function getApiSlugs() {
  const data = await apiGet("/api/blogs/generatedblogs?fields=slugs", {
    revalidate: SLUGS_REVALIDATE,
  });
  return data?.slugs || [];
}
