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
  CircularProgress
} from "@mui/material";
import { useToast } from "../../../context/ToastContext";
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  Package,
  Wrench,
  Wallet,
  CheckCircle2,
  Circle
} from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import apiEndpoints from "../../../apiconfig";
import SearchableSelect from "../../../components/DynamicComponents/SearchableSelect";

/* utility */
const currency = (v) =>
  Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const SectionCard = ({ title, children, icon: Icon, action, style = {} }) => (
  <Box sx={{
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #F3F4F6",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    p: { xs: 2, md: 3 },
    mb: 3,
    ...style
  }}>
    <div style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: 12, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {Icon && <Icon size={18} style={{ color: "#0EA5E9" }} />}
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h3>
      </div>
      {action}
    </div>
    {children}
  </Box>
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

const labelStyle = {
  fontSize: 13,
  fontWeight: 500,
  color: "#374151",
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 6
};

export default function AddInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = sessionStorage.getItem("token");

  const quotation = location.state?.quotation || null;
  const { id } = useParams(); // invoice_guid
  const isEdit = location.pathname.includes("edit-invoice");
  const isView = location.pathname.includes("view-invoice");
  const [products, setProducts] = useState([]);

  // Fetch products for dropdowns
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(apiEndpoints.product, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setProducts(data.data);
      } catch (err) {
        console.error("Fetch products failed", err);
      }
    };
    fetchProducts();
  }, [token]);

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
    vehicleModel: "", // New field for printing
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
  const showToast = useToast();

  // ------------------- LOAD FROM QUOTATION --------------------
  useEffect(() => {
    // ❌ DO NOT preload quotation in edit mode
    if (id || isEdit || !quotation) return;


    const itemsFromParts = (quotation.parts || []).map((p) => ({
      id: Date.now() + Math.random(),
      category: "Product",
      product_id: p.product_id || "",
      name: p.name,
      qty: Number(p.qty),
      price: Number(p.rate),
      total: Number(p.amount),
    }));

    const itemsFromLabour = (quotation.labour || []).map((l) => ({
      id: Date.now() + Math.random(),
      category: "Service",
      name: l.title,
      mechanic_guid: l.mechanic_guid || "",
      qty: 1,
      price: Number(l.amount),
      total: Number(l.amount),
    }));

    const totals = quotation.totals || {};

    setFormData((prev) => ({
      ...prev,
      customerName: quotation.customer_name,
      numberPlate: quotation.vehicle_number || quotation.vehicle_no,
      vehicleModel: quotation.vehicle_model || quotation.vehicleModel || "",
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
      product_id: p.product_id || "",
      name: p.name,
      qty: Number(p.qty),
      price: Number(p.rate),
      total: Number(p.amount),
    }));

    const itemsFromLabour = (quotation.labour || []).map((l) => ({
      id: Date.now() + Math.random(),
      category: "Service",
      name: l.title,
      mechanic_guid: l.mechanic_guid || "",
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
      const updatedItems = prev.items.map((item) => {
        if (item.id !== id) return item;

        const numVal = Number(value);
        if ((key === "qty" || key === "price" || key === "total") && numVal < 0) return item;

        let updated = { ...item, [key]: value };

        if (key === "product_id" && value) {
          // Check for duplication
          const isDuplicate = prev.items.some(existing => existing.id !== id && String(existing.product_id) === String(value));
          if (isDuplicate) {
            showToast("This product is already added. Please increase the quantity of the existing row.", "warning");
            updated.product_id = "";
            return updated;
          }

          const prod = products.find(p => String(p.id) === String(value));
          if (prod) {
            const avail = Number(prod.available_stock || 0);
            if (avail <= 0) {
              showToast(`Out of Stock! ${prod.product_name} has 0 available.`, "error");
              updated.product_id = "";
              return updated;
            }
            updated.name = prod.product_name;
            updated.price = Number(prod.selling_price || prod.price || 0);
            if (!updated.qty || updated.qty < 1) updated.qty = 1;
          }
        }

        if (key === "qty" && updated.product_id) {
          const prod = products.find(p => String(p.id) === String(updated.product_id));
          if (prod) {
            const avail = Number(prod.available_stock || 0);
            if (Number(value) > avail) {
              showToast(`Not enough stock! Only ${avail} available for ${prod.product_name}.`, "error");
              updated.qty = avail;
            }
          }
        }

        updated.total = (key === "qty" || key === "price" || key === "product_id")
          ? Number(updated.qty || 0) * Number(updated.price || 0)
          : updated.total;
        
        return updated;
      });

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
      showToast(data?.message || "Something went wrong", "error");
      return;
    }

    /* 🔑 IMPORTANT FIX — SAME AS QUOTATION */
    // if (!isEdit && data.mode === "edit" && data.invoice_guid) {
    //   navigate("/edit-invoice/" + data.invoice_guid);
    //   return;
    // }

    showToast(isEdit ? "Invoice updated successfully" : "Invoice created successfully", "success");

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
    <Box sx={{ px: { xs: 2, md: 3 }, py: 3, background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton onClick={() => navigate("/invoices")}>
            <ArrowLeft size={28} style={{ color: "rgba(14, 165, 233, 0.9)" }} />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#111827" }}>
            {isEdit ? (isView ? "View Invoice" : "Edit Invoice") : "Create Invoice"}
          </Typography>
        </Stack>
      </Box>

      {/* Invoice Details */}
      <SectionCard title="Invoice Details" icon={FileText}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: 1, sm: 1.5 } }}>
              <Typography sx={{ ...labelStyle, mb: 0, width: { xs: "100%", sm: 140 }, flexShrink: 0 }}>Invoice Date</Typography>
              <input
                type="date"
                disabled={isView}
                value={formData.invoiceDate || new Date().toISOString().split("T")[0]}
                style={inputSx()}
                onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: 1, sm: 1.5 } }}>
              <Typography sx={{ ...labelStyle, mb: 0, width: { xs: "100%", sm: 140 }, flexShrink: 0 }}>Customer Name</Typography>
              <input
                disabled
                value={formData.customerName || "---"}
                style={inputSx()}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { xs: "flex-start", sm: "center" }, gap: { xs: 1, sm: 1.5 } }}>
              <Typography sx={{ ...labelStyle, mb: 0, width: { xs: "100%", sm: 140 }, flexShrink: 0 }}>Number Plate</Typography>
              <input
                disabled
                value={formData.numberPlate || "---"}
                style={inputSx()}
              />
            </Box>
          </Grid>
        </Grid>
      </SectionCard>

      {/* Parts Inventory */}
      <SectionCard title="Parts Inventory" icon={Package}>
        <Box sx={{ overflowX: "auto", width: "100%", pb: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "850px" }}>
            {/* Table Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 140px 140px 40px", gap: 12, padding: "0 4px", borderBottom: "1px solid #F3F4F6", paddingBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Select Product</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Part Name / Description</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Qty</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Rate</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", textAlign: "right" }}>Amount</span>
              <span></span>
            </div>
            {parts.map((item) => (
              <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 140px 140px 40px", gap: 12, alignItems: "center" }}>
                <SearchableSelect
                  value={String(item.product_id || "")}
                  disabled={isView}
                  placeholder="-- Select Product --"
                  options={products.map(prod => ({
                    value: String(prod.id),
                    label: prod.product_name,
                    sub: prod.product_number,
                  }))}
                  onChange={(val) => updateItem(item.id, "product_id", val)}
                />
                <input placeholder="Description..." value={item.name} disabled={isView} style={inputSx(false)} onChange={(e) => updateItem(item.id, "name", e.target.value)} />
                <input type="number" placeholder="Qty" value={item.qty} disabled={isView} style={inputSx(false)} min="0" onChange={(e) => updateItem(item.id, "qty", Number(e.target.value))} />
                <input type="number" placeholder="Rate" value={item.price} disabled={isView} style={inputSx(false)} min="0" onChange={(e) => updateItem(item.id, "price", Number(e.target.value))} />
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827", textAlign: "right" }}>₹ {currency(item.total)}</div>
                {!isView ? (
                  <IconButton onClick={() => deleteItem(item.id)} size="small" sx={{ color: "#EF4444", "&:hover": { bgcolor: "#FEF2F2" } }}>
                    <Trash2 size={16} />
                  </IconButton>
                ) : <div />}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            {!isView && (
              <Button
                onClick={() => setFormData(prev => ({ ...prev, items: [...prev.items, { id: Date.now(), category: "Product", product_id: "", name: "", qty: 1, price: 0, total: 0 }] }))}
                startIcon={<Plus size={16} />}
                variant="contained"
                sx={{ 
                  bgcolor: "rgba(14, 165, 233, 0.9)", 
                  "&:hover": { bgcolor: "rgba(14, 165, 233, 1)" },
                  textTransform: "none",
                  borderRadius: "8px",
                  fontSize: 12,
                  fontWeight: 600,
                  width: "fit-content"
                }}
              >
                Add Part
              </Button>
            )}
          </div>
        </Box>
      </SectionCard>

      {/* Labour Services */}
      <SectionCard title="Labour Services" icon={Wrench}>
        <Box sx={{ overflowX: "auto", width: "100%", pb: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: "600px" }}>
            {/* Table Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 40px", gap: 12, padding: "0 4px", borderBottom: "1px solid #F3F4F6", paddingBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>Service Title</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", textAlign: "right" }}>Amount</span>
              <span></span>
            </div>
            {labour.map((lb) => (
              <div key={lb.id} style={{ display: "grid", gridTemplateColumns: "1fr 150px 40px", gap: 12, alignItems: "center" }}>
                <input placeholder="Labour Title..." value={lb.name} disabled={isView} style={inputSx(false)} onChange={(e) => updateItem(lb.id, "name", e.target.value)} />
                <input type="number" placeholder="Amount" value={lb.total} disabled={isView} style={{...inputSx(false), textAlign: "right"}} min="0" onChange={(e) => updateItem(lb.id, "total", Number(e.target.value))} />
                {!isView ? (
                  <IconButton onClick={() => deleteItem(lb.id)} size="small" sx={{ color: "#EF4444", "&:hover": { bgcolor: "#FEF2F2" } }}>
                    <Trash2 size={16} />
                  </IconButton>
                ) : <div />}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            {!isView && (
              <Button
                onClick={() => setFormData(prev => ({ ...prev, items: [...prev.items, { id: Date.now(), category: "Service", name: "", qty: 1, price: 0, total: 0 }] }))}
                startIcon={<Plus size={16} />}
                variant="contained"
                sx={{ 
                  bgcolor: "rgba(14, 165, 233, 0.9)", 
                  "&:hover": { bgcolor: "rgba(14, 165, 233, 1)" },
                  textTransform: "none",
                  borderRadius: "8px",
                  fontSize: 12,
                  fontWeight: 600,
                  width: "fit-content"
                }}
              >
                Add Labour
              </Button>
            )}
          </div>
        </Box>
      </SectionCard>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 400px" }, gap: { xs: 2, md: 3 }, alignItems: "stretch" }}>
        <div style={{ height: "100%" }}>
          <SectionCard title="Pricing Summary" icon={Wallet} style={{ height: "100%", marginBottom: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Discount Type</label>
                  <SearchableSelect
                    disabled={isView}
                    value={formData.discountType || "percent"}
                    placeholder="Discount Type"
                    options={[
                      { value: "percent", label: "Percentage (%)" },
                      { value: "amount", label: "Fixed Amount (₹)" },
                    ]}
                    onChange={(val) => setFormData(f => ({ ...f, discountType: val, discount: 0 }))}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Discount Value</label>
                  <input type="number" disabled={isView} value={formData.discount || 0} style={inputSx(false)} min="0" onChange={(e) => setFormData(f => ({ ...f, discount: Math.max(0, Number(e.target.value)) }))} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Payment Method</label>
                  <SearchableSelect
                    disabled={isView}
                    value={formData.paymentMethod}
                    placeholder="Select Method"
                    options={[
                      { value: "Cash", label: "Cash" },
                      { value: "Online", label: "Online Transfer" },
                      { value: "Card", label: "Card Payment" },
                      { value: "UPI", label: "UPI / GPay / PhonePe" },
                    ]}
                    onChange={(val) => setFormData(f => ({ ...f, paymentMethod: val }))}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Recieved Amount (₹)</label>
                  <input type="number" disabled={isView} value={formData.paidAmount} style={inputSx(false)} placeholder="Enter amount..." onChange={(e) => setFormData(f => ({ ...f, paidAmount: e.target.value }))} />
                </div>
              </div>

              <div 
                onClick={() => !isView && setFormData(f => ({ ...f, includeGST: !f.includeGST }))}
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 8, 
                  padding: "6px 14px", 
                  background: formData.includeGST ? "#EEF2FF" : "#F9FAFB", 
                  borderRadius: 10,
                  cursor: isView ? "default" : "pointer",
                  border: `1px solid ${formData.includeGST ? "#C7D2FE" : "#E5E7EB"}`,
                  width: "fit-content",
                  transition: "all 0.2s",
                  marginTop: 8,
                  flexWrap: "wrap"
                }}
              >
                <div style={{ color: formData.includeGST ? "#6366F1" : "#D1D5DB" }}>
                  {formData.includeGST ? <CheckCircle2 size={18} fill="#6366F1" color="#fff" /> : <Circle size={18} />}
                </div>
                <label style={{ fontSize: 13, fontWeight: 700, color: formData.includeGST ? "#312E81" : "#4B5563", cursor: "pointer" }}>Apply GST (18%)</label>
                 {formData.includeGST && (
                  <div onClick={(e) => e.stopPropagation()} style={{ marginLeft: 8 }}>
                     <input type="number" disabled={isView} value={formData.gst || 0} style={{ ...inputSx(false), width: 60, padding: "4px 8px", height: "auto" }} min="0" onChange={(e) => setFormData(f => ({ ...f, gst: Math.max(0, Number(e.target.value)) }))} />
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>

        <Box sx={{ background: "#1F2937", borderRadius: "20px", p: { xs: 3, md: 4 }, color: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
          <h4 style={{ margin: "0 0 24px 0", fontSize: 16, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em" }}>Invoice Summary</h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "#9CA3AF" }}>Parts Subtotal</span>
              <span style={{ fontWeight: 600 }}>₹ {currency(parts.reduce((s, it) => s + Number(it.total), 0))}</span>
            </div>
            
            {(formData.discountType === "percent" ? (parts.reduce((s, it) => s + Number(it.total), 0) * formData.discount) / 100 : Number(formData.discount)) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "#10B981" }}>Discount ({formData.discountType})</span>
                <span style={{ color: "#10B981", fontWeight: 600 }}>- ₹ {currency(formData.discountType === "percent" ? (parts.reduce((s, it) => s + Number(it.total), 0) * formData.discount) / 100 : Number(formData.discount))}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "#9CA3AF" }}>GST Amount</span>
              <span style={{ fontWeight: 600 }}>₹ {currency(formData.includeGST ? (formData.subtotal * formData.gst) / 100 : 0)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "#9CA3AF" }}>Labour Total</span>
              <span style={{ fontWeight: 600 }}>₹ {currency(labourTotal)}</span>
            </div>

            <div style={{ height: "1px", background: "rgba(255,255,255,0.1)", margin: "8px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>Total Payable</span>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: "#0EA5E9" }}>₹ {currency(formData.grandTotal)}</span>
              </div>
            </div>
          </div>
        </Box>
      </Box>

      {/* Footer Action */}
      {!isView && (
        <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ 
              borderRadius: "12px", 
              textTransform: "none", 
              fontWeight: 700, 
              fontSize: 15,
              px: 6, 
              py: 1.5,
              bgcolor: "rgba(14, 165, 233, 0.9)", 
              boxShadow: "0 4px 6px -1px rgba(14, 165, 233, 0.2)",
              "&:hover": { bgcolor: "rgba(14, 165, 233, 1)" }
            }}
          >
            Save Invoice
          </Button>
        </Box>
      )}

    </Box>
  );
}