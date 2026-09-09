import { SITE_NAME } from "@/lib/site";

export default function manifest() {
  return {
    name: SITE_NAME,
    short_name: "ETC",
    description:
      "Stay updated with the latest news, movies, technology, entertainment trends and free online games.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
