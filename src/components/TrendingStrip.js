import Image from "next/image";
import Link from "next/link";

export default function TrendingStrip({ blogs }) {
  return (
    <section>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-heading font-display">What&apos;s Trending</h2>
        <Link
          href="/category/trending-now"
          className="flex shrink-0 items-center gap-1 text-xs font-bold tracking-wide text-brand"
        >
          VIEW ALL
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 min-[480px]:grid-cols-3 md:grid-cols-6 md:gap-5">
        {blogs.map((blog) => (
          <Link
            key={blog.slug}
            href={`/blog/${blog.slug}`}
            className="group flex min-w-0 flex-col items-center gap-3 text-center"
          >
            <span className="relative aspect-square w-full max-w-24 overflow-hidden rounded-full ring-2 ring-brand ring-offset-2 sm:max-w-28">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                sizes="(max-width: 479px) 40vw, (max-width: 767px) 28vw, 112px"
                className="rounded-full object-cover transition-transform group-hover:scale-105"
              />
            </span>
            <span className="line-clamp-2 min-w-0 break-words text-xs font-semibold leading-4 text-ink group-hover:text-brand">
              {blog.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
