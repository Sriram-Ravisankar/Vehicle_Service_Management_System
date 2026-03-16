import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, IconButton, Typography,
    Checkbox, Select, MenuItem, Menu, Snackbar, Button, Stack
} from '@mui/material';
import { FaTrash } from "react-icons/fa";
import Pagination from '../DynamicComponents/Pagination';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Delete as DeleteIcon,
    Settings as SettingsIcon,
    Edit as EditIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import SectionHeader from '../common/Header';
import apiEndpoints from '../../apiconfig';

const PaymentMethod = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 1;
    const [rows, setRows] = useState([]);

    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState([]);
    const [isSelectAll, setIsSelectAll] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [paymentMethods, setPaymentMethods] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');  // Search query state

    // Normalize for duplicate check
    const normalizedPaymentTypes = useMemo(() =>
        paymentMethods.map((method) =>
            method.paymentType.trim().toLowerCase()
        ), [paymentMethods]
    );

    const fetchPaymentMethods = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const res = await fetch(apiEndpoints.paymentMethods, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setPaymentMethods(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch payment methods:", err);
        }
    };

    useEffect(() => {
        fetchPaymentMethods();
    }, [location.key]);

    // Remove duplicates from table display
    const uniquePaymentMethods = useMemo(() => {
        const seen = new Set();
        return paymentMethods.filter((item) => {
            const key = item.paymentType.trim().toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }, [paymentMethods]);

    // Filter payment methods based on search query
    const filteredPaymentMethods = useMemo(() => {
        return uniquePaymentMethods.filter((method) =>
            method.paymentType.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [uniquePaymentMethods, searchQuery]);

    const handleSelectAllClick = (event) => {
        const isChecked = event.target.checked;
        setIsSelectAll(isChecked);
        setSelected(isChecked ? filteredPaymentMethods.map((row) => row.id) : []);
    };

    const handleRowClick = (id) => {
        setSelected((prev) => {
            const newSelected = prev.includes(id) 
                ? prev.filter((item) => item !== id)
                : [...prev, id];
            
            // Update select all state based on whether all items are selected
            setIsSelectAll(newSelected.length === filteredPaymentMethods.length);
            return newSelected;
        });
    };

    const handleMenuClick = (event, id) => {
        setAnchorEl(event.currentTarget);
        setSelectedId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedId(null);
    };

    const handleEdit = () => {
        const toEdit = paymentMethods.find((m) => m.id === selectedId);
        navigate('/addpayments', { state: { toEdit, isEdit: true } });
        handleMenuClose();
    };
    const handleSelectAll = () => {
        const allSelected = selected.length === filteredPaymentMethods.length;
        const newSelected = allSelected ? [] : filteredPaymentMethods.map(row => row.id);

        setSelected(newSelected);
    };
    const handleDeleteSelected = async () => {
        const token = sessionStorage.getItem("token");
        for (const id of selected) {
            await fetch(`${apiEndpoints.paymentMethods}&id=${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
        }
        setSelected([]);
        fetchPaymentMethods();
    };

    const handleDelete = async () => {
        const token = sessionStorage.getItem("token");
        await fetch(`${apiEndpoints.paymentMethods}&id=${selectedId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchPaymentMethods();
        handleMenuClose();
    };

    const handleAdd = () => {
        navigate('/addpayments');
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Paper sx={{ width: '100%', mt: 2, mb: 2, boxShadow: 'none' }}>
                
                <SectionHeader/>

                {/* Selector and Search */}
                <Box sx={{
                    display: 'flex', justifyContent: 'flex-end',
                    alignItems: 'center', p: 2, gap: 2
                }}>
                    <TextField
                        placeholder="Search..."
                        size="small"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{
                            bgcolor: '#F8F9FA',
                            maxWidth: 300,
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: '#e0e0e0' },
                            },
                        }}
                    />
                </Box>

                {/* Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selected.length > 0 && selected.length < filteredPaymentMethods.length}
                                        checked={filteredPaymentMethods.length > 0 && selected.length === filteredPaymentMethods.length}
                                        onChange={handleSelectAllClick}
                                    />
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center', fontWeight: 500, color: '#2B3445' }}>
                                    Payment Type
                                </TableCell>
                                <TableCell sx={{ textAlign: 'center', fontWeight: 500, color: '#2B3445' }}>
                                    Action
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPaymentMethods.map((row) => (
                                <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: '#F8F9FA' } }}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selected.includes(row.id)}
                                            onChange={() => handleRowClick(row.id)}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>{row.paymentType}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <IconButton size="small" onClick={(e) => handleMenuClick(e, row.id)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                        <Menu
                                            anchorEl={anchorEl}
                                            open={Boolean(anchorEl) && selectedId === row.id}
                                            onClose={handleMenuClose}
                                        >
                                            <MenuItem onClick={handleEdit}>
                                                <EditIcon sx={{ mr: 1 }} /> Edit
                                            </MenuItem>
                                            <MenuItem onClick={handleDelete}>
                                                <DeleteIcon sx={{ mr: 1 }} /> Delete
                                            </MenuItem>
                                        </Menu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Footer */}
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
                                checked={selected.length === filteredPaymentMethods.length && filteredPaymentMethods.length > 0}
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

            </Paper>
        </Box>
    );
};

export default PaymentMethod;
