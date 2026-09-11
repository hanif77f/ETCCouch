import Link from "next/link";
import { ChevronDown, ChevronLeft } from "lucide-react";
import LinkforgeTool from "@/components/text-tools/link-tools/LinkforgeTool";
import BlogCard from "@/components/BlogCard";
import { getToolTheme } from "@/data/toolThemes";
import { getBlogsByTool } from "@/lib/blogs";
import { SITE_URL } from "@/lib/site";

// Matches the canonical URL in the original prototype
// (https://entertainmentcouch.com/free-online-tools/link-tools/), so the
// slug below is not a guess this time — just confirm it matches whatever
// you register in @/data/tools and @/data/toolThemes, and that the route
// folder is: src/app/free-online-tools/link-tools/page.js
const SLUG = "link-tools";
const PATH = `/free-online-tools/${SLUG}`;

export const metadata = {
  title: { absolute: "Linkforge – Free URL Shortener, QR Code Generator & Link Tools | Entertainment Couch" },
  description:
    "Free business link tools: URL shortener, QR code generator, bulk QR codes, QR scanner, UTM campaign builder, URL encoder/decoder, and URL parser — all in your browser. No sign-up, nothing uploaded.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Linkforge – Free URL Shortener, QR Code Generator & Link Tools",
    description:
      "Shorten links, generate and scan QR codes, build UTM campaign links, and inspect URLs — free business link tools that run entirely in your browser.",
    url: PATH,
    type: "website",
  },
};

const FAQS = [
  { q: "Is Linkforge free to use?", a: "Yes. Every tool here — the shortener, QR generator, scanner, UTM builder, encoder, and parser — is free with no account, no sign-up, and no usage cap." },
  { q: "Does Linkforge work offline?", a: "Once the page has loaded, the shortener, QR generator, UTM builder, encoder, and parser all run entirely in your browser and don't need a connection. The QR scanner's file-upload mode also works offline; live camera scanning just needs camera permission, not internet." },
  { q: "How does the URL Shortener actually work?", a: "It generates a short code and saves the mapping between that code and your original URL in your browser's local storage. When the short link is opened in that same browser, the page reads the code from the address and redirects to the original URL." },
  { q: "Will my shortened link work if I send it to someone else?", a: "Only if they open it in the same browser on the same device where it was created — the mapping lives in that browser's local storage, not on a server. Treat this as a way to organize and label your own links rather than a public redirect service." },
  { q: "Is the Base64-style Wi-Fi QR password safe?", a: "Your Wi-Fi password is encoded directly into the QR image in your browser and never uploaded — but anyone who scans the resulting image can read the password, so treat the image itself with the same care as the password." },
  { q: "Do the tools share data with each other?", a: "A few do, deliberately — a shortened link can be turned into a QR code with one click, and a UTM-tagged URL can be sent straight to the QR generator or shortener. Nothing is shared beyond what you explicitly send from one tool to another." },
  { q: "Can I generate more than one QR code at a time?", a: "Yes — the Bulk QR Codes tool takes a list of URLs or text, one per line, and generates a code for each, with an optional ZIP download of every image." },
  { q: "Does the QR scanner upload my camera feed or images anywhere?", a: "No. Both the file-upload and live-camera scanning modes decode the QR code entirely in your browser using JavaScript — nothing is sent to a server." },
  { q: "What's the difference between the two URL encoding modes?", a: "Component mode encodes everything, including / & and ?, and is meant for a single value going into a query string. Full URL mode leaves those characters alone so a complete, working URL stays intact." },
  { q: "Why would I add UTM parameters to a link?", a: "UTM parameters (source, medium, campaign, and so on) get attached to the URL so analytics tools like Google Analytics can tell you which channel, email, or ad actually drove a visit." },
  { q: "What does the URL Parser show me?", a: "It breaks a URL down into its protocol, hostname, port, path, fragment, and every individual query parameter — useful for debugging a link or understanding what a long URL actually contains." },
  { q: "Can I back up or move my short links to another browser?", a: "Yes — use \"Export list\" to download your links as a JSON file, then \"Import list\" on another browser or device to bring them back in." },
];

export default async function LinkforgePage() {
  const { Icon, rgb } = getToolTheme(SLUG);
  const relatedBlogs = await getBlogsByTool(SLUG);
  const pageUrl = `${SITE_URL}${PATH}`;
  const description =
    "Free business link tools: URL shortener, QR code generator, bulk QR codes, QR scanner, UTM campaign builder, URL encoder/decoder, and URL parser — all in your browser. No sign-up, nothing uploaded.";

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
      { "@type": "ListItem", position: 3, name: "URL Shortener & QR Code Tools", item: pageUrl },
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
            URL Shortener &amp; QR Code Tools
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Linkforge: URL Shortener &amp; QR Code Tools
          </h1>
          <p className="mt-2 leading-relaxed text-muted">{description}</p>
        </div>
      </header>

      <div className="mt-10">
        <LinkforgeTool />
      </div>

      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          About these tools
        </h2>
        <div className="panel-flat space-y-5 rounded-xl p-6 sm:p-8">
          <div>
            <h3 className="font-semibold text-fg">Why Linkforge bundles several tools instead of just one</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Shortened links, QR codes, campaign tags, and raw URLs come up together constantly in real marketing
              and ops work, so it&apos;s faster to have them on one page than to hop between separate sites for each
              step. A few tools even hand off to each other directly — a UTM-tagged link can go straight into the QR
              generator or the shortener with one click.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">What &quot;shortened&quot; really means here</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Short links are mappings stored in your browser&apos;s local storage, not on a server — they only
              redirect when opened in the same browser that created them. Treat this as a way to organize and label
              your own links, not a public link-hosting service.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">Where this runs</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              QR generation, scanning, encoding, and parsing all execute in your browser. Nothing you paste, upload,
              or scan — URLs, Wi-Fi passwords, contact details, camera frames — is sent to a server.
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
