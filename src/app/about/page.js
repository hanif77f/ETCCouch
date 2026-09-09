import Link from "next/link";
import StaticPageHero from "@/components/StaticPageHero";
import JsonLd from "@/components/JsonLd";
import { categories } from "@/data/categories";
import { breadcrumbSchema } from "@/lib/schema";
import { absoluteUrl, SITE_NAME } from "@/lib/site";

const title = "About Us";
const description =
  "Learn about ETC Entertainment Couch — what we cover, how our team works, and why we built a home for news, entertainment, tech and free games in one place.";

export const metadata = {
  title,
  description,
  alternates: { canonical: absoluteUrl("/about") },
  openGraph: { type: "website", title, description, url: absoluteUrl("/about") },
  twitter: { card: "summary_large_image", title, description },
};

export default function AboutPage() {
  const breadcrumbLd = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
  ]);
  const aboutLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: title,
    description,
    url: absoluteUrl("/about"),
  };

  return (
    <div className="pb-20">
      <JsonLd data={breadcrumbLd} />
      <JsonLd data={aboutLd} />

      <StaticPageHero
        eyebrow="Our story"
        title={`About ${SITE_NAME}`}
        description="One home for the news, entertainment, technology and games worth your time — built for the way people actually spend their downtime."
      />

      <div className="container-page grid grid-cols-1 gap-12 py-14 lg:grid-cols-[1fr_320px]">
        <article className="prose-page max-w-3xl">
          <h2>Our story</h2>
          <p>
            ETC — short for Entertainment Couch — started from a simple observation: the best part of most
            people&apos;s day is the twenty minutes they spend catching up on what happened while they weren&apos;t
            looking. A trending story, a new trailer, a launch announcement, a score update, a deal worth
            grabbing before it&apos;s gone. None of it needs to be complicated, and none of it needs ten
            different apps.
          </p>
          <p>
            So we built one place for it. Not a single-topic blog and not an all-purpose news wire, but
            something in between — a daily digital couch where the stories are easy to find, easy to read,
            and, when you need a break from reading altogether, a free game is one click away.
          </p>

          <h2>What we cover</h2>
          <p>
            Our coverage is organized into a handful of beats that we think actually matter to how people
            spend their time online:
          </p>
          <ul>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`}>{c.name}</Link> — {c.description}
              </li>
            ))}
          </ul>
          <p>
            When we&apos;re not writing about any of that, you&apos;ll find us over on the{" "}
            <Link href="/games">Games</Link> page — a small collection of free, no-download classics for
            whenever you need five minutes away from the headlines.
          </p>

          <h2>How we work</h2>
          <p>
            We keep our editorial process straightforward. Every piece we publish is written to be useful in
            under five minutes: a clear headline, the facts up front, and enough context that you don&apos;t
            need to go read three other articles to understand what happened. We&apos;d rather publish fewer,
            better posts than chase every headline of the day.
          </p>
          <p>
            We also believe readers can be contributors. Anyone can{" "}
            <Link href="/create-blog">submit a post</Link> through our site, and submissions are reviewed
            against the same bar we hold our own writing to before they go live. See our{" "}
            <Link href="/terms">Terms &amp; Conditions</Link> for the details on what that involves.
          </p>

          <h2>Our values</h2>
          <ul>
            <li>
              <strong>Accuracy first.</strong> We&apos;d rather be a little later and correct than fast and
              wrong.
            </li>
            <li>
              <strong>Respect your time.</strong> If a story can be told in three paragraphs, we won&apos;t
              stretch it to ten.
            </li>
            <li>
              <strong>Independence.</strong> Our recommendations and coverage decisions aren&apos;t for sale.
            </li>
            <li>
              <strong>A little fun.</strong> Not everything needs to be serious — that&apos;s what the games
              are for.
            </li>
          </ul>

          <h2>Get in touch</h2>
          <p>
            Have a tip, a correction, a partnership idea, or just want to say hello? We&apos;d like to hear
            from you — visit our <Link href="/contact">Contact page</Link> and drop us a message.
          </p>
        </article>

        <aside className="flex flex-col gap-6">
          <div className="rounded-xl bg-zinc-50 p-5">
            <h3 className="mb-3 text-sm font-bold tracking-wide text-ink">QUICK LINKS</h3>
            <ul className="flex flex-col gap-2.5 text-[13px] font-medium text-ink/80">
              <li><Link href="/contact" className="hover:text-brand">Contact Us</Link></li>
              <li><Link href="/create-blog" className="hover:text-brand">Write for us</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-brand">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-brand">Terms &amp; Conditions</Link></li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
