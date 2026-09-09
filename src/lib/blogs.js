import fs from "node:fs/promises";
import path from "node:path";

// Blog data is stored as a JSON file so blogs created through the
// "Create New Blog" form persist across requests without a separate backend.
const DATA_FILE = path.join(process.cwd(), "src", "data", "blogs.json");

export async function getAllBlogs() {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  const blogs = JSON.parse(raw);
  // Newest first.
  return blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getBlogsByCategory(categorySlug) {
  const blogs = await getAllBlogs();
  return blogs.filter((b) => b.category === categorySlug);
}

// A blog can be tagged to a free-online-tool instead of a category (see
// createBlog below) — this powers the "related posts" section on each
// tool's detail page.
export async function getBlogsByTool(toolSlug) {
  const blogs = await getAllBlogs();
  return blogs.filter((b) => b.tool === toolSlug);
}

export async function getBlogBySlug(slug) {
  const blogs = await getAllBlogs();
  return blogs.find((b) => b.slug === slug) || null;
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
