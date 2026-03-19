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
import apiEndpoints from "../../apiconfig";

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

  const [products, setProducts] = React.useState([]);
  const [workers, setWorkers] = React.useState([]);

  React.useEffect(() => {
    const fetchRequiredData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        // Fetch Products
        const prodRes = await fetch(apiEndpoints.product, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const prodData = await prodRes.json();
        if (prodData.success) setProducts(prodData.data);

        // Fetch Workers (Mechanics)
        const workerRes = await fetch(apiEndpoints.workerManagement + "?action=workers", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const workerData = await workerRes.json();
        setWorkers(Array.isArray(workerData) ? workerData : []);
      } catch (err) {
        console.error("Fetch error in Step3:", err);
      }
    };
    fetchRequiredData();

    if (!form.parts || form.parts.length === 0) {
      setForm((f) => ({
        ...f,
        parts: [{ id: Date.now(), product_id: "", name: "", qty: 1, rate: 0, amount: 0 }],
      }));
    }
    if (!form.labour || form.labour.length === 0) {
      setForm((f) => ({
        ...f,
        labour: [{ id: Date.now() + 1, title: "", mechanic_guid: "", hours: 1, rate: 0, amount: 0 }],
      }));
    }
  }, []);

  const addPart = () => {
    const item = { id: Date.now(), product_id: "", name: "", qty: 1, rate: 0, amount: 0 };
    setForm((f) => ({ ...f, parts: [...(f.parts || []), item] }));
  };

  const addLabour = () => {
    const item = { id: Date.now(), title: "", mechanic_guid: "", hours: 1, rate: 0, amount: 0 };
    setForm((f) => ({ ...f, labour: [...(f.labour || []), item] }));
  };

  const updatePart = (id, key, val) => {
    setForm((f) => {
      const parts = (f.parts || []).map((p) => {
        if (p.id !== id) return p;
        let updated = { ...p, [key]: val };

        if (key === "product_id" && val) {
          // Check for duplication
          const isDuplicate = (f.parts || []).some(existing => existing.id !== id && String(existing.product_id) === String(val));
          if (isDuplicate) {
            showSnackbar("This product is already added. Please increase the quantity of the existing row.", "warning");
            updated.product_id = "";
            return updated;
          }
          
          const prod = products.find(prod => String(prod.id) === String(val));
          if (prod) {
            const avail = Number(prod.available_stock || 0);
            if (avail <= 0) {
              showSnackbar(`Out of Stock! ${prod.product_name} has 0 available.`, "error");
              updated.product_id = "";
              return updated;
            }
            updated.name = prod.product_name;
            updated.rate = Number(prod.price || 0);
            if (!updated.qty || updated.qty < 1) updated.qty = 1;
          }
        }

        if (key === "qty" && updated.product_id) {
          const prod = products.find(prod => String(prod.id) === String(updated.product_id));
          if (prod) {
            const avail = Number(prod.available_stock || 0);
            if (Number(val) > avail) {
              showSnackbar(`Not enough stock! Only ${avail} available for ${prod.product_name}.`, "error");
              updated.qty = avail;
            }
          }
        }

        updated.amount = Number(updated.qty || 0) * Number(updated.rate || 0);
        return updated;
      });
      return { ...f, parts };
    });
  };

  const updateLabour = (id, key, val) => {
    setForm((f) => {
      const labour = (f.labour || []).map((l) => {
        if (l.id !== id) return l;
        let updated = { ...l, [key]: val };
        updated.amount = Number(updated.hours || 0) * Number(updated.rate || 0);
        return updated;
      });
      return { ...f, labour };
    });
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
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "850px" }}>
            {/* Table Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 80px 120px 120px 40px", gap: 12, padding: "0 4px", borderBottom: "1px solid #F3F4F6", paddingBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Select Product</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Part Name</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Qty</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Rate</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", textAlign: "right" }}>Amount</span>
              <span></span>
            </div>
            {form.parts?.map((p, idx) => (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 80px 120px 120px 40px", gap: 12, alignItems: "center" }}>
                <select 
                  value={p.product_id || ""} 
                  disabled={isView} 
                  style={inputSx(false)} 
                  onChange={(e) => updatePart(p.id, "product_id", e.target.value)}
                >
                  <option value="">-- Select Product --</option>
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.product_name} ({prod.product_number})</option>
                  ))}
                </select>
                <input placeholder="Short Desc..." value={p.name} disabled={isView} style={inputSx(false)} onChange={(e) => updatePart(p.id, "name", e.target.value)} />
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
              <button 
                onClick={addPart} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8, 
                  padding: "8px 18px", 
                  borderRadius: 10, 
                  border: "none", 
                  background: "#F5F3FF", 
                  color: "#8B5CF6", 
                  fontSize: 13, 
                  fontWeight: 700, 
                  cursor: "pointer", 
                  marginTop: 12,
                  width: "fit-content",
                  boxShadow: "0 1px 2px rgba(139, 92, 246, 0.1)",
                  transition: "all 0.2s"
                }}
              >
                <Plus size={16} color="#8B5CF6" strokeWidth={3} /> Add Part
              </button>
            )}
          </div>
        </Box>
      </SectionCard>

      <SectionCard title="Labour Services" icon={Wrench}>
        <Box sx={{ overflowX: "auto", width: "100%", pb: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "850px" }}>
            {/* Table Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 80px 120px 120px 40px", gap: 12, padding: "0 4px", borderBottom: "1px solid #F3F4F6", paddingBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Labour Title</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Assign Mechanic</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Hour</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Rate</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", textAlign: "right" }}>Amount</span>
              <span></span>
            </div>
            {form.labour?.map((l) => (
              <div key={l.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 80px 120px 120px 40px", gap: 12, alignItems: "center" }}>
                <input placeholder="Labour Title..." value={l.title} disabled={isView} style={inputSx(false)} onChange={(e) => updateLabour(l.id, "title", e.target.value)} />
                <select 
                  value={l.mechanic_guid || ""} 
                  disabled={isView} 
                  style={inputSx(false)} 
                  onChange={(e) => updateLabour(l.id, "mechanic_guid", e.target.value)}
                >
                  <option value="">-- Select Mechanic --</option>
                  {workers
                    .filter(w => String(w.role_id) === "4")
                    .map(w => (
                      <option key={w.user_guid} value={w.user_guid}>{w.first_name} {w.last_name}</option>
                    ))}
                </select>
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
              <button 
                onClick={addLabour} 
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8, 
                  padding: "8px 18px", 
                  borderRadius: 10, 
                  border: "none", 
                  background: "#F5F3FF", 
                  color: "#8B5CF6", 
                  fontSize: 13, 
                  fontWeight: 700, 
                  cursor: "pointer", 
                  marginTop: 12,
                  width: "fit-content",
                  boxShadow: "0 1px 2px rgba(139, 92, 246, 0.1)",
                  transition: "all 0.2s"
                }}
              >
                <Plus size={16} color="#8B5CF6" strokeWidth={3} /> Add Labour
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
                  gap: 8, 
                  padding: "6px 14px", 
                  background: form.totals.includeGST ? "#EEF2FF" : "#F9FAFB", 
                  borderRadius: 10,
                  cursor: isView ? "default" : "pointer",
                  border: `1px solid ${form.totals.includeGST ? "#C7D2FE" : "#E5E7EB"}`,
                  width: "fit-content",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ color: form.totals.includeGST ? "#6366F1" : "#D1D5DB" }}>
                  {form.totals.includeGST ? <CheckCircle2 size={18} fill="#6366F1" color="#fff" /> : <Circle size={18} />}
                </div>
                <label style={{ fontSize: 13, fontWeight: 700, color: form.totals.includeGST ? "#312E81" : "#4B5563", cursor: "pointer" }}>Apply GST (18%)</label>
                {form.totals.includeGST && (
                  <div onClick={(e) => e.stopPropagation()} style={{ marginLeft: 8 }}>
                     <input type="number" disabled={isView} value={form.totals.gstRate || 0} style={{ ...inputSx(false), width: 60, padding: "4px 8px", height: "auto" }} onChange={(e) => setForm(f => ({ ...f, totals: { ...f.totals, gstRate: Number(e.target.value) }}))} />
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
