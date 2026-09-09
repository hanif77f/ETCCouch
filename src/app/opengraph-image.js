import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #16121f 0%, #5b21b6 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 24,
            background: "white",
            color: "#16121f",
            fontSize: 48,
            fontWeight: 900,
            marginBottom: 36,
          }}
        >
          ETC
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, textAlign: "center" }}>{SITE_NAME}</div>
        <div style={{ fontSize: 28, marginTop: 18, opacity: 0.85 }}>
          News, entertainment, tech &amp; free games
        </div>
      </div>
    ),
    { ...size }
  );
}
