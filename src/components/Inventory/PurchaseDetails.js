import React, { useState } from 'react';
import {
  MenuItem,
  Select,
  TextField,
  IconButton,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Plus, Trash2, Info } from 'lucide-react';

const PurchaseDetailsForm = ({
  rows,
  onRowsChange,
  products,
  isEditMode,
  isSubmitting,
  onDeleteItem
}) => {
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    index: null,
    productName: ''
  });

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];

    // Prevent negative values
    if ((field === 'quantity' || field === 'price') && value !== '' && Number(value) < 0) {
      return;
    }

    if (field === 'product_id') {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedRows[index].product_name = selectedProduct.product_name;
        updatedRows[index].price = selectedProduct.price;
      }
    }

    updatedRows[index][field] = value;

    if (field === 'quantity' || field === 'price') {
      const qty = parseFloat(updatedRows[index].quantity) || 0;
      const price = parseFloat(updatedRows[index].price) || 0;
      updatedRows[index].amount = (qty * price).toFixed(2);
    }

    onRowsChange(updatedRows);
  };

  const addRow = () => {
    onRowsChange([...rows, {
      product_id: '',
      product_name: '',
      quantity: 1,
      price: '',
      amount: '0.00'
    }]);
  };

  const handleDeleteClick = (index) => {
    const productName = products.find(p => p.id === rows[index].product_id)?.product_name || 'this item';
    setDeleteDialog({ open: true, index, productName });
  };

  const handleDeleteConfirm = async () => {
    const { index } = deleteDialog;
    setDeleteDialog({ open: false, index: null, productName: '' });

    const row = rows[index];
    if (isEditMode && row.item_id) {
      await onDeleteItem(row.item_id);
    }
    onRowsChange(rows.filter((_, i) => i !== index));
  };

  return (
    <Box>
      {/* Table Header */}
      <Box sx={{
        display: { xs: 'none', lg: 'flex' },
        background: '#f8fafc',
        p: '14px 20px',
        borderRadius: '12px',
        mb: 1.5,
        border: '1px solid #e2e8f0'
      }}>
        <Typography sx={{ flex: 2, fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Name</Typography>
        <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Qty</Typography>
        <Typography sx={{ flex: 1.2, fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Price (₹)</Typography>
        <Typography sx={{ flex: 1.2, fontSize: 13, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Amount (₹)</Typography>
        <Box sx={{ width: 60 }} />
      </Box>

      {/* Row Rendering */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {rows.map((row, index) => (
          <Box key={index} sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: { xs: 'stretch', lg: 'center' },
            p: { xs: 2.5, lg: '12px 20px' },
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            gap: { xs: 2, lg: 2 }
          }}>
            {/* Product selection */}
            <Box sx={{ flex: 2 }}>
              <Typography sx={{ display: { lg: 'none' }, fontSize: 11, fontWeight: 700, color: '#94A3B8', mb: 0.5, textTransform: 'uppercase' }}>Product</Typography>
              <Select
                fullWidth
                size="small"
                displayEmpty
                value={row.product_id || ''}
                onChange={(e) => handleChange(index, 'product_id', e.target.value)}
                sx={{ borderRadius: '10px', background: '#f8fafc', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' } }}
              >
                <MenuItem value="">
                  <Typography sx={{ color: '#94A3B8', fontSize: 14 }}>Choose product...</Typography>
                </MenuItem>
                {products.map(p => <MenuItem key={p.id} value={p.id}>{p.product_name}</MenuItem>)}
              </Select>
            </Box>

            {/* Qty */}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ display: { lg: 'none' }, fontSize: 11, fontWeight: 700, color: '#94A3B8', mb: 0.5, textTransform: 'uppercase' }}>Quantity</Typography>
              <TextField
                size="small"
                type="number"
                value={row.quantity || ''}
                onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                placeholder="0"
                fullWidth
                inputProps={{ min: 0, style: { textAlign: 'center', fontSize: 14, fontWeight: 600 } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', background: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } } }}
              />
            </Box>

            {/* Price */}
            <Box sx={{ flex: 1.2 }}>
              <Typography sx={{ display: { lg: 'none' }, fontSize: 11, fontWeight: 700, color: '#94A3B8', mb: 0.5, textTransform: 'uppercase' }}>Unit Price</Typography>
              <TextField
                size="small"
                type="number"
                value={row.price || ''}
                onChange={(e) => handleChange(index, 'price', e.target.value)}
                placeholder="0.00"
                fullWidth
                inputProps={{ min: 0, style: { textAlign: 'right', fontSize: 14, fontWeight: 600 } }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', background: '#f8fafc', '& fieldset': { borderColor: '#e2e8f0' } } }}
              />
            </Box>

            {/* Amount */}
            <Box sx={{ flex: 1.2, textAlign: { lg: 'right' } }}>
              <Typography sx={{ display: { lg: 'none' }, fontSize: 11, fontWeight: 700, color: '#94A3B8', mb: 0.5, textTransform: 'uppercase' }}>Line Total</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#1E293B', pr: { lg: 1 } }}>₹{Number(row.amount || 0).toLocaleString()}</Typography>
            </Box>

            {/* Remove item button */}
            <Box sx={{ width: { xs: '100%', lg: 60 }, display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton
                onClick={() => handleDeleteClick(index)}
                sx={{ color: '#EF4444', p: 1, borderRadius: '10px', '&:hover': { background: '#FEF2F2' } }}
              >
                <Trash2 size={18} />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Add Item Button */}
      <Button
        variant="outlined"
        startIcon={<Plus size={18} />}
        onClick={addRow}
        sx={{
          mt: 2.5,
          height: 48,
          borderRadius: "14px",
          border: "2px dashed #CBD5E1",
          color: "#64748B",
          textTransform: "none",
          fontWeight: 700,
          px: 4,
          "&:hover": { background: "#F5F3FF", borderColor: "#0EA5E9", color: "#0EA5E9" },
          width: { xs: "100%", sm: "auto" }
        }}
      >
        Add Another Inventory Item
      </Button>

      {/* Confirm removal dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, index: null, productName: "" })} PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 800, color: "#1E293B" }}>
          <Info size={24} color="#EF4444" /> Remove Item?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#64748B", fontWeight: 500 }}>
            Removing <strong>{deleteDialog.productName}</strong> will exclude it from this purchase record.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialog({ open: false, index: null, productName: "" })} sx={{ color: "#64748B", fontWeight: 700, textTransform: "none" }}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" sx={{ background: "#EF4444", "&:hover": { background: "#DC2626" }, borderRadius: "10px", textTransform: "none", fontWeight: 700, px: 3 }}>
            Delete Item
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseDetailsForm;