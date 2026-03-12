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
import SectionHeader from "../../components/common/Header";
import ReportTable from "../../components/Reports/ReportTable";

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

  // useEffect(() => {
  //   const hasReloaded = sessionStorage.getItem('hasReloaded');

  //   if (!hasReloaded) {
  //     sessionStorage.setItem('hasReloaded', 'true');
  //     window.location.reload();
  //   }
  //   else{

  //   }
  // }, []);

  // Transform the user data to match the expected format
  const transformedUsers = React.useMemo(() => {
    return (users || []).map((user) => ({
      id: user.vehicle_guid || user.user_guid,
      user_guid: user.user_guid,
      vehicle_guid: user.vehicle_guid,

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
          // user.vehicle_make ||
          // user.vehicle_number ||
          // user.vehicles?.[0]?.make ||
          // "-"
          user.vehicle_number || "-"
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

  const dynamicColumn = columns.find(
    (c) =>
      ![
        "Image",
        "First Name",
        "Last Name",
        "Email",
        "Mobile Number",
        "Action",
      ].includes(c)
  );

  const tableData = filteredUsers.map((user) => ({
    Selected: selectedUsers.includes(user.id),
    Image: user.image,
    "First Name": user.firstName,
    "Last Name": user.lastName,
    Email: user.email,
    "Mobile Number": user.mobile,

    [dynamicColumn]: user[detailsKey] || "-", // ✅ FIXED

    onEdit: () => navigate(`${editRoutePrefix}/${user.user_guid}`),
    onDelete: () => {
      handleDelete(user.user_guid, user.vehicle_guid);
    }

  }));


  return (
    <Box sx={{ fontFamily: "Montserrat", p: { xs: 1, sm: 3 } }}>
      <SectionHeader />

      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="flex-end"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={2}
        mt={2}
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
          <ReportTable
            columns={columns}
            data={tableData}
            onCheckChange={(index) => {
              const userId = filteredUsers[index]?.id;
              if (userId) handleSelectOne(userId);
            }}
          />
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
            {/* <Box
              display="flex"
              alignItems="center"
              sx={{
                backgroundColor: "rgba(249, 115, 22, 0.9)",
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
            </Box> */}

            {/* Right Side: Delete + Pagination */}
            {/* <Box display="flex" alignItems="center" gap={1}>
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
                onClick={() => handleDelete()}
              >
                <Delete fontSize="small" />
              </Button>
            </Box> */}
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
