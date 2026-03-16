import React from "react";

export default function GlobalLoader({ visible }) {
  if (!visible) return null;

  return (
    <>
      {/* Keyframes injected safely */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      <div style={overlay}>
        <div style={loaderCard}>
          <div style={spinner}></div>
          <div style={text}>Loading, please wait…</div>
        </div>
      </div>
    </>
  );
}

/* styles */
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(255,255,255,0.85)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const loaderCard = {
  background: "#fff",
  padding: "28px 36px",
  borderRadius: 16,
  boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 14,
};

const spinner = {
  width: 48,
  height: 48,
  border: "4px solid #e5e7eb",
  borderTop: "4px solid #8B5CF6",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const text = {
  fontSize: 14,
  fontWeight: 600,
  color: "#374151",
};
