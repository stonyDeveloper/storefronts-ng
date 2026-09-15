import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Storefronts — Create Your Free Online Store";
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
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #18181b 0%, #09090b 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(16,185,129,0) 70%)",
            display: "flex",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "white",
            }}
          >
            S
          </div>
          <div style={{ fontSize: 32, fontWeight: 600, color: "#a1a1aa", display: "flex" }}>
            Storefronts
          </div>
        </div>

        <div
          style={{
            fontSize: 62,
            fontWeight: 700,
            color: "white",
            lineHeight: 1.15,
            display: "flex",
            maxWidth: 920,
          }}
        >
          Start selling on WhatsApp &amp; Instagram today.
        </div>

        <div style={{ fontSize: 26, color: "#71717a", marginTop: 24, display: "flex" }}>
          Free storefront · Paystack payments · No subscription
        </div>
      </div>
    ),
    { ...size }
  );
}
