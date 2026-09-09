"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { categories } from "@/data/categories";
import { getTool } from "@/data/tools";
import { createBlog, slugify } from "@/lib/blogs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "blogs");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

function extensionFor(file) {
  const fromName = path.extname(file.name || "").toLowerCase();
  if (fromName) return fromName;
  const map = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
  };
  return map[file.type] || ".jpg";
}

export async function createBlogAction(prevState, formData) {
  const title = (formData.get("title") || "").toString().trim();
  const category = (formData.get("category") || "").toString().trim();
  const tool = (formData.get("tool") || "").toString().trim();
  const excerpt = (formData.get("excerpt") || "").toString().trim();
  const content = (formData.get("content") || "").toString().trim();
  const author = (formData.get("author") || "").toString().trim();
  const imageFile = formData.get("image");

  if (!title) return { error: "Please enter a blog title." };
  if (!content) return { error: "Please write some blog content." };

  // A post belongs to either a category or a tool, never both — the form
  // disables one select as soon as the other has a value, but that's only
  // enforced client-side, so re-check it here.
  if (category && tool) {
    return { error: "Choose either a category or a tool, not both." };
  }
  if (!category && !tool) {
    return { error: "Please choose a category or a tool." };
  }
  if (category && !categories.some((c) => c.slug === category)) {
    return { error: "Please choose a valid category." };
  }
  if (tool && !getTool(tool)) {
    return { error: "Please choose a valid tool." };
  }

  let imagePath = category ? `/images/categories/${category}.svg` : "/images/blogs/default.svg";

  if (imageFile && typeof imageFile === "object" && imageFile.size > 0) {
    if (!ALLOWED_TYPES.includes(imageFile.type)) {
      return { error: "Please upload a JPG, PNG, WEBP, GIF or SVG image." };
    }
    if (imageFile.size > 5 * 1024 * 1024) {
      return { error: "Image is too large. Please keep it under 5MB." };
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const ext = extensionFor(imageFile);
    const fileName = `${slugify(title) || "post"}-${Date.now()}${ext}`;
    const buffer = Buffer.from(await imageFile.arrayBuffer());
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), buffer);
    imagePath = `/uploads/blogs/${fileName}`;
  }

  const entry = await createBlog({
    title,
    category: category || null,
    tool: tool || null,
    excerpt,
    content,
    image: imagePath,
    author,
  });

  revalidatePath("/");
  if (category) revalidatePath(`/category/${category}`);
  if (tool) revalidatePath(`/free-online-tools/${tool}`);
  revalidatePath(`/blog/${entry.slug}`);

  redirect(`/blog/${entry.slug}`);
}
