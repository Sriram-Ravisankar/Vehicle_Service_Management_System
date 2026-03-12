import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  MenuItem,
  Select,
  TextField,
  Pagination,
  Paper
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

import SalePartForm from './SalePartForm'; // make sure the path is correct

const PartSellList = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <Box p={3}>
      {showForm ? (
        <Box>
          {/* Back Button or Close Form Option */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Create Sale Part
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setShowForm(false)}
              sx={{ textTransform: 'none' }}
            >
              Back to List
            </Button>
          </Box>
          <SalePartForm />
        </Box>
      ) : (
        <>
          {/* Header with Add Button */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Part Sells
              </Typography>
              <IconButton
                sx={{ backgroundColor: '#f26522', color: '#fff', borderRadius: 0 }}
                onClick={() => setShowForm(true)}
              >
                <AddIcon />
              </IconButton>
            </Box>

            {/* Action Icons */}
            <Box display="flex" gap={1}>
              <IconButton
                size="small"
                sx={{
                  backgroundColor: '#c3cbc6',
                  color: 'black',
                  borderRadius: 0,
                  width: 36,
                  height: 36,
                  '&:hover': { backgroundColor: '#d9531e' }
                }}
              >
                <AddIcon />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  backgroundColor: '#c3cbc6',
                  color: 'black',
                  borderRadius: 0,
                  width: 36,
                  height: 36,
                  '&:hover': { backgroundColor: '#d9531e' }
                }}
              >
                <SettingsIcon />
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  backgroundColor: '#f26522',
                  color: 'white',
                  borderRadius: '8px',
                  width: 36,
                  height: 36,
                  '&:hover': { backgroundColor: '#d9531e' }
                }}
              >
                <AssignmentIndIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Top Controls */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Select size="small" value={10} sx={{ width: 80 }}>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
            </Select>
          </Box>

          {/* Search */}
          <TextField
            size="small"
            placeholder="Search..."
            variant="outlined"
            sx={{ mb: 2, width: '100%', maxWidth: 300, backgroundColor: '#f5f8fa' }}
          />

          {/* Table */}
          <Paper variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  {['Bill Number', 'Customer Name', 'Date', 'Salesman', 'Action'].map((head, i) => (
                    <TableCell key={i} sx={{ fontWeight: 600 }}>
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>SP584792</TableCell>
                  <TableCell>Washington Ochieng</TableCell>
                  <TableCell>2024-04-03</TableCell>
                  <TableCell>Nandan kumar</TableCell>
                  <TableCell align="center">
                    <IconButton>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>

          {/* Pagination */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Typography>Showing page 1 - 1</Typography>
            <Pagination count={1} page={1} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default PartSellList;
