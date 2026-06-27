import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Recall — Free Spaced Repetition App with FSRS & AI Flashcards";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0a0a0b 0%, #18181b 60%, #1f1d2b 100%)",
          color: "#fafafa",
          padding: 72,
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 460,
            height: 460,
            background:
              "radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.35) 0%, rgba(16, 185, 129, 0) 60%)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#fafafa",
              color: "#0a0a0b",
              fontSize: 40,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            R
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.5 }}>
            Recall
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 56,
            maxWidth: 980,
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: -2,
              lineHeight: 1.05,
            }}
          >
            Remember everything you learn.
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 32,
              color: "#a1a1aa",
              lineHeight: 1.3,
              display: "flex",
            }}
          >
            Free spaced repetition with FSRS. Paste a link, PDF, note, or
            snippet — Recall schedules the perfect review.
          </div>
        </div>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", flexDirection: "row", gap: 14 }}>
            {["FSRS", "AI quiz", "PWA", "Self-host", "Free"].map((t) => (
              <div
                key={t}
                style={{
                  border: "1px solid #3f3f46",
                  color: "#e4e4e7",
                  padding: "8px 16px",
                  borderRadius: 999,
                  fontSize: 22,
                  display: "flex",
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <div style={{ fontSize: 22, color: "#71717a" }}>
            recall-forever.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
