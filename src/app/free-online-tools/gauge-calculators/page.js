import Link from "next/link";
import { ChevronDown, ChevronLeft } from "lucide-react";
import GaugeCalculatorTool from "@/components/text-tools/gauge-calculators/GaugeCalculatorTool";
import BlogCard from "@/components/BlogCard";
import { getToolTheme } from "@/data/toolThemes";
import { getBlogsByTool } from "@/lib/blogs";
import { SITE_URL } from "@/lib/site";

// TODO: confirm this matches the slug you register for Gauge in @/data/tools
// (TOOLS array) and in @/data/toolThemes (TOOL_THEMES) — both need to use
// this exact string, and the folder this file lives in must match too:
// src/app/free-online-tools/gauge-calculators/page.js
const SLUG = "gauge-calculators";
const PATH = `/free-online-tools/${SLUG}`;

export const metadata = {
  title: { absolute: "Gauge – Free BMI, Mortgage & Percentage Calculator | Entertainment Couch" },
  description:
    "Free online BMI calculator, mortgage payment calculator, and percentage calculator — all in one tool. No sign-up, nothing saved, works on any device.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Gauge – Free BMI, Mortgage & Percentage Calculator | Entertainment Couch",
    description:
      "Free online BMI calculator, mortgage payment calculator, and percentage calculator — all in one tool. No sign-up, nothing saved, works on any device.",
    url: PATH,
    type: "website",
  },
};

const FAQS = [
  { q: "Is Gauge free to use?", a: "Yes. Every calculator on this page is free, with no account, no sign-up, and no usage limit." },
  { q: "Is my data saved or uploaded anywhere?", a: "No. Every calculation happens locally in your browser. Nothing you type is sent to a server, stored, or logged." },
  { q: "What is BMI and how is it calculated?", a: "Body mass index (BMI) compares your weight to your height. It's calculated as weight in kilograms divided by height in metres squared." },
  { q: "How is a monthly mortgage payment calculated?", a: "The standard formula is M = P × r(1+r)^n ÷ ((1+r)^n − 1), where P is the loan amount, r is the monthly interest rate, and n is the number of payments." },
  { q: "Does this include PMI or lender fees?", a: "No. It calculates principal and interest plus any taxes, insurance and HOA you enter manually — it doesn't include lender fees, closing costs, discount points or private mortgage insurance." },
  { q: "Can I calculate a mortgage in a currency other than US dollars?", a: "Yes — the currency dropdown covers 158 currencies. Every figure on the mortgage calculator updates to show that currency's symbol." },
  { q: "How do you calculate a percentage of a number?", a: "Divide the percentage by 100, then multiply by the number. 15% of 240 is (15 ÷ 100) × 240, which equals 36." },
  { q: "Percentage change vs. percentage points — what's the difference?", a: "Percentage change measures relative movement (20 to 25 is a 25% increase), while percentage points measure the raw gap between two percentages (20% to 25% is a 5 percentage point rise)." },
];

export default async function GaugeCalculatorPage() {
  const { Icon, rgb } = getToolTheme(SLUG);
  const relatedBlogs = await getBlogsByTool(SLUG);
  const pageUrl = `${SITE_URL}${PATH}`;
  const description =
    "Free online BMI calculator, mortgage payment calculator, and percentage calculator — all in one tool. No sign-up, nothing saved, works on any device.";

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
      { "@type": "ListItem", position: 3, name: "BMI, Mortgage & Percentage Calculator", item: pageUrl },
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
            BMI, Mortgage &amp; Percentage
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Gauge: BMI, Mortgage &amp; Percentage Calculator
          </h1>
          <p className="mt-2 leading-relaxed text-muted">{description}</p>
        </div>
      </header>

      <div className="mt-10">
        <GaugeCalculatorTool />
      </div>

      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          About these calculators
        </h2>
        <div className="panel-flat space-y-5 rounded-xl p-6 sm:p-8">
          <div>
            <h3 className="font-semibold text-fg">What the BMI number actually tells you</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              BMI compares weight to height using the WHO adult reference ranges — under 18.5 is underweight, 18.5–25
              is healthy, 25–30 is overweight, and above 30 is obese. It's a quick population-level screen, not a
              diagnosis, and doesn't account for muscle mass, bone density, age, or sex.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">What the mortgage estimate includes — and doesn't</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              The monthly figure covers principal and interest, plus taxes, insurance, and HOA dues if you add them.
              It doesn't include lender fees, closing costs, discount points, or private mortgage insurance, so treat
              it as a planning estimate rather than a loan quote.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">Where this runs</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Every calculation executes in your browser. Nothing you type — height, weight, home price, income
              figures — is uploaded, logged, or stored anywhere.
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
