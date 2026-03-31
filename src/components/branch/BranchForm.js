// src/components/branch/BranchForm.js
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Avatar,
  CircularProgress,
  Snackbar,
  Alert,
  Switch,
  IconButton,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Image as ImageIcon,
  Save,
  Globe,
  Codesandbox,
  X
} from "lucide-react";
import apiEndpoints from "../../apiconfig";
import SectionHeader from "../common/Header";

// ── Shared UI Components ──────────────────────────────────────────────────────

const Field = ({ label, icon: Icon, error, children, required }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ 
      fontSize: 13, 
      fontWeight: 600, 
      color: "#475569", 
      display: "flex", 
      alignItems: "center", 
      gap: 6 
    }}>
      {Icon && <Icon size={14} style={{ color: "#0EA5E9" }} />}
      {label}{required && " *"}
    </label>
    {children}
    {error && <span style={{ fontSize: 12, color: "#EF4444", fontWeight: 500 }}>{error}</span>}
  </div>
);

const inputSx = (hasError) => ({
  width: "100%",
  padding: "10px 14px",
  fontSize: "14px",
  border: `1px solid ${hasError ? "#FCA5A5" : "#E2E8F0"}`,
  borderRadius: "10px",
  outline: "none",
  background: hasError ? "#FFF5F5" : "#fff",
  color: "#1E293B",
  fontWeight: 500,
  transition: "all 0.2s ease",
  "&:focus": {
    borderColor: "#0EA5E9",
    boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.1)",
  }
});

