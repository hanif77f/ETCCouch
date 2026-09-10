import Link from "next/link";
import StaticPageHero from "@/components/StaticPageHero";
import ContactForm from "@/components/ContactForm";
import JsonLd from "@/components/JsonLd";
import { StayConnected } from "@/components/Sidebar";
import { breadcrumbSchema } from "@/lib/schema";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const title = "Contact Us";
const description =
  "Get in touch with ETC Entertainment Couch — send us a message, find our email, or check answers to common questions about the site.";

export const metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/contact") },
  openGraph: { type: "website", title, description, url: absoluteUrl("/contact") },
  twitter: { card: "summary_large_image", title, description },
};

const faqs = [
  {
    q: "How do I submit a guest post?",
    a: "Head over to Create New Blog, choose a category, and publish. Every submission goes live immediately and appears on its category page and its own blog page — see our Terms & Conditions for what we expect from submitted content.",
  },
  {
    q: "I found a bug in one of the games — who do I tell?",
    a: "Use the form on this page and mention which game and what happened. Since the games link out to third-party sites, some issues may need to be reported to that site directly, but let us know either way.",
  },
  {
    q: "Do you accept advertising or sponsorship inquiries?",
    a: "Yes — send a message using the form with \"Partnership\" as the subject and a member of our team will follow up.",
  },
  {
    q: "How quickly will I hear back?",
    a: "We read every message that comes in through this form. Response times vary, but we aim to get back to genuine inquiries within a few business days.",
  },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function ContactPage() {
  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Contact Us", path: "/contact" },
  ]);

  return (
    <div className="pb-20">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={faqLd} />

      <StaticPageHero
        eyebrow="We'd love to hear from you"
        title="Contact Us"
        description={`Questions, tips, corrections or partnership ideas — here's how to reach the ${SITE_NAME} team.`}
      />

      <div className="container-page grid grid-cols-1 gap-12 py-14 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-12">
          <ContactForm />

          <div className="prose-page max-w-3xl">
            <h2>Frequently asked questions</h2>
            {faqs.map((f) => (
              <div key={f.q} className="mb-6">
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-6">
          <div className="rounded-xl bg-zinc-50 p-5">
            <h3 className="mb-3 text-sm font-bold tracking-wide text-ink">EMAIL US</h3>
            <a
              href="mailto:info.entertainmentcouch@gmail.com"
              className="flex items-center gap-2 text-sm font-medium text-ink/80 hover:text-brand"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
           info.entertainmentcouch@gmail.com
            </a>
            <p className="mt-3 text-xs leading-5 text-muted">
              Prefer email? Write to us directly and we&apos;ll route your message to the right person.
            </p>
          </div>

          <StayConnected />

          <div className="rounded-xl bg-zinc-50 p-5">
            <h3 className="mb-2 text-sm font-bold tracking-wide text-ink">SOMETHING ELSE?</h3>
            <p className="text-[13px] leading-6 text-muted">
              Want to write for us instead?{" "}
              <Link href="/create-blog" className="font-semibold text-brand">
                Submit a post
              </Link>
              . Curious how we handle your data?{" "}
              <Link href="/privacy-policy" className="font-semibold text-brand">
                Read our Privacy Policy
              </Link>
              .
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
