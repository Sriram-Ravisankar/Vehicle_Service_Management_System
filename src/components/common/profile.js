import React, { useState, useEffect } from "react";
import imageCompression from "browser-image-compression";
import {
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Public as PublicIcon,
  LocationCity as LocationCityIcon,
  Schedule as ScheduleIcon,
  Home as HomeIcon,
  CameraAlt as CameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import Select from "@mui/material/Select";
import { Snackbar, Alert, CircularProgress, Avatar, Chip } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import apiEndpoints from "../../apiconfig";
import { useLoading } from "../../pages/LoadingContext";
const ProfilePage = () => {
  const {show, hide} = useLoading();
  const [formData, setFormData] = useState({
    userName: "",
    phone_number: "",
    email: "",
    address: "",
    city_id: "",
    state_id: "",
    pincode: "",
    profile_image: "",
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

  // Color scheme
  const primaryColor = "rgba(139, 92, 246, 1)";
  const primaryLight = "rgba(254, 215, 170, 0.2)";
  const primaryDark = "rgba(194, 65, 12, 1)";
  const gradient = `linear-gradient(135deg, ${primaryColor}, ${primaryDark})`;

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

  const toggleEditMode = () => {
    if (!isEditing) {
      setOriginalData({
        formData: { ...formData },
        profileImage: profileImage,
        previewImage: previewImage,
      });
      setIsEditing(true);
    } else {
      if (originalData) {
        setFormData(originalData.formData);
        setProfileImage(originalData.profileImage);
        setPreviewImage(originalData.previewImage);
      }
      setIsEditing(false);
    }
  };

  const resolvedStateName =
    states.find((s) => String(s.state_id) === String(formData.state_id))
      ?.state_name || "";
  const resolvedCityName =
    cities.find((c) => String(c.city_id) === String(formData.city_id))
      ?.city_name || "";

  const getImagePreview = () => {
    if (previewImage) return previewImage;

    if (typeof profileImage === "string" && profileImage) {
      if (profileImage.startsWith("http")) return profileImage;
      return `${apiEndpoints.blob}${profileImage}`;
    }

    return null;
  };


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-orange-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-red-500">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Profile</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchProfile}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-300"
              style={{ background: gradient }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your personal information and preferences
          </p>
        </div>

        {/* Main Content Container - Using flex for equal heights */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Left Panel - Profile Card */}
          <div className="lg:w-1/3 flex">
            <div className="bg-white rounded-2xl shadow-lg shadow-gray-300/50 overflow-hidden border border-gray-100 flex flex-col h-full w-full">
              {/* Profile Header - Made smaller */}
              <div className="h-24 relative" style={{ background: gradient }}>
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <Avatar
                      src={getImagePreview()}
                      alt={formData.userName}
                      sx={{
                        width: 80,
                        height: 80,
                        border: "4px solid white",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        fontSize: "1.75rem",
                        backgroundColor: primaryColor,
                      }}
                    >
                      {formData.userName.charAt(0).toUpperCase()}
                    </Avatar>

                    {isEditing && (
                      <label
                        htmlFor="profile-upload"
                        className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200 border border-orange-200"
                      >
                        <CameraIcon
                          className="w-4 h-4"
                          style={{ color: primaryColor }}
                        />
                        <input
                          type="file"
                          id="profile-upload"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Info - More compact */}
              <div className="pt-12 px-5 pb-5 flex-1">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-1 truncate px-2">
                    {formData.userName}
                  </h2>
                  <Chip
                    label="Verified User"
                    icon={<CheckCircleIcon />}
                    size="small"
                    sx={{
                      backgroundColor: primaryLight,
                      color: primaryDark,
                      fontWeight: 500,
                      fontSize: "0.75rem",
                    }}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center p-2.5 rounded-xl hover:bg-orange-50 transition-colors">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                      style={{ backgroundColor: primaryLight }}
                    >
                      <EmailIcon
                        className="w-4 h-4"
                        style={{ color: primaryColor }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {formData.email}
                      </p>
                    </div>
                  </div>

                  {formData.phone_number && (
                    <div className="flex items-center p-2.5 rounded-xl hover:bg-orange-50 transition-colors">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                        style={{ backgroundColor: primaryLight }}
                      >
                        <PhoneIcon
                          className="w-4 h-4"
                          style={{ color: primaryColor }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formData.phone_number}
                        </p>
                      </div>
                    </div>
                  )}

                  {(resolvedStateName || resolvedCityName) && (
                    <div className="flex items-center p-2.5 rounded-xl hover:bg-orange-50 transition-colors">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                        style={{ backgroundColor: primaryLight }}
                      >
                        <LocationCityIcon
                          className="w-4 h-4"
                          style={{ color: primaryColor }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {resolvedCityName}
                          {resolvedCityName && resolvedStateName ? ", " : ""}
                          {resolvedStateName}
                        </p>
                      </div>
                    </div>
                  )}

                  {formData.address && (
                    <div className="flex items-center p-2.5 rounded-xl hover:bg-orange-50 transition-colors">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center mr-3 flex-shrink-0"
                        style={{ backgroundColor: primaryLight }}
                      >
                        <HomeIcon
                          className="w-4 h-4"
                          style={{ color: primaryColor }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {formData.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Edit Button - At the bottom */}
                <div className="mt-6 pt-5 border-t border-orange-100">
                  <button
                    onClick={toggleEditMode}
                    className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
                      isEditing
                        ? "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200"
                        : "text-white hover:shadow-lg"
                    }`}
                    style={isEditing ? {} : { background: gradient }}
                  >
                    {isEditing ? (
                      <>
                        <CancelIcon className="w-4 h-4" />
                        <span>Cancel</span>
                      </>
                    ) : (
                      <>
                        <EditIcon className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="lg:w-2/3 flex">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 h-full w-full p-6 md:p-8 flex flex-col">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                    {isEditing ? "Edit Profile" : "Personal Information"}
                  </h3>
                  <p className="text-gray-500 mt-1 text-sm md:text-base">
                    {isEditing
                      ? "Update your details below"
                      : "View your personal information"}
                  </p>
                </div>
                {!isEditing && (
                  <div
                    className="hidden md:block px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: primaryLight,
                      color: primaryDark,
                    }}
                  >
                    Last updated: Today
                  </div>
                )}
              </div>

              <form
                onSubmit={
                  isEditing ? handleSaveChanges : (e) => e.preventDefault()
                }
                className="flex-1"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* User Name */}
                  <div className="space-y-1 md:space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2">
                        <PersonIcon className="w-4 h-4" />
                        Full Name
                      </span>
                    </label>
                    <input
                      type="text"
                      name="userName"
                      value={formData.userName}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("userName")}
                      onBlur={() => setActiveField(null)}
                      disabled={!isEditing}
                      className={`w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all duration-200 text-sm md:text-base ${
                        isEditing
                          ? `border ${
                              activeField === "userName"
                                ? "border-orange-500 ring-1 ring-orange-200"
                                : "border-gray-200"
                            } bg-white focus:outline-none`
                          : "border-transparent bg-gray-50"
                      }`}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1 md:space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2">
                        <EmailIcon className="w-4 h-4" />
                        Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled={true}
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-gray-50 border-transparent text-sm md:text-base"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1 md:space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2">
                        <PhoneIcon className="w-4 h-4" />
                        Phone Number
                      </span>
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("phone_number")}
                      onBlur={() => setActiveField(null)}
                      disabled={!isEditing}
                      maxLength={10}
                      className={`w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all duration-200 text-sm md:text-base ${
                        isEditing
                          ? `border ${
                              activeField === "phone_number"
                                ? "border-orange-500 ring-1 ring-orange-200"
                                : "border-gray-200"
                            } bg-white focus:outline-none`
                          : "border-transparent bg-gray-50"
                      }`}
                    />
                  </div>

                  {/* State */}
                  <div className="space-y-1 md:space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2">
                        <PublicIcon className="w-4 h-4" />
                        State
                      </span>
                    </label>
                    {isEditing ? (
                      <Select
                        value={formData.state_id}
                        onChange={(e) =>
                          handleInputChange({
                            target: { name: "state_id", value: e.target.value },
                          })
                        }
                        onFocus={() => setActiveField("state_id")}
                        onBlur={() => setActiveField(null)}
                        displayEmpty
                        disabled={!isEditing}
                        variant="outlined"
                        sx={{
                          width: "100%",
                          borderRadius: "12px",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor:
                              activeField === "state_id"
                                ? primaryColor
                                : "#d1d5db",
                            borderWidth: "1px",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: primaryColor,
                            borderWidth: "2px",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: primaryColor,
                          },
                          "& .MuiSelect-select": {
                            padding: "10px 14px",
                            fontSize: "0.875rem",
                            "@media (min-width: 768px)": {
                              fontSize: "1rem",
                              padding: "11.5px 14px",
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select State</MenuItem>
                        {states.map((state) => (
                          <MenuItem key={state.state_id} value={state.state_id}>
                            {state.state_name}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <input
                        type="text"
                        value={resolvedStateName}
                        disabled
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-gray-50 border-transparent text-sm md:text-base"
                      />
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-1 md:space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2">
                        <LocationCityIcon className="w-4 h-4" />
                        City
                      </span>
                    </label>
                    {isEditing ? (
                      <Select
                        value={formData.city_id}
                        onChange={(e) =>
                          handleInputChange({
                            target: { name: "city_id", value: e.target.value },
                          })
                        }
                        onFocus={() => setActiveField("city_id")}
                        onBlur={() => setActiveField(null)}
                        displayEmpty
                        disabled={
                          !isEditing || loadingCities || !formData.state_id
                        }
                        variant="outlined"
                        sx={{
                          width: "100%",
                          borderRadius: "12px",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor:
                              activeField === "city_id"
                                ? primaryColor
                                : "#d1d5db",
                            borderWidth: "1px",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: primaryColor,
                            borderWidth: "2px",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: primaryColor,
                          },
                          "& .MuiSelect-select": {
                            padding: "10px 14px",
                            fontSize: "0.875rem",
                            "@media (min-width: 768px)": {
                              fontSize: "1rem",
                              padding: "11.5px 14px",
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select City</MenuItem>
                        {cities.map((city) => (
                          <MenuItem key={city.city_id} value={city.city_id}>
                            {city.city_name}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : (
                      <input
                        type="text"
                        value={resolvedCityName}
                        disabled
                        className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-gray-50 border-transparent text-sm md:text-base"
                      />
                    )}
                  </div>

                  {/* Pincode */}
                  <div className="space-y-1 md:space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2">
                        <ScheduleIcon className="w-4 h-4" />
                        Pincode
                      </span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("pincode")}
                      onBlur={() => setActiveField(null)}
                      disabled={!isEditing}
                      maxLength={6}
                      className={`w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all duration-200 text-sm md:text-base ${
                        isEditing
                          ? `border ${
                              activeField === "pincode"
                                ? "border-orange-500 ring-1 ring-orange-200"
                                : "border-gray-200"
                            } bg-white focus:outline-none`
                          : "border-transparent bg-gray-50"
                      }`}
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2 space-y-1 md:space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-2">
                        <HomeIcon className="w-4 h-4" />
                        Address
                      </span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      onFocus={() => setActiveField("address")}
                      onBlur={() => setActiveField(null)}
                      disabled={!isEditing}
                      rows={2}
                      className={`w-full px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all duration-200 resize-none text-sm md:text-base ${
                        isEditing
                          ? `border ${
                              activeField === "address"
                                ? "border-orange-500 ring-1 ring-orange-200"
                                : "border-gray-200"
                            } bg-white focus:outline-none`
                          : "border-transparent bg-gray-50"
                      }`}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-end gap-3 md:gap-4">
                      <button
                        type="button"
                        onClick={toggleEditMode}
                        className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors duration-200 text-sm md:text-base"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 md:px-6 py-2 md:py-2.5 rounded-xl font-semibold text-white transition-all duration-300 flex items-center gap-2 hover:shadow-lg disabled:opacity-70 text-sm md:text-base"
                        style={{ background: gradient }}
                      >
                        {isLoading ? (
                          <>
                            <CircularProgress
                              size={16}
                              style={{ color: "white" }}
                            />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <SaveIcon className="w-4 h-4 md:w-5 md:h-5" />
                            <span>Update</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            backgroundColor:
              snackbarSeverity === "success" ? primaryLight : "#fee",
            color: snackbarSeverity === "success" ? primaryDark : "#d32f2f",
            "& .MuiAlert-icon": {
              color: snackbarSeverity === "success" ? primaryColor : "#d32f2f",
            },
          }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProfilePage;