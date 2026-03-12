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
import EditIcon from "@mui/icons-material/Edit";
import Step1_ServiceDetails from "./Step1_ServiceDetails";
import Step2_PreInspection from "./Step2_PreInspection";
import Step3_PartsLabour from "./Step3_PartsLabour";
import apiEndpoints from "../../apiconfig";
import { useLocation, useNavigate } from "react-router-dom";

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

  // Stepper & progress
  const [activeStep, setActiveStep] = useState(0);
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
    vehicle_guid: "",
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
          customer_guid: row.customer_guid || row.customer_guid || "",
          vehicle_guid: row.vehicle_guid || row.vehicle_guid || "",
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
      name: p.name || p.product || "",
      qty: Number(p.qty || 0),
      rate: Number(p.rate || 0),
      discount: Number(p.discount || 0),
      amount: Number(p.amount || 0),
    }));

    const labour = (form.labour || []).map((l) => ({
      title: l.title || l.name || "",
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
    <Box p={{ xs: 2, md: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {form.jobcardNo
                ? `Job Card — ${form.jobcardNo}`
                : "Create Job Card"}
            </Typography>
            {form.createdOn && (
              <Typography variant="caption" color="text.secondary">
                Created: {new Date(form.createdOn).toLocaleString()}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={1}>
            {/* If viewing existing and not editing — show Edit button */}
            {routeGuid && !isEditing && (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={enableEdit}
                sx={{ textTransform: "none" }}
              >
                Edit
              </Button>
            )}

            {/* When editing, show Cancel (revert) */}

            <Button
              variant="text"
              onClick={cancelEdit}
              sx={{
                color: "rgba(249, 115, 22, 0.9)",
                textTransform: "none",

                "&:hover": {
                  backgroundColor: "rgba(249, 115, 22, 0.08)",
                },
              }}
            >
              Cancel
            </Button>

            {/* <Button
              variant="contained"
              onClick={() => {
                if (!isEditing && routeGuid) {
                  navigate("/services"); // VIEW MODE → always go back
                  return;
                }

                // EDIT MODE BELOW
                setPendingQuotationAction(() => () => handleSave(true));
setOpenQuotationDialog(true);

              // NEVER disable button in view mode
              disabled={false}
            >
              {isSubmitting
                ? "Saving..."
                : routeGuid
                ? isEditing
                  ? "Save & Close"
                  : "Back to List"
                : "Create & Save"}
            </Button> */}
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        {/* Stepper */}
        <Box mb={2}>
          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              // Active step circle
              "& .MuiStepIcon-root.Mui-active": {
                color: "rgba(249, 115, 22, 0.9)",
              },

              // Completed step circle
              "& .MuiStepIcon-root.Mui-completed": {
                color: "rgba(249, 115, 22, 0.9)",
              },

              // Step label text (active)
              "& .MuiStepLabel-label.Mui-active": {
                color: "rgba(249, 115, 22, 0.9)",
                fontWeight: 600,
              },

              // Step label text (completed)
              "& .MuiStepLabel-label.Mui-completed": {
                color: "rgba(249, 115, 22, 0.9)",
                fontWeight: 600,
              },

              // Connector line (active & completed)
              "& .MuiStepConnector-line": {
                borderColor: "rgba(249, 115, 22, 0.9)",
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
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="outlined"
            sx={{
              color: "rgba(249, 115, 22, 0.9)",
              borderColor: "rgba(249, 115, 22, 0.9)",
              textTransform: "none",

              "&:hover": {
                borderColor: "rgba(249, 115, 22, 1)",
                backgroundColor: "rgba(249, 115, 22, 0.08)",
              },
            }}
          >
            Back
          </Button>

          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
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
              sx={{
                backgroundColor: "rgba(249, 115, 22, 0.9)",
                "&:hover": {
                  backgroundColor: "rgba(249, 115, 22, 1)",
                },
                color: "#fff",
                textTransform: "none",
              }}
            >
              Save & Continue
            </Button>

          ) : (
            <Button
              variant="contained"
              onClick={() => {
                if (!isEditing && routeGuid) {
                  navigate("/services");
                  return;
                }

                setPendingQuotationAction(() => () => handleSave(true));
                setOpenQuotationDialog(true);
              }}
              sx={{
                backgroundColor: "rgba(249, 115, 22, 0.9)",
                "&:hover": {
                  backgroundColor: "rgba(249, 115, 22, 1)",
                },
                color: "#fff",
                textTransform: "none",
              }}
            >
              {isSubmitting
                ? "Saving..."
                : routeGuid
                  ? "Finish & Save"
                  : "Create & Save"}
            </Button>

          )}
        </Box>
      </Paper>

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
              sx={{ textTransform: "none", minWidth: 130, backgroundColor: "rgba(249, 115, 22, 0.9)" }}
            >
              Yes, Continue
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Box>
  );
}
