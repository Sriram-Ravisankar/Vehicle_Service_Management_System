import React from 'react';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import apiEndpoints from '../../apiconfig';

const getStatusStyle = (status) => {
  switch (status) {
    case 'Approval Pending':
      return { backgroundColor: '#FFF8E1', color: '#FBC02D' };
    case 'Work In Progress':
      return { backgroundColor: '#E8F5E9', color: '#4CAF50' };
    case 'Delivered':
      return { backgroundColor: '#38B038', color: '#fff' };
    default:
      return { backgroundColor: '#EEEEEE', color: '#000' };
  }
};

const JobCardTable = ({ jobCards, handleEdit, formatDate, onStatusUpdate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleStatusChange = async (jobCardId, newStatus) => {
    try {
      const allowedStatuses = ['Approval Pending', 'Work In Progress', 'Delivered'];
      if (!allowedStatuses.includes(newStatus)) {
        console.error('Invalid status value');
        return;
      }

      const response = await fetch(`${apiEndpoints.JobCard}?job_guid=${jobCardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const updatedCard = jobCards.find(card => card.jobGuid === jobCardId);
        onStatusUpdate({ ...updatedCard, status: newStatus });
      } else {
        console.error('Failed to update status:', data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Responsive table cell styling
  const tableCellStyles = {
    minWidth: isSmallMobile ? '100px' : isMobile ? '120px' : '160px',
    maxWidth: isSmallMobile ? '120px' : isMobile ? '150px' : '215px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: isSmallMobile ? '0.7rem' : isMobile ? '0.75rem' : '0.875rem',
    px: isSmallMobile ? 0.5 : isMobile ? 1 : 2,
    py: isSmallMobile ? 0.75 : 1,
    lineHeight: 1.2,
  };

const headerCellStyles = {
  ...tableCellStyles,
  fontWeight: 600,
  color: "#374151",
  backgroundColor: "#F9FAFB",
  fontSize: isSmallMobile ? "0.65rem" : "0.75rem",
  borderBottom: "1px solid #E5E7EB",
};


  // Simplified column headers for mobile
  const getHeaderText = (text) => {
    if (!isMobile) return text;
    
    const headerMap = {
      "Job Card No.": "Job Card",
      "Customer Name": "Customer",
      "Mobile No.": "Mobile",
      "Reg. No.": "Reg No",
      "Arrival Date": "Arrival",
      "Est. Delivery": "Est. Delivery",
    };
    
    return headerMap[text] || text;
  };

  // Truncate long text for mobile
  const truncateText = (text, maxLength = 15) => {
    if (!isMobile || !text) return text;
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  const StatusPill = ({ status }) => {
    const styles = getStatusStyle(status);
    return (
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: 999,
          fontSize: "0.7rem",
          fontWeight: 600,
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          display: "inline-flex",
          alignItems: "center",
          whiteSpace: "nowrap",
        }}
      >
        {status}
      </Box>
    );
  };


  return (
    <Box
      sx={{
        width: "100%",
        // Always enable horizontal scrolling regardless of screen size
        overflowX: "auto",
        // Hide scrollbar completely but maintain functionality
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE and Edge
        "&::-webkit-scrollbar": {
          display: "none", // Chrome, Safari, Edge
        },
        WebkitOverflowScrolling: "touch", // Smooth scrolling on iOS
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        // Add visual cue for scrolling
        cursor: "grab",
        "&:active": {
          cursor: "grabbing",
        },
      }}
    >
      <Table
        stickyHeader
        size="small"
        sx={{
          // Set minimum width to ensure table is wider than container on all screens
          minWidth: isSmallMobile ? "700px" : isMobile ? "800px" : "100%",
          width: "auto",
          tableLayout: "fixed",
          "& .MuiTableRow-root": {
            "&:hover": {
              backgroundColor: "#F5F5F5",
            },
          },
          "& .MuiTableCell-root": {
            borderRight: "1px solid #f0f0f0",
            "&:last-child": {
              borderRight: "none",
            },
          },
        }}
      >
        <TableHead>
          <TableRow sx={{ bgcolor: "#E3F2FD" }}>
            {[
              "Job Card No.",
              "Customer Name",
              "Mobile No.",
              "Reg. No.",
              "Arrival Date",
              "Status",
              "Est. Delivery",
            ].map((head) => (
              <TableCell key={head} sx={headerCellStyles}>
                {getHeaderText(head)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {jobCards.map((card, idx) => (
            <TableRow
              key={idx}
              hover
              sx={{
                fontSize: "0.875rem",
                "&:nth-of-type(even)": {
                  backgroundColor: "#fafafa",
                },
              }}
            >
              <TableCell sx={tableCellStyles} title={card.jobCardNo}>
                {truncateText(card.jobCardNo, 12)}
              </TableCell>
              <TableCell sx={tableCellStyles} title={card.customerName}>
                {truncateText(card.customerName, 8)}
              </TableCell>
              <TableCell sx={tableCellStyles} title={card.mobile}>
                {truncateText(card.mobile, 10)}
              </TableCell>
              <TableCell sx={tableCellStyles} title={card.vehicleNo}>
                {truncateText(card.vehicleNo, 12)}
              </TableCell>
              <TableCell sx={tableCellStyles}>
                {formatDate(card.arrivalDate)}
              </TableCell>
              <TableCell sx={tableCellStyles}>
                <StatusPill status={card.status} />
              </TableCell>

              <TableCell sx={tableCellStyles}>
                {formatDate(card.estimateDate)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default JobCardTable;