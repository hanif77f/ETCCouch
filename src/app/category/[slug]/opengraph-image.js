import { ImageResponse } from "next/og";
import { getCategoryBySlug, categories } from "@/data/categories";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug) || { name: "ETC Entertainment Couch", color: "#7c3aed", tagline: "" };

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
          background: `linear-gradient(135deg, ${category.color} 0%, #16121f 100%)`,
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, textTransform: "uppercase", opacity: 0.85 }}>
          {category.tagline}
        </div>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 800, marginTop: 18 }}>{category.name}</div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 20, opacity: 0.85 }}>ETC Entertainment Couch</div>
      </div>
    ),
    { ...size }
  );
}
