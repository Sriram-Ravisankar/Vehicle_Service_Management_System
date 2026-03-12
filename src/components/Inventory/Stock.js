import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import FilterListIcon from "@mui/icons-material/FilterList";
import apiEndpoints from "../../apiconfig";
import { useLoading } from "../../pages/LoadingContext";
const Stock = () => {
  const theme = useTheme();
  const { show, hide } = useLoading();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
const [allRows, setAllRows] = useState([]);
const [gridLoading, setGridLoading] = useState(false);

  /* ================= FILTER STATE ================= */
  const [filters, setFilters] = useState({
    purchaseFrom: "",
    purchaseTo: "",
    supplier: "",
    product: "",
    branch: "",
  });
const [suppliers, setSuppliers] = useState([]);
const [products, setProducts] = useState([]);

  /* ================= DATA STATE ================= */
  const [rows, setRows] = useState([]);
 

  /* ================= COLUMN CONFIG ================= */
  const allColumns = [
    { field: "purchase_no", headerName: "Purchase No" },
    { field: "product_number", headerName: "Product No" },
    { field: "product_name", headerName: "Product Name" },
    { field: "supplier_name", headerName: "Supplier" },
    { field: "quantity_purchased", headerName: "Purchased Qty" },
    { field: "quantity_sold", headerName: "Sold Qty" },
    { field: "available_quantity", headerName: "Available Stock" },
    { field: "price", headerName: "Rate" },
    { field: "amount", headerName: "Amount" },
    { field: "unit_name", headerName: "Unit" },
    { field: "purchase_date", headerName: "Purchase Date" },
    { field: "invoice_no", headerName: "Invoice No" },
    { field: "branch_id", headerName: "Branch" },
  ];

  const [selectedColumns, setSelectedColumns] = useState([
    "purchase_no",
    "product_name",
    "available_quantity",
    "price",
    "supplier_name",
  ]);

  const handleColumnToggle = (field) => {
    setSelectedColumns((prev) =>
      prev.includes(field) ? prev.filter((c) => c !== field) : [...prev, field]
    );
  };

  const visibleColumns = allColumns
    .filter((c) => selectedColumns.includes(c.field))
    .map((c) => ({
      ...c,
      flex: 1,
      minWidth: isMobile ? 120 : 180,
    }));
const fetchDropdowns = async () => {
  try {
    const [supplierRes, productRes] = await Promise.all([
      fetch(apiEndpoints.supplier, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
      fetch(apiEndpoints.product, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
    ]);

    const supplierData = await supplierRes.json();
    const productData = await productRes.json();

    if (supplierData.success) setSuppliers(supplierData.data);
    if (productData.success) setProducts(productData.data);
  } catch (err) {
    console.error("Dropdown fetch error", err);
  }
};
useEffect(() => {
  fetchStock();
  fetchDropdowns();
}, []);

  /* ================= FETCH STOCK ================= */
  const fetchStock = async () => {
    try {
      show();
      setGridLoading(true);
      const response = await fetch(apiEndpoints.stock, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        const formatted = result.data.map((row) => ({
          ...row,
          id: row.stock_id,
        }));

        setAllRows(formatted); // 🔑 keep original
        setRows(formatted); // 🔑 show data
      }

    } catch (error) {
      console.error("Stock fetch error:", error);
    } finally {
      setGridLoading(false);
      hide();
    }
  };

  /* ================= APPLY FILTER (UI SIDE) ================= */
const applyFilter = () => {
  let filtered = [...allRows];

  // Supplier filter
  if (filters.supplier) {
    filtered = filtered.filter((r) =>
      r.supplier_name?.toLowerCase().includes(filters.supplier.toLowerCase())
    );
  }

  // Product filter
  if (filters.product) {
    filtered = filtered.filter((r) =>
      r.product_name?.toLowerCase().includes(filters.product.toLowerCase())
    );
  }

  // Purchase date from
  if (filters.purchaseFrom) {
    filtered = filtered.filter((r) => r.purchase_date >= filters.purchaseFrom);
  }

  // Purchase date to
  if (filters.purchaseTo) {
    filtered = filtered.filter((r) => r.purchase_date <= filters.purchaseTo);
  }

  setRows(filtered);
};
// useEffect(() => {
//   fetchStock();
// }, []);


  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      <Typography variant="h4" fontWeight={600} mb={3}>
        Stock
      </Typography>

      {/* FILTER CARD */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
<Box display="flex" alignItems="center" gap={1} mb={2}>
  <FilterListIcon 
    sx={{ 
      color: "rgba(249, 115, 22, 0.9)", 
      fontSize: 28 
    }} 
  />
  <Typography variant="h6" fontWeight={600}>
    Filters
  </Typography>
</Box>


          <Grid container spacing={2}>
            {/* FILTER ROW */}
            <Grid container spacing={2} width={"100%"}>
              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                width={{ xs: "100%", sm: "20%" }}
              >
                <TextField
                  label="Purchase From"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={filters.purchaseFrom}
                  onChange={(e) =>
                    setFilters({ ...filters, purchaseFrom: e.target.value })
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                width={{ xs: "100%", sm: "20%" }}
              >
                <TextField
                  label="Purchase To"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={filters.purchaseTo}
                  onChange={(e) =>
                    setFilters({ ...filters, purchaseTo: e.target.value })
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                width={{ xs: "100%", sm: "20%" }}
              >
                <TextField
                  select
                  label="Supplier"
                  fullWidth
                  value={filters.supplier}
                  onChange={(e) =>
                    setFilters({ ...filters, supplier: e.target.value })
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  {suppliers.map((s) => (
                    <MenuItem key={s.supplier_id} value={s.supplier_name}>
                      {s.supplier_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                md={3}
                width={{ xs: "100%", sm: "20%" }}
              >
                <TextField
                  select
                  label="Product"
                  fullWidth
                  value={filters.product}
                  onChange={(e) =>
                    setFilters({ ...filters, product: e.target.value })
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  {products.map((p) => (
                    <MenuItem key={p.id} value={p.product_name}>
                      {p.product_name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* COLUMN SELECTOR */}
            <Box mt={3}>
              <Typography fontWeight={600} mb={1}>
                Select Columns
              </Typography>

              <Box
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  p: 2,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  backgroundColor: "#fafafa",
                }}
              >
                {allColumns.map((col) => (
                  <FormControlLabel
                    key={col.field}
                    control={
<Checkbox
  checked={selectedColumns.includes(col.field)}
  size="small"
  onChange={() => handleColumnToggle(col.field)}
  sx={{
    color: "rgba(249, 115, 22, 0.9)",
    "&.Mui-checked": {
      color: "rgba(249, 115, 22, 0.9)",
    },
  }}
/>

                    }
                    label={col.headerName}
                  />
                ))}
              </Box>
            </Box>

            <Box mt={3} display="flex" justifyContent="flex-end">
<Button
  variant="contained"
  sx={{
    px: 4,
    py: 1,
    fontWeight: 600,
    textTransform: "uppercase",
    backgroundColor: "rgba(249, 115, 22, 0.9)",
    "&:hover": {
      backgroundColor: "rgba(249, 115, 22, 1)",
    },
  }}
  onClick={applyFilter}
>
  Apply Filter
</Button>

            </Box>
          </Grid>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card sx={{ mt: 3 }}>
        <Box
          sx={{
            height: { xs: 400, sm: 300 },
            width: "100%",
            overflowX: "auto",
          }}
        >
          <DataGrid
            rows={rows}
            columns={visibleColumns}
            loading={gridLoading}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            sx={{
              minWidth: 800,
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "#f5f5f5",
                fontWeight: "bold",
              },
            }}
          />
        </Box>
      </Card>
    </Box>
  );
};

export default Stock;
