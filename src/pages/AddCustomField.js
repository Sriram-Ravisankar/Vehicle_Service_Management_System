import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Paper,
  useTheme
} from '@mui/material';

const AddCustomFieldForm = () => {
  const theme = useTheme();

  return (
    <Box sx={{
      maxWidth: '500px',
      margin: 'auto',
      padding: 3
    }}>
      <Paper elevation={3} sx={{
        padding: 4,
        borderRadius: 2
      }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{
          fontWeight: 600,
          marginBottom: 4,
          color: theme.palette.text.primary
        }}>
          Add Custom Field
        </Typography>

        {/* Form Name */}
        <TextField
          select
          label="Form Name*"
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
          defaultValue=""
        >
          <MenuItem value="">Select Form Name</MenuItem>
          {/* Add your actual form name options here */}
        </TextField>

        {/* Label */}
        <TextField
          label="Label*"
          variant="outlined"
          fullWidth
          placeholder="Enter Label Name"
          sx={{ mb: 3 }}
        />

        {/* Type */}
        <TextField
          select
          label="Type*"
          variant="outlined"
          fullWidth
          sx={{ mb: 3 }}
          defaultValue=""
        >
          <MenuItem value="">Select Type</MenuItem>
          {/* Add your actual type options here */}
        </TextField>

        {/* Required */}
        <Typography variant="body1" component="div" sx={{ mb: 1 }}>
          Required*
        </Typography>
        <RadioGroup row sx={{ mb: 3 }}>
          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>

        {/* Always visible */}
        <Typography variant="body1" component="div" sx={{ mb: 1 }}>
          Always visible*
        </Typography>
        <RadioGroup row sx={{ mb: 4 }}>
          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>

        {/* Submit Button */}
        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{
            padding: '10px',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          SUBMIT
        </Button>
      </Paper>
    </Box>
  );
};

export default AddCustomFieldForm;