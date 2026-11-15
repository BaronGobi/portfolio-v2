import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name}, ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social sharing card, generated at build time. It shows when a link to the
 * site is posted on LinkedIn, Slack, X and similar.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        background: "#0a0a0a",
        color: "#f4efe9",
        position: "relative",
      }}
    >
      {/* Glow and core, echoing the 3D hero. */}
      <div
        style={{
          position: "absolute",
          top: -140,
          right: -100,
          width: 760,
          height: 760,
          borderRadius: 760,
          background:
            "radial-gradient(closest-side, rgba(255, 95, 31, 0.45), rgba(255, 95, 31, 0))",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 150,
          right: 190,
          width: 180,
          height: 180,
          borderRadius: 180,
          background: "radial-gradient(circle at 38% 32%, #ffbf99, #ff5f1f 50%, #c23a05)",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontSize: 26,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: "#a8a39b",
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 14,
            background: "#ff5f1f",
            marginRight: 16,
          }}
        />
        {profile.role} / {profile.location}
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 190,
            fontWeight: 600,
            letterSpacing: -10,
            lineHeight: 0.9,
          }}
        >
          {profile.name}
        </div>
        <div style={{ marginTop: 28, fontSize: 38, color: "#f4efe9", maxWidth: 820 }}>
          {profile.tagline}
        </div>
      </div>
    </div>,
    size,
  );
}
