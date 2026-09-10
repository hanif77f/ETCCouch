import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, SOCIAL_LINKS, absoluteUrl } from "@/lib/site";

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo.webp"),
      width: 500,
      height: 500,
    },
    sameAs: SOCIAL_LINKS,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    publisher: { "@id": `${SITE_URL}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?s={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    ...organizationSchema(),
  };
}

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function collectionPageSchema({ category, blogs }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: absoluteUrl(`/category/${category.slug}`),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: blogs.map((blog, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/blog/${blog.slug}`),
        name: blog.title,
      })),
    },
  };
}

export function blogPostingSchema(blog, category) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": absoluteUrl(`/blog/${blog.slug}#article`),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/blog/${blog.slug}`),
    },
    headline: blog.title,
    description: blog.excerpt,
    image: [absoluteUrl(blog.image)],
    datePublished: blog.date,
    // Auto-generated posts carry their own updatedAt; hardcoded ones don't.
    dateModified: blog.updatedAt || blog.date,
    author: {
      "@type": "Person",
      name: blog.author,
    },
    publisher: organizationSchema(),
    articleSection: category?.name,
    keywords: (blog.keywords?.length
      ? blog.keywords
      : [category?.name, "ETC", "Entertainment Couch"]
    )
      .filter(Boolean)
      .join(", "),
    ...(blog.wordCount ? { wordCount: blog.wordCount } : {}),
  };
}

// The auto-blog backend ships an FAQ block with most generated articles.
// Marking it up makes it eligible for the FAQ rich result in search.
export function faqPageSchema(faqs = []) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs
      .filter((f) => f?.question && f?.answer)
      .map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
  };
}

export function itemListSchema({ name, description, items }) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      ...item,
    })),
  };
}
