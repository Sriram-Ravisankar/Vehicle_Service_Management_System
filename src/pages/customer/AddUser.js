import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Typography,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Stack,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  FormHelperText,
} from "@mui/material";
import { format } from "date-fns";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import DeleteIcon from "@mui/icons-material/Delete";
import Checkbox from "@mui/material/Checkbox";
import { CgArrowLeft } from "react-icons/cg";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import apiEndpoints from "../../apiconfig/index";
import DynamicHeader from "../../components/common/Dynamicheader";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isLaptop = useMediaQuery(theme.breakpoints.up("md"));
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
  // Responsive styles
  const labelStyle = {
    minWidth: isMobile ? "120px" : "150px",
    textAlign: "left",
    paddingRight: isMobile ? "8px" : "16px",
    fontWeight: 500,
    fontSize: isMobile ? "0.85rem" : "0.95rem",
  };

  const inputStyle = {
    flex: 1,
    "& .MuiInputBase-root": {
      height: isMobile ? "36px" : "40px",
      fontSize: isMobile ? "0.8rem" : "0.9rem",
    },
  };

  const sectionTitleStyle = {
    variant: isMobile ? "subtitle1" : "h6",
    fontWeight: "bold",
    sx: {
      textTransform: "uppercase",
      mb: 1,
      fontSize: isMobile ? "1rem" : "1.25rem",
    },
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

  const [notes, setNotes] = useState([
    {
      id: 1,
      text: "",
      file: null,
      filePath: "", // For displaying existing file in edit mode
      internalNotes: false,
      sharedWithCustomer: false,
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
              monthlySalary: userData.monthly_salary || "",
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

            // Handle notes data
            let notesData = [
              {
                id: 1,
                text: "",
                file: null,
                filePath: "",
                internalNotes: false,
                sharedWithCustomer: false,
              },
            ];

            if (userData.notes && Array.isArray(userData.notes)) {
              notesData = userData.notes.map((note, index) => ({
                id: index + 1,
                text: note.text || note.note_text || "",
                file: null,
                filePath: note.file_path || "",
                internalNotes:
                  note.internal_notes === 1 ||
                  note.internal_notes === "1" ||
                  note.is_internal === 1 ||
                  note.is_internal === "1",
                sharedWithCustomer:
                  note.shared_with_customer === 1 ||
                  note.shared_with_customer === "1" ||
                  note.is_shared_with_customer === 1 ||
                  note.is_shared_with_customer === "1",
              }));

            }

            console.log("Mapped Data:", mappedData);
            console.log("Vehicles Data:", vehiclesData);
            console.log("Notes Data:", notesData);

            setFormData(mappedData);
            setVehicles(vehiclesData);
            setNotes(notesData);
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

  const addNoteSection = () => {
    setNotes([
      ...notes,
      {
        id: Date.now(),
        text: "",
        file: null,
        filePath: "",
        internalNotes: false,
        sharedWithCustomer: false,
      },
    ]);
  };

  const deleteNoteSection = (id) => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  const handleNoteChange = (id, field, value) => {
    setNotes(
      notes.map((note) => (note.id === id ? { ...note, [field]: value } : note))
    );
  };

  const handleNoteFileChange = (id, e) => {
    const file = e.target.files[0];
    setNotes(notes.map((note) => (note.id === id ? { ...note, file } : note)));
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

      // Notes
      const processedNotes = notes.map((note) => ({
        text: note.text,
        file_path: note.filePath,
        internal_notes: note.internalNotes,
        shared_with_customer: note.sharedWithCustomer,
      }));
      formDataToSend.append("notes", JSON.stringify(processedNotes));

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
    <>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography {...sectionTitleStyle}>
          Support Staff Information
        </Typography>
        <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
      </Box>

      <Grid container spacing={isMobile ? 2 : 4}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
          }}
        >
          <Stack spacing={2}>
            <Box display="flex" flexDirection={isMobile ? "column" : "row"}>
              <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                Role/Designation*
              </Typography>
              <FormControl sx={{ ...inputStyle, width: "100%" }}>
                <InputLabel>Select Role</InputLabel>
                <Select
                  name="role"
                  label="Select Role"
                  value={formData.role}
                  onChange={handleChange}
                  error={Boolean(errors.role)}
                  helperText={errors.role}
                >
                  {supportStaffRoles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" flexDirection={isMobile ? "column" : "row"}>
              <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                Assigned Area*
              </Typography>
              <FormControl sx={{ ...inputStyle, width: "100%" }}>
                <InputLabel>Select Area</InputLabel>
                <Select
                  name="assignedArea"
                  label="Select Area"
                  value={formData.assignedArea}
                  onChange={handleChange}
                  error={Boolean(errors.assignedArea)}
                  helperText={errors.assignedArea}
                >
                  {assignedAreas.map((area) => (
                    <MenuItem key={area.id} value={area.id}>
                      {area.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
          }}
        >
          <Stack spacing={2}>
            <Box display="flex" flexDirection={isMobile ? "column" : "row"}>
              <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                Shift Timing*
              </Typography>
              <FormControl sx={{ ...inputStyle, width: "100%" }}>
                <InputLabel>Select Shift</InputLabel>
                <Select
                  name="shiftTiming"
                  label="Select Shift"
                  value={formData.shiftTiming}
                  onChange={handleChange}
                  error={Boolean(errors.shiftTiming)}
                  helperText={errors.shiftTiming}
                >
                  {shiftTimings.map((shift) => (
                    <MenuItem key={shift.id} value={shift.id}>
                      {shift.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" flexDirection={isMobile ? "column" : "row"}>
              <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                Emergency Contact*
              </Typography>
              <TextField
                fullWidth
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleChange}
                placeholder="Enter Emergency Contact"
                error={Boolean(errors.emergencyContact)}
                helperText={errors.emergencyContact}
                sx={{ ...inputStyle, width: "100%" }}
              />
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography {...sectionTitleStyle}>Joining Information</Typography>
        <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
      </Box>

      <Grid container spacing={isMobile ? 2 : 4}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
          }}
        >
          <Box display="flex" flexDirection={isMobile ? "column" : "row"}>
            <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
              Date of Joining*
            </Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={formData.dateOfJoining}
                onChange={(newValue) =>
                  setFormData({ ...formData, dateOfJoining: newValue })
                }
                slotProps={{
                  textField: {
                    sx: { ...inputStyle, width: "100%" },
                    error: Boolean(errors.dateOfJoining),
                    helperText: errors.dateOfJoining,
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
          }}
        >
          <Box display="flex" flexDirection={isMobile ? "column" : "row"}>
            <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
              Status*
            </Typography>
            <FormControl
              sx={{ ...inputStyle, width: "100%" }}
              error={Boolean(errors.status)}
            >
              <InputLabel>Select Status</InputLabel>
              <Select
                name="status"
                label="Select Status"
                value={formData.status}
                onChange={handleChange}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
              {errors.status && (
                <FormHelperText>{errors.status}</FormHelperText>
              )}
            </FormControl>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  // Render Accountant specific fields
  const renderAccountantFields = () => (
    <>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography {...sectionTitleStyle}>Accountant Information</Typography>
        <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
      </Box>

      <Grid container spacing={isMobile ? 2 : 4}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
          }}
        >
          <Stack spacing={2}>
            <Box display="flex" flexDirection={isMobile ? "column" : "row"}>
              <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                Specialization
              </Typography>
              <TextField
                fullWidth
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="Enter Specialization"
                error={Boolean(errors.specialization)}
                helperText={errors.specialization}
                sx={{ ...inputStyle, width: "100%" }}
              />
            </Box>
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
          }}
        >
          <Stack spacing={2}>
            <Box display="flex" flexDirection={isMobile ? "column" : "row"}>
              <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                Qualifications
              </Typography>
              <TextField
                fullWidth
                name="qualifications"
                value={formData.qualifications}
                onChange={handleChange}
                placeholder="Enter Qualifications"
                error={Boolean(errors.qualifications)}
                helperText={errors.qualifications}
                sx={{ ...inputStyle, width: "100%" }}
              />
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </>
  );

  return (
    <Box sx={{ p: isMobile ? 2 : 4 }}>
      {/* Header */}
      <DynamicHeader />

      <form onSubmit={handleSubmit}>
        {/* Personal Info Title */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography {...sectionTitleStyle}>Personal Information</Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
        </Box>

        {/* Personal Info Fields */}
        <Grid container spacing={isMobile ? 2 : 4}>
          {/* LEFT COLUMN */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
            }}
          >
            <Stack spacing={2}>
              {[
                {
                  label: "First Name*",
                  name: "firstName",
                  placeholder: "Enter First Name",
                },
                { label: "Email*", name: "email", placeholder: "Enter Email" },
                {
                  label: "Mobile Number*",
                  name: "mobile",
                  placeholder: "Enter Mobile Number",
                },
                {
                  label: "Alternate Contact",
                  name: "alternateMobile",
                  placeholder: "Enter Alternate Number",
                },
              ].map((field, idx) => (
                <React.Fragment key={idx}>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      {field.label}
                    </Typography>
                    <TextField
                      fullWidth
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      error={Boolean(errors[field.name])}
                      helperText={errors[field.name]}
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>

                  {idx === 0 && (
                    <Box
                      display="flex"
                      flexDirection={isMobile ? "column" : "row"}
                    >
                      <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                        Gender
                      </Typography>
                      <RadioGroup
                        row
                        name="gender"
                        value={formData.gender}
                        onChange={(e) =>
                          setFormData({ ...formData, gender: e.target.value })
                        }
                        sx={{ mt: isMobile ? 1 : 0 }}
                      >
                        <FormControlLabel
                          value="male"
                          control={
                            <Radio
                              size="small"
                              sx={{
                                color: "rgba(249, 115, 22, 0.9)",
                                "&.Mui-checked": {
                                  color: "rgba(249, 115, 22, 0.9)",
                                },
                              }}
                            />
                          }
                          label="Male"
                        />

                        <FormControlLabel
                          value="female"
                          control={
                            <Radio
                              size="small"
                              sx={{
                                color: "rgba(249, 115, 22, 0.9)",
                                "&.Mui-checked": {
                                  color: "rgba(249, 115, 22, 0.9)",
                                },
                              }}
                            />
                          }
                          label="Female"
                        />
                      </RadioGroup>

                    </Box>
                  )}
                </React.Fragment>
              ))}

              {/* Image Upload */}
              <Box display="flex" flexDirection={isMobile ? "column" : "row"}>
                <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                  Image
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  sx={{
                    height: "40px",
                    textTransform: "none",
                    width: isMobile ? "100%" : "auto",

                    color: "rgba(249, 115, 22, 0.9)",        // text & icon
                    borderColor: "rgba(249, 115, 22, 0.9)", // border

                    "&:hover": {
                      borderColor: "rgba(249, 115, 22, 1)",
                      backgroundColor: "rgba(249, 115, 22, 0.08)",
                      color: "rgba(249, 115, 22, 1)",
                    },
                  }}
                >
                  Choose File
                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    hidden
                  />
                </Button>

                {formData.imagePreview && (
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "8px",
                      marginLeft: "20px",
                      objectFit: "cover",
                      border: "1px solid #ccc",
                    }}
                  />
                )}

                {/* For edit mode (existing image from server) */}
                {!formData.imagePreview && formData.imagePath && (
                  <img
                    src={apiEndpoints.ImageURL + formData.imagePath}
                    alt="User"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "8px",
                      marginLeft: "20px",
                      objectFit: "cover",
                      border: "1px solid #ccc",
                    }}
                  />
                )}

                {formData.imagePath && (
                  <Typography
                    sx={{
                      ml: isMobile ? 0 : 2,
                      mt: isMobile ? 1 : 0,
                      fontSize: "0.8rem",
                    }}
                  >
                    Current: {formData.imagePath.split("/").pop()}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
            }}
          >
            <Stack spacing={2}>
              {[
                {
                  label: "Last Name*",
                  name: "lastName",
                  placeholder: "Enter Last Name",
                },
                {
                  label: "Company Name",
                  name: "companyName",
                  placeholder: "Enter Company Name",
                },
                { label: "Tax Id", name: "taxId", placeholder: "Enter Tax Id" },
              ].map((field, idx) => (
                <Box
                  key={idx}
                  display="flex"
                  flexDirection={isMobile ? "column" : "row"}
                >
                  <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                    {field.label}
                  </Typography>
                  <TextField
                    fullWidth
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    error={Boolean(errors[field.name])}
                    helperText={errors[field.name]}
                    sx={{ ...inputStyle, width: "100%" }}
                  />
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* Address Section */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Typography {...sectionTitleStyle}>Address Information</Typography>
          <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
        </Box>

        <Grid container spacing={isMobile ? 2 : 4}>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
            }}
          >
            <Stack spacing={2}>
              <Box display="flex" flexDirection={isMobile ? "column" : "row"}>
                <Typography
                  sx={{
                    ...labelStyle,
                    paddingTop: "10px",
                    mb: isMobile ? 1 : 0,
                  }}
                >
                  Permanent Address*
                </Typography>
                <TextField
                  fullWidth
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  multiline
                  minRows={3}
                  placeholder="Enter Permanent Address"
                  error={Boolean(errors.permanentAddress)}
                  helperText={errors.permanentAddress}
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      fontSize: "0.9rem",
                    },
                  }}
                />
              </Box>
              <Box display="flex" flexDirection={isMobile ? "column" : "row"}>
                <Typography
                  sx={{
                    ...labelStyle,
                    paddingTop: "10px",
                    mb: isMobile ? 1 : 0,
                  }}
                >
                  Current Address
                </Typography>
                <TextField
                  fullWidth
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  minRows={3}
                  placeholder="Enter Current Address (if different)"
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      fontSize: "0.9rem",
                    },
                  }}
                />
              </Box>
            </Stack>
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              width: { xs: "100%", sm: "90%", md: "80%", lg: "47%", xl: "48%" },
            }}
          >
            <Stack spacing={2}>
              {[
                {
                  label: "Country",
                  name: "country",
                  placeholder: "Enter Country",
                },
                { label: "State", name: "state", placeholder: "Enter State" },
                { label: "City", name: "city", placeholder: "Enter City" },
              ].map((field, idx) => (
                <Box
                  key={idx}
                  display="flex"
                  flexDirection={isMobile ? "column" : "row"}
                >
                  <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                    {field.label}
                  </Typography>
                  <TextField
                    fullWidth
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    sx={{ ...inputStyle, width: "100%" }}
                  />
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* Support Staff Specific Fields */}
        {userType === "Support Staff" && renderSupportStaffFields()}

        {/* Accountant Specific Fields */}
        {userType === "Accountants" && renderAccountantFields()}

        {/* Job Information Section - Only for Employees */}
        {userType === "Employees" && (
          <>
            <Box sx={{ mt: 4, mb: 2 }}>
              <Typography {...sectionTitleStyle}>Job Information</Typography>
              <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
            </Box>

            <Grid container spacing={isMobile ? 2 : 4}>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "90%",
                    md: "80%",
                    lg: "47%",
                    xl: "48%",
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Designation*
                    </Typography>
                    <TextField
                      fullWidth
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      placeholder="Mechanic, Supervisor, etc."
                      error={Boolean(errors.position)}
                      helperText={errors.position}
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Department*
                    </Typography>
                    <FormControl
                      sx={{ ...inputStyle, width: "100%" }}
                      error={Boolean(errors.department)}
                    >
                      <InputLabel>Select Department</InputLabel>
                      <Select
                        name="department"
                        label="Select Department"
                        value={formData.department}
                        onChange={handleChange}
                      >
                        <MenuItem value="Service">Service</MenuItem>
                        <MenuItem value="Repair">Repair</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="Support">Support</MenuItem>
                        <MenuItem value="Management">Management</MenuItem>
                      </Select>
                      {errors.department && (
                        <FormHelperText>{errors.department}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Employee Type*
                    </Typography>
                    <FormControl
                      sx={{ ...inputStyle, width: "100%" }}
                      error={Boolean(errors.employeeType)}
                    >
                      <InputLabel>Select Type</InputLabel>
                      <Select
                        name="employeeType"
                        label="Select Type"
                        value={formData.employeeType}
                        onChange={handleChange}
                      >
                        <MenuItem value="Full-Time">Full-Time</MenuItem>
                        <MenuItem value="Part-Time">Part-Time</MenuItem>
                        <MenuItem value="Contract">Contract</MenuItem>
                        <MenuItem value="Trainee">Trainee</MenuItem>
                      </Select>
                      {errors.employeeType && (
                        <FormHelperText>{errors.employeeType}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Shift Timing
                    </Typography>
                    <TextField
                      fullWidth
                      name="shiftTiming"
                      value={formData.shiftTiming}
                      onChange={handleChange}
                      placeholder="e.g. 9:00 AM - 6:00 PM"
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                </Stack>
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "90%",
                    md: "80%",
                    lg: "47%",
                    xl: "48%",
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Date of Joining*
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        value={formData.dateOfJoining}
                        onChange={(newValue) =>
                          setFormData({ ...formData, dateOfJoining: newValue })
                        }
                        slotProps={{
                          textField: {
                            sx: { ...inputStyle, width: "100%" },
                            error: Boolean(errors.dateOfJoining),
                            helperText: errors.dateOfJoining,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </Box>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Reporting Manager
                    </Typography>
                    <TextField
                      fullWidth
                      name="reportingManager"
                      value={formData.reportingManager}
                      onChange={handleChange}
                      placeholder="Manager's Name"
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Work Location
                    </Typography>
                    <TextField
                      fullWidth
                      name="workLocation"
                      value={formData.workLocation}
                      onChange={handleChange}
                      placeholder="Branch or Location"
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Status*
                    </Typography>
                    <FormControl
                      sx={{ ...inputStyle, width: "100%" }}
                      error={Boolean(errors.status)}
                    >
                      <InputLabel>Select Status</InputLabel>
                      <Select
                        name="status"
                        label="Select Status"
                        value={formData.status}
                        onChange={handleChange}
                        helperText={errors.status}
                      >
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                        <MenuItem value="On Leave">On Leave</MenuItem>
                      </Select>
                      {errors.status && (
                        <FormHelperText>{errors.status}</FormHelperText>
                      )}
                    </FormControl>
                  </Box>
                </Stack>
              </Grid>
            </Grid>

            {/* Salary & Banking Section */}
            <Box sx={{ mt: 4, mb: 2 }}>
              <Typography {...sectionTitleStyle}>
                Salary & Banking Details
              </Typography>
              <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
            </Box>

            <Grid container spacing={isMobile ? 2 : 4}>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "90%",
                    md: "80%",
                    lg: "47%",
                    xl: "48%",
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Monthly Salary*
                    </Typography>
                    <TextField
                      fullWidth
                      name="monthlySalary"
                      value={formData.monthlySalary}
                      onChange={handleChange}
                      placeholder="Enter Salary Amount"
                      type="number"
                      error={Boolean(errors.monthlySalary)}
                      helperText={errors.monthlySalary}
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Bank Name*
                    </Typography>
                    <TextField
                      fullWidth
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="Enter Bank Name"
                      error={Boolean(errors.bankName)}
                      helperText={errors.bankName}
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Account Holder*
                    </Typography>
                    <TextField
                      fullWidth
                      name="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={handleChange}
                      placeholder="Account Holder Name"
                      error={Boolean(errors.accountHolderName)}
                      helperText={errors.accountHolderName}
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Account Number*
                    </Typography>
                    <TextField
                      fullWidth
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="Enter Account Number"
                      error={Boolean(errors.accountNumber)}
                      helperText={errors.accountNumber}
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                </Stack>
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "90%",
                    md: "80%",
                    lg: "47%",
                    xl: "48%",
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      IFSC Code*
                    </Typography>
                    <TextField
                      fullWidth
                      name="ifscCode"
                      value={formData.ifscCode}
                      onChange={handleChange}
                      placeholder="Enter IFSC Code"
                      error={Boolean(errors.ifscCode)}
                      helperText={errors.ifscCode}
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      PAN Number*
                    </Typography>
                    <TextField
                      fullWidth
                      name="panNumber"
                      value={formData.panNumber}
                      onChange={handleChange}
                      placeholder="Enter PAN Number"
                      error={Boolean(errors.panNumber)}
                      helperText={errors.panNumber}
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Aadhaar Number
                    </Typography>
                    <TextField
                      fullWidth
                      name="aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={handleChange}
                      placeholder="Enter Aadhaar Number"
                      sx={{ ...inputStyle, width: "100%" }}
                      helperText={errors.aadhaarNumber}
                    />
                  </Box>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Employee Code*
                    </Typography>
                    <TextField
                      fullWidth
                      name="employeeCode"
                      value={formData.employeeCode}
                      onChange={handleChange}
                      placeholder="Employee ID/Access Code"
                      error={Boolean(errors.employeeCode)}
                      helperText={errors.employeeCode}
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                </Stack>
              </Grid>
            </Grid>

            {/* Performance Tracking Section */}
            <Box sx={{ mt: 4, mb: 2 }}>
              <Typography {...sectionTitleStyle}>
                Performance Tracking
              </Typography>
              <Box sx={{ borderBottom: "1px solid #ccc", width: "100%" }} />
            </Box>

            <Grid container spacing={isMobile ? 2 : 4}>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "90%",
                    md: "80%",
                    lg: "47%",
                    xl: "48%",
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Total Jobs Assigned
                    </Typography>
                    <TextField
                      fullWidth
                      name="totalJobsAssigned"
                      value={formData.totalJobsAssigned}
                      onChange={handleChange}
                      type="number"
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Jobs Completed
                    </Typography>
                    <TextField
                      fullWidth
                      name="jobsCompleted"
                      value={formData.jobsCompleted}
                      onChange={handleChange}
                      type="number"
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                </Stack>
              </Grid>
              <Grid
                item
                xs={12}
                md={6}
                sx={{
                  width: {
                    xs: "100%",
                    sm: "90%",
                    md: "80%",
                    lg: "47%",
                    xl: "48%",
                  },
                }}
              >
                <Stack spacing={2}>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Customer Rating
                    </Typography>
                    <TextField
                      fullWidth
                      name="customerRating"
                      value={formData.customerRating}
                      onChange={handleChange}
                      type="number"
                      inputProps={{ min: 0, max: 5, step: 0.1 }}
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                  <Box
                    display="flex"
                    flexDirection={isMobile ? "column" : "row"}
                  >
                    <Typography sx={{ ...labelStyle, mb: isMobile ? 1 : 0 }}>
                      Leave Balance
                    </Typography>
                    <TextField
                      fullWidth
                      name="leaveBalance"
                      value={formData.leaveBalance}
                      onChange={handleChange}
                      type="number"
                      sx={{ ...inputStyle, width: "100%" }}
                    />
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </>
        )}

        {/* Vehicle Information Section - Only for Customers */}
        {userType === "Customers" && (
          <>
            <Box sx={{ mt: 4, mb: 2 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                flexDirection={isMobile ? "column" : "row"}
                gap={isMobile ? 2 : 0}
              >
                <Typography {...sectionTitleStyle}>
                  Vehicle Information
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addVehicle}
                  sx={{
                    bgcolor: "rgba(249, 115, 22, 0.9)",
                    "&:hover": { bgcolor: "rgba(249, 115, 22, 0.9)" },
                    textTransform: "none",
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  Add Vehicle
                </Button>
              </Box>
              <Box
                sx={{ borderBottom: "1px solid #ccc", width: "100%", mb: 2 }}
              />
            </Box>

            {vehicles.map((vehicle, index) => (
              <Paper
                key={index}
                sx={{ p: isMobile ? 2 : 3, mb: 3, border: "1px solid #eee" }}
              >
                <Box display="flex" justifyContent="flex-end">
                  {vehicles.length > 1 && (
                    <IconButton
                      onClick={() => removeVehicle(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "45%",
                        md: "47%",
                        lg: "32%",
                        xl: "30%",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Vehicle Registration Number*"
                      name="registrationNumber"
                      value={vehicle.registrationNumber}
                      onChange={(e) => handleVehicleChange(index, e)}
                      error={Boolean(
                        errors[`vehicle_${index}_registrationNumber`]
                      )}
                      helperText={errors[`vehicle_${index}_registrationNumber`]}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "45%",
                        md: "47%",
                        lg: "32%",
                        xl: "30%",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Chassis Number"
                      name="chassisNumber"
                      value={vehicle.chassisNumber}
                      onChange={(e) => handleVehicleChange(index, e)}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "45%",
                        md: "47%",
                        lg: "32%",
                        xl: "30%",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Engine Number"
                      name="engineNumber"
                      value={vehicle.engineNumber}
                      onChange={(e) => handleVehicleChange(index, e)}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "45%",
                        md: "47%",
                        lg: "32%",
                        xl: "30%",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Make / Manufacturer"
                      name="make"
                      value={vehicle.make}
                      onChange={(e) => handleVehicleChange(index, e)}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "45%",
                        md: "47%",
                        lg: "32%",
                        xl: "30%",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Model"
                      name="model"
                      value={vehicle.model}
                      onChange={(e) => handleVehicleChange(index, e)}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "45%",
                        md: "47%",
                        lg: "32%",
                        xl: "30%",
                      },
                    }}
                  >
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Fuel Type</InputLabel>
                      <Select
                        name="fuelType"
                        value={vehicle.fuelType}
                        label="Fuel Type"
                        onChange={(e) => handleVehicleChange(index, e)}
                      >
                        <MenuItem value="Petrol">Petrol</MenuItem>
                        <MenuItem value="Diesel">Diesel</MenuItem>
                        <MenuItem value="CNG">CNG</MenuItem>
                        <MenuItem value="Electric">Electric</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "45%",
                        md: "47%",
                        lg: "32%",
                        xl: "30%",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Odometer Reading (km)"
                      name="odometerReading"
                      type="number"
                      value={vehicle.odometerReading}
                      onChange={(e) => handleVehicleChange(index, e)}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "45%",
                        md: "47%",
                        lg: "32%",
                        xl: "30%",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Year of Manufacture"
                      name="yearOfManufacture"
                      type="number"
                      value={vehicle.yearOfManufacture}
                      onChange={(e) => handleVehicleChange(index, e)}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "45%",
                        md: "47%",
                        lg: "32%",
                        xl: "30%",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Vehicle Color"
                      name="color"
                      value={vehicle.color}
                      onChange={(e) => handleVehicleChange(index, e)}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "45%",
                        md: "47%",
                        lg: "32%",
                        xl: "30%",
                      },
                    }}
                  >
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Transmission Type</InputLabel>
                      <Select
                        name="transmissionType"
                        label="Transmission Type"
                        value={vehicle.transmissionType}
                        onChange={(e) => handleVehicleChange(index, e)}
                      >
                        <MenuItem value="Manual">Manual</MenuItem>
                        <MenuItem value="Automatic">Automatic</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "45%",
                        md: "47%",
                        lg: "32%",
                        xl: "30%",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Insurance Validity"
                      name="insuranceValidity"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={vehicle.insuranceValidity}
                      onChange={(e) => handleVehicleChange(index, e)}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    sx={{
                      width: {
                        xs: "100%",
                        sm: "45%",
                        md: "47%",
                        lg: "32%",
                        xl: "30%",
                      },
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Pollution Cert Validity"
                      name="pollutionCertValidity"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      value={vehicle.pollutionCertValidity}
                      onChange={(e) => handleVehicleChange(index, e)}
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </>
        )}

        {/* Add Notes Section */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            flexDirection={isMobile ? "column" : "row"}
            gap={isMobile ? 2 : 0}
          >
            <Typography {...sectionTitleStyle}>Add Notes</Typography>
            {/* <IconButton
              onClick={addNoteSection}
              sx={{
                color: "rgba(249, 115, 22, 0.9)",
                "&:hover": {
                  backgroundColor: "rgba(249, 115, 22, 0.9)",
                },
              }}
            >
              <AddIcon />
            </IconButton> */}
          </Box>
        </Box>
        <Box sx={{ borderBottom: "1px solid #ccc", width: "100%", mb: 2 }} />

        {/* Notes Content */}
        {notes.map((note) => (
          <Grid container spacing={2} key={note.id} sx={{ mb: 3 }}>
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                width: {
                  xs: "100%",
                  sm: "45%",
                  md: "47%",
                  lg: "35%",
                  xl: "30%",
                },
              }}
            >
              <Box display="flex" flexDirection={isMobile ? "column" : "row"}>
                <Typography
                  sx={{
                    ...labelStyle,
                    paddingTop: "10px",
                    mb: isMobile ? 1 : 0,
                  }}
                >
                  Notes
                </Typography>
                <TextField
                  multiline
                  minRows={3}
                  placeholder="Enter note"
                  fullWidth
                  value={note.text}
                  onChange={(e) =>
                    handleNoteChange(note.id, "text", e.target.value)
                  }
                  sx={{
                    width: "100%",
                    "& .MuiInputBase-root": {
                      fontSize: "0.9rem",
                    },
                  }}
                />
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
              sx={{
                width: {
                  xs: "100%",
                  sm: "45%",
                  md: "47%",
                  lg: "35%",
                  xl: "30%",
                },
              }}
            >
              <Box display="flex" height="100%" pt={isMobile ? 1 : 3}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  sx={{
                    height: "40px",
                    textTransform: "none",
                    width: isMobile ? "100%" : "auto",

                    color: "rgba(249, 115, 22, 0.9)",        // text & icon
                    borderColor: "rgba(249, 115, 22, 0.9)", // border

                    "&:hover": {
                      borderColor: "rgba(249, 115, 22, 1)",
                      backgroundColor: "rgba(249, 115, 22, 0.08)",
                      color: "rgba(249, 115, 22, 1)",
                    },
                  }}
                >
                  Choose File
                  <input
                    type="file"
                    name="image"
                    onChange={handleChange}
                    hidden
                  />
                </Button>

                {note.filePath && (
                  <Typography
                    sx={{
                      ml: isMobile ? 0 : 2,
                      mt: isMobile ? 1 : 0,
                      fontSize: "0.8rem",
                    }}
                  >
                    Current: {note.filePath.split("/").pop()}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
              sx={{
                width: {
                  xs: "100%",
                  sm: "45%",
                  md: "47%",
                  lg: "35%",
                  xl: "30%",
                },
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                width="100%"
                pt={isMobile ? 2 : 1}
                flexDirection={isMobile ? "column" : "row"}
                gap={isMobile ? 2 : 0}
              >
                <Box display="flex" flexDirection="column">
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={note.internalNotes}
                        onChange={(e) =>
                          handleNoteChange(
                            note.id,
                            "internalNotes",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Internal Notes"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={note.sharedWithCustomer}
                        onChange={(e) =>
                          handleNoteChange(
                            note.id,
                            "sharedWithCustomer",
                            e.target.checked
                          )
                        }
                      />
                    }
                    label="Shared with customer"
                  />
                </Box>
                <IconButton
                  color="error"
                  sx={{ alignSelf: isMobile ? "flex-end" : "center" }}
                  onClick={() => deleteNoteSection(note.id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        ))}

        {/* Submit Button */}
        <Box mt={4}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: "rgba(249, 115, 22, 0.9)",
              "&:hover": { backgroundColor: "rgba(249, 115, 22, 0.9)" },
              color: "white",
              height: "45px",
              fontWeight: "bold",
            }}
          >
            SUBMIT
          </Button>
        </Box>
      </form>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddUser;
