import React, { useState } from "react";
import { FaChevronRight, FaSearch, FaPlus } from "react-icons/fa";
import PropTypes from "prop-types";

const tyreServiceOptions = [
  {
    label: "TYRE REPLACEMENT",
    submenu: ["Front Tyres", "Rear Tyres", "All 4 Tyres"],
  },
  {
    label: "TYRE ROTATION",
    submenu: ["Cross Rotation", "Front-to-Back", "Back-to-Front"],
  },
  {
    label: "WHEEL ALIGNMENT",
    submenu: ["Front Wheel", "Rear Wheel", "All Wheels"],
  },
  {
    label: "TUBELESS TYRE REPAIR",
    submenu: ["Plug Method", "Patch Method"],
  },
  {
    label: "PUNCTURE REPAIR",
    submenu: ["Single Puncture", "Multiple Punctures"],
  },
  {
    label: "TYRE PRESSURE CHECK",
    submenu: ["Standard Check", "Nitrogen Pressure", "Manual Gauge"],
  },
];

const TyresServices = ({ onClose, onAddService }) => {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = tyreServiceOptions.filter(
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
        left: "83%",
        width: "240px",
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        overflow: "hidden",
        fontFamily: "Montserrat",
        zIndex: 1000,
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
            placeholder="Search TyresServices..."
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
        {(searchTerm ? filteredServices : tyreServiceOptions).map((item) => (
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

TyresServices.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAddService: PropTypes.func.isRequired,
};

export default TyresServices;
