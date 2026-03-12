import React, { useState, useEffect } from 'react';
import { Box, Button, Stack, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Checkbox, Tabs, Tab, IconButton, Menu, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Link, useNavigate } from 'react-router-dom';
import MonthlyIncomeReports from './MonthlyIncome';
import { FaTrash } from "react-icons/fa";
import Pagination from '../DynamicComponents/Pagination';
import SectionHeader from '../common/Header';
const Income = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selected, setSelected] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuRowId, setMenuRowId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;
  const [rows, setRows] = useState([
    {
      id: 1,
      customerName: 'Washingtone Ochieng',
      invoiceNumber: '00000003',
      amount: '198.00',
      paymentType: 'Cash',
      date: '2024-04-03',
      mainLabel: 'Sale Part'
    }
  ]);

  useEffect(() => {
    const storedData = JSON.parse(sessionStorage.getItem('incomeData')) || [];

    // Ensure each item has a unique ID
    const dataWithIds = storedData.map((item, index) => ({
      ...item,
      id: item.id ?? Date.now() + index // Assign a fallback ID if missing
    }));

    // Save back the updated data (with IDs) to sessionStorage
    sessionStorage.setItem('incomeData', JSON.stringify(dataWithIds));
    setRows(dataWithIds);
  }, []);


  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(rows.map((row) => row.id));
    } else {
      setSelected([]);
    }
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
    const rowToEdit = rows.find((row) => row.id === rowId);
    navigate('/addincome', { state: { rowToEdit } }); // Passing the data as state
    handleMenuClose();
  };

  const handleDelete = (rowId) => {
    console.log('Deleting row with ID:', rowId);
    console.log('Current rows:', rows);

    const updatedRows = rows.filter((row) => {
      console.log('Checking row:', row.id, 'vs', rowId);
      return row.id !== rowId;
    });

    console.log('Updated rows:', updatedRows);
    setRows(updatedRows);
    sessionStorage.setItem('incomeData', JSON.stringify(updatedRows));
    handleMenuClose();
  };

  const handleSelectAll = () => {
    const allSelected = selected.length === rows.length;
    const newSelected = allSelected ? [] : rows.map(row => row.id);
    setSelected(newSelected);
  };


  const handleDeleteSelected = () => {
    const updatedRows = rows.filter((row) => !selected.includes(row.id));
    setRows(updatedRows);
    setSelected([]);
    sessionStorage.setItem('taxRates', JSON.stringify(updatedRows));
  };

  const handleUpdate = (updatedRow) => {
    const updatedRows = rows.map((row) =>
      row.id === updatedRow.id ? updatedRow : row
    );
    setRows(updatedRows);
    sessionStorage.setItem('incomeData', JSON.stringify(updatedRows)); // Save updated data to sessionStorage
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Paper sx={{ width: '100%', mb: 2, mt: 2, boxShadow: 'none' }}>

        <SectionHeader/>


        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': { textTransform: 'none' },
              '& .Mui-selected': { color: '#10AADF' },
              '& .MuiTabs-indicator': { bgcolor: '#10AADF' }
            }}
          >
            <Tab label="INCOME LIST" />
            <Tab label="MONTHLY INCOME REPORTS" />
          </Tabs>
        </Box>

        {tabValue === 0 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < rows.length}
                      checked={rows.length > 0 && selected.length === rows.length}
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell>Invoice</TableCell>
                  <TableCell>Outstanding Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Main Label</TableCell>
                  <TableCell>Payment Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#10AADF' } }}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={selected.includes(row.id)} />
                    </TableCell>
                    <TableCell>{row.invoice}</TableCell>
                    <TableCell>{row.outstandingAmount}</TableCell>
                    <TableCell>{row.status}</TableCell>
                    <TableCell>{row.mainLabel}</TableCell>
                    <TableCell>{row.paymentType}</TableCell>
                    <TableCell>{row.date}</TableCell>
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
        )}

        {tabValue === 1 && <MonthlyIncomeReports />}
      </Paper>
      {tabValue === 0 && (
        <>
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
        </>
      )}

    </Box>
  );
};

export default Income;
