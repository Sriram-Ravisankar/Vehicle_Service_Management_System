import React from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
  Button,
  Avatar,
   useTheme,
  useMediaQuery
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from '@mui/icons-material/Description';
import ClearIcon from '@mui/icons-material/Clear';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import apiEndpoints from '../../apiconfig';

const API_URL = apiEndpoints.supplier;
const BLOB_URL = apiEndpoints.blob;

const NotesSection = ({
  formData,
  handleChange,
  onSubmit,
  onAddNote, onDeleteNote,
  setFormData,
  loading
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const labelStyle = {
    width: isMobile ? "100%" : "180px",
    fontSize: "0.9rem",
    fontWeight: 500,
    mb: isMobile ? 1 : 0
  };

  const inputStyle = {
    width: "100%",
    fontSize: "0.9rem",
  };

  const clearNoteFile = () => {
    // Revoke object URL if it exists
    if (formData.note_file) {
      URL.revokeObjectURL(formData.note_file);
    }
    setFormData(prev => ({
      ...prev,
      note_file: null,
      noteFilePreview: ""
    }));
  };
  // Check file type and return appropriate preview
  const getFilePreview = () => {
    if (formData.note_file) {
      if (formData.note_file.type.startsWith('image/')) {
        return {
          type: 'image',
          src: URL.createObjectURL(formData.note_file),
          name: formData.note_file.name
        };
      } else if (formData.note_file.type === 'application/pdf') {
        return {
          type: 'pdf',
          src: null,
          name: formData.note_file.name
        };
      }
    } else if (formData.noteFilePreview) {
      const isFullUrl = formData.noteFilePreview.startsWith('http');
      const isRelativePath = !isFullUrl && !formData.noteFilePreview.startsWith('/');
      const fileName = formData.noteFilePreview.split('/').pop();
      const extension = fileName.split('.').pop().toLowerCase();

      if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
        return {
          type: 'image',
          src: formData.noteFilePreview.startsWith('http')
            ? formData.noteFilePreview
            : `${BLOB_URL}${formData.noteFilePreview}`,
          name: fileName
        };
      } else if (extension === 'pdf') {
        return {
          type: 'pdf',
          src: formData.noteFilePreview.startsWith('http')
            ? formData.noteFilePreview
            : `${BLOB_URL}${formData.noteFilePreview}`,
          name: fileName
        };
      }
    }
    return null;
  };

  const filePreview = getFilePreview();
  
  return (
    <Box sx={{
      p: 3,
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      mt: 3
    }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          Add Notes
        </Typography>
        {/* <IconButton
          onClick={onAddNote}
          sx={{
            color: "white",
            backgroundColor: "rgba(14, 165, 233, 0.9)",
            "&:hover": { backgroundColor: "rgba(14, 165, 233, 0.9)" }
          }}
        >
          <AddIcon />
        </IconButton> */}
      </Box>

      {/* Notes Inputs */}
      <Grid container spacing={3}>
        {/* Notes */}
        <Grid item xs={12} md={6} sx={{ width: { xs: "100%", sm: "45%", md: "47%", lg: "35%", xl: "30%" } }}>
          <Box display="flex" flexDirection={isMobile ? "column" : "row"} alignItems={isMobile ? "flex-start" : "flex-start"}>
            <Typography sx={labelStyle}>Notes</Typography>
            <TextField
              multiline
              minRows={3}
              placeholder="Enter note"
              name="note_text"
              value={formData.note_text}
              onChange={handleChange}
              disabled={loading}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.9rem"
                }
              }}
            />
          </Box>
        </Grid>

        {/* File Upload */}
        <Grid item xs={12} md={6} sx={{ width: { xs: "100%", sm: "45%", md: "47%", lg: "35%", xl: "30%" } }}>
          <Box display="flex" flexDirection={isMobile ? "column" : "row"} alignItems={isMobile ? "flex-start" : "center"}>
            <Typography sx={labelStyle}>File</Typography>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              width: '100%',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <TextField
                type="file"
                name="note_file"
                fullWidth
                onChange={handleChange}
                sx={{
                  "& input": { padding: "8px", fontSize: "0.9rem" },
                  "& .MuiOutlinedInput-root": { height: "40px" },
                  flex: 1
                }}
                inputProps={{
                  accept: "image/*,.pdf"
                }}
              />

              {/* Combined preview and filename display */}
              {(formData.note_file || formData.noteFilePreview) && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  ml: isMobile ? 0 : 1,
                  mt: isMobile ? 1 : 0,
                  width: isMobile ? '100%' : 'auto'
                }}>
                  {/* Preview thumbnail */}
                  <Box sx={{
                    width: 56,
                    height: 56,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}>
                    {filePreview?.type === 'image' ? (
                      <img
                        src={filePreview.src}
                        alt="Preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <PictureAsPdfIcon color="error" sx={{ fontSize: 40 }} />
                    )}
                  </Box>

                  {/* Filename with clear button */}
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    minWidth: 0, // Allows text overflow to work
                    gap: 1,
                    flex: 1
                  }}>
                    <Typography sx={{
                      color: 'text.primary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: '0.875rem',
                      flex: 1
                    }}>
                      {filePreview?.name || ''}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={clearNoteFile}
                      disabled={loading}
                      sx={{ flexShrink: 0 }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Checkboxes and Delete Button - FIXED LAYOUT */}
        <Grid item xs={12}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 2 : 0
          }}>
            {/* Checkboxes Container */}
            <Box sx={{
              display: 'flex',
              gap: 4,
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              width: isMobile ? '100%' : 'auto'
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={formData.internal_note}
                    onChange={handleChange}
                    name="internal_note"
                  />
                }
                label="Internal Notes"
                sx={{ fontSize: "0.9rem" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={formData.shared_with_customer}
                    onChange={handleChange}
                    name="shared_with_customer"
                  />
                }
                label="Shared with customer"
                sx={{ fontSize: "0.9rem" }}
              />
            </Box>

            {/* Delete Button - Now properly contained */}
            <Box sx={{
              width: isMobile ? '100%' : 'auto',
              display: 'flex',
              justifyContent: isMobile ? 'flex-end' : 'center'
            }}>
              <IconButton
                color="error"
                onClick={onDeleteNote}
                sx={{
                  backgroundColor: "#f1f3f4",
                  "&:hover": { backgroundColor: "#e0e0e0" }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Submit Button */}
      {/* <Box mt={4}>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          onClick={onSubmit}
          disabled={loading}
          sx={{
            backgroundColor: "#10AADF",
            color: "white",
            padding: "12px 24px",
            borderRadius: "8px",
            fontWeight: "bold",
            height: "45px",
            "&:hover": { backgroundColor: "#09B3F1" },
          }}
        >
          {loading ? "Processing..." : "SUBMIT"}
        </Button>
      </Box> */}
    </Box>
  );
};

export default NotesSection;