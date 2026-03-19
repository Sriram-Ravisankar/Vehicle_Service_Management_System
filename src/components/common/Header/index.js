import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import { Add, Settings, MoreHoriz, FlashOn, Bolt, Navigation, Route, ArrowBack } from "@mui/icons-material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { useLocation, useNavigate } from "react-router-dom";

/* ---------------- Route → Title map ---------------- */
const ROUTE_TITLE_MAP = {
  "/": "Login",
  "/forgotpassword": "Forgot Password",

  "/dashboard": "Dashboard Overview",

  "/invoices": "Invoices",
  "/add-invoice": "Add Invoice",
  "/edit-invoice": "Edit Invoice",
  "/view-invoice": "View Invoice",
  "/invoicedetails": "Invoice Details",

  "/jobqueue": "Job Queue",
  "/edit-job-card": "Edit Job Card",
  "/jobcard": "Job Card",

  "/workersmanagement": "Workers",

  "/product": "Product",
  "/purchase": "Purchase",
  "/supplier": "Supplier",
  "/stock": "Stock",
  "/add-stock": "Add Stock",
  "/add-purchase": "Add Purchase",
  "/add-supplier": "Add Supplier",
  "/add-product": "Add Product",
  "/supplier-view": "Supplier View",
  "/purchase-view": "Purchase View",

  "/reports": "Reports",
  "/part-sells": "Part Sells",
  "/dynamic": "Dynamic",
  "/observation-library": "Observation Library",
  "/profile-settings": "Profile Settings",
  "/logout": "Logout",

  "/custom-fields": "Custom Fields",
  "/custom-form": "Custom Form",
  "/services": "Services",
  "/services-form": "Add Service",

  "/branches": "Branches",
  "/add-branch": "Add Branch",

  "/main-layout": "Main Layout",
  "/packages": "Packages",
  "/all-services": "All Services",
  "/wheel-alignment": "Wheel Alignment",
  "/wheel-balancing": "Wheel Balancing",
  "/wash-detailing": "Wash & Detailing",
  "/pms-checkups": "PMS Checkups",
  "/tyres-services": "Tyres Services",
  "/details": "Details",

  "/taxrates": "Tax Rate",
  "/addtax": "Add Tax",
  "/payment-methods": "Payment Methods",
  "/addpayments": "Add Payments",
  "/income": "Income",
  "/addincome": "Add Income",
  "/expenses": "Expenses",
  "/expensesdetail": "Expenses Detail",
  "/addexpenses": "Add Expenses",

  "/customers": "Customers",
  "/employees": "Employees",
  "/support-staff": "Support Staff",
  "/accountants": "Accountants",

  "/quotations": "Quotations",
  "/add-quotation": "Add Quotation",
  "/edit-quotation": "Edit Quotation",

  "/adduser": "Add Customer",
  "/add-support-staff": "Add Support Staff",
  "/add-accountant": "Add Accountant",
  "/add-employee": "Add Employee",
  "/edit-user": "Edit Customer",
  "/edit-support-staff": "Edit Support Staff",
  "/edit-accountant": "Edit Accountant",
  "/edit-employee": "Edit Employee",
};

/* ---------------- Route → Add Route map ---------------- */
const ROUTE_ADD_MAP = {
  "/invoices": "/add-invoice",
  "/jobqueue": "/services-form",
  "/jobcard": "/services-form",
  "/product": "/add-product",
  "/purchase": "/add-purchase",
  "/supplier": "/add-supplier",
  "/stock": "/add-stock",
  "/services": "/services-form",
  "/branches": "/add-branch",
  "/taxrates": "/addtax",
  "/payment-methods": "/addpayments",
  "/income": "/addincome",
  "/expenses": "/addexpenses",
  "/customers": "/adduser",
  "/employees": "/add-employee",
  "/support-staff": "/add-support-staff",
  "/accountants": "/add-accountant",
  "/quotations": "/add-quotation",
  "/custom-fields": "/custom-form",
};

