// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Montserrat, sans-serif",
  },
  components: {
    /* ── Global Snackbar: always top-centre, below the 64px navbar ── */
    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: { vertical: "top", horizontal: "center" },
      },
      styleOverrides: {
        root: {
          top: "72px !important",
          zIndex: "9999 !important",
        },
      },
    },
    /* ── Alert inside snackbar ── */
    MuiAlert: {
      styleOverrides: {
        filled: {
          borderRadius: "12px",
          fontWeight: 600,
          fontSize: 14,
          minWidth: 260,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        },
      },
    },
    /* ── Select field ── */
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          fontSize: 14,
          background: "#F9FAFB",
        },
        icon: {
          color: "#6B7280",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: "#E5E7EB",
          borderRadius: "10px",
        },
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0EA5E9",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#0EA5E9",
            boxShadow: "0 0 0 3px rgba(14,165,233,0.15)",
          },
        },
      },
    },
    /* ── Dropdown menu panel ── */
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          border: "1px solid #F1F5F9",
          marginTop: "4px",
        },
        list: {
          padding: "6px",
        },
      },
    },
    /* ── Each menu item ── */
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: 14,
          borderRadius: "8px",
          margin: "2px 0",
          padding: "10px 14px",
          color: "#111827",
          "&:hover": {
            background: "#F0F9FF",
            color: "#0EA5E9",
          },
          "&.Mui-selected": {
            background: "#EFF6FF",
            color: "#2563EB",
            fontWeight: 600,
            "&:hover": {
              background: "#DBEAFE",
            },
          },
        },
      },
    },
  },
});

export default theme;
