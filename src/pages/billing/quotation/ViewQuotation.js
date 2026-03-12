// src/components/Quotation/ViewQuotation.js
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
import apiEndpoints from "../../../apiconfig";

export default function ViewQuotation() {
  const { quotation_guid } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [quotation, setQuotation] = useState(null);

  useEffect(() => {
    fetchQuotation();
  }, []);

  const fetchQuotation = async () => {
    try {
      const res = await fetch(
        `${apiEndpoints.Quotation}?quotation_guid=${quotation_guid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let data = await res.json();

      // API sometimes returns array
      if (Array.isArray(data)) data = data[0];
      if (!data) return;

      // ✅ SAFE NORMALIZATION (ADD HERE)
      const parts =
        Array.isArray(data.parts)
          ? data.parts
          : typeof data.parts === "string"
            ? JSON.parse(data.parts)
            : [];

      const labour =
        Array.isArray(data.labour)
          ? data.labour
          : typeof data.labour === "string"
            ? JSON.parse(data.labour)
            : [];

      const totals =
        typeof data.totals === "object" && data.totals !== null
          ? data.totals
          : {
            gstPercent: data.gst || 0,
            grandTotal: data.grandTotal || 0,
            discountPercent: 0,
          };

      // ✅ SET STATE (ONLY ONCE)
      setQuotation({
        ...data,
        parts,
        labour,
        totals,
      });

    } catch (err) {
      console.error("Fetch quotation failed:", err);
    }
  };



  if (!quotation) return <div>Loading...</div>;

  /* -------------------------------------------------
     SAME CALCULATIONS AS INVOICE
  --------------------------------------------------*/
  // PARTS TOTAL
  const partsTotal = quotation.parts.reduce(
    (sum, p) => sum + Number(p.amount ?? p.qty * p.rate ?? 0),
    0
  );

  const labourTotal = quotation.labour.reduce(
    (sum, l) => sum + Number(l.amount ?? l.hours * l.rate ?? 0),
    0
  );


  // TOTALS FROM BACKEND
  const totals = {
    discountPercent: 0,
    gstPercent: Number(quotation.gst || 0),
    grandTotal: Number(
      quotation.grandTotal || partsTotal + labourTotal
    ),
  };

  // EXTRACT PERCENTS
  const discountPercent = totals.discountPercent;
  const gstPercent = totals.gstPercent;

  // DERIVED AMOUNTS
  const discountAmount = (partsTotal * discountPercent) / 100;
  const gstAmount =
    ((partsTotal - discountAmount) * gstPercent) / 100;


  return (
    <Box sx={{ p: 4 }}>
      {/* BACK */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Quotation #{quotation.quotation_no}
        </Typography>

        {/* BASIC INFO — SAME LAYOUT AS INVOICE */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
          <Box>
            <Typography fontWeight={600}>Customer Name</Typography>
            <Typography>{quotation.customer_name}</Typography>

            <Typography fontWeight={600} mt={2}>
              Vehicle Number
            </Typography>
            <Typography>{quotation.vehicle_number || "-"}</Typography>

            <Typography fontWeight={600} mt={2}>
              Quotation Date
            </Typography>
            <Typography>{quotation.created_on?.split(" ")[0]}</Typography>
          </Box>

          <Box>
            <Typography fontWeight={600}>Status</Typography>
            <Typography>{quotation.status}</Typography>

            {/* <Typography fontWeight={600} mt={2}>
              Notes
            </Typography>
            <Typography>{quotation.notes || "-"}</Typography> */}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* PARTS */}
        <Typography variant="h6" fontWeight="bold">
          Parts
        </Typography>

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
            {quotation.parts.length > 0 ? (
              quotation.parts.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="right">{item.qty}</TableCell>
                  <TableCell align="right">₹ {item.rate}</TableCell>
                  <TableCell align="right">₹ {item.amount}</TableCell>
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

        <Divider sx={{ my: 3 }} />

        {/* LABOUR */}
        <Typography variant="h6" fontWeight="bold">
          Labour Charges
        </Typography>

        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Labour</TableCell>
              <TableCell align="right">Hours</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quotation.labour.length > 0 ? (
              quotation.labour.map((lb, idx) => (
                <TableRow key={idx}>
                  <TableCell>{lb.title}</TableCell>
                  <TableCell align="right">{lb.hours}</TableCell>
                  <TableCell align="right">₹ {lb.rate}</TableCell>
                  <TableCell align="right">₹ {lb.amount}</TableCell>
                </TableRow>

              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No labour added
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Divider sx={{ my: 3 }} />

        {/* TOTALS — IDENTICAL TO INVOICE */}
        <Box sx={{ width: "300px", ml: "auto" }}>
          <Typography>Product Total: ₹{quotation.totals?.partsTotal}</Typography>
          <Typography>
            Discount: -₹{quotation.totals?.discountAmount}
          </Typography>
          <Typography>
            GST ({quotation.totals?.gstRate}%): ₹{quotation.totals?.gst}
          </Typography>
          <Typography>Labour Charges: ₹{labourTotal}</Typography>

          <Typography variant="h6" mt={2} fontWeight="bold">
            Grand Total: ₹{quotation.totals?.grandTotal}
          </Typography>

        </Box>
      </Paper>
    </Box>
  );
}
