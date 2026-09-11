import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PrizmTool from "@/components/text-tools/color-palette-generator/PrizmTool";
import BlogCard from "@/components/BlogCard";
import { getToolTheme } from "@/data/toolThemes";
import { getBlogsByTool } from "@/lib/blogs";
import { SITE_URL } from "@/lib/site";

// TODO: confirm this matches the slug you register in @/data/tools (TOOLS
// array) and @/data/toolThemes (TOOL_THEMES) — both need this exact string,
// and the route folder must match too:
// src/app/free-online-tools/color-palette-generator/page.js
const SLUG = "color-palette-generator";
const PATH = `/free-online-tools/${SLUG}`;

export const metadata = {
  title: { absolute: "Prizm – Free Color Palette Studio | Entertainment Couch" },
  description:
    "A free color palette studio: precision color picker, harmony generator, image color extraction, WCAG contrast checker, and Tailwind-style shade ramps — all in your browser.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Prizm – Free Color Palette Studio | Entertainment Couch",
    description:
      "Pick, extract, and check colors right in your browser — free color tools for designers and developers.",
    url: PATH,
    type: "website",
  },
};

export default async function PrizmPage() {
  const { Icon, rgb } = getToolTheme(SLUG);
  const relatedBlogs = await getBlogsByTool(SLUG);
  const pageUrl = `${SITE_URL}${PATH}`;
  const description =
    "A free color palette studio: precision color picker, harmony generator, image color extraction, WCAG contrast checker, and Tailwind-style shade ramps — all in your browser.";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Free Online Tools", item: `${SITE_URL}/free-online-tools` },
      { "@type": "ListItem", position: 3, name: "Color Palette Studio", item: pageUrl },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Link
        href="/free-online-tools"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted transition hover:text-fg focus-ring rounded-lg"
      >
        <ChevronLeft size={16} /> All free tools
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
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
            style={{ backgroundColor: `rgb(${rgb} / 0.12)`, color: `rgb(${rgb})` }}
          >
            Color Palette Studio
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Prizm: Color Palette Studio
          </h1>
          <p className="mt-2 leading-relaxed text-muted">{description}</p>
        </div>
      </header>

      <div className="mt-10">
        <PrizmTool />
      </div>

      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          About this studio
        </h2>
        <div className="panel-flat space-y-5 rounded-xl p-6 sm:p-8">
          <div>
            <h3 className="font-semibold text-fg">Everything stays in your browser</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              The picker, harmony generator, image extractor, contrast checker, and shade ramp builder all run
              client-side. Saved palettes live in this browser&apos;s local storage — nothing is uploaded to a
              server, including any image you drop in for color extraction.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">Sharing and exporting</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              A share link encodes your palette&apos;s colors directly in the URL, so there&apos;s no expiry and no
              server storage involved. When you&apos;re ready to use a palette in code, export straight to CSS
              variables, SCSS, a Tailwind config snippet, JSON, or a plain HEX/RGB list.
            </p>
          </div>
        </div>
      </section>

      {relatedBlogs.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
            Related posts
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedBlogs.map((blog) => (
              <BlogCard key={blog.slug} blog={blog} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
