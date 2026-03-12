import React, { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Chip,
  Stack,
  Dialog,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Checkbox,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import PrintIcon from "@mui/icons-material/Print";
import EmailIcon from "@mui/icons-material/Email";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import {
  FaBoxOpen,
  FaTools,
  FaCarSide,
  FaSyncAlt,
  FaBath,
  FaClipboardList,
  FaTachometerAlt,
} from "react-icons/fa";
import PartEntryRow from "../Userinvoice/PartEntryRow";

const MergedPartsPage = () => {
  // State for Technician Assignment dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLabour, setSelectedLabour] = useState("");

  // State for invoice rows
  const [rows, setRows] = useState([]);

  // State for InvoiceHeader dropdown
  const [showDropdown, setShowDropdown] = useState(false);

  // Parts data (simplified for this example)
  const parts = [
    {
      id: 1,
      partName: "PISTON (STD)",
      partLabour: "Part",
      partNo: "",
      qty: "1.00",
      price: "500.00",
      total: "500.00",
      approval: "REJECT",
    },
    {
      id: 2,
      partName: "CRANK SHAFT",
      partLabour: "Part",
      partNo: "A-ALL-2493",
      qty: "1.00",
      price: "750.00",
      total: "750.00",
      approval: "APPROVED",
    },
    // Add more parts as needed
  ];

  const taLabels = ["Denting", "R&R", "Change"];
  const orangeTickIds = [2, 3, 4, 5, 6, 7];

  const serviceCategories = [
    { label: "Packages", icon: <FaBoxOpen size={30} /> },
    { label: "All Services", icon: <FaTools size={30} /> },
    { label: "Wheel Alignment", icon: <FaCarSide size={30} /> },
    { label: "Wheel Balancing", icon: <FaSyncAlt size={30} /> },
    { label: "Wash & Detailing Services", icon: <FaBath size={30} /> },
    { label: "PMS & Check-Ups", icon: <FaClipboardList size={30} /> },
    { label: "Tyres & Services", icon: <FaTachometerAlt size={30} /> },
  ];

  // Handlers
  const handleTAClick = (labourType) => {
    setSelectedLabour(labourType);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleAddRow = (newRow) => {
    setRows((prev) => [...prev, { ...newRow, id: Date.now() }]);
  };

  const handleChange = (index, field, value) => {
    setRows((prevRows) => {
      const updatedRows = [...prevRows];
      updatedRows[index] = { ...updatedRows[index], [field]: value };
      return updatedRows;
    });
  };

  const handleCategoryClick = (label) => {
    if (label === "Packages") {
      setShowDropdown((prev) => !prev);
    } else {
      setShowDropdown(false);
    }
  };

  const triangle = (
    <Typography component="span" fontSize="12px" ml={0.5}>
      ▲
    </Typography>
  );

  return (
    <Box sx={{ pb: 8 }}>
      <Box
        sx={{
          fontFamily: "Montserrat",
          backgroundColor: "#F4F4F4",
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            backgroundColor: "#fff",
            p: "10px 20px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ margin: 0 }}>
              4567HJI / JC: INT-J001471
            </Typography>
            <Typography variant="caption" sx={{ color: "#666" }}>
              Examination &gt; Proforma Invoice &gt; Invoice
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              fontSize: "14px",
              gap: "20px",
            }}
          >
            <Box>
              <strong>JOB CARD</strong>
            </Box>
            <Box>
              <strong>DETAILS</strong> ▼
            </Box>
            <Box>
              Bill No: <strong style={{ color: "#007BFF" }}>INT-P01027</strong>
            </Box>
            <Box>
              Bill Date: <strong>May 12 2022</strong>
            </Box>
          </Box>
        </Box>

        {/* Service Categories */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            backgroundColor: "#fff",
            p: "20px 0",
            borderBottom: "1px solid #ddd",
          }}
        >
          {serviceCategories.map((category, index) => (
            <Box
              key={index}
              sx={{
                textAlign: "center",
                cursor: "pointer",
                color: "#333",
                transition: "color 0.3s ease",
              }}
              onClick={() => handleCategoryClick(category.label)}
            >
              {category.icon}
              <Typography
                sx={{
                  mt: "5px",
                  fontSize: "14px",
                  color: "#007BFF",
                  fontWeight: "500",
                }}
              >
                {category.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      {/* Part Entry */}
      <Box sx={{ p: 2 }}>
        <PartEntryRow onAdd={handleAddRow} />
        <br />

        {/* Invoice Table */}
        {rows.length > 0 && (
          <TableContainer component={Paper} sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>Part Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.partName}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.price}</TableCell>
                    <TableCell>{row.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Parts Table */}
        <Typography variant="h5" gutterBottom>
          Parts Table
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox disabled />
                </TableCell>
                <TableCell>#</TableCell>
                <TableCell>Part Name</TableCell>
                <TableCell>Part / Labour</TableCell>
                <TableCell>Part No.</TableCell>
                <TableCell>Qty / Price</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Approval</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parts.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={orangeTickIds.includes(row.id)}
                      icon={<CheckBoxOutlineBlankIcon />}
                      checkedIcon={<CheckBoxIcon sx={{ color: "orange" }} />}
                    />
                  </TableCell>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.partName}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography>{row.partLabour}</Typography>
                      {taLabels.includes(row.partLabour) && (
                        <Chip
                          label="TA"
                          size="small"
                          onClick={() => handleTAClick(row.partLabour)}
                          sx={{
                            backgroundColor: "green",
                            color: "white",
                            fontWeight: "bold",
                            height: "20px",
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "darkgreen",
                            },
                          }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{row.partNo || "—"}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center">
                      {row.qty || "—"} / {row.price}
                      {triangle}
                    </Stack>
                  </TableCell>
                  <TableCell>{row.total}</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center">
                      <Button
                        variant="outlined"
                        color={
                          row.approval === "APPROVED" ? "success" : "error"
                        }
                        size="small"
                        sx={{ textTransform: "none" }}
                      >
                        {row.approval}
                      </Button>
                      {triangle}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          backgroundColor: "#f0f0f0",
          p: "4px 8px",
          borderTop: "1px solid #ccc",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <Button variant="text" size="small" sx={{ minWidth: "auto" }}>
          Remarks
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button variant="text" size="small" sx={{ minWidth: "auto" }}>
          Collections
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button variant="text" size="small" sx={{ minWidth: "auto" }}>
          Service Suggestions
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button variant="text" size="small" sx={{ minWidth: "auto" }}>
          Cancelled Invoices
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button variant="text" size="small" sx={{ minWidth: "auto" }}>
          Reminder
        </Button>
        <Divider orientation="vertical" flexItem />
        <Button
          variant="contained"
          size="small"
          color="primary"
          sx={{ textTransform: "none" }}
        >
          Parts
        </Button>
        <Button
          variant="contained"
          size="small"
          color="error"
          sx={{ textTransform: "none" }}
        >
          Cancel Job Card
        </Button>
        <PrintIcon fontSize="small" sx={{ cursor: "pointer" }} />
        <EmailIcon fontSize="small" sx={{ cursor: "pointer" }} />
        <DirectionsCarIcon fontSize="small" sx={{ cursor: "pointer" }} />
      </Box>{" "}
      {/* Technician Assignment Dialog */}
    </Box>
  );
};

export default MergedPartsPage;
