import React from "react";
import { 
  Activity, 
  Droplets, 
  ShieldAlert, 
  Zap, 
  Disc, 
  Settings2, 
  Wind, 
  Layers, 
  Target, 
  CircleDot, 
  Sun,
  AlertCircle,
  MessageSquare,
  RefreshCw,
  CheckCircle2,
  Circle,
  Database,
  X
} from "lucide-react";

import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from "@mui/material";

// ── tiny helpers ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, children, icon: Icon }) => (
  <Box sx={{
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #F3F4F6",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    p: { xs: 2, md: 3 },
    mb: 3,
  }}>
    <div style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: 12, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
       {Icon && <Icon size={18} style={{ color: "#0EA5E9" }} />}
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h3>
    </div>
    {children}
  </Box>
);

const inputSx = (hasError) => ({
  width: "100%",
  padding: "9px 13px",
  fontSize: 14,
  border: `1px solid ${hasError ? "#FCA5A5" : "#E5E7EB"}`,
  borderRadius: 8,
  outline: "none",
  background: hasError ? "#FFF5F5" : "#F9FAFB",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
});

const ICON_MAP = {
  engine_noise: Activity,
  oil_leak: Droplets,
  body_damage: ShieldAlert,
  electrical: Zap,
  brake: Disc,
  clutch: RefreshCw,
  ac: Wind,
  suspension: Layers,
  steering: Target,
  tyre: CircleDot,
  lights: Sun,
};



