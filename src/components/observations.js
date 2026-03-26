import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  Paper,
  Tooltip,
  Alert,
  Snackbar,
} from "@mui/material";
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  Car, 
  Search, 
  FileText, 
  Layers,
  CheckCircle2,
  Database
} from "lucide-react";
import SectionHeader from "./common/Header";
import { useLoading } from "../pages/LoadingContext";

// --- Shared UI Component ---
const SectionCard = ({ title, children, icon: Icon, sx = {} }) => (
  <Paper 
    elevation={0}
    sx={{
      background: "#fff",
      borderRadius: "16px",
      border: "1px solid #F1F5F9",
      boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)",
      p: { xs: 2, sm: 3 },
      mb: 3,
      position: 'relative',
      overflow: 'hidden',
      ...sx
    }}
  >
    <div style={{ 
      borderBottom: "1px solid #F1F5F9", 
      paddingBottom: "14px", 
      marginBottom: "20px", 
      display: "flex", 
      alignItems: "center", 
      gap: "10px" 
    }}>
      {Icon && (
        <div style={{ 
          width: 32, 
          height: 32, 
          borderRadius: "8px", 
          background: "#F5F3FF", 
          color: "#0EA5E9", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center" 
        }}>
          <Icon size={18} />
        </div>
      )}
      <h3 style={{ 
        margin: 0, 
        fontSize: "14px", 
        fontWeight: 700, 
        color: "#1E293B", 
        textTransform: "uppercase", 
        letterSpacing: "0.025em" 
      }}>
        {title}
      </h3>
    </div>
    {children}
  </Paper>
);

