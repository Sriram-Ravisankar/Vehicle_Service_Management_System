import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate, useLocation } from 'react-router-dom';
import apiEndpoints from '../../apiconfig';

const AddExpense = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rowToEdit = location.state?.rowToEdit;

  const [formData, setFormData] = useState({
    mainLabel: '',
    status: '',
    date: new Date().toISOString().split("T")[0],
    branch: '',
  });

  const [expenseFields, setExpenseFields] = useState([
    { expenseAmount: '', expenseLabel: '' }
  ]);

  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchBranches = async () => {
        const token = sessionStorage.getItem("token");
        try {
            const res = await fetch(apiEndpoints.branches, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            const branchList = data.data || data;
            setBranches(Array.isArray(branchList) ? branchList : []);
        } catch (err) {
            console.error("Fetch branches failed:", err);
        }
    };
    fetchBranches();

    if (rowToEdit) {
      setFormData({
        mainLabel: rowToEdit.mainLabel || '',
        status: rowToEdit.status || '',
        date: rowToEdit.date || new Date().toISOString().split("T")[0],
        branch: rowToEdit.branch || '',
      });
      setExpenseFields(rowToEdit.expenses || [{ expenseAmount: '', expenseLabel: '' }]);
    }
  }, [rowToEdit]);

  const handleFieldChange = (index, name, value) => {
    const newFields = [...expenseFields];
    newFields[index][name] = value;
    setExpenseFields(newFields);
  };

  const addMoreFields = () => {
    setExpenseFields([...expenseFields, { expenseAmount: '', expenseLabel: '' }]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    const payload = {
        ...formData,
        expenses: expenseFields,
        id: rowToEdit?.id
    };

    try {
        const res = await fetch(apiEndpoints.expenses, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            navigate('/expenses');
        }
    } catch (err) {
        console.error("Save expense failed:", err);
    }
  };

  return (
    <Box sx={{ 
      px: { xs: 3, sm: 4, md: 6 }, 
      py: { xs: 2.5, sm: 4 },
      width: "100%",
      maxWidth: "100%",
      overflowX: "hidden"
    }}>
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 0',
        borderBottom: '1px solid #eee'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ marginLeft: 2 }}>
            {rowToEdit ? "Edit Expense" : "Add Expense"}
          </Typography>
        </Box>
        <Box>
          <IconButton>
            <SettingsIcon />
          </IconButton>
          <IconButton sx={{ backgroundColor: '#10AADF', color: 'FFFFFF', marginLeft: 1 }}>
            <AccountBalanceIcon />
          </IconButton>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 4 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          EXPENSE DETAILS
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
          <TextField
            required
            name="mainLabel"
            label="Main Label"
            placeholder="Enter Main Label"
            fullWidth
            value={formData.mainLabel}
            onChange={handleChange}
          />

          <FormControl fullWidth required>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formData.status}
              label="Status"
              onChange={handleChange}
            >
              <MenuItem value="">Select Status</MenuItem>
              <MenuItem value="Full Paid">Full Paid</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
              <MenuItem value="Partially Paid">Partially Paid</MenuItem>
            </Select>
          </FormControl>

          <TextField
            required
            name="date"
            type="date"
            label="Date"
            value={formData.date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth required>
            <InputLabel>Branch</InputLabel>
            <Select
              name="branch"
              value={formData.branch}
              label="Branch"
              onChange={handleChange}
            >
              <MenuItem value="">Select Branch</MenuItem>
              {branches.map((br) => (
                    <MenuItem key={br.branch_guid} value={br.branch_name}>{br.branch_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Button
          onClick={addMoreFields}
          variant="contained"
          sx={{
            backgroundColor: '#10AADF',
            color: 'FFFFFF',
            mb: 3,
            '&:hover': {
              backgroundColor: '#09B3F1'
            }
          }}
        >
          Add More Fields
        </Button>

        {expenseFields.map((field, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                required
                label="Expense Entry ($)"
                placeholder="Expense Amount"
                fullWidth
                name="expenseAmount"
                value={field.expenseAmount}
                onChange={(e) => handleFieldChange(index, 'expenseAmount', e.target.value)}
              />
              <TextField
                label="Expense Label"
                placeholder="Expense Entry Label"
                fullWidth
                name="expenseLabel"
                value={field.expenseLabel}
                onChange={(e) => handleFieldChange(index, 'expenseLabel', e.target.value)}
              />
            </Box>
          </Paper>
        ))}

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: 'rgba(139, 92, 246, 0.9)',
            color: 'FFFFFF',
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(139, 92, 246, 0.9)'
            }
          }}
        >
          {rowToEdit ? "UPDATE" : "SUBMIT"}
        </Button>
      </Box>
    </Box>
  );
};

export default AddExpense;
