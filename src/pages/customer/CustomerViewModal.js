import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Stack,
    Rating
} from "@mui/material";
import { 
    User, Mail, Phone, Car, MapPin, Calendar, X, Hash, 
    Briefcase, BadgeCheck, GraduationCap, Building2, 
    Landmark, DollarSign, Clock, Users, Star, ClipboardList,
    ShieldAlert
} from "lucide-react";

/**
 * Modern User View Modal following the UI/UX style of products/invoices
 * Handles Customers, Employees, Support Staff, and Accountants
 */
const UserViewModal = ({ open, onClose, user, type }) => {
    if (!user) return null;

    // Detect user type based on explicit type or fallback to field detection
    let isEmployee = type === "Employees";
    let isSupport = type === "Support Staff";
    let isAccountant = type === "Accountants";
    let isCustomer = type === "Customers";

    if (!type) {
        isEmployee = !!user.position || !!user.employee_code;
        isSupport = !!user.role && !user.position;
        isAccountant = !!user.qualifications || !!user.specialization;
        isCustomer = !isEmployee && !isSupport && !isAccountant;
    }

    const infoItemStyle = {
        background: "#F8FAFC",
        padding: "16px",
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        display: "flex",
        flexDirection: "column",
        gap: 0.5
    };

    const getProfileLabel = () => {
        if (isEmployee) return "Employee Profile";
        if (isSupport) return "Support Staff Profile";
        if (isAccountant) return "Accountant Profile";
        return "Customer Profile";
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{ 
                sx: { 
                    borderRadius: "24px", 
                    overflow: "hidden", 
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" 
                } 
            }}
            slotProps={{
                backdrop: {
                    sx: {
                        background: "rgba(15, 23, 42, 0.4)",
                        backdropFilter: "blur(8px)",
                    }
                }
            }}
        >
            {/* ── HEADER ── */}
            <DialogTitle sx={{ p: 0 }}>
                <Box sx={{
                    background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                    px: 3, py: 3,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ 
                            width: 56, height: 56, borderRadius: "18px", 
                            background: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            border: "1px solid rgba(255,255,255,0.2)",
                            overflow: "hidden"
                        }}>
                             {user.image && !user.image.includes('undefined') ? (
                                <img src={user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                             ) : (
                                <User size={28} color="#fff" />
                             )}
                        </Box>
                        <Box>
                            <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 20, lineHeight: 1.2 }}>
                                {user.firstName} {user.lastName}
                            </Typography>
                            <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500, mt: 0.5 }}>
                                {getProfileLabel()}
                            </Typography>
                        </Box>
                    </Box>
                    <button onClick={onClose}
                        style={{ 
                            background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "12px",
                            width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: "#fff", transition: "all 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                    >
                        <X size={20} />
                    </button>
                </Box>
            </DialogTitle>

            <DialogContent 
                sx={{ 
                    p: 3, pt: 4,
                    "&::-webkit-scrollbar": { display: "none" },
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                }}
            >
                <Stack spacing={3}>
                    {/* Basic Contact Info */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                        <Box sx={infoItemStyle}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Mail size={16} color="#3B82F6" />
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Email Address</Typography>
                            </Box>
                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1E293B", wordBreak: "break-all" }}>
                                {user.email || "No email provided"}
                            </Typography>
                        </Box>
                        <Box sx={infoItemStyle}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Phone size={16} color="#10B981" />
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Mobile Number</Typography>
                            </Box>
                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>
                                {user.mobile || "No mobile provided"}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Conditional Section: Vehicle Info for Customers */}
                    {isCustomer && (
                        <Box sx={{ 
                            background: "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)", 
                            p: 2.5, borderRadius: "24px", 
                            border: "1px solid #DDD6FE",
                            display: "flex", flexDirection: "column", gap: 3
                        }}>
                             <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Box sx={{ 
                                    width: 48, height: 48, borderRadius: "16px", background: "#8B5CF6",
                                    display: "flex", alignItems: "center", justifyContent: "center", 
                                    flexShrink: 0, boxShadow: "0 8px 15px -3px rgba(139, 92, 246, 0.3)"
                                }}>
                                    <Car size={24} color="#fff" />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        Registered Vehicles
                                    </Typography>
                                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#6D28D9" }}>
                                        {user.vehicles?.length || 1} Vehicle(s) on file
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                {(user.vehicles?.length > 0 ? user.vehicles : [user]).map((v, idx) => {
                                    const fuelType = v.fuel_type || v.vehicle_fuel_type || v.fuel_Type || "N/A";
                                    const color = v.color || v.vehicle_color || "Standard";
                                    const year = v.year || v.vehicle_year || v.year_of_manufacture || "";
                                    const regNo = v.registration_number || v.registrationNumber || v.vehicle_number || v.extraValue || "N/A";

                                    return (
                                        <Box key={idx} sx={{ 
                                            pb: idx < (user.vehicles?.length || 1) - 1 ? 2 : 0,
                                            borderBottom: idx < (user.vehicles?.length || 1) - 1 ? "1px dashed #DDD6FE" : "none"
                                        }}>
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                                                <Typography sx={{ fontSize: 16, fontWeight: 800, color: "#4C1D95" }}>
                                                    {regNo}
                                                </Typography>
                                                <Box sx={{ background: "#8B5CF6", color: "#fff", px: 1, py: 0.2, borderRadius: "6px", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>
                                                    {fuelType}
                                                </Box>
                                            </Box>
                                            
                                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                                <Box>
                                                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Brand / Model</Typography>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#5B21B6" }}>
                                                        {v.make || v.vehicle_make || "-"} {v.model || v.vehicle_model || "-"}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Color & Year</Typography>
                                                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#5B21B6" }}>
                                                        {color} {year ? `• ${year}` : ""}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    )}

                    {/* Conditional Section: Work Info for Employees/Staff */}
                    {(isEmployee || isSupport || isAccountant) && (
                        <Box sx={{ 
                            background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)", 
                            p: 2.5, borderRadius: "24px", 
                            border: "1px solid #BFDBFE",
                            display: "flex", flexDirection: "column", gap: 2
                        }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Box sx={{ 
                                    width: 48, height: 48, borderRadius: "16px", background: "#3B82F6",
                                    display: "flex", alignItems: "center", justifyContent: "center", 
                                    flexShrink: 0, boxShadow: "0 8px 15px -3px rgba(59, 130, 246, 0.3)"
                                }}>
                                    <Briefcase size={24} color="#fff" />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                        Professional Roles & Details
                                    </Typography>
                                    <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#1E40AF", lineHeight: 1.2 }}>
                                        {user.position || user.role || user.specialization || "Staff Member"}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3, pl: 0.5 }}>
                                {(user.department || user.assigned_area) && (
                                    <Box>
                                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>{user.department ? "Department" : "Assigned Area"}</Typography>
                                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1E40AF" }}>{user.department || user.assigned_area}</Typography>
                                    </Box>
                                )}
                                {(user.employee_code || user.employee_type) && (
                                    <Box>
                                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>{user.employee_code ? "Employee ID" : "Employment Type"}</Typography>
                                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1E40AF" }}>{user.employee_code || user.employee_type}</Typography>
                                    </Box>
                                )}
                                {(user.reporting_manager || user.shift_timing || user.work_location) && (
                                    <>
                                        <Box>
                                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Work Location</Typography>
                                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1E40AF" }}>{user.work_location || user.workLocation || "Main Office"}</Typography>
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Shift Timing</Typography>
                                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1E40AF" }}>{user.shift_timing || "Standard"}</Typography>
                                        </Box>
                                        {user.reporting_manager && (
                                            <Box>
                                                <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Reports To</Typography>
                                                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1E40AF" }}>{user.reporting_manager}</Typography>
                                            </Box>
                                        )}
                                    </>
                                )}
                                {(user.qualifications || user.emergency_contact) && (
                                    <Box sx={{ gridColumn: "span 2" }}>
                                        <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>{user.qualifications ? "Qualifications" : "Emergency Contact"}</Typography>
                                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1E40AF" }}>{user.qualifications || user.emergency_contact}</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    )}

                    {/* Salary Section for Employees */}
                    {isEmployee && (
                        <Box sx={{ 
                            background: "linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)", 
                            p: 2.5, borderRadius: "24px", 
                            border: "1px solid #BBF7D0",
                            display: "flex", alignItems: "center", gap: 2
                        }}>
                             <Box sx={{ 
                                width: 48, height: 48, borderRadius: "16px", background: "#16A34A",
                                display: "flex", alignItems: "center", justifyContent: "center", 
                                flexShrink: 0, boxShadow: "0 8px 15px -3px rgba(22, 163, 74, 0.3)"
                            }}>
                                <DollarSign size={24} color="#fff" />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#15803D", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                    Monthly Salary
                                </Typography>
                                <Typography sx={{ fontSize: 22, fontWeight: 900, color: "#14532D", lineHeight: 1.2 }}>
                                    ₹{(() => {
                                        const salary = user.monthlySalary ?? user.monthly_salary ?? user.salary ?? 0;
                                        return Number(salary).toLocaleString();
                                    })()}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    {/* Meta Info */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                         <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Hash size={14} color="#64748B" />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Record GUID</Typography>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>{user.user_guid?.slice(0, 12)}...</Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{ width: 32, height: 32, borderRadius: "8px", background: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Calendar size={14} color="#64748B" />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>{isCustomer ? "Created Date" : "Joined Date"}</Typography>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
                                    {(() => {
                                        const dateVal = user.createdOn || user.date_of_joining || user.created_on || user.created_at || user.reg_date;
                                        if (!dateVal) return "Internal Record";
                                        try {
                                            const d = new Date(dateVal);
                                            if (isNaN(d.getTime())) return dateVal;
                                            return d.toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                            });
                                        } catch (e) {
                                            return dateVal;
                                        }
                                    })()}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Financial/Banking Info for Staff */}
                    {(isEmployee || isAccountant) && (user.bank_name || user.pan_number) && (
                         <Box sx={{ ...infoItemStyle, background: "#F0FDF4", borderColor: "#BBF7D0" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Landmark size={16} color="#16A34A" />
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#166534", textTransform: "uppercase" }}>Banking & Legal ID</Typography>
                            </Box>
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                                {user.bank_name && <Typography sx={{ fontSize: 13, color: "#15803D" }}><strong>Bank:</strong> {user.bank_name}</Typography>}
                                {user.ifsc_code && <Typography sx={{ fontSize: 13, color: "#15803D" }}><strong>IFSC:</strong> {user.ifsc_code}</Typography>}
                                {user.account_number && <Typography sx={{ fontSize: 13, color: "#15803D", gridColumn: "span 2" }}><strong>Account:</strong> {user.account_number}</Typography>}
                                {user.pan_number && <Typography sx={{ fontSize: 13, color: "#15803D" }}><strong>PAN:</strong> {user.pan_number}</Typography>}
                                {user.aadhaar_number && <Typography sx={{ fontSize: 13, color: "#15803D" }}><strong>Aadhaar:</strong> {user.aadhaar_number}</Typography>}
                            </Box>
                        </Box>
                    )}

                    {/* Address Section */}
                    <Box sx={{ ...infoItemStyle, gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <MapPin size={16} color="#64748B" />
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>Address Information</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 14, color: "#475569", fontWeight: 500 }}>
                            {user.address || user.permanent_address || "Address details not provided."}
                        </Typography>
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button 
                    fullWidth 
                    variant="contained" 
                    onClick={onClose}
                    sx={{
                        background: "#EF4444",
                        "&:hover": { background: "#DC2626" },
                        borderRadius: "14px", 
                        textTransform: "none", 
                        fontWeight: 700, 
                        fontSize: 15,
                        py: 1.5,
                        boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.2)"
                    }}
                >
                    Close Profile
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserViewModal;


