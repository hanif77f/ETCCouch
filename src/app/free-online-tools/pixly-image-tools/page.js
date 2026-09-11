import Link from "next/link";
import { ChevronDown, ChevronLeft } from "lucide-react";
import PixlyImageTools from "@/components/image-tools/pixly-image-tools/PixlyImageTools";
import BlogCard from "@/components/BlogCard";
import { getToolTheme } from "@/data/toolThemes";
import { getBlogsByTool } from "@/lib/blogs";
import { SITE_URL } from "@/lib/site";

const PATH = "/free-online-tools/pixly-image-tools";

export const metadata = {
  title: { absolute: "Pixly – Free Online Image Tools | Entertainment Couch" },
  description:
    "Compress, resize, crop, rotate and convert JPG, PNG and WebP images free in your browser. No sign-up and no server upload required.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Pixly – Free Online Image Tools | Entertainment Couch",
    description:
      "Compress, resize, crop, rotate and convert images privately in your browser — free, fast and without sign-up.",
    url: PATH,
    type: "website",
  },
};

const FAQS = [
  {
    q: "Is Pixly really free, with no sign-up?",
    a: "Yes. Every Pixly image tool is free to use without an account, watermark or usage limit.",
  },
  {
    q: "Do my images get uploaded to a server?",
    a: "No. Pixly processes images directly in your browser using the Canvas API. Your files never leave your device.",
  },
  {
    q: "Which image formats does Pixly support?",
    a: "You can open common browser-supported image files including JPG, PNG, WebP, GIF and BMP, and export JPG, PNG or WebP. Animated GIFs are processed as a single still frame.",
  },
  {
    q: "How does the quality slider affect file size?",
    a: "A lower JPG or WebP quality usually creates a smaller file by allowing more compression. PNG is lossless, so the quality slider does not apply to PNG output.",
  },
  {
    q: "What does the aspect-ratio lock do when resizing?",
    a: "It updates the other dimension automatically so the resized image keeps its original proportions and does not appear stretched.",
  },
  {
    q: "What happens to transparency when I convert PNG to JPG?",
    a: "JPG does not support transparency, so Pixly fills transparent areas with white. Choose PNG or WebP if you need transparency.",
  },
  {
    q: "Can I crop, rotate and flip an image?",
    a: "Yes. The crop tool supports freeform and preset aspect ratios, while Rotate & Flip supports 90-degree rotation and horizontal or vertical mirroring.",
  },
  {
    q: "Which favicon sizes does Pixly generate?",
    a: "Pixly generates 16×16, 32×32, 48×48, 96×96, 180×180, 192×192 and 512×512 PNG favicon files.",
  },
];

export default async function PixlyImageToolsPage() {
  const { Icon, rgb } = getToolTheme("pixly-image-tools");
  const relatedBlogs = await getBlogsByTool("pixly-image-tools");
  const pageUrl = `${SITE_URL}${PATH}`;
  const description =
    "Compress, resize, convert, crop, rotate and create favicons from images — privately in your browser, with no sign-up required.";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Free Online Tools", item: `${SITE_URL}/free-online-tools` },
      { "@type": "ListItem", position: 3, name: "Pixly Image Tools", item: pageUrl },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Link
        href="/free-online-tools"
        className="inline-flex w-fit items-center gap-1 rounded-lg text-sm text-muted transition hover:text-fg focus-ring"
      >
        <ChevronLeft size={16} /> All image tools
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
            Image Tools
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Pixly: Free Online Image Tools
          </h1>
          <p className="mt-2 leading-relaxed text-muted">{description}</p>
        </div>
      </header>

      <div className="mt-10">
        <PixlyImageTools />
      </div>

      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          About Pixly image tools
        </h2>
        <div className="panel-flat space-y-5 rounded-xl p-6 sm:p-8">
          <div>
            <h3 className="font-semibold text-fg">Six everyday image tools in one place</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Compress photos, resize batches, convert between JPG, PNG and WebP, crop with common aspect ratios,
              correct image orientation, or turn a logo into a complete PNG favicon set.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">Private, browser-based processing</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Every operation uses your browser&apos;s Canvas API. Images remain on your device and disappear from the
              tool when you refresh or close the page.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">Batch-friendly downloads</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Compress, resize, convert and rotate several files together. Download an individual result or package
              the completed batch into a ZIP file without installing additional software.
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

      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          Quick answers
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-border bg-card p-5 shadow-soft [&::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-fg marker:content-none">
                {faq.q}
                <ChevronDown
                  size={18}
                  className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
