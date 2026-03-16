// src/pages/Expenses.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Button,
  Checkbox,
  Stack,

} from '@mui/material';
import Pagination from '../DynamicComponents/Pagination';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from "react-icons/fa";
import SectionHeader from '../common/Header';
import apiEndpoints from '../../apiconfig';

const Expenses = () => {
  const [tabValue, setTabValue] = useState(0);
  const [expensesData, setExpensesData] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState([]);


    const fetchExpenses = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await fetch(apiEndpoints.expenses, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setExpensesData(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch expenses:", err);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 1) {
      navigate('/expensesdetail');
    }
  };
  const handleSelectAll = () => {
    const allSelected = selected.length === rows.length;
    const newSelected = allSelected ? [] : rows.map(row => row.id);
    setSelected(newSelected);
  };


  const handleDeleteSelected = async () => {
    const token = sessionStorage.getItem("token");
    for (const id of selected) {
        await fetch(`${apiEndpoints.expenses}&id=${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
    }
    setSelected([]);
    fetchExpenses();
  };
  const handleMenuOpen = (event, rowId) => {
    setAnchorEl(event.currentTarget);
    setMenuRowId(rowId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRowId(null);
  };

  const handleEdit = (rowId) => {
    const rowToEdit = expensesData.find((row) => row.id === rowId);
    navigate('/Addexpenses', { state: { rowToEdit } });
    handleMenuClose();
  };

  const handleDelete = async (rowId) => {
    const token = sessionStorage.getItem("token");
    await fetch(`${apiEndpoints.expenses}&id=${rowId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    fetchExpenses();
    handleMenuClose();
  };

  return (
    <Box sx={{ width: '100%', p: 3,mt: 2, }}>
      <Paper sx={{
        width: '100%',
        boxShadow: 'none',
        borderRadius: '8px'
      }}>

       <SectionHeader/>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                color: '#2B3445',
                fontSize: '0.875rem',
                minHeight: '48px',
                '&.Mui-selected': {
                  color: '#09B3F1',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#09B3F1',
              }
            }}
          >
            <Tab label="EXPENSE LIST" />
            <Tab label="MONTHLY EXPENSE REPORTS" />
          </Tabs>
        </Box>

        {/* Table Content */}
        <Box sx={{ p: 3 }}>
          {tabValue === 0 && (
            expensesData.length > 0 ? (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Main Label</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Branch</TableCell>
                      <TableCell>Expenses Count</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expensesData.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.mainLabel}</TableCell>
                        <TableCell>{row.status}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>{row.branch}</TableCell>
                        <TableCell>{row.expenses.length}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={(e) => handleMenuOpen(e, row.id)}>
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && menuRowId === row.id}
                            onClose={handleMenuClose}
                          >
                            <MenuItem onClick={() => handleEdit(row.id)}>
                              <EditIcon fontSize="small" sx={{ mr: 1 }} /> Edit
                            </MenuItem>
                            <MenuItem onClick={() => handleDelete(row.id)}>
                              <DeleteIcon fontSize="small" sx={{ mr: 1 }} /> Delete
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="h6" align="center" sx={{ color: '#757575', mt: 4 }}>
                No Expense Data Found
              </Typography>
            )
          )}
        </Box>
      </Paper>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      <Box mt={4} mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="contained"
            onClick={handleSelectAll}
            sx={{
              bgcolor: "rgba(139, 92, 246, 0.9)",
              "&:hover": { bgcolor: "rgba(139, 92, 246, 0.9)" },
              display: "flex",
              alignItems: "center",
              px: 2,
              py: 1,
              borderRadius: "4px",
            }}
          >
            <Checkbox
              checked={selected.length === rows.length && rows.length > 0}
              onChange={handleSelectAll}
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
      </Box>


    </Box>
  );
};

export default Expenses;
