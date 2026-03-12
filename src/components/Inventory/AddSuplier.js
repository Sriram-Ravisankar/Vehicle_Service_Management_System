import React, { useState, useEffect } from "react";
import { CgArrowLeft } from "react-icons/cg";
import NotesSection from "../DynamicComponents/NotesSection";
import {
  Box,
  Grid,
  Stack,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  IconButton,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import AddIcon from "@mui/icons-material/Add";
import { SettingsIcon } from "lucide-react";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ClearIcon from '@mui/icons-material/Clear';
import apiEndpoints from "../../apiconfig";
import DynamicHeader from "../common/Dynamicheader";

const API_URL = apiEndpoints.supplier;

// Responsive label and input styles
const getLabelStyle = (isMobile) => ({
  minWidth: isMobile ? "120px" : "150px",
  textAlign: "left",
  paddingRight: "16px",
  fontWeight: 500,
  fontSize: "0.95rem",
  flexShrink: 0,
});

const getInputStyle = (isMobile) => ({
  flex: 1,
  width: isMobile ? "100%" : "400px",
  minWidth: isMobile ? "100%" : "300px",
  "& .MuiInputBase-root": {
    height: "40px",
    fontSize: "0.9rem",
  },
});

const getFormContainerStyle = (isMobile) => ({
  display: "flex",
  flexDirection: isMobile ? "column" : "row",
  alignItems: isMobile ? "flex-start" : "center",
  width: "100%",
  gap: isMobile ? 1 : 0,
});

const AddSupplier = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    supplier_name: "",
    email: "",
    mobile_no: "",
    company_name: "",
    landline_no: "",
    gender: "Male",
    image: null,
    imagePreview: "",
    country: "",
    state: "",
    city: "",
    address: "",
    note_text: "",
    note_file: null,
    noteFilePreview: "",
    internal_note: false,
    shared_with_customer: false,
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    gstin: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [errors, setErrors] = useState({});

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        setLoadingStates(true);
        const response = await fetch(`${apiEndpoints.locations}?type=states`);
        if (!response.ok) throw new Error('Failed to fetch states');
        const data = await response.json();
        if (data.status === 'success') {
          setStates(data.data);
        }
      } catch (error) {
        console.error("Error fetching states:", error);
        setSnackbar({
          open: true,
          message: "Failed to load states",
          severity: "error",
        });
      } finally {
        setLoadingStates(false);
      }
    };

    fetchStates();

    if (isEditMode && formData.state) {
      fetchCities(formData.state);
    }
  }, [isEditMode]);

  const fetchCities = async (stateId) => {
    try {
      setLoadingCities(true);
      const response = await fetch(`${apiEndpoints.locations}?type=cities&state_id=${stateId}`);
      if (!response.ok) throw new Error('Failed to fetch cities');
      const data = await response.json();
      if (data.status === 'success') {
        setCities(data.data);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      setSnackbar({
        open: true,
        message: "Failed to load cities for selected state",
        severity: "error",
      });
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    if (location.state?.editData) {
      const data = location.state.editData;
      setIsEditMode(true);
      setEditId(data.supplier_id);

      setFormData({
        supplier_name: data.supplier_name || "",
        email: data.email || "",
        mobile_no: data.mobile_no || "",
        company_name: data.company_name || "",
        landline_no: data.landline_no || "",
        gender: data.gender || "Male",
        imagePreview: data.image_path || "",
        country: data.country || "",
        state: data.state || "",
        city: data.city || "",
        address: data.address || "",
        note_text: data.note_text || "",
        note_file: null,
        noteFilePreview: data.note_file_path || "",
        internal_note: data.internal_note === 1 || data.internal_note === true,
        shared_with_customer: data.shared_with_customer === 1 || data.shared_with_customer === true,
        bank_name: data.bank_name || "",
        account_number: data.account_number || "",
        ifsc_code: data.ifsc_code || "",
        gstin: data.gstin || "",
      });
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    let fieldValue = type === "checkbox" ? checked : value;

    // Handle state -> fetch cities
    if (name === "state") {
      fetchCities(fieldValue);
      setFormData((prev) => ({ ...prev, [name]: fieldValue, city: "" }));
      return;
    }

    // File handling stays same
    if (type === "file") {
      const file = files[0];
      if (name === "image" && file) {
        const imageUrl = URL.createObjectURL(file);
        setFormData({
          ...formData,
          image: file,
          imagePreview: imageUrl,
        });
      } else if (name === "note_file" && file) {
        const fileUrl = URL.createObjectURL(file);
        setFormData({
          ...formData,
          note_file: file,
          noteFilePreview: fileUrl,
        });
      }
      return;
    }

    // Normal input validation
    const error = validateField(name, fieldValue);
    setErrors((prev) => ({ ...prev, [name]: error }));

    setFormData((prev) => ({ ...prev, [name]: fieldValue }));
  };


  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "supplier_name":
        if (!value.trim()) error = "Supplier name is required";
        break;

      case "email":
        if (!value.trim()) error = "Email is required";
        else if (!/^\S+@\S+\.\S+$/.test(value)) error = "Invalid email format";
        break;

      case "mobile_no":
        if (!value.trim()) error = "Mobile number is required";
        else if (!/^[0-9]{10}$/.test(value))
          error = "Mobile number must be 10 digits only";
        break;

      case "account_number":
        if (value && !/^[0-9]{9,18}$/.test(value))
          error = "Account number must be 9–18 digits";
        break;

      case "ifsc_code":
        if (value && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase()))
          error = "Invalid IFSC format eg: ABCD0123456";
        break;

      case "gstin":
        if (value && !/^[0-9A-Z]{15}$/.test(value))
          error = "GSTIN must be 15 characters";
        break;

      default:
        break;
    }

    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSnackbar({
        open: true,
        message: "Please Fill all required fields correctly",
        severity: "error",
      });
      return;
    }
    setIsLoading(true);
    setSnackbar({ open: false, message: '', severity: 'success' });

    if (!formData.supplier_name || !formData.email || !formData.mobile_no) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields",
        severity: "error",
      });
      setIsLoading(false);
      return;
    }

    try {
      const supplierFormData = new FormData();
      const supplierFields = [
        'supplier_name', 'company_name', 'email', 'mobile_no', 'landline_no',
        'gender', 'country', 'state', 'city', 'address', 'bank_name',
        'account_number', 'ifsc_code', 'gstin', 'image'
      ];

      supplierFields.forEach(field => {
        if (formData[field] !== null && formData[field] !== undefined) {
          supplierFormData.append(field, formData[field]);
        }
      });

      if (isEditMode) {
        supplierFormData.append('supplier_id', editId);
        if (!(formData.image instanceof File) && formData.imagePreview) {
          supplierFormData.append('existing_image', formData.imagePreview);
        }
      }

      const supplierResponse = await Promise.race([
        fetch(API_URL, {
          method: "POST",
          body: supplierFormData,
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          }
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]);

      if (!supplierResponse.ok) {
        const errorResult = await supplierResponse.json();
        throw new Error(errorResult.error || "Failed to save supplier data");
      }

      const supplierResult = await supplierResponse.json();
      if (!supplierResult.success) {
        throw new Error(supplierResult.message || "Supplier operation failed");
      }

      const supplierId = isEditMode ? editId : (supplierResult.id || supplierResult.supplier_id);

      if (formData.note_text || formData.note_file || formData.internal_note || formData.shared_with_customer) {
        try {
          const notesFormData = new FormData();
          notesFormData.append('action', 'update');
          notesFormData.append('table', 'suppliers');
          notesFormData.append('id', supplierId);

          if (formData.note_text) notesFormData.append('note_text', formData.note_text);
          if (formData.note_file) notesFormData.append('note_file', formData.note_file);
          notesFormData.append('internal_note', formData.internal_note ? '1' : '0');
          notesFormData.append('shared_with_customer', formData.shared_with_customer ? '1' : '0');

          const notesResponse = await fetch(apiEndpoints.notes, {
            method: "POST",
            body: notesFormData,
          });

          if (!notesResponse.ok) {
            const notesError = await notesResponse.json();
            throw new Error(notesError.error || "Failed to save notes");
          }

          const notesResult = await notesResponse.json();
          if (!notesResult.success) {
            throw new Error(notesResult.message || "Notes operation failed");
          }
        } catch (notesError) {
          setSnackbar({
            open: true,
            message: `Supplier saved but notes failed: ${notesError.message}`,
            severity: "warning",
          });
          setTimeout(() => navigate("/supplier"), 1500);
          return;
        }
      }

      setSnackbar({
        open: true,
        message: isEditMode ? "Supplier updated successfully!" : "Supplier added successfully!",
        severity: "success",
      });
      setTimeout(() => navigate("/supplier"), 1500);

    } catch (error) {
      console.error("Operation failed:", error);
      setSnackbar({
        open: true,
        message: error.message || "An error occurred while saving",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Helper function to render form fields consistently
  const renderFormField = (
    label,
    name,
    type = "text",
    options = [],
    required = false,
    multiline = false
  ) => (
    <Box sx={getFormContainerStyle(isMobile)}>
      <Typography sx={getLabelStyle(isMobile)}>{label}</Typography>
      {options.length > 0 ? (
        <FormControl sx={getInputStyle(isMobile)}>
          <InputLabel>{label.replace("*", "")}</InputLabel>
          <Select
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            label={label.replace("*", "")}
            required={required}
            disabled={
              (loadingStates && name === "state") ||
              (loadingCities && name === "city")
            }
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                  overflowY: "auto",
                },
              },
            }}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <TextField
          fullWidth
          name={name}
          type={type}
          value={formData[name] || ""}
          onChange={handleChange}
          placeholder={`Enter ${label.replace("*", "")}`}
          multiline={multiline}
          minRows={multiline ? 3 : 1}
          error={Boolean(errors[name])}
          helperText={errors[name] || ""}
          sx={{
            ...getInputStyle(isMobile),
            ...(multiline && {
              "& .MuiInputBase-root": {
                height: "auto",
                minHeight: "80px",
              },
            }),
          }}
        />
      )}
    </Box>
  );

  const stateOptions = states.map(state => ({
    value: state.state_id,
    label: state.state_name
  }));

  const cityOptions = cities.map(city => ({
    value: city.city_id,
    label: city.city_name
  }));

  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      {/* Header */}
      <DynamicHeader />

      <form onSubmit={handleSubmit}>
        {/* Personal Information Title */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              textTransform: "uppercase",
              mb: 1,
              fontSize: isMobile ? "1.1rem" : "1.25rem",
            }}
          >
            Personal Information
          </Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
        </Box>

        {/* Personal Info Fields */}
        <Grid container spacing={isMobile ? 2 : 6} sx={{ width: "100%" }}>
          {/* LEFT COLUMN */}
          <Grid
            item
            sx={{
              width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "47%" },
            }}
          >
            <Stack spacing={2}>
              {renderFormField(
                "Supplier Name*",
                "supplier_name",
                "text",
                [],
                true
              )}
              {renderFormField("Company Name", "company_name", "text")}
              {renderFormField("Mobile No*", "mobile_no", "tel", [], true)}

              {/* Gender Field */}
              <Box sx={getFormContainerStyle(isMobile)}>
                <Typography sx={getLabelStyle(isMobile)}>Gender</Typography>
                <RadioGroup
                  row
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  sx={{ flex: 1 }}
                >
                  <FormControlLabel
                    value="Male"
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: "rgba(249, 115, 22, 0.9)",
                          "&.Mui-checked": {
                            color: "rgba(249, 115, 22, 0.9)",
                          },
                        }}
                      />
                    }
                    label="Male"
                  />

                  <FormControlLabel
                    value="Female"
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: "rgba(249, 115, 22, 0.9)",
                          "&.Mui-checked": {
                            color: "rgba(249, 115, 22, 0.9)",
                          },
                        }}
                      />
                    }
                    label="Female"
                  />
                </RadioGroup>

              </Box>

              {/* Image Upload */}
              <Box sx={getFormContainerStyle(isMobile)}>
                <Typography sx={getLabelStyle(isMobile)}>Image</Typography>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    gap: 2,
                    alignItems: isMobile ? "flex-start" : "center",
                  }}
                >
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadFileIcon />}
                    sx={{
                      height: "40px",
                      textTransform: "none",
                      minWidth: isMobile ? "100%" : "auto",

                      color: "rgba(249, 115, 22, 0.9)",           // text & icon color
                      borderColor: "rgba(249, 115, 22, 0.9)",    // outline color

                      "&:hover": {
                        borderColor: "rgba(249, 115, 22, 1)",
                        backgroundColor: "rgba(249, 115, 22, 0.08)", // light hover fill
                        color: "rgba(249, 115, 22, 1)",
                      },
                    }}
                  >
                    Choose Image
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      hidden
                      onChange={handleChange}
                    />
                  </Button>

                  {formData.imagePreview && (
                    <Box
                      display="flex"
                      alignItems="center"
                      mt={isMobile ? 1 : 0}
                      gap={2}
                      sx={{ flexWrap: "wrap" }}
                    >
                      <img
                        src={
                          formData.imagePreview.startsWith("blob:")
                            ? formData.imagePreview
                            : `${apiEndpoints.blob}${formData.imagePreview}`
                        }
                        alt="Supplier Preview"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          cursor: "pointer",
                          border: "1px solid #eee",
                          borderRadius: "4px",
                        }}
                      />
                      <Box display="flex" flexDirection="column">
                        <Typography variant="body2">
                          {formData.image instanceof File
                            ? formData.image.name
                            : formData.imagePreview.split("/").pop()}
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<ClearIcon />}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              image: null,
                              imagePreview: "",
                            }))
                          }
                          sx={{ mt: 1, alignSelf: "flex-start" }}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Stack>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
            }}
          >
            <Stack spacing={2}>
              {renderFormField("Email*", "email", "email", [], true)}
              {renderFormField("Landline No", "landline_no", "tel")}
              {renderFormField("GSTIN", "gstin", "text")}
            </Stack>
          </Grid>
        </Grid>

        {/* Address Information Section */}
        <Box sx={{ mt: 6, mb: 2 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              textTransform: "uppercase",
              mb: 1,
              fontSize: isMobile ? "1.1rem" : "1.25rem",
            }}
          >
            Address Information
          </Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
        </Box>

        <Grid container spacing={isMobile ? 2 : 6} width={"100%"}>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
            }}
          >
            <Stack spacing={2}>
              {renderFormField("Country", "country", "text")}
              {renderFormField("State", "state", "text", stateOptions)}
            </Stack>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
            }}
          >
            <Stack spacing={2}>
              {renderFormField("Town/City", "city", "text", cityOptions)}
              {renderFormField("Address", "address", "text", [], false, true)}
            </Stack>
          </Grid>
        </Grid>

        {/* Payment Details Section */}
        <Box sx={{ mt: 6, mb: 2 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              textTransform: "uppercase",
              mb: 1,
              fontSize: isMobile ? "1.1rem" : "1.25rem",
            }}
          >
            Payment Details
          </Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
        </Box>

        <Grid container spacing={isMobile ? 2 : 6} width={"100%"}>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
            }}
          >
            <Stack spacing={2}>
              {renderFormField("Bank Name", "bank_name", "text")}
              {renderFormField("Account Number", "account_number", "text")}
              {renderFormField("IFSC Code", "ifsc_code", "text")}
            </Stack>
          </Grid>
        </Grid>

        <Box sx={{ mt: 6, mb: 2 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              textTransform: "uppercase",
              mb: 1,
              fontSize: isMobile ? "1.1rem" : "1.25rem",
            }}
          >
            Notes
          </Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
        </Box>

        <Box sx={{ mb: 4, width: "100%" }}>
          <NotesSection
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
            noteTextName="note_text"
            noteFileName="note_file"
            noteFilePreview={formData.noteFilePreview}
            internalNoteName="internal_note"
            sharedWithCustomerName="shared_with_customer"
            isMobile={isMobile}
          />
        </Box>

        {/* Submit Button */}
        <Box mt={4}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              backgroundColor: "rgba(249, 115, 22, 0.9)",
              "&:hover": { backgroundColor: "rgba(249, 115, 22, 0.9)" },
              color: "white",
              height: "45px",
              fontWeight: "bold",
            }}
          >
            {isLoading ? "SUBMITTING..." : "SUBMIT"}
          </Button>
        </Box>
      </form>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddSupplier;