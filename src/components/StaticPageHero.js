export default function StaticPageHero({ eyebrow, title, description }) {
  return (
    <section className="bg-cream">
      <div className="container-page py-14 md:py-20">
        {eyebrow && (
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
        )}
        <h1 className="font-display max-w-2xl text-4xl font-bold leading-[1.08] text-ink md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-muted">{description}</p>
        )}
      </div>
    </section>
  );
}
