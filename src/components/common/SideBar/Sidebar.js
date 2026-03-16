import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronDown, X } from "lucide-react";
import menuConfig from "../menuConfig";

export default function Sidebar({ isOpen, onClose, isDesktop, width = 280 }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openSubMenus, setOpenSubMenus] = useState({});
  const roleId = localStorage.getItem("role_id");
  const userPermissions = JSON.parse(
    localStorage.getItem("permissions") || "[]"
  );

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = useMemo(() => {
    if (Array.isArray(menuConfig)) return menuConfig;
    if (menuConfig?.items && Array.isArray(menuConfig.items))
      return menuConfig.items;
    if (menuConfig?.groups)
      return Object.values(menuConfig.groups).flat().filter(Boolean);
    return [];
  }, []);

  const { regularItems, logoutItem } = useMemo(() => {
    const regularItems = [];
    let logoutItem = null;

    menuItems.forEach((item) => {
      if (item.action === "logout") {
        logoutItem = item;
      } else {
        regularItems.push(item);
      }
    });

    return { regularItems, logoutItem };
  }, [menuItems]);

  const currentPath = location.pathname;

  const isRouteActive = (route) =>
    route && (currentPath === route || currentPath.startsWith(route + "/"));

  useEffect(() => {
    const newOpenMenus = {};
    regularItems.forEach(({ label, subItems }) => {
      if (
        subItems?.length &&
        subItems.some((item) => isRouteActive(item.route))
      ) {
        newOpenMenus[label] = true;
      }
    });
    setOpenSubMenus(newOpenMenus);
  }, [currentPath, regularItems]);

  const toggleSubMenu = (label) =>
    setOpenSubMenus((prev) => {
      if (prev[label]) {
        return {};
      }
      return { [label]: true };
    });

  const handleNavigation = (route) => {
    if (!route) return;
    navigate(route);
    if (!isDesktop) onClose?.();
  };

  const handleLogout = () => {
    console.log("Logging out...");
    navigate("/");
    if (!isDesktop) onClose?.();
  };

  const sidebarWidth = isDesktop
    ? width
    : windowWidth >= 640
    ? 320
    : Math.min(windowWidth - 40, 300);

  const AMBER = "rgba(139, 92, 246, 0.9)";   // purple
  const AMBER_HOVER = "rgba(139, 92, 246, 0.18)";
  const AMBER_BORDER = "rgba(139, 92, 246, 0.28)";

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(4px)",
      zIndex: 2000,
      display: !isDesktop && isOpen ? "block" : "none",
      animation: !isDesktop && isOpen ? "fadeIn 0.3s ease-out" : "none",
    },

    sidebar: {
      position: "fixed",
      top: 0,
      left: 0,
      height: "100vh",
      width: sidebarWidth,
      background:
        "linear-gradient(180deg, #1a1a1a 0%, #2b2b2b 60%, #1a1a1a 100%)",
      boxShadow:
        "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.06)",
      zIndex: 2001,
      transform: isDesktop
        ? "translateX(0)"
        : isOpen
        ? "translateX(0)"
        : "translateX(-100%)",
      transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex",
      flexDirection: "column",
      color: "#f5f5f5",
    },

    closeButtonContainer: {
      display: isDesktop ? "none" : "flex",
      justifyContent: "flex-end",
      padding: isDesktop ? `16px 20px 8px 20px` : `8px 16px`,
      alignItems: "center",
    },

    closeButton: {
      background: "rgba(255, 255, 255, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.06)",
      borderRadius: "12px",
      color: "#ffffff",
      padding: "10px",
      cursor: "pointer",
      transition: "all 0.18s ease",
      backdropFilter: "blur(6px)",
    },

    header: {
      padding: "20px 24px",
      borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      marginTop: isDesktop ? 0 : -8,
    },

    logoContainer: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      marginBottom: "12px",
    },

    logoImage: {
      width: "48px",
      height: "48px",
      borderRadius: "14px",
      objectFit: "cover",
      border: "2px solid rgba(255, 255, 255, 0.06)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    },

    brandText: {
      margin: 0,
      fontSize: "22px",
      fontWeight: "700",
      letterSpacing: "-0.02em",
      background: "linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    },

    navigation: {
      flex: 1,
      overflowY: "auto",
      padding: "16px 0",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
    },

    menuItemWrapper: {
      padding: "0 16px",
      marginBottom: "6px",
    },

    menuButton: (isActive) => ({
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "14px 9px",
      borderRadius: "16px",
      backgroundColor: isActive ? AMBER : "transparent",
      color: isActive ? "#fffaf2" : "#f5f5f5",
      fontWeight: isActive ? "600" : "500",
      fontSize: "15px",
      border: "none",
      cursor: "pointer",
      textAlign: "left",
      transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
      backdropFilter: isActive ? "blur(8px)" : "none",
      boxShadow: isActive ? "0 8px 32px rgba(0,0,0,0.22)" : "none",
    }),

    submenuContainer: {
      marginLeft: "20px",
      marginTop: "8px",
      paddingRight: "12px",
      borderLeft: `2px solid ${AMBER_BORDER}`,
      paddingLeft: "16px",
      borderRadius: "10px",
      paddingTop: "4px",
      paddingBottom: "4px",
    },

    submenuButton: (isActive) => ({
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "8px 14px",
      borderRadius: "10px",
      backgroundColor: isActive ? AMBER : "transparent",
      color: isActive ? "#fffaf2" : "#d1d5db",
      fontSize: "14px",
      fontWeight: isActive ? "600" : "500",
      border: "none",
      cursor: "pointer",
      textAlign: "left",
      marginBottom: "6px",
      transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
      backdropFilter: isActive ? "blur(8px)" : "none",
      boxShadow: isActive ? `0 3px 10px ${AMBER_HOVER}` : "none",
    }),

    logoutSection: {
      borderTop: "1px solid rgba(255, 255, 255, 0.06)",
      padding: "20px",
      background: "rgba(0, 0, 0, 0.04)",
      backdropFilter: "blur(8px)",
    },

    logoutButton: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "14px 18px",
      borderRadius: "16px",
      backgroundColor: "rgba(76, 29, 149, 0.9)",
      color: "#ffffff",
      fontWeight: "600",
      fontSize: "15px",
      border: `1px solid ${AMBER_BORDER}`,
      cursor: "pointer",
      textAlign: "left",
      transition: "all 0.18s cubic-bezier(0.4, 0, 0.2, 1)",
      backdropFilter: "blur(10px)",
    },
  };

  const canAccess = (item) => {
    if (!item.permissions || item.permissions.length === 0) return true;

    return item.permissions.some((perm) => userPermissions.includes(perm));
  };

  return (
    <>
      <div style={styles.overlay} onClick={onClose} />

      <aside style={styles.sidebar}>
        <div style={styles.closeButtonContainer}>
          <button
            style={styles.closeButton}
            className="sb-close-btn"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <img
              src="https://images.pexels.com/photos/3840441/pexels-photo-3840441.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
              alt="Garage Logo"
              style={styles.logoImage}
            />
            <h1 style={styles.brandText}>Garage</h1>
          </div>
        </div>

        <nav style={styles.navigation}>
          {regularItems
            .filter((item) => canAccess(item))
            .map((item) => {
              const { label, icon: IconComponent, route, subItems } = item;
              const Icon = IconComponent || (() => null);
              const isActive = isRouteActive(route);
              const hasSubmenu = Array.isArray(subItems) && subItems.length > 0;
              const isSubmenuOpen = !!openSubMenus[label];

              if (hasSubmenu) {
                const hasActiveChild = subItems.some((subItem) =>
                  isRouteActive(subItem.route)
                );

                return (
                  <div key={label}>
                    <div style={styles.menuItemWrapper}>
                      <button
                        style={styles.menuButton(hasActiveChild)}
                        className={`sb-menu-btn${hasActiveChild ? " active" : ""}`}
                        onClick={() => toggleSubMenu(label)}
                        aria-expanded={isSubmenuOpen}
                      >
                        <Icon size={20} />
                        <span style={{ flex: 1 }}>{label}</span>
                        {isSubmenuOpen ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </button>
                    </div>

                    {isSubmenuOpen && (
                      <div style={styles.submenuContainer}>
                        {subItems
                          .filter((subItem) => canAccess(subItem))
                          .map((subItem) => {
                            const isSubItemActive = isRouteActive(
                              subItem.route
                            );
                            const SubIcon = subItem.icon || (() => null);

                            return (
                              <button
                                key={subItem.label}
                                style={styles.submenuButton(isSubItemActive)}
                                className={`sb-sub-btn${isSubItemActive ? " active" : ""}`}
                                onClick={() => handleNavigation(subItem.route)}
                                aria-label={`Navigate to ${subItem.label}`}
                              >
                                <SubIcon size={16} />
                                {subItem.label}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div key={label} style={styles.menuItemWrapper}>
                  <button
                    style={styles.menuButton(isActive)}
                    className={`sb-menu-btn${isActive ? " active" : ""}`}
                    onClick={() => handleNavigation(route)}
                    aria-label={`Navigate to ${label}`}
                  >
                    <Icon size={20} />
                    <span style={{ flex: 1 }}>{label}</span>
                  </button>
                </div>
              );
            })}
        </nav>

        {logoutItem && (
          <div style={styles.logoutSection}>
            <button
              style={styles.logoutButton}
              className="sb-logout-btn"
              onClick={handleLogout}
              aria-label="Logout"
            >
              {logoutItem.icon && <logoutItem.icon size={20} />}
              <span style={{ flex: 1 }}>{logoutItem.label}</span>
            </button>
          </div>
        )}
      </aside>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        nav::-webkit-scrollbar { display: none; }

        /* ── menu item hover (non-active) ── */
        .sb-menu-btn:not(.active):hover {
          background-color: rgba(139, 92, 246, 0.18) !important;
          color: #fffaf2 !important;
          transform: translateX(4px);
        }

        /* ── submenu item hover (non-active) ── */
        .sb-sub-btn:not(.active):hover {
          background-color: rgba(139, 92, 246, 0.18) !important;
          color: #fffaf2 !important;
          transform: translateX(4px);
        }

        /* ── logout button hover ── */
        .sb-logout-btn:hover {
          background-color: rgba(76, 29, 149, 0.95) !important;
          transform: translateY(-2px);
        }

        /* ── close button hover ── */
        .sb-close-btn:hover {
          transform: scale(1.05);
          background-color: rgba(255,255,255,0.06) !important;
          color: #fff !important;
        }
      `}</style>
    </>
  );
}
