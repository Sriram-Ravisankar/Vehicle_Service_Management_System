import React, { useEffect, useState } from "react";
import { Search, Filter, RefreshCw, Package, Truck, AlertTriangle, Plus, IndianRupee } from "lucide-react";
import apiEndpoints from "../../apiconfig";
import { useLoading } from "../../pages/LoadingContext";
import SectionHeader from "../common/Header";

// ─── helpers ────────────────────────────────────────────────────────────────
function getStatus(row) {
  const qty = Number(row.available_quantity ?? 0);
  const total = Number(row.quantity_purchased ?? qty);
  
  if (qty <= 0) return "Out of Stock";
  if (qty <= (total * 0.3) || qty <= 5) return "Low Stock"; // Red
  return "In Stock"; // Green
}

const statusStyle = {
  "In Stock":    "bg-emerald-50 text-emerald-700 border border-emerald-200",
  "Low Stock":   "bg-amber-50 text-amber-700 border border-amber-200",
  "Out of Stock":"bg-rose-50 text-rose-700 border border-rose-200",
};

// ─── sub-components ──────────────────────────────────────────────────────────
const StatCard = ({ label, value, valueClass = "text-gray-900", icon: Icon, colorClass = "bg-blue-600" }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all duration-300">
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase letter-spacing-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
    <div className={`${colorClass} p-3 rounded-xl text-white shadow-lg shadow-opacity-20`}>
      <Icon size={24} />
    </div>
  </div>
);

