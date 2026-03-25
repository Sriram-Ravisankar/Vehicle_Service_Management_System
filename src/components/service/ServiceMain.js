import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Pencil, 
  Trash2, 
  ClipboardList, 
  Phone, 
  Car, 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  TextField,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from "@mui/material";
import SectionHeader from '../common/Header';
import apiEndpoints from "../../apiconfig";
import { useLoading } from "../../pages/LoadingContext";

// ── Status Styling ──
const STATUS_STYLES = {
  "completed": { bg: "#ECFDF5", text: "#059669" },
  "delivered": { bg: "#F5F3FF", text: "#7C3AED" },
  "pending":   { bg: "#FFFBEB", text: "#D97706" },
  "in progress": { bg: "#EFF6FF", text: "#2563EB" },
  "work in progress": { bg: "#EFF6FF", text: "#2563EB" },
  "cancelled": { bg: "#FEF2F2", text: "#DC2626" },
  "approval pending": { bg: "#FDF2F8", text: "#BE185D" },
  "approved": { bg: "#F0FDFA", text: "#0D9488" },
  "default":   { bg: "#F3F4F6", text: "#4B5563" }
};

const StatusBadge = ({ status }) => {
  const s = (status || "").toLowerCase();
  const style = STATUS_STYLES[s] || STATUS_STYLES.default;
  return (
    <span style={{
      padding: "4px 10px",
      borderRadius: "99px",
      fontSize: "12px",
      fontWeight: 600,
      backgroundColor: style.bg,
      color: style.text,
      display: "inline-block"
    }}>
      {status}
    </span>
  );
};

// ── Column Widths ──
const COL = {
  jobNo: "22%",
  customer: "24%",
  vehicle: "18%",
  arrival: "15%",
  status: "13%",
  action: "8%"
};

