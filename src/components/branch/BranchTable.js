// src/components/Billing/BranchTable.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../DynamicComponents/Pagination';
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Menu,
  Avatar,
  Stack,
} from '@mui/material';
import { FaTrash } from "react-icons/fa";
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SectionHeader from '../common/Header';
import apiEndpoints from '../../apiconfig';
import { Snackbar, Alert } from "@mui/material";
import { useLoading } from '../../pages/LoadingContext';

const BranchTable = () => {
  const { show, hide } = useLoading();
  const [branches, setBranches] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentBranchId, setCurrentBranchId] = useState(null);
  const open = Boolean(anchorEl);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const navigate = useNavigate();

  // Fetch branches from backend
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        show();
        const resp = await fetch(apiEndpoints.branches, { method: "GET", headers:{
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        } });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
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
            imagePreview: b.image_path ? `${baseForImages}${b.image_path}` : ""
          }));
          setBranches(formatted);
        } else {
          console.error("Unexpected API response:", json);
        }
      } catch (err) {
        console.error("Failed to fetch branches:", err);
      }finally {
        hide();
      }
    };

    fetchBranches();
  }, []);

  const handleAddBranch = () => navigate('/add-branch');

  const handleSelectAllToggle = () => {
    if (selectedRows.length === branches.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(branches.map(b => b.id));
    }
  };

  const showDeleteModal = (count) => new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.45);
        z-index: 3000;
      `;

    const box = document.createElement('div');
    box.style.cssText = `
        background: #fff;
        padding: 20px;
        border-radius: 8px;
        width: 400px;
        max-width: calc(100% - 32px);
        box-shadow: 0 8px 24px rgba(2,6,23,0.2);
        font-family: Roboto, "Helvetica Neue", Arial, sans-serif;
      `;

    const title = document.createElement('div');
    title.textContent = `Delete ${count} selected branch(es)?`;
    title.style.cssText = 'font-weight:600; margin-bottom:8px; font-size:16px;';

    const desc = document.createElement('div');
    desc.textContent = 'This action cannot be undone.';
    desc.style.cssText = 'color: #555; margin-bottom:16px; font-size:14px;';

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex; justify-content:flex-end; gap:8px;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = `
        background: transparent;
        border: none;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 4px;
        font-size: 14px;
      `;

    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = 'Delete';
    confirmBtn.style.cssText = `
        background: #d32f2f;
        color: #fff;
        border: none;
        padding: 8px 12px;
        cursor: pointer;
        border-radius: 4px;
        font-size: 14px;
      `;

    cancelBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve(false);
    };

    confirmBtn.onclick = () => {
      document.body.removeChild(overlay);
      resolve(true);
    };

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(confirmBtn);

    box.appendChild(title);
    box.appendChild(desc);
    box.appendChild(btnRow);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
  const handleDeleteSelected = async () => {
    if (!selectedRows.length) return;

    const confirmed = await showDeleteModal(selectedRows.length);
    if (!confirmed) return;

    try {
      // delete each selected branch
      for (let id of selectedRows) {
        await fetch(`${apiEndpoints.branches}?id=${id}`, { method: "DELETE", headers:{
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        } });
      }

      setBranches(prev => prev.filter(b => !selectedRows.includes(b.id)));
      setSelectedRows([]);
      setSnackbar({ open: true, message: 'Selected branch(es) deleted.', severity: 'success' });
    } catch (err) {
      console.error('Failed to delete selected branches:', err);
      setSnackbar({ open: true, message: 'Failed to delete selected branch(es).', severity: 'error' });
    }
  };

  const handleRowSelect = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleMenuClick = (event, branchId) => {
    setAnchorEl(event.currentTarget);
    setCurrentBranchId(branchId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentBranchId(null);
  };

  const handleEdit = () => {
    if (currentBranchId) {
      const branchToEdit = branches.find(branch => branch.id === currentBranchId);
      if (branchToEdit) {
        navigate(`/add-branch?id=${currentBranchId}`);

      }
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (currentBranchId) {
      const confirmed = await showDeleteModal(1);
      if (!confirmed) return;

      try {
        await fetch(`${apiEndpoints.branches}?id=${currentBranchId}`, { method: "DELETE", headers:{
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        } });
        setBranches(prev => prev.filter(b => b.id !== currentBranchId));
        setSelectedRows(prev => prev.filter(id => id !== currentBranchId));
        setSnackbar({ open: true, message: 'Branch deleted.', severity: 'success' });
      } catch (err) {
        console.error('Failed to delete branch:', err);
        setSnackbar({ open: true, message: 'Failed to delete branch.', severity: 'error' });
      }
    }
    handleMenuClose();
  };

  const filtered = branches.filter(b => {
    const q = filterText.trim().toLowerCase();
    if (!q) return true;
    return (
      (b.branchName || "").toLowerCase().includes(q) ||
      (b.city || "").toLowerCase().includes(q) ||
      (b.address || "").toLowerCase().includes(q)
    );
  });

  return (
    <Box sx={{ p: 3, backgroundColor: '#fff' }}>
      {/* Responsive CSS */}
      <style>{`
        .bt-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .bt-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .bt-table-wrapper {
          margin-top: 10px;
          width: 100%;
          overflow-x: auto;
        }

        .bt-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }

        @media (max-width: 600px) {
          .bt-table {
            min-width: 700px;
          }

          .bt-header {
            align-items: flex-start;
          }

          .bt-actions {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (max-width: 450px) {
          .bt-table {
            min-width: 620px;
          }

          .bt-actions {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>

      <SectionHeader />

      {/* Header row */}
      <Box className="bt-header" mt={2} mb={2}>
        <Select defaultValue={10} sx={{ width: 75 }}>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>

        <Box className="bt-actions">
          <TextField
            placeholder="Search..."
            variant="outlined"
            size="small"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            sx={{
              backgroundColor: "#f1f3f4",
            borderRadius: "6px",
            width: { xs: "100%", sm: 250 },
            "& fieldset": { border: "none" },
            height: "40px",
            "& input": { padding: "10px" },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="disabled" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* TABLE */}
      <div className="bt-table-wrapper">
        <Table className="bt-table">
          <TableHead>
            <TableRow>
              {/* <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selectedRows.length > 0 && selectedRows.length < branches.length}
                  checked={branches.length > 0 && selectedRows.length === branches.length}
                  onChange={handleSelectAllToggle}
                />
              </TableCell> */}
              <TableCell>Image</TableCell>
              <TableCell>Branch Name</TableCell>
              <TableCell>Contact Number</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((branch) => (
              <TableRow key={branch.id} hover>
                {/* <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    checked={selectedRows.includes(branch.id)}
                    onChange={() => handleRowSelect(branch.id)}
                  />
                </TableCell> */}

                <TableCell>
                  {branch.imagePreview ? (
                    <Avatar src={branch.imagePreview} alt="Branch" sx={{ width: 40, height: 40 }} />
                  ) : (
                    <Box
                      sx={{
                        backgroundColor: '#f58220',
                        borderRadius: 2,
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        color: '#fff'
                      }}
                    >
                      {(branch.branchName || 'B').charAt(0)}
                    </Box>
                  )}
                </TableCell>

                <TableCell>{branch.branchName}</TableCell>
                <TableCell>{branch.contactNumber}</TableCell>
                <TableCell>{branch.email}</TableCell>
                <TableCell>{branch.address}</TableCell>

                <TableCell>
                  <IconButton onClick={(e) => handleMenuClick(e, branch.id)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#6b7280' }}>
                  No branches found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
        </MenuItem>

        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Bottom Buttons */}
      {/* <Box mt={4} mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="contained"
            onClick={handleSelectAllToggle}
            sx={{
              bgcolor: "rgba(249, 115, 22, 0.9)",
              "&:hover": { bgcolor: "rgba(249, 115, 22, 0.9)" },
              display: "flex",
              alignItems: "center",
              px: 2,
              py: 1,
              borderRadius: "4px",
            }}
          >
            <Checkbox
              checked={branches.length > 0 && selectedRows.length === branches.length}
              indeterminate={selectedRows.length > 0 && selectedRows.length < branches.length}
              onChange={handleSelectAllToggle}
              sx={{ color: "white", p: 0, pr: 1 }}
            />
            Select All
          </Button>

          <Button
            variant="contained"
            onClick={handleDeleteSelected}
            sx={{
              bgcolor: "red",
              "&:hover": { bgcolor: "darkred" },
              px: 2,
              py: 1.5,
              borderRadius: "4px",
              color: "white",
              minWidth: "auto",
            }}
          >
            <FaTrash size={16} />
          </Button>
        </Stack>
      </Box> */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BranchTable;