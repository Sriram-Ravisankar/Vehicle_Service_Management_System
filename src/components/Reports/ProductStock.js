import React, { useEffect, useMemo, useState } from "react";
import ReportTable from "./ReportTable";
import apiEndpoints from "../../apiconfig";
import { useLoading } from "../../pages/LoadingContext";
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
  // update mobile check on resize
  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth <= 720);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

useEffect(() => {
  const fetchStockReport = async () => {
    try {
      show(); // 🌍 GLOBAL LOADER ON

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
    } finally {
      hide(); // 🌍 GLOBAL LOADER OFF
    }
  };

  fetchStockReport();
}, []);


  // --- Filter based on search term ---
const filtered = useMemo(() => {
  let rows = [...data];

  // 1️⃣ Search filter
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(q)
      )
    );
  }

  // 2️⃣ Date range filter (INCLUSIVE to-date)
  if (filters.fromDate || filters.toDate) {
    const from = filters.fromDate
      ? new Date(filters.fromDate)
      : null;

    const to = filters.toDate
      ? new Date(filters.toDate + "T23:59:59.999")
      : null;

    rows = rows.filter((row) => {
      const rowDate = new Date(row["Purchase Date"]);
      if (from && rowDate < from) return false;
      if (to && rowDate > to) return false;
      return true;
    });
  }

  return rows;
}, [data, filters]);


  const styles = {
    page: {
      margin: "0 auto",
      boxSizing: "border-box",
      fontFamily: "Montserrat",
      color: "#0f172a",
    },

    headerRow: {
      display: "flex",
      flexDirection: isSmall ? "column" : "row",
      alignItems: isSmall ? "stretch" : "center",
      justifyContent: "space-between",
      gap: isSmall ? 12 : 24,
      marginBottom: 12,
    },

    titleBlock: { display: "flex", flexDirection: "column", gap: 4 },
    title: { fontSize: 20, fontWeight: 800, margin: 0 },
    subtitle: { fontSize: 13, color: "#6b7280", margin: 0 },

    searchRow: {
      display: "flex",
      gap: 8,
      alignItems: "center",
      width: isSmall ? "100%" : 400,
      marginLeft: isSmall ? 0 : "auto",
    },
    searchInput: {
      flex: 1,
      padding: "10px 12px",
      fontSize: 14,
      borderRadius: 10,
      border: "1px solid #e6eef8",
      background: "#fff",
      outline: "none",
      boxSizing: "border-box",
    },
    clearBtn: {
      padding: "8px 12px",
      borderRadius: 10,
      border: "1px solid #e6eef8",
      background: "transparent",
      cursor: "pointer",
      fontWeight: 700,
      color: "#475569",
      whiteSpace: "nowrap",
    },

    // panel containing table/cards
    panel: {
      background: "#ffffff",
      borderRadius: 12,
      boxShadow: "0 8px 24px rgba(2,6,23,0.04)",
      border: "1px solid rgba(0,0,0,0.04)",
      overflow: "hidden",
    },

    // table wrapper keeps horizontal scroll on small screens
    tableWrapper: {
      width: "100%",
      overflowX: "auto",
      padding: isSmall ? 12 : 16,
      boxSizing: "border-box",
    },

    // mobile card list
    cardList: {
      display: "grid",
      gap: 12,
      padding: 12,
      boxSizing: "border-box",
      gridTemplateColumns: "1fr",
    },
    card: {
      borderRadius: 12,
      background: "#f8fafc",
      padding: 12,
      border: "1px solid #e6eef8",
      boxShadow: "0 4px 12px rgba(2,6,23,0.03)",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    },
    cardRow: {
      display: "flex",
      justifyContent: "space-between",
      gap: 8,
      alignItems: "center",
    },
    metaLabel: { color: "#6b7280", fontSize: 12, fontWeight: 700 },
    metaValue: { color: "#0f172a", fontSize: 14, fontWeight: 700 },

    footer: {
      padding: "12px 16px",
      fontSize: 13,
      color: "#475569",
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.page}>
      {/* header */}
      <div style={styles.headerRow}>
        <div style={styles.titleBlock}>
          <h2 style={styles.title}>Product Stock Report</h2>
          <div style={styles.subtitle}>
            Stock & order details. Search across all columns.
          </div>
        </div>
      </div>

      <div style={styles.panel}>
        {/* Desktop/tablet: table */}
        {!isSmall ? (
          <div style={styles.tableWrapper}>
            <ReportTable columns={COLUMNS} data={filtered} className="w-full" />
          </div>
        ) : (
          /* Mobile: card list */
          <div style={styles.cardList}>
            {filtered.map((row, idx) => (
              <div key={idx} style={styles.card}>
                <div style={styles.cardRow}>
                  <div>
                    <div style={styles.metaLabel}>Product No</div>
                    <div style={styles.metaValue}>{row["Product Number"]}</div>
                  </div>
                  <div>
                    <div style={styles.metaLabel}>Date</div>
                    <div style={styles.metaValue}>{row["Purchase Date"]}</div>
                  </div>
                </div>

                <div>
                  <div style={styles.metaLabel}>Supplier</div>
                  <div style={styles.metaValue}>{row["Supplier Name"]}</div>
                </div>

                <div>
                  <div style={styles.metaLabel}>Product</div>
                  <div style={styles.metaValue}>{row["Product Name"]}</div>
                </div>

                <div>
                  <div style={styles.metaLabel}>Available Qty</div>
                  <div style={styles.metaValue}>
                    {row["Available Quantity"]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.footer}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
