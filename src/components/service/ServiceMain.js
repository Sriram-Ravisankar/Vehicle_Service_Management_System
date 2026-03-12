import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Menu,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import TablePagination from "@mui/material/TablePagination";
import { Add, MoreVert, Delete } from "@mui/icons-material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Pagination from "../DynamicComponents/Pagination";
import SectionHeader from '../common/Header';


import { useNavigate } from "react-router-dom";
import apiEndpoints from "../../apiconfig";
import {useLoading} from "../../pages/LoadingContext";
const ServiceMain = () => {
  const navigate = useNavigate();
  const {show, hide} = useLoading();
  const token = sessionStorage.getItem("token");

  const [jobcards, setJobcards] = useState([]);
  const [filtered, setFiltered] = useState([]);


  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

const [currentPage, setCurrentPage] = useState(1);
const rowsPerPage = 5;


  /* ---------------- FETCH JOB CARDS (UNCHANGED) ---------------- */
  const fetchJobCards = async () => {
    try {
     show();

      const res = await fetch(apiEndpoints.JobCard, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setJobcards(data);
      setFiltered(data);
    } catch (error) {
      console.error("Error loading jobcards:", error);
    } finally {
     hide();
    }
  };

  useEffect(() => {
    fetchJobCards();
  }, []);

  /* ---------------- SEARCH ---------------- */
  useEffect(() => {
    let temp = [...jobcards];

    if (search.trim()) {
      temp = temp.filter(
        (item) =>
          item.jobcardNo?.toLowerCase().includes(search.toLowerCase()) ||
          item.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
          item.mobile?.includes(search) ||
          item.registration_number
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    setFiltered(temp);
  }, [search, jobcards]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage);

const paginatedJobcards = filtered.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);


  /* ---------------- DELETE (UNCHANGED API) ---------------- */
  const handleDelete = async (guid) => {
    if (!window.confirm("Are you sure you want to delete this job card?"))
      return;

    try {
      const res = await fetch(`${apiEndpoints.JobCard}?job_guid=${guid}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) fetchJobCards();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  /* ---------------- MENU ---------------- */
  const openMenu = (e, row) => {
    setAnchorEl(e.currentTarget);
    setSelectedRow(row);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  return (
    <Box sx={{ fontFamily: "Montserrat", p: 3 }}>
<SectionHeader/>

      {/* SEARCH */}
      <Box display="flex" justifyContent="flex-end" mt={2}>
        <TextField
          placeholder="Search..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

      {/* TABLE */}
      <Paper elevation={0} sx={{ mt: 2, borderRadius: "8px" }}>
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Table sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  {/* <TableCell padding="checkbox">
                    <Checkbox
                      checked={
                        selectedIds.length === filtered.length &&
                        filtered.length > 0
                      }
                      onChange={(e) =>
                        setSelectedIds(
                          e.target.checked
                            ? filtered.map((j) => j.job_guid)
                            : []
                        )
                      }
                    />
                  </TableCell> */}
                  <TableCell>Jobcard No</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Vehicle</TableCell>
                  <TableCell>Arrival</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedJobcards.map((row) => (

                    <TableRow key={row.job_guid} hover>
                      {/* <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.includes(row.job_guid)}
                          onChange={() =>
                            setSelectedIds((prev) =>
                              prev.includes(row.job_guid)
                                ? prev.filter((id) => id !== row.job_guid)
                                : [...prev, row.job_guid]
                            )
                          }
                        />
                      </TableCell> */}

                      <TableCell>{row.jobcardNo}</TableCell>
                      <TableCell>{row.customer_name}</TableCell>
                      <TableCell>{row.mobile}</TableCell>
                      <TableCell>{row.registration_number}</TableCell>
                      <TableCell>{row.arrival_date}</TableCell>

                      <TableCell>{row.status}</TableCell>

                      <TableCell align="right">
                        <IconButton onClick={(e) => openMenu(e, row)}>
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      No job cards found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
      </Paper>

      {/* ACTION MENU */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            navigate("/services-form", {
              state: { guid: selectedRow?.job_guid },
            });
            closeMenu();
          }}
        >
          <VisibilityIcon sx={{ mr: 1 }} /> View
        </MenuItem>

        <MenuItem
          onClick={() => {
            navigate("/services-form", {
              state: { guid: selectedRow?.job_guid, isEditing: true },
            });
            closeMenu();
          }}
        >
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>

        <MenuItem
          sx={{ color: "red" }}
          onClick={() => {
            handleDelete(selectedRow?.job_guid);
            closeMenu();
          }}
        >
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

{/* PAGINATION  */}
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={(page) => setCurrentPage(page)}
/>


      {/* BOTTOM BULK BAR */}
      {/* <Box mt={3} display="flex" alignItems="center">
        <Box
          display="flex"
          alignItems="center"
          sx={{
            backgroundColor: "rgba(249, 115, 22, 0.9)",
            borderRadius: "4px",
            px: 2,
            py: 1.5,
            cursor: "pointer",
          }}
          onClick={() =>
            setSelectedIds(
              selectedIds.length === jobcards.length
                ? []
                : jobcards.map((j) => j.job_guid)
            )
          }
        >
          <Checkbox
            checked={
              selectedIds.length === jobcards.length && jobcards.length > 0
            }
            sx={{
              padding: 0,
              color: "white",
              "&.Mui-checked": { color: "white" },
            }}
          />
          <Typography sx={{ color: "white" }}>Select All</Typography>
        </Box>

        <Button
          variant="contained"
                    sx={{
            bgcolor: "red",
            "&:hover": { bgcolor: "darkred" },
            px: 2,
            py: 1.7,
            ml: 1,
            borderRadius: "4px",
            color: "white",
          }}
          disabled={selectedIds.length === 0}
          onClick={() => {
            selectedIds.forEach((id) => handleDelete(id));
            setSelectedIds([]);
          }}
        >
          <Delete fontSize="small" />
        </Button>
      </Box> */}
    </Box>
  );
};

export default ServiceMain;