// Pages where single add button should be hidden
const HIDE_SINGLE_ADD_PAGES = [
  "/dashboard",
  "/",
  "/forgotpassword",
  "/reports",
  "/part-sells",
  "/dynamic",
  "/observation-library",
  "/profile-settings",
  "/logout",
  "/main-layout",
  "/packages",
  "/all-services",
  "/wheel-alignment",
  "/wheel-balancing",
  "/wash-detailing",
  "/pms-checkups",
  "/tyres-services",
  "/details",
  "/stock",
  "/invoices",
];

const isIdLike = (seg) => /^[0-9]+$/.test(seg) || /^[a-f0-9]{8,}$/i.test(seg);
const toTitle = (str = "") =>
  decodeURI(str)
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const baseKeyFromPath = (pathname) => {
  const clean = pathname.split("?")[0].split("#")[0].toLowerCase();
  const parts = clean.split("/").filter(Boolean);
  if (parts.length === 0) return "/";
  const last = parts[parts.length - 1];
  const core = isIdLike(last) && parts.length > 1 ? parts.slice(0, -1) : parts;
  if (core.length >= 2) return `/${core[0]}-${core[1]}`;
  return `/${core[0]}`;
};

const titleFromPath = (pathname) => {
  const key = baseKeyFromPath(pathname);
  if (ROUTE_TITLE_MAP[key]) return ROUTE_TITLE_MAP[key];

  const parts = pathname.split("?")[0].split("#")[0].split("/").filter(Boolean);
  if (parts.length === 0) return ROUTE_TITLE_MAP["/"] || "Home";
  const last = parts[parts.length - 1];
  const candidate = isIdLike(last) && parts.length > 1 ? parts[parts.length - 2] : last;
  return toTitle(candidate);
};

/* ------- Default Add menu; override via prop if needed ------- */
const DEFAULT_ADD_MENU = [
  { label: "JobCard", route: "/services-form" },
  { label: "Suppliers", route: "/supplier" },
  { label: "Product", route: "/product" },
  { label: "Purchase", route: "/purchase" },
  { label: "Stock", route: "/stock" },
  { label: "Customers", route: "/customers" },
  // { label: 'Income', route: '/income' },
  // { label: 'Expenses', route: '/expenses' },
];

