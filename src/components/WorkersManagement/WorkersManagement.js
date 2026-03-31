import React, { useEffect, useMemo, useState } from "react";
import { 
  Box, 
  Tooltip, 
  Snackbar, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography 
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import { 
  Search, 
  Pencil, 
  Trash2, 
  Shield, 
  UserPlus, 
  LogIn, 
  Plus, 
  Users, 
  Key, 
  Filter,
  AlertTriangle 
} from "lucide-react";
import apiEndpoints from "../../apiconfig";
import { useLoading } from "../../pages/LoadingContext";
import SectionHeader from "../common/Header";
import useAutoRefresh from "../../hooks/useAutoRefresh";

const KPICard = ({ title, value, icon: Icon, color, isMobile }) => (
  <div style={{
    background: "#fff",
    borderRadius: "16px",
    padding: isMobile ? "20px" : "24px",
    border: "1px solid #F3F4F6",
    boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "default"
  }}>
    <div style={{ overflow: "hidden" }}>
      <p style={{ margin: 0, fontSize: "11px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</p>
      <p style={{ margin: "4px 0 0", fontSize: isMobile ? "24px" : "32px", fontWeight: "800", color: "#111827", lineHeight: 1 }}>{value}</p>
    </div>
    <div style={{
      width: isMobile ? "44px" : "56px", 
      height: isMobile ? "44px" : "56px", 
      borderRadius: "14px",
      background: `${color}10`, color: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0
    }}>
      <Icon size={isMobile ? 20 : 28} />
    </div>
  </div>
);

const API_BASE = apiEndpoints.workerManagement;
const API_WORKERS = `${API_BASE}?action=workers`;
const API_ROLES = `${API_BASE}?action=roles`;
const API_PERMS = `${API_BASE}?action=permissions`;

export default function WorkerManagement() {
  const { show, hide } = useLoading();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermMap, setRolePermMap] = useState({});
  const [showRolePermEditor, setShowRolePermEditor] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedPerms, setSelectedPerms] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // Dark mode state
  const [darkMode, setDarkMode] = useState(false);

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  // Filters / UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Edit modal state
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    id: null,
    user_guid: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    role_id: null,
    createLogin: false,
    login_email: "",
    login_password: "",
  });

  // Modern color scheme
  const colors = {
    light: {
      primary: "#3B82F6",
      secondary: "#6366F1",
      accent: "#0EA5E9",
      background: "#F8FAFC",
      card: "#FFFFFF",
      text: "#1E293B",
      textSecondary: "#64748B",
      border: "#E2E8F0",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
    },
    dark: {
      primary: "#60A5FA",
      secondary: "#818CF8",
      accent: "#A78BFA",
      background: "#0F172A",
      card: "#1E293B",
      text: "#F1F5F9",
      textSecondary: "#94A3B8",
      border: "#334155",
      success: "#34D399",
      warning: "#FBBF24",
      error: "#F87171",
    },
  };

  const theme = darkMode ? colors.dark : colors.light;

  const styles = {
    outer: {
      background: theme.background,
      minHeight: "100vh",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      flexWrap: "wrap",
      gap: "16px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#111827",
      letterSpacing: "-0.02em",
    },
    controls: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      flexWrap: "wrap",
    },
    filterGroup: {
      display: "flex",
      gap: "12px",
      alignItems: "center",
      flexWrap: "wrap",
    },
    searchInput: {
      height: "44px",
      padding: "0 16px 0 42px",
      borderRadius: "12px",
      border: `1px solid ${theme.border}`,
      background: theme.card,
      color: theme.text,
      fontSize: "14px",
      width: "100%",
      outline: "none",
      transition: "all 0.2s ease",
      "&:focus": {
        borderColor: theme.primary,
        boxShadow: `0 0 0 4px ${theme.primary}15`,
      },
    },
    searchWrapper: {
      position: "relative",
      width: isMobile ? "100%" : "300px",
    },
    searchIcon: {
      position: "absolute",
      left: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      color: theme.primary,
      opacity: 0.7,
      pointerEvents: "none",
    },
    select: {
      height: "44px",
      padding: "0 32px 0 40px",
      borderRadius: "12px",
      border: `1px solid ${theme.border}`,
      background: theme.card,
      color: theme.text,
      fontSize: "14px",
      outline: "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
      appearance: "none",
      "&:focus": {
        borderColor: theme.primary,
        boxShadow: `0 0 0 4px ${theme.primary}15`,
      },
    },
    button: {
      height: "44px",
      padding: "0 24px",
      borderRadius: "12px",
      border: "none",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      whiteSpace: "nowrap",
    },
    buttonPrimary: {
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
      color: "white",
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: `0 4px 12px ${theme.primary}40`,
      },
    },
    buttonSecondary: {
      background: "#fff",
      color: "#475569",
      border: `1px solid #E2E8F0`,
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      "&:hover": {
        borderColor: theme.primary,
        color: theme.primary,
        background: `${theme.primary}05`,
        transform: "translateY(-1px)",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      },
    },
    card: {
      background: theme.card,
      borderRadius: "16px",
      padding: "24px",
      boxShadow:
        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      border: `1px solid ${theme.border}`,
      marginBottom: "24px",
    },
    tableContainer: {
      overflow: "hidden",
      width: "100%",
    },
    tableWrapper: {
      overflowX: "auto",
      width: "100%",
    },
    table: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0",
      minWidth: "1000px",
    },
    th: {
      padding: "16px",
      textAlign: "left",
      borderBottom: `2px solid ${theme.border}`,
      color: theme.textSecondary,
      fontWeight: "700",
      fontSize: "12px",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      background: `${theme.background}50`,
      backdropFilter: "blur(10px)",
      position: "sticky",
      top: 0,
      zIndex: 10,
    },
    td: {
      padding: "16px",
      borderBottom: `1px solid ${theme.border}`,
      verticalAlign: "middle",
    },
    userCell: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    avatar: {
      width: "48px",
      height: "48px",
      borderRadius: "14px",
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "700",
      fontSize: "16px",
      boxShadow: `0 4px 12px ${theme.primary}30`,
    },
    userInfo: {
      display: "flex",
      flexDirection: "column",
    },
    userName: {
      fontWeight: "600",
      color: theme.text,
      marginBottom: "2px",
    },
    userEmail: {
      fontSize: "14px",
      color: theme.textSecondary,
    },
    roleBadge: {
      padding: "8px 14px",
      borderRadius: "10px",
      fontSize: "12px",
      fontWeight: "700",
      background: `linear-gradient(135deg, ${theme.primary}15, ${theme.primary}05)`,
      color: theme.primary,
      border: `1px solid ${theme.primary}20`,
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
    },
    permissionChip: {
      padding: "5px 10px",
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: "600",
      background: `${theme.accent}10`,
      color: theme.accent,
      border: `1px solid ${theme.accent}15`,
      margin: "2px",
      display: "inline-block",
    },
    loginBadge: {
      padding: "6px 12px",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "600",
      background: `${theme.success}10`,
      color: theme.success,
      border: `1px solid ${theme.success}20`,
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
    },
    actionButton: {
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      border: `1px solid ${theme.border}`,
      background: theme.card,
      color: theme.textSecondary,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: theme.primary,
        color: theme.primary,
        background: `${theme.primary}05`,
        transform: "translateY(-2px)",
      },
    },
    modalBackdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1300,
      padding: isMobile ? "16px" : "20px",
      transition: "all 0.3s ease",
    },
    modal: {
      background: theme.card,
      borderRadius: "16px",
      width: "100%",
      maxWidth: "600px",
      maxHeight: isMobile ? "90vh" : "85vh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      position: "relative",
    },
    modalHeader: {
      padding: "24px 24px 16px 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: `1px solid ${theme.border}`,
    },
    modalTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: theme.text,
      margin: 0,
    },
    modalBody: {
      padding: "24px",
      overflowY: "auto",
      flex: 1,
    },
    formGroup: {
      marginBottom: "20px",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "600",
      color: theme.text,
      fontSize: "14px",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      borderRadius: "12px",
      border: `1px solid ${theme.border}`,
      background: theme.background,
      color: theme.text,
      fontSize: "14px",
      outline: "none",
      transition: "all 0.2s ease",
      "&:focus": {
        borderColor: theme.primary,
        boxShadow: `0 0 0 3px ${theme.primary}20`,
      },
    },
    checkboxGroup: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      marginBottom: "16px",
    },
    checkbox: {
      width: "16px",
      height: "16px",
    },
    modalFooter: {
      padding: "16px 24px 24px 24px",
      display: "flex",
      gap: "12px",
      justifyContent: "flex-end",
      borderTop: `1px solid ${theme.border}`,
    },
    toggleButton: {
      padding: "8px 16px",
      borderRadius: "20px",
      border: `1px solid ${theme.border}`,
      background: theme.card,
      color: theme.text,
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: theme.primary,
      },
    },
  };

  // Rest of your existing logic remains the same...
  const getLimitedRolePermissions = (role_id) => {
    const perms = getRolePermissions(role_id);
    if (!isMobile) return perms;
    return perms.slice(0, 2);
  };

  const parseJsonOrText = async (resp) => {
    const text = await resp.text().catch(() => "");
    try {
      return {
        json: text ? JSON.parse(text) : null,
        text,
        ok: resp.ok,
        status: resp.status,
      };
    } catch {
      return { json: null, text, ok: resp.ok, status: resp.status };
    }
  };

  const handleSelectRole = (roleId) => {
    setSelectedRoleId(roleId);
    const permsForRole = rolePermMap[String(roleId)] || [];
    const permIds = permissions
      .filter((p) => permsForRole.includes(p.permission_name))
      .map((p) => p.id);
    setSelectedPerms(permIds);
  };

  const togglePermission = (id) => {
    setSelectedPerms((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const saveRolePermissions = async () => {
    if (!selectedRoleId) return showSnackbar("Select a role first", "warning");
    const token = sessionStorage.getItem("token");
    await fetch(`${API_BASE}?action=update_role_permissions`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        role_id: selectedRoleId,
        permissions: selectedPerms,
      }),
    });
    await loadRolesAndPerms();
    showSnackbar("Permissions updated successfully", "success");
    setShowRolePermEditor(false);
  };

  const loadRolesAndPerms = async () => {
    try {
      // show();
      const token = sessionStorage.getItem("token");
      const r = await fetch(API_ROLES, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const { json: rolesJson } = await parseJsonOrText(r);
      const allRoles = Array.isArray(rolesJson) ? rolesJson : [];
      
      // Filter out roles that were commented out in menuConfig
      const hiddenRoleNames = ["support staff", "accountant", "accountants", "staff"];
      const visibleRoles = allRoles.filter(
        (role) => !hiddenRoleNames.includes(role.role_name?.toLowerCase())
      );
      
      setRoles(visibleRoles);

      const p = await fetch(API_PERMS, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const { json: permsJson } = await parseJsonOrText(p);
      setPermissions(permsJson?.permissions ?? []);
      setRolePermMap(permsJson?.role_permissions ?? {});
    } catch (e) {
      console.warn("Failed loading roles/permissions", e);
    } finally {
      // hide();
    }
  };

  const loadUsers = async () => {
    // show();
    setError(null);
    try {
      const token = sessionStorage.getItem("token");
      const resp = await fetch(API_WORKERS, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const { json, ok } = await parseJsonOrText(resp);
      if (!ok) throw new Error("Failed to load users");
      const arr = Array.isArray(json) ? json : json?.data ?? json?.users ?? [];
      setUsers((arr || []).map(normalizeUser));
      setIsInitialized(true);
    } catch (e) {
      console.error("loadUsers:", e);
      setError("Failed to load users from server");
    } finally {
      // hide();
    }
  };

  useEffect(() => {
    loadRolesAndPerms();
    loadUsers();
  }, []);

  /* ── Auto-sync: background poll + tab-focus ── */
  useAutoRefresh(loadUsers);

  const fullname = (u) => `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim();
  const normalizeUser = (u) => ({
    ...u,
    id: String(u.id ?? u.user_id ?? ""),
    displayName: fullname(u),
  });

  const openEdit = (user) => {
    setForm({
      id: user.id,
      user_guid: user.user_guid,
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      email: user.email ?? "",
      mobile: user.mobile ?? "",
      role_id: user.role_id ?? null,
      createLogin: user.has_login ? true : false,
      login_email: user.login_email ?? "",
      login_password: user.login_password ?? "",
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const openAdd = () => {
    setForm({
      id: null,
      user_guid: "",
      first_name: "",
      last_name: "",
      email: "",
      mobile: "",
      role_id: roles.length ? roles[0].id : null,
      createLogin: false,
      login_email: "",
      login_password: "",
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const closeForm = () => setShowForm(false);
  const handleChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleDeleteWorker = (worker) => {
    setWorkerToDelete(worker);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteWorker = async () => {
    const worker = workerToDelete;
    if (!worker) return;

    try {
      const token = sessionStorage.getItem("token");
      const resp = await fetch(`${API_BASE}?action=delete_worker&id=${worker.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      const data = await resp.json();
      if (data.success) {
        showSnackbar("Worker removed successfully", "success");
        loadUsers();
      } else {
        showSnackbar(data.error || "Failed to delete worker", "error");
      }
    } catch (e) {
      console.error("Delete worker error:", e);
      showSnackbar("An error occurred while deleting the worker.", "error");
    } finally {
      setDeleteDialogOpen(false);
      setWorkerToDelete(null);
    }
  };

  const save = async () => {
    try {
      // show();
      if (!form.first_name) return showSnackbar("First name is required", "warning");
      if (!form.email) return showSnackbar("Email is required", "warning");
      if (!form.role_id) return showSnackbar("Select a role", "warning");
      if (form.createLogin && (!form.login_email || !form.login_password)) {
        return showSnackbar("Login email and password are required", "warning");
      }

      let payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        mobile: form.mobile,
        role_id: form.role_id,
        create_login: form.createLogin ? 1 : 0,
        login_email: form.createLogin ? form.login_email : undefined,
        login_password: form.createLogin ? form.login_password : undefined,
      };

      if (!form.id) {
        const token = sessionStorage.getItem("token");
        const resp = await fetch(`${API_BASE}?action=create_worker`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload),
        });
        const txt = await resp.text();
        if (!resp.ok) throw new Error("Create failed: " + txt);
      } else {
        const token = sessionStorage.getItem("token");
        const resp = await fetch(
          `${API_BASE}?action=update_worker&id=${encodeURIComponent(form.id)}`,
          {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
          }
        );
        const txt = await resp.text();
        if (!resp.ok) throw new Error("Update failed: " + txt);
      }

      await loadUsers();
      await loadRolesAndPerms();
      showSnackbar(form.id ? "Worker updated successfully" : "Worker created successfully", "success");
      closeForm();
    } catch (e) {
      console.error("Save failed", e);
      showSnackbar(e.message || "Save failed", "error");
    } finally {
      // hide();
    }
  };

  const workers = useMemo(() => {
    // Show all employees returned by the API.
    // The backend already filters to user_type='employee' and admin_guid,
    // so no further filtering by role is needed here.
    return users || [];
  }, [users]);

  const filtered = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    
    let list = [...workers];

    // Apply search filter
    if (q) {
      list = list.filter(
        (u) =>
          (u.displayName || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.mobile || "").toLowerCase().includes(q)
      );
    }

    if (roleFilter !== "all") {
      list = list.filter((u) => u.role_id && String(u.role_id) === String(roleFilter));
    }
    
    return list.sort((a, b) =>
      (a.displayName || "").localeCompare(b.displayName || "")
    );
  }, [workers, searchTerm, roleFilter]);

  const roleLabel = (role_id) => {
    const r = roles.find((x) => String(x.id) === String(role_id));
    return r ? r.role_name : "—";
  };

  const getRolePermissions = (role_id) => {
    const arr = rolePermMap?.[String(role_id)] ?? [];
    return (arr || [])
      .map((pname) => permissions.find((p) => p.permission_name === pname))
      .filter(Boolean);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3, md: 4 }, minHeight: "100vh", backgroundColor: theme.background }}>
      {/* Header */}
      <SectionHeader title="Worker Management" showAdd={false} />

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: "20px",
          marginTop: "24px",
          marginBottom: "24px"
        }}
      >
        <KPICard 
          title="Total Workers" 
          value={workers.length} 
          icon={Users} 
          color={theme.primary} 
          isMobile={isMobile}
        />
        <KPICard 
          title="Active Roles" 
          value={roles.length} 
          icon={Shield} 
          color={theme.success} 
          isMobile={isMobile}
        />
        <KPICard 
          title="Access Granted" 
          value={workers.filter((u) => u.has_login).length} 
          icon={Key} 
          color={theme.warning} 
          isMobile={isMobile}
        />
      </div>

      {/* Control Bar */}
      <Box sx={{ 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        alignItems: "center", 
        gap: 2, 
        mb: 3, 
        mt: 1 
      }}>
        {/* Search */}
        <Box sx={{ position: "relative", flex: isMobile ? "1fr" : "0 0 320px" }}>
          <Search 
            size={18} 
            style={{ 
              position: "absolute", 
              left: "14px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: theme.primary,
              zIndex: 1
            }} 
          />
          <input
            placeholder="Search name, email, mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              height: "44px",
              width: "100%",
              padding: "0 16px 0 42px",
              borderRadius: "12px",
              border: `1px solid #E2E8F0`,
              background: "#fff",
              fontSize: "14px",
              outline: "none",
              transition: "all 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme.primary;
              e.target.style.boxShadow = `0 0 0 4px ${theme.primary}15`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E2E8F0";
              e.target.style.boxShadow = "none";
            }}
          />
        </Box>

        {/* Role Filter */}
        <Box sx={{ position: "relative", flex: isMobile ? "1fr" : "0 0 200px" }}>
          <Filter 
            size={18} 
            style={{ 
              position: "absolute", 
              left: "14px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "#64748B",
              zIndex: 1
            }} 
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              height: "44px",
              width: "100%",
              padding: "0 32px 0 40px",
              borderRadius: "12px",
              border: `1px solid #E2E8F0`,
              background: "#fff",
              fontSize: "14px",
              outline: "none",
              cursor: "pointer",
              appearance: "none",
            }}
          >
            <option value="all">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.role_name}
              </option>
            ))}
          </select>
          <Box sx={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94A3B8", display: "flex" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </Box>
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Permissions Button */}
        <Box
          component="button"
          onClick={() => setShowRolePermEditor(true)}
          sx={{
            height: "44px",
            padding: "0 20px",
            borderRadius: "12px",
            border: "1px solid #E2E8F0",
            background: "#fff",
            color: "#475569",
            fontSize: "14px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            whiteSpace: "nowrap",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            "&:hover": {
              borderColor: theme.primary,
              color: theme.primary,
              background: `${theme.primary}05`,
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            },
            "&:active": {
              transform: "translateY(0)",
            }
          }}
        >
          <Shield size={18} /> Permissions
        </Box>
      </Box>

      {/* Main Content */}
      <div style={{ ...styles.card, padding: 0, overflow: "hidden" }}>
        {error && (
          <div
            style={{
              color: theme.error,
              padding: "16px 24px",
              background: `${theme.error}15`,
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            {error}
          </div>
        )}

        <div style={styles.tableContainer}>
          <style>{`
            .hide-scrollbar::-webkit-scrollbar { height: 6px; }
            .hide-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
            .hide-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            .hide-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
          `}</style>
          <div className="hide-scrollbar" style={{ ...styles.tableWrapper, position: "relative" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Worker Details</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Contact Info</th>
                  <th style={styles.th}>Login</th>
                  <th style={styles.th}>Permissions</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
              {filtered.length > 0 ? (
                filtered.map((u) => (
                  <tr 
                    key={u.id} 
                    style={{ 
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${theme.primary}05`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td style={styles.td}>
                      <div style={styles.userCell}>
                        <div style={styles.avatar}>
                          {getInitials(u.displayName || u.first_name || "U")}
                        </div>
                        <div style={styles.userInfo}>
                          <div style={styles.userName}>
                            {u.displayName || u.first_name}
                          </div>
                          <div style={styles.userEmail}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.roleBadge}>
                        <Shield size={12} /> {roleLabel(u.role_id)}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {u.mobile && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: theme.text, fontSize: "14px", fontWeight: "500" }}>
                          <span style={{ color: theme.primary }}>📞</span> {u.mobile}
                        </div>
                      )}
                    </td>
                    <td style={styles.td}>
                      {u.has_login ? (
                        <span style={styles.loginBadge}>
                          <LogIn size={12} /> Access Active
                        </span>
                      ) : (
                        <span style={{ ...styles.loginBadge, background: `${theme.warning}10`, color: theme.warning, border: `1px solid ${theme.warning}20` }}>
                          No Access
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", maxWidth: "180px", alignItems: "center" }}>
                        {getRolePermissions(u.role_id).slice(0, 1).map((p) => (
                          <span key={p.id} style={styles.permissionChip}>
                            {p.permission_name}
                          </span>
                        ))}
                        {getRolePermissions(u.role_id).length > 1 && (
                          <span style={{ 
                            ...styles.permissionChip, 
                            background: `${theme.primary}08`, 
                            color: theme.primary,
                            border: `1px solid ${theme.primary}15`,
                            fontWeight: "700",
                            padding: "4px 8px"
                          }}>
                            +{getRolePermissions(u.role_id).length - 1}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={styles.td}>
                    <div style={styles.actions}>
                      <Tooltip title="Edit Profile">
                        <IconButton
                          size="small"
                          onClick={() => openEdit(u)}
                          sx={{ 
                            width: 32, height: 32, borderRadius: "8px", background: "#F5F3FF", color: "#0EA5E9",
                            "&:hover": { background: "#0EA5E9 !important", color: "#fff !important" }
                          }}
                        >
                          <Pencil size={15} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Worker">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteWorker(u)}
                          sx={{ 
                            width: 32, height: 32, borderRadius: "8px", background: "#FEF2F2", color: "#EF4444",
                            "&:hover": { background: "#EF4444 !important", color: "#fff !important" }
                          }}
                        >
                          <Trash2 size={15} />
                        </IconButton>
                      </Tooltip>
                    </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ ...styles.td, textAlign: "center", padding: "60px", color: theme.textSecondary }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                      <Search size={40} style={{ opacity: 0.2 }} />
                      <span>No workers found matching your criteria</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>

      {/* Role Permissions Modal */}
      {showRolePermEditor && (
        <div
          style={styles.modalBackdrop}
          onClick={() => setShowRolePermEditor(false)}
        >
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Manage Role Permissions</h3>
              <button
                onClick={() => setShowRolePermEditor(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: theme.text,
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Select Role</label>
                <select
                  value={selectedRoleId}
                  onChange={(e) => handleSelectRole(e.target.value)}
                  style={styles.input}
                >
                  <option value="">-- Choose Role --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.role_name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedRoleId && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Assign Permissions</label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                      gap: "12px",
                      background: "#F8FAFC",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #E2E8F0"
                    }}
                  >
                    {permissions.map((p) => (
                      <label key={p.id} style={styles.checkboxGroup}>
                        <input
                          type="checkbox"
                          checked={selectedPerms.includes(p.id)}
                          onChange={() => togglePermission(p.id)}
                          style={styles.checkbox}
                        />
                        <span style={{ color: theme.text, fontSize: "14px" }}>
                          {p.permission_name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={() => setShowRolePermEditor(false)}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                Cancel
              </button>
              <button
                onClick={saveRolePermissions}
                style={{ 
                  ...styles.button, 
                  ...styles.buttonPrimary,
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  color: "#fff" 
                }}
              >
                Save Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Worker Form Modal */}
      {showForm && (
        <div style={styles.modalBackdrop} onClick={closeForm}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {isEditing
                  ? `Edit ${form.first_name} ${form.last_name}`
                  : "Add New Worker"}
              </h3>
              <button
                onClick={closeForm}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: theme.text,
                }}
              >
                ×
              </button>
            </div>
            <div style={styles.modalBody}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div style={styles.formGroup}>
                  <label style={styles.label}>First Name *</label>
                  <input
                    value={form.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Last Name</label>
                  <input
                    value={form.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email *</label>
                  <input
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Mobile</label>
                  <input
                    value={form.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Role *</label>
                <select
                  value={form.role_id ?? ""}
                  onChange={(e) => handleChange("role_id", e.target.value)}
                  style={styles.input}
                >
                  <option value="">-- Select role --</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.role_name}
                    </option>
                  ))}
                </select>
              </div>

              {form.role_id && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Role Permissions</label>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      padding: "12px",
                      background: theme.background,
                      borderRadius: "8px",
                    }}
                  >
                    {getRolePermissions(form.role_id).map((p) => (
                      <span key={p.id} style={styles.permissionChip}>
                        {p.permission_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    checked={form.createLogin}
                    onChange={(e) =>
                      handleChange("createLogin", e.target.checked)
                    }
                    style={styles.checkbox}
                  />
                  <span style={{ fontWeight: "600", color: theme.text }}>
                    Create login for this user
                  </span>
                </label>

                {form.createLogin && (
                  <div style={{ marginLeft: "24px", marginTop: "16px" }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Login Email *</label>
                      <input
                        value={form.login_email}
                        onChange={(e) =>
                          handleChange("login_email", e.target.value)
                        }
                        style={styles.input}
                        placeholder="user@login.example.com"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Login Password *</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={form.login_password}
                          onChange={(e) =>
                            handleChange("login_password", e.target.value)
                          }
                          style={{ ...styles.input, paddingRight: "45px" }}
                          placeholder="Enter password"
                        />
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: "absolute",
                            right: "8px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            padding: "4px",
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={closeForm}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                Cancel
              </button>
               <button
                onClick={save}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  color: "#fff"
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: 700, color: "#111827" }}>
          <AlertTriangle size={24} style={{ color: "#EF4444" }} />
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#4B5563", fontSize: "15px" }}>
            Are you sure you want to delete <b>{workerToDelete?.displayName}</b>? This action uses soft delete and cannot be undone easily.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: "none", fontWeight: 600, color: "#6B7280" }}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteWorker} 
            variant="contained" 
            sx={{ 
              textTransform: "none", fontWeight: 600, 
              backgroundColor: "#EF4444", "&:hover": { backgroundColor: "#DC2626" },
              borderRadius: "8px"
            }}
          >
            Delete Worker
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled" 
          sx={{ width: '100%', borderRadius: "10px", fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
