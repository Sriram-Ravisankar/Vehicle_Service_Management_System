import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Pagination from "../../../components/DynamicComponents/Pagination";
import {
  Box,
  TextField,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";
import { 
  Search, 
  Pencil, 
  Trash2, 
  Printer, 
  FileText,
  AlertTriangle
} from "lucide-react";
import { printInvoice } from "./InvoicePrint";
import apiEndpoints from "../../../apiconfig";
import SectionHeader from '../../../components/common/Header';
import { useLoading } from "../../LoadingContext";
import InvoiceViewModal from "./InvoiceViewModal";

// ── col widths ────────────────────────────────────────────────────────────────
const COL = {
  id:       160,
  customer: 240,
  plate:    140,
  amount:   140,
  date:     140,
  status:   120,
  action:   110,
};

// ── status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const isPaid = status === "Paid" || status === "Completed";
  const isPartial = status === "Partial";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 8,
      fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em",
      background: isPaid ? "#F0FDF4" : isPartial ? "#FFF7ED" : "#FEF2F2",
      color: isPaid ? "#16A34A" : isPartial ? "#EA580C" : "#EF4444",
      border: `1px solid ${isPaid ? "#DCFCE7" : isPartial ? "#FFEDD5" : "#FECACA"}`
    }}>
      {status || "Unpaid"}
    </span>
  );
};

