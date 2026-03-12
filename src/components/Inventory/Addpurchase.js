import React, { useState, useEffect, useCallback } from "react";
import { CgArrowLeft } from "react-icons/cg";
import PurchaseDetailsForm from "./PurchaseDetails";
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
import { useNavigate, useLocation } from "react-router-dom";
import NotesSection from "../DynamicComponents/NotesSection";
import apiEndpoints from "../../apiconfig";
import DynamicHeader from "../common/Dynamicheader";

const AddPurchase = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [formData, setFormData] = useState({
    supplier_id: "",
    email: "",
    mobile_no: "",
    landline_no: "",
    purchase_date: new Date().toISOString().split("T")[0],
    billing_address: "",
    image_path: null,
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
    branch: "",
  });

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchaseDetails, setPurchaseDetails] = useState([]);
  const [purchaseId, setPurchaseId] = useState(null);
  const [isPurchaseSaved, setIsPurchaseSaved] = useState(false);
  const [errors, setErrors] = useState({});

  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);

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
      fontSize: isSmallMobile ? "1rem" : "1.25rem",
    },
  };

  const fetchBranches = useCallback(async () => {
    setLoadingBranches(true);
    try {
      const url = `${apiEndpoints.dropDown}?table=branches&todo=dropdown`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

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
    const fetchInitialData = async () => {
      try {
        // Fetch suppliers
        const suppliersResponse = await fetch(apiEndpoints.supplier, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        if (!suppliersResponse.ok)
          throw new Error("Failed to fetch suppliers");
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData.data);

        // Fetch products
        const productsResponse = await fetch(apiEndpoints.product, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        if (!productsResponse.ok) throw new Error("Failed to fetch products");
        const productsData = await productsResponse.json();
        setProducts(productsData.data);

        // Handle edit mode
        if (location.state?.editData) {
          const editData = location.state.editData;
          setIsEditMode(true);
          setEditId(editData.purchase_id);
          setPurchaseId(editData.purchase_id);
          setIsPurchaseSaved(true);

          setFormData({
            supplier_id: editData.supplier || "",
            purchase_date:
              editData.purchase_date || new Date().toISOString().split("T")[0],
            landline_no: editData.landline_no || "",
            mobile_no: editData.mobile_no || "",
            email: editData.email || "",
            billing_address: editData.billing_address || "",
            image_path: null,
            imagePreview: editData.image_path || "",
            note_text: editData.note_text || "",
            note_file: null,
            noteFilePreview: editData.note_file_path || "",
            internal_note: Boolean(Number(editData.internal_note)),
            shared_with_customer: Boolean(
              Number(editData.shared_with_customer)
            ),
            branch: editData.branch || "",
          });

          // Fetch existing purchase items
          const itemsResponse = await fetch(
            `${apiEndpoints.purchaseItems}?purchase_id=${editData.purchase_id}`
          );
          if (!itemsResponse.ok)
            throw new Error("Failed to fetch purchase items");
          const itemsData = await itemsResponse.json();

          if (itemsData.success) {
            setPurchaseDetails(
              itemsData.data.map((item) => ({
                item_id: item.item_id,
                product_id: item.product_id,
                product_name:
                  productsData.data.find((p) => p.id === item.product_id)
                    ?.product_name || "",
                quantity: item.quantity,
                price: item.price,
                amount: item.amount,
                original_quantity: item.quantity,
              }))
            );
          }
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to load initial data",
          severity: "error",
        });
      }
    };

    fetchInitialData();
    fetchBranches();
  }, [location.state, fetchBranches]);

  const optionsFields = ["supplier_id", "branch"]; // dropdown fields
  const branchOptions = branches.map((branch) => ({
    value: branch.branch_id,
    label: branch.branch_name,
  }));

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // 🟢 CHECKBOX HANDLING
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
      return;
    }

    // 🟢 FILE HANDLING
    if (type === "file") {
      const file = files[0];
      if (!file) return;

      if (name === "image_path") {
        setFormData((prev) => ({
          ...prev,
          image_path: file,
          imagePreview: URL.createObjectURL(file),
        }));
      } else if (name === "note_file") {
        setFormData((prev) => ({
          ...prev,
          note_file: file,
          noteFilePreview: file.name,
        }));
      }
      return;
    }

    // 🟢 SUPPLIER AUTO-FILL (TEXT/SELECT)
    if (name === "supplier_id") {
      const selectedSupplier = suppliers.find(
        (s) => String(s.supplier_id) === String(value)
      );

      if (selectedSupplier) {
        setFormData((prev) => ({
          ...prev,
          supplier_id: value,
          mobile_no: selectedSupplier.mobile_no || "",
          email: selectedSupplier.email || "",
          landline_no: selectedSupplier.landline_no || "",
          billing_address: selectedSupplier.address || "",
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          supplier_id: value,
        }));
      }
      return;
    }

    // 🟢 DEFAULT TEXT INPUT
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const validateEmailFormat = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateMobileFormat = (mobile) => {
    const regex = /^[0-9]{10}$/; // exactly 10 digits
    return regex.test(mobile);
  };

  const validateForm = () => {
    let newErrors = {};

    // Required validations for main form
    if (!formData.supplier_id) newErrors.supplier_id = "Supplier is required";
    if (!formData.purchase_date)
      newErrors.purchase_date = "Purchase date is required";
    if (!formData.mobile_no) newErrors.mobile_no = "Mobile number is required";
    if (!formData.branch) newErrors.branch = "Branch selection is required";

    // Type-Based Validations
    if (formData.mobile_no && !validateMobileFormat(formData.mobile_no)) {
      newErrors.mobile_no = "Invalid mobile number. Enter 10 digits only.";
    }

    if (formData.email && !validateEmailFormat(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Validate Purchase Details
    if (purchaseDetails.length === 0) {
      newErrors.purchaseDetails = "At least one purchase item is required";
    } else {
      const invalidItems = [];

      purchaseDetails.forEach((item, index) => {
        const itemErrors = {};

        if (!item.product_id || item.product_id === "") {
          itemErrors.product_id = "Product is required";
        }

        if (!item.quantity || item.quantity <= 0) {
          itemErrors.quantity = "Quantity must be greater than 0";
        }

        if (!item.price || item.price <= 0) {
          itemErrors.price = "Price must be greater than 0";
        }

        if (Object.keys(itemErrors).length > 0) {
          invalidItems.push({
            index: index + 1,
            errors: itemErrors,
          });
        }
      });

      if (invalidItems.length > 0) {
        newErrors.purchaseDetails = "Some purchase items have invalid data";
        // Store detailed item errors for display in PurchaseDetailsForm
        newErrors.purchaseDetailItems = invalidItems;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate main form AND purchase details
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please fill all required fields in purchase details",
        severity: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const purchaseFormData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === "image_path" && formData.image_path instanceof File) {
          purchaseFormData.append(key, formData.image_path);
        } else if (
          key !== "note_text" &&
          key !== "note_file" &&
          key !== "imagePreview" &&
          key !== "noteFilePreview"
        ) {
          if (key === "supplier_id") {
            purchaseFormData.append("supplier", formData[key]);
          } else {
            purchaseFormData.append(key, formData[key]);
          }
        }
      });
      purchaseFormData.append("internal_note", formData.internal_note ? 1 : 0);

      purchaseFormData.append(
        "shared_with_customer",
        formData.shared_with_customer ? 1 : 0
      );



      if (isEditMode) {
        purchaseFormData.append("purchase_id", editId);
      }

      const purchaseResponse = await fetch(apiEndpoints.purchase, {
        method: "POST",
        body: purchaseFormData,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      const purchaseResult = await purchaseResponse.json();

      if (!purchaseResult.success) {
        throw new Error(purchaseResult.error || "Purchase operation failed");
      }

      const purchaseId = isEditMode ? editId : purchaseResult.id;
      setPurchaseId(purchaseResult.id);
      setIsPurchaseSaved(true);

      if (purchaseDetails.length > 0) {
        await handleDetailsSubmission(purchaseId);
      }

      if (formData.note_text || formData.note_file) {
        const notesFormData = new FormData();
        notesFormData.append("action", isEditMode ? "update" : "update");
        notesFormData.append("table", "purchases");
        notesFormData.append("id", purchaseId);

        if (formData.note_text)
          notesFormData.append("note_text", formData.note_text);
        if (formData.note_file)
          notesFormData.append("note_file", formData.note_file);
        notesFormData.append("internal_note", formData.internal_note ? 1 : 0);
        notesFormData.append(
          "shared_with_customer",
          formData.shared_with_customer ? 1 : 0
        );

        const notesResponse = await fetch(apiEndpoints.notes, {
          method: "POST",
          body: notesFormData,
        });

        const notesResult = await notesResponse.json();
        if (!notesResult.success) {
          console.warn("Notes update failed, but purchase was successful");
        }
      }

      setSnackbar({
        open: true,
        message: isEditMode
          ? "Purchase updated successfully!"
          : "Purchase added successfully!",
        severity: "success",
      });

      setTimeout(() => navigate("/Purchase"), 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "An error occurred",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmission = async (purchaseId) => {
    setIsSubmittingDetails(true);
    try {
      await Promise.all(
        purchaseDetails.map(async (detail) => {
          const payload = {
            purchase_id: purchaseId,
            product_id: detail.product_id,
            quantity: detail.quantity,
            price: detail.price,
          };

          let response;
          if (isEditMode && detail.item_id) {
            response = await fetch(
              `${apiEndpoints.purchaseItems}?id=${detail.item_id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              }
            );
          } else {
            response = await fetch(apiEndpoints.purchaseItems, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            });
          }

          const result = await response.json();
          if (!result.success)
            throw new Error(result.error || "Failed to save item");
        })
      );

      await Promise.all(
        purchaseDetails.map(async (detail) => {
          try {
            if (isEditMode) {
              // ALWAYS UPDATE STOCK ON PURCHASE EDIT
              await fetch(
                `${apiEndpoints.stock}?product_id=${detail.product_id}`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                  },
                  body: JSON.stringify({
                    purchase_id: purchaseId,
                    product_id: detail.product_id,
                    quantity: detail.quantity, // always send updated quantity
                  }),
                }
              );
            } else {
              // NEW PURCHASE → INSERT INTO STOCK
              await fetch(apiEndpoints.stock, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                  purchase_id: purchaseId,
                  product_id: detail.product_id,
                }),
              });
            }
          } catch (error) {
            console.error("Stock update error:", error);
          }
        })
      );
    } catch (error) {
      throw error;
    } finally {
      setIsSubmittingDetails(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      if (isEditMode && itemId) {
        await fetch(`${apiEndpoints.purchaseItems}?id=${itemId}`, {
          method: "DELETE",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete item",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Responsive field renderer - UPDATED
  const renderField = (
    label,
    name,
    type = "text",
    options = [],
    required = false,
    readOnly = false
  ) => (
    <Box
      display="flex"
      flexDirection={isSmallMobile ? "column" : "row"}
      alignItems={isSmallMobile ? "flex-start" : "center"}
      sx={{ width: "100%" }}
    >
      <Typography sx={labelStyle}>{label}</Typography>

      {options.length > 0 ? (
        <FormControl
          error={Boolean(errors[name])}
          sx={{ ...inputStyle, minWidth: isSmallMobile ? "100%" : "200px" }}
        >
          <InputLabel>{label}</InputLabel>
          <Select
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            label={label}
          >
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>

          {errors[name] && (
            <Typography sx={{ color: "red", fontSize: "12px", mt: "3px" }}>
              {errors[name]}
            </Typography>
          )}
        </FormControl>
      ) : (
        <TextField
          name={name}
          type={type}
          value={formData[name] || ""}
          onChange={handleChange}
          placeholder={`Enter ${label}`}
          inputProps={{ readOnly }}
          error={Boolean(errors[name])}
          helperText={errors[name] || ""}
          sx={{ ...inputStyle }}
          InputLabelProps={type === "date" ? { shrink: true } : undefined}
        />
      )}
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
        {/* Purchase Information Title */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography {...sectionTitleStyle}>Purchase Information</Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
        </Box>

        {/* Purchase Info Fields - UPDATED GRID */}
        <Grid
          container
          spacing={isMobile ? 2 : 4}
          sx={{ width: "100%", margin: 0 }}
        >
          {/* LEFT COLUMN */}
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
              {renderField(
                "Supplier Name*",
                "supplier_id",
                "text",
                suppliers.map((supplier) => ({
                  value: supplier.supplier_id,
                  label: supplier.supplier_name,
                })),
                true
              )}
              {renderField("Mobile No*", "mobile_no", "tel", [], true)}
              {renderField("Email", "email", "email")}
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
                      color: "rgba(249, 115, 22, 0.9)", // text & icon color
                      borderColor: "rgba(249, 115, 22, 0.9)", // outline color
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
                      name="image_path"
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
                            : formData.imagePreview.includes("http")
                              ? formData.imagePreview
                              : `${apiEndpoints.blob}${formData.imagePreview}`
                        }
                        alt="Purchase Preview"
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
                          {formData.image_path instanceof File
                            ? formData.image_path.name
                            : formData.imagePreview.split("/").pop()}
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              image_path: null,
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
              {renderField("Branch*", "branch", "text", branchOptions, true)}
              {renderField("Landline No", "landline_no", "tel", [], true)}
              {renderField("Billing Address", "billing_address", "text")}
            </Stack>
          </Grid>
        </Grid>

        {/* Purchase Details Section */}
        <Box sx={{ mt: 6, mb: 2 }}>
          <Typography {...sectionTitleStyle}>Purchase Details</Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
        </Box>

        {/* Validation Summary Alert for Purchase Details */}
        {(errors.purchaseDetails || errors.purchaseDetailItems) && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() =>
              setErrors((prev) => ({
                ...prev,
                purchaseDetails: null,
                purchaseDetailItems: [],
              }))
            }
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Purchase Details Validation Errors:
            </Typography>
            <ul style={{ marginTop: 8, marginBottom: 8, paddingLeft: 20 }}>
              {errors.purchaseDetails && <li>{errors.purchaseDetails}</li>}
              {errors.purchaseDetailItems &&
                errors.purchaseDetailItems.map((item, idx) => (
                  <li key={idx}>
                    <strong>Item #{item.index}:</strong>{" "}
                    {Object.values(item.errors).join(", ")}
                  </li>
                ))}
            </ul>
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <PurchaseDetailsForm
            rows={purchaseDetails}
            onRowsChange={setPurchaseDetails}
            products={products}
            isEditMode={isEditMode}
            isSubmitting={isSubmittingDetails}
            onDeleteItem={handleDeleteItem}
            validationErrors={errors.purchaseDetailItems || []} // Pass errors to child
          />
        </Box>

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

        {/* Single Submit Button */}
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

export default AddPurchase;