const Field = ({ label, icon: Icon, children, required, helper }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, width: '100%' }}>
    <label style={{ 
      fontSize: 13, 
      fontWeight: 600, 
      color: "#475569", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {Icon && <Icon size={14} style={{ color: "#0EA5E9" }} />}
        {label}{required && <span style={{ color: '#EF4444', marginLeft: 4 }}>*</span>}
      </div>
      {helper && <span style={{ fontSize: 11, fontWeight: 500, color: '#94A3B8' }}>{helper}</span>}
    </label>
    {children}
  </div>
);

const inputSx = {
  width: "100%",
  padding: "10px 14px",
  fontSize: "14px",
  border: "1px solid #E2E8F0",
  borderRadius: "10px",
  outline: "none",
  background: "#fff",
  color: "#1E293B",
  fontWeight: 500,
  transition: "all 0.2s ease",
  fontFamily: "inherit",
  "&:focus": {
    borderColor: "#0EA5E9",
    boxShadow: "0 0 0 3px rgba(14, 165, 233, 0.1)",
  }
};

const AddObservation = () => {
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const [vehicleModel, setVehicleModel] = useState("");
  const [category, setCategory] = useState("");
  const [checkpoint, setCheckpoint] = useState("");
  const [additionalCheckpoints, setAdditionalCheckpoints] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddObservation, setShowAddObservation] = useState(false);
  const [openCategories, setOpenCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  
  const [predefinedCategories, setPredefinedCategories] = useState([
    "Brakes",
    "Engine",
    "Transmission",
    "Suspension",
    "Electrical",
    "Tires",
    "Exhaust",
  ]);

  const INITIAL_OBSERVATIONS = {
    "Brakes": [
      { vehicleModel: "Maruti Suzuki Swift", checkpoint: "Check front brake pad thickness (minimum 3mm)" },
      { vehicleModel: "Toyota Innova Crysta", checkpoint: "Inspect rear brake shoe wear" },
      { vehicleModel: "General", checkpoint: "Check brake rotor surface for scoring" }
    ],
    "Engine": [
      { vehicleModel: "Maruti Suzuki Swift", checkpoint: "Inspect V-belt for cracks or glazing" },
      { vehicleModel: "Hyundai i20", checkpoint: "Check for valve cover oil seepage" },
      { vehicleModel: "Toyota Innova Crysta", checkpoint: "Inspect Intercooler hoses for oil residue" }
    ],
    "Suspension": [
      { vehicleModel: "Maruti Suzuki Swift", checkpoint: "Inspect lower arm bushes for play" },
      { vehicleModel: "Mahindra Scorpio", checkpoint: "Inspect front stabilizer bar links" },
      { vehicleModel: "Hyundai i20", checkpoint: "Inspect steering rack for clicking noise" }
    ],
    "Electrical": [
      { vehicleModel: "Hyundai i20", checkpoint: "Test rear taillight housing for moisture" },
      { vehicleModel: "Mahindra Scorpio", checkpoint: "Inspect ABS sensor wiring for damage" },
      { vehicleModel: "General", checkpoint: "Check battery voltage and terminal corrosion" }
    ],
    "Tires": [
      { vehicleModel: "Toyota Innova Crysta", checkpoint: "Check for uneven inner tread wear" },
      { vehicleModel: "General", checkpoint: "Measure tire tread depth (minimum 1.6mm)" }
    ],
    "Transmission": [
      { vehicleModel: "Mahindra Scorpio", checkpoint: "Check Clutch pedal effort and travel" }
    ]
  };

  const [observations, setObservations] = useState(() => {
    const saved = localStorage.getItem("observations");
    if (!saved) return INITIAL_OBSERVATIONS;
    try {
      const parsed = JSON.parse(saved);
      return Object.keys(parsed).length > 0 ? parsed : INITIAL_OBSERVATIONS;
    } catch {
      return INITIAL_OBSERVATIONS;
    }
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    localStorage.setItem("observations", JSON.stringify(observations));
  }, [observations]);

  useEffect(() => {
    const savedCategories = localStorage.getItem("predefinedCategories");
    if (savedCategories) {
      setPredefinedCategories(JSON.parse(savedCategories));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("predefinedCategories", JSON.stringify(predefinedCategories));
  }, [predefinedCategories]);

  const handleAddCheckpoint = () => {
    setAdditionalCheckpoints([
      ...additionalCheckpoints,
      { id: Date.now(), value: "" },
    ]);
  };

  const handleRemoveCheckpoint = (id) => {
    setAdditionalCheckpoints(additionalCheckpoints.filter((cp) => cp.id !== id));
  };

  const handleCheckpointChange = (id, value) => {
    setAdditionalCheckpoints(additionalCheckpoints.map((cp) => (cp.id === id ? { ...cp, value } : cp)));
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
      setSnackbar({ open: true, message: `Category "${trimmedName}" added`, severity: "success" });
    }
    handleCloseDialog();
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!vehicleModel || !category || (!checkpoint && additionalCheckpoints.length === 0)) {
      setSnackbar({ open: true, message: "Please fill all required fields", severity: "warning" });
      return;
    }

    show();
    setTimeout(() => {
      const updatedObservations = { ...observations };
      if (!updatedObservations[category]) updatedObservations[category] = [];
      
      if (checkpoint) {
        updatedObservations[category].push({ vehicleModel, checkpoint });
      }
      
      additionalCheckpoints.forEach((cp) => {
        if (cp.value.trim()) {
          updatedObservations[category].push({ vehicleModel, checkpoint: cp.value.trim() });
        }
      });

      setObservations(updatedObservations);
      setShowAddObservation(false);
      setVehicleModel("");
      setCategory("");
      setCheckpoint("");
      setAdditionalCheckpoints([]);
      hide();
      setSnackbar({ open: true, message: "Observation added to library!", severity: "success" });
    }, 600);
  };

  const handleToggleCategory = (key) => {
    setOpenCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear the entire library?")) {
      setObservations({});
      localStorage.removeItem("observations");
      setSnackbar({ open: true, message: "Library cleared", severity: "info" });
    }
  };

  const filteredObservations = useMemo(() => {
    if (!searchTerm) return observations;
    const result = {};
    Object.entries(observations).forEach(([cat, obsArray]) => {
      const matches = obsArray.filter(obs => 
        obs.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        obs.checkpoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matches.length > 0) result[cat] = matches;
    });
    return result;
  }, [observations, searchTerm]);

  // Grouped and sorted data for the list
  const groupedData = useMemo(() => {
    const flat = [];
    Object.entries(filteredObservations).forEach(([cat, obsArray]) => {
      obsArray.forEach((obs) => {
        flat.push({ ...obs, category: cat });
      });
    });
    
    // Group by Vehicle -> Category
    const groupedByVehicle = {};
    flat.forEach(item => {
      if (!groupedByVehicle[item.vehicleModel]) groupedByVehicle[item.vehicleModel] = {};
      if (!groupedByVehicle[item.vehicleModel][item.category]) groupedByVehicle[item.vehicleModel][item.category] = [];
      groupedByVehicle[item.vehicleModel][item.category].push(item.checkpoint);
    });
    
    return Object.entries(groupedByVehicle).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filteredObservations]);

  if (showAddObservation) {
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, minHeight: "100vh", backgroundColor: "#F8FAFC", width: "100%" }}>
        <SectionHeader 
          title="Add New Observation" 
          showBack={true} 
          onBack={() => setShowAddObservation(false)}
        />
        
        <Box sx={{ maxWidth: '1000px', mx: 'auto', mt: 3, animation: 'fadeIn 0.4s ease' }}>
          <SectionCard title="Vehicle & Category Information" icon={Car}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Field label="Vehicle Model / Brand" icon={Car} required helper="e.g. Maruti Suzuki Swift">
                  <input
                    placeholder="Enter vehicle model name..."
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    style={inputSx}
                  />
                </Field>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Field label="Checkpoint Category" icon={Layers} required>
                  <Box display="flex" gap={1}>
                    <FormControl fullWidth size="small">
                      <Select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        displayEmpty
                        sx={{
                          borderRadius: '10px',
                          '& .MuiSelect-select': { padding: '10px 14px', fontSize: '14px', fontWeight: 500 }
                        }}
                      >
                        <MenuItem value="" disabled>Select Category</MenuItem>
                        {predefinedCategories.map((cat) => (
                          <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Tooltip title="Add New Category">
                      <IconButton onClick={() => setOpenDialog(true)} sx={{ bgcolor: '#F0F9FF', color: '#0EA5E9', borderRadius: '10px' }}>
                        <Plus size={20} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Field>
              </Grid>
            </Grid>
          </SectionCard>

          <SectionCard title="Checkpoints" icon={CheckCircle2}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label="Primary Checkpoint" icon={FileText} required helper="What should the mechanic check?">
                <Box display="flex" gap={1}>
                  <input
                    placeholder="e.g. Check brake pad thickness"
                    value={checkpoint}
                    onChange={(e) => setCheckpoint(e.target.value)}
                    style={inputSx}
                  />
                  <IconButton onClick={handleAddCheckpoint} sx={{ color: '#0EA5E9', bgcolor: '#F0F9FF', borderRadius: '10px' }}>
                    <Plus size={20} />
                  </IconButton>
                </Box>
              </Field>

              {additionalCheckpoints.map((cp, idx) => (
                <Field key={cp.id} label={`Additional Checkpoint ${idx + 1}`} icon={Plus}>
                  <Box display="flex" gap={1}>
                    <input
                      placeholder="Enter additional checkpoint..."
                      value={cp.value}
                      onChange={(e) => handleCheckpointChange(cp.id, e.target.value)}
                      style={inputSx}
                    />
                    <IconButton onClick={() => handleRemoveCheckpoint(cp.id)} sx={{ color: '#EF4444', bgcolor: '#FEF2F2', borderRadius: '10px' }}>
                      <Trash2 size={20} />
                    </IconButton>
                  </Box>
                </Field>
              ))}
            </div>
          </SectionCard>

          <Box display="flex" justifyContent="flex-end" gap={2} mt={2} mb={8}>
            <Button 
              variant="text" 
              onClick={() => setShowAddObservation(false)}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#64748B' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                background: "linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)",
                color: "white",
                fontWeight: 700,
                textTransform: 'none',
                px: 6,
                py: 1.5,
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.2)',
                "&:hover": { transform: 'translateY(-1px)', boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)' },
              }}
            >
              Save to Library
            </Button>
          </Box>
        </Box>

        {/* --- Category Creation Dialog --- */}
        <Dialog open={openDialog} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: '20px' } }}>
          <DialogTitle sx={{ fontWeight: 700, px: 3, pt: 3 }}>Add New Category</DialogTitle>
          <DialogContent sx={{ px: 3 }}>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
              Create a broad group for observations (e.g. Body Work, Interior, etc.)
            </Typography>
            <input
              autoFocus
              placeholder="e.g. Interior Components"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={{ ...inputSx, marginTop: 12 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCloseDialog} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleAddNewCategory}
              disabled={!newCategoryName.trim()}
              sx={{ background: '#0EA5E9', textTransform: 'none', fontWeight: 600, borderRadius: '10px' }}
            >
              Create Category
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, minHeight: "100vh", backgroundColor: "#F8FAFC", width: "100%" }}>
      <SectionHeader title="Observation Library" showBack={true} onBack={() => navigate("/profile-settings")} />

      <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
        {/* Search Bar */}
        <div style={{ position: "relative", flex: "1 1 300px", maxWidth: 450 }}>
          <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
          <input
            placeholder="Search within library..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ ...inputSx, paddingLeft: 42 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Trash2 size={16} />}
            onClick={handleClearAll}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, px: 2 }}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => setShowAddObservation(true)}
            sx={{ 
              borderRadius: '10px', 
              textTransform: 'none', 
              fontWeight: 700, 
              bgcolor: '#0EA5E9',
              px: 3,
              "&:hover": { bgcolor: '#0284C7' }
            }}
          >
            New Observation
          </Button>
        </div>
      </Box>

      {groupedData.length === 0 ? (
        <Paper 
          sx={{ 
            mt: 4, 
            p: 8, 
            textAlign: "center", 
            borderRadius: '20px', 
            border: '1px dashed #E2E8F0',
            background: 'transparent'
          }} 
          elevation={0}
        >
          <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Database size={48} style={{ color: "#CBD5E1", marginBottom: 16 }} />
            <Typography variant="h6" fontWeight={700} color="textPrimary">No observations found</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {searchTerm ? "Try adjusting your search terms" : "Start building your garage library by adding new checkpoints"}
            </Typography>
            {!searchTerm && (
              <Button 
                variant="outlined" 
                onClick={() => setShowAddObservation(true)} 
                sx={{ mt: 3, borderRadius: '10px', fontWeight: 600 }}
              >
                Add Your First Observation
              </Button>
            )}
          </div>
        </Paper>
      ) : (
        <Box sx={{ mt: 4 }}>
          {groupedData.map(([vehicle, categories]) => (
            <Paper 
              key={vehicle} 
              elevation={0} 
              sx={{ 
                mb: 3, 
                borderRadius: '16px', 
                border: '1px solid #F1F5F9',
                overflow: 'hidden',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }
              }}
            >
              {/* Vehicle Header */}
              <div 
                onClick={() => handleToggleCategory(vehicle)}
                style={{ 
                  padding: '16px 20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  background: openCategories[vehicle] ? '#F8FAFC' : '#fff',
                  borderBottom: openCategories[vehicle] ? '1px solid #F1F5F9' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ bgcolor: '#F1F5F9', p: 1, borderRadius: '8px', color: '#64748B' }}>
                    <Car size={20} />
                  </div>
                  <Typography fontWeight={700} color="#1E293B">{vehicle}</Typography>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 700, 
                    bgcolor: '#EEF2FF', 
                    color: '#4F46E5', 
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    marginLeft: 8
                  }}>
                    {Object.keys(categories).length} Categories
                  </span>
                </div>
                {openCategories[vehicle] ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
              </div>

              <Collapse in={openCategories[vehicle]} timeout="auto">
                <div style={{ padding: '0 20px 20px' }}>
                  {Object.entries(categories).map(([cat, checkpoints]) => {
                    const catKey = `${vehicle}_${cat}`;
                    return (
                      <div key={cat} style={{ marginTop: 16 }}>
                        <div 
                          onClick={() => handleToggleCategory(catKey)}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            background: '#F1F5F9',
                            borderRadius: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Layers size={16} color="#0EA5E9" />
                            <Typography variant="body2" fontWeight={600} color="#334155">{cat}</Typography>
                            <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500 }}>
                              ({checkpoints.length})
                            </span>
                          </div>
                          {openCategories[catKey] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                        
                        <Collapse in={openCategories[catKey]} timeout="auto">
                          <List sx={{ pl: 4, pt: 1 }}>
                            {checkpoints.map((cp, idx) => (
                              <ListItem 
                                key={idx} 
                                sx={{ 
                                  borderLeft: '2px solid #E2E8F0', 
                                  ml: 0.5, 
                                  py: 1,
                                  '&:hover': { background: '#F8FAFC' }
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#94A3B8' }} />
                                  <ListItemText 
                                    primary={cp} 
                                    primaryTypographyProps={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}
                                  />
                                </div>
                              </ListItem>
                            ))}
                          </List>
                        </Collapse>
                      </div>
                    );
                  })}
                </div>
              </Collapse>
            </Paper>
          ))}
        </Box>
      )}

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddObservation;

