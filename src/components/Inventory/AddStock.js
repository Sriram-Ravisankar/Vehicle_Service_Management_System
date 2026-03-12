import React, { useState, useEffect } from "react";
import { CgArrowLeft } from "react-icons/cg";
import PurchaseDetailsForm from "./PurchaseDetails";
import {
  Box,
  Grid,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Settings from "@mui/icons-material/Settings";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { useNavigate } from "react-router-dom";
import NotesSection from "../DynamicComponents/NotesSection";
import DynamicHeader from "../common/Dynamicheader";

const AddStock = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const [formData, setFormData] = useState({
    productNumber: "",
    image: null,
    imagePreview: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    supplierName: "",
    branch: "",
    billingAddress: "",
    email: "",
    mobileNo: "",
    notes: "",
    internalNotes: false,
    sharedWithCustomer: false
  });

  const [suppliers, setSuppliers] = useState([
    { id: 1, name: "Supplier A" },
    { id: 2, name: "Supplier B" },
    { id: 3, name: "Supplier C" },
  ]);

  const [branches, setBranches] = useState([
    { id: 1, name: "Main Branch" },
    { id: 2, name: "North Branch" },
    { id: 3, name: "South Branch" },
  ]);

  const [purchaseDetails, setPurchaseDetails] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);

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

  useEffect(() => {
    const editData = localStorage.getItem("stockEditData");
    if (editData) {
      const data = JSON.parse(editData);
      setFormData({
        productNumber: data.ProductNumber || "",
        imagePreview: data.Image || "",
        purchaseDate: data.PurchaseDate || new Date().toISOString().split("T")[0],
        supplierName: data.SupplierName || "",
        branch: data.Branch || "",
        billingAddress: data.BillingAddress || "",
        email: data.email || "",
        mobileNo: data.mobileNo || "",
        notes: data.Notes || "",
        internalNotes: data.InternalNotes || false,
        sharedWithCustomer: data.SharedWithCustomer || false
      });

      if (data.Products && data.Products.length > 0) {
        setPurchaseDetails(data.Products);
      } else if (data.ManufacturerName || data.ProductName || data.Quantity) {
        setPurchaseDetails([{
          manufacturer: data.ManufacturerName || "",
          product: data.ProductName || "",
          quantity: data.Quantity || "",
          price: data.Price || "",
          amount: data.Amount || ""
        }]);
      } else {
        setPurchaseDetails([]);
      }

      setIsEditMode(true);
      setEditId(data.id);
    }

    const savedSuppliers = JSON.parse(localStorage.getItem("suppliers")) || [];
    if (savedSuppliers.length > 0) {
      setSuppliers(savedSuppliers);
    }

    const savedBranches = JSON.parse(localStorage.getItem("branches")) || [];
    if (savedBranches.length > 0) {
      setBranches(savedBranches);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      const file = files ? files[0] : null;
      if (name === "image" && file) {
        const imageUrl = URL.createObjectURL(file);
        setFormData({ ...formData, image: file, imagePreview: imageUrl });
      } else if (file) {
        setFormData({ ...formData, [name]: file });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePurchaseDetailsChange = (details) => {
    setPurchaseDetails(details);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const imageBase64 =
        formData.image instanceof File
          ? await toBase64(formData.image)
          : formData.imagePreview;

      const newStockEntry = {
        id: editId || Date.now(),
        Selected: false,
        Image: imageBase64,
        ProductNumber: formData.productNumber,
        ManufacturerName: purchaseDetails.length > 0 ? purchaseDetails[0].manufacturer : "",
        ProductName: purchaseDetails.length > 0 ? purchaseDetails[0].product : "",
        Quantity: purchaseDetails.length > 0 ? purchaseDetails[0].quantity : "",
        UnitOfMeasurement: "Unit",
        Action: "Edit",
        PurchaseDate: formData.purchaseDate,
        SupplierName: formData.supplierName,
        Branch: formData.branch,
        BillingAddress: formData.billingAddress,
        Notes: formData.notes,
        InternalNotes: formData.internalNotes,
        SharedWithCustomer: formData.sharedWithCustomer,
        Products: purchaseDetails,
        Price: purchaseDetails.length > 0 ? purchaseDetails[0].price : "",
        Amount: purchaseDetails.length > 0 ? purchaseDetails[0].amount : ""
      };

      const existingStock = JSON.parse(localStorage.getItem("stockData")) || [];

      const updatedStock = isEditMode
        ? existingStock.map((item) => (item.id === editId ? newStockEntry : item))
        : [...existingStock, newStockEntry];

      localStorage.setItem("stockData", JSON.stringify(updatedStock));
      localStorage.removeItem("stockEditData");

      setSnackbar({
        open: true,
        message: isEditMode ? "Stock updated successfully!" : "Stock added successfully!",
        severity: "success"
      });

      setTimeout(() => navigate("/stock"), 1500);

    } catch (error) {
      setSnackbar({
        open: true,
        message: "An error occurred while saving stock",
        severity: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Responsive field renderer - UPDATED
  const renderField = (label, name, type = "text", options = [], required = false) => (
    <Box display="flex" flexDirection={isSmallMobile ? "column" : "row"} alignItems={isSmallMobile ? "flex-start" : "center"} sx={{ width: "100%" }}>
      <Typography sx={labelStyle}>
        {label}
      </Typography>
      {options.length > 0 ? (
        <FormControl sx={{
          ...inputStyle,
          minWidth: isSmallMobile ? "100%" : "200px"
        }}>
          <InputLabel>{label}</InputLabel>
          <Select
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            label={label}
            required={required}
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
          name={name}
          type={type}
          value={formData[name] || ""}
          onChange={handleChange}
          placeholder={`Enter ${label}`}
          required={required}
          sx={{ ...inputStyle }}
          InputLabelProps={type === "date" ? { shrink: true } : undefined}
        />
      )}
    </Box>
  );

  return (
    <Box sx={{
      p: isMobile ? 2 : 4,
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      {/* Header */}
      <DynamicHeader />

      <form onSubmit={handleSubmit}>
        {/* Stock Information Title */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography {...sectionTitleStyle}>
            Stock Information
          </Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
        </Box>

        {/* Stock Info Fields - UPDATED GRID */}
        <Grid container spacing={isMobile ? 2 : 4} sx={{ width: '100%', margin: 0 }}>
          {/* LEFT COLUMN */}
          <Grid item xs={12} md={6} sx={{ width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" } }}>
            <Stack spacing={2}>
              {renderField("Purchase No*", "productNumber", "text", [], true)}
              {renderField("Purchase Date", "purchaseDate", "date")}
              {renderField("Branch", "branch", "text", branches.map(branch => ({
                value: branch.name,
                label: branch.name
              })))}
              {renderField("Mobile No*", "mobileNo", "tel", [], true)}

              {/* Image Upload - UPDATED */}
              <Box display="flex" flexDirection={isSmallMobile ? "column" : "row"} alignItems={isSmallMobile ? "flex-start" : "center"} sx={{ width: "100%" }}>
                <Typography sx={labelStyle}>Image</Typography>
                <Box sx={{ width: '100%' }}>
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
                    <Box display="flex" alignItems="center" mt={2} gap={2} sx={{
                      flexWrap: 'wrap',
                      flexDirection: isSmallMobile ? 'column' : 'row',
                      alignItems: isSmallMobile ? 'flex-start' : 'center'
                    }}>
                      <img
                        src={formData.imagePreview}
                        alt="Stock Preview"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: 'cover',
                          cursor: 'pointer',
                          border: '1px solid #eee',
                          borderRadius: '4px'
                        }}
                      />
                      <Box display="flex" flexDirection="column" sx={{ width: isSmallMobile ? '100%' : 'auto' }}>
                        <Typography variant="body2">
                          {formData.image instanceof File
                            ? formData.image.name
                            : "Stock Image"}
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            image: null,
                            imagePreview: ''
                          }))}
                          sx={{
                            mt: 1,
                            alignSelf: isSmallMobile ? 'stretch' : 'flex-start',
                            width: isSmallMobile ? '100%' : 'auto'
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

          {/* RIGHT COLUMN */}
          <Grid item xs={12} md={6} sx={{ width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" } }}>
            <Stack spacing={2}>
              {renderField("Supplier Name", "supplierName", "text", suppliers.map(supplier => ({
                value: supplier.name,
                label: supplier.name
              })))}
              {renderField("Billing Address", "billingAddress", "text")}
              {renderField("Email*", "email", "email", [], true)}
            </Stack>
          </Grid>
        </Grid>

        {/* Purchase Details Section */}
        <Box sx={{ mt: 6, mb: 2 }}>
          <Typography {...sectionTitleStyle}>
            Purchase Details
          </Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
        </Box>

        <Box sx={{ mb: 4 }}>
          <PurchaseDetailsForm
            onChange={handlePurchaseDetailsChange}
            initialData={purchaseDetails}
            isEditMode={isEditMode}
            products={[]} // Add this line to provide empty array as fallback
            rows={purchaseDetails} // Add this if your component uses rows prop
            onRowsChange={setPurchaseDetails} // Add this if your component uses onRowsChange
          />
        </Box>

        {/* Notes Section */}
        <Box sx={{ mt: 6, mb: 2 }}>
          <Typography {...sectionTitleStyle}>
            Notes
          </Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
        </Box>

        <NotesSection
          formData={formData}
          handleChange={handleChange}
          setFormData={setFormData}
          noteTextName="notes"
          internalNoteName="internalNotes"
          sharedWithCustomerName="sharedWithCustomer"
        />

        {/* Submit Button */}
        <Box mt={4}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{
              backgroundColor: "#10AADF",
              "&:hover": { backgroundColor: "#09B3F1" },
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
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddStock;