"use client";
import { useState, useEffect } from "react";

const PROJECT_TYPES = [
  { id: "deck", label: "Deck or Patio", icon: "🪵" },
  { id: "addition", label: "Room Addition", icon: "🏠" },
  { id: "fence", label: "Fence", icon: "🚧" },
  { id: "shed", label: "Shed or Garage", icon: "🏚️" },
  { id: "electrical", label: "Electrical Work", icon: "⚡" },
  { id: "plumbing", label: "Plumbing", icon: "🔧" },
  { id: "roofing", label: "Roofing", icon: "🏗️" },
  { id: "kitchen", label: "Kitchen Remodel", icon: "🍳" },
  { id: "bathroom", label: "Bathroom Remodel", icon: "🚿" },
  { id: "pool", label: "Pool or Hot Tub", icon: "🏊" },
  { id: "solar", label: "Solar Panels", icon: "☀️" },
  { id: "other", label: "Something Else", icon: "🔨" },
];

const LOADING_MESSAGES = [
  "Identifying your municipality…",
  "Checking local building codes…",
  "Analyzing permit requirements…",
  "Generating your checklist…",
];

type Result = {
  municipality: string;
  summary: string;
  permits_required: { name: string; icon: string; description: string; typical_cost: string; typical_timeline: string; who_files: string }[];
  permits_not_required: { name: string; reason: string }[];
  checklist: string[];
  warnings: string[];
  cost_estimate: { permit_fees_low: number; permit_fees_high: number; inspection_fees_low: number; inspection_fees_high: number; notes: string };
  inspector_tips: string[];
};

