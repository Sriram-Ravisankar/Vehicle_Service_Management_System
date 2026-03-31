import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Pencil, Trash2, Package, Calendar, Hash, Tag, Layers, AlertTriangle } from "lucide-react";
import { Box, Snackbar, Alert, TextField, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import apiEndpoints from "../../apiconfig";
import SectionHeader from "../common/Header";
import { useLoading } from "../../pages/LoadingContext";
import ProductViewModal from "./ProductView";
import Pagination from "../DynamicComponents/Pagination";

const BLOB = apiEndpoints.blob;

// ── col widths ────────────────────────────────────────────────────────────────
const COL = {
  img: 64,
  product: 300,
  date: 130,
  purchase: 120,
  selling: 120,
  profit: 100,
  action: 88,
};

// ── product image with fallback ───────────────────────────────────────────────
const PALETTE = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#14B8A6", "#EC4899", "#64748B"];
const ProductImg = ({ src, name, size = 40 }) => {
  const [err, setErr] = useState(false);
  const bg = PALETTE[(name || "P").charCodeAt(0) % PALETTE.length];
  const initials = (name || "P").slice(0, 2).toUpperCase();
  const fullSrc = src && !String(src).endsWith("null") && !String(src).endsWith("undefined")
    ? (String(src).startsWith("http") ? src : `${BLOB}${src}`) : null;

  if (fullSrc && !err)
    return <img src={fullSrc} alt={name} onError={() => setErr(true)}
      style={{ width: size, height: size, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />;

  return (
    <div style={{
      width: size, height: size, borderRadius: 8, background: bg, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color: "#fff",
    }}>{initials}</div>
  );
};

// ── header row ────────────────────────────────────────────────────────────────
const THead = ({ isMechanic }) => (
  <div style={{
    display: "flex", alignItems: "center",
    padding: "12px 24px", background: "#F9FAFB", borderBottom: "1px solid #F3F4F6",
    gap: 24,
  }}>
    <div style={{ width: COL.img, flexShrink: 0 }} />
    <span style={{
      width: COL.product, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280",
      textTransform: "uppercase", letterSpacing: "0.05em"
    }}>
      Product Information
    </span>
    <span style={{
      width: COL.date, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280",
      textTransform: "uppercase", letterSpacing: "0.05em"
    }}>
      Purchase Date
    </span>
    {!isMechanic && (
      <span style={{
        width: COL.purchase, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280",
        textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right"
      }}>
        Purchase Price
      </span>
    )}
    <span style={{
      width: COL.selling, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280",
      textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right"
    }}>
      Selling Price
    </span>
    {!isMechanic && (
      <span style={{ width: COL.profit, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280",
        textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>
        Profit
      </span>
    )}
    <div style={{ flex: 1 }} />
    <span style={{
      width: COL.action, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280",
      textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center"
    }}>
      Actions
    </span>
  </div>
);

// ── list row ─────────────────────────────────────────────────────────────────
const ListRow = ({ item, onView, onEdit, onDelete, isLast, isMechanic }) => (
  <div
    onClick={onView}
    style={{
      display: "flex", alignItems: "center",
      padding: "16px 24px",
      gap: 24,
      borderBottom: isLast ? "none" : "1px solid #F3F4F6",
      cursor: "pointer", transition: "background 0.13s",
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = "#FAFAFA"}
    onMouseLeave={(e) => e.currentTarget.style.background = ""}
  >
    {/* image */}
    <div style={{ width: COL.img, flexShrink: 0, display: "flex", alignItems: "center" }}>
      <ProductImg src={item.Image} name={item.ProductName} size={44} />
    </div>

    {/* product details */}
    <div style={{ width: COL.product, flexShrink: 0, minWidth: 0 }}>
      <p style={{
        margin: 0, fontSize: 14, fontWeight: 700, color: "#111827",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
      }}>
        {item.ProductName}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 3, background: "#F3F4F6",
          padding: "2px 8px", borderRadius: 6
        }}>
          <Hash size={11} style={{ color: "#6B7280" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "#4B5563" }}>{item.ProductNumber}</span>
        </div>
      </div>
    </div>

    {/* purchase date */}
    <div style={{ width: COL.date, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Calendar size={14} style={{ color: "#9CA3AF" }} />
        <span style={{ fontSize: 13, color: "#4B5563" }}>{item.PurchaseDate || "—"}</span>
      </div>
    </div>

    {/* purchase price — hidden for mechanics */}
    {!isMechanic && (
      <div style={{ width: COL.purchase, flexShrink: 0, textAlign: "right" }}>
        <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>₹{Number(item.PurchasePrice || 0).toLocaleString()}</span>
      </div>
    )}

    {/* selling price — always visible */}
    <div style={{ width: COL.selling, flexShrink: 0, textAlign: "right" }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#0EA5E9" }}>₹{Number(item.SellingPrice || 0).toLocaleString()}</span>
    </div>

    {/* profit — hidden for mechanics */}
    {!isMechanic && (
      <div style={{ width: COL.profit, flexShrink: 0, textAlign: "right" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: item.SellingPrice - item.PurchasePrice >= 0 ? "#10B981" : "#EF4444" }}>
          ₹{(item.SellingPrice - item.PurchasePrice).toLocaleString()}
        </span>
      </div>
    )}

    <div style={{ flex: 1 }} />

    {/* actions */}
    <div style={{ width: COL.action, flexShrink: 0, display: "flex", justifyContent: "center", gap: 6 }}>
      <Tooltip title="Edit">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          style={{
            width: 32, height: 32, borderRadius: 8, border: "none",
            background: "#F5F3FF", color: "#0EA5E9",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#0EA5E9"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#F5F3FF"; e.currentTarget.style.color = "#0EA5E9"; }}
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

// ── main component ────────────────────────────────────────────────────────────
const Product = ({ products = [], fetchData }) => {
  const navigate = useNavigate();
  const { show, hide } = useLoading();

  /* ── role check: role_id 4 = Mechanic (stored in localStorage at login) ── */
  const roleId = localStorage.getItem("role_id") || "";
  const isMechanic = String(roleId) === "4";

  const [tableData, setTableData] = useState([]);
  const [search, setSearch] = useState("");
  const [viewData, setViewData] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (products.length > 0) {
      setTableData(products.map((p) => ({
        id: p.id,
        Image: p.image,
        ProductNumber: p.product_number,
        ProductName: p.product_name,
        PurchasePrice: p.purchase_price || p.price || 0,
        SellingPrice: p.selling_price || 0,
        PurchaseDate: p.purchase_date || "",
        originalData: p,
      })));
    }
  }, [products]);

  useEffect(() => {
    if (fetchData) fetchData();
  }, []);

  const handleDelete = async () => {
    const id = deleteConfirm.id;
    if (!id) return;
    setDeleteConfirm({ open: false, id: null });
    show(); // show global loader
    try {
      await fetch(`${apiEndpoints.product}?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      setSnackbar({ open: true, message: "Product deleted", severity: "success" });
      if (fetchData) fetchData();
    } catch {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    } finally { hide(); }
  };

  const filtered = tableData.filter((p) =>
    [p.ProductName, p.ProductNumber].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <SectionHeader title="Product" />

      {/* ── search bar ── */}
      <Box sx={{ mt: 2, mb: 3 }}>
        <Box sx={{ position: "relative", width: { xs: "100%", sm: "100%", md: 400 } }}>
          <Search size={16} style={{
            position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none", zIndex: 1
          }} />
          <TextField
            placeholder="Search products..."
            fullWidth
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                  boxShadow: "0 0 0 2px rgba(14, 165, 233, 0.15)",
                  border: '1px solid #0EA5E9'
                }
              }
            }}
          />
        </Box>
      </Box>

      {/* ── count ── */}
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#64748B" }}>
        Showing <strong style={{ color: "#0F172A" }}>{filtered.length}</strong> product{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* ── list ── */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "64px 0", background: "#fff",
          borderRadius: 16, border: "1px dashed #E2E8F0"
        }}>
          <Package size={48} style={{ color: "#CBD5E1", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 500, color: "#0F172A", margin: 0 }}>No products found</p>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>Try a different search or add a new product.</p>
        </div>
      ) : (
        <div style={{
          background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden"
        }}>
          <div style={{ overflowX: "auto", width: "100%", pb: 1 }}>
            <div style={{ minWidth: 1180 }}>
              <THead isMechanic={isMechanic} />
              {paginated.map((item, i) => (
                <ListRow key={item.id} item={item} isLast={i === paginated.length - 1}
                  isMechanic={isMechanic}
                  onView={() => { setViewData(item.originalData); setViewOpen(true); }}
                  onEdit={() => navigate("/add-product", { state: { editData: item.originalData } })}
                  onDelete={() => setDeleteConfirm({ open: true, id: item.id })}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        itemsPerPage={perPage}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(n) => { setPerPage(n); setPage(1); }}
        itemLabel="product"
      />

      <ProductViewModal open={viewOpen} data={viewData} onClose={() => setViewOpen(false)} />

      {/* ── delete confirmation dialog ── */}
      <Dialog 
        open={deleteConfirm.open} 
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        PaperProps={{ sx: { borderRadius: "16px", p: 1, maxWidth: "360px" } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 700, color: "#111827" }}>
          <AlertTriangle size={24} style={{ color: "#EF4444" }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <p style={{ margin: 0, fontSize: 15, color: "#4B5563", lineHeight: 1.5 }}>
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setDeleteConfirm({ open: false, id: null })}
            sx={{ textTransform: "none", fontWeight: 600, color: "#6B7280" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            sx={{ 
              textTransform: "none", fontWeight: 600, 
              backgroundColor: "#EF4444", "&:hover": { backgroundColor: "#DC2626" },
              borderRadius: "8px", px: 3
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000}
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

export default Product;