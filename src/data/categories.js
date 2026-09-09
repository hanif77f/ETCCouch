// Central list of blog categories. Adding an entry here automatically:
// - adds it to the /category/[slug] page
// - makes it selectable on the Create New Blog form
// `inNav: false` keeps a category out of the navbar (and its "More" menu)
// without removing its page — set it on categories that don't have posts
// or a hero image yet. `heroImage`, when set, is used on the category page
// hero instead of the generic /images/categories/<slug>.svg placeholder.
export const categories = [
  {
    slug: "trending-now",
    name: "Trending Now",
    color: "#7c3aed",
    tint: "#f3e8ff",
    tagline: "What everyone's talking about right now",
    description:
      "The stories breaking through the noise today — the headlines, launches and moments everyone is talking about right now.",
    heroImage: "/categoriespages/trendingnow.jpg",
  },
  {
    slug: "technology-ai",
    name: "Technology & AI",
    color: "#2563eb",
    tint: "#dbeafe",
    tagline: "Gadgets, software and the AI revolution",
    description:
      "From breakthrough AI tools to the latest gadgets and software updates, keep up with the technology shaping how we live and work.",
    heroImage: "/categoriespages/technology_ai.jpg",
  },
  {
    slug: "movies-tv",
    name: "Movies & TV",
    color: "#4f46e5",
    tint: "#e0e7ff",
    tagline: "Everything worth streaming and watching",
    description:
      "Reviews, premieres, streaming picks and behind-the-scenes stories from the world of film and television.",
    heroImage: "/categoriespages/movies-tv.jpg",
  },
  {
    slug: "sports",
    name: "Sports",
    color: "#dc2626",
    tint: "#fee2e2",
    tagline: "Scores, highlights and the athletes making headlines",
    description:
      "Keep up with the latest sports news, scores, highlights, major events, expert analysis, and stories about the teams and athletes making headlines.",
    heroImage: "/categoriespages/sports.jpg",
  },
  {
    slug: "health-wellness",
    name: "Health & Wellness",
    color: "#16a34a",
    tint: "#dcfce7",
    tagline: "Feel better, move more, live well",
    description:
      "Practical, evidence-based advice on fitness, nutrition, mental health and everyday habits that help you feel your best.",
    heroImage: "/categoriespages/health.jpg",
  },
  {
    slug: "lifestyle",
    name: "Lifestyle",
    color: "#db2777",
    tint: "#fce7f3",
    tagline: "Home, travel, style and everyday living",
    description:
      "Ideas and inspiration for everyday living — home, travel, style, relationships and the little things that make life better.",
    heroImage: "/categoriespages/lifestyle.jpg",
  },
  {
    slug: "deals-buying-guides",
    name: "Deals & Buying Guides",
    color: "#d97706",
    tint: "#fef3c7",
    tagline: "The best sales and what's actually worth buying",
    description:
      "Hand-picked deals and honest buying guides so you know exactly what's worth your money this season.",
    inNav: false,
  },
  {
    slug: "latest-news",
    name: "Latest News",
    color: "#0f172a",
    tint: "#e2e8f0",
    tagline: "The headlines shaping today",
    description:
      "Breaking news and the day's biggest stories from around the world, updated as events unfold.",
    heroImage: "/categoriespages/latestnews.jpg",
  },
  {
    slug: "blog",
    name: "Blog",
    color: "#0891b2",
    tint: "#cffafe",
    tagline: "Notes, ideas and longer reads from the desk",
    description:
      "Longer reads, opinion and behind-the-scenes notes that don't fit neatly into a single beat.",
    inNav: false,
  },
  {
    slug: "celebrity",
    name: "Celebrity",
    color: "#c026d3",
    tint: "#fae8ff",
    tagline: "Who's doing what, and why it matters",
    description:
      "The people everyone's talking about — appearances, milestones and the stories behind the headlines.",
    heroImage: "/categoriespages/celibrity.jpg",
  },
  {
    slug: "drama",
    name: "Drama",
    color: "#9f1239",
    tint: "#ffe4e6",
    tagline: "The feuds, twists and fallout worth following",
    description:
      "Public spats, unexpected twists and the fallout everyone's talking about — the drama behind the news.",
    inNav: false,
  },
  {
    slug: "editors-pick",
    name: "Editors Pick",
    color: "#b45309",
    tint: "#fef3c7",
    tagline: "Hand-picked stories our editors don't want you to miss",
    description:
      "A curated selection of the stories our editorial team thinks are worth your time this week.",
    inNav: false,
  },
  {
    slug: "gaming",
    name: "Gaming",
    color: "#15803d",
    tint: "#dcfce7",
    tagline: "Releases, updates and the games worth playing",
    description:
      "New releases, updates and community news from across the gaming world.",
    inNav: false,
  },
];

export function getCategoryBySlug(slug) {
  return categories.find((c) => c.slug === slug);
}
