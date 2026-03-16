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
import apiEndpoints from '../../apiconfig';

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

  const handleSubmit = async () => {
    const token = sessionStorage.getItem("token");
    const payload = {
      id: editData?.id,
      accountTaxName: form.taxName,
      taxRate: parseFloat(form.taxRate),
      taxNumber: form.taxNumber,
    };

    try {
      const res = await fetch(apiEndpoints.taxRates, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (result.success) {
        navigate("/taxrates");
      }
    } catch (err) {
      console.error("Save tax rate failed:", err);
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ 
      px: { xs: 3, sm: 4, md: 6 }, 
      py: { xs: 2.5, sm: 4 },
      width: "100%",
      maxWidth: "100%",
      overflowX: "hidden"
    }}>
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