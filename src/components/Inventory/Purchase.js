import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Pencil, Trash2, Calendar, Hash, User, Package, ShoppingCart } from "lucide-react";
import { Box, Snackbar, Alert, TextField, Tooltip } from "@mui/material";
import apiEndpoints from "../../apiconfig";
import SectionHeader from "../common/Header";
import { useLoading } from "../../pages/LoadingContext";
import PurchaseViewModal from "./PurchaseView";

// ── col widths ────────────────────────────────────────────────────────────────
const COL = {
  code:    140,
  supplier: 300,
  date:    140,
  products: 120,
  action:  88,
};

// ── header row ────────────────────────────────────────────────────────────────
const THead = () => (
  <div style={{
    display: "flex", alignItems: "center",
    padding: "10px 24px", background: "#F9FAFB", borderBottom: "1px solid #F3F4F6",
    gap: 16,
  }}>
    <span style={{ width: COL.code, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280",
      textTransform: "uppercase", letterSpacing: "0.05em" }}>
      Purchase 
    </span>
    <span style={{ width: COL.supplier, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280",
      textTransform: "uppercase", letterSpacing: "0.05em" }}>
      Supplier
    </span>
    <span style={{ width: COL.date, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280",
      textTransform: "uppercase", letterSpacing: "0.05em" }}>
      Purchase Date
    </span>
    <span style={{ width: COL.products, flexShrink: 0, fontSize: 11, fontWeight: 600, color: "#6B7280",
      textTransform: "uppercase", letterSpacing: "0.05em" }}>
      Items
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
    {/* purchase code */}
    <div style={{ width: COL.code, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6,
        background: "#F3F4F6", padding: "4px 10px", borderRadius: 8, width: "fit-content" }}>
        <Hash size={13} style={{ color: "#6B7280" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{item.PurchaseCode}</span>
      </div>
    </div>

    {/* supplier info */}
    <div style={{ width: COL.supplier, flexShrink: 0, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F5F3FF",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <User size={14} style={{ color: "#0EA5E9" }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#111827",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {item.SupplierName}
          </p>
          <p style={{ margin: "1px 0 0", fontSize: 12, color: "#9CA3AF" }}>{item.Email}</p>
        </div>
      </div>
    </div>

    {/* date */}
    <div style={{ width: COL.date, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Calendar size={14} style={{ color: "#9CA3AF" }} />
        <span style={{ fontSize: 13, color: "#4B5563" }}>{item.Date}</span>
      </div>
    </div>

    {/* product count */}
    <div style={{ width: COL.products, flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6,
        background: "#ECFDF5", color: "#059669", padding: "4px 10px", borderRadius: 8, width: "fit-content" }}>
        <ShoppingCart size={13} />
        <span style={{ fontSize: 12, fontWeight: 600 }}>{item.Products}</span>
      </div>
    </div>

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
function Purchase({ purchases = [], fetchData }) {
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const PER_PAGE = 15;

  useEffect(() => {
    if (purchases.length > 0) {
      const pMap = new Map();
      purchases.forEach((item) => {
        if (!pMap.has(item.purchase_id)) {
          pMap.set(item.purchase_id, {
            id: item.purchase_id,
            PurchaseCode: item.purchase_no,
            SupplierName: item.supplier_name,
            Mobile: item.mobile_no,
            Email: item.email,
            Date: item.purchase_date,
            products: [],
            originalData: { ...item, products: [] },
          });
        }
        if (item.item_id) {
          const p = pMap.get(item.purchase_id);
          p.products.push({
            product_id: item.product_id,
            product_name: item.product_name,
            product_number: item.product_number,
            quantity: item.quantity,
            price: item.item_price,
            amount: item.amount,
          });
          p.originalData.products = p.products;
        }
      });

      const sortedData = Array.from(pMap.values()).map(p => ({
        ...p,
        Products: `${p.products.length} Item${p.products.length !== 1 ? "s" : ""}`
      }));
      setTableData(sortedData);
    } else {
      setTableData([]); // Clear table data if purchases prop is empty
    }
  }, [purchases]);

  useEffect(() => { 
    if (fetchData) fetchData(); 
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this purchase?")) return;
    show();
    try {
      const res = await fetch(`${apiEndpoints.purchase}?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      const result = await res.json();
      if (result.success) {
        setSnackbar({ open: true, message: "Purchase deleted", severity: "success" });
        if (fetchData) fetchData();
      } else {
        throw new Error();
      }
    } catch {
      setSnackbar({ open: true, message: "Delete failed", severity: "error" });
    } finally { hide(); }
  };

  const filtered = tableData.filter((row) =>
    [row.PurchaseCode, row.SupplierName, row.Email, row.Mobile].some(v => 
      v?.toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <SectionHeader />

      {/* ── search bar ── */}
      <Box sx={{ mt: 2, mb: 3 }}>
        <Box sx={{ position: "relative", width: { xs: "100%", sm: "100%", md: 400 } }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%",
            transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none", zIndex: 1 }} />
          <TextField
            placeholder="Search purchases..."
            fullWidth
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
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

      {/* ── Count ── */}
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#6B7280" }}>
        Showing <strong style={{ color: "#111827" }}>{filtered.length}</strong> purchase{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* ── List Implementation ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0", background: "#fff",
          borderRadius: 16, border: "1px dashed #E5E7EB" }}>
          <ShoppingCart size={48} style={{ color: "#D1D5DB", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 15, fontWeight: 500, color: "#111827", margin: 0 }}>No purchases found</p>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>Try a different search or record a new purchase.</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #F3F4F6",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto", width: "100%" }}>
            <div style={{ minWidth: COL.code + COL.supplier + COL.date + COL.products + COL.action + 100 }}>
              <THead />
              {paginated.map((item, i) => (
                <ListRow key={item.id} item={item} isLast={i === paginated.length - 1}
                  onView={() => { setViewData(item); setViewOpen(true); }}
                  onEdit={() => navigate("/add-purchase", { state: { editData: item.originalData } })}
                  onDelete={() => handleDelete(item.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setCurrentPage(p)}
              style={{
                width: 34, height: 34, borderRadius: 8, border: "1px solid #E5E7EB",
                background: currentPage === p ? "#0EA5E9" : "#fff",
                color: currentPage === p ? "#fff" : "#374151",
                fontWeight: currentPage === p ? 700 : 400,
                cursor: "pointer", fontSize: 13,
              }}>{p}</button>
          ))}
        </div>
      )}

      <PurchaseViewModal
        open={viewOpen}
        data={viewData}
        onClose={() => setViewOpen(false)}
      />

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity={snackbar.severity} variant="filled"
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Purchase;