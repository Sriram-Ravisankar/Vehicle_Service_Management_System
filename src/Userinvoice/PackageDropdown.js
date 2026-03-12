import React, { useState } from "react";
import { FaChevronRight, FaSearch, FaPlus } from "react-icons/fa";
import PropTypes from "prop-types";

const serviceList = [
  {
    id: 1,
    label: "DETAILING SERVICES",
    submenu: ["INTERIOR CLEANING", "EXTERIOR POLISH", "FULL DETAILING"],
  },
  {
    id: 2,
    label: "FREE OIL FILTER",
    submenu: ["ENGINE OIL", "FILTER CHECK", "TOP-UP OIL"],
  },
  {
    id: 3,
    label: "FREE SERVICES",
    submenu: ["FIRST SERVICE", "SECOND SERVICE", "THIRD SERVICE"],
  },
  {
    id: 4,
    label: "WARRANTY",
    submenu: ["1 YEAR", "2 YEARS", "EXTENDED WARRANTY"],
  },
  {
    id: 5,
    label: "UPGRADE ENGINE",
    submenu: ["ENGINE 1.2L", "ENGINE 1.5L", "ENGINE 2.0L"],
  },
  {
    id: 6,
    label: "ENGINE UPGRADE",
    submenu: ["TURBO BOOST", "ECU REMAP", "PERFORMANCE KIT"],
  },
  {
    id: 7,
    label: "TEST1",
    submenu: ["SUB1", "SUB2", "SUB3"],
  },
];

const PackageDropdown = ({ onClose, onAddService }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = serviceList.filter(
    (item) =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.submenu.some((sub) =>
        sub.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const handleToggleSubmenu = (id) => {
    setActiveSubmenu((prev) => (prev === id ? null : id));
  };

  const handleServiceAdd = (serviceName) => {
    if (typeof onAddService !== "function") {
      console.error("onAddService is not a function");
      return;
    }
    onAddService(serviceName);
    onClose();
  };

  const handlePlusClick = (e, serviceName) => {
    e.stopPropagation();
    e.preventDefault();
    handleServiceAdd(serviceName);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "120px",
        left: "50px",
        width: "300px",
        maxHeight: "420px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        fontFamily: "Montserrat",
        overflow: "hidden",
        zIndex: 999,
      }}
    >
      <div
        style={{
          backgroundColor: "#00B9C6",
          color: "#fff",
          padding: "10px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}
        >
          <FaSearch />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              outline: "none",
              width: "100%",
              marginLeft: "8px",
              fontSize: "14px",
            }}
          />
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            fontSize: "16px",
            cursor: "pointer",
            marginLeft: "8px",
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ overflowY: "auto", maxHeight: "360px" }}>
        {(searchTerm ? filteredServices : serviceList).map((item) => (
          <div key={item.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 14px",
                fontSize: "14px",
                borderBottom: "1px solid #eee",
                cursor: "pointer",
                backgroundColor: activeSubmenu === item.id ? "#e0f7fa" : "#fff",
              }}
              onClick={() => handleToggleSubmenu(item.id)}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#e0f7fa")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor =
                  activeSubmenu === item.id ? "#e0f7fa" : "#fff")
              }
            >
              <span>{item.label}</span>
              <FaChevronRight />
            </div>

            {activeSubmenu === item.id && (
              <div
                style={{
                  backgroundColor: "#f9f9f9",
                  paddingLeft: "20px",
                  paddingRight: "10px",
                  fontSize: "13px",
                  borderBottom: "1px solid #ddd",
                }}
              >
                {item.submenu.map((sub, index) => (
                  <div
                    key={index}
                    style={{
                      padding: "8px 0",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceAdd(sub);
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e0ffff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span>{sub}</span>
                    <FaPlus
                      onClick={(e) => handlePlusClick(e, sub)}
                      size={12}
                      style={{ color: "#00B9C6", marginLeft: "8px" }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

PackageDropdown.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAddService: PropTypes.func.isRequired,
};

export default PackageDropdown;
