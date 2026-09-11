import Link from "next/link";
import { ChevronDown, ChevronLeft } from "lucide-react";
import MeasurelyConverterTool from "@/components/text-tools/unit-converter/MeasurelyConverterTool";
import BlogCard from "@/components/BlogCard";
import { getToolTheme } from "@/data/toolThemes";
import { getBlogsByTool } from "@/lib/blogs";
import { SITE_URL } from "@/lib/site";

// TODO: confirm this matches the slug you register in @/data/tools (TOOLS
// array) and @/data/toolThemes (TOOL_THEMES) — both need this exact string,
// and the route folder must match too:
// src/app/free-online-tools/unit-converter/page.js
const SLUG = "unit-converter";
const PATH = `/free-online-tools/${SLUG}`;

export const metadata = {
  title: { absolute: "Measurely – Free Online Unit Converter | Entertainment Couch" },
  description:
    "Convert miles to kilometers, pounds to kilograms, Fahrenheit to Celsius and more. Fast, accurate unit conversion for length, weight, temperature, volume, speed, area, data and time.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Measurely – Free Online Unit Converter | Entertainment Couch",
    description:
      "Convert miles to kilometers, pounds to kilograms, Fahrenheit to Celsius and more. Fast, accurate unit conversion for length, weight, temperature, volume, speed, area, data and time.",
    url: PATH,
    type: "website",
  },
};

const FAQS = [
  { q: "Is Measurely free to use?", a: "Yes, every category and conversion is free with no sign-up, no account, and no usage limit." },
  { q: "Is any of my data sent to a server?", a: "No. Every calculation happens in your browser with plain JavaScript — the numbers you type are never transmitted anywhere." },
  { q: "How accurate are Measurely's conversions?", a: "Measurely uses standard internationally recognized conversion factors (1 mile = 1.609344 km, 1 pound = 0.45359237 kg, and so on) and computes results at full floating-point precision before rounding only the display." },
  { q: "Why does temperature convert differently from the others?", a: "Length, weight, and most other units share a zero point, so a simple multiplier works. Celsius, Fahrenheit, and Kelvin have different zero points, so they need a formula — Fahrenheit to Celsius, for example, is (F − 32) × 5⁄9." },
  { q: "Are the volume units US customary or UK imperial?", a: "US customary. A US gallon, quart, pint, cup, and fluid ounce are all noticeably smaller than their UK imperial counterparts, so double-check if you're converting a UK recipe or fuel figure." },
  { q: "Is data storage converted using 1000 or 1024?", a: "Measurely uses the binary convention: 1 KB = 1024 bytes, 1 MB = 1024 KB, and so on — matching how Windows and macOS typically report file and drive sizes." },
  { q: "Why isn't there a \"month\" or \"year\" option in the time converter?", a: "Months and years don't have a fixed length — months run 28 to 31 days and years vary with leap days — so a single multiplier would be misleading. Measurely sticks to units with a constant length: seconds, minutes, hours, days, and weeks." },
  { q: "Does switching categories keep the number I typed?", a: "No — switching categories resets the amount back to 1, since each category starts fresh with its own default pair of units." },
  { q: "Why is the \"To\" field read-only — can't I type into it?", a: "The \"To\" field always shows the calculated result. To convert in the other direction, use the swap button, which flips which side is the source and which is the target." },
];

export default async function MeasurelyPage() {
  const { Icon, rgb } = getToolTheme(SLUG);
  const relatedBlogs = await getBlogsByTool(SLUG);
  const pageUrl = `${SITE_URL}${PATH}`;
  const description =
    "Convert miles to kilometers, pounds to kilograms, Fahrenheit to Celsius and more. Fast, accurate unit conversion for length, weight, temperature, volume, speed, area, data and time.";

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
      { "@type": "ListItem", position: 3, name: "Unit Converter", item: pageUrl },
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
            Unit Converter
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Measurely: Unit Converter
          </h1>
          <p className="mt-2 leading-relaxed text-muted">{description}</p>
        </div>
      </header>

      <div className="mt-10">
        <MeasurelyConverterTool />
      </div>

      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          About this converter
        </h2>
        <div className="panel-flat space-y-5 rounded-xl p-6 sm:p-8">
          <div>
            <h3 className="font-semibold text-fg">Full precision, rounded only for display</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Every conversion runs at full floating-point precision internally and is rounded to up to six decimal
              places only when it's shown — so chaining or repeating conversions won't compound rounding errors the
              way some tools do.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">Why temperature works differently</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Length, weight, and most other categories share a zero point, so a single multiplier converts between
              units. Celsius, Fahrenheit, and Kelvin don't — each has a different zero — so temperature uses a
              proper offset-and-scale formula instead of a simple factor.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">Where this runs</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Every calculation executes in your browser with plain JavaScript. Nothing you type is uploaded, logged,
              or stored anywhere — switch categories or refresh the page and it resets to the default pair.
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
