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

  useEffect(() => {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const expenseData = JSON.parse(sessionStorage.getItem('expenseData')) || [];

    if (rowToEdit) {
      const updatedEntry = { ...formData, expenses: expenseFields, id: rowToEdit.id };
      const updatedData = expenseData.map((row) =>
        row.id === rowToEdit.id ? updatedEntry : row
      );
      sessionStorage.setItem('expenseData', JSON.stringify(updatedData));
    } else {
      const newId = Date.now();
      const newEntry = { ...formData, expenses: expenseFields, id: newId };
      expenseData.push(newEntry);
      sessionStorage.setItem('expenseData', JSON.stringify(expenseData));
    }

    navigate('/expenses');
  };

  return (
    <Container>
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
              <MenuItem value="Main Branch">Main Branch</MenuItem>
              <MenuItem value="Sub Branch">Sub Branch</MenuItem>
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
            backgroundColor: 'rgba(249, 115, 22, 0.9)',
            color: 'FFFFFF',
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(249, 115, 22, 0.9)'
            }
          }}
        >
          {rowToEdit ? "UPDATE" : "SUBMIT"}
        </Button>
      </Box>
    </Container>
  );
};

export default AddExpense;
