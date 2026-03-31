import React, { useEffect, useMemo, useState } from "react";
import ReportTable from "./ReportTable";
import apiEndpoints from "../../apiconfig";
import useAutoRefresh from "../../hooks/useAutoRefresh";

const COLUMNS = [
  "S.No",
  "Product Number",
  "Supplier Name",
  "Purchase Date",
  "Product Name",
  "Quantity sold",
];

export default function ProductUsageTab({filters}) {
  const [isSmall, setIsSmall] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 720 : false
  );
  const [data, setData] = useState([]);

  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth <= 720);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchUsage = React.useCallback(async () => {
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
          "Quantity sold": row["Quantity Sold"] ?? 0,
        }));

        setData(formatted);
      } else {
        console.error("No usage data found");
      }
    } catch (err) {
      console.error("Error fetching usage:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  useAutoRefresh(fetchUsage);

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
      background: Number(qty) > 0 ? "#eff6ff" : "#f1f5f9",
      color: Number(qty) > 0 ? "#3b82f6" : "#64748b",
      padding: "6px 14px",
      borderRadius: "20px",
      fontWeight: '700',
      fontSize: "13px",
      display: "inline-block",
      border: `1px solid ${Number(qty) > 0 ? '#bfdbfe' : '#e2e8f0'}`
    });

    return rows.map(r => ({
      ...r,
      "Quantity sold": (
        <span style={badgeStyle(r["Quantity sold"])}>
          {r["Quantity sold"]} Units
        </span>
      ),
      "RawQty": r["Quantity sold"] // Keep raw for mobile view
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
      background: Number(qty) > 0 ? "#eff6ff" : "#f1f5f9",
      color: Number(qty) > 0 ? "#3b82f6" : "#64748b",
      padding: "4px 10px",
      borderRadius: 20,
      fontWeight: 800,
      fontSize: 14,
      display: "inline-block",
      border: `1px solid ${Number(qty) > 0 ? '#bfdbfe' : '#e2e8f0'}`
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
                    <div style={{...styles.metaValue, color: "#0ea5e9"}}>{row["Product Number"]}</div>
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
                    <div style={styles.metaLabel}>Quantity Sold</div>
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
          <span>{filtered.length} record{filtered.length !== 1 ? "s" : ""} found</span>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>Last updated instantly</span>
        </div>
      </div>
    </div>
  );
}
