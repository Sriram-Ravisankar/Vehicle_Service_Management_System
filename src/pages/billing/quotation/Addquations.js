// AddQuotation.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  Button,
  IconButton,
  Stack,
  Snackbar,
  Alert,
  CircularProgress,
  Divider as MuiDivider,
} from "@mui/material";

import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Package,
  Wrench,
  Wallet,
} from "lucide-react";

import apiEndpoints from "../../../apiconfig";

/* utility */
const currency = (v) =>
  Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const SectionCard = ({ title, children, icon: Icon, action, style = {} }) => (
  <div style={{
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #F3F4F6",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    padding: "24px",
    marginBottom: 24,
    ...style
  }}>
    <div style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: 12, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {Icon && <Icon size={18} style={{ color: "#8B5CF6" }} />}
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h3>
      </div>
      {action}
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

const labelStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: "#374151",
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 6
};

export default function AddQuotation() {
  const { quotation_guid: routeGuid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const isViewMode = Boolean(routeGuid && location.pathname.includes("view-quotation"));
  const isCreateMode = !routeGuid;
  const [jobCards, setJobCards] = useState([]);

  const fromJob = location.state?.job_guid || null;
  const fromJobNo = location.state?.jobcardNo || null;

  const [loading, setLoading] = useState(Boolean(routeGuid));
  const [working, setWorking] = useState(false);

  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const showSnack = (msg, sev = "success") => setSnack({ open: true, message: msg, severity: sev });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const [form, setForm] = useState({
    quotation_no: "",
    quotationDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    job_guid: fromJob || "",
    jobcardNo: fromJobNo || "",
    customer_guid: "",
    vehicle_guid: "",
    parts: [{ id: Date.now(), name: "", qty: 1, rate: 0, amount: 0 }],
    labour: [{ id: Date.now() + 1, title: "", hours: 1, rate: 0, amount: 0 }],
    totals: {
      partsTotal: 0,
      labourTotal: 0,
      subtotal: 0,
      discountType: "percent",
      discountValue: 0,
      discountAmount: 0,
      gstRate: 18,
      includeGST: true,
      gst: 0,
      grandTotal: 0,
    },
    notes: "",
    terms: "1. Quotation is valid for 7 days\n2. Estimation may vary during actual service\n3. GST applicable as per norms",
    status: "Approval Pending",
  });

  const safeParse = (v, fallback = []) => {
    if (!v) return fallback;
    if (typeof v !== "string") return v;
    try { return JSON.parse(v); } catch { return fallback; }
  };

  useEffect(() => {
    const fetchJobCards = async () => {
      try {
        const res = await fetch(apiEndpoints.JobCard, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setJobCards(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); }
    };
    fetchJobCards();
  }, [token]);

  useEffect(() => {
    if (!fromJob) return;
    const fetchJobCard = async () => {
      try {
        const res = await fetch(apiEndpoints.JobCard + "?job_guid=" + fromJob, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const row = Array.isArray(data) ? data[0] : data;
        if (row) applyJobCardToForm(row);
      } catch (err) { console.error(err); }
    };
    fetchJobCard();
  }, [fromJob, token]);

  useEffect(() => {
    if (!routeGuid) return;
    const fetchQuotation = async () => {
      setLoading(true);
      try {
        const res = await fetch(apiEndpoints.Quotation + "?quotation_guid=" + routeGuid, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!data) {
          showSnack("Quotation not found", "error");
          setLoading(false);
          return;
        }

        const partsData = safeParse(data.parts, []);
        const labourData = safeParse(data.labour, []);
        const totalsData = safeParse(data.totals, {});

        setForm((f) => ({
          ...f,
          quotation_no: data.quotation_no || "",
          quotationDate: (data.created_on || "").slice(0, 10) || f.quotationDate,
          expiryDate: data.expiry_date || f.expiryDate,
          jobcardNo: data.jobcardNo || f.jobcardNo,
          job_guid: data.job_guid || f.job_guid,
          customer_guid: data.customer_guid || f.customer_guid,
          vehicle_guid: data.vehicle_guid || f.vehicle_guid,
          parts: partsData.length ? partsData.map(p => ({ ...p, id: p.id || Math.random() })) : f.parts,
          labour: labourData.length ? labourData.map(l => ({ ...l, id: l.id || Math.random() })) : f.labour,
          totals: {
            ...f.totals,
            ...totalsData,
            includeGST: totalsData.includeGST ?? true,
            gstRate: totalsData.gstRate ?? 18,
          },
          notes: data.notes || "",
          status: data.status || f.status,
        }));
      } catch (err) {
        console.error(err);
        showSnack("Failed to load quotation", "error");
      } finally { setLoading(false); }
    };
    fetchQuotation();
  }, [routeGuid, token]);

  // Totals Calculation
  useEffect(() => {
    const partsTotal = (form.parts || []).reduce((s, p) => s + Number(p.amount || 0), 0);
    const labourTotal = (form.labour || []).reduce((s, l) => s + Number(l.amount || 0), 0);
    const subtotal = partsTotal;
    const discountType = form.totals?.discountType || "percent";
    const discountValue = Number(form.totals?.discountValue || 0);
    
    let discountAmount = 0;
    if (discountType === "percent") {
      discountAmount = (subtotal * discountValue) / 100;
    } else {
      discountAmount = discountValue;
    }

    const afterDiscount = subtotal - discountAmount;
    const gstRate = Number(form.totals?.gstRate ?? 18);
    const includeGST = form.totals?.includeGST ?? true;
    const gst = includeGST ? (afterDiscount * gstRate) / 100 : 0;
    const grandTotal = Math.round(afterDiscount + gst + labourTotal);

    setForm((f) => ({
      ...f,
      totals: {
        ...f.totals,
        partsTotal,
        labourTotal,
        subtotal,
        discountAmount,
        gst,
        grandTotal,
      },
    }));
  }, [form.parts, form.labour, form.totals?.discountType, form.totals?.discountValue, form.totals?.gstRate, form.totals?.includeGST]);

  const addPart = () => {
    const item = { id: Date.now(), name: "", qty: 1, rate: 0, amount: 0 };
    setForm((f) => ({ ...f, parts: [...(f.parts || []), item] }));
  };

  const addLabour = () => {
    const item = { id: Date.now() + 1, title: "", hours: 1, rate: 0, amount: 0 };
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

  const removePart = (id) => setForm((f) => ({ ...f, parts: f.parts.filter((p) => p.id !== id) }));
  const removeLabour = (id) => setForm((f) => ({ ...f, labour: f.labour.filter((l) => l.id !== id) }));

  const applyJobCardToForm = (row) => {
    const partsArr = safeParse(row.parts, []);
    const labourArr = safeParse(row.labour, []);
    
    setForm(f => ({
      ...f,
      job_guid: row.job_guid,
      jobcardNo: row.jobcardNo,
      customer_guid: row.customer_guid || "",
      vehicle_guid: row.vehicle_guid || "",
      parts: partsArr.length ? partsArr.map(p => ({
        id: Math.random(),
        name: p.name || p.product || "",
        qty: Number(p.qty || 1),
        rate: Number(p.rate || 0),
        amount: Number(p.amount || 0)
      })) : [{ id: Date.now(), name: "", qty: 1, rate: 0, amount: 0 }],
      labour: labourArr.length ? labourArr.map(l => ({
        id: Math.random(),
        title: l.title || l.name || "",
        hours: 1,
        rate: Number(l.amount || l.rate || 0),
        amount: Number(l.amount || 0)
      })) : [{ id: Date.now() + 1, title: "", hours: 1, rate: 0, amount: 0 }]
    }));
  };

  const handleJobCardChange = async (job_guid) => {
    try {
      showSnack("Linking job card...", "info");
      const resCheck = await fetch(
        apiEndpoints.Quotation + "?job_guid=" + job_guid,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const existing = await resCheck.json();
      if (existing?.quotation_guid) {
        showSnack("Existing quotation found. Redirecting...", "info");
        navigate("/edit-quotation/" + existing.quotation_guid, { replace: true });
        return;
      }

      const res = await fetch(apiEndpoints.JobCard + "?job_guid=" + job_guid, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const row = Array.isArray(data) ? data[0] : data;

      if (row) {
        applyJobCardToForm(row);
        showSnack("Job card items imported.", "success");
      }
    } catch (err) { showSnack("Failed to link job card.", "error"); }
  };

  const handleSave = async () => {
    if (isViewMode) return;
    if (!form.job_guid) {
      showSnack("Job card is required.", "error");
      return;
    }

    setWorking(true);
    try {
      const qForm = new FormData();
      qForm.append("job_guid", form.job_guid);
      qForm.append("customer_guid", form.customer_guid || "");
      qForm.append("vehicle_guid", form.vehicle_guid || "");
      qForm.append("parts", JSON.stringify(form.parts));
      qForm.append("labour", JSON.stringify(form.labour));
      qForm.append("totals", JSON.stringify(form.totals));
      qForm.append("notes", form.notes || "");
      qForm.append("status", form.status || "Approval Pending");

      const res = await fetch(apiEndpoints.Quotation + (isCreateMode ? "" : "?quotation_guid=" + encodeURIComponent(routeGuid)), {
        method: "POST", headers: { Authorization: `Bearer ${token}` }, body: qForm
      });
      const data = await res.json();
      if (data.success) {
        showSnack(isCreateMode ? "Quotation created!" : "Quotation updated!", "success");
        setTimeout(() => navigate("/quotations"), 1500);
      } else { showSnack(data.message || "Failed to save", "error"); }
    } catch (err) { showSnack("Unexpected error.", "error"); } finally { setWorking(false); }
  };

  if (loading) return (
    <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff" }}>
      <CircularProgress sx={{ color: "rgba(139, 92, 246, 0.9)" }} />
    </Box>
  );

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3, background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton onClick={() => navigate("/quotations")}>
            <ArrowLeft size={28} style={{ color: "rgba(139, 92, 246, 0.9)" }} />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
            {isCreateMode ? "Create Quotation" : isViewMode ? "View Quotation" : "Edit Quotation"}
          </Typography>
        </Stack>
      </Box>

      {/* Basic Details */}
      <SectionCard title="Quotation Details" icon={FileText}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ ...labelStyle, mb: 0, width: 140, flexShrink: 0 }}>Job Card</Typography>
              <select
                disabled={isViewMode}
                value={form.job_guid}
                style={inputSx()}
                onChange={(e) => handleJobCardChange(e.target.value)}
              >
                <option value="">-- Select Job Card --</option>
                {jobCards.map(jc => <option key={jc.job_guid} value={jc.job_guid}>{jc.jobcardNo}</option>)}
              </select>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ ...labelStyle, mb: 0, width: 140, flexShrink: 0 }}>Quotation Date</Typography>
              <input
                type="date"
                disabled={isViewMode}
                value={form.quotationDate}
                style={inputSx()}
                onChange={(e) => setForm(s => ({ ...s, quotationDate: e.target.value }))}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ ...labelStyle, mb: 0, width: 140, flexShrink: 0 }}>Expiry Date</Typography>
              <input
                type="date"
                disabled={isViewMode}
                value={form.expiryDate}
                style={inputSx()}
                onChange={(e) => setForm(s => ({ ...s, expiryDate: e.target.value }))}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography sx={{ ...labelStyle, mb: 0, width: 140, flexShrink: 0 }}>Status</Typography>
              <select disabled={isViewMode} value={form.status} style={inputSx()} onChange={(e) => setForm(s => ({ ...s, status: e.target.value }))}>
                <option value="Approval Pending">Approval Pending</option>
                <option value="Approved">Approved</option>
                <option value="Work In Progress">Work In Progress</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </Box>
          </Grid>
        </Grid>
      </SectionCard>

      {/* Parts Inventory */}
      <SectionCard title="Parts Inventory" icon={Package}>
        <Box sx={{ overflowX: "auto", width: "100%", pb: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "600px" }}>
            {form.parts?.map((p) => (
              <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 140px 140px 40px", gap: 12, alignItems: "center" }}>
                <input placeholder="Part Name..." value={p.name} disabled={isViewMode} style={inputSx(false)} onChange={(e) => updatePart(p.id, "name", e.target.value)} />
                <input type="number" placeholder="Qty" value={p.qty} disabled={isViewMode} style={inputSx(false)} onChange={(e) => updatePart(p.id, "qty", e.target.value)} />
                <input type="number" placeholder="Rate" value={p.rate} disabled={isViewMode} style={inputSx(false)} onChange={(e) => updatePart(p.id, "rate", e.target.value)} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", textAlign: "right" }}>₹ {currency(p.amount)}</div>
                {!isViewMode && (
                  <button onClick={() => removePart(p.id)} style={{ border: "none", background: "#FEF2F2", color: "#EF4444", borderRadius: 8, padding: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {!isViewMode && (
              <Button 
                variant="contained" 
                size="small" 
                onClick={addPart}
                startIcon={<Plus size={16} />}
                sx={{ 
                  bgcolor: "rgba(139, 92, 246, 0.9)", 
                  "&:hover": { bgcolor: "rgba(139, 92, 246, 1)" },
                  textTransform: "none",
                  borderRadius: "8px",
                  fontSize: 12,
                  fontWeight: 600,
                  mt: 1,
                  width: "fit-content"
                }}
              >
                Add Part
              </Button>
            )}
          </div>
        </Box>
      </SectionCard>

      {/* Labour Services */}
      <SectionCard title="Labour Services" icon={Wrench}>
        <Box sx={{ overflowX: "auto", width: "100%", pb: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "600px" }}>
            {form.labour?.map((l) => (
              <div key={l.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 140px 140px 40px", gap: 12, alignItems: "center" }}>
                <input placeholder="Labour Title..." value={l.title} disabled={isViewMode} style={inputSx(false)} onChange={(e) => updateLabour(l.id, "title", e.target.value)} />
                <input type="number" placeholder="Hours" value={l.hours} disabled={isViewMode} style={inputSx(false)} onChange={(e) => updateLabour(l.id, "hours", e.target.value)} />
                <input type="number" placeholder="Rate" value={l.rate} disabled={isViewMode} style={inputSx(false)} onChange={(e) => updateLabour(l.id, "rate", e.target.value)} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", textAlign: "right" }}>₹ {currency(l.amount)}</div>
                {!isViewMode && (
                  <button onClick={() => removeLabour(l.id)} style={{ border: "none", background: "#FEF2F2", color: "#EF4444", borderRadius: 8, padding: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {!isViewMode && (
              <Button 
                variant="contained" 
                size="small" 
                onClick={addLabour}
                startIcon={<Plus size={16} />}
                sx={{ 
                  bgcolor: "rgba(139, 92, 246, 0.9)", 
                  "&:hover": { bgcolor: "rgba(139, 92, 246, 1)" },
                  textTransform: "none",
                  borderRadius: "8px",
                  fontSize: 12,
                  fontWeight: 600,
                  mt: 1,
                  width: "fit-content"
                }}
              >
                Add Labour
              </Button>
            )}
          </div>
        </Box>
      </SectionCard>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 24, alignItems: "stretch" }}>
        <div style={{ height: "100%" }}>
          <SectionCard title="Pricing & Notes" icon={Wallet} style={{ height: "100%", marginBottom: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Discount Type</label>
                  <select disabled={isViewMode} value={form.totals?.discountType || "percent"} style={inputSx(false)} onChange={(e) => setForm(f => ({ ...f, totals: { ...f.totals, discountType: e.target.value, discountValue: 0 }}))}>
                    <option value="percent">Percentage (%)</option>
                    <option value="amount">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Discount Value</label>
                  <input type="number" disabled={isViewMode} value={form.totals?.discountValue || 0} style={inputSx(false)} onChange={(e) => setForm(f => ({ ...f, totals: { ...f.totals, discountValue: Number(e.target.value) }}))} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>GST Rate (%)</label>
                  <input type="number" disabled={isViewMode} value={form.totals?.gstRate || 0} style={inputSx(false)} onChange={(e) => setForm(f => ({ ...f, totals: { ...f.totals, gstRate: Number(e.target.value) }}))} />
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <div style={{ background: "#1F2937", borderRadius: 20, padding: "32px", color: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
          <h4 style={{ margin: "0 0 24px 0", fontSize: 16, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em" }}>Quotation Summary</h4>
          
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
              <span style={{ fontSize: 18, fontWeight: 700 }}>Total Estimate</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: "#8B5CF6" }}>₹ {currency(form.totals?.grandTotal)}</span>
                <p style={{ margin: 0, fontSize: 11, color: "#9CA3AF" }}>Final amount may vary</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      {!isViewMode && (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            disabled={working}
            onClick={handleSave}
            sx={{ 
              borderRadius: "12px", 
              textTransform: "none", 
              fontWeight: 700, 
              fontSize: 15,
              px: 6, 
              py: 1.5,
              bgcolor: "rgba(139, 92, 246, 0.9)", 
              boxShadow: "0 4px 6px -1px rgba(139, 92, 246, 0.2)",
              "&:hover": { bgcolor: "rgba(139, 92, 246, 1)" }
            }}
          >
            {working ? "Saving Quotation..." : "Save Quotation"}
          </Button>
        </Box>
      )}



      <Snackbar open={snack.open} autoHideDuration={3000} onClose={closeSnack} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snack.severity} sx={{ borderRadius: "12px", fontWeight: 700 }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
