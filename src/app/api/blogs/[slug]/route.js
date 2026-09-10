import { NextResponse } from "next/server";

import { getBlogDetail } from "@/lib/blogs";

// One post by slug, from either source.
//
//   GET /api/blogs/ai-copilots-are-changing-how-we-work   -> hardcoded post
//   GET /api/blogs/us-president-donald-trump-iran-war     -> generated post
//
// Hardcoded posts return empty toc/faqs/keyTakeaways so a consumer can render
// both kinds with the same code path.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { slug } = await params;

  try {
    const detail = await getBlogDetail(slug);
    if (!detail?.blog) {
      return NextResponse.json(
        { success: false, message: "Blog not found", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "OK", data: detail },
      {
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err) {
    console.error(`[/api/blogs/${slug}] failed:`, err);
    return NextResponse.json(
      { success: false, message: "Failed to load blog", data: null },
      { status: 500 }
    );
  }
}
