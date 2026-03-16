import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Divider } from "@mui/material";
import { User, Building2, Phone, Mail, MapPin, X, Hash, Globe } from "lucide-react";
import apiEndpoints from "../../apiconfig";

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

// ── modal component ──────────────────────────────────────────────────────────
const SupplierViewModal = ({ open, onClose, data }) => {
  if (!data) return null;

  const name      = data.supplier_name || data.SupplierName || "—";
  const company   = data.company_name  || data.CompanyName  || "—";
  const mobile    = data.mobile_no     || data.Mobile       || "—";
  const email     = data.email         || data.Email        || "—";
  const country   = data.country       || "—";
  const address   = data.address       || "—";
  const imagePath = data.image_path    || data.Image        || "";

  const imgSrc = imagePath && !String(imagePath).endsWith("null")
    ? (String(imagePath).startsWith("http") ? imagePath : `${apiEndpoints.blob}${imagePath}`)
    : null;

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
            <User size={20} color="#fff" />
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
              {name !== "—" ? `Details: ${name}` : "Supplier Details"}
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
        {/* avatar + name hero */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5, mb: 3 }}>
          {imgSrc ? (
            <img src={imgSrc} alt={name}
              style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 12, border: "2px solid #F1F5F9" }} />
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 12, background: "#3B82F6",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff" }}>
              {name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <Box>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0F172A" }}>{name}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3, background: "#F1F5F9", 
                padding: "2px 8px", borderRadius: 6 }}>
                <Building2 size={11} style={{ color: "#64748B" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{company}</span>
              </div>
            </div>
          </Box>
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* sections */}
        <Box sx={{ py: 1 }}>
          <DetailRow icon={Phone} label="Contact Number" value={mobile} />
          <DetailRow icon={Mail}  label="Email Address"  value={email} />
          <DetailRow icon={Globe} label="Country"        value={country} />
          <DetailRow icon={MapPin} label="Full Address"  value={address} />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 0, pb: 3, pt: 0 }}>
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

export default SupplierViewModal;
