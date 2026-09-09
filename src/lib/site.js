// Central site-wide constants used for SEO metadata, Open Graph tags and
// structured data. Update SITE_URL once this site has a real production
// domain — it feeds canonical URLs, the sitemap and JSON-LD.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.entertainmentcouch.com").replace(/\/$/, "");
export const SITE_NAME = "ETC Entertainment Couch";
export const SITE_TITLE = "ETC | Entertainment Couch";
export const SITE_DESCRIPTION =
  "Stay updated with the latest news, movies, technology, entertainment trends and free online games — all from the comfort of your daily digital couch.";
export const TWITTER_HANDLE = "@etccouch";
export const SOCIAL_LINKS = [
  "https://facebook.com",
  "https://x.com",
  "https://instagram.com",
  "https://youtube.com",
];

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
