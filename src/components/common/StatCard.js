import React from 'react';
import { Box, Typography } from '@mui/material';

const StatCard = ({ title, count, amount, sx }) => {
  return (
    <Box sx={{ 
      height: { xs: "100%", sm: "100%", md: "100%" },
      width: "100%",
      borderRadius: 2, 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center', 
      p: { xs: 1.5, sm: 2 },
      ...sx 
    }}>
      <Typography variant="h6" sx={{ 
        fontWeight: 'bold', 
        mb: 1,
        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }
      }}>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ 
        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' },
        fontWeight: 'medium',
        mb: 0.5 
      }}>
        {count}
      </Typography>
      <Typography variant="body2" sx={{ 
        fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }
      }}>
        {amount}
      </Typography>
    </Box>
  );
};

export default StatCard;