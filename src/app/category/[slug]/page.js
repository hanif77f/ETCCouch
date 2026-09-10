import Link from "next/link";
import { notFound } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import JsonLd from "@/components/JsonLd";
import { PopularThisWeek, StayConnected, BrowseCategories } from "@/components/Sidebar";
import { categories, getCategoryBySlug } from "@/data/categories";
import { getAllBlogs, getBlogsByCategory } from "@/lib/blogs";
import { breadcrumbSchema, collectionPageSchema } from "@/lib/schema";
import { absoluteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  const url = absoluteUrl(`/category/${category.slug}`);

  return {
    title: category.name,
    description: category.description,
    keywords: [category.name, category.tagline, "ETC Entertainment Couch"],
    alternates: { canonical: url },
    // No explicit `images` here — this route has its own opengraph-image.js
    // which Next.js renders as a proper PNG social preview automatically.
    openGraph: {
      type: "website",
      title: category.name,
      description: category.description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: category.name,
      description: category.description,
    },
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const [blogs, allBlogs] = await Promise.all([getBlogsByCategory(slug), getAllBlogs()]);
  const popular = allBlogs.slice(0, 5);
  const counts = categories.reduce((acc, c) => {
    acc[c.slug] = allBlogs.filter((b) => b.category === c.slug).length;
    return acc;
  }, {});

  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: category.name, path: `/category/${category.slug}` },
  ]);
  const collectionLd = collectionPageSchema({ category, blogs });

  return (
    <div className="flex flex-col gap-12 pb-16">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={collectionLd} />

      <section className="relative mt-4 overflow-hidden bg-cream md:mt-6">

  {/* Hero image */}
  <picture className="block h-[600px] w-full md:h-auto">
    
    {/* Mobile image */}
    <source
      media="(max-width: 767px)"
      srcSet={
        category.mobileHeroImage ||
        `/images/categories/${category.slug}-mobile.png`
      }
    />

    {/* Desktop image */}
    <img
      src={
        category.heroImage ||
        `/images/categories/${category.slug}.svg`
      }
      alt=""
      aria-hidden="true"
      className="block h-full w-full object-cover md:h-auto md:w-full"
    />
  </picture>

  {/* White overlay for better text visibility */}
  <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/55 to-transparent" />

  {/* Content */}
  <div className="container-page absolute inset-0 z-10 flex items-center">
    <div className="max-w-xl">
      <p
        className="mb-3 text-xs font-bold uppercase tracking-[0.2em]"
        style={{ color: category.color }}
      >
        {category.tagline}
      </p>

      <h1 className="font-display text-5xl font-bold leading-[1.05] text-ink md:text-6xl">
        {category.name}
      </h1>

      <p className="mt-5 max-w-md text-[15px] leading-7 text-muted">
        {category.description}
      </p>

      <Link
        href="#category-posts"
        className="mt-7 inline-flex items-center rounded-md bg-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark"
      >
        Explore More
      </Link>
    </div>
  </div>

</section>

      <div id="category-posts" className="container-page grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h2 className="section-heading font-display">Latest in {category.name}</h2>
            <Link href="/create-blog" className="hidden text-xs font-bold tracking-wide text-brand">
              + WRITE A POST
            </Link>
          </div>

          {blogs.length ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {blogs.map((blog) => (
                <BlogCard key={blog.slug} blog={blog} size="lg" />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">
              No posts in this category yet. Be the first to{" "}
              <Link href="/create-blog" className="font-semibold text-brand">
                create one
              </Link>
              .
            </p>
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <PopularThisWeek blogs={popular} />
          <StayConnected />
          <BrowseCategories counts={counts} />
        </aside>
      </div>
    </div>
  );
}
