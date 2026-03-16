import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Pencil, Trash2, Mail, Building2, User, Hash, Phone, MapPin, ExternalLink } from "lucide-react";
import { Box, Snackbar, Alert, TextField, Tooltip } from "@mui/material";
import apiEndpoints from "../../apiconfig";
import SectionHeader from "../common/Header";
import { useLoading } from "../../pages/LoadingContext";
import SupplierViewModal from "./SupplierView";

const BLOB_URL = apiEndpoints.blob;

// ── col widths ────────────────────────────────────────────────────────────────
const COL = {
  avatar: 64,
  info:   320,
  contact: 240,
  company: 200,
  action:  88,
};

// ── avatar ──────────────────────────────────────────────────────────────────
const PALETTE = ["#3B82F6","#10B981","#F59E0B","#EF4444","#6366F1","#14B8A6","#EC4899","#64748B"];
const SupplierAvatar = ({ src, name, size = 40 }) => {
  const [err, setErr] = useState(false);
  const bg = PALETTE[(name || "S").charCodeAt(0) % PALETTE.length];
  const initials = (name || "S").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const fullSrc = src && !String(src).endsWith("null") ? `${BLOB_URL}${src}` : null;

  if (fullSrc && !err)
    return <img src={fullSrc} alt={name} onError={() => setErr(true)}
      style={{ width: size, height: size, objectFit: "cover", borderRadius: 10 }} />;

  return (
    <div style={{
      width: size, height: size, borderRadius: 10, background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: "#fff",
    }}>{initials}</div>
  );
};

