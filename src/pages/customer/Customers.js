import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Avatar,
  Snackbar,
  Alert,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { 
  Search, 
  Pencil, 
  Trash2, 
  Mail, 
  Phone, 
  User, 
  Car, 
  Briefcase, 
  GraduationCap,
  AlertTriangle
} from "lucide-react";
import apiEndpoints from "../../apiconfig";
import SectionHeader from "../../components/common/Header";
import { TextField } from "@mui/material";
import CustomerViewModal from "./CustomerViewModal";
import Pagination from "../../components/DynamicComponents/Pagination";

// ── col widths ────────────────────────────────────────────────────────────────
const COL = {
  profile: 320,
  contact: 280,
  extra:   200,
  action:  100,
};

// ── List Header ────────────────────────────────────────────────────────────────
const THead = ({ extraLabel }) => (
  <Box sx={{
    display: "flex", alignItems: "center",
    padding: "14px 24px", background: "#F8FAF6", borderBottom: "1px solid #E2E8F0",
    gap: 3,
  }}>
    <Typography sx={{ width: COL.profile, fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Customer Identity</Typography>
    <Typography sx={{ width: COL.contact, fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Contact Details</Typography>
    <Typography sx={{ width: COL.extra, fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>{extraLabel}</Typography>
    <Box sx={{ flex: 1 }} />
    <Typography sx={{ width: COL.action, fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>Actions</Typography>
  </Box>
);

// ── List Row ─────────────────────────────────────────────────────────────────
const ListRow = ({ user, extraLabel, onEdit, onDelete, onView, isLast, showView }) => {
  const ExtraIcon = useMemo(() => {
    switch(extraLabel?.toLowerCase()) {
      case 'vehicle': return Car;
      case 'position': return Briefcase;
      case 'role': return User;
      case 'qualification': return GraduationCap;
      default: return User;
    }
  }, [extraLabel]);

  return (
    <Box
      sx={{
        display: "flex", alignItems: "center",
        padding: "16px 24px",
        gap: 3,
        borderBottom: isLast ? "none" : "1px solid #F1F5F9",
        transition: "all 0.2s ease",
        cursor: showView ? "pointer" : "default",
        "&:hover": { background: "#F8FAFC" }
      }}
      onClick={showView ? onView : undefined}
    >
      {/* Identity */}
      <Box sx={{ width: COL.profile, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar 
          src={user.image} 
          sx={{ width: 44, height: 44, borderRadius: "12px", border: "2px solid #fff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
        >
          {user.firstName?.[0]}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#1E293B", lineHeight: 1.2 }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#94A3B8", mt: 0.5, display: "flex", alignItems: "center", gap: 0.5 }}>
            ID: <span style={{ color: "#3B82F6", fontWeight: 600 }}>{user.user_guid?.slice(0, 8)}</span>
          </Typography>
        </Box>
      </Box>

      {/* Contact */}
      <Box sx={{ width: COL.contact }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Mail size={13} color="#94A3B8" />
          <Typography sx={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{user.email || 'N/A'}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Phone size={13} color="#94A3B8" />
          <Typography sx={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{user.mobile || 'N/A'}</Typography>
        </Box>
      </Box>

      {/* Extra Info (Vehicle/Position/etc) */}
      <Box sx={{ width: COL.extra }}>
        <Box sx={{ 
          display: "inline-flex", alignItems: "center", gap: 1, 
          background: "#F1F5F9", px: 1.5, py: 0.75, borderRadius: "8px",
          border: "1px solid #E2E8F0"
        }}>
          <ExtraIcon size={14} color="#64748B" />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#334155" }}>
            {user.extraValue || "-"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1 }} />

      <Box sx={{ width: COL.action, display: "flex", justifyContent: "center", gap: 1 }}>
        <Tooltip title="Edit Profile">
          <IconButton 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            sx={{ 
              width: 32, height: 32, borderRadius: "8px", background: "#F5F3FF", color: "#0EA5E9",
              "&:hover": { background: "#0EA5E9", color: "#fff" }
            }}
          >
            <Pencil size={15} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Entry">
          <IconButton 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            sx={{ 
              width: 32, height: 32, borderRadius: "8px", background: "#FEF2F2", color: "#EF4444",
              "&:hover": { background: "#EF4444", color: "#fff" }
            }}
          >
            <Trash2 size={15} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

// ── Main UserList Component ───────────────────────────────────────────────────
function UserList({
  users = [],
  title,
  columns,
  detailsKey,
  addRoute,
  editRoutePrefix,
  fetchData,
  onDelete: onDeleteProp,
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, userGuid: null, vehicleGuid: null });
  const [page, setPage]     = useState(1);
  const [perPage, setPerPage] = useState(15);

  useEffect(() => {
    fetchData();
  }, []);

  const extraColumn = useMemo(() => {
    return columns.find(c => !["Image", "First Name", "Last Name", "Email", "Mobile Number", "Action"].includes(c));
  }, [columns]);

  const transformedUsers = useMemo(() => {
    return (users || []).map((user) => ({
      ...user,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      mobile: user.mobile,
      monthlySalary: user.monthly_salary ?? user.monthlySalary ?? user.salary ?? "0",
      image: `${apiEndpoints.blob}${user.image_path}` || user.image_path,
      extraValue: user[detailsKey] || user.vehicle_number || user.position || user.role || user.qualifications || "-",
      // Force vehicle fields into the object for the modal
      fuel_type: user.vehicle_fuel_type || user.fuel_type,
      color: user.vehicle_color || user.color,
      year: user.vehicle_year || user.year_of_manufacture,
    }));
  }, [users, detailsKey]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return transformedUsers.filter((user) => 
      user.firstName?.toLowerCase().includes(term) ||
      user.lastName?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.mobile?.toString().includes(term) ||
      user.extraValue?.toLowerCase?.().includes(term) ||
      user.user_guid?.toLowerCase().includes(term)
    );
  }, [transformedUsers, searchTerm]);

  const handleDelete = async () => {
    const { userGuid, vehicleGuid } = deleteConfirm;
    if (!userGuid) return;
    setDeleteConfirm({ open: false, userGuid: null, vehicleGuid: null });

    try {
      if (onDeleteProp) {
        await onDeleteProp([userGuid], vehicleGuid, userGuid);
        setSnackbar({ open: true, message: `${title} deleted successfully`, severity: "success" });
        return;
      }

      const response = await fetch(`${apiEndpoints.usersdata}?user_guid=${userGuid}&vehicle_guid=${vehicleGuid || ''}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + sessionStorage.getItem("token") },
      });
      const data = await response.json();
      if (data.success || data.message?.includes("success")) {
        setSnackbar({ open: true, message: `${title} deleted successfully`, severity: "success" });
        fetchData();
      } else {
        throw new Error(data.message || "Delete failed");
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: "error" });
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <SectionHeader />

      {/* Toolbar Section */}
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ position: "relative", width: { xs: "100%", sm: "100%", md: 400 } }}>
            <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none", zIndex: 1 }} />
            <TextField
              placeholder={`Search ${title.toLowerCase()}...`}
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  paddingLeft: "36px",
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
          <Typography sx={{ fontSize: 13, color: "#94A3B8", ml: 1, fontWeight: 600 }}>
            Showing <span style={{ color: "#0EA5E9", fontWeight: 800 }}>{filteredUsers.length}</span> {title}
          </Typography>
        </Box>
      </Box>

      {/* List Container */}
      {filteredUsers.length === 0 ? (
        <Box sx={{ 
          textAlign: "center", py: 12, background: "#F8FAFC", borderRadius: "24px", 
          border: "2px dashed #E2E8F0", display: "flex", flexDirection: "column", alignItems: "center"
        }}>
          <Box sx={{ 
            width: 80, height: 80, borderRadius: "20px", background: "#fff", 
            display: "flex", alignItems: "center", justifyContent: "center",
            mb: 2, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04)"
          }}>
            <User size={32} color="#94A3B8" />
          </Box>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: "#1E293B" }}>No {title.toLowerCase()} found</Typography>
          <Typography sx={{ fontSize: 14, color: "#64748B", mt: 1, maxWidth: 300 }}>
            We couldn't find any {title.toLowerCase()} matching your current search criteria.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ 
          background: "#fff", borderRadius: "24px", border: "1px solid #E2E8F0", 
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04)", overflow: "hidden" 
        }}>
          <Box sx={{ overflowX: "auto", width: "100%" }}>
            <Box sx={{ minWidth: COL.profile + COL.contact + COL.extra + COL.action + 100 }}>
              <THead extraLabel={extraColumn} />
              {filteredUsers.slice((page - 1) * perPage, page * perPage).map((user, i, arr) => (
                <ListRow 
                  key={user.user_guid} 
                  user={user} 
                  extraLabel={extraColumn}
                  isLast={i === arr.length - 1}
                  showView={["Customers", "Employees", "Support Staff", "Accountants"].includes(title)}
                  onView={() => { setSelectedUser(user); setViewOpen(true); }}
                  onEdit={() => navigate(`${editRoutePrefix}/${user.user_guid}`)}
                  onDelete={() => setDeleteConfirm({ open: true, userGuid: user.user_guid, vehicleGuid: user.vehicle_guid })}
                />
              ))}
            </Box>
          </Box>
        </Box>
      )}

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(filteredUsers.length / perPage)}
        totalItems={filteredUsers.length}
        itemsPerPage={perPage}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
        itemLabel={title.toLowerCase().replace(/s$/, "")}
      />


      {/* Notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: "12px", fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <CustomerViewModal 
        open={viewOpen} 
        onClose={() => setViewOpen(false)} 
        user={selectedUser} 
        type={title}
      />

      {/* ── delete confirmation dialog ── */}
      <Dialog 
        open={deleteConfirm.open} 
        onClose={() => setDeleteConfirm({ open: false, userGuid: null, vehicleGuid: null })}
        PaperProps={{ sx: { borderRadius: "16px", p: 1, maxWidth: "360px" } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 700, color: "#111827" }}>
          <AlertTriangle size={24} style={{ color: "#EF4444" }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <p style={{ margin: 0, fontSize: 15, color: "#4B5563", lineHeight: 1.5 }}>
            Are you sure you want to delete this {title.toLowerCase()}? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteConfirm({ open: false, userGuid: null, vehicleGuid: null })}
            sx={{ textTransform: "none", fontWeight: 600, color: "#6B7280" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            sx={{ 
              textTransform: "none", fontWeight: 600, 
              backgroundColor: "#EF4444", "&:hover": { backgroundColor: "#DC2626" },
              borderRadius: "8px", px: 3
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

UserList.propTypes = {
  users: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  detailsKey: PropTypes.string.isRequired,
  addRoute: PropTypes.string.isRequired,
  editRoutePrefix: PropTypes.string.isRequired,
  fetchData: PropTypes.func.isRequired,
};

export default React.memo(UserList);
