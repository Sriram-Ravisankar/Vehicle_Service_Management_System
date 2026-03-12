import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useLocation } from 'react-router-dom';

const AddTax = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.rowData;

  const [form, setForm] = useState({
    taxName: '',
    taxRate: '',
    taxNumber: '',
  });

  useEffect(() => {
    if (editData) {
      setForm({
        taxName: editData.accountTaxName,
        taxRate: editData.taxRate,
        taxNumber: editData.taxNumber,
      });
    }
  }, [editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    const existing = JSON.parse(sessionStorage.getItem('taxRates')) || [];
  
    const newEntry = {
      id: editData?.id || Date.now(),
      accountTaxName: form.taxName,
      taxRate: parseFloat(form.taxRate),
      taxNumber: parseInt(form.taxNumber),
    };
  
    let updated;
  
    if (editData) {
      updated = existing.map((item) =>
        item.id === editData.id ? newEntry : item
      );
    } else {
      updated = [...existing, newEntry];
    }
  
    sessionStorage.setItem('taxRates', JSON.stringify(updated));
    navigate('/taxrates');
  };
  
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ px: 2, pt: 2 }}>
      {/* Top left back button with title */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={handleBack} size="large">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1 }}>
          {editData ? 'Edit Tax Rate' : 'Add Tax Rate'}
        </Typography>
      </Box>

      {/* Left-aligned form */}
      <Box sx={{ maxWidth: 500, ml: 2 }}>
        <Paper sx={{ p: 2 }}>
          <TextField
            label="Account Tax Name"
            name="taxName"
            value={form.taxName}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Tax Rate (%)"
            name="taxRate"
            type="number"
            value={form.taxRate}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Tax Number"
            name="taxNumber"
            type="number"
            value={form.taxNumber}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmit}
            fullWidth
            sx={{
              backgroundColor: '#10AADF',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#09B3F1' },
            }}
          >
            {editData ? 'Update' : 'Add'}
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default AddTax;