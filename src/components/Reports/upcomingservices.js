import React, { useEffect, useMemo, useState } from "react";
import ReportTable from "./ReportTable";
import apiEndpoints from "../../apiconfig";
import { useLoading } from "../../pages/LoadingContext";
const COLUMNS = [
  "S.No",
  "Job No",
  "Customer Name",
  "Date",
  "Subject",
  "Status",
];

export default function UpcomingServices({filters}) {
  const { show, hide } = useLoading();
  const [isSmall, setIsSmall] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 720 : false
  );
  const [jobs, setJobs] = useState([]); // <-- store API data
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
        const response = await fetch(
          `${apiEndpoints.report}?action=pending_jobs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) setJobs(data.pending_jobs);
      } catch (err) {
        console.error("Failed to fetch pending jobs:", err);
      } finally {
        hide();
      }
    };
    fetchJobs();
  }, []);

const filtered = useMemo(() => {
  let rows = [...jobs];

  // 1️⃣ Global search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter((row) =>
      Object.values(row).some((v) =>
        String(v).toLowerCase().includes(q)
      )
    );
  }

  // 2️⃣ Status filter (if used)
if (filters.status && filters.status !== "All") {
  rows = rows.filter((row) => {
    const status = String(row.Status).toLowerCase();

    if (filters.status === "Pending") {
      return status === "pending" || status === "approval pending";
    }

    return status === filters.status.toLowerCase();
  });
}


  // 3️⃣ Date range filter on Job Date (INCLUSIVE)
  if (filters.fromDate || filters.toDate) {
    const from = filters.fromDate
      ? new Date(filters.fromDate)
      : null;

    const to = filters.toDate
      ? new Date(filters.toDate + "T23:59:59.999")
      : null;

    rows = rows.filter((row) => {
      const rowDate = new Date(row.Date);
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
    if (status === "Completed")
      return { ...base, background: "linear-gradient(90deg,#10B981,#059669)" }; // green
    return { ...base, background: "linear-gradient(90deg,#F59E0B,#8B5CF6)" }; // pending -> orange
  };

  const renderBadge = (status) => (
    <span style={badgeStyleFor(status)}>{status}</span>
  );

  const tableData = filtered.map((row) => ({
    ...row,
    Status: renderBadge(row.Status), // keep badge
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
      {/* Header */}
      <div style={styles.headerRow}>
        <div style={styles.titleBlock}>
          <h2 style={styles.title}>Upcoming Services</h2>
          <div style={styles.subtitle}>Search upcoming job entries</div>
        </div>

      </div>

      <div style={styles.panel}>
        {/* Desktop/tablet: table view */}
        {!isSmall ? (
          <div style={styles.tableWrapper}>
            <ReportTable
              columns={COLUMNS}
              data={tableData}
              className="w-full"
            />
          </div>
        ) : (
          /* Mobile: card list */
          <div style={styles.cardList}>
            {filtered.map((row, idx) => (
              <div key={idx} style={styles.card}>
                <div style={styles.cardRow}>
                  <div>
                    <div style={styles.metaLabel}>Job</div>
                    <div style={styles.metaValue}>{row["Job No"]}</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={styles.metaLabel}>Date</div>
                    <div style={styles.metaValue}>{row.Date}</div>
                  </div>
                </div>

                <div>
                  <div style={styles.metaLabel}>Customer</div>
                  <div style={styles.metaValue}>{row["Customer Name"]}</div>
                </div>

                <div>
                  <div style={styles.metaLabel}>Subject</div>
                  <div style={styles.metaValue}>{row.Subject}</div>
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