const StockBar = ({ qty, max }) => {
  const pct = Math.min((qty / Math.max(max, 1)) * 100, 100);
  const color = pct <= 30 ? "bg-red-500" : "bg-green-500";
  return (
    <div className="h-1.5 w-24 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

// ─── main component ───────────────────────────────────────────────────────────
const Stock = ({ stock = [], fetchData }) => {
  const { show, hide } = useLoading();

  // ── state ──
  const [activeTab, setActiveTab]   = useState("items");
  const [allRows, setAllRows]       = useState([]);
  const [suppliers, setSuppliers]   = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupId, setSelectedSupId] = useState("");
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    if (stock.length > 0) {
      setAllRows(stock);
    }
  }, [stock]);

  useEffect(() => {
    if (fetchData) fetchData();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(apiEndpoints.supplier, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
        if (data.data.length > 0) setSelectedSupId(String(data.data[0].supplier_id));
      }
    } catch (e) { console.error("Supplier fetch error:", e); }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  // ── derived ──
  const filtered = allRows.filter((r) =>
    r.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.product_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue    = allRows.reduce((s, r) => s + Number(r.amount ?? 0), 0);
  const lowStockCount = allRows.filter((r) => ["Low Stock","Critical"].includes(getStatus(r))).length;
  const outOfStock    = allRows.filter((r) => getStatus(r) === "Out of Stock").length;

  const selectedSupplier    = suppliers.find((s) => String(s.supplier_id) === selectedSupId);
  const supplierItems       = allRows.filter((r) => String(r.supplier_id) === selectedSupId);

  // ── tab button style ──
  const tabCls = (tab) =>
    `py-3 px-6 font-medium text-sm transition-colors flex items-center gap-2 border-b-2 ${
      activeTab === tab
        ? "border-[#3B82F6] text-[#3B82F6]"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`;

  return (
    <div style={{ padding: "24px", fontFamily: "inherit" }}>
      <SectionHeader title="Stock" />

      <div className="space-y-6" style={{ marginTop: 16 }}>
        {/* ── page header removed refresh button ── */}

        {/* ── tabs ── */}
        <div style={{ display: "flex", borderBottom: "1px solid #E5E7EB" }}>
          <button className={tabCls("items")}  onClick={() => setActiveTab("items")}>
            <Package size={18} /> Items & Stock
          </button>
          <button className={tabCls("suppliers")} onClick={() => setActiveTab("suppliers")}>
            <Truck size={18} /> Suppliers
          </button>
        </div>

        {/* ══════════════ ITEMS TAB ══════════════ */}
        {activeTab === "items" && (
          <>
            {/* stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                label="Total Items" 
                value={allRows.length} 
                icon={Package} 
                colorClass="bg-[#8B5CF6]" 
              />
              <StatCard 
                label="Total Value" 
                value={`₹${totalValue.toLocaleString()}`} 
                icon={IndianRupee} 
                colorClass="bg-[#3B82F6]" 
              />
              <StatCard 
                label="Low Stock Items" 
                value={lowStockCount} 
                valueClass="text-amber-600" 
                icon={AlertTriangle} 
                colorClass="bg-[#F59E0B]"
              />
              <StatCard 
                label="Out of Stock" 
                value={outOfStock} 
                valueClass="text-rose-600" 
                icon={AlertTriangle} 
                colorClass="bg-[#EF4444]"
              />
            </div>

            {/* table card */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {/* search bar */}
              <div style={{ padding: "16px", borderBottom: "1px solid #F3F4F6", display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ position: "relative", flex: "1 1 240px", maxWidth: 420 }}>
                  <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
                  <input
                    type="text"
                    placeholder="Search by product, SKU or supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "100%", paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                      border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 14, outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>

              {/* table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, textAlign: "left", minWidth: 800 }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB", color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      <th style={{ padding: "12px 16px", fontWeight: 600 }}>Item Details</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600 }}>Supplier</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600 }}>Stock (Available / Total)</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600 }}>Unit Price</th>
                      <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>Loading...</td></tr>
                    ) : filtered.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#6B7280" }}>No stock items found.</td></tr>
                    ) : filtered.map((row, i) => {
                      const status = getStatus(row);
                      const qty    = Number(row.available_quantity ?? 0);
                      const total  = Number(row.quantity_purchased ?? qty);
                      const maxQty = Math.max(total, qty, 1);
                      return (
                        <tr key={row.stock_id ?? i} style={{ borderTop: "1px solid #F3F4F6" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#FAFAFA"}
                          onMouseLeave={(e) => e.currentTarget.style.background = ""}
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <p style={{ fontWeight: 600, color: "#111827", marginBottom: 2 }}>{row.product_name}</p>
                            <p style={{ fontSize: 12, color: "#6B7280" }}>{row.product_number}</p>
                          </td>
                          <td style={{ padding: "12px 16px", color: "#4B5563" }}>{row.supplier_name ?? "—"}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontWeight: 700, color: qty <= (total * 0.3) ? "#DC2626" : "#111827" }}>{qty}</span>
                              <span style={{ fontSize: 12, color: "#9CA3AF" }}>/ {total} units</span>
                            </div>
                            <StockBar qty={qty} max={maxQty} />
                          </td>
                          <td style={{ padding: "12px 16px", fontWeight: 500, color: "#111827" }}>
                            ₹{Number(row.price ?? 0).toLocaleString()}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            <span style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "6px 14px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                            }} className={statusStyle[status]}>
                              {(status === "Low Stock" || status === "Critical") && <AlertTriangle size={12} />}
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ══════════════ SUPPLIERS TAB ══════════════ */}
        {activeTab === "suppliers" && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #F3F4F6", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: 24 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
              {/* left: supplier picker */}
              <div style={{ flex: "0 0 260px", borderRight: "1px solid #F3F4F6", paddingRight: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 16 }}>Select Supplier</h2>
                <select
                  value={selectedSupId}
                  onChange={(e) => setSelectedSupId(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 14px", fontSize: 14,
                    border: "1px solid #E5E7EB", borderRadius: 8,
                    background: "#fff", color: "#374151", outline: "none",
                  }}
                >
                  {suppliers.map((s) => (
                    <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>
                  ))}
                </select>

                {selectedSupplier && (
                  <div style={{ marginTop: 24, background: "#F9FAFB", borderRadius: 10, padding: 20, border: "1px solid #F3F4F6" }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 12 }}>Supplier Details</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
                      <div>
                        <p style={{ color: "#6B7280" }}>Company</p>
                        <p style={{ fontWeight: 500, color: "#111827", marginTop: 2 }}>{selectedSupplier.company_name ?? "—"}</p>
                      </div>
                      <div>
                        <p style={{ color: "#6B7280" }}>Email</p>
                        <p style={{ fontWeight: 500, color: "#111827", marginTop: 2 }}>{selectedSupplier.email ?? "—"}</p>
                      </div>
                      <div>
                        <p style={{ color: "#6B7280" }}>Mobile</p>
                        <p style={{ fontWeight: 500, color: "#111827", marginTop: 2 }}>{selectedSupplier.mobile_no ?? "—"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* right: items by supplier */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                    Items Supplied by {selectedSupplier?.supplier_name}
                  </h2>
                  <span style={{ background: "#F3F4F6", color: "#6B7280", fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 9999 }}>
                    {supplierItems.length} items
                  </span>
                </div>

                {supplierItems.length > 0 ? (
                  <div style={{ border: "1px solid #F3F4F6", borderRadius: 10, overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, textAlign: "left", minWidth: 600 }}>
                      <thead>
                        <tr style={{ background: "#F9FAFB", color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        <th style={{ padding: "12px 16px", fontWeight: 600 }}>Item Details</th>
                        <th style={{ padding: "12px 16px", fontWeight: 600 }}>Stock (Available / Total)</th>
                        <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Status</th>
                      </tr>
                      </thead>
                      <tbody>
                        {supplierItems.map((row, i) => {
                          const status = getStatus(row);
                          const qty    = Number(row.available_quantity ?? 0);
                          const total  = Number(row.quantity_purchased ?? qty);
                          return (
                            <tr key={row.stock_id ?? i} style={{ borderTop: "1px solid #F3F4F6" }}
                              onMouseEnter={(e) => e.currentTarget.style.background = "#FAFAFA"}
                              onMouseLeave={(e) => e.currentTarget.style.background = ""}
                            >
                              <td style={{ padding: "12px 16px" }}>
                                <p style={{ fontWeight: 600, color: "#111827", marginBottom: 2 }}>{row.product_name}</p>
                                <p style={{ fontSize: 12, color: "#6B7280" }}>{row.product_number}</p>
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontWeight: 700, color: qty <= (total * 0.3) ? "#DC2626" : "#111827" }}>{qty}</span>
                                  <span style={{ fontSize: 12, color: "#9CA3AF" }}>/ {total} units</span>
                                </div>
                              </td>
                              <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                <span style={{
                                  display: "inline-flex", alignItems: "center", gap: 4,
                                  padding: "6px 14px", borderRadius: 12, fontSize: 12, fontWeight: 600,
                                }} className={statusStyle[status]}>
                                  {(status === "Low Stock" || status === "Critical") && <AlertTriangle size={12} />}
                                  {status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "48px 0", background: "#F9FAFB", borderRadius: 10, border: "1px dashed #E5E7EB", marginTop: 8 }}>
                    <Package size={48} style={{ color: "#D1D5DB", margin: "0 auto 12px" }} />
                    <h3 style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>No items found</h3>
                    <p style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>This supplier hasn't provided any items yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stock;
