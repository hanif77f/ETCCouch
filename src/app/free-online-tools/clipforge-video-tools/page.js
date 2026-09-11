import Link from "next/link";
import { ChevronDown, ChevronLeft } from "lucide-react";
import ClipforgeVideoTools from "@/components/video-tools/clipforge-video-tools/ClipforgeVideoTools";
import BlogCard from "@/components/BlogCard";
import { getToolTheme } from "@/data/toolThemes";
import { getBlogsByTool } from "@/lib/blogs";
import { SITE_URL } from "@/lib/site";

const PATH = "/free-online-tools/clipforge-video-tools";

export const metadata = {
  title: { absolute: "ClipForge – Free Online Video Tools | Entertainment Couch" },
  description:
    "Play, inspect, compress, convert, resize, crop, rotate and enhance video, or extract audio — free in your browser with no uploads.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "ClipForge – Free Online Video Tools | Entertainment Couch",
    description:
      "Ten private browser-based video tools for playback, metadata, compression, conversion, editing and audio extraction.",
    url: PATH,
    type: "website",
  },
};

const FAQS = [
  {
    q: "Is ClipForge free to use?",
    a: "Yes. All ten tools are free, with no account, no sign-up and no watermark added to your output.",
  },
  {
    q: "Are my video files uploaded anywhere?",
    a: "No. Playback, inspection and processing happen in your browser. Your files are not sent to a server.",
  },
  {
    q: "Why does the video engine take time to start?",
    a: "Editing tools load a WebAssembly version of FFmpeg the first time you process a file. Later jobs in the same tab reuse the loaded engine.",
  },
  {
    q: "Which video formats can I convert to?",
    a: "ClipForge can create MP4, WebM, MKV, MOV and animated GIF output. Browser preview support varies by output format.",
  },
  {
    q: "Does changing FPS make a video smoother?",
    a: "It changes the encoded frame rate but cannot create genuine detail between existing frames, so a large increase may repeat frames rather than add smoothness.",
  },
  {
    q: "Can ClipForge improve a blurry video?",
    a: "The Enhance tool can sharpen detail, reduce noise and adjust color, but it is not AI upscaling and cannot recreate detail missing from the source.",
  },
  {
    q: "Which audio formats can I extract?",
    a: "You can extract audio as MP3, WAV, M4A/AAC or OGG Vorbis, provided the source video contains a readable audio track.",
  },
  {
    q: "Is there a video file-size limit?",
    a: "ClipForge does not impose a fixed limit, but large files need more browser memory and processing time. Shorter clips are faster and more reliable, especially on mobile.",
  },
];

export default async function ClipforgeVideoToolsPage() {
  const { Icon, rgb } = getToolTheme("clipforge-video-tools");
  const relatedBlogs = await getBlogsByTool("clipforge-video-tools");
  const pageUrl = `${SITE_URL}${PATH}`;
  const description =
    "Play, inspect, compress, convert, resize, crop, rotate and enhance videos, or extract their audio — privately in your browser.";

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
      { "@type": "ListItem", position: 3, name: "ClipForge Video Tools", item: pageUrl },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "ClipForge",
    url: pageUrl,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any modern web browser",
    description,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />

      <Link
        href="/free-online-tools"
        className="inline-flex w-fit items-center gap-1 rounded-lg text-sm text-muted transition hover:text-fg focus-ring"
      >
        <ChevronLeft size={16} /> All video tools
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
            Video Tools
          </span>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            ClipForge: Free Online Video Tools
          </h1>
          <p className="mt-2 leading-relaxed text-muted">{description}</p>
        </div>
      </header>

      <div className="mt-10">
        <ClipforgeVideoTools />
      </div>

      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          About ClipForge video tools
        </h2>
        <div className="panel-flat space-y-5 rounded-xl p-6 sm:p-8">
          <div>
            <h3 className="font-semibold text-fg">Ten tools in one private workshop</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Preview a local video, inspect its metadata, compress or convert it, change frame rate, crop, enhance,
              extract audio, resize dimensions, and correct its orientation from one browser-based interface.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">Your files remain on your device</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              ClipForge reads and processes selected files locally. The editing engine runs as WebAssembly inside the
              current browser tab instead of uploading your videos for server-side conversion.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-fg">Designed for short, practical jobs</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Browser processing is ideal for clips and everyday conversions. Processing speed depends on video
              length, resolution, selected operation, and the memory and CPU available on your device.
            </p>
          </div>
        </div>
      </section>

      {relatedBlogs.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">Related posts</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedBlogs.map((blog) => <BlogCard key={blog.slug} blog={blog} />)}
          </div>
        </section>
      )}

      <section className="mt-16">
        <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">Quick answers</h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-border bg-card p-5 shadow-soft [&::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-fg marker:content-none">
                {faq.q}
                <ChevronDown size={18} className="shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
