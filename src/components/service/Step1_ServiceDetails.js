import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { 
  User, 
  Car, 
  Wrench, 
  DollarSign, 
  Building2, 
  Calendar, 
  Clock, 
  MoreHorizontal,
  ChevronDown
} from "lucide-react";
import apiEndpoints from "../../apiconfig";
import Autocomplete from "@mui/material/Autocomplete";
import { Box } from "@mui/material";

// ── tiny helpers (consistent with other premium pages) ────────────────────────
const Field = ({ label, icon: Icon, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
      {Icon && <Icon size={14} style={{ color: "#8B5CF6" }} />}
      {label}
    </label>
    {children}
    {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
  </div>
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

const SectionCard = ({ title, children, icon: Icon }) => (
  <div style={{
    background: "#fff",
    borderRadius: 16,
    border: "1px solid #F3F4F6",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    padding: "24px",
    marginBottom: 24,
  }}>
    <div style={{ borderBottom: "1px solid #F3F4F6", paddingBottom: 12, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
       {Icon && <Icon size={18} style={{ color: "#8B5CF6" }} />}
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</h3>
    </div>
    {children}
  </div>
);

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
      fetchEmployees(); // Use specialized fetch for employees
      fetchDropdown("repair_category", null, setRepairCategories);
      fetchDropdown("branches", null, setBranches);
    }, []);
    // When editing, load vehicles for saved cus  tomer
    useEffect(() => {
      if (form.customer_guid) {
        fetchVehicles(form.customer_guid);
      }
    }, [form.customer_guid]);

    const fetchEmployees = async () => {
      try {
        const url = `${apiEndpoints.usersdata}?user_type=employee`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        
        if (result.status === "success" && Array.isArray(result.data)) {
          // Filter only mechanics (case-insensitive)
          const mechanics = result.data.filter(emp => 
            emp.position && emp.position.toLowerCase().includes("mechanic")
          );
          
          setEmployees(
            mechanics.map((d) => ({
              value: d.user_guid,
              label: `${d.first_name} ${d.last_name}`,
              phone: d.mobile,
              position: d.position
            }))
          );
        }
      } catch (err) {
        console.error("employee fetch error", err);
      }
    };

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
        <SectionCard title="Service Details" icon={Wrench}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            
            <Field label="Customer *" icon={User} error={errors.customer_guid}>
              <Autocomplete
                options={customers}
                disabled={isView}
                value={
                  customers.find((c) => c.value === form.customer_guid) || 
                  (form.customer_name ? { value: form.customer_guid, label: form.customer_name } : null)
                }
                filterOptions={(options, { inputValue }) => {
                  const search = inputValue.toLowerCase();
                  return options.filter((option) =>
                    option.label.toLowerCase().includes(search) || option.phone.includes(search)
                  );
                }}
                onChange={(e, nv) => {
                  onCustomerChange(nv);
                  setErrors((err) => ({ ...err, customer_guid: "" }));
                }}
                renderInput={(params) => (
                  <div ref={params.InputProps.ref} style={{ position: "relative" }}>
                    <input
                      {...params.inputProps}
                      placeholder="Search name or phone..."
                      disabled={isView}
                      style={inputSx(!!errors.customer_guid)}
                    />
                    <ChevronDown size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
                  </div>
                )}
              />
            </Field>

            <Field label="Vehicle *" icon={Car} error={errors.vehicle_guid}>
              <Autocomplete
                freeSolo
                disabled={isView}
                options={vehicles}
                value={
                  vehicles.find((v) => v.value === form.vehicle_guid) || 
                  (form.vehicle_name ? { value: form.vehicle_guid, label: form.vehicle_name } : null)
                }
                filterOptions={(options, { inputValue }) => {
                  const search = inputValue.toLowerCase();
                  return options.filter((opt) =>
                    opt.label.toLowerCase().includes(search) || opt.regNo?.toLowerCase().includes(search)
                  );
                }}
                getOptionLabel={(option) => typeof option === "string" ? option : (option.label || "")}
                onChange={async (e, newValue) => {
                  if (newValue && typeof newValue === "object") {
                    setForm((f) => ({ ...f, vehicle_guid: newValue.value }));
                    setErrors((err) => ({ ...err, vehicle_guid: "" }));
                    return;
                  }
                  if (typeof newValue === "string" && newValue.trim()) {
                    const vehicleNo = newValue.trim().toUpperCase();
                    if (!isValidVehicleNumber(vehicleNo)) {
                      showSnackbar("Invalid vehicle number", "error");
                      return;
                    }
                    if (!form.customer_guid) {
                      showSnackbar("Select customer first", "error");
                      return;
                    }
                    try {
                      const res = await fetch(`${apiEndpoints.usersdata}?table=vehicles&todo=insert`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ registration_number: newValue, customer_guid: form.customer_guid }),
                      });
                      const data = await res.json();
                      const newVehicle = { value: data.vehicle_guid, label: data.label || newValue, regNo: newValue };
                      setVehicles((prev) => [...prev, newVehicle]);
                      setForm((f) => ({ ...f, vehicle_guid: data.vehicle_guid }));
                    } catch (err) { console.error(err); }
                  }
                }}
                renderInput={(params) => (
                  <div ref={params.InputProps.ref} style={{ position: "relative" }}>
                    <input
                      {...params.inputProps}
                      placeholder="Reg No or Select..."
                      disabled={isView}
                      style={inputSx(!!errors.vehicle_guid)}
                    />
                    <ChevronDown size={16} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
                  </div>
                )}
              />
            </Field>

            <Field label="Repair Category *" icon={Wrench} error={errors.repair_category_id}>
              <select
                disabled={isView}
                value={form.repair_category_id || ""}
                style={inputSx(!!errors.repair_category_id)}
                onChange={(e) => {
                  setForm((f) => ({ ...f, repair_category_id: e.target.value }));
                  setErrors((err) => ({ ...err, repair_category_id: "" }));
                }}
              >
                <option value="">-- Select --</option>
                {repairCategories.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Service Type" icon={DollarSign} error={errors.service_type}>
              <select
                disabled={isView}
                value={form.service_type || "Paid"}
                style={inputSx(!!errors.service_type)}
                onChange={(e) => {
                  setForm((f) => ({ ...f, service_type: e.target.value }));
                  setErrors((err) => ({ ...err, service_type: "" }));
                }}
              >
                <option value="Paid">Paid</option>
                <option value="Free">Free</option>
              </select>
            </Field>

            <Field label="Branch *" icon={Building2} error={errors.branch_id}>
              <select
                disabled={isView}
                value={form.branch_id || ""}
                style={inputSx(!!errors.branch_id)}
                onChange={(e) => {
                  setForm((f) => ({ ...f, branch_id: e.target.value }));
                  setErrors((err) => ({ ...err, branch_id: "" }));
                }}
              >
                <option value="">-- Select Branch --</option>
                {branches.map((b) => (
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Arrival Date" icon={Calendar} error={errors.arrival_date}>
              <input
                type="date"
                disabled={isView}
                value={form.arrival_date}
                style={inputSx(!!errors.arrival_date)}
                onChange={(e) => {
                  setForm((f) => ({ ...f, arrival_date: e.target.value }));
                  setErrors((err) => ({ ...err, arrival_date: "" }));
                }}
              />
            </Field>

            <Field label="Est. Delivery Date *" icon={Clock} error={errors.estimate_date}>
              <input
                type="date"
                disabled={isView}
                value={form.estimate_date || ""}
                style={inputSx(!!errors.estimate_date)}
                onChange={(e) => {
                  setForm((f) => ({ ...f, estimate_date: e.target.value }));
                  setErrors((err) => ({ ...err, estimate_date: "" }));
                }}
              />
            </Field>

            <Field label="Assign To *" icon={User} error={errors.assign_to}>
              <select
                disabled={isView}
                value={form.assign_to || ""}
                style={inputSx(!!errors.assign_to)}
                onChange={(e) => {
                  setForm((f) => ({ ...f, assign_to: e.target.value }));
                  setErrors((err) => ({ ...err, assign_to: "" }));
                }}
              >
                <option value="">-- Select Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.value} value={emp.value}>{emp.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Additional Options" icon={MoreHorizontal}>
              <input
                placeholder="Ex: Wash Bay, MOT Test"
                disabled={isView}
                value={Object.keys(form.additional_options || {}).join(", ")}
                style={inputSx(false)}
                onChange={(e) => {
                  const arr = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                  const obj = {};
                  arr.forEach((k) => (obj[k] = true));
                  setForm((f) => ({ ...f, additional_options: obj }));
                }}
              />
            </Field>
          </div>
        </SectionCard>
      </Box>
    );
  }
);
export default Step1_ServiceDetails;
