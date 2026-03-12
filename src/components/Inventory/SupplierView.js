import React from "react";
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  Avatar,
  IconButton,
} from "@mui/material";
import { Email, LocationOn, Edit } from "@mui/icons-material";
import { FaPhoneAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../common/Header";

const UserProfile = () => {
  const navigate = useNavigate();
  const [tab, setTab] = React.useState(0);

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
  };

  return (
    <Box sx={{ fontFamily: "Montserrat", p: 2 }}>
      <SectionHeader />

      <Box
        sx={{
          backgroundColor: "#152a45",
          color: "#fff",
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
            sx={{ width: 80, height: 80, backgroundColor: "#fff" }}
          />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Sarah Smith
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FaPhoneAlt />
              <Typography>9876543210</Typography>
              <Email sx={{ ml: 2 }} />
              <Typography>Sarah@example.com</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
              <LocationOn sx={{ mr: 1 }} />
              <Typography>123 Maple Street,</Typography>
            </Box>
          </Box>
        </Box>
        <IconButton sx={{ color: "#fff" }}>
          <Edit />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 3 }}>
        <Tab label="GENERAL" />
        <Tab label="NOTES" />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Email</strong>
              </Typography>
              <Typography color="textSecondary">sarah@example.com</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Gender</strong>
              </Typography>
              <Typography color="textSecondary">Male</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography>
                <strong>Company Name</strong>
              </Typography>
              <Typography color="textSecondary">
                Auto Parts Distributors
              </Typography>
            </Grid>
          </Grid>

          {/* More Info */}
          <Box container spacing={2} sx={{ mt: 4 }}>
            <Box
              sx={{ mt: 4, border: "1px solid #ddd", borderRadius: 1, p: 2 }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                More Info.
              </Typography>
              <Typography>
                Product Name: <strong>Brake Pads</strong>
              </Typography>
              <Typography>
                Landline No.:{" "}
                <strong style={{ color: "gray" }}>Not Added</strong>
              </Typography>
            </Box>

            {/* Address Details */}
            <Box
              sx={{ mt: 4, border: "1px solid #ddd", borderRadius: 1, p: 2 }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                Address Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography>
                    Country: <strong>Guam</strong>
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography>
                    State: <strong>Yigo</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Town/City: <strong>Anderson Air Force Base</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default UserProfile;
