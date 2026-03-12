import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "../common/Header";
import ReportTable from "../Reports/ReportTable";
import { FaTrash } from "react-icons/fa";
import Pagination from "../DynamicComponents/Pagination";
import {useLoading} from "../../pages/LoadingContext"
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

const columns = [
  // "Selected",
  "Image",
  "SupplierName",
  // "FirstName",
  // "LastName",
  "CompanyName",
  "Email",
  "Action",
];

// Optional default data if nothing is saved yet
const initialData = [];
const API_URL = apiEndpoints.supplier;
const BLOB_URL = apiEndpoints.blob;

function MainPage() {
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const itemsPerPage = 15;


  const [tableData, setTableData] = useState([]);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);

  const fetchSuppliers = async () => {
    show();
    setError(null);
    try {
      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.json();
      if (result.success) {
        // Transform API data to match your table structure
        const transformedData = result.data.map((supplier) => ({
          id: supplier.supplier_id,
          Selected: false,
          Image: `${apiEndpoints.blob}${supplier.image_path}`,
          SupplierName: supplier.supplier_name,
          FirstName: supplier.supplier_name
            ? supplier.supplier_name.split(" ")[0]
            : "",
          LastName: supplier.supplier_name
            ? supplier.supplier_name.split(" ").slice(1).join(" ")
            : "",
          CompanyName: supplier.company_name,
          Email: supplier.email,
          originalData: supplier, // Keep original data for edit/view
        }));
        setTableData(transformedData);
      } else {
        throw new Error(result.error || "Failed to fetch suppliers");
      }
    } catch (error) {
      setError(error.message);
      console.error("Error fetching suppliers:", error);
    } finally {
      hide();
    }
  };

  useEffect(() => {
    fetchSuppliers();
    // const saved = localStorage.getItem("stockData");
    // setTableData(saved ? JSON.parse(saved) : initialData);
  }, []);

  const handleCheckboxChange = (index) => {
    const actualIndex = (currentPage - 1) * itemsPerPage + index;
    const updated = [...tableData];
    updated[actualIndex].Selected = !updated[actualIndex].Selected; // Use actualIndex here
    setTableData(updated);
  };

  const handleSelectAll = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const updated = [...tableData];

    const currentPageSelected = updated
      .slice(startIndex, endIndex)
      .every((item) => item.Selected);

    for (let i = startIndex; i < endIndex && i < updated.length; i++) {
      updated[i].Selected = !currentPageSelected;
    }

    setTableData(updated);
  };

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentPageData = tableData.slice(startIndex, endIndex);

      setIsSelectAllChecked(
        currentPageData.length > 0 &&
          currentPageData.every((item) => item.Selected)
      );
    } else {
      setIsSelectAllChecked(false);
    }
  }, [tableData, currentPage, itemsPerPage]);

  const handleDeleteSelected = async () => {
    const selectedIds = tableData
      .filter((row) => row.Selected)
      .map((row) => row.id);

    if (selectedIds.length === 0) return;
show();
    try {
      
      const deletePromises = selectedIds.map((id) =>
        fetch(`${API_URL}?id=${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        })
      );

      await Promise.all(deletePromises);
      await fetchSuppliers();
    } catch (error) {
      setError(error.message);
      console.error("Error deleting suppliers:", error);
    } finally {
      hide();
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const filteredData = tableData.filter((row) =>
    Object.values(row).some(
      (val) =>
        typeof val === "string" &&
        val.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleDelete = async (id) => {
    try {
      show();
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete supplier");
      }
      await fetchSuppliers(); // Refresh the list
    } catch (error) {
      setError(error.message);
      console.error("Error deleting supplier:", error);
    } finally {
      hide();
    }
  };

  const handleEdit = (row) => {
    // Save row data to localStorage so it can be used in the Add/Edit form
    // localStorage.setItem("stockEditData", JSON.stringify(row));
    navigate("/add-supplier", { state: { editData: row.originalData } });
  };

  const handleView = (row) => {
    navigate(`/supplier-view/${row.id}`, { state: row.originalData }); // optionally pass row data too
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Paginate data for current page
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const enhancedData = paginatedData.map((row) => ({
    ...row,
    onEdit: () => handleEdit(row),
    onDelete: () => handleDelete(row.id),
    onView: () => handleView(row),
  }));

  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [searchQuery, tableData]);

  return (
    <Container maxWidth="2xl" sx={{ fontFamily: "Montserrat", py: 3 }}>
      <SectionHeader />

      <Box
        sx={{ fontFamily: "Montserrat" }}
        mt={2}
        mb={2}
        display="flex"
        justifyContent="flex-end"
      >
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
              checked={isSelectAllChecked}
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
              py: 1.5,
              borderRadius: "4px",
              color: "white",
              minWidth: "auto",
            }}
          >
            <FaTrash size={16} />
          </Button>
        </Stack>
      </Box> */}
    </Container>
  );
}

export default MainPage;
