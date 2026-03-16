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
  };

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

        {/* Filters Section */}
        <div style={styles.filtersContainer(isMobile)}>
          <div style={styles.filtersHeader(isMobile)}>
            <h3 style={styles.filtersTitle}>Filters & Search</h3>
            <div style={styles.filterButtons(isMobile)}>
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

              {/* <button style={styles.applyButton(isMobile)}>
                Apply Filters
              </button> */}
            </div>
          </div>

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

            {/* Status Filter */}
            <div style={styles.filterItem}>
              <label style={styles.filterLabel}>Status</label>
              <select
                style={styles.dropdown(isMobile)}
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>

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
    padding: isMobile ? "8px" : "12px",
    marginBottom: isMobile ? "8px" : "12px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "saturate(180%) blur(8px)",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 6px 18px rgba(2,6,23,0.04)",
    overflow: "hidden",
  }),

  tabsWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    overflowX: "auto",
    padding: "4px 2px",
    boxSizing: "border-box",
    width: "100%",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },

  tabButton: (isMobile) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: isMobile ? "10px 14px" : "12px 18px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: isMobile ? "13px" : "14px",
    whiteSpace: "nowrap",
    minWidth: "fit-content",
    flexShrink: 0,
  }),

  activeTab: {
    color: "rgba(139, 92, 246, 0.9)",
    background: "rgba(249, 115, 22, 0.15)",
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
    justifyContent: "space-between",
    alignItems: isMobile ? "stretch" : "center",
    marginBottom: "16px",
    gap: isMobile ? "12px" : "0",
  }),

  filtersTitle: {
    margin: "0",
    fontSize: "18px",
    fontWeight: "700",
    color: "rgba(139, 92, 246, 0.9)",
    textAlign: "center",
  },


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

  // Dropdown with extra spacing
  dropdown: (isMobile) => ({
    padding: isMobile ? "12px 10px" : "12px 14px",
    fontSize: isMobile ? "16px" : "14px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    background: "#f8fafc",
    cursor: "pointer",
    width: "100%",
    boxSizing: "border-box",
    margin: "4px 0",
  }),

  // Button styles
  clearButton: (isMobile) => ({
    padding: isMobile ? "14px 16px" : "10px 20px",
    borderRadius: "10px",
    border: "1.5px solid rgba(139, 92, 246, 0.9)",
    background: "transparent",
    color: "rgba(139, 92, 246, 0.9)",
    fontWeight: "600",
    fontSize: isMobile ? "15px" : "14px",
    cursor: "pointer",
    flex: isMobile ? "1" : "none",
    width: isMobile ? "100%" : "auto",
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