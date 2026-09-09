import Link from "next/link";
import CategoryNav from "@/components/CategoryNav";
import MobileNavDrawer from "@/components/MobileNavDrawer";
import SiteLogo from "@/components/SiteLogo";
import { categories } from "@/data/categories";

// Only categories with a hero image / curated page show up in the navbar;
// the rest (inNav: false) still have a working /category/[slug] page.
const navLinks = [
  ...categories
    .filter((c) => c.inNav !== false)
    .map((c) => ({ href: `/category/${c.slug}`, label: c.name })),
  { href: "/games", label: "Games" },
  { href: "/free-online-tools", label: "Free Online Tools" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-black/5">
      <div className="container-page flex items-center justify-between gap-6 py-2">
        <Link href="/" className="flex shrink-0 items-center" aria-label="ETC Entertainment Couch home">
          <SiteLogo preload />
        </Link>

        {/* Horizontal nav with its own overflow "More" menu — desktop/tablet only. */}
        <div className="hidden min-w-0 flex-1 md:flex">
          <CategoryNav items={navLinks} />
        </div>

        {/* Hamburger + slide-in drawer — mobile only. */}
        <MobileNavDrawer items={navLinks} />
      </div>
    </header>
  );
}
