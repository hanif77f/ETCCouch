"use client";

import Link from "next/link";
import { getImageProps } from "next/image";
import { useEffect, useState } from "react";

const AUTOPLAY_MS = 6500;

const HERO_CONTENT = {
  sports: {
    desktop: "/images/hero/sports.png",
    mobile: "/images/mobilehero/5.png",
    title: "The stories behind every big sporting moment",
    secondaryHref: "/games",
    secondaryLabel: "Play free games",
  },
  "movies-tv": {
    desktop: "/images/hero/drama.png",
    mobile: "/images/mobilehero/4.png",
    title: "Your next great watch starts here",
    secondaryHref: "/category/trending-now",
    secondaryLabel: "See what’s trending",
  },
  "technology-ai": {
    desktop: "/images/hero/technology_ai.png",
    mobile: "/images/mobilehero/3.png",
    title: "Understand the technology shaping tomorrow",
    secondaryHref: "/free-online-tools",
    secondaryLabel: "Explore free tools",
  },
};

function ResponsiveHeroImage({ media, alt, eager }) {
  const common = { alt, sizes: "100vw" };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    ...common,
    src: media.desktop,
    width: 1600,
    height: 850,
    quality: 82,
  });
  const {
    props: { srcSet: mobileSrcSet, ...mobileProps },
  } = getImageProps({
    ...common,
    src: media.mobile,
    width: 1080,
    height: 1920,
    quality: 76,
  });

  return (
    // The image remains a background layer at every breakpoint. The hero
    // stage owns its dimensions so loading a new source cannot move content.
    <picture className="absolute inset-0 z-0">
      <source media="(min-width: 768px)" srcSet={desktopSrcSet} />
      <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
      <img
        {...mobileProps}
        alt={alt}
        fetchPriority={eager ? "high" : "auto"}
        className="h-full w-full object-cover object-center"
      />
    </picture>
  );
}

function SlideHeading({ primary, children }) {
  const classes =
    "max-w-2xl font-display text-[2.35rem] font-bold leading-[1.04] tracking-[-0.035em] text-ink sm:text-5xl lg:text-[3.65rem]";

  return primary ? <h1 className={classes}>{children}</h1> : <h2 className={classes}>{children}</h2>;
}

export default function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return undefined;
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  if (!slides.length) return null;

  const showSlide = (nextIndex) => {
    setIndex((nextIndex + slides.length) % slides.length);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured topics"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="relative isolate mt-4 h-[610px] w-full overflow-hidden bg-[#f5f1fb] sm:h-[640px] md:mt-6 md:h-auto md:aspect-[32/17]"
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, slideIndex) => {
          const media = HERO_CONTENT[slide.slug];
          if (!media) return null;
          const active = slideIndex === index;

          return (
            <article
              key={slide.slug}
              aria-hidden={!active}
              className="relative isolate h-full w-full shrink-0"
            >
              <ResponsiveHeroImage
                media={media}
                alt=""
                eager={slideIndex === 0}
              />

              {/* Gradient scrim is mobile-only — on desktop the image shows with no overlay. */}
              <div className="absolute inset-0 z-[1] bg-gradient-to-t from-white via-white/75 to-white/5 md:hidden" />
              <div className="absolute inset-0 z-[1] bg-[linear-gradient(180deg,transparent_35%,rgba(255,255,255,0.96)_72%)] md:hidden" />

              <div className="container-page absolute inset-0 z-[2] flex items-end pb-16 pt-20 sm:pb-20 md:items-center md:pb-10 md:pt-10">
                <div className="w-full bg-transparent p-0 md:max-w-[650px]">
                  <span
                    className="mb-4 inline-flex items-center gap-2 rounded-full border bg-white/85 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] shadow-sm"
                    style={{ color: slide.color, borderColor: `${slide.color}30` }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: slide.color }} />
                    {slide.name}
                  </span>

                  <SlideHeading primary={slideIndex === 0}>{media.title}</SlideHeading>
                  <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base sm:leading-7 md:text-[17px]">
                    {slide.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={`/category/${slide.slug}`}
                      tabIndex={active ? 0 : -1}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:-translate-y-0.5 hover:bg-brand-dark"
                    >
                      Explore {slide.name}
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                    <Link
                      href={media.secondaryHref}
                      tabIndex={active ? 0 : -1}
                      className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-white/80 px-5 py-2.5 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:border-brand/40 hover:text-brand"
                    >
                      {media.secondaryLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {slides.length > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-2 md:bottom-6">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.slug}
                type="button"
                onClick={() => showSlide(slideIndex)}
                aria-label={`Show ${slide.name}`}
                aria-current={slideIndex === index ? "true" : undefined}
                className={`pointer-events-auto h-2 rounded-full transition-all ${
                  slideIndex === index ? "w-8 bg-brand" : "w-2 bg-ink/25 hover:bg-brand/60"
                }`}
              />
            ))}
          </div>

          <div className="absolute right-4 top-5 z-10 flex gap-2 md:right-7 md:top-1/2 md:-translate-y-1/2 md:flex-col">
            <button
              type="button"
              onClick={() => showSlide(index - 1)}
              aria-label="Previous featured topic"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/85 text-ink shadow-lg backdrop-blur transition hover:bg-white hover:text-brand"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => showSlide(index + 1)}
              aria-label="Next featured topic"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/85 text-ink shadow-lg backdrop-blur transition hover:bg-white hover:text-brand"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
