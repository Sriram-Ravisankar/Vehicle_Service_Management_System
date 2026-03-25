import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import Pagination from "../../components/DynamicComponents/Pagination";
import {
  Box,
  IconButton,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Avatar,
  Paper,
  Typography,
  Button,
  MenuItem,
  Menu,
  useMediaQuery,
  Stack,
  Tooltip,
} from "@mui/material";
import { Add, Delete, MoreVert, Settings } from "@mui/icons-material";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import apiEndpoints from "../../apiconfig";

const api = {
  delete: async (url) => {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    });
    const data = await response.json();
    return { data };
  },
};

function UserList({
  users = [],
  onDelete,
  setUsers,
  title,
  columns,
  detailsKey,
  addRoute,
  editRoutePrefix,
  fetchData,
}) {
  const [localUsers, setLocalUsers] = useState(users);
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [addAnchorEl, setAddAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 1;

  useEffect(() => {
    fetchData(); // Call your API/data fetching function
  }, []);

  // Map titles to their respective add routes
  const getAddRouteMap = () => {
    return {
      Customers: "/adduser",
      Employees: "/add-employee",
      "Support Staff": "/add-support-staff",
      Accountants: "/add-accountant",
      Quotations: "/add-quotation",
      Services: "/services-form",
      Branches: "/add-branch",
      Invoices: "/add-invoice",
      Products: "/add-product",
      Suppliers: "/add-supplier",
      Purchases: "/add-purchase",
      Stock: "/add-stock",
      "Tax Rates": "/addtax",
      "Payment Methods": "/addpayments",
      Income: "/addincome",
      Expenses: "/addexpenses",
    };
  };

  // Get the appropriate add route based on title
  const getAddRoute = () => {
    const routeMap = getAddRouteMap();
    return routeMap[title] || addRoute || "/";
  };

  // Handle plus button click
  const handlePlusButtonClick = () => {
    const targetRoute = getAddRoute();
    navigate(targetRoute);
  };

  // Transform the user data to match the expected format
  const transformedUsers = React.useMemo(() => {
    return (users || []).map((user) => ({
      id: user.user_guid,
      user_guid: user.user_guid,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      mobile: user.mobile,
      image: `${apiEndpoints.blob}${user.image_path}` || user.image_path,
      [detailsKey]: getUserDetail(user, detailsKey),
      // For quotations
      quotationNumber: user.quotation_no,
      customerName: user.customer_name,
      date: user.date,
      price: user.price,
      status: user.status,
      // Add other fields as needed
    }));
  }, [users, detailsKey]);

  console.log(transformedUsers);

  // Helper function to get the detail based on user type
  function getUserDetail(user, key) {
    const supportStaffMappings = {
      roles: {
        1: "Cleaner",
        2: "Helper",
        3: "Runner",
        4: "Inventory Helper",
      },
    };

    switch (key) {
      case "vehicle":
        // Try vehicle_make (joined), fallback to first vehicle if exists
        return (
          user.vehicle_make ||
          user.vehicle_number ||
          user.vehicles?.[0]?.make ||
          "-"
        );
      case "position":
        return user.position || "-";
      case "role":
        return supportStaffMappings.roles[user.role] || user.role || "-";
      case "qualification":
        return user.qualifications || "-";
      case "service":
        return user.service || "-";
      default:
        return "-";
    }
  }


  const filteredUsers = React.useMemo(() => {
    const term = searchTerm.toLowerCase();
    return transformedUsers.filter((user) => {
      return (
        user.firstName?.toLowerCase().includes(term) ||
        user.lastName?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.mobile?.toString().includes(term) ||
        user[detailsKey]?.toLowerCase?.().includes(term)
      );
    });
  }, [transformedUsers, searchTerm, detailsKey]);

  useEffect(() => {
    setSelectedUsers([]);
  }, [users]);

  const handleAddMenuOpen = (event) => {
    setAddAnchorEl(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAddAnchorEl(null);
  };

  const handleMenuOpen = (event, user) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setActionAnchorEl(null);
    setSelectedUser(null);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleSelectAll = (event) => {
    setSelectedUsers(event.target.checked ? users.map((u) => u.id) : []);
  };

  const handleSelectOne = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async (userGuid, vehicleGuid) => {
    console.log("Delete called:", userGuid, vehicleGuid);
    try {
      const response = await api.delete(
        `${apiEndpoints.usersdata}?user_guid=${userGuid}&vehicle_guid=${vehicleGuid}`
      );
      console.log(response.data);
      fetchData();
      setSelectedUsers([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFooterSelectAll = (event) => {
    const shouldSelectAll = event.target.checked;
    const filteredIds = filteredUsers.map((u) => u.id);

    if (shouldSelectAll) {
      setSelectedUsers([...new Set([...selectedUsers, ...filteredIds])]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => !filteredIds.includes(id)));
    }
  };

  const handleDropdownItemClick = (path) => {
    navigate(path);
    handleAddMenuClose();
  };

  const handleDropdownClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  return (
    <Box sx={{ fontFamily: "Montserrat", p: { xs: 2, md: 4 } }}>
      {/* Header Section */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        gap={2}
      >
        {/* Title + Add Single User */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            sx={{ fontSize: "25px" }}
            fontWeight="bold"
            color="text.primary"
          >
            {title}
          </Typography>
          <Tooltip title={`Add ${title.slice(0, -1)}`}>
            <IconButton
              onClick={handlePlusButtonClick}
              size="small"
              sx={{
                bgcolor: "#10AADF",
                color: "#fff",
                "&:hover": { bgcolor: "#09B3F1" },
                width: 40,
                height: 40,
              }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={1}>
          {/* Dropdown Add */}
          <Tooltip title="Add More">
            <IconButton
              onClick={handleDropdownClick}
              size="small"
              sx={{
                bgcolor: "#10AADF",
                "&:hover": { bgcolor: "#09B3F1" },
                width: 45,
                height: 45,
              }}
            >
              <Add />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{ elevation: 4 }}
          >
            <MenuItem onClick={() => handleDropdownItemClick("/services-form")}>
              + JobCard
            </MenuItem>
            <MenuItem onClick={() => handleDropdownItemClick("/Supplier")}>
              + Suppliers
            </MenuItem>
            <MenuItem onClick={() => handleDropdownItemClick("/Product")}>
              + Product
            </MenuItem>
            <MenuItem onClick={() => handleDropdownItemClick("/Purchase")}>
              + Purchase
            </MenuItem>
            <MenuItem onClick={() => handleDropdownItemClick("/Stock")}>
              + Stock
            </MenuItem>
            <MenuItem onClick={() => handleDropdownItemClick("/customers")}>
              + Customers
            </MenuItem>
          </Menu>

          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton
              sx={{
                bgcolor: "#10AADF",
                color: "#fff",
                "&:hover": { bgcolor: "#09B3F1" },
                width: 45,
                height: 45,
              }}
            >
              <Settings />
            </IconButton>
          </Tooltip>

          {/* Assignment Icon with Dropdown */}
          <IconButton
            onClick={handleProfileClick}
            sx={{
              backgroundColor: "#10AADF",
              color: "white",
              borderRadius: "8px",
              "&:hover": { backgroundColor: "#09B3F1" },
            }}
          >
            <AssignmentIndIcon />
          </IconButton>
          <Box>
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileClose}
              PaperProps={{
                elevation: 4,
                sx: {
                  mt: 2,
                  mr: 1,
                  width: 150,
                  bgcolor: "#ffffff",
                  borderRadius: "5px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem
                onClick={() => handleDropdownItemClick("/profile-settings")}
                sx={{
                  py: 1,
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => handleDropdownItemClick("/")}
                sx={{
                  py: 1,
                  fontSize: "16px",
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Stack>
      </Box>

      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="flex-end"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={2}
        gap={2}
      >
        <TextField
          placeholder="Search..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            backgroundColor: "#f1f3f4",
            borderRadius: "6px",
            width: { xs: "100%", sm: 250 },
            "& fieldset": { border: "none" },
          }}
        />
      </Box>

      {/* Table Container */}
      <Box sx={{ overflowX: "auto" }}>
        <Paper elevation={0} sx={{ minWidth: 600 }}>
          <Table sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <p></p>
                </TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={column}
                    sx={{
                      display:
                        isMobile &&
                          [
                            "Mobile Number",
                            "Position",
                            "Department",
                            "qulification",
                            "Vehicle",
                          ].includes(column)
                          ? "none"
                          : "table-cell",
                    }}
                  >
                    {column}
                  </TableCell>
                ))}
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 2} align="center">
                    <Typography variant="body1" sx={{ p: 4 }}>
                      No {title.toLowerCase()} found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectOne(user.id)}
                      />
                    </TableCell>

                    {columns.map((column) => {
                      if (
                        isMobile &&
                        [
                          "Mobile Number",
                          "Position",
                          "Department",
                          "qulification",
                          "Vehicle",
                        ].includes(column)
                      )
                        return null;

                      switch (column) {
                        case "Image":
                          return (
                            <TableCell key={column}>
                              <Avatar src={user.image}>
                                {user.firstName?.[0]}
                              </Avatar>
                            </TableCell>
                          );
                        case "Quotation No":
                          return (
                            <TableCell key={column}>
                              {user.quotationNumber || "-"}
                            </TableCell>
                          );
                        case "Customer":
                          return (
                            <TableCell key={column}>
                              {user.customerName || "-"}
                            </TableCell>
                          );
                        case "Date":
                          return (
                            <TableCell key={column}>
                              {user.date || "-"}
                            </TableCell>
                          );
                        case "Price":
                          return (
                            <TableCell key={column}>
                              {user.price || "-"}
                            </TableCell>
                          );
                        case "Status":
                          return (
                            <TableCell key={column}>
                              {user.status || "-"}
                            </TableCell>
                          );
                        default:
                          const property =
                            {
                              "First Name": "firstName",
                              "Last Name": "lastName",
                              Email: "email",
                              "Mobile Number": "mobile",
                            }[column] || detailsKey;

                          return (
                            <TableCell key={column}>
                              {user[property] || "-"}
                            </TableCell>
                          );
                      }
                    })}

                    <TableCell>
                      <IconButton onClick={(e) => handleMenuOpen(e, user)}>
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Box>

      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            navigate(`${editRoutePrefix}/${selectedUser?.id}`);
            handleMenuClose();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDelete(selectedUser?.user_guid, selectedUser?.vehicle_guid);
            handleMenuClose();
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        mt={2}
        gap={2}
      >
        <Box>
          {/* Buttons Container */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            {/* Left Side: Select All */}
            <Box
              display="flex"
              alignItems="center"
              sx={{
                backgroundColor: "rgba(14, 165, 233, 0.9)",
                borderRadius: "4px",
                px: 2,
                py: 1,
                minHeight: "36px",
                "&:hover": {
                  cursor: "pointer",
                },
              }}
              onClick={(e) => {
                const allSelected = filteredUsers.every((user) =>
                  selectedUsers.includes(user.id)
                );
                handleFooterSelectAll({ target: { checked: !allSelected } });
              }}
            >
              <Checkbox
                checked={
                  filteredUsers.length > 0 &&
                  filteredUsers.every((user) => selectedUsers.includes(user.id))
                }
                onChange={handleFooterSelectAll}
                sx={{
                  padding: 0,
                  color: "white",
                  "&.Mui-checked": { color: "white" },
                  "&:hover": { backgroundColor: "transparent" },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: "white",
                  ml: 1,
                  lineHeight: 1,
                }}
              >
                Select All
              </Typography>
            </Box>

            {/* Right Side: Delete + Pagination */}
            <Box display="flex" alignItems="center" gap={1}>
              <Button
                variant="contained"
                sx={{
                  bgcolor: "red",
                  "&:hover": { bgcolor: "darkred" },
                  px: 2,
                  py: 1.3,
                  borderRadius: "4px",
                  color: "white",
                  minWidth: "auto",
                  marginLeft: "10px",
                }}
                onClick={() => handleDelete(selectedUsers.length > 0 ? selectedUsers[0] : null, null)}
              >
                <Delete fontSize="small" />
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

UserList.propTypes = {
  users: PropTypes.array.isRequired,
  setUsers: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
  detailsKey: PropTypes.string.isRequired,
  addRoute: PropTypes.string.isRequired,
  editRoutePrefix: PropTypes.string.isRequired,
};

export default React.memo(UserList);
