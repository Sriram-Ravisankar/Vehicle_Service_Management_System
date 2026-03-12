import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  useMediaQuery
} from '@mui/material';
import { Email, ArrowBack, VpnKey, Visibility, VisibilityOff } from '@mui/icons-material';
import apiEndpoints from '../../apiconfig';
import imagelock from "../../assets/forgot.png";
import backgroundImage from "../../assets/bgimage.png";

// NEW PRIMARY COLORS matching the login page
const primaryColor = "rgba(249, 115, 22, 0.9)";
const primaryHover = "rgba(249, 115, 22, 1)";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [rightPanelActive, setRightPanelActive] = useState(false);

  const togglePanel = () => setRightPanelActive(!rightPanelActive);

  const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    return otp;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    switch (name) {
      case 'email':
        setEmail(value);
        break;
      case 'otp':
        if (/^\d*$/.test(value) && value.length <= 6) {
          setOtp(value);
        }
        break;
      case 'newPassword':
        setNewPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      default:
        break;
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const newErrors = {};

    if (!otp) {
      newErrors.otp = 'OTP is required';
    } else if (otp.length !== 6) {
      newErrors.otp = 'OTP must be 6 digits';
    } else if (otp !== generatedOtp) {
      newErrors.otp = 'Invalid OTP';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else {
      const hasCapitalLetter = /[A-Z]/.test(newPassword);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

      if (!hasCapitalLetter || !hasSpecialChar) {
        let errorMessage = 'Password must contain at least one ';
        if (!hasCapitalLetter) errorMessage += 'capital letter';
        if (!hasCapitalLetter && !hasSpecialChar) errorMessage += ' and ';
        if (!hasSpecialChar) errorMessage += 'special character';
        newErrors.newPassword = errorMessage;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (validateEmail()) {
      const otp = generateOtp();
      console.log('Sending OTP to:', email);
      console.log('Generated OTP:', otp);
      setSnackbar({
        open: true,
        message: `OTP sent to ${email}`,
        severity: 'success'
      });
      setStep(2);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (validateOtp()) {
      console.log('OTP verified successfully');
      setSnackbar({ open: true, message: 'OTP verified successfully!', severity: 'success' });
      setStep(3);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (validatePassword()) {
      setIsLoading(true);

      try {
        const response = await fetch(apiEndpoints.forgotpassword, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            newPassword: newPassword
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to reset password');
        }

        setSnackbar({
          open: true,
          message: data.message || 'Password reset successfully!',
          severity: 'success'
        });
        setTimeout(() => navigate('/'), 2000);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.message || 'Failed to reset password',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const inputFieldStyles = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#F5F5F5',
      borderRadius: '8px',
      '& fieldset': {
        border: 'none',
      },
      '&:hover fieldset': {
        border: `1px solid ${primaryColor}`,
      },
    },
    width: '100%',
    maxWidth: '400px',
    my: 1,
  };

  const formButtonStyles = {
    backgroundColor: primaryColor,
    color: '#fff',
    borderRadius: '30px',
    py: 1.5,
    px: 4,
    fontSize: '14px',
    fontWeight: 600,
    width: '100%',
    maxWidth: '300px',
    mt: 3,
    '&:hover': {
      backgroundColor: primaryHover,
    },
  };

  const overlayButtonStyles = {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: '30px',
    py: 1.5,
    px: 4,
    fontSize: '14px',
    fontWeight: 500,
    width: '180px',
    mt: 2,
    '&:hover': {
      backgroundColor: '#F1F1F1',
    },
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Email step 
        return (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            textAlign: 'center',
            px: 4
          }}>
            <Typography variant="h5" fontWeight="bold" mb={1}>Forgot Password</Typography>
            <Typography color="black" mb={2}>
              Enter your email to receive a password reset OTP
            </Typography>
            <TextField
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Email"
              variant="outlined"
              sx={inputFieldStyles}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email style={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={formButtonStyles}
            >
              Send OTP
            </Button>
          </Box>
        );

      case 2: // OTP verification step
        return (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            textAlign: 'center',
            px: 4
          }}>
            <Typography variant="h5" fontWeight="bold" mb={1}>Verify OTP</Typography>
            <Typography color="black" mb={2}>
              We've sent a 6-digit code to {email}
            </Typography>
            <TextField
              name="otp"
              value={otp}
              onChange={handleChange}
              placeholder="Enter OTP"
              variant="outlined"
              sx={inputFieldStyles}
              error={!!errors.otp}
              helperText={errors.otp}
              inputProps={{ maxLength: 6, inputMode: 'numeric' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKey style={{ color: '#64748b' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              sx={formButtonStyles}
            >
              Verify OTP
            </Button>
            <Typography color="#aaa" fontSize="0.8rem" mt={2}>
              Didn't receive code?{' '}
              <span
                style={{ color: primaryColor, cursor: 'pointer', fontWeight: 600 }}
                onClick={() => {
                  const newOtp = generateOtp();
                  console.log('Resending OTP to:', email);
                  console.log('New OTP:', newOtp);
                  setSnackbar({
                    open: true,
                    message: `OTP resent! New OTP is: ${newOtp}`,
                    severity: 'success'
                  });
                }}
              >
                Resend
              </span>
            </Typography>
          </Box>
        );

      case 3: // New password step
        return (
          <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            textAlign: 'center',
            px: 4
          }}>
            <Typography variant="h5" fontWeight="bold" mb={1}>Reset Password</Typography>
            <Typography color="black" mb={2}>
              Create a new password for {email}
            </Typography>
            <TextField
              name="newPassword"
              value={newPassword}
              onChange={handleChange}
              placeholder="New Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              sx={inputFieldStyles}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              sx={inputFieldStyles}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={formButtonStyles}
            >
              {isLoading ? 'Processing...' : 'Reset Password'}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  const renderRightPanel = () => {
    if (step === 1) {
      return (
        <Box sx={{
          width: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          p: 4,
        }}>
          <img
            src={imagelock}
            alt="Forgot Password"
            style={{
              width: "100px",
              height: "90px",
              marginBottom: "20px",
            }}
          />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Reset Your Password
          </Typography>
          <Typography fontSize="0.9rem" mb={3}>
            Enter your email to receive a password reset OTP and regain access to your account
          </Typography>
          <Button 
            onClick={() => navigate('/')} 
            sx={overlayButtonStyles}
          >
            Back to Login
          </Button>
        </Box>
      );
    } else if (step === 2) {
      return (
        <Box sx={{
          width: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          p: 4,
        }}>
          <img
            src={imagelock}
            alt="OTP Verification"
            style={{
              width: "100px",
              height: "90px",
              marginBottom: "20px",
            }}
          />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Verify OTP
          </Typography>
          <Typography fontSize="0.9rem" mb={3}>
            Check your email for the 6-digit code to continue resetting your password
          </Typography>
          <Button 
            onClick={() => setStep(1)} 
            sx={overlayButtonStyles}
          >
            Change Email
          </Button>
        </Box>
      );
    } else if (step === 3) {
      return (
        <Box sx={{
          width: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          p: 4,
        }}>
          <img
            src={imagelock}
            alt="New Password"
            style={{
              width: "100px",
              height: "90px",
              marginBottom: "20px",
            }}
          />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Set New Password
          </Typography>
          <Typography fontSize="0.9rem" mb={3}>
            Create a strong new password to secure your account
          </Typography>
          <Button 
            onClick={() => setStep(2)} 
            sx={overlayButtonStyles}
          >
            Back to OTP
          </Button>
        </Box>
      );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 2,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${backgroundImage})`,
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
            {/* Left Panel - Form */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "50%",
                height: "100%",
                zIndex: 2,
              }}
            >
              <Box sx={{ p: 4, height: '100%' }}>
                <Box sx={{ mb: 2 }}>
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={() => step === 1 ? navigate('/') : setStep(step - 1)}
                    sx={{
                      color: primaryColor,
                      textTransform: "none",
                    }}
                  >
                    Back
                  </Button>
                </Box>

                <form onSubmit={
                  step === 1 ? handleSendOtp :
                    step === 2 ? handleVerifyOtp :
                      handleResetPassword
                } style={{ height: 'calc(100% - 60px)' }}>
                  {renderStep()}
                </form>
              </Box>
            </Box>

            {/* Right Panel - Info */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: "50%",
                width: "50%",
                height: "100%",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(45deg, ${primaryColor}, ${primaryHover})`,
                  color: "#fff",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                {renderRightPanel()}
              </Box>
            </Box>
          </>
        ) : (
          // Mobile View
          <Box sx={{ p: 4 }}>
            <Box sx={{ mb: 2 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => step === 1 ? navigate('/') : setStep(step - 1)}
                sx={{
                  color: primaryColor,
                  textTransform: "none",
                }}
              >
                Back
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              {/* Mobile header with icon */}
              <Box sx={{ mb: 3 }}>
                <img
                  src={imagelock}
                  alt="Forgot Password"
                  style={{
                    width: "80px",
                    height: "70px",
                    marginBottom: "15px",
                  }}
                />
                {step === 1 && (
                  <>
                    <Typography variant="h5" fontWeight="bold" mb={1}>
                      Forgot Password
                    </Typography>
                    <Typography color="black" mb={2}>
                      Enter your email to receive a password reset OTP
                    </Typography>
                  </>
                )}
                {step === 2 && (
                  <>
                    <Typography variant="h5" fontWeight="bold" mb={1}>
                      Verify OTP
                    </Typography>
                    <Typography color="black" mb={2}>
                      We've sent a 6-digit code to {email}
                    </Typography>
                  </>
                )}
                {step === 3 && (
                  <>
                    <Typography variant="h5" fontWeight="bold" mb={1}>
                      Reset Password
                    </Typography>
                    <Typography color="black" mb={2}>
                      Create a new password for {email}
                    </Typography>
                  </>
                )}
              </Box>

              <form onSubmit={
                step === 1 ? handleSendOtp :
                  step === 2 ? handleVerifyOtp :
                    handleResetPassword
              } style={{ width: '100%' }}>
                {step === 1 && (
                  <TextField
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Email"
                    variant="outlined"
                    sx={inputFieldStyles}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email style={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                {step === 2 && (
                  <TextField
                    name="otp"
                    value={otp}
                    onChange={handleChange}
                    placeholder="Enter OTP"
                    variant="outlined"
                    sx={inputFieldStyles}
                    error={!!errors.otp}
                    helperText={errors.otp}
                    inputProps={{ maxLength: 6, inputMode: 'numeric' }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKey style={{ color: '#64748b' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                {step === 3 && (
                  <>
                    <TextField
                      name="newPassword"
                      value={newPassword}
                      onChange={handleChange}
                      placeholder="New Password"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      sx={inputFieldStyles}
                      error={!!errors.newPassword}
                      helperText={errors.newPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm Password"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      sx={inputFieldStyles}
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  sx={formButtonStyles}
                >
                  {step === 1 && 'Send OTP'}
                  {step === 2 && 'Verify OTP'}
                  {step === 3 && (isLoading ? 'Processing...' : 'Reset Password')}
                </Button>

                {step === 2 && (
                  <Typography color="#aaa" fontSize="0.8rem" mt={2}>
                    Didn't receive code?{' '}
                    <span
                      style={{ color: primaryColor, cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => {
                        const newOtp = generateOtp();
                        setSnackbar({
                          open: true,
                          message: `OTP resent! New OTP is: ${newOtp}`,
                          severity: 'success'
                        });
                      }}
                    >
                      Resend
                    </span>
                  </Typography>
                )}
              </form>

              {/* Mobile navigation */}
              <Typography
                color={primaryColor}
                fontSize="0.9rem"
                mt={3}
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate('/')}
              >
                Back to Login
              </Typography>
            </Box>
          </Box>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
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

export default ForgotPassword;