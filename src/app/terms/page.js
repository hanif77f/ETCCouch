import Link from "next/link";
import StaticPageHero from "@/components/StaticPageHero";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/schema";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const title = "Terms & Conditions";
const description = `The terms that govern your use of ${SITE_NAME}, including our content submission and games sections.`;
const LAST_UPDATED = "September 8, 2026";

export const metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/terms") },
  openGraph: { type: "website", title, description, url: absoluteUrl("/terms") },
  twitter: { card: "summary_large_image", title, description },
};

const sections = [
  { id: "acceptance", label: "1. Acceptance of Terms" },
  { id: "using-the-site", label: "2. Using the Site" },
  { id: "user-content", label: "3. User-Submitted Content" },
  { id: "intellectual-property", label: "4. Intellectual Property" },
  { id: "third-party", label: "5. Third-Party Links & Games" },
  { id: "prohibited-uses", label: "6. Prohibited Uses" },
  { id: "disclaimers", label: "7. Disclaimer of Warranties" },
  { id: "liability", label: "8. Limitation of Liability" },
  { id: "indemnification", label: "9. Indemnification" },
  { id: "changes", label: "10. Changes to These Terms" },
  { id: "governing-law", label: "11. Governing Law" },
  { id: "contact", label: "12. Contact Information" },
];

export default function TermsPage() {
  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Terms & Conditions", path: "/terms" },
  ]);
  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: absoluteUrl("/terms"),
    dateModified: "2026-09-08",
  };

  return (
    <div className="pb-20">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={webPageLd} />

      <StaticPageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        description={`Last updated: ${LAST_UPDATED}. Please read these terms carefully before using ${SITE_NAME}.`}
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
            has not been reviewed by an attorney — please have counsel review and adapt it before relying on
            it for your business.
          </p>

          <h2 id="acceptance">1. Acceptance of Terms</h2>
          <p>
            By accessing or using {SITE_NAME} (&quot;the Site&quot;), you agree to be bound by these Terms &amp;
            Conditions. If you do not agree with any part of these terms, please do not use the Site.
          </p>

          <h2 id="using-the-site">2. Using the Site</h2>
          <p>
            You may browse, read, and share content from the Site for personal, non-commercial use. You agree
            not to misuse the Site, including by attempting to disrupt its normal operation, accessing it
            through automated means without our permission, or using it in any way that violates applicable
            law.
          </p>

          <h2 id="user-content">3. User-Submitted Content</h2>
          <p>
            The Site allows visitors to submit blog posts through the{" "}
            <Link href="/create-blog">Create New Blog</Link> page. By submitting content, you confirm that:
          </p>
          <ul>
            <li>You wrote the content yourself, or otherwise have the right to publish it here;</li>
            <li>Any images you upload are your own, properly licensed, or otherwise free to use;</li>
            <li>Your submission does not infringe on anyone else&apos;s rights or violate any law; and</li>
            <li>
              You grant {SITE_NAME} a non-exclusive, worldwide, royalty-free license to publish, display, and
              distribute your submission on the Site.
            </li>
          </ul>
          <p>
            You retain ownership of content you submit. We reserve the right to edit, decline, or remove any
            submission at our discretion, including content that is inaccurate, offensive, spam, or otherwise
            inappropriate.
          </p>

          <h2 id="intellectual-property">4. Intellectual Property</h2>
          <p>
            Unless otherwise noted, the design, layout, logos, and original editorial content on the Site are
            the property of {SITE_NAME} and may not be reproduced, distributed, or used commercially without
            prior written permission.
          </p>

          <h2 id="third-party">5. Third-Party Links &amp; Games</h2>
          <p>
            Our <Link href="/games">Games</Link> page links out to third-party websites to let you play
            classic games such as Chess, Connect 4, Tic Tac Toe, and Battleship. These external sites are
            operated independently of {SITE_NAME}, and we are not responsible for their content, availability,
            terms of service, or privacy practices. Use of any third-party site is at your own discretion and
            subject to that site&apos;s own terms.
          </p>

          <h2 id="prohibited-uses">6. Prohibited Uses</h2>
          <p>You agree not to use the Site to:</p>
          <ul>
            <li>Submit unlawful, defamatory, obscene, or harassing content;</li>
            <li>Impersonate any person or entity, or misrepresent your affiliation with one;</li>
            <li>Upload malware or attempt to compromise the security of the Site;</li>
            <li>Scrape or harvest data from the Site for unauthorized commercial use; or</li>
            <li>Interfere with other visitors&apos; use and enjoyment of the Site.</li>
          </ul>

          <h2 id="disclaimers">7. Disclaimer of Warranties</h2>
          <p>
            The Site and its content are provided &quot;as is&quot; and &quot;as available&quot; without warranties of any
            kind, whether express or implied. We do not guarantee that the Site will be error-free,
            uninterrupted, or that its content is complete, accurate, or up to date at all times.
          </p>

          <h2 id="liability">8. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, {SITE_NAME} and its team shall not be liable for any
            indirect, incidental, special, or consequential damages arising out of or related to your use of
            the Site, including content submitted by other users or linked third-party sites.
          </p>

          <h2 id="indemnification">9. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless {SITE_NAME} from any claims, damages, or expenses arising
            from your use of the Site or content you submit, to the extent permitted by applicable law.
          </p>

          <h2 id="changes">10. Changes to These Terms</h2>
          <p>
            We may update these Terms &amp; Conditions from time to time. Changes take effect as soon as
            they&apos;re posted on this page, along with an updated &quot;Last updated&quot; date. Continued use of the
            Site after changes are posted constitutes acceptance of the revised terms.
          </p>

          <h2 id="governing-law">11. Governing Law</h2>
          <p>
            These terms are governed by the laws of the jurisdiction in which {SITE_NAME} operates, without
            regard to conflict-of-law principles, unless otherwise required by applicable local law.
          </p>

          <h2 id="contact">12. Contact Information</h2>
          <p>
            Questions about these terms? <Link href="/contact">Contact us</Link> or email us directly at{" "}
            <a href="mailto:info@entertainmentcouch.com">info@entertainmentcouch.com</a>.
          </p>
        </article>
      </div>
    </div>
  );
}