// ── table head ────────────────────────────────────────────────────────────────
const THead = () => (
  <div style={{
    display: "flex", alignItems: "center",
    padding: "12px 24px", background: "#F9FAFB", borderBottom: "1px solid #F3F4F6",
    gap: 16,
  }}>
    <span style={{ width: COL.id, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      Invoice Info
    </span>
    <span style={{ width: COL.customer, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      Customer / Category
    </span>
    <span style={{ width: COL.plate, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
      Vehicle No
    </span>
    <span style={{ width: COL.amount, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>
      Total Amount
    </span>
    <span style={{ width: COL.date, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
      Date
    </span>
    <span style={{ width: COL.status, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
      Payment Status
    </span>
    <div style={{ flex: 1 }} />
    <span style={{ width: COL.action, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
      Actions
    </span>
  </div>
);

// ── list row ─────────────────────────────────────────────────────────────────
const ListRow = ({ item, onView, onEdit, onDelete, onPrint, isLast }) => (
  <div
    onClick={onView}
    style={{
      display: "flex", alignItems: "center",
      padding: "16px 24px",
      gap: 16,
      borderBottom: isLast ? "none" : "1px solid #F3F4F6",
      cursor: "pointer", transition: "background 0.13s",
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#FAFAFA"}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}
  >
    {/* ID/Number */}
    <div style={{ width: COL.id, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FileText size={16} color="#475569" />
        </div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827" }}>{item.invoiceNumber}</p>
      </div>
    </div>

    {/* Customer */}
    <div style={{ width: COL.customer, minWidth: 0, flexShrink: 0 }}>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {item.customerName}
      </p>
      <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6B7280", fontWeight: 500 }}>{item.invoiceFor} Invoice</p>
    </div>

    {/* Plate */}
    <div style={{ width: COL.plate, flexShrink: 0 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#4B5563", background: "#F3F4F6", padding: "4px 8px", borderRadius: 6 }}>
        {item.numberPlate}
      </span>
    </div>

    {/* Amount */}
    <div style={{ width: COL.amount, flexShrink: 0, textAlign: "right" }}>
      <span style={{ fontSize: 15, fontWeight: 800, color: "#111827" }}>
        ₹{Number(item.totalAmount || 0).toLocaleString()}
      </span>
    </div>

    {/* Date */}
    <div style={{ width: COL.date, flexShrink: 0, textAlign: "center" }}>
       <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>{item.invoiceDate}</span>
    </div>

    {/* Status */}
    <div style={{ width: COL.status, flexShrink: 0, textAlign: "center" }}>
      <StatusBadge status={item.status} />
    </div>

    {/* Spacer */}
    <div style={{ flex: 1 }} />

    {/* Actions */}
    <div style={{ width: COL.action, flexShrink: 0, display: "flex", justifyContent: "center", gap: 6 }}>
      <Tooltip title="Edit">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#F5F3FF", color: "#0EA5E9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        ><Pencil size={15} /></button>
      </Tooltip>
      <Tooltip title="Print">
        <button
          onClick={(e) => { e.stopPropagation(); onPrint(); }}
          style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#F0FDF4", color: "#16A34A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        ><Printer size={15} /></button>
      </Tooltip>
      <Tooltip title="Delete">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#FEF2F2", color: "#EF4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        ><Trash2 size={15} /></button>
      </Tooltip>
    </div>
  </div>
);

function InvoiceList({ invoices = [], deleteItems }) {
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage]         = useState(15);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Previews
  const [viewData, setViewData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [branches, setBranches] = useState([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  React.useEffect(() => {
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

  const filteredInvoices = invoices.filter((inv) =>
    [inv.invoiceNumber, inv.customerName, inv.numberPlate].some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredInvoices.length / perPage);
  const paginated = filteredInvoices.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handlePrintClick = async (invoiceId) => {
    try {
      show();
      const res = await fetch(`${apiEndpoints.Invoice}?invoice_guid=${invoiceId}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      if (!res.ok) throw new Error("Failed to fetch details");
      const fullInvoice = await res.json();
      
      // Inject branch details if missing
      const bi = fullInvoice.branch_id || fullInvoice.branchId;
      const matchingBranch = branches.find(b => String(b.branch_id) === String(bi)) || branches.find(b => b.is_head_office == 1) || branches[0];
      if (matchingBranch && (!fullInvoice.branch && !fullInvoice.branch_details)) {
          fullInvoice.branch = matchingBranch;
      }

      // Restore vehicle model from job card if missing
      if (!fullInvoice.vehicle_model && !fullInvoice.vehicleModel && (fullInvoice.job_guid || fullInvoice.jobGuid)) {
        try {
          const jcRes = await fetch(`${apiEndpoints.JobCard}?job_guid=${fullInvoice.job_guid || fullInvoice.jobGuid}`, {
              headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          });
          const jcData = await jcRes.json();
          const jcRow = Array.isArray(jcData) ? jcData[0] : jcData;
          if (jcRow?.model || jcRow?.vehicleModel) {
             fullInvoice.vehicle_model = jcRow.model || jcRow.vehicleModel;
          }
        } catch (e) { console.error("Job card fallback fail", e); }
      }

      printInvoice(fullInvoice, "standard");
    } catch (err) {
      console.error("Print failed", err);
      setSnackbar({ open: true, message: "Failed to print invoice", severity: "error" });
    } finally {
      hide();
    }
  };


  const handleDeleteClick = (id) => {
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;
    try {
      show();
      await deleteItems("invoices", [invoiceToDelete]);
      showSnackbar("Invoice deleted successfully", "success");
    } catch (err) {
      showSnackbar("Failed to delete invoice", "error");
    } finally {
      hide();
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };


  const handleOpenPreview = async (invoiceId) => {
    try {
        show();
        const res = await fetch(`${apiEndpoints.Invoice}?invoice_guid=${invoiceId}`, {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        });
        const data = await res.json();
        
        // Inject branch if missing
        const bi = data.branch_id || data.branchId;
        const matchingBranch = branches.find(b => String(b.branch_id) === String(bi)) || branches.find(b => b.is_head_office == 1) || branches[0];
        if (matchingBranch && (!data.branch && !data.branch_details)) {
           data.branch = matchingBranch;
        }

        // Restore vehicle model from job card if missing
        if (!data.vehicle_model && !data.vehicleModel && (data.job_guid || data.jobGuid)) {
          try {
            const jcRes = await fetch(`${apiEndpoints.JobCard}?job_guid=${data.job_guid || data.jobGuid}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
            });
            const jcData = await jcRes.json();
            const jcRow = Array.isArray(jcData) ? jcData[0] : jcData;
            if (jcRow?.model || jcRow?.vehicleModel || jcRow?.vehicle_model) {
               data.vehicle_model = jcRow.model || jcRow.vehicleModel || jcRow.vehicle_model;
            }
          } catch (e) { console.error("Job card fallback for preview fail", e); }
        }

        setViewData(data);
        setViewOpen(true);
    } catch {
        setSnackbar({ open: true, message: "Failed to load preview", severity: "error" });
    } finally {
        hide();
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3, md: 4 } }}>
      <SectionHeader title="Invoices" />

      {/* ── SEARCH ── */}
      <Box sx={{ mt: 2, mb: 3 }}>
        <Box sx={{ position: "relative", width: { xs: "100%", md: 400 } }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", zIndex: 1 }} />
          <TextField
            placeholder="Search invoices..."
            fullWidth
            size="small"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            sx={{
              "& .MuiOutlinedInput-root": {
                paddingLeft: "35px", borderRadius: "12px", background: "#fff",
                border: "1px solid #E2E8F0", height: '42px',
                "& fieldset": { border: "none" },
                "&.Mui-focused": { border: '1px solid #0EA5E9', boxShadow: "0 0 0 2px rgba(14, 165, 233, 0.15)" }
              }
            }}
          />
        </Box>
      </Box>

      {/* ── LIST ── */}
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748B" }}>
        Total <strong style={{ color: "#0F172A" }}>{filteredInvoices.length}</strong> invoice{filteredInvoices.length !== 1 ? "s" : ""}
      </p>

      {filteredInvoices.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", background: "#fff", borderRadius: 16, border: "1px dashed #E2E8F0" }}>
          <FileText size={48} style={{ color: "#CBD5E1", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 500, color: "#0F172A" }}>No invoices found</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <style>{`
            .hide-scrollbar::-webkit-scrollbar { height: 6px; }
            .hide-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
            .hide-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            .hide-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          `}</style>
          <div className="hide-scrollbar" style={{ overflowX: "auto", width: "100%", position: "relative" }}>
            <div style={{ minWidth: 1200 }}>
              <THead />
              {paginated.map((item, i) => (
                <ListRow 
                  key={item.id} 
                  item={item} 
                  isLast={i === paginated.length - 1}
                  onView={() => handleOpenPreview(item.id)}
                  onEdit={() => navigate(`/edit-invoice/${item.id}`)}
                  onPrint={() => handlePrintClick(item.id)}
                  onDelete={() => handleDeleteClick(item.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredInvoices.length}
        itemsPerPage={perPage}
        onPageChange={setCurrentPage}
        onPerPageChange={(n) => { setPerPage(n); setCurrentPage(1); }}
        itemLabel="invoice"
      />



      <InvoiceViewModal 
        open={viewOpen} 
        onClose={() => setViewOpen(false)} 
        data={viewData} 
      />

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: "10px", fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

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
            Are you sure you want to delete this invoice? This action cannot be undone.
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
            Delete Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

InvoiceList.propTypes = {
  invoices: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteItems: PropTypes.func.isRequired,
};

export default React.memo(InvoiceList);
