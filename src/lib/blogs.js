import fs from "node:fs/promises";
import path from "node:path";

import {
  getApiBlogs,
  getApiBlogDetail,
  getApiSlugs,
  slugToApiCategory,
} from "@/lib/apiBlogs";

// Blog data comes from two places and they are deliberately kept side by side:
//
//  1. src/data/blogs.json — the original hardcoded posts, plus anything
//     created through the "Create New Blog" form. Still the source of truth
//     for everything editorial.
//  2. The auto-blog backend (see lib/apiBlogs.js) — articles generated on a
//     cron and served over /api/blogs/generatedblogs.
//
// getAllBlogs() merges the two into one newest-first list in a single shape,
// so every page/component downstream (cards, sidebar, category pages,
// sitemap) treats them identically. A hardcoded post ALWAYS wins a slug
// collision, so nothing the team wrote can be shadowed by a generated post.
const DATA_FILE = path.join(process.cwd(), "src", "data", "blogs.json");

function byNewest(a, b) {
  return new Date(b.date) - new Date(a.date);
}

/** Only the hardcoded / form-created posts from blogs.json. */
export async function getLocalBlogs() {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const blogs = JSON.parse(raw);
  return blogs
    .map((b) => ({ ...b, source: "local" }))
    .sort(byNewest);
}

function mergeBlogs(local, api) {
  const taken = new Set(local.map((b) => b.slug));
  const fromApi = api.filter((b) => !taken.has(b.slug));
  return [...local, ...fromApi].sort(byNewest);
}

/**
 * Hardcoded posts + generated posts, newest first.
 * @param {{ source?: "all" | "local" | "api" }} [options]
 */
export async function getAllBlogs({ source = "all" } = {}) {
  if (source === "local") return getLocalBlogs();

  const [local, api] = await Promise.all([
    getLocalBlogs(),
    source === "api" ? getApiBlogs() : getApiBlogs().catch(() => []),
  ]);

  if (source === "api") return api.sort(byNewest);
  return mergeBlogs(local, api);
}

/**
 * Posts for one category page. Hardcoded posts are filtered locally; the
 * generated ones are requested from the backend already filtered
 * (`?category=<key>`), so a category page never downloads the whole feed.
 */
export async function getBlogsByCategory(categorySlug, { source = "all" } = {}) {
  const local = (await getLocalBlogs()).filter((b) => b.category === categorySlug);
  if (source === "local") return local;

  const api = await getApiBlogs({ categorySlug });
  if (source === "api") return api.sort(byNewest);

  return mergeBlogs(local, api);
}

// A blog can be tagged to a free-online-tool instead of a category (see
// createBlog below) — this powers the "related posts" section on each
// tool's detail page. Generated posts never carry a tool, so this stays local.
export async function getBlogsByTool(toolSlug) {
  const blogs = await getLocalBlogs();
  return blogs.filter((b) => b.tool === toolSlug);
}

/**
 * One post by slug. Hardcoded first, then the generated-blogs backend.
 * The returned object is always in the local shape, with `content` filled in.
 */
export async function getBlogBySlug(slug) {
  const local = (await getLocalBlogs()).find((b) => b.slug === slug);
  if (local) return local;

  const detail = await getApiBlogDetail(slug);
  return detail?.blog || null;
}

/**
 * Like getBlogBySlug, but also returns the extras only generated posts have
 * (table of contents, key takeaways, FAQs, sources, related/prev/next).
 * For a hardcoded post the extras come back empty, so the detail page can
 * render both kinds with one code path.
 */
export async function getBlogDetail(slug) {
  const local = (await getLocalBlogs()).find((b) => b.slug === slug);
  if (local) {
    return {
      blog: local,
      toc: [],
      faqs: [],
      keyTakeaways: [],
      sourceUrls: [],
      seo: null,
      related: [],
      prev: null,
      next: null,
    };
  }

  return getApiBlogDetail(slug);
}

/** Every blog slug (hardcoded + generated) — used by the sitemap. */
export async function getAllBlogSlugs() {
  const [local, apiSlugs] = await Promise.all([getLocalBlogs(), getApiSlugs()]);
  const taken = new Set(local.map((b) => b.slug));

  return [
    ...local.map((b) => ({ slug: b.slug, updatedAt: b.date, source: "local" })),
    ...apiSlugs
      .filter((s) => s?.slug && !taken.has(s.slug))
      .map((s) => ({
        slug: s.slug,
        updatedAt: s.updatedAt || s.publishedAt,
        source: "api",
      })),
  ];
}

/** True when this category page also pulls posts from the backend. */
export function categoryHasApiFeed(categorySlug) {
  return Boolean(slugToApiCategory(categorySlug));
}

export function slugify(input) {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Blog `content` is stored as an HTML string (a series of sanitized `<p>`
// tags), not raw user markup — this escapes plain text before wrapping it,
// so it's always safe to render with dangerouslySetInnerHTML later.
function escapeHtml(input) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function createBlog({
  title,
  category,
  tool,
  excerpt,
  content,
  image,
  author,
}) {
  const blogs = JSON.parse(await fs.readFile(DATA_FILE, "utf-8"));

  let slug = slugify(title);
  if (!slug) slug = `post-${Date.now()}`;
  // Ensure the slug is unique.
  let unique = slug;
  let i = 2;
  while (blogs.some((b) => b.slug === unique)) {
    unique = `${slug}-${i}`;
    i += 1;
  }

  const words = Math.max(content.trim().split(/\s+/).length, 1);
  const readTime = `${Math.max(1, Math.round(words / 200))} min read`;

  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const safeParagraphs = paragraphs.length ? paragraphs : [content.trim()];
  const contentHtml = safeParagraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");

  const entry = {
    slug: unique,
    title: title.trim(),
    // A post belongs to either a category or a tool, never both — whichever
    // wasn't chosen comes in as null and is stored as such.
    category: category || null,
    tool: tool || null,
    excerpt: excerpt?.trim() || safeParagraphs[0]?.slice(0, 160) || "",
    image: image || "/images/blogs/default.svg",
    author: author?.trim() || "ODL Editorial",
    date: new Date().toISOString().slice(0, 10),
    readTime,
    content: contentHtml,
  };

  blogs.push(entry);
  await fs.writeFile(DATA_FILE, JSON.stringify(blogs, null, 2), "utf-8");
  return entry;
}
