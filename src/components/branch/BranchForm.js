// src/components/BranchForm.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Avatar,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import apiEndpoints from "../../apiconfig";
import DynamicHeader from "../common/Dynamicheader";
import { Snackbar, Alert } from "@mui/material";

const BranchForm = () => {
  const navigate = useNavigate();

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

  const [errors, setErrors] = useState({});   // ✅ ADDED

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // ✅ FIELD VALIDATION FUNCTION
  const validateField = (name, value) => {
    let error = "";
    if (name === "branchName" && !value.trim()) error = "Branch name is required.";
    if (name === "contactNumber") {
      if (!value.trim()) error = "Contact number is required.";
      else if (!/^[0-9]{10}$/.test(value)) error = "Contact must be 10 digits.";
    }
    if (name === "email") {
      if (!value.trim()) error = "Email is required.";
      else if (!/^\S+@\S+\.\S+$/.test(value)) error = "Invalid email format.";
    }
    if (name === "address" && !value.trim()) error = "Address is required.";
    return error;
  };

  // ✅ UPDATED HANDLE CHANGE WITH LIVE VALIDATION
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, fieldValue),
    }));

    setFormData((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get("id");

  const validators = {
    required: (val) => val != null && String(val).trim().length > 0,
    email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || "").trim()),
    phone: (val) => /^[\d +\-\(\)]{6,20}$/.test(String(val || "").trim()),
  };

  // ❗ NOT USED anymore but kept to avoid breaking logic
  const validateAll = () => null;

  useEffect(() => {
    if (!editId) return;

    const fetchBranchDetails = async () => {
      try {
        const resp = await fetch(`${apiEndpoints.branches}?id=${editId}`,{
          headers:{
            Authorization: `Bearer ${sessionStorage.getItem("token")}`
          }
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
            imagePreview: b.image_path
              ? apiEndpoints.branches.replace("branches.php", "") + b.image_path
              : "",
          });
        }
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Failed to load branch details",
          severity: "error",
        });
      }
    };

    fetchBranchDetails();
  }, [editId]);

  // ✅ UPDATED SUBMIT WITH FIELD VALIDATION
  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSnackbar({
        open: true,
        message: "Please Fill the details before submitting",
        severity: "error",
      });
      return;
    }

    const body = new FormData();
    if (editId) body.append("branch_id", editId);
    body.append("branch_name", (formData.branchName || "").trim());
    body.append("branch_code", (formData.branchCode || "").trim());
    body.append("contact_number", (formData.contactNumber || "").trim());
    body.append("email", (formData.email || "").trim());
    body.append("address", (formData.address || "").trim());
    body.append("city", (formData.city || "").trim());
    body.append("state", (formData.state || "").trim());
    body.append("country", (formData.country || "").trim());
    body.append("is_head_office", formData.isHeadOffice ? 1 : 0);
    if (formData.image) body.append("image", formData.image);

    try {
      const resp = await fetch(apiEndpoints.branches, { method: "POST", headers:{
        Authorization: `Bearer ${sessionStorage.getItem("token")}`
      } ,body });
      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`HTTP ${resp.status} — ${text}`);
      }

      const result = await resp.json();
      if (result.success) {
        setSnackbar({
          open: true,
          message: editId ? "Branch updated successfully" : "Branch added successfully",
          severity: "success",
        });
        setTimeout(() => navigate("/branches"), 1000);
      } else {
        setSnackbar({
          open: true,
          message: "Faild to submit branch",
          severity: "error",
        });
      }
    } catch (err) {
      console.error("Network/backend error:", err);
      setSnackbar({
        open: true,
        message: "Error connecting to server",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 3, md: 6 }, py: { xs: 2, sm: 3 }, maxWidth: "100%" }}>
      <DynamicHeader />

      <style>{`
        .bf-row {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        @media (max-width: 600px) {
          .bf-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }
      `}</style>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          background: "#fff",
          borderRadius: 2,
          p: { xs: 2, sm: 3 },
          boxShadow: { xs: "none", sm: "0 6px 18px rgba(2,6,23,0.04)" },
        }}
      >
        <Grid container spacing={2} width={"100%"}>
          
          {/* LEFT COLUMN */}
          <Grid item xs={12} md={6} width={{ xs: "100%", sm: "47%" }}>

            <Box className="bf-row">
              <Typography sx={{ minWidth: 120, fontWeight: 500 }}>
                Branch Name<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
                error={Boolean(errors.branchName)}
                helperText={errors.branchName}
                placeholder="Enter branch name"
              />
            </Box>

            <Box className="bf-row">
              <Typography sx={{ minWidth: 120, fontWeight: 500 }}>
                Email<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={Boolean(errors.email)}
                helperText={errors.email}
                placeholder="Enter email"
              />
            </Box>

            <Box className="bf-row">
              <Typography sx={{ minWidth: 120, fontWeight: 500 }}>
                Country<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Enter country"
              />
            </Box>

            <Box className="bf-row">
              <Typography sx={{ minWidth: 120, fontWeight: 500 }}>
                Town/City
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter city"
              />
            </Box>

          </Grid>

          {/* RIGHT COLUMN */}
          <Grid item xs={12} md={6} width={{ xs: "100%", sm: "47%" }}>

            <Box className="bf-row">
              <Typography sx={{ minWidth: 120, fontWeight: 500 }}>
                Contact Number<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                error={Boolean(errors.contactNumber)}
                helperText={errors.contactNumber}
                placeholder="Enter 10-digit contact number"
                inputProps={{ maxLength: 10, pattern: "[0-9]*" }}
              />
            </Box>

            <Box className="bf-row" sx={{ alignItems: "flex-start" }}>
              <Typography sx={{ minWidth: 120, fontWeight: 500 }}>
                Image
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
  <Button
    variant="outlined"
    component="label"
    size="small"
    sx={{
      color: "rgba(249, 115, 22, 0.9)",
      borderColor: "rgba(249, 115, 22, 0.9)",
      textTransform: "none",

      "&:hover": {
        borderColor: "rgba(249, 115, 22, 1)",
        backgroundColor: "rgba(249, 115, 22, 0.08)",
        color: "rgba(249, 115, 22, 1)",
      },
    }}
  >
    Choose File
    <input
      type="file"
      hidden
      accept="image/*"
      onChange={handleImageChange}
    />
  </Button>
</Box>


                {formData.imagePreview && (
                  <Avatar
                    src={formData.imagePreview}
                    alt="Preview"
                    sx={{ width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}
                  />
                )}
              </Box>
            </Box>

            <Box className="bf-row">
              <Typography sx={{ minWidth: 120, fontWeight: 500 }}>
                State
              </Typography>
              <TextField
                fullWidth
                size="small"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
              />
            </Box>

            <Box className="bf-row" sx={{ alignItems: "flex-start" }}>
              <Typography sx={{ minWidth: 120, fontWeight: 500, mt: 1 }}>
                Address<span style={{ color: "red" }}>*</span>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                size="small"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={Boolean(errors.address)}
                helperText={errors.address}
                placeholder="Enter address"
              />
            </Box>

          </Grid>

        </Grid>

        <Box mt={4}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "rgba(249, 115, 22, 0.9)",
              "&:hover": { backgroundColor: "rgba(249, 115, 22, 0.9)" },
              color: "white",
              height: "45px",
              fontWeight: "bold",
            }}
          >
            SUBMIT
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default BranchForm;