import React from "react";
import { useState } from "react";
import {
  Box,
  Typography,
  Collapse,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import logo from "../assets/logo2.png";

const JobCard = ({ formData, setFormData }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = React.useState("");
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToInvoice = () => {
    const jobWithUpdates = {
      ...formData,
      id: formData.id || Date.now(),
      status: "In Progress",
    };

    // Save only this job
    localStorage.setItem("currentJob", JSON.stringify(jobWithUpdates));

    navigate("/main-layout", {
      state: {
        jobData: jobWithUpdates,
        isNewJob: !formData.id,
      },
    });
  };

  return (
    <Box sx={styles.container}>
      {/* Step Title */}
      <Typography sx={styles.stepIndicator}>
        <Box sx={styles.divider} />
      </Typography>

      <Box sx={styles.topSection}>
        <Box sx={styles.left}>
          <Typography variant="h5" sx={styles.systemName}>
            Garage Management System
          </Typography>
          <Box sx={styles.companyInfo}>
            <Box sx={styles.logoContainer}>
              <img src={logo} alt="Logo" style={styles.logo} />
            </Box>
            <Box>
              <Box sx={styles.infoRow}>
                <LocationOnIcon fontSize="small" />
                <Typography sx={styles.companyText}>
                  Dasinfomedia, A-206, Shapath Hexa, Ahmedabad, Gujarat, India
                </Typography>
              </Box>
              <Box sx={styles.infoRow}>
                <EmailIcon fontSize="small" />
                <Typography sx={styles.companyText}>
                  dhara@dasinfomedia.com
                </Typography>
              </Box>
              <Box sx={styles.infoRow}>
                <PhoneIcon fontSize="small" />
                <Typography sx={styles.companyText}>1234567890</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right Side: Job Card Fields */}
        <Box sx={styles.right}>
          <Box sx={styles.jobCardField}>
            <Typography sx={styles.jobCardLabel}>Job Card No.*</Typography>
            <TextField
              name="jobCardNo"
              value={formData.jobCardNo}
              onChange={handleChange}
              variant="outlined"
              size="small"
              fullWidth
              sx={styles.editableField}
              disabled
            />
          </Box>
          <Box sx={styles.jobCardField}>
            <Typography sx={styles.jobCardLabel}>In Date/Time*</Typography>
            <TextField
              name="inDateTime"
              value={formData.inDateTime}
              onChange={handleChange}
              variant="outlined"
              size="small"
              type="datetime-local"
              fullWidth
              sx={styles.editableField}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={styles.jobCardField}>
            <Typography sx={styles.jobCardLabel}>
              Expected Out Date/Time
            </Typography>
            <TextField
              name="expectedOutDateTime"
              value={formData.expectedOutDateTime}
              onChange={handleChange}
              variant="outlined"
              size="small"
              type="datetime-local"
              fullWidth
              sx={styles.editableField}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </Box>
      </Box>
      <Box sx={styles.divider} />

      {/* Customer & Vehicle Details Section */}
      <Box sx={styles.detailsSection}>
        {/* Customer Details */}
        <Box sx={styles.detailGroup}>
          <Typography sx={styles.sectionTitle}>Customer Details</Typography>
          <Box sx={styles.divider} />
          <Box sx={styles.inputRow}>
            <Typography sx={styles.inputLabel}>Name:</Typography>
            <TextField
              name="customerName"
              label="Customer Name*"
              value={formData.customerName}
              onChange={handleChange}
              variant="outlined"
              size="small"
              fullWidth
              sx={styles.editableField}
              required
            />
          </Box>
          <Box sx={styles.inputRow}>
            <Typography sx={styles.inputLabel}>Address:</Typography>
            <TextField
              name="customerAddress"
              value={formData.customerAddress}
              onChange={handleChange}
              variant="outlined"
              size="small"
              fullWidth
              sx={styles.editableField}
            />
          </Box>
          <Box sx={styles.inputRow}>
            <Typography sx={styles.inputLabel}>Contact No:</Typography>
            <TextField
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              variant="outlined"
              size="small"
              fullWidth
              sx={styles.editableField}
            />
          </Box>
          <Box sx={styles.inputRow}>
            <Typography sx={styles.inputLabel}>Email:</Typography>
            <TextField
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              variant="outlined"
              size="small"
              fullWidth
              sx={styles.editableField}
            />
          </Box>
        </Box>

        {/* Vehicle Details */}
        <Box sx={styles.detailGroup}>
          <Typography sx={styles.sectionTitle}>Vehicle Details</Typography>
          <Box sx={styles.divider} />
          <Box sx={styles.inputRow}>
            <Typography sx={styles.inputLabel}>Model Name:</Typography>
            <TextField
              name="model"
              value={formData.model}
              onChange={handleChange}
              variant="outlined"
              size="small"
              fullWidth
              sx={styles.editableField}
            />
          </Box>
        </Box>
      </Box>

      {/* Observation List */}
      <Box
        sx={{
          ...styles.observationBox,
          "&:hover": {
            "& .MuiSvgIcon-root, & .MuiTypography-root": {
              color: "#f26522",
            },
          },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {expanded ? (
            <RemoveIcon sx={{ fontSize: "20px", fontWeight: "bold", mr: 1 }} />
          ) : (
            <AddIcon sx={{ fontSize: "20px", fontWeight: "bold", mr: 1 }} />
          )}
          <Typography sx={{ fontSize: "16px" }}>Observation Points</Typography>
        </Box>
      </Box>

      {/* Collapsible Observation Content */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ mt: 2 }}>
          {/* Dropdown */}
          <Box
            sx={{ display: "flex", alignItems: "center", gap: "10px", mb: 2 }}
          >
            <Typography>Select Checkpoints:</Typography>
            <Select
              value={selectedCheckpoint}
              onChange={(e) => setSelectedCheckpoint(e.target.value)}
              displayEmpty
              sx={{ minWidth: 300 }}
            >
              <MenuItem value="">Select checkpoints</MenuItem>
              <MenuItem value="checkpoint1">Checkpoint 1</MenuItem>
              <MenuItem value="checkpoint2">Checkpoint 2</MenuItem>
            </Select>
          </Box>

          {/* Table */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Observation Point</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{/* Dynamic rows will go here */}</TableBody>
          </Table>
        </Box>
      </Collapse>

      {/* Navigation Buttons */}
      <Grid container spacing={2} sx={{ mt: 4, justifyContent: "flex-end" }}>
        <Grid item xs={6}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleProceedToInvoice}
            sx={{
              py: 1.5,
              textTransform: "none",
              backgroundColor: "#10AADF",
              "&:hover": {
                backgroundColor: "#001E61",
              },
            }}
          >
            Next
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const styles = {
  container: {
    padding: "20px",
    fontFamily: "Monteserrat",
    margin: "auto",
  },
  divider: {
    width: "100%",
    height: "1px",
    backgroundColor: "#ccc",
    mt: "3px",
    margin: "10px 0",
  },
  stepIndicator: {
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#000",
    fontSize: "20px",
  },
  topSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "30px",
    flexWrap: "wrap",
  },
  left: {
    flex: 1.5,
  },
  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  systemName: {
    fontWeight: "bold",
    color: "#222",
    marginBottom: "15px",
  },
  companyInfo: {
    display: "flex",
    gap: "15px",
    alignItems: "flex-start",
    backgroundColor: "#f5f5f5",
    padding: "15px",
    borderRadius: "6px",
  },
  logoContainer: {
    width: "250px",
  },
  logo: {
    width: "100%",
  },
  companyTitle: {
    fontWeight: "bold",
    color: "#333",
    marginBottom: "6px",
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    marginBottom: "4px",
  },
  companyText: {
    fontSize: "14px",
    color: "#555",
  },
  jobCardField: {
    display: "flex",
    flexDirection: "column",
  },
  jobCardLabel: {
    fontWeight: "bold",
    fontSize: "14px",
    color: "#222",
    marginBottom: "5px",
  },
  editableField: {
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#ccc",
      },
      "&:hover fieldset": {
        borderColor: "#f26522",
      },
    },
    "& .MuiInputBase-input": {
      padding: "8px 10px",
      fontSize: "14px",
      backgroundColor: "#f9f9f9",
    },
  },
  detailsSection: {
    display: "flex",
    justifyContent: "space-between",
    gap: "30px",
    marginTop: "30px",
    flexWrap: "wrap",
  },
  detailGroup: {
    flex: 1,
    minWidth: "300px",
    marginBottom: "20px",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: "16px",
    color: "#222",
    margin: "10px 0",
    display: "inline-block",
    textTransform: "capitalize",
  },
  inputRow: {
    display: "flex",
    alignItems: "center",
    margin: "12px 0",
    gap: "10px",
  },
  inputLabel: {
    width: "100px",
    fontWeight: "500",
    color: "#444",
    fontSize: "14px",
  },
  observationTitle: {
    marginTop: "30px",
    fontWeight: "bold",
    fontSize: "20px",
    color: "#222",
  },
  observationBox: {
    backgroundColor: "#f5f5f5",
    padding: "10px",
    marginTop: "10px",
    border: "1px solid #ddd",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      borderColor: "#f26522",
    },
  },
  expandableContent: {
    padding: "20px",
    border: "1px solid #ddd",
    borderTop: "none",
    backgroundColor: "#fff",
    transition: "all 0.3s ease",
  },
  submitButton: {
    backgroundColor: "#ec6f05",
    color: "#fff",
    padding: "10px 30px",
    border: "none",
    borderRadius: "2px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    "&:hover": {
      backgroundColor: "#d75e00",
    },
  },
};

export default JobCard;
