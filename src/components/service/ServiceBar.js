import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import BuildIcon from "@mui/icons-material/Build";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CarRepairIcon from "@mui/icons-material/CarRepair";
import LocalCarWashIcon from "@mui/icons-material/LocalCarWash";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import TireRepairIcon from "@mui/icons-material/TireRepair";

const services = [
  { label: "Packages", icon: <ShoppingCartIcon fontSize="large" /> },
  { label: "All Services", icon: <BuildIcon fontSize="large" /> },
  { label: "Wheel Alignment", icon: <DirectionsCarIcon fontSize="large" /> },
  { label: "Wheel Balancing", icon: <CarRepairIcon fontSize="large" /> },
  { label: "Wash & Detailing Services", icon: <LocalCarWashIcon fontSize="large" /> },
  { label: "PMS & Check-Ups", icon: <MiscellaneousServicesIcon fontSize="large" /> },
  { label: "Tyres & Services", icon: <TireRepairIcon fontSize="large" /> },
];

const ServiceBar = () => {
  return (
    <Box sx={{ px: 2, py: 2, backgroundColor: "#fff", borderBottom: "1px solid #ddd" }}>
      <Grid container spacing={2} justifyContent="space-between">
        {services.map((service, index) => (
          <Grid item key={index} xs={6} sm={3} md={1.7}>
            <Box textAlign="center">
              <Box color="primary.main">{service.icon}</Box>
              <Typography variant="body2">{service.label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ServiceBar;