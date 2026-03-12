import React, { useEffect, useMemo, useState } from "react";
import ReportTable from "./ReportTable";
import apiEndpoints from "../../apiconfig";
import { useLoading } from "../../pages/LoadingContext";
const COLUMNS = [
  "S.No",
  "Employee Code",
  "Repair Category",
  "Arrival Date",
  "Estimated Date",
  "Status",
];

export default function EmpServicesTab({filters}) {
  const { show, hide } = useLoading();
  const [isSmall, setIsSmall] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 720 : false
  );
  const [jobs, setJobs] = useState([]);

  // Responsiveness: update isSmall on resize
  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth <= 720);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        show();
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${apiEndpoints.report}?action=employee_jobs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) setJobs(data.employee_jobs);
      } catch (err) {
        console.error("Failed to fetch employee jobs:", err);
      } finally {
        hide();
      }
    };
    fetchJobs();
  }, []);

  // Filter data (case-insensitive search over all fields)
const filtered = useMemo(() => {
  let rows = [...jobs];

  // 1️⃣ Search filter (global)
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((row) =>
      Object.values(row).some((v) =>
        String(v).toLowerCase().includes(q)
      )
    );
  }

  // 2️⃣ Status filter
if (filters.status && filters.status !== "All") {
  rows = rows.filter((row) => {
    const status = String(row.Status).toLowerCase();

    if (filters.status === "Pending") {
      return status === "pending" || status === "approval pending";
    }

    return status === filters.status.toLowerCase();
  });
}


  // 3️⃣ Date range filter (Arrival Date – inclusive)
  if (filters.fromDate || filters.toDate) {
    const from = filters.fromDate
      ? new Date(filters.fromDate)
      : null;

    const to = filters.toDate
      ? new Date(filters.toDate + "T23:59:59.999")
      : null;

    rows = rows.filter((row) => {
      const rowDate = new Date(row["Arrival Date"]);
      if (from && rowDate < from) return false;
      if (to && rowDate > to) return false;
      return true;
    });
  }

  return rows;
}, [jobs, filters]);


  const badgeStyleFor = (status) => {
    const base = {
      display: "inline-block",
      padding: "6px 10px",
      borderRadius: 999,
      fontWeight: 700,
      fontSize: 12,
      color: "#fff",
      minWidth: 72,
      textAlign: "center",
    };
    if (status === "Delivered")
      return { ...base, background: "linear-gradient(90deg,#10B981,#059669)" };
    if (status === "Work In Progress")
      return { ...base, background: "linear-gradient(90deg,#3B82F6,#2563EB)" };
    return { ...base, background: "linear-gradient(90deg,#F59E0B,#F97316)" };
  };

  // Badge node for table and cards
  const renderBadge = (status) => (
    <span style={badgeStyleFor(status)}>{status}</span>
  );

  // Table data with badges
  const tableData = filtered.map((row) => ({
    ...row,
    Status: renderBadge(row.Status),
  }));

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
      width: isSmall ? "100%" : 420,
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

    panel: {
      background: "#ffffff",
      borderRadius: 12,
      boxShadow: "0 8px 24px rgba(2,6,23,0.04)",
      border: "1px solid rgba(0,0,0,0.04)",
      overflow: "hidden",
    },

    // table wrapper for desktop; keeps horizontal scroll on narrow widths
    tableWrapper: {
      width: "100%",
      overflowX: "auto",
      padding: isSmall ? 12 : 16,
      boxSizing: "border-box",
    },

    // mobile card list view
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
      {/* Header (not sticky) */}
      <div style={styles.headerRow}>
        <div style={styles.titleBlock}>
          <h2 style={styles.title}>Employee Services Report</h2>
          <div style={styles.subtitle}>Search</div>
        </div>
      </div>

      <div style={styles.panel}>
        {/* Desktop/tablet: table view (keeps ReportTable usage) */}
        {!isSmall ? (
          <div style={styles.tableWrapper}>
            <ReportTable
              columns={COLUMNS}
              data={tableData}
              className="w-full"
            />
          </div>
        ) : (
          /* Mobile: card list for better readability */
          <div style={styles.cardList}>
            {filtered.map((row, idx) => (
              <div key={idx} style={styles.card}>
                <div style={styles.cardRow}>
                  <div style={{ textAlign: "right" }}>
                    <div style={styles.metaLabel}>Code</div>
                    <div style={styles.metaValue}>{row["Employee Code"]}</div>
                  </div>
                </div>
                <div>
                  <div style={styles.metaLabel}>Repair Category</div>
                  <div style={styles.metaValue}>{row["Repair Category"]}</div>
                </div>
                <div style={styles.cardRow}>
                  <div>
                    <div style={styles.metaLabel}>Arrival Date</div>
                    <div style={styles.metaValue}>{row["Arrival Date"]}</div>
                  </div>
                  <div>
                    <div style={styles.metaLabel}>Estimated Date</div>
                    <div style={styles.metaValue}>{row["Estimated Date"]}</div>
                  </div>
                </div>
                <div style={{ marginTop: 6 }}>{renderBadge(row.Status)}</div>
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
