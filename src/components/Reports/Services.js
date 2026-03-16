import React, { useEffect, useMemo, useState } from "react";
import ReportTable from "./ReportTable"; // keep as in your project
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

// helper to style status badges
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
  return { ...base, background: "linear-gradient(90deg,#F59E0B,#8B5CF6)" };
};

export default function ServicesTab({ filters }) {
  // mobile breakpoint (<=720)
  const { show, hide } = useLoading();
  const [isSmall, setIsSmall] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 720 : false
  );
  const [jobData, setJobData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        show();
        const token = sessionStorage.getItem("token");
        const res = await fetch(`${apiEndpoints.report}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();

        if (json.success && Array.isArray(json.job_reports)) {
          setJobData(json.job_reports); // use job_reports
        } else {
          setJobData([]); // fallback
        }
      } catch (err) {
        console.error("Error fetching job cards:", err);
        setJobData([]); // fallback
      }finally{
        hide();
      }
    };

    fetchData();
  }, []);

  // responsiveness listener
  useEffect(() => {
    const onResize = () => setIsSmall(window.innerWidth <= 720);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const filtered = useMemo(() => {
    let data = [...jobData];

    // 1️⃣ Search filter
    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter((row) =>
        Object.values(row).some((v) =>
          String(v).toLowerCase().includes(q)
        )
      );
    }

    // 2️⃣ Status filter (supports Pending + Approval Pending)
    if (filters.status && filters.status !== "All") {
      data = data.filter((row) => {
        const status = String(row.Status).toLowerCase();

        if (filters.status === "Pending") {
          return status === "pending" || status === "approval pending";
        }

        return status === filters.status.toLowerCase();
      });
    }


    // 3️⃣ Date range filter
    if (filters.fromDate || filters.toDate) {
      const from = filters.fromDate
        ? new Date(filters.fromDate)
        : null;
      const to = filters.toDate
        ? new Date(filters.toDate + "T23:59:59.999")
        : null;


      data = data.filter((row) => {
        const rowDate = new Date(row.Date);
        if (from && rowDate < from) return false;
        if (to && rowDate > to) return false;
        return true;
      });
    }

    return data;
  }, [jobData, filters]);


  // render badge node used in table and cards
  const renderBadge = (status) => (
    <span style={badgeStyleFor(status)}>{status}</span>
  );

  const tableData = Array.isArray(filtered)
    ? filtered.map((row) => ({ ...row, Status: renderBadge(row.Status) }))
    : [];

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

    titleBlock: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
    },
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
      boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
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

    // panel that contains table/cards
    panel: {
      background: "#ffffff",
      borderRadius: 12,
      boxShadow: "0 8px 24px rgba(2,6,23,0.04)",
      border: "1px solid rgba(0,0,0,0.04)",
      overflow: "hidden",
    },

    // table wrapper (keeps horizontal scroll on small screens)
    tableWrapper: {
      width: "100%",
      overflowX: "auto",
      padding: isSmall ? 12 : 16,
      boxSizing: "border-box",
    },

    // card list for mobile: single column list for readability
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

    // footer with count
    footer: {
      padding: "12px 16px",
      fontSize: 13,
      color: "#475569",
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.page}>
      {/* Header - title left, search area to the right (desktop) */}
      <div style={styles.headerRow}>
        <div style={styles.titleBlock}>
          <h2 style={styles.title}>Service Reports</h2>
          <div style={styles.subtitle}>
            Quick view of recent service jobs (search across columns)
          </div>
        </div>
      </div>

      {/* Data panel */}
      <div style={styles.panel}>
        {/* Desktop/tablet: table view (keeps your ReportTable usage unchanged) */}
        {!isSmall ? (
          <div style={styles.tableWrapper}>
            {tableData.length > 0 ? (
              <ReportTable
                columns={COLUMNS}
                data={tableData}
                className="w-full"
              />
            ) : (
              <p
                style={{
                  padding: "16px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                No service reports found.
              </p>
            )}
          </div>
        ) : (
          /* Mobile: compact cards for better readability on phones */
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
