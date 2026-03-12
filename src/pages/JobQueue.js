import React, { useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Menu, MenuItem, Typography, TextField, Box, Chip
} from "@mui/material";
import {
  MoreVert, PauseCircleFilled, PlayArrow, StopCircle, Replay,
  AccessTime, ArrowDropDown
} from "@mui/icons-material";

// Action options
const actions = [
  { label: "Start", icon: <PlayArrow sx={{ color: "green" }} />, color: "success" },
  { label: "Pause", icon: <PauseCircleFilled sx={{ color: "orange" }} />, color: "warning" },
  { label: "Resume", icon: <Replay sx={{ color: "blue" }} />, color: "info" },
  { label: "Stop", icon: <StopCircle sx={{ color: "red" }} />, color: "error" },
];

// Initial data with no endTime or duration
const initialData = [
  {
    id: 1, vehicleNumber: "4567HJI", jcNumber: "INT-J001471", service: "FENDER ASSY (LH) - Denting",
    employeeId: "001", technician: "Sai", startTime: "May 12 2022 13:55", endTime: "", duration: "", action: "Pause"
  },
  {
    id: 2, vehicleNumber: "4567HJI", jcNumber: "INT-J001471", service: "FENDER ASSY (LH) - R&R",
    employeeId: "", technician: "Noli", startTime: "May 12 2022 13:55", endTime: "", duration: "", action: "Pause"
  },
  {
    id: 3, vehicleNumber: "4567HJI", jcNumber: "INT-J001471", service: "FILTER, OIL - Change",
    employeeId: "", technician: "Noli", startTime: "", endTime: "", duration: "", action: "Start"
  },
  {
    id: 4, vehicleNumber: "7623UAE", jcNumber: "INT-J001467", service: "NORMAL CHECK UP",
    employeeId: "", technician: "Josef", startTime: "May 11 2022 14:28", endTime: "", duration: "", action: "Pause"
  },
  {
    id: 5, vehicleNumber: "7623UAE", jcNumber: "INT-J001467", service: "BRAKE PAD",
    employeeId: "", technician: "Dinesh", startTime: "", endTime: "", duration: "", action: "Start"
  },
  {
    id: 6, vehicleNumber: "9809UAE", jcNumber: "INT-J001455", service: "PAINTING MATERIAL",
    employeeId: "", technician: "Josef", startTime: "May 06 2022 05:55", endTime: "", duration: "", action: "Pause"
  },
  {
    id: 7, vehicleNumber: "9809UAE", jcNumber: "INT-J001455", service: "CERAMIC ULTRA COATING",
    employeeId: "", technician: "Muhammad", startTime: "", endTime: "", duration: "", action: "Start"
  },
];

const TimeTrackerTable = () => {
  const [rows, setRows] = useState(initialData);
  const [anchorEls, setAnchorEls] = useState({});

  const handleClick = (event, id) => {
    setAnchorEls({ ...anchorEls, [id]: event.currentTarget });
  };

  const handleClose = (id) => {
    setAnchorEls({ ...anchorEls, [id]: null });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: true
    });
  };

  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    const minutes = Math.floor((diffMs / 1000 / 60) % 60);
    const hours = Math.floor((diffMs / 1000 / 60 / 60));
    return `${hours}h ${minutes}m`;
  };

  const handleActionSelect = (id, actionLabel) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, action: actionLabel };

          if (actionLabel === "Start") {
            updatedRow.startTime = getCurrentTime();
            updatedRow.endTime = "";
            updatedRow.duration = "";
          } else if (actionLabel === "Stop") {
            updatedRow.endTime = getCurrentTime();
            if (updatedRow.startTime) {
              updatedRow.duration = calculateDuration(updatedRow.startTime, updatedRow.endTime);
            }
          }

          return updatedRow;
        }
        return row;
      })
    );
    handleClose(id);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Top Header with Icon */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <AccessTime sx={{ mr: 1 }} />
        <Typography variant="h6">Time Tracker</Typography>
      </Box>

      {/* Job Queue & Filters */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
        <Typography sx={{ color: "blue", fontWeight: "bold" }}>Job Queue</Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 14 }}>Not Completed</Typography>
          <ArrowDropDown sx={{ color: "blue" }} />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField label="Technician Name" variant="outlined" size="small" />
          <ArrowDropDown sx={{ color: "blue" }} />
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
            <TableRow>
              <TableCell sx={{ color: "blue", fontWeight: "bold" }}>Vehicle Number</TableCell>
              <TableCell sx={{ color: "blue", fontWeight: "bold" }}>JC Number</TableCell>
              <TableCell sx={{ color: "blue", fontWeight: "bold" }}>Service</TableCell>
              <TableCell sx={{ color: "blue", fontWeight: "bold" }}>Employee ID</TableCell>
              <TableCell sx={{ color: "blue", fontWeight: "bold" }}>Technician</TableCell>
              <TableCell sx={{ color: "blue", fontWeight: "bold" }}>Start Time</TableCell>
              <TableCell sx={{ color: "blue", fontWeight: "bold" }}>End Time</TableCell>
              <TableCell sx={{ color: "blue", fontWeight: "bold" }}>Duration</TableCell>
              <TableCell sx={{ color: "blue", fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const actionObj = actions.find((a) => a.label === row.action);
              return (
                <TableRow key={row.id}>
                  <TableCell>{row.vehicleNumber}</TableCell>
                  <TableCell>{row.jcNumber}</TableCell>
                  <TableCell>{row.service}</TableCell>
                  <TableCell>{row.employeeId}</TableCell>
                  <TableCell>{row.technician}</TableCell>
                  <TableCell sx={{ color: "green" }}>{row.startTime || "-"}</TableCell>
                  <TableCell sx={{ color: "red" }}>{row.endTime || "-"}</TableCell>
                  <TableCell>{row.duration || "-"}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.action}
                      icon={actionObj?.icon}
                      color={actionObj?.color}
                      onClick={(e) => handleClick(e, row.id)}
                      clickable
                      size="small"
                    />
                    <Menu
                      anchorEl={anchorEls[row.id]}
                      open={Boolean(anchorEls[row.id])}
                      onClose={() => handleClose(row.id)}
                    >
                      {actions.map((action) => (
                        <MenuItem
                          key={action.label}
                          onClick={() => handleActionSelect(row.id, action.label)}
                        >
                          {action.icon}&nbsp;{action.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TimeTrackerTable;