"use client";

import { useEffect, useState } from "react";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fade-out after the bar finishes (1.6 s)
    const fadeTimer = setTimeout(() => setFading(true), 1600);
    // Remove from DOM after fade completes (300 ms transition)
    const hideTimer = setTimeout(() => setVisible(false), 1900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        transition: "opacity 300ms ease",
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      {/* Project name */}
      <span
        style={{
          fontFamily: "var(--font-geist-sans, system-ui, sans-serif)",
          fontSize: "clamp(2rem, 6vw, 3.5rem)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: "#fff",
          userSelect: "none",
        }}
      >
        Git<span style={{ color: "#a3a3a3" }}>Aid</span>
      </span>

      {/* Loading bar */}
      <div
        style={{
          width: "clamp(140px, 28vw, 280px)",
          height: "2px",
          backgroundColor: "rgba(255,255,255,0.08)",
          borderRadius: "9999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: "100%",
            background: "linear-gradient(90deg, transparent 0%, #fff 50%, transparent 100%)",
            borderRadius: "9999px",
            animation: "splash-fill 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes splash-fill {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }
      `}</style>
    </div>
  );
}
