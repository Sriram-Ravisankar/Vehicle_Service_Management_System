import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Divider,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@mui/material";
import { FileText, Calendar, User, Hash, X, Car, CreditCard, ShoppingBag, Wrench } from "lucide-react";

/**
 * Modern Invoice View Modal following the UI/UX style of products/purchases
 */
const InvoiceViewModal = ({ open, onClose, data }) => {
    if (!data) return null;

    // Support both direct data and wrapped data if applicable
    const invoice = Array.isArray(data) ? data[0] : data;
    const items = invoice.items || [];
    const totals = invoice.totals || {};
    const status = invoice.status || "Completed";

    const totalsStyle = {
        background: "#F8FAFC",
        padding: "16px",
        borderRadius: 12,
        border: "1px solid #E2E8F0",
        minWidth: 240
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="sm" 
            fullWidth
            PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" } }}
            slotProps={{
                backdrop: {
                    sx: {
                        background: "rgba(0, 0, 0, 0.3)",
                        backdropFilter: "blur(8px)",
                    }
                }
            }}
        >
            
            {/* ── HEADER ── */}
            <DialogTitle sx={{ p: 0 }}>
                <Box sx={{
                    background: "linear-gradient(135deg, #1E293B 0%, #334155 100%)",
                    px: 3, py: 2,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <FileText size={20} color="#fff" />
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                            Invoice #{invoice.invoice_no || invoice.invoiceNumber}
                        </span>
                    </Box>
                    <button onClick={onClose}
                        style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 8,
                            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: "#fff" }}>
                        <X size={16} />
                    </button>
                </Box>
            </DialogTitle>

            <DialogContent 
                sx={{ 
                    p: 3,
                    "&::-webkit-scrollbar": { display: "none" },
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                }}
            >
                {/* ── TOP INFO (Customer & Vehicle) ── */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mb: 3 }}>
                    
                    {/* Identification Chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ background: "#F1F5F9", padding: "6px 12px", borderRadius: 8,
                            display: "flex", alignItems: "center", gap: 6 }}>
                            <Calendar size={14} style={{ color: "#64748B" }} />
                            <span style={{ fontSize: 13, color: "#475569" }}>
                                {invoice.created_on?.split(" ")[0] || invoice.invoiceDate}
                            </span>
                        </div>
                        {invoice.payment_method && (
                            <div style={{ background: "#F0FDF4", padding: "6px 12px", borderRadius: 8,
                                display: "flex", alignItems: "center", gap: 6, border: "1px solid #DCFCE7" }}>
                                <CreditCard size={14} style={{ color: "#16A34A" }} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#16A34A" }}>{invoice.payment_method}</span>
                            </div>
                        )}
                        <div style={{ 
                            background: (status === "Paid" || status === "Completed") ? "#F0FDF4" : "#FFF7ED", 
                            padding: "6px 12px", borderRadius: 8,
                            display: "flex", alignItems: "center", gap: 6,
                            border: `1px solid ${(status === "Paid" || status === "Completed") ? "#DCFCE7" : "#FFEDD5"}`
                        }}>
                            <span style={{ 
                                fontSize: 12, fontWeight: 700, 
                                color: (status === "Paid" || status === "Completed") ? "#16A34A" : "#EA580C"
                            }}>
                                {String(status).toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Customer Row */}
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EFF6FF",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <User size={20} style={{ color: "#3B82F6" }} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>
                                {invoice.customer_name || invoice.customerName}
                            </p>
                            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>
                                {invoice.customer_mobile || "No Contact Details"}
                            </p>
                        </div>
                    </div>

                    {/* Vehicle Row (If present) */}
                    {(invoice.vehicle_number || invoice.numberPlate) && (
                        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F5F3FF",
                                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Car size={20} style={{ color: "#8B5CF6" }} />
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>
                                    {invoice.vehicle_number || invoice.numberPlate}
                                </p>
                                <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 600, color: "#8B5CF6", textTransform: "uppercase" }}>
                                    Vehicle Registered
                                </p>
                            </div>
                        </div>
                    )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* ── ITEMS LIST ── */}
                <Box sx={{ mb: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <ShoppingBag size={16} style={{ color: "#64748B" }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>Service & Parts Details</span>
                    </div>
                    
                    <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
                        <Table size="small">
                            <TableHead sx={{ background: "#F8FAFC" }}>
                                <TableRow>
                                    <TableCell sx={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Item / Description</TableCell>
                                    <TableCell align="center" sx={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Qty</TableCell>
                                    <TableCell align="right" sx={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {items.length > 0 ? items.map((item, i) => (
                                    <TableRow key={i}>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                {item.category === "Service" ? <Wrench size={14} color="#8B5CF6" /> : <ShoppingBag size={14} color="#3B82F6" />}
                                                <div>
                                                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.name}</p>
                                                    <p style={{ margin: 0, fontSize: 11, color: "#64748B" }}>{item.category}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontSize: 13, fontWeight: 500 }}>{item.qty || 1}</TableCell>
                                        <TableCell align="right" sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                                            ₹{Number(item.total).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center" sx={{ py: 4, color: "#94A3B8", fontStyle: "italic" }}>
                                            No items listed in this invoice
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Box>

                {/* ── TOTALS SUMMARY ── */}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={totalsStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontSize: 13, color: "#64748B" }}>Subtotal</span>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>₹{Number(totals.subtotal || 0).toLocaleString()}</span>
                        </div>
                        {totals.discountPercent > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: "#64748B" }}>Discount ({totals.discountPercent}%)</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#EF4444" }}>-₹{Number((totals.subtotal * totals.discountPercent) / 100).toLocaleString()}</span>
                            </div>
                        )}
                        {totals.gstPercent > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                <span style={{ fontSize: 13, color: "#64748B" }}>GST ({totals.gstPercent}%)</span>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>+₹{Number((totals.subtotal * totals.gstPercent) / 100).toLocaleString()}</span>
                            </div>
                        )}
                        <Divider sx={{ my: 1.5 }} />
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 700 }}>Grand Total</span>
                            <span style={{ fontSize: 20, fontWeight: 900, color: "#8B5CF6" }}>
                                ₹{Number(totals.grandTotal || invoice.totalAmount || 0).toLocaleString()}
                            </span>
                        </div>
                        {invoice.paid_amount > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                                <span style={{ fontSize: 12, color: "#16A34A", fontWeight: 600 }}>Paid Amount</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#16A34A" }}>₹{Number(invoice.paid_amount).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button fullWidth variant="contained" onClick={onClose}
                    sx={{
                        background: "#EF4444",
                        "&:hover": { background: "#DC2626" },
                        borderRadius: "10px", textTransform: "none", fontWeight: 700, px: 3, py: 1.2
                    }}>
                    Close Preview
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InvoiceViewModal;
