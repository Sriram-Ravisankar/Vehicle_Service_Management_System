import React from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  IconButton,
  Button,
  Stack,
  Checkbox,
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const currency = (v) =>
  Number(v || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function Step3_PartsLabour({
  form,
  setForm,
  onBack,
  onSave,
  isSubmitting,
  isView,
  showSnackbar,
}) {

  React.useEffect(() => {
    // Default 1 part row
    if (!form.parts || form.parts.length === 0) {
      setForm((f) => ({
        ...f,
        parts: [
          {
            id: Date.now(),
            name: "",
            qty: 1,
            rate: 0,
            amount: 0,
          },
        ],
      }));
    }

    // Default 1 labour row
    if (!form.labour || form.labour.length === 0) {
      setForm((f) => ({
        ...f,
        labour: [
          {
            id: Date.now() + 1,
            title: "",
            hours: 1,
            rate: 0,
            amount: 0,
          },
        ],
      }));
    }
  }, []);

  const addPart = () => {
    const item = { id: Date.now(), name: "", qty: 1, rate: 0, amount: 0 };
    setForm((f) => ({ ...f, parts: [...(f.parts || []), item] }));
  };

  const addLabour = () => {
    const item = { id: Date.now(), title: "", hours: 1, rate: 0, amount: 0 };
    setForm((f) => ({ ...f, labour: [...(f.labour || []), item] }));
  };

  const updatePart = (id, key, val) => {
    setForm((f) => ({
      ...f,
      parts: f.parts.map((p) =>
        p.id === id
          ? {
            ...p,
            [key]: val, // keep as string
            amount:
              Number(key === "qty" ? val : p.qty) *
              Number(key === "rate" ? val : p.rate),
          }
          : p
      ),
    }));
  };

  const updateLabour = (id, key, val) => {
    setForm((f) => ({
      ...f,
      labour: f.labour.map((l) =>
        l.id === id
          ? {
            ...l,
            [key]: val, // keep as string
            amount:
              Number(key === "hours" ? val : l.hours) *
              Number(key === "rate" ? val : l.rate),
          }
          : l
      ),
    }));
  };

  const removePart = (id) =>
    setForm((f) => ({ ...f, parts: f.parts.filter((p) => p.id !== id) }));

  const removeLabour = (id) =>
    setForm((f) => ({ ...f, labour: f.labour.filter((l) => l.id !== id) }));

  React.useEffect(() => {
    const partsTotal = (form.parts || []).reduce(
      (s, p) => s + Number(p.amount || 0),
      0
    );

    const labourTotal = (form.labour || []).reduce(
      (s, l) => s + Number(l.amount || 0),
      0
    );

    // New Rule: Subtotal = PARTS only
    const subtotal = partsTotal;

    const discountType = form.totals?.discountType || "percent";
    const discountValue = Number(form.totals?.discountValue || 0);

    const afterDiscount =
      discountType === "percent"
        ? subtotal - (subtotal * discountValue) / 100
        : subtotal - discountValue;

    const gstRate = Number(form.totals?.gstRate ?? 18);
    const includeGST = form.totals?.includeGST ?? false;

    const gst = includeGST ? (afterDiscount * gstRate) / 100 : 0;

    // Labour added at the final stage (your requirement)
    const beforeRoundTotal = afterDiscount + gst + labourTotal;

    const grandTotal = Math.round(beforeRoundTotal); // rounded final total

    setForm((f) => ({
      ...f,
      totals: {
        partsTotal,
        labourTotal,
        subtotal,
        discountType,
        discountValue,
        discountAmount: subtotal - afterDiscount,
        gstRate,
        includeGST,
        gst,
        grandTotal,
      },
    }));
  }, [
    form.parts,
    form.labour,
    form.totals?.discountType,
    form.totals?.discountValue,
    form.totals?.gstRate,
    form.totals?.includeGST,
  ]);


  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
        Parts & Labour
      </Typography>

      <Stack spacing={4}>
        {/* ====================== PARTS ====================== */}
        <Box>
          <Typography sx={{ fontWeight: 600, mb: 2 }}>Parts</Typography>

          {(form.parts || []).map((p) => (
            <Grid
              container
              spacing={2}
              key={p.id}
              alignItems="center"
              sx={{ mb: 1 }}
              width={"100%"}
            >
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                width={{ xs: "100%", sm: "25%" }}
              >
                <TextField
                  fullWidth
                  size="small"
                  label="Part Name"
                  value={p.name}
                  disabled={isView}
                  onChange={(e) => updatePart(p.id, "name", e.target.value)}
                />
              </Grid>

              <Grid item xs={6} sm={3} md={2} width={{ xs: "100%", sm: "25%" }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Qty"
                  value={p.qty}
                  disabled={isView}
                  onChange={(e) => updatePart(p.id, "qty", e.target.value)}
                />
              </Grid>

              <Grid item xs={6} sm={3} md={2} width={{ xs: "100%", sm: "25%" }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Rate"
                  value={p.rate}
                  disabled={isView}
                  onChange={(e) =>
                    updatePart(p.id, "rate", Number(e.target.value))
                  }
                />
              </Grid>

              <Grid item xs={6} sm={3} md={2} width={{ xs: "100%", sm: "10%" }}>
                <Typography sx={{ fontWeight: 600, mt: 1 }}>
                  ₹ {currency(p.amount)}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={3} md={2}>
                <IconButton color="error" onClick={() => removePart(p.id)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={addPart}
            sx={{
              mt: 1,
              color: "rgba(249, 115, 22, 0.9)",
              textTransform: "none",

              "&:hover": {
                backgroundColor: "rgba(249, 115, 22, 0.08)",
              },
            }}
          >
            Add Part
          </Button>

        </Box>

        {/* ====================== LABOUR ====================== */}
        <Box>
          <Typography sx={{ fontWeight: 600, mb: 2 }}>Labour</Typography>

          {(form.labour || []).map((l) => (
            <Grid
              container
              spacing={2}
              key={l.id}
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                width={{ xs: "100%", sm: "25%" }}
              >
                <TextField
                  fullWidth
                  size="small"
                  label="Labour Title"
                  disabled={isView}
                  value={l.title}
                  onChange={(e) => updateLabour(l.id, "title", e.target.value)}
                />
              </Grid>

              <Grid item xs={6} sm={3} md={2} width={{ xs: "100%", sm: "25%" }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Hours"
                  value={l.hours}
                  disabled={isView}
                  onChange={(e) =>
                    updateLabour(l.id, "hours", Number(e.target.value))
                  }
                />
              </Grid>

              <Grid item xs={6} sm={3} md={2} width={{ xs: "100%", sm: "25%" }}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Rate"
                  value={l.rate}
                  disabled={isView}
                  onChange={(e) =>
                    updateLabour(l.id, "rate", Number(e.target.value))
                  }
                />
              </Grid>

              <Grid item xs={6} sm={3} md={2} width={{ xs: "100%", sm: "10%" }}>
                <Typography sx={{ fontWeight: 600, mt: 1 }}>
                  ₹ {currency(l.amount)}
                </Typography>
              </Grid>

              <Grid item xs={6} sm={3} md={2}>
                <IconButton color="error" onClick={() => removeLabour(l.id)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Button startIcon={<AddIcon />} onClick={addLabour}
            sx={{
              mt: 1,
              color: "rgba(249, 115, 22, 0.9)",
              textTransform: "none",

              "&:hover": {
                backgroundColor: "rgba(249, 115, 22, 0.08)",
              },
            }}>
            Add Labour
          </Button>
        </Box>

        {/* ====================== PRICING OPTIONS ====================== */}
        <Box>
          <Typography sx={{ fontWeight: 600, mb: 2 }}>
            Pricing Options
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3} width={{ xs: "100%", sm: "23%", md: "25%" }}>
              <TextField
                fullWidth
                select
                size="small"
                label="Discount Type"
                value={form.totals?.discountType || "percent"}   // ✅ FIX
                disabled={isView}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    totals: {
                      ...f.totals,
                      discountType: e.target.value,
                      discountValue: 0, // 🔥 reset value when switching type
                    },
                  }))
                }
              >
                <MenuItem value="percent">Percent</MenuItem>
                <MenuItem value="amount">Amount</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3} width={{ xs: "100%", sm: "23%", md: "25%" }}>
              <TextField
                fullWidth
                size="small"
                type="text"
                label="Discount Value"
                value={form.totals.discountValue || 0}
                disabled={isView}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    totals: {
                      ...f.totals,
                      discountValue: Number(e.target.value),
                    },
                  }))
                }
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} width={{ xs: "100%", sm: "23%", md: "20%" }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.totals.includeGST || false}
                    disabled={isView}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        totals: { ...f.totals, includeGST: e.target.checked },
                      }))
                    }
                  />
                }
                label="Include GST"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3} width={{ xs: "100%", sm: "23%", md: "25%" }}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="GST %"
                value={form.totals.gstRate || 0}
                disabled={isView}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    totals: { ...f.totals, gstRate: Number(e.target.value) },
                  }))
                }
              />
            </Grid>
          </Grid>
        </Box>

        {/* ====================== SUMMARY ====================== */}
        <Box sx={{ mt: 4 }}>
          <Typography sx={{ fontWeight: 700, mb: 1, fontSize: "18px" }}>
            Summary
          </Typography>

          <Stack spacing={1} sx={{ pl: 1 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Parts Total</Typography>
              <Typography>₹ {currency(form.totals?.partsTotal)}</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Discount</Typography>
              <Typography>
                - ₹ {currency(form.totals?.discountAmount)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>₹ {currency(form.totals?.subtotal)}</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">GST</Typography>
              <Typography>₹ {currency(form.totals?.gst)}</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography color="text.secondary">Labour Total</Typography>
              <Typography>₹ {currency(form.totals?.labourTotal)}</Typography>
            </Box>

            {/* Divider before grand total */}
            <Box sx={{ mt: 1, borderTop: "1px solid #ddd", pt: 1 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "17px" }}>
                Grand Total
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: "17px" }}>
                ₹ {currency(form.totals?.grandTotal)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* ====================== NOTES ====================== */}
        <Box>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes"
            value={form.notes || ""}
            disabled={isView}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </Box>
      </Stack>
    </Box>
  );
}
