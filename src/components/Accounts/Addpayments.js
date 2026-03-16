import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Paper,
  Snackbar,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';
import apiEndpoints from '../../apiconfig';

const AddPaymentMethod = () => {
  const [paymentType, setPaymentType] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // If editing, populate the form with existing data
  useEffect(() => {
    if (location.state?.isEdit) {
      setPaymentType(location.state.toEdit.paymentType || '');
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!paymentType.trim()) {
      setError('Payment type is required');
      setOpenSnackbar(true);
      return;
    }

    const token = sessionStorage.getItem("token");
    const payload = {
        id: location.state?.toEdit?.id,
        paymentType,
    };
    
    try {
      const res = await fetch(apiEndpoints.paymentMethods, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (result.success) {
          navigate('/payment-methods');
      }
    } catch (err) {
        console.error("Save payment method failed:", err);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ 
      px: { xs: 3, sm: 4, md: 6 }, 
      py: { xs: 2.5, sm: 4 },
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
      <Paper sx={{ width: '100%', p: 3, boxShadow: 'none' }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              sx={{ color: '#2B3445' }}
              onClick={() => navigate('/payment-methods')}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" sx={{ color: '#2B3445' }}>
              {location.state?.isEdit ? 'Edit Payment Method' : 'Add Payment Method'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton>
              <AddIcon />
            </IconButton>
            <IconButton>
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '600px' }}>
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                mb: 1,
                color: '#2B3445',
                '& .required': {
                  color: 'red',
                  ml: 0.5,
                }
              }}
            >
              Payment Type
              <span className="required">*</span>
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter Payment Type"
              value={paymentType}
              onChange={(e) => {
                setPaymentType(e.target.value);
                setError('');
              }}
              required
              error={!!error}
              helperText={error}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#fff',
                  '& fieldset': {
                    borderColor: '#10AADF',
                  },
                  '&:hover fieldset': {
                    borderColor: '#10AADF',
                  },
                }
              }}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#10AADF',
              color: '#FFFFFF',
              py: 1.5,
              textTransform: 'uppercase',
              '&:hover': {
                bgcolor: '#09B3F1',
              }
            }}
          >
            {location.state?.isEdit ? 'Update' : 'Submit'}
          </Button>
        </Box>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default AddPaymentMethod;