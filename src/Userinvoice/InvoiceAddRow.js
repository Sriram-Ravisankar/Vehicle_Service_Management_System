// Example InvoiceAddRow component
import React from "react";
import { 
  Box, 
  TextField, 
  Button, 
  MenuItem, 
  Grid 
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

const InvoiceAddRow = ({ 
  partName, 
  qty, 
  price, 
  type, 
  priceType, 
  onAdd, 
  onChange 
}) => {
  const types = ["Part", "Labour"];
  const priceTypes = ["Retail", "Wholesale", "Special"];

  return (
    <Box sx={{ mb: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={3}>
          <TextField
            fullWidth
            label="Part Name"
            value={partName}
            onChange={(e) => onChange("partName", e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={qty}
            onChange={(e) => onChange("qty", e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={price}
            onChange={(e) => onChange("price", e.target.value)}
            size="small"
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <TextField
            select
            fullWidth
            label="Type"
            value={type}
            onChange={(e) => onChange("type", e.target.value)}
            size="small"
          >
            {types.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6} sm={2}>
          <TextField
            select
            fullWidth
            label="Price Type"
            value={priceType}
            onChange={(e) => onChange("priceType", e.target.value)}
            size="small"
          >
            {priceTypes.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={1}>
          <Button
            fullWidth
            variant="contained"
            onClick={onAdd}
            startIcon={<AddIcon />}
            size="large"
          >
            Add
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InvoiceAddRow;