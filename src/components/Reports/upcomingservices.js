import React, { useEffect, useMemo, useState } from "react";
import ReportTable from "./ReportTable";
import apiEndpoints from "../../apiconfig";
import useAutoRefresh from "../../hooks/useAutoRefresh";

const COLUMNS = [
  "S.No",
  "Job No",
  "Customer Name",
  "Assigned Mechanic",
  "Date",
  "Subject",
  "Status",
];

export default function UpcomingServices({filters}) {
  const [isSmall, setIsSmall] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 720 : false
  );
  const [jobs, setJobs] = useState([]); // <-- store API data

  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth <= 720);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchJobs = React.useCallback(async () => {
    try {
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
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useAutoRefresh(fetchJobs);

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
      padding: "6px 14px",
      borderRadius: "20px",
      fontWeight: '700',
      fontSize: "13px",
      color: "#fff",
      textAlign: "center",
      border: "none",
    };
    const s = String(status).toLowerCase();
    
    if (s.includes("delivered"))
      return { ...base, background: "linear-gradient(90deg,#0EA5E9,#a855f7)", color: "#fff", boxShadow: "0 4px 10px rgba(168, 85, 247, 0.2)" };
    if (s.includes("completed"))
      return { ...base, background: "linear-gradient(90deg,#10B981,#059669)", color: "#fff", boxShadow: "0 4px 10px rgba(16, 185, 129, 0.2)" };
    if (s.includes("progress") || s.includes("active"))
      return { ...base, background: "linear-gradient(90deg,#3B82F6,#2563EB)", color: "#fff", boxShadow: "0 4px 10px rgba(59, 130, 246, 0.2)" };
    if (s.includes("approval"))
      return { ...base, background: "linear-gradient(90deg,#64748b,#475569)", color: "#fff", boxShadow: "0 4px 10px rgba(100, 116, 139, 0.2)" };
      
    // default (pending)
    return { ...base, background: "linear-gradient(90deg,#F59E0B,#D97706)", color: "#fff", boxShadow: "0 4px 10px rgba(245, 158, 11, 0.2)" };
  };

  const renderBadge = (status) => (
    <span style={badgeStyleFor(status)}>{status}</span>
  );

  const tableData = filtered.map((row) => ({
    ...row,
    Status: renderBadge(row.Status),
  }));

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
            <ReportTable
              columns={COLUMNS}
              data={tableData}
              className="w-full"
            />
          </div>
        ) : (
          <div style={styles.cardList}>
            {filtered.map((row, idx) => (
              <div key={idx} style={styles.card}>
                <div style={styles.cardRow}>
                  <div>
                    <div style={styles.metaLabel}>Job No</div>
                    <div style={{...styles.metaValue, color: "#f97316"}}>{row["Job No"]}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={styles.metaLabel}>Status</div>
                    <div style={{ marginTop: 6 }}>{renderBadge(row.Status)}</div>
                  </div>
                </div>

                <div>
                  <div style={styles.metaLabel}>Customer</div>
                  <div style={{...styles.metaValue, fontSize: 16}}>{row["Customer Name"]}</div>
                </div>

                <div>
                   <div style={styles.metaLabel}>Assigned Mechanic</div>
                   <div style={{...styles.metaValue, color: "#3b82f6"}}>{row["Assigned Mechanic"]}</div>
                </div>

                <div style={styles.cardRow}>
                  <div style={{ border: "none" }}>
                    <div style={styles.metaLabel}>Subject</div>
                    <div style={styles.metaValue}>{row.Subject}</div>
                  </div>
                  <div style={{ textAlign: "right", border: "none" }}>
                    <div style={styles.metaLabel}>Date</div>
                    <div style={styles.metaValue}>{row.Date}</div>
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
