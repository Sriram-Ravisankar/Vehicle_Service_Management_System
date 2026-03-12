import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, IconButton, Paper, Select, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';

const AddIncome = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const rowToEdit = location.state?.rowToEdit;

  const [formData, setFormData] = useState({
    invoice: '',
    status: '',
    date: new Date().toISOString().split("T")[0],
    branch: '',
    outstandingAmount: '',
    mainLabel: '',
    paymentType: '',
  });

  const [incomeFields, setIncomeFields] = useState([{ incomeEntry: '', incomeLabel: '' }]);

  useEffect(() => {
    if (rowToEdit) {
      setFormData({
        invoice: rowToEdit.invoice || '',
        status: rowToEdit.status || '',
        date: rowToEdit.date || new Date().toISOString().split("T")[0],
        branch: rowToEdit.branch || '',
        outstandingAmount: rowToEdit.outstandingAmount || '',
        mainLabel: rowToEdit.mainLabel || '',
        paymentType: rowToEdit.paymentType || '',
      });
      setIncomeFields(rowToEdit.incomeFields || [{ incomeEntry: '', incomeLabel: '' }]);
    }
  }, [rowToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIncomeFieldChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFields = [...incomeFields];
    updatedFields[index][name] = value;
    setIncomeFields(updatedFields);
  };

  const addMoreIncomeFields = () => {
    setIncomeFields([...incomeFields, { incomeEntry: '', incomeLabel: '' }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const incomeData = JSON.parse(sessionStorage.getItem('incomeData')) || [];
  
    if (rowToEdit) {
      // Editing existing entry
      const updatedEntry = { ...formData, incomeFields, id: rowToEdit.id };
      const updatedData = incomeData.map((row) =>
        row.id === rowToEdit.id ? updatedEntry : row
      );
      sessionStorage.setItem('incomeData', JSON.stringify(updatedData));
    } else {
      // Adding new entry with unique id
      const newId = Date.now(); // or you can use a UUID for more uniqueness
      const newEntry = { ...formData, incomeFields, id: newId };
      incomeData.push(newEntry);
      sessionStorage.setItem('incomeData', JSON.stringify(incomeData));
    }
  
    navigate('/income');
  };
  

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => navigate('/income')}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">{rowToEdit ? "Edit Income" : "Add Income"}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton><AddIcon /></IconButton>
            <IconButton><SettingsIcon /></IconButton>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Typography sx={{ fontWeight: 500, mb: 2 }}>INCOME DETAILS</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography>Invoice *</Typography>
              <Select
                fullWidth
                name="invoice"
                value={formData.invoice}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="">Select Invoice</MenuItem>
                <MenuItem value="00000001">00000001</MenuItem>
                <MenuItem value="00000002">00000002</MenuItem>
              </Select>
            </Box>

            <Box>
              <Typography>Outstanding Amount</Typography>
              <TextField
                fullWidth
                name="outstandingAmount"
                placeholder="Total Amount"
                value={formData.outstandingAmount}
                onChange={handleChange}
              />
            </Box>

            <Box>
              <Typography>Status *</Typography>
              <Select
                fullWidth
                name="status"
                value={formData.status}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="">Select Status</MenuItem>
                <MenuItem value="Unpaid">Unpaid</MenuItem>
                <MenuItem value="Partially Paid">Partially Paid</MenuItem>
                <MenuItem value="Fully Paid">Fully Paid</MenuItem>
              </Select>
            </Box>

            <Box>
              <Typography>Main Label *</Typography>
              <TextField
                fullWidth
                name="mainLabel"
                placeholder="Enter Main Label"
                value={formData.mainLabel}
                onChange={handleChange}
              />
            </Box>

            <Box>
              <Typography>Date *</Typography>
              <TextField
                fullWidth
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />
            </Box>

            <Box>
              <Typography>Payment Type *</Typography>
              <Select
                fullWidth
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="">Select Payment Type</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="Card">Card</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
              </Select>
            </Box>

            <Box>
              <Typography>Branch *</Typography>
              <Select
                fullWidth
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                displayEmpty
              >
                <MenuItem value="">Select Branch</MenuItem>
                <MenuItem value="Main Branch">Main Branch</MenuItem>
                <MenuItem value="Sub Branch">Sub Branch</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* Income Entries */}
          <Box sx={{ mt: 4 }}>
            <Typography sx={{ fontWeight: 500, mb: 1 }}>Income Entries</Typography>
            {incomeFields.map((item, index) => (
              <Box
                key={index}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 2,
                  mb: 2
                }}
              >
                <TextField
                  fullWidth
                  name="incomeEntry"
                  placeholder="Enter Income Entry"
                  value={item.incomeEntry}
                  onChange={(e) => handleIncomeFieldChange(index, e)}
                />
                <TextField
                  fullWidth
                  name="incomeLabel"
                  placeholder="Enter Income Label"
                  value={item.incomeLabel}
                  onChange={(e) => handleIncomeFieldChange(index, e)}
                />
              </Box>
            ))}

            <Button
              onClick={addMoreIncomeFields}
              sx={{
                bgcolor: '#10AADF',
                color: '#FFFFFF',
                '&:hover': { bgcolor: '#09B3F1' },
                mb: 2
              }}
              startIcon={<AddIcon />}
            >
              Add More Fields
            </Button>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2, bgcolor: 'rgba(249, 115, 22, 0.9)', '&:hover': { bgcolor: 'rgba(249, 115, 22, 0.9)' } }}
          >
            {rowToEdit ? "UPDATE" : "SUBMIT"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddIncome;
