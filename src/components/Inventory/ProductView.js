import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Divider } from "@mui/material";
import { Package, Tag, DollarSign, Hash, X } from "lucide-react";
import apiEndpoints from "../../apiconfig";

// ── product image with fallback ───────────────────────────────────────────────
const ProductImg = ({ src, name }) => {
  const [err, setErr] = React.useState(false);
  const PALETTE = ["#0EA5E9","#3B82F6","#10B981","#F59E0B","#EF4444","#6366F1"];
  const bg = PALETTE[(name || "P").charCodeAt(0) % PALETTE.length];
  const initials = (name || "P").slice(0, 2).toUpperCase();

  const fullSrc = src && !String(src).endsWith("null") && !String(src).endsWith("undefined")
    ? (String(src).startsWith("http") ? src : `${apiEndpoints.blob}${src}`)
    : null;

  if (fullSrc && !err) {
    return (
      <img src={fullSrc} alt={name} onError={() => setErr(true)}
        style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 14,
          border: "2px solid #F3F4F6", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
    );
  }
  return (
    <div style={{
      width: 100, height: 100, borderRadius: 14, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 28, fontWeight: 700, color: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
    }}>{initials}</div>
  );
};

// ── detail row ────────────────────────────────────────────────────────────────
const DetailRow = ({ icon: Icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0",
    borderBottom: "1px solid #F1F5F9" }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F1F5F9",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <Icon size={15} style={{ color: "#3B82F6" }} />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</p>
      <p style={{ margin: "2px 0 0", fontSize: 14, color: "#1E293B", fontWeight: 700 }}>{value || "—"}</p>
    </div>
  </div>
);

// ── modal ─────────────────────────────────────────────────────────────────────
const ProductViewModal = ({ open, onClose, data }) => {
  if (!data) return null;

  const name   = data.product_name   || data.ProductName   || "—";
  const number = data.product_number || data.ProductNumber || "—";
  const purchasePrice = data.purchase_price || data.price || data.PurchasePrice || 0;
  const sellingPrice  = data.selling_price  || data.SellingPrice  || 0;
  const image  = data.image          || data.Image         || "";
  const mfg    = data.manufacturer_name || "";
  const color  = data.color || "";

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" } }}
      slotProps={{
        backdrop: {
          sx: {
            background: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(8px)",
          }
        }
      }}
    >

      {/* ── header ── */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{
          background: "linear-gradient(135deg, #1E293B 0%, #334155 100%)",
          px: 3, py: 2,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Package size={20} color="#fff" />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
              {name !== "—" ? `Product: ${name}` : "Product Details"}
            </span>
          </Box>
          <button onClick={onClose}
            style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8,
              width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff" }}>
            <X size={16} />
          </button>
        </Box>
      </DialogTitle>

      {/* ── content ── */}
      <DialogContent sx={{ p: 3 }}>

        {/* image + name hero */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 3 }}>
          <ProductImg src={image} name={name} />
          <Box>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{name}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 4, 
              background: "#F1F5F9", padding: "2px 8px", borderRadius: 6, width: "fit-content" }}>
              <Hash size={11} style={{ color: "#64748B" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{number}</span>
            </div>
            <Box sx={{ mt: 1.5 }}>
              <span style={{
                display: "inline-block",
                background: "#F0F9FF", color: "#0369A1",
                fontWeight: 800, fontSize: 18,
                padding: "4px 0", borderRadius: 8,
              }}>
                Selling: ₹{Number(sellingPrice).toLocaleString()}
              </span>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                Cost: ₹{Number(purchasePrice).toLocaleString()}
              </div>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* detail rows */}
        <DetailRow icon={Hash}       label="Product Number" value={number} />
        <DetailRow icon={DollarSign} label="Purchase Price (Cost)" value={`₹${Number(purchasePrice).toLocaleString()}`} />
        <DetailRow icon={DollarSign} label="Selling Price (MRP)"   value={`₹${Number(sellingPrice).toLocaleString()}`} />
        {mfg   && <DetailRow icon={Tag} label="Manufacturer"     value={mfg} />}
        {color && <DetailRow icon={Tag} label="Variant / Colour" value={color} />}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button fullWidth variant="contained" onClick={onClose}
          sx={{
            background: "#EF4444",
            "&:hover": { background: "#DC2626" },
            borderRadius: "10px", textTransform: "none", fontWeight: 700, px: 3, py: 1.2
          }}>
          Close Details
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductViewModal;