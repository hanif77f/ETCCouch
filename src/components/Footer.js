import Link from "next/link";
import { categories } from "@/data/categories";
import SiteLogo from "@/components/SiteLogo";

const socials = [
  {
    label: "Facebook",
    href: "https://facebook.com/EntertainmentCouch",
    path: "M13.5 9H15V6.5h-1.5C11.6 6.5 10 8.1 10 10.2V12H8v2.5h2V21h2.5v-6.5h2l.5-2.5h-2.5v-1.5c0-.6.4-1 1-1Z",
  },
  {
    label: "X",
    href: "https://twitter.com/ETCouch",
    path: "M4 4l7.2 9.6L4.4 20H6l6-6.5 4.6 6.5H21l-7.6-10L20 4h-1.6l-5.5 6-4.2-6H4Z",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/entertainmentcouch",
    path: "M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3H8Zm4 3.2A4.8 4.8 0 1 1 7.2 13 4.8 4.8 0 0 1 12 8.2Zm0 2A2.8 2.8 0 1 0 14.8 13 2.8 2.8 0 0 0 12 10.2ZM17.4 6.6a1.1 1.1 0 1 1-1.1 1.1 1.1 1.1 0 0 1 1.1-1.1Z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@entertainment-couch",
    path: "M21.6 7.6a3 3 0 0 0-2.1-2.1C17.7 5 12 5 12 5s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.6 31 31 0 0 0 2 12a31 31 0 0 0 .4 4.4 3 3 0 0 0 2.1 2.1C6.3 19 12 19 12 19s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.4ZM10 15V9l5.2 3Z",
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-footer-border bg-footer-bg">
      <div className="container-page grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="inline-flex items-center" aria-label="ETC Entertainment Couch home">
            <SiteLogo className="h-14 w-32 -ml-[10px]" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
            Stay updated with the latest news, movies, technology, entertainment trends and free
            online games — all from the comfort of your daily digital couch.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold tracking-wide">QUICK LINKS</h4>
          <ul className="space-y-2.5 text-sm text-muted">
            <li><Link href="/about" className="hover:text-brand">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-brand">Contact Us</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-brand">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-brand">Terms &amp; conditions</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold tracking-wide">EXPLORE</h4>
          <ul className="space-y-2.5 text-sm text-muted">
            {categories.slice(0, 3).map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="hover:text-brand">{c.name}</Link>
              </li>
            ))}
            <li><Link href="/games" className="hover:text-brand">Games</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold tracking-wide">CONTACT US</h4>
          <a
            href="mailto:info.entertainmentcouch@gmail.com"
            className="flex items-center gap-2 text-sm text-muted hover:text-brand"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
           info.entertainmentcouch@gmail.com
          </a>
          <div className="mt-5 flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-ink/70 transition-colors hover:border-brand hover:text-brand"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-footer-border py-5 text-center text-xs text-muted">
        &copy; {year} ETC Entertainment Couch. All Rights Reserved.
      </div>
    </footer>
  );
}
