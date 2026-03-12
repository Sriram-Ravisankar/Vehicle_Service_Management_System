import React, { useEffect, useState } from "react";
import { Container, Typography, Box } from "@mui/material";
import HeadOrder from "./HeadOrder"
import PartInputForm from "../components/partsale/PartInputForm";
import PartTable from "../components/partsale/PartTable";

const OrderPage = () => {
const [parts, setParts] = useState([]);
const [editingIndex, setEditingIndex] = useState(null);
const [headerData, setHeaderData] = useState({
    vendor: "BOSCH ERPRISES",
    stock: "",
    type: "Credit",
});

// Load saved data from localStorage
useEffect(() => {
    const storedParts = JSON.parse(localStorage.getItem("parts"));
    const storedHeader = JSON.parse(localStorage.getItem("headerData"));
    if (storedParts) setParts(storedParts);
    if (storedHeader) setHeaderData(storedHeader);
}, []);

// Save parts to localStorage
useEffect(() => {
    localStorage.setItem("parts", JSON.stringify(parts));
}, [parts]);

// Save headerData to localStorage
useEffect(() => {
    localStorage.setItem("headerData", JSON.stringify(headerData));
}, [headerData]);

const handleAddPart = (part) => {
    if (editingIndex !== null) {
    const updated = [...parts];
    updated[editingIndex] = part;
    setParts(updated);
    setEditingIndex(null);
    } else {
    setParts([...parts, part]);
    }
};

const handleEdit = (index) => {
    setEditingIndex(index);
};

const handleDelete = (index) => {
    const updated = parts.filter((_, i) => i !== index);
    setParts(updated);
};

return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
    <Typography variant="h6" gutterBottom>
        Order
    </Typography>

    <HeadOrder headerData={headerData} onHeaderChange={setHeaderData} />

    <Box my={3}>
        <PartInputForm onAdd={handleAddPart} editing={parts[editingIndex]} />
    </Box>

    <PartTable parts={parts} onEdit={handleEdit} onDelete={handleDelete} />
    </Container>
);
};

export default OrderPage;