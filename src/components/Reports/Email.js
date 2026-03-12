import React, { useEffect, useMemo, useState } from "react";

const SAMPLE_EMAILS = [
  {
    id: "e1",
    from: "Alice Johnson",
    email: "alice@example.com",
    subject: "Invoice for April",
    body: "Hi — attaching the April invoice. Let me know if you have questions.",
    date: "2024-09-10",
    read: false,
  },
  {
    id: "e2",
    from: "Service Desk",
    email: "support@service.com",
    subject: "Your ticket #452 has been updated",
    body: "We updated the ticket with new diagnostic logs. Please review.",
    date: "2024-09-08",
    read: true,
  },
  {
    id: "e3",
    from: "Bob Lee",
    email: "bob.lee@example.com",
    subject: "Project kickoff notes",
    body: "Thanks for joining the meeting. Please find the notes and next steps here.",
    date: "2024-09-05",
    read: false,
  },
  {
    id: "e4",
    from: "Vendor X",
    email: "sales@vendorx.com",
    subject: "New pricing proposals",
    body: "We have updated our pricing tiers. See details below and let us know.",
    date: "2024-08-28",
    read: true,
  },
];

const uid = () => `id_${Math.random().toString(36).slice(2, 9)}`;

export default function EmailsTab() {
  // emails state
  const [emails, setEmails] = useState(() => SAMPLE_EMAILS);
  // UI state
  const [selectedId, setSelectedId] = useState(emails[0]?.id || null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL | UNREAD | READ
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  // Compose form state
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");

  // Update isMobile on resize
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Derived: filtered list based on search & filter
  const visibleEmails = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return emails
      .filter((e) => {
        if (filter === "UNREAD") return !e.read;
        if (filter === "READ") return e.read;
        return true;
      })
      .filter((e) => {
        if (!q) return true;
        return (
          e.subject.toLowerCase().includes(q) ||
          e.from.toLowerCase().includes(q) ||
          e.body.toLowerCase().includes(q) ||
          (e.email && e.email.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [emails, query, filter]);

  // select first visible when list changes (desktop only)
  useEffect(() => {
    if (!isMobile && visibleEmails.length > 0) {
      // keep previous selection if still visible, else pick first
      const stillVisible = visibleEmails.find((e) => e.id === selectedId);
      setSelectedId(stillVisible ? selectedId : visibleEmails[0].id);
    }
    // on mobile we keep selection null until user taps
    if (isMobile) setSelectedId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleEmails, isMobile]);

  /* ---------------------------
     Actions
     --------------------------- */

  // open an email (mark read)
  const openEmail = (id) => {
    setSelectedId(id);
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, read: true } : e))
    );
  };

  // toggle read/unread
  const toggleRead = (id) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, read: !e.read } : e))
    );
  };

  // delete
  const deleteEmail = (id) => {
    setEmails((prev) => prev.filter((e) => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // simple compose (adds to top of list)
  const sendCompose = () => {
    if (!composeTo.trim() || !composeSubject.trim()) {
      alert("Please fill To and Subject (demo).");
      return;
    }
    const newEmail = {
      id: uid(),
      from: "You",
      email: composeTo,
      subject: composeSubject,
      body: composeBody,
      date: new Date().toISOString().slice(0, 10),
      read: true,
    };
    setEmails((prev) => [newEmail, ...prev]);
    // reset compose
    setComposeTo("");
    setComposeSubject("");
    setComposeBody("");
    setIsComposeOpen(false);
    // select new email on desktop
    if (!isMobile) setSelectedId(newEmail.id);
  };

  const styles = {
    page: {
      maxWidth: 1200,
      margin: "0 auto",
      boxSizing: "border-box",
      fontFamily: "Montserrat",
      color: "#0f172a",
      minHeight: "100vh",
    },
    headerRow: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      alignItems: isMobile ? "stretch" : "center",
      gap: isMobile ? "16px" : "12px",
      marginBottom: isMobile ? "16px" : "12px",
    },
    title: {
      fontSize: isMobile ? "18px" : "20px",
      fontWeight: 800,
      margin: 0,
      textAlign: isMobile ? "center" : "left",
    },
    actionsRow: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: "8px",
      alignItems: "stretch",
      width: isMobile ? "100%" : "auto",
    },

    searchInput: {
      padding: isMobile ? "12px 10px" : "10px 12px",
      borderRadius: "10px",
      border: "1px solid #e6eef8",
      width: "100%",
      boxSizing: "border-box",
      fontSize: isMobile ? "16px" : "14px", // Prevent zoom on iOS
    },
    filterSelect: {
      padding: isMobile ? "12px 10px" : "8px 10px",
      borderRadius: "10px",
      border: "1px solid #e6eef8",
      background: "#fff",
      cursor: "pointer",
      width: isMobile ? "100%" : "auto",
      fontSize: isMobile ? "16px" : "14px",
    },
    composeBtn: {
      padding: isMobile ? "14px 16px" : "10px 14px",
      borderRadius: "10px",
      border: "none",
      background: "linear-gradient(135deg,#10AADF,#0d8abc)",
      color: "#fff",
      fontWeight: 700,
      cursor: "pointer",
      fontSize: isMobile ? "16px" : "14px",
      width: isMobile ? "100%" : "auto",
    },

    mainRow: {
      display: "flex",
      gap: "16px",
      alignItems: "stretch",
      flexDirection: isMobile ? "column" : "row",
      height: isMobile ? "auto" : "calc(100vh - 180px)",
    },
    listCol: {
      flex: isMobile ? "unset" : "0 0 420px",
      minWidth: isMobile ? "auto" : 320,
      maxHeight: isMobile ? "400px" : "100%",
      overflowY: "auto",
      borderRadius: "12px",
      border: "1px solid rgba(0,0,0,0.04)",
      background: "#fff",
      boxShadow: "0 8px 24px rgba(2,6,23,0.04)",
    },
    detailCol: {
      flex: 1,
      minHeight: isMobile ? "300px" : "280px",
      borderRadius: "12px",
      border: "1px solid rgba(0,0,0,0.04)",
      background: "#fff",
      boxShadow: "0 8px 24px rgba(2,6,23,0.04)",
      padding: isMobile ? "12px" : "16px",
      boxSizing: "border-box",
    },

    // List item (desktop)
    listInner: {
      padding: isMobile ? "4px" : "8px",
    },
    listItem: (isSelected, read) => ({
      display: "flex",
      gap: "10px",
      alignItems: "flex-start",
      padding: isMobile ? "10px" : "12px",
      borderRadius: "10px",
      cursor: "pointer",
      background: isSelected
        ? "linear-gradient(180deg, rgba(16,170,223,0.04), rgba(16,170,223,0.02))"
        : "transparent",
      border: isSelected
        ? "1px solid rgba(16,170,223,0.12)"
        : "1px solid transparent",
      boxSizing: "border-box",
      marginBottom: isMobile ? "8px" : "0",
    }),
    avatar: {
      width: isMobile ? "36px" : "44px",
      height: isMobile ? "36px" : "44px",
      borderRadius: "10px",
      background: "linear-gradient(135deg,#667eea,#764ba2)",
      color: "#fff",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: isMobile ? "12px" : "14px",
      flexShrink: 0,
    },
    fromColumn: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      flex: 1,
      minWidth: 0, // Allow text truncation
    },
    subjRow: {
      display: "flex",
      justifyContent: "space-between",
      gap: "8px",
      alignItems: "flex-start",
    },
    subjText: (read) => ({
      fontWeight: read ? 600 : 800,
      color: "#0f172a",
      fontSize: isMobile ? "13px" : "14px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      flex: 1,
    }),
    snippet: {
      fontSize: isMobile ? "12px" : "13px",
      color: "#6b7280",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },

    // Mobile card (same visuals but block)
    cardList: {
      display: "grid",
      gap: "12px",
      padding: "12px",
    },
    card: {
      borderRadius: "12px",
      padding: "12px",
      border: "1px solid #e6eef8",
      background: "#f8fafc",
      boxShadow: "0 6px 18px rgba(2,6,23,0.03)",
    },

    // Detail header
    detailHeader: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      justifyContent: "space-between",
      alignItems: isMobile ? "stretch" : "center",
      gap: "12px",
      marginBottom: "12px",
    },
    detailTitle: {
      fontSize: isMobile ? "16px" : "18px",
      fontWeight: 800,
      margin: 0,
      wordBreak: "break-word",
    },
    detailMeta: {
      fontSize: isMobile ? "12px" : "13px",
      color: "#6b7280",
      marginBottom: "12px",
      lineHeight: 1.4,
    },

    // Detail body
    detailBody: {
      whiteSpace: "pre-wrap",
      lineHeight: 1.6,
      color: "#111827",
      fontSize: isMobile ? "14px" : "inherit",
    },

    // Button styles
    tinyBtn: {
      padding: isMobile ? "10px 12px" : "8px 10px",
      borderRadius: "8px",
      border: "1px solid #e6eef8",
      background: "#fff",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: isMobile ? "14px" : "12px",
      flex: isMobile ? 1 : "none",
    },
    buttonGroup: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
      marginTop: isMobile ? "12px" : "8px",
    },

    // Compose modal
    modalOverlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: isMobile ? "flex-end" : "center",
      justifyContent: "center",
      zIndex: 4000,
      padding: isMobile ? "0" : "20px",
    },
    modalCard: {
      width: isMobile ? "100%" : "720px",
      maxWidth: isMobile ? "100%" : "90vw",
      height: isMobile ? "90vh" : "auto",
      maxHeight: isMobile ? "90vh" : "80vh",
      borderRadius: isMobile ? "12px 12px 0 0" : "12px",
      background: "#fff",
      padding: isMobile ? "16px" : "20px",
      boxSizing: "border-box",
      boxShadow: "0 22px 60px rgba(2,6,23,0.3)",
      display: "flex",
      flexDirection: "column",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
      paddingBottom: "12px",
      borderBottom: "1px solid #e6eef8",
    },
    modalContent: {
      flex: 1,
      overflowY: "auto",
    },
    inputFull: {
      width: "100%",
      padding: isMobile ? "12px 10px" : "10px 12px",
      borderRadius: "8px",
      border: "1px solid #e6eef8",
      marginBottom: "12px",
      boxSizing: "border-box",
      fontSize: isMobile ? "16px" : "14px",
    },
    modalActions: {
      display: "flex",
      gap: "8px",
      justifyContent: "flex-end",
      paddingTop: "16px",
      borderTop: "1px solid #e6eef8",
      marginTop: "auto",
    },
  };

  const initials = (name) =>
    (name || "")
      .split(/\s+/)
      .map((s) => s[0]?.toUpperCase())
      .slice(0, 2)
      .join("");

  // currently selected email object
  const selectedEmail = emails.find((e) => e.id === selectedId) || null;

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>Emails</h2>
        </div>

        <div style={styles.actionsRow}>
          <input
            aria-label="Search emails"
            placeholder="Search subject, sender or body..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={styles.searchInput}
          />

          <select
            aria-label="Filter emails"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
            title="Filter"
          >
            <option value="ALL">All</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>

          <button
            style={styles.composeBtn}
            onClick={() => setIsComposeOpen(true)}
          >
            Compose
          </button>
        </div>
      </div>

      {/* Main area */}
      <div style={styles.mainRow}>
        {/* Left: list - hidden on mobile when viewing detail */}
        {(!isMobile || !selectedId) && (
          <div style={styles.listCol}>
            <div style={styles.listInner}>
              {visibleEmails.length === 0 && (
                <div
                  style={{
                    padding: "20px",
                    color: "#6b7280",
                    textAlign: "center",
                  }}
                >
                  No emails match your search.
                </div>
              )}

              {/* Desktop list or mobile cards */}
              {isMobile ? (
                <div style={styles.cardList}>
                  {visibleEmails.map((e) => (
                    <div key={e.id} style={styles.card}>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "flex-start",
                        }}
                      >
                        <div style={styles.avatar}>{initials(e.from)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={styles.subjRow}>
                            <div style={styles.subjText(e.read)}>
                              {e.subject}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                flexShrink: 0,
                              }}
                            >
                              {e.date}
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginTop: "4px",
                            }}
                          >
                            {e.from} — {e.email}
                          </div>
                          <div style={styles.buttonGroup}>
                            <button
                              onClick={() => openEmail(e.id)}
                              style={styles.tinyBtn}
                            >
                              Open
                            </button>
                            <button
                              onClick={() => toggleRead(e.id)}
                              style={styles.tinyBtn}
                            >
                              {e.read ? "Unread" : "Read"}
                            </button>
                            <button
                              onClick={() => deleteEmail(e.id)}
                              style={{
                                ...styles.tinyBtn,
                                borderColor: "#FCA5A5",
                                color: "#B91C1C",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Desktop list: compact rows
                visibleEmails.map((e) => {
                  const isSelected = selectedId === e.id;
                  return (
                    <div
                      key={e.id}
                      onClick={() => openEmail(e.id)}
                      style={styles.listItem(isSelected, e.read)}
                      title={`${e.subject} — ${e.from}`}
                    >
                      <div style={styles.avatar}>{initials(e.from)}</div>

                      <div style={styles.fromColumn}>
                        <div style={styles.subjRow}>
                          <div style={styles.subjText(e.read)}>{e.subject}</div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              flexShrink: 0,
                            }}
                          >
                            {e.date}
                          </div>
                        </div>

                        <div style={styles.snippet}>
                          {e.from} — {e.body.slice(0, 80)}
                          {e.body.length > 80 ? "…" : ""}
                        </div>

                        <div style={styles.buttonGroup}>
                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              toggleRead(e.id);
                            }}
                            style={styles.tinyBtn}
                          >
                            {e.read ? "Mark Unread" : "Mark Read"}
                          </button>

                          <button
                            onClick={(ev) => {
                              ev.stopPropagation();
                              deleteEmail(e.id);
                            }}
                            style={{
                              ...styles.tinyBtn,
                              borderColor: "#FCA5A5",
                              color: "#B91C1C",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Right: detail (hidden on mobile unless selected) */}
        {(!isMobile || selectedId) && (
          <div style={styles.detailCol}>
            {selectedEmail ? (
              <>
                <div style={styles.detailHeader}>
                  <div style={{ flex: 1 }}>
                    <h3 style={styles.detailTitle}>{selectedEmail.subject}</h3>
                    <div style={styles.detailMeta}>
                      From: {selectedEmail.from} &lt;{selectedEmail.email}&gt; •{" "}
                      {selectedEmail.date}
                    </div>
                  </div>
                  <div style={styles.buttonGroup}>
                    <button
                      onClick={() => toggleRead(selectedEmail.id)}
                      style={styles.tinyBtn}
                    >
                      {selectedEmail.read ? "Mark Unread" : "Mark Read"}
                    </button>
                    <button
                      onClick={() => deleteEmail(selectedEmail.id)}
                      style={{
                        ...styles.tinyBtn,
                        borderColor: "#FCA5A5",
                        color: "#B91C1C",
                      }}
                    >
                      Delete
                    </button>
                    {isMobile && (
                      <button
                        onClick={() => setSelectedId(null)}
                        style={styles.tinyBtn}
                      >
                        Back
                      </button>
                    )}
                  </div>
                </div>

                <div style={styles.detailBody}>{selectedEmail.body}</div>
              </>
            ) : (
              <div
                style={{
                  color: "#6b7280",
                  textAlign: "center",
                  padding: "40px 20px",
                }}
              >
                {isMobile
                  ? "Tap an email to view details"
                  : "Select an email to view details"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compose modal */}
      {isComposeOpen && (
        <div
          style={styles.modalOverlay}
          onClick={() => setIsComposeOpen(false)}
        >
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>
                Compose Email
              </h3>
              <button
                onClick={() => setIsComposeOpen(false)}
                style={{
                  ...styles.tinyBtn,
                  fontSize: "18px",
                  padding: "8px 12px",
                }}
              >
                ×
              </button>
            </div>

            <div style={styles.modalContent}>
              <input
                placeholder="To (email)"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                style={styles.inputFull}
              />
              <input
                placeholder="Subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                style={styles.inputFull}
              />
              <textarea
                placeholder="Message body..."
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                rows={isMobile ? 6 : 8}
                style={{ ...styles.inputFull, resize: "vertical" }}
              />
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setIsComposeOpen(false)}
                style={styles.tinyBtn}
              >
                Cancel
              </button>
              <button onClick={sendCompose} style={styles.composeBtn}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
