import { useState, useEffect } from "react";
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
  } from "@mui/icons-material";
import apiEndpoints from "../../apiconfig";
import backgroundImage from "../../assets/bgimage.jpeg";

// NEW PRIMARY COLORS
const primaryColor = "rgba(14, 165, 233, 0.9)";
const primaryHover = "rgba(14, 165, 233, 1)";

// HD GARAGE BACKGROUND IMAGE
const garageBackground = backgroundImage;

const LoginPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
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
    textTransform: "uppercase",
    letterSpacing: "1px",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: primaryHover,
      transform: "translateY(-2px)",
      boxShadow: `0 8px 20px -8px ${primaryColor}`,
    },
  };

  const inputFieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "rgba(255, 255, 255, 0.3)",
      backdropFilter: "blur(5px)",
      borderRadius: "12px",
      transition: "all 0.2s ease",
      "& fieldset": {
        border: "1px solid transparent",
      },
      "&:hover fieldset": {
        border: `1px solid rgba(14, 165, 233, 0.2)`,
      },
      "&.Mui-focused fieldset": {
        border: `2px solid ${primaryColor}`,
      },
    },
    width: "100%",
    maxWidth: "400px",
    my: 1.2,
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
          maxWidth: "450px",
          minHeight: "560px",
          bgcolor: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(16px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ p: isMobile ? 4 : 6 }}>
          <Box
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/55/55283.png"
              alt="Car Logo"
              style={{
                width: "80px",
                height: "70px",
                marginBottom: "16px",
              }}
            />
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: primaryColor, mb: 1 }}
            >
              Garage Management System
            </Typography>
            {/* <Typography
              variant="h4"
              fontWeight="bold"
              color="text.primary"
              gutterBottom
            >
              Sign In
            </Typography> */}
            <Typography variant="body1" color="text.secondary" mb={4}>
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
              type="submit"
              variant="contained"
              sx={formButtonStyles}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "LOG IN"}
            </Button>
          </Box>
        </Box>

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