export default function Step2_PreInspection({ form, setForm, isView, showSnackbar }) {
  const [observations, setObservations] = React.useState({});
  const [selectedCheckpoint, setSelectedCheckpoint] = React.useState("");

  // Load observations from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("observations");
    if (saved) {
      setObservations(JSON.parse(saved));
    }
  }, []);

  const handleCheckpointSelect = (event) => {
    const val = event.target.value;
    setSelectedCheckpoint(val);
    if (!val) return;

    // Split the category and checkpoint from the value
    const [cat, checkpoint] = val.split("|");
    
    // Add to complaint if not already there
    const currentComplaint = form.complaint || "";
    const newPoint = `[${cat}] ${checkpoint}`;
    if (currentComplaint.includes(newPoint)) return;
    
    setForm(prev => ({
      ...prev,
      complaint: currentComplaint 
        ? `${currentComplaint}\n${newPoint}`
        : newPoint
    }));
  };

  React.useEffect(() => {
    if (!form.inspection || form.inspection.length === 0) {
      const init = Object.entries(ICON_MAP).map(([key, icon]) => ({
        key,
        label: key.split("_").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" "),
        checked: false,
        note: "",
        photos: [],
      }));
      setForm((f) => ({ ...f, inspection: init }));
    }
  }, []);

  const toggleCheck = (key) => {
    if (isView) return;
    setForm((f) => ({
      ...f,
      inspection: f.inspection.map((it) =>
        it.key === key ? { ...it, checked: !it.checked } : it
      ),
    }));
  };

  const updateNote = (key, text) => {
    if (isView) return;
    setForm((f) => ({
      ...f,
      inspection: f.inspection.map((it) =>
        it.key === key ? { ...it, note: text } : it
      ),
    }));
  };

  return (
    <div>
      <SectionCard title="Pre-Inspection Checklist" icon={Activity}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", 
          gap: 16 
        }}>
          {form.inspection?.map((item) => {
            const IconComp = item.icon || Activity;
            return (
              <div
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: `1.5px solid ${item.checked ? "#0EA5E9" : "#F3F4F6"}`,
                  background: item.checked ? "#F5F3FF" : "#fff",
                  cursor: isView ? "default" : "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: item.checked ? "#EFEEFF" : "#F9FAFB",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: item.checked ? "#7C3AED" : "#9CA3AF",
                      border: `1px solid ${item.checked ? "#DDD6FE" : "#E5E7EB"}`,
                    }}>
                      {(() => {
                        const IconComp = ICON_MAP[item.key] || Activity;
                        return <IconComp size={20} />;
                      })()}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: item.checked ? "#111827" : "#4B5563" }}>
                      {item.label}
                    </span>
                  </div>
                  <div style={{ color: item.checked ? "#0EA5E9" : "#E5E7EB" }}>
                    {item.checked ? <CheckCircle2 size={22} fill="#0EA5E9" color="#fff" /> : <Circle size={22} />}
                  </div>
                </div>

                {item.checked && (
                  <div onClick={(e) => e.stopPropagation()}>
                    <input
                      placeholder="Add observation note..."
                      value={item.note || ""}
                      onChange={(e) => updateNote(item.key, e.target.value)}
                      disabled={isView}
                      style={{
                        ...inputSx(false),
                        padding: "7px 10px",
                        fontSize: 13,
                        background: "#fff"
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Customer Complaint" icon={MessageSquare}>
        {!isView && (
          <Box sx={{ mb: 2 }}>
            <FormControl fullWidth size="small">
              <Select
                displayEmpty
                value={selectedCheckpoint}
                onChange={handleCheckpointSelect}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#9CA3AF' }}>
                        <Database size={16} />
                        <span>Select checkpoints from Library...</span>
                      </Box>
                    );
                  }
                  const [cat, cp] = selected.split("|");
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircle2 size={14} style={{ color: '#10B981' }} />
                      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>{cat}:</Typography>
                      <Typography sx={{ fontSize: '13px', color: '#4B5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cp}</Typography>
                    </Box>
                  );
                }}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: "#F9FAFB",
                  border: '1px solid #E5E7EB',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '&.Mui-focused': { 
                    border: '1px solid #0EA5E9', 
                    boxShadow: '0 0 0 4px rgba(14, 165, 233, 0.1)',
                    backgroundColor: '#fff'
                  },
                  height: '45px',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: '16px',
                      mt: 1,
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                      border: '1px solid #F1F5F9',
                      maxHeight: '350px',
                      '& .MuiMenuItem-root': {
                        fontSize: '13px',
                        py: 1.5,
                        px: 2,
                        borderBottom: '1px solid #F8FAFC',
                        whiteSpace: 'normal',
                        lineHeight: 1.4,
                        '&:last-child': { borderBottom: 'none' },
                        '&:hover': { background: '#F0F9FF', color: '#0EA5E9' },
                        transition: 'all 0.1s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 0.5
                      }
                    }
                  }
                }}
              >
                <MenuItem value="">
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#6B7280', fontSize: '13px', fontWeight: 600 }}>
                     <X size={14} /> Clear Selection
                   </Box>
                </MenuItem>
                
                {Object.entries(observations).map(([category, items]) => (
                  items
                    .filter(item => {
                      // Show if it's General, All Models, or matching current vehicle
                      if (!item.vehicleModel || 
                          item.vehicleModel === "All Models" || 
                          item.vehicleModel === "General" ||
                          item.vehicleModel === "Any") return true;
                          
                      if (!form.vehicle_name) return false;
                      // Case-insensitive inclusion search
                      return form.vehicle_name.toLowerCase().includes(item.vehicleModel.toLowerCase());
                    })
                    .map((item, idx) => (
                      <MenuItem key={`${category}-${idx}`} value={`${category}|${item.checkpoint}`}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Layers size={12} style={{ color: '#0EA5E9' }} />
                          <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#0EA5E9', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {category}
                          </Typography>
                          <Typography sx={{ fontSize: '10px', color: '#94A3B8' }}>
                            • {item.vehicleModel}
                          </Typography>
                        </Box>
                        <Box sx={{ color: '#1F2937', fontWeight: 500 }}>
                          {item.checkpoint}
                        </Box>
                      </MenuItem>
                    ))
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
        <textarea
          placeholder="Enter detailed customer complaint or any instructions..."
          value={form.complaint || ""}
          disabled={isView}
          onChange={(e) => setForm((f) => ({ ...f, complaint: e.target.value }))}
          style={{
            ...inputSx(false),
            minHeight: 120,
            resize: "vertical",
            fontFamily: "inherit"
          }}
        />
      </SectionCard>
    </div>
  );
}
