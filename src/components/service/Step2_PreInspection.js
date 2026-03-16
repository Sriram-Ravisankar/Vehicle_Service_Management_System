import React from "react";
import { 
  Activity, 
  Droplets, 
  ShieldAlert, 
  Zap, 
  Disc, 
  Settings2, 
  Wind, 
  Layers, 
  Target, 
  CircleDot, 
  Sun,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  Circle
} from "lucide-react";

// ── tiny helpers ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, children, icon: Icon }) => (
  <div style={{
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #F3F4F6",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    padding: "24px",
    marginBottom: 24,
  }}>
    <div style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: 12, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
       {Icon && <Icon size={18} style={{ color: "#8B5CF6" }} />}
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h3>
    </div>
    {children}
  </div>
);

const inputSx = (hasError) => ({
  width: "100%",
  padding: "9px 13px",
  fontSize: 14,
  border: `1px solid ${hasError ? "#FCA5A5" : "#E5E7EB"}`,
  borderRadius: 8,
  outline: "none",
  background: hasError ? "#FFF5F5" : "#F9FAFB",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
});

const ICON_MAP = {
  engine_noise: Activity,
  oil_leak: Droplets,
  body_damage: ShieldAlert,
  electrical: Zap,
  brake: Disc,
  clutch: RefreshCw,
  ac: Wind,
  suspension: Layers,
  steering: Target,
  tyre: CircleDot,
  lights: Sun,
};



export default function Step2_PreInspection({ form, setForm, isView, showSnackbar }) {
  React.useEffect(() => {
    if (!form.inspection || form.inspection.length === 0) {
      const init = Object.entries(ICON_MAP).map(([key, icon]) => ({
        key,
        label: key.split("_").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
        checked: false,
        note: "",
        photos: [],
      }));
      setForm((f) => ({ ...f, inspection: init }));
    }
  }, []);

  const toggleCheck = (key) => {
    if (isView) return;
    setForm((f) => ({
      ...f,
      inspection: f.inspection.map((it) =>
        it.key === key ? { ...it, checked: !it.checked } : it
      ),
    }));
  };

  const updateNote = (key, text) => {
    if (isView) return;
    setForm((f) => ({
      ...f,
      inspection: f.inspection.map((it) =>
        it.key === key ? { ...it, note: text } : it
      ),
    }));
  };

  return (
    <div>
      <SectionCard title="Pre-Inspection Checklist" icon={Activity}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: 16 
        }}>
          {form.inspection?.map((item) => {
            const IconComp = item.icon || Activity;
            return (
              <div
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: `1.5px solid ${item.checked ? "#8B5CF6" : "#F3F4F6"}`,
                  background: item.checked ? "#F5F3FF" : "#fff",
                  cursor: isView ? "default" : "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: item.checked ? "#EFEEFF" : "#F9FAFB",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: item.checked ? "#7C3AED" : "#9CA3AF",
                      border: `1px solid ${item.checked ? "#DDD6FE" : "#E5E7EB"}`,
                    }}>
                      {(() => {
                        const IconComp = ICON_MAP[item.key] || Activity;
                        return <IconComp size={20} />;
                      })()}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: item.checked ? "#111827" : "#4B5563" }}>
                      {item.label}
                    </span>
                  </div>
                  <div style={{ color: item.checked ? "#8B5CF6" : "#E5E7EB" }}>
                    {item.checked ? <CheckCircle2 size={22} fill="#8B5CF6" color="#fff" /> : <Circle size={22} />}
                  </div>
                </div>

                {item.checked && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <input
                      placeholder="Add observation note..."
                      value={item.note || ""}
                      onChange={(e) => updateNote(item.key, e.target.value)}
                      disabled={isView}
                      style={{
                        ...inputSx(false),
                        padding: "7px 10px",
                        fontSize: 13,
                        background: "#fff"
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Customer Complaint" icon={MessageSquare}>
        <textarea
          placeholder="Enter detailed customer complaint or special instructions..."
          value={form.complaint || ""}
          disabled={isView}
          onChange={(e) => setForm((f) => ({ ...f, complaint: e.target.value }))}
          style={{
            ...inputSx(false),
            minHeight: 120,
            resize: "vertical",
            fontFamily: "inherit"
          }}
        />
      </SectionCard>
    </div>
  );
}
