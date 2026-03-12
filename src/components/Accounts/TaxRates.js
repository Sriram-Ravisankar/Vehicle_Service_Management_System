import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiInbox } from 'react-icons/fi';
import {
    Box, Stack, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, IconButton, Typography, Checkbox, Menu, MenuItem, InputAdornment, Button
} from '@mui/material';
import Pagination from '../DynamicComponents/Pagination';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { FaTrash } from "react-icons/fa";
import SectionHeader from '../common/Header';


const TaxRates = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 1;
    const [selected, setSelected] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuRowId, setMenuRowId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [rows, setRows] = useState([]);
    const [editRowId, setEditRowId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        accountTaxName: '',
        taxRate: '',
        taxNumber: '',
    });

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const stored = sessionStorage.getItem('taxRates');
        if (stored) {
            setRows(JSON.parse(stored));
        }
    }, []);


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


    const handleSelectAllClick = (event) => {
        setSelected(event.target.checked ? rows.map((r) => r.id) : []);
    };

    const handleClick = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleMenuOpen = (event, id) => {
        setAnchorEl(event.currentTarget);
        setMenuRowId(id);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setMenuRowId(null);
    };

    const handleEdit = (id) => {
        const row = rows.find((r) => r.id === id);
        navigate('/Addtax', { state: { rowData: row } });  // Passing data to Addtax page
        handleMenuClose();
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = (id) => {
        const updatedRows = rows.map((row) =>
            row.id === id ? { ...row, ...editFormData } : row
        );
        setRows(updatedRows);
        sessionStorage.setItem('taxRates', JSON.stringify(updatedRows));
        setEditRowId(null);
    };


    const handleCancel = () => {
        setEditRowId(null);
    };

    const handleDelete = (id) => {
        const updated = rows.filter((row) => row.id !== id);
        setRows(updated);
        sessionStorage.setItem('taxRates', JSON.stringify(updated));
        handleMenuClose();
    };



    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mt: 2, mb: 2, p: 3 }}>

                <SectionHeader/>


                <Box mt={2} mb={2} display="flex" justifyContent="flex-end">
                    <TextField
                        variant="outlined"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        sx={{
                            backgroundColor: "#f5f8fc",
                            borderRadius: 1,
                            width: "300px"
                        }}
                    />
                </Box>

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
                                <TableCell>Account Tax Name</TableCell>
                                <TableCell>Tax Rate (%)</TableCell>
                                <TableCell>Tax Number</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length === 0 || rows.filter((r) =>
                                r.accountTaxName.toLowerCase().includes(searchQuery.toLowerCase())
                            ).length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                                            <FiInbox size={50} style={{ marginBottom: 8 }} />
                                            <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                                                No data available
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows
                                    .filter((r) =>
                                        r.accountTaxName.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map((row) => {
                                        const isEditing = editRowId === row.id;
                                        return (
                                            <TableRow key={row.id} hover selected={selected.includes(row.id)}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selected.includes(row.id)}
                                                        onChange={() => handleClick(row.id)}
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            name="accountTaxName"
                                                            value={editFormData.accountTaxName}
                                                            onChange={handleEditChange}
                                                            size="small"
                                                        />
                                                    ) : (
                                                        row.accountTaxName
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            name="taxRate"
                                                            value={editFormData.taxRate}
                                                            onChange={handleEditChange}
                                                            size="small"
                                                        />
                                                    ) : (
                                                        row.taxRate
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {isEditing ? (
                                                        <TextField
                                                            name="taxNumber"
                                                            value={editFormData.taxNumber}
                                                            onChange={handleEditChange}
                                                            size="small"
                                                        />
                                                    ) : (
                                                        row.taxNumber
                                                    )}
                                                </TableCell>

                                                <TableCell>
                                                    {isEditing ? (
                                                        <>
                                                            <IconButton onClick={() => handleSave(row.id)} color="primary">
                                                                <SaveIcon />
                                                            </IconButton>
                                                            <IconButton onClick={handleCancel} color="error">
                                                                <CancelIcon />
                                                            </IconButton>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <IconButton onClick={(e) => handleMenuOpen(e, row.id)}><MoreVertIcon /></IconButton>
                                                            <Menu
                                                                anchorEl={anchorEl}
                                                                open={Boolean(anchorEl) && menuRowId === row.id}
                                                                onClose={handleMenuClose}
                                                            >
                                                                <MenuItem onClick={() => handleEdit(row.id)}>Edit</MenuItem>
                                                                <MenuItem onClick={() => handleDelete(row.id)}>Delete</MenuItem>
                                                            </Menu>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                            )}
                        </TableBody>

                    </Table>
                </TableContainer>

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
                                "&:hover": { bgcolor: "#rgba(249, 115, 22, 0.9)" },
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
            </Paper>
        </Box>
    );
};

export default TaxRates;