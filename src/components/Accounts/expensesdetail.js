import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    InputAdornment
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import apiEndpoints from '../../apiconfig';

const ExpensesForm = () => {
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: ''
    });

    const [filteredExpenses, setFilteredExpenses] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchFilteredExpenses = async () => {
        const token = sessionStorage.getItem("token");
        try {
            const res = await fetch(apiEndpoints.expenses, { headers: { Authorization: `Bearer ${token}` } });
            const rawExpenses = await res.json();
            
            const startDate = new Date(formData.startDate);
            const endDate = new Date(formData.endDate);
        
            const filtered = [];
        
            rawExpenses.forEach((entry) => {
                const entryDate = new Date(entry.date);
                if (!formData.startDate || !formData.endDate || (entryDate >= startDate && entryDate <= endDate)) {
                    entry.expenses.forEach((expense) => {
                        filtered.push({
                            ...expense,
                            mainLabel: entry.mainLabel,
                            status: entry.status,
                            date: entry.date,
                            branch: entry.branch
                        });
                    });
                }
            });
            setFilteredExpenses(filtered);
        } catch (err) {
            console.error("Filter expenses failed:", err);
        }
    };
    


    const handleSubmit = (e) => {
        e.preventDefault();
        fetchFilteredExpenses();
    };

    useEffect(() => {
        fetchFilteredExpenses();
    }, []);

    return (
        <Box
            sx={{
                width: '100%',
                p: 3,
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <Paper
                sx={{
                    width: '100%',
                    maxWidth: '800px',
                    p: 4,
                    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                    borderRadius: '8px'
                }}
            >
                {/* Header */}
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 'bold',
                        mb: 4,
                        color: '#333'
                    }}
                >
                    Monthly Expenses Report
                </Typography>

                {/* Subheader */}
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 'bold',
                        mb: 3,
                        color: '#555'
                    }}
                >
                    EXPENSES DETAILS
                </Typography>

                {/* Form */}
                <Box component="form" onSubmit={handleSubmit}>
                    <Typography
                        variant="body1"
                        sx={{ mb: 1, fontWeight: 'bold', color: '#333' }}
                    >
                        Start Date*
                    </Typography>
                    <TextField
                        fullWidth
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        sx={{ mb: 3 }}

                    />

                    <Typography
                        variant="body1"
                        sx={{ mb: 1, fontWeight: 'bold', color: '#333' }}
                    >
                        End Date*
                    </Typography>
                    <TextField
                        fullWidth
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        sx={{ mb: 4 }}

                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            py: 1.5,
                            backgroundColor: '#10AADF',
                            color: 'white',
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: '#09B3F1'
                            }
                        }}
                    >
                        SUBMIT
                    </Button>
                </Box>

                {/* Expenses Table */}
                {filteredExpenses.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Filtered Expense Entries
                        </Typography>

                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Expense Label</TableCell>
                                        <TableCell>Amount</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Main Label</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Branch</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredExpenses.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.expenseLabel}</TableCell>
                                            <TableCell>{row.expenseAmount}</TableCell>
                                            <TableCell>{row.date}</TableCell>
                                            <TableCell>{row.mainLabel}</TableCell>
                                            <TableCell>{row.status}</TableCell>
                                            <TableCell>{row.branch}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>

                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default ExpensesForm;