const SectionCard = ({ title, children, icon: Icon }) => (
  <Box sx={{
    background: "#fff",
    borderRadius: "20px",
    border: "1px solid #F1F5F9",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)",
    p: { xs: 2, sm: 3 },
    mb: 3,
  }}>
    <div style={{ 
      borderBottom: "1px solid #F1F5F9", 
      paddingBottom: "14px", 
      marginBottom: "20px", 
      display: "flex", 
      alignItems: "center", 
      gap: "10px" 
    }}>
      {Icon && (
        <div style={{ 
          width: 32, 
          height: 32, 
          borderRadius: "8px", 
          background: "#F5F3FF", 
          color: "#0EA5E9", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <Icon size={18} />
        </div>
      )}
      <h3 style={{ 
        margin: 0, 
        fontSize: "14px", 
        fontWeight: 700, 
        color: "#1E293B", 
        textTransform: "uppercase", 
        letterSpacing: "0.025em" 
      }}>
        {title}
      </h3>
    </div>
    {children}
  </Box>
);

const BranchForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get("id");
  const token = sessionStorage.getItem("token");

  const [formData, setFormData] = useState({
    branchName: "",
    branchCode: "",
    contactNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    country: "",
    isHeadOffice: false,
    image: null,
    imagePreview: "",
  });

  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (!editId) return;
    const fetchBranch = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${apiEndpoints.branches}?id=${editId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await resp.json();
        if (json.success && json.data) {
          const b = json.data;
          setFormData({
            branchName: b.branch_name || "",
            branchCode: b.branch_code || "",
            contactNumber: b.contact_number || "",
            email: b.email || "",
            address: b.address || "",
            city: b.city || "",
            state: b.state || "",
            country: b.country || "",
            isHeadOffice: b.is_head_office == 1,
            image: null,
            imagePreview: b.image_path ? apiEndpoints.branches.replace("branches.php", "") + b.image_path : "",
          });
        }
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    fetchBranch();
  }, [editId, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: file, imagePreview: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors = {};
    if (!formData.branchName) newErrors.branchName = "Required";
    if (!formData.email) newErrors.email = "Required";
    if (!formData.contactNumber) newErrors.contactNumber = "Required";
    if (!formData.address) newErrors.address = "Required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSnackbar({ open: true, message: "Please fill required fields", severity: "error" });
      return;
    }

    setWorking(true);
    const body = new FormData();
    if (editId) body.append("branch_id", editId);
    body.append("branch_name", formData.branchName);
    body.append("branch_code", formData.branchCode);
    body.append("contact_number", formData.contactNumber);
    body.append("email", formData.email);
    body.append("address", formData.address);
    body.append("city", formData.city);
    body.append("state", formData.state);
    body.append("country", formData.country);
    body.append("is_head_office", formData.isHeadOffice ? 1 : 0);
    if (formData.image) body.append("image", formData.image);

    try {
      const resp = await fetch(apiEndpoints.branches, { 
        method: "POST", 
        headers: { Authorization: `Bearer ${token}` },
        body 
      });
      const result = await resp.json();
      if (result.success) {
        setSnackbar({ open: true, message: editId ? "Branch updated successfully!" : "Branch created successfully!", severity: "success" });
        setTimeout(() => navigate("/branches"), 1200);
      } else {
        throw new Error(result.error || "Save failed");
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    } finally { setWorking(false); }
  };

  if (loading) return (
    <Box sx={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress sx={{ color: "#0EA5E9" }} />
    </Box>
  );

  return (
    <Box sx={{ 
      p: { xs: 1.5, sm: 3, md: 4 }, 
      backgroundColor: "#F8FAFC", 
      minHeight: "100vh",
      width: "100%",
      animation: "fadeInUp 0.6s ease-out forwards",
      "@keyframes fadeInUp": {
        "0%": { opacity: 0, transform: "translateY(20px)" },
        "100%": { opacity: 1, transform: "translateY(0)" }
      }
    }}>
      <SectionHeader title={editId ? "Edit Branch" : "Create New Branch"} showBack={true} />

      <Box sx={{ maxWidth: "1200px", mx: "auto", mt: 3 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
          
          {/* ── CORE IDENTITY ── */}
          <SectionCard title="Branch Identity" icon={Codesandbox}>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
              gap: "24px" 
            }}>
              <Field label="Branch Name" icon={Building2} required error={errors.branchName}>
                <input 
                  autoFocus
                  name="branchName" 
                  value={formData.branchName} 
                  onChange={handleChange} 
                  style={inputSx(!!errors.branchName)} 
                  placeholder="e.g. Downtown Motors" 
                />
              </Field>

              <Field label="Branch Code" icon={Globe}>
                <input 
                  name="branchCode" 
                  value={formData.branchCode} 
                  onChange={handleChange} 
                  style={inputSx(false)} 
                  placeholder="e.g. BR-01" 
                />
              </Field>

              <Field label="Contact Number" icon={Phone} required error={errors.contactNumber}>
                <input 
                  name="contactNumber" 
                  value={formData.contactNumber} 
                  onChange={handleChange} 
                  style={inputSx(!!errors.contactNumber)} 
                  placeholder="+1 (555) 000-0000" 
                />
              </Field>

              <Field label="Email Address" icon={Mail} required error={errors.email}>
                <input 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  style={inputSx(!!errors.email)} 
                  placeholder="branch@example.com" 
                />
              </Field>

              <div style={{ padding: "16px", background: "#F8FAFC", borderRadius: "14px", border: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <Typography sx={{ fontWeight: 700, fontSize: "14px", color: "#1E293B" }}>Head Office</Typography>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 500 }}>Global master branch for billing</Typography>
                </div>
                <Switch 
                  checked={formData.isHeadOffice} 
                  onChange={(e) => setFormData(p => ({ ...p, isHeadOffice: e.target.checked }))}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": { color: "#0EA5E9" },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#0EA5E9" }
                  }}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px", background: "#fff", borderRadius: "14px", border: "1px solid #F1F5F9" }}>
                <div style={{ position: "relative" }}>
                  {formData.imagePreview ? (
                    <Avatar src={formData.imagePreview} sx={{ width: 56, height: 56, borderRadius: "12px", border: "2px solid #F1F5F9" }} />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: "12px", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", border: "1.5px dashed #E2E8F0" }}>
                      <ImageIcon size={24} />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Branch Logo</Typography>
                  <Button
                    variant="text"
                    component="label"
                    size="small"
                    sx={{ textTransform: "none", fontSize: "12px", color: "#0EA5E9", p: 0, minWidth: 0, fontWeight: 700 }}
                  >
                    Upload Photo
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </Button>
                </div>
                {formData.imagePreview && (
                  <IconButton onClick={() => setFormData(p => ({ ...p, image: null, imagePreview: "" }))} size="small" sx={{ color: "#EF4444" }}>
                    <X size={16} />
                  </IconButton>
                )}
              </div>
            </div>
          </SectionCard>

          {/* ── LOCATION ── */}
          <SectionCard title="Location & Address" icon={MapPin}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <Field label="Street Address" required error={errors.address}>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  placeholder="Enter complete office address..." 
                  style={{ 
                    ...inputSx(!!errors.address), 
                    minHeight: "80px", 
                    resize: "vertical", 
                    fontFamily: "inherit" 
                  }} 
                />
              </Field>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                gap: "24px" 
              }}>
                <Field label="City">
                  <input name="city" value={formData.city} onChange={handleChange} style={inputSx(false)} placeholder="e.g. Coimbatore" />
                </Field>
                <Field label="State / Province">
                  <input name="state" value={formData.state} onChange={handleChange} style={inputSx(false)} placeholder="e.g. Tamilnadu" />
                </Field>
                <Field label="Country">
                  <input name="country" value={formData.country} onChange={handleChange} style={inputSx(false)} placeholder="e.g. India" />
                </Field>
              </div>
            </div>
          </SectionCard>

        </div>

        {/* ── ACTION FOOTER ── */}
        <Box sx={{ 
          mt: 4, 
          pt: 4, 
          borderTop: "1px solid #E2E8F0", 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: "16px",
          pb: 8
        }}>
          {/* <Button
            onClick={() => navigate("/branches")}
            sx={{ 
              borderRadius: "12px", 
              textTransform: "none", 
              fontWeight: 700, 
              px: 4, 
              color: "#64748B",
              "&:hover": { background: "#F1F5F9" }
            }}
          >
            Discard
          </Button> */}
          <Button
            variant="contained"
            disabled={working}
            onClick={handleSubmit}
            startIcon={working ? <CircularProgress size={16} color="inherit" /> : <Save size={18} />}
            sx={{ 
              borderRadius: "12px", 
              textTransform: "none", 
              fontWeight: 800, 
              px: 6, 
              py: 1.5,
              fontSize: "14px",
              background: "linear-gradient(135deg, #0EA5E9 0%, #7C3AED 100%)",
              boxShadow: "0 10px 15px -3px rgba(14, 165, 233, 0.3)",
              transition: "all 0.2s ease",
              "&:hover": { 
                transform: "translateY(-1px)",
                boxShadow: "0 20px 25px -5px rgba(14, 165, 233, 0.4)",
                background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
              },
              "&:disabled": { background: "#E2E8F0", color: "#94A3B8" }
            }}
          >
            {working ? "Saving..." : editId ? "Update Branch" : "Create Branch"}
          </Button>
        </Box>
      </Box>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3500} 
        onClose={() => setSnackbar({...snackbar, open: false})} 
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: "10px", fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BranchForm;