// ── Header Component ──
const THead = () => (
  <div style={{
    display: "flex", alignItems: "center",
    padding: "16px 24px", background: "#F9FAFB", borderBottom: "1px solid #F3F4F6",
    minWidth: "800px" // Ensure columns don't collapse too much
  }}>
    <span style={{ width: COL.jobNo, fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Jobcard Info</span>
    <span style={{ width: COL.customer, fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer</span>
    <span style={{ width: COL.vehicle, fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Vehicle</span>
    <span style={{ width: COL.arrival, fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Arrival</span>
    <span style={{ width: COL.status, fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</span>
    <span style={{ width: COL.action, fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Actions</span>
  </div>
);

// ── Row Component ──
const ListRow = ({ row, onEdit, onView, onDelete, isLast }) => (
  <div 
    onClick={onView}
    style={{
      display: "flex", alignItems: "center",
      padding: "16px 24px",
      minWidth: "800px",
      borderBottom: isLast ? "none" : "1px solid #F3F4F6",
      cursor: "pointer", transition: "all 0.2s"
    }}
    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
  >
    <div style={{ width: COL.jobNo, display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <ClipboardList size={16} style={{ color: "#0EA5E9" }} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {row.jobcardNo}
      </span>
    </div>

    <div style={{ width: COL.customer, display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>{row.customer_name}</span>
      <span style={{ fontSize: 12, color: "#6B7280" }}>{row.mobile}</span>
    </div>

    <div style={{ width: COL.vehicle }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#F1F5F9", padding: "4px 10px", borderRadius: 8 }}>
        <Car size={14} style={{ color: "#475569" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{row.registration_number || "—"}</span>
      </div>
    </div>

    <div style={{ width: COL.arrival, display: "flex", alignItems: "center", gap: 6 }}>
      <Calendar size={14} style={{ color: "#9CA3AF" }} />
      <span style={{ fontSize: 13, color: "#4B5563" }}>{row.arrival_date}</span>
    </div>

    <div style={{ width: COL.status }}>
      <StatusBadge status={row.status} />
    </div>

    <div style={{ width: COL.action, display: "flex", justifyContent: "flex-end", gap: 6 }}>
      <Tooltip title="Edit Service">
        <button 
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#F5F3FF", color: "#0EA5E9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#0EA5E9"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F5F3FF"; e.currentTarget.style.color = "#0EA5E9"; }}
        >
          <Pencil size={15} />
        </button>
      </Tooltip>
      <Tooltip title="Delete Service">
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#EF4444"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FEF2F2"; e.currentTarget.style.color = "#EF4444"; }}
        >
          <Trash2 size={15} />
        </button>
      </Tooltip>
    </div>
  </div>
);

const ServiceMain = () => {
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const token = sessionStorage.getItem("token");

  const [jobcards, setJobcards] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;
  const [deleteDialog, setDeleteDialog] = useState({ open: false, guid: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const fetchJobCards = async () => {
    // show();
    try {
      const res = await fetch(apiEndpoints.JobCard, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setJobcards(data || []);
    } catch (error) {
      console.error("Error loading jobcards:", error);
    } finally {
      // hide();
    }
  };

  useEffect(() => { fetchJobCards(); }, []);

  useEffect(() => {
    let temp = [...jobcards];
    if (search.trim()) {
      temp = temp.filter(item =>
        item.jobcardNo?.toLowerCase().includes(search.toLowerCase()) ||
        item.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        item.mobile?.includes(search) ||
        item.registration_number?.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(temp);
    setCurrentPage(1);
  }, [search, jobcards]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginatedData = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleDelete = async () => {
    const guid = deleteDialog.guid;
    setDeleteDialog({ open: false, guid: null });
    show();
    try {
      const res = await fetch(`${apiEndpoints.JobCard}?job_guid=${guid}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: "Job card deleted successfully" });
        fetchJobCards();
      }
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      hide();
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", backgroundColor: "#F8FAFC" }}>
      <SectionHeader title="Services" />

      {/* ── Search & Filter Bar ── */}
      <Box sx={{ 
        display: "flex", flexWrap: "wrap", justifyContent: "space-between", 
        alignItems: "center", mt: 3, mb: 3, gap: 2 
      }}>
        <Box sx={{ position: "relative", width: { xs: "100%", sm: "100%", md: 450 } }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", zIndex: 1 }} />
          <TextField 
            placeholder="Search jobcards, customers, vehicles..."
            fullWidth
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                paddingLeft: "35px",
                borderRadius: "12px",
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
        
        <Box sx={{ display: "flex", gap: 2 }}>
           {/* Filter button removed */}
        </Box>
      </Box>

      {/* ── Summary Text ── */}
      <Typography sx={{ mb: 2, fontSize: 14, color: "#64748B" }}>
        Showing <strong>{filtered.length}</strong> service records
      </Typography>

      {/* ── List/Table Container ── */}
      <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #E2E8F0", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <THead />
          {paginatedData.length > 0 ? (
            paginatedData.map((row, i) => (
              <ListRow 
                key={row.job_guid}
                row={row} 
                isLast={i === paginatedData.length - 1}
                onView={() => navigate("/services-form", { state: { guid: row.job_guid } })}
                onEdit={() => navigate("/services-form", { state: { guid: row.job_guid, isEditing: true } })}
                onDelete={() => setDeleteDialog({ open: true, guid: row.job_guid })}
              />
            ))
          ) : (
            <Box sx={{ p: 8, textAlign: "center" }}>
              <ClipboardList size={48} style={{ color: "#CBD5E1", margin: "0 auto 16px" }} />
              <Typography sx={{ color: "#64748B", fontSize: 15 }}>No service records found</Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, gap: 1 }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            style={{
              width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", color: currentPage === 1 ? "#CBD5E1" : "#64748B",
              cursor: currentPage === 1 ? "not-allowed" : "pointer"
            }}
          >
            <ChevronLeft size={18} />
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 10, border: i + 1 === currentPage ? "1px solid #0EA5E9" : "1px solid #E2E8F0",
                background: i + 1 === currentPage ? "#F5F3FF" : "#fff",
                color: i + 1 === currentPage ? "#0EA5E9" : "#64748B",
                fontWeight: i + 1 === currentPage ? 700 : 500,
                cursor: "pointer"
              }}
            >
              {i + 1}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            style={{
              width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 10, border: "1px solid #E2E8F0", background: "#fff", color: currentPage === totalPages ? "#CBD5E1" : "#64748B",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer"
            }}
          >
            <ChevronRight size={18} />
          </button>
        </Box>
      )}

      {/* ── Modern Delete Dialog ── */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, guid: null })}
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">Are you sure you want to delete this job card? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, guid: null })}
            sx={{ textTransform: "none", fontWeight: 600, color: "#64748B" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained" 
            disableElevation
            sx={{ 
              textTransform: "none", 
              fontWeight: 600, 
              bgcolor: "#EF4444", 
              "&:hover": { bgcolor: "#DC2626" },
              borderRadius: "8px",
              px: 3
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Feedback Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ borderRadius: "12px", fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServiceMain;
