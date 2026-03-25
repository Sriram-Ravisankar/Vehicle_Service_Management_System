// AddServiceForm.js
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Typography,
  Stack,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ClipboardList, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Edit2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check
} from "lucide-react";
import apiEndpoints from "../../apiconfig";
import Step1_ServiceDetails from "./Step1_ServiceDetails";
import Step2_PreInspection from "./Step2_PreInspection";
import Step3_PartsLabour from "./Step3_PartsLabour";

// ── tiny helpers (consistent with other premium pages) ────────────────────────
const Field = ({ label, icon: Icon, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
      {Icon && <Icon size={14} style={{ color: "#0EA5E9" }} />}
      {label}
    </label>
    {children}
    {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
  </div>
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

const SectionCard = ({ title, children, icon: Icon }) => (
  <Box sx={{
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #F3F4F6",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    p: { xs: 2, md: 3 },
    mb: 3,
  }}>
    <div style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: 12, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
       {Icon && <Icon size={18} style={{ color: "#0EA5E9" }} />}
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h3>
    </div>
    {children}
  </Box>
);

/**
 * AddServiceForm
 *
 * Behavior:
 * - If location.state.guid exists and location.state.isEditing is NOT true => open in VIEW mode (read-only)
 * - Click Edit button to enable editing (toggle)
 * - If location.state.isEditing === true => open in EDIT mode
 * - If no guid => create mode (editable)
 *
 * Important:
 * - Backend GET returns an ARRAY even for single job card — we handle that and pick [0]
 * - Some DB columns may be JSON strings (inspection, parts, labour, totals, images, car_markers) — we parse them
 */

const steps = ["Service Details", "Pre-Inspection", "Parts & Labour"];
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

const buildFormDataForJobCard = (form) => {
  const fd = new FormData();

  // Basic fields
  fd.append("customer_guid", form.customer_guid || "");
  fd.append("vehicle_guid", form.vehicle_guid || "");
  fd.append("branch_id", form.branch_id || ""); // NEW: send branch
  fd.append("repair_category_id", form.repair_category_id || "");
  fd.append("service_type", form.service_type || "");
  fd.append("arrival_date", form.arrival_date || "");
  fd.append("estimate_date", form.estimate_date || "");
  fd.append("assign_to", form.assign_to || "");
  fd.append("notes", form.notes || "");
  fd.append("complaint", form.complaint || ""); // NEW: complaint

  // JSON fields (send as strings)
  fd.append("car_markers", JSON.stringify(form.car_markers || []));
  // Important: totals MUST include discount/gst metadata so backend stores them
  fd.append("totals", JSON.stringify(form.totals || {}));
  fd.append("parts", JSON.stringify(form.parts || []));
  fd.append("labour", JSON.stringify(form.labour || []));
  fd.append(
    "additional_options",
    JSON.stringify(form.additional_options || {})
  );

  // Images:

  // (form.images || []).forEach((img) => {
  //   if (img instanceof File) {
  //     fd.append("images[]", img, img.name);
  //   } else if (typeof img === "string") {
  //     // when backend returned simple array of filenames
  //     fd.append("existing_images[]", img);
  //   } else if (img && img.name) {
  //     // when we stored objects {name, url}
  //     fd.append("existing_images[]", img.name);
  //   }
  // });

  // // If user removed some images on frontend, send them to be removed
  // if (Array.isArray(form.remove_images) && form.remove_images.length > 0) {
  //   fd.append("remove_images", JSON.stringify(form.remove_images));
  // }

  // Send inspection JSON as string (backend will merge uploaded photos)
  fd.append("inspection", JSON.stringify(form.inspection || []));

  // For inspection photos, send file arrays keyed by inspection key:
  // Example: for each inspection item: fd.append(`inspection_photos[${item.key}][]`, file)
  (form.inspection || []).forEach((item) => {
    (item.photos || []).forEach((photo) => {
      if (photo instanceof File) {
        // append to grouped field for backend: inspection_photos[<key>][]
        fd.append(`inspection_photos[${item.key}][]`, photo, photo.name);
      }
      // if it's an existing filename string or object, it's already in inspection JSON
    });
  });

  return fd;
};


export default function AddServiceForm({
  initialData = null,
  onSaved = () => { },
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const routeState = location.state || {};
  const routeGuid = routeState.guid || null;
  // If route asked specifically for editing, we start editable
  const routeIsEditing = !!routeState.isEditing;
  const initialStepFromRoute = typeof routeState.initialStep === 'number' ? routeState.initialStep : 0;

  // Stepper & progress
  const [activeStep, setActiveStep] = useState(initialStepFromRoute);
  const [loading, setLoading] = useState(!!routeGuid); // if guid, fetching
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const step1Ref = useRef();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info", // success | error | warning | info
  });
  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const [openQuotationDialog, setOpenQuotationDialog] = useState(false);
  const [pendingQuotationAction, setPendingQuotationAction] = useState(null);



  // Editing/view control:
  // - if routeIsEditing true -> editable
  // - else if routeGuid provided -> view-only by default
  // - else no guid -> new create mode (editable)
  const [isEditing, setIsEditing] = useState(() => {
    if (routeGuid && !routeIsEditing) return false; // view-only
    return true; // either create or explicitly editing
  });

  // Combined form state
  const [form, setForm] = useState({
    // Step1
    customer_guid: "",
    customer_name: "",
    vehicle_guid: "",
    vehicle_name: "",
    repair_category_id: "",
    service_type: "Paid",
    arrival_date: new Date().toISOString().slice(0, 10),
    estimate_date: "",
    assign_to: "",
    additional_options: {},
    images: [],

    // Step2 (inspection)
    inspection: [],
    complaint: "",
    inspectionNotes: "",

    // Step3 (parts & labour)
    parts: [],
    labour: [],
    totals: {},

    // meta
    notes: "",
    job_guid: null,
    jobcardNo: null,
    createdOn: null,
  });

  // Utility: safely parse JSON fields
  const safeParse = (value) => {
    if (value === null || value === undefined || value === "") return null;
    if (typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      // sometimes not JSON — return original string
      return value;
    }
  };

  // Fetch job card if guid provided
  useEffect(() => {
    const fetchByGuid = async (guid) => {
      setLoading(true);
      setFetchError(null);
      try {
        const url = `${apiEndpoints.JobCard}?job_guid=${encodeURIComponent(
          guid
        )}`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });
        const data = await res.json();

        // backend returns an array — pick first item
        const row = Array.isArray(data) ? data[0] : data;

        if (!row) {
          throw new Error("Job card not found");
        }

        // Map row fields onto form. Parse JSON fields if stored as strings.
        const mapped = {
          // step1
          customer_guid: row.customer_guid || "",
          customer_name: row.customer_name || "",
          vehicle_guid: row.vehicle_guid || "",
          vehicle_name: row.vehicle_name && row.vehicle_name.trim() ? `${row.vehicle_name} - ${row.registration_number}` : (row.registration_number || ""),
          repair_category_id:
            row.repair_category_id || row.repair_category_id || "",
          service_type: row.service_type || "Paid",
          arrival_date: row.arrival_date
            ? row.arrival_date.split("T")[0]
            : row.arrival_date || "",
          estimate_date: row.estimate_date
            ? row.estimate_date.split("T")[0]
            : row.estimate_date || "",
          assign_to: row.assign_to || "",
          branch_id: row.branch_id || "",
          additional_options: safeParse(row.additional_options) || {},

          // inspection & complaint
          inspection: safeParse(row.inspection) || [],
          complaint: row.complaint || row.details || "",

          // parts & labour
          parts: safeParse(row.parts) || [],
          labour: safeParse(row.labour) || [],
          totals: safeParse(row.totals) || {},

          // images / notes
          images: safeParse(row.images) || [],
          notes: row.notes || "",

          // meta
          job_guid: row.job_guid,
          jobcardNo: row.jobcardNo || row.jobcardNo || null,
          createdOn: row.createdOn || row.createdOn || null,
          status: row.status || row.status || "Approval Pending",
        };

        setForm((f) => ({
          ...f,
          ...mapped,
          images: mapped.images || [],
          inspection: (mapped.inspection || []).map((it) => ({
            ...it,
            photos: it.photos || [],
          })),
        }));

      } catch (err) {
        console.error("Failed to fetch job card:", err);
        setFetchError(err.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    };

    if (routeGuid) fetchByGuid(routeGuid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeGuid]);

  // navigation helpers
  const handleNext = () =>
    setActiveStep((s) => Math.min(s + 1, steps.length - 1));
  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));


  const openQuotationForJob = async (job_guid, jobcardNo) => {
    try {
      // 1️⃣ Fetch latest job card
      const jcRes = await fetch(apiEndpoints.JobCard + "?job_guid=" + job_guid, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jcData = await jcRes.json();
      const job = Array.isArray(jcData) ? jcData[0] : jcData;

      // 2️⃣ Build quotation payload from job card
      const parts = (job.parts || []).map((p) => ({
        name: p.name || p.product,
        qty: p.qty,
        rate: p.rate,
        discount: p.discount || 0,
        amount: p.amount,
      }));

      const labour = (job.labour || []).map((l) => ({
        title: l.title || l.name,
        hours: l.hours || 1,
        rate: l.rate,
        amount: l.amount,
      }));

      const totals = job.totals || {};

      // 3️⃣ Check quotation
      const qRes = await fetch(apiEndpoints.Quotation + "?job_guid=" + job_guid, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const qData = await qRes.json();

      if (qData?.quotation_guid) {
        // 4️⃣ 🔥 UPDATE quotation with latest job card data


        // 5️⃣ Navigate AFTER sync
        navigate("/edit-quotation/" + qData.quotation_guid);
      } else {
        navigate("/add-quotation", {
          state: { job_guid, jobcardNo },
        });
      }
    } catch (err) {
      showSnackbar("Failed to open quotation", "error");
    }
  };


  const buildQuotationFromJobCard = (form) => {
    const parts = (form.parts || []).map((p) => ({
      product_id: p.product_id || "",
      name: p.name || p.product || "",
      qty: Number(p.qty || 0),
      rate: Number(p.rate || 0),
      discount: Number(p.discount || 0),
      amount: Number(p.amount || 0),
    }));

    const labour = (form.labour || []).map((l) => ({
      title: l.title || l.name || "",
      mechanic_guid: l.mechanic_guid || "",
      hours: Number(l.hours || 1),
      rate: Number(l.rate || 0),
      amount: Number(l.amount || 0),
    }));

    const totals = form.totals || {};

    return { parts, labour, totals };
  };


  // Save (create or update)
  const handleSave = async (goToQuotation = false) => {
    try {
      const fd = buildFormDataForJobCard(form);

      let url = apiEndpoints.JobCard;

      if (form.job_guid) {
        url = `${apiEndpoints.JobCard}?job_guid=${form.job_guid}`;
        fd.append("_method", "PUT"); // << required
      }


      const result = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });


      const data = await result.json();

      if (data.success) {
        showSnackbar("Job card saved successfully!", "success");
        if (!form.job_guid && data.job_guid) {
          // Only set on CREATE
          setForm((f) => ({
            ...f,
            job_guid: data.job_guid,
            jobcardNo: data.jobcardNo,
          }));
        }
      }
      if (data.success && goToQuotation) {
        const jobGuidToSend = form.job_guid || data.job_guid;
        const jobNoToSend = form.jobcardNo || data.jobcardNo;

        // 🔁 SYNC QUOTATION DATA FROM JOB CARD (LIKE ADD FLOW)
        const { parts, labour, totals } = buildQuotationFromJobCard(form);

        const qSyncForm = new FormData();
        qSyncForm.append("job_guid", jobGuidToSend);
        qSyncForm.append("parts", JSON.stringify(parts));
        qSyncForm.append("labour", JSON.stringify(labour));
        qSyncForm.append("totals", JSON.stringify(totals));
        qSyncForm.append("sync_from_job", "1"); // 🔑 REQUIRED

        await fetch(apiEndpoints.Quotation + "?job_guid=" + jobGuidToSend, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: qSyncForm,
        });

        // 🚀 NOW open correct quotation
        openQuotationForJob(jobGuidToSend, jobNoToSend);
      }



    } catch (err) {
      showSnackbar("Failed to save job card", "error");
    }
  };


  // Toggle editing (from view mode)
  const enableEdit = () => setIsEditing(true);
  const cancelEdit = () => {
    navigate("/services"); // Always go back to list
  };


  // Simple loading UI
  if (loading) {
    return (
      <Box p={3} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      px: { xs: 1, sm: 4, md: 6 }, 
      py: { xs: 2.5, sm: 4 },
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      <Box sx={{
        background: "#fff",
        borderRadius: "16px",
        p: { xs: 2, md: 3 },
        mb: 3,
        border: "1px solid #F3F4F6",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: "#F5F3FF",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <ClipboardList size={24} color="#0EA5E9" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>
              {form.jobcardNo ? `Job Card — ${form.jobcardNo}` : "Create Job Card"}
            </h1>
            {form.createdOn && (
              <p style={{ margin: 0, fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                Generated on {new Date(form.createdOn).toLocaleDateString()} at {new Date(form.createdOn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {routeGuid && !isEditing && (
            <Button
              variant="outlined"
              startIcon={<Edit2 size={16} />}
              onClick={enableEdit}
              sx={{
                borderRadius: "10px", borderColor: "#0EA5E9", color: "#0EA5E9",
                textTransform: "none", fontWeight: 600,
                "&:hover": { borderColor: "#7C3AED", bgcolor: "#F5F3FF" }
              }}
            >
              Edit Jobcard
            </Button>
          )}

          <Button
            onClick={cancelEdit}
            sx={{
              color: "#6B7280", textTransform: "none", fontWeight: 600, fontSize: 14,
              "&:hover": { color: "#111827", bgcolor: "transparent" }
            }}
          >
            Cancel
          </Button>
        </div>
      </Box>

      <Box sx={{
        background: "#fff",
        borderRadius: "16px",
        p: { xs: 2, md: 3 },
        border: "1px solid #F3F4F6",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        {/* Stepper */}
        <Box mb={2}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              // Active step circle
              "& .MuiStepIcon-root.Mui-active": {
                color: "rgba(14, 165, 233, 0.9)",
              },

              // Completed step circle
              "& .MuiStepIcon-root.Mui-completed": {
                color: "rgba(14, 165, 233, 0.9)",
              },

              // Step label text (active)
              "& .MuiStepLabel-label.Mui-active": {
                color: "rgba(14, 165, 233, 0.9)",
                fontWeight: 600,
              },

              // Step label text (completed)
              "& .MuiStepLabel-label.Mui-completed": {
                color: "rgba(14, 165, 233, 0.9)",
                fontWeight: 600,
              },

              // Connector line (active & completed)
              "& .MuiStepConnector-line": {
                borderColor: "rgba(14, 165, 233, 0.9)",
              },
            }}
          >
            {steps.map((s) => (
              <Step key={s}>
                <StepLabel>{s}</StepLabel>
              </Step>
            ))}
          </Stepper>

        </Box>

        {/* Render step components.
            We pass:
            - form / setForm (child components may still accept setForm; for view-only we rely on isEditing flag to prevent saves)
            - onNext: when not allowed to save (view-only) it will be a noop
            - isView: child can use it to disable inputs if implemented
        */}
        <Box>
          {activeStep === 0 && (
            <Step1_ServiceDetails
              ref={step1Ref}
              form={form}
              setForm={setForm}
              isSubmitting={isSubmitting}
              isView={!isEditing}
              showSnackbar={showSnackbar}
            />
          )}

          {activeStep === 1 && (
            <Step2_PreInspection
              form={form}
              setForm={setForm}
              showSnackbar={showSnackbar}
              onNext={() => {
                if (!isEditing && routeGuid) {
                  handleNext();
                  return;
                }
                handleNext();
              }}
              onBack={handleBack}
              isView={!isEditing}
            />
          )}

          {activeStep === 2 && (
            <Step3_PartsLabour
              form={form}
              setForm={setForm}
              showSnackbar={showSnackbar}
              onBack={handleBack}
              onSave={() => {
                if (!isEditing && routeGuid) {
                  // VIEW MODE → just go back to list
                  navigate("/services");
                  return;
                }

                // EDIT / CREATE MODE → save & go to quotation
                handleSave(true);
              }}
              isSubmitting={isSubmitting}
              isView={!isEditing}
            />
          )}
        </Box>

        {/* Bottom navigation for steps */}
        <div style={{
          marginTop: 32,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 0",
          borderTop: "1px solid #F3F4F6",
          background: "transparent"
        }}>
          <button
            disabled={activeStep === 0}
            onClick={handleBack}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              background: "#fff",
              color: activeStep === 0 ? "#9CA3AF" : "#374151",
              fontSize: 14,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: activeStep === 0 ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {activeStep < steps.length - 1 ? (
            <button
              onClick={() => {
                if (!isEditing && routeGuid) {
                  handleNext();
                  return;
                }
                if (activeStep === 0) {
                  const valid = step1Ref.current?.validate();
                  if (!valid) return;
                }
                handleSave(false);
                setTimeout(() => handleNext(), 200);
              }}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                border: "none",
                background: "#0EA5E9",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(14, 165, 233, 0.25)",
                transition: "all 0.2s"
              }}
            >
              Save & Continue
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              disabled={isSubmitting}
              onClick={() => {
                if (!isEditing && routeGuid) {
                  navigate("/services");
                  return;
                }
                setPendingQuotationAction(() => () => handleSave(true));
                setOpenQuotationDialog(true);
              }}
              style={{
                padding: "10px 28px",
                borderRadius: 10,
                border: "none",
                background: isSubmitting ? "#9CA3AF" : "#7C3AED",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: isSubmitting ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
                transition: "all 0.2s"
              }}
            >
              {isSubmitting ? (
                 <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                   Saving...
                 </span>
              ) : (
                <>
                  {routeGuid ? "Finish & Save" : "Create & Save"}
                  <Check size={18} />
                </>
              )}
            </button>
          )}
        </div>
      </Box>

      {fetchError && (
        <Box mt={2}>
          <Typography color="error">{fetchError}</Typography>
        </Box>
      )}

      <Box mt={2}>
        <Typography variant="caption" color="text.secondary">
          Note: Opened in {routeGuid ? (isEditing ? "Edit" : "View") : "Create"}{" "}
          mode.
        </Typography>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog
        open={openQuotationDialog}
        onClose={() => setOpenQuotationDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <Box p={3}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 1, textAlign: "center" }}
          >
            Proceed to Quotation?
          </Typography>

          <Typography
            sx={{ textAlign: "center", mb: 3, color: "text.secondary" }}
          >
            Do you want to create a quotation for this job card now?
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center">
            {/*  🚀 CANCEL → GO TO SERVICE LIST  */}
            <Button
              variant="outlined"
              onClick={() => {
                setOpenQuotationDialog(false);
                navigate("/services"); // <--- move to /services
              }}
              sx={{ textTransform: "none", minWidth: 100 }}
            >
              Cancel
            </Button>

            {/*  ✔ CONTINUE TO QUOTATION  */}
            <Button
              variant="contained"
              onClick={() => {
                setOpenQuotationDialog(false);
                pendingQuotationAction?.();
              }}
              sx={{ textTransform: "none", minWidth: 130, backgroundColor: "rgba(14, 165, 233, 0.9)" }}
            >
              Yes, Continue
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}
