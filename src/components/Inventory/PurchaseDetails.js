import React, { useState, useEffect } from 'react';
import {
  MenuItem,
  Select,
  TextField,
  IconButton,
  Button,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import apiEndpoints from '../../apiconfig';

const columns = [
  //  {
  //   key: 'manufacturer',
  //   label: 'Manufacturer Name',
  //   type: 'select',
  //   options: manufacturers,
  //   placeholder: 'Select Manufacturer',
  // },
  {
    key: 'product_id',
    label: 'Product Name',
    type: 'select',
    optionValue: 'id',
    optionLabel: 'product_name',
    placeholder: 'Select Product',
  },
  {
    key: 'quantity',
    label: 'Quantity',
    type: 'number',
  },
  {
    key: 'price',
    label: 'Price (₹)',
    type: 'number',
  },
  {
    key: 'amount',
    label: 'Amount (₹)',
    type: 'number',
    disabled: true,
  },
];

const PurchaseDetailsForm = ({
  onChange,
  initialData = [],
  purchaseId,
  isPurchaseSaved,
  purchaseData,
  rows,
  onRowsChange,
  products,
  isEditMode,
  isSubmitting,
  onDeleteItem
}) => {
  // const [rows, setRows] = useState(
  //   initialData.length > 0
  //     ? initialData
  //     : [{ manufacturer: '', product: '', quantity: 1, price: '', amount: '' }]
  // );
  // const [products, setProducts] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [apiLoading, setApiLoading] = useState(false);
  // const [snackbar, setSnackbar] = useState({
  //   open: false,
  //   message: '',
  //   severity: 'success'
  // });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    index: null,
    productName: ''
  });

  // Fetch products and purchase items
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);

  //       // Fetch products
  //       const productsResponse = await fetch(apiEndpoints.product);
  //       if (!productsResponse.ok) throw new Error('Failed to fetch products');
  //       const productsData = await productsResponse.json();

  //       if (productsData.success) {
  //         setProducts(productsData.data);

  //         // If in edit mode, fetch existing purchase items
  //         if (isEditMode && purchaseId) {
  //           const itemsResponse = await fetch(`${apiEndpoints.purchaseItems}?purchase_id=${purchaseId}`);
  //           if (!itemsResponse.ok) throw new Error('Failed to fetch purchase items');
  //           const itemsData = await itemsResponse.json();

  //           if (itemsData.success) {
  //             setRows(itemsData.data.map(item => ({
  //               item_id: item.item_id,
  //               product_id: item.product_id,
  //               product_name: productsData.data.find(p => p.id === item.product_id)?.product_name || '',
  //               quantity: item.quantity,
  //               price: item.price,
  //               amount: item.amount,
  //               original_quantity: item.quantity
  //             })));
  //           }
  //         } else {
  //           // Start with an empty row
  //           setRows([{ product_id: '', product_name: '', quantity: 0, price: '', amount: '' }]);
  //         }
  //       }
  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //       setSnackbar({
  //         open: true,
  //         message: 'Failed to load data',
  //         severity: 'error'
  //       });
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [purchaseId, isEditMode]);

  const handleChange = (index, field, value) => {
      const updatedRows = [...rows];

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
      quantity: 0,
      price: '',
      amount: ''
    }]);
  };

  const handleDeleteClick = (index) => {
    const productName = products.find(p => p.id === rows[index].product_id)?.product_name || 'this product';
    setDeleteDialog({
      open: true,
      index,
      productName
    });
  };

  const handleDeleteConfirm = async () => {
    const { index } = deleteDialog;
    setDeleteDialog({ open: false, index: null, productName: '' });

    const row = rows[index];

    if (isEditMode && row.item_id) {
      await onDeleteItem(row.item_id);
    }


    const updatedRows = rows.filter((_, i) => i !== index);
    onRowsChange(updatedRows);
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, index: null, productName: '' });
  };

  // const handleSubmit = async () => {
  //    if (!isPurchaseSaved && !isEditMode) {
  //     setSnackbar({
  //       open: true,
  //       message: 'Please save the purchase first before adding items',
  //       severity: 'warning'
  //     });
  //     return;
  //   }
  //   const invalidRows = rows.some(row =>
  //     !row.product_id || !row.quantity || !row.price
  //   );

  //   if (invalidRows) {
  //     setSnackbar({
  //       open: true,
  //       message: 'Please fill all required fields for all products',
  //       severity: 'warning'
  //     });
  //     return;
  //   }

  //   try {
  //     setApiLoading(true);

  //     // Process all rows
  //     const results = await Promise.all(
  //       rows.map(async (row) => {
  //         const payload = {
  //           purchase_id: purchaseId,
  //           product_id: row.product_id,
  //           quantity: row.quantity,
  //           price: row.price
  //         };

  //         let response;
  //         if (isEditMode && row.item_id) {
  //           // Update existing item
  //           response = await fetch(`${apiEndpoints.purchaseItems}?id=${row.item_id}`, {
  //             method: 'PUT',
  //             headers: {
  //               'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify(payload)
  //           });
  //         } else {
  //           // Create new item
  //           response = await fetch(apiEndpoints.purchaseItems, {
  //             method: 'POST',
  //             headers: {
  //               'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify(payload)
  //           });
  //         }

  //         const result = await response.json();
  //         if (!result.success) throw new Error(result.error || 'Failed to save item');

  //         return {
  //           ...row,
  //           item_id: row.item_id || result.id
  //         };
  //       })
  //     );

  //     // Handle stock updates
  //     const stockUpdates = await Promise.all(
  //       results.map(async (row) => {
  //         try {
  //           if (isEditMode && row.original_quantity !== undefined) {
  //             // For edits, we need to update existing stock record
  //             const quantityDiff = row.quantity - (row.original_quantity || 0);

  //             if (quantityDiff !== 0) {
  //               const updatePayload = {
  //                 purchase_id: purchaseId,
  //                 product_id: row.product_id,
  //                 quantity: row.quantity,
  //                 price: row.price
  //               };

  //               await fetch(`${apiEndpoints.stock}?product_id=${row.product_id}`, {
  //                 method: 'PUT',
  //                 headers: {
  //                   'Content-Type': 'application/json',
  //                 },
  //                 body: JSON.stringify(updatePayload)
  //               });
  //             }
  //           } else {
  //             // For new items, create new stock record
  //             const stockPayload = {
  //               purchase_id: purchaseId,
  //               product_id: row.product_id
  //             };

  //             await fetch(apiEndpoints.stock, {
  //               method: 'POST',
  //               headers: {
  //                 'Content-Type': 'application/json',
  //               },
  //               body: JSON.stringify(stockPayload)
  //             });
  //           }
  //         } catch (error) {
  //           console.error(`Stock update error for product ${row.product_id}:`, error);
  //           // Don't fail the entire operation if stock update fails
  //         }
  //       })
  //     );

  //     // Update rows with any new IDs from the server
  //     const updatedRows = results.map(row => ({
  //       ...row,
  //       original_quantity: row.quantity // Update original quantity for future edits
  //     }));

  //     setRows(updatedRows);
  //     if (onChange) onChange(updatedRows);

  //     setSnackbar({
  //       open: true,
  //       message: 'Purchase items and stock updated successfully',
  //       severity: 'success'
  //     });

  //     if (onComplete) onComplete();
  //   } catch (error) {
  //     console.error('Error saving items:', error);
  //     setSnackbar({
  //       open: true,
  //       message: error.message || 'Failed to save items',
  //       severity: 'error'
  //     });
  //   } finally {
  //     setApiLoading(false);
  //   }
  // };

  // const handleCloseSnackbar = () => {
  //   setSnackbar({ ...snackbar, open: false });
  // };



  return (
    <Box>
      {/* Header Row */}
      <Box
        sx={{
          display: 'flex',
          backgroundColor: '#f9f9f9',
          fontWeight: 600,
          borderBottom: '1px solid #ddd',
          p: 2,
          borderRadius: '4px 4px 0 0',
        }}
      >
        {columns.map(col => (
          <Box
            key={col.key}
            sx={{
              flex: 1,
              minWidth: 0,
              px: 1,
              fontSize: '0.9rem',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {col.label}
          </Box>
        ))}
        <Box
          sx={{
            width: '120px',
            textAlign: 'center',
            display: { xs: 'none', sm: 'block' }
          }}
        >
          Action
        </Box>
      </Box>

      {/* Dynamic Rows */}
      {rows.map((row, index) => (
        <Box
          key={row.item_id || index}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            borderBottom: '1px solid #eee',
            p: 2,
            gap: { xs: 2, sm: 0 },
            '&:last-child': {
              borderBottom: 'none'
            }
          }}
        >
          {columns.map(col => (
            <Box
              key={col.key}
              sx={{
                flex: 1,
                minWidth: 0,
                px: 1,
                mb: { xs: 1, sm: 0 }
              }}
            >
              <Typography
                sx={{
                  display: { xs: 'block', sm: 'none' },
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  mb: 1
                }}
              >
                {col.label}
              </Typography>
              {col.type === 'select' ? (
                <Select
                  fullWidth
                  value={row[col.key] || ''}
                  onChange={(e) => handleChange(index, col.key, e.target.value)}
                  displayEmpty
                  size="small"
                  sx={{
                    '& .MuiSelect-select': {
                      fontSize: '0.9rem'
                    }
                  }}
                   disabled={isSubmitting}
                >
                  <MenuItem value="" disabled>{col.placeholder}</MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.product_name}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                <TextField
                  type={col.type}
                  value={row[col.key] || ''}
                  onChange={(e) => handleChange(index, col.key, e.target.value)}
                  fullWidth
                  size="small"
                   disabled={col.disabled || isSubmitting}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontSize: '0.9rem'
                    }
                  }}
                />
              )}
            </Box>
          ))}
          <Box
            sx={{
              width: { xs: '100%', sm: '120px' },
              display: 'flex',
              justifyContent: { xs: 'flex-end', sm: 'center' },
              alignItems: 'center',
              mt: { xs: 1, sm: 0 },
              gap: 1
            }}
          >
            {/* <Button
              variant="contained"
              size="small"
              onClick={() => saveItem(index)}
              disabled={isSubmitting}
              sx={{
                backgroundColor: '#10AADF',
                '&:hover': { backgroundColor: '#09B3F1' },
                fontSize: '0.8rem',
                py: 0.5,
                minWidth: '60px'
              }}
            >
              {isSubmitting ? <CircularProgress size={20} /> : 'Save'}
            </Button> */}
            <IconButton
              onClick={() => handleDeleteClick(index)}
              color="error"
              disabled={isSubmitting}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 0, 0.1)',
                },
              }}
            >
              <Delete />
            </IconButton>
          </Box>
        </Box>
      ))}

      <Box sx={{
        mt: 2,
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: { xs: 'row', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={addRow}
          disabled={isSubmitting}
          sx={{
            backgroundColor: 'rgba(249, 115, 22, 0.9)',
            '&:hover': { backgroundColor: 'rgba(249, 115, 22, 0.9)' },
            width: { xs: '50%', sm: 'auto' },
            fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Fixed font size syntax
            whiteSpace: 'nowrap', // Prevent text wrapping
            minHeight: '36px' // Ensure consistent button height
          }}
        >
          Add Product
        </Button>

        {/* <Button
          variant="contained"
          color="success"
          onClick={handleSubmit}
          disabled={apiLoading}
          sx={{
            backgroundColor: '#4CAF50',
            '&:hover': { backgroundColor: '#3e8e41' },
            width: { xs: '50%', sm: 'auto' },
            fontSize: { xs: '0.75rem', sm: '0.875rem' }, // Fixed font size syntax
            minWidth: { xs: 'unset', sm: '120px' }, // Only apply min-width on larger screens
            whiteSpace: 'nowrap', // Prevent text wrapping
            minHeight: '36px' // Ensure consistent button height
          }}
        >
          {apiLoading ? <CircularProgress size={20} /> : 'Submit'}
        </Button> */}
      </Box>

      {/* <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar> */}

      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete {deleteDialog.productName}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            autoFocus
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default PurchaseDetailsForm;