import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Typography,
  TextField,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  Paper,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import Pagination from "../../../components/DynamicComponents/Pagination";
import SectionHeader from '../../../components/common/Header';
import { Delete } from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import apiEndpoints from "../../../apiconfig";
import { printQuotation } from "./QuotationPrint";
import { useLoading } from "../../LoadingContext";
import TemplateSelectionModal from "../../../components/Billing/TemplateSelectionModal";

export default function QuotationList() {
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const token = sessionStorage.getItem("token");

  const [quotations, setQuotations] = useState([]);
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5; // same visual density as invoice

  // Template Modal State
  const [openTemplateModal, setOpenTemplateModal] = useState(false);
  const [printQuotationGuid, setPrintQuotationGuid] = useState(null);

  const [confirmPopup, setConfirmPopup] = useState({
    open: false,
    quotation: null,
  });

  /* ---------------- LOAD LIST ---------------- */
  const loadQuotations = async () => {
    try {
      show();
      const res = await fetch(apiEndpoints.Quotation + "?list=1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setQuotations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Quotation list failed:", e);
    } finally {
      hide();
    }
  };

  useEffect(() => {
    loadQuotations();
  }, []);

  /* ---------------- SEARCH ---------------- */
  const filtered = quotations.filter((q) => {
    const s = search.toLowerCase();
    return (
      q.quotation_no?.toLowerCase().includes(s) ||
      q.status?.toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const paginatedQuotations = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );


  /* ---------------- MENU ---------------- */
  const openMenu = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  /* ---------------- STATUS ---------------- */
  const handleStatusChange = async (quotation_guid, newStatus, row) => {
    if (newStatus === "Completed") {
      setConfirmPopup({ open: true, quotation: row });
      return;
    }

    if (newStatus === "Rejected") {
      if (!window.confirm("Are you sure you want to reject this quotation?")) {
        return;
      }
    }

    await updateStatusAPI(quotation_guid, newStatus);
  };


  const updateStatusAPI = async (quotation_guid, newStatus) => {
    try {
      const form = new FormData();
      form.append("status", newStatus);

      const res = await fetch(
        apiEndpoints.Quotation + "?quotation_guid=" + quotation_guid,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        }
      );

      const data = await res.json();
      if (data.success) {
        setQuotations((prev) =>
          prev.map((q) =>
            q.quotation_guid === quotation_guid
              ? { ...q, status: newStatus }
              : q
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- UTIL ---------------- */
  const safeParse = (val) => {
    if (!val) return {};
    if (typeof val === "object") return val;
    try {
      return JSON.parse(val);
    } catch {
      return {};
    }
  };

  const fetchFullQuotation = async (guid) => {
    try {
      const res = await fetch(
        apiEndpoints.Quotation + "?quotation_guid=" + guid,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      return Array.isArray(data) ? data[0] : data;
    } catch {
      return null;
    }
  };

  const deleteQuotation = async (guid) => {
    try {
      const res = await fetch(
        apiEndpoints.Quotation + "?quotation_guid=" + guid,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) loadQuotations();
    } catch (e) {
      console.error(e);
    }
  };

  /* ---------------- HANDLE PRINT ---------------- */
  const handlePrintClick = () => {
    if (selectedRow) {
      setPrintQuotationGuid(selectedRow.quotation_guid);
      setOpenTemplateModal(true);
      closeMenu();
    }
  };

  const handleTemplateSelect = async (templateId) => {
    setOpenTemplateModal(false);
    if (!printQuotationGuid) return;

    try {
      show();
      const full = await fetchFullQuotation(printQuotationGuid);
      if (full) {
        printQuotation(full, templateId);
      }
    } catch (e) {
      console.error("Print error:", e);
    } finally {
      hide();
      setPrintQuotationGuid(null);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <Box sx={{ fontFamily: "Montserrat", p: 3 }}>
      <SectionHeader />

      {/* SEARCH */}
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <TextField
          placeholder="Search..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
      <Paper elevation={0} sx={{ mt: 2, borderRadius: 2 }}>
        <Box sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                {/* <TableCell padding="checkbox">
                  <Checkbox
                    checked={
                      selectedIds.length === filtered.length &&
                      filtered.length > 0
                    }
                    onChange={(e) =>
                      setSelectedIds(
                        e.target.checked
                          ? filtered.map((q) => q.quotation_guid)
                          : []
                      )
                    }
                  />
                </TableCell> */}
                <TableCell>Quotation No</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Items</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedQuotations.map((row) => {

                const totals = safeParse(row.totals);
                const parts = safeParse(row.parts);
                const labour = safeParse(row.labour);
                const itemsCount =
                  (parts?.length || 0) + (labour?.length || 0);

                return (
                  <TableRow key={row.quotation_guid} hover>
                    {/* <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(row.quotation_guid)}
                        onChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(row.quotation_guid)
                              ? prev.filter((id) => id !== row.quotation_guid)
                              : [...prev, row.quotation_guid]
                          )
                        }
                      />
                    </TableCell> */}

                    <TableCell>{row.quotation_no}</TableCell>
                    <TableCell>{row.customer_name || "-"}</TableCell>
                    <TableCell>
                      {new Date(row.created_on).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{itemsCount} items</TableCell>
                    <TableCell>
                      ₹{Number(totals?.grandTotal || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={row.status}
                        onChange={(e) =>
                          handleStatusChange(
                            row.quotation_guid,
                            e.target.value,
                            row
                          )
                        }
                        sx={{ minWidth: 200 }}
                      >
                        <MenuItem value="Approval Pending">
                          Approval Pending
                        </MenuItem>
                        <MenuItem value="Work In Progress">
                          Work In Progress
                        </MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Delivered">Delivered</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                      </Select>
                    </TableCell>

                    <TableCell align="right">
                      <IconButton onClick={(e) => openMenu(e, row)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* ACTION MENU */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            navigate("/view-quotation/" + selectedRow?.quotation_guid);
            closeMenu();
          }}
        >
          <VisibilityIcon sx={{ mr: 1 }} /> View
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate("/edit-quotation/" + selectedRow?.quotation_guid);
            closeMenu();
          }}
        >
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>

        <MenuItem
          onClick={handlePrintClick}
        >
          <PrintIcon sx={{ mr: 1 }} /> Print
        </MenuItem>

        <MenuItem
          sx={{ color: "red" }}
          onClick={() => {
            deleteQuotation(selectedRow?.quotation_guid);
            closeMenu();
          }}
        >
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* PAGINATION */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />



      {/* BULK ACTION BAR */}
      {/* <Box mt={4} display="flex" alignItems="center">
        <Box
          display="flex"
          alignItems="center"
          sx={{
            backgroundColor: "rgba(249, 115, 22, 0.9)",
            borderRadius: "4px",
            px: 2,
            py: 1.5,
            cursor: "pointer",
          }}
          onClick={() =>
            setSelectedIds(
              selectedIds.length === quotations.length
                ? []
                : quotations.map((q) => q.quotation_guid)
            )
          }
        >
          <Checkbox
            checked={
              selectedIds.length === quotations.length &&
              quotations.length > 0
            }
            sx={{
              padding: 0,
              color: "white",
              "&.Mui-checked": { color: "white" },
            }}
          />
          <Typography color="white">Select All</Typography>
        </Box>

        <Button
          variant="contained"
                   sx={{
            bgcolor: "red",
            "&:hover": { bgcolor: "darkred" },
            px: 2,
            py: 1.7,
            ml: 1,
            borderRadius: "4px",
            color: "white",
          }}
          disabled={selectedIds.length === 0}
          onClick={() => {
            selectedIds.forEach((id) => deleteQuotation(id));
            setSelectedIds([]);
          }}
        >
           <Delete fontSize="small" />
        </Button>
      </Box> */}

      {/* CONFIRM POPUP */}
      <Dialog
        open={confirmPopup.open}
        onClose={() => setConfirmPopup({ open: false, quotation: null })}
      >
        <DialogTitle>Move to Invoice?</DialogTitle>
        <DialogContent>
          <Typography>
            This quotation is marked as <b>Completed</b>.
            <br />
            Do you want to convert it into an invoice?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained"
            sx={{ color: "#f97316", backgroundColor: "white", "&:hover": { color: "#ea580c" } }}
            onClick={async () => {
              await updateStatusAPI(
                confirmPopup.quotation.quotation_guid,
                "Completed"
              );
              setConfirmPopup({ open: false, quotation: null });
            }}
          >
            No
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#f97316",
              "&:hover": { backgroundColor: "#ea580c" },
            }}
            onClick={async () => {
              const q = confirmPopup.quotation;
              await updateStatusAPI(q.quotation_guid, "Completed");
              const full = await fetchFullQuotation(q.quotation_guid);
              setConfirmPopup({ open: false, quotation: null });
              if (full) {
                navigate("/add-invoice", { state: { quotation: full } });
              }
            }}
          >
            Yes, Create Invoice
          </Button>
        </DialogActions>
      </Dialog>

      <TemplateSelectionModal
        open={openTemplateModal}
        onClose={() => setOpenTemplateModal(false)}
        onSelect={handleTemplateSelect}
      />
    </Box>
  );
}
