import React, { useLayoutEffect, useRef, useState } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { IconButton } from "@mui/material";
import apiEndpoints from "../../../apiconfig";

export default function Navbar({
  leftOffset = 0,
  height = 64,
  onToggleSidebar,
  onSettings,
  isDesktop,
  rightActions,
}) {
  const ref = useRef(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notificationCount] = useState(3);
  const [user, setUser] = useState(null);


  const AMBER = "rgba(249, 115, 22, 0.9)";
  const AMBER_HOVER = "rgba(249, 115, 22, 0.18)";
  const AMBER_BORDER = "rgba(249, 115, 22, 0.28)";
  const GRAPHITE_BG =
    "linear-gradient(180deg, #1a1a1a 0%, #2b2b2b 60%, #1a1a1a 100%)";

 useLayoutEffect(() => {
  const token =sessionStorage.getItem("token"); // or sessionStorage

  if (!token) return;

  fetch(`${apiEndpoints.profile}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success && data.data) {
        setUser(data.data);
      }
    })
    .catch((err) => console.error("Profile fetch error:", err));
}, []);


  const profileMenuItems = [
  {
    icon: UserIcon,
    label: "My Profile",
    action: () => (window.location.href = "/profile-settings"),
  },
  {
    icon: LogOut,
    label: "Logout",
    action: () => {
      sessionStorage.setItem("logoutMessage", "true");
      window.location.href = "/";
    },
  },
];


  const headerStyle = {
    position: "fixed",
    top: 0,
    left: leftOffset,
    right: 0,
    height,
    zIndex: 1300,
    background: GRAPHITE_BG,
    borderBottom: `1px solid ${AMBER_BORDER}`,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    transition: "left 0.3s ease",
    backdropFilter: "blur(10px)",
  };

  const rowStyle = {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    boxSizing: "border-box",
  };

  const iconButton = {
    height: 40,
    width: 40,
    border: `1px solid ${AMBER_BORDER}`,
    background: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s ease, background 0.2s ease",
    color: "#fffaf2",
  };

  const pillButton = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255,255,255,0.08)",
    border: `1px solid ${AMBER_BORDER}`,
    borderRadius: 25,
    padding: "6px 12px 6px 6px",
    cursor: "pointer",
    transition: "background 0.2s ease, transform 0.2s ease",
    color: "#fffaf2",
  };

  const hoverIn = (e) => {
    e.currentTarget.style.background = AMBER_HOVER;
    e.currentTarget.style.transform = "scale(1.04)";
  };

  const hoverOut = (e) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
    e.currentTarget.style.transform = "scale(1)";
  };

  return (
    <header ref={ref} style={headerStyle}>
      <div style={rowStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!isDesktop && (
            <button
              aria-label="Open navigation"
              onClick={onToggleSidebar}
              style={iconButton}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
            >
              <Menu size={20} />
            </button>
          )}

          {/* <div
            style={{
              position: "relative",
              display: isDesktop ? "block" : "none",
            }}
          >
            <Search
              size={18}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: AMBER,
              }}
            />
            <input
              type="text"
              placeholder="Search..."
              style={{
                padding: "10px 12px 10px 40px",
                borderRadius: 25,
                border: `1px solid ${AMBER_BORDER}`,
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                width: 260,
                fontSize: 14,
                transition: "width 0.2s ease, background 0.2s ease",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = AMBER_HOVER;
                e.currentTarget.style.width = "320px";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.width = "260px";
              }}
            />
          </div> */}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* <div style={{ position: "relative" }}>
            <button
              aria-label="Notifications"
              style={iconButton}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
            >
              <Bell size={20} />
            </button>
            {notificationCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  background: AMBER,
                  color: "#fff",
                  borderRadius: "50%",
                  width: 18,
                  height: 18,
                  fontSize: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  border: `2px solid ${AMBER_BORDER}`,
                }}
              >
                {notificationCount}
              </span>
            )}
          </div>
{/*  */}
          {/* <IconButton
            onClick={onSettings}
            sx={{
              border: `2px solid ${AMBER_BORDER}`,
              background: "rgba(255,255,255,0.08)",
              color: "#fffaf2",
              "&:hover": { background: AMBER_HOVER },
              width: 45,
              height: 45,
            }}
            aria-label="Settings"
          >
            <Settings />
          </IconButton>  */}

          <div style={{ position: "relative" }}>
            <button
              aria-haspopup="menu"
              aria-expanded={showProfileMenu}
              onClick={() => setShowProfileMenu((v) => !v)}
              style={pillButton}
              onMouseEnter={hoverIn}
              onMouseLeave={hoverOut}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: AMBER,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: 14,
                  color: "#fff",
                }}
              >
                {user?.userName ? user.userName.charAt(0).toUpperCase() : "U"}

              </div>

              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2 }}>
                  {user?.userName}

                </div>
                <div style={{ fontSize: 11, opacity: 0.9, lineHeight: 1.2 }}>
                  Administrator
                </div>
              </div>

              <ChevronDown
                size={16}
                style={{
                  transition: "transform 0.2s ease",
                  transform: showProfileMenu
                    ? "rotate(180deg)"
                    : "rotate(0deg)",
                }}
              />
            </button>

            {showProfileMenu && (
              <div
                role="menu"
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 8,
                  background: "#242424",
                  borderRadius: 12,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                  minWidth: 200,
                  zIndex: 1401,
                  border: `1px solid ${AMBER_BORDER}`,
                  overflow: "hidden",
                }}
              >
                {profileMenuItems.map((item, idx) => (
                  <button
                    key={idx}
                    role="menuitem"
                    onClick={item.action}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 16px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      transition: "background 0.15s ease, color 0.15s ease",
                      color: "#f5f5f5",
                      fontSize: 14,
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = AMBER_HOVER;
                      e.currentTarget.style.color = "#fffaf2";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#f5f5f5";
                    }}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {rightActions}
        </div>
      </div>

      {showProfileMenu && (
        <div
          onClick={() => setShowProfileMenu(false)}
          style={{ position: "fixed", inset: 0, zIndex: 1400 }}
        />
      )}
    </header>
  );
}
