import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "linear-gradient(135deg, #0a0a0b 0%, #1f1d2b 100%)",
          color: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 110,
          fontWeight: 800,
          borderRadius: 40,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        R
      </div>
    ),
    { ...size },
  );
}
