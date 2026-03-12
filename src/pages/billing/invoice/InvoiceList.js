// src/components/Billing/InvoiceList.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Pagination from "../../../components/DynamicComponents/Pagination";
import {
  Box,
  IconButton,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Paper,
  Typography,
  Button,
  MenuItem,
  Select,
  Menu,
} from "@mui/material";
import { Add, Delete, MoreVert } from "@mui/icons-material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { printInvoice } from "./InvoicePrint";
import apiEndpoints from "../../../apiconfig";
import PrintIcon from "@mui/icons-material/Print";
import SectionHeader from '../../../components/common/Header';
import { useLoading } from "../../LoadingContext";
import TemplateSelectionModal from "../../../components/Billing/TemplateSelectionModal";

const columnKeyMap = {
  "Invoice Number": "invoiceNumber",
  "Customer Name": "customerName",
  "Invoice For": "invoiceFor",
  "Number Plate": "numberPlate",
  "Total Amount (₹)": "totalAmount",
  "Paid Amount (₹)": "paidAmount",
  Date: "invoiceDate",
  Status: "status",
};

function InvoiceList({
  invoices = [],
  deleteItems,
  addRoute = "/add-invoice",
}) {
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("invoiceList");
  const [anchorEls, setAnchorEls] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Template Modal State
  const [openTemplateModal, setOpenTemplateModal] = useState(false);
  const [printInvoiceId, setPrintInvoiceId] = useState(null);

  const totalPages = 1;

  const columns = {
    invoiceList: [
      "Invoice Number",
      "Customer Name",
      // "Invoice For",
      "Number Plate",
      "Total Amount (₹)",
      // "Paid Amount (₹)",
      "Date",
      "Status",
    ],
    soldPart: [
      "Invoice Number",
      "Customer Name",
      "Invoice For",
      "Total Amount (₹)",
      // "Paid Amount (₹)",
      "Date",
      "Status",
    ],
  };

  // searches
  const filteredInvoices = invoices.filter((invoice) => {
    const term = searchTerm.toLowerCase();
    return (
      invoice.invoiceNumber?.toLowerCase().includes(term) ||
      invoice.customerName?.toLowerCase().includes(term) ||
      invoice.numberPlate?.toLowerCase().includes(term)
    );
  });

  const handleSelectAll = (event) => {
    setSelectedInvoices(
      event.target.checked ? filteredInvoices.map((i) => i.id) : []
    );
  };

  const handleSelectOne = (id) => {
    setSelectedInvoices((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSingle = (invoiceId) => {
    deleteItems("invoices", [invoiceId]);
    handleMenuClose(invoiceId);
  };

  const handleDelete = (ids = selectedInvoices) => {
    if (ids.length === 0) return;
    deleteItems("invoices", ids);
    setSelectedInvoices([]);
  };

  const handleMenuClick = (event, invoiceId) => {
    setAnchorEls({ ...anchorEls, [invoiceId]: event.currentTarget });
  };

  const handleMenuClose = (invoiceId) => {
    setAnchorEls({ ...anchorEls, [invoiceId]: null });
  };

  const handleEditInvoice = (invoiceId) => {
    navigate(`/edit-invoice/${invoiceId}`);
    handleMenuClose(invoiceId);
  };

  const handleViewInvoice = (invoiceId) => {
    navigate(`/view-invoice/${invoiceId}`);
    handleMenuClose(invoiceId);
  };

  const handleShareOnWhatsApp = (invoice) => {
    const message = `Invoice #${invoice.invoiceNumber} for ${invoice.customerName}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleChangeStatus = (id) => {
    console.log("Change status for invoice", id);
  };

  const token = sessionStorage.getItem("token");

  // Open modal instead of printing directly
  const handlePrintClick = (invoiceId) => {
    setPrintInvoiceId(invoiceId);
    setOpenTemplateModal(true);
    handleMenuClose(invoiceId);
  };

  // Called when template is selected from modal
  const handleTemplateSelect = async (templateId) => {
    setOpenTemplateModal(false);
    if (!printInvoiceId) return;

    try {
      show();
      const res = await fetch(
        `${apiEndpoints.Invoice}?invoice_guid=${printInvoiceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch invoice details");

      const fullInvoice = await res.json();
      printInvoice(fullInvoice, templateId);
    } catch (err) {
      console.error("Print failed", err);
      // You might want to show a snackbar error here
    } finally {
      hide();
      setPrintInvoiceId(null);
    }
  };


  return (

    <Box sx={{ fontFamily: "Montserrat", p: 3 }}>
      {/* Responsive Styles */}
      <style>{`
        .inv-header {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 12px;
        }
        .inv-tabs {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .inv-search-row {
          display: flex;
          justify-content: flex-end;
          width: 100%;
          margin-top: 16px;
        }
        .inv-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }
        .inv-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }
        @media (max-width: 600px) {
          .inv-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .inv-tabs {
            justify-content: flex-start;
          }
          .inv-search-row {
            justify-content: flex-start;
          }
          .inv-table {
            min-width: 720px;
          }
        }
        @media (max-width: 450px) {
          .inv-table {
            min-width: 640px;
          }
        }
      `}</style>
      <SectionHeader />


      {/* TABS */}
      {/* <Box className="inv-tabs"> */}
      {/* <Button
          onClick={() => setActiveTab("invoiceList")}
          sx={{
            fontWeight: "bold",
            borderBottom:
              activeTab === "invoiceList" ? "2px solid #10AADF" : "none",
            color: activeTab === "invoiceList" ? "#10AADF" : "inherit",
          }}
        >
          INVOICE LIST
        </Button> */}
      {/* <Button
          onClick={() => setActiveTab("soldPart")}
          sx={{
            fontWeight: "bold",
            borderBottom:
              activeTab === "soldPart" ? "2px solid #10AADF" : "none",
            color: activeTab === "soldPart" ? "#10AADF" : "inherit",
          }}
        >
          SOLD PART INVOICE LIST
        </Button> */}
      {/* </Box> */}

      {/* SEARCH */}
      <Box className="inv-search-row">
        <TextField
          placeholder="Search..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            backgroundColor: "#f1f3f4",
            borderRadius: "6px",
            width: { xs: "100%", sm: 250 },
            "& fieldset": { border: "none" },
            height: "40px",
            "& input": { padding: "10px" },
          }}
        />
      </Box>

      {/* TABLE */}
      <Paper elevation={0} sx={{ mt: 2, borderRadius: "8px" }}>
        <div className="inv-table-wrapper">
          <Table className="inv-table">
            <TableHead>
              <TableRow>
                {/* <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedInvoices.length === filteredInvoices.length &&
                      filteredInvoices.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell> */}
                {columns[activeTab].map((column) => (
                  <TableCell key={column}>{column}</TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns[activeTab].length + 1}
                    align="center"
                  >
                    No invoices found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => {
                  const isMenuOpen = Boolean(anchorEls[invoice.id]);

                  return (
                    <TableRow key={invoice.id} hover>
                      {/* <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleSelectOne(invoice.id)}
                        />
                      </TableCell> */}

                      {columns[activeTab].map((col) => (
                        <TableCell key={col}>
                          {col === "Number Plate"
                            ? invoice.numberPlate
                            : invoice[columnKeyMap[col]]}
                        </TableCell>
                      ))}

                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuClick(e, invoice.id)}
                        >
                          <MoreVert />
                        </IconButton>

                        <Menu
                          anchorEl={anchorEls[invoice.id]}
                          open={isMenuOpen}
                          onClose={() => handleMenuClose(invoice.id)}
                        >
                          <MenuItem
                            onClick={() => handleEditInvoice(invoice.id)}
                          >
                            <EditIcon fontSize="small" sx={{ mr: 1 }} />
                            Edit
                          </MenuItem>

                          <MenuItem
                            onClick={() => handleViewInvoice(invoice.id)}
                          >
                            <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                            View
                          </MenuItem>

                          <MenuItem
                            onClick={() => handlePrintClick(invoice.id)}
                          >
                            <PrintIcon fontSize="small" sx={{ mr: 1 }} />
                            Print
                          </MenuItem>

                          <MenuItem onClick={() => handleDelete([invoice.id])}>
                            <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                            Delete
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Paper>

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* BOTTOM BAR */}
      {/* <Box mt={4} mb={2} display="flex" alignItems="center">
        <Box
          display="flex"
          alignItems="center"
          sx={{
            backgroundColor: "rgba(249, 115, 22, 0.9)",
            borderRadius: "4px",
            px: 2,
            py: 1.5,
            minHeight: "36px",
            "&:hover": {
              backgroundColor: "rgba(249, 115, 22, 0.9)",
              cursor: "pointer",
            },
          }}
          onClick={() => {
            const allSelected =
              selectedInvoices.length === invoices.length &&
              invoices.length > 0;
            setSelectedInvoices(
              allSelected ? [] : invoices.map((inv) => inv.id)
            );
          }}
        >
          <Checkbox
            checked={
              selectedInvoices.length === invoices.length &&
              invoices.length > 0
            }
            sx={{
              padding: 0,
              color: "white",
              "&.Mui-checked": { color: "white" },
              "&:hover": { backgroundColor: "transparent" },
              pr: 1,
              }}
          />
          <Typography variant="body2" sx={{ color: "white" }}>
            Select All
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => handleDelete()}
          disabled={selectedInvoices.length === 0}
          sx={{
            bgcolor: "red",
            "&:hover": { bgcolor: "darkred" },
            px: 2,
            py: 1.7,
            ml: 1,
            borderRadius: "4px",
            color: "white",
          }}
        >
          <Delete fontSize="small" />
        </Button>
      </Box> */}

      <TemplateSelectionModal
        open={openTemplateModal}
        onClose={() => setOpenTemplateModal(false)}
        onSelect={handleTemplateSelect}
      />
    </Box>
  );
}

InvoiceList.propTypes = {
  invoices: PropTypes.arrayOf(PropTypes.object).isRequired,
  deleteItems: PropTypes.func.isRequired,
  addRoute: PropTypes.string,
};

export default React.memo(InvoiceList);
