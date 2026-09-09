import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import GamePageShell from "@/components/common/GamePageShell";
import GameBoardSkeleton from "@/components/common/GameBoardSkeleton";
import GameInfoSections from "@/components/common/GameInfoSections";
import { getGame, getGameSlugs } from "@/data/playGames";
import { getGameTheme } from "@/data/gameThemes";
import { getGameSeo } from "@/data/gameSeo";
import { getGameGuide } from "@/data/gameGuides";
import { SITE_URL } from "@/lib/site";

// Kept in sync with `metadataBase` in `src/app/layout.js` — used to emit
// absolute URLs inside JSON-LD (schema fields expect a full URL, unlike
// Next's `alternates.canonical`, which resolves relative paths itself).
export function generateStaticParams() {
  return getGameSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  const seo = getGameSeo(slug);

  const title = seo?.metaTitle || game.name;
  const description = seo?.metaDescription || game.description;
  const ogTitle = seo?.ogTitle || title;
  const ogDescription = seo?.ogDescription || description;
  const path = `/games/${slug}`;

  return {
    title,
    description,
    keywords: seo ? [seo.primaryKeyword, ...seo.secondaryKeywords] : undefined,
    alternates: { canonical: path },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: path,
      type: "website",
      images: [{ url: game.cover, alt: `${game.name} — play online free` }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [game.cover],
    },
  };
}

export default async function GamePage({ params }) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const theme = getGameTheme(slug);
  const { Icon, tagline, rgb } = theme;
  const seo = getGameSeo(slug);
  const guide = getGameGuide(slug);
  const pageUrl = `${SITE_URL}/games/${slug}`;

  // Schema.org structured data: the game itself, its place in the site
  // hierarchy, and its FAQ block (mirrors the visible FAQ in
  // GameInfoSections, which is required for FAQPage rich results).
  const gameSchema = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.name,
    description: seo?.metaDescription || game.description,
    url: pageUrl,
    image: game.cover,
    genre: game.tags,
    playMode: game.players?.includes("2") ? ["SinglePlayer", "MultiPlayer"] : "SinglePlayer",
    applicationCategory: "Game",
    operatingSystem: "Any (Web Browser)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Games", item: `${SITE_URL}/games` },
      { "@type": "ListItem", position: 3, name: game.name, item: pageUrl },
    ],
  };

  const faqSchema = guide?.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: guide.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      }
    : null;

  return (
    <div className="flex flex-col">
      {/* Structured data: game details, breadcrumb trail and (when present) FAQ rich results. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gameSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}
      {/* Full-bleed play stage: one background carrying the board + controls.
          The complete board shows directly on every screen. */}
      <Suspense fallback={<GameBoardSkeleton />}>
        <GamePageShell game={game} />
      </Suspense>

      {/* Everything descriptive sits BELOW the stage */}
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/games"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted transition hover:text-fg focus-ring rounded-lg"
        >
          <ChevronLeft size={16} /> All games
        </Link>

        <header className="mt-4 flex items-start gap-4">
          {/* Big, relevant game icon in a tinted tile */}
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
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
                {seo?.h1 || game.name}
              </h1>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
                style={{ backgroundColor: `rgb(${rgb} / 0.12)`, color: `rgb(${rgb})` }}
              >
                {tagline}
              </span>
            </div>
            <p className="mt-2 leading-relaxed text-muted">{game.description}</p>
          </div>
        </header>
      </div>

      {/* Relevant supporting sections */}
      <GameInfoSections game={game} />
    </div>
  );
}
