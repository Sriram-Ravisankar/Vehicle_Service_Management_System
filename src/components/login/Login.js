import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
    Visibility,
    VisibilityOff,
    BuildCircle,
    DirectionsCarFilled,
    Settings,
  } from "@mui/icons-material";
import apiEndpoints from "../../apiconfig";
import backgroundImage from "../../assets/bgimage.png";
import spanner from "../../assets/spanner.png";

// NEW PRIMARY COLORS
const primaryColor = "rgba(139, 92, 246, 0.9)";
const primaryHover = "rgba(139, 92, 246, 1)";

// HD GARAGE BACKGROUND IMAGE
const garageBackground = backgroundImage;

const LoginPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showPassword, setShowPassword] = useState(false);
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [formData, setFormData] = useState({
    Name: "",
    Email: "",
    Password: "",
    loginEmail: "",
    loginPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const logoutMessage = sessionStorage.getItem("logoutMessage");

    if (logoutMessage) {
      setSnackbar({
        open: true,
        message: "Logged out successfully",
        severity: "success",
      });

      sessionStorage.removeItem("logoutMessage");
    }
  }, []);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const togglePanel = () => setRightPanelActive(!rightPanelActive);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const validateLoginForm = () => {
    const errors = {};
    if (!formData.loginEmail.trim()) {
      errors.loginEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.loginEmail)) {
      errors.loginEmail = "Invalid email format";
    }
    if (!formData.loginPassword.trim()) {
      errors.loginPassword = "Password is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = async () => {
    const errors = {};

    if (!formData.Name.trim()) {
      errors.Name = "Name is required";
    }

    if (!formData.Email.trim()) {
      errors.Email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      errors.Email = "Invalid email format";
    } else {
      try {
        const response = await fetch(
          `${apiEndpoints.checkEmail}?email=${encodeURIComponent(formData.Email)}`
        );
        const data = await response.json();
        if (data.exists) {
          errors.Email = "Email already registered";
        }
      } catch (error) {
        console.error("Email check failed:", error);
      }
    }

    if (!formData.Password.trim()) {
      errors.Password = "Password is required";
    } else {
      if (formData.Password.length < 6) {
        errors.Password = "Password must be at least 6 characters";
      }

      const hasCapitalLetter = /[A-Z]/.test(formData.Password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.Password);

      if (!hasCapitalLetter || !hasSpecialChar) {
        let errorMessage = "";

        if (!hasCapitalLetter && !hasSpecialChar) {
          errorMessage =
            "Password must contain at least one capital letter and one special character";
        } else if (!hasCapitalLetter) {
          errorMessage = "Password must contain at least one capital letter";
        } else {
          errorMessage = "Password must contain at least one special character";
        }

        errors.Password = errors.Password
          ? `${errors.Password}, ${errorMessage.toLowerCase()}`
          : errorMessage;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch(apiEndpoints.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.loginEmail,
          password: formData.loginPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to login");
      }

      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user_guid", data.user.user_guid);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("userName", data.user.userName);
        localStorage.setItem("role_id", data.user.role_id);
        localStorage.setItem("role_name", data.user.role_name);
        localStorage.setItem(
          "permissions",
          JSON.stringify(data.user.permissions)
        );

        setSnackbar({
          open: true,
          message: "Login Successful",
          severity: "success",
        });
        setFormData((prev) => ({
          ...prev,
          loginEmail: "",
          loginPassword: "",
        }));
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);

        sessionStorage.setItem("token", data.token);
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login Error:", error);
      setSnackbar({
        open: true,
        message: "Failed to login — please check the credentials",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!(await validateRegisterForm())) return;

    setIsLoading(true);
    try {
      const response = await fetch(apiEndpoints.register, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: formData.Name,
          email: formData.Email,
          password: formData.Password,
          role_id: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      if (data.success) {
        setSnackbar({
          open: true,
          message: "🎉 Registration successful! Please login.",
          severity: "success",
        });
        setFormData((prev) => ({
          ...prev,
          Name: "",
          Email: "",
          Password: "",
        }));
        togglePanel();
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Register Error:", error);
      setSnackbar({
        open: true,
        message: error.message || "Registration failed. Please try again.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

    const socialIcons = (
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, my: 3 }}>
        {[
          { Icon: BuildCircle, label: "Repairs" },
          { Icon: DirectionsCarFilled, label: "Vehicles" },
          { Icon: Settings, label: "Maintenance" },
        ].map(({ Icon, label }, index) => (
          <IconButton
            key={index}
            sx={{
              border: "1px solid #ddd",
              borderRadius: "50%",
              width: 40,
              height: 40,
            }}
            title={label}
          >
            <Icon />
          </IconButton>
        ))}
      </Box>
    );

  const overlayButtonStyles = {
    color: "#000",
    backgroundColor: "#fff",
    borderRadius: "30px",
    py: 1.5,
    px: 4,
    fontSize: "14px",
    fontWeight: 500,
    width: "180px",
    mt: 2,
    "&:hover": {
      backgroundColor: "#F1F1F1",
    },
  };

  const formButtonStyles = {
    backgroundColor: primaryColor,
    color: "#fff",
    borderRadius: "30px",
    py: 1.5,
    px: 4,
    fontSize: "14px",
    fontWeight: 600,
    width: "100%",
    maxWidth: "300px",
    mt: 3,
    ml: 1.8,
    "&:hover": {
      backgroundColor: primaryHover,
    },
  };

  const inputFieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#F5F5F5",
      borderRadius: "8px",
      "& fieldset": {
        border: "none",
      },
      "&:hover fieldset": {
        border: `1px solid ${primaryColor}`,
      },
    },
    width: "100%",
    maxWidth: "400px",
    my: 1,
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 2,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${garageBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "800px",
          minHeight: isMobile ? "auto" : "560px",
          bgcolor: "#fff",
          borderRadius: "16px",
          boxShadow: 3,
          position: "relative",
          overflow: "hidden",
          height: isMobile ? "auto" : "auto",
        }}
      >
        {!isMobile ? (
          <>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "50%",
                height: "100%",
                transition: "all 0.6s ease-in-out",
                opacity: rightPanelActive ? 1 : 0,
                zIndex: rightPanelActive ? 5 : 1,
                transform: rightPanelActive
                  ? "translateX(100%)"
                  : "translateX(0)",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 4,
                  textAlign: "center",
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  Create Account
                </Typography>
                {/* {socialIcons} */}
                <Typography color="black" mb={1}>
                  or use your email for registration
                </Typography>
                <TextField
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  placeholder="Name"
                  variant="outlined"
                  sx={inputFieldStyles}
                  error={!!formErrors.Name}
                  helperText={formErrors.Name}
                />
                <TextField
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  placeholder="Email"
                  variant="outlined"
                  sx={inputFieldStyles}
                  error={!!formErrors.Email}
                  helperText={formErrors.Email}
                />
                <TextField
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  sx={inputFieldStyles}
                  error={!!formErrors.Password}
                  helperText={formErrors.Password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowPassword}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  sx={formButtonStyles}
                  onClick={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "50%",
                height: "100%",
                zIndex: 2,
                transition: "all 0.6s ease-in-out",
                opacity: rightPanelActive ? 0 : 1,
                transform: rightPanelActive
                  ? "translateX(100%)"
                  : "translateX(0)",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 4,
                  textAlign: "center",
                }}
              >
                <Typography variant="h5" fontWeight="bold" mb={1}>
                  Sign In
                </Typography>
                {/* {socialIcons} */}
                <Typography color="black" mb={2}>
                  Login with your account
                </Typography>
                <TextField
                  name="loginEmail"
                  value={formData.loginEmail}
                  onChange={handleChange}
                  placeholder="Email"
                  variant="outlined"
                  sx={inputFieldStyles}
                  error={!!formErrors.loginEmail}
                  helperText={formErrors.loginEmail}
                />
                <TextField
                  name="loginPassword"
                  value={formData.loginPassword}
                  onChange={handleChange}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  sx={inputFieldStyles}
                  error={!!formErrors.loginPassword}
                  helperText={formErrors.loginPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowPassword}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Typography color="#aaa" fontSize="0.8rem" mt={1}>
                  <span
                    style={{ color: primaryColor, cursor: "pointer" }}
                    onClick={() => navigate("/forgotpassword")}
                  >
                    Forgot your Password?
                  </span>
                </Typography>
                <Button
                  variant="contained"
                  sx={formButtonStyles}
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: "50%",
                width: "50%",
                height: "100%",
                zIndex: 100,
                overflow: "hidden",
                transition: "transform 0.6s ease-in-out",
                transform: rightPanelActive
                  ? "translateX(-100%)"
                  : "translateX(0)",
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(45deg, ${primaryColor}, ${primaryHover})`,
                  color: "#fff",
                  position: "relative",
                  left: "-100%",
                  width: "200%",
                  height: "100%",
                  display: "flex",
                  transition: "transform 0.6s ease-in-out",
                  transform: rightPanelActive
                    ? "translateX(50%)"
                    : "translateX(0)",
                }}
              >
                <Box
                  sx={{
                    width: "50%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    p: 4,
                  }}
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/55/55283.png"
                    alt="Car Logo"
                    style={{
                      width: "100px",
                      height: "90px",
                      marginBottom: "20px",
                    }}
                  />
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Welcome Back!
                  </Typography>
                  <Typography fontSize="0.9rem" mb={3}>
                    To keep connected, please login with your personal info
                  </Typography>
                  <Button onClick={togglePanel} sx={overlayButtonStyles}>
                    Sign In
                  </Button>
                </Box>
                <Box
                  sx={{
                    width: "50%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    p: 4,
                  }}
                >
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/55/55283.png"
                    alt="Car Logo"
                    style={{
                      width: "100px",
                      height: "90px",
                      marginBottom: "20px",
                    }}
                  />
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Hello, Friend!
                  </Typography>
                  <Typography fontSize="0.9rem" mb={3}>
                    Enter your personal details and start your journey with us
                  </Typography>
                  <Button onClick={togglePanel} sx={overlayButtonStyles}>
                    Sign Up
                  </Button>
                </Box>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ p: 4 }}>
            {rightPanelActive ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Typography variant="h5" fontWeight="bold">
                  Create Account
                </Typography>
                {/* {socialIcons} */}
                <Typography color="black" mb={1}>
                  or use your email for registration
                </Typography>
                <TextField
                  name="Name"
                  value={formData.Name}
                  onChange={handleChange}
                  placeholder="Name"
                  variant="outlined"
                  sx={inputFieldStyles}
                  error={!!formErrors.Name}
                  helperText={formErrors.Name}
                />
                <TextField
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  placeholder="Email"
                  variant="outlined"
                  sx={inputFieldStyles}
                  error={!!formErrors.Email}
                  helperText={formErrors.Email}
                />
                <TextField
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  sx={inputFieldStyles}
                  error={!!formErrors.Password}
                  helperText={formErrors.Password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowPassword}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  sx={formButtonStyles}
                  onClick={handleRegister}
                  disabled={isLoading}
                >
                  {isLoading ? "Registering..." : "Register"}
                </Button>
                <Typography
                  color={primaryColor}
                  fontSize="0.9rem"
                  mt={2}
                  sx={{ cursor: "pointer" }}
                  onClick={togglePanel}
                >
                  Already have an account? Sign In
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                }}
              >
                <Typography variant="h5" fontWeight="bold" mb={1}>
                  Sign In
                </Typography>
                {/* {socialIcons} */}
                <Typography color="black" mb={2}>
                  Login with your account
                </Typography>
                <TextField
                  name="loginEmail"
                  value={formData.loginEmail}
                  onChange={handleChange}
                  placeholder="Email"
                  variant="outlined"
                  sx={inputFieldStyles}
                  error={!!formErrors.loginEmail}
                  helperText={formErrors.loginEmail}
                />
                <TextField
                  name="loginPassword"
                  value={formData.loginPassword}
                  onChange={handleChange}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  sx={inputFieldStyles}
                  error={!!formErrors.loginPassword}
                  helperText={formErrors.loginPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowPassword}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Typography color="#aaa" fontSize="0.8rem" mt={1}>
                  <span
                    style={{ color: primaryColor, cursor: "pointer" }}
                    onClick={() => navigate("/forgotpassword")}
                  >
                    Forgot your Password?
                  </span>
                </Typography>
                <Button
                  variant="contained"
                  sx={formButtonStyles}
                  onClick={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <Typography
                  color={primaryColor}
                  fontSize="0.9rem"
                  mt={2}
                  sx={{ cursor: "pointer" }}
                  onClick={togglePanel}
                >
                  Don't have an account? Sign Up
                </Typography>
              </Box>
            )}
          </Box>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default LoginPage;
