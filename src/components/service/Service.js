import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useState } from "react";


const Service = () => {
    const [vehicleValue, setVehicleValue] = useState(""); 
    return (
        <FormControl fullWidth sx={{ marginTop: 2 }}>
            <InputLabel id="vehicle-label">Select Vehicle Name</InputLabel>
            <Select
                labelId="vehicle-label"
                value={vehicleValue}
                onChange={(e) => setVehicleValue(e.target.value)}
                displayEmpty
            >
                <MenuItem value="">
                    {/* <em>-- Select Vehicle Name --</em> */}
                </MenuItem>
                <MenuItem value="Car">Car</MenuItem>
                <MenuItem value="Bike">Bike</MenuItem>
            </Select>
        </FormControl>
    );
}

export default Service