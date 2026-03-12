// import React, { useState } from "react";
// import { Plus } from "lucide-react";
// import { MdPersonOutline } from "react-icons/md";
// import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
// import { Add, Settings } from "@mui/icons-material";

// import {
//   Box,
//   Typography,
//   IconButton,
//   Stack,
//   Tooltip,
//   Menu,
//   MenuItem,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";

// const SectionHeader = ({ title = "Header", onAdd, onSettings, onReport }) => {
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [addAnchorEl, setAddAnchorEl] = useState(null);
//   const [profileAnchorEl, setProfileAnchorEl] = useState(null);
//   const open = Boolean(anchorEl);
//   const navigate = useNavigate();
//   const profileMenuOpen = Boolean(profileAnchorEl);
//   const addMenuOpen = Boolean(addAnchorEl);

//   const handleDropdownClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleClose = () => setAnchorEl(null);
//   const handleProfileClose = () => setProfileAnchorEl(null);

//   const handleDropdownItemClick = (path) => {
//     navigate(path);
//     handleClose();
    
//   };
//   const handleProfileClick = (event) => {
//     setProfileAnchorEl(event.currentTarget);
//   };
//  const handleLogout = () => {
//     // Remove token from sessionStorage
//     sessionStorage.removeItem('token');
//     // You might want to remove other items as well
//     // sessionStorage.clear(); // if you want to clear everything
    
//     // Navigate to login page
//     navigate("/");
//     handleProfileClose();
//   };

//   return (
//     <Box sx={{ backgroundColor: "#fff" }}>
//       {/* First Row: Title + Buttons */}
//       <Box display="flex" justifyContent="space-between" alignItems="center">
//         {/* Left: Title + orange Add */}
//         <Stack direction="row" alignItems="center" spacing={1}>
//           <Typography sx={{ fontSize: "25px" }} fontWeight="bold" color="text.primary">
//             Dashboard
//           </Typography>

//         </Stack>

//         {/* Right: Dropdown Add + Settings + Report */}
//         <Stack direction="row" spacing={1}>
//           <Tooltip title="Add">
//             <IconButton
//               onClick={handleDropdownClick}
//               size="small"
//               sx={{
//                 bgcolor: "#10AADF",
//                 "&:hover": { bgcolor: "#09B3F1" },
//                 width: 45,
//                 height: 45,
//               }}
//             >
//               <Add size={25} />
//             </IconButton>
//           </Tooltip>
//           <Menu
//             anchorEl={anchorEl}
//             open={open}
//             onClose={handleClose}
//             PaperProps={{ elevation: 4 }}
//           >
//             <MenuItem onClick={() => handleDropdownItemClick("/services-form")}>
//               + JobCard
//             </MenuItem>
//             <MenuItem onClick={() => handleDropdownItemClick("/Supplier")}>
//               + Suppliers
//             </MenuItem>
//             <MenuItem onClick={() => handleDropdownItemClick("/Product")}>
//               + Product
//             </MenuItem>
//             <MenuItem onClick={() => handleDropdownItemClick("/Purchase")}>
//               + Purchase
//             </MenuItem>
//             <MenuItem onClick={() => handleDropdownItemClick("/Stock")}>
//               + Stock
//             </MenuItem>
//             <MenuItem onClick={() => handleDropdownItemClick("/customers")}>
//               + Customers
//             </MenuItem>
//           </Menu>



//           <Box
//             display="flex"
//             justifyContent={{ xs: "flex-start", sm: "flex-end" }}
//             gap={1}
//           >

//             <IconButton sx={{
//               bgcolor: "#10AADF",
//               "&:hover": { bgcolor: "#09B3F1" },
//               width: 45,
//               height: 45,
//             }}>
//               <Settings />
//             </IconButton>
//             {/* Assignment Icon with Dropdown */}
//             <IconButton
//               onClick={handleProfileClick}
//               sx={{
//                 backgroundColor: "#10AADF",
//                 color: "white",
//                 borderRadius: "8px",
//                 "&:hover": { backgroundColor: "#09B3F1" },
//               }}
//             >
//               <AssignmentIndIcon />
//             </IconButton>
//             <Box>
//               <Menu
//                 anchorEl={profileAnchorEl}
//                 open={profileMenuOpen}
//                 onClose={handleProfileClose}
//                 PaperProps={{
//                   elevation: 4,
//                   sx: {
//                     mt: 2, // top gap (margin-top)
//                     mr: 1, // right gap (margin-right)
//                     width: 150, // increased width
//                     bgcolor: "#ffffff", // light grey background color
//                     borderRadius: "5px",
//                     boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//                   },
//                 }}
//                 anchorOrigin={{
//                   vertical: "bottom",
//                   horizontal: "right",
//                 }}
//                 transformOrigin={{
//                   vertical: "top",
//                   horizontal: "right",
//                 }}
//               >
//                 <MenuItem
//                   onClick={() => handleDropdownItemClick("/profile-settings")}
//                   sx={{ py: 1, fontSize: "16px", fontWeight: "500", color: "#333" }}
//                 >
//                   Profile
//                 </MenuItem>
//                 <MenuItem
//                 onClick={handleLogout}
//                 sx={{ py: 1, fontSize: "16px", fontWeight: "500", color: "#333" }}
//               >
//                 Logout
//               </MenuItem>
//               </Menu>

//             </Box>
//           </Box>

//         </Stack>
//       </Box>
//     </Box>
//   );
// };

// export default SectionHeader;