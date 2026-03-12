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

const AddPaymentMethod = () => {
  const [paymentType, setPaymentType] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // If editing, populate the form with existing data
  useEffect(() => {
    const editData = JSON.parse(sessionStorage.getItem('editPaymentMethod'));
    if (editData?.isEdit) {
      setPaymentType(editData.paymentType || '');
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
  
    if (!paymentType.trim()) {
      setError('Payment type is required');
      setOpenSnackbar(true);
      return;
    }
    const updatedData = {
        id: JSON.parse(sessionStorage.getItem('editPaymentMethod'))?.id || Date.now(),
        paymentType,
      };
    
      if (JSON.parse(sessionStorage.getItem('editPaymentMethod'))?.isEdit) {
        sessionStorage.setItem('updatePaymentMethod', JSON.stringify({ ...updatedData, isUpdate: true }));
      } else {
        sessionStorage.setItem('newPaymentMethod', JSON.stringify({ ...updatedData, isNew: true }));
      }
    
      sessionStorage.removeItem('editPaymentMethod');
      navigate('/payment-methods');
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Box sx={{ width: '100%', p: 2 }}>
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