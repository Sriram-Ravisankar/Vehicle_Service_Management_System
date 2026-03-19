import React, { useState, useEffect } from "react";
import GraphDashboard from "./piechart";
import ServicesTab from "./Services";
import ProductStockTab from "./ProductStock";
import ProductUsageTab from "./ProductUsage";
import EmployeeServicesTab from "./Emp.Services";
import UpcomingServicesTab from "./upcomingservices";
import EmailsTab from "./Email";

import DonutLargeRoundedIcon from "@mui/icons-material/DonutLargeRounded";
import HomeRepairServiceRoundedIcon from "@mui/icons-material/HomeRepairServiceRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";

const TAB_ITEMS = [
  { id: "GRAPH", name: "Graph", Icon: DonutLargeRoundedIcon },
  { id: "SERVICES", name: "Services", Icon: HomeRepairServiceRoundedIcon },
  { id: "PRODUCT_STOCK", name: "Product Stock", Icon: Inventory2RoundedIcon },
  { id: "PRODUCT_USAGE", name: "Product Usage", Icon: QueryStatsRoundedIcon },
  { id: "EMP_SERVICES", name: "Emp. Services", Icon: Groups2RoundedIcon },
  {
    id: "UPCOMING_SERVICES",
    name: "Upcoming Services",
    Icon: EventAvailableRoundedIcon,
  },
  // { id: "EMAILS", name: "Emails", Icon: EmailRoundedIcon },
];

