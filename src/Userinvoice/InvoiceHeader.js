import React, { useState } from "react";
import {
  FaBoxOpen,
  FaTools,
  FaCarSide,
  FaSyncAlt,
  FaBath,
  FaClipboardList,
  FaTachometerAlt,
} from "react-icons/fa";
import PackageDropdown from "./PackageDropdown";
import AllServices from "./AllServices";
import WheelAlignment from "./WheelAlignment";
import WashDetailing from "./WashDetailing";
import PMSCheckups from "./PMSCheckups";
import TyresServices from "./TyresServices";
import WheelBalancing from "./WheelBalancing";

const InvoiceHeader = ({ onServiceSelect }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleCategoryClick = (label) => {
    setActiveDropdown((prev) => (prev === label ? null : label));
  };

  const serviceCategories = [
    { label: "Packages", icon: <FaBoxOpen size={30} /> },
    { label: "All Services", icon: <FaTools size={30} /> },
    { label: "Wheel Alignment", icon: <FaCarSide size={30} /> },
    { label: "Wheel Balancing", icon: <FaSyncAlt size={30} /> },
    { label: "Wash & Detailing Services", icon: <FaBath size={30} /> },
    { label: "PMS & Check-Ups", icon: <FaClipboardList size={30} /> },
    { label: "Tyres & Services", icon: <FaTachometerAlt size={30} /> },
  ];

  return (
    <div
      style={{
        fontFamily: "Montserrat",
        backgroundColor: "#F4F4F4",
        position: "relative",
      }}
    >
      {/* Top Info Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          backgroundColor: "#fff",
          padding: "10px 20px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <div>
          <h4 style={{ margin: 0 }}>4567HJI / JC: INT-J001471</h4>
          <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
            Examination &gt; Proforma Invoice &gt; Invoice
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            gap: "20px",
          }}
        >
          <div>
            <strong>JOB CARD</strong>
          </div>
          <div>
            <strong>DETAILS</strong> ▼
          </div>
          <div>
            Bill No: <strong style={{ color: "#007BFF" }}>INT-P01027</strong>
          </div>
          <div>
            Bill Date: <strong>May 12 2022</strong>
          </div>
        </div>
      </div>

      {/* Service Categories */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          backgroundColor: "#fff",
          padding: "20px 0",
          borderBottom: "1px solid #ddd",
        }}
      >
        {serviceCategories.map((category, index) => (
          <div
            key={index}
            style={{
              textAlign: "center",
              cursor: "pointer",
              color: "#333",
              transition: "color 0.3s ease",
            }}
            onClick={() => handleCategoryClick(category.label)}
          >
            {category.icon}
            <div
              style={{
                marginTop: "5px",
                fontSize: "14px",
                color: "#007BFF",
                fontWeight: "500",
              }}
            >
              {category.label}
            </div>
          </div>
        ))}
      </div>

      {/* Dropdown Rendering Based on Selection */}
      {activeDropdown === "Packages" && (
        <PackageDropdown
          onClose={() => setActiveDropdown(null)}
          onAddService={onServiceSelect}
        />
      )}
      {activeDropdown === "All Services" && (
        <AllServices
          onClose={() => setActiveDropdown(null)}
          onAddService={onServiceSelect}
        />
      )}
      {activeDropdown === "Wheel Alignment" && (
        <WheelAlignment
          onClose={() => setActiveDropdown(null)}
          onAddService={onServiceSelect}
        />
      )}

      {activeDropdown === "Wash & Detailing Services" && (
        <WashDetailing
          onClose={() => setActiveDropdown(null)}
          onAddService={onServiceSelect}
        />
      )}
      {activeDropdown === "PMS & Check-Ups" && (
        <PMSCheckups
          onClose={() => setActiveDropdown(null)}
          onAddService={onServiceSelect}
        />
      )}
      {activeDropdown === "Tyres & Services" && (
        <TyresServices
          onClose={() => setActiveDropdown(null)}
          onAddService={onServiceSelect}
        />
      )}
      {activeDropdown === "Wheel Balancing" && (
        <WheelBalancing
          onClose={() => setActiveDropdown(null)}
          onAddService={onServiceSelect}
        />
      )}
    </div>
  );
};

export default InvoiceHeader;
