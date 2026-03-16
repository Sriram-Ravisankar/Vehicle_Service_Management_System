import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Grid,
  Stack,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";

const labelStyle = {
  width: { xs: "100%", sm: "180px" },
  fontSize: "0.9rem",
  fontWeight: 500,
  mb: { xs: 1, sm: 0 },
};

const inputStyle = {
  width: { xs: "100%", sm: "300px" },
};

const CustomerFieldForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    formName: "Customer",
    labelName: "",
    fieldType: "Text",
    isRequired: "No",
    isVisible: "Yes",
  });

  const isEditMode = Boolean(location.state?.fieldData);

  useEffect(() => {
    if (location.state?.fieldData) {
      const { fieldData } = location.state;
      setFormData({
        formName: fieldData.formName || "Customer",
        labelName: fieldData.labelName || "",
        fieldType: fieldData.fieldType || "Text",
        isRequired: fieldData.isRequired ? "Yes" : "No",
        isVisible: fieldData.isVisible ? "Yes" : "No",
      });
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const existingFields = JSON.parse(
      localStorage.getItem("customFields") || "[]"
    );
    const fieldToSave = {
      id: isEditMode ? location.state.fieldData.id : Date.now().toString(),
      formName: formData.formName,
      labelName: formData.labelName,
      fieldType: formData.fieldType,
      isRequired: formData.isRequired === "Yes",
      isVisible: formData.isVisible === "Yes",
    };

    const updatedFields = isEditMode
      ? existingFields.map((field) =>
          field.id === location.state.fieldData.id ? fieldToSave : field
        )
      : [...existingFields, fieldToSave];

    localStorage.setItem("customFields", JSON.stringify(updatedFields));
    navigate("/custom-fields");
  };

  const renderField = (label, name, type = "text", selectOptions = []) => (
    <Box
      display="flex"
      flexDirection={{ xs: "column", sm: "row" }}
      alignItems={{ sm: "center" }}
    >
      <Typography sx={labelStyle}>{label}</Typography>
      {selectOptions.length > 0 ? (
        <FormControl sx={inputStyle} size="small">
          <InputLabel>{label}</InputLabel>
          <Select
            name={name}
            value={formData[name]}
            onChange={handleChange}
            label={label}
            required={label.includes("*")}
          >
            {selectOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : type === "radio" ? (
        <RadioGroup
          row
          name={name}
          value={formData[name]}
          onChange={handleChange}
          sx={{ ml: { sm: 2 }, mt: { xs: 1, sm: 0 } }}
        >
          <FormControlLabel value="Yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="No" control={<Radio />} label="No" />
        </RadioGroup>
      ) : (
        <TextField
          name={name}
          type={type}
          value={formData[name]}
          onChange={handleChange}
          placeholder={`Enter ${label}`}
          sx={inputStyle}
          size="small"
          required={label.includes("*")}
        />
      )}
    </Box>
  );

  return (
    <Box sx={{ fontFamily: "Montserrat", p: { xs: 2, sm: 4 } }}>
      <Typography variant="h6" fontWeight="bold" mb={3}>
        {isEditMode ? "Edit Custom Field" : "Add Custom Field"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {renderField("Form Name*", "formName", "select", [
                "Customer",
                "Vendor",
                "Employee",
              ])}
              {renderField("Field Label*", "labelName")}
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {renderField("Field Type*", "fieldType", "select", [
                "Text",
                "Number",
                "Date",
                "Dropdown",
              ])}
              {renderField("Is Required*", "isRequired", "radio")}
              {renderField("Always visible*", "isVisible", "radio")}
            </Stack>
          </Grid>
        </Grid>

        <Box
          display="flex"
          justifyContent="flex-end"
          gap={2}
          mt={5}
          flexWrap="wrap"
        >
          <Button
            variant="outlined"
            onClick={() => navigate("/custom-fields")}
            sx={{ width: { xs: "100%", sm: 120 } }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "rgba(139, 92, 246, 0.9)",
              color: "white",
              width: { xs: "100%", sm: 120 },
              "&:hover": { backgroundColor: "rgba(139, 92, 246, 0.9)" },
            }}
          >
            {isEditMode ? "Update" : "Save"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CustomerFieldForm;
