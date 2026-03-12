import React, { useState } from "react";
import { Container, Box } from "@mui/material";
import InvoiceHeader from "./InvoiceHeader";
import InvoicePage from "./InvoicePage";
import BottomTabs from "./BottomTabs";

function MainLayout() {
  const [selectedService, setSelectedService] = useState(null);
  const [collections, setCollections] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);

  const handleServiceSelect = (serviceName) => {
    setSelectedService(serviceName);
  };

  return (
    <Box sx={{ backgroundColor: "#F4F4F4", height:"auto", width: "86vw" }}>
      {/* Header */}
      <InvoiceHeader onServiceSelect={handleServiceSelect} />

      <Container
        maxWidth={false}
        disableGutters
        sx={{ mt: 4, px: 2 }} // optional padding
      >
        <InvoicePage 
          onServiceSelect={handleServiceSelect}
          selectedService={selectedService}
          setInvoiceData={setInvoiceData}
        />
      </Container>

      <BottomTabs 
        collections={collections}
        onCollectionsUpdate={setCollections}
        invoiceData={invoiceData}
      />
    </Box>
  );
}

export default MainLayout;
