import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, IconButton, Paper, Select, MenuItem } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';
import apiEndpoints from '../../apiconfig';

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

  const [invoices, setInvoices] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("token");
      try {
        const invRes = await fetch(`${apiEndpoints.Invoice}?list=1`, { headers: { Authorization: `Bearer ${token}` } });
        const invData = await invRes.json();
        setInvoices(Array.isArray(invData) ? invData : []);

        const brRes = await fetch(apiEndpoints.branches, { headers: { Authorization: `Bearer ${token}` } });
        const brData = await brRes.json();
        const branchList = brData.data || brData;
        setBranches(Array.isArray(branchList) ? branchList : []);
      } catch (err) {
        console.error("Fetch form data failed:", err);
      }
    };
    fetchData();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    const payload = {
        ...formData,
        incomeFields,
        id: rowToEdit?.id
    };

    try {
        const res = await fetch(apiEndpoints.income, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            navigate('/income');
        }
    } catch (err) {
        console.error("Save income failed:", err);
    }
  };
  

  return (
    <Box sx={{ 
      px: { xs: 3, sm: 4, md: 6 }, 
      py: { xs: 2.5, sm: 4 },
      width: '100%',
      maxWidth: '100%',
      overflowX: 'hidden'
    }}>
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
                {invoices.map((inv) => (
                    <MenuItem key={inv.invoice_guid} value={inv.invoice_no}>{inv.invoice_no}</MenuItem>
                ))}
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
                {branches.map((br) => (
                    <MenuItem key={br.branch_guid} value={br.branch_name}>{br.branch_name}</MenuItem>
                ))}
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
            sx={{ mt: 2, bgcolor: 'rgba(139, 92, 246, 0.9)', '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.9)' } }}
          >
            {rowToEdit ? "UPDATE" : "SUBMIT"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddIncome;
