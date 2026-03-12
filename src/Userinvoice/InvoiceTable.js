import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  TextField,
  IconButton,
  Tooltip,
  Checkbox,
  Typography,
  Chip,
  Button
} from '@mui/material';
import { Edit, Delete, Save } from '@mui/icons-material';

// GST Rates Configuration
const GST_RATES = [
  { value: 0, label: "0%" },
  { value: 5, label: "5%" },
  { value: 12, label: "12%" },
  { value: 18, label: "18%" },
  { value: 28, label: "28%" }
];

const InvoiceTable = ({ 
  rows = [], 
  onChange, 
  onDelete,
  onTotalChange,
  onSaveInvoice, // Add this prop
  searchTerm = ""
}) => {
  const [paid, setPaid] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({});
  const [discount, setDiscount] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [filteredRows, setFilteredRows] = useState(rows);
  const [totals, setTotals] = useState({
    grandTotal: 0,
    balance: 0
  });
  const [selected, setSelected] = useState([]);

  // Initialize rows with default GST rate of 18%
  const initializedRows = rows.map(row => ({
    gstRate: row.gstNumber ? 18 : 0, // Default 18% if GST number exists, else 0%
    ...row
  }));

  // Update filtered rows when search term or rows change
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRows(initializedRows);
    } else {
      const filtered = initializedRows.filter(row =>
        row.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.partNo && row.partNo.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredRows(filtered);
    }
  }, [searchTerm, initializedRows]);

  // Handle select all checkbox
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredRows.map((_, index) => index);
      setSelected(newSelecteds);
    } else {
      setSelected([]);
    }
  };

  // Handle single row selection
  const handleSelect = (event, index) => {
    const selectedIndex = selected.indexOf(index);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, index);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isAllSelected = filteredRows.length > 0 && selected.length === filteredRows.length;

  const handleChange = (index, field, value) => {
    onChange(index, field, value);
  };

  const handleEditClick = (index, row) => {
    setEditingIndex(index);
    setEditData({ ...row });
  };

  const handleEditFieldChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value,
      // Update GST rate to 0% if GST number is removed, or 18% if added
      ...(field === 'gstNumber' && {
        gstRate: value ? 18 : 0
      })
    }));
  };

  const handleSaveClick = (index) => {
    Object.entries(editData).forEach(([field, value]) => {
      if (value !== initializedRows[index][field]) {
        onChange(index, field, value);
      }
    });
    setEditingIndex(null);
    setEditData({});
  };

  const handleDelete = (index) => {
    if (typeof onDelete === 'function') {
      onDelete(index);
    } else {
      console.warn("onDelete prop is not a function");
    }
  };

  // GST number validation
  const isValidGSTNumber = (gstNumber) => {
    if (!gstNumber || gstNumber === '') return true; // Empty is allowed
    return /^[0-9A-Z]{15}$/.test(gstNumber);
  };

  const calculateRowValues = (row) => {
    const qty = parseFloat(row.qty || 0);
    const price = parseFloat(row.price || 0);
    const labour = parseFloat(row.labour || 0);
    let discount = parseFloat(row.discount || 0);

    // Use the row's gstRate (18% if GST number exists, 0% otherwise)
    const gstRate = row.gstNumber ? parseFloat(row.gstRate || 18) : 0;

    const baseAmount = qty * (price + labour);

    let autoDiscountApplied = false;
    if (baseAmount > 500 && !row.discount) {
      discount = baseAmount * 0.1;
      autoDiscountApplied = true;
    }

    const discounted = baseAmount - discount;
    const taxAmt = (discounted * gstRate) / 100;
    const total = discounted + taxAmt;

    return {
      ...row,
      discount: discount.toFixed(2),
      gstRate, // Ensure gstRate is properly set
      tax: taxAmt.toFixed(2),
      total: total.toFixed(2),
      autoDiscountApplied,
    };
  };

  useEffect(() => {
    const calculatedRows = initializedRows.map(calculateRowValues);
    const grandTotal = calculatedRows.reduce((sum, row) => sum + parseFloat(row.total || 0), 0);
    
    if (onTotalChange) {
      onTotalChange(grandTotal);
    }
  }, [initializedRows, onTotalChange]);

  const calculatedRows = filteredRows.map(calculateRowValues);

  // Calculate totals and notify parent
  useEffect(() => {
    const totalDiscount = calculatedRows.reduce((sum, row) => sum + parseFloat(row.discount || 0), 0);
    const grandTotal = calculatedRows.reduce((sum, row) => sum + parseFloat(row.total || 0), 0);
    const roundedTotal = Math.floor(grandTotal);
    const currentRoundOff = (roundedTotal - grandTotal).toFixed(2);
    const balance = (roundedTotal - parseFloat(paid || 0)).toFixed(2);

    setTotals({
      grandTotal,
      balance
    });
    setRoundOff(currentRoundOff);
    setDiscount(totalDiscount);

    if (onTotalChange) onTotalChange(grandTotal);
  }, [calculatedRows, paid, onTotalChange]);

  return (
    <Box>
      <TableContainer 
        component={Paper} 
        sx={{ 
          width: '100%',
          borderRadius: '6px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '4px',
          },
        }}
      >
        <Table 
          size="small" 
          sx={{ 
            minWidth: 'max-content',
            tableLayout: 'fixed',
          }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell padding="checkbox" sx={{ width: '48px' }}>
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < filteredRows.length}
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell sx={{ width: '50px' }}>#</TableCell>
              <TableCell sx={{ width: '150px' }}>Part Name</TableCell>
              <TableCell sx={{ width: '100px' }}>Part / Labour</TableCell>
              <TableCell sx={{ width: '100px' }}>Part No</TableCell>
              <TableCell sx={{ width: '150px' }}>GST Number</TableCell>
              <TableCell sx={{ width: '120px' }}>Qty / Price</TableCell>
              <TableCell sx={{ width: '100px' }}>Discount</TableCell>
              <TableCell sx={{ width: '100px' }}>GST %</TableCell>
              <TableCell sx={{ width: '100px' }}>GST Amt</TableCell>
              <TableCell sx={{ width: '100px' }}>Total</TableCell>
              <TableCell sx={{ width: '120px' }}>Status</TableCell>
              <TableCell sx={{ width: '150px' }}>Reason</TableCell>
              <TableCell sx={{ width: '100px' }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {calculatedRows.map((row, index) => (
              <TableRow key={index} selected={selected.indexOf(index) !== -1}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selected.indexOf(index) !== -1}
                    onChange={(event) => handleSelect(event, index)}
                  />
                </TableCell>
                <TableCell>{index + 1}</TableCell>

                {/* Part Name */}
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      value={editData.partName || ''}
                      onChange={(e) => handleEditFieldChange('partName', e.target.value)}
                      fullWidth
                      size="small"
                      variant="outlined"
                    />
                  ) : (
                    row.partName
                  )}
                </TableCell>

                {/* Part/Labour */}
                <TableCell>
                  {editingIndex === index ? (
                    <Select
                      value={editData.type || 'Part'}
                      onChange={(e) => handleEditFieldChange('type', e.target.value)}
                      size="small"
                      fullWidth
                      variant="outlined"
                    >
                      <MenuItem value="Part">Part</MenuItem>
                      <MenuItem value="Labour">Labour</MenuItem>
                    </Select>
                  ) : (
                    <Chip
                      label={row.type || 'Part'}
                      size="small"
                      sx={{ 
                        backgroundColor: row.type === 'Labour' ? "#2196f3" : "#4caf50", 
                        color: "#fff" 
                      }}
                    />
                  )}
                </TableCell>

                {/* Part No */}
                <TableCell>
                  <TextField
                    variant={editingIndex === index ? "outlined" : "standard"}
                    value={editingIndex === index ? (editData.partNo || '') : (row.partNo || '-')}
                    onChange={(e) => handleEditFieldChange('partNo', e.target.value)}
                    size="small"
                    fullWidth
                    disabled={editingIndex !== index}
                    InputProps={{
                      disableUnderline: editingIndex !== index,
                    }}
                  />
                </TableCell>

                {/* GST Number */}
                <TableCell>
                  <TextField
                    variant={editingIndex === index ? "outlined" : "standard"}
                    value={editingIndex === index ? (editData.gstNumber || '') : (row.gstNumber || '-')}
                    onChange={(e) => handleEditFieldChange('gstNumber', e.target.value)}
                    size="small"
                    fullWidth
                    disabled={editingIndex !== index}
                    error={editData.gstNumber && !isValidGSTNumber(editData.gstNumber)}
                    helperText={
                      editingIndex === index && 
                      editData.gstNumber && 
                      !isValidGSTNumber(editData.gstNumber)
                        ? "Invalid GST number (15 characters required)"
                        : ""
                    }
                    InputProps={{
                      disableUnderline: editingIndex !== index,
                    }}
                  />
                </TableCell>

                {/* Qty / Price */}
                <TableCell>
                  {editingIndex === index ? (
                    <Box display="flex" alignItems="center" gap={1}>
                      <TextField
                        type="number"
                        value={editData.qty || ''}
                        onChange={(e) => handleEditFieldChange('qty', e.target.value)}
                        size="small"
                        sx={{ width: '60px' }}
                        variant="outlined"
                      />
                      <span>/</span>
                      <TextField
                        type="number"
                        value={editData.price || ''}
                        onChange={(e) => handleEditFieldChange('price', e.target.value)}
                        size="small"
                        sx={{ width: '80px' }}
                        variant="outlined"
                      />
                    </Box>
                  ) : (
                    `${row.qty} / ${row.price}`
                  )}
                </TableCell>

                {/* Discount */}
                <TableCell>
                  {editingIndex === index ? (
                    <TextField
                      type="number"
                      value={editData.discount || ''}
                      onChange={(e) => handleEditFieldChange('discount', e.target.value)}
                      size="small"
                      fullWidth
                      variant="outlined"
                    />
                  ) : (
                    `₹${row.discount}`
                  )}
                </TableCell>

                {/* GST % */}
                <TableCell>
                  {editingIndex === index ? (
                    <Select
                      value={editData.gstRate || (editData.gstNumber ? 18 : 0)}
                      onChange={(e) => handleEditFieldChange('gstRate', e.target.value)}
                      size="small"
                      fullWidth
                      variant="outlined"
                      disabled={!editData.gstNumber} // Disable if no GST number
                    >
                      {GST_RATES.map((rate) => (
                        <MenuItem 
                          key={rate.value} 
                          value={rate.value}
                          disabled={rate.value !== 0 && !editData.gstNumber}
                        >
                          {rate.label}
                        </MenuItem>
                      ))}
                    </Select>
                  ) : (
                    `${row.gstRate}%`
                  )}
                </TableCell>

                {/* GST Amt */}
                <TableCell>₹{row.tax}</TableCell>

                {/* Total */}
                <TableCell>₹{row.total}</TableCell>

                {/* Status */}
                <TableCell>
                  <Select
                    value={row.approval || ''}
                    onChange={(e) => handleChange(index, 'approval', e.target.value)}
                    fullWidth
                    size="small"
                    variant={editingIndex === index ? "outlined" : "standard"}
                    displayEmpty
                    disabled={editingIndex !== index}
                    sx={{
                      border: editingIndex !== index ? '2px solid' : undefined,
                      borderColor:
                        row.approval === 'Approved'
                          ? 'green'
                          : row.approval === 'Rejected'
                          ? 'red'
                          : row.approval === 'Pending'
                          ? 'orange'
                          : 'transparent',
                      borderRadius: '4px',
                      px: 1,
                      py: 0.5,
                      bgcolor: '#fdfdfd',
                    }}
                    InputProps={{
                      disableUnderline: editingIndex !== index,
                    }}
                  >
                    <MenuItem value="">Select</MenuItem>
                    <MenuItem value="Approved">Approved</MenuItem>
                    <MenuItem value="Rejected">Rejected</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                  </Select>
                </TableCell>

                {/* Reason */}
                <TableCell>
                  <TextField
                    variant={editingIndex === index ? "outlined" : "standard"}
                    fullWidth
                    value={editingIndex === index ? (editData.reason || '') : (row.reason || '')}
                    onChange={(e) => {
                      if (editingIndex === index) {
                        handleEditFieldChange('reason', e.target.value);
                      } else {
                        handleChange(index, 'reason', e.target.value);
                      }
                    }}
                    placeholder="Enter reason"
                    size="small"
                    disabled={editingIndex !== index && !row.approval}
                    InputProps={{
                      disableUnderline: editingIndex !== index,
                    }}
                  />
                </TableCell>

                {/* Actions */}
                <TableCell>
                  {editingIndex === index ? (
                    <Tooltip title="Save">
                      <IconButton onClick={() => handleSaveClick(index)} size="small">
                        <Save fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditClick(index, row)} size="small">
                          <Edit fontSize="small" color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(index)} size="small" color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} component={Paper} sx={{ p: 2, borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        {["Grand Total", "Discount", "Round off", "Paid", "Balance"].map((label) => {
          const value =
            label === "Grand Total"
              ? totals.grandTotal.toFixed(2)
              : label === "Discount"
              ? discount.toFixed(2)
              : label === "Round off"
              ? roundOff
              : label === "Paid"
              ? paid.toFixed(2)
              : totals.balance;
          
          return (
            <Box
              key={label}
              display="flex"
              justifyContent="space-between"
              borderBottom="1px solid #ccc"
              py={1}
            >
              <Typography fontWeight="bold">{label}</Typography>
              <Typography>₹{value}</Typography>
            </Box>
          );
        })}

        {/* GST Summary Section */}
        <Box mt={2}>
          <Typography variant="subtitle1" fontWeight="bold">GST Summary</Typography>
          {Object.entries(
            calculatedRows.reduce((acc, row) => {
              const rate = row.gstRate || (row.gstNumber ? 18 : 0);
              const tax = parseFloat(row.tax || 0);
              acc[rate] = (acc[rate] || 0) + tax;
              return acc;
            }, {})
          ).map(([rate, total]) => (
            <Box key={rate} display="flex" justifyContent="space-between">
              <Typography>GST {rate}%</Typography>
              <Typography>₹{total.toFixed(2)}</Typography>
            </Box>
          ))}
        </Box>

        <Box display="flex" justifyContent="flex-end" mt={2}>
        <Box display="flex" justifyContent="flex-end" mt={2}>
  <Button 
    variant="contained" 
    color="primary"
    onClick={() => {
      onSaveInvoice(calculatedRows); // This should trigger the navigation
    }}
    sx={{
      textTransform: 'none',
      fontWeight: 'bold',
      px: 3,
      py: 1
    }}
  >
    Save Invoice
  </Button>
</Box>
        </Box>
      </Box>
    </Box>
  );
};

InvoiceTable.propTypes = {
  rows: PropTypes.array.isRequired,
  onSaveInvoice: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onTotalChange: PropTypes.func,
  searchTerm: PropTypes.string,
};

export default InvoiceTable;