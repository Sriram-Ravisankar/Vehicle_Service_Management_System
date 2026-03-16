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
import { ShoppingCart, Calendar, User, Hash, X, MapPin, FileText } from "lucide-react";
import apiEndpoints from "../../apiconfig";

const PurchaseViewModal = ({ open, onClose, data }) => {
    if (!data) return null;

    const grandTotal = Array.isArray(data.products)
        ? data.products.reduce((sum, p) => sum + Number(p.amount || 0), 0)
        : 0;

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
            
            {/* ── header ── */}
            <DialogTitle sx={{ p: 0 }}>
                <Box sx={{
                    background: "linear-gradient(135deg, #1E293B 0%, #334155 100%)",
                    px: 3, py: 2,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <FileText size={20} color="#fff" />
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>
                            {data.SupplierName ? `Purchase from ${data.SupplierName}` : "Purchase Details"}
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

            <DialogContent sx={{ p: 3 }}>
                {/* ── top info ── */}
                <Box sx={{ mb: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <div style={{ background: "#F1F5F9", padding: "6px 12px", borderRadius: 8,
                            display: "flex", alignItems: "center", gap: 6 }}>
                            <Hash size={14} style={{ color: "#334155" }} />
                            <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{data.PurchaseCode}</span>
                        </div>
                        <div style={{ background: "#F1F5F9", padding: "6px 12px", borderRadius: 8,
                            display: "flex", alignItems: "center", gap: 6 }}>
                            <Calendar size={14} style={{ color: "#64748B" }} />
                            <span style={{ fontSize: 13, color: "#475569" }}>{data.Date}</span>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F1F5F9",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <User size={20} style={{ color: "#3B82F6" }} />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>{data.SupplierName || "Unknown Supplier"}</p>
                            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748B" }}>{data.Email || "No Email Provided"}</p>
                        </div>
                    </div>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* ── products table ── */}
                <Box sx={{ mb: 3 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <ShoppingCart size={16} style={{ color: "#64748B" }} />
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>Order Items</span>
                    </div>
                    
                    <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
                        <Table size="small">
                            <TableHead sx={{ background: "#F8FAFC" }}>
                                <TableRow>
                                    <TableCell sx={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Item</TableCell>
                                    <TableCell align="center" sx={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Qty</TableCell>
                                    <TableCell align="right" sx={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Price</TableCell>
                                    <TableCell align="right" sx={{ fontSize: 11, fontWeight: 600, color: "#64748B", textTransform: "uppercase" }}>Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.isArray(data.products) && data.products.map((p, i) => (
                                    <TableRow key={i}>
                                        <TableCell sx={{ py: 1.5 }}>
                                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{p.product_name}</p>
                                            <p style={{ margin: 0, fontSize: 11, color: "#64748B" }}>{p.product_number}</p>
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontSize: 13, fontWeight: 500 }}>{p.quantity}</TableCell>
                                        <TableCell align="right" sx={{ fontSize: 13 }}>₹{Number(p.price).toLocaleString()}</TableCell>
                                        <TableCell align="right" sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                                            ₹{Number(p.amount).toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </Box>

                {/* ── summary ── */}
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ background: "#F8FAFC", padding: "12px 20px", borderRadius: 12, minWidth: 200, border: "1px solid #E2E8F0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, color: "#64748B", fontWeight: 500 }}>Grand Total</span>
                            <span style={{ fontSize: 18, fontWeight: 800, color: "#0F172A" }}>
                                ₹{grandTotal.toLocaleString()}
                            </span>
                        </div>
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
                    Close Details
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PurchaseViewModal;