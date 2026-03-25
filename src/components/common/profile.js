import { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import {
  Edit as EditIcon,
  Person as PersonIcon,
  CameraAlt as CameraIcon,
  LibraryBooks as LibraryBooksIcon,
} from "@mui/icons-material";
import { Snackbar, Alert, Avatar, Box, Typography, Button } from "@mui/material";
import apiEndpoints from "../../apiconfig";
import { useNavigate } from "react-router-dom";
const ProfilePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pincode: "",
    profile_image: "",
    role_name: localStorage.getItem("role_name") || ""
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [originalData, setOriginalData] = useState(null);
  const [activeField, setActiveField] = useState(null);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Color scheme - Neutral theme

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const fetchStates = async () => {
    try {
      setLoadingStates(true);
      const response = await fetch(`${apiEndpoints.locations}?type=states`);
      const data = await response.json();

      if (data.status === "success") {
        const validStates = data.data.filter(
          (state) =>
            state.state_id && state.state_name && state.state_name !== "0"
        );
        setStates(validStates);
      }
    } catch (error) {
      console.error("Error fetching states:", error);
      setStates([]);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (stateId) => {
    if (!stateId) {
      setCities([]);
      return;
    }

    try {
      setLoadingCities(true);
      const response = await fetch(
        `${apiEndpoints.locations}?type=cities&state_id=${stateId}`
      );
      const data = await response.json();

      if (data.status === "success") {
        setCities(data.data);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  };

  const fetchProfile = async () => {
    try {
      // show();
      const token = sessionStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(apiEndpoints.profile, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile data");
      }

      const data = await response.json();
      if (data.success && data.data) {
        const profileData = {
          userName: data.data.userName || "",
          phone_number: data.data.phone_number || "",
          email: data.data.email || "",
          address: data.data.address || "",
          city_id: data.data.city_id || "",
          state_id: data.data.state_id || "",
          pincode: data.data.pincode || "",
          profile_image: data.data.profile_image || "",
          role_name: data.data.role_name || localStorage.getItem("role_name") || ""
        };

        setFormData(profileData);

        if (data.data.profile_image) {
          setProfileImage(data.data.profile_image);
        }

        if (profileData.state_id) {
          await fetchCities(profileData.state_id);
        }
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(err.message);
    } finally {
      // hide();
    }
  };

  useEffect(() => {
    fetchStates();
    fetchProfile();
  }, []);

  useEffect(() => {
    if (formData.state_id) {
      fetchCities(formData.state_id);
    }
  }, [formData.state_id]);

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone_number") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 10) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }

    if (name === "pincode") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length <= 6) {
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
      }
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "state_id" ? { city_id: "" } : {}),
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    

    try {
      setIsLoading(true);
      // show();
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const payload = {
        ...formData,
      };

      if (!payload.profile_image?.startsWith("data:image/")) {
        delete payload.profile_image;
      }

      const response = await fetch(apiEndpoints.profile, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update profile");
      }

      if (result.profile_image) {
        setProfileImage(result.profile_image);
        setPreviewImage(null);
      }

      showSnackbar("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      console.error(err);
      showSnackbar(err.message || "Failed to update profile", "error");
    } finally {
      setIsLoading(false);
      // hide();
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 300,
        useWebWorker: true,
      };

      const compressed = await imageCompression(file, options);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setProfileImage(base64);
        setPreviewImage(base64);
        setFormData((prev) => ({
          ...prev,
          profile_image: base64,
        }));
      };

      reader.readAsDataURL(compressed);
    } catch (error) {
      console.error(error);
      showSnackbar("Image processing failed", "error");
    }
  };



  const getImagePreview = () => {
    if (previewImage) return previewImage;

    if (typeof profileImage === "string" && profileImage) {
      if (profileImage.startsWith("http")) return profileImage;
      return `${apiEndpoints.blob}${profileImage}`;
    }

    return null;
  };


  const [activeTab, setActiveTab] = useState("profile");

  const NavItem = ({ id, label, icon: Icon }) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => {
          if (id === "observations") {
             navigate("/observation-library");
             return;
          }
          setActiveTab(id);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
          active 
            ? "bg-blue-50 text-blue-600" 
            : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
        }`}
      >
        <Icon size={18} />
        {label}
      </button>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'white', borderRadius: 4, boxShadow: 1 }}>
            <Typography variant="h6" color="error">Error Loading Profile</Typography>
            <Typography color="textSecondary" sx={{ mb: 2 }}>{error}</Typography>
            <Button variant="contained" onClick={fetchProfile} color="primary">Retry</Button>
         </Box>
      </div>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: "100vh", backgroundColor: "#F8FAFC", width: "100%" }}>
      {/* Container with 100% width */}
      <div className="w-full">
        {/* Modern Header / Breadcrumb style */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>Manage your personal account and garage preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div style={{ width: 260, flexShrink: 0 }} className="flex flex-col gap-1.5">
            <NavItem id="profile" label="Profile" icon={PersonIcon} />
            <div style={{ marginTop: 8, paddingTop: 16, borderTop: "1px solid #E5E7EB" }}>
              <NavItem id="observations" label="Observation Library" icon={LibraryBooksIcon} />
            </div>
          </div>

          {/* Main Form Content */}
          <div className="flex-1">
            <div style={{ 
              backgroundColor: "#fff", 
              borderRadius: 16, 
              border: "1px solid #F1F5F9", 
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: "24px" 
            }}>
              {activeTab === "profile" && (
                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827", margin: 0 }}>Profile Details</h2>
                      {!isEditing && (
                        <button 
                          onClick={() => setIsEditing(true)}
                          style={{
                            padding: "8px 16px",
                            borderRadius: 10,
                            border: "1px solid #E5E7EB",
                            background: "#fff",
                            color: "#374151",
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            transition: "all 0.2s"
                          }}
                        >
                          <EditIcon style={{ fontSize: 16 }} />
                          Edit Profile
                        </button>
                      )}
                   </div>
                   
                   {/* Avatar & Role Info */}
                   <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 40 }}>
                      <div style={{ position: 'relative' }}>
                        <Avatar
                          src={getImagePreview()}
                          sx={{
                            width: 80,
                            height: 80,
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            backgroundColor: "#F8FAFC",
                            color: "#64748B",
                            border: "1px solid #F1F5F9"
                          }}
                        >
                          {formData.userName ? formData.userName.substring(0, 2).toUpperCase() : "AU"}
                        </Avatar>
                        {isEditing && (
                          <label htmlFor="avatar-input" style={{
                            position: 'absolute',
                            bottom: -2,
                            right: -2,
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            backgroundColor: '#fff',
                            border: '1px solid #E5E7EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                          }}>
                             <CameraIcon style={{ fontSize: 14, color: '#64748B' }} />
                          </label>
                        )}
                        <input
                          type="file"
                          id="avatar-input"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </div>
                      <div>
                         <div style={{ color: "#111827", fontWeight: 700, fontSize: 16 }}>{formData.userName}</div>
                         <div style={{ display: 'inline-block', marginTop: 4, padding: "2px 10px", borderRadius: 99, background: "#EFF6FF", color: "#2563EB", fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                            {formData.role_name || "User"}
                         </div>
                      </div>
                   </div>

                   {/* Editable Form */}
                   <form onSubmit={handleSaveChanges}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5" style={{ marginBottom: 32 }}>
                        <div className="space-y-1.5">
                          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Full Name</label>
                          <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              borderRadius: 10,
                              border: isEditing ? "1px solid #E2E8F0" : "1px solid transparent",
                              background: isEditing ? "#fff" : "#F9FAFB",
                              fontSize: 14,
                              color: "#111827",
                              outline: "none",
                              transition: "all 0.2s"
                            }}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Current Role</label>
                          <input
                            type="text"
                            value={formData.role_name}
                            disabled
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              borderRadius: 10,
                              border: "1px solid transparent",
                              background: "#F1F5F9",
                              fontSize: 14,
                              color: "#64748B",
                              cursor: "not-allowed",
                              textTransform: 'capitalize'
                            }}
                          />
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Email Address</label>
                          <input
                            type="email"
                            value={formData.email}
                            disabled
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              borderRadius: 10,
                              border: "1px solid transparent",
                              background: "#F1F5F9",
                              fontSize: 14,
                              color: "#64748B",
                              cursor: "not-allowed"
                            }}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Phone Number</label>
                          <input
                            type="tel"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              borderRadius: 10,
                              border: isEditing ? "1px solid #E2E8F0" : "1px solid transparent",
                              background: isEditing ? "#fff" : "#F9FAFB",
                              fontSize: 14,
                              color: "#111827"
                            }}
                          />
                        </div>

                        <div className="space-y-1.5">
                           <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Pincode</label>
                           <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            style={{
                              width: "100%",
                              padding: "10px 14px",
                              borderRadius: 10,
                              border: isEditing ? "1px solid #E2E8F0" : "1px solid transparent",
                              background: isEditing ? "#fff" : "#F9FAFB",
                              fontSize: 14,
                              color: "#111827"
                            }}
                          />
                        </div>
                      </div>

                      {isEditing && (
                        <div style={{ display: 'flex', gap: 12 }}>
                          <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                              padding: "10px 24px",
                              borderRadius: 10,
                              background: "#E11D48",
                              color: "#fff",
                              border: "none",
                              fontSize: 14,
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                          >
                            {isLoading ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                               setIsEditing(false);
                               fetchProfile();
                            }}
                            style={{
                              padding: "10px 24px",
                              borderRadius: 10,
                              background: "#F1F5F9",
                              color: "#475569",
                              border: "none",
                              fontSize: 14,
                              fontWeight: 600,
                              cursor: "pointer"
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                   </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={snackbarSeverity} sx={{ borderRadius: 2 }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;