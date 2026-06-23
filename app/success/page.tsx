"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Success() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (sessionId) {
      // Store payment confirmation in localStorage
      localStorage.setItem("permitpal_paid", "true");
      setReady(true);
    }
  }, [sessionId]);

  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ background: "#fff", borderRadius: "12px", padding: "48px", maxWidth: "480px", width: "100%", textAlign: "center", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #E8E4DC" }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>🎉</div>
        <h1 style={{ fontSize: "26px", fontWeight: "normal", fontFamily: "Georgia, serif", marginBottom: "12px", color: "#1A1A1A" }}>Payment confirmed!</h1>
        <p style={{ fontFamily: "sans-serif", fontSize: "15px", color: "#6B6B6B", lineHeight: "1.6", marginBottom: "32px" }}>
          You now have unlimited PermitPal reports. Let's get back to your project.
        </p>
        <a href="/" style={{ background: "#1C3A2F", color: "#E8D5A3", padding: "14px 32px", borderRadius: "8px", fontFamily: "sans-serif", fontSize: "15px", fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
          Generate My Permit Checklist →
        </a>
      </div>
    </div>
  );
}