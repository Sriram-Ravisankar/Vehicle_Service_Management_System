import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';

const getStatusStyle = (status) => {
  const s = status?.trim() || '';
  if (s.includes('Pending') || s.includes('Approval')) {
    return { backgroundColor: '#FFF7ED', color: '#C2410C' }; // Orange
  }
  if (s.includes('Progress') || s.includes('In')) {
    return { backgroundColor: '#EFF6FF', color: '#1D4ED8' }; // Blue
  }
  if (s.includes('Delivered') || s.includes('Completed') || s.includes('Done')) {
    return { backgroundColor: '#F0FDF4', color: '#15803D' }; // Green
  }
  if (s.includes('Cancelled') || s.includes('Reject')) {
    return { backgroundColor: '#FEF2F2', color: '#B91C1C' }; // Red
  }
  return { backgroundColor: '#F3F4F6', color: '#4B5563' }; // Gray
};

const JobCardTable = ({ jobCards, formatDate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));


  // Responsive table cell styling
  const tableCellStyles = {
    fontSize: isSmallMobile ? '0.75rem' : '0.875rem',
    color: '#374151',
    px: 3,
    py: 2,
    borderBottom: '1px solid #F3F4F6',
    whiteSpace: 'nowrap',
  };

  const headerCellStyles = {
    ...tableCellStyles,
    fontWeight: 700,
    color: "#6B7280",
    backgroundColor: "#F9FAFB",
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "2px solid #E5E7EB",
  };


  // Simplified column headers for mobile
  const getHeaderText = (text) => {
    if (!isMobile) return text;
    
    const headerMap = {
      "Job Card No.": "Job Card",
      "Customer Name": "Customer",
      "Mobile No.": "Mobile",
      "Vehicle no ": "Reg No",
      "Arrival Date": "Arrival",
      "Est. Delivery": "Est. Delivery",
    };
    
    return headerMap[text] || text;
  };

  // Truncate long text for mobile
  
  const StatusPill = ({ status }) => {
    const config = getStatusStyle(status);
    return (
      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: "6px",
          fontSize: "0.6875rem",
          fontWeight: 700, // Balanced weight
          backgroundColor: config.backgroundColor,
          color: config.color,
          display: "inline-flex",
          alignItems: "center",
          textTransform: "uppercase",
          letterSpacing: "0.02em",
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
        overflowX: "auto",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <Table
        sx={{
          minWidth: 800,
          borderCollapse: "separate",
          borderSpacing: 0,
          "& .MuiTableRow-root": {
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#F9FAFB",
              "& .MuiTableCell-root": {
                color: "#111827",
              }
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
            <TableRow key={idx}>
              <TableCell sx={{ ...tableCellStyles, fontWeight: 600, color: "#111827" }}>
                {card.jobCardNo}
              </TableCell>
              <TableCell sx={tableCellStyles}>
                {card.customerName}
              </TableCell>
              <TableCell sx={tableCellStyles}>
                {card.mobile}
              </TableCell>
              <TableCell sx={tableCellStyles}>
                <Box component="span" sx={{ px: 1, py: 0.5, bgcolor: '#F3F4F6', borderRadius: 1, fontSize: '0.75rem', fontWeight: 600 }}>
                    {card.vehicleNo}
                </Box>
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