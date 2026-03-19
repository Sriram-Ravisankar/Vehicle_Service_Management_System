import React, { useEffect, useMemo, useState } from "react";
import ReportTable from "./ReportTable";
import apiEndpoints from "../../apiconfig";
import { useLoading } from "../../pages/LoadingContext";
import { Package, Search, Calendar, Tag, AlertCircle } from "lucide-react";

const COLUMNS = [
  "S.No",
  "Product Number",
  "Supplier Name",
  "Purchase Date",
  "Product Name",
  "Available Quantity",
];

export default function ProductStockTab({filters}) {
  const { show, hide } = useLoading();
  const [isSmall, setIsSmall] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 720 : false
  );
  const [data, setData] = useState([]);
  
  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth <= 720);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const fetchStockReport = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await fetch(apiEndpoints.report, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const json = await res.json();

        if (json.success && json.stock_reports) {
          const formatted = json.stock_reports.map((row, index) => ({
            "S.No": index + 1,
            "Product Number": row["Product Number"],
            "Supplier Name": row["Supplier Name"],
            "Purchase Date": row["Purchase Date"],
            "Product Name": row["Product Name"],
            "Available Quantity": row["Available Quantity"],
          }));
          setData(formatted);
        } else {
          console.error("No stock data found");
        }
      } catch (err) {
        console.error("Error fetching stock:", err);
      }
    };

    fetchStockReport();
  }, []);

  // --- Filter based on search term & dates ---
  const filtered = useMemo(() => {
    let rows = [...data];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      rows = rows.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(q)
        )
      );
    }

    if (filters.status && filters.status !== "All") {
      rows = rows.filter((row) => {
        const qty = Number(row["Available Quantity"]);
        if (filters.status === "In Stock") return qty > 0;
        if (filters.status === "Out of Stock") return qty <= 0;
        if (filters.status === "Low Stock") return qty > 0 && qty <= 5;
        return true;
      });
    }

    if (filters.fromDate || filters.toDate) {
      const from = filters.fromDate ? new Date(filters.fromDate) : null;
      const to = filters.toDate ? new Date(filters.toDate + "T23:59:59.999") : null;

      rows = rows.filter((row) => {
        const rowDate = new Date(row["Purchase Date"]);
        if (from && rowDate < from) return false;
        if (to && rowDate > to) return false;
        return true;
      });
    }

    // Badge styling for table rendering
    const badgeStyle = (qty) => ({
      background: Number(qty) <= 0 ? "#fef2f2" : "#f0fdf4",
      color: Number(qty) <= 0 ? "#ef4444" : "#16a34a",
      padding: "6px 14px",
      borderRadius: "20px",
      fontWeight: '700',
      fontSize: "13px",
      display: "inline-block",
      border: `1px solid ${Number(qty) <= 0 ? '#fecaca' : '#bbf7d0'}`
    });

    return rows.map(r => ({
      ...r,
      "Available Quantity": (
        <span style={badgeStyle(r["Available Quantity"])}>
          {r["Available Quantity"]} Units
        </span>
      ),
      "RawQty": r["Available Quantity"] // Keep raw for mobile view
    }));
  }, [data, filters]);

  const styles = {
    page: {
      margin: "0 auto",
      boxSizing: "border-box",
      color: "#0f172a",
      display: "flex",
      flexDirection: "column",
      gap: 24,
      animation: "fadeIn 0.4s ease-out",
    },

    headerCard: {
      background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
      borderRadius: 16,
      padding: isSmall ? "20px" : "32px",
      color: "#fff",
      boxShadow: "0 10px 30px rgba(67, 56, 202, 0.2)",
      display: "flex",
      alignItems: "center",
      gap: 20,
      position: "relative",
      overflow: "hidden",
    },

    iconBox: {
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(10px)",
      padding: 16,
      borderRadius: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    titleBlock: { display: "flex", flexDirection: "column", gap: 6, zIndex: 1 },
    title: { fontSize: isSmall ? 22 : 28, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" },
    subtitle: { fontSize: 14, color: "#cbd5e1", margin: 0, fontWeight: 500 },

    // panel containing table/cards
    panel: {
      background: "#ffffff",
      borderRadius: 16,
      boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      border: "1px solid #f1f5f9",
      overflow: "hidden",
    },

    tableWrapper: {
      width: "100%",
      overflowX: "auto",
      padding: isSmall ? 12 : 20,
      boxSizing: "border-box",
    },

    // mobile card list
    cardList: {
      display: "grid",
      gap: 16,
      padding: 16,
      boxSizing: "border-box",
      gridTemplateColumns: "1fr",
    },
    card: {
      borderRadius: 16,
      background: "#ffffff",
      padding: 20,
      border: "1px solid #e2e8f0",
      boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    cardRow: {
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      alignItems: "center",
      borderBottom: "1px solid #f1f5f9",
      paddingBottom: 12,
    },
    metaLabel: { color: "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" },
    metaValue: { color: "#0f172a", fontSize: 15, fontWeight: 700, mt: 4 },
    qtyBadge: (qty) => ({
      background: Number(qty) <= 0 ? "#fef2f2" : "#f0fdf4",
      color: Number(qty) <= 0 ? "#ef4444" : "#16a34a",
      padding: "4px 10px",
      borderRadius: 20,
      fontWeight: 800,
      fontSize: 14,
      display: "inline-block",
      border: `1px solid ${Number(qty) <= 0 ? '#fecaca' : '#bbf7d0'}`
    }),

    footer: {
      padding: "16px 24px",
      fontSize: 14,
      color: "#64748b",
      fontWeight: 600,
      background: "#f8fafc",
      borderTop: "1px solid #f1f5f9",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    },
  };

  return (
    <div style={styles.page}>
      
      <div style={styles.panel}>
        {!isSmall ? (
          <div style={styles.tableWrapper}>
            <ReportTable columns={COLUMNS} data={filtered} className="w-full" />
          </div>
        ) : (
          <div style={styles.cardList}>
            {filtered.map((row, idx) => (
              <div key={idx} style={styles.card}>
                <div style={styles.cardRow}>
                  <div>
                    <div style={styles.metaLabel}>Product No</div>
                    <div style={{...styles.metaValue, color: "#4338ca"}}>{row["Product Number"]}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={styles.metaLabel}>Date</div>
                    <div style={styles.metaValue}>{row["Purchase Date"]}</div>
                  </div>
                </div>

                <div>
                  <div style={styles.metaLabel}>Product Name</div>
                  <div style={{...styles.metaValue, fontSize: 16}}>{row["Product Name"]}</div>
                </div>

                <div style={styles.cardRow}>
                  <div style={{ border: "none" }}>
                    <div style={styles.metaLabel}>Supplier</div>
                    <div style={styles.metaValue}>{row["Supplier Name"]}</div>
                  </div>
                  <div style={{ textAlign: "right", border: "none" }}>
                    <div style={styles.metaLabel}>Available Qty</div>
                    <div style={{ marginTop: 6 }}>
                      <span style={styles.qtyBadge(row.RawQty)}>
                        {row.RawQty} Units
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.footer}>
          <span>{filtered.length} Record{filtered.length !== 1 ? "s" : ""} Found</span>
          {filtered.length === 0 && <span style={{ color: "#ef4444" }}>No data matches criteria</span>}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
