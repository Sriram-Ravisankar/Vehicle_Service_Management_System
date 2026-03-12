import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const ServicesPage = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const storedServices = JSON.parse(localStorage.getItem('serviceForms')) || [];
    setServices(storedServices);
  }, []);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Service ID</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Vehicle</TableCell>
            <TableCell>Service Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {services.map((service, index) => (
            <TableRow key={index}>
              <TableCell>{service.jobCardNo}</TableCell>
              <TableCell>{service.customerName}</TableCell>
              <TableCell>{service.vehicleName}</TableCell>
              <TableCell>{service.serviceType}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ServicesPage;