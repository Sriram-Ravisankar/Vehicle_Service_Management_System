// src/components/branch/BranchForm.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Avatar,
  IconButton,
  Stack,
  FormControlLabel,
  Switch,
  CircularProgress,
  Paper,
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
  Plus
} from "lucide-react";
import apiEndpoints from "../../apiconfig";
import SectionHeader from "../common/Header";
import { Snackbar, Alert } from "@mui/material";

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

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#F9FAFB",
    transition: "0.2s",
    "&:hover": { backgroundColor: "#F3F4F6" },
    "&.Mui-focused": { backgroundColor: "#fff" }
  }
};

const labelStyle = { fontSize: 13, fontWeight: 600, color: "#475569", mb: 1 };

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
    if (!formData.branchName || !formData.email || !formData.contactNumber) {
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
        setSnackbar({ open: true, message: editId ? "Branch updated!" : "Branch added!", severity: "success" });
        setTimeout(() => navigate("/branches"), 1200);
      }
    } catch (err) {
      setSnackbar({ open: true, message: "Save failed", severity: "error" });
    } finally { setWorking(false); }
  };

  if (loading) return (
    <Box sx={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <CircularProgress sx={{ color: "#8B5CF6" }} />
    </Box>
  );

  return (
    <Box sx={{ px: { xs: 1.5, md: 3 }, py: 3, backgroundColor: "#F9FAFB", minHeight: "100vh" }}>
      <SectionHeader />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <SectionCard title="Core Identity & Branding" icon={Codesandbox}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography sx={labelStyle}>Branch Name *</Typography>
                <TextField fullWidth size="small" name="branchName" value={formData.branchName} onChange={handleChange} sx={inputSx} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography sx={labelStyle}>Branch Code</Typography>
                <TextField fullWidth size="small" name="branchCode" value={formData.branchCode} onChange={handleChange} sx={inputSx} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography sx={labelStyle}>Contact Number *</Typography>
                <TextField fullWidth size="small" name="contactNumber" value={formData.contactNumber} onChange={handleChange} sx={inputSx} />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography sx={labelStyle}>Email Address *</Typography>
                <TextField fullWidth size="small" name="email" value={formData.email} onChange={handleChange} sx={inputSx} />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  p: 2, bgcolor: "#F9FAFB", border: "1px solid #F3F4F6", borderRadius: "12px", 
                  height: "100%", display: "flex", alignItems: "center" 
                }}>
                  <FormControlLabel
                    control={<Switch checked={formData.isHeadOffice} onChange={(e) => setFormData(prev => ({ ...prev, isHeadOffice: e.target.checked }))} color="primary" />}
                    label={
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>Primary Head Office</Typography>
                        <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>Master location for billing & reports</Typography>
                      </Box>
                    }
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  border: "1px solid #F3F4F6", borderRadius: "12px", p: 2, 
                  display: "flex", alignItems: "center", gap: 3, backgroundColor: "#fff"
                }}>
                  <Box sx={{ position: "relative" }}>
                    {formData.imagePreview ? (
                      <Avatar src={formData.imagePreview} sx={{ width: 64, height: 64, borderRadius: "10px" }} />
                    ) : (
                      <Box sx={{ width: 64, height: 64, borderRadius: "10px", bgcolor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                        <ImageIcon size={24} />
                      </Box>
                    )}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1E293B", mb: 0.5 }}>Branch Profile Image</Typography>
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      sx={{ textTransform: "none", borderRadius: "6px", color: "#8B5CF6", borderColor: "#8B5CF6", fontSize: 12 }}
                    >
                      Change Photo
                      <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>

        <Grid item xs={12}>
          <SectionCard title="Location & Access" icon={MapPin}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography sx={labelStyle}>Street Address *</Typography>
                <TextField fullWidth multiline rows={3} name="address" value={formData.address} onChange={handleChange} placeholder="Full street address..." sx={inputSx} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography sx={labelStyle}>City</Typography>
                    <TextField fullWidth size="small" name="city" value={formData.city} onChange={handleChange} sx={inputSx} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography sx={labelStyle}>State</Typography>
                    <TextField fullWidth size="small" name="state" value={formData.state} onChange={handleChange} sx={inputSx} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography sx={labelStyle}>Country</Typography>
                    <TextField fullWidth size="small" name="country" value={formData.country} onChange={handleChange} sx={inputSx} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>

      {!loading && (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            disabled={working}
            onClick={handleSubmit}
            sx={{ 
              borderRadius: "12px", textTransform: "none", fontWeight: 700, px: 6, py: 1.5,
              bgcolor: "rgba(139, 92, 246, 0.9)", boxShadow: "0 4px 6px -1px rgba(139, 92, 246, 0.2)",
              "&:hover": { bgcolor: "rgba(139, 92, 246, 1)" }
            }}
          >
            {working ? "Saving..." : editId ? "Update Branch" : "Save Branch"}
          </Button>
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: "12px" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BranchForm;