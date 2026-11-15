import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon for iOS: the orange core on a dark tile. */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 64,
          background: "#ff5f1f",
          boxShadow: "0 0 48px rgba(255, 95, 31, 0.7)",
        }}
      />
    </div>,
    size,
  );
}
