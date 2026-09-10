import Link from "next/link";
import { ChevronDown, ChevronLeft } from "lucide-react";
import WordCounterTool from "@/components/text-tools/word-counter/WordCounterTool";
import BlogCard from "@/components/BlogCard";
import { getToolTheme } from "@/data/toolThemes";
import { getBlogsByTool } from "@/lib/blogs";
import { SITE_URL } from "@/lib/site";

// Kept in sync with `metadataBase` in `src/app/layout.js`.
const PATH = "/free-online-tools/word-counter";

// `absolute` opts this page out of the "%s · EntertainmentCouch" title
// template set in the root layout — the brand name is already baked into
// this exact title tag, so the template would otherwise double it up.
export const metadata = {
  title: { absolute: "Wordbench – Free Word Counter & Text Tools | Entertainment Couch" },
  description:
    "Free online word counter, character counter, case converter, and text formatter — all in one tool. No sign-up, nothing saved, works on any device.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Wordbench – Free Word Counter & Text Tools | Entertainment Couch",
    description:
      "Free online word counter, character counter, case converter, and text formatter — all in one tool. No sign-up, nothing saved, works on any device.",
    url: PATH,
    type: "website",
  },
};

const FAQS = [
  {
    q: "Is Wordbench free to use?",
    a: "Yes. Every tool on this page is free, with no account, no sign-up, and no usage limit.",
  },
  {
    q: "Does my text get uploaded or stored anywhere?",
    a: "No. Everything runs in your browser using JavaScript. Nothing you type is sent to a server, logged, or saved — refresh the page and it's gone.",
  },
  {
    q: "What exactly counts as a \"word\"?",
    a: "Wordbench counts words the way most word processors do: any run of characters separated by whitespace. Punctuation attached to a word (like \"don't\" or \"well-known\") doesn't split it into two.",
  },
  {
    q: "How is reading time calculated?",
    a: "Reading time assumes an average pace of 200 words per minute; speaking time assumes about 130 words per minute, roughly the pace of a spoken presentation. Both are estimates — actual pace varies by reader and content.",
  },
  {
    q: "Will using a formatting tool change my original text?",
    a: "No. Each tool leaves your original text in the input box untouched and puts the result in a separate output box, so you can compare the two or start over at any time.",
  },
  {
    q: "What's the difference between snake_case and kebab-case?",
    a: "Both lowercase your text and remove spaces and punctuation. snake_case joins words with underscores (common in code variables and file names), while kebab-case joins them with hyphens (common in URLs and CSS classes).",
  },
  {
    q: "What does \"whole word only\" do in Find & Replace?",
    a: "With it checked, \"cat\" will match \"cat\" but not \"category\" or \"concatenate\". With it unchecked, Find & Replace matches the text anywhere it appears, even inside a longer word.",
  },
  {
    q: "Is the Base64 tool safe for encoding sensitive information?",
    a: "Base64 is an encoding, not encryption — anyone who decodes the result gets your original text back. It's meant for tasks like preparing text for systems that require Base64 format, not for keeping anything secret.",
  },
  {
    q: "Does the Palindrome Checker ignore spaces and punctuation?",
    a: "Yes. It strips out spaces, punctuation, and capitalization before comparing, so phrases like \"A man, a plan, a canal, Panama\" are correctly recognized as palindromes, not just single words.",
  },
];

export default async function WordCounterPage() {
  const { Icon, rgb } = getToolTheme("word-counter-text-tools");
  const relatedBlogs = await getBlogsByTool("word-counter");
  const pageUrl = `${SITE_URL}${PATH}`;
  const description =
    "Free online word counter, character counter, case converter, and text formatter — all in one tool. No sign-up, nothing saved, works on any device.";

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
      { "@type": "ListItem", position: 3, name: "Word Counter & Text Tools", item: pageUrl },
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
            Word Counter &amp; Text Tools
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Wordbench: Word Counter &amp; Text Tools
          </h1>
          <p className="mt-2 leading-relaxed text-muted">{description}</p>
        </div>
      </header>

      <div className="mt-10">
        <WordCounterTool />
      </div>

      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          About these tools
        </h2>
        <div className="panel-flat space-y-5 rounded-xl p-6 sm:p-8">
          <div>
            <h3 className="font-semibold text-fg">What counts as a &quot;word&quot;</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Wordbench counts the way most word processors do — any run of characters separated by whitespace, so
              punctuation attached to a word (like &quot;don&apos;t&quot; or &quot;well-known&quot;) never splits it
              into two. Sentences are split on periods, question marks, and exclamation points; paragraphs are
              detected by blank lines between blocks of text.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">Why nothing here touches your original text</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Every tool — case conversion, formatting, find &amp; replace, reversing — reads from one box and writes
              to a separate result box. Your original stays untouched, so you can try a few options on the same
              input, or start over any time, without losing what you pasted in.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">Where this runs</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Everything on this page executes in your browser with plain JavaScript. Nothing you type is uploaded,
              logged, or stored anywhere — close or refresh the tab and it&apos;s gone for good.
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
