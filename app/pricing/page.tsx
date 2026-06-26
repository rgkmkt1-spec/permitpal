"use client";
import { useState } from "react";

const PLANS = [
  {
    name: "One-time",
    description: "Single project report",
    monthlyPrice: 9.99,
    yearlyPrice: 9.99,
    features: ["1 permit report", "Municipality-specific checklist", "Inspector tips", "Cost estimates"],
    cta: "Buy Report",
    priceId: { monthly: "price_1Tmh4dBcTTBtX5KTkAbn4efU", yearly: "price_1Tmh4dBcTTBtX5KTkAbn4efU" },
    highlight: false,
  },
  {
    name: "Starter",
    description: "Perfect for a single renovation",
    monthlyPrice: 14.99,
    yearlyPrice: 12.42,
    yearlyTotal: 149,
    features: ["5 reports per month", "Permit checklists", "Inspector tips", "Email support"],
    cta: "Start Starter",
    priceId: { monthly: "price_1TmgsDBcTTBtX5KTmCbMWde2", yearly: "price_1TmgtOBcTTBtX5KTKvypOlGl" },
    highlight: false,
  },
  {
    name: "Pro",
    description: "For active renovators",
    monthlyPrice: 19.99,
    yearlyPrice: 16.58,
    yearlyTotal: 199,
    features: ["15 reports per month", "Permit checklists", "Full cost estimates", "Material breakdowns", "Home Depot & Lowe's links"],
    cta: "Start Pro",
    priceId: { monthly: "price_1Tmgv0BcTTBtX5KTjSrDQppY", yearly: "price_1TmgvZBcTTBtX5KTHztw0XSU" },
    highlight: true,
  },
  {
    name: "Unlimited",
    description: "For contractors & investors",
    monthlyPrice: 49.99,
    yearlyPrice: 41.58,
    yearlyTotal: 499,
    features: ["Unlimited reports", "Permit checklists", "Full cost estimates", "Material breakdowns", "Home Depot & Lowe's links", "Priority support"],
    cta: "Go Unlimited",
    priceId: { monthly: "price_1TmgxSBcTTBtX5KTATFQD5EV", yearly: "price_1TmgyEBcTTBtX5KT2wBvHYvO" },
    highlight: false,
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, isOneTime: boolean) => {
    setLoading(priceId);
    try {
      const endpoint = isOneTime ? "/api/checkout" : "/api/subscribe";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, email: "" }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Something went wrong. Please try again.");
    }
    setLoading(null);
  };return (
    <div style={{ minHeight: "100vh", background: "#F7F5F0", fontFamily: "Georgia, serif" }}>
      <nav style={{ background: "#1C3A2F", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <span style={{ background: "#E8D5A3", color: "#1C3A2F", borderRadius: "5px", padding: "3px 8px", fontSize: "13px", fontWeight: "bold", fontFamily: "monospace" }}>PP</span>
          <span style={{ color: "#E8D5A3", fontSize: "20px" }}>PermitPal</span>
        </a>
        <a href="/" style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#A8C5B5", textDecoration: "none" }}>← Back to app</a>
      </nav>
      <div style={{ background: "#1C3A2F", padding: "60px 24px", textAlign: "center" as const }}>
        <div style={{ fontFamily: "sans-serif", fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase" as const, color: "#A8C5B5", marginBottom: "16px" }}>Pricing</div>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: "normal", color: "#F7F5F0", marginBottom: "16px" }}>Simple, transparent <span style={{ color: "#E8D5A3", fontStyle: "italic" }}>pricing</span></h1>
        <p style={{ fontFamily: "sans-serif", fontSize: "16px", color: "#A8C5B5", marginBottom: "32px" }}>Start free. Upgrade when you need more reports.</p>
        <div style={{ display: "inline-flex", background: "#2D5A45", borderRadius: "30px", padding: "4px" }}>
          <button onClick={() => setBilling("monthly")} style={{ padding: "8px 24px", borderRadius: "24px", border: "none", background: billing === "monthly" ? "#E8D5A3" : "transparent", color: billing === "monthly" ? "#1C3A2F" : "#A8C5B5", fontFamily: "sans-serif", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Monthly</button>
          <button onClick={() => setBilling("yearly")} style={{ padding: "8px 24px", borderRadius: "24px", border: "none", background: billing === "yearly" ? "#E8D5A3" : "transparent", color: billing === "yearly" ? "#1C3A2F" : "#A8C5B5", fontFamily: "sans-serif", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>Yearly <span style={{ fontSize: "11px", marginLeft: "4px" }}>Save 17%</span></button>
        </div>
      </div>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
          {PLANS.map((plan) => {
            const isOneTime = plan.name === "One-time";
            const currentPriceId = billing === "yearly" && !isOneTime ? plan.priceId.yearly : plan.priceId.monthly;
            const isLoading = loading === currentPriceId;
            return (
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
                      <span style={{ fontFamily: "sans-serif", fontSize: "13px", color: plan.highlight ? "#A8C5B5" : "#6B6B6B" }}>{isOneTime ? " one-time" : "/mo"}</span>
                    </>
                  )}
                </div>
                <button onClick={() => handleSubscribe(currentPriceId, isOneTime)} disabled={!!loading} style={{ width: "100%", padding: "13px", background: plan.highlight ? "#E8D5A3" : "#1C3A2F", color: plan.highlight ? "#1C3A2F" : "#E8D5A3", border: "none", borderRadius: "8px", fontFamily: "sans-serif", fontSize: "14px", fontWeight: 700, cursor: "pointer", marginBottom: "24px", opacity: loading ? 0.7 : 1 }}>
                  {isLoading ? "Loading…" : plan.cta}
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
            );
          })}
        </div>
        <div style={{ textAlign: "center" as const, marginTop: "48px", fontFamily: "sans-serif", fontSize: "13px", color: "#8B7355" }}>
          All plans include a free first report. Cancel anytime. Questions? Email us at support@permitpalapp.com
        </div>
      </div>
    </div>
  );
}