// EditJobCard.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextareaAutosize,
  Paper,
  Grid,
  Divider
} from '@mui/material';

const EditJobCard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(location.state?.card || {
    jobCardNo: `JC-${Date.now().toString().slice(-6)}`,
    customerName: '',
    mobile: '',
    email: '',
    vehicleNo: '',
    make: '',
    model: '',
    serviceType: '',
    fuelType: '',
    status: 'Approval Pending',
    arrivalDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    amount: '0',
    advisor: 'Default Advisor',
    rentalValue: '',
    rentalModel: '',
    serviceFactor: '',
    customerConcerns: '',
    advancePayment: '',
    corporateName: '',
    productionCloserBefore: '',
    availableForPurchase: false,
    purchaseDate: '',
    purchaseTitle: '',
    effectiveContact: '',
    firstOpinion: '',
    qSelect: '',
    source: '',
    hardenedCompany: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const existingCards = JSON.parse(localStorage.getItem('jobCards')) || [];
    const updatedCards = existingCards.map(card => 
      card.jobCardNo === form.jobCardNo ? form : card
    );
    localStorage.setItem('jobCards', JSON.stringify(updatedCards));
    navigate('/');
  };

  return (
    <Box sx={{ 
      px: { xs: 3, sm: 4, md: 6 }, 
      py: { xs: 2.5, sm: 4 },
      maxWidth: '900px', 
      mx: 'auto', 
      mt: 3, 
      bgcolor: 'background.paper', 
      boxShadow: 3, 
      borderRadius: 2 
    }}>
      <Typography variant="h4" component="h2" align="center" sx={{ mb: 3 }}>
        Job Cards
      </Typography>
      
      <form onSubmit={handleSubmit}>
        {/* Search Section */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ mr: 2 }}>1/8 Number / Other Number</Typography>
            <TextField
              name="vehicleNo"
              value={form.vehicleNo}
              onChange={handleChange}
              placeholder="Search Using Registration No / Customer Name / Mobile No / Email / Corporate Name / Vehicle"
              fullWidth
              size="small"
            />
          </Box>

          {/* Customer Info Section */}
          <Paper elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <TextField
                    label="Customer"
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    size="small"
                  />
                  <Typography variant="caption">25</Typography>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="serviceType"
                    value={form.serviceType}
                    onChange={handleChange}
                    label="Type"
                  >
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value="VH">VH</MenuItem>
                    <MenuItem value="Corporate">Corporate</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <TextField
                    label="Category No"
                    size="small"
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        {/* Rental Car Section */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Rental Car (e.g. Hydola HG, Novai Metal, Swim Spell) *</Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="Value *"
                name="rentalValue"
                value={form.rentalValue}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Model *"
                name="rentalModel"
                value={form.rentalModel}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Model"
                name="model"
                value={form.model}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Vehicle Closer Section */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Vehicle Closer</Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Fuel Type</InputLabel>
                <Select
                  name="fuelType"
                  value={form.fuelType}
                  onChange={handleChange}
                  label="Fuel Type"
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Petrol">Petrol</MenuItem>
                  <MenuItem value="Diesel">Diesel</MenuItem>
                  <MenuItem value="Electric">Electric</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Service Type</InputLabel>
                <Select
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleChange}
                  label="Service Type"
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Premium">Premium</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Service Factor Select</InputLabel>
                <Select
                  name="serviceFactor"
                  value={form.serviceFactor}
                  onChange={handleChange}
                  label="Service Factor Select"
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Express">Express</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <TextField
              label="Production Closer Before"
              name="productionCloserBefore"
              value={form.productionCloserBefore}
              onChange={handleChange}
              fullWidth
              size="small"
            />
          </Box>
        </Paper>

        {/* Customer Concerns */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <FormControl fullWidth>
            <InputLabel shrink>Enter Customer Concerns / Complaints (e.g. A/C not working)</InputLabel>
            <TextareaAutosize
              name="customerConcerns"
              onChange={handleChange}
              value={form.customerConcerns}
              minRows={4}
              style={{ width: '100%', padding: '8px', borderColor: '#c4c4c4', borderRadius: '4px' }}
            />
          </FormControl>
        </Paper>

        {/* Available for Purchase Section */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Available for full purchase:</Typography>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <TextField
                label="Date"
                type="date"
                name="purchaseDate"
                value={form.purchaseDate}
                onChange={handleChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Title"
                name="purchaseTitle"
                value={form.purchaseTitle}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Effective Contact"
                name="effectiveContact"
                value={form.effectiveContact}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="City + First Opinion"
                name="firstOpinion"
                value={form.firstOpinion}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Q Select and Source */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Q Select: Compare / Fines</InputLabel>
                <Select
                  name="qSelect"
                  value={form.qSelect}
                  onChange={handleChange}
                  label="Q Select: Compare / Fines"
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="Compare">Compare</MenuItem>
                  <MenuItem value="Fines">Fines</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <TextField
                label="Source: Multi-to-SIGSs"
                name="source"
                value={form.source}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Hardened Company */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Select: Hardened Company</InputLabel>
            <Select
              name="hardenedCompany"
              value={form.hardenedCompany}
              onChange={handleChange}
              label="Select: Hardened Company"
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value="Company A">Company A</MenuItem>
              <MenuItem value="Company B">Company B</MenuItem>
            </Select>
          </FormControl>
        </Paper>

        {/* Advance Payment */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e0e0e0', borderRadius: 1 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Advance Payment Call:</Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="Customer Name"
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Email ID"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Phone No"
                name="mobile"
                value={form.mobile}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Amount"
                name="advancePayment"
                value={form.advancePayment}
                onChange={handleChange}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Date"
                type="date"
                name="arrivalDate"
                value={form.arrivalDate}
                onChange={handleChange}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Add Contact Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            color="primary"
          >
            Add Contact
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ px: 4, py: 1.5 }}
            bgcolor="rgba(139, 92, 246, 0.9)"
          >
            Update Job Card
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default EditJobCard;