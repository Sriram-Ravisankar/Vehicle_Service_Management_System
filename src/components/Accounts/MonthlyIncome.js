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

const MonthlyIncomeReport = () => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: ''
  });

  const [filteredData, setFilteredData] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filterData = () => {
    const incomeData = JSON.parse(sessionStorage.getItem('incomeData')) || [];
    const filtered = incomeData.filter((entry) => {
      const entryDate = new Date(entry.date);
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      return entryDate >= startDate && entryDate <= endDate;
    });
    setFilteredData(filtered);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    filterData();
  };

  useEffect(() => {
    filterData();
  }, []); // Run on component mount

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
          Monthly Income Reports
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
          INCOME DETAILS
        </Typography>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {/* Start Date Field */}
          <Typography
            variant="body1"
            sx={{
              mb: 1,
              fontWeight: 'bold',
              color: '#333'
            }}
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

          {/* End Date Field */}
          <Typography
            variant="body1"
            sx={{
              mb: 1,
              fontWeight: 'bold',
              color: '#333'
            }}
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

          {/* Submit Button */}
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

        {/* Income Table */}
        {filteredData.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Filtered Income Entries
            </Typography>

            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Branch</TableCell>
                    <TableCell>Outstanding Amount</TableCell>
                    <TableCell>Main Label</TableCell>
                    <TableCell>Payment Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.invoice}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.branch}</TableCell>
                      <TableCell>{row.outstandingAmount}</TableCell>
                      <TableCell>{row.mainLabel}</TableCell>
                      <TableCell>{row.paymentType}</TableCell>
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

export default MonthlyIncomeReport;
