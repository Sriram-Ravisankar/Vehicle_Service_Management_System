import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
  FormControl,
  List,
  ListItem,
  ListItemText,
  Collapse,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

const AddObservation = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [vehicleModel, setVehicleModel] = useState("");
  const [category, setCategory] = useState("");
  const [checkpoint, setCheckpoint] = useState("");
  const [additionalFields, setAdditionalFields] = useState([]);
  const [additionalCheckpoints, setAdditionalCheckpoints] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddObservation, setShowAddObservation] = useState(false);
  const [openCategories, setOpenCategories] = useState({});
  const [predefinedCategories, setPredefinedCategories] = useState([
    "Brakes",
    "Engine",
    "Transmission",
    "Suspension",
    "Electrical",
    "Tires",
    "Exhaust",
  ]);

  // Load data from localStorage on initial render
  const [observations, setObservations] = useState(() => {
    const saved = localStorage.getItem("observations");
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever observations change
  useEffect(() => {
    localStorage.setItem("observations", JSON.stringify(observations));
  }, [observations]);

  // Load predefined categories from localStorage
  useEffect(() => {
    const savedCategories = localStorage.getItem("predefinedCategories");
    if (savedCategories) {
      setPredefinedCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save predefined categories to localStorage when they change
  useEffect(() => {
    localStorage.setItem(
      "predefinedCategories",
      JSON.stringify(predefinedCategories)
    );
  }, [predefinedCategories]);

  const handleAddCategory = () => {
    setAdditionalFields([...additionalFields, { id: Date.now(), value: "" }]);
  };

  const handleAddCheckpoint = () => {
    setAdditionalCheckpoints([
      ...additionalCheckpoints,
      { id: Date.now(), value: "" },
    ]);
  };

  const handleRemoveCategory = (id) => {
    setAdditionalFields(additionalFields.filter((field) => field.id !== id));
  };

  const handleRemoveCheckpoint = (id) => {
    setAdditionalCheckpoints(
      additionalCheckpoints.filter((cp) => cp.id !== id)
    );
  };

  const handleCategoryChange = (id, value) => {
    setAdditionalFields(
      additionalFields.map((field) =>
        field.id === id ? { ...field, value } : field
      )
    );
  };

  const handleCheckpointChange = (id, value) => {
    setAdditionalCheckpoints(
      additionalCheckpoints.map((cp) => (cp.id === id ? { ...cp, value } : cp))
    );
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewCategoryName("");
  };

  const handleAddNewCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName && !predefinedCategories.includes(trimmedName)) {
      setPredefinedCategories([...predefinedCategories, trimmedName]);
      setCategory(trimmedName);
    }
    handleCloseDialog();
  };

  const handleSubmit = () => {
    if (
      !vehicleModel ||
      !category ||
      (!checkpoint && additionalCheckpoints.length === 0)
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const updatedObservations = { ...observations };

    if (category) {
      if (!updatedObservations[category]) updatedObservations[category] = [];
      if (checkpoint)
        updatedObservations[category].push({ vehicleModel, checkpoint });
      additionalCheckpoints.forEach((cp) => {
        if (cp.value) {
          updatedObservations[category].push({
            vehicleModel,
            checkpoint: cp.value,
          });
        }
      });
    }

    additionalFields.forEach((field) => {
      if (field.value) {
        if (!updatedObservations[field.value]) {
          updatedObservations[field.value] = [];
        }
      }
    });

    setObservations(updatedObservations);
    setShowAddObservation(false);

    // Reset form fields
    setVehicleModel("");
    setCategory("");
    setCheckpoint("");
    setAdditionalCheckpoints([]);
    setAdditionalFields([]);
  };

  const handleToggleCategory = (category) => {
    setOpenCategories({
      ...openCategories,
      [category]: !openCategories[category],
    });
  };

  useEffect(() => {
    const allCategories = Object.keys(observations);
    const updatedOpenCategories = { ...openCategories };
    allCategories.forEach((cat) => {
      if (!(cat in updatedOpenCategories)) {
        updatedOpenCategories[cat] = false;
      }
    });
    setOpenCategories(updatedOpenCategories);
  }, [observations]);

  const fontStyle = { fontFamily: "Montserrat" };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all observations?")) {
      setObservations({});
      localStorage.removeItem("observations");
    }
  };

  if (showAddObservation) {
    return (
      <Box p={isSmallScreen ? 2 : 4}>
        <Box display="flex" alignItems="center" mb={4}>
          <ArrowBackIcon
            sx={{ mr: 1, cursor: "pointer" }}
            onClick={() => setShowAddObservation(false)}
          />
          <Typography
            variant={isSmallScreen ? "h6" : "h5"}
            fontWeight="bold"
            sx={fontStyle}
          >
            Add Observation
          </Typography>
        </Box>

        <Grid container spacing={isSmallScreen ? 2 : 3} maxWidth="md">
          <Grid item xs={12} sm={3}>
            <Box
              display="flex"
              flexDirection="column"
              gap={isSmallScreen ? 2 : 3}
            >
              <Typography pt={1} sx={fontStyle}>
                Vehicle Model Name <span style={{ color: "red" }}>*</span>
              </Typography>
              <Typography pt={1} sx={fontStyle}>
                Checkpoint Category <span style={{ color: "red" }}>*</span>
              </Typography>
              {additionalFields.map((_, index) => (
                <Typography key={index} pt={1} sx={fontStyle}>
                  Additional Category {index + 1}
                </Typography>
              ))}
              <Typography pt={1} sx={fontStyle}>
                Check Point <span style={{ color: "red" }}>*</span>
              </Typography>
              {additionalCheckpoints.map((_, index) => (
                <Typography key={index} pt={1} sx={fontStyle}>
                  Additional Checkpoint {index + 1}
                </Typography>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={9}>
            <Box
              display="flex"
              flexDirection="column"
              gap={isSmallScreen ? 1 : 2}
            >
              <TextField
                fullWidth
                size="small"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                sx={{ ...fontStyle }}
              />

              <Box display="flex" gap={1}>
                <FormControl fullWidth size="small">
                  <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    displayEmpty
                    sx={{
                      backgroundColor: "#edf0f3",
                      height: 40,
                      ".MuiSelect-select": {
                        padding: "10px 14px",
                        ...fontStyle,
                      },
                    }}
                  >
                    <MenuItem value="" disabled sx={fontStyle}>
                      Select Category
                    </MenuItem>
                    {predefinedCategories.map((cat) => (
                      <MenuItem key={cat} value={cat} sx={fontStyle}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton
                  onClick={() => setOpenDialog(true)}
                  sx={{
                    backgroundColor: "#10AADF",
                    color: "white",
                    "&:hover": { backgroundColor: "#001E61" },
                    minWidth: "40px",
                    height: "40px",
                  }}
                >
                  <AddIcon fontSize={isSmallScreen ? "small" : "medium"} />
                </IconButton>
              </Box>

              {additionalFields.map((field) => (
                <Box key={field.id} display="flex" gap={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter additional category"
                    value={field.value}
                    onChange={(e) =>
                      handleCategoryChange(field.id, e.target.value)
                    }
                    sx={{
                      backgroundColor: "#edf0f3",
                      height: 40,
                      "& .MuiInputBase-input": {
                        padding: "10px 14px",
                        ...fontStyle,
                      },
                    }}
                  />
                  <IconButton
                    onClick={() => handleRemoveCategory(field.id)}
                    sx={{
                      backgroundColor: "#ff4444",
                      color: "white",
                      "&:hover": { backgroundColor: "#cc0000" },
                      minWidth: "40px",
                      height: "40px",
                    }}
                  >
                    <DeleteIcon fontSize={isSmallScreen ? "small" : "medium"} />
                  </IconButton>
                </Box>
              ))}

              <Box display="flex" gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Enter Checkpoint Name"
                  value={checkpoint}
                  onChange={(e) => setCheckpoint(e.target.value)}
                  sx={{
                    backgroundColor: "#edf0f3",
                    height: 40,
                    "& .MuiInputBase-input": {
                      padding: "10px 14px",
                      ...fontStyle,
                    },
                  }}
                />
                <IconButton
                  onClick={handleAddCheckpoint}
                  sx={{
                    backgroundColor: "#10AADF",
                    color: "white",
                    "&:hover": { backgroundColor: "#001E61" },
                    minWidth: "40px",
                    height: "40px",
                  }}
                >
                  <AddIcon fontSize={isSmallScreen ? "small" : "medium"} />
                </IconButton>
              </Box>

              {additionalCheckpoints.map((cp) => (
                <Box key={cp.id} display="flex" gap={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter additional checkpoint"
                    value={cp.value}
                    onChange={(e) =>
                      handleCheckpointChange(cp.id, e.target.value)
                    }
                    sx={{
                      backgroundColor: "#edf0f3",
                      height: 40,
                      "& .MuiInputBase-input": {
                        padding: "10px 14px",
                        ...fontStyle,
                      },
                    }}
                  />
                  <IconButton
                    onClick={() => handleRemoveCheckpoint(cp.id)}
                    sx={{
                      backgroundColor: "#ff4444",
                      color: "white",
                      "&:hover": { backgroundColor: "#cc0000" },
                      minWidth: "40px",
                      height: "40px",
                    }}
                  >
                    <DeleteIcon fontSize={isSmallScreen ? "small" : "medium"} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Box mt={isSmallScreen ? 3 : 5}>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            sx={{
              backgroundColor: "rgba(249, 115, 22, 0.9)",
              color: "white",
              fontWeight: "bold",
              py: 1.5,
              ...fontStyle,
              "&:hover": { backgroundColor: "rgba(249, 115, 22, 0.9)" },
            }}
          >
            SUBMIT
          </Button>
        </Box>

        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          fullScreen={isSmallScreen}
        >
          <DialogTitle>
            <Typography
              variant={isSmallScreen ? "h6" : "h6"}
              fontWeight="bold"
              sx={fontStyle}
            >
              Add New Checkpoint Category
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box mt={2}>
              <Typography mb={1} sx={fontStyle}>
                Enter Checkpoint Category Name
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                sx={{
                  backgroundColor: "#edf0f3",
                  height: 40,
                  "& .MuiInputBase-input": {
                    padding: "10px 14px",
                    ...fontStyle,
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAddNewCategory}
              sx={{
                backgroundColor: "rgba(249, 115, 22, 0.9)",
                color: "white",
                fontWeight: "bold",
                py: 1.5,
                ...fontStyle,
                "&:hover": { backgroundColor: "rgba(249, 115, 22, 0.9)" },
              }}
            >
              SUBMIT
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box p={isSmallScreen ? 2 : 3}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          variant={isSmallScreen ? "h6" : "h5"}
          fontWeight="bold"
          sx={fontStyle}
        >
          Observation Library
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="contained"
            color="error"
            onClick={handleClearAll}
            sx={{
              ...fontStyle,
            }}
          >
            Clear All
          </Button>
          <IconButton
            onClick={() => setShowAddObservation(true)}
            sx={{
              backgroundColor: "#10AADF",
              color: "white",
              "&:hover": { backgroundColor: "#001E61" },
            }}
          >
            <AddIcon />
          </IconButton>
        </Box>
      </Box>

      {Object.keys(observations).length === 0 ? (
        <Typography sx={{ ...fontStyle, textAlign: "center", mt: 4 }}>
          No observations found
        </Typography>
      ) : (
        <List>
          {Object.entries(
            Object.groupBy(
              Object.entries(observations).flatMap(([category, obsArray]) =>
                obsArray.map((obs) => ({
                  vehicleModel: obs.vehicleModel,
                  category,
                  checkpoint: obs.checkpoint,
                }))
              ),
              (obs) => obs.vehicleModel
            )
          ).map(([vehicle, vehicleGroup]) => (
            <React.Fragment key={vehicle}>
              <ListItem
                button
                onClick={() => handleToggleCategory(vehicle)}
                sx={{
                  backgroundColor: "#f1f3f4",
                  "&:hover": {
                    backgroundColor: "#e9ecef",
                  },
                }}
              >
                {" "}
                <ListItemText primary={vehicle} sx={fontStyle} />
                {openCategories[vehicle] ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse
                in={openCategories[vehicle]}
                timeout="auto"
                unmountOnExit
              >
                <List
                  component="div"
                  disablePadding
                  sx={{ pl: isSmallScreen ? 2 : 4 }}
                >
                  {Object.entries(
                    Object.groupBy(vehicleGroup, (obs) => obs.category)
                  ).map(([cat, catGroup]) => (
                    <React.Fragment key={cat}>
                      <ListItem
                        button
                        onClick={() =>
                          handleToggleCategory(`${vehicle}_${cat}`)
                        }
                      >
                        <ListItemText primary={cat} sx={fontStyle} />
                        {openCategories[`${vehicle}_${cat}`] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </ListItem>
                      <Collapse
                        in={openCategories[`${vehicle}_${cat}`]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <List
                          component="div"
                          disablePadding
                          sx={{ pl: isSmallScreen ? 2 : 4 }}
                        >
                          {catGroup.map((obs, idx) => (
                            <ListItem key={idx}>
                              <ListItemText
                                primary={obs.checkpoint}
                                sx={fontStyle}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </React.Fragment>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default AddObservation;
