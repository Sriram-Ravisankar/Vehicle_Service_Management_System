import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { ToastProvider } from "../../../context/ToastContext";

const SIDEBAR_W = 256;

export default function Layout({ children, rightActions }) {
  const [w, setW] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = w >= 1024;

  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <ToastProvider>
      <div style={{ background: "#f8fafc", minHeight: "100vh", overflowX: "hidden" }}>
        <Navbar
          leftOffset={isDesktop ? SIDEBAR_W : 0}
          onToggleSidebar={() => setMobileOpen((v) => !v)}
          isDesktop={isDesktop}
          rightActions={rightActions}
        />

        <Sidebar
          isOpen={isDesktop ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          isDesktop={isDesktop}
          width={SIDEBAR_W}
          navbarHeight={64}
        />

        <div
          style={{
            marginLeft: isDesktop ? SIDEBAR_W : 0,
            paddingTop: "var(--nav-h, 64px)",
            minHeight: "100vh",
            boxSizing: "border-box",
            /* match the sidebar slide animation (0.4s) so content never overlaps */
            transition: "margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            zIndex: 0,
          }}
        >
          <main>{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
