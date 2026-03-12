import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  MenuItem,
  IconButton,
  Button,
} from "@mui/material";
import apiEndpoints from "../../apiconfig";
import Autocomplete from "@mui/material/Autocomplete";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const Step1_ServiceDetails = forwardRef(
  ({ form, setForm, isSubmitting, isView, showSnackbar }, ref) => {
    const token = sessionStorage.getItem("token");
    const [customers, setCustomers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [repairCategories, setRepairCategories] = useState([]);
    const [branches, setBranches] = useState([]);
    const [errors, setErrors] = useState({});
    const validateStep1 = () => {
      let newErrors = {};

      if (!form.customer_guid) newErrors.customer_guid = "Customer is required";
      if (!form.vehicle_guid) newErrors.vehicle_guid = "Vehicle is required";
      if (!form.repair_category_id)
        newErrors.repair_category_id = "Repair category is required";
      if (!form.service_type)
        newErrors.service_type = "Service type is required";
      if (!form.branch_id) newErrors.branch_id = "Branch is required";
      if (!form.arrival_date)
        newErrors.arrival_date = "Arrival date is required";
      if (!form.estimate_date)
        newErrors.estimate_date = "Estimate delivery date is required";
      if (!form.assign_to) newErrors.assign_to = "Assign to is required";

      setErrors(newErrors);
      if (Object.keys(newErrors).length > 0) {
        showSnackbar("Please fill all required fields", "error");
        return false;
      }

      return Object.keys(newErrors).length === 0;
    };

    const isValidVehicleNumber = (value) => {
      const reg = /^[A-Za-z0-9]{1,10}$/;
      return reg.test(value);
    };

    useImperativeHandle(ref, () => ({
      validate: () => validateStep1(),
    }));

    useEffect(() => {
      fetchDropdown("users", "customer", setCustomers);
      fetchDropdown("users", "employee", setEmployees);
      fetchDropdown("repair_category", null, setRepairCategories);
      fetchDropdown("branches", null, setBranches);
    }, []);
    // When editing, load vehicles for saved cus  tomer
    useEffect(() => {
      if (form.customer_guid) {
        fetchVehicles(form.customer_guid);
      }
    }, [form.customer_guid]);

    const fetchVehicles = async (customer_guid) => {
      const url = `${apiEndpoints.dropDown}?table=vehicles&todo=dropdown&columns=vehicle_guid,make,model,registration_number&user_guid=${customer_guid}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      setVehicles(
        data.map((v) => {
          const make = v.make ?? "";
          const model = v.model ?? "";
          const regNo = v.registration_number ?? "";

          const name = `${make} ${model}`.trim();

          return {
            value: v.vehicle_guid,
            label: name ? `${name} - ${regNo}` : regNo,
            regNo,
          };
        })
      );
    };

    // When editing, ensure employees are loaded and match the dropdown
    useEffect(() => {
      if (employees.length > 0 && form.assign_to) {
        const exists = employees.some((emp) => emp.value === form.assign_to);
        if (!exists) {
          // Optionally fetch employee details if needed
        }
      }
    }, [employees, form.assign_to]);

    const fetchDropdown = async (table, usertype, setter) => {
      try {
        let url = `${apiEndpoints.dropDown}?table=${table}&todo=dropdown&columns=`;

        if (table === "users") {
          url += "user_guid,mobile,first_name,last_name";
          if (usertype) url += `&usertype=${usertype}`;
        } else if (table === "repair_category") {
          url = `${apiEndpoints.dropDown}?table=repair_category&todo=dropdown&columns=id,Name`;
        } else if (table === "branches") {
          url = `${apiEndpoints.dropDown}?table=branches&todo=dropdown&columns=branch_id,branch_name`;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (table === "users") {
          setter(
            data.map((d) => ({
              value: d.user_guid,
              label: `${d.first_name} ${d.last_name}`,
              phone: d.mobile,
            }))
          );
        } else if (table === "repair_category") {
          setter(data.map((d) => ({ id: d.id, name: d.Name })));
        } else if (table === "branches") {
          setter(
            data.map((b) => ({
              value: b.branch_id,
              label: b.branch_name,
            }))
          );
        }
      } catch (err) {
        console.error("dropdown fetch error", err);
      }
    };

    const onCustomerChange = async (newValue) => {
      if (!newValue) {
        setForm((f) => ({ ...f, customer_guid: "", vehicle_guid: "" }));
        setVehicles([]);
        return;
      }
      setForm((f) => ({ ...f, customer_guid: newValue.value }));
      // fetch vehicles for customer
      try {
        const url = `${apiEndpoints.dropDown}?table=vehicles&todo=dropdown&columns=vehicle_guid,make,model,registration_number&user_guid=${newValue.value}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setVehicles(
          data.map((v) => {
            const make = v.make ?? "";
            const model = v.model ?? "";
            const regNo = v.registration_number ?? "";

            const name = `${make} ${model}`.trim();

            return {
              value: v.vehicle_guid,
              label: name ? `${name} - ${regNo}` : regNo,
              regNo,
            };
          })
        );

      } catch (err) {
        console.error("vehicle fetch", err);
      }
    };

    return (
      <Box>
        <Typography
          variant="h6"
          mb={3}
          sx={{ fontWeight: 700, fontSize: "20px" }}
        >
          Service Details
        </Typography>

        <Grid container spacing={5}>
          {/* Customer */}
          <Grid item xs={12} md={6} width={{ xs: "100%", sm: "45%" }}>
            <Autocomplete
              options={customers}
              value={
                customers.find((c) => c.value === form.customer_guid) || null
              }

              /* 👇 This enables name OR mobile search */
              filterOptions={(options, { inputValue }) => {
                const search = inputValue.toLowerCase();

                return options.filter((option) =>
                  option.label.toLowerCase().includes(search) ||
                  option.phone.includes(search)
                );
              }}

              onChange={(e, nv) => {
                onCustomerChange(nv);
                setErrors((err) => ({ ...err, customer_guid: "" }));
              }}

              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Customer *"
                  size="small"
                  fullWidth
                  disabled={isView}
                  error={!!errors.customer_guid}
                  helperText={errors.customer_guid}
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiInputLabel-root": { top: "-2px" } }}
                />
              )}
            />
          </Grid>

          {/* Vehicle */}
          <Grid item xs={12} md={6} width={{ xs: "100%", sm: "45%" }}>
            <Autocomplete
              freeSolo
              options={vehicles}
              value={
                vehicles.find((v) => v.value === form.vehicle_guid) || null
              }

              /* 🔍 Search by registration number */
              filterOptions={(options, { inputValue }) => {
                const search = inputValue.toLowerCase();
                return options.filter(
                  (opt) =>
                    opt.label.toLowerCase().includes(search) ||
                    opt.regNo?.toLowerCase().includes(search)
                );
              }}

              getOptionLabel={(option) => {
                if (typeof option === "string") return option; // typed value
                return option.label || "";
              }}

              onChange={async (e, newValue) => {
                // Existing vehicle selected
                if (newValue && typeof newValue === "object") {
                  setForm((f) => ({ ...f, vehicle_guid: newValue.value }));
                  setErrors((err) => ({ ...err, vehicle_guid: "" }));
                  return;
                }



                // 🆕 New vehicle entered
                if (typeof newValue === "string" && newValue.trim()) {
                  const vehicleNo = newValue.trim().toUpperCase();

                  // ❌ validation
                  if (!isValidVehicleNumber(vehicleNo)) {
                    showSnackbar(
                      "Vehicle number must be alphanumeric and max 10 characters",
                      "error"
                    );
                    return;
                  }

                  if (!form.customer_guid) {
                    showSnackbar("Please select customer first", "error");
                    return;
                  }

                  try {
                    const res = await fetch(`${apiEndpoints.usersdata}?table=vehicles&todo=insert`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        registration_number: newValue,
                        customer_guid: form.customer_guid,
                      }),
                    });

                    const data = await res.json();

                    // assuming backend returns vehicle_guid
                    const newVehicle = {
                      value: data.vehicle_guid,
                      label: data.label || newValue,
                      regNo: newValue,
                    };

                    setVehicles((prev) => [...prev, newVehicle]);
                    setForm((f) => ({ ...f, vehicle_guid: data.vehicle_guid }));

                    showSnackbar(
                      `Vehicle ${newValue} added successfully`,
                      "success"
                    );
                  } catch (err) {
                    console.error(err);
                    showSnackbar("Failed to add vehicle", "error");
                  }
                }
              }}

              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Vehicle *"
                  size="small"
                  fullWidth
                  error={!!errors.vehicle_guid}
                  helperText={errors.vehicle_guid}
                  InputLabelProps={{ shrink: true }}
                  sx={{ "& .MuiInputLabel-root": { top: "-5px" } }}
                />
              )}
            />
          </Grid>


          {/* Repair Category */}
          <Grid item xs={12} md={6} width={{ xs: "100%", sm: "45%" }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Repair Category *"
              value={form.repair_category_id || ""}
              disabled={isView}
              error={!!errors.repair_category_id}
              helperText={errors.repair_category_id}
              onChange={(e) => {
                setForm((f) => ({ ...f, repair_category_id: e.target.value }));
                setErrors((err) => ({ ...err, repair_category_id: "" }));
              }}
              InputLabelProps={{ shrink: true }}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 48 * 7, // ⭐ SHOW ONLY 7 ITEMS
                    },
                  },
                },
              }}
              sx={{
                "& .MuiInputLabel-root": { top: "-2px" },
              }}
            >
              <MenuItem value="">-- Select --</MenuItem>
              {repairCategories.map((r) => (
                <MenuItem key={r.id} value={r.id}>
                  {r.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Service Type */}
          <Grid item xs={12} md={6} width={{ xs: "100%", sm: "45%" }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Service Type"
              value={form.service_type || "Paid"}
              disabled={isView}
              error={!!errors.service_type}
              helperText={errors.service_type}
              onChange={(e) => {
                setForm((f) => ({ ...f, service_type: e.target.value }));
                setErrors((err) => ({ ...err, service_type: "" }));
              }}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiInputLabel-root": { top: "-2px" },
              }}
            >
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Free">Free</MenuItem>
            </TextField>
          </Grid>
          {/* Branch */}
          <Grid item xs={12} md={6} width={{ xs: "100%", sm: "45%" }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Branch *"
              value={form.branch_id || ""}
              disabled={isView}
              error={!!errors.branch_id}
              helperText={errors.branch_id}
              onChange={(e) => {
                setForm((f) => ({ ...f, branch_id: e.target.value }));
                setErrors((err) => ({ ...err, branch_id: "" }));
              }}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiInputLabel-root": { top: "-2px" },
              }}
            >
              <MenuItem value="">-- Select Branch --</MenuItem>
              {branches.map((b) => (
                <MenuItem key={b.value} value={b.value}>
                  {b.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {/* Arrival Date */}
          <Grid item xs={12} md={6} width={{ xs: "100%", sm: "45%" }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Arrival Date"
              InputLabelProps={{ shrink: true }}
              value={form.arrival_date}
              disabled={isView}
              error={!!errors.arrival_date}
              helperText={errors.arrival_date}
              onChange={(e) => {
                setForm((f) => ({ ...f, arrival_date: e.target.value }));
                setErrors((err) => ({ ...err, arrival_date: "" }));
              }}
              sx={{
                "& .MuiInputLabel-root": { top: "-2px" },
              }}
            />
          </Grid>

          {/* Estimate Date */}
          <Grid item xs={12} md={6} width={{ xs: "100%", sm: "45%" }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Estimate Delivery Date *"
              InputLabelProps={{ shrink: true }}
              value={form.estimate_date || ""}
              error={!!errors.estimate_date}
              disabled={isView}
              helperText={errors.estimate_date}
              onChange={(e) => {
                setForm((f) => ({ ...f, estimate_date: e.target.value }));
                setErrors((err) => ({ ...err, estimate_date: "" }));
              }}
              sx={{
                "& .MuiInputLabel-root": { top: "-2px" },
              }}
            />
          </Grid>

          {/* Assign To */}
          <Grid item xs={12} md={6} width={{ xs: "100%", sm: "45%" }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Assign To *"
              value={form.assign_to || ""}
              disabled={isView}
              error={!!errors.assign_to}
              helperText={errors.assign_to}
              onChange={(e) => {
                setForm((f) => ({ ...f, assign_to: e.target.value }));
                setErrors((err) => ({ ...err, assign_to: "" }));
              }}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiInputLabel-root": { top: "-2px" },
              }}
            >
              <MenuItem value="">-- Select Employee --</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.value} value={emp.value}>
                  {emp.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Additional Options */}
          <Grid item xs={12} md={6} width={{ xs: "100%", sm: "45%" }}>
            <TextField
              fullWidth
              size="small"
              label="Additional Options"
              placeholder="Comma separated (ex: Wash Bay, MOT Test)"
              value={Object.keys(form.additional_options || {}).join(", ")}
              disabled={isView}
              onChange={(e) => {
                const arr = e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);
                const obj = {};
                arr.forEach((k) => (obj[k] = true));

                setForm((f) => ({ ...f, additional_options: obj }));
                setErrors((err) => ({ ...err, additional_options: "" }));
              }}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiInputLabel-root": { top: "-2px" },
              }}
            />
          </Grid>

          {/* Image Upload */}
          {/* <Grid item xs={12} width={{ xs: "100%", sm: "45%" }}>
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Upload Images (before service)
            </Typography>

            <Box
              sx={{
                border: "2px dashed #b6b6b6",
                p: 3,
                borderRadius: 2,
                textAlign: "center",
                background: "#fafafa",
              }}
            >
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    images: [
                      ...(f.images || []),
                      ...Array.from(e.target.files),
                    ],
                  }))
                }
              />
            </Box>
          </Grid> */}
        </Grid>
      </Box>
    );
  }
);
export default Step1_ServiceDetails;
