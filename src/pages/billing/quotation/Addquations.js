// AddQuotation.js
import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Stack,
  Checkbox,
  Select,
  InputLabel,
  FormControl,
  Divider as MuiDivider,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PreviewIcon from "@mui/icons-material/Visibility";
import SaveAltIcon from "@mui/icons-material/CloudDownload";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ArrowBackIcon from "@mui/icons-material/ArrowBackRounded";
import { printQuotation } from "./QuotationPrint";
import apiEndpoints from "../../../apiconfig";

/* utility */
const currency = (v) =>
  Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const makeEmptyItem = (defaults = {}) => ({
  id: Date.now() + Math.random(),
  category: "Product",
  product: "",
  qty: 1,
  rate: 0,
  discountPct: 0,
  amount: 0,
  ...defaults,
});

export default function AddQuotation() {
  const { quotation_guid: routeGuid } = useParams(); // will be undefined for create
  const location = useLocation();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  // Detect mode from path + param
  const isViewMode = Boolean(
    routeGuid && location.pathname.includes("view-quotation")
  );
  const isEditMode = Boolean(
    routeGuid && location.pathname.includes("edit-quotation")
  );
  const isCreateMode = !routeGuid;
  const [jobCards, setJobCards] = useState([]);

  // From jobcard (when navigated from job card)
  const fromJob = location.state?.job_guid || null;
  const fromJobNo = location.state?.jobcardNo || null;

  const [loading, setLoading] = useState(Boolean(routeGuid)); // load when fetching quotation
  const [working, setWorking] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const showSnack = (msg, sev = "success") =>
    setSnack({ open: true, message: msg, severity: sev });
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const [form, setForm] = useState({
    quotation_no: "", // keep original number on edit
    quotationDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    job_guid: fromJob || "",
    jobcardNo: fromJobNo || "",
    customer_guid: "",
    vehicle_guid: "",
    items: [makeEmptyItem()],
    applyDiscount: false,
    discountType: "percent",
    discountValue: 0,
    includeGST: true,
    gstRate: 18,
    notes: "",
    status: "Approval Pending",
  });

  const [totals, setTotals] = useState({
    productTotal: 0,
    subtotal: 0,
    discountAmount: 0,
    gstAmount: 0,
    grandTotal: 0,
  });

  // safe parse helper
  const safeParse = (v, fallback = []) => {
    if (!v) return fallback;
    if (typeof v !== "string") return v;
    try {
      return JSON.parse(v);
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    const fetchJobCards = async () => {
      try {
        const res = await fetch(apiEndpoints.JobCard, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setJobCards(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetch job cards error", err);
      }
    };

    fetchJobCards();
  }, [token]);



  // Load job card if navigated from job card (create mode)
  useEffect(() => {
    if (!fromJob) return;
    const fetchJobCard = async () => {
      try {
        const res = await fetch(apiEndpoints.JobCard + "?job_guid=" + fromJob, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) return;

        const partsArr = safeParse(row.parts, []);
        const labourArr = safeParse(row.labour, []);
        const totalsData = safeParse(row.totals, {});

        const items = [
          ...(partsArr || []).map((p) => ({
            id: Date.now() + Math.random(),
            category: "Product",
            product: p.name || p.product || "",
            qty: Number(p.qty || 1),
            rate: Number(p.rate || 0),
            discountPct: Number(p.discount || 0),
            amount: Number(p.amount || 0),
          })),
          ...(labourArr || []).map((l) => ({
            id: Date.now() + Math.random(),
            category: "Service",
            product: l.title || l.name || "",
            qty: 1,
            rate: Number(l.amount || l.rate || 0),
            discountPct: 0,
            amount: Number(l.amount || 0),
          })),
        ];

        setForm((f) => ({
          ...f,
          job_guid: row.job_guid,
          jobcardNo: row.jobcardNo,
          customer_guid: row.customer_guid || "",
          vehicle_guid: row.vehicle_guid || "",
          items: items.length ? items : f.items,
          applyDiscount: totalsData.discountAmount > 0,
          discountType: totalsData.discountType || "percent",
          discountValue: totalsData.discountValue || 0,
          includeGST: totalsData.includeGST ?? true,
          gstRate: totalsData.gstRate || 18,
        }));
      } catch (err) {
        console.error("fetch job card", err);
      }
    };
    fetchJobCard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromJob]);

  // Load quotation for edit / view
  useEffect(() => {
    if (!routeGuid) return;
    const fetchQuotation = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          apiEndpoints.Quotation + "?quotation_guid=" + routeGuid,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!data) {
          showSnack("Quotation not found", "error");
          setLoading(false);
          return;
        }

        // backend returns parts/labour/totals as JSON strings
        const parts = safeParse(data.parts, []);
        const labour = safeParse(data.labour, []);
        const totalsData = safeParse(data.totals, {});

        // map to UI items
        const items = [
          ...(parts || []).map((p) => ({
            id: Date.now() + Math.random(),
            category: "Product",
            product: p.name || p.product || "",
            qty: Number(p.qty || 1),
            rate: Number(p.rate || 0),
            discountPct: Number(p.discount || 0),
            amount: Number(p.amount || 0),
          })),
          ...(labour || []).map((l) => ({
            id: Date.now() + Math.random(),
            category: "Service",
            product: l.title || l.name || "",
            qty: 1,
            rate: Number(l.amount || l.rate || 0),
            discountPct: 0,
            amount: Number(l.amount || 0),
          })),
        ];

        setForm((f) => ({
          ...f,
          quotation_no: data.quotation_no || "",
          quotationDate:
            (data.created_on || "").slice(0, 10) || f.quotationDate,
          expiryDate: data.expiry_date || f.expiryDate,
          jobcardNo: data.jobcardNo || f.jobcardNo,
          job_guid: data.job_guid || f.job_guid,
          customer_guid: data.customer_guid || f.customer_guid,
          vehicle_guid: data.vehicle_guid || f.vehicle_guid,
          items: items.length ? items : f.items,
          applyDiscount: totalsData.discountAmount > 0,
          discountType: totalsData.discountType || "percent",
          discountValue: totalsData.discountValue || 0,
          includeGST: totalsData.includeGST ?? true,
          gstRate: totalsData.gstRate || 18,
          notes: data.notes || "",
          status: data.status || f.status,
        }));
      } catch (err) {
        console.error("fetch quotation", err);
        showSnack("Failed to load quotation", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeGuid]);

  // totals calculation (derived)
  useEffect(() => {
    const itemsWithAmount = form.items.map((it) => {
      const qty = Number(it.qty || 0);
      const rate = Number(it.rate || 0);
      const disc = Number(it.discountPct || 0);
      const base = qty * rate;
      const discounted = disc > 0 ? base - (base * disc) / 100 : base;
      return { ...it, amount: Number(discounted) };
    });

    const parts = itemsWithAmount.filter((x) => x.category === "Product");
    const labour = itemsWithAmount.filter((x) => x.category === "Service");

    const productTotal = parts.reduce((s, it) => s + Number(it.amount || 0), 0);
    const labourTotal = labour.reduce((s, it) => s + Number(it.amount || 0), 0);

    let discountAmount = 0;
    if (form.applyDiscount) {
      if (form.discountType === "percent") {
        discountAmount = (productTotal * Number(form.discountValue || 0)) / 100;
      } else {
        discountAmount = Number(form.discountValue || 0);
      }
    }

    const subtotal = productTotal - discountAmount;

    const gstAmount = form.includeGST
      ? (subtotal * Number(form.gstRate || 0)) / 100
      : 0;

    const grandTotal = Math.round(subtotal + gstAmount + labourTotal);

    setTotals({
      productTotal,
      subtotal,
      discountAmount,
      gstAmount,
      grandTotal,
    });
  }, [
    JSON.stringify(form.items),
    form.applyDiscount,
    form.discountType,
    form.discountValue,
    form.includeGST,
    form.gstRate,
  ]);


  // CRUD helpers
  const addItem = () =>
    setForm((f) => ({ ...f, items: [...(f.items || []), makeEmptyItem()] }));
  const removeItem = (id) =>
    setForm((f) => ({ ...f, items: f.items.filter((i) => i.id !== id) }));
  const updateItem = (id, key, val) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((i) => {
        if (i.id === id) {
          const updated = { ...i, [key]: val };
          // Recalculate amount if qty, rate, or discountPct changed
          const qty = Number(updated.qty || 0);
          const rate = Number(updated.rate || 0);
          const disc = Number(updated.discountPct || 0);
          const base = qty * rate;
          const discounted = disc > 0 ? base - (base * disc) / 100 : base;
          updated.amount = Number(discounted);
          return updated;
        }
        return i;
      }),
    }));

  // Validate before save
  const validateBeforeSave = () => {
    if (!form.job_guid) {
      showSnack("Job card is required (link a job card).", "error");
      return false;
    }
    // additional validations can be added
    return true;
  };

  // Build parts & labour arrays to send to backend
  const buildPartsLabour = () => {
    const parts = (form.items || [])
      .filter((it) => it.category === "Product")
      .map((p) => ({
        name: p.product,
        qty: Number(p.qty || 0),
        rate: Number(p.rate || 0),
        discount: Number(p.discountPct || 0),
        amount: Number(p.amount || 0),
      }));
    const labour = (form.items || [])
      .filter((it) => it.category === "Service")
      .map((l) => ({
        title: l.product,
        hours: Number(l.qty || 1),
        rate: Number(l.rate || 0),
        amount: Number(l.amount || 0),
      }));

    const totalsPayload = {
      partsTotal: totals.productTotal,
      subtotal: totals.subtotal,
      discountType: form.discountType,
      discountValue: Number(form.discountValue || 0),
      discountAmount: totals.discountAmount,
      gstRate: Number(form.gstRate || 0),
      includeGST: Boolean(form.includeGST),
      gst: totals.gstAmount,
      grandTotal: totals.grandTotal,
      itemsCount: (parts?.length || 0) + (labour?.length || 0),
    };

    return { parts, labour, totalsPayload };
  };

  const applyJobCardToForm = (row) => {
    const partsArr = safeParse(row.parts, []);
    const labourArr = safeParse(row.labour, []);
    const totalsData = safeParse(row.totals, {});

    const items = [
      ...(partsArr || []).map((p) => {
        const qty = Number(p.qty || 1);
        const rate = Number(p.rate || 0);
        const disc = Number(p.discount || p.discountPct || 0);
        const base = qty * rate;
        const amount = disc > 0 ? base - (base * disc) / 100 : base;
        return {
          id: Date.now() + Math.random(),
          category: "Product",
          product: p.name || p.product || "",
          qty,
          rate,
          discountPct: disc,
          amount: Number(p.amount || amount),
        };
      }),
      ...(labourArr || []).map((l) => {
        const qty = 1;
        const rate = Number(l.amount || l.rate || 0);
        const disc = 0;
        const amount = rate;
        return {
          id: Date.now() + Math.random(),
          category: "Service",
          product: l.title || l.name || "",
          qty,
          rate,
          discountPct: disc,
          amount: Number(l.amount || amount),
        };
      }),
    ];

    setForm((f) => ({
      ...f,
      job_guid: row.job_guid,
      jobcardNo: row.jobcardNo,
      customer_guid: row.customer_guid || "",
      vehicle_guid: row.vehicle_guid || "",
      items: items.length ? items : f.items,
      applyDiscount: totalsData.discountAmount > 0,
      discountType: totalsData.discountType || "percent",
      discountValue: totalsData.discountValue || 0,
      includeGST: totalsData.includeGST ?? true,
      gstRate: totalsData.gstRate || 18,
    }));
  };

  const handleJobCardChange = async (job_guid) => {
    console.log("JOB SELECTED:", job_guid);

    try {
      const resCheck = await fetch(
        apiEndpoints.Quotation + "?job_guid=" + job_guid,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const existing = await resCheck.json();
      console.log("EXISTING QUOTATION:", existing);

      if (existing?.quotation_guid) {
        console.log("REDIRECTING TO EDIT:", existing.quotation_guid);
        navigate("/edit-quotation/" + existing.quotation_guid);
        return;
      }

      console.log("NO QUOTATION FOUND — FETCHING JOB CARD");

      const res = await fetch(apiEndpoints.JobCard + "?job_guid=" + job_guid, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      const row = Array.isArray(data) ? data[0] : data;

      if (row) applyJobCardToForm(row);
    } catch (err) {
      console.error("job card change error", err);
    }
  };


  const checkQuotationExists = async (job_guid) => {
    const res = await fetch(apiEndpoints.Quotation + "?job_guid=" + job_guid, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json(); // { quotation_guid } OR {}
  };


  // Save handler (create or edit)
  const handleSave = async () => {
    if (isViewMode) return;
    if (!validateBeforeSave()) return;

    setWorking(true);
    try {
      const { parts, labour, totalsPayload } = buildPartsLabour();

      // Prepare quotation form data
      const qForm = new FormData();
      // if creating, we let backend generate quotation_no
      qForm.append("job_guid", form.job_guid);
      qForm.append("customer_guid", form.customer_guid || "");
      qForm.append("vehicle_guid", form.vehicle_guid || "");
      qForm.append("parts", JSON.stringify(parts));
      qForm.append("labour", JSON.stringify(labour));
      qForm.append("totals", JSON.stringify(totalsPayload));
      qForm.append("notes", form.notes || "");
      qForm.append("status", form.status || "Approval Pending");

      let qRes, qData;

      if (isCreateMode) {
        // create new quotation
        qRes = await fetch(apiEndpoints.Quotation, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: qForm,
        });
        qData = await qRes.json();
        if (!qData || qData.success !== true) {
          showSnack(qData?.message || "Failed to create quotation", "error");
          setWorking(false);
          return;
        }
        if (qData.mode === "edit" && qData.quotation_guid) {
          navigate("/edit-quotation/" + qData.quotation_guid);
          return;
        }
      } else {
        // EDIT existing - do NOT change quotation_no. Send update to existing GUID.
        const editForm = new FormData();
        editForm.append("parts", JSON.stringify(parts));
        editForm.append("labour", JSON.stringify(labour));
        editForm.append("totals", JSON.stringify(totalsPayload));
        editForm.append("notes", form.notes || "");
        editForm.append("status", form.status || "Approval Pending");

        qRes = await fetch(
          apiEndpoints.Quotation +
          "?quotation_guid=" +
          encodeURIComponent(routeGuid),
          {
            method: "POST", // backend accepts POST + GUID to update
            headers: { Authorization: `Bearer ${token}` },
            body: editForm,
          }
        );
        qData = await qRes.json();
        if (!qData || qData.success !== true) {
          showSnack(qData?.message || "Failed to update quotation", "error");
          setWorking(false);
          return;
        }
      }

      // Update job card with new parts/labour/totals (PUT via _method)
      const jcForm = new FormData();
      jcForm.append("_method", "PUT");
      jcForm.append("parts", JSON.stringify(parts));
      jcForm.append("labour", JSON.stringify(labour));
      jcForm.append("totals", JSON.stringify(totalsPayload));
      jcForm.append("notes", form.notes || "");

      await fetch(
        apiEndpoints.JobCard + "?job_guid=" + encodeURIComponent(form.job_guid),
        {
          method: "POST", // using _method=PUT
          headers: { Authorization: `Bearer ${token}` },
          body: jcForm,
        }
      );

      showSnack(
        isCreateMode ? "Quotation created" : "Quotation updated",
        "success"
      );
      navigate("/quotations");
    } catch (err) {
      console.error("save error", err);
      showSnack("Unexpected error: " + (err.message || err), "error");
    } finally {
      setWorking(false);
    }
  };

  // Cancel/back
  const handleCancel = () => navigate("/quotations");
  function convertFormToBackendFormat() {
    const safeParts = form.items
      .filter((i) => i.category === "Product")
      .map((p) => ({
        name: p.product,
        qty: p.qty,
        rate: p.rate,
        discount: p.discountPct,
        amount: p.amount,
      }));

    const safeLabour = form.items
      .filter((i) => i.category === "Service")
      .map((l) => ({
        title: l.product,
        hours: 1,
        rate: l.rate,
        amount: l.amount,
      }));

    const totalsPayload = {
      partsTotal: totals.productTotal,
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      discountType: form.discountType,
      discountValue: form.discountValue,
      gstRate: form.gstRate,
      includeGST: form.includeGST,
      gstAmount: totals.gstAmount,
      grandTotal: totals.grandTotal,
    };

    return {
      quotation_no: form.quotation_no || "N/A",
      created_on: form.quotationDate,
      expiryDate: form.expiryDate,
      customer_name: form.customer_name,
      customer: {}, // leave empty (or fetch if needed)
      parts: safeParts,
      labour: safeLabour,
      totals: totalsPayload,
      items: [...safeParts, ...safeLabour],
      notes: form.notes,
      status: form.status,
    };
  }

  // Print / PDF
  const handlePrint = async () => {
    // If editing an existing quotation → fetch full data
    if (routeGuid) {
      const full = await fetch(
        apiEndpoints.Quotation + "?quotation_guid=" + routeGuid,
        { headers: { Authorization: `Bearer ${token}` } }
      ).then((res) => res.json());

      const data = Array.isArray(full) ? full[0] : full;
      printQuotation(data);
      return;
    }

    // If creating → convert AddQuotation form into backend-like structure
    const payload = convertFormToBackendFormat();
    printQuotation(payload);
  };

  const handlePdf = handlePrint; // same function, browser can save as PDF

  // Memoized values
  const itemsCount = useMemo(() => (form.items || []).length, [form.items]);

  // Loading UI for fetching quotation
  if (loading) {
    return (
      <Box p={3} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  // Form disabled when view mode
  const readOnly = isViewMode;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }} width={"100%"}>
      {/* HEADER */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <IconButton
              onClick={() => navigate(-1)}
              size="small"
              sx={{
                mr: 0,
                color: "rgba(249, 115, 22, 0.9)",
                "&:hover": {
                  backgroundColor: "rgba(249, 115, 22, 0.08)",
                },
                "&.Mui-disabled": {
                  color: "rgba(249, 115, 22, 0.4)",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ mr: 1 }}>
              {isCreateMode
                ? "Create Quotation"
                : isViewMode
                  ? "View Quotation"
                  : "Edit Quotation"}
            </Typography>
            {form.quotation_no && (
              <Typography
                sx={{ ml: { xs: 0, sm: 2 }, color: "text.secondary" }}
              >
                No: {form.quotation_no}
              </Typography>
            )}
            {form.jobcardNo && (
              <Typography
                sx={{ ml: { xs: 0, sm: 2 }, color: "text.secondary" }}
              >
                Job: {form.jobcardNo}
              </Typography>
            )}
          </Stack>

          {/* <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            width={{ xs: "100%", sm: "auto" }}
            alignItems="center"
          >
            <Button
              startIcon={<PreviewIcon />}
              variant="outlined"
              disabled
              fullWidth={{ xs: true, sm: false }}
              sx={{ whiteSpace: "nowrap" }}
            >
              Preview
            </Button>

            <Button
              startIcon={<PrintIcon />}
              variant="outlined"
              onClick={handlePrint}
              fullWidth={{ xs: true, sm: false }}
              sx={{ whiteSpace: "nowrap" }}
            >
              Print
            </Button>

            <Button
              startIcon={<PictureAsPdfIcon />}
              variant="outlined"
              onClick={handlePdf}
              fullWidth={{ xs: true, sm: false }}
              sx={{ whiteSpace: "nowrap" }}
            >
              PDF
            </Button>

            {!isViewMode && (
              <Button
                variant="text"
                onClick={handleCancel}
                fullWidth={{ xs: true, sm: false }}
                sx={{ whiteSpace: "nowrap" }}
              >
                Cancel
              </Button>
            )}

            {!isViewMode && (
              <Button
                variant="contained"
                startIcon={
                  working ? <CircularProgress color="inherit" size={18} /> : <SaveAltIcon />
                }
                onClick={handleSave}
                disabled={working}
                fullWidth={{ xs: true, sm: false }}
              >
                {working ? (
                  "Saving..."
                ) : isCreateMode ? (
                  "Save & Continue"
                ) : (
                  "Save Changes"
                )}
              </Button>
            )}
          </Stack> */}
        </Stack>
      </Paper>

      <Grid container spacing={2} width={"100%"}>
        {/* LEFT */}
        <Grid item xs={12} md={8} width={"100%"}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4} width={{ xs: "100%", sm: "auto" }}>
                <TextField
                  label="Quotation Date"
                  type="date"
                  size="small"
                  fullWidth
                  value={form.quotationDate}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, quotationDate: e.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly }}
                />
              </Grid>

              <Grid item xs={12} sm={4} width={{ xs: "100%", sm: "auto" }}>
                <TextField
                  label="Expiry Date"
                  type="date"
                  size="small"
                  fullWidth
                  value={form.expiryDate}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, expiryDate: e.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                  InputProps={{ readOnly }}
                />
              </Grid>

              <Grid item xs={12} sm={4} width={{ xs: "100%", sm: "auto" }}>
                <FormControl
                  sx={{ width: { xs: "100%", sm: 220 } }}
                  size="small"
                >
                  <InputLabel>Job Card</InputLabel>
                  <Select
                    label="Job Card"
                    value={form.job_guid}
                    disabled={readOnly}
                    onChange={(e) => handleJobCardChange(e.target.value)}
                  >
                    {jobCards.map((jc) => (
                      <MenuItem key={jc.job_guid} value={jc.job_guid}>
                        {jc.jobcardNo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* ITEMS */}
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontWeight: 700 }}>Items</Typography>

              <Box
                sx={{
                  overflowX: { xs: "auto", sm: "auto" },
                  whiteSpace: "nowrap",
                  borderRadius: 2,
                  p: 1.5,
                  mb: 2,
                }}
              >
                {(form.items || [])
                  .filter((it) => it.category === "Product")
                  .map((it) => (
                    <Box
                      key={it.id}
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                        gap: 2,
                        p: 2,
                        mb: 1.5,
                        border: "1px solid #e5e5e5",
                        borderRadius: 2,
                        background: "#fafafa",
                        minWidth: { xs: "100%", sm: "700px" },
                      }}
                    >
                      <FormControl
                        size="small"
                        sx={{ width: { xs: "100%", sm: 130 } }}
                      >
                        <InputLabel>Category</InputLabel>
                        <Select
                          label="Category"
                          value={it.category}
                          onChange={(e) =>
                            updateItem(it.id, "category", e.target.value)
                          }
                          disabled={readOnly}
                        >
                          <MenuItem value="Product">Product</MenuItem>
                          <MenuItem value="Service">Service</MenuItem>
                        </Select>
                      </FormControl>

                      <TextField
                        label="Item"
                        size="small"
                        sx={{ width: { xs: "100%", sm: 200 } }}
                        value={it.product}
                        onChange={(e) =>
                          updateItem(it.id, "product", e.target.value)
                        }
                        InputProps={{ readOnly }}
                      />

                      <TextField
                        label="Qty"
                        size="small"
                        type="number"
                        sx={{ width: { xs: "100%", sm: 90 } }}
                        value={it.qty}
                        onChange={(e) =>
                          updateItem(it.id, "qty", Number(e.target.value))
                        }
                        InputProps={{ readOnly }}
                      />

                      <TextField
                        label="Rate"
                        size="small"
                        type="number"
                        sx={{ width: { xs: "100%", sm: 110 } }}
                        value={it.rate}
                        onChange={(e) =>
                          updateItem(it.id, "rate", Number(e.target.value))
                        }
                        InputProps={{ readOnly }}
                      />

                      <TextField
                        label="Amount"
                        size="small"
                        sx={{ width: { xs: "100%", sm: 140 } }}
                        value={currency(it.amount)}
                        InputProps={{ readOnly: true }}
                      />

                      {!readOnly && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeItem(it.id)}
                          sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  ))}
              </Box>

              {!readOnly && (
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  sx={{
                    mt: 2,
                    backgroundColor: "rgba(249, 115, 22, 0.9)",
                    "&:hover": {
                      backgroundColor: "rgba(249, 115, 22, 1)",
                    },
                    color: "#fff",
                    textTransform: "none",
                  }}
                  onClick={addItem}
                >
                  Add Item
                </Button>
              )}

              <Box sx={{ mt: 4 }}>
                <Typography sx={{ fontWeight: 700 }}>Labour Charges</Typography>

                {(form.items || [])
                  .filter((l) => l.category === "Service")
                  .map((lb) => (
                    <Box
                      key={lb.id}
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "flex-start",
                        gap: 2,
                        p: 2,
                        mb: 1.5,
                        border: "1px solid #e5e5e5",
                        borderRadius: 2,
                        background: "#fffbea",
                        minWidth: { xs: "100%", sm: "600px" },
                      }}
                    >
                      <TextField
                        label="Labour Title"
                        size="small"
                        sx={{ width: { xs: "100%", sm: 220 } }}
                        value={lb.product}
                        onChange={(e) =>
                          updateItem(lb.id, "product", e.target.value)
                        }
                        InputProps={{ readOnly }}
                      />

                      <TextField
                        label="Rate"
                        size="small"
                        type="number"
                        sx={{ width: { xs: "100%", sm: 120 } }}
                        value={lb.rate}
                        onChange={(e) =>
                          updateItem(lb.id, "rate", Number(e.target.value))
                        }
                        InputProps={{ readOnly }}
                      />

                      <TextField
                        label="Amount"
                        size="small"
                        sx={{ width: { xs: "100%", sm: 140 } }}
                        value={currency(lb.amount)}
                        InputProps={{ readOnly: true }}
                      />

                      {!readOnly && (
                        <IconButton
                          color="error"
                          onClick={() => removeItem(lb.id)}
                          sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>
                  ))}

                {!readOnly && (
                  <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    sx={{
                      mt: 2,
                      backgroundColor: "rgba(249, 115, 22, 0.9)",
                      "&:hover": {
                        backgroundColor: "rgba(249, 115, 22, 1)",
                      },
                      color: "#fff",
                      textTransform: "none",
                    }}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        items: [...f.items, makeEmptyItem({ category: "Service" })],
                      }))
                    }
                  >
                    Add Labour
                  </Button>
                )}
              </Box>

              <Typography sx={{ fontWeight: 700, mt: 3 }}>Notes</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={form.notes}
                onChange={(e) =>
                  setForm((s) => ({ ...s, notes: e.target.value }))
                }
                sx={{ mt: 1 }}
                InputProps={{ readOnly }}
              />
            </Box>

            {/* RIGHT */}
            <Grid item xs={12} md={4} width={"100%"} mt={2}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Pricing
              </Typography>

              {/* TWO COLUMNS inside right card */}
              <Grid
                container
                spacing={2}
                justifyContent="space-between"
                alignItems="flex-start"
              >
                {/* editable fields */}
                <Grid item xs={12} sm={4} width={{ xs: "100%", sm: "auto" }}>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Checkbox
                        checked={form.applyDiscount}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            applyDiscount: e.target.checked,
                          }))
                        }
                        sx={{
                          color: "rgba(249, 115, 22, 0.9)",
                          "&.Mui-checked": {
                            color: "rgba(249, 115, 22, 0.9)",
                          },
                          "&.Mui-disabled": {
                            color: "rgba(249, 115, 22, 0.4)",
                          },
                        }}
                        disabled={readOnly}
                      />
                      <Typography>Apply Discount</Typography>
                    </Stack>

                    <FormControl fullWidth size="small">
                      <InputLabel>Discount Type</InputLabel>
                      <Select
                        label="Discount Type"
                        value={form.discountType}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            discountType: e.target.value,
                          }))
                        }
                        disabled={!form.applyDiscount || readOnly}
                      >
                        <MenuItem value="percent">Percent</MenuItem>
                        <MenuItem value="amount">Amount</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      size="small"
                      type="number"
                      label="Discount Value"
                      fullWidth
                      value={form.discountValue}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          discountValue: Number(e.target.value),
                        }))
                      }
                      disabled={!form.applyDiscount || readOnly}
                    />

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Checkbox
                        checked={form.includeGST}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            includeGST: e.target.checked,
                          }))
                        }
                        sx={{
                          color: "rgba(249, 115, 22, 0.9)",
                          "&.Mui-checked": {
                            color: "rgba(249, 115, 22, 0.9)",
                          },
                          "&.Mui-disabled": {
                            color: "rgba(249, 115, 22, 0.4)",
                          },
                        }}
                        disabled={readOnly}
                      />
                      <Typography>Include GST</Typography>
                    </Stack>

                    <TextField
                      size="small"
                      type="number"
                      label="GST %"
                      fullWidth
                      value={form.gstRate}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          gstRate: Number(e.target.value),
                        }))
                      }
                      disabled={!form.includeGST || readOnly}
                    />
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        label="Status"
                        value={form.status}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, status: e.target.value }))
                        }
                        disabled={readOnly}
                      >
                        <MenuItem value="Approval Pending">
                          Approval Pending
                        </MenuItem>
                        <MenuItem value="Work In Progress">
                          Work In Progress
                        </MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Delivered">Delivered</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grid>

                {/* summary */}
                <Grid item xs={12} sm={6} width={{ xs: "100%", sm: "auto" }}>
                  <Stack spacing={1.5}>
                    {/* Product Total */}
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Product Total</Typography>
                      <Typography variant="h6">
                        ₹ {currency(totals.productTotal)}
                      </Typography>
                    </Stack>

                    {/* Discount */}
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Discount</Typography>
                      <Typography>
                        - ₹ {currency(totals.discountAmount)}
                      </Typography>
                    </Stack>

                    {/* GST */}
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">
                        GST ({form.gstRate}%)
                      </Typography>
                      <Typography>₹ {currency(totals.gstAmount)}</Typography>
                    </Stack>

                    {/* Labour Charges */}
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Labour Charges</Typography>
                      <Typography>
                        ₹{" "}
                        {currency(
                          (form.items || [])
                            .filter((i) => i.category === "Service")
                            .reduce((s, l) => s + Number(l.amount || 0), 0)
                        )}
                      </Typography>
                    </Stack>

                    <MuiDivider sx={{ my: 1 }} />

                    {/* Grand Total */}
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6" fontWeight={700}>
                        Grand Total (Rounded)
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        ₹ {currency(totals.grandTotal)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>

              {/* status only editable when not view */}
              {/* <Box sx={{ mt: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={form.status}
                    onChange={(e) => setForm((s) => ({ ...s, status: e.target.value }))}
                    disabled={readOnly}
                  >
                    <MenuItem value="Approval Pending">Approval Pending</MenuItem>
                    <MenuItem value="Work In Progress">Work In Progress</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Delivered">Delivered</MenuItem>
                  </Select>
                </FormControl>
              </Box> */}

              {/* action buttons stretched */}
              <Stack
                spacing={1.5}
                sx={{ mt: 2 }}
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
              >
                {!isViewMode && (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSave}
                    disabled={working}
                    sx={{
                      backgroundColor: "rgba(249, 115, 22, 0.9)",
                      "&:hover": {
                        backgroundColor: "rgba(249, 115, 22, 1)",
                      },
                      color: "#fff",
                      textTransform: "none",
                      "&.Mui-disabled": {
                        backgroundColor: "rgba(249, 115, 22, 0.4)",
                        color: "#fff",
                      },
                    }}
                  >
                    {working
                      ? "Saving..."
                      : isCreateMode
                        ? "Save & Continue"
                        : "Save Changes"}
                  </Button>
                )}

                <Button
                  variant="text"
                  fullWidth
                  onClick={handleCancel}
                  disabled={working}
                  sx={{
                    color: "rgba(249, 115, 22, 0.9)",
                    textTransform: "none",
                    "&:hover": {
                      backgroundColor: "rgba(249, 115, 22, 0.08)",
                    },
                    "&.Mui-disabled": {
                      color: "rgba(249, 115, 22, 0.4)",
                    },
                  }}
                >
                  Cancel
                </Button>

                {/* <Button variant="outlined" fullWidth onClick={handlePrint}>
                  Print
                </Button> */}

                {/* <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<SaveAltIcon />}
                  onClick={handlePdf}
                >
                  Save as PDF
                </Button> */}
              </Stack>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={closeSnack}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}