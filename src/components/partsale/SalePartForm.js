import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Paper,
Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const SalePartForm = () => {
    const [rows, setRows] = useState([
        { manufacturer: '', product: '', quantity: '', price: '', amount: '' }
      ]);
    
      const handleAddRow = () => {
        setRows([...rows, { manufacturer: '', product: '', quantity: '', price: '', amount: '' }]);
      };

      const handleRemoveRow = (index) => {
        const updated = rows.filter((_, i) => i !== index);
        setRows(updated);
      };

//   const handlePartChange = (index, field, value) => {
//     const updated = [...parts];
//     updated[index][field] = value;

//     if (field === 'quantity' || field === 'price') {
//       const quantity = parseFloat(updated[index].quantity) || 0;
//       const price = parseFloat(updated[index].price) || 0;
//       updated[index].amount = (quantity * price).toFixed(2);
//     }

//     setParts(updated);
//   };
  const handleInputChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;

    if (field === 'quantity' || field === 'price') {
      const qty = parseFloat(updated[index].quantity) || 0;
      const prc = parseFloat(updated[index].price) || 0;
      updated[index].amount = (qty * prc).toFixed(2);
    }

    setRows(updated);
  };
  return (
    <Box p={3}>
      <Grid container spacing={7}>
  {/* Left Column */}
  <Grid item xs={6}>
    <Box mb={2} display="flex" alignItems="center">
      <Typography sx={{ minWidth: 150, fontWeight: 500, mr: 6 }}>
        Bill No<span style={{ color: 'red' }}>*</span>
      </Typography>
      <TextField fullWidth size="small" value="SP435269" />
    </Box>

    <Box mb={2} display="flex" alignItems="center">
      <Typography sx={{ minWidth: 150, fontWeight: 500, mr: 6 }}>
        Customer Name<span style={{ color: 'red' }}>*</span>
      </Typography>
      <TextField select fullWidth size="small">
        <MenuItem value="">Select Customer</MenuItem>
        <MenuItem value="cust1">John Doe</MenuItem>
      </TextField>
    </Box>

    <Box mb={2} display="flex" alignItems="center">
      <Typography sx={{ minWidth: 150, fontWeight: 500, mr: 6 }}>
        Branch<span style={{ color: 'red' }}>*</span>
      </Typography>
      <TextField select fullWidth size="small">
        <MenuItem value="main">Main Branch</MenuItem>
      </TextField>
    </Box>
  </Grid>

  {/* Right Column */}
  <Grid item xs={6}>
    <Box mb={2} display="flex" alignItems="center">
      <Typography sx={{ minWidth: 150, fontWeight: 500, mr: 6 }}>
        Sales Date<span style={{ color: 'red' }}>*</span>
      </Typography>
      <TextField fullWidth size="small" type="date" value="2025-04-16" />
    </Box>

    <Box mb={2} display="flex" alignItems="center">
      <Typography sx={{ minWidth: 150, fontWeight: 500, mr: 6 }}>
        Salesman<span style={{ color: 'red' }}>*</span>
      </Typography>
      <TextField select fullWidth size="small">
        <MenuItem value="">Select Name</MenuItem>
      </TextField>
    </Box>
        </Grid>
      </Grid>

      {/* Sale Part Section */}
      <Box mt={4}>
      {/* SALE PART Heading */}
      <Box display="flex" alignItems="center" mb={1}>
        <Typography sx={{ fontWeight: 'bold', mr: 1 }}>SALE PART</Typography>
        <IconButton
          onClick={handleAddRow}
          sx={{
            backgroundColor: '#f26522',
            color: '#fff',
            borderRadius: 0, width: 36, height: 36,
            '&:hover': { backgroundColor: '#c96400' },
            p: 1
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* <Box sx={{ p: 3 }}> */}
      {/* Table Section */}
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: '#f5f5f5',
              '& th': { 
                borderRight: '1px solid #e0e0e0',
                '&:last-child': { borderRight: 'none' }
              }
            }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Manufacturer Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Price ($)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Amount ($)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} sx={{ 
                '& td': { 
                  borderRight: '1px solid #e0e0e0',
                  '&:last-child': { borderRight: 'none' }
                }
              }}>
                {/* Manufacturer Name */}
                <TableCell>
  <TextField
    select
    fullWidth
    variant="outlined"
    size="small"
    value={row.manufacturer}
    onChange={(e) => handleInputChange(index, 'manufacturer', e.target.value)}
    sx={{ minWidth: 200 }}
    displayEmpty
    // This ensures the placeholder is visible even if no option is selected
  >
    <MenuItem value="" disabled>
      --Select Manufacturing Name--
    </MenuItem>
    <MenuItem value="mfg1">Manufacturer 1</MenuItem>
    <MenuItem value="mfg2">Manufacturer 2</MenuItem>
  </TextField>
</TableCell>

<TableCell>
  <TextField
    select
    fullWidth
    variant="outlined"
    size="small"
    value={row.product}
    onChange={(e) => handleInputChange(index, 'product', e.target.value)}
    sx={{ minWidth: 200 }}
    displayEmpty
  >
    <MenuItem value="" disabled>
      --Select Product--
    </MenuItem>
    <MenuItem value="prod1">Product 1</MenuItem>
    <MenuItem value="prod2">Product 2</MenuItem>
  </TextField>
</TableCell>
                
                {/* Quantity */}
                <TableCell>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="number"
                    value={row.quantity}
                    onChange={(e) => handleInputChange(index, 'quantity', e.target.value)}
                  />
                </TableCell>
                
                {/* Price */}
                <TableCell>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    type="number"
                    value={row.price}
                    onChange={(e) => handleInputChange(index, 'price', e.target.value)}
                  />
                </TableCell>
                
                {/* Amount */}
                <TableCell>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={row.amount || '0.00'}
                    InputProps={{ readOnly: true }}
                  />
                </TableCell>
                
                {/* Action */}
                <TableCell align="center">
                  <IconButton 
                    onClick={() => handleRemoveRow(index)}
                    color="error"
                    disabled={rows.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

     

      {/* Submit Button */}
      <Box sx={{ mt: 4 }}>
      <Button
                variant="contained"
                sx={{
                  backgroundColor: "rgba(249, 115, 22, 0.9)",
                  textTransform: "none",
                  px: 32,
                  borderRadius: 0,
                }}
              >
                SUBMIT
              </Button>
      </Box>
    </Box>
    </Box>
  );
};

export default SalePartForm;