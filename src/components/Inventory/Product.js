import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import SectionHeader from "../common/Header";
import ReportTable from "../Reports/ReportTable";
import { FaTrash } from "react-icons/fa";
import Pagination from "../DynamicComponents/Pagination";
import ProductViewModal from "./ProductView";

import {
  Box,
  Button,
  Checkbox,
  Stack,
  TextField,
  Container,
  Avatar,
} from "@mui/material";
import apiEndpoints from "../../apiconfig";
import { useLoading } from "../../pages/LoadingContext";

const columns = [
  // "Selected",
  "Image",
  "ProductNumber",
  // "ManufacturerName",
  "ProductName",
  "Price",
  // "Color",
  "Action",
];
const initialData = [];
const rowsPerPage = 10; // Number of items per page

function Product() {
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);

  const fetchProducts = async () => {
    try {
      show();
      const response = await fetch(apiEndpoints.product, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const result = await response.json();

      if (result.success) {
        console.log("result.data", result.data);
        // debugger;
        const transformedData = result.data.map((product) => ({
          id: product.id,
          Selected: false,
          Image: `${apiEndpoints.blob}${product.image}`,
          ProductNumber: product.product_number,
          ProductName: product.product_name,
          Price: product.price,
          originalData: product, // Keep original data for edit/view
        }));
        setTableData(transformedData);
      } else {
        throw new Error(result.error || "Failed to fetch products");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      hide();
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCheckboxChange = (indexOnPage) => {
    const globalIndex = (currentPage - 1) * rowsPerPage + indexOnPage;
    const updated = [...tableData];
    updated[globalIndex].Selected = !updated[globalIndex].Selected;
    setTableData(updated);
    // localStorage.setItem("productData", JSON.stringify(updated));
  };

  const handleSelectAll = () => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    const currentData = filteredData.slice(startIdx, endIdx);

    const allSelected = currentData.every((row) => row.Selected);
    const updated = [...tableData];

    currentData.forEach((row, index) => {
      const globalIndex = tableData.findIndex((r) => r.id === row.id);
      if (globalIndex !== -1) {
        updated[globalIndex].Selected = !allSelected;
      }
    });

    setTableData(updated);
    // localStorage.setItem("productData", JSON.stringify(updated));
  };

  const handleDeleteSelected = async () => {
    try {
      const selectedIds = tableData
        .filter((row) => row.Selected)
        .map((row) => row.id);

      // Delete each selected product
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`${apiEndpoints.product}?id=${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }),
        ),
      );

      // Refresh the product list
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredData = tableData.filter((row) =>
    Object.values(row).some(
      (val) =>
        typeof val === "string" &&
        val.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const currentPageData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${apiEndpoints.product}?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      // Refresh the product list
      await fetchProducts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (row) => {
    navigate("/add-product", { state: { editData: row.originalData } });
  };

  const enhancedData = currentPageData.map((row) => ({
    ...row,
    onView: () => handleView(row),
    onEdit: () => handleEdit(row),
    onDelete: () => handleDelete(row.id),
  }));

  const handleView = (row) => {
    setViewData(row.originalData);
    setViewModalOpen(true);
  };

  const isPageFullySelected =
    currentPageData.length > 0 && currentPageData.every((row) => row.Selected);

  return (
    <Container maxWidth="2xl" sx={{ py: 3 }}>
      <SectionHeader />
      <Box mt={2} mb={2} display="flex" justifyContent="flex-end">
        <TextField
          variant="outlined"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            backgroundColor: "#f1f3f4",
            borderRadius: "6px",
            width: { xs: "100%", sm: 250 },
            "& fieldset": { border: "none" },
            height: "40px",
            "& input": { padding: "10px" },
          }}
        />
      </Box>

      <ReportTable
        columns={columns}
        data={enhancedData}
        onCheckChange={handleCheckboxChange}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* <Box mt={4} mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="contained"
            onClick={handleSelectAll}
            sx={{
              bgcolor: "rgba(249, 115, 22, 0.9)",
              "&:hover": { bgcolor: "rgba(249, 115, 22, 0.9)" },
              display: "flex",
              alignItems: "center",
              px: 2,
              py: 1,
              borderRadius: "4px",
            }}
          >
            <Checkbox
              checked={isPageFullySelected}
              onChange={handleSelectAll}
              onClick={handleSelectAll}
              sx={{ color: "white", p: 0, pr: 1 }}
            />
            Select All
          </Button>

          <Button
            variant="contained"
            onClick={handleDeleteSelected}
            sx={{
              bgcolor: "red",
              "&:hover": { bgcolor: "darkred" },
              px: 2,
              py: 1,
              borderRadius: "4px",
              color: "white",
              minWidth: "auto",
            }}
          >
            <FaTrash size={16} />
          </Button>
        </Stack>
      </Box> */}

      <ProductViewModal
        open={viewModalOpen}
        data={viewData}
        onClose={() => setViewModalOpen(false)}
      />
    </Container>
  );
}

export default Product;