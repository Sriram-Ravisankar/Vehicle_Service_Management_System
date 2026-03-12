// src/components/Billing/ViewInvoice.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import apiEndpoints from "../../../apiconfig";
import TemplateSelectionModal from "../../../components/Billing/TemplateSelectionModal";
import { printInvoice } from "./InvoicePrint";

export default function ViewInvoice() {
  const { id } = useParams(); // invoice_guid
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [invoice, setInvoice] = useState(null);
  const [openTemplateModal, setOpenTemplateModal] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    const res = await fetch(`${apiEndpoints.Invoice}?invoice_guid=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setInvoice(data);
  };

  const handleTemplateSelect = (templateId) => {
    setOpenTemplateModal(false);
    if (invoice) {
      printInvoice(invoice, templateId);
    }
  };

  if (!invoice) return <div>Loading...</div>;

  const items = invoice.items || [];
  const parts = items.filter((i) => i.category === "Product");
  const labour = items.filter((i) => i.category === "Service");

  const totals = invoice.totals || {};
  const discountPercent = totals.discountPercent || 0;
  const gstPercent = totals.gstPercent || 0;

  // calculate discount ON PARTS ONLY


  const gstAmount = (totals.subtotal * gstPercent) / 100;
  const partsTotal = parts.reduce((s, p) => s + Number(p.total || 0), 0);
  const labourTotal = labour.reduce((s, l) => s + Number(l.total || 0), 0);
  const discountAmount = (partsTotal * discountPercent) / 100;

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3, md: 4 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            color: "rgba(249, 115, 22, 0.9)",
          }}
        >
          Back
        </Button>
        <Button
          startIcon={<PrintIcon />}
          variant="contained"
          onClick={() => setOpenTemplateModal(true)}
          sx={{
            bgcolor: "#f97316",
            "&:hover": { bgcolor: "#ea580c" },
          }}
        >
          Print
        </Button>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          gutterBottom
          sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" } }}
        >
          Invoice #{invoice.invoice_no}
        </Typography>

        {/* BASIC INFO */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Box>
            <Typography fontWeight={600}>Customer Name</Typography>
            <Typography>{invoice.customer_name}</Typography>

            <Typography fontWeight={600} mt={2}>
              Customer Mobile
            </Typography>
            <Typography>{invoice.customer_mobile || "-"}</Typography>

            <Typography fontWeight={600} mt={2}>
              Vehicle Number
            </Typography>
            <Typography>{invoice.vehicle_number || "-"}</Typography>

            <Typography fontWeight={600} mt={2}>
              Invoice Date
            </Typography>
            <Typography>{invoice.created_on?.split(" ")[0]}</Typography>
          </Box>

          <Box>
            <Typography fontWeight={600}>Payment Method</Typography>
            <Typography>{invoice.payment_method}</Typography>

            <Typography fontWeight={600} mt={2}>
              Paid Amount
            </Typography>
            <Typography>{invoice.paid_amount}</Typography>

            {/* <Typography fontWeight={600} mt={2}>
              Status
            </Typography>
            <Typography>{invoice.status}</Typography> */}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* PARTS TABLE */}
        <Typography variant="h6" fontWeight="bold">
          Parts
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Part</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Rate</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {parts.length > 0 ? (
                parts.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell align="right">{item.qty}</TableCell>
                    <TableCell align="right">{item.price}</TableCell>
                    <TableCell align="right">{item.total}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No parts added
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
        <Divider sx={{ my: 3 }} />

        {/* LABOUR TABLE */}
        <Typography variant="h6" fontWeight="bold">
          Labour Charges
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Labour</TableCell>
                <TableCell align="right">Amount</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {labour.length > 0 ? (
                labour.map((lb, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{lb.name}</TableCell>
                    <TableCell align="right">{lb.total}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No labour added
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
        <Divider sx={{ my: 3 }} />

        {/* TOTALS */}
        <Box
          sx={{
            width: { xs: "100%", sm: "300px" },
            ml: "auto",
            mt: { xs: 2, sm: 0 },
          }}
        >
          <Typography>Product Total: ₹{partsTotal}</Typography>

          <Typography>
            Discount ({discountPercent}%): -₹{discountAmount}
          </Typography>

          <Typography>
            GST ({gstPercent}%): ₹{gstAmount}
          </Typography>

          <Typography>Labour Charges: ₹{labourTotal}</Typography>

          <Typography
            variant="h6"
            mt={2}
            fontWeight="bold"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Grand Total: ₹{totals.grandTotal}
          </Typography>
        </Box>
      </Paper>

      <TemplateSelectionModal
        open={openTemplateModal}
        onClose={() => setOpenTemplateModal(false)}
        onSelect={handleTemplateSelect}
      />
    </Box>
  );
}
