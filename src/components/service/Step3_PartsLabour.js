import React from "react";
import { 
  Box,
} from "@mui/material";
import { 
  Package, 
  Wrench, 
  Plus, 
  Trash2, 
  Wallet, 
  Tag, 
  Percent, 
  DollarSign, 
  FileText,
  IndianRupee,
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

const currency = (v) =>
  Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function Step3_PartsLabour({
  form,
  setForm,
  onBack,
  onSave,
  isSubmitting,
  isView,
  showSnackbar,
}) {

  React.useEffect(() => {
    if (!form.parts || form.parts.length === 0) {
      setForm((f) => ({
        ...f,
        parts: [{ id: Date.now(), name: "", qty: 1, rate: 0, amount: 0 }],
      }));
    }
    if (!form.labour || form.labour.length === 0) {
      setForm((f) => ({
        ...f,
        labour: [{ id: Date.now() + 1, title: "", hours: 1, rate: 0, amount: 0 }],
      }));
    }
  }, []);

  const addPart = () => {
    const item = { id: Date.now(), name: "", qty: 1, rate: 0, amount: 0 };
    setForm((f) => ({ ...f, parts: [...(f.parts || []), item] }));
  };

  const addLabour = () => {
    const item = { id: Date.now(), title: "", hours: 1, rate: 0, amount: 0 };
    setForm((f) => ({ ...f, labour: [...(f.labour || []), item] }));
  };

  const updatePart = (id, key, val) => {
    setForm((f) => ({
      ...f,
      parts: f.parts.map((p) =>
        p.id === id
          ? {
            ...p,
            [key]: val,
            amount: Number(key === "qty" ? val : p.qty) * Number(key === "rate" ? val : p.rate),
          }
          : p
      ),
    }));
  };

  const updateLabour = (id, key, val) => {
    setForm((f) => ({
      ...f,
      labour: f.labour.map((l) =>
        l.id === id
          ? {
            ...l,
            [key]: val,
            amount: Number(key === "hours" ? val : l.hours) * Number(key === "rate" ? val : l.rate),
          }
          : l
      ),
    }));
  };

  const removePart = (id) =>
    setForm((f) => ({ ...f, parts: f.parts.filter((p) => p.id !== id) }));

  const removeLabour = (id) =>
    setForm((f) => ({ ...f, labour: f.labour.filter((l) => l.id !== id) }));

  React.useEffect(() => {
    const partsTotal = (form.parts || []).reduce((s, p) => s + Number(p.amount || 0), 0);
    const labourTotal = (form.labour || []).reduce((s, l) => s + Number(l.amount || 0), 0);
    const subtotal = partsTotal;
    const discountType = form.totals?.discountType || "percent";
    const discountValue = Number(form.totals?.discountValue || 0);
    const afterDiscount = discountType === "percent" ? subtotal - (subtotal * discountValue) / 100 : subtotal - discountValue;
    const gstRate = Number(form.totals?.gstRate ?? 18);
    const includeGST = form.totals?.includeGST ?? false;
    const gst = includeGST ? (afterDiscount * gstRate) / 100 : 0;
    const beforeRoundTotal = afterDiscount + gst + labourTotal;
    const grandTotal = Math.round(beforeRoundTotal);

    setForm((f) => ({
      ...f,
      totals: {
        partsTotal, labourTotal, subtotal, discountType, discountValue,
        discountAmount: subtotal - afterDiscount, gstRate, includeGST, gst, grandTotal,
      },
    }));
  }, [form.parts, form.labour, form.totals?.discountType, form.totals?.discountValue, form.totals?.gstRate, form.totals?.includeGST]);

  return (
    <div>
      <SectionCard title="Parts Inventory" icon={Package}>
        <Box sx={{ overflowX: "auto", width: "100%", pb: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "600px" }}>
            {form.parts?.map((p, idx) => (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 140px 140px 40px", gap: 12, alignItems: "center" }}>
                <input placeholder="Part Name..." value={p.name} disabled={isView} style={inputSx(false)} onChange={(e) => updatePart(p.id, "name", e.target.value)} />
                <input type="number" placeholder="Qty" value={p.qty} disabled={isView} style={inputSx(false)} onChange={(e) => updatePart(p.id, "qty", e.target.value)} />
                <input type="number" placeholder="Rate" value={p.rate} disabled={isView} style={inputSx(false)} onChange={(e) => updatePart(p.id, "rate", e.target.value)} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", textAlign: "right" }}>₹ {currency(p.amount)}</div>
                {!isView && (
                  <button onClick={() => removePart(p.id)} style={{ border: "none", background: "#FEF2F2", color: "#EF4444", borderRadius: 8, padding: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {!isView && (
              <button onClick={addPart} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "1.5px dashed #E5E7EB", background: "#F9FAFB", color: "#6B7280", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>
                <Plus size={16} /> Add Part Row
              </button>
            )}
          </div>
        </Box>
      </SectionCard>

      <SectionCard title="Labour Services" icon={Wrench}>
        <Box sx={{ overflowX: "auto", width: "100%", pb: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "600px" }}>
            {form.labour?.map((l) => (
              <div key={l.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 140px 140px 40px", gap: 12, alignItems: "center" }}>
                <input placeholder="Labour Title..." value={l.title} disabled={isView} style={inputSx(false)} onChange={(e) => updateLabour(l.id, "title", e.target.value)} />
                <input type="number" placeholder="Hours" value={l.hours} disabled={isView} style={inputSx(false)} onChange={(e) => updateLabour(l.id, "hours", e.target.value)} />
                <input type="number" placeholder="Rate" value={l.rate} disabled={isView} style={inputSx(false)} onChange={(e) => updateLabour(l.id, "rate", e.target.value)} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", textAlign: "right" }}>₹ {currency(l.amount)}</div>
                {!isView && (
                  <button onClick={() => removeLabour(l.id)} style={{ border: "none", background: "#FEF2F2", color: "#EF4444", borderRadius: 8, padding: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {!isView && (
              <button onClick={addLabour} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "1.5px dashed #E5E7EB", background: "#F9FAFB", color: "#6B7280", fontSize: 13, fontWeight: 600, cursor: "pointer", marginTop: 8 }}>
                <Plus size={16} /> Add Labour Row
              </button>
            )}
          </div>
        </Box>
      </SectionCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 24, alignItems: "start" }}>
        <div>
          <SectionCard title="Pricing & Notes" icon={Wallet}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Discount Type</label>
                  <select disabled={isView} value={form.totals?.discountType || "percent"} style={inputSx(false)} onChange={(e) => setForm(f => ({ ...f, totals: { ...f.totals, discountType: e.target.value, discountValue: 0 }}))}>
                    <option value="percent">Percentage (%)</option>
                    <option value="amount">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Discount Value</label>
                  <input type="number" disabled={isView} value={form.totals.discountValue || 0} style={inputSx(false)} onChange={(e) => setForm(f => ({ ...f, totals: { ...f.totals, discountValue: Number(e.target.value) }}))} />
                </div>
              </div>

              <div 
                onClick={() => !isView && setForm(f => ({ ...f, totals: { ...f.totals, includeGST: !f.totals.includeGST }}))}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 12, 
                  padding: "12px", 
                  background: form.totals.includeGST ? "#F5F3FF" : "#F9FAFB", 
                  borderRadius: 10,
                  cursor: isView ? "default" : "pointer",
                  border: `1px solid ${form.totals.includeGST ? "#DDD6FE" : "transparent"}`,
                  transition: "all 0.2s"
                }}
              >
                <div style={{ color: form.totals.includeGST ? "#8B5CF6" : "#D1D5DB" }}>
                  {form.totals.includeGST ? <CheckCircle2 size={20} fill="#8B5CF6" color="#fff" /> : <Circle size={20} />}
                </div>
                <label style={{ fontSize: 14, fontWeight: 600, color: form.totals.includeGST ? "#111827" : "#374151", cursor: "pointer" }}>Apply GST (18%)</label>
                {form.totals.includeGST && (
                  <div onClick={(e) => e.stopPropagation()} style={{ marginLeft: "auto" }}>
                     <input type="number" disabled={isView} value={form.totals.gstRate || 0} style={{ ...inputSx(false), width: 80 }} onChange={(e) => setForm(f => ({ ...f, totals: { ...f.totals, gstRate: Number(e.target.value) }}))} />
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Internal Notes</label>
                <textarea placeholder="Add private notes or reminders..." value={form.notes || ""} disabled={isView} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inputSx(false), minHeight: 80, resize: "vertical" }} />
              </div>
            </div>
          </SectionCard>
        </div>

        <div style={{ background: "#1F2937", borderRadius: 20, padding: "32px", color: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
          <h4 style={{ margin: "0 0 24px 0", fontSize: 16, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em" }}>Service Summary</h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "#9CA3AF" }}>Parts Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹ {currency(form.totals?.partsTotal)}</span>
            </div>
            
            {Number(form.totals?.discountAmount) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "#10B981" }}>Discount ({form.totals.discountType})</span>
                <span style={{ color: "#10B981", fontWeight: 600 }}>- ₹ {currency(form.totals?.discountAmount)}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "#9CA3AF" }}>GST Amount</span>
              <span style={{ fontWeight: 600 }}>₹ {currency(form.totals?.gst)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "#9CA3AF" }}>Labour Total</span>
              <span style={{ fontWeight: 600 }}>₹ {currency(form.totals?.labourTotal)}</span>
            </div>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "8px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>Total Payable</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: "#8B5CF6" }}>₹ {currency(form.totals?.grandTotal)}</span>
                <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF" }}>Inclusive of all taxes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
