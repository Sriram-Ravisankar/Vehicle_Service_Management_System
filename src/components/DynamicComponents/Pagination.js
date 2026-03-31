import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Shared Pagination component — consistent across all inventory pages.
 *
 * Props:
 *  currentPage      – 1-based current page number
 *  totalPages       – total number of pages
 *  totalItems       – total filtered item count
 *  itemsPerPage     – currently active items-per-page value
 *  onPageChange     – callback(newPage: number)
 *  onPerPageChange  – callback(newPerPage: number)  — triggers page reset to 1
 *  pageSizeOptions  – array of numbers, default [5, 10, 15, 25, 50]
 *  itemLabel        – singular noun, e.g. "product" (default "item")
 */
const Pagination = ({
  currentPage,
  totalPages,
  totalItems = 0,
  itemsPerPage = 15,
  onPageChange,
  onPerPageChange,
  pageSizeOptions = [5, 10, 15, 25, 50],
  itemLabel = "item",
}) => {
  if (totalItems === 0) return null;

  const from = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const to   = Math.min(currentPage * itemsPerPage, totalItems);

  // Smart page number array with ellipsis
  const buildPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (let p = Math.max(2, currentPage - 1); p <= Math.min(totalPages - 1, currentPage + 1); p++) {
      pages.push(p);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  // ── Shared button styles ──────────────────────────────────────────────────
  const btnBase = {
    minWidth: 36, height: 36,
    borderRadius: 8, border: "1px solid #E2E8F0",
    fontSize: 13, fontWeight: 500, cursor: "pointer",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "0 6px", transition: "all 0.15s ease", lineHeight: 1,
    userSelect: "none",
  };
  const btnActive   = { ...btnBase, background: "#0EA5E9", color: "#fff", border: "1px solid #0EA5E9", fontWeight: 700 };
  const btnInactive = { ...btnBase, background: "#fff", color: "#374151" };
  const btnDisabled = { ...btnBase, background: "#F9FAFB", color: "#D1D5DB", cursor: "not-allowed", border: "1px solid #F3F4F6" };

  const handleHoverIn  = (e) => { e.currentTarget.style.background = "#F0F9FF"; e.currentTarget.style.borderColor = "#0EA5E9"; e.currentTarget.style.color = "#0EA5E9"; };
  const handleHoverOut = (e) => { e.currentTarget.style.background = "#fff";    e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#374151"; };
  const handleNavHoverIn  = (e) => { e.currentTarget.style.background = "#F1F5F9"; e.currentTarget.style.borderColor = "#CBD5E1"; };
  const handleNavHoverOut = (e) => { e.currentTarget.style.background = "#fff";    e.currentTarget.style.borderColor = "#E2E8F0"; };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 20,
      padding: "14px 0 4px",
      borderTop: "1px solid #F1F5F9",
    }}>

      {/* ── Left: info + rows-per-page selector ─────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {/* Range label */}
        <p style={{ margin: 0, fontSize: 13, color: "#64748B", whiteSpace: "nowrap" }}>
          Showing{" "}
          <strong style={{ color: "#0F172A" }}>{from}–{to}</strong>
          {" "}of{" "}
          <strong style={{ color: "#0F172A" }}>{totalItems}</strong>
          {" "}{itemLabel}{totalItems !== 1 ? "s" : ""}
        </p>

        {/* Rows per page */}
        {onPerPageChange && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#64748B", whiteSpace: "nowrap" }}>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { onPerPageChange(Number(e.target.value)); }}
              style={{
                height: 34,
                padding: "0 28px 0 10px",
                border: "1px solid #E2E8F0",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "#374151",
                background: "#fff",
                cursor: "pointer",
                outline: "none",
                appearance: "none",
                WebkitAppearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
                transition: "border-color 0.15s",
              }}
              onFocus={(e)  => { e.target.style.borderColor = "#0EA5E9"; e.target.style.boxShadow = "0 0 0 3px rgba(14,165,233,0.12)"; }}
              onBlur={(e)   => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Right: page navigation (only shown when >1 page) ─────────────── */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {/* Prev */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={currentPage === 1 ? btnDisabled : btnInactive}
            onMouseEnter={(e) => { if (currentPage !== 1) handleNavHoverIn(e);  }}
            onMouseLeave={(e) => { if (currentPage !== 1) handleNavHoverOut(e); }}
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>

          {/* Page numbers */}
          {buildPages().map((p, idx) =>
            p === "…" ? (
              <span key={`e${idx}`} style={{ padding: "0 4px", color: "#9CA3AF", fontSize: 13, userSelect: "none" }}>…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                style={p === currentPage ? btnActive : btnInactive}
                onMouseEnter={(e) => { if (p !== currentPage) handleHoverIn(e);  }}
                onMouseLeave={(e) => { if (p !== currentPage) handleHoverOut(e); }}
                aria-label={`Go to page ${p}`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}

          {/* Next */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={currentPage === totalPages ? btnDisabled : btnInactive}
            onMouseEnter={(e) => { if (currentPage !== totalPages) handleNavHoverIn(e);  }}
            onMouseLeave={(e) => { if (currentPage !== totalPages) handleNavHoverOut(e); }}
            aria-label="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;