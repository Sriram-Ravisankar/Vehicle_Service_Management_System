import React from "react";
import { Box, Typography, IconButton, Stack } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { CgArrowLeft } from "react-icons/cg";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

const DynamicHeader = ({ 
  title, 
  showBackButton = true, 
  showActionButtons = true,
  onAddClick,
  onSettingsClick,
  onAssignmentClick,
  backButtonPath,
  customActionButtons
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    const routeToTitleMap = {
      "/customers": "Customers",
      "/employees": "Employees",
      "/support-staff": "Support Staff",
      "/accountants": "Accountants",
      "/quotations": "Quotations",
      "/services": "Services",
      "/branches": "Branches",
      "/invoices": "Invoices",
      "/product": "Products",
      "/supplier": "Suppliers",
      "/purchase": "Purchases",
      "/stock": "Stock",
      "/tax-rates": "Tax Rates",
      "/payment-methods": "Payment Methods",
      "/income": "Income",
      "/expenses": "Expenses",
      "/adduser": "Add Customer",
      "/add-employee": "Add Employee",
      "/add-support-staff": "Add Support Staff",
      "/add-accountant": "Add Accountant",
      "/add-quotation": "Add Quotation",
      "/services-form": "Add Service",
      "/add-branch": "Add Branch",
      "/add-invoice": "Add Invoice",
      "/add-product": "Add Product",
      "/add-supplier": "Add Supplier",
      "/add-purchase": "Add Purchase",
      "/add-stock": "Add Stock",
      "/addtax": "Add Tax Rate",
      "/addpayments": "Add Payment Method",
      "/addincome": "Add Income",
      "/addexpenses": "Add Expense",
      "add-branch": "Add Branch",
    };

    if (title) {
      return title;
    }

    return routeToTitleMap[location.pathname] || "Page";
  };

  const handleBackClick = () => {
    if (backButtonPath) {
      navigate(backButtonPath);
    } else {
      navigate(-1);
    }
  };

  const defaultOnAddClick = () => {
    const addRouteMap = {
      "Customers": "/adduser",
      "Employees": "/add-employee", 
      "Support Staff": "/add-support-staff",
      "Accountants": "/add-accountant",
      "Quotations": "/add-quotation",
      "Services": "/services-form",
      "Branches": "/add-branch",
      "Invoices": "/add-invoice",
      "Products": "/add-product",
      "Suppliers": "/add-supplier",
      "Purchases": "/add-purchase",
      "Stock": "/add-stock",
      "Tax Rates": "/addtax",
      "Payment Methods": "/addpayments",
      "Income": "/addincome",
      "Expenses": "/addexpenses"
    };

    const currentTitle = getPageTitle();
    const targetRoute = addRouteMap[currentTitle] || "/";
    navigate(targetRoute);
  };

  const defaultOnSettingsClick = () => console.log("Settings clicked");
  const defaultOnAssignmentClick = () => console.log("Assignment clicked");

  const displayTitle = getPageTitle();

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
      sx={{
        width: "100%",
        position: "relative",
      }}
    >
      {/* Left Section - Back Button and Title */}
      <Box
        display="flex"
        alignItems="center"
        sx={{
          marginLeft: 0,
          paddingLeft: 0,
        }}
      >
        {showBackButton && (
          <IconButton
            onClick={handleBackClick}
            sx={{
              p: 0,
              marginLeft: 0,
              minWidth: "auto",
              color: "rgba(14, 165, 233, 0.9)",
              "&:hover": {
                backgroundColor: "transparent",
                opacity: 0.8,
              },
            }}
          >
            <CgArrowLeft size={30} />
          </IconButton>
        )}
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          sx={{ 
            ml: showBackButton ? 1 : 0,
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            color: "#333",
          }}
        >
          {displayTitle}
        </Typography>
      </Box>
    </Box>
  );
};

export default DynamicHeader;