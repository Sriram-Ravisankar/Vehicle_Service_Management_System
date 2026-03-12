import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';

const PartEntryRow = ({ onAdd, selectedService, onPackageClick }) => {
  const [partName, setPartName] = React.useState('');
  const [partNumber, setPartNumber] = React.useState('');
  const [qty, setQty] = React.useState(1);
  const [partPrice, setPartPrice] = React.useState('');
  const [serviceLabour, setServiceLabour] = React.useState('');
  const [gstOption, setGstOption] = React.useState('withGST');

  const qtyRef = React.useRef();

  useEffect(() => {
    if (selectedService) {
      setPartName(selectedService);
      if (qtyRef.current) {
        qtyRef.current.focus();
      }
    }
  }, [selectedService]);

  const handleAddClick = () => {
    if (!partName || !qty) return;

    const newRow = {
      partName,
      partNo: partNumber,
      qty: parseInt(qty) || 1,
      price: parseFloat(partPrice) || 0,
      labour: parseFloat(serviceLabour) || 0,
      gstOption: gstOption || 'withGST',
      id: Date.now()
    };

    onAdd(newRow);

    // Reset form but keep GST option
    setPartName('');
    setPartNumber('');
    setQty(1);
    setPartPrice('');
    setServiceLabour('');
  };

  return (
    <Box sx={{ backgroundColor: '#fff', p: 2, borderRadius: 2, boxShadow: 1 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Part Name"
              value={partName}
              onChange={(e) => setPartName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                )
              }}
              variant="outlined"
              size="small"
            />
           
          </Box>
        </Grid>

        <Grid item xs={12} md={2.5}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              inputRef={qtyRef}
              placeholder="Qty"
              type="number"
              size="small"
              sx={{ width: '40%' }}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              inputProps={{ min: 1 }}
            />
            <TextField
              placeholder="Part Price"
              type="number"
              size="small"
              sx={{ width: '60%' }}
              value={partPrice}
              onChange={(e) => setPartPrice(e.target.value)}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            placeholder="Service / Labour"
            type="number"
            size="small"
            value={serviceLabour}
            onChange={(e) => setServiceLabour(e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <Select
              value={gstOption}
              onChange={(e) => setGstOption(e.target.value)}
              displayEmpty
            >
              <MenuItem value="withGST">With GST</MenuItem>
              <MenuItem value="withoutGST">Without GST</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={1}>
          <IconButton color="primary" onClick={handleAddClick}>
            <Add />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PartEntryRow;