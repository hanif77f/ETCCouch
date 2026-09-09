import { ImageResponse } from "next/og";
import { getBlogBySlug } from "@/lib/blogs";
import { getCategoryBySlug } from "@/data/categories";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  const category = blog ? getCategoryBySlug(blog.category) : null;
  const color = category?.color || "#7c3aed";
  const title = blog?.title || "ETC Entertainment Couch";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 80,
          background: `linear-gradient(160deg, #16121f 20%, ${color} 100%)`,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {category && (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "8px 20px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.18)",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            {category.name}
          </div>
        )}
        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? 52 : 66,
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 26, marginTop: 26, opacity: 0.85 }}>ETC Entertainment Couch</div>
      </div>
    ),
    { ...size }
  );
}
