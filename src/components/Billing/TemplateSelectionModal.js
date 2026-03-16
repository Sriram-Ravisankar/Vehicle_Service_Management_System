import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Card,
    CardContent,
    CardActionArea,
    Grid,
} from "@mui/material";
import { getInvoiceTemplatePreview } from "../../pages/billing/invoice/InvoicePrint";

export const previewInvoiceData = {
    invoiceNo: "INV-001",
    dateStr: "12/02/2026",
    customer: {
        name: "John Doe",
        address: "MG Road, Bengaluru",
        mobile: "9876543210",
    },
    vehicleNo: "KA-01-AB-1234",
    parts: [
        { name: "Engine Oil", qty: 1, price: 900, total: 900 },
        { name: "Air Filter", qty: 1, price: 350, total: 350 },
    ],
    labour: [{ name: "General Service", total: 500 }],
    partsTotal: 1250,
    labourTotal: 500,
    discountPercent: 0,
    discountAmount: 0,
    subtotal: 1250,
    gstPercent: 18,
    gstAmount: 225,
    grandTotal: 1975,
    company: {
        name: "Your Garage",
        address: "Industrial Area",
        city: "Bengaluru",
        state: "KA",
        pincode: "560001",
        email: "garage@email.com",
        phone: "9876543210",
    },
    logoUrl: null,
};


const templates = [
    {
        id: "standard",
        name: "Standard",
        description: "Classic layout, detailed items.",
        // image: "https://placehold.co/220x280/fff/333?text=Standard",
    },
    {
        id: "modern",
        name: "Modern",
        description: "Colorful header, sleek design.",
        // image: "https://placehold.co/220x280/2563eb/fff?text=Modern",
    },
    {
        id: "minimalist",
        name: "Minimalist",
        description: "Clean, whitespace-focused.",
        // image: "https://placehold.co/220x280/f3f4f6/000?text=Minimalist",
    },
    {
        id: "professional",
        name: "Professional",
        description: "Structured grid, corporate.",
        // image: "https://placehold.co/220x280/1e293b/fff?text=Professional",
    },
];

export default function TemplateSelectionModal({ open, onClose, onSelect }) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            sx={{
                zIndex: 9999,
                '@media (min-width: 1024px)': {
                    left: '256px',
                    width: 'calc(100% - 256px)',
                }
            }}
            PaperProps={{
                sx: {
                    m: { xs: 2, sm: 4 },
                    width: 'auto', // Allow auto width to fit content
                    maxWidth: '100%',
                    borderRadius: 2
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: "bold", textAlign: "center", fontSize: { xs: '1rem', sm: '1.2rem' }, p: 1, fontFamily: 'Montserrat, sans-serif' }}>
                Select Print Template
            </DialogTitle>
            <DialogContent sx={{ p: 2 }}>
                <Grid container spacing={2} justifyContent="center" padding={2}>
                    {templates.map((template) => (
                        <Grid item xs={12} sm={3} md={3} key={template.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Card
                                variant="outlined"
                                sx={{
                                    height: "100%",
                                    width: "100%",
                                    maxWidth: 220,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    // padding: 1,
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: 4,
                                        borderColor: "#8B5CF6",
                                    },
                                }}
                            >
                                <CardActionArea
                                    onClick={() => onSelect(template.id)}
                                    sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                                >
                                    <Box sx={{ height: 280, overflow: 'hidden', bgcolor: '#f5f5f5', position: 'relative' }}>
                                        <Box
                                            sx={{
                                                width: "100%",
                                                height: 280,
                                                overflow: "hidden",
                                                bgcolor: "#f4f4f4",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    transform: "scale(0.25)",
                                                    transformOrigin: "top left",
                                                    width: "400%",
                                                    height: "400%",
                                                }}
                                            >
                                                <iframe
                                                    title={template.name}
                                                    srcDoc={getInvoiceTemplatePreview(
                                                        template.id,
                                                        previewInvoiceData
                                                    )}
                                                    style={{
                                                        width: "100%",
                                                        height: "100%",
                                                        border: "none",
                                                        pointerEvents: "none",
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box sx={{ p: 1, textAlign: "center", flexGrow: 1 }}>
                                        <Typography variant="subtitle2" component="div" gutterBottom sx={{ fontWeight: 'bold', fontFamily: 'Montserrat, sans-serif' }}>
                                            {template.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.2, fontFamily: 'Montserrat, sans-serif' }}>
                                            {template.description}
                                        </Typography>
                                    </Box>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 1, justifyContent: "center" }}>
                <Button onClick={onClose} size="small" sx={{ fontFamily: 'Montserrat, sans-serif', color: "red", padding: "5px 20px", borderRadius: "5px", border: "1px solid red", ":hover": { bgcolor: "red", color: "white" } }}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
