import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Search, ChevronDown, Check } from "lucide-react";

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "-- Select --",
  disabled = false,
  width = "100%",
}) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState("");
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef            = useRef(null);
  const searchRef             = useRef(null);
  const dropRef               = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  const computePos = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    // Always open below; cap height to available viewport space (min 150px)
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    setDropPos({
      top:    rect.bottom + 4,
      left:   rect.left,
      width:  rect.width,
      maxH:   Math.max(150, Math.min(380, spaceBelow)),
    });
  };

  useEffect(() => {
    if (open) { computePos(); setTimeout(() => searchRef.current?.focus(), 0); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const update = () => computePos();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [open]);

  useEffect(() => {
    const handler = (e) => {
      const clickedTrigger = triggerRef.current?.contains(e.target);
      const clickedDrop    = dropRef.current?.contains(e.target);
      if (!clickedTrigger && !clickedDrop) {
        setOpen(false); setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = options.filter((o) => {
    const q = query.toLowerCase();
    return o.label?.toLowerCase().includes(q) || o.sub?.toLowerCase().includes(q);
  });

  const handleSelect = (val) => { onChange(val); setOpen(false); setQuery(""); };

  const triggerStyle = {
    width, boxSizing: "border-box", display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: 8, padding: "9px 12px", fontSize: 14,
    border: "1px solid #E5E7EB", borderRadius: 8,
    background: disabled ? "#F3F4F6" : "#F9FAFB",
    color: selected ? "#111827" : "#9CA3AF",
    cursor: disabled ? "not-allowed" : "pointer",
    outline: "none", transition: "border-color 0.15s, box-shadow 0.15s", userSelect: "none",
    ...(open && !disabled ? { borderColor: "#0EA5E9", boxShadow: "0 0 0 3px rgba(14,165,233,0.15)" } : {}),
  };

  const optionBase = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 14px", fontSize: 14, cursor: "pointer", transition: "background 0.1s",
  };

  const dropdownPanel = open && ReactDOM.createPortal(
    <div ref={dropRef} style={{
      position: "fixed",           // ← fixed to viewport, no scrollY math needed
      top: dropPos.top,
      left: dropPos.left,
      width: dropPos.width,
      zIndex: 99999,
      background: "#fff",
      border: "1px solid #E5E7EB",
      borderRadius: 12,
      boxShadow: "0 10px 30px rgba(0,0,0,0.14)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      maxHeight: dropPos.maxH ?? 380,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA" }}>
        <Search size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
        <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..."
          style={{ border: "none", outline: "none", background: "transparent", fontSize: 13, color: "#111827", width: "100%" }} />
        {query && (
          <button onMouseDown={(e) => { e.preventDefault(); setQuery(""); }}
            style={{ border: "none", background: "none", cursor: "pointer", color: "#9CA3AF", padding: 0, fontSize: 18, lineHeight: 1 }}>×</button>
        )}
      </div>

      <div style={{ overflowY: "auto", flex: 1 }}>
        {!query && (
          <div style={{ ...optionBase, color: "#9CA3AF" }} onClick={() => handleSelect("")}
            onMouseEnter={(e) => e.currentTarget.style.background = "#F9FAFB"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
            {placeholder}
          </div>
        )}
        {filtered.length === 0 ? (
          <div style={{ padding: "16px 14px", fontSize: 13, color: "#9CA3AF", textAlign: "center" }}>No results found</div>
        ) : (
          filtered.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <div key={opt.value}
                style={{ ...optionBase, background: isSelected ? "#EFF6FF" : "transparent", color: isSelected ? "#2563EB" : "#111827", fontWeight: isSelected ? 600 : 400 }}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "#F9FAFB"; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                <div>
                  <div>{opt.label}</div>
                  {opt.sub && <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{opt.sub}</div>}
                </div>
                {isSelected && <Check size={15} color="#2563EB" style={{ flexShrink: 0 }} />}
              </div>
            );
          })
        )}
      </div>
    </div>,
    document.body
  );

  return (
    <div ref={triggerRef} style={{ position: "relative", width }}>
      <div style={triggerStyle} onClick={() => { if (!disabled) setOpen((v) => !v); }} tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!disabled) setOpen((v) => !v); }
          if (e.key === "Escape") { setOpen(false); setQuery(""); }
        }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} color="#6B7280"
          style={{ flexShrink: 0, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} />
      </div>
      {dropdownPanel}
    </div>
  );
}
