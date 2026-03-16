import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  useTheme,
  Divider,
  Avatar,
  useMediaQuery,
  Card,
  CardContent,
  Chip,
  alpha,
  TablePagination, // Added for pagination
} from "@mui/material";
import PropTypes from "prop-types";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Notifications,
  AccountBalanceWallet,
  People,
  Analytics,
  Add,
  ArrowUpward,
  PeopleAlt,
  SupportAgent,
  AccountBalance,
  LocalShipping,
  Inventory2,
  ShoppingBag,
  FormatListNumbered,
  Paid,
  CheckCircleOutline
} from "@mui/icons-material";
import AccountTree from "@mui/icons-material/AccountTree";

import SectionHeader from "../common/Header";
import JobCardTable from "../common/JobCardTable";
import apiEndpoints from "../../apiconfig";
import { useLoading } from "../../pages/LoadingContext"
// Modern color palette
const COLORS = {
  primary: "#3B82F6",
  secondary: "#6366F1",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#8B5CF6",
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    purple: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
  }
};

// Map color names to solid hex for circle icons
const COLOR_MAP = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#8B5CF6",
};

const sampleAreaData = [
  { name: "Mon", value: 300 },
  { name: "Tue", value: 420 },
  { name: "Wed", value: 350 },
  { name: "Thu", value: 480 },
  { name: "Fri", value: 420 },
  { name: "Sat", value: 520 },
  { name: "Sun", value: 390 },
];

const sampleBarData = [
  { name: "Jan", sales: 20, views: 15 },
  { name: "Feb", sales: 5, views: 8 },
  { name: "Mar", sales: 60, views: 50 },
  { name: "Apr", sales: 10, views: 15 },
  { name: "May", sales: 28, views: 24 },
  { name: "Jun", sales: 18, views: 14 },
  { name: "Jul", sales: 22, views: 35 },
  { name: "Aug", sales: 12, views: 9 },
  { name: "Sep", sales: 30, views: 26 },
];

const donutData = [
  { name: "Monthly", value: 65127 },
  { name: "Remaining", value: 100000 - 65127 },
];

