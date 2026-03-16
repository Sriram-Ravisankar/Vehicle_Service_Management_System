import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Building2, Phone, Mail, MapPin, Upload, X, Save } from "lucide-react";
import { Box, Button, Snackbar, Alert, Stack } from "@mui/material";
import apiEndpoints from "../../apiconfig";
import DynamicHeader from "../common/Dynamicheader";

const API_URL = apiEndpoints.supplier;

// ── tiny helpers ──────────────────────────────────────────────────────────────
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
  transition: "border-color 0.15s",
});

const SectionCard = ({ title, children }) => (
  <div style={{
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #F3F4F6",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    padding: "24px",
    marginBottom: 24,
  }}>
    <div style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: 12, marginBottom: 20 }}>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h3>
    </div>
    {children}
  </div>
);

// ── main component ─────────────────────────────────────────────────────────────
const AddSupplier = ({ fetchData }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    supplier_name: "", email: "", mobile_no: "", company_name: "",
    landline_no: "", image: null, imagePreview: "",
    country: "", state: "", city: "", address: "",
  });

  const [isEditMode, setIsEditMode]   = useState(false);
  const [editId, setEditId]           = useState(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [errors, setErrors]           = useState({});
  const [states, setStates]           = useState([]);
  const [cities, setCities]           = useState([]);
  const [snackbar, setSnackbar]       = useState({ open: false, message: "", severity: "success" });

  // ── fetch states ──
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${apiEndpoints.locations}?type=states`);
        const data = await res.json();
        if (data.status === "success") setStates(data.data);
      } catch (e) { console.error(e); }
    })();
  }, []);

  // ── populate edit data ──
  useEffect(() => {
    if (location.state?.editData) {
      const d = location.state.editData;
      setIsEditMode(true);
      setEditId(d.supplier_id);
      setFormData({
        supplier_name: d.supplier_name || "",
        email:         d.email         || "",
        mobile_no:     d.mobile_no     || "",
        company_name:  d.company_name  || "",
        landline_no:   d.landline_no   || "",
        image:         null,
        imagePreview:  d.image_path    || "",
        country:       d.country       || "",
        state:         d.state         || "",
        city:          d.city          || "",
        address:       d.address       || "",
      });
      if (d.state) fetchCities(d.state);
    }
  }, [location.state]);

  const fetchCities = async (stateId) => {
    try {
      const res  = await fetch(`${apiEndpoints.locations}?type=cities&state_id=${stateId}`);
      const data = await res.json();
      if (data.status === "success") setCities(data.data);
    } catch (e) { console.error(e); }
  };

  // ── validation ──
  const validate = (name, value) => {
    if (name === "supplier_name" && !value.trim()) return "Supplier name is required";
    if (name === "email") {
      if (!value.trim()) return "Email is required";
      if (!/^\S+@\S+\.\S+$/.test(value)) return "Invalid email format";
    }
    if (name === "mobile_no") {
      if (!value.trim()) return "Mobile number is required";
      if (!/^[0-9]{10}$/.test(value)) return "Must be 10 digits";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      const file = files[0];
      if (!file) return;
      setFormData((p) => ({ ...p, image: file, imagePreview: URL.createObjectURL(file) }));
      return;
    }
    if (name === "state") {
      fetchCities(value);
      setFormData((p) => ({ ...p, state: value, city: "" }));
      return;
    }
    const err = validate(name, value);
    setErrors((p) => ({ ...p, [name]: err }));
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // ── submit ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = ["supplier_name", "email", "mobile_no"];
    const newErrors = {};
    required.forEach((k) => {
      const err = validate(k, formData[k]);
      if (err) newErrors[k] = err;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSnackbar({ open: true, message: "Please fill all required fields", severity: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const fd = new FormData();
      ["supplier_name","company_name","email","mobile_no","landline_no","country","state","city","address"]
        .forEach((k) => fd.append(k, formData[k] ?? ""));
      if (formData.image instanceof File) fd.append("image", formData.image);
      if (isEditMode) {
        fd.append("supplier_id", editId);
        if (!(formData.image instanceof File) && formData.imagePreview)
          fd.append("existing_image", formData.imagePreview);
      }

      const res    = await fetch(API_URL, {
        method: "POST", body: fd,
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.message || "Operation failed");

      setSnackbar({ open: true, message: isEditMode ? "Supplier updated!" : "Supplier added!", severity: "success" });
      if (fetchData) fetchData();
      setTimeout(() => navigate("/supplier"), 1400);
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "An error occurred", severity: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ 
      px: { xs: 3, sm: 4, md: 6 }, 
      py: { xs: 2, sm: 4 }, 
      width: "100%", 
      maxWidth: "100%", 
      overflowX: "hidden" 
    }}>
      {/* Header — shows "Add Supplier" + back button automatically */}
      <DynamicHeader />

      <form onSubmit={handleSubmit}>
        {/* ── SECTION 1: Personal Information ── */}
        <SectionCard title="Personal Information">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 20 }}>

            <Field label="Supplier Name *" icon={User} error={errors.supplier_name}>
              <input name="supplier_name" value={formData.supplier_name} onChange={handleChange}
                placeholder="e.g. Rajesh Kumar" style={inputSx(!!errors.supplier_name)} />
            </Field>

            <Field label="Company Name" icon={Building2}>
              <input name="company_name" value={formData.company_name} onChange={handleChange}
                placeholder="e.g. AutoParts Hub" style={inputSx(false)} />
            </Field>

            <Field label="Mobile No *" icon={Phone} error={errors.mobile_no}>
              <input name="mobile_no" value={formData.mobile_no} onChange={handleChange}
                placeholder="10-digit number" style={inputSx(!!errors.mobile_no)} />
            </Field>

            <Field label="Email *" icon={Mail} error={errors.email}>
              <input name="email" type="email" value={formData.email} onChange={handleChange}
                placeholder="supplier@example.com" style={inputSx(!!errors.email)} />
            </Field>

            <Field label="Landline No" icon={Phone}>
              <input name="landline_no" value={formData.landline_no} onChange={handleChange}
                placeholder="Optional" style={inputSx(false)} />
            </Field>

            {/* Profile Image */}
            <Field label="Profile Image">
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
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", padding: 0 }}
                    ><X size={16} /></button>
                  </div>
                )}
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* ── SECTION 2: Address Information ── */}
        <SectionCard title="Address Information">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 20 }}>

            <Field label="Country" icon={MapPin}>
              <input name="country" value={formData.country} onChange={handleChange}
                placeholder="e.g. India" style={inputSx(false)} />
            </Field>

            <Field label="State">
              <select name="state" value={formData.state} onChange={handleChange}
                style={{ ...inputSx(false), appearance: "none" }}>
                <option value="">Select State</option>
                {states.map((s) => <option key={s.state_id} value={s.state_id}>{s.state_name}</option>)}
              </select>
            </Field>

            <Field label="Town / City">
              <select name="city" value={formData.city} onChange={handleChange}
                style={{ ...inputSx(false), appearance: "none" }}>
                <option value="">Select City</option>
                {cities.map((c) => <option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}
              </select>
            </Field>

            <Field label="Address">
              <textarea name="address" value={formData.address} onChange={handleChange}
                placeholder="Full address..." rows={3}
                style={{ ...inputSx(false), resize: "vertical", height: "auto" }}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ── Single Save Button ── */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={<Save size={16} />}
            sx={{
              backgroundColor: "rgba(139, 92, 246, 0.9)",
              "&:hover": { backgroundColor: "rgba(139, 92, 246, 1)" },
              color: "#fff",
              borderRadius: "10px",
              px: 4,
              py: 1.2,
              fontWeight: 600,
              textTransform: "none",
              fontSize: 14,
            }}
          >
            {isLoading ? "Saving..." : isEditMode ? "Update Supplier" : "Save Supplier"}
          </Button>
        </Box>
      </form>

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

export default AddSupplier;