import React from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Tooltip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const PartTable = ({ parts, onEdit, onDelete }) => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>#</TableCell>
          <TableCell>Part Name</TableCell>
          <TableCell>Qty</TableCell>
          <TableCell>Price</TableCell>
          <TableCell>Brand</TableCell>
          <TableCell>Remarks</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {parts.map((part, idx) => (
          <TableRow key={idx}>
            <TableCell>{idx + 1}</TableCell>
            <TableCell>{part.partName}</TableCell>
            <TableCell>{part.qty}</TableCell>
            <TableCell>{part.price}</TableCell>
            <TableCell>{part.brand}</TableCell>
            <TableCell>{part.remarks}</TableCell>
            <TableCell>
              <Tooltip title="Edit">
                <IconButton onClick={() => onEdit(idx)} size="small" color="primary">
                  <EditIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton onClick={() => onDelete(idx)} size="small" color="error">
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PartTable;