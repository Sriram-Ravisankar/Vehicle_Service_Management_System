import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import InvoiceTable from './InvoiceTable'; // import your child component

const InvoiceJoin = () => {
  const [rows, setRows] = useState([]);

  // Add a new empty row
  const handleAddRow = () => {
    const newRow = {
      partName: '',
      qty: '',
      price: '',
      labour: '',
      discount: '',
      gstOption: 'withGST', // default to apply GST
      taxPercent: '',
      tax: '',
      total: '',
      approval: '',
      reason: '',
    };
    setRows((prevRows) => [...prevRows, newRow]);
  };

  // Handle changes from the table
  const handleRowChange = (index, field, value) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      if (field) {
        // Only update a single field
        updatedRows[index] = { ...updatedRows[index], [field]: value };
      } else {
        // Update entire row (used for save)
        updatedRows[index] = value;
      }
      return updatedRows;
    });
  };

  // Handle delete row
  const handleDeleteRow = (index) => {
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Invoice Management
      </Typography>

      <InvoiceTable
        rows={rows}
        onChange={handleRowChange}
        onDelete={handleDeleteRow}
      />

      <Box mt={2}>
        <Button variant="contained" color="primary" onClick={handleAddRow}>
          + Add Item
        </Button>
      </Box>
    </Box>
  );
};

export default InvoiceJoin;