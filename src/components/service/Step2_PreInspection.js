import React from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Collapse,
  IconButton,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import apiEndpoints from "../../apiconfig";
const DEFAULT_CHECKLIST = [
  { key: "engine_noise", label: "Engine Noise", icon: "info" },
  { key: "oil_leak", label: "Oil Leakage", icon: "info" },
  { key: "body_damage", label: "Body Damage", icon: "info" },
  { key: "electrical", label: "Electrical Issue", icon: "info" },
  { key: "brake", label: "Brake Issue", icon: "info" },
  { key: "clutch", label: "Clutch Issue", icon: "info" },
  { key: "ac", label: "AC Not Cooling", icon: "info" },
  { key: "suspension", label: "Suspension Issues", icon: "info" },
  { key: "steering", label: "Steering Issues", icon: "info" },
  { key: "tyre", label: "Tyre Condition", icon: "info" },
  { key: "lights", label: "Lights Not Working", icon: "info" },
];
const renderIcon = () => <InfoOutlinedIcon fontSize="small" />;

export default function Step2_PreInspection({ form, setForm,isView, showSnackbar }) {
  React.useEffect(() => {
    if (!form.inspection || form.inspection.length === 0) {
      const init = DEFAULT_CHECKLIST.map((i) => ({
        ...i,
        checked: false,
        note: "",
        photos: [], // can store File objects or {name,url} for existing
      }));
      setForm((f) => ({ ...f, inspection: init }));
    }
    // eslint-disable-next-line
  }, []);

  const toggleCheck = (key) => {
    setForm((f) => ({
      ...f,
      inspection: f.inspection.map((it) =>
        it.key === key ? { ...it, checked: !it.checked } : it
      ),
    }));
  };

  const updateNote = (key, text) => {
    setForm((f) => ({
      ...f,
      inspection: f.inspection.map((it) =>
        it.key === key ? { ...it, note: text } : it
      ),
    }));
  };

  // Convert file to Base64

  // const addPhotos = (key, files) => {
  //   const list = Array.from(files).map((file) => ({
  //     file,
  //     url: URL.createObjectURL(file),
  //     name: file.name,
  //     isNew: true,
  //   }));

  //   setForm((f) => ({
  //     ...f,
  //     inspection: f.inspection.map((item) =>
  //       item.key === key
  //         ? { ...item, photos: [...(item.photos || []), ...list] }
  //         : item
  //     ),
  //   }));
  // };

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={3}>
        Pre-Inspection Checklist
      </Typography>

      <Grid container spacing={3}>
        {form.inspection?.map((item) => (
          <Grid
            key={item.key}
            item
            xs={12}
            sm={6}
            md={4}
            width={{ xs: "100%", sm: "30%" }}
          >
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                overflow: "hidden",
                border: item.checked ? "2px solid #0A84FF" : "1px solid #ddd",
                transition: "0.2s",
              }}
            >
              <CardContent>
                {/* Header Row */}
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    {renderIcon()}
                    <Typography fontWeight={600}>{item.label}</Typography>
                  </Box>

                  <Checkbox
                    checked={item.checked}
                    onChange={() => toggleCheck(item.key)}
                    disabled={isView}
                    sx={{
                      transform: "scale(1.3)",

                      color: "rgba(249, 115, 22, 0.9)", // unchecked icon color

                      "&.Mui-checked": {
                        color: "rgba(249, 115, 22, 0.9)", // checked icon color
                      },

                      "&.Mui-disabled": {
                        color: "rgba(249, 115, 22, 0.4)", // optional disabled color
                      },
                    }}
                  />
                </Box>

                {/* Collapse Area */}
                <Collapse in={item.checked}>
                  <Box mt={2}>
                    {/* Notes */}
                    <TextField
                      fullWidth
                      size="small"
                      label="Notes"
                      value={item.note}
                      onChange={(e) => updateNote(item.key, e.target.value)}
                      disabled={isView}
                    />
                    {/* Upload Box – Full Clickable Area */}
                    {/* <Box
                      component="label"
                      sx={{
                        display: "block", // <-- FIXES label inline behavior
                        width: "100%", // <-- Ensures full width
                        border: "1px dashed #bbb",
                        borderRadius: 2,
                        p: 2,
                        textAlign: "center",
                        cursor: "pointer",
                        "&:hover": { borderColor: "#0A84FF" },
                      }}
                      mt={2}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Click to Upload
                      </Typography>

                      <input
                        type="file"
                        multiple
                        hidden
                        onChange={(e) => addPhotos(item.key, e.target.files)}
                      />
                    </Box> */}
                    {/* Photo Preview Section */}
                    {/* {item.photos && item.photos.length > 0 && (
                      <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                        {item.photos.map((p, idx) => {
                          let src = "";

                          // Case 1: New uploaded file
                          if (p.url) {
                            src = p.url;
                          }

                          // Case 2: Backend string filename
                          else if (typeof p === "string") {
                            src = `${apiEndpoints.baseUrl}/uploads/jobcards/${form.job_guid}/inspection/${item.key}/${p}`;
                          }

                          // Case 3: Backend mapped object
                          else if (p && p.url) {
                            src = p.url;
                          }

                          return (
                            <Box
                              key={idx}
                              sx={{
                                width: 60,
                                height: 60,
                                position: "relative",
                                borderRadius: 1,
                                overflow: "hidden",
                                border: "1px solid #ddd",
                              }}
                            >
                              <img
                                src={src}
                                alt={p.name || p.file?.name || "photo"}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />

                              <Typography
                                sx={{
                                  position: "absolute",
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: "rgba(0,0,0,0.4)",
                                  color: "#fff",
                                  fontSize: "10px",
                                  textAlign: "center",
                                  p: "2px",
                                }}
                              >
                                {p.name || p.file?.name || "image"}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    )} */}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Complaint Section */}
        <Grid item xs={12} width={{ xs: "100%", sm: "30%" }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Customer Complaint / Description"
            value={form.complaint || ""}
            disabled={isView}
            onChange={(e) =>
              setForm((f) => ({ ...f, complaint: e.target.value }))
            }
          />
        </Grid>
      </Grid>
    </Box>
  );
}
