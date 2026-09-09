"use client";

import { useActionState, useState } from "react";
import { createBlogAction } from "@/app/actions/blog-actions";
import { categories } from "@/data/categories";
import { TOOLS } from "@/data/tools";

const initialState = { error: null };

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-muted";

export default function BlogForm() {
  const [state, formAction, pending] = useActionState(createBlogAction, initialState);

  // A post belongs to either a category or a tool, never both — picking one
  // clears and disables the other.
  const [category, setCategory] = useState("");
  const [tool, setTool] = useState("");

  function handleCategoryChange(e) {
    const value = e.target.value;
    setCategory(value);
    if (value) setTool("");
  }

  function handleToolChange(e) {
    const value = e.target.value;
    setTool(value);
    if (value) setCategory("");
  }

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{state.error}</p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-semibold text-ink">
          Blog title
        </label>
        <input id="title" name="title" required className={inputClass} placeholder="e.g. 5 Trends Shaping Tech This Fall" />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="category" className="text-sm font-semibold text-ink">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={handleCategoryChange}
            disabled={!!tool}
            required={!tool}
            className={inputClass}
          >
            <option value="" disabled>
              Choose a category
            </option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          {tool && <p className="text-xs text-muted">Cleared — this post is tagged to a tool instead.</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="tool" className="text-sm font-semibold text-ink">
            Tool <span className="font-normal text-muted">(optional, instead of a category)</span>
          </label>
          <select
            id="tool"
            name="tool"
            value={tool}
            onChange={handleToolChange}
            disabled={!!category}
            className={inputClass}
          >
            <option value="">Not tied to a tool</option>
            {TOOLS.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted">
            {category
              ? "Cleared — this post is tagged to a category instead."
              : "Pick a tool instead of a category to feature this post as a card on that tool's page."}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="author" className="text-sm font-semibold text-ink">
          Author <span className="font-normal text-muted">(optional)</span>
        </label>
        <input id="author" name="author" className={inputClass} placeholder="ODL Editorial" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="excerpt" className="text-sm font-semibold text-ink">
          Short excerpt <span className="font-normal text-muted">(optional, shown on cards)</span>
        </label>
        <input id="excerpt" name="excerpt" className={inputClass} placeholder="A one-sentence summary of your post" />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="content" className="text-sm font-semibold text-ink">
          Blog content
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={10}
          className={`${inputClass} resize-y`}
          placeholder={"Write your post here. Leave a blank line between paragraphs."}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="image" className="text-sm font-semibold text-ink">
          Cover image <span className="font-normal text-muted">(optional — saved to the public folder)</span>
        </label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="w-full rounded-lg border border-dashed border-black/15 bg-zinc-50 px-4 py-3 text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
        />
        <p className="text-xs text-muted">If you skip this, a themed placeholder image will be used instead.</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex items-center justify-center rounded-md bg-brand px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Publishing…" : "Publish Blog"}
      </button>
    </form>
  );
}
