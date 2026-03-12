import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Stack,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
} from "@mui/material";
import { CgArrowLeft } from "react-icons/cg";
import { useNavigate, useLocation } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
// import { printInvoice } from "./InvoicePrint";
import apiEndpoints from "../../../apiconfig";
import { useParams } from "react-router-dom";
const labelStyle = {
  minWidth: "150px",
  textAlign: "right",
  paddingRight: "16px",
  fontWeight: 500,
  fontSize: "0.95rem",
};

const inputStyle = {
  flex: 1,
  "& .MuiInputBase-root": {
    height: "40px",
    fontSize: "0.9rem",
  },
};

export default function AddInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = sessionStorage.getItem("token");

  const quotation = location.state?.quotation || null;
  const { id } = useParams(); // invoice_guid
  const isEdit = location.pathname.includes("edit-invoice");
  const isView = location.pathname.includes("view-invoice");

  // 🔑 PRE-CHECK: if invoice already exists for this quotation, redirect immediately
  useEffect(() => {
    if (!quotation || isEdit) return;

    const checkInvoice = async () => {
      try {
        const res = await fetch(
          apiEndpoints.Invoice + "?quotation_guid=" + quotation.quotation_guid,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        if (data?.invoice_guid) {
          // 🚀 DIRECT REDIRECT — DO NOT SHOW CREATE PAGE
          navigate("/edit-invoice/" + data.invoice_guid, { replace: true });
        }
      } catch (err) {
        console.error("Invoice pre-check failed", err);
      }
    };

    checkInvoice();
  }, [quotation, isEdit, navigate, token]);

  const [formData, setFormData] = useState({
    invoiceNumber: "", // WILL COME FROM BACKEND
    invoiceDate: "",
    customerName: "",
    numberPlate: "",
    items: [],
    discountType: "percent",
    discount: 0,
    gst: 0,
    includeGST: true,
    subtotal: 0,
    grandTotal: 0,
    paidAmount: "",
    paymentMethod: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ------------------- LOAD FROM QUOTATION --------------------
  useEffect(() => {
    // ❌ DO NOT preload quotation in edit mode
    if (id || isEdit || !quotation) return;


    const itemsFromParts = (quotation.parts || []).map((p) => ({
      id: Date.now() + Math.random(),
      category: "Product",
      name: p.name,
      qty: Number(p.qty),
      price: Number(p.rate),
      total: Number(p.amount),
    }));

    const itemsFromLabour = (quotation.labour || []).map((l) => ({
      id: Date.now() + Math.random(),
      category: "Service",
      name: l.title,
      qty: 1,
      price: Number(l.amount),
      total: Number(l.amount),
    }));

    const totals = quotation.totals || {};

    setFormData((prev) => ({
      ...prev,
      customerName: quotation.customer_name,
      numberPlate: quotation.vehicle_number || quotation.vehicle_no,
      items: [...itemsFromParts, ...itemsFromLabour],
      subtotal: totals.subtotal || 0,
      discountType: totals.discountType || "percent",
      discount: totals.discountValue || 0,
      gst: totals.includeGST ? totals.gstRate || 0 : 0,
      includeGST: Boolean(totals.includeGST),
      grandTotal: totals.grandTotal || 0,
    }));
  }, [quotation, isEdit]);


  const parts = formData.items.filter((i) => i.category === "Product");
  const labour = formData.items.filter((i) => i.category === "Service");
  const labourTotal = labour.reduce((s, l) => s + Number(l.total), 0);
  // ------------------- RECALCULATE TOTALS --------------------
  useEffect(() => {
    const productTotal = parts.reduce((s, it) => s + Number(it.total), 0);
    const labourTotal = labour.reduce((s, l) => s + Number(l.total), 0);

    const discountAmount =
      formData.discountType === "percent"
        ? (productTotal * formData.discount) / 100
        : Number(formData.discount);

    const subtotal = productTotal - discountAmount;

    const gstAmount = formData.includeGST ? (subtotal * formData.gst) / 100 : 0;

    const grandTotal = Math.round(subtotal + gstAmount + labourTotal);

    setFormData((prev) => ({
      ...prev,
      subtotal,
      grandTotal,
    }));
  }, [
    JSON.stringify(formData.items),
    formData.discount,
    formData.gst,
    formData.discountType,
    formData.includeGST
  ]);

  const loadFromQuotation = () => {
    const itemsFromParts = (quotation.parts || []).map((p) => ({
      id: Date.now() + Math.random(),
      category: "Product",
      name: p.name,
      qty: Number(p.qty),
      price: Number(p.rate),
      total: Number(p.amount),
    }));

    const itemsFromLabour = (quotation.labour || []).map((l) => ({
      id: Date.now() + Math.random(),
      category: "Service",
      name: l.title,
      qty: 1,
      price: Number(l.amount),
      total: Number(l.amount),
    }));

    const totals = quotation.totals || {};

    setFormData({
      invoiceNumber: "", // keep same
      invoiceDate: new Date().toISOString().split("T")[0],
      customerName: quotation.customer_name,
      numberPlate: quotation.vehicle_number || "",
      items: [...itemsFromParts, ...itemsFromLabour],
      discountType: totals.discountType || "percent",
      discount: totals.discountValue || 0,
      gst: totals.gstPercent || 0,
      includeGST: true,
      subtotal: totals.subtotal || 0,
      grandTotal: totals.grandTotal || 0,
      paidAmount: "",
      paymentMethod: "",
    });
  };

  const loadFromInvoice = async () => {
    try {
      const res = await fetch(`${apiEndpoints.Invoice}?invoice_guid=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!data) return;

      setFormData({
        invoiceNumber: data.invoice_no,
        invoiceDate: data.created_on?.split(" ")[0] || "",
        customerName: data.customer_name,
        numberPlate: data.vehicle_number,
        items: data.items || [],
        discountType: data.totals?.discountType || "percent",
        discount: data.totals?.discountPercent || 0,
        gst: data.totals?.gstPercent ?? 0,
        includeGST: true,
        subtotal: data.totals?.subtotal || 0,
        grandTotal: data.totals?.grandTotal || 0,
        paidAmount: data.paid_amount || "",
        paymentMethod: data.payment_method || "",
      });
    } catch (err) {
      console.error("Load invoice failed", err);
    }
  };



  useEffect(() => {
    if (!id) return;

    // 🔥 If coming from quotation → refresh from quotation
    if (quotation) {
      loadFromQuotation();
    }
    // ✅ Normal edit (invoice list → edit)
    else {
      loadFromInvoice();
    }
  }, [id, quotation]);




  // ------------------- UPDATE ITEM --------------------
  const updateItem = (id, key, value) => {
    setFormData((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.id === id
          ? {
            ...item,
            [key]: value,
            total:
              key === "qty" || key === "price"
                ? (key === "qty" ? Number(value) : item.qty) *
                (key === "price" ? Number(value) : item.price)
                : item.total,
          }
          : item
      );

      return { ...prev, items: updatedItems };
    });
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: Date.now(), name: "", qty: 1, price: 0, total: 0 },
      ],
    }));
  };

  const deleteItem = (id) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
  };

  // ------------------- SAVE INVOICE TO BACKEND --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isEdit
      ? `${apiEndpoints.Invoice}?invoice_guid=${id}`
      : apiEndpoints.Invoice;

    const method = "POST";

    const form = new FormData();
    form.append("items", JSON.stringify(formData.items));
    form.append(
      "totals",
      JSON.stringify({
        subtotal: formData.subtotal,
        discountType: formData.discountType,
        discountPercent: formData.discount,
        gstPercent: formData.gst,
        grandTotal: formData.grandTotal,
      })
    );
    form.append("payment_method", formData.paymentMethod);
    form.append("paid_amount", formData.paidAmount);
    form.append("quotation_guid", quotation?.quotation_guid || "");
    form.append("job_guid", quotation?.job_guid || "");
    form.append("customer_guid", quotation?.customer_guid || "");
    form.append("vehicle_guid", quotation?.vehicle_guid || "");

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    const data = await res.json();

    if (!data || !data.success) {
      setSnackbar({
        open: true,
        message: data?.message || "Something went wrong",
        severity: "error",
      });
      return;
    }

    /* 🔑 IMPORTANT FIX — SAME AS QUOTATION */
    // if (!isEdit && data.mode === "edit" && data.invoice_guid) {
    //   navigate("/edit-invoice/" + data.invoice_guid);
    //   return;
    // }

    setSnackbar({
      open: true,
      message: isEdit
        ? "Invoice updated successfully"
        : "Invoice created successfully",
      severity: "success",
    });

    setTimeout(() => navigate("/invoices"), 1200);
  };

  // ------------------- PRINT INVOICE --------------------
  // const handlePrint = () => {
  //   printInvoice({
  //     ...formData,
  //     parts: parts,
  //     labour: labour,
  //     admin: formData.admin,
  //   });
  // };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box display="flex" alignItems="center" mb={2}>
        <IconButton onClick={() => navigate(-1)}>
          <CgArrowLeft size={30} color="rgba(249, 115, 22, 0.9)" />
        </IconButton>

        <Typography variant="h5" fontWeight="bold" sx={{ ml: 1 }}>
          {isEdit ? "Edit Invoice" : "Create Invoice"}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        {/* INVOICE DETAILS */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Invoice Details
          </Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", width: "100%", mb: 2 }} />
        </Box>

        {/* FETCHED DATA */}
        <Grid container spacing={3}>
          {/* <Grid item xs={12} md={6} mb={2} width={{ xs: "100%", md: "45%" }}>
            <Box display="flex" alignItems="center">
              <Typography sx={labelStyle}>Invoice Number</Typography>
              <TextField value="AUTO" disabled sx={inputStyle} />
            </Box>
          </Grid> */}
          <Grid item xs={12} md={6} mb={2} width={{ xs: "100%", md: "45%" }}>
            <Box display="flex" alignItems="center">
              <Typography sx={labelStyle}>Invoice Date</Typography>
              <TextField
                type="date"
                value={formData.invoiceDate || new Date().toISOString().split("T")[0]}
                // disabled={isEdit}
                onChange={(e) =>
                  setFormData({ ...formData, invoiceDate: e.target.value })
                }
                sx={inputStyle}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6} mb={2} width={{ xs: "100%", md: "45%" }}>
            <Box display="flex" alignItems="center">
              <Typography sx={labelStyle}>Customer Name</Typography>
              <TextField
                value={formData.customerName}
                disabled
                sx={inputStyle}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6} mb={2} width={{ xs: "100%", md: "45%" }}>
            <Box display="flex" alignItems="center">
              <Typography sx={labelStyle}>Number Plate</Typography>
              <TextField
                value={formData.numberPlate}
                disabled
                sx={inputStyle}
              />
            </Box>
          </Grid>
        </Grid>

        {/* ITEMS */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight="bold">
            Items (Parts)
          </Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", mb: 2 }} />

          {parts.map((item) => (
            <Box
              key={item.id}
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              gap={2}
              // alignItems="center"
              sx={{ mb: 2 }}
            >
              <TextField
                label="Part"
                value={item.name}
                sx={{ width: { xs: "100%", md: "25%" } }}
                disabled={isView}
              />
              <TextField
                label="Qty"
                type="number"
                value={item.qty}
                onChange={(e) =>
                  updateItem(item.id, "qty", Number(e.target.value))
                }
                sx={{ width: { xs: "100%", md: "25%" } }}
                disabled={isView}
              />
              <TextField
                label="Rate"
                type="number"
                value={item.price}
                onChange={(e) =>
                  updateItem(item.id, "price", Number(e.target.value))
                }
                sx={{ width: { xs: "100%", md: "25%" } }}
                disabled={isView}
              />
              <TextField
                label="Total"
                value={item.total}
                sx={{ width: { xs: "100%", md: "25%" } }}
                disabled
              />
              {!isView && (
                <IconButton color="error" onClick={() => deleteItem(item.id)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}

          {!isView && (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  items: [
                    ...prev.items,
                    {
                      id: Date.now(),
                      category: "Product",
                      name: "",
                      qty: 1,
                      price: 0,
                      total: 0,
                    },
                  ],
                }))
              }
              sx={{
                backgroundColor: "rgba(249, 115, 22, 0.9)",
                "&:hover": {
                  backgroundColor: "rgba(249, 115, 22, 1)",
                },
                color: "#fff",
                textTransform: "none",
              }}
            >
              Add Part
            </Button>

          )}

          <Typography variant="h6" fontWeight="bold" sx={{ mt: 4 }}>
            Labour Charges
          </Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", mb: 2 }} />

          {labour.map((lb) => (
            <Box
              key={lb.id}
              display="flex"
              gap={2}
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <TextField
                label="Labour Title"
                value={lb.name}
                sx={{ width: 220 }}
                disabled={isView}
              />
              <TextField
                label="Amount"
                type="number"
                value={lb.total}
                onChange={(e) =>
                  updateItem(lb.id, "total", Number(e.target.value))
                }
                sx={{ width: 140 }}
                disabled={isView}
              />
              {!isView && (
                <IconButton color="error" onClick={() => deleteItem(lb.id)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}

          {!isView && (
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() =>
                setFormData((prev) => ({
                  ...prev,
                  items: [
                    ...prev.items,
                    {
                      id: Date.now(),
                      category: "Service",
                      name: "",
                      qty: 1,
                      price: 0,
                      total: 0,
                    },
                  ],
                }))
              }
              sx={{
                backgroundColor: "rgba(249, 115, 22, 0.9)",
                "&:hover": {
                  backgroundColor: "rgba(249, 115, 22, 1)",
                },
                color: "#fff",
                textTransform: "none",
              }}
            >
              Add Labour
            </Button>

          )}
        </Box>

        {/* SUMMARY (DISCOUNT + GST) */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight="bold">
            Summary
          </Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", mb: 2 }} />

          <Box display="flex" alignItems="center" mb={2}>
            <Typography sx={labelStyle}>
              Discount {formData.discountType === "percent" ? "(%)" : "(₹)"}
            </Typography>
            <TextField
              type="number"
              value={formData.discount}
              onChange={(e) =>
                setFormData({ ...formData, discount: Number(e.target.value) })
              }
              sx={inputStyle}
              disabled={isView}
            />
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <Typography sx={labelStyle}>Subtotal</Typography>
            <TextField value={formData.subtotal} disabled sx={inputStyle} />
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <Typography sx={labelStyle}>GST (%)</Typography>
            <TextField
              type="number"
              value={formData.gst}
              onChange={(e) =>
                setFormData({ ...formData, gst: Number(e.target.value) })
              }
              sx={inputStyle}
              disabled={isView}
            />
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <Typography sx={labelStyle}>Labour Charges</Typography>
            <TextField value={labourTotal} disabled sx={inputStyle} />
          </Box>

          <Box display="flex" alignItems="center" mb={2}>
            <Typography sx={labelStyle}>Grand Total</Typography>
            <TextField value={formData.grandTotal} disabled sx={inputStyle} />
          </Box>
        </Box>

        {/* PAYMENT */}
        {/* <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight="bold">
            Payment
          </Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", mb: 2 }} />

          <Box display="flex" alignItems="center" mb={2}>
            <Typography sx={labelStyle}>Paid Amount</Typography>
            <TextField
              type="number"
              value={formData.paidAmount}
              onChange={(e) =>
                setFormData({ ...formData, paidAmount: e.target.value })
              }
              sx={inputStyle}
              disabled={isView}
            />
          </Box>

          <Box display="flex" alignItems="center">
            <Typography sx={labelStyle}>Payment Method</Typography>
            <FormControl sx={inputStyle}>
              <Select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
                disabled={isView}
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box> */}

        {/* BUTTONS */}
        <Box mt={4} display="flex" gap={2}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              height: "45px",
              backgroundColor: "rgba(249, 115, 22, 0.9)",
              "&:hover": {
                backgroundColor: "rgba(249, 115, 22, 1)",
              },
              color: "#fff",
              textTransform: "none",
              fontWeight: "bold",
            }}

          >
            Save Invoice
          </Button>
          {/* <Button
            variant="outlined"
            onClick={handlePrint}
            fullWidth
            sx={{ height: "45px" }}
          >
            Print
          </Button> */}
        </Box>
      </form>
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
}