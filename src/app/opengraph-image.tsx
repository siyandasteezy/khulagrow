import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "KhulaGrow — Seed-to-harvest cannabis cultivation management for South Africa";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(180deg, #1d4a20 0%, #193d1c 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 44, fontWeight: 700 }}>
          <span>🌱</span>
          <span>KhulaGrow</span>
        </div>
        <div style={{ marginTop: 40, fontSize: 64, fontWeight: 700, lineHeight: 1.15, maxWidth: 980 }}>
          Seed-to-harvest traceability for licensed cannabis farms
        </div>
        <div style={{ marginTop: 28, fontSize: 30, color: "#bbdebb", maxWidth: 900 }}>
          SAHPRA-ready records · offline field capture · harvests, inventory &
          investor reports — R1,500/month, 3-day free trial
        </div>
        <div
          style={{
            marginTop: 48,
            display: "flex",
            gap: 14,
            fontSize: 24,
            color: "#dcefdc",
          }}
        >
          <span style={{ background: "rgba(255,255,255,0.12)", padding: "10px 24px", borderRadius: 999 }}>
            🇿🇦 Built for South Africa
          </span>
          <span style={{ background: "rgba(255,255,255,0.12)", padding: "10px 24px", borderRadius: 999 }}>
            khulagrow.smartpick.co.za
          </span>
        </div>
      </div>
    ),
    size
  );
}
