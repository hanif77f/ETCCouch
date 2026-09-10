import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import TrendingStrip from "@/components/TrendingStrip";
import BlogCard from "@/components/BlogCard";
import JsonLd from "@/components/JsonLd";
import { PopularThisWeek, StayConnected, BrowseCategories } from "@/components/Sidebar";
import { getAllBlogs } from "@/lib/blogs";
import { categories, getCategoryBySlug } from "@/data/categories";
import { itemListSchema } from "@/lib/schema";
import { SITE_TITLE, SITE_DESCRIPTION, absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

const HERO_SLUGS = ["sports", "movies-tv", "technology-ai"];

export default async function HomePage() {
  const blogs = await getAllBlogs();

  const slides = HERO_SLUGS.map((slug) => getCategoryBySlug(slug)).filter(Boolean);
  const trending = blogs.filter((b) => b.category === "latest-news").slice(0, 6);

const editorsPick = [
  ...blogs.filter((b) => b.category === "technology-ai"),
  ...blogs.filter((b) => b.category === "sports"),
].slice(0, 6);

const popular = blogs
  .filter((b) => ["movies-tv", "health-wellness"].includes(b.category))
  .slice(0, 5);

const latest = blogs
  .filter((b) =>
    ["sports", "technology-ai", "trending-now"].includes(b.category)
  )
  .slice(0, 3);

  const counts = categories.reduce((acc, c) => {
    acc[c.slug] = blogs.filter((b) => b.category === c.slug).length;
    return acc;
  }, {});

  const latestPostsLd = itemListSchema({
    name: "Latest posts on ETC Entertainment Couch",
    description: SITE_DESCRIPTION,
    items: editorsPick.map((b) => ({
      url: absoluteUrl(`/blog/${b.slug}`),
      name: b.title,
    })),
  });

  return (
   <div className="flex flex-col gap-12 pb-16">
      <JsonLd data={latestPostsLd} />
      <HeroSlider slides={slides} />

      <div className="container-page">
        <TrendingStrip blogs={trending} />
      </div>

      <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h2 className="section-heading font-display">Editor&apos;s Pick</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {editorsPick.map((blog) => (
              <BlogCard key={blog.slug} blog={blog} size="lg" />
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <PopularThisWeek blogs={popular} />
          <StayConnected />
          <BrowseCategories counts={counts} />
        </aside>
      </div>

      <div className="container-page !w-full !max-w-[1280px]">
        <h2 className="section-heading mb-6 font-display">Latest Updated</h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          <ul className="flex flex-col divide-y divide-black/5">
            {latest.map((blog) => {
              const category = getCategoryBySlug(blog.category);
              return (
                <li key={blog.slug} className="flex gap-4 py-4 first:pt-0">
                  <Link href={`/blog/${blog.slug}`} className="h-20 w-28 shrink-0 overflow-hidden ">
                    <img src={blog.image} alt={blog.title} className="h-full w-full " />
                  </Link>
                  <div className="flex flex-col justify-center">
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: category?.color }}>
                      {category?.name}
                    </span>
                    <Link href={`/blog/${blog.slug}`} className="mt-1 font-display text-sm font-bold leading-5 text-ink hover:text-brand">
                      {blog.title}
                    </Link>
                    <span className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M8 3v4M16 3v4M3 10h18" />
                      </svg>
                      {new Date(blog.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div
  className="relative flex min-h-[220px] items-center justify-center overflow-hidden rounded-2xl bg-cover bg-center"
  style={{
    backgroundImage:
      "url('https://img.youtube.com/vi/yeZTpiyjgz4/maxresdefault.jpg')",
  }}
>
  <div className="absolute inset-0 bg-black/30" />

  <a
    href="https://www.youtube.com/watch?v=yeZTpiyjgz4&t=155s"
    target="_blank"
    rel="noopener noreferrer"
    className="relative z-10 flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-ink shadow-lg transition-transform hover:scale-105"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7Z" />
    </svg>
    Watch Now
  </a>
</div>
        </div>
      </div>
    </div>
  );
}
