import React, { useEffect, useState } from "react";
import {
  Grid,
  TextField,
  Button,
  Paper,
  Typography,
  Box,
} from "@mui/material";

const PartInputForm = ({ onAdd, editing }) => {
  const [partData, setPartData] = useState({
    partName: "",
    qty: "",
    price: "",
    brand: "",
    remarks: "",
    image: "",
  });

  useEffect(() => {
    if (editing) {
      setPartData(editing);
    }
  }, [editing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPartData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPartData((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(partData);
    setPartData({
      partName: "",
      qty: "",
      price: "",
      brand: "",
      remarks: "",
      image: "",
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        {editing ? "Edit Part" : "Add Part"}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Row 1 */}
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" mb={0.5}>Part Name</Typography>
            <TextField
              name="partName"
              fullWidth
              value={partData.partName}
              onChange={handleChange}
              variant="outlined"
              size="small"
              margin="dense"
              placeholder=""
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="body2" mb={0.5}>Quantity</Typography>
            <TextField
              name="qty"
              fullWidth
              value={partData.qty}
              onChange={handleChange}
              variant="outlined"
              size="small"
              margin="dense"
              placeholder=""
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="body2" mb={0.5}>Price</Typography>
            <TextField
              name="price"
              fullWidth
              value={partData.price}
              onChange={handleChange}
              variant="outlined"
              size="small"
              margin="dense"
              placeholder=""
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="body2" mb={0.5}>Brand</Typography>
            <TextField
              name="brand"
              fullWidth
              value={partData.brand}
              onChange={handleChange}
              variant="outlined"
              size="small"
              margin="dense"
              placeholder=""
            />
          </Grid>

          {/* Row 2 */}
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" mb={0.5}>Remarks</Typography>
            <TextField
              name="remarks"
              fullWidth
              value={partData.remarks}
              onChange={handleChange}
              variant="outlined"
              size="small"
              margin="dense"
              placeholder=""
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="body2" mb={0.5}>Image</Typography>
            <TextField
              type="file"
              fullWidth
              inputProps={{ accept: "image/*" }}
              onChange={handleImageUpload}
              variant="outlined"
              size="small"
              margin="dense"
            />
            {partData.image && (
              <Box mt={1} display="flex" justifyContent="center">
                <img
                  src={partData.image}
                  alt="Part"
                  style={{ maxHeight: 60, borderRadius: 4 }}
                />
              </Box>
            )}
          </Grid>

          <Grid item xs={12} sm={3}>
            <Box height="100%" display="flex" alignItems="flex-end">
              <Button type="submit" variant="contained" color="primary" fullWidth>
                {editing ? "Update" : "+"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default PartInputForm;