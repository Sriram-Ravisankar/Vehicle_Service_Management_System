import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { format } from "date-fns";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Upload, 
  X, 
  Save, 
  Briefcase, 
  Car, 
  CreditCard, 
  DollarSign, 
  ShieldCheck,
  Calendar,
  Trash2,
  Plus,
  Hash
} from "lucide-react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import apiEndpoints from "../../apiconfig/index";
import DynamicHeader from "../../components/common/Dynamicheader";

// ── tiny helpers (consistent with AddSupplier / AddPurchase) ───────────────────
const Field = ({ label, icon: Icon, error, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
      {Icon && <Icon size={14} style={{ color: "#0EA5E9" }} />}
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

const api = {
  get: async (url) => {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + sessionStorage.getItem("token"),
      },
    });
    const data = await response.json();
    return { data, ok: response.ok, status: response.status };
  },
};

const AddUser = ({ userType, onSave, users }) => {
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Define constants for dropdown options
  const shiftTimings = [
    { id: 1, name: "Morning" },
    { id: 2, name: "Evening" },
    { id: 3, name: "Night" },
  ];

  const assignedAreas = [
    { id: 1, name: "Washing Bay" },
    { id: 2, name: "Spare Parts Store" },
    { id: 3, name: "Maintenance" },
    { id: 4, name: "Office" },
    { id: 5, name: "Other" },
  ];

  const supportStaffRoles = [
    { id: 1, name: "Cleaner" },
    { id: 2, name: "Helper" },
    { id: 3, name: "Runner" },
    { id: 4, name: "Inventory Helper" },
  ];

  const [formData, setFormData] = useState({
    // Basic Information
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    alternateMobile: "",
    gender: "male",
    companyName: "",
    taxId: "",
    landline: "",
    country: "",
    state: "",
    city: "",
    address: "",
    permanentAddress: "",
    image: null,
    imagePath: "", // For displaying existing image in edit mode

    // Employee Specific Fields
    position: "",
    department: "",
    employeeType: "",
    dateOfJoining: null,
    shiftTiming: "",
    reportingManager: "",
    workLocation: "",

    // Support Staff Specific Fields
    role: "",
    assignedArea: "",
    emergencyContact: "",

    // Accountant Specific Fields
    specialization: "",
    qualifications: "",

    // Salary & Banking
    monthlySalary: "",
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    panNumber: "",
    aadhaarNumber: "",

    // Status & Tracking
    status: "Active",
    employeeCode: "",
    totalJobsAssigned: 0,
    jobsCompleted: 0,
    customerRating: 0,
    attendanceRecord: "",
    leaveBalance: 0,
  });

  useEffect(() => {
    validateWhileTyping();
    // eslint-disable-next-line
  }, [
    formData.email,
    formData.mobile,
    formData.alternateMobile,
    formData.ifscCode,
    formData.panNumber,
    formData.aadhaarNumber,
    formData.accountNumber,
  ]);

  const validateWhileTyping = () => {
    let newErrors = {};

    // Email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    // Mobile validation
    if (formData.mobile && !/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile";
    }

    // Alternate mobile (optional)
    if (
      formData.alternateMobile &&
      !/^[0-9]{10}$/.test(formData.alternateMobile)
    ) {
      newErrors.alternateMobile = "Enter a valid 10-digit number";
    }

    // IFSC
    if (
      formData.ifscCode &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(formData.ifscCode)
    ) {
      newErrors.ifscCode = "Invalid IFSC (e.g., HDFC0123456)";
    }

    // PAN
    if (
      formData.panNumber &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.panNumber)
    ) {
      newErrors.panNumber = "Invalid PAN Number (e.g., ABCDE1234F)";
    }

    // Aadhaar
    if (formData.aadhaarNumber && !/^[0-9]{12}$/.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = "Invalid 12-digit Aadhaar";
    }

    // Account Number
    if (
      formData.accountNumber &&
      !/^[0-9]{6,18}$/.test(formData.accountNumber)
    ) {
      newErrors.accountNumber = "Account number must be 6–18 digits";
    }

    // Tax id
    if (
      formData.taxId &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        formData.taxId.toUpperCase()
      )
    ) {
      newErrors.taxId = "Invalid GST Number (e.g., 22ABCDE1234F1Z5)";
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
  };

  const [vehicles, setVehicles] = useState([
    {
      registrationNumber: "",
      chassisNumber: "",
      engineNumber: "",
      make: "",
      model: "",
      fuelType: "",
      odometerReading: "",
      yearOfManufacture: "",
      color: "",
      transmissionType: "",
      insuranceValidity: "",
      pollutionCertValidity: "",
    },
  ]);



  useEffect(() => {
    if (isEdit && id) {
      const fetchUserData = async () => {
        try {
          // Use user_guid instead of id in the URL
          console.log("usersdata endpoint:", apiEndpoints.usersdata);
          const response = await api.get(
            `${apiEndpoints.usersdata}?user_guid=${id}`
          );
          const data = response.data;

          if (response.ok && data.status === "success") {
            const userData = data.data || {};
            console.log("User Data:", userData);

            // Map API response to form data structure
            const mappedData = {
              // Basic Information
              firstName: userData.first_name || "",
              lastName: userData.last_name || "",
              email: userData.email || "",
              mobile: userData.mobile || "",
              alternateMobile: userData.alternate_mobile || "",
              gender: userData.gender || "male",
              companyName: userData.company_name || "",
              taxId: userData.tax_id || "",
              landline: userData.landline || "",
              country: userData.country || "",
              state: userData.state || "",
              city: userData.city || "",
              address: userData.address || "",
              permanentAddress: userData.permanent_address || "",
              imagePath: userData.image_path || "",
              status: userData.isActive == 1 ? "Active" : "Inactive",

              // Employee Specific
              position: userData.position || "",
              department: userData.department || "",
              employeeType: userData.employee_type || "",
              dateOfJoining: userData.date_of_joining
                ? new Date(userData.date_of_joining)
                : userData.joining_date
                  ? new Date(userData.joining_date)
                  : null,

              shiftTiming: userData.shiftTiming || userData.shift_timing || "",
              reportingManager: userData.reporting_manager || "",
              workLocation: userData.work_location || "",
              monthlySalary: userData.monthly_salary ?? userData.monthlySalary ?? userData.salary ?? "",
              bankName: userData.bank_name || "",
              accountHolderName: userData.account_holder_name || "",
              accountNumber: userData.account_number || "",
              ifscCode: userData.ifsc_code || "",
              panNumber: userData.pan_number || "",
              aadhaarNumber: userData.aadhaar_number || "",
              employeeCode: userData.employee_code || "",
              totalJobsAssigned: userData.total_jobs_assigned || 0,
              jobsCompleted: userData.jobs_completed || 0,
              customerRating: userData.customer_rating || 0,
              attendanceRecord: userData.attendance_record || "",
              leaveBalance: userData.leave_balance || 0,

              // Support Staff Specific
              role: userData.role || "",
              assignedArea: userData.assignedArea || "",
              emergencyContact: userData.emergencyContact || "",

              // Accountant Specific
              specialization: userData.specialization || "",
              qualifications: userData.qualifications || "",
            };

            // Handle vehicles data
            let vehiclesData = [
              {
                registrationNumber: "",
                chassisNumber: "",
                engineNumber: "",
                make: "",
                model: "",
                fuelType: "",
                odometerReading: "",
                yearOfManufacture: "",
                color: "",
                transmissionType: "",
                insuranceValidity: "",
                pollutionCertValidity: "",
              },
            ];

            if (userData.vehicles && Array.isArray(userData.vehicles)) {
              vehiclesData = userData.vehicles.map((vehicle) => ({
                registrationNumber: vehicle.registration_number || "",
                chassisNumber: vehicle.chassis_number || "",
                engineNumber: vehicle.engine_number || "",
                make: vehicle.make || "",
                model: vehicle.model || "",
                fuelType: vehicle.fuel_type || "",
                odometerReading: vehicle.odometer_reading || "",
                yearOfManufacture: vehicle.year_of_manufacture || "",
                color: vehicle.color || "",
                transmissionType: vehicle.transmission_type || "",
                insuranceValidity: vehicle.insurance_validity || "",
                pollutionCertValidity: vehicle.pollution_cert_validity || "",
              }));
            }



            console.log("Mapped Data:", mappedData);
            console.log("Vehicles Data:", vehiclesData);
            setFormData(mappedData);
            setVehicles(vehiclesData);
          } else {
            console.error(data.error || "Failed to fetch user data");
            alert(data.error || "Failed to fetch user data");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          // alert("An error occurred while fetching user data");
        }
      };

      fetchUserData();
    }
  }, [id, users, userType, isEdit]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // clear error for that field
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "image") {
      const file = files ? files[0] : null;
      if (file) {
        setFormData({
          ...formData,
          image: file,
          imagePreview: URL.createObjectURL(file),
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, dateOfJoining: date });
  };

  const handleVehicleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVehicles = [...vehicles];
    updatedVehicles[index] = { ...updatedVehicles[index], [name]: value };
    setVehicles(updatedVehicles);
  };

  const addVehicle = () => {
    setVehicles([
      ...vehicles,
      {
        registrationNumber: "",
        chassisNumber: "",
        engineNumber: "",
        make: "",
        model: "",
        fuelType: "",
        odometerReading: "",
        yearOfManufacture: "",
        color: "",
        transmissionType: "",
        insuranceValidity: "",
        pollutionCertValidity: "",
      },
    ]);
  };

  const removeVehicle = (index) => {
    if (vehicles.length > 1) {
      const updatedVehicles = [...vehicles];
      updatedVehicles.splice(index, 1);
      setVehicles(updatedVehicles);
    }
  };



  const validateForm = () => {
    let newErrors = {};

    // Basic required fields (applies to all)
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    if (!formData.permanentAddress.trim())
      newErrors.permanentAddress = "Permanent address is required";

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    // Mobile number
    const mobileRegex = /^[0-9]{10}$/;
    if (formData.mobile && !mobileRegex.test(formData.mobile)) {
      newErrors.mobile = "Enter a valid 10-digit number";
    }

    // Alternate mobile (optional)
    if (
      formData.alternateMobile &&
      !mobileRegex.test(formData.alternateMobile)
    ) {
      newErrors.alternateMobile = "Enter a valid 10-digit number";
    }

    // -----------------------------------------
    // EMPLOYEE VALIDATION
    // -----------------------------------------
    if (userType === "Employees") {
      if (!formData.position.trim())
        newErrors.position = "Position is required";
      if (!formData.department.trim())
        newErrors.department = "Department is required";
      if (!formData.employeeType.trim())
        newErrors.employeeType = "Employee type is required";
      if (!formData.dateOfJoining)
        newErrors.dateOfJoining = "Date of joining is required";
      if (!formData.employeeCode.trim())
        newErrors.employeeCode = "Employee code is required";

      // Bank & Salary
      if (!formData.monthlySalary)
        newErrors.monthlySalary = "Salary is required";
      if (!formData.bankName.trim())
        newErrors.bankName = "Bank name is required";
      if (!formData.accountHolderName.trim())
        newErrors.accountHolderName = "Account holder name is required";

      // Account number
      const accountNumberRegex = /^[0-9]{6,18}$/;
      if (!formData.accountNumber.trim()) {
        newErrors.accountNumber = "Account number is required";
      } else if (!accountNumberRegex.test(formData.accountNumber.trim())) {
        newErrors.accountNumber = "Enter 6–18 digit account number";
      }

      // IFSC
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i;
      if (!formData.ifscCode.trim()) {
        newErrors.ifscCode = "IFSC is required";
      } else if (!ifscRegex.test(formData.ifscCode.trim())) {
        newErrors.ifscCode = "Invalid IFSC code";
      }

      // PAN
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
      if (!formData.panNumber.trim()) {
        newErrors.panNumber = "PAN is required";
      } else if (!panRegex.test(formData.panNumber.trim())) {
        newErrors.panNumber = "Invalid PAN format";
      }

      // Aadhaar optional but validate format
      if (
        formData.aadhaarNumber &&
        !/^[0-9]{12}$/.test(formData.aadhaarNumber)
      ) {
        newErrors.aadhaarNumber = "Invalid 12-digit Aadhaar";
      }
    }

    // Tax ID (optional but validate if present)
    if (
      formData.taxId &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        formData.taxId.toUpperCase()
      )
    ) {
      newErrors.taxId = "Invalid GST Number";
    }

    // -----------------------------------------
    // SUPPORT STAFF VALIDATION
    // -----------------------------------------
    if (userType === "Support Staff") {
      if (!formData.role) newErrors.role = "Role is required";
      if (!formData.assignedArea)
        newErrors.assignedArea = "Assigned area is required";
      if (!formData.shiftTiming)
        newErrors.shiftTiming = "Shift timing is required";
      if (!formData.emergencyContact.trim())
        newErrors.emergencyContact = "Emergency contact is required";
      if (!formData.dateOfJoining)
        newErrors.dateOfJoining = "Date of joining is required";
      if (!formData.status) newErrors.status = "Status is required";
    }

    // -----------------------------------------
    // ACCOUNTANT VALIDATION
    // -----------------------------------------
    if (userType === "Accountants") {
      if (!formData.specialization.trim())
        newErrors.specialization = "Specialization is required";
      if (!formData.qualifications.trim())
        newErrors.qualifications = "Qualifications are required";
    }

    // -----------------------------------------
    // CUSTOMER VALIDATION
    // -----------------------------------------
    if (userType === "Customers") {
      vehicles.forEach((v, index) => {
        if (!v.registrationNumber.trim()) {
          newErrors[`vehicle_${index}_registrationNumber`] =
            "Registration number is required";
        }
      });
    }

    if (userType === "Customers") {
      const VEHICLE_REGEX = /^[A-Z0-9]{8,10}$/;

      vehicles.forEach((vehicle, index) => {
        if (!vehicle.registrationNumber.trim()) {
          newErrors[`vehicle_${index}_registrationNumber`] =
            "Registration number is required";
        } else if (
          !VEHICLE_REGEX.test(vehicle.registrationNumber.toUpperCase())
        ) {
          newErrors[`vehicle_${index}_registrationNumber`] =
            "Vehicle number must be 8–10 alphanumeric characters";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // STOP submit if validation fails
    }

    setLoading(true);

    try {
      const userTypeMapping = {
        Employees: "employee",
        Customers: "customer",
        Accountants: "accountant",
        "Support Staff": "support_staff",
      };

      const formDataToSend = new FormData();

      // Action type for PHP (insert or update)
      formDataToSend.append("action", isEdit ? "update" : "insert");

      // If updating, include the user_guid
      if (isEdit) {
        formDataToSend.append("user_guid", id);
      }

      // Append user type
      formDataToSend.append(
        "user_type",
        userTypeMapping[userType] || "customer"
      );

      // Append basic info
      formDataToSend.append("first_name", formData.firstName);
      formDataToSend.append("last_name", formData.lastName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("mobile", formData.mobile);
      formDataToSend.append("alternate_mobile", formData.alternateMobile);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("company_name", formData.companyName);
      formDataToSend.append("tax_id", formData.taxId);
      formDataToSend.append("landline", formData.landline);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("permanent_address", formData.permanentAddress);
      formDataToSend.append(
        "isActive",
        formData.status === "Active" ? "1" : "0"
      );


      // Append image if exists
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      // Employee-specific fields
      if (userType === "Employees") {
        formDataToSend.append("position", formData.position);
        formDataToSend.append("department", formData.department);
        formDataToSend.append("employee_type", formData.employeeType);
        if (formData.dateOfJoining) {
          formDataToSend.append(
            "date_of_joining",
            format(formData.dateOfJoining, "yyyy-MM-dd")
          );
        }
        formDataToSend.append("shift_timing", formData.shiftTiming);
        formDataToSend.append("reporting_manager", formData.reportingManager);
        formDataToSend.append("work_location", formData.workLocation);
        formDataToSend.append("monthly_salary", formData.monthlySalary);
        formDataToSend.append("bank_name", formData.bankName);
        formDataToSend.append(
          "account_holder_name",
          formData.accountHolderName
        );
        formDataToSend.append("account_number", formData.accountNumber);
        formDataToSend.append("ifsc_code", formData.ifscCode);
        formDataToSend.append("pan_number", formData.panNumber);
        formDataToSend.append("aadhaar_number", formData.aadhaarNumber);
        formDataToSend.append("employee_code", formData.employeeCode);
        formDataToSend.append(
          "total_jobs_assigned",
          formData.totalJobsAssigned
        );
        formDataToSend.append("jobs_completed", formData.jobsCompleted);
        formDataToSend.append("customer_rating", formData.customerRating);
        formDataToSend.append("attendance_record", formData.attendanceRecord);
        formDataToSend.append("leave_balance", formData.leaveBalance);
      }

      // Support Staff-specific fields
      if (userType === "Support Staff") {
        formDataToSend.append("role", formData.role);
        formDataToSend.append("assigned_area", formData.assignedArea);
        formDataToSend.append("emergency_contact", formData.emergencyContact);
        if (formData.dateOfJoining) {
          formDataToSend.append(
            "date_of_joining",
            format(formData.dateOfJoining, "yyyy-MM-dd")
          );
        }
        formDataToSend.append("shift_timing", formData.shiftTiming);
      }

      // Accountant-specific fields
      if (userType === "Accountants") {
        formDataToSend.append("specialization", formData.specialization);
        formDataToSend.append("qualifications", formData.qualifications);
      }

      // Vehicles if customer
      if (userType === "Customers") {
        const processedVehicles = vehicles.map((vehicle) => ({
          registration_number: vehicle.registrationNumber,
          chassis_number: vehicle.chassisNumber,
          engine_number: vehicle.engineNumber,
          make: vehicle.make,
          model: vehicle.model,
          fuel_type: vehicle.fuelType,
          odometer_reading: vehicle.odometerReading,
          year_of_manufacture: vehicle.yearOfManufacture,
          color: vehicle.color,
          transmission_type: vehicle.transmissionType,
          insurance_validity: vehicle.insuranceValidity,
          pollution_cert_validity: vehicle.pollutionCertValidity,
        }));
        formDataToSend.append("vehicles", JSON.stringify(processedVehicles));
      }



      console.log("EDIT MODE:", isEdit);
      console.log("Sending user_guid:", id);
      console.log("FormData entries:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }

      const response = await fetch(apiEndpoints.usersdata, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        method: "POST", // always POST now
        body: formDataToSend,
      });

      const responseData = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: isEdit
            ? "User updated successfully!"
            : "User added successfully!",
          severity: "success",
        });

        setTimeout(() => {
          const routes = {
            Employees: "/employees",
            Customers: "/customers",
            Accountants: "/accountants",
            "Support Staff": "/support-staff",
          };
          navigate(routes[userType] || "/customers");
        }, 1200);
      } else {
        console.error(responseData.error);
        setSnackbar({
          open: true,
          message: responseData.error || "Failed to save user",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // alert("An error occurred while submitting the form");
    } finally {
      setLoading(false);
    }
  };

  // Render Support Staff specific fields
  const renderSupportStaffFields = () => (
    <SectionCard title="Support Staff Information" icon={Briefcase}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 20 }}>
        <Field label="Role/Designation *" icon={Briefcase} error={errors.role}>
          <select name="role" value={formData.role} onChange={handleChange} style={inputSx(!!errors.role)}>
            <option value="">Select Role</option>
            {supportStaffRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Field>

        <Field label="Assigned Area *" icon={MapPin} error={errors.assignedArea}>
          <select name="assignedArea" value={formData.assignedArea} onChange={handleChange} style={inputSx(!!errors.assignedArea)}>
            <option value="">Select Area</option>
            {assignedAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>

        <Field label="Shift Timing *" icon={Calendar} error={errors.shiftTiming}>
          <select name="shiftTiming" value={formData.shiftTiming} onChange={handleChange} style={inputSx(!!errors.shiftTiming)}>
            <option value="">Select Shift</option>
            {shiftTimings.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>

        <Field label="Emergency Contact *" icon={Phone} error={errors.emergencyContact}>
          <input name="emergencyContact" value={formData.emergencyContact} onChange={handleChange}
            placeholder="Enter Emergency Contact" style={inputSx(!!errors.emergencyContact)} />
        </Field>

        <Field label="Date of Joining *" icon={Calendar} error={errors.dateOfJoining}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
             <DatePicker
              value={formData.dateOfJoining}
              onChange={(newValue) => setFormData({ ...formData, dateOfJoining: newValue })}
              slotProps={{
                textField: {
                  fullWidth: true,
                  size: "small",
                  sx: { "& .MuiOutlinedInput-root": { borderRadius: "8px", background: "#F9FAFB" } },
                },
              }}
            />
          </LocalizationProvider>
        </Field>

        <Field label="Status *" icon={ShieldCheck} error={errors.status}>
          <select name="status" value={formData.status} onChange={handleChange} style={inputSx(!!errors.status)}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </Field>
      </div>
    </SectionCard>
  );

  // Render Accountant specific fields
  const renderAccountantFields = () => (
    <SectionCard title="Accountant Information" icon={Briefcase}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 20 }}>
        <Field label="Specialization" icon={Briefcase} error={errors.specialization}>
          <input name="specialization" value={formData.specialization} onChange={handleChange}
            placeholder="Enter Specialization" style={inputSx(!!errors.specialization)} />
        </Field>

        <Field label="Qualifications" icon={Briefcase} error={errors.qualifications}>
          <input name="qualifications" value={formData.qualifications} onChange={handleChange}
            placeholder="Enter Qualifications" style={inputSx(!!errors.qualifications)} />
        </Field>
      </div>
    </SectionCard>
  );

  return (
    <Box sx={{ 
      px: { xs: 1.5, sm: 4, md: 6 }, 
      py: { xs: 2, sm: 4 }, 
      width: "100%", 
      maxWidth: "100%", 
      overflowX: "hidden" 
    }}>
      <DynamicHeader />

      <form onSubmit={handleSubmit}>
        {/* ── SECTION 1: Personal Information ── */}
        <SectionCard title="Personal Information" icon={User}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 20 }}>
            <Field label="First Name *" icon={User} error={errors.firstName}>
              <input name="firstName" value={formData.firstName} onChange={handleChange}
                placeholder="Name" style={inputSx(!!errors.firstName)} />
            </Field>

            <Field label="Last Name *" icon={User} error={errors.lastName}>
              <input name="lastName" value={formData.lastName} onChange={handleChange}
                placeholder="Surname" style={inputSx(!!errors.lastName)} />
            </Field>

            <Field label="Email *" icon={Mail} error={errors.email}>
              <input name="email" type="email" value={formData.email} onChange={handleChange}
                placeholder="example@mail.com" style={inputSx(!!errors.email)} />
            </Field>

            <Field label="Mobile Number *" icon={Phone} error={errors.mobile}>
              <input name="mobile" value={formData.mobile} onChange={handleChange}
                placeholder="10-digit number" style={inputSx(!!errors.mobile)} />
            </Field>

            <Field label="Alternate Contact" icon={Phone}>
              <input name="alternateMobile" value={formData.alternateMobile} onChange={handleChange}
                placeholder="Optional" style={inputSx(false)} />
            </Field>



            <Field label="Gender">
              <div style={{ display: "flex", gap: 20, paddingTop: 8 }}>
                {["male", "female"].map(g => (
                  <label key={g} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                    <input type="radio" name="gender" value={g} checked={formData.gender === g}
                      onChange={handleChange} style={{ accentColor: "#0EA5E9", width: 16, height: 16 }} />
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </label>
                ))}
              </div>
            </Field>

            {/* Profile Image */}
            <Field label="Profile Image">
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", paddingTop: 2 }}>
                <label style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500,
                  border: "1px solid #0EA5E9", color: "#0EA5E9", cursor: "pointer", background: "#fff",
                }}>
                  <Upload size={14} /> Choose Image
                  <input type="file" name="image" accept="image/*" hidden onChange={handleChange} />
                </label>
                {(formData.imagePreview || formData.imagePath) && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <img
                      src={formData.imagePreview || (formData.imagePath ? (apiEndpoints.ImageURL + formData.imagePath) : "")}
                      alt="Preview"
                      style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid #E5E7EB" }}
                    />
                    <button type="button"
                      onClick={() => setFormData((p) => ({ ...p, image: null, imagePreview: "", imagePath: "" }))}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", padding: 0 }}
                    ><X size={16} /></button>
                  </div>
                )}
              </div>
            </Field>
          </div>
        </SectionCard>

        {/* ── SECTION 2: Address Information ── */}
        <SectionCard title="Address Information" icon={MapPin}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 20 }}>
            <Field label="Permanent Address *" icon={MapPin} error={errors.permanentAddress}>
              <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleChange}
                placeholder="Full address" rows={3}
                style={{ ...inputSx(!!errors.permanentAddress), resize: "vertical", height: "auto" }} />
            </Field>

            <Field label="Current Address" icon={MapPin}>
              <textarea name="address" value={formData.address} onChange={handleChange}
                placeholder="Current address (if different)" rows={3}
                style={{ ...inputSx(false), resize: "vertical", height: "auto" }} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 20, marginTop: 20 }}>
            <Field label="Country" icon={MapPin}>
              <input name="country" value={formData.country} onChange={handleChange}
                placeholder="Country" style={inputSx(false)} />
            </Field>
            <Field label="State">
              <input name="state" value={formData.state} onChange={handleChange}
                placeholder="State" style={inputSx(false)} />
            </Field>
            <Field label="City">
              <input name="city" value={formData.city} onChange={handleChange}
                placeholder="City" style={inputSx(false)} />
            </Field>
          </div>
        </SectionCard>

        {/* Support Staff Specific Fields */}
        {userType === "Support Staff" && renderSupportStaffFields()}

        {/* Accountant Specific Fields */}
        {userType === "Accountants" && renderAccountantFields()}

        {/* Job Information Section - Only for Employees */}
        {userType === "Employees" && (
          <>
            <SectionCard title="Job Information" icon={Briefcase}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 20 }}>
                <Field label="Designation *" icon={Briefcase} error={errors.position}>
                  <input name="position" value={formData.position} onChange={handleChange}
                    placeholder="e.g. Mechanic" style={inputSx(!!errors.position)} />
                </Field>

                <Field label="Department *" icon={Building2} error={errors.department}>
                  <select name="department" value={formData.department} onChange={handleChange} style={inputSx(!!errors.department)}>
                    <option value="">Select Dept</option>
                    <option value="Service">Service</option>
                    <option value="Repair">Repair</option>
                    <option value="Admin">Admin</option>
                  </select>
                </Field>

                <Field label="Employee Type *" icon={User} error={errors.employeeType}>
                  <select name="employeeType" value={formData.employeeType} onChange={handleChange} style={inputSx(!!errors.employeeType)}>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                  </select>
                </Field>

                <Field label="Date of Joining *" icon={Calendar} error={errors.dateOfJoining}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={formData.dateOfJoining}
                      onChange={(newValue) => setFormData({ ...formData, dateOfJoining: newValue })}
                      slotProps={{
                        textField: { fullWidth: true, size: "small", sx: { "& .MuiOutlinedInput-root": { borderRadius: "8px", background: "#F9FAFB" } } },
                      }}
                    />
                  </LocalizationProvider>
                </Field>

                <Field label="Reporting Manager" icon={User}>
                  <input name="reportingManager" value={formData.reportingManager} onChange={handleChange}
                    placeholder="Manager Name" style={inputSx(false)} />
                </Field>

                <Field label="Work Location" icon={MapPin}>
                  <input name="workLocation" value={formData.workLocation} onChange={handleChange}
                    placeholder="Branch" style={inputSx(false)} />
                </Field>
              </div>
            </SectionCard>

            <SectionCard title="Salary & Banking Details" icon={CreditCard}>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 20 }}>
                  <Field label="Monthly Salary *" icon={DollarSign} error={errors.monthlySalary}>
                    <input name="monthlySalary" type="number" value={formData.monthlySalary} onChange={handleChange}
                      placeholder="Amount" style={inputSx(!!errors.monthlySalary)} />
                  </Field>
                  <Field label="Bank Name *" icon={Building2} error={errors.bankName}>
                    <input name="bankName" value={formData.bankName} onChange={handleChange}
                      placeholder="Bank Name" style={inputSx(!!errors.bankName)} />
                  </Field>
                  <Field label="Account Holder *" icon={User} error={errors.accountHolderName}>
                    <input name="accountHolderName" value={formData.accountHolderName} onChange={handleChange}
                      placeholder="Name" style={inputSx(!!errors.accountHolderName)} />
                  </Field>
                  <Field label="Account Number *" icon={Hash} error={errors.accountNumber}>
                    <input name="accountNumber" value={formData.accountNumber} onChange={handleChange}
                      placeholder="Account No" style={inputSx(!!errors.accountNumber)} />
                  </Field>
                  <Field label="IFSC Code *" icon={Hash} error={errors.ifscCode}>
                    <input name="ifscCode" value={formData.ifscCode} onChange={handleChange}
                      placeholder="IFSC" style={inputSx(!!errors.ifscCode)} />
                  </Field>
                  <Field label="PAN Number *" icon={CreditCard} error={errors.panNumber}>
                    <input name="panNumber" value={formData.panNumber} onChange={handleChange}
                      placeholder="PAN" style={inputSx(!!errors.panNumber)} />
                  </Field>
                  <Field label="Employee Code *" icon={Hash} error={errors.employeeCode}>
                    <input name="employeeCode" value={formData.employeeCode} onChange={handleChange}
                      placeholder="E-Code" style={inputSx(!!errors.employeeCode)} />
                  </Field>
               </div>
            </SectionCard>
          </>
        )}

        {/* ── SECTION 4: Vehicle Information (Customers) ── */}
        {userType === "Customers" && (
          <SectionCard title="Vehicle Information" icon={Car}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
              <Button
                variant="outlined"
                startIcon={<Plus size={16} />}
                onClick={addVehicle}
                sx={{
                  color: "#0EA5E9", borderColor: "#0EA5E9", borderRadius: "10px",
                  "&:hover": { borderColor: "#7C3AED", backgroundColor: "#F5F3FF" },
                  textTransform: "none", fontWeight: 600
                }}
              >
                Add Another Vehicle
              </Button>
            </div>

            {vehicles.map((v, index) => (
              <div key={index} style={{
                padding: 20, borderRadius: 12, border: "1px solid #F3F4F6", background: "#FCFCFD", marginBottom: index < vehicles.length - 1 ? 20 : 0, position: "relative"
              }}>
                {vehicles.length > 1 && (
                  <button type="button" onClick={() => removeVehicle(index)}
                    style={{ position: "absolute", top: 12, right: 12, border: "none", background: "#FEF2F2", color: "#DC2626", padding: 6, borderRadius: 6, cursor: "pointer" }}>
                    <Trash2 size={16} />
                  </button>
                )}
                
                <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#0EA5E9", textTransform: "uppercase" }}>
                   Vehicle #{index + 1}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 16 }}>
                  <Field label="Registration No *" icon={Hash} error={errors[`vehicle_${index}_registrationNumber`]}>
                    <input name="registrationNumber" value={v.registrationNumber} onChange={(e) => handleVehicleChange(index, e)}
                      placeholder="e.g. TN01AB1234" style={inputSx(!!errors[`vehicle_${index}_registrationNumber`])} />
                  </Field>
                  <Field label="Make" icon={Car}>
                    <input name="make" value={v.make} onChange={(e) => handleVehicleChange(index, e)}
                      placeholder="e.g. Maruti Suzuki" style={inputSx(false)} />
                  </Field>
                  <Field label="Model" icon={Car}>
                    <input name="model" value={v.model} onChange={(e) => handleVehicleChange(index, e)}
                      placeholder="e.g. Swift" style={inputSx(false)} />
                  </Field>
                  <Field label="Year" icon={Calendar}>
                    <input name="yearOfManufacture" type="number" value={v.yearOfManufacture} onChange={(e) => handleVehicleChange(index, e)}
                      placeholder="YYYY" style={inputSx(false)} />
                  </Field>
                  <Field label="Color">
                    <input name="color" value={v.color} onChange={(e) => handleVehicleChange(index, e)}
                      placeholder="e.g. White" style={inputSx(false)} />
                  </Field>
                  <Field label="Fuel Type">
                    <select name="fuelType" value={v.fuelType} onChange={(e) => handleVehicleChange(index, e)} style={inputSx(false)}>
                      <option value="">Select</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="CNG">CNG</option>
                    </select>
                  </Field>
                </div>
              </div>
            ))}
          </SectionCard>
        )}

        {/* ── Single Save Button ── */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, mb: 10 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={<Save size={18} />}
            sx={{
              backgroundColor: "rgba(14, 165, 233, 0.9)",
              "&:hover": { backgroundColor: "rgba(14, 165, 233, 1)" },
              color: "#fff",
              borderRadius: "12px",
              px: 5,
              py: 1.5,
              fontWeight: 700,
              textTransform: "none",
              fontSize: 15,
              boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
            }}
          >
            {loading ? "Saving..." : isEdit ? `Update ${userType.slice(0, -1)}` : `Save ${userType.slice(0, -1)}`}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: "10px", fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddUser;
