import React, { useState, useEffect } from 'react'; 
import {
  Box, Button, Typography, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Chip, Dialog, DialogContent,
  useMediaQuery, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';
import JobCardForm from '../Jobcardform';
import { useNavigate } from 'react-router-dom';

const JobCardDashboard = () => {
  const [open, setOpen] = useState(false);
  const [selectedJobCard, setSelectedJobCard] = useState(null);
  const [tableData, setTableData] = useState([
    {
      jobCard: 'INT-J001470',
      regNo: '4567HU',
      invoice: '',
      type: 'All',
      vehicle: 'KIA SONET',
      arrival: 'May 12 2022',
      status: 'Approval Pending',
      estDelivery: 'May 12 2022',
      delivery: '',
      advisor: 'Long',
      customer: 'Zia',
      mobile: '*****5816',
      parts: '3,200.00',
    },
    {
      jobCard: 'INT-J00155570',
      regNo: '4567HU',
      invoice: '',
      type: 'All',
      vehicle: 'KIA SONET',
      arrival: 'May 12 2022',
      status: 'Approval Pending',
      estDelivery: 'May 12 2022',
      delivery: '',
      advisor: 'Long',
      customer: 'Zia',
      mobile: '*****5816',
      parts: '3,200.00',
    },
  ]);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem('selectedJobCard');
      if (stored) {
        setSelectedJobCard(JSON.parse(stored));
      }
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    localStorage.removeItem('selectedJobCard');
  };

  const handleAddJobCard = (jobCardData) => {
    const isEdit = tableData.some(item => item.jobCard === jobCardData.jobCard);
    if (isEdit) {
      setTableData(prev =>
        prev.map(item => item.jobCard === jobCardData.jobCard ? jobCardData : item)
      );
    } else {
      setTableData(prev => [...prev, jobCardData]);
    }
    setOpen(false);
    localStorage.removeItem('selectedJobCard');
  };

  const handleEdit = (jobCard) => {
    localStorage.setItem('selectedJobCard', JSON.stringify(jobCard));
    setSelectedJobCard(jobCard);
    setOpen(true);
  };

  const handleDelete = (jobCardNo) => {
    const updatedData = tableData.filter(row => row.jobCard !== jobCardNo);
    setTableData(updatedData);
  };

  const handleNewJobCardClick = () => {
    localStorage.removeItem('selectedJobCard');
    setSelectedJobCard(null);
    setOpen(true);
  };

  const summaryData = [
    { label: 'Estimate', value: 36, amount: '0.00', color: '#f0b429', route: '/JobCardForm' },
    { label: 'Spares Pending', value: 304, amount: '19,571,862.07', color: '#7ce0d1' },
    { label: 'Upcomming Service', value: 5, color: '#f4a7a7' },
    { label: 'Work-In-Progress', value: 97, amount: '4,252,182.14', color: '#a5e887' },
    { label: 'Ready For Delivery', value: 50, amount: '6,597,589.39', color: '#b0d0f0' },
    { label: 'Invoice', value: 153, amount: '3,210,842.92', color: '#f4a7a7' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* New Job Card Button */}
      <Box display="flex" justifyContent="flex-end" mb={2} px={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewJobCardClick}
          sx={{ fontSize: '0.85rem', textTransform: 'none', py: 1, px: 2 }}
        >
          New Job Card
        </Button>
      </Box>

      {/* Dialog Popup */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogContent>
          <JobCardForm
            onSubmit={handleAddJobCard}
            selectedJobCard={selectedJobCard}
          />
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'flex',
          overflowX: 'scroll',
          mr: 3,
          gap: 2.5,
          px: 2,
          pb: 2,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
        }}
      >
        {summaryData.map((item, index) => (
          <Box
            key={index}
            onClick={() => {
              if (item.label === 'Estimate') {
                handleNewJobCardClick();
              } else if (item.route) {
                navigate(item.route);
              }
            }}
            sx={{
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': { transform: 'scale(1.03)' },
            }}
          >
            <Paper
              elevation={3}
              sx={{
                backgroundColor: item.color,
                p: 2,
                minWidth: 276,
                height: 100,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" mb={0.5}>
                {item.label}
              </Typography>
              <Typography variant="h5" fontWeight="medium" mb={0.5}>
                {item.value}
              </Typography>
              {item.amount && (
                <Typography variant="subtitle1">₹{item.amount}</Typography>
              )}
            </Paper>
          </Box>
        ))}
      </Box>

      {/* Job Card Table */}
      <Paper sx={{ mt: 4, mx: 2,  mr:2, overflowX: 'auto', boxShadow: 'none' }}>
        <Table sx={{ 
          minWidth: 1200,
          border: '1px solid #e0e0e0',
          '& .MuiTableCell-root': {
            py: 1,
            px: 1.5,
            fontSize: '0.75rem',
            borderRight: '1px solid #e0e0e0',
            '&:last-child': {
              borderRight: 'none'
            }
          }
        }}>
          <TableHead>
            <TableRow sx={{ 
              backgroundColor: '#f5f5f5',
              '& th': {
                fontWeight: 'bold',
                fontSize: '0.75rem',
                color: '#333',
                whiteSpace: 'nowrap'
              }
            }}>
              <TableCell>Job Card No.</TableCell>
              <TableCell>Reg No.</TableCell>
              <TableCell>Invoice</TableCell>
              <TableCell>Service Type</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Arrival Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Est. Delivery</TableCell>
              <TableCell>Delivery Date</TableCell>
              <TableCell>Advisor</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell>Parts (₹)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  '&:hover': { backgroundColor: '#fafafa' },
                  '&:nth-of-type(even)': { backgroundColor: '#f9f9f9' }
                }}
              >
                <TableCell sx={{ fontWeight: '500' }}>{row.jobCard}</TableCell>
                <TableCell>{row.regNo}</TableCell>
                <TableCell>{row.invoice || '-'}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.vehicle}</TableCell>
                <TableCell>{row.arrival}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    size="small"
                    sx={{
                      backgroundColor: row.status.includes('Approval') ? '#fff3e0' : 
                                       row.status.includes('Delivered') ? '#e8f5e9' : '#e3f2fd',
                      color: row.status.includes('Approval') ? '#e65100' : 
                            row.status.includes('Delivered') ? '#2e7d32' : '#1565c0',
                      fontSize: '0.7rem',
                      height: '24px'
                    }}
                  />
                </TableCell>
                <TableCell>{row.estDelivery}</TableCell>
                <TableCell>{row.delivery || '-'}</TableCell>
                <TableCell>{row.advisor}</TableCell>
                <TableCell>{row.customer}</TableCell>
                <TableCell>{row.mobile}</TableCell>
                <TableCell sx={{ fontWeight: '500' }}>{row.parts}</TableCell>
                <TableCell>
                  <IconButton 
                    size="small" 
                    onClick={() => handleEdit(row)}
                    sx={{ color: '#1976d2', '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' } }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => handleDelete(row.jobCard)}
                    sx={{ color: '#d32f2f', '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default JobCardDashboard;