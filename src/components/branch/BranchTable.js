// src/components/branch/BranchTable.js
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../DynamicComponents/Pagination';
import {
  Box,
  Button,
  IconButton,
  Typography,
  TextField,
  Paper,
  Avatar,
  Stack,
  Tooltip,
  Card,
  CardContent,
  Menu,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Home,
} from 'lucide-react';
import SectionHeader from '../common/Header';
import apiEndpoints from '../../apiconfig';
import { Snackbar, Alert } from "@mui/material";
import { useLoading } from '../../pages/LoadingContext';

const BranchTable = () => {
  const { show, hide } = useLoading();
  const navigate = useNavigate();
  
  const [branches, setBranches] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchBranches = async () => {
    try {
      // show();
      const resp = await fetch(apiEndpoints.branches, { 
        method: "GET", 
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } 
      });
      const json = await resp.json();

      if (json.success && Array.isArray(json.data)) {
        const baseForImages = (apiEndpoints.branches || "").replace('branches.php', '');
        const formatted = json.data.map(b => ({
          id: b.branch_id,
          branchName: b.branch_name,
          branchCode: b.branch_code,
          contactNumber: b.contact_number,
          email: b.email,
          address: b.address,
          city: b.city,
          state: b.state,
          country: b.country,
          isHeadOffice: b.is_head_office == 1,
          imagePreview: b.image_path ? `${baseForImages}${b.image_path}` : ""
        }));
        setBranches(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      // hide();
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);


  const filtered = branches.filter(b => {
    const q = filterText.toLowerCase();
    return (
      (b.branchName || "").toLowerCase().includes(q) ||
      (b.city || "").toLowerCase().includes(q) ||
      (b.branchCode || "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this branch?")) return;
    try {
      show();
      const res = await fetch(`${apiEndpoints.branches}?id=${id}`, { 
        method: "DELETE", 
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } 
      });
      const data = await res.json();
      if (data.success) {
        setSnackbar({ open: true, message: 'Branch deleted.', severity: 'success' });
        fetchBranches();
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete.', severity: 'error' });
    } finally {
      hide();
    }
  };


  return (
    <Box sx={{ p: { xs: 1.5, sm: 3, md: 4 }, minHeight: "100vh", backgroundColor: "#F9FAFB" }}>
      <SectionHeader />


      <Box sx={{ display: "flex", justifyContent: "flex-start", alignItems: "center", mb: 4, gap: 2 }}>
        <Box sx={{ position: "relative", width: { xs: "100%", sm: 500 } }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", zIndex: 1 }} />
          <TextField
            placeholder="Search by name, city or code..."
            fullWidth
            size="small"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                paddingLeft: "38px",
                borderRadius: "12px",
                backgroundColor: "#fff",
                border: "1px solid #E2E8F0",
                height: '45px',
                "& fieldset": { border: "none" },
                "&.Mui-focused": { border: '1px solid #0EA5E9' }
              }
            }}
          />
        </Box>
      </Box>

      <Paper sx={{ borderRadius: "20px", border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", overflow: "hidden" }}>
        <style>{`
          .hide-scrollbar::-webkit-scrollbar { height: 6px; }
          .hide-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
          .hide-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
          .hide-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}</style>
        <Box className="hide-scrollbar" sx={{ width: "100%", overflowX: "auto", position: "relative" }}>
          <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <Box component="thead">
              <Box component="tr" sx={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <Box component="th" sx={tableHeaderStyle}>Branch Details</Box>
                <Box component="th" sx={tableHeaderStyle}>Contact Info</Box>
                <Box component="th" sx={tableHeaderStyle}>Location</Box>
                <Box component="th" sx={tableHeaderStyle}>Type</Box>
                <Box component="th" sx={{ ...tableHeaderStyle, textAlign: "right" }}>Actions</Box>
              </Box>
            </Box>
            <Box component="tbody">
              {paginated.map((b) => (
                <Box 
                  component="tr" 
                  key={b.id} 
                  sx={{ 
                    borderBottom: "1px solid #F1F5F9", 
                    "&:hover": { backgroundColor: "#F8FAFC" }, 
                    transition: "0.2s" 
                  }}
                >
                  <Box component="td" sx={tableCellStyle}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      {b.imagePreview ? (
                        <Avatar src={b.imagePreview} sx={{ width: 44, height: 44, borderRadius: "10px" }} />
                      ) : (
                        <Box sx={{ width: 44, height: 44, borderRadius: "10px", bgcolor: "#0EA5E9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                          {b.branchName.charAt(0)}
                        </Box>
                      )}
                      <Box>
                        <Typography sx={{ fontWeight: 600, color: "#1E293B" }}>{b.branchName}</Typography>
                        <Typography sx={{ fontSize: 12, color: "#64748B" }}>Code: {b.branchCode || 'N/A'}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box component="td" sx={tableCellStyle}>
                    <Stack spacing={0.5}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#475569", fontSize: 13 }}>
                        <Phone size={14} /> {b.contactNumber}
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#475569", fontSize: 13 }}>
                        <Mail size={14} /> {b.email}
                      </Box>
                    </Stack>
                  </Box>
                  <Box component="td" sx={tableCellStyle}>
                    <Box sx={{ display: "flex", alignItems: "start", gap: 1, color: "#475569", fontSize: 13, maxWidth: 200 }}>
                      <MapPin size={14} style={{ marginTop: 3 }} /> 
                      <Box>
                        <Typography sx={{ fontSize: 13 }}>{b.city}, {b.state}</Typography>
                        <Typography sx={{ fontSize: 12, color: "#94A3B8" }} noWrap>{b.address}</Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box component="td" sx={tableCellStyle}>
                    <Box sx={{ 
                      px: 1.5, py: 0.5, borderRadius: "6px", width: "fit-content",
                      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                      bgcolor: b.isHeadOffice ? "#ECFDF5" : "#F5F3FF",
                      color: b.isHeadOffice ? "#10B981" : "#0EA5E9"
                    }}>
                      {b.isHeadOffice ? "Head Office" : "Standard"}
                    </Box>
                  </Box>
                  <Box component="td" sx={{ ...tableCellStyle, textAlign: "right" }}>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton 
                          size="small" 
                          onClick={() => navigate(`/add-branch?id=${b.id}`)}
                          sx={{ color: "#3B82F6", bgcolor: "#EFF6FF", "&:hover": { bgcolor: "#DBEAFE" } }}
                        >
                          <Pencil size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDelete(b.id)}
                          sx={{ color: "#EF4444", bgcolor: "#FEF2F2", "&:hover": { bgcolor: "#FEE2E2" } }}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Box>
              ))}
              {filtered.length === 0 && (
                <Box component="tr">
                  <Box component="td" colSpan={5} sx={{ py: 10, textAlign: "center" }}>
                    <Building2 size={48} style={{ color: "#CBD5E1", marginBottom: 16 }} />
                    <Typography sx={{ color: "#64748B", fontWeight: 600 }}>No branches found</Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: "12px" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

const tableHeaderStyle = {
  textAlign: "left", padding: "16px", fontSize: "12px",
  fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em"
};

const tableCellStyle = { padding: "16px" };

export default BranchTable;