export default function ReportsTabs() {
  // State for active tab and screen size
  const [activeTab, setActiveTab] = useState("GRAPH");
  const [isMobile, setIsMobile] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    fromDate: "",
    toDate: "",
    status: "All",
  });

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Handle tab click
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // Reset filters when switching tabs for consistency
    setFilters({
      search: "",
      fromDate: "",
      toDate: "",
      status: "All",
    });
  };

  const getAvailableStatuses = () => {
    switch (activeTab) {
      case "SERVICES":
      case "EMP_SERVICES":
        return ["All", "Pending", "Completed", "Delivered"];
      case "UPCOMING_SERVICES":
        return ["All", "Pending", "Approval Pending"];
      case "PRODUCT_STOCK":
        return ["All", "In Stock", "Out of Stock", "Low Stock"];
      default:
        return null;
    }
  };

  const availableStatuses = getAvailableStatuses();

  // Render tab content
  const renderTabContent = () => {
    const commonProps = { filters };

    switch (activeTab) {
      case "GRAPH":
        return <GraphDashboard {...commonProps} />;
      case "SERVICES":
        return <ServicesTab {...commonProps} />;
      case "PRODUCT_STOCK":
        return <ProductStockTab {...commonProps} />;
      case "PRODUCT_USAGE":
        return <ProductUsageTab {...commonProps} />;
      case "EMP_SERVICES":
        return <EmployeeServicesTab {...commonProps} />;
      case "UPCOMING_SERVICES":
        return <UpcomingServicesTab {...commonProps} />;
      default:
        return <GraphDashboard {...commonProps} />;
    }
  };


  return (
    <div style={styles.container}>
      {/* Header Section - Scrolls normally with page (NOT sticky) */}
      {/* <h1 style={{ textAlign: 'left', marginBottom: '20px', color: '#0f172a' }}>Reports</h1> */}
      <div style={styles.headerSection}>
        {/* Tabs Section */}
        <div style={styles.tabsContainer(isMobile)}>
          <div style={styles.tabsWrapper}>
            {TAB_ITEMS.map((tab) => {
              const isActive = activeTab === tab.id;
              const IconComponent = tab.Icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  style={{
                    ...styles.tabButton(isMobile),
                    ...(isActive ? styles.activeTab : styles.inactiveTab),
                  }}
                >
                  {/* Show icon only on desktop */}
                  {!isMobile && <IconComponent style={styles.tabIcon} />}
                  <span style={styles.tabText}>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Hero Header based on activeTab */}
        {activeTab === "SERVICES" && (
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)",
            borderRadius: 16,
            padding: isMobile ? "20px" : "32px",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(14, 165, 233, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: 20,
            position: "relative",
            overflow: "hidden",
            marginBottom: "16px",
            animation: "fadeIn 0.4s ease-out"
          }}>
            <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1 }}>
              <HomeRepairServiceRoundedIcon style={{ fontSize: 180 }} />
            </div>
            <div style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              padding: 16,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <HomeRepairServiceRoundedIcon style={{ fontSize: 32, color: "#fff" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, zIndex: 1 }}>
              <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>Service Reports</h2>
              <div style={{ fontSize: 14, color: "#cbd5e1", margin: 0, fontWeight: 500 }}>
                Quick check on recent service jobs and mechanical tasks.
              </div>
            </div>
          </div>
        )}
        {activeTab === "PRODUCT_STOCK" && (
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)",
            borderRadius: 16,
            padding: isMobile ? "20px" : "32px",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(14, 165, 233, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: 20,
            position: "relative",
            overflow: "hidden",
            marginBottom: "16px",
            animation: "fadeIn 0.4s ease-out"
          }}>
            <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1 }}>
              <Inventory2RoundedIcon style={{ fontSize: 180 }} />
            </div>
            <div style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              padding: 16,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Inventory2RoundedIcon style={{ fontSize: 32, color: "#fff" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, zIndex: 1 }}>
              <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>Inventory Stock Report</h2>
              <div style={{ fontSize: 14, color: "#cbd5e1", margin: 0, fontWeight: 500 }}>
                Real-time tracking of current stock levels and purchase history.
              </div>
            </div>
          </div>
        )}

        {activeTab === "PRODUCT_USAGE" && (
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)",
            borderRadius: 16,
            padding: isMobile ? "20px" : "32px",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(14, 165, 233, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: 20,
            position: "relative",
            overflow: "hidden",
            marginBottom: "16px",
            animation: "fadeIn 0.4s ease-out"
          }}>
            <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1 }}>
              <QueryStatsRoundedIcon style={{ fontSize: 180 }} />
            </div>
            <div style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              padding: 16,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <QueryStatsRoundedIcon style={{ fontSize: 32, color: "#fff" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, zIndex: 1 }}>
              <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>Product Usage Report</h2>
              <div style={{ fontSize: 14, color: "#cbd5e1", margin: 0, fontWeight: 500 }}>
                Comprehensive analytics on product consumption.
              </div>
            </div>
          </div>
        )}

        {activeTab === "EMP_SERVICES" && (
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)",
            borderRadius: 16,
            padding: isMobile ? "20px" : "32px",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(14, 165, 233, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: 20,
            position: "relative",
            overflow: "hidden",
            marginBottom: "16px",
            animation: "fadeIn 0.4s ease-out"
          }}>
            <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1 }}>
              <Groups2RoundedIcon style={{ fontSize: 180 }} />
            </div>
            <div style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              padding: 16,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Groups2RoundedIcon style={{ fontSize: 32, color: "#fff" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, zIndex: 1 }}>
              <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>Employee Services Report</h2>
              <div style={{ fontSize: 14, color: "#cbd5e1", margin: 0, fontWeight: 500 }}>
                Detailed breakdown of services rendered per employee.
              </div>
            </div>
          </div>
        )}

        {activeTab === "UPCOMING_SERVICES" && (
          <div style={{
            background: "linear-gradient(135deg, #0f172a 0%, #0ea5e9 100%)",
            borderRadius: 16,
            padding: isMobile ? "20px" : "32px",
            color: "#fff",
            boxShadow: "0 10px 30px rgba(14, 165, 233, 0.2)",
            display: "flex",
            alignItems: "center",
            gap: 20,
            position: "relative",
            overflow: "hidden",
            marginBottom: "16px",
            animation: "fadeIn 0.4s ease-out"
          }}>
            <div style={{ position: "absolute", top: -20, right: -20, opacity: 0.1 }}>
              <EventAvailableRoundedIcon style={{ fontSize: 180 }} />
            </div>
            <div style={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              padding: 16,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <EventAvailableRoundedIcon style={{ fontSize: 32, color: "#fff" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, zIndex: 1 }}>
              <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>Upcoming Services Report</h2>
              <div style={{ fontSize: 14, color: "#cbd5e1", margin: 0, fontWeight: 500 }}>
                Schedules and forecasts of uncompleted or impending services.
              </div>
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div style={styles.filtersContainer(isMobile)}>
          <div style={styles.filtersContent(isMobile)}>
            {/* Search Input */}
            <div style={styles.filterItem}>
              <label style={styles.filterLabel}>Search</label>
              <input
                style={styles.textInput(isMobile)}
                placeholder="Search reports..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />

            </div>

            {/* Date Range */}
            <div style={styles.filterItem}>
              <label style={styles.filterLabel}>Date Range</label>
              <div style={styles.dateContainer(isMobile)}>
                <input
                  type="date"
                  style={styles.dateInput(isMobile)}
                  value={filters.fromDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, fromDate: e.target.value }))
                  }
                />

                <span style={styles.dateText}>to</span>

                <input
                  type="date"
                  style={styles.dateInput(isMobile)}
                  value={filters.toDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, toDate: e.target.value }))
                  }
                />

              </div>
            </div>

            {/* Status Filter - Only show if relevant */}
            {availableStatuses && (
              <div style={styles.filterItem}>
                <label style={styles.filterLabel}>Status</label>
                <select
                  style={styles.dropdown(isMobile)}
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  {availableStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s === "All" ? "All Status" : s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Clear Button inline on desktop */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <button
                style={styles.clearButton(isMobile)}
                onClick={() =>
                  setFilters({
                    search: "",
                    fromDate: "",
                    toDate: "",
                    status: "All",
                  })
                }
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.contentContainer}>{renderTabContent()}</div>
    </div>
  );
}

