import React from 'react';
import {
  TextField,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  Box
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
const PartEntryRow = () => {
  const [priceOption, setPriceOption] = React.useState('');
  const [labourOption, setLabourOption] = React.useState('');
  return (
    <Box sx={{ backgroundColor: '#fff', p: 2, borderRadius: 2, boxShadow: 1 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Search Field */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Part Name / Part Number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="small"
          />
        </Grid>
        {/* Combined Qty, Price, Dropdown */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              backgroundColor: '#F9F9F9',
              borderRadius: 1,
              p: 1,
              alignItems: 'center',
            }}
          >
            {/* Qty */}
            <TextField
              placeholder="Qty"
              type="number"
              size="small"
              sx={{ width: '25%' }}
            />
            {/* Part Price */}
            <TextField
              placeholder="Part Price"
              type="number"
              size="small"
              sx={{ width: '45%' }}
            />
            {/* Dropdown */}
            <FormControl size="small" sx={{ width: '30%' }}>
              <Select
                value={priceOption}
                onChange={(e) => setPriceOption(e.target.value)}
                displayEmpty
              >
                <MenuItem value=""><em>Price</em></MenuItem>
                <MenuItem value="withGST">With GST</MenuItem>
                <MenuItem value="withoutGST">Without GST</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        {/* Combined Service / Labour + Price Dropdown */}
<Grid item xs={12} md={3.5}>
  <Box
    sx={{
      display: 'flex',
      gap: 1,
      backgroundColor: '#F9F9F9',
      borderRadius: 1,
      p: 1,
      alignItems: 'center',
    }}
  >
    {/* Service / Labour Input */}
    <TextField
      placeholder="Service / Labour"
      size="small"
      sx={{ width: '70%' }}
      variant="outlined"
    />
    {/* Price Dropdown */}
    <FormControl size="small" sx={{ width: '30%' }}>
      <Select
        value={labourOption}
        onChange={(e) => setLabourOption(e.target.value)}
        displayEmpty
      >
        <MenuItem value=""><em>Price</em></MenuItem>
        <MenuItem value="withGST">With GST</MenuItem>
        <MenuItem value="withoutGST">Without GST</MenuItem>
      </Select>
    </FormControl>
  </Box>
</Grid>
<br></br>
<br></br>
        {/* Add Button */}
        <Grid item xs={12} md={0.5} sx={{ textAlign: 'center' }}>
          <IconButton color="primary">
            <Add />
          </IconButton>
        </Grid>
      </Grid>
    </Box>
  );
};
export default PartEntryRow;








