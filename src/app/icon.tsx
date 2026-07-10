import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Browser-tab favicon: the brand leaf on the KhulaGrow green tile,
// matching the PWA icons in public/icons/.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%" }}>
        <svg width="64" height="64" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
          <rect width="512" height="512" rx="112" fill="#215c24" />
          <path
            fill="#dcefdc"
            d="M256 96c14 44 22 92 22 132 0 20-2 39-6 56 26-30 60-52 98-62-18 36-46 66-80 86 36-4 72 2 104 18-30 22-66 34-104 34h-4c22 16 40 38 50 64-28-8-54-22-74-42v66h-12v-66c-20 20-46 34-74 42 10-26 28-48 50-64h-4c-38 0-74-12-104-34 32-16 68-22 104-18-34-20-62-50-80-86 38 10 72 32 98 62-4-17-6-36-6-56 0-40 8-88 22-132z"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
