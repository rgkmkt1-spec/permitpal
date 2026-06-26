"use client";
import { useState } from "react";

const PLANS = [
  {
    name: "One-time",
    description: "Single project report",
    monthlyPrice: 4.99,
    yearlyPrice: 4.99,
    features: ["1 permit report", "Municipality-specific checklist", "Inspector tips", "Cost estimates"],
    cta: "Buy Report",
    priceId: { monthly: "one_time", yearly: "one_time" },
    highlight: false,
  },
  {
    name: "Starter",
    description: "Perfect for a single renovation",
    monthlyPrice: 5.99,
    yearlyPrice: 3.25,
    yearlyTotal: 39,
    features: ["3 reports per month", "Permit checklists", "Inspector tips", "Email support"],
    cta: "Start Starter",
    priceId: { monthly: "price_1TmQvkBcTTBtX5KTbOnC6w93", yearly: "price_1TmQvkBcTTBtX5KTVoge83wN" },
    highlight: false,
  },
  {
    name: "Pro",
    description: "For active renovators",
    monthlyPrice: 9.99,
    yearlyPrice: 6.58,
    yearlyTotal: 79,
    features: ["10 reports per month", "Permit checklists", "Full cost estimates", "Material breakdowns", "Home Depot & Lowe's links"],
    cta: "Start Pro",
    priceId: { monthly: "price_1TmQxDBcTTBtX5KT9mpWKngL", yearly: "price_1TmQxvBcTTBtX5KT6Tt95Kod" },
    highlight: true,
  },
  {
    name: "Unlimited",
    description: "For contractors & investors",
    monthlyPrice: 12.99,
    yearlyPrice: 8.25,
    yearlyTotal: 99,
    features: ["Unlimited reports", "Permit checklists", "Full cost estimates", "Material breakdowns", "Home Depot & Lowe's links", "Priority support"],
    cta: "Go Unlimited",
    priceId: { monthly: "price_1TmQzBBcTTBtX5KTluaNoFWr", yearly: "price_1TmQzhBcTTBtX5KTLsg4cJ7J" },
    highlight: false,
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (priceId === "one_time") {
      setLoading("one_time");
      try {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "" }),
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } catch {
        alert("Something went wrong. Please try again.");
      }
      setLoading(null);
      return;
    }
    setLoading(priceId);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Something went wrong. Please try again.");
    }
    setLoading(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0", fontFamily: "Georgia, serif" }}>
      <nav style={{ background: "#1C3A2F", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <span style={{ background: "#E8D5A3", color: "#1C3A2F", borderRadius: "5px", padding: "3px 8px", fontSize: "13px", fontWeight: "bold", fontFamily: "monospace" }}>PP</span>
          <span style={{ color: "#E8D5A3", fontSize: "20px" }}>PermitPal</span>
        </a>
        <a href="/" style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#A8C5B5", textDecoration: "none" }}>← Back to app</a>
      </nav>

      <div style={{ background: "#1C3A2F", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "sans-serif", fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase" as const, color: "#A8C5B5", marginBottom: "16px" }}>Pricing</div>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "normal", color: "#F7F5F0", marginBottom: "16px" }}>Simple, transparent <span style={{ color: "#E8D5A3", fontStyle: "italic" }}>pricing</span></h1>
        <p style={{ fontFamily: "sans-serif", fontSize: "16px", color: "#A8C5B5", marginBottom: "32px" }}>Start free. Upgrade when you need more reports.</p>
        <div style={{ display: "inline-flex", background: "#2D5A45", borderRadius: "30px", padding: "4px" }}>
          <button onClick={() => setBilling("monthly")} style={{ padding: "8px 24px", borderRadius: "24px", border: "none", background: billing === "monthly" ? "#E8D5A3" : "transparent", color: billing === "monthly" ? "#1C3A2F" : "#A8C5B5", fontFamily: "sans-serif", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Monthly</button>
          <button onClick={() => setBilling("yearly")} style={{ padding: "8px 24px", borderRadius: "24px", border: "none", background: billing === "yearly" ? "#E8D5A3" : "transparent", color: billing === "yearly" ? "#1C3A2F" : "#A8C5B5", fontFamily: "sans-serif", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Yearly <span style={{ fontSize: "11px", marginLeft: "4px" }}>Save up to 36%</span></button>
        </div>
      </div>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          {PLANS.map((plan) => (
            <div key={plan.name} style={{ background: plan.highlight ? "#1C3A2F" : "#fff", borderRadius: "12px", padding: "32px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: plan.highlight ? "2px solid #E8D5A3" : "1px solid #E8E4DC", position: "relative" as const }}>
              {plan.highlight && (
                <div style={{ position: "absolute" as const, top: "-12px", left: "50%", transform: "translateX(-50%)", background: "#E8D5A3", color: "#1C3A2F", fontFamily: "sans-serif", fontSize: "11px", fontWeight: 700, padding: "4px 14px", borderRadius: "12px", letterSpacing: "1px", textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>Most Popular</div>
              )}
              <div style={{ fontFamily: "sans-serif", fontSize: "13px", fontWeight: 700, color: plan.highlight ? "#A8C5B5" : "#8B7355", letterSpacing: "1px", textTransform: "uppercase" as const, marginBottom: "8px" }}>{plan.name}</div>
              <div style={{ fontFamily: "sans-serif", fontSize: "13px", color: plan.highlight ? "#A8C5B5" : "#6B6B6B", marginBottom: "20px" }}>{plan.description}</div>
              <div style={{ marginBottom: "24px" }}>
                {billing === "yearly" && plan.yearlyTotal ? (
                  <>
                    <span style={{ fontSize: "36px", fontWeight: "bold", color: plan.highlight ? "#E8D5A3" : "#1C3A2F" }}>${plan.yearlyPrice.toFixed(2)}</span>
                    <span style={{ fontFamily: "sans-serif", fontSize: "13px", color: plan.highlight ? "#A8C5B5" : "#6B6B6B" }}>/mo</span>
                    <div style={{ fontFamily: "sans-serif", fontSize: "12px", color: plan.highlight ? "#A8C5B5" : "#8B7355", marginTop: "4px" }}>billed ${plan.yearlyTotal}/year</div>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: "36px", fontWeight: "bold", color: plan.highlight ? "#E8D5A3" : "#1C3A2F" }}>${plan.monthlyPrice.toFixed(2)}</span>
                    <span style={{ fontFamily: "sans-serif", fontSize: "13px", color: plan.highlight ? "#A8C5B5" : "#6B6B6B" }}>{plan.name === "One-time" ? " one-time" : "/mo"}</span>
                  </>
                )}
              </div>
              <button
                onClick={() => handleSubscribe(billing === "yearly" && plan.priceId.yearly !== "one_time" ? plan.priceId.yearly : plan.priceId.monthly)}
                disabled={loading === plan.priceId.monthly || loading === plan.priceId.yearly}
                style={{ width: "100%", padding: "13px", background: plan.highlight ? "#E8D5A3" : "#1C3A2F", color: plan.highlight ? "#1C3A2F" : "#E8D5A3", border: "none", borderRadius: "8px", fontFamily: "sans-serif", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginBottom: "24px", opacity: loading ? 0.7 : 1 }}
              >
                {loading === plan.priceId.monthly || loading === plan.priceId.yearly ? "Loading…" : plan.cta}
              </button>
              <div style={{ borderTop: `1px solid ${plan.highlight ? "#2D5A45" : "#E8E4DC"}`, paddingTop: "20px" }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontFamily: "sans-serif", fontSize: "13px", color: plan.highlight ? "#D4EDE4" : "#3A3A3A", marginBottom: "10px" }}>
                    <span style={{ color: plan.highlight ? "#A8C5B5" : "#1C3A2F", fontWeight: "bold" }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" as const, marginTop: "48px", fontFamily: "sans-serif", fontSize: "13px", color: "#8B7355" }}>
          All plans include a free first report. Cancel anytime. Questions? Email us at support@permitpalapp.com
        </div>
      </div>
    </div>
  );
}