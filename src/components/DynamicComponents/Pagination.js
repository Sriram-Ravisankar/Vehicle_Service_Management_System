  import React from "react";
  import { ChevronLeft, ChevronRight } from "lucide-react";
  import { Box, Typography, IconButton, Paper } from "@mui/material";

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mt={4}
      >
        {/* Left info text */}
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          Showing page <strong>{currentPage}</strong> - <strong>{totalPages}</strong>
        </Typography>

        {/* Pagination controls */}
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#f3f4f6",
            borderRadius: 1,
            mr: 2,
            overflow: "hidden"
          }}
        >
          <IconButton
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            sx={{
              px: 1.5,
              py: 1,
              color: "#4b5563",
              "&:hover": { backgroundColor: "#e5e7eb" },
              opacity: currentPage === 1 ? 0.4 : 1
            }}
          >
            <ChevronLeft size={16} />
          </IconButton>

          <Box
            sx={{
              px: 2,
              py: 1,
              backgroundColor: "white",
              fontWeight: 600,
              color: "#374151"
            }}
          >
            {currentPage}
          </Box>

          <IconButton
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            sx={{
              px: 1.5,
              py: 1,
              color: "#4b5563",
              "&:hover": { backgroundColor: "#e5e7eb" },
              opacity: currentPage === totalPages ? 0.4 : 1
            }}
          >
            <ChevronRight size={16} />
          </IconButton>
        </Paper>
      </Box>
    );
  };

  export default Pagination;