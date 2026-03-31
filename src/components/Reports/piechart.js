import React, { useEffect, useState, useCallback } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import apiEndpoints from "../../apiconfig";
import { useLoading } from "../../pages/LoadingContext";
import useAutoRefresh from "../../hooks/useAutoRefresh";

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#6366f1", // Indigo
  "#f59e0b", // Amber
  "#ec4899", // Pink
];

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function GraphDashboard() {
  const { show, hide } = useLoading();
  const [dashboard, setDashboard] = useState(null);
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fetchDashboard = React.useCallback(async () => {
    try {
      // show();
      const token = sessionStorage.getItem("token");
      const res = await fetch(`${apiEndpoints.report}?action=dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setDashboard(data);
      } else {
        setDashboard(null);
      }
    } catch (err) {
      console.error("Dashboard API error:", err);
      setDashboard(null);
    } finally {
      // hide();
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useAutoRefresh(fetchDashboard);


  const cardHeight = width < 640 ? 280 : width < 992 ? 320 : 360;

  const page = {
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
    background: "linear-gradient(180deg, rgba(247,250,252,0.95), rgba(245,247,250,0.98))",
    minHeight: "100vh",
    boxSizing: "border-box",
    fontFamily: `Montserrat`,
    color: "#111827",
  };

  const grid = {
    display: "grid",
    gridTemplateColumns:
      width < 800 ? "1fr" : "repeat(2, 1fr)",
    gap: 24,
    alignItems: "stretch",
  };

  const cardBase = {
    background: "#ffffff",
    borderRadius: 14,
    padding: 18,
    boxShadow: "0 8px 28px rgba(2,6,23,0.06)",
    border: "1px solid rgba(15,23,42,0.04)",
    transition: "transform 180ms ease, box-shadow 180ms ease",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  };


  const statCard = () => {
    return {
      background: "#ffffff",
      borderRadius: 16,
      padding: "20px 24px",
      color: "#0f172a",
      minHeight: 110,
      display: "flex",
      alignItems: "center",
      gap: 20,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      border: "1px solid #f1f5f9",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      cursor: "pointer",
    };
  };

  const iconContainer = (color) => ({
    width: 56,
    height: 56,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `${color}15`, // 15% opacity
    color: color,
  });

  const statNumber = { fontSize: 24, fontWeight: 800, margin: 0, color: "#0f172a" };
  const statLabel = {
    fontSize: 13,
    color: "#64748b",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 4,
  };

  const sectionTitle = {
    fontSize: 15,
    fontWeight: 700,
    margin: 0,
    color: "#0f172a",
  };
  const sectionSub = { fontSize: 12, color: "#64748b", marginTop: 6 };

  const colorBox = (c) => ({
    width: 16,
    height: 16,
    borderRadius: 4,
    background: c,
    flexShrink: 0,
  });

  // Safely extract data from dashboard response
  const totalRevenue = dashboard ? Number(dashboard.totalRevenue || 0) : 0;
  const estimatedProfit = dashboard ? Number(dashboard.estimatedProfit || 0) : 0;
  const totalCurrentQuantity = dashboard ? Number(dashboard.totalProductQuantity || 0) : 0;
  const totalPurchase = dashboard ? Number(dashboard.totalPurchase || 0) : 0;
  
  // Process productLineData - converting string values to numbers
  const productLineData = dashboard?.productLineData?.map(item => ({
    name: item.name || "Unknown",
    value: parseFloat(item.value) || 0
  })) || [];
  
  // Process supplierSpendData
  const supplierSpendData = dashboard?.supplierSpendData?.map(item => ({
    name: item.name || "Unknown",
    value: parseFloat(item.value) || 0
  })) || [];
  
  // Prepare monthly trend data
  const trendData = dashboard?.trendData || [];
  const paddedLineData = MONTHS.map((month) => {
    const found = trendData.find((d) => d.period === month);
    return {
      period: month,
      Revenue: found ? parseFloat(found.revenue) || 0 : 0,
    };
  });

  // Check if any chart has data
  const hasChartData = 
    productLineData.length > 0 || 
    supplierSpendData.length > 0 || 
    paddedLineData.some(item => item.Revenue > 0);

  if (!dashboard) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "60vh",
        fontSize: "16px",
        color: "#64748b"
      }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div style={page}>
      {/* Statistics Cards */}
      <div style={{ 
        display: "grid",
        gridTemplateColumns: width < 640 ? "1fr" : width < 1024 ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
        gap: 20,
        marginBottom: 32 
      }}>
        <div style={statCard()}>
          <div style={iconContainer("#10b981")}>
            <TrendingUpIcon sx={{ fontSize: 32 }} />
          </div>
          <div>
            <div style={statLabel}>Total Profit</div>
            <div style={statNumber}>₹{estimatedProfit.toLocaleString()}</div>
          </div>
        </div>

        <div style={statCard()}>
          <div style={iconContainer("#3b82f6")}>
            <AttachMoneyIcon sx={{ fontSize: 32 }} />
          </div>
          <div>
            <div style={statLabel}>Total Revenue</div>
            <div style={statNumber}>₹{totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        <div style={statCard()}>
          <div style={iconContainer("#ef4444")}>
            <ShoppingCartIcon sx={{ fontSize: 32 }} />
          </div>
          <div>
            <div style={statLabel}>Total Purchase</div>
            <div style={statNumber}>₹{totalPurchase.toLocaleString()}</div>
          </div>
        </div>

        <div style={statCard()}>
          <div style={iconContainer("#6366f1")}>
            <InventoryIcon sx={{ fontSize: 32 }} />
          </div>
          <div>
            <div style={statLabel}>Total Products</div>
            <div style={statNumber}>{totalCurrentQuantity.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      {!hasChartData ? (
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px",
          background: "#ffffff",
          borderRadius: "14px",
          margin: "20px 0",
          boxShadow: "0 8px 28px rgba(2,6,23,0.06)"
        }}>
          <div style={{ fontSize: "16px", color: "#64748b", marginBottom: "10px" }}>
            No chart data available
          </div>
          <div style={{ fontSize: "14px", color: "#94a3b8" }}>
            Chart data will appear when available
          </div>
        </div>
      ) : (
        <div style={grid}>
          {/* Pie Chart - Product Lines */}
          {productLineData.length > 0 && (
            <div
              style={{ ...cardBase}}
              onMouseEnter={() => setHovered("revenue")}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}>
                <div>
                  <h3 style={sectionTitle}>Revenue by Category</h3>
                  <div style={sectionSub}>Total Distributed: ₹{totalRevenue.toLocaleString()}</div>
                </div>
                <div style={{ minWidth: 100, textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "#0ea5e9", fontWeight: 700 }}>
                    {productLineData.length} SECMENTS
                  </div>
                </div>
              </div>

              <div style={{ height: cardHeight - 120, marginTop: 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productLineData}
                      innerRadius={width < 640 ? 40 : 56}
                      outerRadius={width < 640 ? 70 : 86}
                      paddingAngle={6}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {productLineData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div style={{
                marginTop: 12,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
              }}>
                {productLineData.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={colorBox(COLORS[i])} />
                    <div style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>
                      {p.name}: ₹{p.value.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Suppliers Bar Chart */}
          {supplierSpendData.length > 0 && (
            <div
              style={{
                ...cardBase,
              }}
              onMouseEnter={() => setHovered("supplierSpend")}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={sectionTitle}>Supplier Purchases</h3>
                  <div style={sectionSub}>Last 5 main suppliers</div>
                </div>
                <div style={{ textAlign: "right", fontSize: 12, color: "#ef4444", fontWeight: 700 }}>
                  Top Vendors
                </div>
              </div>

              <div style={{ flex: 1, minHeight: 220, marginTop: 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={supplierSpendData}
                    layout="vertical"
                    margin={{ left: 10, right: 30, top: 10, bottom: 10 }}
                  >
                    <XAxis 
                      type="number" 
                      hide
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 12, fontWeight: 600, fill: "#4b5563" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Total Spend']}
                      contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                      {supplierSpendData.map((entry, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
                Total Cost: ₹{totalPurchase.toLocaleString()}
              </div>
            </div>
          )}

          {/* Line Chart - Revenue Trends */}
          {paddedLineData.length > 0 && (
            <div
              style={{
                ...cardBase,
                minHeight: cardHeight,
              }}
              onMouseEnter={() => setHovered("lineChart")}
              onMouseLeave={() => setHovered(null)}
            >
              <h3 style={sectionTitle}>Monthly Revenue Trend</h3>
              <div style={{ ...sectionSub, marginBottom: 12 }}>
                {trendData.length} months of data
              </div>

              <div style={{ flex: 1, minHeight: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={paddedLineData}>
                    <XAxis dataKey="period" tick={{ fill: "#6b7280" }} />
                    <YAxis 
                      tick={{ fill: "#6b7280" }}
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                      labelFormatter={(label) => `Month: ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="Revenue"
                      stroke="#0ea5e9"
                      strokeWidth={4}
                      dot={{ r: 5, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 8, fill: "#0ea5e9", stroke: "#fff", strokeWidth: 2 }}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
                Shows revenue across {MONTHS.length} months
              </div>
            </div>
          )}

          {/* Profit Calculation Card */}
          <div
            style={{ ...cardBase }}
            onMouseEnter={() => setHovered("profitCalc")}
            onMouseLeave={() => setHovered(null)}
          >
            <h3 style={sectionTitle}>Profit Calculation</h3>
            <div style={{ ...sectionSub, marginBottom: 12 }}>
              Revenue - Purchase = Profit
            </div>

            <div style={{ marginTop: 6 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 80, fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Revenue
                  </div>
                  <div style={{ flex: 1, height: 10, borderRadius: 10, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ 
                      width: "100%", 
                      height: "100%", 
                      background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                      borderRadius: 10 
                    }} />
                  </div>
                  <div style={{ width: 70, textAlign: "right", fontSize: 13, color: "#0f172a", fontWeight: 700 }}>
                    ₹{totalRevenue.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 80, fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Purchase
                  </div>
                  <div style={{ flex: 1, height: 10, borderRadius: 10, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ 
                      width: `${totalPurchase > 0 ? (Math.min(totalPurchase / totalRevenue * 100, 100)) : 0}%`, 
                      height: "100%", 
                      background: "linear-gradient(90deg, #ef4444, #f87171)",
                      borderRadius: 10 
                    }} />
                  </div>
                  <div style={{ width: 70, textAlign: "right", fontSize: 13, color: "#0f172a", fontWeight: 700 }}>
                    ₹{totalPurchase.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 80, fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Profit
                  </div>
                  <div style={{ flex: 1, height: 10, borderRadius: 10, background: "#f1f5f9", overflow: "hidden" }}>
                    <div style={{ 
                      width: `${estimatedProfit > 0 ? (Math.min(estimatedProfit / totalRevenue * 100, 100)) : 0}%`, 
                      height: "100%", 
                      background: "linear-gradient(90deg, #10b981, #34d399)",
                      borderRadius: 10 
                    }} />
                  </div>
                  <div style={{ width: 70, textAlign: "right", fontSize: 13, color: "#0f172a", fontWeight: 700 }}>
                    ₹{estimatedProfit.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "auto", fontSize: 13, color: "#6b7280" }}>
              Profit Margin: {totalRevenue > 0 ? ((estimatedProfit / totalRevenue) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}