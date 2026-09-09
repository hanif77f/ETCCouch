import Link from "next/link";
import { ChevronDown, ChevronLeft } from "lucide-react";
import EpochConverterTool from "@/components/time-date-tools/epoch-timestamp-converter/EpochConverterTool";
import BlogCard from "@/components/BlogCard";
import { getToolTheme } from "@/data/toolThemes";
import { getBlogsByTool } from "@/lib/blogs";
import { SITE_URL } from "@/lib/site";

// Kept in sync with `metadataBase` in `src/app/layout.js`.
const PATH = "/free-online-tools/epoch-timestamp-converter";

// `absolute` opts this page out of the "%s · EntertainmentCouch" title
// template set in the root layout — the brand name is already baked into
// this exact title tag, so the template would otherwise double it up.
export const metadata = {
  title: { absolute: "Epochly – Free Online Time & Date Tools | Entertainment Couch" },
  description:
    "Convert timestamps, calculate date differences, check time zones, and more — free, fast online time and date tools. No sign-up required.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Epochly – Free Online Time & Date Tools | Entertainment Couch",
    description:
      "Convert timestamps, calculate date differences, check time zones, and more — free, fast online time and date tools. No sign-up required.",
    url: PATH,
    type: "website",
  },
};

const FAQS = [
  {
    q: "What is a Unix timestamp?",
    a: "It's the number of seconds that have passed since midnight UTC on January 1, 1970 — the \"Unix epoch\". It's a single number, so it's easy to store, sort and compare without parsing a calendar date.",
  },
  {
    q: "How do I know if my timestamp is in seconds or milliseconds?",
    a: "A 10-digit number (like 1757001234) is almost always seconds; a 13-digit number is milliseconds. This converter auto-detects which one you've pasted, or you can force either with the unit dropdown.",
  },
  {
    q: "Does this tool send my data anywhere?",
    a: "No. Every conversion runs in your browser with JavaScript's built-in Date object — nothing you type is stored or sent to a server.",
  },
  {
    q: "What is the Year 2038 problem?",
    a: "Older systems store Unix time as a signed 32-bit integer, which runs out at 03:14:07 UTC on January 19, 2038. Most modern software already uses 64-bit timestamps, which push that limit out billions of years.",
  },
];

export default async function EpochTimestampConverterPage() {
  const { Icon, rgb } = getToolTheme("epoch-timestamp-converter");
  const relatedBlogs = await getBlogsByTool("epoch-timestamp-converter");
  const pageUrl = `${SITE_URL}${PATH}`;
  const description =
    "Convert timestamps, calculate date differences, check time zones, and more — free, fast online time and date tools. No sign-up required.";

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
      { "@type": "ListItem", position: 2, name: "Time & Date Tools", item: `${SITE_URL}/free-online-tools` },
      { "@type": "ListItem", position: 3, name: "Epoch & Timestamp Converter", item: pageUrl },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Link
        href="/free-online-tools"
        className="inline-flex w-fit items-center gap-1 text-sm text-muted transition hover:text-fg focus-ring rounded-lg"
      >
        <ChevronLeft size={16} /> All time &amp; date tools
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
            Epoch &amp; Timestamp Converter
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Epochly: Time &amp; Date Tools
          </h1>
          <p className="mt-2 leading-relaxed text-muted">{description}</p>
        </div>
      </header>

      <div className="mt-10">
        <EpochConverterTool />
      </div>

      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          About epoch &amp; Unix time
        </h2>
        <div className="panel-flat space-y-5 rounded-xl p-6 sm:p-8">
          <div>
            <h3 className="font-semibold text-fg">Where &quot;epoch time&quot; comes from</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              A Unix timestamp counts the seconds that have passed since midnight UTC on January 1, 1970 — a fixed
              moment computer scientists call the Unix epoch. Every timestamp since is just &quot;seconds since
              that moment,&quot; which makes it trivial to store, sort and compare without ever parsing a calendar
              string.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">Why seconds and milliseconds get mixed up</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Unix systems and most databases count in whole seconds — a 10-digit number today. JavaScript&apos;s{" "}
              <code>Date</code> object and many web APIs count in milliseconds instead — 13 digits. Feed the wrong
              unit into the wrong system and you&apos;ll land somewhere in 1970, or overflow thousands of years into
              the future. This converter auto-detects which one you&apos;ve pasted so you don&apos;t have to.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">When you&apos;ll actually need this</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Reach for it when an API response hands you a raw timestamp field, when you&apos;re debugging a log
              that stores <code>created_at</code> as an integer, when a token&apos;s <code>exp</code> claim needs
              checking, or when you just want to confirm what a given Unix time actually means in your local
              timezone.
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
