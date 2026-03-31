import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Typography,
  TextField,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Card,
  CardContent,
  Stack,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  Printer,
  Trash2,
  Pencil,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import Pagination from "../../../components/DynamicComponents/Pagination";
import SectionHeader from '../../../components/common/Header';
import { useNavigate } from "react-router-dom";
import apiEndpoints from "../../../apiconfig";
import { printQuotation } from "./QuotationPrint";
import { useLoading } from "../../LoadingContext";
import useAutoRefresh from "../../../hooks/useAutoRefresh";

// Constants for colors
const STATUS_COLORS = {
  "Approval Pending": { bg: "#FFF7ED", text: "#EA580C", icon: <Clock size={16} /> },
  "Approved": { bg: "#E0E7FF", text: "#4338CA", icon: <CheckCircle size={16} /> },
  "Work In Progress": { bg: "#EFF6FF", text: "#3B82F6", icon: <TrendingUp size={16} /> },
  "Completed": { bg: "#ECFDF5", text: "#059669", icon: <CheckCircle size={16} /> },
  "Delivered": { bg: "#F5F3FF", text: "#0EA5E9", icon: <CheckCircle size={16} /> },
  "Cancelled": { bg: "#FEF2F2", text: "#EF4444", icon: <XCircle size={16} /> },
};