export default function SectionHeader({
  title,
  showBack = false,
  onBack,
  addMenu = DEFAULT_ADD_MENU,
  showAdd = true,
  showSettings = true,
  showProfile = true,
  onSettings, 
  onAddItem,
  onLogout,
  addRoute, // New prop for custom add route
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const screenTitle = useMemo(() => title || titleFromPath(pathname), [title, pathname]);

  const [addAnchor, setAddAnchor] = useState(null);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  // Get the appropriate add route based on current path
  const getAddRoute = () => {
    // Use custom addRoute prop if provided
    if (addRoute) return addRoute;

    const baseKey = baseKeyFromPath(pathname);

    // Check for exact match first
    if (ROUTE_ADD_MAP[baseKey]) {
      return ROUTE_ADD_MAP[baseKey];
    }

    // Check for partial matches (for nested routes)
    const matchingRoute = Object.keys(ROUTE_ADD_MAP).find(route =>
      pathname.startsWith(route)
    );

    if (matchingRoute) {
      return ROUTE_ADD_MAP[matchingRoute];
    }

    // Fallback: try to construct add route from current path
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 0) {
      const mainRoute = parts[0];
      return `/add-${mainRoute}`;
    }

    // Final fallback
    return "/";
  };

  // Handle single add button click
  const handleSingleAddClick = () => {
    const targetRoute = getAddRoute();
    if (targetRoute && targetRoute !== "/") {
      navigate(targetRoute);
    }
  };

  const handleAddOpen = (e) => setAddAnchor(e.currentTarget);
  const handleAddClose = () => setAddAnchor(null);
  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  const handleAddClick = (item) => {
    onAddItem?.(item);
    navigate(item.route);
    handleAddClose();
  };

  const handleGoProfile = () => {
    navigate("/profile-settings");
    handleProfileClose();
  };

  const handleDoLogout = () => {
    if (onLogout) onLogout();
    else {
      sessionStorage.removeItem("token");
      navigate("/");
    }
    handleProfileClose();
  };

  // Check if single add button should be shown
  const shouldShowSingleAdd = () => {
    if (!showAdd) return false;

    // Don't show on add/edit pages
    if (pathname.includes("/add-") || pathname.includes("/edit-")) {
      return false;
    }

    // Don't show on pages in HIDE_SINGLE_ADD_PAGES
    const baseKey = baseKeyFromPath(pathname);
    if (HIDE_SINGLE_ADD_PAGES.includes(baseKey)) {
      return false;
    }

    // Don't show if no add route is mapped
    const targetRoute = getAddRoute();
    if (!targetRoute || targetRoute === "/") {
      return false;
    }

    return true;
  };

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ minHeight: 56 }}
      >
        {/* Title with Single Add Button */}
        <Stack direction="row" alignItems="center" spacing={1}>
          {showBack && (
            <IconButton 
              onClick={handleBack} 
              sx={{ 
                mr: 1, 
                color: "rgba(139, 92, 246, 0.9)",
                "&:hover": { color: "primary.main", bgcolor: "rgba(0,0,0,0.04)" }
              }}
            >
              <ArrowBack />
            </IconButton>
          )}
          <Typography
            sx={{ fontSize: { xs: 20, sm: 24 } }}
            fontWeight="bold"
            color="text.primary"
            noWrap
            title={screenTitle}
          >
            {screenTitle}
          </Typography>

          {/* Single Add Button - appears near title */}
          {shouldShowSingleAdd() && (
            <Tooltip title={`Add ${screenTitle.slice(0, -1)}`}>
              <IconButton
                onClick={handleSingleAddClick}
                size="small"
                  sx={{
                    bgcolor: "#3B82F6",
                    color: "#fff",
                    "&:hover": { bgcolor: "#2563EB" },
                    width: 40,
                    height: 40,
                  }}
                aria-label={`Add ${screenTitle}`}
              >
                <Add fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* Actions */}
        <Stack direction="row" spacing={1} alignItems="center">
          {showAdd && (
            <>
              <Tooltip title="Quick Routes">
                <IconButton
                  onClick={handleAddOpen}
                  size="small"
                  sx={{
                    color: "#fff",
                    bgcolor: "#3B82F6",
                    "&:hover": { bgcolor: "#2563EB" },
                    width: 45,
                    height: 45,
                  }}
                  aria-label="Quick Routes"
                >
                  {/* Choose one of these icons for quick routes */}
                  {/* <FlashOn /> Lightning bolt - indicates speed */}
                  <Bolt /> {/* Alternative lightning icon */}
                  {/* <Navigation /> */} {/* Navigation icon */}
                  {/* <Route /> */} {/* Route icon */}
                  {/* <MoreHoriz /> */} {/* Horizontal dots - minimal */}
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={addAnchor}
                open={Boolean(addAnchor)}
                onClose={handleAddClose}
                PaperProps={{ elevation: 4 }}
              >
                {addMenu.map((item) => (
                  <MenuItem key={item.route} onClick={() => handleAddClick(item)}>
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          {/* {showSettings && (
            <IconButton
              onClick={onSettings}
              sx={{
                bgcolor: "#10AADF",
                "&:hover": { bgcolor: "#09B3F1" },
                width: 45,
                height: 45,
              }}
              aria-label="Settings"
            >
              <Settings />
            </IconButton>
          )} */}

          {/* {showProfile && (
            <>
              <IconButton
                onClick={handleProfileOpen}
                sx={{
                  backgroundColor: "#10AADF",
                  color: "white",
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "#09B3F1" },
                }}
                aria-label="Profile"
              >
                <AssignmentIndIcon />
              </IconButton>

              <Menu
                anchorEl={profileAnchor}
                open={Boolean(profileAnchor)}
                onClose={handleProfileClose}
                PaperProps={{
                  elevation: 4,
                  sx: {
                    mt: 2,
                    width: 160,
                    bgcolor: "#ffffff",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                }}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={handleGoProfile} sx={{ py: 1.2 }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleDoLogout} sx={{ py: 1.2 }}>
                  Logout
                </MenuItem>
              </Menu>
            </>
          )} */}
        </Stack>
      </Box>
    </Box>
  );
}