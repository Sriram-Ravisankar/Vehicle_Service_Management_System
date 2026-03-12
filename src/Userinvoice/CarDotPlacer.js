import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Car from '../assets/car.jpg';

const CarDotPlacer = ({ value = [], onChange }) => {
  const [dots, setDots] = useState(value);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle image click to add dots
  const handleClick = (event) => {
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    const newDots = [...dots, { x, y }];
    setDots(newDots);
    onChange(newDots); // Send updated dots to parent
  };

  // Handle right click to remove dots
  const handleRightClick = (event, indexToRemove) => {
    event.preventDefault();
    const newDots = [...dots];
    newDots.splice(indexToRemove, 1);
    setDots(newDots);
    onChange(newDots); // Send updated dots to parent
  };

  // Prepare canvas for download
  useEffect(() => {
    if (value && Array.isArray(value)) {
      setDots(value);
    }
  }, [value]);

  useEffect(() => {
    if (!imageRef.current || !canvasRef.current) return;

    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw all dots on canvas
    dots.forEach((dot, index) => {
      const x = (dot.x / 100) * canvas.width;
      const y = (dot.y / 100) * canvas.height;

      // Draw dot
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw number
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), x, y);
    });
  }, [dots]);

  // Handle download
  const handleDownload = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'car-with-markers.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        width: 'zz',
        margin: '20px auto',
      }}
    >
      {/* Main container for image and controls */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          width: '100%',
        }}
      >
        {/* Image with dots container */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Image with dots container */}
          <Box
            sx={{
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              padding: 2,
              position: 'relative',
              width: { xs: '250px', md: '400px' },
              cursor: 'pointer',
            }}
            onClick={handleClick}
          >
            <img
              ref={imageRef}
              src={Car}
              alt="Car"
              style={{ width: '100%', display: 'block' }}
            />

            {/* Visible dots on the image */}
            {dots.map((dot, index) => (
              <Box
                key={index}
                onContextMenu={(e) => handleRightClick(e, index)}
                sx={{
                  position: 'absolute',
                  top: `${dot.y}%`,
                  left: `${dot.x}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: 'red',
                  border: '2px solid black',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  cursor: 'pointer',
                }}
              >
                {index + 1}
              </Box>
            ))}
          </Box>

          {/* Controls container - now below the image */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              mt: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary" mb={1}>
              ⓘ Right click to remove marker
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#10AADF',
                textTransform: 'none',
                borderRadius: 0,
                '&:hover': {
                  backgroundColor: '#09B3F1',
                },
              }}
              onClick={handleDownload}
            >
              Download Image
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Hidden canvas for download */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  );
};

export default CarDotPlacer;