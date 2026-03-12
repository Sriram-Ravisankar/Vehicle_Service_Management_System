import React, { useEffect, useState } from "react";
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
import apiEndpoints from "../../apiconfig";
import { useLoading } from "../../pages/LoadingContext";

const COLORS = [
  "rgba(229, 56, 53, 0.5)",
  "rgba(0, 171, 193, 0.5)",
  "rgba(255, 179, 0, 0.5)",
  "rgba(67, 160, 71, 0.5)",
  "rgba(30, 136, 229, 0.5)",
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

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        show();
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
        hide();
      }
    };

    fetchDashboard();
  }, []);

  const getColumns = () => {
    if (width < 640) return 1;
    if (width < 992) return 2;
    return 3;
  };

  const columns = getColumns();
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
      width < 640 ? "1fr" : width < 992 ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
    gap: 20,
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

  const statRow = {
    display: "grid",
    gridTemplateColumns:
      width < 640 ? "1fr" : width < 992 ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 12,
  };

  const statCard = {
    background: "rgba(249, 115, 22, 0.8)",
    borderRadius: 12,
    padding: 18,
    color: "#fff",
    minHeight: 110,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    boxShadow: "0 12px 28px rgba(16,170,223,0.14)",
  };

  const statNumber = { fontSize: 24, fontWeight: 800, margin: 0 };
  const statLabel = {
    fontSize: 13,
    opacity: 0.95,
    marginTop: 6,
    fontWeight: 600,
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
  
  // Process productTypeData - converting string values to numbers
  const productTypeData = dashboard?.productTypeData?.map(item => ({
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
    productTypeData.length > 0 || 
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
      <div style={{ ...statRow, marginBottom: 24 }}>
        <div
          style={{
            ...statCard,
          }}
          onMouseEnter={() => setHovered("totalProfit")}
          onMouseLeave={() => setHovered(null)}
        >
          <div style={{ fontSize: 12, opacity: 0.95, fontWeight: 700 }}>
            Total Profit
          </div>
          <div style={statNumber}>₹{estimatedProfit.toLocaleString()}</div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
            Total Revenue: ₹{totalRevenue.toLocaleString()}
          </div>
        </div>

        <div
          style={{ ...statCard}}
          onMouseEnter={() => setHovered("totalRevenue")}
          onMouseLeave={() => setHovered(null)}
        >
          <div style={{ fontSize: 12, opacity: 0.95, fontWeight: 700 }}>
            Total Revenue
          </div>
          <div style={statNumber}>₹{totalRevenue.toLocaleString()}</div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>
            Total Purchase: ₹{totalPurchase.toLocaleString()}
          </div>
        </div>

        <div
          style={{ ...statCard}}
          onMouseEnter={() => setHovered("totalQty")}
          onMouseLeave={() => setHovered(null)}
        >
          <div style={{ fontSize: 12, opacity: 0.95, fontWeight: 700 }}>
            Total Products
          </div>
          <div style={statNumber}>{totalCurrentQuantity.toLocaleString()}</div>
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.9 }}>Units in inventory</div>
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
                  <div style={sectionSub}>Total: ₹{totalRevenue.toLocaleString()}</div>
                </div>
                <div style={{ minWidth: 140, textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    {productLineData.length} categories
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

          {/* Product Type Bar Chart */}
          {productTypeData.length > 0 && (
            <div
              style={{
                ...cardBase,
              }}
              onMouseEnter={() => setHovered("productType")}
              onMouseLeave={() => setHovered(null)}
            >
              <h3 style={sectionTitle}>Revenue by Product Type</h3>
              <div style={{ ...sectionSub, marginBottom: 12 }}>
                {productTypeData.length} product types
              </div>

              <div style={{ flex: 1, minHeight: width < 640 ? 160 : 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productTypeData}
                    layout="vertical"
                    margin={{ left: 8, right: 8 }}
                  >
                    <XAxis 
                      type="number" 
                      tick={{ fill: "#6b7280" }}
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={width < 640 ? 70 : 100}
                      tick={{ fontSize: width < 640 ? 11 : 13 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                      labelFormatter={(label) => `Product Type: ${label}`}
                    />
                    <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                      {productTypeData.map((entry, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
                Total: ₹{productTypeData.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
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
                      stroke="#00ACC1"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      animationDuration={800}
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
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{ width: 90, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                    Revenue
                  </div>
                  <div style={{ flex: 1, height: 12, borderRadius: 8, background: "#eef2f7", overflow: "hidden" }}>
                    <div style={{ 
                      width: "100%", 
                      height: "100%", 
                      background: "#00ACC1",
                      borderRadius: 8 
                    }} />
                  </div>
                  <div style={{ width: 40, textAlign: "right", fontSize: 13, color: "#374151" }}>
                    ₹{totalRevenue.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{ width: 90, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                    Purchase
                  </div>
                  <div style={{ flex: 1, height: 12, borderRadius: 8, background: "#eef2f7", overflow: "hidden" }}>
                    <div style={{ 
                      width: `${totalPurchase > 0 ? (totalPurchase / totalRevenue * 100) : 0}%`, 
                      height: "100%", 
                      background: "#E53935",
                      borderRadius: 8 
                    }} />
                  </div>
                  <div style={{ width: 40, textAlign: "right", fontSize: 13, color: "#374151" }}>
                    ₹{totalPurchase.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{ width: 90, fontSize: 13, fontWeight: 600, color: "#374151" }}>
                    Profit
                  </div>
                  <div style={{ flex: 1, height: 12, borderRadius: 8, background: "#eef2f7", overflow: "hidden" }}>
                    <div style={{ 
                      width: `${estimatedProfit > 0 ? (estimatedProfit / totalRevenue * 100) : 0}%`, 
                      height: "100%", 
                      background: "#43A047",
                      borderRadius: 8 
                    }} />
                  </div>
                  <div style={{ width: 40, textAlign: "right", fontSize: 13, color: "#374151" }}>
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