export default function QuotationList() {
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const token = sessionStorage.getItem("token");

  const [quotations, setQuotations] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage]         = useState(15);

  const [confirmPopup, setConfirmPopup] = useState({
    open: false,
    quotation: null,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };
  const [branches, setBranches] = useState([]);

  /* ---------------- LOAD LIST ---------------- */
  const loadQuotations = async () => {
    try {
      // show();
      const res = await fetch(apiEndpoints.Quotation + "?list=1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQuotations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Quotation list failed:", e);
    } finally {
      // hide();
    }
  };

  useEffect(() => {
    loadQuotations();
    const fetchBranches = async () => {
      try {
        const res = await fetch(apiEndpoints.branches, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setBranches(json.data);
      } catch (err) { console.error("Branch fetch fail", err); }
    };
    fetchBranches();
  }, []);

  /* ── Auto-sync: poll + tab-focus re-fetch via shared hook ── */
  useAutoRefresh(loadQuotations);

  /* ---------------- STATS ---------------- */
  const stats = useMemo(() => {
    return {
      total: quotations.length,
      pending: quotations.filter(q => q.status === "Approval Pending" || q.status === "Approved").length,
      completed: quotations.filter(q => q.status === "Completed" || q.status === "Delivered").length,
      wip: quotations.filter(q => q.status === "Work In Progress").length,
    };
  }, [quotations]);

  /* ---------------- SEARCH ---------------- */
  const filtered = quotations.filter((q) => {
    const s = search.toLowerCase();
    return (
      q.quotation_no?.toLowerCase().includes(s) ||
      q.customer_name?.toLowerCase().includes(s) ||
      q.status?.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginatedQuotations = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  /* ---------------- STATUS ---------------- */
  const handleStatusChange = async (quotation_guid, newStatus, row) => {
    if (newStatus === "Completed") {
      setConfirmPopup({ open: true, quotation: row });
      return;
    }

    if (newStatus === "Cancelled") {
      // We could use a dialog here too, but for simplicity let's stick to the request of using snackbars first
      // Actually, let's just update and show snackbar
      await updateStatusAPI(quotation_guid, newStatus);
      return;
    }

    await updateStatusAPI(quotation_guid, newStatus);
  };

  const updateStatusAPI = async (quotation_guid, newStatus) => {
    try {
      show();
      const form = new FormData();
      form.append("status", newStatus);

      const res = await fetch(
        apiEndpoints.Quotation + "?quotation_guid=" + quotation_guid,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );

      const data = await res.json();
      if (data.success) {
        setQuotations((prev) =>
          prev.map((q) =>
            q.quotation_guid === quotation_guid
              ? { ...q, status: newStatus }
              : q
          )
        );
        showSnackbar(`Status updated to ${newStatus}`, "success");
      } else {
        showSnackbar(data.message || "Failed to update status", "error");
      }
    } catch (err) {
      console.error(err);
    } finally {
      hide();
    }
  };

  /* ---------------- UTIL ---------------- */
  const safeParse = (val) => {
    if (!val) return {};
    if (typeof val === "object") return val;
    try {
      return JSON.parse(val);
    } catch {
      return {};
    }
  };

  const fetchFullQuotation = async (guid) => {
    try {
      const res = await fetch(
        apiEndpoints.Quotation + "?quotation_guid=" + guid,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      return Array.isArray(data) ? data[0] : data;
    } catch {
      return null;
    }
  };

  const deleteQuotation = (guid) => {
    setQuotationToDelete(guid);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    const guid = quotationToDelete;
    if (!guid) return;
    try {
      show();
      const res = await fetch(
        apiEndpoints.Quotation + "?quotation_guid=" + guid,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) {
        loadQuotations();
        showSnackbar("Quotation deleted successfully", "success");
      } else {
        showSnackbar(data.message || "Failed to delete quotation", "error");
      }
    } catch (e) {
      showSnackbar("An error occurred during deletion", "error");
    } finally {
      hide();
      setDeleteDialogOpen(false);
      setQuotationToDelete(null);
    }
  };

  /* ---------------- HANDLE PRINT ---------------- */
  const handlePrintClick = async (row) => {
    if (!row) return;
    try {
      show();
      let full = await fetchFullQuotation(row.quotation_guid);
      if (!full) return;

      // Ensure we have a job guid
      const jobGuid = full.job_guid || full.jobGuid || row.job_guid || row.jobGuid;

      // 1. Fetch Job Card details to get missing info (Vehicle, Mobile, BranchID)
      if (jobGuid) {
        try {
          const jcRes = await fetch(`${apiEndpoints.JobCard}?job_guid=${jobGuid}`, {
              headers: { Authorization: `Bearer ${token}` },
          });
          const jcData = await jcRes.json();
          const jcRow = Array.isArray(jcData) ? jcData[0] : jcData;
          
          if (jcRow) {
            // Helper for effective override
            const isInvalid = (v) => !v || v === "-";
            
            if (isInvalid(full.number_plate)) {
              full.number_plate = jcRow.vehicleNumber || jcRow.vehicle_number || jcRow.number_plate || jcRow.numberPlate || jcRow.vehicleNo || jcRow.vehicle_no || jcRow.reg_no;
            }
            if (isInvalid(full.customer_mobile)) {
              full.customer_mobile = jcRow.mobile || jcRow.customerMobile || jcRow.customer_mobile;
            }
            if (isInvalid(full.vehicle_model)) {
              full.vehicle_model = (jcRow.make ? `${jcRow.make} ${jcRow.model || ""}` : jcRow.model) || jcRow.vehicleModel || jcRow.vehicle_model || jcRow.vehicle_details?.model;
            }
            full.branch_id = full.branch_id || jcRow.branch_id || jcRow.branchId;
            full.created_by_name = full.created_by_name || jcRow.worker_name || jcRow.mechanic_name || jcRow.prepared_by;
          }
        } catch (e) { console.error("Job card fetch fail", e); }
      }

      // 2. Inject Branch details from matches in the list
      const bi = full.branch_id || full.branchId;
      const matchingBranch = branches.find(b => String(b.branch_id) === String(bi)) || 
                             branches.find(b => b.is_head_office == 1) || 
                             branches[0];

      if (matchingBranch) {
          full.branch = matchingBranch;
      }

      printQuotation(full, "standard");
    } catch (e) {
      console.error("Print error:", e);
    } finally {
      hide();
    }
  };



  const StatCard = ({ title, value, color, icon: Icon }) => (
    <Card sx={{ 
      borderRadius: "20px", 
      border: "1px solid #E2E8F0", 
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)",
      height: "100%",
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'
      }
    }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography sx={{ fontSize: 13, color: "#64748B", fontWeight: 700, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {title}
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 800, color: "#1E293B", lineHeight: 1.2 }}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ 
            width: 52, height: 52, borderRadius: "14px", 
            backgroundColor: `${color}10`, color: color,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 10px -2px ${color}30`
          }}>
            <Icon size={26} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 1.5, md: 4 }, minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      <SectionHeader />

      {/* Stats Section - Using CSS Grid for perfect alignment */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(4, 1fr)' 
        }, 
        gap: { xs: 2, md: 3 }, 
        mt: 4, 
        mb: 5 
      }}>
        <StatCard title="Total Quotations" value={stats.total} color="#3B82F6" icon={FileText} />
        <StatCard title="Approval Pending" value={stats.pending} color="#EA580C" icon={Clock} />
        <StatCard title="Work In Progress" value={stats.wip} color="#0EA5E9" icon={TrendingUp} />
        <StatCard title="Completed" value={stats.completed} color="#10B981" icon={CheckCircle} />
      </Box>

      {/* Top Bar with Search */}
      <Box sx={{ 
        display: "flex", flexWrap: "wrap", justifyContent: "flex-start", 
        alignItems: "center", mb: 4, px: { xs: 0.5, md: 0 } 
      }}>
        <Box sx={{ position: "relative", width: { xs: "100%", sm: "100%", md: 450 } }}>
          <Search size={18} style={{ 
            position: "absolute", left: 14, top: "50%", 
            transform: "translateY(-50%)", color: "#94A3B8",
            zIndex: 1
          }} />
          <TextField
            placeholder="Search quotation number, customer or status..."
            fullWidth
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            sx={{
              "& .MuiOutlinedInput-root": {
                paddingLeft: "38px",
                borderRadius: "14px",
                backgroundColor: "#fff",
                border: "1px solid #E2E8F0",
                height: '45px',
                transition: 'all 0.2s',
                "& fieldset": { border: "none" },
                "&.Mui-focused": { 
                  boxShadow: "0 0 0 2px rgba(14, 165, 233, 0.15)",
                  border: '1px solid #0EA5E9'
                }
              }
            }}
          />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Paper sx={{ 
        borderRadius: "20px", overflow: "hidden", 
        border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" 
      }}>
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <Box component="thead">
              <Box component="tr" sx={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <Box component="th" sx={tableHeadStyle}>Quotation No</Box>
                <Box component="th" sx={tableHeadStyle}>Customer Name</Box>
                <Box component="th" sx={tableHeadStyle}>Created Date</Box>
                <Box component="th" sx={tableHeadStyle}>Total Amount</Box>
                <Box component="th" sx={tableHeadStyle}>Status</Box>
                <Box component="th" sx={{ ...tableHeadStyle, textAlign: "right" }}>Actions</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {paginatedQuotations.length > 0 ? (
                paginatedQuotations.map((row, idx) => {
                  const totals = safeParse(row.totals);
                  const statusInfo = STATUS_COLORS[row.status] || { bg: "#F3F4F6", text: "#6B7280", icon: null };
                  
                  return (
                    <Box 
                      component="tr" 
                      key={row.quotation_guid} 
                      onClick={() => navigate("/view-quotation/" + row.quotation_guid)}
                      sx={{ 
                        "&:hover": { backgroundColor: "#F8FAFC" },
                        borderBottom: idx === paginatedQuotations.length - 1 ? "none" : "1px solid #F1F5F9",
                        transition: "0.2s",
                        cursor: 'pointer'
                      }}
                    >
                      <Box component="td" sx={tableCellStyle}>
                        <Typography sx={{ fontWeight: 600, color: "#1E293B", fontSize: 15 }}>
                          {row.quotation_no}
                        </Typography>
                      </Box>
                      <Box component="td" sx={tableCellStyle}>
                        <Typography sx={{ color: "#475569", fontSize: 14 }}>
                          {row.customer_name || "Guest Customer"}
                        </Typography>
                      </Box>
                      <Box component="td" sx={tableCellStyle}>
                        <Typography sx={{ color: "#64748B", fontSize: 14 }}>
                          {new Date(row.created_on).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric"
                          })}
                        </Typography>
                      </Box>
                      <Box component="td" sx={tableCellStyle}>
                        <Typography sx={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>
                          ₹{Number(totals?.grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </Typography>
                      </Box>
                      <Box component="td" sx={tableCellStyle} onClick={(e) => e.stopPropagation()}>
                        <Select
                          size="small"
                          value={row.status}
                          onChange={(e) => handleStatusChange(row.quotation_guid, e.target.value, row)}
                          sx={{ 
                            "& .MuiSelect-select": {
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              py: 0.5,
                              px: 1.5,
                              fontSize: "13px",
                              fontWeight: 600,
                              borderRadius: "8px",
                              backgroundColor: statusInfo.bg,
                              color: statusInfo.text,
                            },
                            "& fieldset": { border: "none" },
                            minWidth: 180
                          }}
                        >
                          {Object.keys(STATUS_COLORS).map(status => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                          ))}
                        </Select>
                      </Box>
                      <Box component="td" sx={{ ...tableCellStyle, textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton 
                              onClick={() => navigate("/edit-quotation/" + row.quotation_guid)} 
                              size="small" 
                              sx={{ color: "#0EA5E9", '&:hover': { backgroundColor: "#F5F3FF" } }}
                            >
                              <Pencil size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Print">
                            <IconButton 
                              onClick={() => handlePrintClick(row)} 
                              size="small" 
                              sx={{ color: "#10B981", '&:hover': { backgroundColor: "#ECFDF5" } }}
                            >
                              <Printer size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton 
                              onClick={() => deleteQuotation(row.quotation_guid)} 
                              size="small" 
                              sx={{ color: "#EF4444", '&:hover': { backgroundColor: "#FEF2F2" } }}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Box>
                    </Box>
                  );
                })
              ) : (
                <Box component="tr">
                  <Box component="td" colSpan={6} sx={{ py: 10, textAlign: "center" }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: '#94A3B8' }}>
                      <FileText size={48} />
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: '#1E293B' }}>No quotations found</Typography>
                        <Typography variant="body2">{search ? "Try adjusting your search filters" : "Start by creating your first quotation"}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mt: 2 }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filtered.length}
          itemsPerPage={perPage}
          onPageChange={(page) => setCurrentPage(page)}
          onPerPageChange={(n) => { setPerPage(n); setCurrentPage(1); }}
          itemLabel="quotation"
        />
      </Box>


      {/* Confirm Move to Invoice Dialog */}
      <Dialog
        open={confirmPopup.open}
        onClose={() => setConfirmPopup({ open: false, quotation: null })}
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "20px" }}>Convert to Invoice?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#64748B" }}>
            This quotation is marked as <b>Completed</b>. 
            Would you like to generate an invoice for this quote now?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3 }}>
          <Button 
            onClick={async () => {
              await updateStatusAPI(confirmPopup.quotation.quotation_guid, "Completed");
              setConfirmPopup({ open: false, quotation: null });
            }}
            sx={{ fontWeight: 600, color: "#64748B" }}
          >
            Just Mark Completed
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              const q = confirmPopup.quotation;
              await updateStatusAPI(q.quotation_guid, "Completed");
              const full = await fetchFullQuotation(q.quotation_guid);
              setConfirmPopup({ open: false, quotation: null });
              if (full) {
                navigate("/add-invoice", { state: { quotation: full } });
              }
            }}
            sx={{ 
              borderRadius: "10px", 
              backgroundColor: "#10B981", 
              "&:hover": { backgroundColor: "#059669" },
              fontWeight: 600,
              textTransform: "none"
            }}
          >
            Yes, Create Invoice
          </Button>
        </DialogActions>
      </Dialog>


      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 700, color: "#111827" }}>
          <AlertTriangle size={24} style={{ color: "#EF4444" }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#4B5563", fontSize: "15px" }}>
            Are you sure you want to delete this quotation? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: "none", fontWeight: 600, color: "#6B7280" }}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            sx={{ 
              textTransform: "none", fontWeight: 600, 
              backgroundColor: "#EF4444", "&:hover": { backgroundColor: "#DC2626" },
              borderRadius: "8px"
            }}
          >
            Delete Quotation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%', borderRadius: "10px", fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Styling Constants
const tableHeadStyle = {
  textAlign: "left",
  padding: "16px 24px",
  fontSize: "12px",
  fontWeight: 700,
  color: "#64748B",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tableCellStyle = {
  padding: "16px 24px",
  verticalAlign: "middle",
};
