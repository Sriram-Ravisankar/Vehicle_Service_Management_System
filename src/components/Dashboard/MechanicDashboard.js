import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Paper,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
} from "@mui/material";
import {
  Build,
  Schedule,
  CheckCircle,
  Add,
  InfoOutlined,
  PlayArrow,
  DoneAll,
  Description,
  TrendingUp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import apiEndpoints from "../../apiconfig";
import JobCardTable from "../common/JobCardTable";
import { useTheme, useMediaQuery } from "@mui/material";

const MechanicDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [invoiceDialog, setInvoiceDialog] = useState({ open: false, job: null });
  
  // New state for JobCardTable
  const [fullJobCards, setFullJobCards] = useState([]);
  const [fullJobLoading, setFullJobLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiEndpoints.report}?action=mechanic_dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error("Failed to fetch mechanic dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (jobs && jobs.length > 0) {
      loadDetailsForJobs(jobs);
    } else if (jobs && jobs.length === 0) {
      setFullJobCards([]);
    }
  }, [jobs]);

  const loadDetailsForJobs = async (jobList) => {
    try {
      setFullJobLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      const detailedJobs = await Promise.all(jobList.map(async (j) => {
        try {
          const res = await fetch(`${apiEndpoints.JobCard}?job_guid=${j.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          // Backend returns an array — pick first item
          const full = Array.isArray(data) ? data[0] : data;
          
          if (!full) return null;

          return {
            jobCardNo: full.jobcardNo || j.jobcardNo || "—",
            vehicleNo: full.registration_number || j.vehicle?.split(' (')[0] || j.vehicle || "—",
            customerName: full.customer_name || j.customer || "—",
            mobile: full.mobile || "—",
            arrivalDate: full.arrival_date || "",
            estimateDate: full.estimate_date || "",
            status: full.status || j.status || "—",
            serviceType: full.service_type || j.task || "—",
          };
        } catch (e) {
          console.error("Error fetching job detail:", e);
          return null;
        }
      }));

      setFullJobCards(detailedJobs.filter(Boolean));
    } catch (err) {
      console.error("Failed to load detailed job cards:", err);
    } finally {
      setFullJobLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedJobCards = fullJobCards.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleStatusUpdate = async (jobGuid, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiEndpoints.JobCard}?job_guid=${jobGuid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            status: newStatus,
            completed_date: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : null
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (newStatus === 'Completed') {
          // Find the job object to pass to dialog
          const completedJob = jobs.find(j => j.id === jobGuid);
          setInvoiceDialog({ open: true, job: completedJob });
        }
        fetchData(); // Refresh data
      }
    } catch (err) {
      console.error("Failed to update job status:", err);
    }
  };

  const handleConvertToInvoice = async () => {
    const jobGuid = invoiceDialog.job.id;
    const token = localStorage.getItem("token");
    
    try {
      // 1. Fetch full job card details first

      // 2. We need the linked quotation data for the invoice page
      const qRes = await fetch(`${apiEndpoints.Quotation}?job_guid=${jobGuid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const qData = await qRes.json();

      if (qData && qData.quotation_guid) {
        // Fetch full quotation
        const fullQRes = await fetch(`${apiEndpoints.Quotation}?quotation_guid=${qData.quotation_guid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const fullQ = await fullQRes.json();
        
        setInvoiceDialog({ open: false, job: null });
        navigate("/add-invoice", { state: { quotation: fullQ } });
      } else {
        alert("No quotation found for this job card. Please create a quotation first.");
      }
    } catch (err) {
      console.error("Error converting to invoice:", err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const getIcon = (label) => {
    if (label.includes("Assigned")) return <Build />;
    if (label.includes("Pending")) return <Schedule />;
    if (label.includes("Work In Progress")) return <TrendingUp />;
    return <CheckCircle />;
  };

  const getStatusBadgeColor = (status) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("approval") || s.includes("pending")) return "#f59e0b"; // Orange
    if (s.includes("progress") || s.includes("in")) return "#3b82f6"; // Blue
    if (s.includes("completed") || s.includes("done") || s.includes("delivered")) return "#10b981"; // Green
    return "#64748b"; // Gray fallback
  };

  return (
    <Box sx={styles.container}>
      {/* Header Section */}
      <Box sx={styles.header}>
        <Typography variant="h5" sx={styles.title}>
          Mechanic Dashboard
        </Typography>
        <Typography variant="body2" sx={styles.subtitle}>
          Welcome back, {localStorage.getItem("userName")}! Here are your assigned tasks for today.
        </Typography>
      </Box>

      {/* KPI Stats Grid - Using CSS Grid for perfect 100% width alignment */}
      <Box 
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)' 
          }, 
          gap: { xs: 2, md: 3 }, 
          mb: 5,
          width: "100%"
        }}
      >
        {stats.map((stat, index) => (
          <Card key={index} sx={styles.statCard}>
            <CardContent sx={styles.statContent}>
              <Box>
                <Typography sx={styles.statLabel}>
                  {stat.label}
                </Typography>
                <Typography sx={styles.statValue}>
                  {stat.value}
                </Typography>
              </Box>
              <Box sx={{ 
                ...styles.iconBox, 
                backgroundColor: `${stat.color}15`, 
                color: stat.color,
                boxShadow: `0 4px 10px -2px ${stat.color}20` 
              }}>
                {getIcon(stat.label)}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Current Active Tasks - Moved up as per "move to down" request (meaning the table moves down) */}
      {jobs.length > 0 && (
          <Box sx={{ mb: 4 }}>
             <Typography variant="h6" sx={{ ...styles.listTitle, mb: 2 }}>
                Current Active Tasks
             </Typography>
             {jobs.map((job) => (
                <Box key={job.id} sx={styles.jobRow}>
                  <Box sx={styles.jobInfo}>
                    <Avatar sx={styles.avatar}>{job.initials}</Avatar>
                    <Box sx={{ ml: 2, flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="subtitle1" sx={styles.customerName}>
                            {job.customer}
                          </Typography>
                         <Chip
                            label={job.status}
                            size="small"
                            sx={{
                              backgroundColor: getStatusBadgeColor(job.status) + "20",
                              color: getStatusBadgeColor(job.status),
                              fontWeight: "bold",
                              fontSize: "11px",
                              height: "20px",
                            }}
                          />
                        </Box>
                      </Box>
                      <Typography variant="body2" sx={styles.vehicleInfo}>
                        {job.vehicle}
                      </Typography>
                      <Typography variant="body2" sx={{ ...styles.vehicleInfo, color: "#1e293b", fontWeight: 600 }}>
                        Task: {job.task}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={styles.actions}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleStatusUpdate(job.id, job.status === "Work In Progress" ? "Completed" : "Work In Progress")}
                      startIcon={job.status === "Work In Progress" ? <DoneAll /> : <PlayArrow />}
                      sx={{
                        ...styles.actionButton,
                        backgroundColor: job.status === "Work In Progress" ? "#10b981" : "#3b82f6",
                        "&:hover": {
                          backgroundColor: job.status === "Work In Progress" ? "#059669" : "#2563eb",
                        },
                      }}
                    >
                      {job.status === "Work In Progress" ? "Complete Job" : "Start Job"}
                    </Button>

                    <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        startIcon={<Add />} 
                        sx={styles.secondaryButton}
                        onClick={() => navigate("/services-form", { state: { guid: job.id, isEditing: true, initialStep: 2 } })}
                      >
                        Parts
                      </Button>
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        startIcon={<InfoOutlined />} 
                        sx={styles.secondaryButton}
                        onClick={() => navigate("/services-form", { state: { guid: job.id, isEditing: false, initialStep: 0 } })}
                      >
                        Details
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ))}
          </Box>
      )}

      {/* Recent Job Cards Table (Moved down) */}
      <Paper sx={styles.listContainer}>
        <Box sx={styles.listHeader}>
          <Box>
            <Typography variant="h6" sx={styles.listTitle}>
              My Recent Job Cards
            </Typography>
            <Typography variant="body2" sx={{ color: "#6B7280" }}>
                {fullJobCards.length} assigned jobs • Showing {Math.min(paginatedJobCards.length, rowsPerPage)} of {fullJobCards.length}
            </Typography>
          </Box>
        </Box>
        <Divider />

        <Box sx={{ p: 2 }}>
          {fullJobLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : fullJobCards.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body1" color="textSecondary">
                No job cards found assigned to you.
              </Typography>
            </Box>
          ) : (
            <>
              <JobCardTable
                jobCards={paginatedJobCards}
                isMobile={isSm}
                formatDate={formatDate}
              />
              <TablePagination
                component="div"
                count={fullJobCards.length}
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
                }}
              />
            </>
          )}
        </Box>
      </Paper>

      {/* Convert to Invoice Dialog */}
      <Dialog
        open={invoiceDialog.open}
        onClose={() => setInvoiceDialog({ open: false, job: null })}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "20px", textAlign: "center" }}>
          🎉 Job Completed!
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography sx={{ color: "#64748b", mb: 2 }}>
            Great work! This job has been successfully marked as completed.
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            Would you like to convert this into an invoice now?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 3, px: 3, flexDirection: "column", gap: 1 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<Description />}
            onClick={handleConvertToInvoice}
            sx={{ 
                borderRadius: "10px", 
                backgroundColor: "#10b981", 
                "&:hover": { backgroundColor: "#059669" },
                fontWeight: 600,
                textTransform: "none",
                py: 1.5
            }}
          >
            Create Invoice
          </Button>
          <Button 
            fullWidth
            onClick={() => setInvoiceDialog({ open: false, job: null })}
            sx={{ fontWeight: 600, color: "#64748b", textTransform: "none" }}
          >
            Not Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const styles = {
  container: {
    padding: "16px",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
    width: "100%",
    boxSizing: "border-box",
    display: "block",
    "@media (min-width: 600px)": {
      padding: "24px",
    }
  },
  header: {
    marginBottom: "20px",
  },
  title: {
    fontWeight: 700,
    color: "#111827",
    marginBottom: "4px"
  },
  subtitle: {
    color: "#6B7280",
  },
  statCard: {
    borderRadius: "20px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)",
    border: "1px solid #E2E8F0",
    height: "100%",
    width: "100%",
    backgroundColor: "#fff",
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)'
    }
  },
  statContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px !important",
  },
  statLabel: {
    color: "#6B7280",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    fontSize: "13px",
    marginBottom: "4px",
    display: "block"
  },
  statValue: {
    fontWeight: 700,
    color: "#1E293B",
    fontSize: "28px",
    lineHeight: 1.2
  },
  iconBox: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& svg": {
      fontSize: "26px",
    },
  },
  listContainer: {
    borderRadius: "14px",
    boxShadow: "0 2px 10px -3px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  listHeader: {
    padding: "12px 16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  listTitle: {
    fontWeight: 800,
    color: "#1e293b",
    fontSize: "16px",
  },
  jobRow: {
    display: "flex",
    flexDirection: "column",
    padding: "12px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    border: "1px solid #f1f5f9",
    marginBottom: "8px",
    transition: "all 0.2s",
    "@media (min-width: 900px)": {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 16px",
    },
    "&:hover": {
      borderColor: "#cbd5e1",
      backgroundColor: "#fdfdfd",
    },
  },
  jobInfo: {
    display: "flex",
    alignItems: "center",
    flex: 1,
    marginBottom: "12px",
    "@media (min-width: 900px)": {
      marginBottom: 0,
    }
  },
  avatar: {
    backgroundColor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    color: "#334155",
    fontWeight: 800,
    width: "40px",
    height: "40px",
    fontSize: "15px",
  },
  customerName: {
    fontWeight: 800,
    color: "#0f172a",
    fontSize: "15px",
  },
  vehicleInfo: {
    color: "#64748b",
    fontSize: "12px",
    marginTop: "1px",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    "@media (min-width: 900px)": {
      flexDirection: "row",
      width: "auto",
    },
  },
  actionButton: {
    borderRadius: "8px",
    textTransform: "none",
    fontWeight: 700,
    padding: "8px 20px",
    fontSize: "13px",
    boxShadow: "none",
  },
  secondaryButton: {
    borderRadius: "8px",
    textTransform: "none",
    fontWeight: 700,
    padding: "7px 16px",
    fontSize: "13px",
    borderColor: "#e2e8f0",
    color: "#475569",
    "&:hover": {
      backgroundColor: "#f8fafc",
      borderColor: "#cbd5e1",
    },
  },
  detailsButton: {
    color: "#94a3b8",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "7px",
    "&:hover": {
        color: "#64748b",
        backgroundColor: "#f8fafc",
    }
  },
};

export default MechanicDashboard;
