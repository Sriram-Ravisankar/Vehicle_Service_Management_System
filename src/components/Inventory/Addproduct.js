import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Snackbar, Alert,
} from "@mui/material";
import { Save, Upload, X, Tag, Hash, DollarSign, Calendar, GitBranch, Shield, Plus, Minus } from "lucide-react";
import DynamicHeader from "../common/Dynamicheader";
import apiEndpoints from "../../apiconfig";

// ── shared field components ───────────────────────────────────────────────────
const Field = ({ label, icon: Icon, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
      {Icon && <Icon size={14} style={{ color: "#8B5CF6" }} />}
      {label}
    </label>
    {children}
    {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
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
});

const SectionCard = ({ title, children }) => (
  <div style={{
    background: "#fff", borderRadius: 16, border: "1px solid #F3F4F6",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "24px", marginBottom: 24,
  }}>
    <div style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: 12, marginBottom: 20 }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827",
        textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h3>
    </div>
    {children}
  </div>
);

// ── main component ─────────────────────────────────────────────────────────────
const AddProduct = ({ fetchData }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    product_number: "", product_name: "", unit: "",
    color: "", image: null, imagePreview: "",
    purchase_date: new Date().toISOString().split("T")[0],
    branch: "", price: "", warranty: "",
  });

  const [units, setUnits]               = useState([]);
  const [branches, setBranches]         = useState([]);
  const [isEditMode, setIsEditMode]     = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [errors, setErrors]             = useState({});
  const [openUnitDialog, setOpenUnitDialog] = useState(false);
  const [newUnit, setNewUnit]           = useState({ unit_name: "", unit_symbol: "", unit_type: "" });
  const [snackbar, setSnackbar]         = useState({ open: false, message: "", severity: "success" });

  // ── fetch units ──
  const fetchUnits = useCallback(async () => {
    try {
      const res  = await fetch(apiEndpoints.units);
      const data = await res.json();
      if (data.success) setUnits(data.data.filter((u) => Number(u.isActive) === 1 && Number(u.isDeleted) === 0));
    } catch (e) { console.error(e); }
  }, []);

  // ── fetch branches ──
  const fetchBranches = useCallback(async () => {
    try {
      const res  = await fetch(`${apiEndpoints.dropDown}?table=branches&todo=dropdown`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setBranches(data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    fetchUnits();
    fetchBranches();
    if (location.state?.editData) {
      const p = location.state.editData;
      setIsEditMode(true);
      setFormData({
        product_number: p.product_number || "",
        product_name:   p.product_name   || "",
        unit:           p.unit           || "",
        color:          p.color          || "",
        image:          null,
        imagePreview:   p.image          || "",
        purchase_date:  p.purchase_date  || new Date().toISOString().split("T")[0],
        branch:         p.branch         || "",
        price:          p.price          || "",
        warranty:       p.warranty       || "",
      });
    }
  }, [fetchUnits, fetchBranches, location.state]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      if (!file) return;
      setFormData((p) => ({ ...p, image: file, imagePreview: URL.createObjectURL(file) }));
      return;
    }
    setErrors((p) => ({ ...p, [name]: "" }));
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.product_number.trim()) errs.product_number = "Required";
    if (!formData.product_name.trim())   errs.product_name   = "Required";
    if (!formData.price)                 errs.price          = "Required";
    if (!formData.unit)                  errs.unit           = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { setSnackbar({ open: true, message: "Fill all required fields", severity: "error" }); return; }
    setIsLoading(true);
    try {
      const fd = new FormData();
      ["product_number","product_name","unit","color","purchase_date","branch","price","warranty"]
        .forEach((k) => fd.append(k, formData[k] ?? ""));
      if (formData.image instanceof File) fd.append("image", formData.image);
      if (isEditMode) fd.append("id", location.state.editData.id);

      const res    = await fetch(apiEndpoints.product, {
        method: "POST", body: fd,
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "Failed");
      setSnackbar({ open: true, message: isEditMode ? "Product updated!" : "Product added!", severity: "success" });
      if (fetchData) fetchData();
      setTimeout(() => navigate("/product"), 1400);
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally { setIsLoading(false); }
  };

  // ── add unit dialog submit ──
  const handleAddUnit = async () => {
    try {
      const res  = await fetch(apiEndpoints.units, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUnit),
      });
      const data = await res.json();
      if (data.success) {
        await fetchUnits();
        setOpenUnitDialog(false);
        setNewUnit({ unit_name: "", unit_symbol: "", unit_type: "" });
        setSnackbar({ open: true, message: "Unit added!", severity: "success" });
      }
    } catch (e) { console.error(e); }
  };

  const purpleBtn = {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600,
    cursor: "pointer", border: "none", transition: "all 0.18s",
  };

  const unitOptions = units.map((u) => ({ value: u.id, label: `${u.unit_name} (${u.unit_symbol})` }));
  const branchOptions = branches.map((b) => ({ value: b.branch_id, label: b.branch_name }));

  return (
    <Box sx={{ 
      px: { xs: 3, sm: 4, md: 6 }, 
      py: { xs: 2, sm: 4 }, 
      width: "100%", 
      maxWidth: "100%", 
      overflowX: "hidden" 
    }}>
      <DynamicHeader />

      <form onSubmit={handleSubmit}>
        {/* ── PRODUCT INFORMATION ── */}
        <SectionCard title="Product Information">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 20 }}>

            <Field label="Product Number *" icon={Hash} error={errors.product_number}>
              <input name="product_number" value={formData.product_number} onChange={handleChange}
                placeholder="e.g. PRD-001" style={inputSx(!!errors.product_number)} />
            </Field>

            <Field label="Product Name *" icon={Tag} error={errors.product_name}>
              <input name="product_name" value={formData.product_name} onChange={handleChange}
                placeholder="e.g. Brake Pad" style={inputSx(!!errors.product_name)} />
            </Field>

            <Field label="Price *" icon={DollarSign} error={errors.price}>
              <input name="price" type="number" value={formData.price} onChange={handleChange}
                placeholder="0.00" style={inputSx(!!errors.price)} />
            </Field>

            <Field label="Color">
              <input name="color" value={formData.color} onChange={handleChange}
                placeholder="e.g. Black" style={inputSx(false)} />
            </Field>

            <Field label="Warranty">
              <input name="warranty" value={formData.warranty} onChange={handleChange}
                placeholder="e.g. 1 year" style={inputSx(false)} />
            </Field>

            {/* Unit of measurement */}
            <Field label="Unit of Measurement *" error={errors.unit}>
              <div style={{ display: "flex", gap: 8 }}>
                <select name="unit" value={formData.unit} onChange={handleChange}
                  style={{ ...inputSx(!!errors.unit), flex: 1, appearance: "none" }}>
                  <option value="">Select Unit</option>
                  {unitOptions.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
                <button type="button" onClick={() => setOpenUnitDialog(true)}
                  style={{ ...purpleBtn, padding: "9px 14px", background: "rgba(139,92,246,0.9)", color: "#fff", borderRadius: 8 }}>
                  <Plus size={15} />
                </button>
              </div>
            </Field>

            {/* Product image */}
            <Field label="Product Image">
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", paddingTop: 2 }}>
                <label style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                  border: "1px solid #8B5CF6", color: "#8B5CF6", cursor: "pointer", background: "#fff",
                }}>
                  <Upload size={14} /> Choose Image
                  <input type="file" name="image" accept="image/*" hidden onChange={handleChange} />
                </label>
                {formData.imagePreview && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <img
                      src={formData.imagePreview.startsWith("blob:") ? formData.imagePreview : `${apiEndpoints.blob}${formData.imagePreview}`}
                      alt="Preview"
                      style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid #E5E7EB" }}
                    />
                    <button type="button"
                      onClick={() => setFormData((p) => ({ ...p, image: null, imagePreview: "" }))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", padding: 0 }}>
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* ── PURCHASE DETAILS ── */}
        <SectionCard title="Purchase Details">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 20 }}>

            <Field label="Purchase Date" icon={Calendar}>
              <input name="purchase_date" type="date" value={formData.purchase_date} onChange={handleChange}
                style={inputSx(false)} />
            </Field>

            <Field label="Branch" icon={GitBranch}>
              <select name="branch" value={formData.branch} onChange={handleChange}
                style={{ ...inputSx(false), appearance: "none" }}>
                <option value="">Select Branch</option>
                {branchOptions.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </Field>
          </div>
        </SectionCard>

        {/* ── Save button ── */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={<Save size={16} />}
            sx={{
              backgroundColor: "rgba(139, 92, 246, 0.9)",
              "&:hover": { backgroundColor: "rgba(139, 92, 246, 1)" },
              color: "#fff", borderRadius: "10px", px: 4, py: 1.2,
              fontWeight: 600, textTransform: "none", fontSize: 14,
            }}
          >
            {isLoading ? "Saving..." : isEditMode ? "Update Product" : "Save Product"}
          </Button>
        </Box>
      </form>

      {/* ── Add Unit Dialog ── */}
      <Dialog open={openUnitDialog} onClose={() => setOpenUnitDialog(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>Add Unit of Measurement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Unit Name"   name="unit_name"   value={newUnit.unit_name}   onChange={(e) => setNewUnit((p) => ({ ...p, unit_name:   e.target.value }))} fullWidth size="small" />
            <TextField label="Unit Symbol" name="unit_symbol" value={newUnit.unit_symbol} onChange={(e) => setNewUnit((p) => ({ ...p, unit_symbol: e.target.value }))} fullWidth size="small" />
            <TextField label="Unit Type"   name="unit_type"   value={newUnit.unit_type}   onChange={(e) => setNewUnit((p) => ({ ...p, unit_type:   e.target.value }))} fullWidth size="small" />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenUnitDialog(false)} sx={{ textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleAddUnit} variant="contained"
            sx={{ background: "rgba(139,92,246,0.9)", textTransform: "none", borderRadius: "8px",
              "&:hover": { background: "rgba(139,92,246,1)" } }}>
            Add Unit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity={snackbar.severity} variant="filled"
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddProduct;