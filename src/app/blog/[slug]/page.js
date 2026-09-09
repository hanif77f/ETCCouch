import Link from "next/link";
import { notFound } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import JsonLd from "@/components/JsonLd";
import { PopularThisWeek, StayConnected, BrowseCategories } from "@/components/Sidebar";
import { categories, getCategoryBySlug } from "@/data/categories";
import { getTool } from "@/data/tools";
import { getToolTheme } from "@/data/toolThemes";
import { getAllBlogs, getBlogBySlug, getBlogsByCategory, getBlogsByTool } from "@/lib/blogs";
import { blogPostingSchema, breadcrumbSchema } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return {};

  const category = getCategoryBySlug(blog.category);
  const tool = !category && blog.tool ? getTool(blog.tool) : null;
  const url = absoluteUrl(`/blog/${blog.slug}`);

  return {
    title: blog.title,
    description: blog.excerpt,
    keywords: [category?.name || tool?.name, blog.title, "ETC Entertainment Couch"].filter(Boolean),
    authors: [{ name: blog.author }],
    alternates: { canonical: url },
    openGraph: {
      // No explicit `images` here on purpose: this route has its own
      // opengraph-image.js that Next.js renders as a proper PNG social
      // preview. Most platforms (Facebook, X, LinkedIn) don't render SVG
      // og:image files, so we let the generated PNG take over instead of
      // pointing at the SVG thumbnail.
      type: "article",
      title: blog.title,
      description: blog.excerpt,
      url,
      publishedTime: blog.date,
      modifiedTime: blog.date,
      authors: [blog.author],
      section: category?.name || tool?.name,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
    },
  };
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const [blog, allBlogs] = await Promise.all([getBlogBySlug(slug), getAllBlogs()]);
  if (!blog) notFound();

  const category = getCategoryBySlug(blog.category);
  // A post is tagged to either a category or a tool, never both.
  const tool = !category && blog.tool ? getTool(blog.tool) : null;
  const toolTheme = tool ? getToolTheme(blog.tool) : null;
  const popular = allBlogs.slice(0, 5);
  const related = (
    category ? await getBlogsByCategory(blog.category) : tool ? await getBlogsByTool(blog.tool) : []
  )
    .filter((b) => b.slug !== blog.slug)
    .slice(0, 3);
  const counts = categories.reduce((acc, c) => {
    acc[c.slug] = allBlogs.filter((b) => b.category === c.slug).length;
    return acc;
  }, {});

  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", path: "/" },
    ...(category ? [{ name: category.name, path: `/category/${category.slug}` }] : []),
    ...(tool ? [{ name: tool.name, path: `/free-online-tools/${tool.slug}` }] : []),
    { name: blog.title, path: `/blog/${blog.slug}` },
  ]);
  const articleLd = blogPostingSchema(blog, category);

  return (
    <div className="flex flex-col gap-12 pb-16">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={articleLd} />

      <section className="border-b border-black/5 bg-cream">
        <div className="container-page flex flex-col gap-6 py-12">
          <nav className="flex items-center gap-2 text-xs text-muted">
            <Link href="/" className="hover:text-brand">Home</Link>
            <span>/</span>
            {category && (
              <>
                <Link href={`/category/${category.slug}`} className="hover:text-brand">{category.name}</Link>
                <span>/</span>
              </>
            )}
            {tool && (
              <>
                <Link href={`/free-online-tools/${tool.slug}`} className="hover:text-brand">{tool.name}</Link>
                <span>/</span>
              </>
            )}
            <span className="text-ink/70">{blog.title}</span>
          </nav>

          {category && (
            <span
              className="w-fit rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          )}
          {tool && (
            <span
              className="w-fit rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: `rgb(${toolTheme.rgb})` }}
            >
              {tool.name}
            </span>
          )}

          <h1 className="font-display max-w-3xl text-3xl font-bold leading-tight text-ink md:text-5xl">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
            <span className="font-semibold text-ink/80">By {blog.author}</span>
            <span aria-hidden>&middot;</span>
            <time dateTime={blog.date}>{formatDate(blog.date)}</time>
            <span aria-hidden>&middot;</span>
            <span>{blog.readTime}</span>
          </div>
        </div>
      </section>

      <div className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <article className="flex flex-col gap-6">
          <div className="overflow-hidden rounded-2xl">
            <img src={blog.image} alt={blog.title} className="h-64 w-full object-cover md:h-[420px]" />
          </div>

          <div
            className="blog-body flex flex-col gap-5 text-[15px] leading-8 text-ink/85 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-4 [&_blockquote]:border-brand/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink/70 [&_h2]:font-display [&_h2]:mt-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-ink [&_h3]:font-display [&_h3]:mt-1 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-ink [&_h4]:text-base [&_h4]:font-bold [&_h4]:text-ink [&_h5]:text-sm [&_h5]:font-bold [&_h5]:uppercase [&_h5]:tracking-wide [&_h5]:text-ink [&_li]:leading-7 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5"
            // Content is authored server-side at import/create time (WP import
            // sanitization or escapeHtml() in lib/blogs.js) — never raw user
            // input rendered directly — so this is safe.
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {related.length > 0 && (
            <div className="mt-8">
              <h2 className="section-heading mb-5 font-display">More in {category?.name || tool?.name}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((b) => (
                  <BlogCard key={b.slug} blog={b} />
                ))}
              </div>
            </div>
          )}
        </article>

        <aside className="flex flex-col gap-6">
          <PopularThisWeek blogs={popular} />
          <StayConnected />
          <BrowseCategories counts={counts} />
        </aside>
      </div>
    </div>
  );
}