export default function Home() {
  const [step, setStep] = useState(0);
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [projectType, setProjectType] = useState<string | null>(null);
  const [sqft, setSqft] = useState("");
  const [height, setHeight] = useState("");
  const [contractor, setContractor] = useState("");
  const [timeline, setTimeline] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistDone, setWaitlistDone] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [error, setError] = useState("");
  const [estimate, setEstimate] = useState<any>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [estimateError, setEstimateError] = useState("");
  const [showEstimateForm, setShowEstimateForm] = useState(false);
  const [materialQuality, setMaterialQuality] = useState("");
  const [locationType, setLocationType] = useState("");
  const [hasPaid, setHasPaid] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallLoading, setPaywallLoading] = useState(false);

  useEffect(() => {
    const paid = localStorage.getItem("permitpal_paid");
    if (paid) setHasPaid(true);
  }, []);

  const selectedType = PROJECT_TYPES.find((t) => t.id === projectType);
  const progressPct = [0, 25, 50, 75, 100][Math.min(step, 4)];

  const toggleCheck = (key: string) =>
    setCheckedItems((p) => ({ ...p, [key]: !p[key] }));

  const handleAnalyze = async () => {
    // Check if free report already used and not paid
    const usedFree = localStorage.getItem("permitpal_used_free");
    if (usedFree && !hasPaid) {
      setShowPaywall(true);
      return;
    }
    setLoading(true);
    setError("");
    setStep(4);
    let stage = 0;
    const interval = setInterval(() => {
      stage = (stage + 1) % LOADING_MESSAGES.length;
      setLoadingStage(stage);
    }, 1500);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zip, city, projectType, projectLabel: selectedType?.label, sqft, height, contractor, timeline }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      clearInterval(interval);
      localStorage.setItem("permitpal_used_free", "true");
      setResult(data);
    } catch {
      clearInterval(interval);
      setError("Something went wrong. Please try again.");
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleEstimate = async () => {
    if (!materialQuality || !locationType) {
      setShowEstimateForm(true);
      return;
    }
    setShowEstimateForm(false);
    setEstimateLoading(true);
    setEstimateError("");
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectLabel: selectedType?.label,
          sqft,
          contractor,
          municipality: result?.municipality,
          materialQuality,
          locationType,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setEstimate(data);
    } catch {
      setEstimateError("Something went wrong. Please try again.");
    } finally {
      setEstimateLoading(false);
    }
  };

  const handleCheckout = async () => {
    setPaywallLoading(true);
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
    setPaywallLoading(false);
  };

  const handleWaitlist = async () => {
    if (!waitlistEmail.includes("@")) return;
    setWaitlistLoading(true);
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: waitlistEmail, zip, projectType }),
    });
    setWaitlistLoading(false);
    setWaitlistDone(true);
  };

  const restart = () => {
    setStep(0); setZip(""); setCity(""); setProjectType(null);
    setSqft(""); setHeight(""); setContractor(""); setTimeline("");
    setResult(null); setCheckedItems({}); setWaitlistDone(false);
    setWaitlistEmail(""); setError("");
  };

  const s: Record<string, React.CSSProperties> = {
    app: { minHeight: "100vh", background: "#F7F5F0" },
    nav: { background: "#1C3A2F", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" },
    logoWrap: { display: "flex", alignItems: "center", gap: "10px" },
    logoMark: { background: "#E8D5A3", color: "#1C3A2F", borderRadius: "5px", padding: "3px 8px", fontSize: "13px", fontWeight: "bold", fontFamily: "monospace" },
    logoText: { color: "#E8D5A3", fontSize: "20px", fontFamily: "Georgia, serif" },
    navBadge: { background: "#2D5A45", color: "#A8C5B5", fontSize: "12px", padding: "4px 12px", borderRadius: "20px", fontFamily: "sans-serif" },
    hero: { background: "#1C3A2F", color: "#F7F5F0", padding: "72px 24px 80px", textAlign: "center" },
    heroEyebrow: { fontFamily: "sans-serif", fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase" as const, color: "#A8C5B5", marginBottom: "20px" },
    heroTitle: { fontSize: "clamp(30px, 5vw, 56px)", lineHeight: "1.1", fontWeight: "normal", maxWidth: "720px", margin: "0 auto 20px" },
    heroAccent: { color: "#E8D5A3", fontStyle: "italic" },
    heroSub: { fontFamily: "sans-serif", fontSize: "16px", color: "#A8C5B5", maxWidth: "480px", margin: "0 auto 0", lineHeight: "1.6" },
    heroStats: { display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap" as const, borderTop: "1px solid #2D5A45", paddingTop: "40px", marginTop: "40px" },
    statNum: { fontSize: "28px", color: "#E8D5A3", fontWeight: "bold" },
    statLabel: { fontFamily: "sans-serif", fontSize: "12px", color: "#A8C5B5", marginTop: "4px" },
    main: { maxWidth: "780px", margin: "0 auto", padding: "48px 24px 80px" },
    card: { background: "#fff", borderRadius: "12px", padding: "40px", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", border: "1px solid #E8E4DC" },
    progressBar: { height: "3px", background: "#E8E4DC", borderRadius: "2px", marginBottom: "36px", overflow: "hidden" },
    stepLabel: { fontFamily: "sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" as const, color: "#8B7355", marginBottom: "12px" },
    stepTitle: { fontSize: "26px", fontWeight: "normal", marginBottom: "8px" },
    stepSub: { fontFamily: "sans-serif", fontSize: "14px", color: "#6B6B6B", marginBottom: "32px", lineHeight: "1.5" },
    fieldLabel: { fontFamily: "sans-serif", fontSize: "13px", fontWeight: 600, color: "#4A4A4A", marginBottom: "8px", marginTop: "20px", display: "block" },
    input: { width: "100%", padding: "14px 16px", fontSize: "16px", border: "1.5px solid #D4CFC5", borderRadius: "8px", background: "#FAFAF8", fontFamily: "Georgia, serif", color: "#1A1A1A", boxSizing: "border-box" as const },
    typeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", marginBottom: "8px" },
    radioGroup: { display: "flex", flexWrap: "wrap" as const, gap: "10px" },
    btn: { background: "#1C3A2F", color: "#E8D5A3", border: "none", padding: "15px 32px", fontSize: "15px", borderRadius: "8px", cursor: "pointer", fontFamily: "sans-serif", fontWeight: 600, marginTop: "28px", width: "100%" },
    btnSecondary: { background: "transparent", color: "#6B6B6B", border: "1.5px solid #D4CFC5", padding: "13px 24px", fontSize: "14px", borderRadius: "8px", cursor: "pointer", fontFamily: "sans-serif", marginTop: "12px", width: "100%" },
    sectionTitle: { fontFamily: "sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase" as const, color: "#8B7355", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #E8E4DC" },
    permitItem: { display: "flex", alignItems: "flex-start", gap: "14px", padding: "16px", background: "#FAFAF8", borderRadius: "8px", marginBottom: "10px", border: "1px solid #E8E4DC" },
    permitMeta: { fontFamily: "sans-serif", fontSize: "12px", color: "#8B7355", marginTop: "6px", display: "flex", gap: "14px", flexWrap: "wrap" as const },
    warningBox: { background: "#FEF9EC", border: "1px solid #E8D5A3", borderRadius: "8px", padding: "14px 16px", fontFamily: "sans-serif", fontSize: "13px", color: "#7A5C1E", lineHeight: "1.5", marginBottom: "10px", display: "flex", gap: "10px" },
    tipBox: { background: "#F0F5F2", border: "1px solid #C5D9CE", borderRadius: "8px", padding: "14px 16px", fontFamily: "sans-serif", fontSize: "13px", color: "#2D5A45", lineHeight: "1.5", marginBottom: "10px", display: "flex", gap: "10px" },
    costBox: { background: "#F0F5F2", border: "1px solid #C5D9CE", borderRadius: "8px", padding: "20px" },
    costRow: { display: "flex", justifyContent: "space-between", fontFamily: "sans-serif", fontSize: "14px", color: "#3A3A3A", marginBottom: "8px" },
    costTotal: { display: "flex", justifyContent: "space-between", fontFamily: "sans-serif", fontSize: "16px", fontWeight: 700, color: "#1C3A2F", borderTop: "1px solid #C5D9CE", paddingTop: "12px", marginTop: "8px" },
    ctaBox: { background: "#1C3A2F", borderRadius: "10px", padding: "32px", textAlign: "center" as const, marginTop: "28px" },
    ctaTitle: { color: "#E8D5A3", fontSize: "22px", marginBottom: "8px", fontFamily: "Georgia, serif", fontWeight: "normal" },
    ctaSub: { fontFamily: "sans-serif", fontSize: "13px", color: "#A8C5B5", marginBottom: "20px" },
    ctaInput: { padding: "13px 16px", fontSize: "15px", border: "none", borderRadius: "8px", fontFamily: "sans-serif", width: "100%", maxWidth: "320px", marginBottom: "10px", boxSizing: "border-box" as const },
    ctaBtn: { background: "#E8D5A3", color: "#1C3A2F", border: "none", padding: "13px 28px", fontSize: "14px", borderRadius: "8px", cursor: "pointer", fontFamily: "sans-serif", fontWeight: 700, marginLeft: "8px" },
    disclaimer: { fontFamily: "sans-serif", fontSize: "12px", color: "#A8A8A8", lineHeight: "1.5", borderTop: "1px solid #E8E4DC", paddingTop: "16px", marginTop: "24px" },
  };

  const TypeCard = ({ t }: { t: typeof PROJECT_TYPES[0] }) => {
    const sel = projectType === t.id;
    return (
      <div onClick={() => setProjectType(t.id)} style={{ padding: "16px 12px", border: sel ? "2px solid #1C3A2F" : "1.5px solid #D4CFC5", borderRadius: "10px", background: sel ? "#F0F5F2" : "#FAFAF8", cursor: "pointer", textAlign: "center" }}>
        <div style={{ fontSize: "24px", marginBottom: "8px" }}>{t.icon}</div>
        <div style={{ fontFamily: "sans-serif", fontSize: "13px", fontWeight: 500 }}>{t.label}</div>
      </div>
    );
  };

  const RadioBtn = ({ label, value, current, set }: { label: string; value: string; current: string; set: (v: string) => void }) => (
    <button onClick={() => set(value)} style={{ padding: "9px 18px", border: current === value ? "2px solid #1C3A2F" : "1.5px solid #D4CFC5", borderRadius: "24px", background: current === value ? "#1C3A2F" : "#FAFAF8", color: current === value ? "#F7F5F0" : "#1A1A1A", cursor: "pointer", fontFamily: "sans-serif", fontSize: "13px", fontWeight: current === value ? 600 : 400 }}>
      {label}
    </button>
  );

  return (
    <div style={s.app}>
      {showPaywall && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "40px", maxWidth: "440px", width: "100%", textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>🏛️</div>
            <h2 style={{ fontSize: "24px", fontWeight: "normal", fontFamily: "Georgia, serif", marginBottom: "12px" }}>Your free report has been used</h2>
            <p style={{ fontFamily: "sans-serif", fontSize: "14px", color: "#6B6B6B", lineHeight: "1.6", marginBottom: "8px" }}>Get unlimited permit checklists, cost estimates, and inspector tips for any project.</p>
            <p style={{ fontFamily: "sans-serif", fontSize: "28px", fontWeight: "bold", color: "#1C3A2F", marginBottom: "24px" }}>$9.99 one-time</p>
            <button onClick={handleCheckout} disabled={paywallLoading} style={{ background: "#1C3A2F", color: "#E8D5A3", border: "none", padding: "15px 32px", fontSize: "15px", borderRadius: "8px", cursor: "pointer", fontFamily: "sans-serif", fontWeight: 600, width: "100%", marginBottom: "12px" }}>
              {paywallLoading ? "Loading…" : "Unlock Full Access →"}
            </button>
            <button onClick={() => setShowPaywall(false)} style={{ background: "transparent", color: "#6B6B6B", border: "1.5px solid #D4CFC5", padding: "13px 24px", fontSize: "14px", borderRadius: "8px", cursor: "pointer", fontFamily: "sans-serif", width: "100%" }}>
              Maybe later
            </button>
          </div>
        </div>
      )}

      <nav style={s.nav}>
        <div style={s.logoWrap}>
          <span style={s.logoMark}>PP</span>
          <span style={s.logoText}>PermitPal</span>
        </div>
        <span style={s.navBadge}>Free Beta</span>
      </nav>

      {step === 0 && (
        <div style={s.hero}>
          <div style={s.heroEyebrow}>Home Renovation · Permit Guidance</div>
          <h1 style={s.heroTitle}>Stop guessing what permits <span style={s.heroAccent}>your project needs.</span></h1>
          <p style={s.heroSub}>Answer 8 questions. Get a municipality-specific permit checklist, cost estimates, and inspector tips — in under 60 seconds.</p>
          <div style={s.heroStats}>
            <div style={{ textAlign: "center" }}><div style={s.statNum}>$5,000+</div><div style={s.statLabel}>Average fine for unpermitted work</div></div>
            <div style={{ textAlign: "center" }}><div style={s.statNum}>38%</div><div style={s.statLabel}>Homes with unpermitted additions</div></div>
            <div style={{ textAlign: "center" }}><div style={s.statNum}>60 sec</div><div style={s.statLabel}>Time to get your checklist</div></div>
          </div>
        </div>
      )}

      <div style={s.main}>
        {step > 0 && step < 4 && (
          <div style={s.progressBar}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "#1C3A2F", borderRadius: "2px", transition: "width 0.4s ease" }} />
          </div>
        )}

        {step === 0 && (
          <div style={s.card} className="animate-in">
            <div style={s.stepLabel}>Step 1 of 4</div>
            <h2 style={s.stepTitle}>Where's the project?</h2>
            <p style={s.stepSub}>Permit requirements vary by city and county. Your ZIP code lets us tailor the checklist to your municipality.</p>
            <label style={s.fieldLabel}>ZIP Code *</label>
            <input style={s.input} type="text" placeholder="e.g. 90210" maxLength={5} value={zip} onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))} />
            <label style={s.fieldLabel}>City & State (optional — improves accuracy)</label>
            <input style={s.input} type="text" placeholder="e.g. Austin, TX" value={city} onChange={(e) => setCity(e.target.value)} />
            <button style={{ ...s.btn, opacity: zip.length === 5 ? 1 : 0.45, cursor: zip.length === 5 ? "pointer" : "not-allowed" }} onClick={() => zip.length === 5 && setStep(1)}>Continue →</button>
          </div>
        )}

        {step === 1 && (
          <div style={s.card} className="animate-in">
            <div style={s.stepLabel}>Step 2 of 4</div>
            <h2 style={s.stepTitle}>What are you building?</h2>
            <p style={s.stepSub}>Select the project type that best matches your renovation.</p>
            <div style={s.typeGrid}>
              {PROJECT_TYPES.map((t) => <TypeCard key={t.id} t={t} />)}
            </div>
            <button style={{ ...s.btn, opacity: projectType ? 1 : 0.45, cursor: projectType ? "pointer" : "not-allowed", marginTop: "20px" }} onClick={() => projectType && setStep(2)}>Continue →</button>
            <button style={s.btnSecondary} onClick={() => setStep(0)}>← Back</button>
          </div>
        )}

        {step === 2 && (
          <div style={s.card} className="animate-in">
            <div style={s.stepLabel}>Step 3 of 4</div>
            <h2 style={s.stepTitle}>Tell us about the scope</h2>
            <p style={s.stepSub}>Rough estimates are fine — more detail means a more accurate checklist.</p>
            <label style={s.fieldLabel}>Approximate size (sq ft, linear ft, or dimensions)</label>
            <input style={s.input} type="text" placeholder={projectType === "fence" ? "e.g. 120 linear feet" : "e.g. 400 sq ft"} value={sqft} onChange={(e) => setSqft(e.target.value)} />
            <label style={s.fieldLabel}>Height or number of stories (if relevant)</label>
            <input style={s.input} type="text" placeholder="e.g. 8 feet tall, single-story" value={height} onChange={(e) => setHeight(e.target.value)} />
            <label style={s.fieldLabel}>Are you hiring a licensed contractor?</label>
            <div style={s.radioGroup}>
              {["Yes", "No — DIY", "Not sure yet"].map((o) => <RadioBtn key={o} label={o} value={o} current={contractor} set={setContractor} />)}
            </div>
            <label style={s.fieldLabel}>When do you plan to start?</label>
            <div style={s.radioGroup}>
              {["Within 2 weeks", "1–2 months", "3+ months", "Just researching"].map((o) => <RadioBtn key={o} label={o} value={o} current={timeline} set={setTimeline} />)}
            </div>
            <button style={s.btn} onClick={() => setStep(3)}>Continue →</button>
            <button style={s.btnSecondary} onClick={() => setStep(1)}>← Back</button>
          </div>
        )}

        {step === 3 && (
          <div style={s.card} className="animate-in">
            <div style={s.stepLabel}>Step 4 of 4</div>
            <h2 style={s.stepTitle}>Ready to generate your checklist</h2>
            <p style={s.stepSub}>We'll analyze your project against local building codes and produce a full permit guide.</p>
            <div style={{ background: "#F0F5F2", borderRadius: "8px", padding: "20px", marginBottom: "16px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {[["LOCATION", `${zip}${city ? " · " + city : ""}`], ["PROJECT", `${selectedType?.icon} ${selectedType?.label}`], ["SIZE", sqft || "Not specified"], ["CONTRACTOR", contractor || "Not specified"]].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontFamily: "sans-serif", fontSize: "11px", color: "#8B7355", marginBottom: "4px" }}>{k}</div>
                    <div style={{ fontFamily: "sans-serif", fontSize: "14px", fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            {error && <div style={{ ...s.warningBox, marginBottom: "16px" }}><span>⚠️</span><span>{error}</span></div>}
            <button style={s.btn} onClick={handleAnalyze}>Generate My Permit Checklist</button>
            <button style={s.btnSecondary} onClick={() => setStep(2)}>← Edit details</button>
          </div>
        )}

        {step === 4 && loading && (
          <div style={s.card}>
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div className="spinner" />
              <div style={{ fontFamily: "sans-serif", color: "#3A3A3A", fontSize: "16px", marginBottom: "8px" }}>{LOADING_MESSAGES[loadingStage]}</div>
              <div style={{ fontFamily: "sans-serif", color: "#A8A8A8", fontSize: "13px" }}>Analyzing {selectedType?.label} requirements for {zip}</div>
            </div>
          </div>
        )}

        {step === 4 && !loading && result && (
          <div className="animate-in">
            <div style={{ background: "#1C3A2F", borderRadius: "10px", padding: "24px 28px", marginBottom: "20px", display: "flex", alignItems: "flex-start", gap: "16px" }}>
              <div style={{ fontSize: "32px" }}>{selectedType?.icon}</div>
              <div>
                <div style={{ color: "#F7F5F0", fontSize: "18px", fontFamily: "Georgia, serif", marginBottom: "6px" }}>{selectedType?.label} — {result.municipality}</div>
                <div style={{ fontFamily: "sans-serif", fontSize: "14px", color: "#A8C5B5", lineHeight: "1.5" }}>{result.summary}</div>
              </div>
            </div>

            <div style={s.card}>
              {result.permits_required?.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <div style={s.sectionTitle}>Permits you'll likely need</div>
                  {result.permits_required.map((p, i) => (
                    <div key={i} style={s.permitItem}>
                      <div style={{ fontSize: "22px", flexShrink: 0 }}>{p.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>{p.name}</div>
                        <div style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#5A5A5A", lineHeight: "1.5" }}>{p.description}</div>
                        <div style={s.permitMeta}>
                          <span>💰 {p.typical_cost}</span>
                          <span>⏱ {p.typical_timeline}</span>
                          <span>👤 {p.who_files}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {result.warnings?.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <div style={s.sectionTitle}>Watch out for these</div>
                  {result.warnings.map((w, i) => (
                    <div key={i} style={s.warningBox}><span>⚠️</span><span>{w}</span></div>
                  ))}
                </div>
              )}

              {result.cost_estimate && (
                <div style={{ marginBottom: "28px" }}>
                  <div style={s.sectionTitle}>Estimated permit costs</div>
                  <div style={s.costBox}>
                    <div style={s.costRow}><span>Permit fees</span><span>${result.cost_estimate.permit_fees_low} – ${result.cost_estimate.permit_fees_high}</span></div>
                    <div style={s.costRow}><span>Inspection fees</span><span>${result.cost_estimate.inspection_fees_low} – ${result.cost_estimate.inspection_fees_high}</span></div>
                    <div style={s.costTotal}><span>Total estimated</span><span>${result.cost_estimate.permit_fees_low + result.cost_estimate.inspection_fees_low} – ${result.cost_estimate.permit_fees_high + result.cost_estimate.inspection_fees_high}</span></div>
                    {result.cost_estimate.notes && <div style={{ fontFamily: "sans-serif", fontSize: "12px", color: "#6B6B6B", marginTop: "10px" }}>{result.cost_estimate.notes}</div>}
                  </div>
                </div>
              )}

              {result.checklist?.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <div style={s.sectionTitle}>Your action checklist</div>
                  {result.checklist.map((item, i) => (
                    <div key={i} onClick={() => toggleCheck(`c${i}`)} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "13px 0", borderBottom: "1px solid #F0EDE6", cursor: "pointer" }}>
                      <div style={{ width: "20px", height: "20px", border: checkedItems[`c${i}`] ? "2px solid #1C3A2F" : "2px solid #D4CFC5", borderRadius: "4px", background: checkedItems[`c${i}`] ? "#1C3A2F" : "#FAFAF8", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px" }}>
                        {checkedItems[`c${i}`] ? "✓" : ""}
                      </div>
                      <span style={{ fontFamily: "sans-serif", fontSize: "14px", color: checkedItems[`c${i}`] ? "#A8A8A8" : "#3A3A3A", textDecoration: checkedItems[`c${i}`] ? "line-through" : "none", lineHeight: "1.4" }}>{item}</span>
                    </div>
                  ))}
                </div>
              )}

              {result.inspector_tips?.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <div style={s.sectionTitle}>What inspectors look for</div>
                  {result.inspector_tips.map((tip, i) => (
                    <div key={i} style={s.tipBox}><span>🔍</span><span>{tip}</span></div>
                  ))}
                </div>
              )}

              {result.permits_not_required?.length > 0 && (
                <div style={{ marginBottom: "28px" }}>
                  <div style={s.sectionTitle}>What you probably don't need a permit for</div>
                  {result.permits_not_required.map((p, i) => (
                    <div key={i} style={{ ...s.permitItem, background: "#F7F5F0" }}>
                      <div style={{ fontSize: "20px" }}>✅</div>
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "14px", marginBottom: "3px" }}>{p.name}</div>
                        <div style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#5A5A5A" }}>{p.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={s.disclaimer}>⚠️ This checklist is AI-generated guidance based on typical requirements and should not be treated as legal or regulatory advice. Always verify permit requirements directly with your local building department before starting work.</div>
            </div>

            {/* Cost Estimator Section */}
            {!estimate && (
              <div style={{ background: "#F0F5F2", border: "1px solid #C5D9CE", borderRadius: "10px", padding: "28px", marginTop: "20px", marginBottom: "8px" }}>
                <div style={{ textAlign: "center" as const }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔨</div>
                  <div style={{ fontSize: "20px", fontFamily: "Georgia, serif", marginBottom: "8px", color: "#1C3A2F" }}>How much will this project cost?</div>
                  <div style={{ fontFamily: "sans-serif", fontSize: "14px", color: "#5A7A6A", marginBottom: "20px", lineHeight: "1.5" }}>Answer 2 quick questions for a tighter cost estimate.</div>
                </div>

                {showEstimateForm && (
                  <div className="animate-in">
                    <div style={{ marginBottom: "16px" }}>
                      <div style={{ fontFamily: "sans-serif", fontSize: "13px", fontWeight: 600, color: "#1C3A2F", marginBottom: "10px" }}>Material quality</div>
                      <div style={s.radioGroup}>
                        {["Budget", "Mid-range", "Premium"].map((o) => (
                          <button key={o} onClick={() => setMaterialQuality(o)} style={{ padding: "9px 18px", border: materialQuality === o ? "2px solid #1C3A2F" : "1.5px solid #C5D9CE", borderRadius: "24px", background: materialQuality === o ? "#1C3A2F" : "#F7F5F0", color: materialQuality === o ? "#E8D5A3" : "#1A1A1A", cursor: "pointer", fontFamily: "sans-serif", fontSize: "13px", fontWeight: materialQuality === o ? 600 : 400 }}>
                            {o === "Budget" ? "💰 Budget" : o === "Mid-range" ? "⚖️ Mid-range" : "✨ Premium"}
                          </button>
                        ))}
                      </div>
                      <div style={{ fontFamily: "sans-serif", fontSize: "12px", color: "#6B6B6B", marginTop: "6px" }}>
                        {materialQuality === "Budget" ? "Basic materials, functional but minimal" : materialQuality === "Mid-range" ? "Good quality materials, most common choice" : materialQuality === "Premium" ? "High-end materials, best durability and aesthetics" : ""}
                      </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ fontFamily: "sans-serif", fontSize: "13px", fontWeight: 600, color: "#1C3A2F", marginBottom: "10px" }}>Your location type</div>
                      <div style={s.radioGroup}>
                        {["Rural", "Suburban", "Urban"].map((o) => (
                          <button key={o} onClick={() => setLocationType(o)} style={{ padding: "9px 18px", border: locationType === o ? "2px solid #1C3A2F" : "1.5px solid #C5D9CE", borderRadius: "24px", background: locationType === o ? "#1C3A2F" : "#F7F5F0", color: locationType === o ? "#E8D5A3" : "#1A1A1A", cursor: "pointer", fontFamily: "sans-serif", fontSize: "13px", fontWeight: locationType === o ? 600 : 400 }}>
                            {o === "Rural" ? "🌾 Rural" : o === "Suburban" ? "🏘️ Suburban" : "🏙️ Urban"}
                          </button>
                        ))}
                      </div>
                      <div style={{ fontFamily: "sans-serif", fontSize: "12px", color: "#6B6B6B", marginTop: "6px" }}>
                        {locationType === "Rural" ? "Lower labor costs, may need material delivery" : locationType === "Suburban" ? "Average labor costs, most common" : locationType === "Urban" ? "Higher labor costs, limited access surcharges" : ""}
                      </div>
                    </div>

                    {estimateError && <div style={{ ...s.warningBox, marginBottom: "16px" }}><span>⚠️</span><span>{estimateError}</span></div>}

                    <button
                      onClick={handleEstimate}
                      disabled={estimateLoading || !materialQuality || !locationType}
                      style={{ background: "#1C3A2F", color: "#E8D5A3", border: "none", padding: "13px 28px", fontSize: "15px", borderRadius: "8px", cursor: !materialQuality || !locationType ? "not-allowed" : "pointer", fontFamily: "sans-serif", fontWeight: 600, opacity: estimateLoading || !materialQuality || !locationType ? 0.5 : 1, width: "100%" }}>
                      {estimateLoading ? "Calculating…" : "Generate Cost Estimate →"}
                    </button>
                  </div>
                )}

                {!showEstimateForm && (
                  <div style={{ textAlign: "center" as const }}>
                    <button onClick={() => setShowEstimateForm(true)} style={{ background: "#1C3A2F", color: "#E8D5A3", border: "none", padding: "13px 28px", fontSize: "15px", borderRadius: "8px", cursor: "pointer", fontFamily: "sans-serif", fontWeight: 600 }}>
                      Get Cost Estimate →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cost Estimate Results */}
            {estimate && (
              <div style={{ ...s.card, marginTop: "20px" }} className="animate-in">
                <div style={{ background: "#1C3A2F", borderRadius: "10px", padding: "20px 24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ fontSize: "28px" }}>🔨</div>
                  <div>
                    <div style={{ color: "#F7F5F0", fontSize: "18px", fontFamily: "Georgia, serif", marginBottom: "4px" }}>Project Cost Estimate</div>
                    <div style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#A8C5B5" }}>{estimate.project} · {estimate.size}</div>
                  </div>
                </div>

                {/* Total Cost */}
                <div style={{ marginBottom: "28px" }}>
                  <div style={s.sectionTitle}>Total project cost</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <div style={{ background: "#F0F5F2", border: "1px solid #C5D9CE", borderRadius: "8px", padding: "16px", textAlign: "center" as const }}>
                      <div style={{ fontFamily: "sans-serif", fontSize: "11px", color: "#8B7355", marginBottom: "6px", letterSpacing: "1px", textTransform: "uppercase" as const }}>Low estimate</div>
                      <div style={{ fontSize: "22px", fontWeight: "bold", color: "#1C3A2F" }}>${estimate.total_low?.toLocaleString()}</div>
                    </div>
                    <div style={{ background: "#1C3A2F", border: "1px solid #2D5A45", borderRadius: "8px", padding: "16px", textAlign: "center" as const }}>
                      <div style={{ fontFamily: "sans-serif", fontSize: "11px", color: "#A8C5B5", marginBottom: "6px", letterSpacing: "1px", textTransform: "uppercase" as const }}>Typical range</div>
                      <div style={{ fontSize: "22px", fontWeight: "bold", color: "#E8D5A3" }}>${estimate.total_low?.toLocaleString()} – ${estimate.total_high?.toLocaleString()}</div>
                    </div>
                    <div style={{ background: "#F0F5F2", border: "1px solid #C5D9CE", borderRadius: "8px", padding: "16px", textAlign: "center" as const }}>
                      <div style={{ fontFamily: "sans-serif", fontSize: "11px", color: "#8B7355", marginBottom: "6px", letterSpacing: "1px", textTransform: "uppercase" as const }}>High estimate</div>
                      <div style={{ fontSize: "22px", fontWeight: "bold", color: "#1C3A2F" }}>${estimate.total_high?.toLocaleString()}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "sans-serif", fontSize: "12px", color: "#8B7355", marginTop: "10px", textAlign: "center" as const }}>
                    ~${estimate.cost_per_sqft_low}–${estimate.cost_per_sqft_high} per sq ft · Timeline: {estimate.timeline}
                  </div>
                </div>

                {/* Materials Breakdown */}
                {estimate.materials?.length > 0 && (
                  <div style={{ marginBottom: "28px" }}>
                    <div style={s.sectionTitle}>Materials breakdown</div>
                    {estimate.materials.map((m: any, i: number) => (
                      <div key={i} style={{ padding: "14px 0", borderBottom: "1px solid #F0EDE6" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                          <div>
                            <div style={{ fontFamily: "sans-serif", fontSize: "14px", fontWeight: 600, color: "#1A1A1A", marginBottom: "3px" }}>{m.category}</div>
                            <div style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#6B6B6B" }}>{m.description}</div>
                          </div>
                          <div style={{ fontFamily: "sans-serif", fontSize: "14px", fontWeight: 600, color: "#1C3A2F", whiteSpace: "nowrap" as const, marginLeft: "16px" }}>
                            ${m.cost_low?.toLocaleString()} – ${m.cost_high?.toLocaleString()}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                          {m.home_depot_search && (
                            <a href={`https://www.homedepot.com/s/${encodeURIComponent(m.home_depot_search)}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "sans-serif", fontSize: "12px", color: "#F96302", textDecoration: "none", border: "1px solid #F96302", borderRadius: "4px", padding: "3px 8px", fontWeight: 500 }}>
                              🟠 Shop Home Depot
                            </a>
                          )}
                          {m.lowes_search && (
                            <a href={`https://www.lowes.com/search?searchTerm=${encodeURIComponent(m.lowes_search)}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "sans-serif", fontSize: "12px", color: "#004990", textDecoration: "none", border: "1px solid #004990", borderRadius: "4px", padding: "3px 8px", fontWeight: 500 }}>
                              🔵 Shop Lowe's
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #F0EDE6" }}>
                      <div>
                        <div style={{ fontFamily: "sans-serif", fontSize: "14px", fontWeight: 600, color: "#1A1A1A", marginBottom: "3px" }}>Labor</div>
                        <div style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#6B6B6B" }}>Installation and contractor fees</div>
                      </div>
                      <div style={{ fontFamily: "sans-serif", fontSize: "14px", fontWeight: 600, color: "#1C3A2F", whiteSpace: "nowrap" as const, marginLeft: "16px" }}>
                        ${estimate.labor_low?.toLocaleString()} – ${estimate.labor_high?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Money saving tips */}
                {estimate.money_saving_tips?.length > 0 && (
                  <div style={{ marginBottom: "28px" }}>
                    <div style={s.sectionTitle}>Ways to save money</div>
                    {estimate.money_saving_tips.map((tip: string, i: number) => (
                      <div key={i} style={{ ...s.tipBox, marginBottom: "8px" }}><span>💡</span><span>{tip}</span></div>
                    ))}
                  </div>
                )}

                {estimate.notes && (
                  <div style={s.disclaimer}>{estimate.notes}</div>
                )}
              </div>
            )}

            <div style={s.ctaBox}>
              <div style={s.ctaTitle}>Want us to auto-fill your permit forms?</div>
              <div style={s.ctaSub}>We're building auto-completed permit applications for 500+ municipalities. Join the waitlist for early access.</div>
              {waitlistDone ? (
                <div style={{ color: "#E8D5A3", fontFamily: "sans-serif", fontSize: "16px", padding: "12px 0" }}>✅ You're on the list — we'll be in touch!</div>
              ) : (
                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" as const, gap: "8px" }}>
                  <input style={s.ctaInput} type="email" placeholder="your@email.com" value={waitlistEmail} onChange={(e) => setWaitlistEmail(e.target.value)} />
                  <button style={{ ...s.ctaBtn, opacity: waitlistLoading ? 0.7 : 1 }} onClick={handleWaitlist} disabled={waitlistLoading}>{waitlistLoading ? "Joining…" : "Join Waitlist →"}</button>
                </div>
              )}
              <div style={{ marginTop: "16px" }}>
                <button onClick={restart} style={{ background: "transparent", color: "#A8C5B5", border: "1px solid #2D5A45", padding: "10px 20px", fontSize: "13px", borderRadius: "8px", cursor: "pointer", fontFamily: "sans-serif" }}>← Start a new project</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}