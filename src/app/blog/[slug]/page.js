import Link from "next/link";
import { notFound } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import JsonLd from "@/components/JsonLd";
import { PopularThisWeek, StayConnected, BrowseCategories } from "@/components/Sidebar";
import { categories, getCategoryBySlug } from "@/data/categories";
import { getTool } from "@/data/tools";
import { getToolTheme } from "@/data/toolThemes";
import {
  getAllBlogs,
  getBlogDetail,
  getBlogsByCategory,
  getBlogsByTool,
} from "@/lib/blogs";
import { blogPostingSchema, breadcrumbSchema, faqPageSchema } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const detail = await getBlogDetail(slug);
  if (!detail?.blog) return {};

  const { blog } = detail;
  const category = getCategoryBySlug(blog.category);
  const tool = !category && blog.tool ? getTool(blog.tool) : null;
  const url = absoluteUrl(`/blog/${blog.slug}`);

  // Generated posts arrive with a keyword list from the backend; hardcoded
  // ones keep the derived keywords they always had.
  const keywords = blog.keywords?.length
    ? blog.keywords
    : [category?.name || tool?.name, blog.title, "ETC Entertainment Couch"].filter(Boolean);

  return {
    title: blog.title,
    description: blog.excerpt,
    keywords,
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
      modifiedTime: blog.updatedAt || blog.date,
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
  const [detail, allBlogs] = await Promise.all([getBlogDetail(slug), getAllBlogs()]);
  if (!detail?.blog) notFound();

  const { blog, toc = [], faqs = [], keyTakeaways = [], sourceUrls = [] } = detail;

  const category = getCategoryBySlug(blog.category);
  // A post is tagged to either a category or a tool, never both.
  const tool = !category && blog.tool ? getTool(blog.tool) : null;
  const toolTheme = tool ? getToolTheme(blog.tool) : null;
  const popular = allBlogs.slice(0, 5);

  // Generated posts come with their own "related" list from the backend; if
  // it's empty (a fresh category with one post) fall back to the merged
  // category feed, which is also what every hardcoded post uses.
  let related = (detail.related || []).filter((b) => b.slug !== blog.slug);
  if (!related.length) {
    related = (
      category
        ? await getBlogsByCategory(blog.category)
        : tool
        ? await getBlogsByTool(blog.tool)
        : []
    ).filter((b) => b.slug !== blog.slug);
  }
  related = related.slice(0, 3);

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
  const faqLd = faqs.length ? faqPageSchema(faqs) : null;

  return (
    <div className="flex flex-col gap-12 pb-16">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={articleLd} />
      {faqLd && <JsonLd data={faqLd} />}

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
            <img
              src={blog.image}
              alt={blog.imageAlt || blog.title}
              className="h-64 w-full object-cover md:h-[420px]"
            />
          </div>

          {/* Key takeaways / table of contents / FAQs below only exist on the
              auto-generated posts — hardcoded posts get empty arrays and
              these blocks simply don't render. */}
          {keyTakeaways.length > 0 && (
            <section className="rounded-2xl border border-black/5 bg-brand-light/40 p-6">
              <h2 className="font-display mb-3 text-lg font-bold text-ink">Key Takeaways</h2>
              <ul className="flex list-disc flex-col gap-2 pl-5 text-[15px] leading-7 text-ink/85">
                {keyTakeaways.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </section>
          )}

          {toc.length > 1 && (
            <nav
              aria-label="Table of contents"
              className="rounded-2xl border border-black/5 bg-zinc-50 p-6"
            >
              <h2 className="font-display mb-3 text-lg font-bold text-ink">In this article</h2>
              <ul className="flex flex-col gap-2 text-sm">
                {toc.map((item) => (
                  <li
                    key={item.id}
                    style={{ paddingLeft: `${Math.max(0, (item.level || 2) - 2) * 14}px` }}
                  >
                    {/* Heading ids are already injected into contentHtml by the API. */}
                    <a href={`#${item.id}`} className="text-ink/80 hover:text-brand">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div
            className="blog-body flex flex-col gap-5 text-[15px] leading-8 text-ink/85 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-4 [&_blockquote]:border-brand/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-ink/70 [&_h2]:font-display [&_h2]:mt-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-ink [&_h3]:font-display [&_h3]:mt-1 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-ink [&_h4]:text-base [&_h4]:font-bold [&_h4]:text-ink [&_h5]:text-sm [&_h5]:font-bold [&_h5]:uppercase [&_h5]:tracking-wide [&_h5]:text-ink [&_li]:leading-7 [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pl-5 [&_img]:rounded-xl [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-black/10 [&_td]:p-2 [&_th]:border [&_th]:border-black/10 [&_th]:bg-cream [&_th]:p-2 [&_th]:text-left"
            // Content is authored server-side — either WP import sanitization /
            // escapeHtml() in lib/blogs.js for hardcoded posts, or the
            // auto-blog backend's own sanitized HTML for generated ones —
            // never raw user input rendered directly, so this is safe.
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {faqs.length > 0 && (
            <section className="mt-2">
              <h2 className="section-heading mb-5 font-display">Frequently Asked Questions</h2>
              <div className="flex flex-col gap-3">
                {faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-xl border border-black/5 bg-white p-4 shadow-sm"
                  >
                    <summary className="cursor-pointer list-none font-display text-base font-bold text-ink marker:hidden group-open:text-brand">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-[15px] leading-7 text-ink/80">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {sourceUrls.length > 0 && (
            <section className="rounded-xl border border-black/5 bg-zinc-50 p-5">
              <h2 className="mb-3 text-sm font-bold tracking-wide text-ink">SOURCES</h2>
              <ul className="flex flex-col gap-2 text-sm">
                {sourceUrls.map((src, i) => {
                  const href = typeof src === "string" ? src : src?.url;
                  if (!href) return null;
                  const label = typeof src === "string" ? src : src.title || src.url;
                  return (
                    <li key={i}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="break-all font-medium text-brand underline underline-offset-2"
                      >
                        {label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {(detail.prev || detail.next) && (
            <nav className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-6 text-sm">
              {detail.prev ? (
                <Link href={`/blog/${detail.prev.slug}`} className="max-w-[45%] font-semibold text-brand">
                  &larr; {detail.prev.title}
                </Link>
              ) : (
                <span />
              )}
              {detail.next && (
                <Link
                  href={`/blog/${detail.next.slug}`}
                  className="max-w-[45%] text-right font-semibold text-brand"
                >
                  {detail.next.title} &rarr;
                </Link>
              )}
            </nav>
          )}

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
