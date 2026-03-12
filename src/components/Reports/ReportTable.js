import React from "react";
import { FiInbox, FiEdit2, FiTrash2, FiMoreVertical } from "react-icons/fi";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";

const ReportTable = ({ columns = [], data = [], onCheckChange, onDelete }) => {
  const [anchorEls, setAnchorEls] = React.useState({});

  const handleCheckboxChange = (index) => {
    if (onCheckChange) {
      onCheckChange(index);
    }
  };

  const handleMenuOpen = (event, rowIndex) => {
    setAnchorEls((prev) => ({ ...prev, [rowIndex]: event.currentTarget }));
  };

  const handleMenuClose = (rowIndex) => {
    setAnchorEls((prev) => ({ ...prev, [rowIndex]: null }));
  };

  return (
    <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
      <Table sx={{ minWidth: 650 }} aria-label="report table">
        <TableHead>
          <TableRow sx={{ backgroundColor: "white", borderBottom: "1px solid #e5e7eb" }}>
            {columns.map((col, index) => (
              <TableCell
                key={index}
                sx={{
                  px: 2,
                  py: 3,
                  color: "#374151",
                  fontWeight: 500,
                  textAlign: "left",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                {col === "Selected" ? <p></p> : col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex} hover sx={{ "&:hover": { backgroundColor: "#f9fafb" } }}>
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={colIndex}
                    sx={{
                      px: 2,
                      py: 1.5,
                      color: "#4b5563",
                      fontWeight: 500,
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {col === "Selected" ? (
                      <Checkbox checked={row.Selected || false} onChange={() => handleCheckboxChange(rowIndex)} />
                    ) : col === "Image" ? (
                      <Box
                        component="img"
                        src={row[col]}
                        alt="Profile"
                        sx={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : col === "Action" ? (
                      <>
                        <IconButton onClick={(e) => handleMenuOpen(e, rowIndex)}>
                          <FiMoreVertical />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEls[rowIndex]}
                          open={Boolean(anchorEls[rowIndex])}
                          onClose={() => handleMenuClose(rowIndex)}
                        >
                          <MenuItem
                            onClick={() => {
                              row.onEdit?.();
                              handleMenuClose(rowIndex);
                            }}
                          >
                            <FiEdit2 style={{ marginRight: 8 }} /> Edit
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              row.onDelete?.();
                              handleMenuClose(rowIndex);
                            }}
                          >
                            <FiTrash2 style={{ marginRight: 8 }} /> Delete
                          </MenuItem>
                        </Menu>
                      </>
                    ) : React.isValidElement(row[col]) ? (
                      row[col]
                    ) : (
                      row[col] || "-"
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 5 }}>
                <Box display="flex" flexDirection="column" alignItems="center">
                  <FiInbox size={50} />
                  <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                    No data available
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReportTable;