// Modern KPI Component — matches reference screenshot style
const ModernKPICard = ({
  icon,
  value,
  label,
  change,
  trend,
  color = "primary",
  route,
}) => {
  const navigate = useNavigate();
  const iconBg = COLOR_MAP[color] || "#3B82F6";
  return (
    <Card
      onClick={() => route && navigate(route)}
      sx={{
        height: "100%",
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
        border: "1px solid #F3F4F6",
        transition: "all 0.25s ease",
        cursor: route ? "pointer" : "default",
        "&:hover": { 
            boxShadow: "0 6px 24px rgba(0,0,0,0.1)",
            transform: route ? "translateY(-4px)" : "none"
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          {/* Left: value + label */}
          <Box>
            <Typography sx={{ fontSize: "13px", fontWeight: 500, color: "#6B7280", mb: 0.5 }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
              {value}
            </Typography>
            {change && (
              <Typography
                sx={{
                  mt: 1,
                  fontSize: "12px",
                  fontWeight: 500,
                  color: trend === "up" ? "#10B981" : trend === "down" ? "#EF4444" : "#6B7280",
                }}
              >
                {change}
              </Typography>
            )}
          </Box>
          {/* Right: colored circle icon */}
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              bgcolor: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              flexShrink: 0,
              ml: 2,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

ModernKPICard.propTypes = {
  icon: PropTypes.node,
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  change: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down']),
  color: PropTypes.string,
};

export default function Dashboard({ data }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const isTab = useMediaQuery(theme.breakpoints.down("md"));
  const [jobCards, setJobCards] = useState([]);
  const [jobLoading, setJobLoading] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState({
    monthlyAnalytics: [],
    yearlySales: 0,
    yearlyViews: 0,
  });
  const { show, hide } = useLoading();


  useEffect(() => {
    async function loadStats() {
      try {
        show(); // 🔥 global loader ON
        const token = sessionStorage.getItem("token");
        const res = await fetch(apiEndpoints.dashboard, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();
        setStats(result);
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        hide(); // 🔥 global loader OFF
      }
    }


    loadStats();
  }, []);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        show();
        const token = sessionStorage.getItem('token');
        const res = await fetch(
          `${apiEndpoints.dashboard}?analytics=sales_views`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        hide();
      }
    }

    loadAnalytics();
  }, []);




  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setJobLoading(false);
        const token = sessionStorage.getItem("token");
        const res = await fetch(apiEndpoints.JobCard, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to load job cards");
        const data = await res.json();
        if (!mounted) return;
        const transformed = (Array.isArray(data) ? data : []).map((it) => ({
          jobCardNo: it.jobcardNo,
          vehicleNo: it.registration_number,
          serviceType: it.service_type,
          customerName: it.customer_name,
          arrivalDate: it.arrival_date,
          estimateDate: it.estimate_date,
          status: it.status,
          vehicleName: it.vehicle_name,
          mobile: it.mobile,
        }));
        setJobCards(transformed);
      } catch (e) {
        console.error(e);
      } finally {
        setJobLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const handleNewJob = () => {
    navigate("/services-form", { state: { isNew: true } });
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Reset to first page when rows per page changes
  };

  // Get current page data
  const paginatedJobCards = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return jobCards.slice(startIndex, endIndex);
  }, [jobCards, page, rowsPerPage]);

  const getAreaHeight = () => (isSm ? 120 : 180);
  const getBarHeight = () => (isSm ? 200 : 280);

  const cfg = useMemo(
    () => ({
      customers: Number(stats?.customers ?? 0),
      vehicles: Number(stats?.vehicles ?? 0),
      totalEmployees: Number(stats?.totalEmployees ?? 0),
      revenueFY: Number(stats?.revenueFY ?? 0),

      availableVehicles: Number(stats?.availableVehicles ?? 0),
      approvalPending: Number(stats?.approvalPending ?? 0),
      workInProgress: Number(stats?.workInProgress ?? 0),
      workCompleted: Number(stats?.workCompleted ?? 0),
      stockQty: Number(stats?.stockQty ?? 0),
      stockAmount: Number(stats?.stockAmount ?? 0),
      totalUsers: Number(stats?.totalUsers ?? 0),
      activeUsers: Number(stats?.activeUsers ?? 0),

      // IMPORTANT FIX
      avgWeeklySales: Number(stats?.avgWeeklySales ?? 0),

      activeUsersPct:
        stats?.activeUsers && stats?.totalUsers
          ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
          : 0,
    }),
    [stats],
  );


  const salesChartData = useMemo(() => {
    return Array.isArray(stats?.monthlySales)
      ? stats.monthlySales
      : [];
  }, [stats]);

  const monthlyAnalyticsData = useMemo(() => {
    return Array.isArray(analytics?.monthlyAnalytics)
      ? analytics.monthlyAnalytics
      : [];
  }, [analytics]);



  // Modern KPI data
  const topKPIs = [
    {
      icon: <PeopleAlt />,
      value: Number(cfg.customers || 0).toLocaleString(),
      label: "Total Customers",
      change: "Registered customers",
      trend: "up",
      color: "primary",
    },
    {
      icon: <LocalShipping />,
      value: Number(cfg.vehicles || 0).toLocaleString(),
      label: "Total Vehicles",
      change: "Tracked vehicles",
      trend: "up",
      color: "info",
    },
    {
      icon: <SupportAgent />,
      value: Number(cfg.totalEmployees || 0).toLocaleString(),
      label: "Total Employees",
      change: "Active staff",
      trend: "neutral",
      color: "warning",
    },
    {
      icon: <AccountBalanceWallet />,
      value: `₹${Number(cfg.revenueFY || 0).toLocaleString()}`,
      label: "Revenue FY",
      change: "Financial year total",
      trend: "up",
      color: "success",
      // route: "/income",
    },
    {
      icon: <Inventory2 />,
      value: Number(cfg.availableVehicles || 0).toLocaleString(),
      label: "Available Vehicles",
      change: "Ready for service",
      trend: "neutral",
      color: "primary",
    },
    {
      icon: <AccountTree />,
      value: Number(cfg.approvalPending || 0).toLocaleString(),
      label: "Approval Pending",
      change: "Awaiting review",
      trend: "down",
      color: "warning",
    },
    {
      icon: <FormatListNumbered />,
      value: Number(cfg.workInProgress || 0).toLocaleString(),
      label: "Work In Progress",
      change: "Currently active",
      trend: "neutral",
      color: "info",
    },
    {
      icon: <CheckCircleOutline />,
      value: Number(cfg.workCompleted || 0).toLocaleString(),
      label: "Work Completed",
      change: "Jobs finished",
      trend: "up",
      color: "success",
    },
  ];



  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box sx={sx.root}>
      <SectionHeader />

      <Box component="main" sx={sx.main}>
        {/* Header */}
        <Box sx={sx.header}>
          {/* <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#111827", mb: 0.5 }}>
              Dashboard
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
              System overview and performance metrics.
            </Typography>
          </Box> */}
          <Button
            onClick={handleNewJob}
            variant="contained"
            startIcon={<Add />}
            sx={{ ...sx.primaryButton, ml: "auto" }}
          >
            New Job Card
          </Button>
        </Box>

        {/* Modern KPI Grid */}
        <Grid
          container
          spacing={3}
          sx={{ mb: 4, width: "100%", justifyContent: "space-between" }}
        >
          {topKPIs.map((kpi, index) => (
            <Grid
              key={index}
              size={{ xs: 12, sm: 6, md: 6, lg: 3 }}
              width={{ xs: "100%", sm: "47%", md: "47%", lg: "22%", xl: "23%" }}
            >
              <ModernKPICard {...kpi} />
            </Grid>
          ))}
        </Grid>

        {/* <Grid container spacing={3} width={"100%"} mb={4} justifyContent={'space-between'}>*/}
        {/* Sales Overview Card */}
        {/*<Grid item xs={12} lg={8} width={{ xs: '100%', sm: '60%', md: '60%', lg: '74%' }}>
            <Card sx={sx.primaryCard}>
              <CardContent>
                <Box sx={sx.cardHeader}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1F2937' }}>
                      Sales Performance
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      Monthly sales trends and analytics
                    </Typography>

                  </Box>
                  <Chip
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ArrowUpward sx={{ fontSize: 16 }} />
                        8.6% growth
                      </Box>
                    }
                    sx={{
                      bgcolor: alpha(COLORS.success, 0.1),
                      color: COLORS.success,
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },   // <<< KEY FIX
                    gap: { xs: 1, sm: 0 },
                    mb: 3,
                  }}
                >
                  <Typography variant="h3" sx={{ fontWeight: "bold", color: "#1F2937" }}>
                    ₹{Number(cfg.avgWeeklySales || 0).toLocaleString()}
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: "#6B7280",
                      fontWeight: 500,
                      mt: { xs: 1, sm: 0 },     // spacing when stacked
                    }}
                  >
                    Average Weekly Sales
                  </Typography>
                </Box>

                <Box sx={{ width: "100%", height: getAreaHeight() }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesChartData}>


                      <defs>
                        <linearGradient id="modernGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                      />

                      <Tooltip
                        contentStyle={sx.tooltip}
                      />
                      <Area
                        dataKey="value"
                        stroke={COLORS.primary}
                        fill="url(#modernGradient)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>*/}

        {/* Users Stats Sidebar */}
        {/*
          <Grid item xs={12} lg={4} width={{ xs: '100%', sm: '34%', md: '35%', lg: '23.5%' }} >
            <Grid item xs={12} md={4} lg={3} height={'100%'}>
              <Card sx={{ ...sx.statsCard, height: "100%" }}>
                <CardContent sx={{ p: 3 }}>

                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1F2937", mb: 2 }}>
                    Total Users
                  </Typography>

                  <Typography variant="h3" sx={{ fontWeight: "bold", color: COLORS.primary, mb: 1 }}>
                    {(cfg.totalUsers)}
                  </Typography>

                  <Box sx={{ height: 120, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{ v: 4 }, { v: 7 }, { v: 3 }, { v: 8 }, { v: 5 }]}>
                        <Bar
                          dataKey="v"
                          radius={[6, 6, 6, 6]}
                          fill={COLORS.primary}
                          barSize={14}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>

                  <Chip
                    label="+12.5% from last month"
                    size="small"
                    sx={{
                      bgcolor: alpha(COLORS.success, 0.1),
                      color: COLORS.success,
                      fontWeight: 600,
                      mt: 6,
                    }}
                  />

                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>*/}

        <Grid container spacing={2} justifyContent={"space-between"}>
          {/* Analytics Section */}
          <Grid
            item
            xs={12}
            lg={4}
            display={"flex"}
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent={"space-between"}
            gap={2}
            width={"100%"}
          >
            <Grid
              size={12}
              width={{ xs: "100%", sm: "100%", md: "100%", lg: "100%" }}
            >
              <Card sx={sx.primaryCard}>
                <CardContent>
                  <Box sx={sx.cardHeader}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#111827", fontSize: '1.125rem' }}
                        >
                          Sales & Views Analytics
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#6B7280" }}>
                          Annual summary of business reach and revenue
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.primary }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#4B5563' }}>Sales</Typography>
                         </Box>
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: COLORS.secondary }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#4B5563' }}>Views</Typography>
                         </Box>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ height: 320, mb: 1, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={monthlyAnalyticsData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
                        />
                        <Tooltip 
                            cursor={{ fill: '#F3F4F6' }}
                            contentStyle={{ 
                                borderRadius: '12px', 
                                border: 'none', 
                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                padding: '12px'
                            }} 
                        />
                        <Bar
                          dataKey="sales"
                          fill={COLORS.primary}
                          stackId="a"
                          barSize={24}
                          radius={[0, 0, 0, 0]}
                        />
                        <Bar
                          dataKey="views"
                          fill={COLORS.secondary}
                          stackId="a"
                          barSize={24}
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Metrics Cards */}
                  <Grid container spacing={3}>
                    <Grid
                      size={{ xs: 12, md: 6 }}
                      width={{ xs: "100%", md: "100%", lg: "47%" }}
                    >
                      <Card sx={sx.metricCard}>
                        <CardContent
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Box 
                            sx={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: '12px', 
                                bgcolor: alpha(COLORS.primary, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: COLORS.primary
                            }}
                          >
                            <TrendingUp fontSize="medium" />
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, display: 'block', mb: 0.5 }}>
                              MONTHLY REVENUE
                            </Typography>
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: "800", color: "#111827", lineHeight: 1 }}
                            >
                              {analytics.monthlyAnalytics
                                .reduce((sum, m) => sum + m.sales, 0)
                                .toLocaleString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid
                      size={{ xs: 12, md: 6 }}
                      width={{ xs: "100%", md: "100%", lg: "47%" }}
                    >
                      <Card sx={sx.metricCard}>
                        <CardContent
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Box 
                            sx={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: '12px', 
                                bgcolor: alpha(COLORS.info, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: COLORS.info
                            }}
                          >
                            <Analytics fontSize="medium" />
                          </Box>
                          <Box>
                            <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 600, display: 'block', mb: 0.5 }}>
                              ANNUAL REACH
                            </Typography>
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: "800", color: "#111827", lineHeight: 1 }}
                            >
                              {analytics.yearlySales.toLocaleString()}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Job Cards Table */}
          <Grid
            size={12}
            width={"100%"}
          >
            <Card sx={sx.primaryCard}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={sx.cardHeader}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#1F2937" }}
                  >
                    Recent Job Cards
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#6B7280" }}>
                    {jobCards.length} total jobs • Showing{" "}
                    {Math.min(paginatedJobCards.length, rowsPerPage)} of{" "}
                    {jobCards.length}
                  </Typography>
                </Box>
                {jobLoading ? (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", py: 4 }}
                  >
                    <Typography>Loading job cards...</Typography>
                  </Box>
                ) : jobCards.length ? (
                  <Box sx={{ mt: 2 }}>
                    <JobCardTable
                      jobCards={paginatedJobCards}
                      isMobile={isSm}
                      formatDate={formatDate}
                    />
                    {/* Pagination */}
                    <TablePagination
                      component="div"
                      count={jobCards.length}
                      page={page}
                      onPageChange={handleChangePage}
                      rowsPerPage={rowsPerPage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                      rowsPerPageOptions={[5, 10, 25, 50]}
                      sx={{
                        mt: 2,
                        "& .MuiTablePagination-toolbar": {
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                        },
                        "& .MuiTablePagination-selectLabel": {
                          mt: { xs: 1, sm: 0 },
                        },
                        "& .MuiTablePagination-displayedRows": {
                          mt: { xs: 1, sm: 0 },
                        },
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">
                      No job cards available.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

Dashboard.propTypes = {
  data: PropTypes.object,
};

// Modern Styles
const sx = {
  root: {
    minHeight: "100vh",
    background: "#F9FAFB",
    p: { xs: 1, sm: 2, md: 3 },
  },
  main: {
    maxWidth: 1400,
    margin: "0 auto",
    p: { xs: 2, sm: 3 },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: { xs: 'flex-start', sm: 'center' },
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 2,
    mb: 4,
  },
  primaryButton: {
    background: 'rgba(139, 92, 246, 0.9)',
    color: 'white',
    textTransform: 'none',
    borderRadius: 3,
    px: 4,
    py: 1.5,
    fontWeight: 'bold',
    fontSize: '1rem',
    '&:hover': {
      background: "rgba(139, 92, 246, 0.9)",
      transform: 'translateY(-2px)',
    },
    transition: 'all 0.3s ease',
  },
  primaryCard: {
    borderRadius: 3,
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    border: '1px solid rgba(0,0,0,0.04)',
    background: 'white',
    transition: 'all 0.3s ease',

  },
  statsCard: {
    borderRadius: 3,
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid rgba(0,0,0,0.03)',
    background: 'white',
    height: '100%',
    transition: 'all 0.3s ease',
  },
  metricCard: {
    borderRadius: 2,
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    border: '1px solid rgba(0,0,0,0.02)',
    background: 'white',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    },
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: { xs: 'flex-start', sm: 'center' },
    flexDirection: { xs: 'column', sm: 'row' },
    gap: 2,
    mb: 3,
  },
  tooltip: {
    background: 'white',
    border: 'none',
    borderRadius: 8,
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    padding: '12px 16px',
  },
}; 