// Card component for responsive layouts
export function ResponsiveCards({ items = [], render }) {
  return (
    <div style={styles.cardsContainer}>
      {items.map((item, index) => (
        <div key={index} style={styles.card}>
          {render ? (
            render(item, index)
          ) : (
            <pre style={{ margin: 0 }}>{JSON.stringify(item, null, 2)}</pre>
          )}
        </div>
      ))}
    </div>
  );
}


const styles = {
  // Main container
  container: {
    padding: "16px 16px",
    margin: "0 auto",
    background:
      "radial-gradient(1200px 600px at 10% -10%, rgba(16,170,223,0.05), transparent 60%), radial-gradient(1200px 600px at 110% 10%, rgba(76,201,240,0.05), transparent 60%)",
    minHeight: "100vh",
  },

  headerSection: {
    position: "relative", // Normal flow, not sticky
    background: "transparent",
    paddingBottom: "16px",
  },

  // Tabs styles
  tabsContainer: (isMobile) => ({
    padding: "6px",
    marginBottom: isMobile ? "12px" : "16px",
    borderRadius: "16px",
    background: "#ffffff",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    display: "inline-flex",
    maxWidth: "100%",
  }),

  tabsWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    overflowX: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },

  tabButton: (isMobile) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: isMobile ? "8px 14px" : "10px 18px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: isMobile ? "13px" : "14px",
    whiteSpace: "nowrap",
    minWidth: "fit-content",
    flexShrink: 0,
    transition: "all 0.2s",
  }),

  activeTab: {
    color: "#0ea5e9",
    background: "#f0f9ff",
    boxShadow: "0 2px 8px rgba(14, 165, 233, 0.15)",
  },

  inactiveTab: {
    color: "#64748b",
    background: "transparent",
  },

  tabIcon: {
    fontSize: "18px",
  },

  tabText: {
    fontWeight: "600",
  },

  filtersContainer: (isMobile) => ({
    padding: isMobile ? "16px" : "20px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "saturate(180%) blur(8px)",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 6px 18px rgba(2,6,23,0.04)",
  }),

  filtersHeader: (isMobile) => ({
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "flex-end",
    alignItems: isMobile ? "stretch" : "center",
    marginBottom: "16px",
    gap: isMobile ? "12px" : "0",
  }),


  filterButtons: (isMobile) => ({
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: isMobile ? "stretch" : "flex-end",
  }),

  filtersContent: (isMobile) => ({
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? "16px" : "20px",
    alignItems: isMobile ? "stretch" : "flex-end",
  }),

  filterItem: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },

  filterLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "4px",
  },

  // Input styles with proper spacing
  textInput: (isMobile) => ({
    padding: isMobile ? "12px 10px" : "10px 12px",
    fontSize: isMobile ? "16px" : "14px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    width: "100%",
    boxSizing: "border-box",
  }),

  dateContainer: (isMobile) => ({
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "stretch" : "center",
    gap: isMobile ? "8px" : "12px",
    width: "100%",
  }),

  dateInput: (isMobile) => ({
    padding: isMobile ? "12px 10px" : "10px 12px",
    fontSize: isMobile ? "16px" : "14px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    flex: 1,
    width: "100%",
    boxSizing: "border-box",
  }),

  dateText: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
    padding: "0 8px",
  },

  dropdown: (isMobile) => ({
    padding: isMobile ? "12px 10px" : "10px 14px",
    fontSize: isMobile ? "16px" : "14px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    cursor: "pointer",
    width: "100%",
    boxSizing: "border-box",
    margin: 0,
    height: isMobile ? "auto" : "41px",
  }),

  clearButton: (isMobile) => ({
    padding: isMobile ? "14px 16px" : "10px 20px",
    borderRadius: "10px",
    border: "1.5px solid rgba(139, 92, 246, 0.9)",
    background: "transparent",
    color: "rgba(139, 92, 246, 0.9)",
    fontWeight: "600",
    fontSize: isMobile ? "15px" : "14px",
    cursor: "pointer",
    width: isMobile ? "100%" : "auto",
    height: isMobile ? "auto" : "41px",
  }),


  applyButton: (isMobile) => ({
    padding: isMobile ? "14px 16px" : "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(139, 92, 246, 0.9)",
    color: "#fff",
    fontWeight: "600",
    fontSize: isMobile ? "15px" : "14px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
    flex: isMobile ? "1" : "none",
    width: isMobile ? "100%" : "auto",
  }),


  // Content area
  contentContainer: {
    marginTop: "16px",
    minHeight: "400px",
  },

  // Coming soon panel
  comingSoonPanel: {
    padding: "32px 20px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "saturate(180%) blur(20px)",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
    minHeight: "400px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  comingSoonContent: {
    textAlign: "center",
    padding: "20px",
  },

  comingSoonIcon: {
    fontSize: "64px",
    color: "#10AADF",
    marginBottom: "16px",
    opacity: "0.8",
  },

  comingSoonTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px 0",
    background: "linear-gradient(135deg, #10AADF 0%, #0d8abc 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },

  comingSoonMessage: {
    fontSize: "16px",
    color: "#64748b",
    margin: "0",
    opacity: "0.8",
  },

  cardsContainer: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    width: "100%",
    boxSizing: "border-box",
  },

  card: {
    background: "#fff",
    border: "1px solid #e6eef8",
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(2,6,23,0.04)",
  },
};

// Add CSS for hiding scrollbar
const hideScrollbarStyles = `
  div[style*="overflow-x: auto"]::-webkit-scrollbar {
    display: none;
  }
  
  div[style*="overflowX: auto"] {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = hideScrollbarStyles;
  document.head.appendChild(styleSheet);
}