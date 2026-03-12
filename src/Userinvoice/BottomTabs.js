import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Slide,
  Fade,
  Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import EmailIcon from "@mui/icons-material/Email";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
// import CloseIcon from "@mui/icons-material/Close";
import InvoicePanel from "./Invoicepanel";
import { jsPDF } from "jspdf";

const tabLabels = [
  "Remarks",
  "Collections",
  "Service Suggestions",
  "Cancelled Invoices",
  "Reminder",
];

const BottomTabs = ({ collections = [], onCollectionsUpdate, invoiceData = [] }) => {
  const [partsAnchorEl, setPartsAnchorEl] = useState(null);
  const [printAnchorEl, setPrintAnchorEl] = useState(null);
  const [emailAnchorEl, setEmailAnchorEl] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);

  // Handlers for parts menu
  const handlePartsClick = (event) => setPartsAnchorEl(event.currentTarget);
  const handlePartsClose = () => setPartsAnchorEl(null);

  const handlePrintClick = (event) => {
    event.stopPropagation();
    setPrintAnchorEl(event.currentTarget);
  };
  
  const handlePrintClose = () => setPrintAnchorEl(null);
  
  const handlePrintOptionSelect = (option) => {
    if (option === "Customer Invoice") {
      downloadCustomerInvoice();
    } else if (option === "Gatepass") {
      downloadGatepass();
    }
    handlePrintClose();
  };

  
  // Email functionality
  const handleEmailClick = (event) => setEmailAnchorEl(event.currentTarget);
  const handleEmailClose = () => setEmailAnchorEl(null);
  const handleEmailOptionSelect = () => handleEmailClose();

  // Panel controls
  const handlePanelOpen = () => {
    setPanelOpen(true);
  };
  
  const handlePanelClose = () => {
    setPanelOpen(false);
  };

  // Prevent scrolling when panel is open
  useEffect(() => {
    document.body.style.overflow = panelOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [panelOpen]);

  const downloadCustomerInvoice = () => {
    if (!invoiceData || invoiceData.length === 0) {
      alert("Please add items to the invoice first");
      return;
    }
  
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let yPos = 20; // Start position
    
    // Set document properties
    doc.setProperties({
      title: `Invoice ${collections[0]?.invoiceNo || ''}`,
      subject: 'Customer Invoice',
      author: 'Your Company Name'
    });
  
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("CUSTOMER INVOICE", 105, yPos, { align: 'center' });
    yPos += 15;
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Your Company Name", 105, yPos, { align: 'center' });
    yPos += 5;
    doc.text("Address Line 1 | Address Line 2 | Phone: +123456789", 105, yPos, { align: 'center' });
    yPos += 15;
  
    // Invoice info section
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    const invoiceDate = new Date().toLocaleDateString();
    const invoiceNo = collections[0]?.invoiceNo || `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    
    doc.text(`Invoice Date: ${invoiceDate}`, 20, yPos);
    yPos += 10;
    doc.text(`Invoice No: ${invoiceNo}`, 20, yPos);
    yPos += 10;
    doc.text("Customer Name: [Customer Name]", 20, yPos);
    yPos += 10;
    doc.text("Address: [Customer Address]", 20, yPos);
    yPos += 10;
    doc.text("Phone: [Customer Phone]", 20, yPos);
    yPos += 15;
  
    // Check if we need a new page
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }
  
    // Table header
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(57, 106, 177);
    doc.rect(20, yPos, 170, 8, 'F');
    
    doc.text("#", 25, yPos + 6);
    doc.text("Description", 40, yPos + 6);
    doc.text("Qty", 120, yPos + 6);
    doc.text("Price", 140, yPos + 6);
    doc.text("Total", 170, yPos + 6);
    yPos += 10;
  
    // Table rows
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    let subtotal = 0;
    
    invoiceData.forEach((item, index) => {
      // Check if we need a new page before adding a new row
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
        // Add table header on new page
        doc.setFontSize(10);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(57, 106, 177);
        doc.rect(20, yPos, 170, 8, 'F');
        doc.text("#", 25, yPos + 6);
        doc.text("Description", 40, yPos + 6);
        doc.text("Qty", 120, yPos + 6);
        doc.text("Price", 140, yPos + 6);
        doc.text("Total", 170, yPos + 6);
        yPos += 10;
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
      }
  
      const rowTotal = item.qty * (Number(item.price) || 0);
      subtotal += rowTotal;
  
      doc.text(`${index + 1}`, 25, yPos);
      doc.text(item.partName, 40, yPos);
      doc.text(item.qty.toString(), 120, yPos);
      doc.text(`SAR ${(Number(item.price) || 0).toFixed(2)}`, 140, yPos);
      doc.text(`SAR ${rowTotal.toFixed(2)}`, 170, yPos);
      yPos += 7;
      
      // Add line separator if not last item
      if (index < invoiceData.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos + 2, 190, yPos + 2);
        yPos += 5;
      }
    });
    
    // Check if we need a new page before totals
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 15;
    }
  
    // Totals section
    doc.setFontSize(12);
    doc.setDrawColor(150, 150, 150);
    doc.line(120, yPos - 5, 190, yPos - 5);
    
    doc.text("Subtotal:", 140, yPos);
    doc.text(`SAR ${subtotal.toFixed(2)}`, 170, yPos);
    yPos += 10;
  
    // Add payment information if available
    if (collections.length > 0) {
      // Check if we need a new page before payments
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 10;
      }
  
      doc.setFontSize(14);
      doc.setTextColor(57, 106, 177);
      doc.text("PAYMENT INFORMATION", 20, yPos);
      yPos += 10;
      
      collections.forEach((payment, idx) => {
        // Check if we need a new page before each payment
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }
  
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text(`Payment ${idx + 1}: ${payment.type}`, 20, yPos);
        doc.text(`Amount: SAR ${payment.amount}`, 20, yPos + 8);
        
        if (payment.bankName) {
          doc.text(`Bank: ${payment.bankName}`, 20, yPos + 16);
        }
        if (payment.chequeNo) {
          doc.text(`Cheque No: ${payment.chequeNo}`, 20, yPos + 24);
        }
        
        yPos += 35;
      });
    }
    
    // Check if we need a new page before grand total
    if (yPos > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos += 15;
    }
  
    // Grand total
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.setFont(undefined, 'bold');
    doc.text("GRAND TOTAL:", 140, yPos);
    doc.text(` ${subtotal.toFixed(2)}`, 170, yPos);
    doc.setFont(undefined, 'normal');
    
    // Footer - ensure it's on the last page
    yPos = 280; // Fixed position for footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Thank you for your business!", 105, yPos, { align: 'center' });
    doc.text("Terms & Conditions: Payment due within 15 days", 105, yPos + 5, { align: 'center' });
    
    // Save the PDF
    doc.save(`invoice_${invoiceNo}.pdf`);
  };
  
  const downloadGatepass = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("GATEPASS", 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text("YOUR COMPANY NAME", 105, 30, { align: 'center' });
    doc.text("Address Line 1 | Address Line 2", 105, 35, { align: 'center' });
    doc.text("Phone: +1234567890", 105, 40, { align: 'center' });
    
    // Horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 45, 190, 45);
    
    // Gatepass metadata
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    doc.text(`Gatepass No: GP-${Math.floor(1000 + Math.random() * 9000)}`, 20, 70);
    doc.text("Issued To: [Customer Name]", 20, 80);
    doc.text("Vehicle No: [Vehicle Number]", 20, 90);
    doc.text("Authorized By: [Your Name]", 20, 100);
    
    // Table header
    doc.setFillColor(57, 106, 177);
    doc.rect(20, 110, 170, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text("#", 25, 115);
    doc.text("Description", 40, 115);
    doc.text("Qty", 120, 115);
    doc.text("Remarks", 140, 115);
    
    // Table rows
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    let yPos = 125;
    
    invoiceData.forEach((item, index) => {
      doc.text(`${index + 1}`, 25, yPos);
      doc.text(item.partName, 40, yPos);
      doc.text(item.qty.toString(), 120, yPos);
      doc.text(item.remarks || "-", 140, yPos);
      
      // Add dotted separator
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos + 5, 190, yPos + 5);
      yPos += 10;
    });
    
    // Authorization
    doc.setFontSize(12);
    doc.text("Security Check:", 20, yPos + 20);
    doc.line(20, yPos + 30, 80, yPos + 30); // Signature line
    doc.text("Security Officer Signature", 20, yPos + 40);
    
    // Footer
    doc.setFontSize(10);
    doc.text("NOTE: This gatepass must be presented at the security checkpoint.", 105, 280, { align: 'center' });
    doc.text(`Valid until: ${new Date(Date.now() + 86400000).toLocaleDateString()}`, 105, 285, { align: 'center' });
    
    doc.save(`gatepass_${Date.now()}.pdf`);
  };

  const printOptions = ["Work Order", "Estimate", "Proforma Invoice", "Customer Invoice", "Gatepass"];
  const emailOptions = ["Send Work Order", "Send Estimate", "Send Invoice", "Send Reminder"];

  return (
    <>
       <Box sx={{ 
  mt: 3, 
  py: 1, 
  px: 2, 
  bgcolor: "#e8e8e8", 
  display: "flex", 
  justifyContent: "center", // Center the content horizontally
  alignItems: "center", 
  flexWrap: "nowrap", 
  overflowX: "auto", 
  gap: 2, 
  borderRadius: 1 
}}>
  {/* Your existing tab labels and buttons */}
  {tabLabels.map((label, index) => (
          <Typography key={index} sx={{ borderRight: index !== tabLabels.length - 1 ? "1px solid gray" : "none", pr: 2, color: "#333", cursor: "pointer", fontSize: "14px", whiteSpace: "nowrap" }}>
            {label}
          </Typography>
        ))}

        <Button variant="contained" size="small" endIcon={<ArrowDropDownIcon />} onClick={handlePartsClick} sx={{ textTransform: "none", whiteSpace: "nowrap" }}>
          Parts
        </Button>
        <Menu anchorEl={partsAnchorEl} open={Boolean(partsAnchorEl)} onClose={handlePartsClose}>
          <MenuItem onClick={handlePartsClose}>Add Part</MenuItem>
          <MenuItem onClick={handlePartsClose}>Remove Part</MenuItem>
        </Menu>

        <Button variant="contained" size="small" onClick={handlePanelOpen} sx={{ textTransform: "none", whiteSpace: "nowrap" }}>
          Create Invoice
        </Button>

        <Button
          variant="outlined"
          size="small"
          onClick={handlePrintClick}
          endIcon={<ArrowDropDownIcon />}
          sx={{ textTransform: "none", whiteSpace: "nowrap", zIndex: 1300 }}
        >
          <PrintIcon fontSize="small" /> Print
        </Button>
        <Menu 
          anchorEl={printAnchorEl} 
          open={Boolean(printAnchorEl)} 
          onClose={handlePrintClose}
          sx={{ zIndex: 1400 }}
        >
          {["Work Order", "Estimate", "Proforma Invoice", "Customer Invoice", "Gatepass"].map((option, index) => (
            <MenuItem key={index} onClick={() => handlePrintOptionSelect(option)}>
              {option}
            </MenuItem>
          ))}
        </Menu>

        <Button variant="outlined" size="small" onClick={handleEmailClick} sx={{ textTransform: "none", minWidth: 'auto', px: 1 }}>
          <EmailIcon fontSize="small"/>
          <ArrowDropDownIcon fontSize="small"/>
        </Button>
        <Menu anchorEl={emailAnchorEl} open={Boolean(emailAnchorEl)} onClose={handleEmailClose}>
          {emailOptions.map((option, index) => (
            <MenuItem key={index} onClick={() => handleEmailOptionSelect(option)}>
              {option}
            </MenuItem>
          ))}
        </Menu>

        <IconButton color="primary">
          <DirectionsCarIcon />
        </IconButton>
      </Box>
      {panelOpen && (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      bgcolor: 'rgba(0,0,0,0.5)',
      zIndex: 1200,
      // Add transition for smooth fade
      transition: 'opacity 300ms ease',
      pointerEvents: 'none' // Prevent interaction with overlay
    }}
  />
)}


<Slide direction="up" in={panelOpen} mountOnEnter unmountOnExit>
  <Box sx={{ 
    position: 'fixed', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    height: '70vh', 
    maxHeight: '350px',
    zIndex: 1400,
    // backgroundColor: 'background.paper'
  }}>
    <InvoicePanel 
      collections={collections}
      setCollections={onCollectionsUpdate}
      onClose={handlePanelClose} 
    />
  </Box>
</Slide>
    </>
  );
};

export default BottomTabs;