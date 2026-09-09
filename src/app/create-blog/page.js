import BlogForm from "@/components/BlogForm";
import { absoluteUrl } from "@/lib/site";

export const metadata = {
  title: "Create New Blog",
  description: "Publish a new blog post to ETC Entertainment Couch.",
  alternates: { canonical: absoluteUrl("/create-blog") },
  // This is an internal contribution form, not public content — keep it out
  // of search results but still let links on the page be followed.
  robots: { index: false, follow: true },
};

export default function CreateBlogPage() {
  return (
    <div className="bg-cream">
      <div className="container-page max-w-3xl py-14">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand">Contribute</p>
        <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">Create New Blog</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted">
          Publish a new post directly to the site. It will immediately appear on its category page and get its
          own blog page.
        </p>

        <div className="mt-10">
          <BlogForm />
        </div>
      </div>
    </div>
  );
}
