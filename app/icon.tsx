import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "linear-gradient(135deg, #0a0a0b 0%, #1f1d2b 100%)",
          color: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 800,
          borderRadius: 7,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        R
      </div>
    ),
    { ...size },
  );
}
