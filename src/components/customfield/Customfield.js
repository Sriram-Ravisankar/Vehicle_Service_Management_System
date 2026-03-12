import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../DynamicComponents/Pagination';

import {
  Box,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Avatar,
  Menu,
  Stack,
} from '@mui/material';
import { Add, Delete, MoreVert, Settings } from '@mui/icons-material';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import { FaTrash } from "react-icons/fa";
import SectionHeader from '../common/Header';

const CustomerList = ({ title = "Custom Fields" }) => {
  const navigate = useNavigate();
  const [customFields, setCustomFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);
  const [rows, setRows] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedField, setSelectedField] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;
  // Load fields from localStorage on component mount
  useEffect(() => {
    const savedFields = localStorage.getItem('customFields');
    if (savedFields) {
      setCustomFields(JSON.parse(savedFields));
    }
  }, []);

  // Handle field deletion
  const handleDelete = (ids = selectedFields) => {
    const updatedFields = customFields.filter(f => !ids.includes(f.id));
    setCustomFields(updatedFields);
    localStorage.setItem('customFields', JSON.stringify(updatedFields));
    setSelectedFields([]);
  };



  const handleSelectOne = (id) => {
    setSelectedFields(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleMenuOpen = (event, field) => {
    setAnchorEl(event.currentTarget);
    setSelectedField(field);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedField(null);
  };
  const handleSelectAll = () => {
    const allSelected = selectedFields.length === customFields.length;
    const newSelected = allSelected ? [] : customFields.map(field => field.id);
    setSelectedFields(newSelected);
  };



  const handleDeleteSelected = () => {
    handleDelete(selectedFields);
  };
  


  // In CustomerList.js - update the handleEdit function
  const handleEdit = (field) => {
    navigate('/custom-form', {
      state: {
        fieldData: {
          ...field,
          isRequired: field.isRequired ? "Yes" : "No",
          isVisible: field.isVisible ? "Yes" : "No"
        }
      }
    });
  };
  // Toggle select all/deselect all
  const toggleSelectAll = () => {
    if (selectedFields.length === customFields.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(customFields.map(f => f.id));
    }
  };

  // Filter fields based on search term
  const filteredFields = customFields.filter(field => {
    const term = searchTerm.toLowerCase();
    return (
      field.formName.toLowerCase().includes(term) ||
      field.labelName.toLowerCase().includes(term)
    );
  });

  return (
    <Box sx={styles.container}>

      <SectionHeader/>
      <Box sx={styles.searchContainer} marginTop={2}>
        <Select
          defaultValue={10}
          size="small"
          sx={styles.select}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
        <TextField
          placeholder="Search fields..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={styles.searchField}
        />
      </Box>

      {/* Fields Table */}
      <Box sx={styles.tableContainer}>
        <Paper elevation={0}>
          <Table sx={styles.table}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedFields.length > 0 &&
                      selectedFields.length === customFields.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Form Name</TableCell>
                <TableCell>Field Label</TableCell>
                <TableCell>Field Type</TableCell>
                <TableCell>Required</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFields.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={styles.noResults}>
                      No fields found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFields.map((field) => (
                  <TableRow key={field.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedFields.includes(field.id)}
                        onChange={() => handleSelectOne(field.id)}
                      />
                    </TableCell>
                    <TableCell>{field.formName}</TableCell>
                    <TableCell>{field.labelName}</TableCell>
                    <TableCell>{field.fieldType}</TableCell>
                    <TableCell>{field.isRequired ? "Yes" : "No"}</TableCell>
                    <TableCell>
                      <IconButton onClick={(e) => handleMenuOpen(e, field)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            handleEdit(selectedField);
            handleMenuClose();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDelete([selectedField?.id]);
            handleMenuClose();
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      <Box mt={4} mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="contained"
            onClick={handleSelectAll}
            sx={{
              bgcolor: "rgba(249, 115, 22, 0.9)",
              "&:hover": { bgcolor: "rgba(249, 115, 22, 0.9)" },
              display: "flex",
              alignItems: "center",
              px: 2,
              py: 1,
              borderRadius: "4px",
            }}
          >
            <Checkbox
              checked={
                selectedFields.length === filteredFields.length &&
                filteredFields.length > 0
              }
              onChange={handleSelectAll}
              sx={{ color: "white", p: 0, pr: 1 }}
            />


            Select All
          </Button>

          <Button
            variant="contained"
            onClick={handleDeleteSelected}
            sx={{
              bgcolor: "red",
              "&:hover": { bgcolor: "darkred" },
              px: 2,
              py: 1.5,
              borderRadius: "4px",
              color: "white",
              minWidth: "auto",
            }}
          >
            <FaTrash size={16} />
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

// MUI Styles
const styles = {
  container: {
    fontFamily: "Montserrat",
    p: { xs: 1, sm: 3 }
  },
  headerContainer: {
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    justifyContent: "space-between",
    mb: 2,
    gap: 2
  },
  titleContainer: {
    display: "flex",
    alignItems: "center",
    mb: { xs: 1, sm: 0 }
  },
  titleText: {
    fontWeight: "bold",
    mr: 1
  },
  addButton: {
    backgroundColor: "#f26522",
    color: "white",
    width: 30,
    height: 30,
    "&:hover": { backgroundColor: "#f26522" }
  },
  actionsContainer: {
    display: "flex",
    justifyContent: { xs: "flex-start", sm: "flex-end" },
    gap: 1
  },
  iconButton: {
    backgroundColor: "#f1f3f4"
  },
  assignButton: {
    backgroundColor: "#F26522",
    color: "white",
    borderRadius: "8px",
    "&:hover": { backgroundColor: "#D9531E" }
  },
  searchContainer: {
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    justifyContent: "space-between",
    alignItems: { xs: "flex-start", sm: "center" },
    mb: 2,
    gap: 2
  },
  select: {
    width: { xs: "100%", sm: 80 },
    height: 36
  },
  searchField: {
    backgroundColor: "#f1f3f4",
    borderRadius: "6px",
    width: { xs: "100%", sm: 250 },
    "& fieldset": { border: "none" }
  },
  tableContainer: {
    overflowX: "auto"
  },
  table: {
    minWidth: 600
  },
  noResults: {
    p: 4
  },
  footerContainer: {
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    justifyContent: "space-between",
    alignItems: "center",
    mt: 2,
    gap: 2
  },
  footerActions: {
    display: "flex",
    alignItems: "center",
    gap: 1
  },
  selectButton: {
    backgroundColor: "#f26522",
    color: "white",
    height: 36,
    minWidth: 120,
    "&:hover": { backgroundColor: "#D9531E" }
  },
  deleteButton: {
    backgroundColor: "#d32f2f",
    color: "white",
    height: 36,
    width: 36,
    "&:hover": { backgroundColor: "#b71c1c" }
  }
};

export default CustomerList;