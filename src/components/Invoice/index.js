// ===============================
// PRINTABLE INVOICE COMPONENT
// ===============================

import React from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";

export default function InvoiceUI({ invoice }) {
  if (!invoice) return <h2>No invoice data</h2>;

  const formatCurrency = (v) => `₹${Number(v).toFixed(2)}`;

  return (
    <Box
      sx={{
        bgcolor: "#688B6E",
        p: 5,
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper sx={{ width: "750px", bgcolor: "#fff", borderRadius: 2, p: 5 }}>
        {/* ==========================
            HEADER
        =========================== */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 900, color: "#4C694F", letterSpacing: 1 }}
          >
            INVOICE
          </Typography>

          <Box sx={{ textAlign: "right" }}>
            <Typography variant="h6" fontWeight={700} color="#4C694F">
              {invoice.company_name || "ELC Garage"}
            </Typography>
            <Typography variant="caption" display="block">
              {invoice.company_address || "Main Street"}
            </Typography>
            <Typography variant="caption" display="block">
              {invoice.company_phone || "+91 00000 00000"}
            </Typography>
          </Box>
        </Box>

        {/* ==========================
            INVOICE INFO
        =========================== */}
        <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography fontWeight={600}>Invoice Number</Typography>
            <Typography fontWeight={700}>{invoice.invoice_no}</Typography>

            <Typography sx={{ mt: 2 }} fontWeight={600}>
              Date
            </Typography>
            <Typography fontWeight={700}>{invoice.invoice_date}</Typography>

            <Typography sx={{ mt: 2 }} fontWeight={600}>
              Payment Method
            </Typography>
            <Typography fontWeight={700}>
              {invoice.payment_method || "-"}
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 4 }} />

          <Box>
            <Typography fontWeight={700}>{invoice.customer_name}</Typography>
            <Typography variant="caption" display="block">
              Vehicle: {invoice.vehicle_number}
            </Typography>
          </Box>
        </Box>

        {/* ==========================
            TABLE
        =========================== */}
        <Box sx={{ mt: 5 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#4C694F" }}>
                <TableCell sx={{ color: "#fff", fontWeight: 700 }}>
                  Item
                </TableCell>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 700 }}
                  align="right"
                >
                  Qty
                </TableCell>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 700 }}
                  align="right"
                >
                  Price
                </TableCell>
                <TableCell
                  sx={{ color: "#fff", fontWeight: 700 }}
                  align="right"
                >
                  Total
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {invoice.items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.qty}</TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.price)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* ==========================
            TOTAL SUMMARY
        =========================== */}
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography fontWeight={600}>Subtotal</Typography>
            <Typography>{formatCurrency(invoice.summary.subtotal)}</Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography fontWeight={600}>
              Discount ({invoice.summary.discount}%)
            </Typography>
            <Typography>
              - {formatCurrency(invoice.summary.discountAmount)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography fontWeight={600}>
              GST ({invoice.summary.gst}%)
            </Typography>
            <Typography>{formatCurrency(invoice.summary.gstAmount)}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography fontWeight={700}>Grand Total</Typography>
            <Typography fontWeight={700}>
              {formatCurrency(invoice.summary.grandTotal)}
            </Typography>
          </Box>
        </Box>

        {/* ==========================
            FOOTER
        =========================== */}
        <Box sx={{ mt: 5 }}>
          <Typography
            sx={{
              color: "#4C694F",
              fontWeight: 700,
              fontSize: "1.2rem",
              textAlign: "center",
            }}
          >
            THANK YOU!
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
