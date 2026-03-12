import React, { useState, useEffect } from "react";
import { 
  Tabs, 
  Tab, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Key for localStorage
const STORAGE_KEY = 'invoiceCollections';

const InvoicePanel = ({ collections, setCollections, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  // const [collections, setCollections] = useState([]);
  const [formData, setFormData] = useState({
    type: "",
    bankName: "",
    chequeNo: "",
    amount: "",
    paymentDate: "",
    remarks: ""
  });
  const [editingId, setEditingId] = useState(null);

  // Payment type options
  const paymentTypes = ["Cash", "Debit card", "Cheque", "NEFT", "Others"];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedCollections = localStorage.getItem(STORAGE_KEY);
    if (savedCollections) {
      setCollections(JSON.parse(savedCollections));
    }
  }, [setCollections]);


  // Save to localStorage whenever collections change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  }, [collections]);

  const handleAddCollection = () => {
    if (!formData.type || !formData.amount) return;
    
    const newCollection = {
      ...formData,
      receiptNo: `RCPT${Math.floor(1000 + Math.random() * 9000)}`,
      invoiceNo: `INV${Math.floor(1000 + Math.random() * 9000)}`,
      paid: "Yes",
      id: Date.now()
    };
    
    setCollections([...collections, newCollection]);
    resetForm();
  };

  const handleEditCollection = (id) => {
    const collectionToEdit = collections.find(item => item.id === id);
    if (collectionToEdit) {
      setFormData({
        type: collectionToEdit.type,
        bankName: collectionToEdit.bankName,
        chequeNo: collectionToEdit.chequeNo,
        amount: collectionToEdit.amount,
        paymentDate: collectionToEdit.paymentDate || "",
        remarks: collectionToEdit.remarks || ""
      });
      setEditingId(id);
    }
  };

  const handleUpdateCollection = () => {
    if (!formData.type || !formData.amount) return;
    
    setCollections(collections.map(item => 
      item.id === editingId ? { 
        ...item, 
        ...formData 
      } : item
    ));
    
    resetForm();
    setEditingId(null);
  };

  const handleDeleteCollection = (id) => {
    setCollections(collections.filter(item => item.id !== id));
    if (editingId === id) {
      resetForm();
      setEditingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "",
      bankName: "",
      chequeNo: "",
      amount: "",
      paymentDate: "",
      remarks: ""
    });
  };

  const tabs = [
    {
      label: "Collections",
      content: (
        <CollectionsTab 
          collections={collections} 
          formData={formData}
          setFormData={setFormData}
          onSave={editingId ? handleUpdateCollection : handleAddCollection}
          onEdit={handleEditCollection}
          onDelete={handleDeleteCollection}
          editingId={editingId}
          paymentTypes={paymentTypes}
        />
      )
    },
    {
      label: "Service Suggestions",
      content: <PlaceholderContent tabName="Service Suggestions" />
    },
    {
      label: "Cancelled Invoices",
      content: <PlaceholderContent tabName="Cancelled Invoices" />
    },
    {
      label: "Reminders",
      content: <PlaceholderContent tabName="Reminders" />
    }
  ];

  const handleChange = (_, newValue) => {
    setActiveTab(newValue);
  };

  if (!isOpen) return null;

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ 
        bgcolor: "#1976d2", 
        color: "white", 
        p: 2,
        borderRadius: "8px 8px 0 0", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center"
      }}>
        <Tabs value={activeTab} onChange={handleChange} textColor="inherit">
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab.label} sx={{ color: "white", textTransform: "none" }} />
          ))}
        </Tabs>
        <IconButton
        
        onClick={onClose}
          sx={{
            bgcolor: "white",
            color: "black",
            borderRadius: "50%",
            padding: "4px",
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ backgroundColor: "white", p: 3, borderRadius: "0 0 8px 8px" }}>
        {tabs[activeTab].content}
      </Box>
    </Box>
  );
};

const CollectionsTab = ({ 
  collections, 
  formData, 
  setFormData, 
  onSave, 
  onEdit, 
  onDelete, 
  editingId,
  paymentTypes
}) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Box>
      <Box display="flex" flexWrap="wrap" gap={0} mb={2}>
      <FormControl 
  sx={{ 
    width: 200,
    minHeight: 56,
    marginRight: '-1px',
    zIndex: 1300, // Add this to ensure the form control stays above other elements
  }} 
  variant="outlined"
  size="small"
>
  <InputLabel id="type-label">Type *</InputLabel>
  <Select
    labelId="type-label"
    name="type"
    value={formData.type}
    onChange={handleInputChange}
    label="Type *"
    required
    sx={{
      borderRadius: 0,
      height: 40,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(0, 0, 0, 0.23)',
      },
    }}
    MenuProps={{
      sx: {
        zIndex: 1500, // This ensures the dropdown menu appears above everything
      },
      PaperProps: {
        sx: {
          zIndex: 1500, // Additional z-index for the paper/popover component
        }
      }
    }}
    displayEmpty
  >
    {/* <MenuItem value="" disabled>
      <em>Select payment type</em>
    </MenuItem> */}
    {paymentTypes.map((type) => (
      <MenuItem key={type} value={type}>{type}</MenuItem>
    ))}
  </Select>
</FormControl>
        {[
          { name: "bankName", label: "Bank Name" },
          { name: "chequeNo", label: "Cheque No" },
          { name: "amount", label: "Amount", type: "number", required: true },
          { name: "paymentDate", label: "Payment Date", type: "date", shrink: true },
          { name: "remarks", label: "Remarks" },
        ].map((field) => (
          <TextField
            key={field.name}
            name={field.name}
            label={field.label}
            size="small"
            type={field.type || "text"}
            InputLabelProps={field.shrink ? { shrink: true } : undefined}
            value={formData[field.name]}
            onChange={handleInputChange}
            required={field.required || false}
            sx={{
              borderRadius: 0,
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
              },
              maxWidth: 200,
              minHeight: 40,
              marginRight: '-1px',
            }}
          />
        ))}

        <Button
          variant="contained"
          onClick={onSave}
          sx={{
            height: 40,
            minWidth: 40,
            padding: 0,
            borderRadius: 0,
          }}
        >
          {editingId ? <EditIcon /> : <AddIcon />}
        </Button>
      </Box>

      {collections.length > 0 ? (
        <Table size="small" component={Paper}>
          <TableHead>
            <TableRow>
              {/* <TableCell>Type</TableCell> */}
              <TableCell>Bank Name</TableCell>
              <TableCell>Cheque No</TableCell>
              <TableCell>Receipt No</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell>Invoice No</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Remarks</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collections.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.bankName || "-"}</TableCell>
                <TableCell>{row.chequeNo || "-"}</TableCell>
                <TableCell>{row.receiptNo}</TableCell>
                <TableCell>{row.amount}</TableCell>
                <TableCell>{row.paymentDate || "-"}</TableCell>
                <TableCell>{row.invoiceNo}</TableCell>
                <TableCell>{row.paid}</TableCell>
                <TableCell>{row.remarks || "-"}</TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => onEdit(row.id)}
                    color="primary"
                    aria-label="edit"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => onDelete(row.id)}
                    color="error"
                    aria-label="delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography variant="body2" color="textSecondary" align="center" py={4}>
          No collections added yet.
        </Typography>
      )}
    </Box>
  );
};

const PlaceholderContent = ({ tabName }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body1" color="text.secondary" align="center">
        {tabName} content will be displayed here. This is a placeholder for the {tabName.toLowerCase()} functionality.
      </Typography>
    </Box>
  );
};

export default InvoicePanel;