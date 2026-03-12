import React, { useState, useMemo } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import ReportFilterSection from "./ReportFilterSection";

import GraphDashboard from "./piechart";
import ServicesTab from "./Services";
import ProductStockTab from "./ProductStock";
import ProductUsageTab from "./ProductUsage";
import EmployeeServicesTab from "./Emp.Services";
import UpcomingServicesTab from "./upcomingservices";

import DonutLargeRoundedIcon from "@mui/icons-material/DonutLargeRounded";
import HomeRepairServiceRoundedIcon from "@mui/icons-material/HomeRepairServiceRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import Groups2RoundedIcon from "@mui/icons-material/Groups2Rounded";
import EventAvailableRoundedIcon from "@mui/icons-material/EventAvailableRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";

/** Tab definitions (label + value + icon) */
const TABS = [
  {
    value: "GRAPH",
    label: "Graph",
    icon: <DonutLargeRoundedIcon fontSize="small" />,
  },
  {
    value: "SERVICES",
    label: "Services",
    icon: <HomeRepairServiceRoundedIcon fontSize="small" />,
  },
  {
    value: "PRODUCT STOCK",
    label: "Product Stock",
    icon: <Inventory2RoundedIcon fontSize="small" />,
  },
  {
    value: "PRODUCT USAGE",
    label: "Product Usage",
    icon: <QueryStatsRoundedIcon fontSize="small" />,
  },
  {
    value: "EMP. SERVICES",
    label: "Emp. Services",
    icon: <Groups2RoundedIcon fontSize="small" />,
  },
  {
    value: "UPCOMING SERVICES",
    label: "Upcoming Services",
    icon: <EventAvailableRoundedIcon fontSize="small" />,
  },
  // {
  //   value: "EMAILS",
  //   label: "Emails",
  //   icon: <EmailRoundedIcon fontSize="small" />,
  // },
];

export default function ReportsTabs() {
  const [activeTab, setActiveTab] = useState("GRAPH");
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down("sm"));

  // Sticky offset: sits right under your fixed navbar
  const stickyTop = useMemo(() => `calc(var(--nav-h, 64px) + 8px)`, []);

  const handleTabChange = (_e, value) => setActiveTab(value);

  const renderTabPanel = () => {
    switch (activeTab) {
      case "GRAPH":
        return <GraphDashboard />;
      case "SERVICES":
        return <ServicesTab />;
      case "PRODUCT STOCK":
        return <ProductStockTab />;
      case "PRODUCT USAGE":
        return <ProductUsageTab />;
      case "EMP. SERVICES":
        return <EmployeeServicesTab />;
      case "UPCOMING SERVICES":
        return <UpcomingServicesTab />;
      // case "EMAILS":
      //   return (
      //     <Box
      //       sx={{
      //         mt: 2,
      //         p: 3,
      //         borderRadius: 2,
      //         bgcolor: "#fff",
      //         boxShadow:
      //           "0 6px 18px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
      //       }}
      //     >
      //       <Typography variant="body1" color="text.secondary">
      //         Emails tab coming soon.
      //       </Typography>
      //     </Box>
      //   );
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        p: { xs: 2, sm: 3 },
        fontFamily: "Montserrat",
        background:
          "radial-gradient(1200px 600px at 10% -10%, rgba(16,170,223,0.08), transparent 60%), radial-gradient(1200px 600px at 110% 10%, rgba(76,201,240,0.08), transparent 60%)",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: stickyTop,
          zIndex: (t) => t.zIndex.appBar - 1,
          pb: 1,
          background: "transparent",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 0.75,
            mb: 1.5,
            borderRadius: 999,
            bgcolor: "rgba(255,255,255,0.9)",
            backdropFilter: "saturate(150%) blur(8px)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons={false}
            allowScrollButtonsMobile={false}
            aria-label="Reports tabs"
            TabIndicatorProps={{ style: { display: "none" } }}
            sx={{
              minHeight: 0,
              "& .MuiTabs-flexContainer": {
                gap: { xs: 1, sm: 1.25, md: 1.5, lg: 2 },
              },
              "& .MuiTabs-scrollButtons": { display: "none" },
              "& .MuiTabs-scroller": {
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": { display: "none" },
              },
            }}
          >
            {TABS.map((t) => (
              <Tab
                key={t.value}
                value={t.value}
                iconPosition="start"
                icon={!isDownSm ? t.icon : undefined}
                label={t.label}
                disableRipple
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  letterSpacing: 0.2,
                  fontSize: { xs: 12.5, sm: 13.5 },
                  minHeight: 36,
                  minWidth: 0,
                  px: { xs: 1.75, sm: 2 },
                  mx: 0,
                  borderRadius: 999,
                  color: "text.secondary",
                  whiteSpace: "nowrap",
                  "&.Mui-selected": {
                    color: "#fff",
                    bgcolor: "#10AADF",
                  },
                  "&:hover": {
                    bgcolor: "rgba(16,170,223,0.10)",
                  },
                }}
              />
            ))}
          </Tabs>
        </Paper>

        <ReportFilterSection activeTab={activeTab} />
      </Box>

      {/* Tab content */}
      <Box sx={{ mt: 2 }}>{renderTabPanel()}</Box>
    </Box>
  );
}
