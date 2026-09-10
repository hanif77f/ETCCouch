import Link from "next/link";
import StaticPageHero from "@/components/StaticPageHero";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const title = "Privacy Policy";
const description = `How ${SITE_NAME} collects, uses, and protects information when you use our site.`;
const LAST_UPDATED = "September 8, 2026";

export const metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/privacy-policy") },
  openGraph: { type: "website", title, description, url: absoluteUrl("/privacy-policy") },
  twitter: { card: "summary_large_image", title, description },
};

const sections = [
  { id: "introduction", label: "1. Introduction" },
  { id: "information-we-collect", label: "2. Information We Collect" },
  { id: "how-we-use", label: "3. How We Use Information" },
  { id: "cookies", label: "4. Cookies & Local Storage" },
  { id: "sharing", label: "5. How We Share Information" },
  { id: "third-party", label: "6. Third-Party Links" },
  { id: "retention", label: "7. Data Retention" },
  { id: "your-rights", label: "8. Your Rights & Choices" },
  { id: "children", label: "9. Children's Privacy" },
  { id: "changes", label: "10. Changes to This Policy" },
  { id: "contact", label: "11. Contact Us" },
];

export default function PrivacyPolicyPage() {
  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Privacy Policy", path: "/privacy-policy" },
  ]);
  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl("/privacy-policy"),
    dateModified: "2026-09-08",
  };

  return (
    <div className="pb-20">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={webPageLd} />

      <StaticPageHero
        eyebrow="Legal"
        title="Privacy Policy"
        description={`Last updated: ${LAST_UPDATED}. This explains what information ${SITE_NAME} collects and how it's used.`}
      />

      <div className="container-page grid grid-cols-1 gap-12 py-14 lg:grid-cols-[220px_1fr]">
        <nav className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-1 border-l border-black/5 pl-4 text-[13px]">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="py-1 text-ink/70 hover:text-brand">
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        <article className="prose-page max-w-3xl">
          <p className="text-xs italic text-muted">
            This page is a general template provided for convenience and does not constitute legal advice. It
            has not been reviewed by an attorney — please have counsel review and adapt it, and confirm it
            meets any regulations that apply to your audience (such as GDPR or CCPA), before relying on it.
          </p>

          <h2 id="introduction">1. Introduction</h2>
          <p>
            This Privacy Policy describes how {SITE_NAME} (&quot;we&quot;, &quot;us&quot;) collects, uses, and protects
            information when you visit the Site, submit a blog post, play a linked game, or contact us.
          </p>

          <h2 id="information-we-collect">2. Information We Collect</h2>
          <p>We collect information in a few limited ways:</p>
          <ul>
            <li>
              <strong>Contact form submissions</strong> — the name, email address, and message you provide
              when you use our <Link href="/contact">Contact page</Link>.
            </li>
            <li>
              <strong>Blog submissions</strong> — the author name, title, content, category, and any image
              you provide through <Link href="/create-blog">Create New Blog</Link>. Submitted images are
              stored on the Site so they can be displayed alongside your post.
            </li>
            <li>
              <strong>Basic technical data</strong> — standard server information such as browser type and
              pages visited, which most websites collect automatically as part of normal operation.
            </li>
          </ul>
          <p>We do not require you to create an account, and we do not knowingly collect payment information.</p>

          <h2 id="how-we-use">3. How We Use Information</h2>
          <p>We use the information above to:</p>
          <ul>
            <li>Respond to messages sent through our Contact page;</li>
            <li>Publish and display blog posts submitted through the Site;</li>
            <li>Maintain, secure, and improve the Site; and</li>
            <li>Meet legal obligations where applicable.</li>
          </ul>
          <p>We do not sell your personal information.</p>

          <h2 id="cookies">4. Cookies &amp; Local Storage</h2>
          <p>
            The Site does not use tracking or advertising cookies. Any storage used by the browser (for
            example, to remember a preference while you browse) stays on your own device and is not shared
            with us or any third party.
          </p>

          <h2 id="sharing">5. How We Share Information</h2>
          <p>
            We do not share, rent, or sell the information described above to third parties, except where
            required by law or to protect the rights, property, or safety of {SITE_NAME}, our users, or the
            public.
          </p>

          <h2 id="third-party">6. Third-Party Links</h2>
          <p>
            Our <Link href="/games">Games</Link> page links to external, independently operated websites.
            Once you leave our Site to play a game, that site&apos;s own privacy policy applies — we
            encourage you to review it, since we have no control over how those sites handle information.
          </p>

          <h2 id="retention">7. Data Retention</h2>
          <p>
            Contact form messages and submitted blog posts are stored for as long as needed to respond to
            your message or keep your post published. You can ask us to remove your submitted content or
            message at any time by contacting us.
          </p>

          <h2 id="your-rights">8. Your Rights &amp; Choices</h2>
          <p>
            Depending on where you live, you may have the right to request access to, correction of, or
            deletion of your personal information. To make a request, use our{" "}
            <Link href="/contact">Contact page</Link> and we will respond as soon as we reasonably can.
          </p>

          <h2 id="children">9. Children&apos;s Privacy</h2>
          <p>
            The Site is not directed at children under 13, and we do not knowingly collect personal
            information from children under 13. If you believe a child has provided us with personal
            information, please contact us so we can remove it.
          </p>

          <h2 id="changes">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes take effect as soon as they&apos;re
            posted on this page, along with an updated &quot;Last updated&quot; date.
          </p>

          <h2 id="contact">11. Contact Us</h2>
          <p>
            Questions about this policy or your information? <Link href="/contact">Contact us</Link> or email
            us directly at <a href="mailto:info.entertainmentcouch@gmail.com">info.entertainmentcouch@gmail.com</a>.
          </p>
        </article>
      </div>
    </div>
  );
}
