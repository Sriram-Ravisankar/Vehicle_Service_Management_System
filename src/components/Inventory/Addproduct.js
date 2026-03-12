import React, { useState, useEffect, useCallback } from "react";
import { CgArrowLeft } from "react-icons/cg";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ClearIcon from '@mui/icons-material/Clear';
import { SettingsIcon } from "lucide-react";
import AddIcon from "@mui/icons-material/Add";
import { Add, Settings } from "@mui/icons-material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import NotesSection from "../DynamicComponents/NotesSection";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import apiEndpoints from "../../apiconfig";
import DynamicHeader from "../common/Dynamicheader";

// Helper: Convert image to base64
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const AddProduct = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = useNavigate();
  const location = useLocation();
  const [units, setUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [formData, setFormData] = useState({
    product_number: "",
    product_name: "",
    manufacturer: "",
    unit: null,
    color: "",
    image: null,
    imagePreview: "",
    purchase_date: new Date().toISOString().split("T")[0],
    branch: "",
    price: "",
    warranty: "",
    note_text: "",
    note_file: null,
    noteFilePreview: "",
    internal_note: false,
    shared_with_customer: false,
  });

  const [openUnitDialog, setOpenUnitDialog] = useState(false);
  const [newUnit, setNewUnit] = useState({
    unit_name: "",
    unit_symbol: "",
    unit_type: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);


  // Responsive styles
  const labelStyle = {
    minWidth: isSmallMobile ? "100%" : "140px",
    textAlign: "left",
    paddingRight: isSmallMobile ? "0px" : "16px",
    fontWeight: 500,
    fontSize: isSmallMobile ? "0.85rem" : "0.95rem",
    marginBottom: isSmallMobile ? "8px" : "0",
  };

  const inputStyle = {
    width: "100%",
    "& .MuiInputBase-root": {
      height: isSmallMobile ? "40px" : "44px",
      fontSize: isSmallMobile ? "0.85rem" : "0.9rem",
    },
    "& .MuiInputLabel-root": {
      fontSize: isSmallMobile ? "0.85rem" : "0.9rem",
    },
  };

  const sectionTitleStyle = {
    variant: isSmallMobile ? "subtitle1" : "h6",
    fontWeight: "bold",
    sx: {
      textTransform: "uppercase",
      mb: 1,
      fontSize: isSmallMobile ? "1rem" : "1.25rem"
    }
  };

  const branchOptions = branches.map(branch => ({
    value: branch.branch_id,
    label: branch.branch_name,
  }));


  const fetchUnits = useCallback(async () => {
    setLoadingUnits(true);
    try {
      const response = await fetch(apiEndpoints.units);
      const data = await response.json();
      if (data.success) {
        setUnits(data.data);
      } else {
        console.error("Failed to fetch units:", data.message);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setLoadingUnits(false);
    }
  }, []);



  const fetchBranches = useCallback(async () => {
    setLoadingBranches(true);
    try {
      const url =
        `${apiEndpoints.dropDown}?table=branches&todo=dropdown`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      console.log("BRANCH RESPONSE:", data);

      // PHP returns ARRAY directly
      if (Array.isArray(data)) {
        setBranches(data);
      } else {
        console.error("Unexpected branch response:", data);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoadingBranches(false);
    }
  }, []);



  useEffect(() => {
    fetchUnits();
    fetchBranches();

    if (location.state?.editData) {
      setIsEditMode(true);
      const product = location.state.editData;

      setFormData({
        product_number: product.product_number || "",
        product_name: product.product_name || "",
        unit: product.unit || "",
        image: null,
        imagePreview: product.image || "",
        purchase_date:
          product.purchase_date || new Date().toISOString().split("T")[0],
        branch: product.branch || "",

        price: product.price || "",
        warranty: product.warranty || "",
        note_text: product.note_text || "",
        note_file: null,
        noteFilePreview: product.note_file_path || "",
        internal_note: Boolean(Number(product.internal_note)),
        shared_with_customer: Boolean(Number(product.shared_with_customer)),
      });
    }
  }, [fetchUnits, fetchBranches, location.state]);



  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === "file") {
      const file = files[0];
      if (!file) return;
      if (name === "note_file") {
        setFormData((prev) => ({
          ...prev,
          note_file: file,
          noteFilePreview: URL.createObjectURL(file),
        }));
      } else if (name === "image") {
        setFormData((prev) => ({
          ...prev,
          image: file,
          imagePreview: URL.createObjectURL(file),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: file,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  const handleUnitChange = (e) => {
    const { name, value } = e.target;
    setNewUnit({ ...newUnit, [name]: value });
  };

  const handleAddUnit = async () => {
    try {
      const response = await fetch(apiEndpoints.units, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUnit),
      });

      const data = await response.json();
      if (data.success) {
        await fetchUnits();
        setOpenUnitDialog(false);
        setNewUnit({
          unit_name: "",
          unit_symbol: "",
          unit_type: "",
        });
        setSnackbar({
          open: true,
          message: "Unit added successfully!",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Failed to add unit: " + data.message,
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Error adding unit: " + error.message,
        severity: "error",
      });
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.product_number)
      newErrors.product_number = "Product Number is required";
    if (!formData.product_name)
      newErrors.product_name = "Product Name is required";
    if (!formData.unit) newErrors.unit = "Unit is required";
    if (!formData.purchase_date)
      newErrors.purchase_date = "Purchase Date is required";
    if (!formData.branch) newErrors.branch = "Branch is required";
    if (!formData.price) newErrors.price = "Price is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please fill in all required fields",
        severity: "error",
      });
      return;
    }
    setIsLoading(true);
    setSnackbar({ open: false, message: '', severity: 'success' });

    try {
      const unitValue = Number(formData.unit);

      const productFormData = new FormData();
      const productFields = [
        "product_number", "product_name", "unit", "purchase_date",
        "branch", "price", "warranty"
      ];

      productFields.forEach(field => {
        if (formData[field] !== null && formData[field] !== undefined) {
          productFormData.append(
            field,
            field === 'unit' ? unitValue : formData[field]
          );
        }
      });

      if (formData.image) {
        productFormData.append("image", formData.image);
      }

      if (isEditMode) {
        productFormData.append("id", location.state.editData.id);
      }

      const productResponse = await Promise.race([
        fetch(apiEndpoints.product, {
          method: "POST",
          body: productFormData,
          headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
          }
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Product request timeout')), 10000))
      ]);

      if (!productResponse.ok) {
        const errorResult = await productResponse.json();
        throw new Error(errorResult.error || "Failed to save product data");
      }

      const productData = await productResponse.json();

      if (!productData.success) {
        throw new Error(productData.error || "Product operation failed");
      }

      const productId = isEditMode ? location.state.editData.id : productData.id;

      if (formData.note_text || formData.note_file || formData.internal_note || formData.shared_with_customer) {
        try {
          const notesFormData = new FormData();
          notesFormData.append('action', isEditMode ? 'update' : 'update');
          notesFormData.append("table", "products");
          notesFormData.append("id", productId);

          if (formData.note_text) notesFormData.append("note_text", formData.note_text);
          if (formData.note_file) notesFormData.append("note_file", formData.note_file);
          notesFormData.append("internal_note", formData.internal_note ? '1' : '0');
          notesFormData.append("shared_with_customer", formData.shared_with_customer ? '1' : '0');

          const notesResponse = await fetch(apiEndpoints.notes, {
            method: "POST",
            body: notesFormData,
          });

          if (!notesResponse.ok) {
            const notesError = await notesResponse.json();
            throw new Error(notesError.error || "Failed to save notes");
          }

          const notesData = await notesResponse.json();

          if (!notesData.success) {
            throw new Error(notesData.error || "Notes operation failed");
          }
        } catch (notesError) {
          setSnackbar({
            open: true,
            message: `Product saved but notes failed: ${notesError.message}`,
            severity: "warning",
          });
          setTimeout(() => navigate("/product"), 1500);
          return;
        }
      }

      setSnackbar({
        open: true,
        message: isEditMode ? "Product updated successfully!" : "Product added successfully!",
        severity: "success",
      });
      setTimeout(() => navigate("/product"), 1500);

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

  const handleSoftDeleteUnit = async (unitId) => {
    try {
      const response = await fetch(
        `${apiEndpoints.units}?id=${unitId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to remove unit");
      }

      // Refresh units list
      await fetchUnits();

      // Clear selected unit
      setFormData((prev) => ({
        ...prev,
        unit: "",
      }));

      setSnackbar({
        open: true,
        message: "Unit removed successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Unit delete error:", error);
      setSnackbar({
        open: true,
        message: error.message || "Unable to remove unit",
        severity: "error",
      });
    }
  };


  const handleUnitButtonClick = () => {
    // No unit selected → open add popup
    if (!formData.unit) {
      setOpenUnitDialog(true);
      return;
    }

    handleSoftDeleteUnit(formData.unit);
  };


  // Format units for the dropdown
  const unitOptions = units
    .filter(
      (unit) =>
        Number(unit.isActive) === 1 &&
        Number(unit.isDeleted) === 0
    )
    .map((unit) => ({
      value: Number(unit.id),
      label: `${unit.unit_name} (${unit.unit_symbol})`,
    }));


  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Responsive field renderer - UPDATED
  const renderField = (
    label,
    name,
    type = "text",
    options = [],
    required = false
  ) => (
    <Box
      display="flex"
      flexDirection={isSmallMobile ? "column" : "row"}
      alignItems={isSmallMobile ? "flex-start" : "center"}
      sx={{ width: "100%" }}
    >
      <Typography sx={labelStyle}>{label}</Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: name === "unit" ? 2 : 0,
          flexDirection: isSmallMobile && name === "unit" ? "column" : "row",
        }}
      >
        {options.length > 0 ? (
          <FormControl
            sx={{ ...inputStyle, minWidth: isSmallMobile ? "100%" : "200px" }}
            error={Boolean(errors[name])}
          >
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            <Select
              labelId={`${name}-label`}
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
              label={label}
            >

              {options.map((option) => (
                <MenuItem
                  key={option.value || option}
                  value={option.value || option}
                >
                  {option.label || option}
                </MenuItem>
              ))}
            </Select>

            {errors[name] && (
              <Typography color="error" variant="caption">
                {errors[name]}
              </Typography>
            )}
          </FormControl>
        ) : (
          <TextField
            name={name}
            type={type}
            value={formData[name]}
            onChange={handleChange}
            placeholder={`Enter ${label}`}
            error={Boolean(errors[name])}
            helperText={errors[name] || ""}
            sx={{ ...inputStyle }}
          />
        )}

        {name === "unit" && (
          <Button
            variant="contained"
            sx={{
              ml: isSmallMobile ? 0 : 2,
              mt: isSmallMobile ? 2 : 0,
              bgcolor: "rgba(249, 115, 22, 0.9)",
              minWidth: "auto",
              whiteSpace: "nowrap",
              width: isSmallMobile ? "100%" : "auto",
            }}
            onClick={handleUnitButtonClick}
          >
            Add/Remove
          </Button>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        p: isMobile ? 2 : 4,
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <DynamicHeader />

      <form onSubmit={handleSubmit}>
        {/* Product Information Title */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography {...sectionTitleStyle}>Product Information</Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
        </Box>

        {/* Product Info Fields - UPDATED GRID */}
        <Grid
          container
          spacing={isMobile ? 2 : 4}
          sx={{ width: "100%", margin: 0 }}
        >
          {/* Left Column */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
            }}
          >
            <Stack spacing={2}>
              {renderField(
                "Product Number*",
                "product_number",
                "text",
                [],
                true
              )}
              {renderField("Product Name*", "product_name", "text", [], true)}
              {renderField(
                "Unit Of Measurement*",
                "unit",
                "text",
                unitOptions,
                true
              )}

              {/* Image Upload - UPDATED */}
              <Box
                display="flex"
                flexDirection={isSmallMobile ? "column" : "row"}
                alignItems={isSmallMobile ? "flex-start" : "center"}
                sx={{ width: "100%" }}
              >
                <Typography sx={labelStyle}>Image</Typography>
                <Box sx={{ width: "100%" }}>
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
                      mt={2}
                      gap={2}
                      sx={{
                        flexWrap: "wrap",
                        flexDirection: isSmallMobile ? "column" : "row",
                        alignItems: isSmallMobile ? "flex-start" : "center",
                      }}
                    >
                      <img
                        src={
                          formData.imagePreview.startsWith("blob:")
                            ? formData.imagePreview
                            : `${apiEndpoints.blob}${formData.imagePreview}`
                        }
                        alt="Product Preview"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          cursor: "pointer",
                          border: "1px solid #eee",
                          borderRadius: "4px",
                        }}
                      />
                      <Box
                        display="flex"
                        flexDirection="column"
                        sx={{ width: isSmallMobile ? "100%" : "auto" }}
                      >
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
                          sx={{
                            mt: 1,
                            alignSelf: isSmallMobile ? "stretch" : "flex-start",
                            width: isSmallMobile ? "100%" : "auto",
                          }}
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

          {/* Right Column */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
            }}
          >
            <Stack spacing={2}>
              {renderField("Purchase Date*", "purchase_date", "date", [], true)}
              {renderField("Branch*", "branch", "text", branchOptions, true)}
              {renderField("Price ($)*", "price", "number", [], true)}
              {renderField("Warranty", "warranty", "text")}
            </Stack>
          </Grid>
        </Grid>

        {/* Notes Section */}
        <Box sx={{ mt: 6, mb: 2 }}>
          <Typography {...sectionTitleStyle}>Notes</Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
        </Box>

        <NotesSection
          formData={formData}
          handleChange={handleChange}
          setFormData={setFormData}
          noteTextName="note_text"
          noteFileName="note_file"
          noteFilePreview={formData.noteFilePreview}
          internalNoteName="internal_note"
          sharedWithCustomerName="shared_with_customer"
        />

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

      {/* Add Unit Dialog */}
      <Dialog
        open={openUnitDialog}
        onClose={() => setOpenUnitDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Unit of Measurement</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Unit Name"
              name="unit_name"
              value={newUnit.unit_name}
              onChange={handleUnitChange}
              fullWidth
            />
            <TextField
              label="Unit Symbol"
              name="unit_symbol"
              value={newUnit.unit_symbol}
              onChange={handleUnitChange}
              fullWidth
            />
            <TextField
              label="Unit Type"
              name="unit_type"
              value={newUnit.unit_type}
              onChange={handleUnitChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUnitDialog(false)}>Cancel</Button>
          <Button onClick={handleAddUnit} variant="contained" color="primary">
            Add Unit
          </Button>
        </DialogActions>
      </Dialog>

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

export default AddProduct;