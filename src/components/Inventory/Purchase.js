import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import SectionHeader from "../common/Header";
import ReportTable from "../Reports/ReportTable";
import { FaTrash } from "react-icons/fa";
import Pagination from "../DynamicComponents/Pagination";
import PurchaseViewModal from "./PurchaseView";
import apiEndpoints from "../../apiconfig";

import {
  Box,
  Button,
  Checkbox,
  Stack,
  TextField,
  Container,
} from "@mui/material";
import { useLoading } from "../../pages/LoadingContext";
const columns = [
  // "Selected",
  "PurchaseCode",
  "SupplierName",
  "Email",
  "Mobile",
  "Date",
  "Products",
  "Action",
];

const ITEMS_PER_PAGE = 2;

const initialData = [];

function Purchase() {
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [tableData, setTableData] = useState([]);
  //   () => {
  //   const saved = localStorage.getItem("purchaseData");
  //   const data = saved ? JSON.parse(saved) : initialData;
  //   // Add default Selected: false if missing
  //   return data.map(row => ({ ...row, Selected: row.Selected ?? false }));
  // });

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [error, setError] = useState(null);
  const [totalPurchases, setTotalPurchases] = useState(0);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        show();
        const response = await fetch(apiEndpoints.purchase, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch purchases");
        }
        const result = await response.json();

        if (result.success) {
          // Process the data to group items by purchase
          const purchasesMap = new Map();

          result.data.forEach((item) => {
            if (!purchasesMap.has(item.purchase_id)) {
              purchasesMap.set(item.purchase_id, {
                ...item,
                products: [],
                Selected: false,
                PurchaseCode: item.purchase_no,
                SupplierName: item.supplier_name,
                Mobile: item.mobile_no,
                Email: item.email,
                Date: item.purchase_date,
                Products: item.item_id ? "1 product" : "No products", // Initial count
                id: item.purchase_id,
                originalData: {
                  ...item,
                  products: [],
                },
              });
            }

            // Add product information if available
            if (item.item_id) {
              const purchase = purchasesMap.get(item.purchase_id);
              purchase.products.push({
                product_id: item.product_id,
                product_name: item.product_name,
                product_number: item.product_number,
                quantity: item.quantity,
                price: item.item_price,
                amount: item.amount,
              });

              // Update products count text
              purchase.Products = `${purchase.products.length} product${purchase.products.length !== 1 ? "s" : ""}`;
              purchase.originalData.products = purchase.products;
            }
          });

          const processedData = Array.from(purchasesMap.values());
          setTableData(processedData);
          setTotalPurchases(processedData.length);
        } else {
          throw new Error(result.message || "Failed to fetch purchases");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        hide();
      }
    };

    fetchPurchases();
  }, []);

  const handleView = (row) => {
    setViewData(row.originalData);
    setViewModalOpen(true);
  };

  const handleCheckboxChange = (index) => {
    const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + index;
    const updated = [...tableData];
    updated[globalIndex].Selected = !updated[globalIndex].Selected;
    setTableData(updated);
  };

  const handleSelectAll = () => {
    const paginatedData = paginatedItems;
    const allSelected = paginatedData.every((row) => row.Selected);
    const updated = [...tableData];

    paginatedData.forEach((_, idx) => {
      const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + idx;
      updated[globalIndex].Selected = !allSelected;
    });

    setTableData(updated);
  };

  const handleDeleteSelected = async () => {
    const selectedIds = tableData
      .filter((row) => row.Selected)
      .map((row) => row.id);

    try {
      // Delete each selected purchase
      const deleteResults = await Promise.all(
        selectedIds.map((id) =>
          fetch(`${apiEndpoints.purchase}?id=${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }).then((res) => res.json()),
        ),
      );

      // Check if all deletions were successful
      if (deleteResults.every((result) => result.success)) {
        // Refresh the list after deletion
        const response = await fetch(apiEndpoints.purchase, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        if (!response.ok) throw new Error("Failed to refresh purchases");

        const result = await response.json();
        if (result.success) {
          // Process the data as in the initial fetch
          const purchasesMap = new Map();

          result.data.forEach((item) => {
            if (!purchasesMap.has(item.purchase_id)) {
              purchasesMap.set(item.purchase_id, {
                ...item,
                products: [],
                Selected: false,
                PurchaseCode: item.purchase_no,
                SupplierName: item.supplier_name,
                Mobile: item.mobile_no,
                Email: item.email,
                Date: item.purchase_date,
                Products: item.item_id ? "1 product" : "No products",
                id: item.purchase_id,
                originalData: {
                  ...item,
                  products: [],
                },
              });
            }

            if (item.item_id) {
              const purchase = purchasesMap.get(item.purchase_id);
              purchase.products.push({
                product_id: item.product_id,
                product_name: item.product_name,
                product_number: item.product_number,
                quantity: item.quantity,
                price: item.item_price,
                amount: item.amount,
              });
              purchase.Products = `${purchase.products.length} product${purchase.products.length !== 1 ? "s" : ""}`;
              purchase.originalData.products = purchase.products;
            }
          });

          const processedData = Array.from(purchasesMap.values());
          setTableData(processedData);
          setTotalPurchases(processedData.length);
        }
      } else {
        throw new Error("Some deletions failed");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${apiEndpoints.purchase}?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete purchase");
      }

      const updated = tableData.filter((row) => row.id !== id);
      setTableData(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (row) => {
    console.log("Edit ID being passed:", row.originalData);
    navigate("/add-purchase", { state: { editData: row.originalData } });
  };

  // Filtering
  const filteredData = tableData.filter((row) =>
    Object.entries(row).some(([key, val]) => {
      if (key === "Selected" || key === "originalData" || key === "products")
        return false;
      return (
        typeof val === "string" &&
        val.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }),
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const enhancedData = paginatedItems.map((row, index) => ({
    ...row,
    onView: () => handleView(row),
    onEdit: () => handleEdit(row),
    onDelete: () => handleDelete(row.id),
    checkboxIndex: index,
  }));

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
              checked={
                paginatedItems.length > 0 &&
                paginatedItems.every((row) => row.Selected)
              }
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

      <PurchaseViewModal
        open={viewModalOpen}
        data={viewData}
        onClose={() => setViewModalOpen(false)}
      />
    </Container>
  );
}

export default Purchase;