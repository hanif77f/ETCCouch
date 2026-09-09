import { categories } from "@/data/categories";
import { GAMES } from "@/data/playGames";
import { TOOLS } from "@/data/tools";
import { getAllBlogs } from "@/lib/blogs";
import { SITE_URL } from "@/lib/site";

const STATIC_ROUTES = [
  { path: "", changeFrequency: "daily", priority: 1 },
  { path: "/games", changeFrequency: "monthly", priority: 0.6 },
  { path: "/free-online-tools", changeFrequency: "monthly", priority: 0.6 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.2 },
  // /create-blog is an authoring route and is intentionally left out.
];

export default async function sitemap() {
  const blogs = await getAllBlogs();

  const staticRoutes = STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const blogRoutes = blogs.map((b) => ({
    url: `${SITE_URL}/blog/${b.slug}`,
    lastModified: new Date(b.date),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const gameRoutes = GAMES.map((game) => ({
    url: `${SITE_URL}/games/${game.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const toolRoutes = TOOLS.map((tool) => ({
    url: `${SITE_URL}/free-online-tools/${tool.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: tool.slug === "epoch-timestamp-converter" ? 0.7 : 0.5,
  }));

  return [...staticRoutes, ...categoryRoutes, ...blogRoutes, ...gameRoutes, ...toolRoutes];
}
