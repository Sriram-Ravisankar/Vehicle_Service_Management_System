import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Box,
    Button,
    Grid,
    Divider,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@mui/material";

const StockViewModal = ({ open, onClose, data }) => {
    if (!data) return null;

    // 🔢 Calculate Grand Total
    const grandTotal = Array.isArray(data.Products)
        ? data.Products.reduce((sum, p) => sum + (p.Quantity * p.Price), 0)
        : 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography variant="h6">Garage Management System</Typography>
            </DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={30}>
                    <Grid item xs={6}>
                        <img src={data.Image || "/placeholder.png"} alt="preview" width={80} />
                    </Grid>
                    <Grid item xs={6}>
                        <Typography><strong>Purchase Number:</strong> {data.PurchaseCode}</Typography>
                        <Typography><strong>Date:</strong> {data.Date}</Typography>
                        <Typography><strong>Name:</strong> {data.SupplierName}</Typography>
                        <Typography><strong>Email:</strong> {data.Email}</Typography>
                    </Grid>
                </Grid>

                <Box sx={{ my: 2 }} />

                <Typography variant="h6">Other Information</Typography>
                <Typography>
                    <strong>Billing Address:</strong> {data.BillingAddress || "N/A"}
                </Typography>

                <Divider sx={{ my: 2 }} />


                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Qty</TableCell>
                            <TableCell>Price ($)</TableCell>
                            <TableCell>Total ($)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Array.isArray(data.Products) && data.Products.map((product, index) => (
                            <TableRow key={index}>
                                <TableCell>{product.ProductName}</TableCell>
                                <TableCell>{product.Quantity}</TableCell>
                                <TableCell>{product.Price}</TableCell>
                                <TableCell>{(product.Quantity * product.Price).toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Box textAlign="right" mt={2}>
                    <Typography sx={{ bgcolor: "#10AADF", color: "#fff", px: 2, py: 1, display: "inline-block", borderRadius: 1 }}>
                        <strong>Grand Total ($): {grandTotal.toFixed(2)}</strong>
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button variant="contained" onClick={onClose} sx={{ bgcolor: "#f26522", "&:hover": { bgcolor: "#e55300" } }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StockViewModal;