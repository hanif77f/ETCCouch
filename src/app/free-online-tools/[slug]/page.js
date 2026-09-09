import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Sparkles } from "lucide-react";
import Section from "@/components/ui/Section";
import BlogCard from "@/components/BlogCard";
import { getTool, getToolSlugs } from "@/data/tools";
import { getToolTheme } from "@/data/toolThemes";
import { getBlogsByTool } from "@/lib/blogs";

// "epoch-timestamp-converter" has its own dedicated route
// (src/app/free-online-tools/epoch-timestamp-converter/page.js) with real
// functionality, so it's excluded here to avoid two routes resolving the
// same path.
export function generateStaticParams() {
  return getToolSlugs()
    .filter((slug) => slug !== "epoch-timestamp-converter")
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};

  return {
    title: tool.name,
    description: tool.description,
    alternates: { canonical: `/free-online-tools/${slug}` },
  };
}

// Placeholder detail page — one per tool, so cards in the grid never link to
// a 404. The actual tool UI replaces the "Coming soon" block as each one is
// built; everything else (header, theme, metadata) is already wired up.
export default async function ToolPage({ params }) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const { Icon, rgb } = getToolTheme(slug);
  const relatedBlogs = await getBlogsByTool(slug);

  return (
    <Section className="pt-12">
      <Link
        href="/free-online-tools"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted transition hover:text-fg focus-ring rounded-lg"
      >
        <ChevronLeft size={16} /> All tools
      </Link>

      <header className="mt-4 flex items-start gap-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-soft sm:h-16 sm:w-16"
          style={{
            backgroundColor: `rgb(${rgb} / 0.14)`,
            color: `rgb(${rgb})`,
            boxShadow: `inset 0 0 0 1px rgb(${rgb} / 0.25)`,
          }}
        >
          <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2} />
        </span>
        <div className="max-w-2xl">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {tool.name}
          </h1>
          <p className="mt-2 leading-relaxed text-muted">{tool.description}</p>
        </div>
      </header>

      <div
        className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center"
        style={{ borderColor: `rgb(${rgb} / 0.3)` }}
      >
        <Sparkles className="h-6 w-6" style={{ color: `rgb(${rgb})` }} />
        <p className="font-display text-lg font-semibold text-fg">Coming soon</p>
        <p className="max-w-md text-sm leading-relaxed text-muted">
          We&apos;re building this tool. Check back soon — it&apos;ll work right here in your browser, free, with no
          sign-up.
        </p>
      </div>

      {relatedBlogs.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-semibold tracking-tight text-fg sm:text-2xl">
            Related posts
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedBlogs.map((blog) => (
              <BlogCard key={blog.slug} blog={blog} />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

