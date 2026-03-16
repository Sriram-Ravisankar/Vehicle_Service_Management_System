import React, { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import { Search, Pencil, Trash2, Shield, UserPlus, LogIn } from "lucide-react";
import apiEndpoints from "../../apiconfig";
import { useLoading } from "../../pages/LoadingContext";

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
      accent: "#8B5CF6",
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
      padding: isMobile ? "16px 12px" : "24px",
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
      fontSize: isMobile ? "24px" : "24px",
      fontWeight: "700",
      background: `linear(135deg, ${theme.primary}, ${theme.accent})`,
      WebkitBackgroundClip: "text",
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
      padding: "10px 16px",
      borderRadius: "12px",
      border: `1px solid ${theme.border}`,
      background: theme.card,
      color: theme.text,
      fontSize: "14px",
      minWidth: "200px",
      outline: "none",
      transition: "all 0.2s ease",
      "&:focus": {
        borderColor: theme.primary,
        boxShadow: `0 0 0 3px ${theme.primary}20`,
      },
    },
    searchWrapper: {
      position: "relative",
      width: isMobile ? "100%" : "300px",
    },
    searchIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: theme.textSecondary,
      pointerEvents: "none",
    },
    select: {
      padding: "10px 16px",
      borderRadius: "12px",
      border: `1px solid ${theme.border}`,
      background: theme.card,
      color: theme.text,
      fontSize: "14px",
      outline: "none",
      cursor: "pointer",
      transition: "all 0.2s ease",
      "&:focus": {
        borderColor: theme.primary,
        boxShadow: `0 0 0 3px ${theme.primary}20`,
      },
    },
    button: {
      padding: "10px 20px",
      borderRadius: "12px",
      border: "none",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    buttonPrimary: {
      background: `linear(135deg, ${theme.primary}, ${theme.secondary})`,
      color: "white",
      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: `0 4px 12px ${theme.primary}40`,
      },
    },
    buttonSecondary: {
      background: theme.card,
      color: theme.text,
      border: `1px solid ${theme.border}`,
      "&:hover": {
        borderColor: theme.primary,
        transform: "translateY(-1px)",
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
      overflowX: "auto",
      borderRadius: "12px",
      border: `1px solid ${theme.border}`,
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: isMobile ? "800px" : "100%",
    },
    th: {
      padding: "16px",
      textAlign: "left",
      borderBottom: `2px solid ${theme.border}`,
      color: theme.textSecondary,
      fontWeight: "600",
      fontSize: "14px",
      background: theme.card,
    },
    td: {
      padding: "16px",
      borderBottom: `1px solid ${theme.border}`,
      verticalAlign: "top",
    },
    userCell: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    avatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: `linear(135deg, ${theme.primary}, ${theme.accent})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "black",
      fontWeight: "600",
      fontSize: "14px",
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
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      background: `${theme.primary}15`,
      color: theme.primary,
      border: `1px solid ${theme.primary}30`,
    },
    permissionChip: {
      padding: "4px 8px",
      borderRadius: "8px",
      fontSize: "11px",
      fontWeight: "500",
      background: `${theme.accent}15`,
      color: theme.accent,
      border: `1px solid ${theme.accent}30`,
      margin: "2px",
    },
    loginBadge: {
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "500",
      background: `${theme.success}15`,
      color: theme.success,
      border: `1px solid ${theme.success}30`,
    },
    actionButton: {
      padding: "8px 12px",
      borderRadius: "8px",
      border: `1px solid ${theme.border}`,
      background: "transparent",
      color: theme.text,
      cursor: "pointer",
      fontSize: "12px",
      fontWeight: "500",
      transition: "all 0.2s ease",
      "&:hover": {
        borderColor: theme.primary,
        color: theme.primary,
      },
    },
    modalBackdrop: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      marginTop: "50px",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    },
    modal: {
      background: theme.card,
      borderRadius: "16px",
      width: "100%",
      maxWidth: "600px",
      maxHeight: "90vh",
      overflow: "auto",
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    },
    modalHeader: {
      padding: "24px 24px 0 24px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    modalTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: theme.text,
      margin: 0,
    },
    modalBody: {
      padding: "24px",
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
      padding: "0 24px 24px 24px",
      display: "flex",
      gap: "12px",
      justifyContent: "flex-end",
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
    if (!selectedRoleId) return alert("Select a role first");
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
    setShowRolePermEditor(false);
  };

  const loadRolesAndPerms = async () => {
    try {
      show();
      const token = sessionStorage.getItem("token");
      const r = await fetch(API_ROLES, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const { json: rolesJson } = await parseJsonOrText(r);
      setRoles(Array.isArray(rolesJson) ? rolesJson : []);
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
      hide();
    }
  };

  const loadUsers = async () => {
    show();
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
      hide();
    }
  };

  useEffect(() => {
    loadRolesAndPerms();
    loadUsers();
  }, []);

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

  const save = async () => {
    try {
      show();
      if (!form.first_name) return alert("First name is required");
      if (!form.email) return alert("Email is required");
      if (!form.role_id) return alert("Select a role");
      if (form.createLogin && (!form.login_email || !form.login_password)) {
        return alert("Login email and password are required");
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
      closeForm();
    } catch (e) {
      console.error("Save failed", e);
      alert("Save failed: " + e.message);
    } finally {
      hide();
    }
  };

  const filtered = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    let list = (users || []).filter(
      (u) =>
        (u.displayName || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.mobile || "").toLowerCase().includes(q)
    );
    if (roleFilter !== "all")
      list = list.filter((u) => String(u.role_id) === String(roleFilter));
    return list.sort((a, b) =>
      (a.displayName || "").localeCompare(b.displayName || "")
    );
  }, [users, searchTerm, roleFilter]);

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
    <Box style={styles.outer}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.controls}>
          <h1 style={styles.title}>Worker Management</h1>
        </div>
        <div style={styles.controls}>
          <div style={styles.filterGroup}>
            <div style={styles.searchWrapper}>
              <Search size={16} style={styles.searchIcon} />
              <input
                placeholder="Search workers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ ...styles.searchInput, paddingLeft: "40px", width: "100%" }}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.role_name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowRolePermEditor(true)}
              style={{ ...styles.button, ...styles.buttonSecondary }}
            >
              Permissions
            </button>
            {/* <button
              onClick={openAdd}
              style={{...styles.button, ...styles.buttonPrimary}}
            >
              ➕ Add Worker
            </button> */}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
          gap: "16px",
        }}
      >
        <div style={styles.card}>
          <div
            style={{
              fontSize: "14px",
              color: theme.textSecondary,
            }}
          >
            Total Workers
          </div>
          <div
            style={{ fontSize: "24px", fontWeight: "700", color: theme.text }}
          >
            {users.length}
          </div>
        </div>
        <div style={styles.card}>
          <div
            style={{
              fontSize: "14px",
              color: theme.textSecondary,
            }}
          >
            Active Roles
          </div>
          <div
            style={{ fontSize: "24px", fontWeight: "700", color: theme.text }}
          >
            {roles.length}
          </div>
        </div>
        <div style={styles.card}>
          <div
            style={{
              fontSize: "14px",
              color: theme.textSecondary,
            }}
          >
            With Login
          </div>
          <div
            style={{ fontSize: "24px", fontWeight: "700", color: theme.text }}
          >
            {users.filter((u) => u.has_login).length}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.card}>

        {error && (
          <div
            style={{
              color: theme.error,
              padding: "10px",
              background: `${theme.error}15`,
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Worker</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Login</th>
                <th style={styles.th}>Permissions</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((u) => (
                  <tr key={u.id}>
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
                      <span style={styles.roleBadge}>{roleLabel(u.role_id)}</span>
                    </td>
                    <td style={styles.td}>
                      {u.mobile && (
                        <div style={{ color: theme.text }}>📞 {u.mobile}</div>
                      )}
                    </td>
                    <td style={styles.td}>
                      {u.has_login ? (
                        <span style={styles.loginBadge}>✅ {u.login_email}</span>
                      ) : (
                        <span
                          style={{ color: theme.textSecondary, fontSize: "14px" }}
                        >
                          — no login —
                        </span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px",
                          alignItems: "center",
                        }}
                      >
                        {/* Always show only the FIRST 2 permissions */}
                        {getRolePermissions(u.role_id)
                          .slice(0, 2)
                          .map((p) => (
                            <span key={p.id} style={styles.permissionChip}>
                              {p.permission_name}
                            </span>
                          ))}

                        {/* Show "+X" more IF more than 2 */}
                        {getRolePermissions(u.role_id).length > 2 && (
                          <span
                            style={{
                              ...styles.permissionChip,
                              background: "#E5E7EB",
                              color: "#374151",
                            }}
                          >
                            +{getRolePermissions(u.role_id).length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={styles.td}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => openEdit(u)}
                          style={{
                            width: 32, height: 32, borderRadius: 8, border: "none",
                            background: "#F5F3FF", color: "#8B5CF6",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", transition: "all 0.15s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#8B5CF6"; e.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "#F5F3FF"; e.currentTarget.style.color = "#8B5CF6"; }}
                        >
                          <Pencil size={14} />
                        </button>
                        {/* If you wanted a delete button for workers you'd add it here */}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      ...styles.td,
                      textAlign: "center",
                      padding: "40px",
                      color: theme.textSecondary,
                    }}
                  >
                    {searchTerm || roleFilter !== "all"
                      ? "No workers found matching your criteria"
                      : "No workers found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: "8px",
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
                style={{ ...styles.button, ...styles.buttonPrimary }}
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
                  color: "green",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </Box>
  );
}