// ── header row ────────────────────────────────────────────────────────────────
const THead = () => (
  <div style={{
    display: "flex", alignItems: "center",
    padding: "12px 24px", background: "#F9FAFB", borderBottom: "1px solid #F3F4F6",
    gap: 16,
  }}>
    <div style={{ width: COL.avatar, flexShrink: 0 }} />
    <span style={{ width: COL.info, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280",
      textTransform: "uppercase", letterSpacing: "0.05em" }}>
      Supplier Name
    </span>
    <span style={{ width: COL.contact, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280",
      textTransform: "uppercase", letterSpacing: "0.05em" }}>
      Contact Details
    </span>
    <span style={{ width: COL.company, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280",
      textTransform: "uppercase", letterSpacing: "0.05em" }}>
      Company
    </span>
    <div style={{ flex: 1 }} />
    <span style={{ width: COL.action, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280",
      textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>
      Actions
    </span>
  </div>
);

// ── list row ─────────────────────────────────────────────────────────────────
const ListRow = ({ item, onView, onEdit, onDelete, isLast }) => (
  <div
    onClick={onView}
    style={{
      display: "flex", alignItems: "center",
      padding: "16px 24px",
      gap: 16,
      borderBottom: isLast ? "none" : "1px solid #F3F4F6",
      cursor: "pointer", transition: "background 0.13s",
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = "#FAFAFA"}
    onMouseLeave={(e) => e.currentTarget.style.background = ""}
  >
    <div style={{ width: COL.avatar, flexShrink: 0 }}>
      <SupplierAvatar src={item.Image} name={item.SupplierName} size={44} />
    </div>

    <div style={{ width: COL.info, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {item.SupplierName}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3, background: "#F3F4F6", 
          padding: "2px 8px", borderRadius: 6 }}>
          <Hash size={11} style={{ color: "#6B7280" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#4B5563" }}>{item.id || "N/A"}</span>
        </div>
      </div>
    </div>

    <div style={{ width: COL.contact, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Mail size={14} style={{ color: "#9CA3AF" }} />
        <span style={{ fontSize: 13, color: "#4B5563" }}>{item.Email || "—"}</span>
      </div>
    </div>

    <div style={{ width: COL.company, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Building2 size={14} style={{ color: "#9CA3AF" }} />
        <span style={{ fontSize: 13, color: "#4B5563", fontWeight: 500 }}>{item.CompanyName || "—"}</span>
      </div>
    </div>

    <div style={{ flex: 1 }} />

    <div style={{ width: COL.action, flexShrink: 0, display: "flex", justifyContent: "center", gap: 6 }}>
      <Tooltip title="Edit">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          style={{
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: "#F5F3FF", color: "#8B5CF6",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#8B5CF6"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#F5F3FF"; e.currentTarget.style.color = "#8B5CF6"; }}
        >
          <Pencil size={15} />
        </button>
      </Tooltip>
      <Tooltip title="Delete">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: "#FEF2F2", color: "#EF4444",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#EF4444"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#EF4444"; }}
        >
          <Trash2 size={15} />
        </button>
      </Tooltip>
    </div>
  </div>
);

// ── main component ─────────────────────────────────────────────────────────────
const SupplierPage = ({ suppliers = [], fetchData }) => {
  const navigate           = useNavigate();
  const { show, hide }     = useLoading();
  const [data, setData]    = useState([]);
  const [search, setSearch]= useState("");
  const [viewData, setViewData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (suppliers.length > 0) {
      setData(suppliers.map((s) => ({
        id:           s.supplier_id,
        Image:        s.image_path,
        SupplierName: s.supplier_name,
        CompanyName:  s.company_name,
        Email:        s.email,
        originalData: s,
      })));
    }
  }, [suppliers]);

  useEffect(() => { 
    if (fetchData) fetchData(); 
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    try {
      await fetch(`${apiEndpoints.supplier}?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      setSnackbar({ open: true, message: "Supplier deleted", severity: "success" });
      if (fetchData) fetchData();
    } catch {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    } finally { hide(); }
  };

  const filtered = data.filter((s) =>
    [s.SupplierName, s.CompanyName, s.Email].some((v) =>
      v?.toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <Box sx={{ p: 4 }}>
      <SectionHeader title="Supplier" />

      {/* ── search bar ── */}
      <Box sx={{ mt: 2, mb: 3 }}>
        <Box sx={{ position: "relative", width: { xs: "100%", sm: "100%", md: 400 } }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none", zIndex: 1 }} />
          <TextField
            placeholder="Search suppliers..."
            fullWidth
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                paddingLeft: "35px",
                borderRadius: "12px",
                backgroundColor: "#fff",
                border: "1px solid #E2E8F0",
                height: '42px',
                transition: 'all 0.2s',
                "& fieldset": { border: "none" },
                "&.Mui-focused": { 
                  boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.15)",
                  border: '1px solid #8B5CF6'
                }
              }
            }}
          />
        </Box>
      </Box>

      {/* ── count ── */}
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748B" }}>
        Showing <strong style={{ color: "#0F172A" }}>{filtered.length}</strong> supplier{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* ── grid/list ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", background: "#fff", borderRadius: 16, border: "1px dashed #E2E8F0" }}>
          <User size={48} style={{ color: "#CBD5E1", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 500, color: "#0F172A", margin: 0 }}>No suppliers found</p>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Try a different search or add a new supplier.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto", width: "100%" }}>
            <div style={{ minWidth: COL.avatar + COL.info + COL.contact + COL.company + COL.action + 100 }}>
              <THead />
              {filtered.map((s, i) => (
                <ListRow
                  key={s.id}
                  item={s}
                  isLast={i === filtered.length - 1}
                  onView={() => { setViewData(s.originalData); setViewOpen(true); }}
                  onEdit={() => navigate("/add-supplier", { state: { editData: s.originalData } })}
                  onDelete={() => handleDelete(s.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <SupplierViewModal open={viewOpen} data={viewData} onClose={() => setViewOpen(false)} />

      <Snackbar open={snackbar.open} autoHideDuration={3500}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity={snackbar.severity} variant="filled"
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          sx={{ borderRadius: "10px", fontWeight: 600 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SupplierPage;
