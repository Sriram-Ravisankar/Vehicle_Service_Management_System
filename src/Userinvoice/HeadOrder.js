// OrderHeader.js
import React from "react";
import {
  Grid,
  TextField,
  MenuItem,
  Typography,
  Paper
} from "@mui/material";

const OrderHeader = ({ headerData, onHeaderChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onHeaderChange((prev) => ({ ...prev, [name]: value }));
  };

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Order Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Vendor"
            name="vendor"
            value={headerData.vendor}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Stock"
            name="stock"
            value={headerData.stock}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Type"
            name="type"
            value={headerData.type}
            onChange={handleChange}
          >
            <MenuItem value="Credit">Credit</MenuItem>
            <MenuItem value="Cash">Cash</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
        <Typography variant="subtitle2">
            Order Date: <strong>{today}</strong>
          </Typography>
            </Grid>
      </Grid>
    </Paper>
  );
};

export default OrderHeader;